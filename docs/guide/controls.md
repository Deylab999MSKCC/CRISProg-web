# Data check and controls

The association test asks whether cells carrying a perturbation have a different program score than comparable cells
without it. The p-values are right **if the only real difference between the two groups is the perturbation**. Three
things check that: the data check before the run, negative controls during it, and positive controls.

## The data check

The first step, `check`, loads the data with your settings and reports PASS / WARN / FAIL for:

- **expression**: is `.X` normalized (raw counts in `.X` is a FAIL), is there a raw-counts layer, are genes named by
  symbol;
- **guides**: guides per cell (MOI), cells without guides;
- **controls**: which control guides were found, whether they are individual guides or merged into one label, and
  whether they share cells with targeting guides;
- **units**: perturbed cells per unit;
- **targets and knockdown**: does each target name match a measured gene, and is the target actually knocked down
  (the t value of its own gene, with the same covariates as the main test); targets that go *up* point to a wrong
  guide → target table;
- **batches**: batch levels, and `.obs` columns that look like batches but are not used;
- **programs**: how many genes of each program are measured.

It ends with **Settings explained**: for each key setting, what it does, its current value, what the data shows, and
how the model will handle it. Changes its rules recommend (raw-counts layer, symbol column, control pattern and
types, positive controls, batch column) go to `0_check/suggested_config.yaml`, each with its reason. The rules are
fixed, so the same data always gives the same advice; nothing is changed automatically.

```bash
python crisprog.py run config.yaml --steps check     # a few minutes; read 0_check/check_report.md
```

## Negative controls

Negative-control guides target nothing (**non-targeting**) or a silent gene (**safe-targeting**, e.g. olfactory
receptor promoters). CRISProg groups them at random into **fake units**, each with about as many perturbed cells as a
typical real unit, and tests them exactly like real perturbations. A fake unit should never be a hit:

| Result of the fake units | Meaning |
|---|---|
| ~5% at p < 0.05, none at FDR < 0.05 | The comparison is fair; the hits can be trusted. |
| Clearly more | Something other than the perturbations differs between the compared cells. The log warns, and hits should be read against the controls. |

Every real association then gets `beyond_controls` (its effect is larger than 99% of fake-unit effects in that
program) and `p_vs_controls`. Control types are checked separately when given (`data.control_types`); safe-targeting
guides bind DNA like targeting guides do, so they are the closer comparison.

### What the negative controls caught

Two real situations, both handled by the model now:

**Control cells as a separate group.** In some screens, control guides are delivered to their own cells (one control
guide per cell), while targeting cells carry many guides. A toy example with three-guide targeting cells:

| Cell | Guides | Score |
|---|---|---|
| 1 | TF-A, TF-B, TF-E | 5 |
| 2 | TF-A, TF-C, TF-D | 5 |
| 3 | TF-B, TF-C, TF-E | 7 |
| 4 | TF-D, TF-E, TF-C | 7 |
| 5 | TF-A, TF-B, TF-D | 5 |
| 6 | NT-1 | 3 |
| 7 | NT-2 | 3 |
| 8 | NT-3 | 3 |

A fake unit made of NT-1 and NT-2 (cells 6–7, score 3) compared with *all* other cells (average 5.3) looks like a
strong hit, although it does nothing. Compared with cells carrying the **same number of guides** (cell 8, score 3), it
shows nothing, as it should. The same holds for real units: TF-A's cells (score 5) look *above* average against all
cells (4.6) but are clearly *below* comparable three-guide cells (7). That is why the guide count enters the model as
one column per value.

**Guide detection that depends on cell state.** In the cardiomyocyte screen, cells with more detected guides were more
cardiomyocyte-like, by the same amount per guide whether the guide was targeting or a control. A cell with one
targeting and one control guide was then compared with cells with one targeting guide only, and looked more
cardiomyocyte-like for that reason alone. Adding the number of control guides to the model compares cells at the same
total number of detected guides. See the [cardiomyocyte vignette](../vignettes/cardiomyocytes.md#negative-controls).

## Positive controls

Many libraries include guides against genes that are not regulators of interest (e.g. *B2M*, *CD81*, *TFRC*), to show
that knockdown works. List them in `data.positive_controls`: they are still tested, but labelled
(`unit_type = positive control`) and reported separately, not as regulators. The data check reports their knockdown.
A positive control that moves a program is informative: a mitochondrial gene raising a stress program is plausible
biology; a surface protein moving a lineage program suggests a non-specific effect, and that real effects of similar
size deserve caution.
