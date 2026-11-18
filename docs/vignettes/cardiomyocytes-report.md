# CRISProg report: TF CRISPRi Perturb-seq in WTC-11 iPSC-derived cardiomyocytes (CM, day 12)

!!! note "About this report"

    Written by the annotate step of the [cardiomyocyte vignette](cardiomyocytes.md) run and fact-checked: numbers against the run, references against PubMed and Crossref.

## Overview

1,905 units were tested against 17 programs in 737,263 cells. 1,888 unit–program associations reached FDR < 0.05. They involve 512 units: 505 test TFs and 7 positive controls. 1,336 of the associations are beyond the negative-control effect floor. Every program has at least one regulator, but the hits are very uneven. The cardiac-contraction program Hotspot-3 has 252, while the proliferation program Hotspot-2 has 5.

The main pattern is a single cardiomyocyte-versus-non-myocyte axis. Knocking down *NKX2-5*, *TBX20*, *MYOCD*, *MEF2C*, *ISL1*, *RCOR2* and *SMAD5* each lowers Hotspot-3. Most of them also raise the ribosomal (Hotspot-1), collagen/ECM (Hotspot-6) or DLK1/ECM (Hotspot-13) programs. *HOXB4*, *KMT2A* and *HIF1A* knockdowns mostly push the other way. A second theme is that knocking down early-lineage or pluripotency factors (*EOMES*, *MIXL1*, *ZSCAN10*, *PCGF6*, *FOXD3*, *SOX11*, *RCOR2*) raises Hotspot-13. This fits a change in lineage allocation during differentiation rather than regulation inside mature cardiomyocytes.

Negative controls: the safe-targeting controls, the matched comparison for promoter-targeting guides, behave as expected in every program (at most 0.11 of control units at p < 0.05, none at FDR < 0.05). The non-targeting controls show a mild excess in hdWGCNA-blue, hdWGCNA-turquoise and Hotspot-3 (0.24–0.28), most likely a small difference between guides that bind DNA and guides that bind nowhere.

## Programs

**Hotspot-3 – cardiomyocyte sarcomere/contraction.** The top genes are *MYH6*, *TTN*, *MYL4*, *TNNT2*, *RYR2*. Enriched terms include Heart Contraction (q=4.1e-25), Cardiac Muscle Contraction (q=3.7e-20) and mitochondrial RNA processing (q=2.7e-20). This is the core cardiomyocyte identity program. It has 252 hits (155 beyond controls).

**hdWGCNA-turquoise – broad cardiomyocyte/OXPHOS module.** It has 2,535 genes, led by *MYH6* and *TTN*. Enriched terms include Aerobic Respiration and Respiratory Electron Transport (q=4.5e-32) and Oxidative Phosphorylation (q=3.5e-29). It is a broad axis with low coherence (0.103) and mirrors hdWGCNA-blue.

**hdWGCNA-blue – translation/mesenchymal module.** It has 2,152 genes: *SPARC*, *TMSB4X*, *VIM*, *COL3A1* and many *RPL*/*RPS* genes. Enriched terms include Eukaryotic Translation Elongation (q=3.1e-66). It looks partly technical (ribosomal) and partly non-myocyte, with low coherence (0.123).

**Hotspot-1 – cytoplasmic ribosomal proteins.** Enriched terms include Eukaryotic Translation Elongation (q=6e-167). This is likely technical or reflects growth state, although it is highly coherent (0.525).

**Hotspot-4 – glycolysis/OXPHOS.** Top genes include *GAPDH*, *LDHA*, *PKM*, *BNIP3* and COX/ATP5 subunits. Enriched for Oxidative Phosphorylation (q=7.8e-49). This is a cardiomyocyte energy-metabolism program.

**Hotspot-8 – oxidative maturation/MEF2.** Top genes include *PPARGC1A*, *ESRRG*, *MEF2A*, *MEF2C*, *PKP2*, *PDK1*. Enriched for Circulatory System Development (q=0.0034) and Myogenesis (q=0.0026). It is consistent with metabolic maturation of cardiomyocytes.

**Hotspot-10 and hdWGCNA-brown – BMP/WNT progenitor-like signalling.** Top genes include *BMP4*, *FST*, *BAMBI*, *LEF1*, *ISL1*, *VEGFC*, *NRG1*, *JAG1*. Enrichment is weak: Pathways in Cancer (q=0.00042), and for brown Regulation of Cell Population Proliferation (q=0.035).

**Hotspot-6 – fibroblast collagen.** Top genes include *COL1A1*, *COL3A1*, *TCF21*, *H19*, *IGF2*. Enriched for Collagen Chain Trimerization (q=4e-11) and EMT (q=2e-11). This marks cardiac-fibroblast-like cells.

**Hotspot-13 – DLK1/IGFBP3 extracellular matrix.** Top genes include *DLK1*, *IGFBP3*, *LUM*, *FBN1*, *CRABP2*. Enriched for EMT (q=1.8e-13) and ECM Organization (q=1e-09). This is a mesenchymal/ECM non-myocyte program.

**Hotspot-12 – smooth-muscle-like cytoskeleton.** Top genes include *TAGLN*, *ACTA2*, *CNN1*, *CCN1*/*CCN2*. Enriched for Smooth Muscle Contraction (q=1.4e-05).

