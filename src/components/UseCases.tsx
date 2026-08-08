import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { ArrowLeftRight, ClipboardCheck, FileText, FolderCheck, Mail, Maximize2, PieChart, PlugZap, Scale, TrendingUp, Wand2, X, type LucideIcon } from "lucide-react";
import { useLang } from "@/lib/i18n";
import ReportingMockup from "./ReportingMockup";
import PointageMockup from "./PointageMockup";
import FormatageMockup from "./FormatageMockup";
import PrevisionnelMockup from "./PrevisionnelMockup";
import EvaluationMockup from "./EvaluationMockup";
import CrmMockup from "./CrmMockup";
import OrganisationMockup from "./OrganisationMockup";

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
  /** Clip de démonstration. ABSENT quand aucune vidéo ne correspond réellement à
   *  la carte (client 2026-08-03 : « n'en invente pas, n'en mets pas une qui ne
   *  correspond pas »). Dans ce cas la pastille « Voir la démo » n'est pas
   *  rendue du tout : pas de bouton mort, et aucun texte du genre « vidéo
   *  bientôt disponible ». */
  video?: string;
  /** Toujours requis : le mur du dézoom affiche ce poster dans les copies. */
  poster: string;
  /** Card background (blue family, pastel or saturated). */
  bg: string;
  /** Voile décoratif posé PAR-DESSUS `bg` (essai bento 2026-08-06) : nuages et
   *  halos pervenche en radial-gradients empilés. Couche `absolute inset-0`
   *  sous le contenu, qui est déjà `relative`. */
  wash?: string;
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
  mockup?: "reporting" | "pointage" | "formatage" | "previsionnel" | "evaluation" | "crm" | "organisation";
  /** Image des tuiles DUPLIQUÉES du mur (`WallCard`), quand elle ne peut pas
   *  être `poster`.
   *
   *  `poster` a deux clients aux besoins opposés : la balise `<video poster>`
   *  de la lightbox, qui veut une image DU CLIP, et les tuiles du mur, qui
   *  veulent une image DE LA CARTE. Sur les sept cartes à maquette les deux ne
   *  montrent pas la même chose du tout, puisque la carte affiche une maquette
   *  et la lightbox une démo filmée. `tile` sert donc le mur, `poster` sert la
   *  lightbox, et `tile` retombe sur `poster` quand les deux coïncident (les
   *  trois cartes sans maquette, où la carte EST le clip). */
  tile?: string;
  /** Poster au fond DÉPAREILLÉ de la carte : pendant le mur / dézoom il était
   *  fondu en DUOTONE, sa luminance seule posée sur la couleur de la carte.
   *  Rustine du 2026-08-04, quand les tuiles du mur montraient un still de la
   *  VIDÉO sur une carte d'une autre couleur (client : « le mélange entre la
   *  couleur du background de la vidéo et celle de l'encadré ne va pas du
   *  tout, propose la solution la plus efficiente en attendant la création de
   *  design »).
   *
   *  PLUS UTILISÉ depuis le 2026-08-05 : `capture-posters.mjs` couvre
   *  désormais les sept maquettes et produit, pour chacune, une image d'ELLE
   *  recomposée sur SA couleur de carte. Il n'y a donc plus de fond dépareillé
   *  à rattraper. Le drapeau reste dans le type pour la prochaine carte dont le
   *  visuel arriverait avant son poster. */
  posterTone?: boolean;
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

/* ══ COMPOSITION DU MUR ═══════════════════════════════════════════════════
 * Les dix-huit tuiles du mur (dix vraies cartes + huit copies) rangée par
 * rangée, trois par rangée. `["r", i]` = la vraie carte `cases[i]`,
 * `["f", i]` = la copie `wallDupes[i]`.
 *
 * Remplace l'ancienne alternance stricte carte / copie (r0,f0,r1,f1…). Cette
 * alternance imposait aux vraies cartes les positions paires, donc une
 * répartition figée en colonnes, et c'est elle qui rendait la contrainte
 * ci-dessous impossible à satisfaire.
 *
 * ── LA CONTRAINTE (client 2026-08-05) ────────────────────────────────────
 * « Qu'il n'y ait jamais deux encadrés côte à côte qui sont la même couleur
 * et qui se rencontrent. » Difficile parce que la palette ne compte plus que
 * QUATRE couleurs pour dix-huit tuiles, et surtout parce que les colonnes
 * DÉRIVENT en sens inverse pendant la seconde phase : la tuile qui se
 * retrouve à côté d'une autre change en permanence. Un simple damier ne
 * suffit donc pas — il tient à l'arrêt, et casse au premier cran de dérive,
 * puisque la rangée i d'une colonne finit face à la rangée i±1 de sa voisine.
 *
 * ── LA SOLUTION : DES COLONNES À COULEURS DISJOINTES ─────────────────────
 * Chaque colonne ne tire que dans un jeu de deux couleurs, et deux colonnes
 * VOISINES n'ont aucune couleur en commun :
 *
 *   colonne 0   #d2e4fa / #E5E7F9   (les deux clairs)
 *   colonne 1   #2463D8 / #17479C   (les deux profonds)
 *   colonne 2   #d2e4fa / #E5E7F9   (les deux clairs)
 *
 * Deux voisines horizontales sont donc toujours de couleurs différentes,
 * QUEL QUE SOIT le décalage vertical de la dérive : la propriété ne dépend
 * plus de l'alignement des rangées. Les colonnes 0 et 2 peuvent partager leur
 * jeu sans risque, elles ne se touchent jamais, la colonne 1 est entre elles.
 *
 * À l'intérieur d'une colonne, les deux couleurs ALTERNENT, ce qui règle
 * l'adjacence verticale. Et comme deux colonnes voisines n'ont aucune couleur
 * commune, elles n'ont a fortiori aucune CARTE commune : l'ancienne garantie
 * d'identité (« jamais deux fois la même carte côte à côte ») est conservée
 * sans avoir à la traiter à part.
 *
 * ── CE QUI EN DÉCOULE ────────────────────────────────────────────────────
 * Douze tuiles claires et six profondes. Il y a cinq vraies cartes de chaque,
 * d'où sept copies claires et une seule profonde. Les cinq cartes profondes
 * occupent donc cinq des six cases de la colonne du milieu, ce que
 * l'alternance stricte interdisait (elle ne leur en laissait que trois).
 *
 * Le trajet des vraies cartes reste borné à UNE rangée, comme avant : c'est
 * ce qui garde le recul propre (voir le commentaire sur les cartes en tête).
 */
const WALL_REALS = 10;
const WALL_FILLS = 8;
const WALL_ORDER: readonly (readonly ["r" | "f", number])[] = [
  // rangée 0 — clair, profond, clair
  ["r", 0], ["r", 2], ["f", 0],
  // rangée 1
  ["r", 3], ["r", 1], ["f", 1],
  // rangée 2
  ["r", 4], ["r", 5], ["f", 2],
  // rangée 3
  ["f", 3], ["f", 4], ["r", 7],
  // rangée 4
  ["f", 5], ["r", 6], ["r", 8],
  // rangée 5
  ["f", 6], ["r", 9], ["f", 7],
] as const;

