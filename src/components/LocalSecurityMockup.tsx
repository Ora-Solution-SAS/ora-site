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

/* L'onde de protection qui partait du centre a été SUPPRIMÉE (client
   2026-07-30 : « ce rond-là qui part du logo central, il est moche »). */

/* ══ Respiration : les bulles rentrent dans le logo, puis ressortent ══
   Une couche à part, car .lk-orbit occupe déjà sa propre propriété transform
   avec la rotation lente : deux animations ne peuvent pas écrire la même
   propriété sur le même élément. L'origine est posée sur le centre exact de la
   scène, donc réduire l'échelle fait converger toutes les bulles vers le logo
   Ora plutôt que vers le coin de la couche. */
.lk-gather{position:absolute;z-index:2;inset:0;transform-origin:520px 318px}
@keyframes lkGather{
  0%,44%{transform:scale(1);opacity:1}
  57%{transform:scale(.05);opacity:0}
  63%{transform:scale(.05);opacity:0}
  77%{transform:scale(1);opacity:1}
  100%{transform:scale(1);opacity:1}}

/* ══ Orbite des fichiers (ils tournent, restent droits) ══ */
.lk-orbit{position:absolute;left:330px;top:128px;width:380px;height:380px}
/* Enveloppes de TAILLE NULLE : l'origine de chaque rotation tombe alors
   exactement sur le point d'orbite. Avec des boîtes dimensionnées, la
   contre-rotation pivoterait autour du centre de la boîte et décalerait la
   bulle au lieu de la redresser sur place. La bulle est ensuite posée en
   absolu, centrée sur ce point. */
.lk-sat{position:absolute;left:50%;top:50%;width:0;height:0}
.lk-sat>div{width:0;height:0}
.lk-counter{width:0;height:0}
@keyframes lkSpin{to{transform:rotate(360deg)}}
@keyframes lkSpinRev{to{transform:rotate(-360deg)}}

/* ══ Bulles de format (refonte client 2026-07-30, référence iCloud d'Apple) ══
   Les mini-fiches blanches et l'enceinte en pointillés sont remplacées par des
   bulles rondes. Tailles VOLONTAIREMENT inégales et distances variées : c'est
   ce qui donne la grappe vivante d'Apple plutôt qu'une rosace régulière.
   Bulles BLANCHES et non colorées : elles portent les logos fournis par le
   client (public/filetypes/), qui sont des JPG sur fond blanc. Sur une bulle
   teintée, chaque logo afficherait son carré blanc d'origine. C'est le même
   parti pris que la rangée d'icônes en haut de la carte. */
.lk-bub{position:absolute;display:grid;place-items:center;overflow:hidden;
  border-radius:50%;background:#fff;
  box-shadow:0 18px 34px -14px rgba(15,23,42,.34),0 3px 10px -4px rgba(15,23,42,.16),
             0 0 0 1px rgba(15,23,42,.05)}
