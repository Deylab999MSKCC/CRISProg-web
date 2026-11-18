---
hide:
  - navigation
  - toc
---

<div class="cp-hero" markdown>
# <span class="cp-grad">CRISProg</span>

<p class="cp-tagline">Gene-program analysis for single-cell CRISPR screens</p>

<p class="cp-lead">CRISProg finds which perturbations in your Perturb-seq screen move which groups of genes, checks
every hit, and writes a report that explains them.</p>

<div class="cp-actions" markdown>
[Get started](installation.md){ .md-button .md-button--primary }
[See an example](vignettes/cardiomyocytes.md){ .md-button }
</div>
</div>

## How it works

<div class="grid cards" markdown>

-   **1 · Give it your screen**

    An `.h5ad` file with each cell's guides.

-   **2 · Run one command**

    `python crisprog.py run config.yaml`

-   **3 · Read the results**

    Plots, a table of hits and a written report.

</div>

## What it does for you

- **Checks your data first**, and explains every setting before anything runs.
- **Tells real hits from noise**: control guides are tested like real perturbations, and each hit is checked gene
  by gene.
- **Explains the hits** with pathways and literature, in a fact-checked report.

## Start here

<div class="grid cards" markdown>

-   :material-download:{ .lg } **[Install](installation.md)**

    Three commands.

-   :material-rocket-launch-outline:{ .lg } **[Quick start](quickstart.md)**

    A small test screen, about 5 minutes.

-   :material-heart-pulse:{ .lg } **[Full example](vignettes/cardiomyocytes.md)**

    A real screen of ~1,900 TFs, start to finish.

</div>
