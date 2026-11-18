# How CRISProg works

A run is a sequence of steps; each writes its outputs to `results/<name>/<n>_<step>/` and reads the outputs of the
steps before it, so any step can be rerun on its own.

```bash
python crisprog.py run config.yaml                          # all steps
python crisprog.py run config.yaml --from test              # resume from a step
python crisprog.py run config.yaml --steps check,test,genes # chosen steps
```

| Step | What it does | Folder |
|---|---|---|
| `check` | Data check: normalization, guides, controls, cells per perturbation, knockdown of every target, batches, program coverage; explains every setting and suggests changes | `0_check/` |
| `programs` | Takes your programs, or discovers them with Hotspot and/or hdWGCNA | `1_programs/` |
| `score` | Scores every program in every cell with AUCell | `2_scores/` |
| `test` | Tests every perturbation against every program; negative-control check | `3_association/` |
| `genes` | For the hits: the same test on every gene, heatmaps, flags | `4_gene_test/` |
| `enrich` | Pathway enrichment of programs and of each hit's changed genes | `5_enrichment/` |
| `annotate` | AI interpretation with literature, fact-checked and rendered | `6_annotation/` |

## Units: what is tested

A **unit** is what gets tested as one perturbation. Without a guide → target table each guide is its own unit. With
one, all guides of a target are pooled: a cell counts as perturbed for a target if it carries any of its guides.
Targets with exactly the same guides (e.g. two genes linked to the same enhancer) would give identical tests and are
merged into one unit named `A/B`. Units with fewer than 10 perturbed cells are not tested (`association.min_perturbed`).

## Programs

Programs are discrete gene sets. You can give them (`programs.file`, `.gmt` or a `program`/`gene` table), for
example from an independent dataset, or let CRISProg discover them:

- **Hotspot** builds a cell neighbour graph on a PCA of the cells, finds genes whose expression is locally
  autocorrelated on it, and groups them into modules by their pairwise local correlations.
- **hdWGCNA** averages neighbouring cells into metacells, builds a signed co-expression network and cuts it into
  modules (named by colour, e.g. `hdWGCNA-turquoise`).

Both start from the same PCA. Methods with continuous gene weights (e.g. cNMF spectra) are not used, because there is
no natural cutoff for program membership. Discovering programs from the screen itself is allowed; a separate
discovery dataset (`programs.discover.h5ad`) avoids any circularity.

## Scoring

AUCell ranks the genes within each cell and scores each program by how many of its genes rank near the top. It
breaks tied expression values at random, so CRISProg averages the score over 5 tie-breaking seeds
(`aucell.n_repeats`) to make borderline results stable. Each program's genes are then ranked by how well they follow
the program score ("hub genes"), and the median of these correlations is the program's **coherence**.

## The association test

For every unit and program, an ordinary least-squares model:

```
program score = baseline + effect × [unit perturbed] + covariates
```

The **covariates** make the comparison fair: cells carrying the unit's guides are compared with cells that are
otherwise alike.

- `log_n_genes`: genes detected per cell (sequencing depth).
- `moi`: number of targeting guides per cell. When it is a whole number, it enters as **one column per value**
  (`covariates.moi_categorical: auto`), so each perturbed cell is compared with cells carrying the same number of
  guides.
- `n_control`: number of control guides per cell, added automatically when control guides share cells with
  targeting guides (`covariates.control_count: auto`), so cells are compared at the same total number of detected
  guides.
- `covariates.batch`: e.g. the 10x lane; each batch gets its own baseline.

The effect is reported in standard deviations of the program score (`effect_sd`). **P-values** come from 10,000
shuffles of the perturbation labels, each only among cells with the same guide count, depth bin and batch; with more
than 50 units, each test is compared with the shuffles of all tests with a similar number of perturbed cells, which
gives much finer p-values. **FDR** is Benjamini–Hochberg within each program. `calibration.tsv` shows the share of
shuffled tests with p < 0.05, which should be about 0.05.

Then the [negative-control check](controls.md#negative-controls) tests fake units made of control guides the same way.

## Per-gene follow-up

For every significant unit, the same model is fit on every gene. This shows whether a perturbation moves many genes
of the program (a broad effect) or only a few:

- **changed / tested**: program genes that change individually (gene-level FDR < 0.05) out of those measured, with
  the direction of each;
- **ratio**: (share of the program's genes that changed) / (share of all genes that changed); above 1 means the effect
  is concentrated in the program;
- **target t**: the unit's own target gene, i.e. how well it was knocked down.

The unit's own target genes, and genes that share an enhancer with it, are excluded from all counts. Two flags:
`self-driven?` (the target is a program gene and no other program gene changed, so the shift may be only its own
knockdown) and `cells_overlap` between two units (shared perturbed cells, e.g. from a shared enhancer, make two effects
hard to separate). The heatmaps show, per program, which program genes each hit changes.

## Enrichment

Programs are tested against a background (your `programs.background`, the discovery genes, or all measured genes);
each hit's changed program genes are tested against the program's genes. The default uses Enrichr's
background-aware API with the newest version of each library (GO Biological Process, Reactome, KEGG, WikiPathways,
MSigDB Hallmark); if it is unreachable, local GMT files are used instead.

## AI report

See [AI report and fact-check](report.md).
