# Configuration

Everything is set in one YAML file. Only `data.h5ad` and `data.guide_col` are required; paths are relative to the
config file. The [data check](controls.md#the-data-check) explains the key settings for your data and suggests
changes.

## The settings you are most likely to change

| Setting | Default | What it does |
|---|---|---|
| `name` | h5ad file name | Run name; results go to `results/<name>/`. Use a new name to keep variants side by side. |
| `data.counts_layer` | none | Layer with raw counts (program discovery, genes-detected covariate). |
| `data.control_pattern` / `data.controls` | none | Which guides are negative controls (regex / list). |
| `data.control_types` | none | Kinds of negative controls, checked separately, e.g. `{non-targeting: '^NTC', safe-targeting: '^OR'}`. |
| `data.positive_controls` | none | Targets that are knockdown controls; reported separately. |
| `data.target_map` | none | Guide → target table; guides of a target are tested together. |
| `programs.file` | none | Your programs; without it, programs are discovered. |
| `programs.background` | none | Gene list used as the enrichment background for given programs. |
| `programs.discover.methods` | `[hotspot, hdwgcna]` | Discovery methods. |
| `covariates.batch` | none | Batch columns (e.g. 10x lane). |
| `covariates.moi_categorical` | `auto` | Guide count as one column per value (`auto`/`true`) or one straight-line term (`false`). |
| `covariates.control_count` | `auto` | Add the number of control guides per cell when controls share cells with targeting guides. |
| `aucell.n_repeats` | 5 | AUCell tie-breaking seeds averaged. |
| `association.n_perm` | 10,000 | Label shuffles for p-values. |
| `association.fdr` | 0.05 | FDR cutoff for hits. |
| `enrichment.gmt` | none | Local GMT files: fallback when Enrichr is unreachable (or `enrichment.backend: gmt`). |
| `annotation.context` | empty | A few sentences on the experiment for the AI report. |
| `annotation.factcheck` | `true` | Second AI pass that fact-checks the report (about doubles the Claude usage). |

## Every option with its default

```yaml
name: null
results_dir: null
data:
  h5ad: null
  counts_layer: null
  gene_col: null
  guide_col: null
  guide_sep: ;
  controls: []
  control_pattern: null
  control_types: {}
  positive_controls: []
  target_map: null
  merge_identical_targets: true
  keep_cells_without_guides: false
programs:
  file: null
  min_genes: 20
  background: null
  discover:
    h5ad: null
    counts_layer: null
    gene_col: null
    methods:
    - hotspot
    - hdwgcna
    max_cells: 20000
    min_cells_frac: 0.005
    n_hvg: 2000
    n_pcs: 30
    hotspot:
      n_neighbors: 30
      n_genes: 1000
      min_module_genes: 20
      fdr: 0.05
    hdwgcna:
      group_col: null
      gene_fraction: 0.05
      metacell_k: 25
      max_shared: 10
      min_cells: 100
      soft_power: null
      min_module_size: 50
      deep_split: 4
      merge_cut_height: 0.2
    jobs: 4
    seed: 0
covariates:
  use:
  - log_n_genes
  - moi
  batch: []
  moi_col: null
  moi_categorical: auto
  control_count: auto
aucell:
  rscript: Rscript
  cores: 1
  max_rank: null
  rankings_cache: null
  seed: null
  n_repeats: 5
association:
  min_perturbed: 10
  n_perm: 10000
  perm_p: auto
  pool_bins: 5
  depth_bins: 10
  fdr_scope: program
  fdr: 0.05
  seed: 1
  control_units: auto
  control_unit_cells: null
  n_control_units: 100
  control_n_perm: 2000
check:
  review: none
  strict: false
gene_test:
  fdr: 0.05
  n_null: 20
  chunk: 2000
  seed: 1
enrichment:
  backend: enrichr
  libraries:
  - GO_Biological_Process
  - Reactome_Pathways
  - KEGG
  - WikiPathways_Human
  - MSigDB_Hallmark
  gmt: []
  q: 0.05
  min_overlap: 3
  max_term_size: 500
annotation:
  backend: claude-code
  context: ''
  model: null
  web_search: true
  max_turns: 60
  retries: 2
  factcheck: true
  render: true
```
