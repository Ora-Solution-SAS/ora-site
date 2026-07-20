import { useEffect, useRef } from "react";

/**
 * PointageMockup — Bending-Spoons-style static visual for the "Pointage de
 * comptes" use-case card. Same fixed-stage pattern as ReportingMockup: a
 * 1040×580 scene scaled to the media zone via ResizeObserver, classes scoped
 * `.pm-`, no external assets. The composition tells the story in one image:
 *   • an Ora window over a PDF of the annual accounts (Comptes_sociaux_2025),
 *     with the automation pill « Pointage comptes sociaux ⇄ FEC » running in
 *     Auto mode and the tally « 24 / 25 rubriques justifiées · 1 écart »,
 *   • the balance-sheet table (bilan actif) with per-row green checks, cut by
 *     the card's bottom edge,
 *   • a floating « Soldes justifiés » result card overlapping the window's
 *     bottom-left corner.
 */

// Bilan actif rows: [poste, net 2025, net 2024]. The last rows overflow the
// stage on purpose (the window is cut by the card's bottom edge).
const AI_ROWS: string[][] = [
  ["Immobilisations incorporelles", "–", "–"],
  ["Terrains & constructions", "693", "792"],
  ["Installations tech. & outillage", "636", "827"],
  ["Autres immobilisations corporelles", "214", "198"],
  ["Immobilisations financières", "58", "58"],
];
const AC_ROWS: string[][] = [
  ["Stocks & en-cours", "412", "466"],
  ["Clients & comptes rattachés", "981", "1 040"],
];

const PM_CSS = `
/* ══ Visuel « Pointage de comptes » — PDF bilan + pointage FEC automatique ══ */
/* Transparent : la fenêtre flotte directement sur le bleu de la carte.
   overflow:hidden rogne la fenêtre en bas (effet « coupé par la carte »). */
.pm-media{position:relative;aspect-ratio:1040/580;overflow:hidden;isolation:isolate;background:transparent}
.pm-fit{position:absolute;inset:0;z-index:1}
.pm-stage{position:absolute;left:50%;top:0;width:1040px;height:580px;
  transform-origin:top center;
  font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  color:#111827;-webkit-font-smoothing:antialiased}
/* ── macOS window ── */
.pm-win{position:absolute;left:36px;top:8px;width:968px;height:700px;border-radius:14px;
  background:#fff;overflow:hidden;
  box-shadow:0 1px 2px rgba(0,0,0,.40),0 24px 70px -18px rgba(0,0,0,.55),0 60px 130px -40px rgba(0,0,0,.50)}
.pm-titlebar{position:relative;display:flex;align-items:center;height:46px;
  background:linear-gradient(#fbfbfa,#f4f4f3);border-bottom:1px solid #e3e3e0}
.pm-lights{display:flex;gap:8px;padding:0 16px}
.pm-lights span{width:12px;height:12px;border-radius:50%}
.pm-lights .r{background:#ff5f57;border:.5px solid #e0443e}
.pm-lights .y{background:#febc2e;border:.5px solid #d89c22}
.pm-lights .g{background:#28c840;border:.5px solid #1eaa33}
.pm-tbtitle{position:absolute;left:0;right:0;display:flex;align-items:center;justify-content:center;gap:8px;
  font-size:13px;font-weight:600;color:#4b5563}
.pm-pdfico{width:20px;height:20px;border-radius:4px;background:#fff;border:1px solid #f1d4d4;
  display:grid;place-items:center;font-size:7px;font-weight:800;color:#dc2626;
  background:linear-gradient(180deg,#fdeaea,#fff 60%)}
/* ── Ora automation toolbar ── */
.pm-toolbar{display:flex;align-items:center;gap:10px;padding:11px 18px;border-bottom:1px solid #f0f1f3}
.pm-pill{display:inline-flex;align-items:center;gap:7px;font-size:13.5px;font-weight:700;color:#fff;
  background:#2f6bdf;border-radius:10px;padding:8px 14px;box-shadow:0 2px 10px rgba(47,107,223,.30);white-space:nowrap}
.pm-auto{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:700;color:#059669;
  background:#f0fbf4;border:1px solid #cdeeda;border-radius:10px;padding:7px 12px;white-space:nowrap}
.pm-auto .dot{width:8px;height:8px;border-radius:50%;background:#059669}
.pm-tally{margin-left:auto;font-size:13.5px;font-weight:600;color:#6b7280;white-space:nowrap}
.pm-tally b{font-weight:800;color:#059669}
/* ── Body: company header + bilan table ── */
.pm-body{padding:16px 24px 0}
.pm-cohead{display:flex;align-items:center;gap:13px}
.pm-avatar{width:48px;height:48px;border-radius:13px;flex-shrink:0;
  background:linear-gradient(135deg,#3b82f6,#2360d8);color:#fff;
  display:grid;place-items:center;font-size:21px;font-weight:800}
.pm-coname{font-size:20px;font-weight:800;letter-spacing:-.01em;color:#111827}
.pm-cometa{font-size:13px;color:#6b7280;margin-top:2px}
.pm-justif{margin-left:auto;display:inline-flex;align-items:center;gap:7px;font-size:13.5px;font-weight:700;
  color:#059669;background:#e7f6ef;border-radius:999px;padding:9px 16px;white-space:nowrap}
.pm-thead{display:flex;align-items:center;gap:0;margin-top:16px;padding:8px 0;border-top:1px solid #f0f1f3;
  font-size:10.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#9ca3af}
.pm-thead .l{flex:1}
.pm-thead .n{width:118px;text-align:right}
.pm-thead .c{width:46px}
.pm-section{display:flex;align-items:center;gap:12px;margin-top:8px;padding:5px 0;
  font-size:11.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#2563eb}
.pm-section::after{content:'';flex:1;height:1px;background:#e8eaee}
.pm-row{display:flex;align-items:center;padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:15px}
.pm-row .l{flex:1;font-weight:600;color:#1f2937;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pm-row .n{width:118px;text-align:right;font-variant-numeric:tabular-nums;font-weight:700;color:#111827}
.pm-row .n.prev{color:#9ca3af;font-weight:600}
.pm-row .c{width:46px;display:flex;justify-content:flex-end}
.pm-check{width:24px;height:24px;border-radius:50%;background:#22c55e;color:#fff;display:grid;place-items:center}
/* ── Floating « Soldes justifiés » result card ── */
.pm-result{position:absolute;left:6px;top:448px;z-index:6;display:flex;align-items:center;gap:13px;
  background:#fff;border-radius:16px;padding:15px 20px;
  box-shadow:0 1px 2px rgba(0,0,0,.18),0 22px 55px -14px rgba(0,0,0,.5)}
.pm-result .ic{width:42px;height:42px;border-radius:12px;background:#dcf5e7;color:#16a34a;
  display:grid;place-items:center;flex-shrink:0}
.pm-result .t1{font-size:16.5px;font-weight:800;letter-spacing:-.01em;color:#111827}
.pm-result .t2{font-size:13px;font-weight:600;color:#6b7280;margin-top:2px}
.pm-result .t2 .warn{color:#d97706;font-weight:700}
`;

