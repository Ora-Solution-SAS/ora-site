import { useEffect, useRef } from "react";
import { useLang } from "@/lib/i18n";
import { useEnterOnScroll } from "@/lib/useEnterOnScroll";

/**
 * PrevisionnelMockup — visuel de la carte « Prévisionnel », v2 (client
 * 2026-08-04 : « reprends un encadré de la page d'accueil comme Prévisionnel
 * immobilier et Passage en société »).
 *
 * La v1 était une scène composée (fenêtre + carte KPI flottante + chip source
 * + halo), jugée « trop AI generated ». La v2 ne montre plus qu'UNE fenêtre de
 * l'app, avec le langage exact de son écran d'accueil :
 *   · le bandeau « Accès rapide » et deux tuiles reprises telles quelles du
 *     logiciel (Prévisionnel immobilier, Passage en société) — fond blanc,
 *     icône sur pastille teintée douce, flèche grise, la première sélectionnée ;
 *   · dessous, le livrable produit par le module : le fichier généré et sa
 *     trajectoire, en trait fin, réalisé plein puis projeté pointillé.
 * Rien ne flotte hors de la fenêtre : pas de pastille, pas de halo, pas de
 * curseur.
 *
 * Même patron que les autres visuels : scène 1040×640 mise à l'échelle par un
 * ResizeObserver, classes `.pv-` scopées, aucune ressource externe, entrée
 * one-shot via useEnterOnScroll, désactivée en mouvement réduit.
 */

/** [année, valeur M€, projeté ?] */
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
// Géométrie du tracé, dans le viewBox 780×150 du graphique.
const CX0 = 26, CDX = 121, CBASE = 128, CPLOT = 104;
const px = (i: number) => CX0 + i * CDX;
const py = (v: number) => CBASE - (v / MAX_VAL) * CPLOT;

