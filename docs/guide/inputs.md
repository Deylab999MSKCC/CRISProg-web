# Preparing your data

CRISProg needs one `.h5ad` file and, usually, a guide → target table. Everything else is set in the config.

## The h5ad

| What | Where | Notes |
|---|---|---|
| Expression | `.X` | **Normalized and log-transformed** (e.g. log1p of counts per 10,000), not scaled. Cells × genes. |
| Raw counts | a layer, `data.counts_layer` | Needed for program discovery; used for the "genes detected" covariate. Optional otherwise. |
| Guide calls | an `.obs` column, `data.guide_col` | Each cell's guides as text, e.g. `SOX17_1;FOXH1_3;NTC_12` (separator `data.guide_sep`). Empty = no guide call; such cells are dropped. |
| Batch | an `.obs` column | e.g. 10x lane or sample; set it in `covariates.batch`. |
| Gene names | var index or `data.gene_col` | Gene symbols, so programs, targets and pathway databases match. |

Cell names must be unique. Control guides stay in the guide column; tell CRISProg which they are with
`data.controls` (a list) or `data.control_pattern` (a regular expression).

!!! tip "Not sure? Run the check first"
    `python crisprog.py run config.yaml --steps check` takes a few minutes and tells you which layer holds raw
    counts, which guides look like controls, which `.obs` column looks like a batch, and more, with a suggested
    config. See [Data check and controls](controls.md).

## The guide → target table

A tab-separated file with columns `guide` and `target` (and optionally `target_id`, e.g. the Ensembl ID), one row per
guide–target pair. It decides what is tested as one unit: all guides of a target are pooled.

=== "TF / gene-knockdown screen"

    Each guide targets one gene's promoter; the target is the gene:

    ```
    guide       target
    SOX17_1     SOX17
    SOX17_2     SOX17
    FOXH1_1     FOXH1
    ```

    Names with promoter or guide suffixes (`POU5F1_P2`, `AARS_main`) are matched to their gene automatically for the
    knockdown check.

=== "Enhancer screen, combined to genes"

    Each guide targets an enhancer (CRE); a table of validated CRE → gene links says which gene each CRE controls.
    Join the two to get guide → gene:

    ```
    guide        target
    CRE12_g1     GENE_A
    CRE12_g2     GENE_A
    CRE40_g1     GENE_A
    CRE40_g1     GENE_B    # a CRE linked to two genes: its guides count for both
    ```

    A gene is then tested with the cells perturbed at **any** of its CREs. A CRE linked to several genes contributes
    its cells to each of them; genes with exactly the same CREs are tested once (`GENE1/GENE2`), and the per-gene step
    reports how many cells two units share (`cells_overlap`).

=== "No table"

    Every guide is its own unit. Useful for guide-level analyses; the knockdown check needs a target table.

## Programs

Give programs as a `.gmt` file or a two-column table (`program`, `gene`) in `programs.file`. Programs with fewer than
20 measured genes are dropped (`programs.min_genes`). If the programs were built from a different set of genes than
your screen measures (e.g. a time course with deeper coverage), give that gene list as `programs.background`, so
pathway enrichment uses the right background.

To discover programs instead, leave `programs.file` empty; you can discover them from a different dataset with
`programs.discover.h5ad` (same format).

## A minimal config

```yaml
name: myscreen                  # results go to results/myscreen/
data:
  h5ad: data/myscreen/screen.h5ad
  counts_layer: counts
  guide_col: guides
  control_pattern: '^NTC'
  target_map: data/myscreen/guide_targets.tsv
covariates:
  batch: [lane]
annotation:
  context: >
    CRISPRi Perturb-seq of 500 TFs in iPSC-derived neurons, day 10. Question: which TFs control
    neuronal maturation programs.
```

Paths are relative to the config file. Every option and its default: [Configuration](configuration.md).
