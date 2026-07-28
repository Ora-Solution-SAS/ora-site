import { useEffect, useRef } from "react";
import { useEnterOnScroll } from "@/lib/useEnterOnScroll";

/**
 * PointageMockup — visual for the "Pointage de comptes" use-case card.
 *
 * Redesigned 2026-07-27: the previous version was a single balance-sheet
 * table with a green tick on each row, which showed the RESULT but not the
 * work. This one shows the reconciliation itself — the two sources side by
 * side, linked line by line:
 *   · left  : the client's PDF annual accounts (Comptes_sociaux_2025),
 *   · right : the Ora window on the FEC balance,
 *   · between: a link per rubric, ticked green when the two sides agree and
 *     amber on the single one that does not — the eye goes straight to it,
 *   · a floating tally pill « 24 / 25 rubriques justifiées · 1 écart ».
 *
 * Same fixed-stage pattern as the other Ora mockups (1040×580 scene scaled by
 * a ResizeObserver, `.pm-` scoped classes, no external assets), and the same
 * staged entrance as the Sur-mesure / Local visuals.
 */

/** [rubric, PDF amount, FEC amount, matched?] — one row per link. */
const ROWS: [string, string, string, boolean][] = [
  ["Terrains & constructions", "693", "693", true],
  ["Installations techniques", "636", "636", true],
  ["Immobilisations financières", "58", "58", true],
  ["Stocks & en-cours", "412", "466", false],
  ["Clients & comptes rattachés", "981", "981", true],
];