**Hotspot-7 – actin/keratin cytoskeleton.** Top genes include *KRT8*, *KRT18*, *ACTB*, *MYH10*. Enriched for RHO GTPase Effectors (q=0.00013). It is possibly an epithelial-like or stress state, and its biology is unclear.

**Hotspot-2 – cell cycle.** Enriched for G2-M Checkpoint (q=2.1e-57) and E2F Targets (q=1.5e-55). This is a cell-cycle program (technical in the sense of cell-state).

**Hotspot-9 – ion channels/BMP7.** Top genes include *KCNN2*, *CACNA1D*, *KCNIP4*, *BMP7*. Enriched for Regulation of Potassium Ion Transport (q=0.0014). It may reflect conduction or atrial-like features; this is speculative.

**Hotspot-5 – epicardial-like (gene-based).** Top genes include *TBX18*, *SFRP5*, *BNC1*, *BNC2*, *IGFBP5*, *MYRF*. There is no enrichment at the cutoff, so the label rests only on marker genes.

**Hotspot-11 – weak/unclear.** Top genes include *MFGE8*, *HMGA2*, *GSTP1*, *MDK*. Enrichment is weak: Negative Regulation of Apoptotic Process (q=0.023).

**hdWGCNA-yellow – RNA processing/MYC targets.** Enriched for Myc Targets V1 (q=1.2e-06) and mRNA Processing (q=0.0004). Coherence is low (0.164).

**Remaining programs:** none; all 17 have regulators.

## Regulators

There are 505 significant test units, too many to annotate one by one here. The units below have the largest, broadest or most interpretable effects. The full results table is available on request.

