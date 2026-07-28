import { useEffect, useRef } from "react";
import { useEnterOnScroll } from "@/lib/useEnterOnScroll";

/**
 * SurMesureMockup — static visual for the "Sur-mesure" card ("Conçu pour votre
 * métier, pas pour tout le monde"), replacing its demo clip.
 *
 * Ported from the supplied brief + `sur-mesure-composition.html` (2026-07-26).
 * It tells the tailoring story in one image:
 *   A · the client's handwritten brief, taped down, one phrase circled and one
 *       underlined, signed "Cabinet Valmy",
 *   ↳ a dashed thread with sparkles: the brief goes into Ora,
 *   B · the Ora window: "Rapprochement bancaire" + gradient "Sur mesure" badge,
 *       and THREE steps repeating the brief word for word, each "Configuré" —
 *       the whole point: we reproduce your process as it is,
 *   · the "Livrée en 4 jours" pill on the window corner,
 *   C · the pressed "Lancer" button under the macOS cursor.
 *
 * Per the brief, do NOT reposition the absolutely-placed elements inside
 * `.sm-stage` (the composition is pixel-calibrated), do not swap the SVG
 * cursor for an image, and do not "fix" the pressed state of the Lancer button
 * (scale(.97) + ring: it must look clicked). Authorised adaptations applied
 * here: media radius aligned on the site's other media zones (20px) and Inter
 * first in the stage font stack. The handwriting stack is left untouched.
 *
 * A fixed 1040×640 scene scaled to the media zone by a ResizeObserver, so it
 * stays identical to the pixel at every size (same pattern as the other Ora
 * mockups).
 */

