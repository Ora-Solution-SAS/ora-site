import { useEffect, useRef } from "react";
import { useLang } from "@/lib/i18n";

/**
 * OraAppScene — l'interface RÉELLE du logiciel Ora, en plein cadre, comme
 * visuel de hero (client 2026-07-28, référence monday.com : « directement une
 * interface de logiciel », plus l'Excel avec l'extension à côté).
 *
 * Réplique fidèle de la capture fournie par le client (écran « Accueil ») :
 * barre latérale Ora + Navigation + carte Ora Engineering, en-tête Messages /
 * Notifications / avatar, accueil « Heureux de vous revoir », grande carte
 * bleue « Ouvrir un fichier », ACCÈS RAPIDE à trois cartes, et la liste
 * REPRENDRE avec ses badges d'état.
 *
 * Deux enrichissements par rapport à la capture, dans l'esprit du hero de
 * monday.com :
 *   · les tuiles d'icônes prennent des teintes distinctes (bleu / violet /
 *     ambre) au lieu du bleu uniforme, ce qui donne le relief coloré ;
 *   · des pastilles flottantes racontent l'histoire ENTRÉE → SORTIE : un
 *     fichier .xlsx entre dans l'application, puis les livrables générés
 *     apparaissent un par un. C'est ce qui fait comprendre en trois secondes
 *     qu'on dépose un Excel et qu'Ora en produit quelque chose.
 *
 * Même patron que les autres visuels du site : scène fixe de 1180×720 mise à
 * l'échelle par un ResizeObserver, classes préfixées `.oa-`.
 */

const W = 1180, H = 720;

/** Liste « Reprendre » — fichiers de la capture client. */
const FILES: { name: string; meta: string; kind: "xlsx" | "txt"; state: "run" | "todo" }[] = [
  { name: "01_grand_livre_client_a_nettoyer", meta: "XLSX · il y a 7 h", kind: "xlsx", state: "run" },
  { name: "demo_petit_5k_2024_N_studio (2)", meta: "XLSX · il y a 7 h", kind: "xlsx", state: "todo" },
  { name: "FEC_demo_petit_5k_2024_N", meta: "TXT · il y a 7 h", kind: "txt", state: "todo" },
  { name: "FEC_demo_2024_398k_lignes (2)", meta: "XLSX · 20 juil.", kind: "xlsx", state: "todo" },
];

