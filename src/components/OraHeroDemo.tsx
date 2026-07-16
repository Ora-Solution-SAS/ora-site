import { useEffect, useRef, useState } from "react";
import { motion, useScroll } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/lib/i18n";

/**
 * OraHeroDemo — scroll-driven product demo in the hero (Bending-Spoons style).
 * A tall wrapper (~3 screens) pins a full-viewport scene; the scroll progress
 * scrubs a story told inside a faithful reconstruction of the REAL Ora app
 * (sidebar Accueil/Atlas/Mon organisation, Atlas folder view, automation
 * panel with category chips + « SUGGESTIONS POUR CE FICHIER » + JOURNAL —
 * replicated from the demo-video posters in /public/posters):
 *
 *   1. the cursor opens « Reporting janvier.xlsx » in the client folder,
 *   2. clicks « Lancer » on « Fiche de synthèse par valeur »,
 *   3. the JOURNAL logs the processing steps,
 *   4. a real Excel workbook (the generated synthesis) opens beside Ora,
 *      and ships with a pressed « Envoyer » + toast.
 *
 * Extras: the stage slightly GROWS and the title-to-demo gap OPENS as you
 * scroll (you feel you're "entering" the app). The cursor's click targets are
 * MEASURED at runtime (offsetLeft chains, transform-independent) so the tip
 * lands exactly on the buttons.
 *
 * IMPLEMENTATION — imperative scrub: element styles are written directly from
 * ONE `scrollYProgress.on("change")` subscription (framer opacity bindings
 * proved unreliable in this montage). Classes are prefixed `.hd-` (`.rm-`
 * belongs to ReportingMockup). prefers-reduced-motion → final state shown.
 * Swap back to <OraGallery> for the 6-video carousel when the clips arrive.
 */

interface OraHeroDemoProps {
  theme: "light" | "dark";
  openBooking: () => void;
}

const W = 1040, H = 640;