const SM_CSS = `
/* ══ Visuel « Sur-mesure » — brief client → automatisation Ora ══ */
/* Zone média TRANSPARENTE : la composition flotte directement sur le fond de
   la carte (demande client 2026-07-26, qui remplace le fond indigo du brief).
   Conséquence : tout ce qui était blanc pour ressortir sur l'indigo (fil,
   halo) passe en bleu de marque, et les ombres, calculées pour un fond
   sombre, sont adoucies pour un fond clair. */
/* overflow:hidden conservé même sans fond : c'est lui qui rogne la fenêtre par
   le bas (effet voulu par le brief). Sans lui, le rognage dépendrait du bord
   de la carte, donc de la taille d'écran. */
.sm-media{position:relative;aspect-ratio:1040/640;
  overflow:hidden;isolation:isolate;background:transparent}
/* trame « plan sur mesure » (quadrillage discret, estompé sur les bords) */
.sm-media::before{content:'';position:absolute;inset:0;z-index:0;
  background:
    repeating-linear-gradient(0deg,rgba(59,130,246,.07) 0 1px,transparent 1px 34px),
    repeating-linear-gradient(90deg,rgba(59,130,246,.07) 0 1px,transparent 1px 34px);
  -webkit-mask-image:radial-gradient(85% 85% at 50% 45%,#000 40%,transparent 100%);
  mask-image:radial-gradient(85% 85% at 50% 45%,#000 40%,transparent 100%)}

/* Scène à échelle fixe (1040×640), mise à l'échelle par le ResizeObserver */
.sm-fit{position:absolute;inset:0;z-index:1}
.sm-stage{position:absolute;left:50%;top:0;width:1040px;height:640px;
  transform-origin:top center;
  font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  color:#111827;-webkit-font-smoothing:antialiased}

/* halo doux derrière la fenêtre (blanc laiteux : lisible sur fond clair) */
.sm-blob{position:absolute;z-index:0;left:470px;top:30px;width:560px;height:560px;
  border-radius:50%;
  background:radial-gradient(circle at 45% 35%,rgba(255,255,255,.85),rgba(255,255,255,.35) 58%,transparent 76%)}

/* ══ A · Brief du client (papier manuscrit) ══ */
.sm-brief{position:absolute;z-index:2;left:54px;top:122px;width:318px;
  background:#fffdfa;border-radius:14px;padding:26px 26px 20px;
  transform:rotate(-2deg);
  box-shadow:0 2px 6px rgba(15,23,42,.10),0 24px 60px -22px rgba(15,23,42,.34)}
/* Ruban adhésif : translucide bleuté (sur fond clair, un ruban blanc
   disparaîtrait complètement). */
.sm-tape{position:absolute;left:50%;top:-13px;width:96px;height:27px;
  transform:translateX(-50%) rotate(-3deg);
  background:linear-gradient(rgba(147,178,240,.45),rgba(147,178,240,.30));
  border:1px solid rgba(255,255,255,.75);border-radius:2px;
  box-shadow:0 2px 8px rgba(15,23,42,.12)}
.sm-brief .eyebrow{font-size:10.5px;font-weight:700;letter-spacing:.14em;
  text-transform:uppercase;color:#93a0c4;margin-bottom:10px}
.sm-hand{font-family:'Bradley Hand','Marker Felt','Segoe Print','Comic Sans MS',cursive;
  color:#223058;font-size:18px;line-height:1.75}
.sm-hand .t{font-size:19px;margin-bottom:6px}
.sm-hand .row{display:flex;gap:9px;align-items:baseline}
.sm-hand .row .a{color:#3b82f6;flex-shrink:0}
.sm-hand .sig{text-align:right;margin-top:12px;font-size:16px;color:#4a5a8a}
/* mot entouré au feutre */
.sm-circled{position:relative;display:inline-block;padding:0 3px}
.sm-circled::after{content:'';position:absolute;left:-5px;right:-5px;top:-2px;bottom:-3px;
  border:2px solid rgba(59,130,246,.75);border-radius:50%;
  transform:rotate(-3deg)}
/* mot souligné à la main */
.sm-wavy{text-decoration:underline wavy rgba(59,130,246,.75);
  text-decoration-thickness:2px;text-underline-offset:5px}

/* ══ Fil « reproduit à l'identique » (brief → fenêtre) ══ */
.sm-thread{position:absolute;z-index:2;left:0;top:0;width:1040px;height:640px;
  pointer-events:none}

/* ══ B · Fenêtre Ora ══ */
.sm-win{position:absolute;z-index:3;left:452px;top:96px;width:528px;height:566px;
  border-radius:12px;background:#fff;overflow:hidden;
  box-shadow:0 2px 6px rgba(15,23,42,.12),0 26px 70px -28px rgba(15,23,42,.40),0 60px 120px -50px rgba(15,23,42,.30)}
.sm-titlebar{position:relative;display:flex;align-items:center;height:40px;
  background:linear-gradient(#fbfbfa,#f4f4f3);border-bottom:1px solid #e3e3e0}
.sm-lights{display:flex;gap:8px;padding:0 14px}
.sm-lights span{width:12px;height:12px;border-radius:50%}
.sm-lights .r{background:#ff5f57;border:.5px solid #e0443e}
.sm-lights .y{background:#febc2e;border:.5px solid #d89c22}
.sm-lights .g{background:#28c840;border:.5px solid #1eaa33}
.sm-tbtitle{position:absolute;left:0;right:0;text-align:center;
  font-size:12.5px;font-weight:600;color:#4b5563}
.sm-body{height:calc(100% - 40px);background:#fcfbf7;padding:16px 16px 0;
  display:flex;flex-direction:column;gap:11px}

/* carte principale de l'automatisation */
.sm-auto{display:flex;align-items:center;gap:13px;background:#fff;
  border:1px solid #e5e7eb;border-radius:14px;padding:14px 15px;
  box-shadow:0 1px 3px rgba(15,23,42,.04),0 8px 24px -12px rgba(15,23,42,.10)}
.sm-auto .ic{width:40px;height:40px;border-radius:12px;flex-shrink:0;
  background:linear-gradient(135deg,#3b82f6,#0d9488);color:#fff;
  display:grid;place-items:center;
  box-shadow:0 4px 14px rgba(59,130,246,.35)}
.sm-auto .t{font-size:14.5px;font-weight:600}
.sm-auto .s{font-size:11.5px;color:#6b7280;margin-top:3px}
.sm-badge-grad{margin-left:auto;flex-shrink:0;font-size:10.5px;font-weight:700;
  color:#fff;background:linear-gradient(90deg,#3b82f6,#0d9488);
  border-radius:99px;padding:5px 11px;letter-spacing:.03em;
  box-shadow:0 2px 10px rgba(13,148,136,.30)}

.sm-eyebrow{display:flex;align-items:center;gap:7px;font-size:11px;font-weight:700;
  color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-top:3px}
.sm-eyebrow svg{color:#3b82f6}

/* étapes configurées (mêmes mots que le brief) */
.sm-step{display:flex;align-items:center;gap:12px;background:#fff;
  border:1px solid #e5e7eb;border-radius:13px;padding:11px 14px;
  box-shadow:0 1px 3px rgba(15,23,42,.04),0 8px 24px -12px rgba(15,23,42,.10)}
.sm-step .tile{width:34px;height:34px;border-radius:9px;background:#eff6ff;color:#3b82f6;
  display:grid;place-items:center;flex-shrink:0}
.sm-step .t{font-size:13px;font-weight:600}
.sm-step .s{font-size:11px;color:#6b7280;margin-top:2px}
.sm-ok{margin-left:auto;flex-shrink:0;display:inline-flex;align-items:center;gap:5px;
  font-size:10.5px;font-weight:700;color:#059669;background:#ecfdf5;
  border-radius:99px;padding:4px 10px}
.sm-foot{display:flex;align-items:center;gap:8px;margin-top:2px;padding:9px 5px;
  font-size:11.5px;color:#6b7280}
.sm-foot .dot{width:7px;height:7px;border-radius:50%;background:#10b981;flex-shrink:0}

/* ══ pastille « Livrée en 4 jours » ══ */
.sm-delivered{position:absolute;z-index:4;left:852px;top:70px;
  display:flex;align-items:center;gap:8px;background:#fff;border-radius:12px;
  padding:9px 14px;box-shadow:0 12px 30px -14px rgba(15,23,42,.38)}
.sm-delivered svg{color:#3b82f6;flex-shrink:0}
.sm-delivered .t1{font-size:11.5px;font-weight:700;color:#111827;white-space:nowrap}
.sm-delivered .t2{font-size:9.5px;color:#9ca3af;margin-top:1px;white-space:nowrap}

/* ══ C · Bouton « Lancer » pressé + curseur ══ */
.sm-run{position:absolute;z-index:5;left:672px;top:502px;
  display:inline-flex;align-items:center;gap:12px;height:64px;padding:0 32px;
  border-radius:999px;background:#2563eb;color:#fff;
  font-size:21px;font-weight:700;letter-spacing:-.01em;
  box-shadow:0 0 0 7px rgba(96,165,250,.32),0 20px 46px -18px rgba(15,23,42,.42),0 6px 20px rgba(37,99,235,.40);
  transform:scale(.97)}
.sm-cursor{position:absolute;z-index:6;left:822px;top:544px;width:62px;height:62px;
  filter:drop-shadow(0 6px 14px rgba(15,23,42,.35))}

/* ══════════════════════════════════════════════════════════════════
   CHORÉGRAPHIE D'ARRIVÉE (client 2026-07-26)
   Les pièces entrent dans l'ordre du récit : le halo pose la scène, la
   note du client arrive par la gauche, la fenêtre monte, le fil se trace
   vers elle, les étincelles éclatent puis scintillent, les étapes se
   configurent une à une, et enfin la livraison + le clic.

   Sécurité : l'état masqué n'est appliqué QUE sous .sm-armed, une classe
   posée par le JS uniquement s'il peut animer. Sans JS, ou en mouvement
   réduit, tout s'affiche normalement, rien n'est conditionné à l'animation.
   ══════════════════════════════════════════════════════════════════ */
.sm-armed .sm-blob,
.sm-armed .sm-brief,
.sm-armed .sm-win,
.sm-armed .sm-delivered,
.sm-armed .sm-run,
.sm-armed .sm-cursor,
.sm-armed .sm-spark,
.sm-armed .sm-auto,
.sm-armed .sm-eyebrow,
.sm-armed .sm-step,
.sm-armed .sm-foot{opacity:0}
.sm-armed .sm-clip{transform:scaleX(0)}

/* 1 · le halo pose la scène */
@keyframes smBlob{from{opacity:0;transform:scale(.86)}to{opacity:1;transform:scale(1)}}
.sm-in .sm-blob{animation:smBlob 900ms cubic-bezier(.22,1,.36,1) 40ms both}

/* 2 · la note du client glisse depuis la gauche et se pose de travers */
@keyframes smBrief{from{opacity:0;transform:translate3d(-44px,16px,0) rotate(-7deg)}
  to{opacity:1;transform:translate3d(0,0,0) rotate(-2deg)}}
.sm-in .sm-brief{animation:smBrief 820ms cubic-bezier(.22,1,.36,1) 120ms both}

/* 3 · la fenêtre monte */
@keyframes smWin{from{opacity:0;transform:translate3d(0,54px,0) scale(.985)}
  to{opacity:1;transform:none}}
.sm-in .sm-win{animation:smWin 900ms cubic-bezier(.22,1,.36,1) 300ms both}

/* 4 · le fil se trace de la note vers la fenêtre (masque qui s'ouvre) */
@keyframes smDraw{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.sm-in .sm-clip{animation:smDraw 620ms cubic-bezier(.4,0,.2,1) 420ms both;
  transform-box:fill-box;transform-origin:left center}

/* 5 · les étincelles éclatent puis scintillent en boucle */
@keyframes smPop{0%{opacity:0;transform:scale(.3)}60%{opacity:1;transform:scale(1.28)}
  100%{opacity:.9;transform:scale(1)}}
@keyframes smTwinkle{0%,100%{opacity:.4;transform:scale(.9)}50%{opacity:1;transform:scale(1.15)}}
.sm-spark{transform-box:fill-box;transform-origin:center}
.sm-in .sm-spark1{animation:smPop 500ms cubic-bezier(.2,1.5,.4,1) 700ms both,
  smTwinkle 2.8s ease-in-out 1.4s infinite}
.sm-in .sm-spark2{animation:smPop 500ms cubic-bezier(.2,1.5,.4,1) 810ms both,
  smTwinkle 3.3s ease-in-out 1.7s infinite}

/* 6 · le contenu de la fenêtre se configure ligne à ligne */
@keyframes smRow{from{opacity:0;transform:translate3d(0,13px,0)}to{opacity:1;transform:none}}
.sm-in .sm-auto{animation:smRow 540ms cubic-bezier(.22,1,.36,1) 520ms both}
.sm-in .sm-eyebrow{animation:smRow 500ms cubic-bezier(.22,1,.36,1) 600ms both}
.sm-in .sm-s1{animation:smRow 520ms cubic-bezier(.22,1,.36,1) 660ms both}
.sm-in .sm-s2{animation:smRow 520ms cubic-bezier(.22,1,.36,1) 740ms both}
.sm-in .sm-s3{animation:smRow 520ms cubic-bezier(.22,1,.36,1) 820ms both}
.sm-in .sm-foot{animation:smRow 500ms cubic-bezier(.22,1,.36,1) 900ms both}

/* 7 · la pastille de livraison arrive en pop */
@keyframes smPill{from{opacity:0;transform:translate3d(12px,-12px,0) scale(.9)}
  to{opacity:1;transform:none}}
.sm-in .sm-delivered{animation:smPill 600ms cubic-bezier(.2,1.4,.4,1) 960ms both}

/* 8 · le bouton se pose déjà pressé, le curseur le rejoint */
@keyframes smRun{0%{opacity:0;transform:scale(.82)}60%{opacity:1;transform:scale(1.03)}
  100%{opacity:1;transform:scale(.97)}}
.sm-in .sm-run{animation:smRun 560ms cubic-bezier(.2,1.4,.4,1) 1040ms both}
@keyframes smCur{from{opacity:0;transform:translate3d(20px,20px,0)}to{opacity:1;transform:none}}
.sm-in .sm-cursor{animation:smCur 540ms cubic-bezier(.22,1,.36,1) 1120ms both}

@media (prefers-reduced-motion:reduce){
  .sm-armed .sm-blob,.sm-armed .sm-brief,.sm-armed .sm-win,.sm-armed .sm-delivered,
  .sm-armed .sm-run,.sm-armed .sm-cursor,.sm-armed .sm-spark,.sm-armed .sm-auto,
  .sm-armed .sm-eyebrow,.sm-armed .sm-step,.sm-armed .sm-foot{opacity:1}
  .sm-armed .sm-clip{transform:none}
}
`;

