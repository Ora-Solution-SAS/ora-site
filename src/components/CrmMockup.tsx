import { useEffect, useRef, Fragment } from "react";
import { useLang } from "@/lib/i18n";
import { useEnterOnScroll } from "@/lib/useEnterOnScroll";

/**
 * CrmMockup — visual for the "Connectivité CRM" use-case card.
 *
 * One idea: the deals living in the CRM land, line by line, in the Excel
 * follow-up file. The composition:
 *   · left: a generic CRM panel (no vendor named, same rule as the
 *     "Formatage" card) listing four deals with amount and stage,
 *   · right: the Ora window on the Excel follow-up sheet, the same four
 *     rows plus their total,
 *   · between: one link per deal, drawn left to right, with the big
 *     "Connecté au CRM" pill on top and a tally card at the bottom.
 *
 * Same fixed-stage pattern as the other Ora mockups: 1040×640 scene scaled by
 * a ResizeObserver, `.cm-` scoped classes, no external assets, one-shot
 * entrance via useEnterOnScroll, disabled under prefers-reduced-motion.
 *
 * MOBILE: the two message-carrying labels (pill 42px, tally 40px) stay
 * ≥ 11px on a 375px-wide screen. The deal rows are texture.
 */

/** [client, amount, stage] — stage drives the pill colour on both sides. */
type Stage = "won" | "proposal" | "nego";
const DEALS: [string, string, Stage][] = [
  ["Sofratel", "18 400 €", "won"],
  ["Atelier Roux", "9 750 €", "won"],
  ["Cabinet Lemaire", "12 300 €", "proposal"],
  ["Groupe Vanel", "27 000 €", "nego"],
];
const TOTAL = "67 450 €";

// Row centres in stage coordinates, measured from the CSS layout below:
// CRM card top 120 + header 64, rows 48 high; sheet top 104 + titlebar 40 +
// padding 12 + letters 20 + header 30, rows 34 high.
const crmRowY = (i: number) => 120 + 64 + 48 * i + 24;
const xlRowY = (i: number) => 104 + 40 + 12 + 20 + 30 + 34 * i + 17;