const PV_CSS = `
/* ══ Visuel « Prévisionnel » — l'écran d'accueil de l'app, module lancé ══ */
.pv-media{position:relative;aspect-ratio:1040/640;isolation:isolate;background:transparent}
.pv-fit{position:absolute;inset:0;z-index:1}
.pv-stage{position:absolute;left:50%;top:0;width:1040px;height:640px;
  transform-origin:top center;
  font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  color:#111827;-webkit-font-smoothing:antialiased}

/* ── Fenêtre de l'app ── */
/* La fenêtre DÉBORDE volontairement sous la ligne de coupe de la carte (640
   dans ce repère), comme les autres visuels de la section : ses angles bas
   sont rognés par la carte, elle se lit donc comme continuant sous le cadre
   plutôt que comme une vignette posée avec une marge. */
.pv-win{position:absolute;left:80px;top:64px;width:880px;height:600px;
  background:#fafbfd;border-radius:16px;overflow:hidden;
  box-shadow:0 1px 2px rgba(0,0,0,.3),0 26px 70px -18px rgba(0,0,0,.5)}
.pv-titlebar{position:relative;display:flex;align-items:center;height:44px;
  background:linear-gradient(#fbfbfa,#f4f4f3);border-bottom:1px solid #e8e8e5}
.pv-lights{display:flex;gap:8px;padding-left:16px}
.pv-lights span{width:12px;height:12px;border-radius:50%}
.pv-lights .r{background:#ff5f57}.pv-lights .y{background:#febc2e}.pv-lights .g{background:#28c840}
.pv-tbtitle{position:absolute;left:0;right:0;text-align:center;font-size:14px;font-weight:600;color:#6b7280}
.pv-body{padding:26px 28px}

/* ── Bandeau de section, comme dans l'app ── */
.pv-kicker{font-size:13px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#9ca3af}

/* ── Tuiles « Accès rapide », reprises du logiciel ── */
.pv-tiles{display:flex;gap:16px;margin-top:12px}
.pv-tile{flex:1;display:flex;align-items:center;gap:14px;background:#fff;
  border:1px solid #eceef2;border-radius:16px;padding:18px 18px;
  box-shadow:0 1px 2px rgba(15,23,42,.04)}
.pv-tile.on{border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59,130,246,.35),0 10px 26px -12px rgba(37,99,235,.5)}
.pv-tico{width:46px;height:46px;border-radius:13px;flex-shrink:0;display:grid;place-items:center}
.pv-tico.mint{background:#ecfdf5;color:#059669}
.pv-tico.amber{background:#fff7ed;color:#f97316}
/* Libellé porteur n°1 : 21px dans le repère 1040 → ≥ 11px sur mobile. */
.pv-tile .t1{font-size:21px;font-weight:700;letter-spacing:-.01em;color:#111827;white-space:nowrap}
.pv-tile .t2{font-size:14.5px;color:#9ca3af;margin-top:3px;white-space:nowrap}
.pv-tarrow{margin-left:auto;color:#d1d5db;flex-shrink:0}

/* ── Le livrable produit par le module ── */
.pv-out{margin-top:22px;background:#fff;border:1px solid #eceef2;border-radius:16px;
  padding:18px 20px 14px;box-shadow:0 1px 2px rgba(15,23,42,.04)}
.pv-outhead{display:flex;align-items:center;gap:11px}
.pv-xicon{width:26px;height:30px;border-radius:5px;background:#217346;color:#fff;flex-shrink:0;
  display:grid;place-items:center;font-size:14px;font-weight:800}
.pv-fname{font-size:15.5px;font-weight:700;color:#111827;white-space:nowrap}
.pv-fmeta{font-size:12.5px;color:#9ca3af;margin-top:1px;white-space:nowrap}
.pv-auto{margin-left:auto;display:inline-flex;align-items:center;gap:7px;
  font-size:12.5px;font-weight:700;color:#059669;background:#ecfdf5;
  border-radius:999px;padding:5px 11px;white-space:nowrap}
.pv-auto .dot{width:6px;height:6px;border-radius:50%;background:#10b981}
/* Libellé porteur n°2 : 40px → ≥ 11px sur mobile. */
.pv-val{font-size:40px;font-weight:700;letter-spacing:-.03em;margin-top:12px;white-space:nowrap;
  background:linear-gradient(to right,#3b82f6,#0d9488);
  -webkit-background-clip:text;background-clip:text;color:transparent}
.pv-vlbl{font-size:13.5px;color:#6b7280;margin-top:-2px;white-space:nowrap}
.pv-chart{margin-top:6px}
.pv-years{display:flex;justify-content:space-between;padding:0 14px;margin-top:2px}
.pv-years span{font-size:12.5px;font-weight:600;color:#9aa7b8}
.pv-years span.p{color:#0f766e;font-weight:700}

/* ══ Arrivée au scroll ══ */
.pv-armed .pv-win{opacity:0}
.pv-armed .pv-tile,.pv-armed .pv-out{opacity:0}
.pv-armed .pv-lineR{stroke-dashoffset:520}
.pv-armed .pv-lineP,.pv-armed .pv-dot{opacity:0}

@keyframes pvUp{from{opacity:0;transform:translate3d(0,20px,0)}to{opacity:1;transform:none}}
@keyframes pvPop{0%{opacity:0;transform:scale(.55)}60%{opacity:1;transform:scale(1.06)}
  100%{opacity:1;transform:scale(1)}}
@keyframes pvDraw{to{stroke-dashoffset:0}}
@keyframes pvFade{to{opacity:1}}

.pv-in .pv-win{animation:pvUp 680ms cubic-bezier(.22,1,.36,1) 60ms both}
.pv-in .pv-tile{animation:pvUp 520ms cubic-bezier(.22,1,.36,1) both}
.pv-in .pv-tile.t-a{animation-delay:320ms}
.pv-in .pv-tile.t-b{animation-delay:410ms}
.pv-in .pv-out{animation:pvUp 560ms cubic-bezier(.22,1,.36,1) 560ms both}
.pv-in .pv-lineR{animation:pvDraw 520ms cubic-bezier(.4,0,.2,1) 780ms both}
.pv-in .pv-lineP{animation:pvFade 420ms ease 1180ms both}
.pv-in .pv-dot{animation:pvPop 360ms cubic-bezier(.2,1.5,.4,1) both}
.pv-in .pv-dot.d0{animation-delay:840ms}.pv-in .pv-dot.d1{animation-delay:900ms}
.pv-in .pv-dot.d2{animation-delay:960ms}.pv-in .pv-dot.d3{animation-delay:1200ms}
.pv-in .pv-dot.d4{animation-delay:1250ms}.pv-in .pv-dot.d5{animation-delay:1300ms}
.pv-in .pv-dot.d6{animation-delay:1350ms}

@media (prefers-reduced-motion:reduce){
  .pv-armed .pv-win,.pv-armed .pv-tile,.pv-armed .pv-out,
  .pv-armed .pv-lineP,.pv-armed .pv-dot{opacity:1}
  .pv-armed .pv-lineR{stroke-dashoffset:0}
}
`;