const PM_CSS = `
/* ══ Visuel « Pointage de comptes » — PDF comptes sociaux ⇄ FEC ══ */
/* Transparent : la composition flotte sur le bleu de la carte. Pas
   d'overflow:hidden : il trancherait les ombres au bord de la zone média
   (démarcation verticale nette). C'est l'overflow-hidden + coins arrondis de
   la CARTE qui rognent proprement en bas. */
.pm-media{position:relative;aspect-ratio:1040/580;isolation:isolate;background:transparent}
.pm-fit{position:absolute;inset:0;z-index:1}
.pm-stage{position:absolute;left:50%;top:0;width:1040px;height:580px;
  transform-origin:top center;
  font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  color:#111827;-webkit-font-smoothing:antialiased}

/* halo doux derrière la scène */
.pm-blob{position:absolute;z-index:0;left:300px;top:40px;width:520px;height:520px;
  border-radius:50%;
  background:radial-gradient(circle at 45% 35%,rgba(255,255,255,.28),rgba(255,255,255,.10) 55%,transparent 74%)}

/* ── Bandeau d'automatisation, en haut ── */
.pm-bar{position:absolute;z-index:4;left:96px;top:34px;display:flex;align-items:center;gap:9px}
.pm-tag{display:inline-flex;align-items:center;gap:7px;height:34px;padding:0 14px;
  border-radius:10px;background:#fff;font-size:12.5px;font-weight:700;color:#1e3a8a;
  box-shadow:0 8px 22px -10px rgba(15,23,42,.45)}
.pm-tag .sw{color:#2563eb}
.pm-auto{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 12px;
  border-radius:10px;background:rgba(255,255,255,.16);
  font-size:12px;font-weight:700;color:#fff}
.pm-auto .dot{width:7px;height:7px;border-radius:50%;background:#4ade80}

/* ── Document PDF (gauche) ── */
.pm-doc{position:absolute;z-index:2;left:52px;top:96px;width:322px;
  background:#fff;border-radius:14px;overflow:hidden;
  box-shadow:0 2px 6px rgba(15,23,42,.16),0 26px 60px -22px rgba(15,23,42,.5)}
.pm-dochead{display:flex;align-items:center;gap:9px;padding:14px 16px;
  border-bottom:1px solid #f1f3f7}
.pm-pdficon{width:26px;height:32px;position:relative;flex-shrink:0;background:#fff;
  border:1px solid #f3d4d4;border-radius:4px;overflow:hidden}
.pm-pdficon::before{content:'';position:absolute;inset:0;
  background:linear-gradient(180deg,#fdeaea,#fff 62%)}
.pm-pdficon::after{content:'PDF';position:absolute;left:0;right:0;bottom:3px;text-align:center;
  font-size:7px;font-weight:800;color:#dc2626}
.pm-dochead .t1{font-size:12.5px;font-weight:700}
.pm-dochead .t2{font-size:10px;color:#9ca3af;margin-top:2px}
.pm-docsub{font-size:9px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;
  color:#9ca3af;padding:11px 16px 6px}

/* ── Fenêtre Ora (droite) ── */
/* top calé pour que la 1re ligne de la fenêtre tombe exactement à la même
   hauteur que la 1re ligne du PDF : c'est cet alignement qui fait lire le
   rapprochement « ligne à ligne » (mesuré, pas estimé). */
.pm-win{position:absolute;z-index:2;left:600px;top:123px;width:392px;
  background:#fff;border-radius:12px;overflow:hidden;
  box-shadow:0 2px 6px rgba(15,23,42,.16),0 26px 64px -22px rgba(15,23,42,.5)}
.pm-titlebar{position:relative;display:flex;align-items:center;height:36px;
  background:linear-gradient(#fbfbfa,#f4f4f3);border-bottom:1px solid #e6e6e3}
.pm-lights{display:flex;gap:7px;padding:0 12px}
.pm-lights span{width:11px;height:11px;border-radius:50%}
.pm-lights .r{background:#ff5f57}.pm-lights .y{background:#febc2e}.pm-lights .g{background:#28c840}
.pm-tbtitle{position:absolute;left:0;right:0;text-align:center;font-size:11.5px;
  font-weight:600;color:#4b5563}
.pm-winsub{font-size:9px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;
  color:#9ca3af;padding:12px 16px 6px}

/* ── Lignes des deux côtés (même hauteur pour que le lien soit droit) ── */
.pm-row{display:flex;align-items:center;gap:10px;height:44px;padding:0 16px;
  border-top:1px solid #f4f5f8;font-size:12px}
.pm-row .lbl{flex:1;min-width:0;color:#1f2937;white-space:nowrap;overflow:hidden;
  text-overflow:ellipsis}
.pm-row .val{font-weight:700;font-variant-numeric:tabular-nums}
.pm-row.ok .val{color:#111827}
.pm-row.ko .val{color:#b45309}
.pm-row.ko{background:#fffbeb}

/* ── Liens de rapprochement ── */
.pm-links{position:absolute;z-index:3;left:0;top:0;width:1040px;height:580px;
  pointer-events:none}
.pm-badge{position:absolute;z-index:5;width:26px;height:26px;border-radius:50%;
  display:grid;place-items:center;
  box-shadow:0 4px 12px -3px rgba(15,23,42,.4)}
.pm-badge.ok{background:#10b981;color:#fff}
.pm-badge.ko{background:#f59e0b;color:#fff}

/* ── Pastille de résultat ── */
.pm-tally{position:absolute;z-index:6;left:52px;bottom:34px;
  display:flex;align-items:center;gap:11px;background:#fff;border-radius:14px;
  padding:12px 16px;box-shadow:0 16px 40px -14px rgba(15,23,42,.5)}
.pm-tally .ic{width:32px;height:32px;border-radius:10px;flex-shrink:0;
  background:#ecfdf5;color:#059669;display:grid;place-items:center}
.pm-tally .t1{font-size:13px;font-weight:700;color:#111827;white-space:nowrap}
.pm-tally .t2{font-size:10.5px;color:#6b7280;margin-top:2px;white-space:nowrap}
.pm-tally .t2 b{color:#b45309;font-weight:700}

/* ══ Arrivée au scroll (même signature que les autres visuels) ══
   L'état masqué n'est posé que sous .pm-armed, classe ajoutée par le JS
   seulement s'il peut animer : sans JS ou en mouvement réduit, tout
   s'affiche normalement. */
.pm-armed .pm-doc,.pm-armed .pm-win,.pm-armed .pm-bar,
.pm-armed .pm-tally,.pm-armed .pm-badge{opacity:0}
.pm-armed .pm-linkline{stroke-dashoffset:120}

@keyframes pmDoc{from{opacity:0;transform:translate3d(-38px,14px,0)}to{opacity:1;transform:none}}
@keyframes pmWin{from{opacity:0;transform:translate3d(34px,18px,0)}to{opacity:1;transform:none}}
@keyframes pmUp{from{opacity:0;transform:translate3d(0,16px,0)}to{opacity:1;transform:none}}
@keyframes pmPop{0%{opacity:0;transform:scale(.4)}60%{opacity:1;transform:scale(1.22)}
  100%{opacity:1;transform:scale(1)}}
@keyframes pmDraw{to{stroke-dashoffset:0}}

.pm-in .pm-bar{animation:pmUp 620ms cubic-bezier(.22,1,.36,1) 60ms both}
.pm-in .pm-doc{animation:pmDoc 760ms cubic-bezier(.22,1,.36,1) 140ms both}
.pm-in .pm-win{animation:pmWin 760ms cubic-bezier(.22,1,.36,1) 260ms both}
/* les liens se tracent du PDF vers la fenêtre, l'un après l'autre */
.pm-in .pm-linkline{animation:pmDraw 420ms cubic-bezier(.4,0,.2,1) both}
.pm-in .pm-l1{animation-delay:520ms}
.pm-in .pm-l2{animation-delay:600ms}
.pm-in .pm-l3{animation-delay:680ms}
.pm-in .pm-l4{animation-delay:760ms}
.pm-in .pm-l5{animation-delay:840ms}
/* puis la pastille de chaque ligne éclate */
.pm-in .pm-b1{animation:pmPop 420ms cubic-bezier(.2,1.5,.4,1) 800ms both}
.pm-in .pm-b2{animation:pmPop 420ms cubic-bezier(.2,1.5,.4,1) 880ms both}
.pm-in .pm-b3{animation:pmPop 420ms cubic-bezier(.2,1.5,.4,1) 960ms both}
.pm-in .pm-b4{animation:pmPop 460ms cubic-bezier(.2,1.6,.4,1) 1040ms both}
.pm-in .pm-b5{animation:pmPop 420ms cubic-bezier(.2,1.5,.4,1) 1120ms both}
.pm-in .pm-tally{animation:pmUp 600ms cubic-bezier(.2,1.4,.4,1) 1220ms both}

@media (prefers-reduced-motion:reduce){
  .pm-armed .pm-doc,.pm-armed .pm-win,.pm-armed .pm-bar,
  .pm-armed .pm-tally,.pm-armed .pm-badge{opacity:1}
  .pm-armed .pm-linkline{stroke-dashoffset:0}
}
`;

