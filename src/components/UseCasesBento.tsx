import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, FileSpreadsheet, FileText, Gauge, Maximize2, Play, Presentation, Scale, TrendingUp, X } from "lucide-react";
import { useLang } from "@/lib/i18n";
import ReportingMockup from "./ReportingMockup";
import PointageMockup from "./PointageMockup";
import FormatageMockup from "./FormatageMockup";
import PrevisionnelMockup from "./PrevisionnelMockup";
import EvaluationMockup from "./EvaluationMockup";
import CrmMockup from "./CrmMockup";
import OrganisationMockup from "./OrganisationMockup";
import OraHomeMockup from "./OraHomeMockup";
import OraAppScene from "./OraAppScene";
import ValuationCard from "./ValuationCard";
import ParticleOrbGL from "./ParticleOrbGL";
import GradientRibbonGL from "./GradientRibbonGL";
import RepelChips, { type Chip } from "./RepelChips";

/**
 * UseCasesBento — clone de la grille bento de stripe.com, recolorée dans la
 * pervenche de la carte « GPT-Live » fournie par le client (2026-08-06 :
 * « fais les mêmes types d'encadrés avec la même police et le même design,
 * sauf que, au lieu que ce soit du violet, du bleu »).
 *
 * REMPLACE UseCases.tsx (les « encadrés classiques » et leur mur de dézoom).
 * L'ancien composant reste dans le dépôt, non importé, revert possible.
 * Décisions client du 2026-08-06 (questionnaire) :
 *   · les 10 cas d'usage sont repris, tailles de cartes variées ;
 *   · plus AUCUNE animation de dézoom, la section défile normalement ;
 *   · titres des cartes en INTER (la Söhne de Stripe en est quasi jumelle).
 *     Exception assumée à la règle « Poppins sur les titres » de CLAUDE.md,
 *     limitée aux titres DES CARTES — le titre de section reste en Poppins ;
 *   · intérieur épuré : titre + visuel, plus de ligne métier ni de puces.
 *
 * Anatomie Stripe reproduite : carte blanche, coins ~14 px, liseré hairline,
 * quasi à plat (ombre minime), titre marine #0a2540 en haut à gauche, bouton
 * carré d'agrandissement épinglé en haut à droite (plein ou pâle), visuel qui
 * occupe le reste. Deux cartes pleine largeur (titre à gauche, visuel aux
 * deux tiers droits) rythment la grille comme « Intégrez les paiements ».
 * Les voiles orangés/violets de Stripe deviennent des voiles pervenche.
 */

type MockupKind =
  | "home" | "reporting" | "pointage" | "formatage" | "previsionnel"
  | "prevision" | "evaluation" | "dossier" | "valuationCard" | "crm" | "organisation";

type BentoCase = {
  title: string;
  /** Clip de démo, ouvert par le bouton carré dans la lightbox. ABSENT quand
   *  aucune vidéo ne correspond réellement (client 2026-08-03 : « n'en invente
   *  pas ») : le bouton n'est alors pas rendu du tout. */
  video?: string;
  poster?: string;
  /** Clip joué DANS le panneau de présentation, quand il diffère de celui de
   *  la carte. « Automatisation FEC » montre le clip à canvas BLEU d'origine
   *  dans le panneau (client 2026-08-06), et la version repeinte en blanc
   *  n'existe que pour la carte. */
  detailVideo?: string;
  detailPoster?: string;
  /** Scène de maquette vivante (composants *Mockup) OU, à défaut, le clip
   *  affiché encadré dans la carte. */
  mockup?: MockupKind;
  /** Maquette montrée dans le PANNEAU seulement, quand la carte elle-même
   *  n'en affiche pas (« Évaluation financière » : la carte porte le décor
   *  WebGL, le panneau garde le dossier). */
  detailMockup?: MockupKind;
  /** La carte porte LA SCÈNE DU HERO (OraAppScene), rendue à l'échelle 1 et
   *  rognée par les bords — « un encadré dans l'encadré, mon logiciel à la
   *  place de cette page web » (client 2026-08-06), puis « exactement la même
   *  netteté que celle du haut de la page » (2026-08-07). La scène apporte sa
   *  propre fenêtre macOS, il n'y a plus de cadre à lui ajouter. */
  appScene?: boolean;
  /** Place dans la grille : tiers, deux tiers, ou rangée entière. */
  span: "third" | "wide" | "full";
  /** Voile décoratif pervenche (remplace les orangés Stripe). */
  wash?: string;
  /** Le voile ne sert que de REPLI MOBILE : les décors WebGL sont réservés au
   *  grand écran (`hidden md:block`), la carte serait blanche sur téléphone. */
  washMobileOnly?: boolean;
  /** Fond de carte. Blanc partout sauf la carte « pleine pervenche », le
   *  pendant de la carte à dégradé intégral de la grille Stripe. */
  bg?: string;
  /** Bande de hachures diagonales pervenche (la carte « Intégrez les
   *  paiements » en a une le long de son visuel). */
  hatch?: boolean;
  /** Décor SVG « désencadré » façon Stripe : nuée de particules (« Boostez
   *  vos revenus »), globe en pointillés (« Faites circuler vos fonds »),
   *  planète de particules (voir DotOrb), champ magnétique (AuroraField),
   *  anneau WebGL (ParticleOrbGL), sa variante GALAXIE (`galaxy`) ou nappe
   *  dégradée WebGL (GradientRibbonGL) — les deux portages de shaders Stripe. */
  art?: "speckles" | "globe" | "orb" | "aurora" | "gl" | "galaxy" | "ribbon" | "aura" | "drift";
  /** Carte ALLONGÉE : 660 px au lieu de 480 (client 2026-08-07, « je veux
   *  qu'elles soient plus longues, pas forcément plus larges »). Le drapeau
   *  vaut mieux qu'un relèvement du gabarit `third` : « Prévisionnel » est un
   *  tiers lui aussi, mais il vit dans la rangée du haut dont la hauteur est
   *  donnée par la grande carte. */
  tall?: boolean;
  /** Nuage d'étiquettes fuyant le curseur, à la place du visuel (RepelChips).
   *  Exclusif avec `mockup` et `video`. */
  chips?: Chip[];
  /** Position du décor dans la carte (classes de l'enveloppe absolue). Chaque
   *  carte rogne sa planète par un bord différent. */
  artClass?: string;
  /** Graine du semis (deux galaxies ne se ressemblent pas) et inclinaison du
   *  plan galactique, propres à chaque carte. */
  artSeed?: number;
  artTilt?: string;
  /** Ombre portée COLORÉE sous la maquette (valeur de `filter`). Les « ombres
   *  bleu clair » demandées le 2026-08-06 pour la carte de droite : une ombre
   *  neutre disparaît sur un aplat teinté, une ombre bleue l'habite. */
  mockGlow?: string;
  /** Marges de l'enveloppe de la maquette, quand le débord par défaut ne
   *  convient pas à la carte. Le bloc visuel est en `mt-auto` : il est calé sur
   *  le BAS, donc c'est la marge basse qui commande la hauteur de la maquette
   *  dans la carte. Moins elle est négative, plus la maquette remonte. */
  mockupClass?: string;
  /** Encre du titre, quand le marine de la grille ne tient pas sur le fond.
   *  Les cartes à fond bleu vif passent au blanc — voir FULL_VIVID_BG. */
  ink?: string;
  /** Réglages de titre propres à une carte : corps réduit, largeur bornée,
   *  équilibrage des lignes. Sert à dégager la place que le voile bleu doit
   *  occuper sans jamais passer sous le texte. */
  titleClass?: string;
  /** Contenu du PANNEAU DE PRÉSENTATION (le grand encadré Stripe : titre,
   *  texte, coches, boutons, fond bleuté) que la flèche ouvre. Depuis le
   *  2026-08-06, TOUTES les cartes en ont un.
   *
   *  La copie n'est pas écrite pour l'occasion : elle est reprise des fiches
   *  déjà validées de UseCases.tsx, cas d'usage par cas d'usage. C'est la
   *  consigne de fond du client — ne rien inventer, ni promesse ni chiffre. */
  detailDesc: string;
  detailChecks: string[];
  /** AUTOMATISATIONS COMMUTABLES par des boutons sous la carte (client
   *  2026-08-07). La carte affiche l'onglet actif : son titre, son visuel, et
   *  sa fiche dans le panneau. Le premier onglet est l'état par défaut, et il
   *  reprend le contenu de la carte elle-même — sans quoi le premier clic
   *  changerait quelque chose alors qu'on revient à l'état initial. */
  tabs?: BentoTab[];
};

type BentoTab = {
  title: string;
  mockup?: MockupKind;
  video?: string;
  poster?: string;
  detailDesc: string;
  detailChecks: string[];
};

const INK = "#0a2540";

/* Voiles pervenche — la famille est échantillonnée sur la carte GPT-Live. */
const WASH = {
  /** Halo discret bas-gauche, pour les cartes presque blanches. */
  soft:
    "radial-gradient(76% 52% at 10% 106%, rgba(170,178,248,0.4) 0%, rgba(255,255,255,0) 66%)",
  /** Halo de coin bas-droit. */
  corner:
    "radial-gradient(88% 70% at 100% 102%, rgba(158,166,246,0.5) 0%, rgba(214,220,252,0.35) 44%, rgba(255,255,255,0) 70%)",
  /** Voile descendant, pâle. */
  top:
    "linear-gradient(180deg, rgba(196,203,251,0.55) 0%, rgba(233,236,254,0.35) 38%, rgba(255,255,255,0) 66%)",
  /** Nappe DIAGONALE montant du coin bas-gauche derrière le visuel — la
   *  grande vague orangée de « Acceptez et optimisez les paiements ». */
  sweep:
    "radial-gradient(120% 95% at -12% 112%, #98a0f3 0%, rgba(152,160,243,0.5) 32%, rgba(255,255,255,0) 64%), radial-gradient(85% 60% at 58% 120%, rgba(195,202,251,0.75) 0%, rgba(255,255,255,0) 70%)",
  /** Bandes soyeuses en diagonale — le dégradé fluide de la carte VISA de
   *  « Créez votre propre programme ». */
  silk:
    "linear-gradient(140deg, rgba(203,209,252,0.75) 0%, rgba(255,255,255,0) 34%, rgba(164,172,246,0.45) 58%, rgba(255,255,255,0) 78%), radial-gradient(70% 50% at 80% -10%, rgba(138,146,241,0.5) 0%, rgba(255,255,255,0) 65%)",
  /** Nuages blancs — posés SUR le dégradé intégral, comme la carte GPT-Live. */
  puffs:
    "radial-gradient(55% 26% at 22% 62%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 70%), radial-gradient(60% 30% at 78% 76%, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0) 72%), radial-gradient(90% 34% at 50% 102%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 74%)",
} as const;

/** La carte « pleine pervenche » — pendant de la carte à dégradé intégral de
 *  Stripe, et la plus proche de la carte GPT-Live de référence : pâle en haut
 *  (le titre marine y reste lisible), pervenche franche en bas. */
// REBASCULÉ vers le BLEU le 2026-08-06 : bleu de marque sur les trois
// premiers arrêts, et seul le pied garde une pointe de violet (client :
// « garde un léger violet pour celui de droite »).
// HAUT REMIS AU BLANC le 2026-08-07 (« fais en sorte que pour prévisionnel le
// haut de la carte soit blanc ») : deux arrêts blancs francs avant que la
// couleur ne démarre. La carte se lit désormais de haut en bas comme
// « Évaluation financière » juste en dessous d'elle — blanc, puis bleu qui
// s'épaissit — sauf qu'ici la colonne va du clair au soutenu au lieu de
// l'inverse, ce qui referme la colonne par sa teinte la plus dense.
const FULL_PERI_BG =
  "linear-gradient(180deg, #ffffff 0%, #fcfdff 15%, #e7effd 33%, #bfd1f7 61%, #8e9cef 100%)";

/* ── LE BLEU VIF DE LA CARTE-OBJET : ESSAYÉ SUR LA CARTE DU HAUT, PUIS RETIRÉ
 *  Posé le 2026-08-07 sur « Gagnez des heures… » (« applique le même que l'on
 *  avait dans ce design », celui de ValuationCard), RETIRÉ le même jour : « je
 *  veux qu'il ait la couleur qui est actuellement présente dans l'encadré
 *  Prévisionnel ; elle ne couvrait pas tout l'encadré, mais seulement une
 *  petite partie du bas ». La carte est donc revenue au blanc et à ses trois
 *  nappes. « Prévisionnel », elle, n'a jamais quitté FULL_PERI_BG — c'est bien
 *  la même famille de bleu des deux côtés, #bfd1f7 en surface, #8e9cef au cœur.
 *
 *  La constante est RETIRÉE et non laissée en place : `noUnusedLocals` est actif
 *  dans tsconfig.app.json, un fond que plus aucune carte n'applique fait échouer
 *  le build. Sa valeur reste ici, elle se recolle en une ligne :
 *
 *    linear-gradient(180deg, #1d5fe0 0%, #1d5fe0 14%, #4a86f6 29%, #a3c5fc 44%,
 *                           #8ec6e8 58%, #6d87f2 72%, #2f6ff0 88%, #1d5fe0 100%)
 *
 *  C'étaient les six teintes de ValuationCard reprises dans l'ordre, avec deux
 *  écarts assumés — un fond de carte porte du texte, pas l'objet. La rampe était
 *  DÉCALÉE de 14 % vers le bas : à son échelle naturelle, la bande claire
 *  #a3c5fc tombait à 33 % de la hauteur, pile sur la deuxième ligne du titre, du
 *  blanc à 2,4:1 ; décalée, elle se posait à 44 %, dans le vide entre le titre
 *  et le visuel. Et elle NE DÉFILAIT PAS : deux fonds animés de cette taille se
 *  paieraient à chaque image, sur la section déjà la plus chargée de la page.
 *
 *  ⚠ ELLE IMPOSAIT `ink: "#ffffff"`. Le marine de la grille tombe à 3,4:1 sur
 *  #2f6ff0. Si ce fond revient un jour, l'encre blanche revient avec lui : les
 *  deux réglages ne se séparent pas. */

/** Grain quasi invisible, posé PAR-DESSUS le fond de la carte « Extraction ».
 *  Un dégradé aussi peu contrasté que celui demandé se rend en 8 bits par
 *  canal : deux teintes voisines tombent sur la même valeur et laissent une
 *  frontière nette, les fameuses bandes. Trois centièmes de bruit suffisent à
 *  faire basculer les pixels de part et d'autre de l'arrondi et la frontière se
 *  dissout. C'est le tramage des dégradés d'affiche, et c'est ce qui manque à
 *  un `linear-gradient` nu. */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")";

/* ── LE CIEL DE LA DEUXIÈME RANGÉE : LE BLEU AU CENTRE ────────────────────
 *  Trois cartes côte à côte — Bilan développé, Structure, Évaluation financière —
 *  et une seule règle de couleur, pour qu'elles forment UNE bande plutôt que
 *  trois vignettes.
 *
 *  Client 2026-08-07, troisième réglage : « je ne veux pas que ce soit le haut
 *  de la carte qui soit bleu, mais plus le centre, et de manière légère. Qu'il
 *  y ait vraiment du blanc principalement dans ces encadrés. »
 *
 *  Les trois cartes de la rangée perdent donc leur rampe verticale — une rampe
 *  part forcément d'un bord — au profit de HALOS RADIAUX posés à mi-hauteur.
 *  Plus aucun `linear-gradient` : le haut et le pied retombent tous deux sur
 *  le blanc de la carte, et la couleur ne vit qu'au milieu, là où le regard
 *  passe du titre au visuel.
 *
 *  Opacités divisées par deux par rapport au réglage précédent. Chaque carte
 *  garde sa teinte propre — Évaluation le bleu de Prévisionnel qui la surmonte,
 *  Structure ses quatre couleurs, Bilan développé le plus pâle des trois.
 */

/** Évaluation financière : une seule nappe, la plus large de la rangée, pour
 *  entourer l'objet flottant sans jamais passer pour un motif derrière lui.
 *
 *  ⚠ TROIS FOIS REMPLACÉE PAR LA PERVENCHE DE « PRÉVISIONNEL », TROIS FOIS
 *  REMISE. Le compte au 2026-08-07 : nappe repeinte aux teintes de la voisine,
 *  carte entièrement remplie du dégradé, puis carte remplie une seconde fois sur
 *  présentation d'une capture de la rampe. Verdict à chaque reprise, le dernier
 *  mot pour mot : « il y avait moins de bleu en background de l'encadré et
 *  c'était mieux ».
 *
 *  LA LEÇON, et elle vaut pour toute la rangée : cette carte porte un OBJET
 *  FLOTTANT, et un objet flottant a besoin de vide autour de lui. Le bleu qu'on
 *  croit ajouter au fond, on le retire à l'objet — il cesse de flotter et
 *  devient un rectangle posé sur un dégradé. C'est pour ça que la carte reste
 *  blanche alors que « Prévisionnel » et « Formatage », qui ne montrent que des
 *  maquettes rognées par les bords, supportent la rampe pleine.
 *
 *  Autrement dit, la demande à laquelle il faut céder n'est pas « mets la
 *  couleur de Prévisionnel ici » mais « mets-la sur le DESIGN de l'encadré ».
 *  Deux relectures l'avaient déjà dit ; la troisième la confirme. */
const SKY_EVALUATION = [
  GRAIN,
  "radial-gradient(100% 50% at 50% 50%, rgba(147,184,248,0.24) 0%, rgba(184,210,248,0.11) 52%, rgba(255,255,255,0) 86%)",
].join(", ");

/** Structure : les quatre teintes données au code hexadécimal près (pervenche
 *  #8FB0EA, bleu ciel #A8D0F1, bleu glacier #B8D8F6, turquoise menthe
 *  #7ED7CB), centrées, élargies et un cran plus denses au même titre que sa
 *  voisine. Le vert reste le plus discret des quatre. */