const CM_CSS = `
/* ══ Visuel « Connectivité CRM » — le pipeline qui alimente Excel ══ */
/* Transparent : la composition flotte sur le bleu pervenche de la carte. Pas
   d'overflow:hidden ici : il trancherait les ombres au bord de la zone média.
   C'est l'overflow-hidden + coins arrondis de la CARTE qui rognent en bas. */
.cm-media{position:relative;aspect-ratio:1040/640;isolation:isolate;background:transparent}
.cm-fit{position:absolute;inset:0;z-index:1}
.cm-stage{position:absolute;left:50%;top:0;width:1040px;height:640px;
  transform-origin:top center;
  font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  color:#111827;-webkit-font-smoothing:antialiased}
.cm-blob{position:absolute;z-index:0;left:280px;top:70px;width:560px;height:560px;
  border-radius:50%;
  background:radial-gradient(circle at 45% 35%,rgba(255,255,255,.75),rgba(255,255,255,.30) 55%,transparent 75%)}
/* ── Panneau CRM (gauche, éditeur générique) ── */
.cm-crm{position:absolute;z-index:2;left:44px;top:120px;width:330px;
  background:#fff;border-radius:14px;overflow:hidden;
  box-shadow:0 2px 6px rgba(15,23,42,.14),0 26px 60px -22px rgba(15,23,42,.42)}
.cm-crmhead{display:flex;align-items:center;gap:10px;height:64px;padding:0 16px;
  border-bottom:1px solid #f1f3f7}
.cm-logo{width:30px;height:30px;border-radius:9px;flex-shrink:0;
  background:#eff6ff;display:grid;grid-template-columns:repeat(2,7px);
  grid-template-rows:repeat(2,7px);gap:3px;place-content:center}
.cm-logo span{border-radius:2.5px;background:#2563eb}
.cm-logo span:nth-child(2){background:#60a5fa}
.cm-logo span:nth-child(3){background:#60a5fa}
.cm-crmhead .t1{font-size:13.5px;font-weight:700;color:#111827}
.cm-crmhead .t2{font-size:10.5px;color:#9ca3af;margin-top:2px}
.cm-drow{display:flex;align-items:center;gap:8px;height:48px;padding:0 16px;
  border-top:1px solid #f4f5f8}
.cm-drow .n{flex:1;min-width:0;font-size:12.5px;font-weight:600;color:#1f2937;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cm-drow .a{font-size:12.5px;font-weight:700;color:#111827;font-variant-numeric:tabular-nums;white-space:nowrap}
.cm-pill{font-size:10px;font-weight:700;border-radius:999px;padding:3px 8px;white-space:nowrap}
.cm-pill.won{background:#ecfdf5;color:#059669}
.cm-pill.proposal{background:#eff6ff;color:#2563eb}
.cm-pill.nego{background:#fffbeb;color:#b45309}
/* ── Fenêtre Ora : la feuille de suivi (droite) ── */
.cm-win{position:absolute;z-index:2;left:620px;top:104px;width:376px;height:576px;
  background:#fff;border-radius:12px;overflow:hidden;
  box-shadow:0 1px 2px rgba(0,0,0,.25),0 26px 70px -18px rgba(15,23,42,.42),0 60px 130px -40px rgba(15,23,42,.38)}
.cm-titlebar{position:relative;display:flex;align-items:center;height:40px;
  background:linear-gradient(#fbfbfa,#f4f4f3);border-bottom:1px solid #e3e3e0}
.cm-lights{display:flex;gap:8px;padding:0 14px}
.cm-lights span{width:12px;height:12px;border-radius:50%}
.cm-lights .r{background:#ff5f57;border:.5px solid #e0443e}
.cm-lights .y{background:#febc2e;border:.5px solid #d89c22}
.cm-lights .g{background:#28c840;border:.5px solid #1eaa33}
.cm-tbtitle{position:absolute;left:0;right:0;display:flex;align-items:center;justify-content:center;gap:7px;
  font-size:12.5px;font-weight:600;color:#4b5563}
.cm-xicon{width:15px;height:15px;border-radius:3px;background:#217346;color:#fff;
  display:grid;place-items:center;font-size:9px;font-weight:800}
.cm-body{padding:12px 14px 0}
.cm-xl{border:1px solid #cfcfcf;border-radius:5px;overflow:hidden}
.cm-xlgrid{display:grid;grid-template-columns:1.4fr 1fr .95fr;font-size:11.5px}
.cm-xlL{height:20px;background:#f5f5f5;color:#7a7a7a;text-align:center;font-weight:600;
  font-size:10.5px;line-height:20px;border-right:1px solid #dcdcdc;border-bottom:1px solid #dcdcdc}
.cm-xlH{height:30px;display:flex;align-items:center;background:#e2efda;color:#3f6b2b;font-weight:700;
  padding:0 9px;border-right:1px solid #cfe0c4;border-bottom:1px solid #cfe0c4;white-space:nowrap}
.cm-xlH.num{justify-content:flex-end}
.cm-xlC{height:34px;display:flex;align-items:center;background:#fff;color:#353535;
  padding:0 9px;border-right:1px solid #ececec;border-bottom:1px solid #ececec;
  white-space:nowrap;overflow:hidden}
.cm-xlC.num{justify-content:flex-end;font-variant-numeric:tabular-nums}
.cm-xlC.name{font-weight:600;color:#1f1f1f}
.cm-xlC .st{font-size:10px;font-weight:700}
.cm-xlC .st.won{color:#059669}
.cm-xlC .st.proposal{color:#2563eb}
.cm-xlC .st.nego{color:#b45309}
.cm-xlT{height:34px;display:flex;align-items:center;background:#f2f8f1;color:#245a2e;font-weight:700;
  padding:0 9px;border-right:1px solid #e2eede;border-top:1px solid #b7d3ab;white-space:nowrap}
.cm-xlT.num{justify-content:flex-end;font-variant-numeric:tabular-nums}
/* ── Liens CRM → Excel ── */
.cm-links{position:absolute;z-index:3;left:0;top:0;width:1040px;height:640px;pointer-events:none}
.cm-dot{position:absolute;z-index:4;width:22px;height:22px;border-radius:50%;
  background:#3b82f6;color:#fff;display:grid;place-items:center;
  box-shadow:0 4px 12px -3px rgba(15,23,42,.4)}
/* ── Pastille porteuse « Connecté au CRM » ── */
/* Libellé porteur n°1 : 42px dans le repère 1040, donc ≥ 11px à 375px. */
.cm-conn{position:absolute;z-index:5;left:266px;top:22px;display:inline-flex;align-items:center;gap:16px;
  height:84px;padding:0 32px;border-radius:999px;background:#fff;
  box-shadow:0 2px 6px rgba(15,23,42,.14),0 26px 64px -18px rgba(15,23,42,.45)}
.cm-conn .ic{width:46px;height:46px;border-radius:50%;flex-shrink:0;color:#fff;
  background:linear-gradient(135deg,#3b82f6,#0d9488);display:grid;place-items:center}
.cm-conn .t{font-size:42px;font-weight:700;letter-spacing:-.02em;color:#111827;white-space:nowrap}
/* ── Pastille de résultat ── */
/* Libellé porteur n°2 : 40px dans le repère 1040. */
.cm-tally{position:absolute;z-index:5;left:56px;top:536px;display:flex;align-items:center;gap:14px;
  background:#fff;border-radius:18px;padding:16px 24px;
  box-shadow:0 16px 40px -14px rgba(15,23,42,.45)}
.cm-tally .ck{width:40px;height:40px;border-radius:12px;flex-shrink:0;
  background:#ecfdf5;color:#059669;display:grid;place-items:center}
.cm-tally .t1{font-size:40px;font-weight:700;letter-spacing:-.02em;color:#111827;white-space:nowrap}
.cm-tally .t2{font-size:13px;color:#6b7280;margin-top:2px;white-space:nowrap}

/* ══ Arrivée au scroll (même signature que les autres visuels) ══ */
.cm-armed .cm-crm,.cm-armed .cm-win,.cm-armed .cm-conn,
.cm-armed .cm-tally,.cm-armed .cm-dot{opacity:0}
.cm-armed .cm-linkline{stroke-dashoffset:260}

@keyframes cmCrm{from{opacity:0;transform:translate3d(-36px,14px,0)}to{opacity:1;transform:none}}
@keyframes cmWin{from{opacity:0;transform:translate3d(32px,16px,0)}to{opacity:1;transform:none}}
@keyframes cmUp{from{opacity:0;transform:translate3d(0,16px,0)}to{opacity:1;transform:none}}
@keyframes cmPop{0%{opacity:0;transform:scale(.4)}60%{opacity:1;transform:scale(1.22)}
  100%{opacity:1;transform:scale(1)}}
@keyframes cmDraw{to{stroke-dashoffset:0}}

.cm-in .cm-conn{animation:cmUp 620ms cubic-bezier(.22,1,.36,1) 60ms both}
.cm-in .cm-crm{animation:cmCrm 760ms cubic-bezier(.22,1,.36,1) 160ms both}
.cm-in .cm-win{animation:cmWin 760ms cubic-bezier(.22,1,.36,1) 280ms both}
.cm-in .cm-linkline{animation:cmDraw 460ms cubic-bezier(.4,0,.2,1) both}
.cm-in .cm-l1{animation-delay:560ms}
.cm-in .cm-l2{animation-delay:650ms}
.cm-in .cm-l3{animation-delay:740ms}
.cm-in .cm-l4{animation-delay:830ms}
.cm-in .cm-dot{animation:cmPop 420ms cubic-bezier(.2,1.5,.4,1) both}
.cm-in .cm-d1{animation-delay:840ms}
.cm-in .cm-d2{animation-delay:920ms}
.cm-in .cm-d3{animation-delay:1000ms}
.cm-in .cm-d4{animation-delay:1080ms}
.cm-in .cm-tally{animation:cmUp 600ms cubic-bezier(.2,1.4,.4,1) 1180ms both}

@media (prefers-reduced-motion:reduce){
  .cm-armed .cm-crm,.cm-armed .cm-win,.cm-armed .cm-conn,
  .cm-armed .cm-tally,.cm-armed .cm-dot{opacity:1}
  .cm-armed .cm-linkline{stroke-dashoffset:0}
}
`;

