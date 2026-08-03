import { useEffect, useRef } from "react";
import { useLang } from "@/lib/i18n";
import { useEnterOnScroll } from "@/lib/useEnterOnScroll";

/**
 * EvaluationMockup — visual for the "Évaluation financière" use-case card.
 *
 * One idea: from the company's own figures and sector comparables, Ora lays
 * out a defensible valuation range. The composition:
 *   · left: a white "Comparables" card listing sector multiples with the
 *     median highlighted, plus a chip with the restated EBITDA input,
 *   · right: the Ora window with the valuation itself: the big central value
 *     in the brand gradient, the range gauge with its low/high bounds, and
 *     the two method rows that justify the number.
 *
 * The figures are deliberately consistent with one another (0,9 M€ × 5,1 =
 * 4,6 M€, bounds ×4,8 → 4,3 and ×5,4 → 4,9): the scene must survive a
 * finance-literate reader.
 *
 * Same fixed-stage pattern as the other Ora mockups: 1040×640 scene scaled by
 * a ResizeObserver, `.ev-` scoped classes, no external assets, one-shot
 * entrance via useEnterOnScroll, disabled under prefers-reduced-motion.
 *
 * MOBILE: the two message-carrying labels (headline 40px, value 68px) stay
 * ≥ 11px on a 375px-wide screen. The comparables are texture.
 */

/** [company, multiple as a FR decimal] — sector comparables, median
 *  highlighted separately; the EN render swaps the decimal comma for a dot. */
const COMPS: [string, string][] = [
  ["Groupe Ardan", "4,8"],
  ["Nexo Services", "5,4"],
  ["Alba & Cie", "5,1"],
];

