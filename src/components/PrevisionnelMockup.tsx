import { useEffect, useRef } from "react";
import { useLang } from "@/lib/i18n";
import { useEnterOnScroll } from "@/lib/useEnterOnScroll";

/**
 * PrevisionnelMockup — visual for the "Prévisionnel" use-case card.
 *
 * One idea, readable in three seconds: from an imported Excel history, Ora
 * builds the business-plan trajectory. The composition:
 *   · a large Ora window with a 7-year bar chart: three "réalisé" years in
 *     muted slate, four "projeté" years in the brand blue→teal gradient, and
 *     a trajectory line that turns dashed where the projection starts,
 *   · a floating KPI card with the projected revenue (the big number),
 *   · a small source chip (the client's Excel balance) feeding the plan.
 *
 * Same fixed-stage pattern as the other Ora mockups: 1040×640 scene scaled by
 * a ResizeObserver, `.pv-` scoped classes, no external assets, one-shot
 * entrance driven by useEnterOnScroll, disabled under prefers-reduced-motion.
 *
 * MOBILE: the two message-carrying labels (window headline 40px, KPI value
 * 56px) stay ≥ 11px on a 375px-wide screen (scale ≈ 0.28). Everything else is
 * deliberate texture.
 */

/** [year, value in M€, projected?] — chart data, realized then projected. */
const YEARS: [string, number, boolean][] = [
  ["2024", 1.2, false],
  ["2025", 1.4, false],
  ["2026", 1.6, false],
  ["2027", 2.0, true],
  ["2028", 2.4, true],
  ["2029", 2.9, true],
  ["2030", 3.4, true],
];
const MAX_VAL = 3.4;
// Chart geometry in the SVG viewBox (606×250). Bars deliberately slender
// (client 2026-08-02 : « les barres graphiques ne sont pas assez affinées »),
// and the plot short enough that the year labels stay above the card's crop
// now that the formula bar and the mini sheet sit above the chart.
const BAR_W = 30, BAR_GAP = 52, X0 = 38, BASE_Y = 218, PLOT_H = 190;
const barX = (i: number) => X0 + i * (BAR_W + BAR_GAP);
const barH = (v: number) => (v / MAX_VAL) * PLOT_H;
const dotX = (i: number) => barX(i) + BAR_W / 2;
const dotY = (v: number) => BASE_Y - barH(v);