export default function CrmMockup() {
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

  const stageLabel = (s: Stage) =>
    s === "won"
      ? t({ fr: "Signé", en: "Won" })
      : s === "proposal"
        ? t({ fr: "Proposition", en: "Proposal" })
        : t({ fr: "Négociation", en: "Negotiation" });

  return (
    <>
      <style>{CM_CSS}</style>
      <div
        className={`cm-media${armed ? " cm-armed" : ""}${playing ? " cm-in" : ""}`}
        ref={mediaRef}
      >
        <div className="cm-fit">
          <div className="cm-stage" ref={stageRef}>
            {/* Épure 2026-08-04 (client : « plus minimaliste, moins AI
                generated ») : halo radial et les deux pastilles flottantes
                (« Connecté au CRM », « 4 affaires importées ») RETIRÉS.
                Restent les deux panneaux et le flux qui les relie : c'est
                l'histoire de la carte. */}

            {/* A · Panneau CRM générique : le pipeline commercial */}
            <div className="cm-crm">
              <div className="cm-crmhead">
                <span className="cm-logo"><span /><span /><span /><span /></span>
                <div>
                  <div className="t1">{t({ fr: "CRM · Pipeline", en: "CRM · Pipeline" })}</div>
                  <div className="t2">{t({ fr: "Affaires en cours", en: "Open deals" })}</div>
                </div>
              </div>
              {DEALS.map(([name, amount, stage]) => (
                <div className="cm-drow" key={name}>
                  <span className="n">{name}</span>
                  <span className="a">{amount}</span>
                  <span className={`cm-pill ${stage}`}>{stageLabel(stage)}</span>
                </div>
              ))}
            </div>

            {/* B · Liens : chaque affaire rejoint sa ligne Excel */}
            <svg className="cm-links" viewBox="0 0 1040 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              {DEALS.map(([name], i) => {
                const y1 = crmRowY(i);
                const y2 = xlRowY(i);
                return (
                  <path
                    key={name}
                    className={`cm-linkline cm-l${i + 1}`}
                    d={`M 374 ${y1} C 470 ${y1}, 524 ${y2}, 620 ${y2}`}
                    fill="none"
                    stroke="rgba(59,130,246,.6)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeDasharray="260"
                  />
                );
              })}
            </svg>
            {DEALS.map(([name], i) => (
              <span
                key={name}
                className={`cm-dot cm-d${i + 1}`}
                style={{ left: 486, top: (crmRowY(i) + xlRowY(i)) / 2 - 11 }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </span>
            ))}

            {/* C · Fenêtre Ora : la feuille de suivi alimentée */}
            <div className="cm-win">
              <div className="cm-titlebar">
                <div className="cm-lights"><span className="r" /><span className="y" /><span className="g" /></div>
                <div className="cm-tbtitle">
                  <span className="cm-xicon">X</span>
                  Suivi_CA.xlsx · Ora
                </div>
              </div>
              <div className="cm-body">
                <div className="cm-xl">
                  <div className="cm-xlgrid">
                    {["A", "B", "C"].map((l) => (
                      <div key={l} className="cm-xlL">{l}</div>
                    ))}
                    <div className="cm-xlH">{t({ fr: "Client", en: "Client" })}</div>
                    <div className="cm-xlH num">{t({ fr: "Montant", en: "Amount" })}</div>
                    <div className="cm-xlH">{t({ fr: "Statut", en: "Status" })}</div>
                    {DEALS.map(([name, amount, stage]) => (
                      <Fragment key={name}>
                        <div className="cm-xlC name">{name}</div>
                        <div className="cm-xlC num">{amount}</div>
                        <div className="cm-xlC"><span className={`st ${stage}`}>{stageLabel(stage)}</span></div>
                      </Fragment>
                    ))}
                    <div className="cm-xlT">{t({ fr: "Total", en: "Total" })}</div>
                    <div className="cm-xlT num">{TOTAL}</div>
                    <div className="cm-xlT" />
                    {/* Empty sheet rows so the grid runs to the card's crop
                        instead of leaving a dead white band under the total. */}
                    {Array.from({ length: 24 }, (_, i) => (
                      <div key={`e${i}`} className="cm-xlC" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
