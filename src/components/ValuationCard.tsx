import { useEffect, useRef } from "react";

/**
 * ValuationCard — la valorisation réduite à UN OBJET, posé au centre de sa
 * carte. Reprise de la composition de la carte « Créez votre propre programme
 * d'émission de cartes » de stripe.com, fournie par le client le 2026-08-07 :
 * un seul objet en portrait, flottant, occupant à peine la moitié de la
 * largeur, une surface entièrement en dégradé, une ombre longue et douce
 * dessous, deux petites marques seulement. Tout le reste est du vide — c'est
 * lui qui rend l'objet précieux.
 *
 * A D'ABORD ÉTÉ UN BILAN (actif / passif en deux colonnes égales), posé sur la
 * carte « Bilan développé ». Le client l'a redirigé vers « Évaluation financière »,
 * puis demandé « des éléments de valorisation en gardant le même design ». Le
 * traitement graphique est donc INTACT — dégradé, irisation, arrondi, ombre,
 * survol — et seul le propos change :
 *
 *   · le grand chiffre n'est plus l'exercice mais la VALEUR RETENUE ;
 *   · les deux colonnes empilées deviennent CINQ BARRES, une par approche de
 *     valorisation, de hauteurs inégales — c'est le « football field » des
 *     notes de valorisation, réduit à sa silhouette ;
 *   · un filet horizontal en pointillé traverse les cinq : la valeur retenue,
 *     qui n'est aucune des approches mais leur combinaison. C'est exactement
 *     ce que dit le sous-titre du module dans le logiciel, « cinq approches
 *     combinées », et c'est ce que le dessin doit faire comprendre sans une
 *     phrase.
 *
 * Le dégradé est SOUTENU : sur des bleus pâles, des barres blanches à 30 %
 * seraient indistinctes les unes des autres. Il faut du fond pour qu'un blanc
 * dilué se lise comme tel.
 *
 * ⚠ UN PASSAGE EN PERVENCHE CLAIRE A ÉTÉ TENTÉ ET ANNULÉ le 2026-08-07. L'objet
 * avait pris #b1c2f5 → #8e9cef, la couleur d'une capture du client, et toute
 * son encre avait basculé au marine — obligatoire, le blanc tombait à 2,6:1 sur
 * cette pervenche. Le client est revenu dessus dans la foulée. Si la demande
 * revient : c'est le COUPLE fond clair + encre marine qu'il faut reprendre, pas
 * le fond seul, sous peine d'un objet illisible.
 *
 * Palette de marque : bleu #3b82f6, pervenche, teal #2dd4bf. Le rose et le
 * corail de la référence n'ont pas de place ici ; l'irisation vient des
 * balayages blancs en diagonale, pas d'un écart de teinte.
 *
 * CHIFFRES : « 473 106 € » et « cinq approches combinées » sont relevés sur
 * les captures de l'application. Les hauteurs de barres, elles, sont des
 * proportions de DESSIN et ne portent aucun libellé chiffré : donner cinq
 * montants inventerait la valorisation d'un client.
 */