.lk-bub img{display:block;object-fit:contain;user-select:none}
/* Deux petites bulles muettes, uniquement pour casser la régularité. */
.lk-dot{position:absolute;border-radius:50%;box-shadow:0 10px 20px -10px rgba(15,23,42,.3)}
.lk-dot.b{background:linear-gradient(160deg,#a9c9ff,#7fa8f5)}
.lk-dot.t{background:linear-gradient(160deg,#a5e5df,#6fc9c1)}

/* ══ Bulle centrale : le logo Ora ══ */
.lk-lockwrap{position:absolute;z-index:3;left:520px;top:318px;width:0;height:0}
.lk-core{position:absolute;left:-98px;top:-98px;width:196px;height:196px;border-radius:50%;
  background:#ffffff;
  box-shadow:0 26px 60px -22px rgba(15,23,42,.30),0 4px 14px -6px rgba(15,23,42,.14),
             0 0 0 1px rgba(15,23,42,.04);
  display:grid;place-items:center}
/* Le logo se retourne pendant que les bulles sont rentrées : il « se refait »
   au creux de la boucle, puis les bulles ressortent. Synchronisé sur les mêmes
   13 s que .lk-gather. */
.lk-core img{width:96px;height:auto;display:block;user-select:none}
@keyframes lkCoreSpin{
  0%,50%{transform:rotate(0deg) scale(1)}
  60%{transform:rotate(200deg) scale(1.14)}
  70%{transform:rotate(360deg) scale(1)}
  100%{transform:rotate(360deg) scale(1)}}
/* Le disque blanc respire très légèrement à l'instant où les bulles le
   rejoignent : sans ça, l'arrivée ne se voit pas. */

@keyframes lkCorePulse{
  0%,52%{transform:scale(1)}
  58%{transform:scale(1.07)}
  68%{transform:scale(1)}
  100%{transform:scale(1)}}

/* ══ Pastilles sur l'enceinte ══ */
.lk-pill{position:absolute;display:flex;align-items:center;gap:8px;
  background:#fff;border-radius:99px;padding:9px 15px;white-space:nowrap;
  box-shadow:0 10px 28px -14px rgba(15,23,42,.38),0 0 0 1px rgba(15,23,42,.04);
  font-size:12.5px;font-weight:600;color:#111827}
.lk-pill svg{flex-shrink:0}
.lk-pill .dot{width:8px;height:8px;border-radius:50%;background:#10b981;flex-shrink:0}
/* Remontée de 60 à 10 px (client 2026-07-30) : la pastille recouvrait les
   bulles à chaque passage au sommet de l'orbite. Elle occupe désormais la
   bande 10-47, et les rayons plus bas sont bornés pour qu'aucune bulle ne
   monte au-dessus de 57. */
.lk-pill.home{z-index:4;left:520px;top:10px;transform:translateX(-50%)}
.lk-pill.status{z-index:4;left:520px;top:548px;transform:translateX(-50%)}
.lk-pill .mut{color:#9ca3af;font-weight:500}

/* ══ Départ des animations de logos, à l'ARRIVÉE de la carte ══════════════
   Client 2026-08-03 : « j'aimerais que les animations de logo arrivent quand
   l'utilisateur scrolle vers le bas et que l'encadré a quasi fini de monter ».
   Elles étaient déclarées en infinite sur les sélecteurs de base, donc elles
   tournaient dès le CHARGEMENT de la page : en arrivant sur la carte, le cycle
   de 13 s était à une phase quelconque, souvent bulles déjà rentrées dans le
   logo. On ne voyait donc jamais la chorégraphie depuis son début.
   Elles ne démarrent maintenant que sous .lk-in, posé quand la carte entre
   réellement à l'écran, et avec 950 ms de retard : la montée de la carte dure
   1 100 ms après 160 ms d'attente, donc à 950 ms elle est quasi terminée, ce qui
   est exactement le moment demandé.
   Effet de bord bienvenu : plus rien ne tourne tant que la carte n'a pas été
   vue, au lieu de trois animations en boucle depuis le chargement. */
.lk-in .lk-gather{animation:lkGather 13s cubic-bezier(.65,0,.35,1) 950ms infinite}
.lk-in .lk-orbit{animation:lkSpin 80s linear 950ms infinite}
.lk-in .lk-counter{animation:lkSpinRev 80s linear 950ms infinite}
.lk-in .lk-core{animation:lkCorePulse 13s cubic-bezier(.65,0,.35,1) 950ms infinite}
.lk-in .lk-core img{animation:lkCoreSpin 13s cubic-bezier(.65,0,.35,1) 950ms infinite}

/* ══ Arrivée au scroll (même signature que les deux autres cartes) ══
   L'état masqué n'est posé que sous .lk-armed, une classe ajoutée par le JS
   uniquement s'il peut animer : sans JS ou en mouvement réduit, tout
   s'affiche normalement, rien n'est conditionné à l'animation. */
/* Flou animé RETIRÉ (2026-08-03) : filter: blur() en transition force une
   re-rastérisation floutée de toute la composition à chaque image pendant
   800 ms, c'est l'un des effets les plus coûteux qui existent. Le mouvement et
   le fondu portent déjà l'arrivée. Même retrait que sur les cartes de
   StackingCards. */
.lk-armed .lk-fit{opacity:0;transform:translate3d(0,80px,0) scale(.985)}
.lk-in .lk-fit{opacity:1;transform:none;
  transition:transform 1100ms cubic-bezier(.22,1,.36,1) 160ms,
             opacity 620ms cubic-bezier(.22,1,.36,1) 160ms}

@media (prefers-reduced-motion: reduce){
  .lk-orbit,.lk-counter,.lk-gather,.lk-core,.lk-core img{animation:none}
  .lk-armed .lk-fit{opacity:1;transform:none;filter:none}
}
`;

/**
 * Les quatre formats, avec les logos FOURNIS PAR LE CLIENT (public/filetypes/),
 * exactement ceux de la rangée d'icônes en haut de la carte. Rien n'est
 * redessiné ici.
 *
 * `imgScale` reprend les proportions de cette rangée : le fichier Excel embarque
 * plus de marge blanche que les autres dans son image, il faut donc l'agrandir
 * pour qu'il paraisse de la même taille.
 *
 * Tailles de bulle et distances inégales à dessein : une rosace parfaitement
 * régulière fait diagramme, pas grappe.
 */
/**
 * Rayons BORNÉS (client 2026-07-30) : la pastille « Chez vous » occupe la bande
 * 10-47 en haut de la scène, dont le centre est à y = 318. Pour qu'aucune bulle
 * ne vienne se glisser dessous en passant au sommet de son orbite, il faut donc
 * `rayon + taille / 2 <= 261`. Les tailles, elles, restent volontairement
 * inégales : c'est déjà elles qui portent l'essentiel de l'irrégularité.
 */
const BUBBLES = [
  { src: "/filetypes/excel.jpg", alt: "Excel", imgScale: 0.92, angle: 20, radius: 206, size: 106 },
  { src: "/filetypes/pdf.jpg", alt: "PDF", imgScale: 0.74, angle: 102, radius: 213, size: 92 },
  { src: "/filetypes/powerpoint.jpg", alt: "PowerPoint", imgScale: 0.74, angle: 190, radius: 200, size: 88 },
  { src: "/filetypes/csv.png", alt: "CSV", imgScale: 0.74, angle: 284, radius: 209, size: 98 },
] as const;

/** Pastilles décoratives, sans contenu, soumises à la même borne. */
const DOTS = [
  { angle: 58, radius: 238, size: 38, tone: "b" },
  { angle: 152, radius: 244, size: 26, tone: "t" },
  { angle: 244, radius: 240, size: 32, tone: "t" },
  { angle: 332, radius: 246, size: 22, tone: "b" },
] as const;

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

            {/* L'enceinte en pointillés a été RETIRÉE (client 2026-07-30 :
                « deux cercles avec des tirets, ça rend moche »). Elle est
                remplacée par un halo très diffus, qui rassemble la grappe sans
                tracer de trait. Le message « rien ne sort » reste porté par les
                deux pastilles. */}
            <div
              aria-hidden
              style={{
                position: "absolute", zIndex: 0, left: 520, top: 318,
                width: 620, height: 620, margin: "-310px 0 0 -310px", borderRadius: "50%",
                background: "radial-gradient(circle at 50% 50%, rgba(13,148,136,.10) 0%, rgba(59,130,246,.07) 42%, transparent 70%)",
              }}
            />

            {/* Bulles de format en orbite. Le triple emboîtement (rotation,
                contre-rotation figée, .lk-counter animé) est conservé tel quel :
                c'est lui qui fait tourner la grappe tout en gardant chaque
                bulle DROITE. La couche .lk-gather par-dessus les fait converger
                vers le logo puis ressortir. */}
            <div className="lk-gather">
              <div className="lk-orbit">
                {BUBBLES.map((b) => (
                  <div key={b.alt} className="lk-sat" style={{ transform: `rotate(${b.angle}deg) translate(${b.radius}px)` }}>
                    <div style={{ transform: `rotate(${-b.angle}deg)` }}><div className="lk-counter">
                      <div
                        className="lk-bub"
                        style={{ width: b.size, height: b.size, left: -b.size / 2, top: -b.size / 2 }}
                      >
                        <img
                          src={b.src}
                          alt={b.alt}
                          draggable={false}
                          style={{ width: b.size * b.imgScale, height: b.size * b.imgScale }}
                        />
                      </div>
                    </div></div>
                  </div>
                ))}
                {/* Petites bulles muettes : elles cassent la régularité de la
                    rosace, exactement comme les petites pastilles d'Apple. */}
                {DOTS.map((d, i) => (
                  <div key={i} className="lk-sat" style={{ transform: `rotate(${d.angle}deg) translate(${d.radius}px)` }}>
                    <div style={{ transform: `rotate(${-d.angle}deg)` }}><div className="lk-counter">
                      <div
                        className={`lk-dot ${d.tone}`}
                        style={{ width: d.size, height: d.size, left: -d.size / 2, top: -d.size / 2 }}
                      />
                    </div></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bulle centrale : le logo Ora, à la place du cadenas. */}
            <div className="lk-lockwrap">
              <div className="lk-core">
                <img src="/logos/icon-color.png" alt="" aria-hidden draggable={false} />
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