/* ⚠ TROIS CHANGEMENTS LE 2026-08-07, tous demandés d'un coup : « que les ombres
 *  bleues dans Structure soient moins prononcées, que le vert ne soit pas
 *  présent, et que le haut de la carte soit plus blanc ».
 *
 *  1. LE VERT DISPARAÎT. La nappe #7ED7CB est supprimée, pas diluée : « pas
 *     présent » ne se négocie pas à l'opacité. C'était l'une des quatre teintes
 *     données au code hexadécimal près par le client ; la consigne récente prime
 *     sur l'ancienne, et il ne reste donc que trois nappes.
 *  2. LES BLEUS BAISSENT D'ENVIRON 40 % (0,32 → 0,19, 0,30 → 0,18, 0,34 → 0,20).
 *  3. LE HAUT SE DÉGAGE, et c'est fait DEUX FOIS plutôt qu'une : les centres des
 *     trois nappes descendent de 8 à 10 points, ET un voile blanc franc coiffe
 *     le premier tiers. Descendre les nappes seules laissait leur bord haut
 *     mordre sur le titre ; le voile coupe net.
 *     ⚠ Il est placé JUSTE APRÈS le grain et donc AU-DESSUS des trois nappes :
 *     dans `background`, la première couche est celle du dessus. Le mettre en
 *     fin de liste l'aurait enterré sous le bleu qu'il doit justement masquer. */
const SKY_EXTRACTION = [
  GRAIN,
  "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.66) 16%, rgba(255,255,255,0.24) 32%, rgba(255,255,255,0) 46%)",
  "radial-gradient(56% 30% at 16% 56%, rgba(143,176,234,0.19) 0%, rgba(143,176,234,0) 78%)",
  "radial-gradient(72% 36% at 64% 64%, rgba(168,208,241,0.18) 0%, rgba(168,208,241,0) 80%)",
  "radial-gradient(122% 62% at 46% 60%, rgba(170,204,244,0.2) 0%, rgba(190,218,248,0.1) 54%, rgba(255,255,255,0) 88%)",
].join(", ");

/** ── L'OMBRE AU CENTRE, ET LÉGÈRE ────────────────────────────────────────
 *  Client 2026-08-07, dernier réglage : « je veux qu'elle soit au centre des
 *  encadrés, pas en bas, et de manière plus light et un peu plus
 *  transparente ». Les rampes verticales lestées vers le pied sont donc
 *  retirées — une rampe part forcément d'un bord — au profit de nappes
 *  RONDES ancrées à mi-hauteur, aux opacités divisées par deux.
 *
 *  Les trois cartes de la rangée suivent la même règle, pour qu'elles forment
 *  une bande et non trois vignettes. Haut et pied retombent tous deux sur le
 *  blanc de la carte. */

/** Bilan développé — nappe ÉLARGIE et un cran plus dense (client 2026-08-07,
 *  dernier réglage : « intensifie un peu et rajoute du bleu sur une plus
 *  grande surface »). Elle reste centrée et reste sous l'anneau de particules :
 *  c'est lui le sujet, elle ne fait que colorer le vide autour. */
/** ── LE BLEU DE L'ANNEAU DE PARTICULES, DEVENU CELUI DES OMBRES DU HAUT ─────
 *  Client 2026-08-07 : « reprends la couleur bleue du design en background dans
 *  l'encadré de Bilan développé et applique-la pour remplacer les ombres bleues
 *  actuelles dans les deux encadrés du haut », puis, sur question : « je parlais
 *  justement de l'anneau de particules ».
 *
 *  Ce sont donc les DEUX COULEURS DU SHADER, relevées dans ParticleOrbGL.tsx où
 *  elles sont écrites en composantes normalisées : `colorTop` vec3(0.231, 0.510,
 *  0.965) = #3b82f6, `colorBot` vec3(0.114, 0.306, 0.847) = #1d4ed8. L'anneau
 *  les mélange du haut vers le bas ; les nappes de la carte du haut rejouent le
 *  même sens, le clair en haut et le profond en pied.
 *
 *  ⚠ SI LE SHADER CHANGE DE TEINTES, CES DEUX-LÀ DOIVENT SUIVRE. Le lien ne peut
 *  pas être fait en dur : les valeurs vivent dans une chaîne GLSL, pas dans du
 *  TypeScript importable. */
const RING_BLUE = {
  /** #3b82f6 — `colorTop`, la tête de l'anneau. */
  top: "59,130,246",
  /** #1d4ed8 — `colorBot`, son pied. */
  bot: "29,78,216",
} as const;

/** Les quatre teintes du FOND de « Bilan développé » (à ne pas confondre avec
 *  l'anneau ci-dessus, qui est le décor posé par-dessus). Elles ne servent plus
 *  qu'à cette carte : les ombres du haut sont passées à `RING_BLUE`. */
const BILAN_BLUE = {
  /** #bed6fa — le plus clair, celui des bords de nappe. */
  pale: "190,214,250",
  /** #b2cef9 — le médian. */
  soft: "178,206,249",
  /** #89b2f7 — le cœur, le seul qui porte vraiment la couleur. */
  core: "137,178,247",
  /** #b0cdf9 — la reprise en fondu du cœur. */
  mid: "176,205,249",
} as const;

const SKY_BILAN = [
  GRAIN,
  `radial-gradient(62% 32% at 22% 44%, rgba(${BILAN_BLUE.pale},0.3) 0%, rgba(${BILAN_BLUE.pale},0) 76%)`,
  `radial-gradient(58% 30% at 80% 58%, rgba(${BILAN_BLUE.soft},0.26) 0%, rgba(${BILAN_BLUE.soft},0) 76%)`,
  `radial-gradient(122% 62% at 50% 50%, rgba(${BILAN_BLUE.core},0.36) 0%, rgba(${BILAN_BLUE.mid},0.18) 54%, rgba(255,255,255,0) 88%)`,
].join(", ");

/** Formatage, la carte pleine largeur du pied : le halo bas-gauche de la
 *  famille, REPEINT EN BLEU (client 2026-08-06 : « pour le background, au lieu
 *  de violet je veux bleu »). Même géométrie que `WASH.soft`, la pervenche
 *  #aab2f8 cède au bleu de marque délavé. Les hachures diagonales sont parties
 *  avec elle. */
/** Formatage — la carte pleine largeur du pied. FOND REFAIT le 2026-08-07
 *  (« je trouve le bleu trop agressif et je n'aime pas le design »).
 *
 *  Ce qui n'allait pas, et ce n'était pas seulement l'intensité : deux halos
 *  ancrés dans des ANGLES OPPOSÉS, l'un en haut à droite, l'autre en bas à
 *  gauche. Sur une carte trois fois plus large que haute, on ne lisait pas un
 *  fond mais deux taches bleues qui se regardaient, avec du blanc au milieu.
 *  Monter ou baisser leur opacité n'y aurait rien changé.
 *
 *  La composition est donc remplacée, pas seulement diluée : une seule
 *  HORIZONTALE. Blanc franc sur le tiers haut, un bleu très pâle qui monte du
 *  pied, et un halo large centré sous le visuel. C'est la lecture de
 *  « Prévisionnel » — blanc en haut, couleur en bas — appliquée à une carte
 *  large, donc la rangée entière se tient.
 *
 *  Les opacités tombent aussi de moitié : 0,62 pour le halo le plus fort,
 *  0,30 maintenant. */
/*  ── ALLER-RETOUR DU 2026-08-07, ET CE QU'IL FAUT EN RETENIR ───────────────
 *  Le voile a été remplacé une demi-journée par FULL_PERI_BG + WASH.puffs, la
 *  rampe pleine de « Prévisionnel » (« pareil pour l'encadré le plus en bas »).
 *  Verdict : « ça ne va pas niveau des couleurs, il faut que le bleu soit moins
 *  intense et sur une partie plus restreinte de l'encadré ».
 *
 *  LA LEÇON EST GÉOMÉTRIQUE, pas chromatique, et c'est la même que sur
 *  « Évaluation financière » : une rampe verticale colore la carte SUR TOUTE SA
 *  LARGEUR, et celle-ci est la plus large de la page. Ce qui passe sur un tiers
 *  de colonne devient un aplat sur une pleine rangée. La carte revient donc au
 *  blanc, et la couleur redevient un halo qu'on peut borner.
 *
 *  Par rapport à la version d'avant l'aller-retour, DEUX CRANS EN MOINS, un pour
 *  chaque mot de la consigne :
 *    · moins INTENSE : 0,30 → 0,22 sur le halo, 0,60 / 0,85 → 0,34 / 0,50 sur le
 *      voile de pied ;
 *    · plus RESTREINTE : le halo passe de 72 % × 66 % à 52 % × 46 %, et le voile
 *      ne démarre plus à 32 % de hauteur mais à 56 %, donc il laisse blanc tout
 *      le haut de la carte au lieu des deux tiers. */
/*  ── LE BLEU DES DEUX CARTES DU HAUT, 2026-08-07 ───────────────────────────
 *  Client : « reprends le bleu des encadrés Gagnez des heures et Prévisionnel ».
 *
 *  ⚠ CES DEUX CARTES N'ONT PAS LA MÊME TEINTE SOURCE, et c'est le piège. La
 *  première pose #3b82f6 et #1d4ed8, les couleurs de l'anneau ; la seconde
 *  descend une rampe pervenche jusqu'à #8e9cef. Reprendre « leur » bleu au sens
 *  littéral n'a donc pas de sens.
 *
 *  Ce qu'elles ont en commun est ailleurs, et c'est ce que l'œil voit : une fois
 *  COMPOSÉES SUR LE BLANC, elles tombent au même endroit. #1d4ed8 à 27 % donne
 *  rgb(194,207,244) ; le cœur de la rampe voisine est #bfd1f7, soit
 *  rgb(191,209,247). Trois points d'écart. C'est ce niveau-là qui est repris
 *  ici, pas un code hexadécimal.
 *
 *  Cette carte en était loin : #93b2f4 à 22 % ne composait qu'un rgb(231,238,253),
 *  presque du blanc. Elle passe donc aux teintes de l'anneau, aux opacités qui
 *  la font atterrir sur le même bleu que ses voisines.
 *
 *  LA GÉOMÉTRIE NE BOUGE PAS : halo borné au pied, voile qui ne démarre qu'à
 *  56 % de hauteur. C'est le réglage validé au tour précédent (« moins intense
 *  et sur une partie plus restreinte »), et seule la teinte est en cause ici. */
/*  ── ÉCLAIRCIES D'UN CRAN le 2026-08-08 au soir (client : « un bleu un tout
 *  petit peu plus clair pour les ombres ») : chaque teinte monte d'UN pas dans
 *  la gamme — #1d4ed8 → #3b82f6 sur le cœur du halo, #3b82f6 → #93b8f8 sur sa
 *  frange et sur le voile de pied. Géométrie et opacités inchangées au chiffre
 *  près : la consigne porte sur la CLARTÉ, pas sur la couverture.
 *  ⚠ La carte se DÉTACHE ce faisant de RING_BLUE : ses ombres ne suivent plus
 *  les couleurs du shader de l'anneau, et c'est voulu — le lien datait d'une
 *  consigne du 07/08, celle-ci est plus récente. */
const FORMATAGE_BLUE = {
  /** #3b82f6 — le cœur du halo, un cran au-dessus de l'ancien #1d4ed8. */
  core: "59,130,246",
  /** #93b8f8 — frange du halo et voile de pied, un cran au-dessus de #3b82f6. */
  pale: "147,184,248",
} as const;

const SKY_FORMATAGE = [
  GRAIN,
  `radial-gradient(52% 46% at 50% 118%, rgba(${FORMATAGE_BLUE.core},0.3) 0%, rgba(${FORMATAGE_BLUE.pale},0.14) 48%, rgba(255,255,255,0) 76%)`,
  `linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 56%, rgba(${FORMATAGE_BLUE.pale},0.1) 82%, rgba(${FORMATAGE_BLUE.pale},0.17) 100%)`,
].join(", ");

/** Les deux OMBRES MOBILES de la carte pleine largeur. Elles restent — le
 *  client les avait demandées — mais deviennent INVISIBLES en tant que formes :
 *  presque deux fois plus larges et trois fois plus diluées, elles ne se lisent
 *  plus comme deux lobes qui dérivent mais comme une lumière qui respire. La
 *  seconde emprunte au teal de la charte plutôt qu'au bleu : elle donne de la
 *  vie sans rajouter du bleu, qui était justement de trop.
 *
 *  Le déplacement porte sur `transform` : deux couches translatées, aucun
 *  repeint. Déplacer le centre d'un `radial-gradient` aurait repeint la carte
 *  entière à chaque image, et c'est la plus large de la page. */
// ÉCLAIRCIE d'un cran le 2026-08-08 au soir avec le reste des ombres de la
// carte : #93b8f8 → #a9c8fa, mêmes alphas.
const DRIFT_A =
  "radial-gradient(closest-side, rgba(169,200,250,0.2) 0%, rgba(169,200,250,0.09) 44%, transparent 82%)";
// ⚠ CETTE NAPPE ÉTAIT VERTE, et c'était bien elle que le client voyait : le
// pavé ci-dessus dit qu'elle « emprunte au teal de la charte plutôt qu'au
// bleu ». Sur une carte dont tout le reste est bleu, elle ne se lisait pas comme
// une variation mais comme une tache d'une autre couleur. Verdict 2026-08-07 :
// « il faut que les ombres du background soient bleues et non VERTES ».
// Elle passe au bleu de tête de l'anneau, en restant la plus diluée des deux :
// son rôle — donner de la vie sans rajouter du bleu — est tenu par sa densité,
// pas par sa teinte.
// ÉCLAIRCIE d'un cran le 2026-08-08 au soir avec le reste des ombres de la
// carte : #3b82f6 → #93b8f8 (FORMATAGE_BLUE.pale), mêmes alphas. Elle aussi se
// détache donc de RING_BLUE.
const DRIFT_B =
  `radial-gradient(closest-side, rgba(${FORMATAGE_BLUE.pale},0.14) 0%, rgba(${FORMATAGE_BLUE.pale},0.05) 48%, transparent 84%)`;

/** Les soldes intermédiaires de gestion, semés dans la carte « Bilan développé ».
 *  Les abscisses ont été décalées de +2,5 points le 2026-08-07 : mesuré, le
 *  nuage penchait de 11 px à gauche du centre de la carte, là où l'objet de
 *  « Évaluation financière » tombait pile — d'où l'impression d'incohérence
 *  d'une carte à l'autre. Les ordonnées ont suivi (+2,3 points) : le nuage
 *  tombait 10 px au-dessus du centre du cadre, là où les deux autres visuels
 *  s'y posaient pile.
 *  (client 2026-08-07 : « un vocabulaire de ce que l'on attend dans un bilan
 *  imagé, style EBE, les SIG, flux »), plus une PHRASE DE LECTURE en neuvième
 *  étiquette. Vocabulaire du plan comptable, rien d'inventé.
 *
 *  La phrase est un conseil de GESTION tiré des SIG (« alléger le BFR »), pas
 *  un conseil d'investissement : le module éclaire, l'expert-comptable
 *  conseille — le logiciel ne doit jamais paraître promettre plus qu'il ne
 *  montre. */
const BILAN_CHIPS = (t: (m: { fr: string; en: string }) => string): Chip[] => [
  { label: t({ fr: "Marge brute", en: "Gross margin" }), x: 6.5, y: 4.3 },
  { label: t({ fr: "EBE", en: "EBITDA" }), x: 68.5, y: 6.3, tone: "blue" },
  { label: t({ fr: "Valeur ajoutée", en: "Value added" }), x: 30.5, y: 20.3 },
  { label: t({ fr: "BFR", en: "Working capital" }), x: 72.5, y: 28.3, tone: "teal" },
  { label: t({ fr: "CAF", en: "Cash flow" }), x: 8.5, y: 40.3, tone: "teal" },
  { label: t({ fr: "Résultat d'exploitation", en: "Operating profit" }), x: 42.5, y: 42.3 },
  { label: t({ fr: "Flux de trésorerie", en: "Cash flows" }), x: 12.5, y: 62.3, tone: "blue" },
  { label: t({ fr: "Trésorerie nette", en: "Net cash" }), x: 58.5, y: 64.3 },
  { label: t({ fr: "✦ Conseil : alléger le BFR", en: "✦ Tip: lighten the working capital" }), x: 18.5, y: 86.3, tone: "advice" },
];

/** Les formes juridiques, semées dans la carte « Structure » (client
 *  2026-08-07). Abscisses décalées de +4,3 points pour recentrer le nuage,
 *  qui penchait de 19 px à gauche (même mesure que pour « Bilan développé »).
 *  Ordonnées reculées de 4,5 points le 2026-08-07 : l'étiquette « Optimisation
 *  rémunération dirigeant » a allongé le nuage vers le bas et l'avait fait
 *  descendre 17 px sous ses deux voisines.
 *  Côté FR, les formes du droit français ; côté EN, les formes
 *  internationales équivalentes — pas une traduction mot à mot, ce sont deux
 *  listes qui parlent chacune à leur lecteur. */
const STRUCTURE_CHIPS = (t: (m: { fr: string; en: string }) => string): Chip[] => [
  { label: t({ fr: "Holding", en: "Holding" }), x: 10.3, y: -1.5, tone: "blue" },
  { label: t({ fr: "SAS", en: "Inc." }), x: 70.3, y: 5.5 },
  { label: t({ fr: "SARL", en: "Ltd" }), x: 28.3, y: 19.5 },
  // TONS TEAL RETIRÉS de « SCI » et « SA » le 2026-08-07 (« que le vert ne soit
  // pas présent »). Ces deux pastilles étaient le vert le PLUS visible de la
  // carte — un aplat #e6f5f2 et une encre #0f766e — bien avant le voile de fond.
  // Elles repassent au ton NEUTRE et non au bleu : la même demande veut aussi
  // moins de bleu, en repeindre deux de plus aurait pris d'une main ce qu'on
  // rend de l'autre. Le nuage garde donc son rythme teinté / neutre.
  { label: t({ fr: "SCI", en: "Property SPV" }), x: 66.3, y: 33.5 },
  { label: t({ fr: "SASU", en: "LLC" }), x: 14.3, y: 45.5 },
  { label: t({ fr: "Micro-entreprise", en: "Sole trader" }), x: 34.3, y: 63.5, tone: "blue" },
  { label: t({ fr: "SA", en: "PLC" }), x: 78.3, y: 67.5 },
  { label: t({ fr: "Optimisation rémunération dirigeant", en: "Director pay optimisation" }), x: 8.3, y: 79.5, tone: "blue" },
  { label: t({ fr: "✦ Comparatif avant / après", en: "✦ Before / after comparison" }), x: 24.3, y: 91.5, tone: "advice" },
];