const HD_CSS = `
/* ══ Hero scroll-demo — faithful Ora app, scenes driven by scroll ══ */
.hd-stagebox{position:relative;flex:1;min-height:0;width:100%}
.hd-stage{position:absolute;left:50%;top:50%;width:${W}px;height:${H}px;
  transform-origin:center center;
  font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  color:#111827;-webkit-font-smoothing:antialiased}
.hd-blob{position:absolute;z-index:0;left:420px;top:70px;width:590px;height:590px;border-radius:50%;
  background:radial-gradient(circle at 38% 30%,#ffffff,#eef2fb 70%,#e0e7f6)}
.dark .hd-blob{background:radial-gradient(circle at 38% 30%,rgba(255,255,255,.10),rgba(255,255,255,.035) 60%,transparent 75%)}
/* ── macOS window chrome ── */
.hd-win{position:absolute;border-radius:12px;background:#fff;overflow:hidden;
  box-shadow:0 1px 2px rgba(15,23,42,.10),0 24px 60px -18px rgba(15,23,42,.28),0 60px 120px -40px rgba(15,23,42,.20)}
.dark .hd-win{box-shadow:0 1px 2px rgba(0,0,0,.45),0 30px 80px -20px rgba(0,0,0,.65),0 70px 150px -40px rgba(0,0,0,.55)}
.hd-titlebar{position:relative;display:flex;align-items:center;height:36px;flex-shrink:0;
  background:linear-gradient(#fbfbfa,#f4f4f3);border-bottom:1px solid #e6e6e3}
.hd-lights{display:flex;gap:7px;padding:0 13px}
.hd-lights span{width:11px;height:11px;border-radius:50%}
.hd-lights .r{background:#ff5f57;border:.5px solid #e0443e}
.hd-lights .y{background:#febc2e;border:.5px solid #d89c22}
.hd-lights .g{background:#28c840;border:.5px solid #1eaa33}
.hd-tbtitle{position:absolute;left:0;right:0;text-align:center;font-size:12px;font-weight:600;color:#4b5563}
/* ── Ora window: sidebar + content ── */
.hd-orawin{left:240px;top:16px;width:560px;height:608px;display:flex;flex-direction:column}
.hd-app{display:flex;flex:1;min-height:0}
.hd-side{width:136px;flex-shrink:0;background:#fbfaf8;border-right:1px solid #eeedeb;
  display:flex;flex-direction:column;padding:12px 10px}
.hd-sidelogo{display:flex;align-items:center;gap:6px;font-size:14px;font-weight:700;color:#111827;padding:2px 4px 12px}
.hd-sidelabel{font-size:8.5px;font-weight:700;letter-spacing:.08em;color:#9ca3af;text-transform:uppercase;padding:0 6px 6px}
.hd-sideitem{position:relative;display:flex;align-items:center;gap:8px;font-size:11.5px;font-weight:500;color:#4b5563;
  border-radius:8px;padding:7px 8px;margin-bottom:2px}
.hd-sideitem.on{background:#eaf1fe;color:#2563eb;font-weight:600}
.hd-sideitem.on::before{content:'';position:absolute;left:-10px;top:6px;bottom:6px;width:3px;border-radius:99px;background:#3b82f6}
.hd-sidecard{margin-top:auto;background:#f6f7fb;border:1px solid #ebedf3;border-radius:10px;padding:10px 9px;text-align:center}
.hd-sidecard .ic{width:20px;height:20px;margin:0 auto 6px;border-radius:6px;background:#eaf1fe;color:#3b82f6;display:grid;place-items:center}
.hd-sidecard .t{font-size:9.5px;font-weight:700;color:#111827}
.hd-sidecard .d{font-size:8px;line-height:1.35;color:#9ca3af;margin-top:3px}
.hd-content{position:relative;flex:1;min-width:0;background:#fff;display:flex;flex-direction:column}
.hd-topbar{display:flex;align-items:center;height:34px;flex-shrink:0;padding:0 14px;border-bottom:1px solid #f3f4f6}
.hd-crumb{font-size:11px;color:#6b7280}
.hd-crumb b{color:#111827;font-weight:700}
.hd-topicons{margin-left:auto;display:flex;align-items:center;gap:9px;color:#9ca3af}
.hd-avatar{width:18px;height:18px;border-radius:50%;background:#0d9488;color:#fff;font-size:8px;font-weight:700;display:grid;place-items:center}
.hd-scenes{position:relative;flex:1;min-height:0}
.hd-scene{position:absolute;inset:0;padding:14px 16px;overflow:hidden}
/* ── scene A · Atlas folder (documents list) ── */
.hd-back{display:inline-flex;align-items:center;gap:5px;font-size:10.5px;font-weight:600;color:#6b7280;margin-bottom:10px}
.hd-folderhead{display:flex;align-items:center;gap:10px;margin-bottom:4px}
.hd-folderico{width:34px;height:34px;border-radius:9px;background:#eaf1fe;color:#3b82f6;display:grid;place-items:center;flex-shrink:0}
.hd-foldertitle{font-size:16.5px;font-weight:700;letter-spacing:-.01em}
.hd-foldermeta{display:flex;align-items:center;gap:7px;font-size:10px;color:#9ca3af;margin:6px 0 12px}
.hd-badge{display:inline-flex;align-items:center;gap:3px;font-size:9px;font-weight:700;color:#059669;background:#e7f6ef;border-radius:99px;padding:2px 8px}
.hd-searchrow{display:flex;gap:8px;margin-bottom:12px}
.hd-search{flex:1;display:flex;align-items:center;height:32px;background:#fff;border:1px solid #e5e7eb;border-radius:9px;
  padding:0 10px;gap:8px;color:#9ca3af;font-size:11px}
.hd-import{display:inline-flex;align-items:center;gap:5px;height:32px;padding:0 12px;border-radius:9px;
  background:#3b82f6;color:#fff;font-size:10.5px;font-weight:600;white-space:nowrap;box-shadow:0 2px 8px rgba(59,130,246,.25)}
.hd-doclabel{font-size:8.5px;font-weight:700;letter-spacing:.08em;color:#9ca3af;text-transform:uppercase;margin:2px 2px 8px}
.hd-doc{position:relative;display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #eef0f3;
  border-radius:11px;padding:10px 12px;margin-bottom:8px;box-shadow:0 1px 2px rgba(15,23,42,.03)}
.hd-doc .nm{font-size:11.5px;font-weight:600}
.hd-doc .mt{font-size:9.5px;color:#9ca3af;margin-top:2px}
.hd-doc .chev{margin-left:6px;color:#c6cbd3}
.hd-fico{width:26px;height:26px;border-radius:7px;display:grid;place-items:center;flex-shrink:0;font-size:8px;font-weight:800}
.hd-fico.x{background:#e7f6ef;color:#1d7044}
.hd-fico.w{background:#eaf1fe;color:#2563eb}
.hd-fico.p{background:#fdecec;color:#dc2626}
.hd-flash{position:absolute;inset:0;border-radius:11px;background:rgba(59,130,246,.12);
  box-shadow:inset 0 0 0 2px #3b82f6;pointer-events:none;opacity:0}
/* ── scene B · automation panel ── */
.hd-filehead{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.hd-filehead .nm{font-size:15px;font-weight:700;letter-spacing:-.01em}
.hd-filehead .mt{display:flex;align-items:center;gap:6px;font-size:10px;color:#9ca3af;margin-top:2px}
.hd-chips{display:flex;align-items:center;gap:5px;margin-bottom:10px;flex-wrap:nowrap}
.hd-chip{display:inline-flex;align-items:center;gap:4px;font-size:9px;font-weight:600;color:#4b5563;
  background:#fff;border:1px solid #e5e7eb;border-radius:99px;padding:4px 9px;white-space:nowrap}
.hd-chip .n{color:#9ca3af;font-weight:700}
.hd-chip.all{background:#111827;color:#fff;border-color:#111827}
.hd-chip.all .n{color:#d1d5db}
.hd-sugglabel{display:flex;align-items:center;gap:6px;font-size:8.5px;font-weight:700;letter-spacing:.08em;
  color:#6b7280;text-transform:uppercase;margin:2px 2px 8px}
.hd-sugglabel svg{color:#3b82f6}
.hd-hero-sugg{position:relative;display:flex;align-items:center;gap:10px;background:#eaf1fe;border:1px solid #d8e6fd;
  border-radius:11px;padding:10px 12px;margin-bottom:8px}
.hd-hero-sugg .t{font-size:11.5px;font-weight:700;color:#1e3a8a}
.hd-hero-sugg .r{font-size:9.5px;color:#3b5bab;margin-top:2px}
.hd-sugg{position:relative;display:flex;align-items:flex-start;gap:9px;background:#fff;border:1px solid #eef0f3;
  border-radius:11px;padding:10px 12px;margin-bottom:8px;box-shadow:0 1px 2px rgba(15,23,42,.03)}
.hd-sugg .t{font-size:11px;font-weight:700;display:flex;align-items:center;gap:6px}
.hd-sugg .prod{font-size:7.5px;font-weight:800;letter-spacing:.06em;color:#3b82f6;margin-top:2px}
.hd-sugg .d{font-size:9.5px;line-height:1.4;color:#6b7280;margin-top:3px}
.hd-tag{font-size:7px;font-weight:800;letter-spacing:.05em;border-radius:4px;padding:2px 5px}
.hd-tag.export{background:#fef4e6;color:#b45309}
.hd-tag.finance{background:#eaf1fe;color:#2563eb}
.hd-lancer{position:relative;display:inline-flex;align-items:center;gap:4px;font-size:9.5px;font-weight:700;
  border-radius:8px;padding:6px 11px;margin-left:auto;flex-shrink:0;white-space:nowrap}
.hd-lancer.solid{background:#3b82f6;color:#fff;box-shadow:0 2px 8px rgba(59,130,246,.30)}
.hd-lancer.soft{background:#eaf1fe;color:#3b82f6}
.hd-lancer .hd-flash{border-radius:8px}
/* ── JOURNAL (bottom of content) ── */
.hd-journal{flex-shrink:0;border-top:1px solid #f3f4f6;background:#fff;padding:7px 16px 9px}
.hd-jhead{display:flex;align-items:center;gap:7px;font-size:8.5px;font-weight:700;letter-spacing:.08em;
  color:#6b7280;text-transform:uppercase}
.hd-jhead .st{font-weight:600;letter-spacing:0;text-transform:none;color:#9ca3af}
.hd-jlines{margin-top:5px}
.hd-jline{display:flex;align-items:center;gap:6px;font-size:9.5px;color:#374151;padding:2.5px 0;opacity:0}
.hd-jline svg{color:#059669;flex-shrink:0}
/* ── Excel window (generated workbook, scene C) ── */
.hd-excel{left:36px;top:52px;width:520px;height:536px;z-index:6;opacity:0;display:flex;flex-direction:column}
.hd-xlbar{display:flex;align-items:center;height:26px;flex-shrink:0;border-bottom:1px solid #e2e2e2;
  font-size:10.5px;color:#3f3f3f;background:#fff}
.hd-xlname{width:52px;text-align:center;border-right:1px solid #e2e2e2;font-weight:600;line-height:26px}
.hd-xlfx{width:26px;text-align:center;border-right:1px solid #e2e2e2;color:#9a9a9a;font-style:italic;
  font-family:Georgia,serif;line-height:26px}
.hd-xlformula{padding-left:10px;color:#555;font-size:10px}
.hd-xlgrid{display:grid;grid-template-columns:26px 1.55fr 1.05fr .8fr 1fr 1fr;font-size:10px;flex:1;align-content:start;background:#fff}
.hd-xlL{background:#f6f6f6;color:#7a7a7a;text-align:center;font-weight:600;padding:3px 0;
  border-right:1px solid #dedede;border-bottom:1px solid #d0d0d0;font-size:9px}
.hd-xlN{background:#f6f6f6;color:#7a7a7a;text-align:center;font-weight:600;padding:6.5px 0;
  border-right:1px solid #dedede;border-bottom:1px solid #ececec;font-size:9px}
.hd-xlH{background:#e2efda;color:#375623;font-weight:700;padding:6.5px 8px;
  border-right:1px solid #cfe0c4;border-bottom:1px solid #a9c99a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hd-xlH.num{text-align:right}
.hd-xlC{background:#fff;color:#333;padding:6.5px 8px;border-right:1px solid #ececec;border-bottom:1px solid #ececec;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hd-xlC.num{text-align:right;font-variant-numeric:tabular-nums}
.hd-xlC.name{font-weight:500;color:#1f1f1f}
.hd-xlT{background:#fff;color:#111;font-weight:700;padding:7px 8px;border-right:1px solid #ececec;
  border-top:2px solid #375623;border-bottom:1px solid #ececec}
.hd-xlT.num{text-align:right;font-variant-numeric:tabular-nums}
.hd-xlsel{box-shadow:inset 0 0 0 2px #217346}
/* ── generated-file pill / send / toast / cursor / captions ── */
.hd-pill{position:absolute;left:596px;top:70px;z-index:7;display:flex;align-items:center;gap:8px;background:#fff;
  border-radius:11px;padding:8px 12px;box-shadow:0 12px 34px -10px rgba(15,23,42,.30);opacity:0}
.dark .hd-pill{box-shadow:0 12px 34px -10px rgba(0,0,0,.45)}
.hd-pill .fico{width:26px;height:26px;border-radius:7px;background:#e7f6ef;color:#1d7044;display:grid;place-items:center;
  font-size:8px;font-weight:800;flex-shrink:0}
.hd-pill .t1{font-size:10.5px;font-weight:700;color:#111827}
.hd-pill .t2{font-size:9px;color:#9ca3af;margin-top:1px}
.hd-send{position:absolute;left:392px;top:530px;z-index:8;display:inline-flex;align-items:center;gap:11px;height:58px;padding:0 30px;
  border-radius:999px;background:#2563eb;color:#fff;font-size:19px;font-weight:700;letter-spacing:-.01em;
  box-shadow:0 20px 50px -12px rgba(15,23,42,.45),0 6px 20px rgba(37,99,235,.40);opacity:0}
.hd-ring{position:absolute;inset:-7px;border-radius:999px;box-shadow:0 0 0 7px rgba(96,165,250,.32);opacity:0}
.hd-toast{position:absolute;left:640px;top:14px;z-index:9;display:flex;align-items:center;gap:9px;background:#fff;border-radius:12px;
  padding:10px 15px;box-shadow:0 18px 44px -12px rgba(15,23,42,.30);font-size:12px;font-weight:600;color:#111827;opacity:0}
.dark .hd-toast{box-shadow:0 18px 44px -12px rgba(0,0,0,.5)}
.hd-toast .ck{width:21px;height:21px;border-radius:50%;background:#e7f6ef;color:#059669;display:grid;place-items:center;flex-shrink:0}
.hd-cursor{position:absolute;z-index:12;left:0;top:0;width:52px;height:52px;filter:drop-shadow(0 6px 14px rgba(0,0,0,.40))}
.hd-cap{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:12px;opacity:0}
`;