const PV_CSS = `
/* ══ Visuel « Prévisionnel » — historique Excel → trajectoire projetée ══ */
/* Transparent : la composition flotte sur le bleu nuit de la carte. Pas
   d'overflow:hidden ici : il trancherait les ombres au bord de la zone média.
   C'est l'overflow-hidden + coins arrondis de la CARTE qui rognent en bas. */
.pv-media{position:relative;aspect-ratio:1040/640;isolation:isolate;background:transparent}
.pv-fit{position:absolute;inset:0;z-index:1}
.pv-stage{position:absolute;left:50%;top:0;width:1040px;height:640px;
  transform-origin:top center;
  font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  color:#111827;-webkit-font-smoothing:antialiased}
.pv-blob{position:absolute;z-index:0;left:280px;top:50px;width:560px;height:560px;
  border-radius:50%;
  background:radial-gradient(circle at 45% 35%,rgba(255,255,255,.20),rgba(255,255,255,.07) 55%,transparent 75%)}
/* ── Fenêtre Ora (chrome macOS) ── */
.pv-win{position:absolute;z-index:2;left:56px;top:118px;width:650px;height:560px;
  background:#fff;border-radius:12px;overflow:hidden;
  box-shadow:0 1px 2px rgba(0,0,0,.35),0 24px 70px -18px rgba(0,0,0,.5),0 60px 130px -40px rgba(0,0,0,.45)}
.pv-titlebar{position:relative;display:flex;align-items:center;height:40px;
  background:linear-gradient(#fbfbfa,#f4f4f3);border-bottom:1px solid #e3e3e0}
.pv-lights{display:flex;gap:8px;padding:0 14px}
.pv-lights span{width:12px;height:12px;border-radius:50%}
.pv-lights .r{background:#ff5f57;border:.5px solid #e0443e}
.pv-lights .y{background:#febc2e;border:.5px solid #d89c22}
.pv-lights .g{background:#28c840;border:.5px solid #1eaa33}
.pv-tbtitle{position:absolute;left:0;right:0;display:flex;align-items:center;justify-content:center;gap:7px;
  font-size:12.5px;font-weight:600;color:#4b5563}
.pv-xicon{width:15px;height:15px;border-radius:3px;background:#217346;color:#fff;
  display:grid;place-items:center;font-size:9px;font-weight:800}
.pv-body{height:calc(100% - 40px);background:#fff;padding:16px 24px 0;
  display:flex;flex-direction:column;gap:12px}
.pv-headrow{display:flex;align-items:flex-end;justify-content:space-between;gap:16px}
/* Libellé porteur n°1 : 40px dans le repère 1040, donc ≥ 11px à 375px. */
.pv-head{font-size:40px;font-weight:700;letter-spacing:-.02em;color:#111827;white-space:nowrap}
/* légende sur sa propre ligne, alignée à droite au-dessus du graphique : dans
   la ligne de titre elle débordait de la fenêtre et se faisait rogner. */
.pv-legend{display:flex;align-items:center;justify-content:flex-end;gap:16px;margin-bottom:-4px}
/* ── Barre de formule + mini-feuille Excel (la matière du prévisionnel) ── */
.pv-xlbar{display:flex;align-items:center;height:26px;border:1px solid #e3e6ea;border-radius:5px;
  overflow:hidden;font-size:11px;color:#3f3f3f;flex-shrink:0}
.pv-xlname{width:50px;text-align:center;line-height:26px;border-right:1px solid #e3e6ea;background:#f7f7f7;font-weight:600}
.pv-xlfx{width:26px;text-align:center;line-height:26px;border-right:1px solid #e3e6ea;color:#9a9a9a;font-style:italic;font-family:Georgia,serif}
.pv-xlformula{padding-left:10px;color:#555;white-space:nowrap}
.pv-xl{border:1px solid #e3e6ea;border-radius:5px;overflow:hidden;flex-shrink:0}
.pv-xlgrid{display:grid;grid-template-columns:22px 1.25fr repeat(7,1fr);font-size:10.5px}
.pv-xlL{background:#f7f7f7;color:#8a8a8a;text-align:center;font-weight:600;padding:2px 0;
  border-right:1px solid #ececec;border-bottom:1px solid #ececec}
.pv-xlN{background:#f7f7f7;color:#8a8a8a;text-align:center;font-weight:600;padding:5px 0;
  border-right:1px solid #ececec;border-bottom:1px solid #f2f2f2}
.pv-xlH{background:#e2efda;color:#3f6b2b;font-weight:700;padding:5px 8px;text-align:right;
  border-right:1px solid #cfe0c4;border-bottom:1px solid #cfe0c4;white-space:nowrap}
.pv-xlH.lbl{text-align:left}
.pv-xlC{background:#fff;color:#3a3a3a;padding:5px 8px;text-align:right;
  border-right:1px solid #f1f1f1;border-bottom:1px solid #f1f1f1;
  white-space:nowrap;font-variant-numeric:tabular-nums}
.pv-xlC.lbl{text-align:left;font-weight:600;color:#1f1f1f}
/* cellules projetées : teintées teal, c'est la sortie du modèle */
.pv-xlC.p{background:#f0fdfa;color:#0f766e;font-weight:700}
.pv-xlsel{box-shadow:inset 0 0 0 2px #0d9488}
.pv-leg{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:600;color:#6b7280}
.pv-leg .dot{width:11px;height:11px;border-radius:4px}
.pv-leg .dot.real{background:#c7d5ea}
.pv-leg .dot.proj{background:linear-gradient(135deg,#3b82f6,#0d9488)}
.pv-auto{margin-left:auto;display:inline-flex;align-items:center;gap:6px;
  font-size:12px;font-weight:700;color:#059669;white-space:nowrap}
.pv-auto .dot{width:8px;height:8px;border-radius:50%;background:#059669;box-shadow:0 0 0 3px rgba(5,150,105,.16)}
.pv-chart{flex:1;min-height:0}
.pv-chart svg{width:100%;height:auto;display:block}
/* ── Carte KPI flottante ── */
.pv-kpi{position:absolute;z-index:4;left:722px;top:168px;width:266px;
  background:#fff;border-radius:18px;padding:20px 24px;
  box-shadow:0 1px 2px rgba(0,0,0,.3),0 26px 64px -18px rgba(0,0,0,.5)}
.pv-kpi .t1{font-size:16px;font-weight:600;color:#6b7280;white-space:nowrap}
/* Libellé porteur n°2 : 56px dans le repère 1040. */
.pv-kpi .val{font-size:56px;font-weight:700;letter-spacing:-.03em;margin-top:2px;white-space:nowrap;
  background:linear-gradient(to right,#3b82f6,#0d9488);
  -webkit-background-clip:text;background-clip:text;color:transparent}
.pv-kpi .chip{display:inline-flex;align-items:center;gap:5px;margin-top:8px;
  font-size:12.5px;font-weight:700;color:#059669;background:#ecfdf5;
  border-radius:7px;padding:4px 9px;white-space:nowrap}
/* ── Chip source : le fichier Excel qui alimente le plan ── */
/* min-width calé pour recouvrir ENTIÈREMENT les années 2024 et 2025 du
   graphique (sinon un « 2025 » à moitié visible dépasse de la pastille) tout
   en s'arrêtant avant « 2026 ». */
.pv-src{position:absolute;z-index:5;left:26px;top:538px;min-width:248px;
  display:flex;align-items:center;gap:11px;
  background:#fff;border-radius:13px;padding:13px 16px;
  box-shadow:0 18px 44px -12px rgba(0,0,0,.5)}
.pv-src .xico{width:30px;height:36px;border-radius:5px;background:#217346;color:#fff;flex-shrink:0;
  display:grid;place-items:center;font-size:13px;font-weight:800}
.pv-src .t1{font-size:12.5px;font-weight:700;color:#111827;white-space:nowrap}
.pv-src .done{display:inline-flex;align-items:center;gap:5px;margin-top:3px;
  font-size:10.5px;font-weight:700;color:#059669;white-space:nowrap}

/* ══ Arrivée au scroll (même signature que les autres visuels) ══
   L'état masqué n'est posé que sous .pv-armed, classe ajoutée par le JS
   seulement s'il peut animer : sans JS ou en mouvement réduit, tout
   s'affiche normalement. */
.pv-armed .pv-win,.pv-armed .pv-kpi,.pv-armed .pv-src{opacity:0}
.pv-armed .pv-bar{transform:scaleY(0)}
.pv-armed .pv-lineR{stroke-dashoffset:340}
.pv-armed .pv-lineP,.pv-armed .pv-dot{opacity:0}

@keyframes pvUp{from{opacity:0;transform:translate3d(0,20px,0)}to{opacity:1;transform:none}}
@keyframes pvPop{0%{opacity:0;transform:scale(.55)}60%{opacity:1;transform:scale(1.06)}
  100%{opacity:1;transform:scale(1)}}
@keyframes pvBar{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes pvDraw{to{stroke-dashoffset:0}}
@keyframes pvFade{to{opacity:1}}

.pv-in .pv-win{animation:pvUp 680ms cubic-bezier(.22,1,.36,1) 60ms both}
.pv-bar{transform-box:fill-box;transform-origin:bottom}
.pv-in .pv-bar{animation:pvBar 560ms cubic-bezier(.22,1,.36,1) both}
.pv-in .pv-bar.b0{animation-delay:260ms}.pv-in .pv-bar.b1{animation-delay:340ms}
.pv-in .pv-bar.b2{animation-delay:420ms}.pv-in .pv-bar.b3{animation-delay:500ms}
.pv-in .pv-bar.b4{animation-delay:580ms}.pv-in .pv-bar.b5{animation-delay:660ms}
.pv-in .pv-bar.b6{animation-delay:740ms}
.pv-in .pv-lineR{animation:pvDraw 460ms cubic-bezier(.4,0,.2,1) 560ms both}
.pv-in .pv-lineP{animation:pvFade 420ms ease 940ms both}
.pv-in .pv-dot{animation:pvPop 380ms cubic-bezier(.2,1.5,.4,1) both}
.pv-in .pv-dot.d0{animation-delay:640ms}.pv-in .pv-dot.d1{animation-delay:720ms}
.pv-in .pv-dot.d2{animation-delay:800ms}.pv-in .pv-dot.d3{animation-delay:980ms}
.pv-in .pv-dot.d4{animation-delay:1040ms}.pv-in .pv-dot.d5{animation-delay:1100ms}
.pv-in .pv-dot.d6{animation-delay:1160ms}
.pv-in .pv-kpi{animation:pvPop 520ms cubic-bezier(.2,1.4,.4,1) 1220ms both}
.pv-in .pv-src{animation:pvUp 560ms cubic-bezier(.22,1,.36,1) 1340ms both}

@media (prefers-reduced-motion:reduce){
  .pv-armed .pv-win,.pv-armed .pv-kpi,.pv-armed .pv-src,
  .pv-armed .pv-lineP,.pv-armed .pv-dot{opacity:1}
  .pv-armed .pv-bar{transform:none}
  .pv-armed .pv-lineR{stroke-dashoffset:0}
}
`;

