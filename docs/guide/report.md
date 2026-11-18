# AI report and fact-check

The last step turns the results into a readable interpretation: what each program is, what each hit does, how it fits
the literature, the caveats, and testable hypotheses.

## How it is written

CRISProg writes all results in compact form to `6_annotation/packet.md` (programs with top genes and enrichment;
every association with its effect, FDR, gene-level breadth, knockdown and control comparison; flags; the data check)
together with `INSTRUCTIONS.md`, and gives both to Claude (`annotation.backend`). The instructions require exact
numbers, attribution of every effect to the unit that was tested, calibrated language, controls interpreted correctly,
and references the model actually looked up. Give a few sentences on the experiment in `annotation.context`.

## How it is checked

An AI-written report is not trusted as written:

1. **Rule-based checks** (no AI): every q value, effect size, t value and gene count in the draft must occur in the
   packet; every PMID/DOI must resolve on PubMed or Crossref with the right first author and year.
2. **AI fact-check pass** (`annotation.factcheck`): a second Claude call checks each claim against the packet and each
   citation against the paper's abstract, fixes only what is wrong, adds nothing new and logs every change.
3. The rule-based checks are rerun on the corrected report.

`factcheck.md` lists what was flagged and changed; `report_draft.md` keeps the original. The final report is rendered
to `report.html` and `report.pdf`.

!!! note
    The checks catch wrong numbers, unverifiable references and citations that do not support their sentence. They
    do not make the interpretation right: read the report as a well-sourced first draft.

## Without Claude

With `annotation.backend: packet`, or if Claude Code is not installed, CRISProg writes the packet and instructions;
open both in any Claude session and ask it to follow the instructions.