/* ── LA BASCULE DES DEUX COULEURS ─────────────────────────────────────────
 * Client 2026-08-07, après deux essais écartés : « pas des formes qui bougent,
 * mais les couleurs qui bougent entre elles, une qui prend le pas sur
 * l'autre ». Et le fond de la carte hôte réplique ce mouvement.
 *
 * Les deux essais précédents ratés, et pourquoi :
 *   1. un fondu entre deux dégradés proches — la frontière bleu/vert ne
 *      bougeait que de quelques pour cent, invisible ;
 *   2. trois taches floues qui dérivent — on voyait passer des OBJETS sur la
 *      carte, exactement ce que le client ne veut pas.
 *
 * La bonne réponse ne déplace rien À L'INTÉRIEUR du cadre : elle fait défiler
 * le dégradé LUI-MÊME derrière une fenêtre fixe. Une nappe de trois fois la
 * hauteur de la carte, dont le dégradé est PÉRIODIQUE — bleu, teal, bleu, teal
 * — glisse lentement vers le haut. À travers la carte on ne voit jamais de
 * bord : seulement la proportion des deux couleurs qui change sans fin, l'une
 * envahissant le cadre pendant que l'autre s'en retire.
 *
 * LA BOUCLE EST EXACTE, et c'est la seule chose délicate ici. Période et
 * translation sont exprimées dans la MÊME unité, en PIXELS : le motif se
 * répète tous les PERIOD px et l'animation translate de -PERIOD px. L'image
 * d'arrivée est donc celle du départ, et rien ne saute au rebouclage.
 *
 * Vérifié plutôt que supposé : les deux images extrêmes de la course,
 * comparées pixel à pixel, sont IDENTIQUES — 0 différence sur 276 520 pixels,
 * écart maximal 0/255.
 *
 * Deux conditions à ne pas casser en retouchant : le dégradé doit rester à
 * 180deg (une diagonale décalerait le motif d'un facteur cosinus et la boucle
 * sauterait), et la nappe doit rester assez haute pour couvrir la carte AUX
 * DEUX BOUTS de la course — d'où `top: -PERIOD` et une hauteur de
 * `100% + 3·PERIOD`, soit une période de marge au-delà du strict nécessaire.
 *
 * `linear` et non `ease-in-out` : une couleur qui ralentit puis accélère à
 * chaque tour trahirait la boucle. Le glissement doit être imperturbable.
 *
 * LE VERT S'EST RETIRÉ EN DEUX TEMPS, à la demande du client : #2dd4bf, puis
 * #63aed0, enfin #7fb8e2 — un bleu à peine cyané. Ce qui bat, ce n'est plus
 * une teinte contre une autre mais la LUMINOSITÉ des bleus entre eux. Voir le
 * pavé de FLOW_GRAD.
 */
/** Période du motif, en pixels. Plus grande que la carte : on ne voit jamais
 *  deux passages de teal à la fois, seulement la couleur qui balaie. */
const PERIOD = 520;

/** ── LES BANDES DEVIENNENT DIAGONALES ──────────────────────────────────────
 *  Client 2026-08-07 : « j'aimerais que cette vague soit bien plus diagonale,
 *  essaie vraiment de répliquer ce design de Stripe ». Sur la référence, les
 *  bandes ne sont pas horizontales : elles balaient du bas-gauche vers le
 *  haut-droit, et c'est ce balayage qui fait la nacre.
 *
 *  ⚠ LE PAVÉ CI-DESSUS INTERDISAIT LA DIAGONALE, ET IL AVAIT RAISON — À
 *  TRANSLATION INCHANGÉE. « Une diagonale décalerait le motif d'un facteur
 *  cosinus et la boucle sauterait. » C'est exact, et c'est réparable : il suffit
 *  de corriger la course du même facteur cosinus.
 *
 *  La démonstration, parce que c'est le seul endroit fragile du composant. Pour
 *  un dégradé d'angle CSS θ, la direction de progression est (sin θ, −cos θ).
 *  Translater la nappe de v décale la phase de v · (sin θ, −cos θ). On translate
 *  verticalement, v = (0, −T), donc la phase avance de T·(−cos θ)... soit
 *  T·cos(θ−180). Pour reboucler il faut que cette avance vaille exactement une
 *  période :
 *
 *      T · cos(θ − 180°) = PERIOD      ⟹      T = PERIOD / cos(θ − 180°)
 *
 *  À 205°, cos(25°) = 0,9063 et T = 573,75 px pour une période de 520. La nappe
 *  parcourt donc plus de chemin vertical qu'avant pour avancer d'un motif, ce
 *  qui est normal : en diagonale, la distance verticale est l'hypoténuse.
 *
 *  FLOW_STEP est CALCULÉ et non écrit à la main, exprès : c'est la seule façon
 *  que l'angle et la course ne divergent jamais. Changer TILT suffit, la boucle
 *  se réajuste. */
const TILT = 205;
const FLOW_STEP = Math.round((PERIOD / Math.cos(((TILT - 180) * Math.PI) / 180)) * 100) / 100;

