#!/usr/bin/env python3
"""
Build CRISProg inputs from the IGVF cardiomyocyte TF Perturb-seq files (analysis set IGVFDS6332VCTO, Hon lab).

Inputs (raw/, from download.slurm):
  IGVFFI3617IJOW.h5       filtered cells x genes UMI counts (Cell Ranger aggr; barcodes end in -<library>)
  IGVFFI4735RXPI.pkl      guides x cells sgRNA UMI counts of HTO singlets (pandas DataFrame, Hon lab pipeline;
                          counts below each guide's knee were already set to 0, so > 0 = guide called)
  IGVFFI8270UPKB.csv.gz   guide library (guide_id, spacer, type, gene_name, ...)

Outputs (data/):
  tf_cm.h5ad              X = log1p(counts per 10k), layers['counts'] = raw UMI; obs: guides ('g1;g2;...'),
                          n_guides, lane (Cell Ranger library), pct_mt, n_genes, total_counts
  guide_targets.tsv       guide <TAB> target gene, for targeting guides and positive controls
  prep_summary.txt        what was kept and why
Control guides (non-targeting and the olfactory-receptor 'negative control' guides) are written as NC_<guide_id>,
so the config can mark them with control_pattern: '^NC_'.

Cells kept: in the filtered matrix AND in the guide table (HTO singlets), mitochondrial UMI < --max-mt,
at least one called guide. Genes kept: detected in >= --min-cells-frac of kept cells.

The pickle is ~71 GB and is loaded whole: run on a high-memory node (prep.slurm). Unpickling runs code from the
file, so only load this file as downloaded from the IGVF portal with a matching md5 (download.slurm checks it).
"""
import argparse
import os
import re
import sys
import time

import numpy as np
import pandas as pd
import scipy.sparse as sp

T0 = time.time()


def log(*a):
    print(f"[{time.strftime('%H:%M:%S')} +{(time.time() - T0) / 60:.1f} min]", *a, flush=True)