const OA_CSS = `
/* ══ Interface Ora — visuel de hero ══ */
.oa-media{position:relative;width:100%;height:100%}
.oa-stage{position:absolute;left:50%;top:0;width:${W}px;height:${H}px;transform-origin:top center;
  font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  color:#111827;-webkit-font-smoothing:antialiased;text-align:left}

/* Fenêtre macOS */
.oa-win{position:absolute;inset:0;border-radius:18px;overflow:hidden;background:#fff;display:flex;
  flex-direction:column;
  box-shadow:0 2px 6px rgba(15,23,42,.10),0 40px 90px -30px rgba(15,23,42,.42),0 0 0 1px rgba(15,23,42,.05)}
.oa-title{height:38px;flex-shrink:0;display:flex;align-items:center;justify-content:center;
  background:#f7f7f8;border-bottom:1px solid #ececef;font-size:12.5px;font-weight:600;color:#3f4652}
.oa-dots{position:absolute;left:14px;top:13px;display:flex;gap:7px}
.oa-dots i{width:11px;height:11px;border-radius:50%;display:block}
.oa-body{flex:1;display:flex;min-height:0}

/* ── Barre latérale ── */
.oa-side{width:250px;flex-shrink:0;background:#fbfbfc;border-right:1px solid #eeeef1;
  display:flex;flex-direction:column;padding:18px 14px}
.oa-brand{display:flex;align-items:center;gap:8px;padding:2px 6px 20px}
.oa-brand img{height:26px;width:auto}
.oa-navlabel{font-size:9.5px;font-weight:700;letter-spacing:.11em;color:#a0a4ad;padding:0 8px 8px}
.oa-navitem{display:flex;align-items:center;gap:11px;height:40px;padding:0 10px;border-radius:9px;
  font-size:13.5px;font-weight:600;color:#5b616e;position:relative}
.oa-navitem.on{background:#eaf1ff;color:#1c60e8}
.oa-navitem.on::after{content:"";position:absolute;right:8px;top:11px;bottom:11px;width:3px;
  border-radius:2px;background:#1c60e8}
.oa-eng{margin-top:auto;border:1px solid #edeef1;border-radius:14px;padding:16px 14px;text-align:center;
  background:#fff}
.oa-eng .ic{width:38px;height:38px;border-radius:11px;margin:0 auto 10px;display:grid;place-items:center;
  background:linear-gradient(135deg,#eef2ff,#e0e7ff);color:#4f46e5}
.oa-eng b{display:block;font-size:12.5px;font-weight:700;color:#111827}
.oa-eng p{margin-top:5px;font-size:10.5px;line-height:1.5;color:#8b909b}

/* ── Colonne principale ── */
.oa-main{flex:1;min-width:0;display:flex;flex-direction:column;background:#fdfdfb}
.oa-top{height:60px;flex-shrink:0;display:flex;align-items:center;gap:10px;padding:0 26px;
  border-bottom:1px solid #f0f0f2}
.oa-top .h{font-size:15px;font-weight:700;color:#111827;margin-right:auto}
.oa-pillbtn{display:inline-flex;align-items:center;gap:7px;height:34px;padding:0 14px;border-radius:999px;
  border:1px solid #e6e7ea;background:#fff;font-size:12.5px;font-weight:600;color:#4b5160}
.oa-badge{min-width:18px;height:18px;padding:0 5px;border-radius:999px;background:#2f6ff0;color:#fff;
  font-size:10px;font-weight:700;display:inline-grid;place-items:center}
.oa-avatar{width:32px;height:32px;border-radius:50%;background:#2f6ff0;color:#fff;display:grid;
  place-items:center;font-size:13px;font-weight:700}
.oa-scroll{flex:1;min-height:0;padding:26px 30px 0;overflow:hidden}
.oa-hello{font-size:29px;font-weight:700;letter-spacing:-.02em;color:#111827}
.oa-date{margin-top:5px;font-size:12.5px;color:#8b909b}

/* Grande carte bleue */
.oa-open{margin-top:20px;display:flex;align-items:center;gap:16px;border-radius:14px;padding:19px 20px;
  background:linear-gradient(100deg,#2f6ff0,#3f7bf5 55%,#5b8cf8);
  box-shadow:0 16px 34px -16px rgba(47,111,240,.75)}
.oa-open .ic{width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,.22);color:#fff;
  display:grid;place-items:center;flex-shrink:0}
.oa-open b{display:block;font-size:17px;font-weight:700;color:#fff}
.oa-open span{display:block;margin-top:3px;font-size:12.5px;color:rgba(255,255,255,.86)}
.oa-open .arw{margin-left:auto;color:#fff;flex-shrink:0}

.oa-sec{margin-top:22px;font-size:9.5px;font-weight:700;letter-spacing:.11em;color:#a0a4ad}
/* ACCÈS RAPIDE — tuiles colorées (enrichissement monday) */
.oa-quick{margin-top:11px;display:grid;grid-template-columns:repeat(3,1fr);gap:13px}
.oa-qcard{display:flex;align-items:center;gap:12px;border:1px solid #eceef1;border-radius:13px;
  padding:14px 15px;background:#fff;box-shadow:0 1px 2px rgba(15,23,42,.04)}
.oa-qcard .ic{width:40px;height:40px;border-radius:11px;display:grid;place-items:center;flex-shrink:0}
.oa-qcard .ic.blue{background:linear-gradient(135deg,#e8f0ff,#d7e5ff);color:#2f6ff0}
.oa-qcard .ic.violet{background:linear-gradient(135deg,#f0ecfe,#e5dcfd);color:#7c53e8}
.oa-qcard .ic.amber{background:linear-gradient(135deg,#fef3e2,#fde7c8);color:#d97a06}
.oa-qcard b{display:block;font-size:13px;font-weight:700;color:#111827}
.oa-qcard span{display:block;margin-top:2px;font-size:11px;color:#8b909b}
.oa-qcard .arw{margin-left:auto;color:#c3c6cd;flex-shrink:0}

/* REPRENDRE */
.oa-list{margin-top:11px;border:1px solid #eceef1;border-radius:13px;background:#fff;overflow:hidden}
.oa-row{display:flex;align-items:center;gap:12px;padding:12px 16px;border-top:1px solid #f4f5f7}
.oa-row:first-child{border-top:0}
.oa-row .ic{width:26px;height:26px;border-radius:7px;display:grid;place-items:center;flex-shrink:0}
.oa-row .ic.x{background:#e9f7ee;color:#177245}
.oa-row .ic.t{background:#f1f2f4;color:#6b7280}
.oa-row b{display:block;font-size:13px;font-weight:600;color:#111827;white-space:nowrap;overflow:hidden;
  text-overflow:ellipsis}
.oa-row span{display:block;margin-top:2px;font-size:10.5px;color:#9aa0aa}
.oa-tag{margin-left:auto;flex-shrink:0;display:inline-flex;align-items:center;gap:6px;height:24px;
  padding:0 10px;border-radius:999px;font-size:10.5px;font-weight:600}
.oa-tag.run{background:#eaf1ff;color:#2f6ff0}
.oa-tag.todo{background:#f3f4f6;color:#7b8190}
.oa-tag i{width:6px;height:6px;border-radius:50%;background:currentColor;display:block}

/* ══ Pastilles flottantes : l'histoire ENTRÉE → SORTIE ══ */
/* Deux couches distinctes, et pas une seule : .oa-chip ne porte que la position
   et le recul devant le curseur (propriété "translate"), .oa-fl porte le décor
   de la carte et le flottement (propriété "transform"). Sur un élément unique,
   l'arrivée, le flottement et le recul se disputeraient la même propriété
   "transform", et le flottement déplacerait le CONTENU à l'intérieur d'une
   carte immobile au lieu de faire léviter la carte. */
.oa-chip{position:absolute;z-index:5;
  transition:translate 650ms cubic-bezier(.22,1,.36,1)}
.oa-chip>.oa-fl{margin-top:0;border-radius:15px;padding:14px 18px;background:#fff;
  box-shadow:0 2px 6px rgba(15,23,42,.10),0 20px 44px -18px rgba(15,23,42,.5)}
.oa-chip .ic{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;flex-shrink:0}
.oa-chip b{display:block;font-size:15px;font-weight:700;color:#111827;white-space:nowrap}
.oa-chip span{display:block;margin-top:3px;font-size:12.5px;color:#8b909b;white-space:nowrap}
.oa-chip .ic.x{background:#e9f7ee;color:#177245}
.oa-chip .ic.blue{background:#eaf1ff;color:#2f6ff0}
.oa-chip .ic.violet{background:#f0ecfe;color:#7c53e8}
.oa-chip .ic.amber{background:#fef3e2;color:#d97a06}
/* Les pastilles DÉBORDENT sur les côtés de la fenêtre (comme monday.com) :
   elles ne doivent jamais recouvrir le contenu de l'interface. */
/* Le fichier qui ENTRE, à gauche, en face de la carte « Ouvrir un fichier » */
/* Ancrées sur les BORDS de la fenêtre (et non par un décalage fixe) : les
   étiquettes ayant été agrandies, un décalage en pixels les faisait mordre sur
   l'interface dès que le texte était un peu long. */
/* Décalage NÉGATIF (client 2026-07-30) : les pastilles mordent légèrement sur
   la fenêtre au lieu d'être posées strictement à côté. Elles se lisent alors
   comme flottant AU-DESSUS du logiciel, pas comme une colonne collée au bord.
   Le chevauchement reste faible et varie d'une pastille à l'autre, pour que le
   bord droit ne forme pas une ligne droite. */
.oa-chip.in{right:calc(100% - 34px);top:150px}
/* Les livrables qui SORTENT, à droite */
.oa-chip.out1{left:calc(100% - 46px);top:250px}
.oa-chip.out2{left:calc(100% - 18px);top:374px}
.oa-chip.out3{left:calc(100% - 58px);top:498px}

/* ── Arrivée puis flottement perpétuel ── */
.oa-armed .oa-chip{opacity:0}
/* Entrée : la pastille monte et se déplie. Elle porte sur .oa-chip pendant que
   le flottement porte sur .oa-fl, les deux transformes ne se marchent donc pas
   dessus et se composent pendant l'arrivée. */
@keyframes oaIn{from{opacity:0;transform:translate3d(0,26px,0) scale(.92)}to{opacity:1;transform:none}}
/* Flottement « nuage » : une boucle FERMÉE (0 % = 100 %) parcourue en continu,
   donc sans "alternate" : la pastille dérive au lieu de faire un aller-retour
   de métronome. Deux tracés et quatre durées différentes : les pastilles ne
   repassent jamais en phase, ce qui casse l'impression de mouvement mécanique. */
@keyframes oaFloatA{
  0%{transform:translate3d(-17px,-19px,0) rotate(-1.5deg)}
  27%{transform:translate3d(14px,-8px,0) rotate(1deg)}
  52%{transform:translate3d(22px,18px,0) rotate(1.6deg)}
  78%{transform:translate3d(-8px,12px,0) rotate(-.5deg)}
  100%{transform:translate3d(-17px,-19px,0) rotate(-1.5deg)}}
@keyframes oaFloatB{
  0%{transform:translate3d(19px,16px,0) rotate(1.3deg)}
  31%{transform:translate3d(-11px,5px,0) rotate(-.9deg)}
  58%{transform:translate3d(-22px,-18px,0) rotate(-1.5deg)}
  82%{transform:translate3d(7px,-9px,0) rotate(.6deg)}
  100%{transform:translate3d(19px,16px,0) rotate(1.3deg)}}
/* Les pastilles arrivent APRÈS l'interface (client 2026-07-30) : la scène
   elle-même est fondue par .hd-stagebox de 560 à 1460 ms, donc entrer avant
   1,5 s revenait à entrer pendant que le logiciel n'était pas encore là. */
.oa-in .oa-chip{animation:oaIn 700ms cubic-bezier(.22,1,.36,1) both}
.oa-in .oa-chip.in{animation-delay:1500ms}
.oa-in .oa-chip.out1{animation-delay:1720ms}
.oa-in .oa-chip.out2{animation-delay:1940ms}
.oa-in .oa-chip.out3{animation-delay:2160ms}
/* Amplitude TRIPLÉE et cycles raccourcis (client 2026-07-30 : « qu'elles
   bougent plus, même sans le curseur »).
   Délais NÉGATIFS, et c'est le point important : un délai positif laissait la
   pastille immobile après son entrée, puis le flottement démarrait sur sa
   première image, très loin de la position de repos — d'où le sursaut au bout
   de deux secondes. En négatif, le flottement tourne DÉJÀ pendant que la
   pastille apparaît : elle arrive en mouvement et il n'y a plus aucune rupture.
   Quatre valeurs sans rapport entre elles, pour que les pastilles ne soient
   jamais en phase. */
.oa-in .oa-chip .oa-fl{animation:oaFloatA 8s ease-in-out -1.3s infinite}
.oa-in .oa-chip.out1 .oa-fl{animation-name:oaFloatB;animation-duration:9.5s;animation-delay:-5.2s}
.oa-in .oa-chip.out2 .oa-fl{animation-duration:11s;animation-delay:-3.1s}
.oa-in .oa-chip.out3 .oa-fl{animation-name:oaFloatB;animation-duration:12.5s;animation-delay:-8.4s}
/* Trait pointillé entre le fichier entrant et la carte « Ouvrir un fichier » */
.oa-armed .oa-flow{opacity:0}
/* Le trait pointillé précède de peu la pastille entrante qu'il relie. */
.oa-in .oa-flow{animation:oaIn 600ms ease-out 1340ms both}
.oa-flow{position:absolute;z-index:4;left:-8px;top:222px;width:288px;height:2px;
  background:repeating-linear-gradient(90deg,#b9c7de 0 7px,transparent 7px 13px)}

@media (prefers-reduced-motion:reduce){
  .oa-armed .oa-chip,.oa-armed .oa-flow{opacity:1}
  .oa-in .oa-chip,.oa-in .oa-flow,.oa-in .oa-chip .oa-fl{animation:none}}
`;