const VC_CSS = `
@keyframes vcFlow { from { transform: translateY(0); } to { transform: translateY(-${FLOW_STEP}px); } }
/* 13 a 11 s : la crete repasse un cinquieme plus souvent. La duree est le seul
   levier de cadence disponible ici, la course etant verrouillee sur la periode
   par FLOW_STEP. Le timing reste LINEAIRE : une couleur qui ralentit puis
   accelere a chaque tour trahirait la boucle.
   (Sans accents ni backticks : ce bloc vit dans un template literal.) */
.vc-flow { animation: vcFlow 11s linear infinite; will-change: transform; }
@media (prefers-reduced-motion: reduce) { .vc-flow { animation: none; } }
`;

/** Inclinaison maximale au survol, en degrés. Au-delà d'une quinzaine, l'objet
 *  cesse de basculer et se met à tourner : on voit la perspective au lieu de la
 *  sentir. */
const MAX_TILT = 12;
/** Bascule HAUT / BAS, ajoutée le 2026-08-07 (« quand on met notre curseur sur
 *  le haut ou en bas du design, qu'il se penche aussi »). Plus faible que la
 *  bascule latérale, et ce n'est pas un caprice : l'objet est en portrait, 290
 *  sur 392. À angle égal, un basculement autour de l'axe horizontal écrase une
 *  arête bien plus longue, donc se voit davantage. Dix degrés ici pèsent comme
 *  douze là. */
const MAX_TILT_X = 10;

/** Dégradé PÉRIODIQUE, en pixels. `repeating-linear-gradient` garantit la
 *  périodicité par construction — pas d'arrêts à recopier de part et d'autre,
 *  donc pas de risque d'en oublier un.
 *
 *  CONTRASTE ÉLARGI et cadence DOUBLÉE le 2026-08-07 (« que les couleurs
 *  changent plus rapidement et que le mouvement soit plus visible ») : la
 *  période va maintenant de #1d5fe0, franchement sombre, à #a3c5fc, franchement
 *  clair, et le cycle passe de 26 à 13 secondes. Les deux réglages se
 *  renforcent — un balayage rapide sur un faible écart reste invisible, un
 *  grand écart parcouru lentement se remarque à peine.
 *
 *  La période joue SUR LES BLEUS et non plus entre un bleu et un
 *  vert : bleu de marque profond → bleu clair → pervenche, avec un seul arrêt
 *  qui penche vers le cyan (#7fb8e2, à peine teinté). C'est le réglage du
 *  2026-08-07 : « que le vert soit encore plus léger et que la variation soit
 *  plus vive entre les différents bleus ».
 *
 *  Les deux demandes tirent dans le même sens et c'est ce qui rend le réglage
 *  possible : en retirant le vert, l'écart de luminosité entre #2f6ff0 et
 *  #8fb6fa devient la variation principale. La carte bat désormais du bleu
 *  sombre au bleu clair, ce qui se voit bien mieux qu'un glissement de teinte,
 *  tout en restant entièrement dans la famille de marque. */
