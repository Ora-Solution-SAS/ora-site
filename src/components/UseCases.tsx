import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { ArrowLeftRight, ArrowUpRight, ClipboardCheck, FileText, Mail, PieChart, Wand2, X, type LucideIcon } from "lucide-react";
import { useLang } from "@/lib/i18n";
import ReportingMockup from "./ReportingMockup";
import PointageMockup from "./PointageMockup";
import FormatageMockup from "./FormatageMockup";

/**
 * UseCases — Bending-Spoons-style acquisition cards, adapted to Ora use cases:
 * two large pastel-BLUE rounded cards side by side, each with a bold title, a
 * "watch the demo" pill, an icon meta line, ring-bulleted facts, and the demo
 * clip filling the bottom of the card (bleeding to the card's bottom edge).
 * Sits right above the "Votre Excel vous coûte plus que du temps" section.
 */

type UseCase = {
  title: string;
  metaIcon: LucideIcon;
  meta: string;
  bullets: string[];
  video: string;
  poster: string;
  /** Card background (blue family, pastel or saturated). */
  bg: string;
  /** Primary ink color on that background. */
  ink: string;
  /** Secondary text color. */
  sub: string;
  /** Saturated background → white text + translucent white pill. */
  dark?: boolean;
  /** Card bg matches the clip's own canvas → drop the frame (no rounding, no
   *  shadow) so the video melts into the card and only its UI floats. */
  blend?: boolean;
  /** Decorative layer: peach circle (WeTransfer) or white outline rings
   *  (Streamyard). */
  decor?: "circle" | "rings";
  /** Replace the video media zone with a custom static mockup composition
   *  (Bending-Spoons style). The video is kept for the "Voir la démo"
   *  lightbox. */
  mockup?: "reporting" | "pointage" | "formatage";
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** Cubic in-out: le recul démarre et se pose progressivement, sans à-coup. */
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Longueur du scrub du recul, en hauteurs d'écran. PREMIÈRE phase.
 *  Ramenée de 1,2 à 0,7 (client 2026-08-01 : « l'utilisateur a trop besoin de
 *  scroller pour arriver à l'animation de défilement des colonnes »). Le recul
 *  lui-même n'est pas modifié, il se déroule simplement sur moins de scroll.
 *  Le cale-scroll sous la grille vaut PULLBACK_VH + SCROLL_VH. */
const PULLBACK_VH = 0.7;
/** SECONDE phase, en hauteurs d'écran. Elle ne démarre qu'une fois le recul
 *  terminé : le mur reste épinglé et les colonnes DÉFILENT, les deux extérieures
 *  vers le haut, celle du milieu vers le bas. Sans boucle, comme demandé : ce qui
 *  atteint le bord s'efface dans le dégradé déjà en place. */
const SCROLL_VH = 1.2;
/** Course d'une colonne pendant la seconde phase, en pixels d'écran.
 *  Bornée par la RÉSERVE : avec six rangées, le mur passe 936 px au-dessus et en
 *  dessous de la bande visible. 700 px de course restent donc couverts des deux
 *  côtés, aucune colonne ne découvre le vide. */
const COL_SCROLL = 700;
/** Part de la LARGEUR d'écran qu'occupe le mur, caméra au plus loin. */
const PULLBACK_FILL_W = 0.96;
/** Hauteur tolérée pour le mur, en hauteurs d'écran. Volontairement très
 *  supérieure à 1 : le mur DÉBORDE en haut et en bas, ses bords sont fondus, et
 *  c'est la dérive des colonnes qui fait défiler ce qui dépasse. Relevée de
 *  1,45 à 2,6 (client 2026-07-30 : « ça doit prendre plus de largeur ») — sous
 *  1,45 c'était la HAUTEUR qui bridait l'échelle, donc le mur se rétrécissait
 *  au milieu de deux grandes marges vides dès qu'on ajoutait des rangées.
 *  Au-delà, c'est la largeur qui commande, et le mur remplit l'écran.
 *  Ramenée à 3,3 avec les six rangées (2026-08-01) : mur de 2 036 x 4 082 px,
 *  terme de largeur 0,679, il faut donc au moins 3,08 côté hauteur pour que la
 *  largeur garde la main. 3,3 laisse de la marge. */
const PULLBACK_FILL_H = 3.3;
/** Amplitude de la dérive inverse des colonnes, en pixels d'écran.
 *  REMISE à 170 (client 2026-08-01 : « les encadrés partent tous vers le haut en
 *  disparaissant, conserve l'animation que l'on avait »). Le passage à 520 était
 *  une erreur de repère de ma part : le fondu haut et bas est calé sur la
 *  FENÊTRE VISIBLE, pas sur la hauteur du mur. Un déplacement de 442 px dans un
 *  écran de 900 px sort donc les deux colonnes extérieures de la bande visible,
 *  où elles s'effacent dans le dégradé. Les 2 802 px de matière hors champ que
 *  j'invoquais concernaient le mur, pas la bande où l'on voit quelque chose. */
const WALL_DRIFT = 170;

/**
 * WallCard — copie VISUELLE d'une carte de cas d'usage, pour étoffer le mur
 * pendant le dézoom (client 2026-08-01 : « mets des encadrés qui existent déjà,
 * même s'ils sont doublon », et « ce qui est vide, c'est l'intérieur des
 * tuiles »).
 *
 * Remplace les anciennes tuiles qui ne portaient qu'un titre sur un aplat de
 * couleur : c'était leur intérieur vide qui donnait l'aspect brouillon au mur.
 * Ici on retrouve le titre, la pastille, la ligne meta, les puces et un visuel,
 * donc un mur homogène de bout en bout.
 *
 * Trois écarts DÉLIBÉRÉS avec la vraie carte, tous pour le poids :
 *   · le média est le POSTER en image, jamais la vidéo ni la maquette. Douze
 *     copies signifieraient sinon douze balises `video` en lecture ou douze
 *     scènes de maquette avec leur ResizeObserver, ce qui ruinerait la fluidité
 *     qu'on vient de gagner ;
 *   · aucune animation Framer Motion : l'opacité et la position sont écrites par
 *     le moteur du dézoom, une animation d'entrée entrerait en conflit ;
 *   · rien d'interactif. La copie est décorative, donc `aria-hidden` et
 *     `pointer-events-none`, et la pastille « Voir la démo » n'est qu'un décor.
 */
function WallCard({ item }: { item: UseCase }) {
  const { t } = useLang();
  const Icon = item.metaIcon;
  return (
    <div
      className={`relative h-full overflow-hidden rounded-[28px] md:rounded-[40px] p-8 md:p-12 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)]${item.mockup ? " flex flex-col" : ""}`}
      style={{ background: item.bg }}
    >
      {item.decor === "circle" && (
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[46%] w-[105%] aspect-square -translate-x-1/2 rounded-full"
          style={{ background: "radial-gradient(circle at 38% 30%, #e4ebff 0%, #cbd6fb 55%, #b3c1f6 100%)" }}
        />
      )}
      {item.decor === "rings" && (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[58%] w-[62%] aspect-[4/3] -translate-x-1/2 -translate-y-1/2 rounded-[48px] border-2 border-white/25" />
          <div className="absolute left-1/2 top-[58%] w-[82%] aspect-[4/3] -translate-x-1/2 -translate-y-1/2 rounded-[64px] border-2 border-white/15" />
          <div className="absolute left-1/2 top-[58%] w-[102%] aspect-[4/3] -translate-x-1/2 -translate-y-1/2 rounded-[80px] border-2 border-white/[0.08]" />
        </div>
      )}

      <div className="relative flex items-center justify-between gap-4">
        <h3 className="font-poppins font-semibold text-[1.7rem] md:text-[2.2rem] tracking-[-0.02em]" style={{ color: item.ink }}>
          {item.title}
        </h3>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 md:px-5 py-2 md:py-2.5 font-inter font-semibold text-[13px] md:text-[15px] ${
            item.dark ? "bg-white/15" : "bg-white/70"
          }`}
          style={{ color: item.ink }}
        >
          {t({ fr: "Voir la démo", en: "Watch the demo" })}
          <ArrowUpRight className="w-4 h-4" />
        </span>
      </div>

      <div className="relative mt-5 md:mt-6 flex items-center gap-2.5" style={{ color: item.ink }}>
        <Icon className="w-[18px] h-[18px]" />
        <span className="font-inter font-semibold text-[15px] md:text-base">{item.meta}</span>
      </div>

      <ul className="relative mt-3 space-y-2.5">
        {item.bullets.map((b) => (
          <li key={b} className="flex items-start gap-2.5 font-inter text-[14px] md:text-[15.5px] leading-relaxed" style={{ color: item.sub }}>
            <span
              aria-hidden
              className="mt-[7px] h-[7px] w-[7px] shrink-0 rounded-full border-[1.5px]"
              style={{ borderColor: item.sub }}
            />
            {b}
          </li>
        ))}
      </ul>

      {/* Même emplacement que le média de la vraie carte, poster en image. */}
      <div
        className={
          item.mockup
            ? "relative mt-auto pt-7 md:pt-9 -mx-3 md:-mx-6 -mb-8 md:-mb-12"
            : item.blend
              ? "relative mt-6 md:mt-7 -mx-7 md:-mx-10 -mb-7 md:-mb-10"
              : "relative mt-7 md:mt-9 rounded-[18px] md:rounded-[22px] overflow-hidden shadow-[0_18px_44px_-18px_rgba(15,23,42,0.3)]"
        }
      >
        <img
          src={item.poster}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          className="w-full aspect-video object-cover block"
        />
        {item.blend && (
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 top-0 h-10 md:h-12" style={{ background: `linear-gradient(to bottom, ${item.bg} 0%, transparent 100%)` }} />
            <div className="absolute inset-x-0 bottom-0 h-10 md:h-12" style={{ background: `linear-gradient(to top, ${item.bg} 0%, transparent 100%)` }} />
            <div className="absolute inset-y-0 left-0 w-10 md:w-14" style={{ background: `linear-gradient(to right, ${item.bg} 0%, transparent 100%)` }} />
            <div className="absolute inset-y-0 right-0 w-10 md:w-14" style={{ background: `linear-gradient(to left, ${item.bg} 0%, transparent 100%)` }} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function UseCases() {
  const { t } = useLang();
  const [active, setActive] = useState<UseCase | null>(null);

  // ── Dézoom de sortie : la grille RÉELLE recule ───────────────────────────
  const trackRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fillerRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Le moteur est scindé en DEUX (client 2026-08-01 : « c'est un peu lent et un
  // peu bugué quand le dézoom s'active »). Avant, une seule fonction était
  // branchée directement sur `scroll`, sans throttle, et elle alternait lectures
  // et écritures de mise en page : `offsetWidth`, écriture de `pin.style.top`,
  // `getBoundingClientRect`, écriture de la largeur des tuiles, relecture des
  // `offset*` de chaque carte, écriture des transformes, relecture du rect du
  // cadenceur, écriture du masque. Chaque retour en lecture après une écriture
  // force un recalcul SYNCHRONE de la mise en page, et l'événement `scroll` peut
  // se répéter plusieurs fois par image : d'où les saccades.
  //   · `measure()` prend toutes les mesures et les met en cache. Appelée au
  //     montage, au redimensionnement et quand le mur grandit, jamais pendant
  //     le scroll.
  //   · `apply()` ne fait plus que deux lectures groupées EN TÊTE, puis
  //     uniquement des écritures, et tourne au maximum une fois par image.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Même source que la mise en page : le `md:` de Tailwind. Comparer
    // `innerWidth` à 768 en parallèle laisserait passer des états où la grille
    // est déjà repassée en une colonne alors que le recul tourne encore.
    const desktop = window.matchMedia("(min-width: 768px)");
    const track = trackRef.current;
    const pin = pinRef.current;
    const grid = zoomRef.current;
    if (!track || !pin || !grid) return;

    /** Place d'arrivée d'une carte dans le mur, mesurée une fois pour toutes. */
    type Slot = {
      card: HTMLDivElement;
      /** Les tuiles ne VOYAGENT pas : posées d'emblée à leur place, elles se
       *  contentent d'apparaître en fondu. */
      still: boolean;
      dx: number;
      dy: number;
      /** Colonne 1 = celle du milieu en trois colonnes ; en repli à deux, c'est
       *  celle de droite, et les deux dérivent encore en sens opposé. */
      mid: boolean;
    };
    type Geo = {
      pinTop: number;
      scrub: number;
      /** Longueur en pixels de la SECONDE phase, le défilement des colonnes. */
      scroll: number;
      fit: number;
      gridH: number;
      wallFullH: number;
      fadeH: number;
      slots: Slot[];
    };
    let geo: Geo | null = null;
    let rafId = 0;
    let hinted = false;
    /** Dernières bornes du masque posées, pour ne pas le réécrire à l'identique. */
    const lastMask: { haut: number | null; bas: number | null } = { haut: null, bas: null };

    const reset = () => {
      pin.style.top = "";
      pin.style.removeProperty("-webkit-mask-image");
      pin.style.removeProperty("mask-image");
      grid.style.transform = "";
      grid.style.willChange = "";
      cardRefs.current.forEach((el) => {
        if (el) { el.style.transform = ""; el.style.willChange = ""; }
      });
      fillerRefs.current.forEach((el) => {
        if (el) { el.style.transform = ""; el.style.willChange = ""; el.style.opacity = "0"; }
      });
      hinted = false;
      // Sans ça, un retour aux MÊMES bornes après un reset sauterait la
      // réécriture et le masque resterait absent.
      lastMask.haut = null;
      lastMask.bas = null;
    };

    // ── Mesures : tout ce qui ne dépend PAS de la position de scroll ─────────
    const measure = () => {
      // Sous `md` la grille n'est pas épinglée : on remet tout à plat, sinon
      // les transformes d'une session desktop resteraient collés après un
      // redimensionnement.
      if (!desktop.matches || reduced) { geo = null; return reset(); }

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // offsetWidth / offsetHeight : dimensions de MISE EN PAGE, insensibles
      // aux transformes déjà posés — donc stables d'une image à l'autre.
      const gridW = grid.offsetWidth;
      const gridH = grid.offsetHeight;
      const reals = cardRefs.current.filter((el): el is HTMLDivElement => !!el);
      if (gridH <= vh || reals.length < 2) { geo = null; return reset(); }

      // `top` négatif : la grille défile normalement puis se fige au moment où
      // son BAS touche le bas de l'écran, donc pile sur la dernière rangée.
      const pinTop = vh - gridH;

      // Mesures prises sur les VRAIES cartes uniquement : les tuiles de
      // remplissage sont hors flux, leurs `offset*` valent tous zéro.
      const colW = reals[0].offsetWidth;
      const gapX = reals[1].offsetLeft - (reals[0].offsetLeft + colW);
      const gapY = reals.length > 2
        ? reals[2].offsetTop - (reals[0].offsetTop + reals[0].offsetHeight)
        : gapX;
      const rowH = Math.max(...reals.map((c) => c.offsetHeight));

      const fills = fillerRefs.current.filter((el): el is HTMLDivElement => !!el);
      const fillerSet = new Set<HTMLDivElement>(fills);
      // Géométrie des tuiles CONNUE, jamais relue. C'est le correctif du mur
      // cassé : leur gabarit (`colW` x `rowH`) est écrit à la fin de cette
      // fonction, or les hauteurs de rangées étaient calculées AVANT, en lisant
      // `offsetHeight`. Au premier passage les tuiles avaient donc leur hauteur
      // naturelle, bien plus courte : les rangées de tuiles se tassaient les
      // unes sur les autres et `wallFullH` était très sous-estimé, donc le mur
      // mal cadré. Et rien ne déclenchait de seconde mesure, l'observateur
      // surveillant `pin`, dont la taille ne bouge pas quand on redimensionne
      // des éléments hors flux. L'ancien moteur y échappait en réécrivant ce
      // gabarit à chaque image, avant les calculs.
      // Les tuiles étant posées en `absolute left-0 top-0`, leur origine vaut
      // (0, 0) et leur boîte vaut (colW, rowH) : tout est déjà connu ici.
      const isFill = (c: HTMLDivElement) => fillerSet.has(c);
      const hOf = (c: HTMLDivElement) => (isFill(c) ? rowH : c.offsetHeight);
      const leftOf = (c: HTMLDivElement) => (isFill(c) ? 0 : c.offsetLeft);
      const topOf = (c: HTMLDivElement) => (isFill(c) ? 0 : c.offsetTop);

      // TROIS colonnes, et pas un nombre choisi automatiquement : c'est ce qui
      // rend lisible la dérive inverse (les deux colonnes extérieures montent,
      // celle du milieu descend). En dessous de six cartes, trois colonnes
      // laisseraient une rangée dépareillée, on retombe alors à deux.
      const cols = reals.length + fills.length >= 6 ? 3 : 2;

      // Les vraies cartes restent en TÊTE du mur (client 2026-08-01 :
      // « l'organisation au dézoom est moche, ça part trop dans tous les sens »).
      // Je les avais placées au MILIEU pour les garder à l'écran, mais ça leur
      // imposait un trajet vertical d'environ 3 400 px pendant le recul, alors
      // qu'en tête leur déplacement ne dépasse jamais UNE rangée : c'est ce qui
      // rendait le dézoom propre à l'origine.
      // Les garder visibles est donc obtenu autrement : en LIMITANT le nombre de
      // rangées. Calculé en 1440x900, avec les cartes en tête, la bande visible
      // est entièrement remplie par elles jusqu'à SIX rangées (le mur passe alors
      // 936 px au-dessus de la bande, pour un bloc de cartes qui en couvre 1 866).
      // À 7 rangées les tuiles occupent déjà 23 % de la bande, à 10 les cartes en
      // sortent complètement.
      // L'alternance carte / tuile fait le damier.
      const cards: HTMLDivElement[] = [];
      for (let i = 0; i < Math.max(reals.length, fills.length); i++) {
        if (i < reals.length) cards.push(reals[i]);
        if (i < fills.length) cards.push(fills[i]);
      }

      const rows: HTMLDivElement[][] = [];
      for (let i = 0; i < cards.length; i += cols) rows.push(cards.slice(i, i + cols));
      const wallW = Math.max(...rows.map((r) => r.length)) * (colW + gapX) - gapX;
      const wallFullH = rows.reduce((acc, r) => acc + Math.max(...r.map(hOf)), 0)
        + gapY * (rows.length - 1);
      const fit = Math.min(1, (vw * PULLBACK_FILL_W) / wallW, (vh * PULLBACK_FILL_H) / wallFullH);

      // Toutes les rangées démarrent sur la MÊME grille de colonnes, y compris
      // la dernière si elle est incomplète. La centrer plaçait ses cartes entre
      // les colonnes du dessus : l'indice de colonne ne voulait plus rien dire,
      // la dérive inverse envoyait deux voisines l'une sur l'autre, et le mur
      // finissait avec un chevauchement.
      const rowLeft0 = (gridW - (cols * (colW + gapX) - gapX)) / 2;
      const slots: Slot[] = [];
      let rowTop = 0;
      for (const row of rows) {
        let cardLeft = rowLeft0;
        row.forEach((card, ci) => {
          slots.push({
            card,
            still: fillerSet.has(card),
            dx: cardLeft - leftOf(card),
            dy: rowTop - topOf(card),
            mid: ci === 1,
          });
          cardLeft += colW + gapX;
        });
        rowTop += Math.max(...row.map(hOf)) + gapY;
      }

      // ÉCRITURES groupées à la toute fin, une fois toutes les lectures faites.
      // Le gabarit des tuiles est posé ICI et plus à chaque image : `width` et
      // `height` sont des propriétés de MISE EN PAGE, les réécrire soixante fois
      // par seconde invalidait la mise en page pour rien.
      pin.style.top = `${pinTop}px`;
      for (const f of fills) {
        f.style.width = `${colW}px`;
        f.style.height = `${rowH}px`;
      }

      geo = {
        pinTop, scrub: vh * PULLBACK_VH, scroll: vh * SCROLL_VH,
        fit, gridH, wallFullH,
        fadeH: Math.min(130, vh * 0.16), slots,
      };
    };

    // ── Application : lectures groupées en tête, puis écritures seules ───────
    const apply = () => {
      rafId = 0;
      const g = geo;
      if (!g) return;

      // LECTURES (les deux seules, et avant toute écriture).
      const trackTop = track.getBoundingClientRect().top;
      const pinTopNow = pin.getBoundingClientRect().top;

      // Distance parcourue depuis le début de l'épinglage. Elle alimente DEUX
      // phases qui s'enchaînent : le recul de caméra, puis le défilement des
      // colonnes.
      const d = g.pinTop - trackTop;
      const p = clamp01(d / g.scrub);
      const u = ease(p);
      const s = 1 - (1 - g.fit) * u;
      // Dérive inverse : la colonne du MILIEU descend pendant que les deux
      // extérieures montent. Décalée de 0,15 pour que le mur soit déjà en
      // mouvement en arrivant. Exprimée en pixels d'écran, donc divisée par
      // l'échelle du mur.
      const drift = (u * (p - 0.15) * WALL_DRIFT) / s;
      // Apparition RETARDÉE des tuiles : elles ne se révèlent qu'une fois le
      // mur bien engagé.
      const fade = clamp01((u - 0.82) / 0.18);
      // SECONDE PHASE. `q` reste à zéro tant que la distance parcourue n'a pas
      // dépassé la longueur du recul : le dézoom se déroule donc exactement comme
      // avant, on n'y touche pas. Ensuite le mur reste épinglé et les colonnes
      // défilent, les extérieures vers le haut, celle du milieu vers le bas.
      // Sans boucle : ce qui atteint le bord s'efface dans le dégradé déjà posé,
      // et la réserve de tuiles couvre la course.
      const q = clamp01((d - g.scrub) / g.scroll);
      const colScroll = (q * COL_SCROLL) / s;
      const active = d > 0 && q < 1;

      // ÉCRITURES.
      for (const slot of g.slots) {
        const t = slot.still ? 1 : u;
        // Les deux mouvements vont dans le MÊME sens et s'additionnent : la
        // colonne du milieu descend pendant le recul puis continue de descendre
        // pendant le défilement, les extérieures montent puis continuent de
        // monter. Aucune inversion de sens au passage d'une phase à l'autre.
        const dy = slot.dy * t + (slot.mid ? drift + colScroll : -drift - colScroll);
        slot.card.style.transform = `translate3d(${slot.dx * t}px, ${dy}px, 0)`;
        if (slot.still) slot.card.style.opacity = String(fade);
      }
      // Recul de caméra. Origine en bas de la grille, donc pile sur le bas de
      // l'écran pendant l'épinglage : à u = 0 la grille est exactement à sa
      // place, et le mur se recentre au fur et à mesure du recul.
      const wallH = g.gridH + (g.wallFullH - g.gridH) * u;
      grid.style.transform = `translate3d(0, ${u * (s * g.gridH - (s * wallH) / 2 - window.innerHeight / 2)}px, 0) scale(${s})`;

      // `will-change` posé au CHANGEMENT d'état seulement : le réécrire à chaque
      // image est une mutation de style de plus, et le promouvoir en continu
      // garde des calques en mémoire pour rien.
      if (active !== hinted) {
        hinted = active;
        const hint = active ? "transform" : "";
        grid.style.willChange = hint;
        for (const slot of g.slots) slot.card.style.willChange = hint;
      }

      // Fondu haut et bas pendant le recul. Les bornes sont recalculées depuis
      // la position RÉELLE de l'enveloppe, et non depuis les coordonnées de
      // l'épinglage : une fois le mur libéré, l'enveloppe remonte avec la page,
      // et un dégradé figé emporterait le fondu avec elle en plein milieu de
      // l'écran.
      if (p > 0) {
        // Bornes ARRONDIES au pixel, et masque réécrit seulement s'il change
        // vraiment. Un masque en dégradé sur un conteneur épinglé qui porte des
        // vidéos et trois maquettes se re-rastérise à chaque réécriture : c'est
        // du travail de DESSIN, invisible pour un profil de mise en page, et
        // c'est le coût le plus lourd de la séquence. Au pixel près, deux images
        // voisines demandent très souvent le même masque.
        const haut = Math.round(-pinTopNow);
        const bas = Math.round(-pinTopNow + Math.min(window.innerHeight, trackTop + track.offsetHeight));
        if (haut !== lastMask.haut || bas !== lastMask.bas) {
          lastMask.haut = haut;
          lastMask.bas = bas;
          const mask = `linear-gradient(to bottom, transparent ${haut}px, #000 ${haut + g.fadeH}px, #000 ${bas - g.fadeH}px, transparent ${bas}px)`;
          pin.style.setProperty("-webkit-mask-image", mask);
          pin.style.setProperty("mask-image", mask);
        }
      } else if (lastMask.haut !== null) {
        lastMask.haut = null;
        lastMask.bas = null;
        pin.style.removeProperty("-webkit-mask-image");
        pin.style.removeProperty("mask-image");
      }
    };

    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(apply);
    };
    const remeasure = () => {
      measure();
      if (!rafId) rafId = requestAnimationFrame(apply);
    };

    remeasure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", remeasure);
    // La grille grandit encore après le montage (posters, vidéos, polices) :
    // sans ça le `top` d'épinglage resterait calculé sur une hauteur trop
    // faible et le recul démarrerait au mauvais endroit.
    const ro = new ResizeObserver(remeasure);
    ro.observe(pin);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", remeasure);
      ro.disconnect();
    };
  }, []);

  const cases: UseCase[] = [
    {
      title: t({ fr: "Automatisation FEC", en: "FEC automation" }),
      metaIcon: PieChart,
      meta: t({ fr: "Audit & commissariat aux comptes", en: "Audit & statutory engagements" }),
      bullets: [
        t({ fr: "Importez le FEC de vos clients, contrôlez son intégrité en quelques secondes", en: "Import your clients' FEC file and check its integrity in seconds" }),
        t({ fr: "Écritures atypiques repérées et documentées automatiquement", en: "Unusual entries flagged and documented automatically" }),
      ],
      video: "/final-fec.mp4",
      poster: "/posters/final-fec.jpg",
      // Sampled from the FEC clip's own canvas background so the card and the
      // video blend into one continuous surface.
      bg: "#d2e4fa",
      ink: "#0c2d4d",
      sub: "#2f5474",
      blend: true,
    },
    {
      title: t({ fr: "Reporting mensuel", en: "Monthly reporting" }),
      metaIcon: Mail,
      meta: t({ fr: "Équipes finance & contrôle de gestion", en: "Finance & controlling teams" }),
      bullets: [
        t({ fr: "Le classeur est retraité, mis en forme et prêt à partager en un clic", en: "Your workbook is cleaned, formatted and share-ready in one click" }),
        t({ fr: "Envoi par mail automatique, le même livrable chaque mois", en: "Sent by email automatically, the same deliverable every month" }),
      ],
      video: "/ora_reporting_v3.mp4",
      poster: "/posters/ora_reporting_v3.jpg",
      // WeTransfer indigo — white text. Media zone = custom Ora+PDF mockup
      // (see `mockup`), so the decorative circle is dropped.
      bg: "#5865E3",
      ink: "#ffffff",
      sub: "rgba(255,255,255,0.78)",
      dark: true,
      mockup: "reporting",
    },
    {
      title: t({ fr: "Pointage de comptes", en: "Account matching" }),
      metaIcon: ClipboardCheck,
      meta: t({ fr: "Expertise comptable & révision", en: "Accounting firms & review" }),
      bullets: [
        t({ fr: "Vos comptes sont pointés automatiquement, les écarts ressortent immédiatement", en: "Your accounts are matched automatically, discrepancies stand out immediately" }),
        t({ fr: "La révision démarre sur des soldes justifiés, sans pointage manuel", en: "Review starts from justified balances, no manual ticking" }),
      ],
      video: "/ora_pointage_v3.mp4",
      poster: "/posters/ora_pointage_v3.jpg",
      // Bleu franc et saturé (client 2026-07-30 : « un bleu plus pétant »), en
      // remplacement du bleu-canard #0E7490 jugé trop éteint. Il reste bien
      // distinct de l'indigo #5865E3 de « Reporting mensuel » : celui-ci tire
      // vers le cyan, l'autre vers le violet.
      bg: "#0A6BE1",
      ink: "#ffffff",
      sub: "rgba(255,255,255,0.78)",
      dark: true,
      mockup: "pointage",
    },
    {
      title: t({ fr: "Extraction", en: "Extraction" }),
      metaIcon: FileText,
      meta: t({ fr: "Factures, relevés & liasses PDF", en: "Invoices, statements & PDF files" }),
      bullets: [
        t({ fr: "Vos PDF sont lus et transformés en tableau Excel exploitable, sans ressaisie", en: "Your PDFs are read and turned into a usable Excel table, no re-keying" }),
        t({ fr: "Chaque ligne, montant et référence extraits fidèlement, prêts à traiter", en: "Every line, amount and reference extracted faithfully, ready to work with" }),
      ],
      video: "/ora_pdf_extract_v2.mp4",
      poster: "/posters/ora_pdf_extract.jpg",
      // Rose poudré (client 2026-07-29 : « plus rose »), en remplacement de la
      // lavande #eae6fb. NB : le fond propre de la vidéo est un bleu pâle
      // #dbe3f7, donc la jonction entre la carte et le clip est ENCORE plus
      // visible qu'avant, tant que la vidéo n'est pas réexportée sur ce fond.
      bg: "#f7e3f0",
      ink: "#3d1b36",
      sub: "#7c4f6e",
      blend: true,
    },
    // ── Automatisations supplémentaires. PUBLIÉES depuis le 2026-07-30 sur
    // décision du client : le site en ligne n'affichait que quatre cartes
    // contre six en local, il en veut six partout. Le verrou
    // `import.meta.env.DEV` est donc levé.
    // ⚠ ENCORE À FINIR : les clips de démo ci-dessous sont ceux d'AUTRES cas
    // d'usage, pas les vrais. À réexporter avant de communiquer dessus. ──
    // Ordre re-permuté (client 2026-07-28) : « Réconciliation » d'abord,
    // « Formatage » ensuite. Les couleurs suivent désormais le CONTENU (le
    // damier reste régulier : colonne gauche pâle, colonne droite saturée).
    {
      title: t({ fr: "Réconciliation", en: "Reconciliation" }),
      metaIcon: ArrowLeftRight,
      meta: t({ fr: "Trésorerie & lettrage", en: "Treasury & matching" }),
      bullets: [
        t({ fr: "Vos écritures sont rapprochées et lettrées automatiquement", en: "Your entries are reconciled and matched automatically" }),
        t({ fr: "Les écarts ressortent immédiatement, prêts à justifier", en: "Discrepancies stand out immediately, ready to justify" }),
      ],
      video: "/ora_pointage_v3.mp4",
      poster: "/posters/ora_pointage_v3.jpg",
      // Fond EXACTEMENT égal au canvas de la vidéo (#d9e2f6, mesuré sur les
      // coins du clip, swatch client 2026-07-28) : le clip fond dans la carte.
      bg: "#d9e2f6",
      ink: "#0c2d4d",
      sub: "#2f5474",
      blend: true,
    },
    {
      title: t({ fr: "Formatage pour logiciel métier", en: "Formatting for your software" }),
      metaIcon: Wand2,
      // Volontairement générique : aucun éditeur n'est nommé (choix client
      // 2026-07-27), ni ici ni dans le visuel.
      meta: t({ fr: "Imports vers votre logiciel métier", en: "Imports into your software" }),
      bullets: [
        t({ fr: "Vos fichiers sont mis au format attendu par votre logiciel, prêts à importer", en: "Your files are converted to the format your software expects, ready to import" }),
        t({ fr: "Colonnes, séparateurs et libellés alignés sur la maquette d'import", en: "Columns, separators and labels aligned with the import template" }),
      ],
      video: "/final-fec.mp4",
      poster: "/posters/final-fec.jpg",
      // Indigo rétabli (client 2026-07-29) : le passage à la lavande a été
      // essayé puis annulé. Les décors de FormatageMockup sont repassés au
      // blanc avec lui.
      bg: "#5865E3",
      ink: "#ffffff",
      sub: "rgba(255,255,255,0.78)",
      dark: true,
      mockup: "formatage",
    },
  ];

  // ── Remplissage du MUR : des COPIES des vraies cartes ────────────────────
  // Elles n'apparaissent QUE pendant le dézoom, pour étoffer les colonnes et les
  // rangées, et ne rejoignent jamais la grille du dessus : hors flux
  // (`absolute`) et invisibles tant que le recul n'a pas commencé.
  //
  // Avant, c'étaient des tuiles ne portant qu'un titre sur un aplat pastel, avec
  // des intitulés INVENTÉS. Deux problèmes réglés d'un coup (client 2026-08-01) :
  // leur intérieur vide donnait au mur un aspect brouillon, et leurs noms
  // annonçaient des automatisations non garanties. On duplique désormais les six
  // cartes travaillées, en assumant les doublons, donc plus aucun intitulé
  // inventé et un mur homogène.
  // Le rendu passe par <WallCard>, qui reprend le visuel de la carte avec son
  // POSTER en image au lieu de la vidéo ou de la maquette : douze copies des
  // médias animés coûteraient beaucoup trop cher.
  // Décalage de DEUX crans, plus un par tour. Le mur alterne vraie carte / copie,
  // donc la copie d'indice i se retrouve collée à la vraie carte d'indice i :
  // sans décalage, chaque copie serait le jumeau immédiat de sa voisine de gauche
  // (le doublon côte à côte de la capture client). Deux crans suffisent à ce que
  // les TROIS cartes d'une même rangée soient toujours distinctes, vérifié sur
  // les six rangées.
  // Des répétitions restent possibles d'une rangée à l'autre dans une même
  // colonne, mais les colonnes dérivent verticalement pendant l'animation, donc
  // cet alignement ne tient jamais, et les doublons sont assumés.
  const wallDupes: UseCase[] = Array.from({ length: 12 }, (_, i) => {
    const tour = Math.floor(i / cases.length);
    return cases[(i + 2 + tour) % cases.length];
  });


  return (
    <div className="relative mb-40 md:mb-64">
      {/* Header */}
      <motion.div
        className="text-center max-w-3xl mx-auto mb-12 md:mb-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
      >
        <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
          {t({ fr: "Cas d'usage", en: "Use cases" })}
        </span>
        <h2 className="font-poppins font-medium text-3xl md:text-[2.75rem] tracking-[-0.03em] leading-[1.12] text-[#111827] dark:text-white mt-4">
          {t({ fr: "Concrètement, ce qu'Ora peut automatiser", en: "Concretely, what Ora can automate" })}
        </h2>
      </motion.div>

      {/* ══ Cartes + DÉZOOM DE SORTIE (client 2026-07-29, référence monday.com)
          Les cartes défilent normalement ; quand le BAS de la grille atteint le
          bas de l'écran, donc pile à hauteur de la dernière rangée, la grille
          s'épingle et la caméra RECULE jusqu'à ce que le mur entier tienne à
          l'écran. Ce sont les VRAIES cartes qui rétrécissent : aucune vignette
          dupliquée, aucune carte inventée. Puis le mur repart vers le haut et
          laisse la place à « Et votre workflow ? ». */}
      <div ref={trackRef} className="relative">
        <div ref={pinRef} className="md:sticky">
          <div ref={zoomRef} className="relative origin-bottom grid md:grid-cols-2 gap-7 lg:gap-10 max-w-[94rem] mx-auto">
            {cases.map((c, i) => {
              const Icon = c.metaIcon;
              // L'enveloppe porte le `translate` de la redistribution en mur ;
              // le transform de la carte elle-même appartient déjà à Framer
              // Motion (entrée + survol).
              return (
                <div key={c.title} ref={(el) => { cardRefs.current[i] = el; }}>
                  <motion.div
                    className={`group relative h-full overflow-hidden rounded-[28px] md:rounded-[40px] p-8 md:p-12 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)] transition-shadow duration-300 ease-out hover:shadow-[0_34px_70px_-24px_rgba(15,23,42,0.5)] ${c.mockup ? "flex flex-col" : ""}`}
                    style={{ background: c.bg }}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22, mass: 0.6 }}
                    variants={{
                      hidden: { opacity: 0, y: 32 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: (i % 2) * 0.12 } },
                    }}
                  >
                    {/* Decorative layer, clipped by the card. "circle": the big
                        peach disc behind the visual (WeTransfer). "rings":
                        concentric white squircle outlines (Streamyard). */}
                    {c.decor === "circle" && (
                      <div
                        aria-hidden
                        className="pointer-events-none absolute left-1/2 top-[46%] w-[105%] aspect-square -translate-x-1/2 rounded-full"
                        style={{ background: "radial-gradient(circle at 38% 30%, #e4ebff 0%, #cbd6fb 55%, #b3c1f6 100%)" }}
                      />
                    )}
                    {c.decor === "rings" && (
                      <div aria-hidden className="pointer-events-none absolute inset-0">
                        <div className="absolute left-1/2 top-[58%] w-[62%] aspect-[4/3] -translate-x-1/2 -translate-y-1/2 rounded-[48px] border-2 border-white/25" />
                        <div className="absolute left-1/2 top-[58%] w-[82%] aspect-[4/3] -translate-x-1/2 -translate-y-1/2 rounded-[64px] border-2 border-white/15" />
                        <div className="absolute left-1/2 top-[58%] w-[102%] aspect-[4/3] -translate-x-1/2 -translate-y-1/2 rounded-[80px] border-2 border-white/[0.08]" />
                      </div>
                    )}

                    {/* Title + demo pill */}
                    <div className="relative flex items-center justify-between gap-4">
                      <h3 className="font-poppins font-semibold text-[1.7rem] md:text-[2.2rem] tracking-[-0.02em]" style={{ color: c.ink }}>
                        {c.title}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActive(c)}
                        className={`group inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 md:px-5 py-2 md:py-2.5 font-inter font-semibold text-[13px] md:text-[15px] transition-colors duration-200 ${
                          c.dark ? "bg-white/15 hover:bg-white/25" : "bg-white/70 hover:bg-white"
                        }`}
                        style={{ color: c.ink }}
                      >
                        {t({ fr: "Voir la démo", en: "Watch the demo" })}
                        <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </button>
                    </div>

                    {/* Meta line */}
                    <div className="relative mt-5 md:mt-6 flex items-center gap-2.5" style={{ color: c.ink }}>
                      <Icon className="w-[18px] h-[18px]" />
                      <span className="font-inter font-semibold text-[15px] md:text-base">{c.meta}</span>
                    </div>

                    {/* Bullets — small ring markers, Bending-Spoons style */}
                    <ul className="relative mt-3 space-y-2.5">
                      {c.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2.5 font-inter text-[14px] md:text-[15.5px] leading-relaxed" style={{ color: c.sub }}>
                          <span
                            aria-hidden
                            className="mt-[7px] h-[7px] w-[7px] shrink-0 rounded-full border-[1.5px]"
                            style={{ borderColor: c.sub }}
                          />
                          {b}
                        </li>
                      ))}
                    </ul>

                    {/* Media zone. `mockup`: the static Ora+PDF+Envoyer composition
                        bleeding to the card's side + bottom edges. Otherwise the demo
                        clip in native 16:9 (nothing cropped); with `blend` it bleeds
                        to the edges with a top gradient in the card colour so the
                        clip's upper edge melts into the card (no visible seam). */}
                    {c.mockup ? (
                      <div className="relative mt-auto pt-7 md:pt-9 -mx-3 md:-mx-6 -mb-8 md:-mb-12 origin-bottom transition-transform duration-500 ease-out group-hover:scale-[1.05]">
                        {c.mockup === "reporting" ? (
                          <ReportingMockup />
                        ) : c.mockup === "formatage" ? (
                          <FormatageMockup />
                        ) : (
                          <PointageMockup />
                        )}
                      </div>
                    ) : (
                      <div
                        className={
                          c.blend
                            ? "relative mt-6 md:mt-7 -mx-7 md:-mx-10 -mb-7 md:-mb-10"
                            : "relative mt-7 md:mt-9 rounded-[18px] md:rounded-[22px] overflow-hidden shadow-[0_18px_44px_-18px_rgba(15,23,42,0.3)]"
                        }
                      >
                        <video
                          src={c.video}
                          poster={c.poster}
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          className="w-full aspect-video object-cover block"
                        />
                        {c.blend && (
                          /* Voile de fusion sur les QUATRE bords (client 2026-07-28) :
                             certains passages du clip poussent du contenu blanc
                             jusqu'au cadre, ce qui créait une démarcation nette avec
                             la couleur de la carte. Chaque bord fond maintenant vers
                             le fond de la carte. */
                          <div aria-hidden className="pointer-events-none absolute inset-0">
                            <div className="absolute inset-x-0 top-0 h-10 md:h-12" style={{ background: `linear-gradient(to bottom, ${c.bg} 0%, transparent 100%)` }} />
                            <div className="absolute inset-x-0 bottom-0 h-10 md:h-12" style={{ background: `linear-gradient(to top, ${c.bg} 0%, transparent 100%)` }} />
                            <div className="absolute inset-y-0 left-0 w-10 md:w-14" style={{ background: `linear-gradient(to right, ${c.bg} 0%, transparent 100%)` }} />
                            <div className="absolute inset-y-0 right-0 w-10 md:w-14" style={{ background: `linear-gradient(to left, ${c.bg} 0%, transparent 100%)` }} />
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                </div>
              );
            })}

            {/* Copies de cartes pour étoffer le mur. HORS FLUX (`absolute`) :
                elles n'occupent aucune place dans la grille, qui reste celle des
                seules cartes travaillées. Le moteur du recul leur donne le
                gabarit d'une carte, les place dans le mur et les fait apparaître
                au fur et à mesure du dézoom.
                Décoratives : `aria-hidden` et `pointer-events-none`, pour ne pas
                doubler le contenu pour les lecteurs d'écran ni intercepter de
                clic. */}
            {wallDupes.map((c, i) => (
              <div
                key={`dupe-${i}`}
                ref={(el) => { fillerRefs.current[i] = el; }}
                aria-hidden
                className="pointer-events-none absolute left-0 top-0 opacity-0"
              >
                <WallCard item={c} />
              </div>
            ))}
          </div>
        </div>
        {/* Cale-scroll : la distance parcourue pendant que le mur est épinglé.
            Doit rester égale à PULLBACK_VH + SCROLL_VH, soit 0,7 + 1,2 = 1,9
            hauteur d'écran. Le recul occupe les 70 premiers pour-cent, le
            défilement des colonnes les 120 suivants. */}
        <div aria-hidden className="hidden md:block md:h-[190vh]" />
      </div>

      {/* Le bloc de clôture « Ora Engineering, automatisation sur mesure » /
          « Et votre workflow ? » / « Réserver un appel » a été SUPPRIMÉ (client
          2026-07-30) : le mur enchaîne désormais directement sur « Automatisez
          de bout en bout ». */}

      {active && <UseCaseLightbox item={active} onClose={() => setActive(null)} />}
    </div>
  );
}

// ── Enlarged demo overlay (same pattern as the demo-video lightbox) ─────────
function UseCaseLightbox({ item, onClose }: { item: UseCase; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 backdrop-blur-xl p-4 md:p-8"
      onClick={onClose}
    >
      <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute -top-11 right-0 md:-right-2 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="rounded-2xl overflow-hidden bg-black shadow-2xl ring-1 ring-white/10">
          <video
            src={item.video}
            poster={item.poster}
            autoPlay
            loop
            controls
            playsInline
            className="w-full aspect-video object-contain bg-black"
          />
        </div>
        <p className="mt-3 text-center font-inter text-sm text-white/80">{item.title}</p>
      </div>
    </div>,
    document.body
  );
}