const EV_CSS = `
/* ══ Visuel « Évaluation financière » — comparables → fourchette ══ */
/* Transparent : la composition flotte sur le vert d'eau de la carte. Pas
   d'overflow:hidden ici : il trancherait les ombres au bord de la zone média.
   C'est l'overflow-hidden + coins arrondis de la CARTE qui rognent en bas. */
.ev-media{position:relative;aspect-ratio:1040/640;isolation:isolate;background:transparent}
.ev-fit{position:absolute;inset:0;z-index:1}
.ev-stage{position:absolute;left:50%;top:0;width:1040px;height:640px;
  transform-origin:top center;
  font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  color:#111827;-webkit-font-smoothing:antialiased}
.ev-blob{position:absolute;z-index:0;left:300px;top:60px;width:560px;height:560px;
  border-radius:50%;
  background:radial-gradient(circle at 45% 35%,rgba(255,255,255,.75),rgba(255,255,255,.30) 55%,transparent 75%)}
/* ── Carte « Comparables » (gauche) ── */
.ev-comp{position:absolute;z-index:2;left:48px;top:126px;width:300px;
  background:#fff;border-radius:14px;overflow:hidden;
  box-shadow:0 2px 6px rgba(15,23,42,.14),0 26px 60px -22px rgba(15,23,42,.4)}
.ev-comphead{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid #f1f3f7}
.ev-comphead .ic{width:30px;height:30px;border-radius:9px;flex-shrink:0;
  background:#eff6ff;color:#2563eb;display:grid;place-items:center}
.ev-comphead .t1{font-size:13.5px;font-weight:700;color:#111827}
.ev-comphead .t2{font-size:10.5px;color:#9ca3af;margin-top:2px}
.ev-crow{display:flex;align-items:center;justify-content:space-between;gap:10px;
  height:42px;padding:0 16px;border-top:1px solid #f4f5f8;font-size:12.5px}
.ev-crow .n{color:#1f2937;font-weight:600}
.ev-crow .m{font-weight:700;font-variant-numeric:tabular-nums;color:#374151}
.ev-crow.med{background:#f0fdfa}
.ev-crow.med .n{color:#0f766e}
.ev-crow.med .m{color:#0d9488}
/* ── Chip EBE (l'entrée du calcul) ── */
.ev-ebe{position:absolute;z-index:3;left:48px;top:472px;display:flex;align-items:center;gap:11px;
  background:#fff;border-radius:13px;padding:12px 15px;
  box-shadow:0 18px 44px -12px rgba(15,23,42,.4)}
.ev-ebe .ic{width:32px;height:32px;border-radius:9px;flex-shrink:0;
  background:#ecfdf5;color:#059669;display:grid;place-items:center}
.ev-ebe .t1{font-size:12.5px;font-weight:700;color:#111827;white-space:nowrap}
.ev-ebe .t2{font-size:10.5px;color:#9ca3af;margin-top:2px;white-space:nowrap}
.ev-ebe .v{font-size:16px;font-weight:700;color:#111827;margin-left:8px;white-space:nowrap}
/* ── Fenêtre Ora : la valorisation (droite) ── */
.ev-win{position:absolute;z-index:2;left:396px;top:88px;width:592px;height:590px;
  background:#fff;border-radius:12px;overflow:hidden;
  box-shadow:0 1px 2px rgba(0,0,0,.25),0 26px 70px -18px rgba(15,23,42,.42),0 60px 130px -40px rgba(15,23,42,.38)}
.ev-titlebar{position:relative;display:flex;align-items:center;height:40px;
  background:linear-gradient(#fbfbfa,#f4f4f3);border-bottom:1px solid #e3e3e0}
.ev-lights{display:flex;gap:8px;padding:0 14px}
.ev-lights span{width:12px;height:12px;border-radius:50%}
.ev-lights .r{background:#ff5f57;border:.5px solid #e0443e}
.ev-lights .y{background:#febc2e;border:.5px solid #d89c22}
.ev-lights .g{background:#28c840;border:.5px solid #1eaa33}
.ev-tbtitle{position:absolute;left:0;right:0;display:flex;align-items:center;justify-content:center;gap:7px;
  font-size:12.5px;font-weight:600;color:#4b5563}
.ev-xicon{width:15px;height:15px;border-radius:3px;background:#217346;color:#fff;
  display:grid;place-items:center;font-size:9px;font-weight:800}
/* barre de formule Excel : la valorisation est une feuille de calcul */
.ev-xlbar{display:flex;align-items:center;height:26px;margin:14px 34px 0;
  border:1px solid #e3e6ea;border-radius:5px;overflow:hidden;font-size:11px;color:#3f3f3f}
.ev-xlname{width:50px;text-align:center;line-height:26px;border-right:1px solid #e3e6ea;background:#f7f7f7;font-weight:600}
.ev-xlfx{width:26px;text-align:center;line-height:26px;border-right:1px solid #e3e6ea;color:#9a9a9a;font-style:italic;font-family:Georgia,serif}
.ev-xlformula{padding-left:10px;color:#555;white-space:nowrap}
.ev-body{padding:20px 34px 0}
/* Libellé porteur n°1 : 40px dans le repère 1040, donc ≥ 11px à 375px. */
.ev-head{display:flex;align-items:center;gap:14px}
.ev-head .h{font-size:40px;font-weight:700;letter-spacing:-.02em;color:#111827}
.ev-auto{display:inline-flex;align-items:center;gap:6px;margin-left:auto;
  font-size:12px;font-weight:700;color:#059669;white-space:nowrap}
.ev-auto .dot{width:8px;height:8px;border-radius:50%;background:#059669;box-shadow:0 0 0 3px rgba(5,150,105,.16)}
/* Libellé porteur n°2 : 68px dans le repère 1040. */
.ev-val{font-size:68px;font-weight:700;letter-spacing:-.03em;margin-top:4px;
  background:linear-gradient(to right,#3b82f6,#0d9488);
  -webkit-background-clip:text;background-clip:text;color:transparent}
.ev-range{font-size:20px;font-weight:600;color:#6b7280;margin-top:2px}
/* ── Jauge de fourchette ── */
.ev-gauge{position:relative;margin-top:34px;height:14px;border-radius:7px;background:#eef2f7}
.ev-fill{position:absolute;left:25%;width:50%;top:0;bottom:0;border-radius:7px;
  background:linear-gradient(to right,#3b82f6,#0d9488);transform-origin:left center}
.ev-marker{position:absolute;left:50%;top:50%;width:26px;height:26px;margin:-13px 0 0 -13px;
  border-radius:50%;background:#fff;border:5px solid #0d9488;
  box-shadow:0 4px 14px -2px rgba(15,23,42,.35)}
.ev-bounds{position:relative;margin-top:12px;height:20px;
  font-size:15px;font-weight:600;color:#9ca3af}
.ev-bounds .lo{position:absolute;left:25%;transform:translateX(-50%)}
.ev-bounds .hi{position:absolute;left:75%;transform:translateX(-50%)}
/* ── Pastille du livrable généré (comble le bas de la fenêtre) ── */
.ev-pdftag{position:absolute;z-index:4;left:648px;top:552px;display:flex;align-items:center;gap:9px;
  background:#fff;border-radius:11px;padding:9px 13px;
  box-shadow:0 12px 34px -10px rgba(15,23,42,.35);border:1px solid #f1f3f7}
.ev-pdftag .ico{width:26px;height:32px;position:relative;background:#fff;border:1px solid #f1d4d4;
  border-radius:4px;overflow:hidden;flex-shrink:0}
.ev-pdftag .ico::before{content:'';position:absolute;inset:0;background:linear-gradient(180deg,#fdeaea,#fff 60%)}
.ev-pdftag .ico::after{content:'PDF';position:absolute;left:0;right:0;bottom:3px;text-align:center;
  font-size:7.5px;font-weight:800;color:#dc2626}
.ev-pdftag .t1{font-size:11px;font-weight:700;color:#111827;white-space:nowrap}
.ev-pdftag .t2{font-size:9.5px;color:#9ca3af;margin-top:1px;white-space:nowrap}
/* ── Lignes de méthode ── */
.ev-methods{margin-top:26px;display:flex;flex-direction:column;gap:13px}
.ev-mrow{display:flex;align-items:center;gap:10px;font-size:14px;font-weight:600;color:#374151}
.ev-mrow .ck{width:22px;height:22px;border-radius:50%;flex-shrink:0;
  background:#f0fdfa;color:#0d9488;display:grid;place-items:center}

/* ══ Arrivée au scroll (même signature que les autres visuels) ══ */
.ev-armed .ev-comp,.ev-armed .ev-ebe,.ev-armed .ev-win,.ev-armed .ev-pdftag{opacity:0}
.ev-armed .ev-fill{transform:scaleX(0)}
.ev-armed .ev-marker,.ev-armed .ev-mrow{opacity:0}

@keyframes evUp{from{opacity:0;transform:translate3d(0,20px,0)}to{opacity:1;transform:none}}
@keyframes evLeft{from{opacity:0;transform:translate3d(-32px,12px,0)}to{opacity:1;transform:none}}
@keyframes evPop{0%{opacity:0;transform:scale(.55)}60%{opacity:1;transform:scale(1.12)}
  100%{opacity:1;transform:scale(1)}}
@keyframes evGrow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes evFade{from{opacity:0;transform:translate3d(0,8px,0)}to{opacity:1;transform:none}}

.ev-in .ev-win{animation:evUp 680ms cubic-bezier(.22,1,.36,1) 60ms both}
.ev-in .ev-comp{animation:evLeft 720ms cubic-bezier(.22,1,.36,1) 220ms both}
.ev-in .ev-ebe{animation:evLeft 640ms cubic-bezier(.22,1,.36,1) 380ms both}
.ev-in .ev-pdftag{animation:evUp 520ms cubic-bezier(.22,1,.36,1) 1420ms both}
.ev-in .ev-fill{animation:evGrow 640ms cubic-bezier(.22,1,.36,1) 620ms both}
.ev-in .ev-marker{animation:evPop 460ms cubic-bezier(.2,1.5,.4,1) 1080ms both}
.ev-in .ev-mrow.m1{animation:evFade 480ms cubic-bezier(.22,1,.36,1) 1220ms both}
.ev-in .ev-mrow.m2{animation:evFade 480ms cubic-bezier(.22,1,.36,1) 1320ms both}

@media (prefers-reduced-motion:reduce){
  .ev-armed .ev-comp,.ev-armed .ev-ebe,.ev-armed .ev-win,
  .ev-armed .ev-marker,.ev-armed .ev-mrow,.ev-armed .ev-pdftag{opacity:1}
  .ev-armed .ev-fill{transform:none}
}
`;