/* BASCULE VERS LES POSTERS RETIRÉE (client 2026-08-05 : « on est sur un écran
 * figé avec des écritures bleues à l'intérieur alors que la vidéo contenue
 * n'est pas comme ça », « fais aussi en sorte que les vidéos continuent même au
 * dézoom »).
 *
 * Pendant le recul, les VRAIES cartes troquaient leur contenu vivant contre
 * leur poster, pour n'avoir qu'une image à repeindre par carte au lieu d'une
 * maquette détaillée. Deux défauts, tous les deux visibles :
 *   · les posters des cartes à maquette (« Pointage », « Reporting »,
 *     « Formatage ») sont des STILLS DE LA VIDÉO DE DÉMO, pas de la maquette
 *     affichée sur la carte. Le dézoom remplaçait donc un visuel par un AUTRE
 *     visuel. Pire, avec `posterTone` le still est fondu en luminosité sur la
 *     couleur de la carte : d'où les « écritures bleues » du signalement ;
 *   · les clips étaient mis en pause pendant toute la séquence épinglée.
 *
 * Les tuiles dupliquées du mur (`WallCard`) restent, elles, en poster : elles
 * n'ont jamais rien eu d'autre, et ce sont elles qui étoffent le mur. Le coût de
 * repeinte se limite donc aux sept cartes réelles.
 */

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
  const Icon = item.metaIcon;
  return (
    <div
      // Même enveloppe Stripe que la vraie carte (liseré, coins, ombre).
      className={`relative h-full overflow-hidden rounded-[16px] md:rounded-[20px] p-8 md:p-10 ring-1 ring-[#0a2540]/[0.08] shadow-[0_6px_24px_-14px_rgba(10,37,64,0.25)]${item.mockup ? " flex flex-col" : ""}`}
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
      {item.wash && (
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: item.wash }} />
      )}

      <div className="relative flex items-start justify-between gap-4">
        <h3 className="font-poppins font-medium text-[1.45rem] md:text-[1.8rem] tracking-[-0.02em] leading-[1.15]" style={{ color: item.ink }}>
          {item.title}
        </h3>
        {item.video && (
          <span className="inline-flex shrink-0 items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-[10px] bg-[#6c72ec] text-white shadow-[0_6px_16px_-6px_rgba(108,114,236,0.6)]">
            <Maximize2 className="w-[18px] h-[18px]" />
          </span>
        )}
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

      {/* Même emplacement que le média de la vraie carte, poster en image.
          Cartes à maquette : le poster est ENCADRÉ (coins arrondis, liseré,
          ombre) au lieu de saigner jusqu'aux bords (client 2026-08-04 : le
          still vidéo au fond sombre de « Reporting mensuel » ou « Pointage »
          tranchait comme une tache sur l'aplat de la carte ; encadré, il se
          lit comme une capture d'écran posée volontairement). */}
      <div
        className={
          item.mockup
            ? "relative mt-auto pt-7 md:pt-9"
            : item.blend
              ? "relative mt-6 md:mt-7 -mx-7 md:-mx-10 -mb-7 md:-mb-10"
              : "relative mt-7 md:mt-9 rounded-[12px] md:rounded-[14px] overflow-hidden ring-1 ring-[#0a2540]/[0.07] shadow-[0_14px_36px_-16px_rgba(10,37,64,0.3)]"
        }
      >
        {item.mockup ? (
          // `tile` et non `poster` : sur une carte à maquette, c'est l'image de
          // LA MAQUETTE, recomposée sur la couleur de la carte par
          // capture-posters.mjs. Le fond y est donc déjà le bon, et le duotone
          // de secours (`posterTone`) n'a plus lieu de servir.
          <div
            className={`rounded-[12px] md:rounded-[14px] overflow-hidden ring-1 ring-[#0a2540]/[0.07] shadow-[0_14px_36px_-16px_rgba(10,37,64,0.3)]${
              item.posterTone ? " ring-black/[0.08]" : ""
            }`}
            style={item.posterTone ? { background: item.bg } : undefined}
          >
            <img
              src={item.tile ?? item.poster}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
              className={`w-full aspect-video object-cover block${item.posterTone ? " mix-blend-luminosity" : ""}`}
            />
          </div>
        ) : (
          <img
            src={item.tile ?? item.poster}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
            className="w-full aspect-video object-cover block"
          />
        )}
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
  /** Bandes de fondu haut et bas, en remplacement du `mask-image`. */
  const fadeTopRef = useRef<HTMLDivElement>(null);
  const fadeBotRef = useRef<HTMLDivElement>(null);

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
    const fadeTop = fadeTopRef.current;
    const fadeBot = fadeBotRef.current;
    if (!track || !pin || !grid || !fadeTop || !fadeBot) return;

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
      /** Rangée dans le mur, 0 en haut. Sert au DÉCALAGE d'arrivée : sans lui
       *  les dix-huit tuiles voyageaient d'un seul bloc, à la même vitesse et
       *  sur la même courbe, ce qui donnait un basculement de bloc au lieu
       *  d'une réorganisation. */
      row: number;
      /** Position et hauteur de MISE EN PAGE, pour situer la carte à l'écran sans
       *  aucune lecture pendant le scroll. */
      top0: number;
      h: number;
      /** Dernier état de masquage écrit, pour ne pas réécrire à l'identique. */
      off: boolean;
      /** Dernier `will-change` écrit, même raison. */
      wc: string;
      /** Dernière opacité écrite (tuiles seulement), même raison. */
      op: number;
      /** Dernier transform écrit, même raison. */
      tr: string;
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
      /** Hauteur du cadenceur, mise en CACHE. Elle ne dépend que de la mise en
       *  page, jamais du scroll : la relire dans `apply()` revenait à demander un
       *  recalcul SYNCHRONE de la mise en page juste après avoir écrit dix-neuf
       *  transformes, donc à chaque image. C'est le pire schéma possible
       *  (écriture → lecture), et il annulait tout le bénéfice du découpage
       *  mesure / application. */
      trackH: number;
      /** Hauteur de l'enveloppe épinglée, pour la découpe basse. */
      pinH: number;
      /** Nombre de rangées du mur, pour normaliser le décalage d'arrivée. */
      nRows: number;
      slots: Slot[];
    };
    // MISE EN PAUSE PENDANT LE RECUL RETIRÉE (client 2026-08-05 : « fais aussi
    // en sorte que les vidéos continuent même au dézoom »). L'argument d'avant
    // — « à l'échelle où les cartes se retrouvent, une image figée est
    // indiscernable d'une vidéo qui joue » — ne tient pas au DÉBUT du recul, où
    // les cartes sont encore presque à taille réelle et où le gel se voit.
    // La visibilité reste, elle, le seul critère de lecture : c'est le seul
    // filtre qui ne coûte rien à l'œil.
    const videos = [...grid.querySelectorAll("video")];
    // Chrome ne suspend PAS une vidéo muette sortie de l'écran : les clips
    // continueraient de décoder leurs images en boucle pendant tout le
    // défilement de la page, un coût payé même cartes hors champ. L'observer
    // met donc en pause ce qui est hors écran et relance ce qui y entre.
    let geo: Geo | null = null;
    let rafId = 0;
    let hinted = false;
    /** Vrai quand l'état de repos a déjà été posé : évite de le réécrire. */
    let auRepos = false;
    /** Vrai quand les deux bandes de fondu sont visibles. */
    let fondus = false;
    /** Dernier transform posé sur la grille, pour ne pas le réécrire à l'identique. */
    let dernierGT = "";
    /** Vrai tant que la séquence épinglée est engagée. Seul cas où les cartes
     *  bougent sous le curseur, donc seul cas où le survol doit être coupé. */
    let dansLeMur = false;

    const vio = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const v = e.target as HTMLVideoElement;
          // `play()` renvoie une promesse qui peut être rejetée (onglet masqué,
          // politique d'autoplay) : on l'ignore volontairement.
          if (e.isIntersecting) void v.play().catch(() => {});
          else v.pause();
        }
      },
      // Seuil à un tiers de la vidéo VISIBLE, sans marge : les clips n'ont
      // plus d'autoPlay (client 2026-08-04 : « démarre quand l'utilisateur
      // arrive dessus et pas avant »), c'est donc cet observer qui déclenche
      // la toute première lecture, au moment où la carte est réellement sous
      // les yeux. Le poster occupe l'image jusque-là.
      { threshold: 0.35 },
    );
    videos.forEach((v) => vio.observe(v));
    /** Dernières bornes du masque posées, pour ne pas le réécrire à l'identique. */
    const lastMask: { haut: number | null; bas: number | null } = { haut: null, bas: null };

    const reset = () => {
      pin.style.top = "";
      pin.style.removeProperty("clip-path");
      fadeTop.style.opacity = "0";
      fadeBot.style.opacity = "0";
      fondus = false;
      grid.style.transform = "";
      grid.style.willChange = "";
      dernierGT = "";
      cardRefs.current.forEach((el) => {
        if (el) { el.style.transform = ""; el.style.willChange = ""; el.style.visibility = ""; }
      });
      fillerRefs.current.forEach((el) => {
        if (el) { el.style.transform = ""; el.style.willChange = ""; el.style.opacity = "0"; el.style.pointerEvents = ""; el.style.visibility = ""; }
      });
      hinted = false;
      dansLeMur = false;
      // Sans ça, un retour aux MÊMES bornes après un reset sauterait la
      // réécriture et le masque resterait absent.
      lastMask.haut = null;
      lastMask.bas = null;
    };

    /** Remet les cartes à plat, mais CONSERVE `pin.style.top` : sans lui
     *  l'épinglage ne se déclencherait plus à l'arrivée. Contrairement à
     *  `reset()`, qui sert à désactiver complètement le moteur. */
    const settleAtRest = () => {
      if (auRepos) return;
      auRepos = true;
      grid.style.transform = "";
      grid.style.willChange = "";
      dernierGT = "";
      hinted = false;
      for (const slot of geo?.slots ?? []) {
        slot.card.style.transform = "";
        slot.card.style.visibility = "";
        slot.card.style.willChange = "";
        slot.off = false;
        slot.wc = "";
        slot.tr = "";
        if (slot.still) { slot.card.style.opacity = "0"; slot.card.style.pointerEvents = ""; slot.op = 0; }
      }
      pin.style.removeProperty("clip-path");
      fadeTop.style.opacity = "0";
      fadeBot.style.opacity = "0";
      fondus = false;
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
      // Composition du mur : voir WALL_ORDER. Repli sur l'ancienne alternance
      // carte / tuile si le compte de cartes a changé, pour que l'ajout d'un cas
      // d'usage dégrade le damier au lieu de casser le mur.
      const cards: HTMLDivElement[] =
        reals.length === WALL_REALS && fills.length === WALL_FILLS
          ? WALL_ORDER.map(([kind, i]) => (kind === "r" ? reals[i] : fills[i]))
          : (() => {
              const a: HTMLDivElement[] = [];
              for (let i = 0; i < Math.max(reals.length, fills.length); i++) {
                if (i < reals.length) a.push(reals[i]);
                if (i < fills.length) a.push(fills[i]);
              }
              return a;
            })();

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
      // Cache de l'ANCIEN passage, retrouvé par élément carte : `measure()` peut
      // se redéclencher en PLEIN milieu de l'animation (changement de langue,
      // redimensionnement — le `ResizeObserver` sur `pin` guette les deux), et
      // reconstruit alors un `Slot` NEUF par carte. Les éléments DOM, eux, ne
      // sont pas réinitialisés : ils portent encore les styles écrits par le
      // dernier `apply()`. Sans ce report, un `Slot` neuf reparcourt à `op: 0`
      // pendant qu'une tuile affiche encore 0,6 à l'écran ; si l'image suivante
      // calcule à nouveau une cible de 0 (parfaitement possible juste après un
      // redimensionnement, qui déplace aussi `p`), la comparaison `op !== slot.op`
      // ne voit AUCUN changement et n'écrit rien : la tuile reste figée à 0,6
      // jusqu'à ce que le scroll la fasse ressortir de ce sous-intervalle. Même
      // défaut pour `off` (une carte resterait invisible) et `wc`. Le report
      // aligne le cache neuf sur ce que le DOM affiche RÉELLEMENT, donc la
      // comparaison redevient fiable dès la toute première image qui suit.
      const oldByCard = new Map(geo?.slots.map((s) => [s.card, s]) ?? []);
      const rowLeft0 = (gridW - (cols * (colW + gapX) - gapX)) / 2;
      const slots: Slot[] = [];
      let rowTop = 0;
      rows.forEach((row, ri) => {
        let cardLeft = rowLeft0;
        row.forEach((card, ci) => {
          const prev = oldByCard.get(card);
          slots.push({
            card,
            still: fillerSet.has(card),
            dx: cardLeft - leftOf(card),
            dy: rowTop - topOf(card),
            mid: ci === 1,
            row: ri,
            top0: topOf(card),
            h: hOf(card),
            off: prev?.off ?? false,
            wc: prev?.wc ?? "",
            op: prev?.op ?? 0,
            tr: prev?.tr ?? "",
          });
          cardLeft += colW + gapX;
        });
        rowTop += Math.max(...row.map(hOf)) + gapY;
      });

      // Les deux DERNIÈRES lectures, encore AVANT les écritures qui suivent :
      // aucune des écritures ci-dessous ne change la hauteur de `track` ou de
      // `pin` (`top`, `width`/`height` hors flux, `translate3d`), donc les lire
      // après n'aurait rien invalidé de RÉEL — mais l'inverser les aurait quand
      // même rendues SUSPECTES au premier survol du fichier, à l'endroit même
      // qui explique juste en dessous pourquoi l'ordre lecture/écriture compte.
      const trackH = track.offsetHeight;
      const pinH = pin.offsetHeight;

      // ÉCRITURES groupées à la toute fin, une fois toutes les lectures faites.
      // Le gabarit des tuiles est posé ICI et plus à chaque image : `width` et
      // `height` sont des propriétés de MISE EN PAGE, les réécrire soixante fois
      // par seconde invalidait la mise en page pour rien.
      pin.style.top = `${pinTop}px`;
      for (const f of fills) {
        f.style.width = `${colW}px`;
        f.style.height = `${rowH}px`;
      }

      const fadeH = Math.min(130, vh * 0.16);
      // Gabarit des deux bandes de fondu posé ICI, avec le reste des écritures
      // de mise en page. Pendant le scroll elles ne reçoivent plus qu'un
      // `translate3d`, qui ne coûte rien.
      fadeTop.style.height = `${fadeH}px`;
      fadeBot.style.height = `${fadeH}px`;

      geo = {
        pinTop, scrub: vh * PULLBACK_VH, scroll: vh * SCROLL_VH,
        fit, gridH, wallFullH,
        fadeH, trackH, pinH, nRows: rows.length, slots,
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

      // ── DEUX SORTIES ANTICIPÉES ──────────────────────────────────────────
      // `apply()` était appelé à chaque événement de scroll de TOUTE la page, et
      // réécrivait alors dix-neuf transformations identiques (`translate3d(0px,
      // 0px, 0)`) même quand la section était à des milliers de pixels de
      // l'écran. Poser la même valeur marque quand même l'élément à recalculer :
      // ce coût était payé en permanence, d'où les accrocs ressentis AVANT le
      // dézoom, quand les cartes sont encore en deux colonnes.
      //   1. Avant l'épinglage : on pose l'état de repos UNE fois, puis plus rien.
      if (d <= 0) {
        dansLeMur = false;
        return settleAtRest();
      }
      auRepos = false;
      dansLeMur = true;
      //   2. Épinglage entièrement hors de l'écran : rien de visible à mettre à
      //      jour, on garde l'état tel quel, il sera recalculé au retour.
      const vhNow = window.innerHeight;
      if (pinTopNow + g.gridH < -400 || pinTopNow > vhNow + 400) return;

      const p = clamp01(d / g.scrub);
      const u = ease(p);
      const s = 1 - (1 - g.fit) * u;
      // Dérive inverse : la colonne du MILIEU descend pendant que les deux
      // extérieures montent. Exprimée en pixels d'écran, donc divisée par
      // l'échelle du mur.
      //
      // DEMI-TOUR SUPPRIMÉ (client 2026-08-05 : « l'animation du dézoom quand on
      // arrive aux deux dernières cartes, je ne trouve pas ça stylé du tout »).
      // Le facteur valait `(p - 0.15)`, donc NÉGATIF sur les quinze premiers
      // pour-cent : les colonnes partaient dans le mauvais sens, s'arrêtaient,
      // puis repartaient dans l'autre. Ce demi-tour, en plein début du recul,
      // est très exactement ce qu'on lit comme un raté. L'intention d'origine
      // — que le mur soit « déjà en mouvement en arrivant » — est conservée
      // autrement : le facteur démarre à zéro et croît, la dérive s'installe
      // sans jamais s'inverser.
      const drift = (u * clamp01((p - 0.15) / 0.85) * WALL_DRIFT) / s;
      // Apparition des tuiles, DÉCALÉE RANGÉE PAR RANGÉE plus bas. Avant, les
      // huit apparaissaient d'un bloc sur les derniers pour-cent : un mur vide
      // qui se remplit d'un coup, juste au moment où le regard est encore sur les
      // deux dernières cartes. La base reste la même, la répartition change.
      const fadeBase = clamp01((u - 0.72) / 0.2);
      // SECONDE PHASE. `q` reste à zéro tant que la distance parcourue n'a pas
      // dépassé la longueur du recul : le dézoom se déroule donc exactement comme
      // avant, on n'y touche pas. Ensuite le mur reste épinglé et les colonnes
      // défilent, les extérieures vers le haut, celle du milieu vers le bas.
      // Sans boucle : ce qui atteint le bord s'efface dans le dégradé déjà posé,
      // et la réserve de tuiles couvre la course.
      const q = clamp01((d - g.scrub) / g.scroll);
      const colScroll = (q * COL_SCROLL) / s;
      // DEUX états distincts, et c'est le correctif du « ça bugue fortement à la
      // fin » (client 2026-08-03) :
      //   · `engaged` = le mur est en disposition de mur. Il le reste au-delà de
      //     la fin de l'animation, donc rien ne bascule à cet instant ;
      //   · `running` = l'animation progresse encore.
      // Avant, un unique `active = d > 0 && q < 1` faisait TOUT retomber pile à
      // q = 1 : l'élagage se désactivait et les quinze à vingt cartes masquées
      // redevenaient visibles dans la MÊME image, obligeant le navigateur à
      // peindre d'un coup autant de grandes cartes avec leurs maquettes. C'était
      // le pic de la fin du défilement.
      const engaged = u > 0;
      const running = d > 0 && q < 1;
      // TROISIÈME état, et c'est le correctif du « ça bugue au défilement ».
      // Il sépare les deux phases par ce qui les distingue VRAIMENT du point de
      // vue du dessin :
      //   · pendant le recul, l'ÉCHELLE de la grille change à chaque image. Tout
      //     ce qu'elle contient doit être redessiné à la nouvelle échelle, et
      //     toute couche fille l'oblige à être redessinée séparément. On ne veut
      //     donc AUCUNE couche fille : une seule surface, celle de la grille ;
      //   · pendant le défilement des colonnes, l'échelle est FIGÉE (u vaut 1) et
      //     la grille ne bouge plus du tout : seules les cartes se déplacent, en
      //     translation pure. Là, une couche par carte visible est exactement ce
      //     qu'il faut, le compositeur les déplace sans rien redessiner.
      // Le seuil est à 0,92 et non à 1 : créer six à neuf couches d'un coup coûte
      // une image, et on préfère la payer AVANT la bascule plutôt que pile
      // dessus. Le recul étant en cubique amorti, `u` vaut déjà 0,998 à p = 0,92 :
      // sur ces derniers pour-cent l'échelle ne bouge pratiquement plus, la
      // promotion n'y déclenche donc aucune re-rastérisation en cascade.
      const promouvoir = engaged && p >= 0.92;

      // ── Élagage du DESSIN ────────────────────────────────────────────────
      // Le mur fait environ trois fois la hauteur de la bande visible, donc la
      // plupart des cartes sont peintes alors qu'elles sont hors champ, et de
      // toute façon effacées par le fondu. On les sort du dessin avec
      // `visibility:hidden`, qui n'affecte PAS la mise en page : aucune de leurs
      // positions ne change, elles réapparaissent simplement quand elles entrent.
      // Tout est déduit de valeurs en cache, sans une seule lecture de mise en
      // page pendant le scroll.
      // Le repère : après le transform de la grille, une position locale y tombe à
      // l'écran en pinTopNow + gridH + (y - gridH) * s + T.
      const marge = 120;
      const wallH = g.gridH + (g.wallFullH - g.gridH) * u;
      const gridT = u * (s * g.gridH - (s * wallH) / 2 - vhNow / 2);

      // ── DÉCALAGE D'ARRIVÉE ───────────────────────────────────────────────
      // Avant, les dix cartes partageaient le MÊME `u` : elles voyageaient donc
      // en bloc, à la même vitesse, sur la même courbe, et la grille basculait
      // d'un seul tenant. C'est ce qui n'avait rien d'une réorganisation.
      // Chaque rangée démarre maintenant un peu après la précédente, du haut
      // vers le bas : le mur s'assemble en vague, dans le sens de la lecture, et
      // les deux dernières cartes — celles que le lecteur a encore sous les yeux
      // quand le recul s'amorce — restent en place le temps que le reste se
      // range, au lieu de se dérober sous son regard.
      // La course de chaque carte est comprimée d'autant (dénominateur
      // `1 - SPREAD`), donc toutes atteignent leur place à p = 1 exactement : la
      // disposition finale est rigoureusement inchangée.
      const SPREAD = 0.28;
      const denomRow = Math.max(1, g.nRows - 1);

      // ÉCRITURES.
      for (const slot of g.slots) {
        const lag = (slot.row / denomRow) * SPREAD;
        const t = slot.still ? 1 : ease(clamp01((p - lag) / (1 - SPREAD)));
        // Les deux mouvements vont dans le MÊME sens et s'additionnent : la
        // colonne du milieu descend pendant le recul puis continue de descendre
        // pendant le défilement, les extérieures montent puis continuent de
        // monter. Aucune inversion de sens au passage d'une phase à l'autre.
        const dy = slot.dy * t + (slot.mid ? drift + colScroll : -drift - colScroll);
        // Arrondi au centième de pixel, et réécriture seulement en cas de vrai
        // changement. Une fois l'animation terminée, le mur reste en place
        // pendant qu'on continue de scroller : les dix-huit transformes étaient
        // alors réécrits à l'identique à chaque image, et chaque réécriture
        // remet la carte dans la liste des éléments à recalculer, même sans
        // changement de valeur. C'est ce qui restait à payer sur toute la fin de
        // la section.
        const tr = `translate3d(${Math.round(slot.dx * t * 100) / 100}px, ${Math.round(dy * 100) / 100}px, 0)`;
        if (tr !== slot.tr) {
          slot.tr = tr;
          slot.card.style.transform = tr;
        }

        // Hors de la bande visible ? On la sort du DESSIN. `visibility` n'affecte
        // pas la mise en page, donc rien ne se déplace et la carte réapparaît
        // simplement quand elle entre. L'état n'est écrit qu'au changement.
        const yLocal = slot.top0 + dy;
        const yEcran = pinTopNow + g.gridH + (yLocal - g.gridH) * s + gridT;
        const off = engaged && (yEcran + slot.h * s < -marge || yEcran > vhNow + marge);
        if (off !== slot.off) {
          slot.off = off;
          slot.card.style.visibility = off ? "hidden" : "";
        }
        // Promotion en couche GPU réservée à la SECONDE phase (`promouvoir`,
        // calculé plus haut). Pendant le recul, une carte promue serait une
        // couche fille à l'intérieur d'un parent dont l'échelle change à chaque
        // image : le navigateur doit alors re-rastériser CHAQUE couche fille à
        // la nouvelle échelle, soit six à neuf rastérisations par image au lieu
        // d'une seule pour la grille. La promotion carte par carte, censée
        // alléger, coûtait donc plus cher qu'elle ne rapportait.
        const wc = promouvoir && !off ? "transform" : "";
        if (wc !== slot.wc) {
          slot.wc = wc;
          slot.card.style.willChange = wc;
        }

        if (slot.still) {
          // Écrit seulement quand la valeur change VRAIMENT. `fadeBase` reste à
          // zéro pendant la plus grande partie du recul : on y réécrivait
          // « 0 » sur huit tuiles à chaque image, pour rien.
          // Le décalage par rangée suit celui des cartes : chaque tuile
          // n'apparaît qu'une fois sa rangée arrivée, la cascade descend donc le
          // mur au lieu de le remplir d'un bloc.
          const op = Math.round(clamp01((fadeBase - lag * 0.55) / (1 - SPREAD)) * 100) / 100;
          if (op !== slot.op) {
            slot.op = op;
            slot.card.style.opacity = String(op);
            // Survolables une fois franchement révélées seulement : avant, la
            // classe pointer-events-none reste maîtresse, pour ne jamais voler
            // un clic aux vraies cartes pendant la transition.
            slot.card.style.pointerEvents = op > 0.6 ? "auto" : "none";
          }
        }
      }
      // Recul de caméra. Origine en bas de la grille, donc pile sur le bas de
      // l'écran pendant l'épinglage : à u = 0 la grille est exactement à sa
      // place, et le mur se recentre au fur et à mesure du recul.
      // (Le décalage vertical est calculé plus haut, `gridT`, pour servir aussi à
      // l'élagage du dessin.)
      // Réécrit seulement s'il change vraiment : pendant toute la SECONDE phase
      // il est constant (u vaut 1, donc `s` et `gridT` aussi), et le réécrire à
      // l'identique remet malgré tout la grille — et ses dix-huit encadrés — dans
      // la liste des éléments à recalculer, soixante fois par seconde.
      const gt = `translate3d(0, ${Math.round(gridT * 100) / 100}px, 0) scale(${Math.round(s * 10000) / 10000})`;
      if (gt !== dernierGT) {
        dernierGT = gt;
        grid.style.transform = gt;
      }

      // La grille suit `engaged` : promue tant que le mur est en disposition de
      // mur, donc aucune bascule à la fin de l'animation. Écrit au changement
      // seulement. La promotion des cartes est gérée une par une dans la boucle
      // ci-dessus.
      if (engaged !== hinted) {
        hinted = engaged;
        grid.style.willChange = engaged ? "transform" : "";
      }

      // ── Découpe de la bande visible, et fondu de ses deux bords ──────────
      // C'était le poste le plus lourd de la séquence, et il est ici SCINDÉ en
      // deux mécanismes distincts, un par besoin :
      //   · la COUPE FRANCHE (le mur déborde largement sous l'enveloppe et
      //     empiétait sinon sur la section suivante) est faite par un
      //     `clip-path: inset(...)`. Un rectangle sans coin arrondi est appliqué
      //     par le compositeur comme un simple rognage de couche ;
      //   · l'ADOUCISSEMENT des deux bords est fait par deux bandes en dégradé
      //     posées par-dessus, qu'on se contente de translater.
      // Avant, les deux étaient obtenus par un unique `mask-image` en dégradé
      // sur l'enveloppe épinglée. Un masque de ce type oblige le navigateur à
      // dessiner TOUT son contenu dans une texture hors écran, puis à lui
      // appliquer le dégradé, puis à composer le résultat — et ce contenu, c'est
      // dix-huit encadrés, leurs ombres portées, sept scènes de maquette et
      // trois vidéos. Cette passe était repayée à chaque re-rastérisation, donc
      // à chaque image du recul, puisque l'échelle du mur y change en continu.
      // Le rendu à l'écran est identique.
      if (p > 0 && running) {
        // Bornes ARRONDIES au pixel, et réécriture seulement en cas de vrai
        // changement : au pixel près, deux images voisines demandent très
        // souvent la même découpe.
        const haut = Math.round(-pinTopNow);
        const bas = Math.round(-pinTopNow + Math.min(vhNow, trackTop + g.trackH));
        if (haut !== lastMask.haut || bas !== lastMask.bas) {
          lastMask.haut = haut;
          lastMask.bas = bas;
          // Bornes ramenées dans la boîte : à la toute dernière image, quand
          // l'épinglage se relâche, `bas` peut dépasser la hauteur de
          // l'enveloppe d'un ou deux pixels. Une valeur négative rendrait la
          // déclaration invalide, et la découpe resterait alors bloquée sur la
          // précédente.
          const bd = Math.max(0, g.pinH - bas);
          pin.style.clipPath = `inset(${Math.max(0, haut)}px 0px ${bd}px 0px)`;
          fadeTop.style.transform = `translate3d(0,${haut}px,0)`;
          fadeBot.style.transform = `translate3d(0,${bas - g.fadeH}px,0)`;
        }
        if (!fondus) {
          fondus = true;
          fadeTop.style.opacity = "1";
          fadeBot.style.opacity = "1";
        }
      } else if (p === 0 && lastMask.haut !== null) {
        lastMask.haut = null;
        lastMask.bas = null;
        fondus = false;
        pin.style.removeProperty("clip-path");
        fadeTop.style.opacity = "0";
        fadeBot.style.opacity = "0";
      }
    };

    /** Survol coupé pendant le défilement, mais SEULEMENT dans la séquence
     *  épinglée (client 2026-08-05 : « quand on passe le curseur au-dessus des
     *  encadrés il faut le passer deux fois »).
     *
     *  C'ÉTAIT LE BUG. Couper `pointer-events` puis les rendre ne suffit pas à
     *  réveiller le `:hover` : le navigateur ne réévalue l'état de survol qu'au
     *  prochain ÉVÉNEMENT de souris. Curseur posé sur une carte et page
     *  immobilisée, la restauration 160 ms plus tard ne déclenchait donc rien —
     *  il fallait bouger la souris une deuxième fois. Et comme la coupure valait
     *  pour TOUT défilement, le cas se produisait à chaque fois qu'on
     *  s'arrêtait sur une carte, c'est-à-dire exactement le geste voulu.
     *
     *  La coupure ne sert vraiment que pendant le mur : là, ce sont les cartes
     *  qui bougent sous un curseur immobile, et elles enchaînent enter/leave à
     *  chaque image. Hors mur, la page défile mais le curseur ne traverse au
     *  pire qu'une ou deux frontières de carte : il n'y a pas de rafale à
     *  éteindre. La coupure y est donc levée, et le survol répond du premier
     *  coup.
     *
     *  Le levage de la carte est passé de `whileHover` (Framer, donc JavaScript
     *  sur événement de pointeur) à une transition CSS sur l'enveloppe : plus
     *  rien ne dépend d'un rappel JS dans le chemin de survol, et l'état se
     *  rétablit tout seul avec `:hover`. */
    let hoverTimer = 0;
    let hoverOff = false;
    const restoreHover = () => {
      hoverOff = false;
      grid.style.pointerEvents = "";
    };
    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(apply);
      // `dansLeMur` est posé par `apply()`, donc avec une image de retard : sans
      // conséquence, la rafale d'enter/leave ne commence qu'une fois les cartes
      // réellement transformées.
      if (desktop.matches && dansLeMur) {
        if (!hoverOff) {
          hoverOff = true;
          grid.style.pointerEvents = "none";
        }
        clearTimeout(hoverTimer);
        hoverTimer = window.setTimeout(restoreHover, 160);
      } else if (hoverOff) {
        clearTimeout(hoverTimer);
        restoreHover();
      }
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
      clearTimeout(hoverTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", remeasure);
      ro.disconnect();
      vio.disconnect();
    };
  }, []);

  // ══ ESSAI « BENTO STRIPE » (client 2026-08-06, itération 2) ══════════════
  // Consigne exacte : « copie exactement les encadrés [de stripe.com], leur
  // design, etc., juste que tu mettes de la couleur bleue » — le bleu étant
  // celui de la carte GPT-Live fournie en capture (pervenche nuageux).
  // La première itération (quatre habillages clairs/profonds maison) est dans
  // git ; celle-ci colle à l'anatomie Stripe :
  //   · cartes BLANCHES uniformes, liseré marine hairline, ombre discrète,
  //     coins bien plus modestes que les 40 px d'avant ;
  //   · encre des titres #0a2540 et corps #425466, les valeurs de stripe.com ;
  //   · le BOUTON CARRÉ d'agrandissement en haut à droite (pervenche plein,
  //     glyphe Maximize2) remplace la pastille « Voir la démo » — c'est lui
  //     qui ouvre la lightbox, aria-label conservé ;
  //   · un voile pervenche par carte, direction variée, là où Stripe pose ses
  //     orangés. Quatre voiles pour dix cartes, jamais deux identiques côte à
  //     côte.
  // L'ancien damier clair/profond disparaît : toutes les cartes partagent le
  // même blanc, comme la grille Stripe. La garantie « jamais deux couleurs
  // identiques côte à côte » du mur est donc DISSOUTE d'office — c'est le
  // parti pris de la référence, pas un oubli.
  // ⚠ Toujours vrai depuis l'itération 1 : les clips FEC / Extraction /
  // Réconciliation gardent leur canvas bleu pâle cuit dans le MP4, d'où leurs
  // vidéos ENCADRÉES (plus de `blend`). Réexporter sur blanc pour le fondu.
  const STRIPE = {
    bg: "#ffffff",
    ink: "#0a2540",
    sub: "#425466",
    /** Pervenche GPT-Live — bouton carré et accents (le #635bff de Stripe). */
    accent: "#6c72ec",
    accentHover: "#585fe6",
    /** Voile montant du bas, le plus marqué (l'orangé de la grande carte). */
    washBas:
      "linear-gradient(0deg, #b6befa 0%, rgba(214,220,252,0.55) 34%, rgba(255,255,255,0) 62%)",
    /** Voile descendant du haut (la carte au bandeau violet). */
    washHaut:
      "linear-gradient(180deg, #aab2f8 0%, rgba(214,220,252,0.5) 34%, rgba(255,255,255,0) 62%)",
    /** Halo de coin bas-droit. */
    washCoin:
      "radial-gradient(92% 76% at 100% 100%, #b3bbf9 0%, rgba(214,220,252,0.45) 42%, rgba(255,255,255,0) 70%)",
    /** Halo discret bas-gauche, pour les cartes presque blanches. */
    washDoux:
      "radial-gradient(80% 55% at 12% 108%, rgba(170,178,248,0.55) 0%, rgba(255,255,255,0) 68%)",
  };
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
      // `blend` abandonné pour l'essai bento : le canvas #d2e4fa du clip ne
      // correspond plus à la carte, la vidéo passe en ENCADRÉ (voir le pavé
      // en tête de la liste).
      bg: STRIPE.bg,
      wash: STRIPE.washDoux,
      ink: STRIPE.ink,
      sub: STRIPE.sub,
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
      tile: "/posters/ora_reporting.jpg",
      // Voile montant, le plus marqué de la grille (voir le pavé en tête).
      // Media zone = custom Ora+PDF mockup (see `mockup`), so the decorative
      // circle is dropped.
      bg: STRIPE.bg,
      wash: STRIPE.washBas,
      ink: STRIPE.ink,
      sub: STRIPE.sub,
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
      // v4 : clip REPEINT sur le bleu #2F69D9 (client 2026-08-05, swatch
      // fourni), en remplacement du canvas lavande #d9e2f6 d'origine. Le fond
      // Screen Studio étant un aplat parfait, la famille de couleurs du décor
      // est exactement { t × #d9e2f6 } : les ombres portées sont donc REPEINTES
      // proportionnellement (t × #2F69D9) au lieu d'être détourées, et les
      // fenêtres gardent leur profondeur. Le masque est restreint à la région
      // connexe qui TOUCHE LE BORD de l'image : sans ça, les pastilles bleu
      // clair de l'app (« Lancer », chips) tombent dans la même famille de
      // couleurs que le décor et virent au bleu franc elles aussi.
      video: "/ora_pointage_v4.mp4",
      poster: "/posters/ora_pointage_v4.jpg",
      tile: "/posters/ora_pointage.jpg",
      // (Le clip v4, repeint en #2F69D9 pour l'ancienne palette, ne sert plus
      // que la lightbox : pas de contrainte de couleur ici.)
      bg: STRIPE.bg,
      wash: STRIPE.washCoin,
      ink: STRIPE.ink,
      sub: STRIPE.sub,
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
      // v5 : décor REPEINT du rose vers la pervenche de la carte (2026-08-05).
      // La v4 était rendue sur le rose #f7e3f0 à la SOURCE, dans la page qui
      // génère la vidéo — page introuvable sur ce poste, d'où une reprise sur le
      // MP4 lui-même. Deux méthodes ont échoué avant celle-ci, et c'est utile de
      // savoir pourquoi si le cas se représente :
      //   · une incrustation de couleur simple repeint aussi les pastilles bleu
      //     clair de l'app, qui tombent dans la même famille de couleurs ;
      //   · un masque restreint à la région connexe touchant le bord de l'image
      //     laisse un halo rose autour de la fenêtre Ora : ce clip la rend en
      //     panneau DÉPOLI, qui échantillonne le rose derrière lui, et les pixels
      //     ainsi maculés ne sont plus un multiple du fond.
      // Ce qui a marché : une rotation de TEINTE. Le rose occupe une bande de
      // teintes (268-345°) qu'aucun autre élément du clip n'utilise — les rouges
      // sont vers 355°, les bleus vers 220°. Sélectionner sur la teinte attrape
      // donc d'un coup le fond, ses ombres portées ET le voile dépoli, quelles
      // que soient leur clarté et leur saturation. Chaque pixel garde ses
      // rapports de saturation et de valeur, donc une ombre reste une ombre.
      video: "/ora_pdf_extract_v5.mp4",
      poster: "/posters/ora_pdf_extract_v5.jpg",
      // `blend` abandonné pour l'essai bento (canvas #E5E7F9 cuit dans le
      // clip) : vidéo ENCADRÉE, voir le pavé en tête de la liste.
      bg: STRIPE.bg,
      wash: STRIPE.washDoux,
      ink: STRIPE.ink,
      sub: STRIPE.sub,
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
      // Clip PROPRE à cette carte depuis le 2026-08-05, au lieu de pointer sur
      // /ora_pointage_v3.mp4. C'est toujours la même démo (un bouche-trou, voir
      // l'avertissement ci-dessus, à remplacer par une vraie démo de
      // réconciliation), mais son décor est REPEINT de la lavande #d9e2f6 vers
      // #d2e4fa, la couleur de cette carte. Avant, la carte était calée sur le
      // clip ; maintenant que la palette est fixée, c'est l'inverse.
      video: "/ora_reconciliation.mp4",
      poster: "/posters/ora_reconciliation.jpg",
      // `blend` abandonné pour l'essai bento (canvas #d2e4fa cuit dans le
      // clip) : vidéo ENCADRÉE, voir le pavé en tête de la liste.
      bg: STRIPE.bg,
      wash: STRIPE.washBas,
      ink: STRIPE.ink,
      sub: STRIPE.sub,
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
      tile: "/posters/ora_formatage.jpg",
      // Voile descendant (le bandeau haut). Les décors de FormatageMockup
      // restent blancs.
      bg: STRIPE.bg,
      wash: STRIPE.washHaut,
      ink: STRIPE.ink,
      sub: STRIPE.sub,
      mockup: "formatage",
    },
    // ── Quatre cartes « conseil » ajoutées le 2026-08-02 : Prévisionnel,
    // Connectivité CRM, Évaluation financière, Organisation. Le damier
    // continue (rangée 4 : saturé | pâle, rangée 5 : pâle | saturé) et la
    // palette reste dans la famille bleu / indigo / teal : navy #1e3a8a et
    // teal de marque #0d9488 côté saturé, menthe #d7efe9 et pervenche
    // #e3e9fc côté pastel.
    // COULEURS RÉTABLIES à l'identique après un aller-retour (client
    // 2026-08-04 : « reviens en arrière, je ne veux pas que tu changes la
    // couleur des backgrounds ») : le « plus minimaliste, moins AI generated »
    // demandé porte sur l'INTÉRIEUR des maquettes (blobs, chips flottantes,
    // curseurs, cartes KPI retirés dans les composants *Mockup), pas sur les
    // aplats des cartes.
    // ⚠ COPIE PROVISOIRE : titres, meta et puces sont des brouillons à faire
    // valider (formulation exacte) avant toute mise en ligne.
    // ⚠ VIDÉOS PROVISOIRES : les clips de la lightbox sont ceux d'AUTRES cas
    // d'usage, à réexporter avant de communiquer dessus (même réserve que les
    // cartes « Réconciliation » et « Formatage » ci-dessus). Les POSTERS, eux,
    // sont les vrais : captures des maquettes, utilisées par le mur du dézoom.
    {
      title: t({ fr: "Prévisionnel", en: "Forecasting" }),
      metaIcon: TrendingUp,
      meta: t({ fr: "Business plan & trajectoire financière", en: "Business plan & financial trajectory" }),
      bullets: [
        t({ fr: "Le business plan se construit à partir de votre historique, hypothèses à l'appui", en: "The business plan is built from your history, assumptions made explicit" }),
        t({ fr: "Une trajectoire claire sur plusieurs années, prête à présenter", en: "A clear multi-year trajectory, ready to present" }),
      ],
      poster: "/posters/ora_previsionnel.jpg",
      bg: STRIPE.bg,
      wash: STRIPE.washHaut,
      ink: STRIPE.ink,
      sub: STRIPE.sub,
      mockup: "previsionnel",
    },
    // « Connectivité CRM » et « Évaluation financière » ÉCHANGÉES (client
    // 2026-08-04). Le damier tient toujours : les deux sont pastel, donc
    // rangée 4 = saturé | pâle et rangée 5 = pâle | saturé, inchangé.
    {
      title: t({ fr: "Connectivité CRM", en: "CRM connectivity" }),
      metaIcon: PlugZap,
      meta: t({ fr: "CRM, facturation & suivi commercial", en: "CRM, invoicing & sales tracking" }),
      bullets: [
        t({ fr: "Les données de votre CRM alimentent directement vos fichiers de travail", en: "Your CRM data feeds directly into your working files" }),
        t({ fr: "Fini les doubles saisies entre outils : une seule source à jour", en: "No more double entry between tools: one up-to-date source" }),
      ],
      poster: "/posters/ora_crm.jpg",
      bg: STRIPE.bg,
      wash: STRIPE.washCoin,
      ink: STRIPE.ink,
      sub: STRIPE.sub,
      mockup: "crm",
    },
    {
      title: t({ fr: "Évaluation financière", en: "Business valuation" }),
      metaIcon: Scale,
      meta: t({ fr: "Valorisation, multiples & comparables", en: "Valuation, multiples & comparables" }),
      bullets: [
        t({ fr: "La valorisation posée sur des multiples et des comparables explicites", en: "Valuation grounded in explicit multiples and comparables" }),
        t({ fr: "Une fourchette argumentée, prête à défendre face au client", en: "A reasoned range, ready to defend with your client" }),
      ],
      poster: "/posters/ora_evaluation.jpg",
      // Les dégradés de marque À L'INTÉRIEUR de la maquette (EvaluationMockup)
      // gardent leur teal : ils sont posés sur des panneaux blancs.
      bg: STRIPE.bg,
      wash: STRIPE.washDoux,
      ink: STRIPE.ink,
      sub: STRIPE.sub,
      mockup: "evaluation",
    },
    {
      title: t({ fr: "Organisation", en: "Organization" }),
      metaIcon: FolderCheck,
      meta: t({ fr: "Classement de dossiers & fichiers", en: "Folder & file organization" }),
      bullets: [
        t({ fr: "Vos fichiers renommés et rangés selon votre plan de classement", en: "Your files renamed and filed according to your filing plan" }),
        t({ fr: "Chaque dossier client reste propre, sans tri manuel", en: "Every client folder stays tidy, no manual sorting" }),
      ],
      poster: "/posters/ora_organisation.jpg",
      bg: STRIPE.bg,
      wash: STRIPE.washBas,
      ink: STRIPE.ink,
      sub: STRIPE.sub,
      mockup: "organisation",
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
  // HUIT copies, et plus douze : le passage de six à dix vraies cartes
  // (2026-08-02) aurait sinon porté le mur à 22 tuiles, donc HUIT rangées, et
  // toutes les constantes du recul (PULLBACK_FILL_H 3,3, réserve de 936 px,
  // COL_SCROLL 700) sont calées sur un mur de SIX rangées. 10 + 8 = 18 tuiles
  // conservent exactement la géométrie d'avant (6 rangées de 3), rien à
  // retuner.
  // Le CHOIX des copies découle de WALL_ORDER, où la règle est expliquée en
  // entier : chaque colonne ne tire que dans un jeu de deux couleurs, et deux
  // colonnes voisines n'ont aucune couleur en commun. Il faut donc douze tuiles
  // claires et six profondes ; comme il y a cinq vraies cartes de chaque, les
  // copies sont sept claires et une seule profonde.
  //
  // f0..f7 = cases[8, 0, 3, 8, 9, 7, 3, 4], soit :
  //   Évaluation, Automatisation FEC, Extraction, Évaluation, Organisation,
  //   Connectivité CRM, Extraction, Réconciliation.
  //
  // Le mur obtenu, rangée par rangée (C = clair, P = profond) :
  //   r0  FEC C        | Pointage P     | Évaluation C
  //   r1  Extraction C | Reporting P    | FEC C
  //   r2  Réconcil. C  | Formatage P    | Extraction C
  //   r3  Évaluation C | Organisation P | CRM C
  //   r4  CRM C        | Prévisionnel P | Évaluation C
  //   r5  Extraction C | Organisation P | Réconciliation C
  // Colonnes : #d2e4fa/#E5E7F9 alternés · #2463D8/#17479C alternés ·
  // #E5E7F9/#d2e4fa alternés. Aucune couleur partagée entre colonnes voisines,
  // aucune répétition verticale, aucune carte identique en contact.
  const wallDupes: UseCase[] = [8, 0, 3, 8, 9, 7, 3, 4].map((i) => cases[i]);


  // L'espace blanc entre le mur et « Automatisez de bout en bout » est CONSERVÉ
  // (client 2026-08-03 : « on garde l'espace blanc, c'était bien, le problème
  // c'est le scroll qui bugue »). J'avais supprimé cette marge sur desktop pour
  // resserrer la jonction : ce n'était pas le sujet, le layout revient à
  // l'identique.
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
                // LEVAGE AU SURVOL porté par cette enveloppe, en CSS, et non
                // plus par un `whileHover` de Framer sur la carte. Deux raisons :
                //   · plus aucun rappel JavaScript dans le chemin de survol, donc
                //     l'état se rétablit tout seul avec `:hover` — c'est ce qui
                //     corrigeait le « il faut passer deux fois » ;
                //   · Framer laisse un `transform` EN LIGNE sur la carte après
                //     son animation d'entrée, qui aurait battu une règle CSS de
                //     survol posée au même endroit. L'enveloppe, elle, n'a de
                //     transform en ligne que pendant le mur, écrit par le moteur
                //     — et pendant le mur le survol est justement coupé.
                <div
                  key={c.title}
                  ref={(el) => { cardRefs.current[i] = el; }}
                  className="h-full transition-transform duration-300 ease-out hover:-translate-y-2"
                >
                  <motion.div
                    // Enveloppe Stripe : coins modestes, liseré marine
                    // hairline, ombre légère qui s'affirme au survol.
                    className={`group relative h-full overflow-hidden rounded-[16px] md:rounded-[20px] p-8 md:p-10 ring-1 ring-[#0a2540]/[0.08] shadow-[0_6px_24px_-14px_rgba(10,37,64,0.25)] transition-shadow duration-300 ease-out hover:shadow-[0_18px_44px_-18px_rgba(10,37,64,0.35)] ${c.mockup ? "flex flex-col" : ""}`}
                    style={{ background: c.bg }}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
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
                    {c.wash && (
                      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: c.wash }} />
                    )}

                    {/* Title + Stripe expand button (top-right corner) */}
                    <div className="relative flex items-start justify-between gap-4">
                      <h3 className="font-poppins font-medium text-[1.45rem] md:text-[1.8rem] tracking-[-0.02em] leading-[1.15]" style={{ color: c.ink }}>
                        {c.title}
                      </h3>
                      {/* Pas de vidéo qui corresponde, pas de bouton. */}
                      {c.video && (
                      <button
                        type="button"
                        onClick={() => setActive(c)}
                        aria-label={t({ fr: "Voir la démo en grand", en: "Watch the demo full size" })}
                        className="inline-flex shrink-0 items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-[10px] bg-[#6c72ec] hover:bg-[#585fe6] text-white shadow-[0_6px_16px_-6px_rgba(108,114,236,0.6)] transition-all duration-200 hover:scale-[1.04] active:scale-[0.98]"
                      >
                        <Maximize2 className="w-[18px] h-[18px]" />
                      </button>
                      )}
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
                        <div>
                          {c.mockup === "reporting" ? (
                            <ReportingMockup />
                          ) : c.mockup === "formatage" ? (
                            <FormatageMockup />
                          ) : c.mockup === "previsionnel" ? (
                            <PrevisionnelMockup />
                          ) : c.mockup === "evaluation" ? (
                            <EvaluationMockup />
                          ) : c.mockup === "crm" ? (
                            <CrmMockup />
                          ) : c.mockup === "organisation" ? (
                            <OrganisationMockup />
                          ) : (
                            <PointageMockup />
                          )}
                        </div>
                      </div>
                    ) : (
                      <div
                        className={
                          c.blend
                            ? "relative mt-6 md:mt-7 -mx-7 md:-mx-10 -mb-7 md:-mb-10"
                            : "relative mt-7 md:mt-9 rounded-[12px] md:rounded-[14px] overflow-hidden ring-1 ring-[#0a2540]/[0.07] shadow-[0_14px_36px_-16px_rgba(10,37,64,0.3)]"
                        }
                      >
                        <div>
                          {/* PAS d'autoPlay (client 2026-08-04 : « les vidéos
                              démarrent quand l'utilisateur arrive dessus, pas
                              avant ») : l'attribut `poster` tient l'affichage, et
                              c'est l'IntersectionObserver du moteur qui lance la
                              lecture à l'entrée de la carte dans l'écran. */}
                          <video
                            src={c.video}
                            poster={c.poster}
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
                {/* Enveloppe de survol (client 2026-08-02 : « fais en sorte que
                    les encadrés soient animés quand on bouge notre curseur
                    dessus ») : léger zoom au survol, comme les vraies cartes.
                    Sur l'ENFANT, pas sur l'enveloppe : le moteur du mur écrit
                    un translate3d sur l'enveloppe à chaque image, un scale au
                    même endroit serait écrasé. Les pointer-events sont rendus
                    par le moteur une fois la tuile révélée, et repris quand
                    elle s'efface. */}
                <div className="h-full w-full cursor-default transition-transform duration-300 ease-out hover:scale-[1.04]">
                  <WallCard item={c} />
                </div>
              </div>
            ))}
          </div>

          {/* Fondu des deux bords de la bande visible. Remplace le `mask-image`
              en dégradé qui était posé sur l'enveloppe : voir le commentaire du
              moteur. Ces deux bandes sont peintes À PART, elles n'obligent donc
              jamais le mur à passer par une texture intermédiaire. Le moteur ne
              leur écrit qu'un `translate3d` et une opacité, deux propriétés que
              le compositeur traite seul.
              Le dégradé part de la couleur de fond de la section, EN DUR : un
              `mask-image` rendait les pixels du mur transparents, donc suivait
              tout seul n'importe quel fond ; ces bandes, elles, PEIGNENT du
              blanc / noir opaque par-dessus le mur ET son arrière-plan. C'est
              donc désormais un INVARIANT À DEUX ENDROITS : `from-white
              dark:from-black` ici doit rester égal au `bg-white dark:bg-black`
              de la section `#features` dans App.tsx. Un jour où ce fond change
              (CLAUDE.md prévoit `#fcfbf7` / `#111827` pour une future passe
              clair/sombre), ces deux bandes redeviendront visibles comme deux
              barres blanches/noires si on oublie de les mettre à jour avec. */}
          <div
            ref={fadeTopRef}
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-10 hidden md:block bg-gradient-to-b from-white dark:from-black to-transparent"
            style={{ opacity: 0 }}
          />
          <div
            ref={fadeBotRef}
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-10 hidden md:block bg-gradient-to-t from-white dark:from-black to-transparent"
            style={{ opacity: 0 }}
          />
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