// ── Generated Excel data (per-filiale synthesis) ────────────────────────────
const XL_COLS = ["Filiale", "CA HT", "Marge", "EBE", "Résultat net"];
const XL_ROWS: string[][] = [
  ["Île-de-France", "4 280 000,00", "38,4 %", "1 120 000,00", "624 000,00"],
  ["Auvergne-Rhône-Alpes", "3 150 000,00", "35,1 %", "780 000,00", "402 000,00"],
  ["PACA", "2 640 000,00", "33,8 %", "610 000,00", "318 000,00"],
  ["Grand Est", "1 980 000,00", "31,2 %", "420 000,00", "205 000,00"],
  ["Hauts-de-France", "1 540 000,00", "29,7 %", "305 000,00", "148 000,00"],
  ["Occitanie", "1 320 000,00", "30,5 %", "268 000,00", "131 000,00"],
  ["Nouvelle-Aquitaine", "1 180 000,00", "31,8 %", "244 000,00", "119 000,00"],
];
const XL_TOTAL = ["Total groupe", "16 090 000,00", "34,9 %", "3 747 000,00", "1 947 000,00"];

// JOURNAL log lines shown while the automation runs.
const J_LINES = [
  "Lecture du classeur — 8 filiales détectées",
  "Consolidation des valeurs par filiale",
  "Mise en forme du modèle du cabinet",
  "Synthese_IDF_012026.xlsx généré",
];