/** Jumelle TRANSPARENTE du dégradé de ValuationCard : mêmes arrêts, mêmes
 *  positions, alphas divisés par sept. Toute retouche de l'un doit être
 *  reportée sur l'autre, sinon l'objet et son fond ne racontent plus la même
 *  chose. MÊME PÉRIODE de 520 px, en dur des deux côtés : c'est elle qui doit
 *  correspondre à la translation des keyframes, sans quoi la boucle saute.
 *  Voir le pavé de ValuationCard. */
// REPORTÉ SUR LE NOUVEAU DÉGRADÉ DE ValuationCard, 2026-08-07 : l'objet est
// passé au bleu de l'anneau de particules, le halo suit dans la même minute.
// Mêmes arrêts, mêmes positions, mêmes alphas — seules les six teintes changent,
// et ce sont exactement celles de FLOW_GRAD. Le cyan et la pervenche sortent
// d'ici comme ils sortent de là-bas.
// DIAGONALE À 205°, reportée de ValuationCard le 2026-08-07 avec les teintes :
// la nappe de fond et l'objet doivent pencher du même angle, sinon on lit deux
// mouvements au lieu d'un.
// ⚠ LA COURSE VERTICALE SUIT : 520 / cos(25°) = 573,75 px, sans quoi la boucle
// saute d'un facteur cosinus. Voir la démonstration dans ValuationCard, et
// `AURA_STEP` juste en dessous, qui alimente à la fois les keyframes et la
// hauteur de la nappe.
// ALPHAS DIVISÉS PAR DEUX le 2026-08-07 (« je ne veux pas que l'encadré soit
// presque entièrement couvert de bleu ») : c'est cette nappe la vraie coupable,
// pas la vague — elle couvre TOUTE la carte, la vague n'en traverse qu'une
// bande. Puis REMONTÉS DE 35 % dans la foulée (« pas mal mais amplifie un peu
// plus »), ce qui les laisse à moitié chemin de leur valeur d'origine. Les
// teintes et les positions n'ont jamais bougé, seule la densité.
// Troisième réglage de densité le 2026-08-07 (« amplifie l'intensité de la
// visibilité du design en background ») : ÷2, puis ×1,35, maintenant ×1,4. La
// nappe repasse donc au-dessus de sa valeur d'origine, ce qui est cohérent —
// c'est la VAGUE qui couvrait trop, et elle est devenue un ruban depuis. La
// nappe peut porter la couleur sans que la carte redevienne bleue partout.
const AURA_FLOW =
  "repeating-linear-gradient(205deg," +
  " rgba(29,78,216,0.22) 0px, rgba(59,130,246,0.19) 90px, rgba(163,196,251,0.16) 170px," +
  " rgba(147,186,250,0.18) 250px, rgba(88,149,247,0.21) 330px, rgba(35,88,222,0.22) 420px," +
  " rgba(29,78,216,0.22) 520px)";
/** Course d'une période le long de la verticale, pour la diagonale ci-dessus. */
const AURA_STEP = Math.round((520 / Math.cos((25 * Math.PI) / 180)) * 100) / 100;

/** Fondu du ruban LE LONG de sa propre course. Posé dans le repère incliné, où
 *  l'axe des x pointe vers le haut-droit : « to right » veut donc dire « en
 *  montant ». Le tissu sort de rien en bas à gauche, s'installe à mi-parcours,
 *  et retient un peu de matière au sommet plutôt que de s'arrêter net. */
const SILK_FADE =
  "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.18) 20%," +
  " rgba(0,0,0,0.72) 54%, rgba(0,0,0,1) 82%, rgba(0,0,0,0.66) 100%)";

/** Tracé de la VAGUE, en deux motifs identiques de 600 unités sur les 1200 du
 *  repère : c'est cette périodicité qui permet à la translation de -50 % de
 *  reboucler sans saut. Toute retouche doit répéter à l'identique le motif de
 *  0-600 sur 600-1200, sinon la vague sautera une fois par tour.
 *
 *  ── DE LA VAGUE AU RUBAN, 2026-08-07 ───────────────────────────────────────
 *  Client : « je veux comme un tissu, un vent de bleu léger et presque
 *  transparent qui remonte en diagonale ; je ne veux pas que l'encadré soit
 *  presque entièrement couvert de bleu ».
 *
 *  LE DÉFAUT ÉTAIT DANS LE TRACÉ, pas dans l'angle. L'ancien se fermait par
 *  « L1200,200 L0,200 Z » : il ne dessinait pas une vague mais un DEMI-PLAN,
 *  rempli depuis la courbe jusqu'au bas du repère. Incliné à 44°, ce bloc plein
 *  barrait la moitié de la carte — d'où le bleu partout. Aucun réglage
 *  d'opacité n'aurait corrigé ça, c'était une question de surface.
 *
 *  Le tracé est donc devenu un RUBAN : deux fois la même courbe, l'une décalée
 *  de 50 unités sous l'autre, refermées l'une sur l'autre. La matière ne fait
 *  plus que 50 unités d'épaisseur sur 200 — un quart de ce qu'elle occupait —
 *  et le reste du repère est vide. C'est ce qui permet au tissu de traverser
 *  sans recouvrir.
 *
 *  La PÉRIODICITÉ est préservée sur les deux bords : le motif 0-600 du bord
 *  haut est répété à l'identique sur 600-1200, et le bord bas est le même
 *  parcouru à l'envers, points de contrôle inversés segment par segment. */
const WAVE_PATH =
  // bord haut, de gauche à droite, ondulant autour de y=80
  "M0,80 C100,20 200,140 300,80 C400,20 500,140 600,80" +
  " C700,20 800,140 900,80 C1000,20 1100,140 1200,80" +
  // bord bas, le même parcouru en sens inverse, 50 unités plus bas
  " L1200,130 C1100,190 1000,70 900,130 C800,190 700,70 600,130" +
  " C500,190 400,70 300,130 C200,190 100,70 0,130 Z";

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};

/** Générateur pseudo-aléatoire DÉTERMINISTE (mulberry32) : le semis de
 *  particules est identique à chaque rendu — pas de scintillement quand React
 *  re-rend, et le même dessin pour tous les visiteurs. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Nuée de particules — le semis de points diffus de la carte « Boostez vos
 *  revenus » de Stripe, passé en pervenche : un anneau de poussière autour du
 *  visuel, dense au milieu de la couronne, qui s'éparpille vers l'extérieur.
 *  `seed` change tout le semis : deux graines donnent deux nuées disjointes. */
function SpeckleField({ className, seed = 20260806 }: { className?: string; seed?: number }) {
  const dots = useMemo(() => {
    const rnd = mulberry32(seed);
    const palette = ["#6c72ec", "#8a90f1", "#a5adf6", "#c3caf9"];
    return Array.from({ length: 200 }, () => {
      const a = rnd() * Math.PI * 2;
      const r = 80 + Math.pow(rnd(), 0.55) * 118;
      return {
        x: Math.round((200 + Math.cos(a) * r * (0.92 + rnd() * 0.16)) * 10) / 10,
        y: Math.round((200 + Math.sin(a) * r * (0.78 + rnd() * 0.22)) * 10) / 10,
        s: Math.round((0.6 + rnd() * 1.6) * 10) / 10,
        c: palette[Math.floor(rnd() * palette.length)],
        o: Math.round((0.22 + rnd() * 0.58) * 100) / 100,
      };
    });
  }, [seed]);
  return (
    <svg aria-hidden viewBox="0 0 400 400" className={className}>
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.s} fill={d.c} opacity={d.o} />
      ))}
    </svg>
  );
}

/** Nuée ANIMÉE (client 2026-08-06 : « la même animation que Stripe, les
 *  points derrière ») : DEUX semis disjoints en fondu croisé — quand l'un
 *  s'éteint l'autre s'allume, les points semblent apparaître et disparaître —
 *  posés sur une dérive lente de l'ensemble. Deux couches animées seulement,
 *  jamais 200 points un par un : le coût de peinture reste celui de deux
 *  opacités et d'un transform. La position vient de l'appelant (couche
 *  externe), la dérive vit sur une couche interne pour ne pas écraser son
 *  translate de centrage. Coupée par prefers-reduced-motion. */
function AnimatedSpeckles({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="ucb-drift absolute inset-0">
        <SpeckleField seed={20260806} className="ucb-tw-a absolute inset-0 h-full w-full" />
        <SpeckleField seed={81120643} className="ucb-tw-b absolute inset-0 h-full w-full" />
      </div>
    </div>
  );
}

/** Globe ANIMÉ (client 2026-08-06 : « l'animation pointillée, une espèce de
 *  planète de galaxies ») : la sphère tourne lentement sur elle-même autour
 *  de l'axe de visée — une seule couche animée en rotation, le semis n'est
 *  jamais recalculé. Les arcs d'orbite tournent avec elle. */
function AnimatedGlobe({ className }: { className?: string }) {
  return (
    <div className={className}>
      <DotGlobe className="ucb-spin absolute inset-0 h-full w-full" />
    </div>
  );
}

/** SOUFFLE de particules — 4e dessin, décalqué sur le fond de « Boostez vos
 *  revenus » de Stripe (capture fournie le 2026-08-06), en bleu de marque.
 *
 *  La lecture attentive de la référence donne la structure, et elle n'est pas
 *  celle d'un semis uniforme : les points sont ÉMIS EN RAYONS depuis un
 *  cercle intérieur qui cerne le contenu. D'où le procédé, rayon par rayon :
 *    · un cercle INTÉRIEUR (RIN) borde le champ, le centre reste vierge et
 *      c'est là que passe le contenu de la carte ;
 *    · chaque rayon crache ses points vers l'extérieur avec une loi en
 *      puissance : serrés contre le bord, puis longue traîne qui se raréfie ;
 *    · la dispersion angulaire CROÎT avec la distance, donc les rayons
 *      s'évasent en éventail au lieu de rester des traits rigides ;
 *    · taille et opacité déclinent le long de la traîne, ce qui donne la
 *      profondeur : le bord est net, le lointain n'est plus qu'une poussière.
 *
 *  L'irrégularité vient d'une modulation de densité par SECTEUR : certains
 *  rayons sont fournis, d'autres presque nus, comme les pleins et les vides
 *  de la référence. Phases tirées de la graine, deux souffles ne se
 *  ressemblent jamais.
 *
 *  Dessiné DE FACE dans son plan, l'inclinaison appartient à l'enveloppe. */
function DotOrb({ className, seed = 11 }: { className?: string; seed?: number }) {
  const pts = useMemo(() => {
    const rnd = mulberry32(seed);
    /** Bord intérieur du champ et profondeur de la traîne (repère 400x400).
     *  RIN volontairement COURT : la couronne dense doit tomber DANS la carte,
     *  pas au-delà de ses bords — c'est ce qui manquait au premier jet, où le
     *  premier rang de points sortait du cadre et ne laissait voir que la
     *  poussière du lointain. */
    const RIN = 78;
    const SPAN = 108;
    const RAYS = 150;
    // Palette pondérée vers les bleus moyens : trop pâle, la poussière se
    // dissout dans le blanc de la carte.
    const palette = ["#3b82f6", "#3b82f6", "#5b95f7", "#6ea3f8", "#93b8f8", "#b7cdf9"];
    const p1 = rnd() * 6.283;
    const p2 = rnd() * 6.283;
    const out: { x: number; y: number; s: number; o: number; c: string }[] = [];
    for (let i = 0; i < RAYS; i++) {
      const a0 = (i / RAYS) * Math.PI * 2 + (rnd() - 0.5) * 0.06;
      const dens =
        0.22 + 0.78 * (0.5 + 0.5 * Math.sin(2 * a0 + p1)) * (0.45 + 0.55 * Math.sin(5 * a0 + p2));
      const n = Math.round((4 + rnd() * 9) * dens);
      for (let k = 0; k < n; k++) {
        // Loi en puissance : la masse des points reste près du bord intérieur.
        const t = Math.pow(rnd(), 1.7);
        const r = RIN + t * SPAN;
        // L'éventail s'ouvre avec la distance.
        const a = a0 + (rnd() - 0.5) * (0.025 + 0.085 * t);
        out.push({
          x: Math.round((200 + Math.cos(a) * r) * 10) / 10,
          y: Math.round((200 + Math.sin(a) * r) * 10) / 10,
          s: Math.round((0.35 + (1 - t) * 0.7 + rnd() * 0.35) * 10) / 10,
          o: Math.round(Math.min(0.82, (0.74 - 0.5 * t) * (0.35 + rnd() * 0.8)) * 100) / 100,
          c: rnd() < 0.045 ? "#2dd4bf" : palette[Math.floor(rnd() * palette.length)],
        });
      }
    }
    return out;
  }, [seed]);
  return (
    <svg aria-hidden viewBox="0 0 400 400" className={className}>
      <defs>
        {/* Halo ANNULAIRE : transparent au centre, à peine bleuté sous la
            couronne. C'est ce qui donne le volume sans jamais salir le
            centre, où passe le contenu de la carte. */}
        {/* Recalé sur le nouveau bord intérieur (RIN = 94/200) : la lueur
            s'allume juste derrière le premier rang de points et s'éteint dans
            la traîne. Le centre reste rigoureusement vierge. */}
        <radialGradient id={`ucb-orb-${seed}`}>
          <stop offset="0" stopColor="#93b8f8" stopOpacity="0" />
          <stop offset="0.33" stopColor="#93b8f8" stopOpacity="0.02" />
          <stop offset="0.47" stopColor="#7ba9f6" stopOpacity="0.075" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="190" fill={`url(#ucb-orb-${seed})`} />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.s} fill={p.c} opacity={p.o} />
      ))}
    </svg>
  );
}

/** CHAMP MAGNÉTIQUE — arrière-plan premium de la seule carte « Pointage de
 *  comptes » (cahier des charges client du 2026-08-06, repris point par
 *  point). Une couronne légèrement OVALE de milliers de particules, qui
 *  entoure le contenu sans jamais lui disputer le regard.
 *
 *  ⚠ PALETTE HORS CHARTE, et c'est délibéré : rose #FF5DBA, magenta #E648C8,
 *  violet #9D5CFF ont été demandés au code hexadécimal près. Cette carte est
 *  la SEULE à y déroger ; le reste de la grille tient le bleu de marque.
 *
 *  Ce qui produit l'aspect organique, dans l'ordre où ça compte :
 *    · densité modulée par LOBES gaussiens plutôt qu'uniforme : deux foyers
 *      lumineux en bas-gauche et bas-droit, deux appuis plus discrets sur les
 *      flancs, un haut presque désert. L'anneau est donc IMPARFAIT ;
 *    · épaisseur de la couronne variable selon l'angle, donc jamais un trait
 *      d'épaisseur constante ;
 *    · teinte qui BALAIE la palette le long de la couronne (rose → magenta →
 *      violet), plus une pincée de particules quasi blanches ;
 *    · un cinquième des points est semé LARGE et très pâle : c'est cette
 *      frange qui dissout le bord au lieu de le trancher.
 *
 *  Pas de rotation ici, contrairement aux autres décors : les foyers
 *  lumineux sont ancrés en bas de la composition et tourner les déplacerait.
 *  Seul le fondu croisé des deux semis fait vivre les particules. */
function AuroraField({ className, seed = 7 }: { className?: string; seed?: number }) {
  const pts = useMemo(() => {
    const rnd = mulberry32(seed);
    const gauss = () => {
      let u = 0;
      let v = 0;
      while (u === 0) u = rnd();
      while (v === 0) v = rnd();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };
    const hex = (h: string) => [
      parseInt(h.slice(1, 3), 16),
      parseInt(h.slice(3, 5), 16),
      parseInt(h.slice(5, 7), 16),
    ];
    const PINK = hex("#FF5DBA");
    const MAGENTA = hex("#E648C8");
    const VIOLET = hex("#9D5CFF");
    /** Balayage rose → magenta → violet le long de la couronne. */
    const sweep = (u: number) => {
      const t = ((u % 1) + 1) % 1;
      const [a, b, k] = t < 0.5 ? [PINK, MAGENTA, t * 2] : [MAGENTA, VIOLET, (t - 0.5) * 2];
      const c = a.map((v, i) => Math.round(v + (b[i] - v) * k));
      return `rgb(${c[0]},${c[1]},${c[2]})`;
    };
    /** Lobe gaussien angulaire, pour ancrer les foyers lumineux. */
    const lobe = (a: number, center: number, width: number) => {
      let d = Math.abs(a - center);
      if (d > Math.PI) d = 2 * Math.PI - d;
      return Math.exp(-(d * d) / (2 * width * width));
    };
    const R = 132;
    const p1 = rnd() * 6.283;
    const p2 = rnd() * 6.283;
    const out: { x: number; y: number; s: number; o: number; c: string }[] = [];
    // Repère SVG : y vers le BAS, donc 45° = bas-droite, 135° = bas-gauche.
    const BR = Math.PI / 4;
    const BL = (3 * Math.PI) / 4;
    let guard = 0;
    while (out.length < 950 && guard++ < 26000) {
      const a = rnd() * Math.PI * 2;
      // Lobes ÉLARGIS : les flancs doivent rester peuplés entre les deux
      // foyers bas, sans quoi la couronne se réduit à deux paquets.
      const w =
        0.18 +
        0.82 * lobe(a, BR, 0.78) +
        0.82 * lobe(a, BL, 0.78) +
        0.55 * lobe(a, 0, 0.62) +
        0.55 * lobe(a, Math.PI, 0.62);
      if (rnd() > Math.min(1, w)) continue;
      // Un cinquième part en frange large et très pâle : le bord se dissout.
      const halo = rnd() < 0.2;
      const sigma = halo
        ? 0.3
        : 0.075 + 0.055 * (0.5 + 0.5 * Math.sin(3 * a + p1)) * (0.5 + 0.5 * Math.sin(5 * a + p2));
      const d = gauss() * sigma;
      const r = R * (1 + d);
      if (r < 44 || r > 198) continue;
      const f = Math.exp(-(d * d) / 0.022);
      const near = rnd() < 0.08;
      out.push({
        x: Math.round((200 + Math.cos(a) * r) * 10) / 10,
        y: Math.round((200 + Math.sin(a) * r) * 10) / 10,
        // 1 à 3 px à l'écran une fois la scène mise à l'échelle.
        s: Math.round((0.38 + rnd() * rnd() * 0.62) * 100) / 100,
        o:
          Math.round(
            Math.min(0.78, (halo ? 0.13 : 0.3 + 0.6 * f) * Math.min(1, w) * (0.55 + rnd() * 0.7)) *
              100,
          ) / 100,
        c: near ? "#FFF2FB" : sweep(a / (2 * Math.PI) + 0.12),
      });
    }
    return out;
  }, [seed]);
  return (
    <svg aria-hidden viewBox="0 0 400 400" className={className}>
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.s} fill={p.c} opacity={p.o} />
      ))}
    </svg>
  );
}