def match_guides(rows, lib):
    """Target and control status of each guide in the pickle.

    Library ids or spacers are used if they match; otherwise the names are parsed. The pickle uses the
    Weissman-lab style '<gene>_<strand>_<TSS position>-<promoter>-<n>' (e.g. 'ADNP2_-_77867536.23-P1P2-1'),
    so the target is the text before '_+_' / '_-_'. Controls: names mentioning non-targeting / safe / negative,
    and guides whose target is one of the library's negative-control genes (olfactory receptors)."""
    rows = pd.Index(rows.astype(str))
    ctrl_genes = set(lib.loc[lib.type == "negative control", "gene_name"].dropna())
    pos_genes = set(lib.loc[lib.type == "positive control", "gene_name"].dropna())
    lib_genes = set(lib.gene_name.dropna())
    ctrl_word = re.compile(r"non.?target|nontarget|safe|negative|scramble|^ntc|control", re.I)
    by_id = dict(zip(lib.guide_id, lib.gene_name))
    if rows.isin(list(by_id)).mean() > 0.9:
        tgt = rows.map(by_id)
        how = "library guide_id"
    else:
        tgt = pd.Index([re.split(r"_[+-]_", r, maxsplit=1)[0] if re.search(r"_[+-]_", r) else None for r in rows])
        how = "parsing '<gene>_<strand>_...' names"
    T = pd.DataFrame({"guide": rows, "target": tgt})
    # simpler names (positive / olfactory-receptor controls): 'B2M', 'CD81_strong', 'DNAJC19_ main', 'OR10G4-3'
    alias = {"CD29": "ITGB1", "NGFRAP1": "BEX3"}             # old symbols -> current gene symbols
    for i in np.flatnonzero(T.target.isna().to_numpy()):
        base = re.sub(r"\s+", "", T.guide.iat[i])
        base = re.sub(r"[-_](\d+|B|C|main|strong|weak)$", "", base)
        if re.fullmatch(r"[A-Za-z0-9.-]+", base) and not ctrl_word.search(base):
            T.iat[i, 1] = alias.get(base, base)
    T["control"] = T.guide.str.contains(ctrl_word) | T.target.isin(ctrl_genes) \
        | T.target.fillna("").str.fullmatch(r"OR\d+[A-Z]+\d+[A-Z]?\d*")
    T.loc[T.control, "target"] = None
    bad = T[T.target.isna() & ~T.control]
    lines = [f"guide names matched by {how}: {int(T.target.notna().sum()):,} targeting (incl. positive controls), "
             f"{int(T.control.sum()):,} controls, {len(bad):,} not understood",
             f"  targeting names e.g. {list(T.guide[T.target.notna()][:4])}",
             f"  control names e.g. {list(T.guide[T.control][:6])}"]
    if len(bad):
        lines.append(f"  not understood e.g. {list(bad.guide[:15])}")
    t = set(T.target.dropna())
    lines.append(f"  targets: {len(t):,}; in the library's gene names: {len(t & lib_genes):,}; positive-control "
                 f"targets present: {sorted(t & pos_genes)}; not in the library e.g. {sorted(t - lib_genes)[:10]}")
    if len(bad) > 0.02 * len(T):
        raise SystemExit("\n".join(lines + ["too many guide names not understood; see the examples above"]))
    return T, lines


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--raw", default="raw")
    ap.add_argument("--out", default="data")
    ap.add_argument("--max-mt", type=float, default=0.2, help="max fraction of UMI from MT- genes (Hon lab: 0.2)")
    ap.add_argument("--min-cells-frac", type=float, default=0.005)
    ap.add_argument("--chunk", type=int, default=20000, help="cells per chunk when reading the guide table")
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    import anndata
    import scanpy as sc
    summ = []

    def note(s):
        log(s)
        summ.append(s)

    # ---- expression ----
    ad = sc.read_10x_h5(os.path.join(a.raw, "IGVFFI3617IJOW.h5"), gex_only=True)
    ad.var_names_make_unique()
    note(f"filtered expression matrix: {ad.n_obs:,} cells x {ad.n_vars:,} genes; barcode e.g. {ad.obs_names[0]}")
    X = sp.csr_matrix(ad.X)
    mt = ad.var_names.str.startswith("MT-")
    tot = np.asarray(X.sum(1)).ravel()
    pct_mt = np.asarray(X[:, np.where(mt)[0]].sum(1)).ravel() / np.maximum(tot, 1)

    # ---- guides ----
    lib = pd.read_csv(os.path.join(a.raw, "IGVFFI8270UPKB.csv.gz"), sep="\t")
    note(f"guide library: {len(lib):,} guides; " + ", ".join(f"{k} {v:,}" for k, v in lib.type.value_counts().items()))
    log("loading the guide pickle (~71 GB) ...")
    G = pd.read_pickle(os.path.join(a.raw, "IGVFFI4735RXPI.pkl"))
    note(f"guide table: {G.shape[0]:,} guides x {G.shape[1]:,} cells; dtypes {sorted(set(map(str, G.dtypes)))[:3]}; "
         f"cell e.g. {G.columns[0]}, guide e.g. {G.index[0]}")
    T, lines = match_guides(G.index, lib)
    for line in lines:
        note(line)

    shared = pd.Index(G.columns.astype(str)).intersection(ad.obs_names, sort=False)
    note(f"cells in both the expression matrix and the guide table (HTO singlets): {len(shared):,} "
         f"({len(shared) / ad.n_obs:.0%} of the expression matrix)")
    if len(shared) < 0.2 * ad.n_obs:
        raise SystemExit("few shared barcodes: the two files may number their libraries differently")
    col = pd.Index(G.columns.astype(str)).get_indexer(shared)
    M = G.to_numpy(copy=False) if len(set(G.dtypes)) == 1 else None
    blocks = []
    for j in range(0, len(col), a.chunk):                     # cells x guides, called = UMI > 0
        cj = col[j:j + a.chunk]
        B = M[:, cj] if M is not None else G.iloc[:, cj].to_numpy()
        blocks.append(sp.csr_matrix((np.nan_to_num(B.T) > 0).astype(np.int8)))
    C = sp.vstack(blocks).tocsr()
    del G, M, blocks

    # ---- QC ----
    r = ad.obs_names.get_indexer(shared)
    n_called = np.asarray(C.sum(1)).ravel()
    keep = (pct_mt[r] < a.max_mt) & (n_called > 0)
    note(f"QC: {int((pct_mt[r] >= a.max_mt).sum()):,} cells with MT fraction >= {a.max_mt}, "
         f"{int((n_called == 0).sum()):,} with no called guide; kept {int(keep.sum()):,} cells")
    r, C, cells = r[keep], C[keep], shared[keep]
    Xk = X[r]
    det = np.asarray((Xk > 0).sum(0)).ravel()
    gk = det >= a.min_cells_frac * len(r)
    note(f"genes detected in >= {a.min_cells_frac:.1%} of kept cells: {int(gk.sum()):,} of {ad.n_vars:,}")
    Xk = Xk[:, np.where(gk)[0]]

    # ---- guide strings and target map ----
    is_ctrl = T.control.to_numpy()
    names = np.array([("NC_" + g if c else g) for g, c in zip(T.guide, is_ctrl)], dtype=object)
    C = C.tocsr()
    guides = [";".join(names[C.indices[C.indptr[i]:C.indptr[i + 1]]]) for i in range(C.shape[0])]
    n_g = np.diff(C.indptr)
    n_ctrl_only = int(sum(all(x.startswith("NC_") for x in s.split(";")) for s in guides))
    note(f"guides per cell: median {np.median(n_g):.0f}, mean {n_g.mean():.2f}, max {n_g.max()}; "
         f"1 guide {np.mean(n_g == 1):.0%}; control guides only: {n_ctrl_only:,} cells")
    per_guide = np.asarray(C.sum(0)).ravel()
    note(f"cells per guide: median {np.median(per_guide):.0f} (targeting guides: "
         f"{np.median(per_guide[~is_ctrl]):.0f}); guides in no kept cell: {int((per_guide == 0).sum()):,}")
    tm = T.loc[~T.control & T.target.notna(), ["guide", "target"]]
    tm.to_csv(os.path.join(a.out, "guide_targets.tsv"), sep="\t", index=False)
    cells_per_target = pd.Series(per_guide, index=T.guide).loc[tm.guide].groupby(tm.target.to_numpy()).sum()
    note(f"targets: {len(cells_per_target):,} (guides per target: "
         f"{tm.groupby('target').size().value_counts().sort_index().to_dict()}); perturbed cells per target "
         f"(sum over its guides): median {cells_per_target.median():.0f}, >= 100: {int((cells_per_target >= 100).sum()):,}")

    # ---- h5ad ----
    counts = Xk.astype(np.float32)
    tot_k = np.asarray(counts.sum(1)).ravel()
    Xn = sp.csr_matrix(counts.multiply(1e4 / tot_k[:, None]))
    Xn.data = np.log1p(Xn.data)
    note(f"nonzero values in X: {Xn.nnz:,} ({'OK' if Xn.nnz < 2 ** 31 else 'over 2^31: AUCell must run in cell chunks'})")
    obs = pd.DataFrame({"guides": guides, "n_guides": n_g, "lane": [c.rsplit("-", 1)[-1] for c in cells],
                        "pct_mt": pct_mt[r], "total_counts": tot[r],
                        "n_genes": np.asarray((Xk > 0).sum(1)).ravel()}, index=cells)
    var = ad.var.iloc[np.where(gk)[0]].copy()
    out = anndata.AnnData(X=Xn.astype(np.float32), obs=obs, var=var, layers={"counts": counts})
    path = os.path.join(a.out, "tf_cm.h5ad")
    out.write_h5ad(path)
    note(f"wrote {path}: {out.n_obs:,} cells x {out.n_vars:,} genes; lanes: {obs.lane.nunique()}")
    open(os.path.join(a.out, "prep_summary.txt"), "w").write("\n".join(summ) + "\n")
    log("done")


if __name__ == "__main__":
    sys.exit(main())
