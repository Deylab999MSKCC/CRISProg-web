# Outputs

Each run writes `results/<name>/` with `config_used.yaml`, `crisprog.log` and one folder per step.

| File | Content |
|---|---|
| `0_check/check_report.md` | Data check: PASS/WARN/FAIL items and *Settings explained* |
| `0_check/suggested_config.yaml` | Settings the check's rules recommend changing, with reasons |
| `0_check/unit_qc.tsv` | Per unit: perturbed cells, guides, targets, knockdown t, top-batch share |
| `1_programs/programs.tsv`, `.gmt`, `programs_summary.tsv` | Programs (gene, rank, method, score) |
| `2_scores/aucell_scores.tsv` | Cells × programs AUCell scores |
| `2_scores/program_gene_ranking.tsv` | Each program gene's correlation with the program score (hub genes, coherence) |
| `3_association/results.tsv` | Every unit × program test: effect, t, p, FDR, `beyond_controls`, `unit_type`, targets |
| `3_association/volcano.pdf` | One volcano plot per program |
| `3_association/calibration.tsv` | Share of shuffled tests with p < 0.05 per program (~0.05 = calibrated) |
| `3_association/controls/` | Negative-control check: fake units, their results and a summary per program and type |
| `4_gene_test/program_summary.tsv` | Per hit: program genes changed (up/down), ratio, target t, flags |
| `4_gene_test/heatmap_<program>.pdf` | Which program genes each hit changes |
| `4_gene_test/overlap.tsv` | Pairs of hits: shared changed genes and shared perturbed cells |
| `4_gene_test/gene_results.tsv.gz` | Every hit × gene test |
| `5_enrichment/` | Pathway enrichment of programs and of each hit's changed genes |
| `6_annotation/report.pdf`, `report.html`, `report.md` | The fact-checked AI report |
| `6_annotation/factcheck.md` | What the fact-check flagged and changed |
| `6_annotation/packet.md` | All results in compact form, as given to the AI |

## Reading `results.tsv`

| Column | Meaning |
|---|---|
| `unit`, `unit_type` | What was tested; `test` or `positive control` |
| `program` | The program |
| `n_perturbed` | Cells carrying the unit's guides |
| `effect_sd` | Shift of the program score, in standard deviations |
| `t`, `p_ols` | OLS t statistic and its normal-theory p-value |
| `p_perm`, `fdr` | Permutation p-value and FDR within the program (use these) |
| `beyond_controls`, `p_vs_controls` | Effect larger than 99% of negative-control effects; share of control units with an effect at least as large |
| `target_in_program` | The unit's target gene is itself a program gene |
| `targets`, `target_genes`, `guides` | Target labels, the measured genes behind them, the guides pooled |