function Check() {
  return (
    <span className="pm-check">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
    </span>
  );
}

function Row({ row }: { row: string[] }) {
  return (
    <div className="pm-row">
      <span className="l">{row[0]}</span>
      <span className="n">{row[1]}</span>
      <span className="n prev">{row[2]}</span>
      <span className="c"><Check /></span>
    </div>
  );
}

export default function PointageMockup() {
  const mediaRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = mediaRef.current;
    const stage = stageRef.current;
    if (!media || !stage) return;
    const W = 1040, H = 580;
    const fit = () => {
      const s = Math.min(media.clientWidth / W, media.clientHeight / H);
      stage.style.transform = `translateX(-50%) scale(${s})`;
    };
    const ro = new ResizeObserver(fit);
    ro.observe(media);
    fit();
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <style>{PM_CSS}</style>
      <div className="pm-media" ref={mediaRef}>
        <div className="pm-fit">
          <div className="pm-stage" ref={stageRef}>
            {/* A · Fenêtre Ora — PDF des comptes sociaux + pointage automatique */}
            <div className="pm-win">
              <div className="pm-titlebar">
                <div className="pm-lights"><span className="r" /><span className="y" /><span className="g" /></div>
                <div className="pm-tbtitle">
                  <span className="pm-pdfico">PDF</span>
                  Comptes_sociaux_2025.pdf — Ora
                </div>
              </div>

              {/* Barre d'automatisation Ora */}
              <div className="pm-toolbar">
                <span className="pm-pill">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round"><path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3z" /></svg>
                  Pointage comptes sociaux
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3 4 7l4 4M4 7h16M16 13l4 4-4 4M20 17H4" /></svg>
                  FEC
                </span>
                <span className="pm-auto"><span className="dot" />Auto</span>
                <span className="pm-tally"><b>24</b> / 25 rubriques justifiées · 1 écart</span>
              </div>

              {/* Corps : entreprise + bilan actif pointé */}
              <div className="pm-body">
                <div className="pm-cohead">
                  <div className="pm-avatar">W</div>
                  <div>
                    <div className="pm-coname">SARL Woippy Protection</div>
                    <div className="pm-cometa">Bilan actif · Exercice clos le 31/12/2025 · en euros</div>
                  </div>
                  <span className="pm-justif">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                    Soldes justifiés
                  </span>
                </div>

                <div className="pm-thead">
                  <span className="l">Poste</span>
                  <span className="n">Net 2025</span>
                  <span className="n">Net 2024</span>
                  <span className="c" />
                </div>

                <div className="pm-section">Actif immobilisé</div>
                {AI_ROWS.map((row) => <Row key={row[0]} row={row} />)}

                <div className="pm-section">Actif circulant</div>
                {AC_ROWS.map((row) => <Row key={row[0]} row={row} />)}
              </div>
            </div>

            {/* B · Carte résultat « Soldes justifiés » (chevauche la fenêtre) */}
            <div className="pm-result">
              <span className="ic">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              </span>
              <div>
                <div className="t1">Soldes justifiés</div>
                <div className="t2">24 rubriques pointées · <span className="warn">1 écart à traiter</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