export default function SurMesureMockup() {
  const stageRef = useRef<HTMLDivElement>(null);
  // Scroll-driven trigger (see useEnterOnScroll): IntersectionObserver fired
  // before the layout settled inside the sticky card, so the choreography ran
  // off screen and only showed up after scrolling back up and down.
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

  // Plays the choreography when the visual scrolls into view; replays when the
  // reader goes back above it.
  return (
    <>
      <style>{SM_CSS}</style>
      {/* `lg:h-full` lets the visual fill the card height like the other media
          zones; an explicit height wins over aspect-ratio, so the scene simply
          scales to whichever box it gets. */}
      <div
        className={`sm-media w-full lg:h-full${armed ? " sm-armed" : ""}${playing ? " sm-in" : ""}`}
        ref={mediaRef}
      >
        <div className="sm-fit">
          <div className="sm-stage" ref={stageRef}>
            <div className="sm-blob" />

            {/* A · Le brief du client, avec ses mots */}
            <div className="sm-brief">
              <div className="sm-tape" />
              <div className="eyebrow">Votre processus</div>
              <div className="sm-hand">
                <div className="t">Notre pointage, chaque mois :</div>
                <div className="row"><span className="a">→</span><span>export banque <span className="sm-circled">tous les lundis</span></span></div>
                <div className="row"><span className="a">→</span><span>pointage avec le <span className="sm-wavy">grand livre</span></span></div>
                <div className="row"><span className="a">→</span><span>relance si écart &gt; 50 €</span></div>
                <div className="sig">Cabinet Valmy</div>
              </div>
            </div>

            {/* Fil brief → fenêtre */}
            <svg className="sm-thread" viewBox="0 0 1040 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              {/* Le masque s'ouvre de gauche à droite : le fil se trace depuis
                  la note vers la fenêtre. */}
              <defs>
                <clipPath id="sm-threadReveal">
                  <rect className="sm-clip" x="368" y="222" width="112" height="100" />
                </clipPath>
              </defs>
              {/* Bleu de marque, pas blanc : la zone média est désormais
                  transparente sur un fond de carte clair. */}
              <g clipPath="url(#sm-threadReveal)">
                <path d="M 380 296 C 416 310, 428 264, 458 246" fill="none"
                  stroke="rgba(59,130,246,.8)" strokeWidth="2.4"
                  strokeDasharray="7 9" strokeLinecap="round" />
                <path d="M 450 253 L 464 242 L 453 237" fill="none"
                  stroke="rgba(59,130,246,.9)" strokeWidth="2.4"
                  strokeLinecap="round" strokeLinejoin="round" />
              </g>
              <path className="sm-spark sm-spark1"
                d="M 414 250 l 2.4 6 6 2.4 -6 2.4 -2.4 6 -2.4 -6 -6 -2.4 6 -2.4 z"
                fill="#3b82f6" opacity=".9" />
              <path className="sm-spark sm-spark2"
                d="M 396 306 l 1.8 4.4 4.4 1.8 -4.4 1.8 -1.8 4.4 -1.8 -4.4 -4.4 -1.8 4.4 -1.8 z"
                fill="#0d9488" opacity=".6" />
            </svg>

            {/* B · La fenêtre Ora : l'automatisation construite à l'identique */}
            <div className="sm-win">
              <div className="sm-titlebar">
                <div className="sm-lights"><span className="r" /><span className="y" /><span className="g" /></div>
                <div className="sm-tbtitle">Ora · Cabinet Valmy</div>
              </div>
              <div className="sm-body">

                <div className="sm-auto">
                  <div className="ic">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M17 2v4H7a4 4 0 0 0-4 4v1" /><path d="m13 22 4-4-4-4" /><path d="M7 22v-4h10a4 4 0 0 0 4-4v-1" /><path d="m11 2-4 4 4 4" transform="translate(10 0) scale(-1 1) translate(-10 0)" /></svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="t">Rapprochement bancaire</div>
                    <div className="s">Automatisation créée pour votre cabinet</div>
                  </div>
                  <span className="sm-badge-grad">Sur mesure</span>
                </div>

                <div className="sm-eyebrow">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round"><path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3z" /></svg>
                  Construit depuis votre brief
                </div>

                <div className="sm-step sm-s1">
                  <div className="tile">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="t">Export bancaire</div>
                    <div className="s">Tous les lundis, 9h00</div>
                  </div>
                  <span className="sm-ok">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                    Configuré
                  </span>
                </div>

                <div className="sm-step sm-s2">
                  <div className="tile">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="t">Pointage avec le grand livre</div>
                    <div className="s">1 200 lignes rapprochées en 40 s</div>
                  </div>
                  <span className="sm-ok">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                    Configuré
                  </span>
                </div>

                <div className="sm-step sm-s3">
                  <div className="tile">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="t">Relance des écarts</div>
                    <div className="s">Si écart supérieur à 50 €</div>
                  </div>
                  <span className="sm-ok">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                    Configuré
                  </span>
                </div>

                <div className="sm-foot">
                  <span className="dot" />
                  Dernière exécution : lundi 9h02 · 3 écarts relancés
                </div>

              </div>
            </div>

            {/* pastille livraison */}
            <div className="sm-delivered">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></svg>
              <div>
                <div className="t1">Livrée en 4 jours</div>
                <div className="t2">Sans changer vos outils</div>
              </div>
            </div>

            {/* C · Bouton « Lancer » pressé + curseur */}
            <div className="sm-run">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5-13-7.5z" /></svg>
              Lancer
            </div>
            <svg className="sm-cursor" viewBox="0 0 32 32">
              <path d="M9 4 L9 27 L14.6 21.6 L18 29.4 L22.4 27.4 L19 19.8 L26.6 19.8 Z"
                fill="#0b0b0f" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" />
            </svg>

          </div>
        </div>
      </div>
    </>
  );
}