/*  ── REBÂTI SUR LE BLEU DE L'ANNEAU DE PARTICULES, 2026-08-07 ──────────────
 *  Client : « applique cette couleur pour le design de l'encadré Évaluation
 *  financière ». « Cette couleur », c'est celle de l'anneau de « Bilan
 *  développé », et « le design de l'encadré », c'est CET objet — pas le fond de
 *  la carte, qui vient d'être remis au blanc pour la troisième fois.
 *
 *  Les deux couleurs du shader deviennent les ANCRES de la période : #1d4ed8
 *  (`colorBot`) au plus sombre, #3b82f6 (`colorTop`) au plus vif. Les quatre
 *  autres arrêts sont des TEINTES de #3b82f6, c'est-à-dire des mélanges avec du
 *  blanc sur le même axe : la période ne quitte jamais la couleur demandée.
 *
 *  ⚠ CE QUI PART, ET POURQUOI CE N'EST PAS UNE PERTE : l'arrêt cyan (#8ec6e8) et
 *  l'arrêt pervenche (#6d87f2). Ils étaient les deux seuls hors famille. Le
 *  cyan avait déjà été demandé « encore plus léger » ; le voilà à zéro.
 *
 *  ⚠ CE QUI EST PRÉSERVÉ, ET C'EST LE POINT DÉLICAT : L'AMPLITUDE. Le pavé
 *  ci-dessus dit qu'un balayage rapide sur un faible écart est invisible, et
 *  l'écart faisait tout le mouvement. Or les deux couleurs de l'anneau ne sont
 *  distantes que de 52 points de rouge — les prendre telles quelles aurait
 *  éteint l'animation. D'où le pic clair #a3c4fb, qui est très exactement
 *  #3b82f6 mélangé à 53 % de blanc, et qui retombe à un cheveu de l'ancien
 *  sommet #a3c5fc. L'amplitude de luminosité est donc conservée, la teinte seule
 *  a changé.
 *
 *  ⚠ ET LA LISIBILITÉ TIENT : le pied #1d4ed8 est PLUS SOMBRE que l'ancien
 *  #1d5fe0. Les barres blanches diluées gardent le fond qu'il leur faut, et
 *  l'encre reste blanche — c'est le piège documenté plus haut, celui du passage
 *  en pervenche claire qui avait forcé l'encre au marine. Il est évité ici. */
/*  ── LA LIGNE CLAIRE QUI TRAVERSE, AMPLIFIÉE ───────────────────────────────
 *  Client 2026-08-07 : « amplifie légèrement l'animation de la ligne diagonale
 *  blanche qui passe, j'aime beaucoup ».
 *
 *  Cette ligne n'est pas un objet qu'on pourrait accélérer : c'est le SOMMET
 *  CLAIR de la période, et on ne la voit passer que parce que la nappe défile.
 *  Elle s'amplifie donc en deux gestes, sur la courbe et non sur l'horloge :
 *
 *  1. LE SOMMET MONTE, de #a3c4fb à #cfe0fe. Le premier était #3b82f6 dilué à
 *     53 % de blanc, le second l'est à 74 % : la ligne éclaire vraiment au lieu
 *     de s'éclaircir.
 *  2. IL SE RESSERRE. L'arrêt suivant passait par #93bafa, presque aussi clair,
 *     ce qui étalait le sommet sur 80 px et le faisait lire comme une zone. En
 *     retombant sur #8fb6fa dès 236 px, la crête redevient étroite, donc une
 *     LIGNE.
 *
 *  Les extrêmes ne bougent pas : le pied reste #1d4ed8 et l'ancrage sur les deux
 *  couleurs de l'anneau est préservé.
 *
 *  ⚠ REDESCENDU D'UN CRAN le 2026-08-08 (« désintensifie un peu la ligne
 *  blanche qui traverse le design »). #cfe0fe restait à 74 % de blanc ; le
 *  sommet retombe à #b8d2fc, environ 62 %, à mi-chemin entre l'amplification
 *  de la veille et le réglage d'avant elle. La largeur de la crête (236 px) et
 *  les deux extrêmes ne bougent pas : seule la clarté du pic est en cause. */
const FLOW_GRAD =
  `repeating-linear-gradient(${TILT}deg, #1d4ed8 0px, #3b82f6 88px, #b8d2fc 168px,` +
  ` #8fb6fa 236px, #5895f7 330px, #2358de 420px, #1d4ed8 ${PERIOD}px)`;

/** Hauteurs relatives des cinq approches, en pourcentage de la zone. Inégales
 *  et non ordonnées : une gamme d'approches ne se range pas par taille. */
const APPROCHES = [58, 82, 100, 74, 66];
/** Hauteur du filet « valeur retenue », entre la médiane et le haut. */
const RETENUE = 78;

