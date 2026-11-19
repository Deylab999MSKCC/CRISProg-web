# Installation

Three commands:

```bash
git clone https://github.com/Deylab999MSKCC/CRISProg.git && cd CRISProg
conda env create -f environment.yml
conda activate crisprog
```

Check that it works (about 2 minutes):

```bash
pytest -q tests/
```

That's all you need to run CRISProg with your own programs. The extras below are optional.

## Optional extras

??? note "Discover programs with hdWGCNA"
    Only needed if CRISProg should find programs in your data with hdWGCNA. One more command:

    ```bash
    Rscript -e 'remotes::install_github("smorabit/hdWGCNA", ref = "dev", upgrade = "never")'
    ```

??? note "The AI report"
    The last step writes a report that explains the hits. It uses Claude:

    ```bash
    curl -fsSL https://claude.ai/install.sh | bash     # install Claude Code
    claude                                             # then type /login once
    ```

    Without it, everything else still runs, and CRISProg saves the material for the report so you can write it
    later. You can also use an API key instead (`annotation.backend: api`, with `ANTHROPIC_API_KEY` set).

??? note "Running on a cluster (SLURM)"
    Run everything inside a job:

    ```bash
    #!/bin/bash
    #SBATCH --cpus-per-task=8
    #SBATCH --mem=128G
    #SBATCH --time=24:00:00
    source ~/miniforge3/etc/profile.d/conda.sh
    conda activate crisprog
    python crisprog.py run config.yaml
    ```

    If the compute node has no internet, pathway lookup uses local files (`enrichment.gmt`) and the report is
    skipped. Run `--steps annotate` later from a machine that can reach Claude.

??? note "Using your own environment instead of conda"
    - **Python 3.10 or newer** with `numpy scipy pandas anndata h5py matplotlib scanpy pyyaml requests hotspotsc
      anthropic markdown`.
    - **R** with the Bioconductor packages `AUCell`, `rhdf5` and `BiocParallel`.
    - **For hdWGCNA:** also `Seurat`, `WGCNA` and `hdWGCNA`.
    - **For PDF reports:** Chrome/Chromium, or the Python package `weasyprint`.

## Next

Try it on a small test screen: [Quick start](quickstart.md).
