import { useEffect, useRef } from "react";
import { useEnterOnScroll } from "@/lib/useEnterOnScroll";

/**
 * LocalSecurityMockup — animated visual for the "Vos données restent chez vous"
 * card (3rd stacking card), replacing its demo clip.
 *
 * Ported from the supplied brief + `local-security-composition.html`
 * (2026-07-27). It tells local execution in one image:
 *   · a padlock on a white app tile at the centre,
 *   · the firm's files orbiting it slowly (80s/turn) and always upright,
 *   · a dashed enclosure marking the "chez vous" perimeter, with a house pill
 *     on top and a status pill at the bottom,
 *   · a struck-through cloud OUTSIDE the enclosure: nothing leaves,
 *   · a protection wave pulsing out of the padlock every ~3s.
 *
 * Per the brief: do NOT reposition the elements, do NOT speed up the orbit
 * (80s minimum — the slowness is what reads premium), and do NOT touch the
 * `.lk-sat` / `.lk-counter` nesting (that is what keeps the files upright
 * while the ring rotates).
 *
 * Authorised adaptations applied: media radius aligned on the site's other
 * media zones, Inter first in the stage font stack, and the three
 * `--lk-bg-*` variables retinted from the default emerald to the CYAN family
 * of this card (same hue in three depths, as the brief prescribes).
 *
 * A fixed 1040×640 scene scaled by a ResizeObserver, like the other mockups.
 */