**NKX2-5** (541 cells, target t -19.7)
- Lowers: Hotspot-3 (-0.66 SD; 153/169 genes changed, 152 in the program's direction; ratio 11.1), hdWGCNA-turquoise (-0.438) and hdWGCNA-yellow (-0.272).
- Raises: hdWGCNA-brown (0.756; 52/86, ratio 7.41) and Hotspot-10 (0.697; 45/63, 43 up, ratio 8.76).
- Fit with literature: Loss of *Nkx2-5* disrupts ventricular myogenic specialization [1]. *Nkx2-5* also represses a Bmp2/Smad1 progenitor program [2], which is consistent with the rise of the BMP4/ISL1-containing Hotspot-10.
- Note: *NKX2-5* is itself a Hotspot-3 gene, but many other program genes changed, so this effect is not flagged as self-driven.

**TBX20** (284 cells, t -8.1)
- Raises: Hotspot-13 (1.696, the largest effect in the screen; 44/54 up) and Hotspot-6 (0.644).
- Lowers: Hotspot-3 (-0.802; 139/169), Hotspot-4 (-0.629; 65/89) and hdWGCNA-turquoise (-0.634).
- Fit with literature: Adult *Tbx20* deletion lowers contractile, ion-channel and TF genes [3], which fits.
- Caveat: few perturbed cells.

**MYOCD** (683 cells, t -21.1)
- Lowers: Hotspot-3 (-0.469; 100/169, ratio 12.16).
- Raises: Hotspot-1 (0.349; 92/115, ratio 16.45).
- Fit with literature: Myocardin is an SRF cofactor that activates cardiac genes [4].

**MEF2C** (782 cells, t -18.0)
- Lowers: Hotspot-3 (-0.339; 103/170) and Hotspot-8 (-0.267). *MEF2C* is a Hotspot-8 gene, but 15/32 other genes changed.
- Raises: Hotspot-6 (0.38; 42/57, ratio 13.33).
- Fit with literature: *Mef2c* is required for cardiac myogenesis [5].

**ISL1** (1,010 cells, t -3.9, a weak knockdown)
- Significant in all 17 programs.
- Lowers: Hotspot-3 (-0.456; 150/170), Hotspot-8 (-0.495; 32/33), Hotspot-9 (-0.527) and Hotspot-10 (-0.361; *ISL1* is in this program).
- Raises: Hotspot-1 (0.389; 107/115) and Hotspot-2 (0.195; 71/121).
- Fit with literature: *Isl1* marks second-heart-field progenitors [6]. It is unexpected that *ISL1* and *NKX2-5* knockdowns move Hotspot-10 in opposite directions.
- Caveat: the hit pattern is very broad and the knockdown is weak.

**RCOR2** (612 cells, t -5.0)
- Raises: Hotspot-13 (1.463; 47/54) and Hotspot-6 (0.733; 44/57).
- Lowers: Hotspot-3 (-0.518; 143/170) and hdWGCNA-turquoise (-0.419).
- Fit with literature: RCOR2 is an LSD1/CoREST subunit that maintains ESC pluripotency [7]. A role in lineage choice during differentiation fits better than a role inside mature cardiomyocytes.

**SMAD5** (676 cells, t -10.4)
- Raises: Hotspot-13 (0.388), Hotspot-10 (0.336) and hdWGCNA-brown (0.274).
- Lowers: Hotspot-3 (-0.316; 99/170, ratio 12.52).
- Fit with literature: Loss of Smad5 in cardiomyocytes reduces contractility [8], which is consistent with the Hotspot-3 effect.

**HIF1A** (487 cells, t -12.7)
- Raises: Hotspot-8 (0.602; 26/33, 25 up) and Hotspot-3 (0.207).
- Lowers: Hotspot-1 (-0.527; 96/115) and Hotspot-4 (-0.296; 47/89, with mixed direction: 23 up, 24 down).
- Fit with literature: HIF1α restrains the switch from glycolytic to oxidative metabolism during cardiac maturation [9]. Higher *PPARGC1A*/*ESRRG* (Hotspot-8) after knockdown fits this.

**HOXB4** (516 cells, t -8.5)
- Raises: Hotspot-3 (0.452; 118/170, ratio 12.67), Hotspot-4 (0.353) and hdWGCNA-turquoise (0.455).
- Lowers: Hotspot-1 (-0.291; 80/115), Hotspot-6 (-0.39), Hotspot-7 (-0.402) and Hotspot-11 (-0.43).
- Fit with literature: No literature linking *HOXB4* to cardiomyocytes was found.

**KMT2A** (253 cells, t -6.0)
- Raises: Hotspot-4 (0.446) and Hotspot-8 (0.465).
- Lowers: Hotspot-7 (-0.516; 13/20, ratio 21.12) and Hotspot-6 (-0.329).
- Fit with literature: Inhibiting Mll1 improves cardiac reprogramming of fibroblasts [10], which fits loosely.
- Caveat: few cells.

**TADA2B** (1,872 cells, t -4.2)
- Raises: Hotspot-12 (0.608; 29/42).
- Lowers: Hotspot-1 (-0.318; 106/115; changed genes enriched for Translation, q=0.0029).
- Fit with literature: No cardiac literature was found. TADA2B is a SAGA coactivator subunit.

**FOXD3** (648 cells; target not measured, so knockdown cannot be checked)
- Raises: Hotspot-13 (0.453; 28/54, ratio 36.56) and Hotspot-6 (0.247).
- Lowers: Hotspot-3 (-0.229).
- Fit with literature: FOXD3 is a pluripotency factor and repressor [11].

**Early-lineage TFs on Hotspot-13**
- *EOMES* (0.957; 79 cells), *MIXL1* (0.845; 139 cells; knockdown t -2.2), *ZSCAN10* (0.778; 207 cells), *SOX11* (0.75; 49/54) and *PCGF6* (0.672) each raise Hotspot-13.
- *SOX11* and *MIXL1* share 0.0504 of their cells, which is low overlap.

**Hotspot-2 (cell cycle)**
- *RB1* knockdown raises Hotspot-2 (0.144, FDR 0.048; only 12/121 genes, ratio 1.64).
- *SCAPER* raises it (0.2; only 3/121 genes).
- Both are weak but biologically plausible.

### Positive controls

- **DNAJC19** (a mitochondrial import protein):
  - Lowers Hotspot-3 (-0.153), Hotspot-8 (-0.163) and hdWGCNA-turquoise (-0.139).
  - Raises Hotspot-1 (0.194).
  - This is a plausible consequence of mitochondrial dysfunction.
- **B2M**:
  - Raises Hotspot-3 (0.142) and hdWGCNA-turquoise (0.127).
  - Lowers Hotspot-13 (-0.136) and Hotspot-6 (-0.138).
- **CD55** raises Hotspot-3 (0.178).
- **B2M and CD55 are surface proteins with no expected role in contraction.** These effects look non-specific. Similar-sized effects (about 0.1–0.2 SD) on Hotspot-3 or the ECM programs from real units should not be over-read.
- **Other positive controls:** *CD151*, *CD81*, *TFRC* and *BEX3* have small effects, none beyond controls. *ITGB1*, *MALAT1* and *AARS* have no hits.

## Caveats

- **Self-driven (not trans regulators):**
  - *PBX3* and *TCF21* (Hotspot-6)
  - *BEX3* (Hotspot-11)
  - *NR3C1*, *B2M*, *TGFB1I1*, *TRPS1* and *ERF* (hdWGCNA-blue)
  - *MYEF2*, *HIF3A*, *KDM4C* and *ELF1* (hdWGCNA-turquoise). *ELF1*'s target t is -0.5, so there is no detectable knockdown at all.
- **Negative controls:**
  - Non-targeting control units were significant at p < 0.05 far more often than 5% in Hotspot-3 (0.28; 14 at FDR < 0.05), hdWGCNA-turquoise (0.27; 7), hdWGCNA-blue (0.24; 8), Hotspot-4 (0.21) and Hotspot-6 (0.19; 4).
  - Safe-targeting controls stayed near nominal (≤0.11, no FDR hits). They bind a silent promoter, like targeting guides bind their promoter, so they are the closer null; the non-targeting excess is best read as a binding vs non-binding difference.
  - Only 155/252 Hotspot-3, 114/190 turquoise and 101/178 blue hits are beyond the control floor. Overall, 1,336/1,888 hits are beyond it.
- **Cell overlap:** the highest shared-cell share is 0.133 (*PLAGL2*/*DMAP1*; *DMAP1* has only 15 cells), and only 0.01% of regulator pairs exceed 0.05. No pair is confounded by shared cells. However, changed-gene Jaccard is high among the axis regulators, for example 0.55 for *NKX2-5*/*MYOCD* on Hotspot-1. They largely move the same genes.
- **Low power:** *DMAP1* has 15 cells, no knockdown (t -0.8), and an implausible 1.268 SD on Hotspot-2. Treat it as noise. *EOMES* (79 cells) and *TBX20*/*KMT2A* (fewer than 300 cells) are also underpowered.
- **Knockdown and target mapping:**
  - Only 73% of units have a measured target, so knockdown cannot be checked for *FOXD3*, *ZSCAN10* or *EOMES*.
  - *NPAS3*, *ZFPM1* and *ZIC1* show their target clearly up (WARN). None of them is a hit.
