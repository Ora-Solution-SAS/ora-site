/* ============================================================
   ORA — moteur d'animation (vanilla, zéro dépendance)
   Lit window.ORA_COPY (textes localisés) et joue la timeline.
   Format cible : 1080×1920 (9:16).
   ============================================================ */
(function () {
  "use strict";

  const COPY = window.ORA_COPY;
  const params = new URLSearchParams(location.search);

  // ---- options via URL --------------------------------------------------
  const OPT = {
    transparent: params.get("bg") === "transparent", // capture alpha (OBS)
    raw: params.has("raw"),                            // pas de mise à l'échelle (1:1)
    clean: params.has("clean"),                        // masque le HUD d'emblée
    phase: params.get("phase") ? parseInt(params.get("phase"), 10) : null, // boucle 1 phase
    loop: params.has("loop"),
  };
  if (OPT.transparent) document.body.classList.add("transparent");

  // ---- helpers ----------------------------------------------------------
  const esc = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  function wordSpans(text) {
    const parts = String(text).split(" ");
    return parts
      .map(
        (w, i) =>
          `<span class="word" style="--i:${i}">${esc(w)}${
            i < parts.length - 1 ? " " : ""
          }</span>`
      )
      .join("");
  }

  // icône "boucle" pour Recommencer / Repeat
  const LOOP_SVG = `<span class="loop-ico"><svg viewBox="0 0 24 24" fill="none">
    <path d="M3 12a9 9 0 0 1 15.5-6.2M21 12a9 9 0 0 1-15.5 6.2" stroke="url(#lg)" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M18.5 2.2v3.8h-3.8M5.5 21.8v-3.8h3.8" stroke="url(#lg)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <defs><linearGradient id="lg" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
      <stop stop-color="#3b82f6"/><stop offset="1" stop-color="#0d9488"/></linearGradient></defs>
  </svg></span>`;

  // géométrie officielle du logo Ora (barres diagonales, viewBox 200×200)
  const LOGO_BARS = [
    [187, 72, 87, 10],
    [186, 125, 37, 34],
    [162, 165, 13, 73],
    [115, 190, 14, 128],
  ];
  function logoSvg() {
    const bars = LOGO_BARS.map(
      ([x1, y1, x2, y2], i) =>
        `<path class="logo-bar" style="--b:${i}" d="M${x1} ${y1}L${x2} ${y2}"
           stroke="url(#og)" stroke-width="20" stroke-linecap="round" fill="none" pathLength="1"/>`
    ).join("");
    return `<svg class="logo-svg" viewBox="0 0 200 200" fill="none">
      <defs><linearGradient id="og" x1="10" y1="10" x2="190" y2="190" gradientUnits="userSpaceOnUse">
        <stop stop-color="#3b82f6"/><stop offset="1" stop-color="#0d9488"/></linearGradient></defs>
      ${bars}
    </svg>`;
  }

  // ---- construction des scènes -----------------------------------------
  const stage = document.getElementById("stage");

  function line(cls, html, stagger) {
    const st = stagger ? ` style="--stagger:${stagger}"` : "";
    return `<div class="line ${cls}"${st}>${html}</div>`;
  }

  stage.insertAdjacentHTML(
    "beforeend",
    `
    <!-- PHASE 1 — LE PAIN -->
    <section class="scene" id="s1" data-align="lower">
      <svg class="clock" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r="42"/>
        <line class="hand min" x1="48" y1="48" x2="48" y2="26"/>
        <line class="hand sec" x1="48" y1="48" x2="48" y2="18"/>
      </svg>
      ${line("t-l muted", wordSpans(COPY.p1[0]), "80ms")}
      ${line("t-xl", wordSpans(COPY.p1[1]), "70ms")}
    </section>

    <!-- PHASE 2 — ON AGITE -->
    <section class="scene stack" id="s2" data-align="lower">
      ${line("t-l punch s2l1", wordSpans(COPY.p2[0]), "300ms")}
      ${line("t-xl grad glow s2l2", wordSpans(COPY.p2[1]) + LOOP_SVG, "0ms")}
      ${line("t-m s2l3", wordSpans(COPY.p2[2]), "52ms")}
    </section>

    <!-- PHASE 3 — PATTERN INTERRUPT -->
    <section class="scene" id="s3" data-align="center">
      ${line("t-l", wordSpans(COPY.p3[0]), "85ms")}
      ${line("t-xl grad glow", wordSpans(COPY.p3[1]), "70ms")}
    </section>

    <!-- PHASE 4 — LA SOLUTION (lower third discret) -->
    <section class="scene" id="s4" data-align="bottom">
      <div class="lower-bar">
        <span class="dot"></span>
        <div>
          ${line("t-s muted", wordSpans(COPY.p4[0]), "40ms")}
          ${line("t-m grad shimmer", wordSpans(COPY.p4[1]), "55ms")}
        </div>
      </div>
    </section>

    <!-- PHASE 5 — DREAM OUTCOME + CTA -->
    <section class="scene" id="s5" data-align="center">
      <div class="group g-dream">
        ${line("t-l s5l1", wordSpans(COPY.p5[0]), "60ms")}
        ${line("t-l strike s5l2", wordSpans(COPY.p5[1]), "60ms")}
      </div>
      <div class="group g-logo">
        <div class="logo-wrap">
          ${logoSvg()}
          <span class="logo-word">${esc(COPY.brand)}</span>
        </div>
      </div>
      <div class="group g-cta">
        <div class="cta"><span>${esc(COPY.p5[2] || COPY.p5.cta)}</span>
          <span class="arrow">→</span></div>
      </div>
    </section>
  `
  );

  // refs
  const S = {
    s1: document.getElementById("s1"),
    s2: document.getElementById("s2"),
    s3: document.getElementById("s3"),
    s4: document.getElementById("s4"),
    s5: document.getElementById("s5"),
  };
  const q = (sel) => stage.querySelector(sel);

  // ---- contrôle d'éléments ---------------------------------------------
  function activate(el) {
    el.classList.add("active");
    void el.offsetWidth; // flush : garantit que la transition d'entrée se joue
  }
  function deactivate(el) {
    el.classList.remove("active");
    el.querySelectorAll(".line").forEach((l) => l.classList.remove("in", "out"));
  }
  const IN = (sel) => { const e = q(sel); e.classList.remove("out"); e.classList.add("in"); };
  const OUT = (sel) => { const e = q(sel); e.classList.remove("in"); e.classList.add("out"); };
  const bgOra = (on) => stage.classList.toggle("bg-ora", on);

  // ---- TIMELINE (en secondes) ------------------------------------------
  const TL = [
    // PHASE 1 (0–7) — chroma
    [0.0,  () => { activate(S.s1); IN(".scene#s1 .t-l"); }],
    [2.6,  () => IN(".scene#s1 .t-xl")],
    [6.3,  () => { OUT(".scene#s1 .t-l"); OUT(".scene#s1 .t-xl"); }],
    [6.95, () => deactivate(S.s1)],

    // PHASE 2 (7–13) — chroma, 3 punchs
    [7.0,  () => { activate(S.s2); IN(".s2l1"); }],
    [8.8,  () => OUT(".s2l1")],
    [9.1,  () => IN(".s2l2")],
    [10.1, () => OUT(".s2l2")],
    [10.45,() => IN(".s2l3")],
    [12.8, () => OUT(".s2l3")],

    // PHASE 3 (13–16) — fond Ora, coupure nette + ~0.8s de vide
    [13.0, () => { deactivate(S.s2); bgOra(true); activate(S.s3); }],
    [13.85,() => IN(".scene#s3 .t-l")],
    [14.8, () => IN(".scene#s3 .t-xxl")],

    // PHASE 4 (16–27) — retour chroma, lower third discret
    [16.0, () => {
      deactivate(S.s3); bgOra(false);
      activate(S.s4);
      q(".dot").classList.add("show");
      IN(".scene#s4 .t-s"); IN(".scene#s4 .t-m");
    }],
    [24.0, () => q(".shimmer").classList.add("go")],
    [26.2, () => {
      OUT(".scene#s4 .t-s"); OUT(".scene#s4 .t-m");
      q(".dot").classList.remove("show");
    }],
    [26.7, () => deactivate(S.s4)],

    // PHASE 5 (27–35) — fond Ora, dream outcome + logo + CTA
    [27.0, () => { bgOra(true); activate(S.s5); IN(".s5l1"); }],
    [28.2, () => { IN(".s5l2"); q(".s5l2").classList.add("struck"); }],
    [29.5, () => { OUT(".s5l1"); OUT(".s5l2"); }],
    [30.0, () => q(".logo-wrap").classList.add("in")],
    [32.3, () => { q(".logo-wrap").classList.remove("in"); q(".logo-wrap").classList.add("out"); }],
    [32.75,() => q(".cta").classList.add("show")],
  ];
  const DURATION = 35.0;

  // ---- lecteur ----------------------------------------------------------
  let startTs = 0, raf = 0, fired = 0, playing = false, pausedAt = 0;

  function reset() {
    cancelAnimationFrame(raf);
    Object.values(S).forEach(deactivate);
    bgOra(false);
    q(".dot").classList.remove("show");
    q(".shimmer").classList.remove("go");
    q(".logo-wrap").classList.remove("in", "out");
    q(".cta").classList.remove("show");
    q(".s5l2").classList.remove("struck");
    fired = 0; pausedAt = 0;
  }

  function frame(ts) {
    if (!startTs) startTs = ts;
    const t = (ts - startTs) / 1000 + pausedAt;
    while (fired < TL.length && TL[fired][0] <= t) { TL[fired][1](); fired++; }
    setProgress(Math.min(t / DURATION, 1));
    if (t < DURATION) {
      raf = requestAnimationFrame(frame);
    } else if (OPT.loop) {
      reset(); startTs = 0; raf = requestAnimationFrame(frame);
    } else {
      playing = false; updateBtn();
    }
  }

  function play() {
    if (playing) return;
    playing = true; startTs = 0;
    raf = requestAnimationFrame(frame);
    updateBtn();
  }
  function pause() {
    if (!playing) return;
    playing = false;
    cancelAnimationFrame(raf);
    pausedAt += (performance.now() - startTs) / 1000;
    startTs = 0;
    updateBtn();
  }
  function restart() { pause(); reset(); play(); }

  // ---- mode "une seule phase" (preview / capture isolée) ---------------
  function runSinglePhase(n) {
    // bornes de chaque phase
    const bounds = { 1: [0, 7], 2: [7, 13], 3: [13, 16], 4: [16, 27], 5: [27, 35] };
    const [a, b] = bounds[n] || [0, DURATION];
    reset();
    // rejoue tous les cues de la phase, décalés à 0
    const cues = TL.filter((c) => c[0] >= a && c[0] < b).map((c) => [c[0] - a, c[1]]);
    let st = 0, f = 0;
    const dur = b - a;
    function fr(ts) {
      if (!st) st = ts;
      const t = (ts - st) / 1000;
      while (f < cues.length && cues[f][0] <= t) { cues[f][1](); f++; }
      setProgress(Math.min(t / dur, 1));
      if (t < dur + 0.6) requestAnimationFrame(fr);
      else { reset(); st = 0; f = 0; requestAnimationFrame(fr); } // boucle
    }
    requestAnimationFrame(fr);
  }

  // ---- mise à l'échelle pour l'aperçu ----------------------------------
  function fit() {
    if (OPT.raw) { stage.style.transform = "none"; return; }
    const s = Math.min(window.innerWidth / 1080, window.innerHeight / 1920);
    stage.style.transform = `scale(${s})`;
  }
  window.addEventListener("resize", fit);
  fit();

  // ---- HUD --------------------------------------------------------------
  const hud = document.getElementById("hud");
  const bar = hud ? hud.querySelector("i") : null;
  const lbl = hud ? hud.querySelector(".lbl") : null;
  const btn = hud ? hud.querySelector("button") : null;
  function setProgress(p) {
    if (bar) bar.style.width = (p * 100).toFixed(1) + "%";
    if (lbl) lbl.textContent = (p * DURATION).toFixed(1) + "s";
  }
  function updateBtn() { if (btn) btn.textContent = playing ? "❚❚" : "▶"; }
  if (OPT.clean && hud) hud.classList.add("hidden");

  // ---- raccourcis -------------------------------------------------------
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") { e.preventDefault(); playing ? pause() : play(); }
    else if (e.key === "r" || e.key === "R") restart();
    else if (e.key === "h" || e.key === "H") hud && hud.classList.toggle("hidden");
  });
  if (btn) btn.addEventListener("click", () => (playing ? pause() : play()));

  // ---- go ---------------------------------------------------------------
  if (OPT.phase) { if (hud) hud.classList.add("hidden"); runSinglePhase(OPT.phase); }
  else { reset(); play(); }

  window.ORA = { play, pause, restart, reset };
})();
