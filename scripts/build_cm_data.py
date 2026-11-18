#!/usr/bin/env python3
"""Build docs/vignettes/data/cm.json for the interactive cardiomyocyte vignette from a CRISProg results folder
(public IGVF data). Usage: python scripts/build_cm_data.py <results/tf_cm> [out.json]"""
import json
import math
import sys

import numpy as np
import pandas as pd

R = sys.argv[1]
OUT = sys.argv[2] if len(sys.argv) > 2 else "docs/vignettes/data/cm.json"

# short labels from the run's enrichment and marker genes (see the report)
LABELS = {
    "Hotspot-1": ("Ribosomal", "cytoplasmic ribosomal proteins; likely growth state"),
    "Hotspot-2": ("Cell cycle", "G2/M and E2F targets"),
    "Hotspot-3": ("Sarcomere", "cardiomyocyte contraction: the core cardiomyocyte program"),
    "Hotspot-4": ("Glycolysis / OXPHOS", "cardiomyocyte energy metabolism"),
    "Hotspot-5": ("Epicardial-like", "marker genes only (TBX18, SFRP5); no enrichment"),
    "Hotspot-6": ("Fibroblast collagen", "cardiac-fibroblast-like cells"),
    "Hotspot-7": ("Actin / keratin", "cytoskeleton; unclear biology"),
    "Hotspot-8": ("Oxidative maturation", "MEF2 and oxidative metabolism"),
    "Hotspot-9": ("Ion channels", "potassium/calcium channels, BMP7"),
    "Hotspot-10": ("BMP / WNT progenitor", "BMP4, FST, LEF1, ISL1"),
    "Hotspot-11": ("Unclear", "weak enrichment"),
    "Hotspot-12": ("Smooth-muscle-like", "TAGLN, ACTA2, CNN1"),
    "Hotspot-13": ("ECM, non-myocyte", "DLK1/IGFBP3 extracellular matrix"),
    "hdWGCNA-blue": ("Non-myocyte axis", "broad: translation and mesenchymal genes"),
    "hdWGCNA-brown": ("BMP / WNT progenitor", "like Hotspot-10"),
    "hdWGCNA-turquoise": ("Cardiomyocyte axis", "broad: sarcomere and OXPHOS genes"),
    "hdWGCNA-yellow": ("RNA processing", "MYC targets"),
}
ORDER = [f"Hotspot-{i}" for i in range(1, 14)] + ["hdWGCNA-turquoise", "hdWGCNA-blue", "hdWGCNA-brown",
                                                     "hdWGCNA-yellow"]


def sig(x, n=3):
    return None if x is None or (isinstance(x, float) and math.isnan(x)) else float(f"{x:.{n}g}")


res = pd.read_csv(f"{R}/3_association/results.tsv", sep="\t")
qc = pd.read_csv(f"{R}/0_check/unit_qc.tsv", sep="\t").set_index("unit")
summ = pd.read_csv(f"{R}/4_gene_test/program_summary.tsv", sep="\t")
psum = pd.read_csv(f"{R}/1_programs/programs_summary.tsv", sep="\t").set_index("program")
rank = pd.read_csv(f"{R}/2_scores/program_gene_ranking.tsv", sep="\t")
top = pd.read_csv(f"{R}/5_enrichment/top_terms.tsv", sep="\t")
ctl = pd.read_csv(f"{R}/3_association/controls/control_summary.tsv", sep="\t")
cal = pd.read_csv(f"{R}/3_association/calibration.tsv", sep="\t").set_index("program")
assert set(ORDER) == set(res.program), set(res.program) ^ set(ORDER)

units = sorted(res.unit.unique())
ui = {u: i for i, u in enumerate(units)}
pi = {p: i for i, p in enumerate(ORDER)}
n_u, n_p = len(units), len(ORDER)
eff = np.full((n_p, n_u), np.nan); nlp = eff.copy(); fdr = eff.copy(); bc = np.zeros((n_p, n_u), int)
for r in res.itertuples():
    i, j = pi[r.program], ui[r.unit]
    eff[i, j], nlp[i, j], fdr[i, j] = r.effect_sd, -math.log10(r.p_perm), r.fdr
    bc[i, j] = int(bool(r.beyond_controls))
hits = res[res.fdr < 0.05]

programs = []
for p in ORDER:
    t = top[(top.list_type == "program") & (top.list == p)].sort_values("q").head(1)
    h = hits[hits.program == p]
    programs.append(dict(
        name=p, label=LABELS[p][0], reading=LABELS[p][1], n_genes=int(psum.loc[p, "n_genes"]),
        genes=list(rank[rank.program == p].sort_values("r_with_score", ascending=False).gene.head(8)),
        term=None if t.empty else t.term.iloc[0], q=None if t.empty else sig(t.q.iloc[0], 2),
        hits=int(len(h)), beyond=int(h.beyond_controls.sum())))

first = res.drop_duplicates("unit").set_index("unit")
U = dict(
    name=units,
    type=[0 if first.loc[u, "unit_type"] == "test" else 1 for u in units],
    cells=[int(first.loc[u, "n_perturbed"]) for u in units],
    guides=[int(qc.loc[u, "n_guides"]) if u in qc.index else None for u in units],
    kd=[sig(qc.loc[u, "target_t"]) if u in qc.index and pd.notna(qc.loc[u, "target_t"]) else None for u in units],
)
follow = {f"{ui[r.unit]},{pi[r.program]}": [int(r.changed_in_program), int(r.program_genes_tested), int(r.up),
                                            int(r.down)] for r in summ.itertuples()}
controls = [dict(program=r.program, type=r.type, frac=sig(r.frac_p_lt_005), nfdr=int(r.n_fdr_hits),
                 q99=sig(r.effect_q99)) for r in ctl.itertuples()]
calib = {p: dict(moi=[sig(cal.loc[p, f"coef_moi={k}"]) for k in range(1, 10)],
                 nctl=[sig(cal.loc[p, f"coef_n_control={k}"]) for k in range(1, 8)],
                 null=sig(cal.loc[p, "null_frac_p_ols_lt_0.05"])) for p in ORDER}


def mat(a, nd):
    return [[None if math.isnan(v) else round(float(v), nd) for v in row] for row in a]


data = dict(programs=programs, units=U,
            eff=mat(eff, 3), nlp=mat(nlp, 2),
            fdr=[[None if math.isnan(v) else sig(v, 2) for v in row] for row in fdr],
            bc=bc.tolist(), follow=follow, controls=controls, calib=calib,
            totals=dict(cells=737263, tested=int((~np.isnan(eff[0])).sum()), hits=int(len(hits)),
                        beyond=int(hits.beyond_controls.sum()), units_with_hits=int(hits.unit.nunique())))
json.dump(data, open(OUT, "w"), separators=(",", ":"))
print(f"{OUT}: {n_u} units x {n_p} programs, {len(hits)} hits, {len(follow)} follow-ups")