export default function ValuationCard() {
  const hostRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  /* ── LA BASCULE SUIT LE CURSEUR ───────────────────────────────────────────
   *  Client 2026-08-07 : « quand l'utilisateur survole la gauche du design, le
   *  design s'oriente à gauche, et vice versa pour la droite ».
   *
   *  `rotateY` et non une rotation à plat : c'est un objet, il doit PIVOTER, pas
   *  pencher. En CSS un rotateY positif fait reculer le bord droit et avancer le
   *  bord gauche — la carte se tourne donc vers la gauche. D'où le signe moins :
   *  curseur à gauche (nx = −1) → rotateY positif → l'objet se présente à
   *  gauche, du côté où on le regarde.
   *
   *  Écrit en mutation directe du style sous rAF, comme RepelChips, et pas en
   *  état React : un `setState` par mouvement de souris rendrait tout le
   *  sous-arbre — les cinq barres, l'irisation, la nappe — à chaque pixel
   *  parcouru. Ici, rien ne se re-rend jamais.
   *
   *  La transition de 260 ms n'est pas un délai mais un AMORTISSEUR : la valeur
   *  cible saute à chaque image, la transition la rattrape avec un temps de
   *  retard, et c'est ce retard qui donne le poids. Sans elle, l'objet colle au
   *  curseur et paraît sans masse. */
  useEffect(() => {
    const host = hostRef.current;
    const card = cardRef.current;
    if (!host || !card) return;
    // Mouvement réduit : aucune bascule, et l'objet reste franc. Poser une
    // perspective sans jamais l'animer coûterait une couche 3D pour rien.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    /** Position du curseur, ramenée à [-1, 1] sur la largeur de l'OBJET. */
    let nx = 0;
    /** Idem sur sa hauteur : -1 en haut, +1 en bas. */
    let ny = 0;
    let over = false;

    /* LE SIGNE DES DEUX AXES SUIT UNE SEULE RÈGLE : le bord que l'on survole
     * vient VERS le regard, il ne s'enfonce pas. C'est ce qui donne l'impression
     * d'attirer l'objet plutôt que d'appuyer dessus.
     *
     * En CSS, un `rotateX` positif envoie le haut EN ARRIÈRE et amène le bas en
     * avant. Curseur en bas (ny = +1) doit donc donner un angle positif, d'où
     * `MAX_TILT_X * ny` — sans le moins qu'on trouve sur l'axe Y, où un
     * `rotateY` positif amène déjà le bord GAUCHE en avant. Les deux axes n'ont
     * pas la même convention de signe dans la spécification ; c'est la seule
     * raison de cette asymétrie apparente. */
    const apply = () => {
      raf = 0;
      card.style.transform = over
        ? `perspective(900px) rotateX(${(MAX_TILT_X * ny).toFixed(2)}deg) rotateY(${(-MAX_TILT * nx).toFixed(2)}deg) translateY(-10px)`
        : "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)";
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const onMove = (e: PointerEvent) => {
      // Normalisé sur le rectangle de la CARTE, pas sur celui de l'hôte : c'est
      // l'objet que l'on survole, et l'hôte est bien plus large que lui. Sans
      // ce recadrage, la bascule serait déjà à fond avant d'avoir atteint le
      // bord de l'objet. Borné à ±1 pour que l'approche par les côtés ne parte
      // pas au-delà de l'inclinaison maximale.
      const b = card.getBoundingClientRect();
      const halfW = b.width / 2 || 1;
      const halfH = b.height / 2 || 1;
      nx = Math.max(-1, Math.min(1, (e.clientX - (b.left + halfW)) / halfW));
      ny = Math.max(-1, Math.min(1, (e.clientY - (b.top + halfH)) / halfH));
      over = true;
      schedule();
    };
    const onLeave = () => {
      over = false;
      schedule();
    };

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={hostRef} className="relative flex justify-center py-3">
      <style>{VC_CSS}</style>
      {/* Lueur portée : longue, très diffuse, un peu décalée sous l'objet.
          C'est elle qui le fait flotter, pas l'ombre de la carte.
          Sans `filter: blur` : le dégradé radial porte lui-même sa douceur,
          et un flou sur une surface de cette taille se paie cher dès que la
          carte se soulève au survol.
          ALLÉGÉE le 2026-08-08 (« désintensifie le bleu qui est un peu trop
          pétant dans le design ») : c'est ce halo, pas la nappe qui défile,
          qui reste constamment visible en pur #3b82f6 — la nappe, elle, ne
          fait qu'y passer. Les trois arrêts tombent d'environ un quart
          (0,42 → 0,32, 0,22 → 0,17, 0,08 → 0,06), géométrie inchangée. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[80%] w-[94%] -translate-x-1/2 -translate-y-[46%] rounded-[999px]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(59,130,246,0.32) 0%, rgba(96,165,250,0.17) 40%, rgba(127,184,226,0.06) 66%, transparent 86%)",
        }}
      />

      {/* Le survol de groupe (`group-hover:-translate-y group-hover:rotate`) est
          PARTI d'ici : il écrivait la même propriété `transform` que la bascule
          au curseur, et la dernière déclaration appliquée aurait gagné au
          hasard des images. Le soulèvement de 10 px n'est pas perdu, il est
          repris dans le transform posé par le gestionnaire. */}
      <div
        ref={cardRef}
        className="relative w-[290px] overflow-hidden rounded-[24px] shadow-[0_2px_6px_rgba(15,23,42,0.12),0_40px_72px_-26px_rgba(29,78,216,0.6)] transition-transform duration-[260ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ aspectRatio: "290 / 392", background: "#2f6ae9" }}
      >
        {/* La nappe qui défile. Trois fois la hauteur de la carte, calée pour
            qu'aucun de ses bords n'entre jamais dans le cadre. */}
        <div
          aria-hidden
          className="vc-flow pointer-events-none absolute left-0 w-full"
          style={{ top: -FLOW_STEP, height: `calc(100% + ${FLOW_STEP * 3}px)`, background: FLOW_GRAD }}
        />

        {/* Irisation : quatre balayages blancs, angles et flous différents. Un
            seul ferait un reflet de plastique ; quatre qui se croisent font la
            nacre de la référence. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(146deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 30%), " +
              "linear-gradient(200deg, rgba(255,255,255,0.22) 6%, rgba(255,255,255,0) 36%), " +
              "radial-gradient(88% 44% at 8% 4%, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0) 62%), " +
              "radial-gradient(76% 38% at 98% 82%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 60%)",
          }}
        />

        <div className="relative flex h-full flex-col p-[21px]">
          <div className="font-inter text-[9px] font-bold uppercase tracking-[0.22em] text-white/70">
            Valeur retenue
          </div>
          <div className="mt-1 font-inter text-[25px] font-semibold leading-none tracking-[-0.025em] text-white">
            473 106 €
          </div>

          {/* Les cinq approches, et le filet de la valeur retenue qui les
              traverse — posé PAR-DESSUS les barres, en absolu, pour qu'il se
              lise comme une décision prise sur elles et non comme une
              sixième barre. */}
          <div className="mt-auto">
            <div className="relative flex h-[146px] items-end gap-[8px]">
              {APPROCHES.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-[3px] bg-white"
                  style={{ height: `${h}%`, opacity: 0.34 + (h / 100) * 0.5 }}
                />
              ))}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0"
                style={{
                  bottom: `${RETENUE}%`,
                  height: 0,
                  borderTop: "1.5px dashed rgba(255,255,255,0.92)",
                }}
              />
            </div>
            <div className="mt-2.5 font-inter text-[9px] font-bold uppercase tracking-[0.16em] text-white/80">
              Cinq approches
            </div>
          </div>

          {/* Pied : la place du logo Visa sur la référence. */}
          <div className="mt-3.5 flex items-center justify-between border-t border-white/25 pt-2.5">
            <span className="font-inter text-[9.5px] font-medium text-white/80">Fourchette argumentée</span>
            <img src="/logos/icon-light.png" alt="" className="h-[17px] w-auto opacity-90" />
          </div>
        </div>
      </div>
    </div>
  );
}