/* ── Petites icônes en ligne (aucune dépendance) ── */
const IcoDoc = ({ s = 18 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
);
const IcoArrow = ({ s = 20 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
);
const IcoPlus = ({ s = 18 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
);
const IcoGlobe = ({ s = 18 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18z" /></svg>
);
const IcoSparkle = ({ s = 18 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" /></svg>
);
const IcoHome = ({ s = 17 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 21v-7h6v7" /></svg>
);
const IcoChat = ({ s = 15 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4a8.4 8.4 0 0 1-3.8-.9L3 20.5l1.5-4.4A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4z" /></svg>
);
const IcoBell = ({ s = 15 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>
);
const IcoCheck = ({ s = 16 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
);
const IcoChart = ({ s = 16 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>
);

export default function OraAppScene({ playing = true }: { playing?: boolean }) {
  const { t } = useLang();
  const mediaRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = mediaRef.current, stage = stageRef.current;
    if (!media || !stage) return;
    const fit = () => {
      const s = Math.min(media.clientWidth / W, media.clientHeight / H);
      stage.style.transform = `translateX(-50%) scale(${s})`;
    };
    const ro = new ResizeObserver(fit);
    ro.observe(media);
    fit();
    return () => ro.disconnect();
  }, []);

  // ── Les pastilles fuient légèrement le curseur ───────────────────────────
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const chips = Array.from(stage.querySelectorAll<HTMLElement>(".oa-chip"));
    if (!chips.length) return;

    /** Rayon d'influence et recul maximal, en pixels d'ÉCRAN. */
    const RADIUS = 200, PUSH = 26;

    // Centres au repos, en coordonnées de scène, relevés sur la MISE EN PAGE
    // (`offset*`) : insensibles au flottement comme au recul déjà appliqué.
    // Mesurer le centre réel ferait boucler l'effet — la pastille s'éloigne,
    // donc son centre s'éloigne, donc la poussée retombe, et elle oscille.
    let bases = chips.map(() => ({ x: 0, y: 0 }));
    const measure = () => {
      bases = chips.map((c) => ({
        x: c.offsetLeft + c.offsetWidth / 2,
        y: c.offsetTop + c.offsetHeight / 2,
      }));
    };
    measure();
    // La largeur des pastilles dépend du texte : elle bouge encore quand les
    // polices finissent de charger.
    document.fonts?.ready.then(measure).catch(() => {});

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = stage.getBoundingClientRect();
      const s = r.width / W;
      if (!s) return;
      chips.forEach((chip, i) => {
        const dx = r.left + bases[i].x * s - e.clientX;
        const dy = r.top + bases[i].y * s - e.clientY;
        const d = Math.hypot(dx, dy);
        if (d > RADIUS || d < 1) { chip.style.translate = ""; return; }
        // Le recul est posé DANS la scène, qui est mise à l'échelle : sans la
        // division, la fuite paraîtrait de plus en plus faible en rétrécissant.
        const f = ((1 - d / RADIUS) * PUSH) / s;
        chip.style.translate = `${(dx / d) * f}px ${(dy / d) * f}px`;
      });
    };
    const clear = () => chips.forEach((c) => { c.style.translate = ""; });

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", measure);
    document.addEventListener("pointerleave", clear);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", measure);
      document.removeEventListener("pointerleave", clear);
      clear();
    };
  }, []);

  return (
    <>
      <style>{OA_CSS}</style>
      <div className={`oa-media oa-armed${playing ? " oa-in" : ""}`} ref={mediaRef}>
        <div className="oa-stage" ref={stageRef}>
          <div className="oa-win">
            {/* Barre de titre macOS */}
            <div className="oa-title">
              <div className="oa-dots">
                <i style={{ background: "#ff5f57" }} />
                <i style={{ background: "#febc2e" }} />
                <i style={{ background: "#28c840" }} />
              </div>
              Ora
            </div>

            <div className="oa-body">
              {/* ── Barre latérale ── */}
              <div className="oa-side">
                <div className="oa-brand">
                  <img src="/logos/logo-color-dark.png" alt="Ora" />
                </div>
                <div className="oa-navlabel">NAVIGATION</div>
                <div className="oa-navitem on"><IcoHome /> {t({ fr: "Accueil", en: "Home" })}</div>
                <div className="oa-navitem"><IcoGlobe s={17} /> Atlas</div>
                <div className="oa-eng">
                  <span className="ic"><IcoSparkle s={19} /></span>
                  <b>Ora Engineering</b>
                  <p>
                    {t({
                      fr: "Besoin d'une automatisation ? Décrivez-la, on vous livre un script sur mesure sous 48 h.",
                      en: "Need an automation? Describe it, we deliver a custom script within 48 h.",
                    })}
                  </p>
                </div>
              </div>

              {/* ── Colonne principale ── */}
              <div className="oa-main">
                <div className="oa-top">
                  <span className="h">{t({ fr: "Accueil", en: "Home" })}</span>
                  <span className="oa-pillbtn"><IcoChat /> Messages</span>
                  <span className="oa-pillbtn"><IcoBell /> Notifications <span className="oa-badge">1</span></span>
                  <span className="oa-avatar">T</span>
                </div>

                <div className="oa-scroll">
                  <div className="oa-hello">{t({ fr: "Heureux de vous revoir", en: "Good to see you again" })}</div>
                  <div className="oa-date">{t({ fr: "Mercredi 29 juillet", en: "Wednesday, July 29" })}</div>

                  {/* Grande carte bleue */}
                  <div className="oa-open">
                    <span className="ic"><IcoDoc s={22} /></span>
                    <div>
                      <b>{t({ fr: "Ouvrir un fichier", en: "Open a file" })}</b>
                      <span>{t({ fr: "Excel ou CSV → lancez vos automatisations en un clic", en: "Excel or CSV → run your automations in one click" })}</span>
                    </div>
                    <span className="arw"><IcoArrow s={22} /></span>
                  </div>

                  {/* ACCÈS RAPIDE */}
                  <div className="oa-sec">{t({ fr: "ACCÈS RAPIDE", en: "QUICK ACCESS" })}</div>
                  <div className="oa-quick">
                    <div className="oa-qcard">
                      <span className="ic blue"><IcoPlus /></span>
                      <div>
                        <b>{t({ fr: "Nouveau projet", en: "New project" })}</b>
                        <span>Deal PE, audit, M&amp;A...</span>
                      </div>
                      <span className="arw"><IcoArrow s={15} /></span>
                    </div>
                    <div className="oa-qcard">
                      <span className="ic violet"><IcoGlobe /></span>
                      <div>
                        <b>{t({ fr: "Tous les Atlas", en: "All Atlas" })}</b>
                        <span>{t({ fr: "Liste de vos projets", en: "Your projects" })}</span>
                      </div>
                      <span className="arw"><IcoArrow s={15} /></span>
                    </div>
                    <div className="oa-qcard">
                      <span className="ic amber"><IcoSparkle /></span>
                      <div>
                        <b>Ora Engineering</b>
                        <span>{t({ fr: "Automatisation sur-mesure", en: "Custom automation" })}</span>
                      </div>
                      <span className="arw"><IcoArrow s={15} /></span>
                    </div>
                  </div>

                  {/* REPRENDRE */}
                  <div className="oa-sec">{t({ fr: "REPRENDRE", en: "RESUME" })}</div>
                  <div className="oa-list">
                    {FILES.map((f) => (
                      <div className="oa-row" key={f.name}>
                        <span className={`ic ${f.kind === "xlsx" ? "x" : "t"}`}><IcoDoc s={15} /></span>
                        <div style={{ minWidth: 0 }}>
                          <b>{f.name}</b>
                          <span>{f.meta}</span>
                        </div>
                        <span className={`oa-tag ${f.state}`}>
                          <i />
                          {f.state === "run" ? t({ fr: "En cours", en: "Running" }) : t({ fr: "À faire", en: "To do" })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ══ L'histoire : un Excel entre, des livrables sortent ══ */}
          <div className="oa-flow" />
          <div className="oa-chip in">
            <span className="oa-fl" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="ic x"><IcoDoc s={19} /></span>
              <span>
                <b>balance_2025.xlsx</b>
                <span>{t({ fr: "Déposé dans Ora", en: "Dropped into Ora" })}</span>
              </span>
            </span>
          </div>
          <div className="oa-chip out1">
            <span className="oa-fl" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="ic blue"><IcoChart s={19} /></span>
              <span>
                <b>{t({ fr: "Reporting généré", en: "Report generated" })}</b>
                <span>{t({ fr: "Mis en forme, prêt à envoyer", en: "Formatted, ready to send" })}</span>
              </span>
            </span>
          </div>
          <div className="oa-chip out2">
            <span className="oa-fl" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="ic violet"><IcoCheck s={19} /></span>
              <span>
                <b>{t({ fr: "398 000 lignes contrôlées", en: "398,000 rows checked" })}</b>
                <span>{t({ fr: "Écritures atypiques repérées", en: "Unusual entries flagged" })}</span>
              </span>
            </span>
          </div>
          <div className="oa-chip out3">
            <span className="oa-fl" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="ic amber"><IcoDoc s={19} /></span>
              <span>
                <b>{t({ fr: "Synthèse PDF", en: "PDF summary" })}</b>
                <span>{t({ fr: "Livrable final, en un clic", en: "Final deliverable, one click" })}</span>
              </span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