const LK_CSS = `
/* ══ Visuel « Vos données restent chez vous » ══ */
/* Zone média TRANSPARENTE : la composition flotte sur le fond cyan clair de
   la carte (demande client 2026-07-27, qui remplace le panneau sombre du
   brief). Conséquence : tout ce qui était blanc pour ressortir sur le fond
   sombre (anneaux, enceinte, nuage) passe en ardoise/teal, et les ombres
   calculées pour un fond sombre sont adoucies.
   overflow:hidden conservé : il borne la composition à la zone média. */
.lk-media{
  position:relative;aspect-ratio:1040/640;
  overflow:hidden;isolation:isolate;background:transparent}

.lk-fit{position:absolute;inset:0;z-index:1}
.lk-stage{position:absolute;left:50%;top:0;width:1040px;height:640px;
  transform-origin:top center;
  font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  color:#111827;-webkit-font-smoothing:antialiased}

/* ══ Anneaux statiques, enceinte et nuage barré (SVG plein cadre) ══ */
.lk-rings{position:absolute;z-index:0;left:0;top:0;width:1040px;height:640px}

/* ══ Onde de protection ══ */
.lk-ripple{position:absolute;z-index:1;left:520px;top:318px;width:170px;height:170px;
  margin:-85px 0 0 -85px;border-radius:50%;
  border:1.5px solid rgba(13,148,136,.5)}
.lk-ripple.r2{animation-delay:2.75s}
@keyframes lkRipple{
  0%   {transform:scale(.55);opacity:.6}
  100% {transform:scale(3.1);opacity:0}
}
.lk-ripple{animation:lkRipple 5.5s cubic-bezier(.25,.6,.4,1) infinite;opacity:0}

/* ══ Orbite des fichiers (ils tournent, restent droits) ══ */
.lk-orbit{position:absolute;z-index:2;left:330px;top:128px;width:380px;height:380px;
  animation:lkSpin 80s linear infinite}
.lk-sat{position:absolute;left:50%;top:50%}
.lk-counter{animation:lkSpinRev 80s linear infinite}
@keyframes lkSpin{to{transform:rotate(360deg)}}
@keyframes lkSpinRev{to{transform:rotate(-360deg)}}

/* mini-fichiers */
.lk-chip{background:#fff;border-radius:9px;overflow:hidden;
  box-shadow:0 6px 18px -8px rgba(15,23,42,.22),0 0 0 1px rgba(15,23,42,.05)}
.lk-chip .head{display:flex;align-items:center;gap:4px;height:15px;padding:0 6px;
  font-size:7px;font-weight:800;letter-spacing:.05em;color:#fff}
.lk-chip .head.xls{background:#047857}
.lk-chip .head.pdf{background:#dc2626}
.lk-chip .head.csv{background:#0d9488}
.lk-chip .head.rpt{background:#3b82f6}
/* petites cases Excel */
.lk-cells{display:grid;grid-template-columns:repeat(3,1fr);gap:2.5px;padding:6px}
.lk-cells i{display:block;height:7px;border-radius:1.5px;background:#eef0f4}
.lk-cells i.g{background:#d1fae5}
.lk-cells i.gg{background:#6ee7b7}
/* lignes de texte (PDF) */
.lk-lines{padding:7px 6px;display:flex;flex-direction:column;gap:3.5px}
.lk-lines i{display:block;height:4px;border-radius:2px;background:#e5e7eb}
.lk-lines i.short{width:62%}
.lk-lines i.red{background:#fecaca;width:40%}
/* mini graphique (reporting) */
.lk-bars{display:flex;align-items:flex-end;gap:3.5px;height:34px;padding:6px 7px 7px}
.lk-bars i{flex:1;border-radius:2px 2px 0 0;background:#bfdbfe}
.lk-bars i.hi{background:#3b82f6}

/* ══ Cadenas central (tuile app) ══ */
.lk-lockwrap{position:absolute;z-index:3;left:520px;top:318px;width:0;height:0}
/* Tuile épurée (client 2026-07-27 : « trop fancy ») : blanc plat, une seule
   ombre douce, un filet discret. Plus de dégradé, plus de halo, plus de
   superposition d'ombres. */
.lk-tile{position:absolute;left:-55px;top:-55px;width:110px;height:110px;border-radius:26px;
  background:#ffffff;
  box-shadow:0 10px 30px -12px rgba(15,23,42,.24),0 0 0 1px rgba(15,23,42,.05);
  display:grid;place-items:center}

/* ══ Pastilles sur l'enceinte ══ */
.lk-pill{position:absolute;display:flex;align-items:center;gap:8px;
  background:#fff;border-radius:99px;padding:9px 15px;white-space:nowrap;
  box-shadow:0 10px 28px -14px rgba(15,23,42,.38),0 0 0 1px rgba(15,23,42,.04);
  font-size:12.5px;font-weight:600;color:#111827}
.lk-pill svg{flex-shrink:0}
.lk-pill .dot{width:8px;height:8px;border-radius:50%;background:#10b981;flex-shrink:0}
.lk-pill.home{z-index:4;left:520px;top:60px;transform:translateX(-50%)}
.lk-pill.status{z-index:4;left:520px;top:548px;transform:translateX(-50%)}
.lk-pill .mut{color:#9ca3af;font-weight:500}

/* ══ Arrivée au scroll (même signature que les deux autres cartes) ══
   L'état masqué n'est posé que sous .lk-armed, une classe ajoutée par le JS
   uniquement s'il peut animer : sans JS ou en mouvement réduit, tout
   s'affiche normalement, rien n'est conditionné à l'animation. */
.lk-armed .lk-fit{opacity:0;transform:translate3d(0,80px,0) scale(.985);filter:blur(6px)}
.lk-in .lk-fit{opacity:1;transform:none;filter:blur(0);
  transition:transform 1100ms cubic-bezier(.22,1,.36,1) 160ms,
             opacity 620ms cubic-bezier(.22,1,.36,1) 160ms,
             filter 800ms cubic-bezier(.22,1,.36,1) 160ms}

@media (prefers-reduced-motion: reduce){
  .lk-orbit,.lk-counter{animation:none}
  .lk-ripple{animation:none;opacity:.25;transform:scale(1.4)}
  .lk-armed .lk-fit{opacity:1;transform:none;filter:none}
}
`;