export default function PrevisionnelMockup() {
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

  const realized = YEARS.filter(([, , proj]) => !proj);
  const lineR = realized.map(([, v], i) => `${i === 0 ? "M" : "L"} ${dotX(i)} ${dotY(v)}`).join(" ");
  const lineP = YEARS.slice(realized.length - 1)
    .map(([, v], i) => `${i === 0 ? "M" : "L"} ${dotX(realized.length - 1 + i)} ${dotY(v)}`)
    .join(" ");

  return (
    <>
      <style>{PV_CSS}</style>
      <div
        className={`pv-media${armed ? " pv-armed" : ""}${playing ? " pv-in" : ""}`}
        ref={mediaRef}
      >
        <div className="pv-fit">
          <div className="pv-stage" ref={stageRef}>
            <div className="pv-blob" />

            {/* A · Fenêtre Ora : la trajectoire du business plan */}
            <div className="pv-win">
              <div className="pv-titlebar">
                <div className="pv-lights"><span className="r" /><span className="y" /><span className="g" /></div>
                <div className="pv-tbtitle">
                  <span className="pv-xicon">X</span>
                  {t({ fr: "Business_plan_2030.xlsx · Ora", en: "Business_plan_2030.xlsx · Ora" })}
                </div>
              </div>
              <div className="pv-body">
                <div className="pv-headrow">
                  <div className="pv-head">{t({ fr: "Business plan 2026 → 2030", en: "Business plan 2026 → 2030" })}</div>
                  <span className="pv-auto"><span className="dot" />{t({ fr: "Automatisé", en: "Automated" })}</span>
                </div>

                {/* Excel formula bar: the forecast is a sheet, not a picture */}
                <div className="pv-xlbar">
                  <span className="pv-xlname">H2</span>
                  <span className="pv-xlfx">fx</span>
                  <span className="pv-xlformula">{t({ fr: "=PREVISION.ETS(H1;B2:D2;B1:D1)", en: "=FORECAST.ETS(H1,B2:D2,B1:D1)" })}</span>
                </div>

                {/* Mini sheet: years across, revenue row, projected cells tinted */}
                <div className="pv-xl">
                  <div className="pv-xlgrid">
                    <div className="pv-xlL" />
                    <div className="pv-xlL">A</div>
                    {YEARS.map((_, i) => (
                      <div key={`L${i}`} className="pv-xlL">{String.fromCharCode(66 + i)}</div>
                    ))}
                    <div className="pv-xlN">1</div>
                    <div className="pv-xlH lbl">{t({ fr: "Année", en: "Year" })}</div>
                    {YEARS.map(([year]) => (
                      <div key={`H${year}`} className="pv-xlH">{year}</div>
                    ))}
                    <div className="pv-xlN">2</div>
                    <div className="pv-xlC lbl">{t({ fr: "CA (M€)", en: "Revenue (M€)" })}</div>
                    {YEARS.map(([year, v, proj], i) => (
                      <div key={`C${year}`}
                        className={`pv-xlC${proj ? " p" : ""}${i === YEARS.length - 1 ? " pv-xlsel" : ""}`}>
                        {t({ fr: v.toFixed(1).replace(".", ","), en: v.toFixed(1) })}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pv-legend">
                  <span className="pv-leg"><span className="dot real" />{t({ fr: "Réalisé", en: "Actuals" })}</span>
                  <span className="pv-leg"><span className="dot proj" />{t({ fr: "Projeté", en: "Projected" })}</span>
                </div>
                <div className="pv-chart">
                  <svg viewBox="0 0 606 250" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <defs>
                      <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#0d9488" />
                      </linearGradient>
                    </defs>
                    {/* faint horizontal gridlines */}
                    {[0.25, 0.5, 0.75, 1].map((f) => (
                      <line key={f} x1="14" x2="592" y1={BASE_Y - PLOT_H * f} y2={BASE_Y - PLOT_H * f}
                        stroke="#f1f5f9" strokeWidth="1.25" />
                    ))}
                    <line x1="14" x2="592" y1={BASE_Y} y2={BASE_Y} stroke="#e5eaf1" strokeWidth="1.5" />
                    {/* slender bars: realized in muted slate, projected in brand gradient */}
                    {YEARS.map(([year, v, proj], i) => (
                      <g key={year}>
                        <rect className={`pv-bar b${i}`} x={barX(i)} y={dotY(v)} width={BAR_W} height={barH(v)}
                          rx="5" fill={proj ? "url(#pvGrad)" : "#cdd9ea"} opacity={proj ? 0.92 : 1} />
                        <text x={dotX(i)} y={BASE_Y + 22} textAnchor="middle" fontSize="15"
                          fontWeight={proj ? 700 : 600} fill={proj ? "#0f766e" : "#9aa7b8"}>{year}</text>
                      </g>
                    ))}
                    {/* trajectory line: solid on actuals, dashed on projection */}
                    <path className="pv-lineR" d={lineR} fill="none" stroke="#3b82f6" strokeWidth="3"
                      strokeLinecap="round" strokeDasharray="340" />
                    <path className="pv-lineP" d={lineP} fill="none" stroke="#0d9488" strokeWidth="3"
                      strokeLinecap="round" strokeDasharray="3 9" />
                    {YEARS.map(([year, v, proj], i) => (
                      <circle key={year} className={`pv-dot d${i}`} cx={dotX(i)} cy={dotY(v)}
                        r={i === YEARS.length - 1 ? 6.5 : 4.5} fill="#fff"
                        stroke={proj ? "#0d9488" : "#3b82f6"} strokeWidth="2.6" />
                    ))}
                  </svg>
                </div>
              </div>
            </div>

            {/* B · Carte KPI : le point d'arrivée de la trajectoire */}
            <div className="pv-kpi">
              <div className="t1">{t({ fr: "CA projeté 2030", en: "Projected revenue 2030" })}</div>
              <div className="val">{t({ fr: "3,4 M€", en: "3.4 M€" })}</div>
              <span className="chip">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="m17 7-9.5 9.5M17 15V7H9" /></svg>
                {t({ fr: "+112 % vs 2026", en: "+112% vs 2026" })}
              </span>
            </div>

            {/* C · Chip source : l'historique Excel qui alimente le plan */}
            <div className="pv-src">
              <span className="xico">X</span>
              <div>
                <div className="t1">Balance_2026.xlsx</div>
                <div className="done">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  {t({ fr: "Historique importé", en: "History imported" })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