/** Champ animé : couronne légèrement ovale (scaleY), deux semis en fondu
 *  croisé pour faire respirer les particules. Aucune rotation, voir plus
 *  haut. */
function AnimatedAurora({ className, seed = 7 }: { className?: string; seed?: number }) {
  return (
    <div className={className}>
      <div className="absolute inset-0" style={{ transform: "rotate(-4deg) scaleY(0.86)" }}>
        <AuroraField seed={seed} className="ucb-tw-a absolute inset-0 h-full w-full" />
        <AuroraField seed={seed + 613} className="ucb-tw-b absolute inset-0 h-full w-full" />
      </div>
    </div>
  );
}

/** Planète animée : trois couches aux rôles disjoints. L'externe POSITIONNE
 *  (classes de la carte), l'intermédiaire INCLINE le plan, l'interne TOURNE
 *  et porte DEUX semis en fondu croisé — c'est ce fondu qui fait scintiller
 *  les points (« des petits points animés »), là où animer 430 cercles un par
 *  un coûterait une fortune. Aucun masque : les bords sont rognés par la
 *  carte elle-même, exactement comme la sphère de la référence. */
function AnimatedOrb({ className, seed = 11, tilt }: { className?: string; seed?: number; tilt?: string }) {
  return (
    <div className={className}>
      <div className="absolute inset-0" style={{ transform: tilt ?? "rotate(-8deg) scaleY(0.9)" }}>
        <div className="ucb-spin-slow absolute inset-0">
          <DotOrb seed={seed} className="ucb-tw-a absolute inset-0 h-full w-full" />
          <DotOrb seed={seed + 977} className="ucb-tw-b absolute inset-0 h-full w-full" />
        </div>
      </div>
    </div>
  );
}

/* Fondu croisé décalé (A part allumé, B éteint), dérive douce, rotation de
 * planète. */
const SPECKLE_CSS = `
@keyframes ucbTwA { 0%, 100% { opacity: 0.95; } 50% { opacity: 0.12; } }
@keyframes ucbTwB { 0%, 100% { opacity: 0.12; } 50% { opacity: 0.95; } }
@keyframes ucbDrift {
  0%, 100% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(2.5deg) scale(1.03); }
}
@keyframes ucbSpin { to { transform: rotate(360deg); } }
.ucb-tw-a { animation: ucbTwA 5.6s ease-in-out infinite; }
.ucb-tw-b { animation: ucbTwB 5.6s ease-in-out infinite; }
.ucb-drift { animation: ucbDrift 17s ease-in-out infinite; will-change: transform; }
.ucb-spin { animation: ucbSpin 80s linear infinite; transform-origin: 50% 50%; will-change: transform; }
.ucb-spin-slow { animation: ucbSpin 150s linear infinite; transform-origin: 50% 50%; will-change: transform; }
/* HALO DE « Évaluation financière » — il RÉPLIQUE le mouvement de couleur de
   la carte-objet posée dessus (ValuationCard) : la même nappe périodique
   bleu/teal qui défile, à la même période et dans la même phase, mais
   beaucoup plus diluée.

   Même durée et même timing linéaire que vcFlow, et les deux montent sur la même
   image : ils restent donc alignés sans qu'aucun décalage n'ait à être réglé.
   La phase est ce qui compte — décalés, l'objet et son fond se contrediraient
   au lieu de respirer ensemble.

   NOTE : jusqu'au 2026-08-07 le halo jouait ce mouvement EN OPPOSITION (le
   teal du fond reculait quand celui de l'objet avançait). Le client a demandé
   une « réplication » ; passer de l'un à l'autre tient dans le signe de la
   translation. */
@keyframes ucbFlow { from { transform: translateY(0); } to { transform: translateY(-${AURA_STEP}px); } }
/* ACCÉLÉRÉES D'UN QUART le 2026-08-07 (« amplifie légèrement l'animation de
   background de l'encadré Évaluation financière »). C'est bien la CADENCE qu'on
   monte et pas l'amplitude : les trois couches sont périodiques et rebouclent
   sur leur propre longueur, donc raccourcir la durée fait passer plus de motif
   dans le même temps sans toucher à la géométrie ni risquer un saut au
   rebouclage. 13 → 10 s pour la nappe, 14 → 11 s et 20 → 16 s pour les deux
   rubans. L'écart entre les deux rubans est conservé, c'est lui qui les empêche
   de se superposer en cadence. */
.ucb-flow { animation: ucbFlow 10s linear infinite; will-change: transform; }

/* LA VAGUE. Deux nappes ondulées qui traversent le fond de la carte
   horizontalement, à des vitesses et des hauteurs différentes — c'est le
   décalage entre les deux qui donne le roulis, une seule glisserait comme un
   bandeau.

   AMPLIFIÉE le 2026-08-07 : creux deux fois plus hauts, teintes deux tiers
   plus denses, cadence accélérée d'un tiers. La houle se voyait à peine.

   Le rebouclage suit la même règle que la nappe verticale : le tracé est
   PÉRIODIQUE sur la moitié de sa largeur, et la translation vaut exactement
   -50 %. L'image d'arrivée est celle du départ. */
/* Les ombres mobiles de la carte pleine largeur : deux boucles FERMÉES
   (0 % = 100 %), sans alternate, donc une dérive et non un va-et-vient. */
@keyframes ucbDriftA {
  0%, 100% { transform: translate3d(-8%, -6%, 0) scale(1); }
  34% { transform: translate3d(10%, 8%, 0) scale(1.18); }
  67% { transform: translate3d(4%, -10%, 0) scale(0.92); }
}
@keyframes ucbDriftB {
  0%, 100% { transform: translate3d(9%, 7%, 0) scale(1.1); }
  38% { transform: translate3d(-11%, -4%, 0) scale(0.94); }
  72% { transform: translate3d(-3%, 11%, 0) scale(1.2); }
}
.ucb-drift-a { animation: ucbDriftA 34s ease-in-out infinite; will-change: transform; }
.ucb-drift-b { animation: ucbDriftB 43s ease-in-out infinite; will-change: transform; }

@keyframes ucbWave { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.ucb-wave-a { animation: ucbWave 11s linear infinite; will-change: transform; }
.ucb-wave-b { animation: ucbWave 16s linear infinite reverse; will-change: transform; }
@media (prefers-reduced-motion: reduce) {
  .ucb-tw-a, .ucb-tw-b, .ucb-drift, .ucb-spin, .ucb-spin-slow { animation: none !important; }
  .ucb-flow, .ucb-wave-a, .ucb-wave-b, .ucb-drift-a, .ucb-drift-b { animation: none !important; }
}
`;

/** Globe en pointillés — la sphère de particules de « Faites circuler vos
 *  fonds » : points semés en spirale de Fibonacci sur une sphère inclinée,
 *  hémisphère avant seulement, taille et opacité selon la profondeur, plus
 *  deux arcs d'orbite au trait dégradé. */
function DotGlobe({ className }: { className?: string }) {
  const pts = useMemo(() => {
    const N = 640, R = 168, golden = Math.PI * (3 - Math.sqrt(5));
    const tilt = -0.42;
    const out: { x: number; y: number; s: number; o: number }[] = [];
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const rad = Math.sqrt(1 - y * y);
      const th = golden * i;
      const x = Math.cos(th) * rad;
      const z = Math.sin(th) * rad;
      const y2 = y * Math.cos(tilt) - z * Math.sin(tilt);
      const z2 = y * Math.sin(tilt) + z * Math.cos(tilt);
      if (z2 < -0.22) continue;
      out.push({
        x: Math.round((200 + x * R) * 10) / 10,
        y: Math.round((200 + y2 * R) * 10) / 10,
        s: Math.round((0.8 + Math.max(0, z2) * 1.1) * 10) / 10,
        o: Math.round((0.14 + Math.max(0, z2) * 0.5) * 100) / 100,
      });
    }
    return out;
  }, []);
  return (
    <svg aria-hidden viewBox="0 0 400 400" className={className}>
      <defs>
        <linearGradient id="ucb-orbit" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6c72ec" stopOpacity="0" />
          <stop offset="0.5" stopColor="#6c72ec" stopOpacity="0.7" />
          <stop offset="1" stopColor="#c3caf9" stopOpacity="0" />
        </linearGradient>
      </defs>
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.s} fill="#7d84ef" opacity={p.o} />
      ))}
      <ellipse cx="200" cy="200" rx="206" ry="74" fill="none" stroke="url(#ucb-orbit)" strokeWidth="1.2" transform="rotate(-24 200 200)" />
      <ellipse cx="200" cy="200" rx="228" ry="58" fill="none" stroke="url(#ucb-orbit)" strokeWidth="1" opacity="0.6" transform="rotate(18 200 200)" />
    </svg>
  );
}

/** Analyse graphique de prévisionnel, ultra minimaliste — deux panneaux
 *  blancs empilés dans l'esprit des tuiles de facturation Stripe fournies en
 *  capture : un panneau d'en-tête avec icône, libellés et compteur en dégradé
 *  de marque, puis un panneau de graphique à barres. Version expert-comptable :
 *  chiffres et libellés repris de PrevisionnelMockup et des puces validées
 *  (« 3,4 M€ », « CA projeté 2030 », « construit sur votre historique »),
 *  rien d'inventé. Les barres suivent une TRAJECTOIRE de croissance (semis
 *  déterministe autour d'une tendance montante), pas un bruit aléatoire :
 *  c'est ce qui se lit comme un prévisionnel. */