export default function EvaluationMockup() {
  const { t } = useLang();
  const stageRef = useRef<HTMLDivElement>(null);
  const { ref: mediaRef, entered: playing, armed } = useEnterOnScroll<HTMLDivElement>();

  useEffect(() => {
    const media = mediaRef.current;
    const stage = stageRef.current;
    if (!media || !stage) return;
    const W = 1040, H = 640;
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
      <style>{EV_CSS}</style>
      <div
        className={`ev-media${armed ? " ev-armed" : ""}${playing ? " ev-in" : ""}`}
        ref={mediaRef}
      >
        <div className="ev-fit">
          <div className="ev-stage" ref={stageRef}>
            <div className="ev-blob" />

            {/* A · Comparables du secteur, médiane en évidence */}
            <div className="ev-comp">
              <div className="ev-comphead">
                <span className="ic">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" /></svg>
                </span>
                <div>
                  <div className="t1">{t({ fr: "Comparables", en: "Comparables" })}</div>
                  <div className="t2">{t({ fr: "Transactions du secteur", en: "Sector transactions" })}</div>
                </div>
              </div>
              {COMPS.map(([name, mult]) => (
                <div className="ev-crow" key={name}>
                  <span className="n">{name}</span>
                  <span className="m">{t({ fr: `×${mult}`, en: `×${mult.replace(",", ".")}` })}</span>
                </div>
              ))}
              <div className="ev-crow med">
                <span className="n">{t({ fr: "Médiane secteur", en: "Sector median" })}</span>
                <span className="m">{t({ fr: "×5,1", en: "×5.1" })}</span>
              </div>
            </div>

            {/* B · L'entrée du calcul : l'EBE retraité */}
            <div className="ev-ebe">
              <span className="ic">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M8 6h8" /><path d="M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h.01M16 19h.01" /></svg>
              </span>
              <div>
                <div className="t1">{t({ fr: "EBE retraité", en: "Restated EBITDA" })}</div>
                <div className="t2">Liasse_2025.pdf</div>
              </div>
              <span className="v">{t({ fr: "0,9 M€", en: "0.9 M€" })}</span>
            </div>

            {/* C · Fenêtre Ora : la valorisation et sa fourchette */}
            <div className="ev-win">
              <div className="ev-titlebar">
                <div className="ev-lights"><span className="r" /><span className="y" /><span className="g" /></div>
                <div className="ev-tbtitle">
                  <span className="ev-xicon">X</span>
                  Evaluation_Bardin.xlsx · Ora
                </div>
              </div>
              <div className="ev-xlbar">
                <span className="ev-xlname">B8</span>
                <span className="ev-xlfx">fx</span>
                <span className="ev-xlformula">{t({ fr: "=EBE_retraité*Médiane_secteur", en: "=Restated_EBITDA*Sector_median" })}</span>
              </div>
              <div className="ev-body">
                <div className="ev-head">
                  <span className="h">{t({ fr: "Valorisation", en: "Valuation" })}</span>
                  <span className="ev-auto"><span className="dot" />{t({ fr: "Automatisé", en: "Automated" })}</span>
                </div>
                <div className="ev-val">{t({ fr: "4,6 M€", en: "4.6 M€" })}</div>
                <div className="ev-range">{t({ fr: "Fourchette : 4,3 à 4,9 M€", en: "Range: 4.3 to 4.9 M€" })}</div>

                <div className="ev-gauge">
                  <div className="ev-fill" />
                  <div className="ev-marker" />
                </div>
                <div className="ev-bounds">
                  <span className="lo">{t({ fr: "4,3 M€", en: "4.3 M€" })}</span>
                  <span className="hi">{t({ fr: "4,9 M€", en: "4.9 M€" })}</span>
                </div>

                <div className="ev-methods">
                  <div className="ev-mrow m1">
                    <span className="ck">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                    </span>
                    {t({ fr: "Multiple d'EBE · ×5,1", en: "EBITDA multiple · ×5.1" })}
                  </div>
                  <div className="ev-mrow m2">
                    <span className="ck">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                    </span>
                    {t({ fr: "3 comparables du secteur", en: "3 sector comparables" })}
                  </div>
                </div>
              </div>
            </div>

            {/* D · Le livrable généré, en pied de fenêtre */}
            <div className="ev-pdftag">
              <div className="ico" />
              <div>
                <div className="t1">Note_valorisation.pdf</div>
                <div className="t2">{t({ fr: "Généré par Ora · 92 Ko", en: "Generated by Ora · 92 KB" })}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