- **Coherence:** hdWGCNA-turquoise (0.103), blue (0.123), yellow (0.164) and brown (0.205) are much less coherent than the Hotspot programs (0.256–0.525). The two large hdWGCNA modules are broad mirror-image axes rather than discrete programs.
- **Weak enrichment:** Hotspot-5 has none; Hotspot-11 and hdWGCNA-brown have only marginal terms.
- **Guide detection depends on cell state:** cells with more detected guides are more cardiomyocyte-like (Hotspot-3 scores rise steadily with the number of detected guides, whether targeting or control). Every test compares cells with the same number of detected targeting and control guides, which removes this effect from the results.
- **Composition versus regulation:** the dominant axis may reflect a shift in cell-type composition (cardiomyocyte versus fibroblast/ECM cells) after knockdown during differentiation, not changes within cardiomyocytes.

## Hypotheses

1. *NKX2-5* knockdown de-represses a BMP/WNT progenitor program (Hotspot-10 0.697; hdWGCNA-brown 0.756) [2]. **Test:** *NKX2-5* CRISPRi plus BMP inhibition (LDN-193189) should blunt the Hotspot-10 rise and partly restore Hotspot-3.
2. *RCOR2*, *TBX20*, *EOMES*, *MIXL1* and *PCGF6* act early to divert cells toward a DLK1⁺ ECM fate (Hotspot-13). **Test:** time-restricted CRISPRi (from iPSC versus from day 8) plus cell-type deconvolution; an early-only effect would indicate lineage allocation.
3. *HIF1A* knockdown speeds oxidative maturation (Hotspot-8 0.602) [9]. **Test:** Seahorse respiration and *PPARGC1A*/*ESRRG* levels in *HIF1A*-CRISPRi cardiomyocytes, with and without hypoxia.
4. *HOXB4* knockdown promotes the cardiomyocyte program (Hotspot-3 0.452) and suppresses ribosomal/fibroblast programs. **Test:** check guide specificity across the *HOXB* cluster, then confirm with independent guides and sorted-population RNA-seq.
5. *RB1* loss modestly relieves cell-cycle repression (Hotspot-2 0.144). **Test:** EdU/pH3 staining in *RB1*-CRISPRi cardiomyocytes.

## References

1. Lyons I, et al. Myogenic and morphogenetic defects in the heart tubes of murine embryos lacking the homeo box gene Nkx2-5. *Genes Dev*. 1995. https://pubmed.ncbi.nlm.nih.gov/7628699/
2. Prall OWJ, et al. An Nkx2-5/Bmp2/Smad1 negative feedback loop controls heart progenitor specification and proliferation. *Cell*. 2007. https://pubmed.ncbi.nlm.nih.gov/17350578/
3. Shen T, et al. Tbx20 regulates a genetic program essential to adult mouse cardiomyocyte function. *J Clin Invest*. 2011. https://pubmed.ncbi.nlm.nih.gov/22080862/
4. Wang D, et al. Activation of cardiac gene expression by myocardin, a transcriptional cofactor for serum response factor. *Cell*. 2001. https://pubmed.ncbi.nlm.nih.gov/11439182/
5. Lin Q, et al. Control of mouse cardiac morphogenesis and myogenesis by transcription factor MEF2C. *Science*. 1997. https://pubmed.ncbi.nlm.nih.gov/9162005/
6. Cai CL, et al. Isl1 identifies a cardiac progenitor population that proliferates prior to differentiation and contributes a majority of cells to the heart. *Dev Cell*. 2003. https://pubmed.ncbi.nlm.nih.gov/14667410/
7. Yang P, et al. RCOR2 is a subunit of the LSD1 complex that regulates ESC property and substitutes for SOX2 in reprogramming somatic cells to pluripotency. *Stem Cells*. 2011. https://pubmed.ncbi.nlm.nih.gov/21433225/
8. Umans L, et al. Inactivation of Smad5 in endothelial cells and smooth muscle cells demonstrates that Smad5 is required for cardiac homeostasis. *Am J Pathol*. 2007. https://pubmed.ncbi.nlm.nih.gov/17456754/
9. Menendez-Montes I, et al. Myocardial VHL-HIF signaling controls an embryonic metabolic switch essential for cardiac maturation. *Dev Cell*. 2016. https://doi.org/10.1016/j.devcel.2016.11.012
10. Liu L, et al. Targeting Mll1 H3K4 methyltransferase activity to guide cardiac lineage specific reprogramming of fibroblasts. *Cell Discov*. 2016. https://pubmed.ncbi.nlm.nih.gov/27924221/
11. Plank-Bazinet JL, Mundell NA. The paradox of Foxd3: how does it function in pluripotency and differentiation of embryonic stem cells? *Stem Cell Investig*. 2016. https://pubmed.ncbi.nlm.nih.gov/27868055/