function PrevisionPanels() {
  // RÉDUIT DE 30 % (client 2026-08-07). `zoom` et non `transform: scale` : il
  // refait la mise en page à la taille voulue, donc le texte est composé —
  // et rastérisé — à 70 % de son corps, net.
  //
  // La LARGEUR doit être bornée en plus du zoom, et c'est contre-intuitif :
  // sous `zoom`, un `width: 100%` se résout contre la largeur du parent
  // DIVISÉE par le facteur, si bien que le bloc se rendait à sa taille
  // d'origine avec seulement son contenu rapetissé. `w-[70%]` lui rend les
  // 30 % de largeur attendus.
  const bars = useMemo(() => {
    const rnd = mulberry32(20260807);
    return Array.from({ length: 24 }, (_, i) => {
      const trend = 16 + (i / 23) * 62;
      return Math.round(Math.max(10, Math.min(92, trend + (rnd() - 0.5) * 15)));
    });
  }, []);
  return (
    <div className="relative mx-auto w-[70%] space-y-3 md:space-y-3.5" style={{ zoom: 0.7 }}>
      <div className="rounded-[12px] bg-white p-[18px] md:p-5 ring-1 ring-[#0a2540]/[0.05] shadow-[0_12px_32px_-18px_rgba(10,37,64,0.4)]">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#e7effd]">
            <TrendingUp className="h-5 w-5 text-[#3b82f6]" />
          </span>
          <div className="min-w-0">
            <div className="font-inter font-medium text-[14.5px] leading-tight text-[#0a2540]">Business plan</div>
            <div className="font-inter text-[12.5px] text-[#6b85a3]">Trajectoire 2026 → 2030</div>
          </div>
        </div>
        <div className="mt-4 font-inter font-medium text-[13.5px] text-[#0a2540]">Hypothèses</div>
        <div className="mt-0.5 font-inter text-[12.5px] text-[#6b85a3]">Construites sur votre historique</div>
        <div className="mt-3.5 flex items-center gap-2 font-inter font-medium text-[13px] text-[#0a2540]">
          <Gauge className="h-[15px] w-[15px] text-[#3b82f6]" />
          Avancement du dossier
        </div>
        <div className="mt-2 h-[7px] overflow-hidden rounded-full bg-[#eef3fb]">
          <div
            className="h-full w-[72%] rounded-full"
            style={{ background: "linear-gradient(90deg, #3b82f6 0%, #60a5fa 55%, #0d9488 100%)" }}
          />
        </div>
      </div>
      <div className="rounded-[12px] bg-white p-[18px] md:p-5 ring-1 ring-[#0a2540]/[0.05] shadow-[0_12px_32px_-18px_rgba(10,37,64,0.4)]">
        <div className="font-inter text-[12.5px] text-[#6b85a3]">CA projeté, 2026 → 2030</div>
        <div className="mt-0.5 font-inter font-medium text-[19px] tracking-[-0.01em] text-[#0a2540]">3,4 M€ en 2030</div>
        <div className="mt-4 flex h-[104px] items-end gap-[3px]">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 rounded-[2px] bg-[#8fb4f7]" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** « Votre dossier est prêt » — la SORTIE du module Évaluation d'entreprise,
 *  répliquée depuis la capture de l'application fournie le 2026-08-07 :
 *  l'en-tête à coche verte, les trois pièces du dossier (classeur, PDF,
 *  présentation), la valeur retenue et les actions. Libellés et chiffres
 *  relevés sur la capture, aucun n'est inventé. Français en dur, comme
 *  PrevisionPanels et OraHomeMockup : ces scènes sont des « captures » d'un
 *  logiciel français. */
function DossierPanels() {
  const pieces = [
    // Sous-titres RACCOURCIS : sur trois colonnes dans un bloc de 300 px,
    // chaque tuile fait 90 px et la phrase de la capture y tombait sur quatre
    // lignes. Le sens tient, la ligne aussi.
    { icon: FileSpreadsheet, cls: "bg-emerald-50 text-emerald-600", title: "Classeur", sub: "Formules vivantes" },
    { icon: FileText, cls: "bg-red-50 text-red-500", title: "Dossier PDF", sub: "À votre charte" },
    { icon: Presentation, cls: "bg-violet-50 text-violet-600", title: "Présentation", sub: "PowerPoint natif" },
  ] as const;
  return (
    // RESSERRÉS (client 2026-08-07 : « que les designs à l'intérieur soient
    // bien plus petits »). La largeur est bornée et centrée au lieu de courir
    // d'un bord à l'autre : les panneaux deviennent un objet posé au milieu de
    // la carte, et la grosse ombre bleue les ENTOURE au lieu de passer
    // dessous. Sans cette borne, agrandir l'ombre n'aurait rien donné à voir.
    <div className="relative mx-auto w-full max-w-[300px] space-y-2.5">
      {/* L'ICÔNE DU MODULE, la balance rose de la vignette « Évaluation
          d'entreprise » de l'écran d'accueil (client 2026-08-07 : « mets en
          valeur l'icône »). En 44 px : assez pour être le premier objet vu,
          assez peu pour rester dans la famille des « petits encadrés » —
          la version 56 px, dans une réplique d'écran plein cadre, a été
          jugée « bien trop grande » le jour même. Son halo s'allume au survol
          de la carte. */}
      <div className="flex items-center gap-3 px-1">
        <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-gradient-to-br from-[#fdeaee] to-[#fbd9e0] text-[#d6416a] shadow-[0_8px_20px_-10px_rgba(214,65,106,0.6)] transition-transform duration-[620ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.1]">
          <span
            aria-hidden
            className="absolute -inset-2 rounded-[20px] bg-[#f472b6]/0 blur-[10px] transition-colors duration-[620ms] group-hover:bg-[#f472b6]/25"
          />
          <Scale className="relative h-[22px] w-[22px]" strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <div className="font-inter font-semibold text-[13.5px] leading-tight text-[#0a2540]">Évaluation d'entreprise</div>
          <div className="mt-0.5 font-inter text-[11px] text-[#6b85a3]">Cinq approches combinées</div>
        </div>
      </div>
      <div className="rounded-[12px] bg-white p-4 md:p-[18px] ring-1 ring-[#0a2540]/[0.05] shadow-[0_12px_32px_-18px_rgba(10,37,64,0.4)]">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dcf3e5]">
            <Check className="h-4 w-4 text-[#177245]" strokeWidth={3} />
          </span>
          <div className="min-w-0">
            <div className="font-inter font-semibold text-[14px] leading-tight text-[#0a2540]">Votre dossier est prêt</div>
            <div className="mt-0.5 font-inter text-[11.5px] text-[#6b85a3]">3 pièces, à votre charte</div>
          </div>
        </div>
        <div className="mt-3.5 grid grid-cols-3 gap-2">
          {pieces.map((p) => (
            <div
              key={p.title}
              className="rounded-[10px] bg-white p-2.5 ring-1 ring-[#0a2540]/[0.06] transition-transform duration-[620ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-[3px]"
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-[8px] ${p.cls}`}>
                <p.icon className="h-3.5 w-3.5" />
              </span>
              <div className="mt-1.5 font-inter font-semibold text-[10px] leading-tight text-[#0a2540]">{p.title}</div>
              <div className="mt-0.5 font-inter text-[8.5px] leading-snug text-[#6b85a3]">{p.sub}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-[12px] bg-white p-4 md:p-[18px] ring-1 ring-[#0a2540]/[0.05] shadow-[0_12px_32px_-18px_rgba(10,37,64,0.4)]">
        <div className="font-inter text-[11.5px] text-[#6b85a3]">Valeur retenue</div>
        <div className="mt-0.5 font-inter font-medium text-[21px] tracking-[-0.01em] text-[#1d4ed8]">473 106 €</div>
        <div className="mt-1 font-inter text-[10.5px] leading-snug text-[#6b85a3]">
          Actif net réévalué 424 040 €
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#3b82f6] px-3 py-1.5 font-inter font-semibold text-[9.5px] text-white">
            Enregistrer dans un Atlas
          </span>
          <span className="rounded-full bg-white px-3 py-1.5 font-inter font-semibold text-[9.5px] text-[#42506b] ring-1 ring-[#d5e2f6]">
            Ajuster
          </span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 rounded-[12px] bg-[#f4f8ff] px-3 py-2.5 ring-1 ring-[#bcd3f7]">
        <Play className="h-3.5 w-3.5 text-[#2563eb]" />
        <span className="font-inter font-semibold text-[11.5px] text-[#2563eb]">Présenter au client, plein écran</span>
      </div>
    </div>
  );
}

/**
 * MiniVisual — compose le bloc visuel d'une carte à sa largeur de DESSIN puis
 * le réduit à la largeur réelle de la carte. Sur téléphone uniquement ; sur
 * grand écran il rend ses enfants tels quels, l'arbre est inchangé.
 *
 * ── POURQUOI ────────────────────────────────────────────────────────────────
 * Depuis le 2026-08-10 la grille garde son agencement d'ordinateur à toutes
 * les largeurs (deux encadrés, puis trois, puis un). Une carte de tiers fait
 * donc ~110 px sur un téléphone. Les maquettes, elles, ne sont pas fluides :
 * nuages d'étiquettes posés en pourcentages, panneaux à corps fixes, scènes
 * composées à leur taille écran. Dans 110 px elles ne rétrécissaient pas,
 * elles se CHEVAUCHAIENT et débordaient de la carte (constaté en capture :
 * « Holding / SASU / SARL » empilés hors cadre).
 *
 * Réduire plutôt que reflouer, c'est exactement ce que fait déjà le MUR du
 * hero avec ses cellules (composées à WALL_SIDE_NAT, puis `transform:
 * scale()`), et pour la même raison. Le titre de la carte, lui, n'est PAS
 * réduit : il reste dans le repère de la carte, à une taille lisible. Une
 * carte de la grille est donc un titre lisible au-dessus d'une vignette
 * fidèle, pas une carte d'ordinateur photographiée de loin.
 *
 * `transform` et jamais `zoom` : le zoom déchire les sous-arbres à
 * positionnement absolu sous WebKit, leçon payée sur le mur du hero. Comme
 * transform ne participe pas à la mise en page, la boîte extérieure reçoit la
 * hauteur VISUELLE (naturelle × échelle), sans quoi la carte réserverait la
 * hauteur pleine.
 *
 * RepelChips reste juste : sa géométrie de curseur passe par
 * getBoundingClientRect, donc dans le même repère que le pointeur, transform
 * compris.
 */
function MiniVisual({ natural, children }: { natural: number; children: ReactNode }) {
  const [mobile, setMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ k: number; h: number } | null>(null);

  useLayoutEffect(() => {
    if (!mobile) return;
    const outer = outerRef.current, inner = innerRef.current;
    if (!outer || !inner) return;
    const compute = () => {
      const avail = outer.clientWidth;
      if (!avail) return;
      const k = avail / natural;
      // offsetHeight ignore les transforms : la hauteur naturelle reste juste
      // à chaque passage, le calcul est donc idempotent.
      setBox({ k, h: inner.offsetHeight * k });
    };
    let raf = 0;
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; compute(); });
    };
    compute();
    const ro = new ResizeObserver(schedule);
    ro.observe(outer);
    ro.observe(inner);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [mobile, natural]);

  if (!mobile) return <>{children}</>;

  return (
    <div ref={outerRef} className="relative w-full overflow-hidden" style={{ height: box?.h }}>
      <div
        ref={innerRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: natural,
          transformOrigin: "top left",
          // Avant la première mesure (une image, useLayoutEffect passant avant
          // la peinture) on pose déjà une échelle plausible plutôt que 0 :
          // une cellule à zéro clignoterait au montage.
          transform: `scale(${box?.k ?? 0.25})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** Largeur de DESSIN du bloc visuel selon le gabarit de la carte, c'est-à-dire
 *  la largeur qu'il occupe sur un écran d'ordinateur — c'est à cette largeur
 *  que les maquettes ont été composées et validées. */
const VISUAL_NAT: Record<"third" | "wide" | "full", number> = { third: 380, wide: 620, full: 780 };

function Mockup({ kind }: { kind: MockupKind }) {
  switch (kind) {
    case "home": return <OraHomeMockup plain />;
    case "prevision": return <PrevisionPanels />;
    case "reporting": return <ReportingMockup />;
    case "pointage": return <PointageMockup />;
    case "formatage": return <FormatageMockup />;
    case "previsionnel": return <PrevisionnelMockup />;
    case "evaluation": return <EvaluationMockup />;
    case "dossier": return <DossierPanels />;
    case "valuationCard": return <ValuationCard />;
    case "crm": return <CrmMockup />;
    case "organisation": return <OrganisationMockup />;
  }
}

export default function UseCasesBento({ openBooking }: { openBooking?: () => void }) {
  const { t } = useLang();
  const [detail, setDetail] = useState<BentoCase | null>(null);
  // Onglet actif de la carte pleine largeur. Un seul entier : une seule carte
  // en porte, inutile d'en faire une table.
  const [tab, setTab] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  // Chrome ne suspend pas une vidéo muette hors écran : lecture uniquement
  // quand la carte est réellement visible, poster jusque-là (même règle que
  // l'ancienne section, client 2026-08-04 : « démarre quand l'utilisateur
  // arrive dessus et pas avant »).
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const videos = [...grid.querySelectorAll("video")];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) void v.play().catch(() => {});
          else v.pause();
        }
      },
      { threshold: 0.35 },
    );
    videos.forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, []);

  // Coche commune à toutes les fiches : la promesse locale, déjà portée mot
  // pour mot par la page de téléchargement et la section confidentialité.
  const LOCAL = t({
    fr: "Traitement 100 % local, vos données restent chez vous",
    en: "100% local processing, your data stays with you",
  });

  const cases: BentoCase[] = [
    {
      // Titre BÉNÉFICE et non plus intitulé de fonction (client 2026-08-06).
      // Formule maison : la tâche, ce qu'elle devient, le temps libéré. « En
      // dehors de la production » est le vocabulaire des cabinets : tout ce
      // qui se fait hors du logiciel de production comptable.
      title: t({
        fr: "Gagnez des heures sur le travail répétitif qui vit en dehors de votre logiciel de production",
        en: "Save hours on the repetitive work that lives outside your production software",
      }),
      // Clip fourni par le client (« Final-Fec copie.mp4 »), REPEINT sur
      // canvas intégralement BLANC (repaint-white.py : famille
      // proportionnelle du fond #d0e2fa → blanc, ombres en gris neutre,
      // référence FIGÉE sur la première image).
      video: "/final-fec-white.mp4",
      poster: "/posters/final-fec-white.jpg",
      // Le PANNEAU montre, lui, le clip d'origine à canvas BLEU (le fichier
      // du client tel quel), posé sur le coussin dégradé bleu.
      detailVideo: "/final-fec-blue.mp4",
      detailPoster: "/posters/final-fec-blue.jpg",
      // « L'encadré dans l'encadré » : l'écran d'accueil du logiciel dans une
      // fenêtre navigateur, décalée à droite et rognée par les bords, comme
      // la page Roastery de la grande carte Stripe. Le clip repeint reste
      // servi par la lightbox (bouton d'agrandissement).
      appScene: true,
      span: "wide",
      detailDesc: t({
        fr: "Déposez le FEC légal de vos clients : Ora produit en un clic le classeur d'audit que vous composez, contrôles et mise en forme compris.",
        en: "Drop in your clients' legal FEC file: Ora produces the audit workbook you compose in one click, checks and formatting included.",
      }),
      detailChecks: [
        t({ fr: "Importez le FEC de vos clients, contrôlez son intégrité en quelques secondes", en: "Import your clients' FEC file and check its integrity in seconds" }),
        t({ fr: "Écritures atypiques repérées et documentées automatiquement", en: "Unusual entries flagged and documented automatically" }),
        t({ fr: "Le FEC légal (.txt) traité sans limite de lignes", en: "The legal FEC file (.txt) processed with no row limit" }),
        LOCAL,
      ],
      // Carte BLANCHE + nuances de bleu PARTIELLES (client 2026-08-06 :
      // « l'encadré doit être blanc, une légère nuance de bleu derrière qui
      // ne couvre pas l'intégralité »). Trois nappes, famille de marque, pas
      // de pervenche :
      //   · une BANDE DIAGONALE qui passe derrière la barre de la fenêtre —
      //     c'est elle qu'on voit à travers le verre translucide, comme
      //     l'orangé de la carte Stripe ;
      //   · le halo bleu montant du bas-gauche, éteint avant la mi-hauteur ;
      //   · la pointe de teal bas-droit.
      // La bande diagonale a été remplacée par une ELLIPSE BASSE ET LARGE
      // (client 2026-08-06 : « l'ombre bleue ne doit pas couper le texte mais
      // passer à côté »). Une `linear-gradient` traverse forcément toute la
      // carte, titre compris ; une ellipse se cale, elle, sous le titre, pile
      // à hauteur de la barre de la fenêtre — c'est là qu'on veut la voir, au
      // travers du verre. Le titre garde du blanc franc derrière lui.
      // Le bleu REMONTE de nouveau (client 2026-08-06, second passage) : la
      // place se prend sur le TITRE, pas sur le voile. Titre resserré en deux
      // lignes équilibrées dans un tiers de la carte → le halo peut escalader
      // le flanc gauche et l'ellipse monter à hauteur de barre de fenêtre sans
      // jamais croiser le texte.
      // ALLÉGÉ de moitié le 2026-08-06 (« mets moins d'ombre bleu ») : mêmes
      // trois nappes, mêmes places, opacités divisées par deux. L'ellipse
      // haute est en outre poussée vers la droite et vers le bas — le titre
      // vient de gagner en corps et en largeur, elle lui passait dessous.
      // LE BLEU DE « PRÉVISIONNEL », pour de bon. Reprendre ses teintes ne
      // suffisait pas : à 26 % d'opacité, #bfd1f7 se lit comme un gris bleuté,
      // pas comme le bleu franc de la carte voisine, dont le dégradé descend
      // en aplat jusqu'à #8e9cef. Les opacités sont donc à peu près doublées.
      // Les positions et les rayons, eux, restent inchangés au chiffre près :
      // c'était la consigne, « sans changer la surface couverte ».
      // ⚠ LE PAVÉ CI-DESSUS EST DE NOUVEAU EN VIGUEUR. Il avait été déclaré
      // caduc le 2026-08-07, le temps d'un passage en bleu vif intégral ; le
      // client est revenu dessus le jour même — « qu'il ait la couleur qui est
      // actuellement présente dans l'encadré Prévisionnel, elle ne couvrait pas
      // tout l'encadré mais seulement une petite partie du bas ». La carte
      // redevient donc BLANCHE (pas de `bg`, donc le blanc par défaut) et ce
      // sont ses trois nappes qui la colorent, aux valeurs exactes d'avant le
      // détour : la restauration ne réinvente rien.
      // Pas de `ink` non plus : le marine de la grille redevient lisible dès que
      // le fond n'est plus un aplat soutenu.
      // PERVENCHE REMPLACÉE PAR LE BLEU DE L'ANNEAU DE PARTICULES le 2026-08-07.
      // Ce sont ces trois nappes que le client appelle « les ombres bleues » de
      // la carte. Elles rejouent le sens de l'anneau : #3b82f6 sur l'ellipse
      // haute, #1d4ed8 sur le grand halo de pied et sur la pointe bas-droite.
      //
      // ⚠ LES OPACITÉS TOMBENT DE ~40 %, ET C'EST CE QUI REND L'ÉCHANGE POSSIBLE.
      // L'ancienne teinte de pied, #89b2f7, était un bleu déjà délavé ; #1d4ed8
      // est trois fois plus sombre. Aux opacités d'avant, le coin bas-gauche
      // serait devenu un aplat bleu franc sur une carte dont tout l'équilibre
      // tient au blanc derrière le titre. Les valeurs sont calculées pour que la
      // CLARTÉ composite ne bouge pas (0,52 de #89b2f7 et 0,27 de #1d4ed8
      // tombent tous deux sur rgb(194,·,·) au-dessus du blanc) : ce qui change
      // est la SATURATION, pas la masse. Places et rayons restent au chiffre
      // près, comme à chaque passage sur cette carte.
      wash:
        `radial-gradient(48% 28% at 76% 36%, rgba(${RING_BLUE.top},0.3) 0%, rgba(${RING_BLUE.top},0.15) 46%, rgba(255,255,255,0) 74%), radial-gradient(70% 92% at -6% 100%, rgba(${RING_BLUE.bot},0.27) 0%, rgba(${RING_BLUE.bot},0.14) 36%, rgba(255,255,255,0) 76%), radial-gradient(58% 40% at 84% 110%, rgba(${RING_BLUE.bot},0.11) 0%, rgba(255,255,255,0) 64%)`,
      // Corps et largeur propres à cette carte, mais GRAISSE COMMUNE : la
      // phrase est repassée en 400 comme tous les autres titres de la grille
      // (client 2026-08-07, « la même police que les autres titres »), après
      // un passage en 300 la veille. Le 300 d'Inter a été retiré du
      // chargement dans index.html, plus personne ne s'en sert.
      titleClass: "md:text-[1.72rem] md:max-w-[41rem] text-balance",
    },
    {
      // La carte à dégradé INTÉGRAL de la grille, comme celle de droite chez
      // Stripe. « Reporting mensuel » a cédé sa place à « Prévisionnel »
      // (client 2026-08-06) ; les deux cartes ont été ÉCHANGÉES, aucun cas
      // d'usage n'est perdu, « Reporting mensuel » occupe désormais le
      // créneau libéré plus bas dans la grille.
      title: t({ fr: "Prévisionnel", en: "Forecasting" }),
      poster: "/posters/ora_previsionnel.jpg",
      // Composition compteur + graphique à barres (PrevisionPanels), la copie
      // minimaliste de la tuile de facturation Stripe fournie en capture.
      mockup: "prevision",
      // LES DEUX PANNEAUX REMONTENT (client 2026-08-07 : « fais en sorte que
      // les deux encadrés soient un peu plus haut dans l'encadré »). Le débord
      // bas de la famille (-mb-9) ne servait à rien ici : mesuré, la maquette
      // s'arrêtait déjà 4 px AU-DESSUS du bord de la carte, elle ne saignait
      // pas. En le remplaçant par une marge positive, le bloc — calé en bas par
      // `mt-auto` — grandit vers le haut et emmène les panneaux avec lui, sans
      // toucher ni au gabarit de la carte ni à la hauteur de la rangée : les
      // 230 px de vide entre le titre et la maquette absorbent le mouvement.
      mockupClass: "-mx-3 md:-mx-5 mb-2 md:mb-2",
      span: "third",
      // Dégradé BLEU dominant qui garde un léger violet en pied (client :
      // « garde un léger violet pour celui de droite »).
      bg: FULL_PERI_BG,
      // Nuages blancs sur le dégradé, comme la carte GPT-Live de référence.
      wash: WASH.puffs,
      // Les « ombres bleu clair » : la maquette est détourée par une ombre
      // bleue, qui vit sur l'aplat teinté là où une ombre neutre s'éteindrait.
      // L'AUTRE « ombre bleue » des deux cartes du haut, passée elle aussi au
      // bleu de l'anneau le 2026-08-07. Elle y perd très peu : elle était déjà
      // sur #3b82f6, la tête de l'anneau, et seule la seconde passe change, de
      // #2563eb au #1d4ed8 du pied. Les deux couches suivent donc le même
      // dégradé que l'anneau, de sa tête à son pied.
      // Opacités d'origine CONSERVÉES, contrairement aux nappes de la carte
      // voisine : ici la teinte ne s'éclaircit ni ne s'assombrit, il n'y a rien
      // à compenser.
      mockGlow:
        `drop-shadow(0 18px 30px rgba(${RING_BLUE.top},0.34)) drop-shadow(0 4px 10px rgba(${RING_BLUE.bot},0.18))`,
      detailDesc: t({
        fr: "Le business plan se construit à partir de votre historique : hypothèses posées noir sur blanc, trajectoire sur plusieurs années, prête à présenter en rendez-vous.",
        en: "The business plan is built from your history: assumptions written out, a multi-year trajectory, ready to present in a meeting.",
      }),
      detailChecks: [
        t({ fr: "Le business plan se construit à partir de votre historique, hypothèses à l'appui", en: "The business plan is built from your history, assumptions made explicit" }),
        t({ fr: "Une trajectoire claire sur plusieurs années, prête à présenter", en: "A clear multi-year trajectory, ready to present" }),
        LOCAL,
      ],
    },
    {
      // « Réconciliation » devient « Bilan développé » (client 2026-08-06), le
      // module du logiciel qui donne un bilan à voir au lieu de le lire.
      title: t({ fr: "Bilan développé", en: "Detailed balance sheet" }),
      span: "third",
      tall: true,
      // Bleu plus PÂLE que ses deux voisines, mais étalé plus bas : c'est la
      // carte la plus légère de la rangée, et la plus bleue en surface.
      bg: "#ffffff",
      wash: SKY_BILAN,
      // ANNEAU WEBGL : le portage du shader Stripe, en bleu (client
      // 2026-08-06). CONSERVÉ tel quel — « je ne veux surtout pas que tu
      // enlèves le design de fond ». Seul le clip s'en va.
      // ANNEAU DE PARTICULES et nuage d'étiquettes, REMIS le 2026-08-07 après
      // un aller-retour : la carte-objet à la Stripe les avait remplacés une
      // heure durant, avant que le client ne tranche — « remets le design de
      // background qui était dans Bilan développé, il était super », et l'objet
      // part sur « Évaluation financière », à qui il était destiné.
      art: "gl",
      // DESCENDU de 42 à 52 % le 2026-08-07. L'alignement se mesurait sur les
      // étiquettes, centrées à 326 px comme celles des cartes voisines — mais
      // l'anneau, lui, était centré à 260, et c'est LUI qui donne la masse
      // visible. Le design paraissait donc plus haut alors que les chiffres
      // disaient l'inverse. À 52 %, anneau et étiquettes se superposent.
      artClass: "left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2",
      chips: BILAN_CHIPS(t),
      // Copie tirée du module tel qu'il se nomme dans le logiciel (« Bilan
      // imagé — le bilan en un coup d'œil », relevé sur la capture de l'app) :
      // ce que fait un bilan développé, sans promesse de performance.
      // Copie alignée sur les nouvelles étiquettes : les SIG et la lecture.
      detailDesc: t({
        fr: "Le bilan de votre client se regarde au lieu de se dérouler : marge, EBE, CAF, BFR et flux posés en grandes masses, avec la lecture qui va avec.",
        en: "Your client's balance sheet is looked at rather than scrolled: margin, EBITDA, cash flow and working capital laid out as big blocks, with the reading to go with them.",
      }),
      detailChecks: [
        t({ fr: "Les SIG en un coup d'œil : marge, valeur ajoutée, EBE, CAF", en: "Key indicators at a glance: margin, value added, EBITDA, cash flow" }),
        t({ fr: "BFR et flux de trésorerie mis en regard du bilan", en: "Working capital and cash flows set against the balance sheet" }),
        LOCAL,
      ],
    },
    {
      // Position au CENTRE de la rangée depuis le 2026-08-07 (« échange
      // d'emplacement Évaluation financière et Structure ») — l'historique
      // des échanges précédents vit dans le journal de bord des 06-07/08.
      title: t({ fr: "Évaluation financière", en: "Business valuation" }),
      // LA CARTE-OBJET à la Stripe (ValuationCard) : c'est CETTE carte que le
      // design visait, pas « Bilan développé » où il avait d'abord atterri
      // (client 2026-08-07). Un seul objet flottant au centre, beaucoup de
      // vide autour, la grosse ombre bleue centrale pour le poser.
      mockup: "valuationCard",
      // Le halo qui respire à contre-temps de la carte-objet (voir le bloc
      // ucbAura* dans SPECKLE_CSS).
      art: "aura",
      artClass: "inset-0",
      // Les panneaux compacts du dossier restent servis dans le PANNEAU : le
      // détail chiffré y a sa place, la carte non.
      detailMockup: "dossier",
      span: "third",
      tall: true,
      // CARTE BLANCHE, et c'est un choix qui a résisté à trois tentatives de
      // remplissage — voir le pavé de SKY_EVALUATION. Le dernier retour du
      // client, 2026-08-07 : « remets le background qu'il y avait avant, il y
      // avait moins de bleu en background de l'encadré et c'était mieux ». La
      // rampe pervenche reste donc réservée à ses deux voisines, « Prévisionnel »
      // et « Formatage », qui n'ont pas d'objet flottant à faire respirer.
      bg: "#ffffff",
      wash: SKY_EVALUATION,
      detailDesc: t({
        fr: "La valorisation est posée sur des multiples et des comparables explicites : vous ressortez avec une fourchette argumentée, chiffre par chiffre, prête à défendre face au client.",
        en: "Valuation rests on explicit multiples and comparables: you come out with a reasoned range, figure by figure, ready to defend with your client.",
      }),
      detailChecks: [
        t({ fr: "La valorisation posée sur des multiples et des comparables explicites", en: "Valuation grounded in explicit multiples and comparables" }),
        t({ fr: "Une fourchette argumentée, prête à défendre face au client", en: "A reasoned range, ready to defend with your client" }),
        LOCAL,
      ],
    },
    {
      // ⚠ CHANGEMENT DE SUJET, 2026-08-07. La carte s'appelait « Extraction »
      // (PDF → tableau Excel), renommée « Structure » le 06/08 sans que son
      // contenu bouge. En lui demandant des étiquettes « holding, SCI, SARL,
      // SASU, SAS, micro », le client la fait basculer sur un AUTRE module du
      // logiciel : « Changement de structure — comparatif avant / après »,
      // relevé sur la capture de l'app. Le clip d'extraction et sa copie s'en
      // vont donc avec l'ancien sujet ; les garder ferait promettre à la carte
      // une démo qui ne parle pas d'elle. Le cas d'usage « Extraction » n'est
      // plus présenté nulle part sur la page.
      // TITRE EXPLICITÉ le 2026-08-07 : « Structure, dit comme ça on ne comprend
      // pas ». Le mot seul nommait un module du logiciel, pas un service. La
      // formule suit celle de la grande carte — ce que le cabinet FAIT, pas ce
      // que l'outil contient : on chiffre chaque forme juridique pour pouvoir la
      // conseiller. Le verbe à l'impératif s'adresse à l'expert-comptable, et
      // « chiffres à l'appui » dit la simulation sans promettre un résultat.
      title: t({
        fr: "Conseillez la bonne structure, chiffres à l'appui",
        en: "Advise the right legal structure, with the figures to back it",
      }),
      span: "third",
      tall: true,
      bg: "#ffffff",
      wash: SKY_EXTRACTION,
      // GALAXIE À TROIS BRAS : le décor de « Bilan développé », mais en courbes au
      // lieu d'un anneau (« plusieurs petites qui forment comme une galaxie »).
      // Même composant, même shader, variante `galaxy`.
      art: "galaxy",
      artClass: "left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2",
      chips: STRUCTURE_CHIPS(t),
      // Copie tirée du module tel qu'il se nomme dans le logiciel
      // (« Changement de structure — Comparatif avant / après ») : ce que fait
      // le module, sans promesse chiffrée.
      detailDesc: t({
        fr: "Holding, SCI, SARL, SASU, SAS, micro-entreprise : la structure envisagée est posée à côté de l'actuelle, et le comparatif avant / après se lit poste par poste.",
        en: "Holding, property SPV, Ltd, LLC, Inc., sole trader: the structure under consideration is set beside the current one, and the before / after comparison reads line by line.",
      }),
      detailChecks: [
        t({ fr: "Le comparatif avant / après, forme juridique par forme juridique", en: "The before / after comparison, one legal form at a time" }),
        t({ fr: "La structure envisagée posée à côté de l'actuelle", en: "The structure under consideration set beside the current one" }),
        LOCAL,
      ],
    },
    {
      // Pleine largeur, le clone de « Intégrez les paiements directement dans
      // votre plateforme » : titre à gauche, visuel aux deux tiers droits.
      // Les hachures diagonales pervenche sont TOMBÉES le 2026-08-06 (« enlève
      // les designs de trait en diagonale »), et le halo passe au bleu.
      title: t({ fr: "Formatage pour logiciel métier", en: "Formatting for your software" }),
      video: "/final-fec.mp4",
      poster: "/posters/final-fec.jpg",
      mockup: "formatage",
      span: "full",
      // RETOUR AU BLANC ET AU HALO le 2026-08-07, après une demi-journée de
      // rampe pervenche pleine : « ça ne va pas niveau des couleurs, il faut que
      // le bleu soit moins intense et sur une partie plus restreinte ». Le
      // pourquoi est écrit au-dessus de SKY_FORMATAGE : sur la carte la plus
      // large de la page, une rampe verticale devient un aplat.
      bg: "#ffffff",
      wash: SKY_FORMATAGE,
      // Les deux ombres mobiles RESTENT : le client les avait demandées, et
      // elles gardent leur rôle sur un fond teinté — ce sont des variations de
      // lumière, pas des taches de couleur.
      art: "drift",
      artClass: "inset-0",
      detailDesc: t({
        fr: "Vos fichiers sortent au format attendu par votre logiciel métier : colonnes, séparateurs et libellés alignés sur sa maquette d'import, prêts à charger.",
        en: "Your files come out in the format your software expects: columns, separators and labels aligned with its import template, ready to load.",
      }),
      detailChecks: [
        t({ fr: "Vos fichiers sont mis au format attendu par votre logiciel, prêts à importer", en: "Your files are converted to the format your software expects, ready to import" }),
        t({ fr: "Colonnes, séparateurs et libellés alignés sur la maquette d'import", en: "Columns, separators and labels aligned with the import template" }),
        LOCAL,
      ],
      // ⚠ TROIS ONGLETS SANS VISUEL, et c'est délibéré (client 2026-08-07 :
      // « dans automatisation FEC ne mets rien dans l'encadré, ni dans
      // reporting mensuel »). Ils gardent leur titre et leur fiche ; la zone
      // du visuel reste vide en attendant un vrai design. Les clips existent
      // pourtant dans public/ — les remettre est une ligne chacun.
      //
      // ⚠ « Réconciliation » N'EST PAS dans la liste, et c'est délibéré
      // (client 2026-08-07 : « pour les automatisations qui n'ont pas de
      // design encore, ne mets rien »). Le seul clip disponible pour elle,
      // /ora_reconciliation.mp4, est documenté dans UseCases.tsx comme un
      // bouche-trou : c'est une démo de POINTAGE repeinte, pas une démo de
      // réconciliation. L'afficher sous ce nom ferait passer une automatisation
      // pour une autre. Le jour où le vrai clip existe, cinq lignes suffisent.
      //
      // Les automatisations que la grille avait perdues le 2026-08-06
      // (« supprime les encadrés en dessous de Formatage ») reviennent ici,
      // non plus en cartes mais en ONGLETS de celle-ci : la page ne s'allonge
      // pas d'un pouce et les cas d'usage sont de nouveau montrés. Maquettes,
      // clips et copie sont ceux d'origine, rien n'a été réécrit.
      tabs: [
        {
          title: t({ fr: "Formatage pour logiciel métier", en: "Formatting for your software" }),
          mockup: "formatage",
          video: "/final-fec.mp4",
          poster: "/posters/final-fec.jpg",
          detailDesc: t({
            fr: "Vos fichiers sortent au format attendu par votre logiciel métier : colonnes, séparateurs et libellés alignés sur sa maquette d'import, prêts à charger.",
            en: "Your files come out in the format your software expects: columns, separators and labels aligned with its import template, ready to load.",
          }),
          detailChecks: [
            t({ fr: "Vos fichiers sont mis au format attendu par votre logiciel, prêts à importer", en: "Your files are converted to the format your software expects, ready to import" }),
            t({ fr: "Colonnes, séparateurs et libellés alignés sur la maquette d'import", en: "Columns, separators and labels aligned with the import template" }),
            LOCAL,
          ],
        },
        {
          title: t({ fr: "Pointage des comptes", en: "Account matching" }),
          mockup: "pointage",
          video: "/ora_pointage_v4.mp4",
          poster: "/posters/ora_pointage_v4.jpg",
          detailDesc: t({
            fr: "Expertise comptable et révision : vos comptes sont pointés automatiquement, et la révision démarre sur des soldes déjà justifiés.",
            en: "Accounting and review: your accounts are matched automatically, and review starts from balances that are already justified.",
          }),
          detailChecks: [
            t({ fr: "Vos comptes sont pointés automatiquement, les écarts ressortent immédiatement", en: "Your accounts are matched automatically, discrepancies stand out immediately" }),
            t({ fr: "La révision démarre sur des soldes justifiés, sans pointage manuel", en: "Review starts from justified balances, no manual ticking" }),
            LOCAL,
          ],
        },
        {
          title: t({ fr: "Automatisation FEC", en: "FEC automation" }),
          detailDesc: t({
            fr: "Déposez le FEC légal de vos clients : Ora produit en un clic le classeur d'audit que vous composez, contrôles et mise en forme compris.",
            en: "Drop in your clients' legal FEC file: Ora produces the audit workbook you compose in one click, checks and formatting included.",
          }),
          detailChecks: [
            t({ fr: "Importez le FEC de vos clients, contrôlez son intégrité en quelques secondes", en: "Import your clients' FEC file and check its integrity in seconds" }),
            t({ fr: "Écritures atypiques repérées et documentées automatiquement", en: "Unusual entries flagged and documented automatically" }),
            t({ fr: "Le FEC légal (.txt) traité sans limite de lignes", en: "The legal FEC file (.txt) processed with no row limit" }),
            LOCAL,
          ],
        },
        {
          title: t({ fr: "Reporting mensuel", en: "Monthly reporting" }),
          detailDesc: t({
            fr: "Équipes finance et contrôle de gestion : le classeur est retraité, mis en forme et prêt à partager en un clic, le même livrable chaque mois.",
            en: "Finance and controlling teams: the workbook is cleaned, formatted and share-ready in one click, the same deliverable every month.",
          }),
          detailChecks: [
            t({ fr: "Le classeur est retraité, mis en forme et prêt à partager en un clic", en: "Your workbook is cleaned, formatted and share-ready in one click" }),
            t({ fr: "Envoi par mail automatique, le même livrable chaque mois", en: "Sent by email automatically, the same deliverable every month" }),
            LOCAL,
          ],
        },
      ],
    },
    // ── FIN DE LA GRILLE ────────────────────────────────────────────────
    // Client 2026-08-06 : « supprime les encadrés en dessous de Formatage
    // pour logiciel métier ». Sont tombées, dans l'ordre : Reporting mensuel
    // (maquette `reporting`, clip ora_reporting_v3), Connectivité CRM
    // (maquette `crm`, décor `speckles`), Pointage de comptes (maquette
    // `pointage`, clip ora_pointage_v4) et Organisation (maquette
    // `organisation`, décor `globe`).
    //
    // Rien d'autre n'a été touché : les maquettes, les clips, les décors et
    // leurs branches de rendu sont tous restés en place. Remettre une carte,
    // c'est réécrire ses cinq lignes ici, pas reconstruire son visuel.
    //
    // La grille tombe ainsi juste : 2+1 sur la première rangée, 1+1+1 sur la
    // deuxième, une pleine largeur en pied. Aucune case vide.
  ];

  return (
    <div className="relative mb-40 md:mb-56">
      <style>{SPECKLE_CSS}</style>
      {/* Header de section. */}
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
        {/* INTER sur le titre de section aussi (client 2026-08-06 : « applique
            cette police à absolument toute cette partie du site ») — même
            exception à la règle Poppins de CLAUDE.md que les titres de cartes,
            circonscrite à cette section. Graisse, chasse et encre calées sur
            le grand titre du panneau Stripe. */}
        {/* font-normal (client 2026-08-06, deuxième affinage : « affine la
            police, que ce soit plus fin ») — le grand corps porte la
            présence, la graisse 400 suffit. */}
        <h2 className="font-inter font-normal text-3xl md:text-[2.75rem] tracking-[-0.025em] leading-[1.1] text-[#0a2540] dark:text-white mt-4">
          {t({ fr: "Concrètement, ce qu'Ora peut automatiser", en: "Concretely, what Ora can automate" })}
        </h2>
      </motion.div>

      {/* ── TROIS COLONNES À TOUTES LES LARGEURS (client 2026-08-10) ────────
          La grille était `grid md:grid-cols-3` : une seule colonne sous
          768 px, donc les six cartes empilées l'une sous l'autre. Consigne :
          « je veux qu'on ait exactement la même vision que sur l'ordinateur,
          c'est-à-dire deux encadrés au début à côté, puis trois encadrés, puis
          un, puis un ». C'est exactement ce que produisent les gabarits
          existants dans une grille à trois colonnes — `wide` (2 col) + `third`
          en première rangée, trois `third` en deuxième, `full` (3 col) en
          troisième — il suffisait donc de ne plus attendre `md`.
          Les INTERNES des cartes, eux, sont recalés pour la largeur d'un
          téléphone (gouttière, marges, titres, hauteurs mini) : une carte de
          tiers y fait ~110 px, où les 28 px de marge et les 1,3 rem de titre
          du dessin d'origine ne laissaient plus rien à lire. */}
      <div ref={gridRef} className="grid grid-cols-3 gap-1.5 md:gap-5 max-w-[86rem] mx-auto">
        {cases.map((c0, i) => {
          const isFull = c0.span === "full";
          // La carte à onglets se rend comme n'importe quelle autre : on lui
          // substitue simplement le contenu de l'onglet actif. Tout le reste
          // du gabarit — fond, flèche, panneau, survol — n'a rien à savoir de
          // l'existence des onglets.
          const active = c0.tabs?.[Math.min(tab, c0.tabs.length - 1)];
          // Les trois champs de VISUEL sont réaffectés explicitement, et pas
          // seulement étalés : une clé absente de l'onglet ne remplace rien
          // dans un spread, si bien qu'un onglet sans maquette héritait de
          // celle de la carte. « Réconciliation », qui n'a qu'un clip,
          // affichait la maquette de « Formatage ».
          const c: BentoCase = active
            ? { ...c0, ...active, mockup: active.mockup, video: active.video, poster: active.poster }
            : c0;
          return (
            <motion.div
              key={c0.title}
              // ENTRÉE seule sur cette enveloppe Framer. Le SURVOL vit sur la
              // carte INTERNE, en CSS pur (4e itération, client 2026-08-06 :
              // « exactement comme sur Stripe, ultra smooth ») :
              //   · séparer les deux évite le conflit entre le transform en
              //     ligne laissé par Framer et le scale de survol ;
              //   · `transform-gpu` pré-promeut la carte en couche composite,
              //     donc AUCUNE re-rastérisation au moment où le survol
              //     démarre — c'était l'accroc perçu ;
              //   · scale, liseré et ombre partagent la MÊME durée et la même
              //     courbe : un seul mouvement, pas trois.
              className={`group relative ${
                c.span === "wide" ? "col-span-2" : isFull ? "col-span-3" : ""
              }`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={{
                hidden: { opacity: 0, y: 26 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: (i % 3) * 0.08 } },
              }}
            >
            <div
              className={`relative h-full overflow-hidden rounded-[7px] md:rounded-[14px] ring-1 ring-[#0a2540]/[0.08] shadow-[0_2px_10px_-6px_rgba(10,37,64,0.14)] transform-gpu transition-[transform,box-shadow] duration-[620ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.012] group-hover:ring-[#3b82f6]/55 group-hover:shadow-[0_18px_44px_-22px_rgba(10,37,64,0.26)] p-2.5 md:p-8 ${
                // Une SEULE classe de hauteur mini par carte : deux
                // `md:min-h-[…]` sur le même élément se départageraient par
                // l'ordre de la feuille de style, pas par celui du className.
                // Les hauteurs mini du téléphone gardent le RAPPORT de celles
                // du grand écran (560/480 et 620/480), pour que la rangée de
                // trois reste plus haute que celle de deux comme sur
                // ordinateur — c'est ce rapport qui fait la silhouette de la
                // grille, pas les valeurs absolues.
                isFull
                  ? ""
                  : c.span === "wide"
                    ? "flex flex-col min-h-[210px] md:min-h-[560px]"
                    : c.tall
                      ? "flex flex-col min-h-[232px] md:min-h-[620px]"
                      : "flex flex-col min-h-[180px] md:min-h-[480px]"
              }`}
              style={{ background: c.bg ?? "#ffffff" }}
            >
              {c.wash && (
                <div
                  aria-hidden
                  className={`pointer-events-none absolute inset-0 ${c.washMobileOnly ? "md:hidden" : ""}`}
                  style={{ background: c.wash }}
                />
              )}
              {c.art === "speckles" && (
                <AnimatedSpeckles className="pointer-events-none absolute left-1/2 top-[54%] w-[120%] aspect-square max-w-none -translate-x-1/2 -translate-y-1/2" />
              )}
              {c.art === "globe" && (
                // Planète pointillée en rotation lente, rognée par les bords
                // de la carte comme le globe de la carte Stripe. La position
                // vient de la carte (artClass).
                <AnimatedGlobe
                  className={`pointer-events-none absolute aspect-square max-w-none hidden md:block ${
                    c.artClass ?? "-left-14 -bottom-48 w-[520px]"
                  }`}
                />
              )}
              {c.art === "gl" && (
                // Anneau AGRANDI le 2026-08-07 (« agrandis un peu le design à
                // l'intérieur de Bilan développé ») puis ÉCLAIRCI le même jour
                // (« un peu moins de ronds ou bulles ») : le tiers des
                // particules est parti, la couronne reste dessinée mais
                // respire au lieu de mousser.
                <ParticleOrbGL
                  size={760}
                  count={7200}
                  className={`pointer-events-none absolute hidden md:block ${c.artClass ?? ""}`}
                />
              )}
              {c.art === "drift" && (
                // Deux nappes qui dérivent, l'une haute et l'autre basse.
                // Plus larges que la carte et débordant de tous les côtés :
                // une tache dont on devine le bord se lit comme une forme,
                // pas comme une ombre.
                <div aria-hidden className="pointer-events-none absolute inset-0 hidden overflow-hidden md:block">
                  {/* AUCUN `filter: blur` ici, et c'est le point : ces nappes
                      portaient un flou de 60 px EN PLUS de leur dégradé. Un
                      flou est re-rastérisé à chaque image dès que l'élément
                      bouge, et ces deux-là bougent en permanence sur la plus
                      large carte de la page. Le dégradé radial est déjà doux
                      par construction — le flou ne faisait que le payer une
                      seconde fois. Mesuré : le geler faisait tomber la charge
                      de la section de 44 %. */}
                  <div className="ucb-drift-a absolute -left-[22%] -top-[45%] h-[150%] w-[95%] rounded-full"
                    style={{ background: DRIFT_A }}
                  />
                  <div className="ucb-drift-b absolute -bottom-[50%] -right-[14%] h-[155%] w-[90%] rounded-full"
                    style={{ background: DRIFT_B }}
                  />
                </div>
              )}
              {c.art === "aura" && (
                // La nappe périodique de la carte-objet, rejouée à l'échelle
                // de l'encadré et très diluée. Même dégradé, mêmes arrêts,
                // même période : c'est ce qui fait qu'on lit UN mouvement et
                // non deux. Trois fois la hauteur, aucun bord dans le cadre.
                <div
                  aria-hidden
                  className={`pointer-events-none absolute overflow-hidden hidden md:block ${c.artClass ?? "inset-0"}`}
                  // MASQUÉ EN OVALE (client 2026-08-07 : « le background ne
                  // doit pas être entièrement bleuté, seulement le centre »).
                  // La nappe continue de défiler sur toute la hauteur — c'est
                  // ce qui garde le mouvement continu — mais on ne la voit
                  // qu'au milieu, et elle s'éteint bien avant les bords. Un
                  // masque plutôt qu'une nappe rétrécie : rétrécir la nappe
                  // ferait entrer ses bords dans le cadre et casserait la
                  // boucle.
                  // MASQUE RESSERRÉ le 2026-08-07, après un passage à 96 % × 66 %
                  // qui allait avec la vague pleine. Poussé à cette taille, il
                  // laissait la nappe atteindre presque tous les bords, et c'est
                  // une des deux raisons pour lesquelles la carte se retrouvait
                  // bleue partout. Il redescend à 80 % × 56 %, mais reste ancré
                  // à 58 % / 44 %, décalé le long de la diagonale : le ruban peut
                  // toujours monter vers le coin supérieur droit sans être
                  // décapité, et la consigne d'origine — « pas entièrement
                  // bleuté, seulement le centre » — retrouve son sens.
                  style={{
                    maskImage:
                      "radial-gradient(88% 62% at 58% 44%, #000 0%, rgba(0,0,0,0.78) 52%, transparent 90%)",
                    WebkitMaskImage:
                      "radial-gradient(88% 62% at 58% 44%, #000 0%, rgba(0,0,0,0.78) 52%, transparent 90%)",
                  }}
                >
                  <div
                    className="ucb-flow absolute left-0 w-full"
                    style={{ top: -AURA_STEP, height: `calc(100% + ${AURA_STEP * 3}px)`, background: AURA_FLOW }}
                  />
                  {/* La vague, PAR-DESSUS la nappe de couleur : elle doit se
                      détacher sur elle, pas se faire recouvrir. Deux tracés,
                      deux vitesses, le second à contresens.

                      EN DIAGONALE depuis le 2026-08-07, et l'inclinaison vit
                      sur une ENVELOPPE, pas sur le tracé : l'animation occupe
                      déjà la propriété `transform` du svg pour le faire
                      glisser, une rotation posée au même endroit l'écraserait.
                      Deux couches, deux rôles — la première incline, la
                      seconde translate. Le glissement suit donc la pente.

                      Les enveloppes débordent largement (-inset-[30%]) : une
                      bande inclinée dans un cadre à sa taille laisserait voir
                      ses angles rentrer dans la carte. Le débordement est
                      rogné par l'overflow du parent. */}
                  {/* PENTE TRIPLÉE et bande ÉVASÉE le 2026-08-07 : « il faut
                      qu'elle traverse vraiment en diagonale pour aller vers le
                      coin supérieur droit, tout en prenant plus de place plus
                      elle monte ». Les 13° et 7° d'avant se lisaient comme une
                      horizontale à peine penchée.

                      ⚠ L'ÉVASEMENT NE PEUT PAS ÊTRE DESSINÉ DANS LE TRACÉ. Le
                      motif doit rester identique sur 0-600 et 600-1200, c'est
                      cette périodicité qui permet à la translation de -50 % de
                      reboucler sans saut ; une bande qui s'élargit avec x est
                      par définition non périodique. L'évasement vit donc dans un
                      `clip-path` posé sur une couche FIXE, entre l'enveloppe
                      inclinée et le svg animé : la vague continue de défiler
                      dans son repère, et c'est la fenêtre qui s'ouvre.

                      Le coin bas-gauche du polygone est pincé à 12 % de hauteur,
                      le côté droit ouvert à 96 %. Comme le repère local est
                      incliné de -44°, son axe des x pointe vers le haut-droit :
                      la bande s'ouvre donc EN MONTANT, ce qui est la demande.

                      Les deux couches gardent des angles DIFFÉRENTS (-44° et
                      -33°) et l'écart est volontairement plus large qu'avant :
                      elles divergent en montant et l'ensemble s'évase une
                      seconde fois, par le jeu des deux tracés. */}
                  {/* DEUX RUBANS, plus deux bandes pleines. Le tracé fait
                      désormais un quart de l'épaisseur d'avant (voir WAVE_PATH),
                      et trois réglages achèvent le « tissu presque
                      transparent » :

                      1. LE CLIP EN POLYGONE EST PARTI. Il coupait la matière au
                         couteau, et un tissu n'a pas d'arête. Un masque en
                         dégradé le remplace : le ruban naît de rien en bas à
                         gauche et prend sa densité en montant. C'est le même
                         « plus il monte, plus il prend de place », obtenu par la
                         matière plutôt que par une découpe.
                      2. LES BORDS SONT FONDUS par un dégradé vertical posé DANS
                         le svg, en remplissage du tracé : transparent sur les
                         deux rives, dense au milieu. C'est ce qui fait la
                         translucidité d'une étoffe plutôt que l'aplat d'une
                         gommette. Un `filter: blur` aurait donné le même flou
                         mais serait re-rastérisé à chaque image, et ces deux
                         couches défilent en permanence.
                      3. LES OPACITÉS TOMBENT : 0,34 et 0,24 pleins deviennent
                         0,32 et 0,24 AU PIC d'un dégradé qui s'éteint sur ses
                         bords, soit bien moins de matière au total.

                      Les angles restent écartés (-42° et -34°) : les deux rubans
                      divergent en montant et se croisent, ce qui donne le pli. */}
                  <div className="absolute -inset-[30%] rotate-[-42deg]">
                    <div className="absolute inset-0" style={{ maskImage: SILK_FADE, WebkitMaskImage: SILK_FADE }}>
                      <svg
                        className="ucb-wave-a absolute left-0 top-[28%] h-[44%] w-[200%]"
                        viewBox="0 0 1200 200"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient id="ucbSilkA" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#93c5fd" stopOpacity="0" />
                            <stop offset="28%" stopColor="#93c5fd" stopOpacity="0.55" />
                            <stop offset="52%" stopColor="#bfdbfe" stopOpacity="0.8" />
                            <stop offset="76%" stopColor="#93c5fd" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {/* 0,4 → 0,56 le 2026-08-07 (« amplifie un peu plus »).
                            C'est l'opacité du TRACÉ qu'on monte, pas les arrêts
                            du dégradé : les rives doivent rester à zéro, sinon
                            le ruban reprend une arête et cesse d'être une
                            étoffe. Le pic passe donc de 0,32 à 0,45. */}
                        <path d={WAVE_PATH} fill="url(#ucbSilkA)" opacity="0.75" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute -inset-[30%] rotate-[-34deg]">
                    <div className="absolute inset-0" style={{ maskImage: SILK_FADE, WebkitMaskImage: SILK_FADE }}>
                      <svg
                        className="ucb-wave-b absolute left-0 top-[38%] h-[38%] w-[200%]"
                        viewBox="0 0 1200 200"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient id="ucbSilkB" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0" />
                            <stop offset="30%" stopColor="#60a5fa" stopOpacity="0.45" />
                            <stop offset="54%" stopColor="#93c5fd" stopOpacity="0.7" />
                            <stop offset="78%" stopColor="#60a5fa" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d={WAVE_PATH} fill="url(#ucbSilkB)" opacity="0.56" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
              {c.art === "galaxy" && (
                // ⚠ LA PLANÈTE A ÉTÉ ESSAYÉE ICI LE 2026-08-07, PUIS ÉCARTÉE
                // (« pour le design de planète oublie, remets la galaxie »).
                // La variante `planet` reste dans ParticleOrbGL — semis de
                // Fibonacci, bruit 3D, continents, rotation propre — et ne coûte
                // rien tant qu'aucune carte ne la demande : c'est une branche
                // d'uniforme, jamais prise. Y revenir tiendrait en un mot.
                //
                // Disque plus large que l'anneau et étoiles plus fines : une
                // galaxie se lit à sa surface, pas à la grosseur de ses points.
                // TROIS bras plutôt que deux : à deux, la spirale se lit comme
                // une paire de virgules ; à trois, comme plusieurs courbes qui
                // s'enroulent. Densité au même niveau que l'anneau voisin pour
                // que les deux cartes aient le même grain.
                <ParticleOrbGL
                  variant="galaxy"
                  arms={3}
                  // AGRANDIE et DISPERSÉE le 2026-08-07 : le disque déborde
                  // maintenant de la carte, et son halo est deux fois plus
                  // fourni — c'est lui qui donne l'étalement.
                  size={980}
                  count={12000}
                  radius={0.42}
                  // 5,4 → 6,4 le 2026-08-08 au soir (« un peu plus en forme de
                  // galaxie ») : l'exposant raréfie les particules que le bruit
                  // du shader envoie loin de leur bras. Avec le halo et la
                  // dispersion du semis resserrés en face (ParticleOrbGL), les
                  // trois courbes se dessinent au lieu de moutonner.
                  scatterPower={6.4}
                  pointSize={3.4}
                  // Le facteur porte sur les trois horloges à la fois, houle
                  // du bruit comprise — c'est elle, et non la rotation, qui
                  // donnait l'agitation désordonnée. Passé de 0,2 à 0,15 le
                  // 2026-08-07 : « un tout petit peu plus lent, pas beaucoup
                  // plus », après un premier réglage jugé assez bon.
                  motion={0.15}
                  className={`pointer-events-none absolute hidden md:block ${c.artClass ?? ""}`}
                />
              )}
              {c.art === "ribbon" && (
                <GradientRibbonGL
                  className={`pointer-events-none absolute hidden md:block ${c.artClass ?? ""}`}
                />
              )}
              {c.art === "aurora" && (
                <AnimatedAurora
                  seed={c.artSeed}
                  className={`pointer-events-none absolute aspect-square max-w-none hidden md:block ${c.artClass ?? ""}`}
                />
              )}
              {c.art === "orb" && (
                <AnimatedOrb
                  seed={c.artSeed}
                  tilt={c.artTilt}
                  className={`pointer-events-none absolute aspect-square max-w-none hidden md:block ${c.artClass ?? ""}`}
                />
              )}
              {c.hatch && (
                // Bande de hachures diagonales le long du bord haut-droit,
                // comme sur la carte « Intégrez les paiements » de Stripe.
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-2 right-0 h-24 w-[62%] hidden md:block"
                  style={{
                    background:
                      "repeating-linear-gradient(115deg, rgba(108,114,236,0.35) 0 2px, transparent 2px 9px)",
                    maskImage: "linear-gradient(200deg, #000 30%, transparent 78%)",
                    WebkitMaskImage: "linear-gradient(200deg, #000 30%, transparent 78%)",
                  }}
                />
              )}

              {/* Flèche d'agrandissement, épinglée au coin comme Stripe. Sur
                  TOUTES les cartes depuis le 2026-08-06, et toutes ouvrent le
                  même panneau de présentation — plus de lightbox vidéo nue.
                  Style DISCRET et unique : les trois variantes d'avant (carré
                  bleu plein, carré pervenche plein, carré pâle) mettaient trois
                  aplats de couleur différents dans les coins d'une même rangée.
                  Ici, un verre blanc à liseré fin qui ne se réveille qu'au
                  survol de la carte. */}
              <button
                type="button"
                onClick={() => setDetail(c)}
                aria-label={t({ fr: "En savoir plus", en: "Learn more" })}
                // Sur téléphone la carte de tiers fait ~110 px : le bouton de
                // 36 px calé à 24 px du bord en occupait le quart. Réduit à
                // 22 px calé à 8 px, il reste le même objet, à l'échelle de
                // la carte. Sa zone tactile est inférieure aux 44 px de la
                // grille de recette, et c'est assumé : la carte ENTIÈRE ouvre
                // le même panneau au toucher, ce bouton n'est qu'un repère
                // visuel doublant une cible déjà large.
                className="absolute top-2 right-2 md:top-7 md:right-7 z-10 inline-flex items-center justify-center w-[22px] h-[22px] md:w-9 md:h-9 rounded-[6px] md:rounded-[9px] bg-white/70 text-[#0a2540]/55 ring-1 ring-[#0a2540]/[0.1] shadow-[0_1px_3px_-1px_rgba(10,37,64,0.12)] transition-all duration-200 group-hover:bg-white group-hover:text-[#3b82f6] group-hover:ring-[#3b82f6]/30 hover:!bg-white hover:!text-[#2563eb] hover:ring-[#3b82f6]/50 hover:scale-[1.06] active:scale-[0.97]"
              >
                <Maximize2 className="w-[11px] h-[11px] md:w-[15px] md:h-[15px]" />
              </button>

              {isFull ? (
                /* Rangée entière : titre à gauche, visuel aux deux tiers
                   droits qui saigne vers les bords bas et droit.
                   Ce partage vaut à TOUTES les largeurs depuis le 2026-08-10 :
                   c'est lui qui fait le « puis un » du client, une bande où le
                   texte tient le tiers gauche et la maquette déborde à droite.
                   Empilé, ce n'était plus la même rangée. */
                <div className="relative grid grid-cols-[1fr_1.8fr] gap-2.5 md:gap-10 items-center">
                  <h3
                    className="font-inter font-normal text-[0.82rem] md:text-[1.85rem] tracking-[-0.025em] leading-[1.15] pr-6 md:pr-0"
                    style={{ color: c.ink ?? INK }}
                  >
                    {c.title}
                  </h3>
                  {/* Largeur bornée : les scènes de maquette se mettent à
                      l'échelle de leur conteneur, et à 1,8fr pleine largeur la
                      carte devenait démesurément haute (surtout Organisation,
                      dont la scène est plus haute que large). */}
                  {/* CONTRE-ÉCHELLE (client 2026-08-07 : « le design à
                      l'intérieur ne s'agrandit pas, uniquement l'encadré et le
                      texte »). 0,98814 = 1 / 1,012, l'inverse exact du
                      grossissement de la carte : les deux se compensent et la
                      maquette garde sa taille écran au pixel près pendant que
                      le cadre et le titre, eux, grossissent. Même durée et même
                      courbe que la carte, sinon la compensation se ferait avec
                      un temps de retard et le visuel respirerait. */}
                  <div className="relative w-full md:max-w-[780px] md:ml-auto md:-mr-4 md:-mb-4 transition-transform duration-[620ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-[6px] group-hover:scale-[0.98814]">
                    <MiniVisual natural={VISUAL_NAT.full}>
                    {c.mockup ? (
                      <Mockup kind={c.mockup} />
                    ) : !c.video ? (
                      /* NI MAQUETTE NI CLIP : on ne rend rien. Sans ce
                         garde-fou, un onglet sans visuel produisait un
                         <video src="null"> — un rectangle vide au ratio 16/9,
                         avec son liseré et son ombre. « Ne mets rien » veut
                         dire rien, pas un cadre vide.

                         ⚠ LE VIDE EST AU RAPPORT DE LA MAQUETTE, ET C'EST CE
                         QUI TIENT LA TAILLE DE LA CARTE (client 2026-08-07 :
                         « fais en sorte que les boutons amènent toujours à un
                         encadré de même taille »). Les deux `min-h` d'avant
                         donnaient 300 px là où les maquettes en produisent 435 :
                         mesurée, la carte tombait de 543 à 408 px d'un onglet à
                         l'autre, soit un saut de 135 px sous le curseur au
                         moment même où l'on clique.

                         `aspect` et non une hauteur fixe : les maquettes se
                         mettent à l'échelle de leur largeur en gardant leur
                         rapport — vérifié à 1440 et à 1100 px de fenêtre, 1,793
                         dans les deux cas. Une hauteur en dur n'aurait tenu
                         qu'à une seule largeur d'écran ; le rapport tient à
                         toutes. 780/435 est le gabarit relevé sur la maquette
                         de « Formatage », pas un chiffre choisi. */
                      <div className="w-full aspect-[780/435]" />
                    ) : (
                      /* MÊME RAPPORT que la maquette et que le vide, et non plus
                         `aspect-video`. Les 16/9 en différaient de 0,8 %, quatre
                         pixels de haut : invisible seul, mais ce serait un
                         troisième gabarit dans une rangée d'onglets qui doivent
                         tous rendre la même carte. `object-cover` absorbe l'écart
                         sans déformer l'image. */
                      <video
                        src={c.video}
                        poster={c.poster}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        className="w-full aspect-[780/435] object-cover block rounded-[10px] ring-1 ring-[#0a2540]/[0.08] shadow-[0_16px_40px_-20px_rgba(10,37,64,0.35)]"
                      />
                    )}
                    </MiniVisual>
                  </div>
                </div>
              ) : (
                <>
                  {/* Titre à 0,72 rem sous md (11,5 px) : une carte de tiers
                      fait ~118 px de large sur un téléphone, où 1,3 rem ne
                      posait plus qu'un mot par ligne. Le `pr` doit dégager le
                      bouton d'agrandissement (22 px calés à 8 px du bord, soit
                      30 px) : à 28 px de réserve, « Prévisionnel » — le plus
                      long mot insécable de la grille — tient dans les 70 px
                      restants. Les deux valeurs vont ensemble, toucher à l'une
                      demande de revérifier ce mot-là. */}
                  <h3
                    className={`relative font-inter font-normal text-[0.72rem] md:text-[1.5rem] tracking-[-0.025em] leading-[1.2] md:leading-[1.15] pr-7 md:pr-14 ${c.titleClass ?? ""}`}
                    style={{ color: c.ink ?? INK }}
                  >
                    {c.title}
                  </h3>
                  {/* Bloc visuel CENTRÉ sur les cartes allongées : à
                      `mt-auto`, les 140 px gagnés en hauteur s'accumulaient
                      tous au-dessus du visuel et la carte semblait creuse.
                      Réparti de part et d'autre, le vide se lit comme de
                      l'air. Les cartes de gabarit normal gardent leur visuel
                      collé en bas, qui déborde du bord. */}
                  {/* LÉGER SOULÈVEMENT AU SURVOL (client 2026-08-07 : « il
                      faut que les designs soient légèrement animés quand on
                      passe le curseur dessus »). Six pixels, la même courbe et
                      la même durée que le grossissement de la carte : les deux
                      mouvements se lisent comme un seul. `transform-gpu` évite
                      que le visuel soit re-rastérisé au démarrage du survol —
                      c'est ce qui faisait l'accroc sur la carte elle-même.
                      Les nuages d'étiquettes en sont exclus : ils ont déjà
                      leur propre réaction au curseur, et la superposer
                      décalerait leur point d'ancrage. */}
                  <div
                    className={`relative ${
                      // PADDING SYMÉTRIQUE sur les cartes allongées. `my-auto`
                      // centre le BLOC, or le bloc portait 32 px de padding en
                      // haut et rien en bas : son contenu se retrouvait poussé
                      // vers le bas, mesuré à +20, +31 et +48 px selon la
                      // carte. Avec `py`, le centre du bloc et celui du
                      // contenu coïncident. Les cartes de gabarit normal
                      // gardent `pt` seul : leur visuel déborde par le bas,
                      // une marge basse l'en empêcherait.
                      c.tall ? "py-2.5 md:py-8 my-auto" : "pt-2.5 md:pt-8 mt-auto"
                    } ${
                      /* PAS de `transform-gpu` ici. La carte parente en a un,
                         justifié : il évite qu'elle soit re-rastérisée au
                         démarrage du survol. Le répéter sur chaque bloc visuel
                         doublait le nombre de couches composites permanentes
                         de la section pour un mouvement qui n'existe QU'AU
                         survol — le navigateur promeut l'élément tout seul à
                         ce moment-là. */
                      /* CONTRE-ÉCHELLE sur TOUS les blocs visuels, nuages
                         d'étiquettes compris (client 2026-08-07 : « le design à
                         l'intérieur ne s'agrandit pas, uniquement l'encadré et
                         le texte »). 0,98814 = 1 / 1,012, l'inverse exact du
                         grossissement de la carte : les deux transformations se
                         compensent, le visuel garde sa taille écran au pixel
                         près. Seul le SOULÈVEMENT reste réservé aux visuels
                         fixes — les étiquettes ont déjà leur propre réaction au
                         curseur et un décalage vertical fausserait leur point
                         d'ancrage. Un changement d'échelle, lui, ne le fausse
                         pas : RepelChips lit le cadre hôte au
                         `getBoundingClientRect`, donc dans le même repère que
                         le curseur. */
                      c.chips
                        ? "transition-transform duration-[620ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[0.98814]"
                        : "transition-transform duration-[620ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-[6px] group-hover:scale-[0.98814]"
                    }`}
                  >
                    {/* CADRE DE CENTRAGE COMMUN aux cartes allongées (client
                        2026-08-07 : « aligne les designs au centre pour les
                        trois cartes »). Sans lui, chaque visuel se centrait
                        selon SA propre construction — un nuage d'étiquettes
                        réparti en pourcentages, un objet à hauteur fixe — et
                        les trois retombaient à des hauteurs différentes, de
                        +4 à +32 px, mesuré. Une boîte de hauteur identique où
                        tout est centré, et les trois s'alignent. */}
                    {/* Le cadre de centrage garde sa hauteur de DESSIN (380 px)
                        à toutes les largeurs : sur téléphone il vit à
                        l'intérieur de MiniVisual, dans le repère naturel, et
                        c'est l'échelle qui le ramène à la taille de la carte. */}
                    <MiniVisual natural={c.span === "wide" ? VISUAL_NAT.wide : VISUAL_NAT.third}>
                    <div className={c.tall ? "flex h-[380px] w-full items-center justify-center" : "contents"}>
                    {c.chips ? (
                      /* Le nuage occupe la zone du visuel. Hauteur fixée : les
                         étiquettes sont en position absolue, sans elle le
                         conteneur serait plat. */
                      <RepelChips chips={c.chips} className="h-full w-full" />
                    ) : c.appScene ? (
                      /* LA SCÈNE DU HERO, à l'identique (client 2026-08-07 :
                         « réplique le design de la réplication du logiciel du
                         haut de la page, je veux exactement la même netteté »).
                         Ce n'est plus une seconde maquette écrite pour la
                         carte : c'est le même composant, OraAppScene.

                         Rendue à l'échelle 1, donc avec ses corps de texte
                         réels, et ROGNÉE par la carte — la seule façon d'avoir
                         la netteté du hero dans un cadre trois fois plus petit.
                         Le débordement à droite et en bas est la composition
                         voulue, celle des fenêtres débordantes de Stripe.

                         Hauteur du cadre : ~470 px de scène sur 720, ce qui
                         descend jusqu'au rang « Accès rapide » et au titre
                         « Reprendre ». Elle sert aussi à REMONTER la fenêtre :
                         le bloc visuel est en `mt-auto`, donc plus il est haut,
                         moins il reste de vide entre le titre et lui. */
                      <div className="-mx-3 md:mx-0 md:ml-[86px] md:-mr-[104px] -mb-8 md:-mb-14">
                        <div className="h-[300px] md:h-[470px]">
                          {/* `chips="in"` : les trois livrables sortants sont
                              ancrés au bord DROIT de la scène, très au-delà de
                              la carte. Seule l'entrée reste à l'écran. */}
                          <OraAppScene cropScale={0.86} chips="in" />
                        </div>
                      </div>
                    ) : c.mockup ? (
                      <div
                        // Les marges NÉGATIVES font déborder la maquette des
                        // bords de la carte : c'est voulu sur les cartes de
                        // gabarit normal, dont le visuel est collé en bas.
                        // Sur une carte allongée, le visuel est CENTRÉ, et un
                        // `-mb-9` y décale l'objet de 18 px vers le bas — la
                        // moitié de la marge — ce qui désalignait « Évaluation
                        // financière » de ses deux voisines.
                        className={c.tall ? "" : c.mockupClass ?? "-mx-3 md:-mx-5 -mb-8 md:-mb-9"}
                        style={c.mockGlow ? { filter: c.mockGlow } : undefined}
                      >
                        <Mockup kind={c.mockup} />
                      </div>
                    ) : c.video ? (
                      <video
                        src={c.video}
                        poster={c.poster}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        className="w-full aspect-video object-cover block rounded-[10px] ring-1 ring-[#0a2540]/[0.08] shadow-[0_16px_40px_-20px_rgba(10,37,64,0.35)]"
                      />
                    ) : null}
                    </div>
                    </MiniVisual>
                  </div>
                </>
              )}
            </div>

            {/* LES AUTRES AUTOMATISATIONS, en boutons sous la carte (client
                2026-08-07). Sous et non dedans : la carte garde sa
                composition Stripe, titre à gauche et visuel à droite, qu'une
                barre d'onglets à l'intérieur aurait déséquilibrée.
                `aria-pressed` plutôt qu'un rôle d'onglet : ces boutons
                changent le contenu d'une carte voisine, ils ne coiffent pas
                un panneau au sens ARIA. */}
            {c0.tabs && (
              <div className="mt-4 flex flex-wrap justify-center gap-2 md:mt-5 md:gap-2.5">
                {c0.tabs.map((tb, ti) => {
                  const on = ti === Math.min(tab, c0.tabs!.length - 1);
                  return (
                    <button
                      key={tb.title}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setTab(ti)}
                      // ACTIF = un LISERÉ bleu fin, pas un aplat (client
                      // 2026-08-07). Le fond reste blanc dans les deux états :
                      // seuls le liseré et l'encre changent, ce qui évite le
                      // saut de contraste d'un bouton qui se remplit.
                      className={`rounded-full bg-white px-4 py-2 font-inter text-[13px] font-medium ring-1 transition-all duration-300 md:px-5 md:py-2.5 md:text-[13.5px] ${
                        on
                          ? "text-[#2563eb] ring-[#3b82f6] shadow-[0_4px_14px_-8px_rgba(59,130,246,0.6)]"
                          : "text-[#42506b] ring-[#0a2540]/[0.1] hover:text-[#2563eb] hover:ring-[#3b82f6]/40"
                      }`}
                    >
                      {tb.title}
                    </button>
                  );
                })}
              </div>
            )}
            </motion.div>
          );
        })}
      </div>

      {detail && (
        <CaseDetailOverlay
          item={detail}
          onClose={() => setDetail(null)}
          onBook={openBooking}
        />
      )}
    </div>
  );
}

// ── Panneau de présentation — le grand encadré modal de stripe.com ──────────
// Fond bleuté par-dessus la page, grande feuille blanche arrondie : titre et
// texte à gauche, liste à coches à droite, boutons, et le visuel posé en
// dessous sur un coussin dégradé. Toute la copie vient de textes déjà validés
// ailleurs sur le site (fiches de UseCases.tsx, promesse locale) — rien
// d'inventé.
//
// GÉNÉRIQUE depuis le 2026-08-06 : c'était `FecDetailOverlay`, avec la copie
// FEC en dur, ouvert par la seule grande carte. Les six cartes l'ouvrent
// maintenant, chacune avec ses `detailDesc` / `detailChecks`, et le pavé du bas
// sert ce que la carte possède réellement : son clip s'il en existe un, sinon
// sa maquette vivante, sinon son nuage d'étiquettes. Aucune carte ne se voit
// attribuer une démo qui n'est pas la sienne — la règle de fond du client.
function CaseDetailOverlay({
  item,
  onClose,
  onBook,
}: {
  item: BentoCase;
  onClose: () => void;
  onBook?: () => void;
}) {
  const { t } = useLang();
  const videoRef = useRef<HTMLDivElement>(null);

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

  const clip = item.detailVideo ?? item.video;

  return createPortal(
    // FOND UNI (client 2026-08-07 : « EXACTEMENT de la couleur du screen »).
    // #e8eef6 est la valeur lue sur l'aplat fourni — bleu-gris très pâle.
    // Une seule couleur, pleine opacité : le dégradé et le flou d'arrière-plan
    // sont partis avec elle, un fond opaque n'a rien à laisser deviner.
    <motion.div
      className="fixed inset-0 z-[80] overflow-y-auto p-4 md:p-10"
      style={{ background: "#e8eef6" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.26, ease: "easeOut" }}
      onClick={onClose}
    >
      {/* La feuille MONTE DEPUIS LE BAS de l'écran. */}
      <motion.div
        className="relative mx-auto my-4 md:my-8 w-full max-w-[1120px] rounded-[14px] bg-white p-7 md:p-14 shadow-[0_50px_130px_-45px_rgba(10,37,64,0.5)]"
        initial={{ y: 420, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Carré pâle au coin, radius court : le bouton de fermeture Stripe. */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-5 right-5 md:top-8 md:right-8 inline-flex h-11 w-11 items-center justify-center rounded-[8px] bg-[#e7effd] text-[#3b82f6] transition-colors hover:bg-[#d8e6fb]"
        >
          <X className="h-[19px] w-[19px]" />
        </button>

        <div className="grid gap-8 md:grid-cols-[1.1fr_1fr] md:gap-14">
          <div>
            {/* Corps du titre selon sa LONGUEUR : « Structure » ou « Bilan
                imagé » veulent la pleine échelle du panneau Stripe, mais la
                phrase-bénéfice de la grande carte y tenait quatre lignes et
                repoussait tout le reste sous la ligne de flottaison. */}
            <h2
              className={`font-inter font-normal leading-[1.12] tracking-[-0.025em] text-[#0a2540] pr-12 md:pr-4 ${
                item.title.length > 40 ? "text-[1.55rem] md:text-[2.05rem]" : "text-[1.9rem] md:text-[2.6rem]"
              }`}
            >
              {item.title}
            </h2>
            <p className="mt-5 font-inter text-[16px] md:text-[17px] leading-[1.6] text-[#425466] max-w-[32rem]">
              {item.detailDesc}
            </p>
            {/* Boutons à angles COURTS, comme ceux du panneau Stripe (le reste
                du site est en pastilles ; ici on copie la référence). */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBook?.();
                }}
                className="inline-flex items-center gap-2 rounded-[6px] bg-[#3b82f6] hover:bg-[#2563eb] px-6 py-3.5 font-inter font-semibold text-[15px] text-white transition-colors"
              >
                {t({ fr: "Réserver un appel", en: "Book a call" })}
                <ArrowRight className="h-4 w-4" />
              </button>
              {/* Libellé HONNÊTE : « Voir la démo » seulement quand un vrai
                  clip existe, sinon le pavé du bas montre la maquette. */}
              <button
                type="button"
                onClick={() => videoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
                className="inline-flex items-center rounded-[6px] border border-[#d5e2f6] bg-white px-6 py-3.5 font-inter font-semibold text-[15px] text-[#3b82f6] transition-colors hover:bg-[#f4f8fe]"
              >
                {clip
                  ? t({ fr: "Voir la démo", en: "Watch the demo" })
                  : t({ fr: "Voir l'aperçu", en: "See the preview" })}
              </button>
            </div>
          </div>

          {/* `pr` : la première coche passe sous la croix de fermeture sinon. */}
          <ul className="space-y-4 md:pt-2 pr-12 md:pr-16">
            {item.detailChecks.map((c) => (
              <li key={c} className="flex items-start gap-3 font-inter text-[15px] md:text-[16px] leading-snug text-[#425466]">
                <span className="mt-[3px] flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full bg-[#e7effd]">
                  <Check className="h-3 w-3 text-[#3b82f6]" strokeWidth={3} />
                </span>
                {c}
              </li>
            ))}
          </ul>
        </div>

        {/* Deux tuiles à dégradé en pied, la disposition exacte du panneau
            Stripe : la grande à gauche porte le visuel, la petite à droite
            porte une affirmation en gros caractères. */}
        <div className="mt-10 md:mt-14 grid gap-4 md:gap-5 md:grid-cols-[1.62fr_1fr]">
          <div
            ref={videoRef}
            className="rounded-[12px] p-3 md:p-6"
            style={{ background: "linear-gradient(135deg, #c3daf8 0%, #dfeafc 52%, #d9eeea 100%)" }}
          >
            {/* Ce que la carte possède RÉELLEMENT, dans cet ordre : son clip
                (pour FEC, c'est la version à canvas bleu, « celle sans le
                background blanc »), à défaut sa maquette vivante, à défaut son
                nuage d'étiquettes. Jamais la démo d'une autre carte. */}
            {clip ? (
              <video
                src={clip}
                poster={item.detailPoster ?? item.poster}
                autoPlay
                loop
                muted
                controls
                playsInline
                className="w-full aspect-video rounded-[8px] bg-white shadow-[0_22px_54px_-26px_rgba(10,37,64,0.45)]"
              />
            ) : (
              <div className="overflow-hidden rounded-[8px] bg-white p-3 md:p-4 shadow-[0_22px_54px_-26px_rgba(10,37,64,0.45)]">
                {(item.detailMockup ?? item.mockup) ? (
                  <Mockup kind={(item.detailMockup ?? item.mockup)!} />
                ) : item.chips ? (
                  <RepelChips chips={item.chips} className="h-[260px] md:h-[300px]" />
                ) : null}
              </div>
            )}
          </div>
          {/* Affirmation DÉJÀ portée par le site (page de téléchargement,
              section confidentialité) : aucun chiffre de performance inventé. */}
          <div
            className="flex flex-col justify-center rounded-[12px] p-8 md:p-9"
            style={{ background: "linear-gradient(150deg, #dbe9fb 0%, #cfe4f6 46%, #d5efe8 100%)" }}
          >
            <div className="font-inter font-medium text-[2.6rem] md:text-[3.4rem] leading-none tracking-[-0.03em] text-[#1d4ed8]">
              {t({ fr: "100 % local", en: "100% local" })}
            </div>
            <p className="mt-4 font-inter text-[15px] md:text-[16px] leading-snug text-[#33507a]">
              {t({
                fr: "Vos fichiers sont traités sur votre poste. Ils ne partent sur aucun serveur.",
                en: "Your files are processed on your machine. They never reach a server.",
              })}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