/** Flèche « → » des tuiles, au trait de l'app. */
function TileArrow() {
  return (
    <svg className="pv-tarrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

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
  const lineR = realized.map(([, v], i) => `${i === 0 ? "M" : "L"} ${px(i)} ${py(v)}`).join(" ");
  const lineP = YEARS.slice(realized.length - 1)
    .map(([, v], i) => `${i === 0 ? "M" : "L"} ${px(realized.length - 1 + i)} ${py(v)}`)
    .join(" ");

  return (
    <>
      <style>{PV_CSS}</style>
      <div className={`pv-media${armed ? " pv-armed" : ""}${playing ? " pv-in" : ""}`} ref={mediaRef}>
        <div className="pv-fit">
          <div className="pv-stage" ref={stageRef}>
            <div className="pv-win">
              <div className="pv-titlebar">
                <div className="pv-lights"><span className="r" /><span className="y" /><span className="g" /></div>
                <div className="pv-tbtitle">Ora</div>
              </div>
              <div className="pv-body">
                <div className="pv-kicker">{t({ fr: "Accès rapide", en: "Quick access" })}</div>

                {/* Les deux tuiles du logiciel, à l'identique */}
                <div className="pv-tiles">
                  <div className="pv-tile t-a on">
                    <span className="pv-tico mint">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 21h18M4 10h16M5 10 12 4l7 6M6 10v11M10 10v11M14 10v11M18 10v11" />
                      </svg>
                    </span>
                    <div>
                      <div className="t1">{t({ fr: "Prévisionnel immobilier", en: "Property forecast" })}</div>
                      <div className="t2">{t({ fr: "Dossier banque en 5 min", en: "Bank file in 5 min" })}</div>
                    </div>
                    <TileArrow />
                  </div>
                  <div className="pv-tile t-b">
                    <span className="pv-tico amber">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m17 2 4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                        <path d="m7 22-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" />
                      </svg>
                    </span>
                    <div>
                      <div className="t1">{t({ fr: "Passage en société", en: "Incorporation" })}</div>
                      <div className="t2">{t({ fr: "Comparatif avant / après", en: "Before / after comparison" })}</div>
                    </div>
                    <TileArrow />
                  </div>
                </div>

                {/* Le livrable produit par le module lancé */}
                <div className="pv-out">
                  <div className="pv-outhead">
                    <span className="pv-xicon">X</span>
                    <div>
                      <div className="pv-fname">Business_plan_2030.xlsx</div>
                      <div className="pv-fmeta">{t({ fr: "Business plan 2026 → 2030", en: "Business plan 2026 → 2030" })}</div>
                    </div>
                    <span className="pv-auto"><span className="dot" />{t({ fr: "Automatisé", en: "Automated" })}</span>
                  </div>

                  <div className="pv-val">{t({ fr: "3,4 M€", en: "3.4 M€" })}</div>
                  <div className="pv-vlbl">{t({ fr: "CA projeté 2030", en: "Projected 2030 revenue" })}</div>

                  <div className="pv-chart">
                    <svg viewBox="0 0 780 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      {[0.5, 1].map((f) => (
                        <line key={f} x1="14" x2="766" y1={CBASE - CPLOT * f} y2={CBASE - CPLOT * f}
                          stroke="#f1f5f9" strokeWidth="1.25" />
                      ))}
                      <line x1="14" x2="766" y1={CBASE} y2={CBASE} stroke="#e5eaf1" strokeWidth="1.5" />
                      <path className="pv-lineR" d={lineR} fill="none" stroke="#3b82f6" strokeWidth="2.6"
                        strokeLinecap="round" strokeLinejoin="round" strokeDasharray="520" />
                      <path className="pv-lineP" d={lineP} fill="none" stroke="#0d9488" strokeWidth="2.6"
                        strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 8" />
                      {YEARS.map(([year, v, proj], i) => (
                        <circle key={year} className={`pv-dot d${i}`} cx={px(i)} cy={py(v)}
                          r={i === YEARS.length - 1 ? 5.5 : 4} fill="#fff"
                          stroke={proj ? "#0d9488" : "#3b82f6"} strokeWidth="2.4" />
                      ))}
                    </svg>
                    <div className="pv-years">
                      {YEARS.map(([year, , proj]) => (
                        <span key={year} className={proj ? "p" : ""}>{year}</span>
                      ))}
                    </div>
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