// 0→1 ramp of v across [a, b] (clamped).
const seg = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));
// Piecewise-linear keyframe interpolation.
const kf = (v: number, times: number[], vals: number[]) => {
  if (v <= times[0]) return vals[0];
  for (let i = 1; i < times.length; i++) {
    if (v <= times[i]) {
      const t = (v - times[i - 1]) / (times[i] - times[i - 1]);
      return vals[i - 1] + (vals[i] - vals[i - 1]) * t;
    }
  }
  return vals[vals.length - 1];
};

export default function OraHeroDemo({ theme, openBooking }: OraHeroDemoProps) {
  const { t } = useLang();
  void theme;

  const wrapRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const capsRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  const fitScaleRef = useRef(1);
  const lastVRef = useRef(0);
  const applyRef = useRef<(v: number) => void>(() => {});
  // Cursor click targets, measured at runtime in STAGE coordinates.
  const targetsRef = useRef({ doc: { x: 500, y: 220 }, lancer: { x: 700, y: 300 }, send: { x: 480, y: 560 } });

  // Scroll scrub: 0 → 1 across the tall wrapper.
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end end"] });
  const [reduced] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  // Fit the 1040×640 stage inside the box + measure the cursor's click targets.
  useEffect(() => {
    const box = boxRef.current, stage = stageRef.current;
    if (!box || !stage) return;
    // offsetLeft/offsetTop chains are unaffected by the transforms we write,
    // so targets stay valid whatever the current scrub position.
    const stagePos = (el: HTMLElement) => {
      let x = 0, y = 0;
      let n: HTMLElement | null = el;
      while (n && n !== stage) {
        x += n.offsetLeft;
        y += n.offsetTop;
        n = n.offsetParent as HTMLElement | null;
      }
      return { x, y };
    };
    const center = (sel: string, fallback: { x: number; y: number }) => {
      const el = stage.querySelector<HTMLElement>(sel);
      if (!el) return fallback;
      const p = stagePos(el);
      return { x: p.x + el.offsetWidth / 2, y: p.y + el.offsetHeight / 2 };
    };
    const fit = () => {
      const s = Math.min(box.clientWidth / W, box.clientHeight / H);
      fitScaleRef.current = s;
      targetsRef.current = {
        doc: center('[data-cur="doc"]', targetsRef.current.doc),
        lancer: center('[data-cur="lancer"]', targetsRef.current.lancer),
        send: center('[data-cur="send"]', targetsRef.current.send),
      };
      applyRef.current(lastVRef.current);
    };
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    fit();
    // Re-measure once webfonts settle (text metrics shift layout slightly).
    (document as { fonts?: { ready?: Promise<unknown> } }).fonts?.ready?.then(() => fit());
    return () => ro.disconnect();
  }, []);

  // ── Imperative scrub: one subscription writes every element's style. ──
  useEffect(() => {
    const stage = stageRef.current, caps = capsRef.current, hint = hintRef.current, box = boxRef.current;
    if (!stage || !caps || !hint || !box) return;
    const q = (sel: string) => stage.querySelector<HTMLElement>(sel);
    const el = {
      sceneA: q('[data-hd="sceneA"]'), sceneB: q('[data-hd="sceneB"]'),
      docFlash: q('[data-hd="doc-flash"]'), lancerFlash: q('[data-hd="lancer-flash"]'),
      jstatus: q('[data-hd="jstatus"]'),
      jlines: [...stage.querySelectorAll<HTMLElement>("[data-jline]")],
      oraWin: q('[data-hd="orawin"]'), excel: q('[data-hd="excel"]'),
      xlRows: [...stage.querySelectorAll<HTMLElement>("[data-xlrow]")],
      pill: q('[data-hd="pill"]'), send: q('[data-hd="send"]'), ring: q('[data-hd="ring"]'), toast: q('[data-hd="toast"]'),
      cursor: q('[data-hd="cursor"]'),
      caps: [...caps.querySelectorAll<HTMLElement>(".hd-cap")],
    };

    const apply = (v: number) => {
      lastVRef.current = v;
      // The stage slightly grows and the title-to-demo gap opens with scroll.
      const grow = 1 + 0.05 * seg(v, 0, 0.3);
      stage.style.transform = `translate(-50%, -50%) scale(${fitScaleRef.current * grow})`;
      box.style.marginTop = `${14 + 26 * seg(v, 0, 0.3)}px`;

      // Scene crossfade (content area of the Ora window)
      if (el.sceneA) el.sceneA.style.opacity = String(1 - seg(v, 0.14, 0.19));
      if (el.sceneB) el.sceneB.style.opacity = String(seg(v, 0.14, 0.19));
      // Click flashes
      if (el.docFlash) el.docFlash.style.opacity = String(seg(v, 0.115, 0.14) * (1 - seg(v, 0.14, 0.19)));
      if (el.lancerFlash) el.lancerFlash.style.opacity = String(seg(v, 0.30, 0.325) * (1 - seg(v, 0.325, 0.38)));
      // JOURNAL: status + staggered log lines
      if (el.jstatus) {
        const next = v < 0.34 ? "Prêt." : v < 0.55 ? "En cours…" : "Terminé";
        if (el.jstatus.textContent !== next) el.jstatus.textContent = next;
      }
      el.jlines.forEach((l) => {
        const i = Number(l.dataset.jline);
        const o = seg(v, 0.36 + i * 0.045, 0.395 + i * 0.045);
        l.style.opacity = String(o);
        l.style.transform = `translateY(${4 * (1 - o)}px)`;
      });
      // Scene C: Ora slides right, the generated Excel opens on the left
      const slide = seg(v, 0.55, 0.68);
      if (el.oraWin) el.oraWin.style.transform = `translateX(${190 * slide}px)`;
      if (el.excel) {
        el.excel.style.opacity = String(seg(v, 0.55, 0.60));
        el.excel.style.transform = `translateX(${-640 * (1 - slide)}px)`;
      }
      el.xlRows.forEach((r) => {
        const i = Number(r.dataset.xlrow);
        r.style.opacity = String(seg(v, 0.60 + i * 0.02, 0.65 + i * 0.02));
      });
      if (el.pill) el.pill.style.opacity = String(seg(v, 0.70, 0.75));
      // Send button (pop, then pressed) + ring + toast
      if (el.send) {
        el.send.style.opacity = String(seg(v, 0.74, 0.79));
        const y = 20 * (1 - seg(v, 0.74, 0.79));
        const s = 1 - 0.04 * seg(v, 0.82, 0.85);
        el.send.style.transform = `translateY(${y}px) scale(${s})`;
      }
      if (el.ring) el.ring.style.opacity = String(seg(v, 0.82, 0.87));
      if (el.toast) {
        el.toast.style.opacity = String(seg(v, 0.87, 0.92));
        el.toast.style.transform = `translateY(${-16 * (1 - seg(v, 0.87, 0.92))}px)`;
      }
      // Cursor: measured targets; the tip (not the svg corner) lands on them.
      if (el.cursor) {
        const T = targetsRef.current;
        const TIP_X = 14.6, TIP_Y = 6.5; // arrow-tip offset inside the 52px svg
        const tx = (p: { x: number }) => p.x - TIP_X;
        const ty = (p: { y: number }) => p.y - TIP_Y;
        const times = [0, 0.10, 0.135, 0.29, 0.325, 0.55, 0.76, 0.82, 1];
        const x = kf(v, times, [940, tx(T.doc), tx(T.doc), tx(T.lancer), tx(T.lancer), tx(T.lancer), tx(T.send), tx(T.send), tx(T.send)]);
        const y = kf(v, times, [600, ty(T.doc), ty(T.doc), ty(T.lancer), ty(T.lancer), ty(T.lancer), ty(T.send), ty(T.send), ty(T.send)]);
        const cs = kf(v, [0, 0.12, 0.135, 0.15, 0.31, 0.325, 0.34, 0.805, 0.82, 0.835, 1], [1, 1, 0.82, 1, 1, 0.82, 1, 1, 0.82, 1, 1]);
        el.cursor.style.transform = `translate(${x}px, ${y}px) scale(${cs})`;
      }
      // Captions
      const capOp = [
        1 - seg(v, 0.12, 0.18),
        seg(v, 0.15, 0.21) * (1 - seg(v, 0.33, 0.39)),
        seg(v, 0.35, 0.41) * (1 - seg(v, 0.54, 0.60)),
        seg(v, 0.56, 0.62),
      ];
      el.caps.forEach((c, i) => { c.style.opacity = String(capOp[i] ?? 0); });
      hint.style.opacity = String(1 - seg(v, 0, 0.06));
    };

    applyRef.current = apply;
    apply(reduced ? 1 : scrollYProgress.get());
    if (reduced) return;
    const unsub = scrollYProgress.on("change", apply);
    return () => unsub();
  }, [scrollYProgress, reduced]);

  return (
    <section data-nav-shy className="relative bg-white dark:bg-black">
      <style>{HD_CSS}</style>

      {/* Tall scrub wrapper: the sticky screen inside pins while ~3 viewport
          heights of scroll drive the demo timeline. */}
      <div ref={wrapRef} className="relative h-[240vh] md:h-[320vh]">
        <div className="sticky top-0 flex h-screen flex-col overflow-hidden px-6 md:px-12 pt-24 md:pt-28 pb-14 md:pb-16">
          {/* Soft overhead light — only meaningful on the dark background */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden dark:block"
            style={{ background: "radial-gradient(56% 44% at 50% -8%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.055) 40%, transparent 70%)" }}
          />

          {/* Headline */}
          <motion.div
            className="relative z-10 text-center max-w-[90rem] mx-auto"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
              {t({ fr: "Ora en action", en: "Ora in action" })}
            </span>
            <h2 className="font-inter font-normal text-[clamp(1.9rem,4.2vw,3.9rem)] tracking-[-0.035em] leading-[1.06] text-[#111827] dark:text-white mt-4 text-center">
              <span className="block lg:whitespace-nowrap">
                {t({ fr: "On s'occupe de vos ", en: "We handle the " })}
                <span className="text-brand-gradient">{t({ fr: "tâches répétitives", en: "repetitive tasks" })}</span>
                {t({ fr: ",", en: "," })}
              </span>
              <span className="block lg:whitespace-nowrap">
                {t({ fr: "vous ", en: "so you " })}
                <span className="text-brand-gradient">{t({ fr: "excellez", en: "excel" })}</span>
                {t({ fr: " dans votre métier.", en: " at what you do." })}
              </span>
            </h2>
          </motion.div>

          {/* Stage (auto-fitted 1040×640 scene) */}
          <div ref={boxRef} className="hd-stagebox relative z-10">
            <div ref={stageRef} className="hd-stage">
              <div className="hd-blob" />

              {/* ── Ora window (faithful app: sidebar + Atlas content) ── */}
              <div className="hd-win hd-orawin" data-hd="orawin">
                <div className="hd-titlebar">
                  <div className="hd-lights"><span className="r" /><span className="y" /><span className="g" /></div>
                  <div className="hd-tbtitle">Ora</div>
                </div>
                <div className="hd-app">
                  {/* Sidebar */}
                  <div className="hd-side">
                    <div className="hd-sidelogo">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M3 8c5-3 13-3 18 0" stroke="#0d9488" strokeWidth="2.6" strokeLinecap="round" /><path d="M3 13c5-3 13-3 18 0" stroke="#3b82f6" strokeWidth="2.6" strokeLinecap="round" /><path d="M3 18c5-3 13-3 18 0" stroke="#60a5fa" strokeWidth="2.6" strokeLinecap="round" /></svg>
                      Ora
                    </div>
                    <div className="hd-sidelabel">Navigation</div>
                    <div className="hd-sideitem">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
                      Accueil
                    </div>
                    <div className="hd-sideitem on">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 4 5.6 4 9s-1.5 6.4-4 9c-2.5-2.6-4-5.6-4-9s1.5-6.4 4-9z" /></svg>
                      Atlas
                    </div>
                    <div className="hd-sideitem">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></svg>
                      Mon organisation
                    </div>
                    <div className="hd-sidecard">
                      <div className="ic">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"><path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3z" /></svg>
                      </div>
                      <div className="t">Ora Engineering</div>
                      <div className="d">Besoin d'une automatisation ? Décrivez-la, on vous livre un script sur mesure sous 48 h.</div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="hd-content">
                    <div className="hd-topbar">
                      <span className="hd-crumb"><b>Atlas</b> · Valmy &amp; Associés</span>
                      <div className="hd-topicons">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.4 8.6 8.6 0 0 1-3.8-.9L3 21l2-5.6a8.3 8.3 0 0 1-1-4A8.4 8.4 0 0 1 12.5 3a8.4 8.4 0 0 1 8.5 8.5z" /></svg>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>
                        <span className="hd-avatar">RG</span>
                      </div>
                    </div>

                    <div className="hd-scenes">
                      {/* Scene A · folder documents */}
                      <div className="hd-scene" data-hd="sceneA">
                        <div className="hd-back">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                          Retour
                        </div>
                        <div className="hd-folderhead">
                          <span className="hd-folderico">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.7-.9L9.2 3.9A2 2 0 0 0 7.5 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2z" /></svg>
                          </span>
                          <span className="hd-foldertitle">Groupe Méridian · 2026</span>
                        </div>
                        <div className="hd-foldermeta">
                          <span className="hd-badge">
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                            À jour
                          </span>
                          3 documents · 2 membres · modifié il y a 2 h
                        </div>
                        <div className="hd-searchrow">
                          <div className="hd-search">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" strokeLinecap="round" /></svg>
                            Rechercher un document…
                          </div>
                          <span className="hd-import">+ Importer un fichier</span>
                        </div>
                        <div className="hd-doclabel">Documents</div>
                        <div className="hd-doc" data-cur="doc">
                          <span className="hd-fico x">XLSX</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="nm">Reporting janvier</div>
                            <div className="mt">XLSX · 214 Ko · il y a 1 j</div>
                          </div>
                          <span className="hd-badge">À jour</span>
                          <svg className="chev" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                          <div className="hd-flash" data-hd="doc-flash" />
                        </div>
                        <div className="hd-doc">
                          <span className="hd-fico w">DOCX</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="nm">Lettre de mission</div>
                            <div className="mt">DOCX · 88 Ko · il y a 12 j</div>
                          </div>
                          <span className="hd-badge">À jour</span>
                          <svg className="chev" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                        </div>
                        <div className="hd-doc">
                          <span className="hd-fico p">PDF</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="nm">Plaquette 2025</div>
                            <div className="mt">PDF · 2,9 Mo · il y a 3 j</div>
                          </div>
                          <span className="hd-badge">À jour</span>
                          <svg className="chev" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                        </div>
                      </div>

                      {/* Scene B · automation panel for the file */}
                      <div className="hd-scene" data-hd="sceneB" style={{ opacity: 0 }}>
                        <div className="hd-back">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                          Groupe Méridian · 2026
                        </div>
                        <div className="hd-filehead">
                          <span className="hd-fico x" style={{ width: 32, height: 32, fontSize: 9 }}>XLSX</span>
                          <div>
                            <div className="nm">Reporting janvier</div>
                            <div className="mt">XLSX · 214 Ko <span className="hd-badge">À jour</span></div>
                          </div>
                        </div>
                        <div className="hd-chips">
                          <span className="hd-chip">☆ Favoris <span className="n">2</span></span>
                          <span className="hd-chip">Qualité <span className="n">3</span></span>
                          <span className="hd-chip">Finance <span className="n">4</span></span>
                          <span className="hd-chip">Export <span className="n">3</span></span>
                          <span className="hd-chip all">Tout <span className="n">12</span></span>
                        </div>
                        <div className="hd-search" style={{ marginBottom: 10 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" strokeLinecap="round" /></svg>
                          Rechercher une automatisation…
                        </div>
                        <div className="hd-sugglabel">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round"><path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3z" /></svg>
                          Suggestions pour ce fichier
                        </div>
                        {/* Highlighted suggestion (detected match) */}
                        <div className="hd-hero-sugg">
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="t">Fiche de synthèse par valeur</div>
                            <div className="r">Tableau de valeurs détecté · 8 filiales</div>
                          </div>
                          <span className="hd-lancer solid" data-cur="lancer">
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5-13-7.5z" /></svg>
                            Lancer
                            <span className="hd-flash" data-hd="lancer-flash" />
                          </span>
                        </div>
                        <div className="hd-sugg">
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="t">Exporter une feuille en PDF <span className="hd-tag export">Export</span></div>
                            <div className="prod">PRODUIT UN FICHIER</div>
                            <div className="d">Transforme une feuille du classeur en PDF soigné, prêt à envoyer au client.</div>
                          </div>
                          <span className="hd-lancer soft">
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5-13-7.5z" /></svg>
                            Lancer
                          </span>
                        </div>
                        <div className="hd-sugg">
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="t">Envoi automatique par mail <span className="hd-tag finance">Finance</span></div>
                            <div className="prod">AUTOMATISATION</div>
                            <div className="d">Le même livrable, envoyé aux mêmes destinataires, chaque mois.</div>
                          </div>
                          <span className="hd-lancer soft">
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5-13-7.5z" /></svg>
                            Lancer
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* JOURNAL (persistent bottom bar; logs during processing) */}
                    <div className="hd-journal">
                      <div className="hd-jhead">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h10" /></svg>
                        Journal
                        <span className="st" data-hd="jstatus">Prêt.</span>
                      </div>
                      <div className="hd-jlines">
                        {J_LINES.map((line, i) => (
                          <div key={i} className="hd-jline" data-jline={i}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                            {line}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Generated Excel workbook (scene C, real-Excel look) ── */}
              <div className="hd-win hd-excel" data-hd="excel">
                <div className="hd-titlebar">
                  <div className="hd-lights"><span className="r" /><span className="y" /><span className="g" /></div>
                  <div className="hd-tbtitle">Synthese_IDF_012026.xlsx</div>
                </div>
                <div className="hd-xlbar">
                  <span className="hd-xlname">B9</span>
                  <span className="hd-xlfx">fx</span>
                  <span className="hd-xlformula">=SOMME(B2:B8)</span>
                </div>
                <div className="hd-xlgrid">
                  <div className="hd-xlL" />
                  {XL_COLS.map((_, i) => (
                    <div key={`L${i}`} className="hd-xlL">{String.fromCharCode(65 + i)}</div>
                  ))}
                  <div className="hd-xlN">1</div>
                  {XL_COLS.map((h, i) => (
                    <div key={`H${i}`} className={`hd-xlH${i === 0 ? "" : " num"}`}>{h}</div>
                  ))}
                  {XL_ROWS.map((row, i) => (
                    <div key={i} style={{ display: "contents" }}>
                      <div className="hd-xlN" data-xlrow={i}>{i + 2}</div>
                      {row.map((cell, ci) => (
                        <div key={ci} className={`hd-xlC ${ci === 0 ? "name" : "num"}`} data-xlrow={i}>{cell}</div>
                      ))}
                    </div>
                  ))}
                  <div className="hd-xlN" data-xlrow={XL_ROWS.length}>{XL_ROWS.length + 2}</div>
                  {XL_TOTAL.map((cell, ci) => (
                    <div key={`T${ci}`} className={`hd-xlT${ci === 0 ? "" : " num"}${ci === 1 ? " hd-xlsel" : ""}`} data-xlrow={XL_ROWS.length}>{cell}</div>
                  ))}
                </div>
              </div>

              {/* Generated-file pill */}
              <div className="hd-pill" data-hd="pill">
                <span className="fico">XLSX</span>
                <div>
                  <div className="t1">Synthese_IDF_012026.xlsx</div>
                  <div className="t2">Généré par Ora · 96 Ko</div>
                </div>
              </div>

              {/* Send button + toast */}
              <div className="hd-send" data-hd="send" data-cur="send">
                <span className="hd-ring" data-hd="ring" />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7z" /></svg>
                Envoyer
              </div>
              <div className="hd-toast" data-hd="toast">
                <span className="ck">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                </span>
                {t({ fr: "Synthèse envoyée à 3 destinataires", en: "Report sent to 3 recipients" })}
              </div>

              {/* Cursor */}
              <svg className="hd-cursor" data-hd="cursor" viewBox="0 0 32 32">
                <path d="M9 4 L9 27 L14.6 21.6 L18 29.4 L22.4 27.4 L19 19.8 L26.6 19.8 Z" fill="#0b0b0f" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Step captions */}
          <div ref={capsRef} className="relative z-10 h-10 md:h-12 flex-shrink-0">
            {[
              t({ fr: "Ouvrez votre dossier client", en: "Open your client folder" }),
              t({ fr: "Lancez l'automatisation suggérée", en: "Launch the suggested automation" }),
              t({ fr: "Ora traite votre classeur", en: "Ora processes your workbook" }),
              t({ fr: "La synthèse est prête, envoyée en un clic", en: "Your synthesis is ready, sent in one click" }),
            ].map((label, i) => (
              <div key={i} className="hd-cap" style={{ opacity: i === 0 ? 1 : 0 }}>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900/[0.06] ring-1 ring-gray-900/10 text-[13px] font-inter font-semibold text-gray-800 dark:bg-white/10 dark:ring-white/20 dark:text-white">{i + 1}</span>
                <span className="font-inter text-[15px] md:text-lg text-gray-600 dark:text-gray-300">{label}</span>
              </div>
            ))}
          </div>

          {/* Scroll hint */}
          <div ref={hintRef} className="pointer-events-none absolute bottom-2 inset-x-0 flex flex-col items-center gap-1 text-gray-500">
            <span className="text-[12px] font-inter font-medium tracking-wide">
              {t({ fr: "Faites défiler pour voir Ora travailler", en: "Scroll to watch Ora work" })}
            </span>
            <motion.svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" animate={{ y: [0, 6, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
              <path d="m6 9 6 6 6-6" />
            </motion.svg>
          </div>
        </div>
      </div>

      {/* CTA — after the demo releases */}
      <motion.div
        className="relative z-10 pb-16 md:pb-24 px-6 md:px-12 flex justify-center"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.button
          onClick={openBooking}
          whileHover={{ y: -3, scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 24, mass: 0.6 }}
          className="group inline-flex items-center gap-3 px-12 py-6 rounded-full text-lg md:text-xl font-inter font-semibold text-white bg-[#3b82f6] hover:bg-[#2f75e6] shadow-[0_8px_30px_rgba(59,130,246,0.4)] hover:shadow-[0_18px_55px_rgba(59,130,246,0.6)] transition-[background-color,box-shadow] duration-300 ease-out"
        >
          {t({ fr: "Réserver un appel", en: "Book a call" })}
          <ArrowRight className="w-5 h-5 transition-transform duration-300 ease-out group-hover:translate-x-1" />
        </motion.button>
      </motion.div>
    </section>
  );
}
