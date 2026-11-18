# FAQ

**Why test programs instead of genes?**
Each perturbation changes most downstream genes only slightly, and testing every perturbation against every gene
carries a heavy multiple-testing burden. A program pools many co-regulated genes into one score, so consistent small
shifts become detectable, with far fewer tests. The per-gene step then shows which program genes actually move.

**Should I give programs or discover them?**
Programs from an independent dataset (e.g. a differentiation time course) are the cleanest: they cannot be shaped by
the perturbations. Discovery from the screen itself works well for large screens and is useful when no reference
exists; check near-duplicate programs between the two methods.

**My screen has high MOI. Is that a problem?**
No; it is the typical design. Each unit is compared with cells carrying the same number of guides, and the p-values
come from shuffling labels among such cells.

**How many cells per perturbation do I need?**
At least 10 are needed to test a unit; effects of ~0.2 SD typically need a few hundred cells.

**The negative-control check warns. What now?**
Read the warning per program and control type. A mild excess only in non-targeting controls, with safe-targeting
controls clean, usually reflects a difference between guides that bind DNA and guides that do not. A clear excess in
the matched controls means a part of the signal is not specific: prefer hits that are `beyond_controls`, and check
the data-check report for a batch or guide-detection issue.

**A hit changes no individual gene. Is it real?**
Possibly, if it shifts many genes by a little; but treat it as weaker evidence than a hit that changes many program
genes in the same direction. Hits flagged `self-driven?` are most likely just the target's own knockdown.

**AUCell gives slightly different results each run.**
AUCell breaks ties at random. CRISProg seeds it and averages 5 seeds (`aucell.n_repeats`); associations that pass
only with some seeds are borderline.

**Can I reproduce an analysis made with an older model?**
Yes. For example, `covariates.moi_categorical: false` uses MOI as one straight-line term instead of one column per
guide count.
