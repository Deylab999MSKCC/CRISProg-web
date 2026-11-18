/* Interactive widgets for the cardiomyocyte vignette.
   Data: vignettes/data/cm.json (built by scripts/build_cm_data.py from the CRISProg results folder).
   Charts: Plotly (cartesian bundle), loaded only on pages that have a widget. */
(function () {
  "use strict";
  const PLOTLY = "https://cdn.jsdelivr.net/npm/plotly.js-cartesian-dist-min@2.35.2/plotly-cartesian.min.js";
  let D = null, loading = null, observer = null, themeObs = null;
  const charts = {};                       // id -> render(), re-run on theme change
  const state = { program: "Hotspot-3", reg: "NKX2-5", search: "", heat: "cardiac", calib: "Hotspot-3" };

  // ---------- helpers ----------
  const $ = (s, el = document) => el.querySelector(s);
  const el = (tag, attrs = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") n.className = v; else if (k === "text") n.textContent = v;
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v); else n.setAttribute(k, v);
    }
    for (const k of kids) if (k != null) n.append(k.nodeType ? k : document.createTextNode(k));
    return n;
  };
  const fmt = (x, d = 2) => (x == null || Number.isNaN(x)) ? "–" : (x > 0 ? "+" : x < 0 ? "−" : "") + Math.abs(x).toFixed(d);
  const fmtP = (x) => x == null ? "–" : x < 0.001 ? x.toExponential(1).replace("e-", "e−") : x.toPrecision(2);
  const n0 = (x) => x == null ? "–" : x.toLocaleString("en-US");
  const css = (name) => getComputedStyle(document.body).getPropertyValue(name).trim();
  const T = () => ({
    ink: css("--cp-ink"), ink2: css("--cp-ink-2"), muted: css("--cp-muted"), grid: css("--cp-grid"),
    axis: css("--cp-axis"), surface: css("--cp-surface"), border: css("--cp-border"), bg: css("--cp-bg"),
    up: css("--cp-up"), down: css("--cp-down"), ns: css("--cp-ns"), s1: css("--cp-s1"), s2: css("--cp-s2"),
    mid: css("--cp-mid"), font: getComputedStyle(document.body).fontFamily,
  });
  const P = (name) => D.programs[D.pIndex[name]];
  const plabel = (name) => `${name} · ${P(name).label}`;

  function baseLayout(t, extra = {}) {
    const ax = { gridcolor: t.grid, zerolinecolor: t.axis, linecolor: t.axis, tickcolor: t.axis,
                 tickfont: { size: 11, color: t.muted }, title: { font: { size: 12, color: t.ink2 } }, automargin: true };
    return Object.assign({
      paper_bgcolor: "rgba(0,0,0,0)", plot_bgcolor: "rgba(0,0,0,0)",
      font: { family: t.font, size: 12, color: t.ink2 },
      margin: { l: 56, r: 16, t: 10, b: 48 }, showlegend: false,
      hoverlabel: { bgcolor: t.bg, bordercolor: t.border, font: { family: t.font, size: 12, color: t.ink }, align: "left" },
      xaxis: Object.assign({}, ax), yaxis: Object.assign({}, ax),
    }, extra);
  }
  const CONFIG = { displayModeBar: false, responsive: true };

  function loadPlotly() {
    if (window.Plotly) return Promise.resolve();
    return new Promise((ok, fail) => {
      const s = document.createElement("script"); s.src = PLOTLY; s.onload = ok; s.onerror = fail;
      document.head.append(s);
    });
  }
  function loadData(src) {
    if (D) return Promise.resolve(D);
    if (!loading) loading = fetch(src).then((r) => r.json()).then((d) => {
      d.pIndex = Object.fromEntries(d.programs.map((p, i) => [p.name, i]));
      d.uIndex = Object.fromEntries(d.units.name.map((u, i) => [u, i]));
      D = d; return d;
    });
    return loading;
  }

  // ---------- 1. program explorer (volcano) ----------
  function volcano() {
    const box = $("#cm-volcano"); if (!box) return;
    const t = T(), pi = D.pIndex[state.program], U = D.units;
    const groups = { ns: [], downB: [], downW: [], upB: [], upW: [] };
    for (let u = 0; u < U.name.length; u++) {
      const e = D.eff[pi][u]; if (e == null) continue;
      const f = D.fdr[pi][u], hit = f != null && f < 0.05, b = D.bc[pi][u] === 1;
      const g = !hit ? "ns" : e < 0 ? (b ? "downB" : "downW") : (b ? "upB" : "upW");
      groups[g].push(u);
    }
    const tr = (ids, color, open, size, opacity) => ({
      type: "scatter", mode: "markers", x: ids.map((u) => D.eff[pi][u]), y: ids.map((u) => D.nlp[pi][u]),
      customdata: ids.map((u) => [U.name[u], fmtP(D.fdr[pi][u]), n0(U.cells[u]), U.kd[u] == null ? "not measured" : U.kd[u].toFixed(1),
                                  D.bc[pi][u] ? "yes" : "no", fmt(D.eff[pi][u])]),
      hovertemplate: "<b>%{customdata[0]}</b><br>effect %{customdata[5]} SD · FDR %{customdata[1]}<br>" +
        "%{customdata[2]} cells · knockdown t %{customdata[3]}<br>beyond control floor: %{customdata[4]}<extra></extra>",
      marker: { color: open ? "rgba(0,0,0,0)" : color, size, opacity,
                line: { color: open ? color : t.bg, width: open ? 1.6 : 0.8 } },
    });
    const data = [tr(groups.ns, t.ns, false, 6, 0.55), tr(groups.downW, t.down, true, 9, 1), tr(groups.upW, t.up, true, 9, 1),
                  tr(groups.downB, t.down, false, 9, 1), tr(groups.upB, t.up, false, 9, 1)];
    // selective direct labels: the 4 largest hits by |effect| on each side, plus the searched TF
    // selective direct labels: the 3 largest hits by |effect| on each side, staggered so they never stack
    const nLab = ($("#cm-volcano-plot").clientWidth || 600) < 520 ? 2 : 3;
    const big = (ids) => ids.slice().sort((a, b) => Math.abs(D.eff[pi][b]) - Math.abs(D.eff[pi][a])).slice(0, nLab);
    const q = D.uIndex[state.search];
    const sides = [big([...groups.downB, ...groups.downW]), big([...groups.upB, ...groups.upW])];
    if (q != null && D.eff[pi][q] != null) { const s = D.eff[pi][q] < 0 ? 0 : 1; if (!sides[s].includes(q)) sides[s].push(q); }
    const ann = [];
    sides.forEach((ids, side) => ids.slice().sort((a, b) => D.nlp[pi][b] - D.nlp[pi][a]).forEach((u, k) => ann.push({
      x: D.eff[pi][u], y: D.nlp[pi][u], text: U.name[u], showarrow: true, arrowhead: 0, arrowwidth: 1, arrowcolor: t.muted,
      ax: (side ? -1 : 1) * (34 + 8 * k), ay: 20 + 20 * k, xanchor: side ? "right" : "left",
      font: { size: 11, color: u === q ? t.ink : t.ink2 }, bgcolor: t.bg, borderpad: 1,
      bordercolor: u === q ? t.ink2 : "rgba(0,0,0,0)" })));
    if (q != null && D.eff[pi][q] != null) data.push({ type: "scatter", mode: "markers", hoverinfo: "skip",
      x: [D.eff[pi][q]], y: [D.nlp[pi][q]], marker: { size: 18, color: "rgba(0,0,0,0)", line: { color: t.ink, width: 1.5 } } });
    // fixed ranges from the data: labels must not stretch the axes on narrow screens
    const xs = D.eff[pi].filter((v) => v != null), ys = D.nlp[pi].filter((v) => v != null);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), pad = (x1 - x0) * 0.08;
    const layout = baseLayout(t, { annotations: ann, height: 380, dragmode: "pan",
      xaxis: Object.assign(baseLayout(t).xaxis, { range: [x0 - pad, x1 + pad], title: { text: "effect on program score (residual SD)", font: { size: 12, color: t.ink2 } }, zeroline: true }),
      yaxis: Object.assign(baseLayout(t).yaxis, { range: [0, Math.max(...ys) * 1.08], title: { text: "−log10 permutation p", font: { size: 12, color: t.ink2 } } }) });
    const plot = $("#cm-volcano-plot");
    Plotly.react(plot, data, layout, CONFIG);
    plot.removeAllListeners?.("plotly_click");
    plot.on("plotly_click", (ev) => { const cd = ev.points[0].customdata; if (cd) selectRegulator(cd[0], true); });
    programCard();
  }
  function programCard() {
    const p = P(state.program), card = $("#cm-program-card"); if (!card) return;
    card.replaceChildren(
      el("h4", { text: p.name }), el("div", { class: "sub", text: `${p.label}: ${p.reading}` }),
      el("dl", { class: "cp-kv" },
        el("dt", { text: "Genes" }), el("dd", { text: n0(p.n_genes) }),
        el("dt", { text: "Hits (FDR < 0.05)" }), el("dd", { text: n0(p.hits) }),
        el("dt", { text: "Beyond controls" }), el("dd", { text: n0(p.beyond) })),
      el("div", { text: "Top genes" }),
      el("div", { class: "cp-tags" }, ...p.genes.map((g) => el("span", { class: "cp-tag", text: g }))),
      p.term ? el("div", { style: "margin-top:.6rem" }, "Top term: ", el("b", { text: p.term }), ` (q = ${fmtP(p.q)})`) : el("div", { style: "margin-top:.6rem", text: "No enriched term at q < 0.05." }));
  }

  // ---------- 2. regulator explorer (bars across programs) ----------
  function regulator() {
    const box = $("#cm-reg"); if (!box) return;
    const t = T(), u = D.uIndex[state.reg]; if (u == null) return;
    const order = D.programs.map((p) => p.name);
    const rows = order.map((name) => {
      const pi = D.pIndex[name], e = D.eff[pi][u], f = D.fdr[pi][u];
      const fo = D.follow[`${u},${pi}`];
      return { name, e, f, hit: f != null && f < 0.05, b: D.bc[pi][u] === 1, fo };
    }).filter((r) => r.e != null);
    const col = (r) => !r.hit ? t.ns : r.e < 0 ? t.down : t.up;
    const data = [{
      type: "bar", orientation: "h", y: rows.map((r) => plabel(r.name)), x: rows.map((r) => r.e),
      marker: { color: rows.map(col), opacity: rows.map((r) => r.hit ? (r.b ? 1 : 0.55) : 0.6), cornerradius: 4 },
      customdata: rows.map((r) => [fmt(r.e), fmtP(r.f), r.hit ? (r.b ? "yes" : "no") : "–",
                                   r.fo ? `${r.fo[0]} of ${r.fo[1]} program genes (${r.fo[2]} up, ${r.fo[3]} down)` : "–"]),
      hovertemplate: "<b>%{y}</b><br>effect %{customdata[0]} SD · FDR %{customdata[1]}<br>beyond control floor: %{customdata[2]}<br>" +
        "genes changed: %{customdata[3]}<extra></extra>",
      text: rows.map((r) => r.hit ? (r.fo ? `${r.fo[0]}/${r.fo[1]} genes` : "hit") : ""),
      textposition: "outside", textfont: { size: 10.5, color: t.ink2 }, cliponaxis: false,
    }];
    const lim = Math.max(0.3, ...rows.map((r) => Math.abs(r.e))) * 1.6;
    const plot = $("#cm-reg-plot"), narrow = (plot.clientWidth || 600) < 520;
    // narrow screens: program names sit above their bars, so the bars get the full width
    const ann = narrow ? rows.map((r) => ({ xref: "paper", x: 0, y: plabel(r.name), yshift: 13, xanchor: "left", showarrow: false,
                                            text: plabel(r.name), font: { size: 10.5, color: t.ink2 } })) : [];
    const layout = baseLayout(t, { height: narrow ? 40 * rows.length + 60 : 470, margin: { l: 10, r: 16, t: narrow ? 18 : 6, b: 44 },
      bargap: narrow ? 0.62 : 0.28, annotations: ann,
      xaxis: Object.assign(baseLayout(t).xaxis, { range: [-lim, lim], zeroline: true, zerolinecolor: t.ink2, zerolinewidth: 1,
        title: { text: "effect on program score (residual SD)", font: { size: 12, color: t.ink2 } } }),
      yaxis: Object.assign(baseLayout(t).yaxis, { autorange: "reversed", showticklabels: !narrow, tickfont: { size: 11, color: t.ink2 }, gridcolor: "rgba(0,0,0,0)" }) });
    Plotly.react(plot, data, layout, CONFIG);
    regCard(u, rows);
  }
  function kdBadge(kd) {
    if (kd == null) return el("span", { class: "cp-badge info", text: "target not measured" });
    if (kd < -5) return el("span", { class: "cp-badge good", text: "strong knockdown" });
    if (kd < -2) return el("span", { class: "cp-badge good", text: "knockdown" });
    return el("span", { class: "cp-badge warn", text: "no detectable knockdown" });
  }
  function regCard(u, rows) {
    const U = D.units, hits = rows.filter((r) => r.hit), nb = hits.filter((r) => r.b).length;
    const card = $("#cm-reg-card");
    const notes = [];
    if (U.cells[u] < 50) notes.push("Very few perturbed cells: treat hits with caution.");
    if (U.kd[u] != null && U.kd[u] > -2 && hits.length) notes.push("Hits without a detectable knockdown need independent confirmation.");
    if (U.type[u] === 1) notes.push("A positive control: shown to check that knockdown works, not a regulator of interest.");
    card.replaceChildren(
      el("h4", {}, U.name[u], U.type[u] === 1 ? el("span", { class: "cp-badge info", text: "positive control" }) : null),
      el("div", { class: "sub" }, `knockdown t ${U.kd[u] == null ? "–" : U.kd[u].toFixed(1)} `, kdBadge(U.kd[u])),
      el("dl", { class: "cp-kv" },
        el("dt", { text: "Perturbed cells" }), el("dd", { text: n0(U.cells[u]) }),
        el("dt", { text: "Guides" }), el("dd", { text: U.guides[u] == null ? "–" : String(U.guides[u]) }),
        el("dt", { text: "Programs hit" }), el("dd", { text: `${hits.length} of ${rows.length}` }),
        el("dt", { text: "Beyond controls" }), el("dd", { text: String(nb) })),
      ...notes.map((s) => el("div", { style: "margin-top:.45rem", text: s })));
  }
  function selectRegulator(name, scroll) {
    if (D.uIndex[name] == null) return;
    state.reg = name; const inp = $("#cm-reg-input"); if (inp) inp.value = name;
    document.querySelectorAll("#cm-reg .cp-chip").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.v === name)));
    regulator();
    if (scroll) $("#cm-reg")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ---------- 3. regulators x programs heatmap ----------
  const PRESETS = {
    cardiac: ["NKX2-5", "TBX20", "MYOCD", "MEF2C", "ISL1", "RCOR2", "SMAD5", "HOXB4", "KMT2A", "HIF1A"],
  };
  function topByHits(n) {
    const c = D.units.name.map((_, u) => [u, D.programs.reduce((s, p, pi) => s + ((D.fdr[pi][u] ?? 1) < 0.05 && D.bc[pi][u] ? 1 : 0), 0)]);
    return c.filter(([u]) => D.units.type[u] === 0).sort((a, b) => b[1] - a[1]).slice(0, n).map(([u]) => D.units.name[u]);
  }
  function heat() {
    const box = $("#cm-heat"); if (!box) return;
    const t = T(), regs = state.heat === "cardiac" ? PRESETS.cardiac : topByHits(15);
    const progs = D.programs.map((p) => p.name);
    const z = regs.map((r) => progs.map((p) => D.eff[D.pIndex[p]][D.uIndex[r]]));
    const cd = regs.map((r) => progs.map((p) => { const pi = D.pIndex[p], u = D.uIndex[r];
      return [r, plabel(p), fmt(D.eff[pi][u]), fmtP(D.fdr[pi][u])]; }));
    const sx = [], sy = [];
    regs.forEach((r, i) => progs.forEach((p, j) => { const f = D.fdr[D.pIndex[p]][D.uIndex[r]]; if (f != null && f < 0.05) { sx.push(j); sy.push(i); } }));
    const data = [{
      type: "heatmap", z, x: progs.map((p, j) => j), y: regs.map((r, i) => i), customdata: cd, zmin: -0.6, zmax: 0.6, zmid: 0,
      colorscale: [[0, t.down], [0.5, t.mid], [1, t.up]], xgap: 2, ygap: 2,
      colorbar: { thickness: 10, len: 0.8, outlinewidth: 0, tickfont: { size: 10, color: t.muted },
                  title: { text: "SD", side: "top", font: { size: 11, color: t.muted } }, tickvals: [-0.6, -0.3, 0, 0.3, 0.6], ticktext: ["≤−0.6", "−0.3", "0", "0.3", "≥0.6"] },
      hovertemplate: "<b>%{customdata[0]}</b> → %{customdata[1]}<br>effect %{customdata[2]} SD · FDR %{customdata[3]}<extra></extra>",
    }, { type: "scatter", mode: "markers", x: sx, y: sy, hoverinfo: "skip",
         marker: { size: 4.5, color: t.ink, opacity: 0.75 } }];
    const layout = baseLayout(t, { height: 90 + 30 * regs.length, margin: { l: 70, r: 10, t: 6, b: 120 },
      xaxis: Object.assign(baseLayout(t).xaxis, { tickvals: progs.map((_, j) => j), ticktext: progs.map((p) => `${p.replace("hdWGCNA-", "hd-")} · ${P(p).label}`),
        tickangle: -40, gridcolor: "rgba(0,0,0,0)", showline: false, tickfont: { size: 10.5, color: t.ink2 } }),
      yaxis: Object.assign(baseLayout(t).yaxis, { tickvals: regs.map((_, i) => i), ticktext: regs, autorange: "reversed",
        gridcolor: "rgba(0,0,0,0)", showline: false, tickfont: { size: 11, color: t.ink } }) });
    const plot = $("#cm-heat-plot");
    Plotly.react(plot, data, layout, CONFIG);
    plot.removeAllListeners?.("plotly_click");
    plot.on("plotly_click", (ev) => { const p = ev.points.find((x) => x.customdata); if (p) selectRegulator(p.customdata[0], true); });
  }

  // ---------- 4. negative controls ----------
  function controls() {
    const box = $("#cm-controls"); if (!box) return;
    const t = T(), progs = D.programs.map((p) => p.name);
    const get = (type) => progs.map((p) => D.controls.find((c) => c.program === p && c.type === type));
    const nt = get("non-targeting"), st = get("safe-targeting"), ys = progs.map(plabel);
    const series = (rows, name, color) => ({
      type: "scatter", mode: "markers", name, x: rows.map((r) => r.frac), y: ys,
      marker: { size: 11, color, line: { color: t.bg, width: 2 } },
      customdata: rows.map((r) => [name, (r.frac * 100).toFixed(0), r.nfdr]),
      hovertemplate: "<b>%{customdata[1]}%</b> of control units at p < 0.05<br>%{customdata[0]} · %{y}<br>%{customdata[2]} at FDR < 0.05<extra></extra>",
    });
    const links = { type: "scatter", mode: "lines", hoverinfo: "skip", line: { color: t.border, width: 2 },
      x: progs.flatMap((_, i) => [nt[i].frac, st[i].frac, null]), y: ys.flatMap((y) => [y, y, null]) };
    const layout = baseLayout(t, { height: 500, margin: { l: 10, r: 16, t: 26, b: 46 },
      shapes: [{ type: "line", x0: 0.05, x1: 0.05, yref: "paper", y0: 0, y1: 1, line: { color: t.ink2, width: 1 } }],
      annotations: [{ x: 0.05, y: 1, yref: "paper", text: "expected 5%", showarrow: false, xanchor: "left", yanchor: "bottom",
                      xshift: 4, font: { size: 11, color: t.ink2 } }],
      xaxis: Object.assign(baseLayout(t).xaxis, { range: [0, 0.32], tickformat: ".0%", title: { text: "share of control units at p < 0.05", font: { size: 12, color: t.ink2 } } }),
      yaxis: Object.assign(baseLayout(t).yaxis, { autorange: "reversed", gridcolor: "rgba(0,0,0,0)", tickfont: { size: 11, color: t.ink2 } }) });
    Plotly.react($("#cm-controls-plot"), [links, series(nt, "non-targeting", t.s1), series(st, "safe-targeting", t.s2)], layout, CONFIG);
    const lg = $("#cm-controls-legend");
    lg.replaceChildren(el("span", {}, el("i", { style: `background:${t.s1}` }), "non-targeting"),
                       el("span", {}, el("i", { style: `background:${t.s2}` }), "safe-targeting (olfactory-receptor promoters)"));
  }

  // ---------- 5. guide-count effect ----------
  function calib() {
    const box = $("#cm-calib"); if (!box) return;
    const t = T(), c = D.calib[state.calib], k = [1, 2, 3, 4, 5, 6, 7];
    const line = (y, name, color) => ({ type: "scatter", mode: "lines+markers", name, x: k, y: y.slice(0, 7),
      line: { color, width: 2 }, marker: { size: 8, color, line: { color: t.bg, width: 2 } },
      hovertemplate: `${name}: <b>%{y:+.3f}</b><extra></extra>` });
    const layout = baseLayout(t, { height: 320, hovermode: "x unified",
      xaxis: Object.assign(baseLayout(t).xaxis, { tickvals: k, title: { text: "guides detected in the cell", font: { size: 12, color: t.ink2 } },
        showspikes: true, spikemode: "across", spikethickness: 1, spikecolor: t.muted, spikedash: "solid" }),
      yaxis: Object.assign(baseLayout(t).yaxis, { zeroline: true, title: { text: "shift in program score", font: { size: 12, color: t.ink2 } } }) });
    Plotly.react($("#cm-calib-plot"), [line(c.moi, "targeting guides", t.s1), line(c.nctl, "control guides", t.s2)], layout, CONFIG);
    $("#cm-calib-legend").replaceChildren(el("span", {}, el("i", { class: "line", style: `background:${t.s1}` }), "targeting guides"),
                                         el("span", {}, el("i", { class: "line", style: `background:${t.s2}` }), "control guides"));
  }

  // ---------- 6. hits table ----------
  const tbl = { rows: null, sort: ["fdr", 1], page: 0, per: 12 };
  function hitRows() {
    if (tbl.rows) return tbl.rows;
    const rows = [];
    D.programs.forEach((p, pi) => D.units.name.forEach((name, u) => {
      const f = D.fdr[pi][u]; if (f == null || f >= 0.05) return;
      const fo = D.follow[`${u},${pi}`];
      rows.push({ name, program: p.name, label: p.label, eff: D.eff[pi][u], fdr: f, cells: D.units.cells[u],
                  bc: D.bc[pi][u] === 1, genes: fo ? fo[0] : null, tested: fo ? fo[1] : null, ctl: D.units.type[u] === 1 });
    }));
    return (tbl.rows = rows);
  }
  function table() {
    const box = $("#cm-table"); if (!box) return;
    const t = T(), q = $("#cm-t-q").value.trim().toUpperCase(), pf = $("#cm-t-p").value, dir = $("#cm-t-d").value,
          onlyB = $("#cm-t-b").checked;
    let rows = hitRows().filter((r) => (!q || r.name.toUpperCase().includes(q)) && (!pf || r.program === pf) &&
      (!dir || (dir === "up" ? r.eff > 0 : r.eff < 0)) && (!onlyB || r.bc));
    const [k, s] = tbl.sort;
    rows = rows.slice().sort((a, b) => { const x = a[k], y = b[k];
      if (typeof x === "string") return s * x.localeCompare(y);
      return s * ((k === "eff" ? Math.abs(x) : x ?? -1) - (k === "eff" ? Math.abs(y) : y ?? -1)); });
    const pages = Math.max(1, Math.ceil(rows.length / tbl.per)); tbl.page = Math.min(tbl.page, pages - 1);
    const view = rows.slice(tbl.page * tbl.per, (tbl.page + 1) * tbl.per);
    const cols = [["name", "TF"], ["program", "Program"], ["eff", "Effect (SD)"], ["fdr", "FDR"], ["cells", "Cells"],
                  ["genes", "Genes changed"], ["bc", "Beyond controls"]];
    const head = el("tr", {}, ...cols.map(([key, lab]) => el("th", {
      "aria-sort": key === k ? (s > 0 ? "ascending" : "descending") : "none", text: lab,
      onclick: () => { tbl.sort = [key, key === k ? -s : (key === "fdr" || key === "name" || key === "program" ? 1 : -1)]; table(); } })));
    const body = view.map((r) => el("tr", { onclick: () => { selectRegulator(r.name, true); } },
      el("td", {}, el("b", { text: r.name }), r.ctl ? el("span", { class: "cp-badge info", text: "pos. ctrl" }) : null),
      el("td", { class: "prog" }, r.program, el("span", { class: "lab", text: ` · ${r.label}` })),
      el("td", {}, el("span", { class: "cp-dir", style: `background:${r.eff < 0 ? t.down : t.up}` }), fmt(r.eff)),
      el("td", { text: fmtP(r.fdr) }), el("td", { text: n0(r.cells) }),
      el("td", { text: r.genes == null ? "–" : `${r.genes} of ${r.tested}` }), el("td", { text: r.bc ? "yes" : "no" })));
    $("#cm-t-table").replaceChildren(el("thead", {}, head), el("tbody", {}, ...body));
    $("#cm-t-info").textContent = rows.length ? `${n0(tbl.page * tbl.per + 1)}–${n0(tbl.page * tbl.per + view.length)} of ${n0(rows.length)} associations` : "No associations match.";
    $("#cm-t-prev").disabled = tbl.page === 0; $("#cm-t-next").disabled = tbl.page >= pages - 1;
  }

  // ---------- build widget DOM ----------
  function programOptions(sel) {
    return D.programs.map((p) => { const o = el("option", { value: p.name, text: `${p.name} · ${p.label} (${p.hits} hits)` }); if (p.name === sel) o.selected = true; return o; });
  }
  function mount() {
    const v = $("#cm-volcano");
    if (v && !v.dataset.ready) {
      v.dataset.ready = "1";
      const dl = el("datalist", { id: "cm-units" }, ...D.units.name.map((u) => el("option", { value: u })));
      v.replaceChildren(
        el("div", { class: "cp-widget-head" }, el("div", { class: "cp-widget-title", text: "Program explorer" }),
          el("div", { class: "cp-widget-hint", text: "Each dot is one TF. Hover for details; click a dot to open it in the regulator explorer." })),
        el("div", { class: "cp-controls" },
          el("label", {}, "Program", el("select", { class: "cp-select", id: "cm-prog", onchange: (e) => { state.program = e.target.value; volcano(); } }, ...programOptions(state.program))),
          el("label", {}, "Find a TF", el("input", { class: "cp-input", id: "cm-find", list: "cm-units", placeholder: "e.g. NKX2-5",
            oninput: (e) => { const val = e.target.value.trim().toUpperCase(); const m = D.units.name.find((u) => u.toUpperCase() === val); state.search = m || ""; volcano(); } })), dl),
        el("div", { class: "cp-legend", id: "cm-volcano-legend" }),
        el("div", { class: "cp-split" }, el("div", {}, el("div", { class: "cp-plot", id: "cm-volcano-plot" }),
          el("div", { class: "cp-note", text: "With 10,000 shuffles, p-values bottom out near 3e−7, so the strongest hits share the top row." })),
          el("div", { class: "cp-card", id: "cm-program-card" })));
    }
    const r = $("#cm-reg");
    if (r && !r.dataset.ready) {
      r.dataset.ready = "1";
      const chips = ["NKX2-5", "TBX20", "MYOCD", "HOXB4", "HIF1A", "DMAP1", "B2M"];
      r.replaceChildren(
        el("div", { class: "cp-widget-head" }, el("div", { class: "cp-widget-title", text: "Regulator explorer" }),
          el("div", { class: "cp-widget-hint", text: "One TF across all 17 programs. Faded bars are not significant." })),
        el("div", { class: "cp-controls" },
          el("label", {}, "TF", el("input", { class: "cp-input", id: "cm-reg-input", list: "cm-units", value: state.reg,
            onchange: (e) => { const val = e.target.value.trim().toUpperCase(); const m = D.units.name.find((u) => u.toUpperCase() === val); if (m) selectRegulator(m); } })),
          el("div", { class: "cp-chips" }, ...chips.map((c) => el("button", { class: "cp-chip", type: "button", "data-v": c,
            "aria-pressed": String(c === state.reg), text: c, onclick: () => selectRegulator(c) })))),
        el("div", { class: "cp-legend", id: "cm-reg-legend" }),
        el("div", { class: "cp-split cp-split--card-first" }, el("div", { class: "cp-plot", id: "cm-reg-plot" }), el("div", { class: "cp-card", id: "cm-reg-card" })));
    }
    const h = $("#cm-heat");
    if (h && !h.dataset.ready) {
      h.dataset.ready = "1";
      const chip = (v, lab) => el("button", { class: "cp-chip", type: "button", "data-v": v, "aria-pressed": String(state.heat === v), text: lab,
        onclick: (e) => { state.heat = v; h.querySelectorAll(".cp-chip").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.v === v))); heat(); } });
      h.replaceChildren(
        el("div", { class: "cp-widget-head" }, el("div", { class: "cp-widget-title", text: "Regulators × programs" }),
          el("div", { class: "cp-widget-hint", text: "Color = effect; dot = FDR < 0.05. Click a cell to open that TF." })),
        el("div", { class: "cp-controls" }, el("div", { class: "cp-chips" }, chip("cardiac", "Cardiac axis TFs"), chip("top", "Most programs hit"))),
        el("div", { class: "cp-plot-scroll" }, el("div", { class: "cp-plot", id: "cm-heat-plot" })));
    }
    const c = $("#cm-controls");
    if (c && !c.dataset.ready) {
      c.dataset.ready = "1";
      c.replaceChildren(
        el("div", { class: "cp-widget-head" }, el("div", { class: "cp-widget-title", text: "Fake units made of control guides" }),
          el("div", { class: "cp-widget-hint", text: "100 units per type and program; a fair test puts them near 5%." })),
        el("div", { class: "cp-legend", id: "cm-controls-legend" }), el("div", { class: "cp-plot", id: "cm-controls-plot" }));
    }
    const k = $("#cm-calib");
    if (k && !k.dataset.ready) {
      k.dataset.ready = "1";
      k.replaceChildren(
        el("div", { class: "cp-widget-head" }, el("div", { class: "cp-widget-title", text: "More detected guides, higher score" }),
          el("div", { class: "cp-widget-hint", text: "Fitted shift vs cells with none, from calibration.tsv." })),
        el("div", { class: "cp-controls" }, el("label", {}, "Program", el("select", { class: "cp-select",
          onchange: (e) => { state.calib = e.target.value; calib(); } }, ...programOptions(state.calib)))),
        el("div", { class: "cp-legend", id: "cm-calib-legend" }), el("div", { class: "cp-plot", id: "cm-calib-plot" }));
    }
    const tb = $("#cm-table");
    if (tb && !tb.dataset.ready) {
      tb.dataset.ready = "1";
      const reset = () => { tbl.page = 0; table(); };
      tb.replaceChildren(
        el("div", { class: "cp-widget-head" }, el("div", { class: "cp-widget-title", text: `All ${n0(D.totals.hits)} associations` }),
          el("div", { class: "cp-widget-hint", text: "Sort by any column; click a row to open the TF." })),
        el("div", { class: "cp-controls" },
          el("input", { class: "cp-input", id: "cm-t-q", placeholder: "Search TF", oninput: reset }),
          el("select", { class: "cp-select", id: "cm-t-p", onchange: reset }, el("option", { value: "", text: "All programs" }),
            ...D.programs.map((p) => el("option", { value: p.name, text: `${p.name} · ${p.label}` }))),
          el("select", { class: "cp-select", id: "cm-t-d", onchange: reset }, el("option", { value: "", text: "Both directions" }),
            el("option", { value: "up", text: "Raises program" }), el("option", { value: "down", text: "Lowers program" })),
          el("label", {}, el("input", { type: "checkbox", id: "cm-t-b", onchange: reset }), "beyond control floor only")),
        el("div", { class: "cp-table-wrap" }, el("table", { class: "cp-table", id: "cm-t-table" })),
        el("div", { class: "cp-pager" }, el("span", { id: "cm-t-info" }),
          el("span", {}, el("button", { id: "cm-t-prev", text: "Previous", onclick: () => { tbl.page--; table(); } }), " ",
                         el("button", { id: "cm-t-next", text: "Next", onclick: () => { tbl.page++; table(); } }))));
    }
  }
  function legends() {
    const t = T(), v = $("#cm-volcano-legend"), r = $("#cm-reg-legend");
    const items = [[t.down, "lowers program", false], [t.up, "raises program", false], [t.ink2, "hit, but within the control floor", true], [t.ns, "not significant", false]];
    if (v) v.replaceChildren(...items.map(([c, l, open]) => el("span", {}, el("i", { class: open ? "open" : "", style: open ? `color:${c}` : `background:${c}` }), l)));
    if (r) r.replaceChildren(el("span", {}, el("i", { style: `background:${t.down}` }), "lowers"), el("span", {}, el("i", { style: `background:${t.up}` }), "raises"),
      el("span", {}, el("i", { style: `background:${t.ns}` }), "not significant"), el("span", { text: "label = program genes changed on their own" }));
  }

  function renderAll() { legends(); volcano(); regulator(); heat(); controls(); calib(); table(); }

  // ---------- step navigator ----------
  function steps() {
    const nav = $(".cp-steps"); if (!nav) return;
    const links = [...nav.querySelectorAll("a")], ids = links.map((a) => decodeURIComponent(a.hash.slice(1)));
    const secs = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (observer) observer.disconnect();
    observer = new IntersectionObserver(() => {
      const y = window.innerHeight * 0.3; let cur = -1;
      secs.forEach((s, i) => { if (s.getBoundingClientRect().top < y) cur = i; });
      links.forEach((a, i) => { a.classList.toggle("is-active", i === cur); a.classList.toggle("is-done", i < cur); });
      if (cur >= 0) { const a = links[cur], box = nav.getBoundingClientRect(), r = a.getBoundingClientRect();
        if (r.left < box.left || r.right > box.right) nav.scrollTo({ left: a.offsetLeft - 16, behavior: "smooth" }); }
    }, { rootMargin: "0px 0px -60% 0px", threshold: [0, 1] });
    secs.forEach((s) => observer.observe(s));
  }

  function init() {
    steps();
    const app = $("#cm-app"); if (!app) return;
    [...document.querySelectorAll(".cp-widget[data-cm]")].forEach((w) => { if (!w.children.length) w.append(el("div", { class: "cp-loading", text: "Loading interactive chart…" })); });
    Promise.all([loadPlotly(), loadData(app.dataset.src)]).then(() => {
      mount(); renderAll();
      if (!themeObs) { themeObs = new MutationObserver(() => { if ($("#cm-app")) renderAll(); });
        themeObs.observe(document.body, { attributes: true, attributeFilter: ["data-md-color-scheme"] }); }
    }).catch((e) => {
      document.querySelectorAll(".cp-widget[data-cm]").forEach((w) => w.replaceChildren(el("div", { class: "cp-loading", text: "Could not load the interactive chart (" + e + ")." })));
    });
  }
  if (window.document$) window.document$.subscribe(init); else document.addEventListener("DOMContentLoaded", init);
})();