export default function LocalSecurityMockup() {
  const stageRef = useRef<HTMLDivElement>(null);
  // Scroll-driven trigger (see useEnterOnScroll): IntersectionObserver fired
  // before the layout settled inside the sticky card, so the entrance ran off
  // screen and only showed up after scrolling back up and down.
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
  }, []);

  return (
    <>
      <style>{LK_CSS}</style>
      <div
        className={`lk-media w-full lg:h-full${armed ? " lk-armed" : ""}${playing ? " lk-in" : ""}`}
        ref={mediaRef}
      >
        <div className="lk-fit">
          <div className="lk-stage" ref={stageRef}>

            {/* anneaux, enceinte pointillée, nuage barré */}
            <svg className="lk-rings" viewBox="0 0 1040 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              {/* Épuré (client 2026-07-27) : les deux anneaux décoratifs
                  intérieurs ont été retirés, il ne reste que l'enceinte.
                  Traits en teal/ardoise, pas en blanc : la zone média est
                  transparente sur un fond de carte clair. */}
              <circle cx="520" cy="318" r="258" fill="none" stroke="rgba(13,148,136,.42)"
                strokeWidth="1.5" strokeDasharray="9 11" strokeLinecap="round" />
              {/* Le nuage barré a été retiré (client 2026-07-27). Le message
                  « rien ne sort » est déjà porté par l'enceinte fermée et par
                  la pastille « aucune donnée envoyée ». */}
            </svg>

            {/* onde de protection */}
            <div className="lk-ripple" />
            <div className="lk-ripple r2" />

            {/* fichiers en orbite (dans l'enceinte) */}
            <div className="lk-orbit">
              <div className="lk-sat" style={{ transform: "rotate(18deg) translate(190px)" }}>
                <div style={{ transform: "rotate(-18deg)" }}><div className="lk-counter">
                  <div className="lk-chip" style={{ width: 66 }}>
                    <div className="head xls">XLS</div>
                    <div className="lk-cells">
                      <i className="gg" /><i /><i />
                      <i className="g" /><i /><i className="g" />
                      <i /><i className="g" /><i />
                      <i className="g" /><i /><i />
                    </div>
                  </div>
                </div></div>
              </div>
              <div className="lk-sat" style={{ transform: "rotate(108deg) translate(190px)" }}>
                <div style={{ transform: "rotate(-108deg)" }}><div className="lk-counter">
                  <div className="lk-chip" style={{ width: 62 }}>
                    <div className="head pdf">PDF</div>
                    <div className="lk-lines"><i /><i className="short" /><i /><i className="red" /></div>
                  </div>
                </div></div>
              </div>
              <div className="lk-sat" style={{ transform: "rotate(198deg) translate(190px)" }}>
                <div style={{ transform: "rotate(-198deg)" }}><div className="lk-counter">
                  <div className="lk-chip" style={{ width: 66 }}>
                    <div className="head rpt">RAPPORT</div>
                    <div className="lk-bars">
                      <i style={{ height: "40%" }} /><i style={{ height: "70%" }} />
                      <i style={{ height: "52%" }} className="hi" /><i style={{ height: "88%" }} />
                      <i style={{ height: "62%" }} className="hi" />
                    </div>
                  </div>
                </div></div>
              </div>
              <div className="lk-sat" style={{ transform: "rotate(292deg) translate(190px)" }}>
                <div style={{ transform: "rotate(-292deg)" }}><div className="lk-counter">
                  <div className="lk-chip" style={{ width: 64 }}>
                    <div className="head csv">CSV</div>
                    <div className="lk-cells">
                      <i /><i className="g" /><i />
                      <i className="g" /><i /><i />
                      <i /><i /><i className="gg" />
                    </div>
                  </div>
                </div></div>
              </div>
            </div>

            {/* cadenas central */}
            <div className="lk-lockwrap">
              <div className="lk-tile">
                {/* Cadenas épuré (client 2026-07-27 : « pas fan du tout » de
                    la version à dégradés). Icône au trait : une seule
                    épaisseur, une seule couleur, aucun dégradé ni reflet. */}
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none"
                  stroke="#0d9488" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect x="4" y="10.5" width="16" height="10.5" rx="2.6" />
                  <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
                  <circle cx="12" cy="15.75" r="1.35" fill="#0d9488" stroke="none" />
                </svg>
              </div>
            </div>

            {/* pastilles */}
            <div className="lk-pill home">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
              Chez vous
            </div>
            <div className="lk-pill status">
              <span className="dot" />
              Exécution 100 % locale <span className="mut">· aucune donnée envoyée</span>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