/** Vertical centre of link i, in stage coordinates (matches the measured
 *  centre of the rows on both sides). */
const rowY = (i: number) => 213 + i * 44;

export default function PointageMockup() {
  const stageRef = useRef<HTMLDivElement>(null);
  const { ref: mediaRef, entered: playing, armed } = useEnterOnScroll<HTMLDivElement>();

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
  }, [mediaRef]);

  return (
    <>
      <style>{PM_CSS}</style>
      <div
        className={`pm-media${armed ? " pm-armed" : ""}${playing ? " pm-in" : ""}`}
        ref={mediaRef}
      >
        <div className="pm-fit">
          <div className="pm-stage" ref={stageRef}>
            <div className="pm-blob" />

            {/* Bandeau : l'automatisation qui tourne */}
            <div className="pm-bar">
              <span className="pm-tag">
                <svg className="sw" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3 4 7l4 4" /><path d="M4 7h16" /><path d="m16 21 4-4-4-4" /><path d="M20 17H4" /></svg>
                Pointage comptes sociaux ⇄ FEC
              </span>
              <span className="pm-auto"><span className="dot" />Auto</span>
            </div>

            {/* Gauche : le PDF du client */}
            <div className="pm-doc">
              <div className="pm-dochead">
                <span className="pm-pdficon" />
                <div>
                  <div className="t1">Comptes_sociaux_2025.pdf</div>
                  <div className="t2">SARL Woippy Protection · bilan actif</div>
                </div>
              </div>
              <div className="pm-docsub">Déclaré</div>
              {ROWS.map(([label, pdf], i) => (
                <div className={`pm-row ${ROWS[i][3] ? "ok" : "ko"}`} key={label}>
                  <span className="lbl">{label}</span>
                  <span className="val">{pdf}</span>
                </div>
              ))}
            </div>

            {/* Liens de rapprochement entre les deux sources */}
            <svg className="pm-links" viewBox="0 0 1040 580" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              {ROWS.map(([label, , , ok], i) => {
                const y = rowY(i);
                return (
                  <path
                    key={label}
                    className={`pm-linkline pm-l${i + 1}`}
                    d={`M 374 ${y} H 600`}
                    fill="none"
                    stroke={ok ? "rgba(255,255,255,.75)" : "rgba(253,224,71,.95)"}
                    strokeWidth={ok ? 1.8 : 2.4}
                    strokeLinecap="round"
                    strokeDasharray="120"
                  />
                );
              })}
            </svg>

            {/* Pastille de rapprochement au milieu de chaque lien */}
            {ROWS.map(([label, , , ok], i) => (
              <span
                key={label}
                className={`pm-badge pm-b${i + 1} ${ok ? "ok" : "ko"}`}
                style={{ left: 474, top: rowY(i) - 13 }}
              >
                {ok ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>
                )}
              </span>
            ))}

            {/* Droite : la fenêtre Ora sur le FEC */}
            <div className="pm-win">
              <div className="pm-titlebar">
                <div className="pm-lights"><span className="r" /><span className="y" /><span className="g" /></div>
                <div className="pm-tbtitle">Ora · Balance FEC 2025</div>
              </div>
              <div className="pm-winsub">Comptabilisé</div>
              {ROWS.map(([label, , fec, ok], i) => (
                <div className={`pm-row ${ok ? "ok" : "ko"}`} key={label + i}>
                  <span className="lbl">{label}</span>
                  <span className="val">{fec}</span>
                </div>
              ))}
            </div>

            {/* Résultat du pointage */}
            <div className="pm-tally">
              <span className="ic">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              </span>
              <div>
                <div className="t1">24 / 25 rubriques justifiées</div>
                <div className="t2">Pointage automatique · <b>1 écart à traiter</b></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
