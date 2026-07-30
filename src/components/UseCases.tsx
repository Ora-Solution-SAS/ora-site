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

/** Longueur du scrub du recul, en hauteurs d'écran. Doit rester synchronisée
 *  avec la hauteur du cale-scroll `md:h-[120vh]` sous la grille. */
const PULLBACK_VH = 1.2;
/** Part de la LARGEUR d'écran qu'occupe le mur, caméra au plus loin. */
const PULLBACK_FILL_W = 0.96;
/** Hauteur tolérée pour le mur, en hauteurs d'écran. Volontairement très
 *  supérieure à 1 : le mur DÉBORDE en haut et en bas, ses bords sont fondus, et
 *  c'est la dérive des colonnes qui fait défiler ce qui dépasse. Relevée de
 *  1,45 à 2,6 (client 2026-07-30 : « ça doit prendre plus de largeur ») — sous
 *  1,45 c'était la HAUTEUR qui bridait l'échelle, donc le mur se rétrécissait
 *  au milieu de deux grandes marges vides dès qu'on ajoutait des rangées.
 *  Au-delà, c'est la largeur qui commande, et le mur remplit l'écran. */
const PULLBACK_FILL_H = 2.6;
/** Amplitude de la dérive inverse des colonnes, en pixels d'écran. */
const WALL_DRIFT = 170;

export default function UseCases() {
  const { t } = useLang();
  const [active, setActive] = useState<UseCase | null>(null);

  // ── Dézoom de sortie : la grille RÉELLE recule ───────────────────────────
  const trackRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fillerRefs = useRef<(HTMLDivElement | null)[]>([]);

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
    };

    const apply = () => {
      // Sous `md` la grille n'est pas épinglée : on remet tout à plat, sinon
      // les transformes d'une session desktop resteraient collés après un
      // redimensionnement.
      if (!desktop.matches || reduced) return reset();

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // offsetWidth / offsetHeight : dimensions de MISE EN PAGE, insensibles
      // aux transformes déjà posés — donc stables d'une image à l'autre.
      const gridW = grid.offsetWidth;
      const gridH = grid.offsetHeight;
      const reals = cardRefs.current.filter((el): el is HTMLDivElement => !!el);
      if (gridH <= vh || reals.length < 2) return reset();

      // `top` négatif : la grille défile normalement puis se fige au moment où
      // son BAS touche le bas de l'écran, donc pile sur la dernière rangée
      // (« Réconciliation » / « Formatage pour logiciel métier »).
      const pinTop = vh - gridH;
      pin.style.top = `${pinTop}px`;

      const p = clamp01((pinTop - track.getBoundingClientRect().top) / (vh * PULLBACK_VH));
      const u = ease(p);

      // ── Disposition d'arrivée du mur ────────────────────────────────────
      // Reculer sur la grille à deux colonnes ne suffit pas : elle est trois
      // fois plus haute que large, donc la faire tenir à l'écran la réduirait
      // à un bandeau étroit au milieu du vide. Les cartes se REDISTRIBUENT
      // donc en un mur plus large pendant le recul. Leur taille de mise en
      // page ne change jamais (simple `translate`), il n'y a donc aucun
      // reflux de texte pendant l'animation.
      // Mesures prises sur les VRAIES cartes uniquement : les tuiles de
      // remplissage sont hors flux, leurs `offset*` valent tous zéro.
      const colW = reals[0].offsetWidth;
      const gapX = reals[1].offsetLeft - (reals[0].offsetLeft + colW);
      const gapY = reals.length > 2
        ? reals[2].offsetTop - (reals[0].offsetTop + reals[0].offsetHeight)
        : gapX;
      const rowH = Math.max(...reals.map((c) => c.offsetHeight));

      // Les tuiles de remplissage prennent le gabarit d'une vraie carte, sinon
      // les rangées du mur seraient irrégulières.
      const fills = fillerRefs.current.filter((el): el is HTMLDivElement => !!el);
      for (const f of fills) {
        f.style.width = `${colW}px`;
        f.style.height = `${rowH}px`;
        f.style.opacity = String(u);
      }

      // Alternance vraie carte / tuile : en trois colonnes cela donne un
      // damier, donc les ajouts se fondent dans le mur au lieu de former un
      // bloc rapporté sous les cartes travaillées.
      const cards: HTMLDivElement[] = [];
      for (let i = 0; i < Math.max(reals.length, fills.length); i++) {
        if (i < reals.length) cards.push(reals[i]);
        if (i < fills.length) cards.push(fills[i]);
      }

      // TROIS colonnes, et pas un nombre choisi automatiquement : c'est ce qui
      // rend lisible la dérive inverse plus bas (les deux colonnes extérieures
      // montent, celle du milieu descend). En dessous de six cartes, trois
      // colonnes laisseraient une rangée dépareillée, on retombe alors à deux.
      const cols = cards.length >= 6 ? 3 : 2;
      const rows: HTMLDivElement[][] = [];
      for (let i = 0; i < cards.length; i += cols) rows.push(cards.slice(i, i + cols));
      const wallW = Math.max(...rows.map((r) => r.length)) * (colW + gapX) - gapX;
      const wallFullH = rows.reduce((acc, r) => acc + Math.max(...r.map((c) => c.offsetHeight)), 0)
        + gapY * (rows.length - 1);
      const fit = Math.min(1, (vw * PULLBACK_FILL_W) / wallW, (vh * PULLBACK_FILL_H) / wallFullH);

      const s = 1 - (1 - fit) * u;
      // Dérive inverse : la colonne du MILIEU descend pendant que les deux
      // extérieures montent. Décalée de 0,15 pour que le mur soit déjà en
      // mouvement en arrivant, plutôt que de démarrer pile à l'arrêt. Exprimée
      // en pixels d'écran, donc divisée par l'échelle du mur.
      const drift = (u * (p - 0.15) * WALL_DRIFT) / s;

      let rowTop = 0;
      for (const row of rows) {
        // Rangée incomplète (mur non rectangulaire) : elle est centrée plutôt
        // que collée à gauche.
        let cardLeft = (gridW - (row.length * (colW + gapX) - gapX)) / 2;
        row.forEach((card, ci) => {
          const dx = (cardLeft - card.offsetLeft) * u;
          // Colonne 1 = celle du milieu en trois colonnes ; en repli à deux
          // colonnes, c'est simplement celle de droite, et les deux dérivent
          // encore en sens opposé.
          const dy = (rowTop - card.offsetTop) * u + (ci === 1 ? drift : -drift);
          card.style.transform = u > 0 ? `translate3d(${dx}px, ${dy}px, 0)` : "";
          card.style.willChange = p > 0 && p < 1 ? "transform" : "";
          cardLeft += colW + gapX;
        });
        rowTop += Math.max(...row.map((c) => c.offsetHeight)) + gapY;
      }

      // Recul de caméra. Origine en bas de la grille, donc pile sur le bas de
      // l'écran pendant l'épinglage : à u = 0 la grille est exactement à sa
      // place, et le mur se recentre au fur et à mesure du recul.
      const wallH = gridH + (wallFullH - gridH) * u;
      grid.style.transform = `translate3d(0, ${u * (s * gridH - (s * wallH) / 2 - vh / 2)}px, 0) scale(${s})`;
      grid.style.willChange = p > 0 && p < 1 ? "transform" : "";

      // Fondu haut et bas pendant le recul. Les bornes sont recalculées depuis
      // la position RÉELLE de l'enveloppe à chaque image, et non depuis les
      // coordonnées de l'épinglage : une fois le mur libéré, l'enveloppe remonte
      // avec la page, et un dégradé figé emporterait le fondu avec elle en
      // plein milieu de l'écran.
      // La borne basse suit le BAS DU CADENCEUR quand celui-ci passe au-dessus
      // du bas de l'écran : c'est là que commence « Automatisez de bout en
      // bout », dont le fond opaque tranchait net la dernière rangée.
      if (p > 0) {
        const pinTopNow = pin.getBoundingClientRect().top;
        const haut = -pinTopNow;
        const bas = -pinTopNow + Math.min(vh, track.getBoundingClientRect().bottom);
        const fade = Math.min(130, vh * 0.16);
        const mask = `linear-gradient(to bottom, transparent ${haut}px, #000 ${haut + fade}px, #000 ${bas - fade}px, transparent ${bas}px)`;
        pin.style.setProperty("-webkit-mask-image", mask);
        pin.style.setProperty("mask-image", mask);
      } else {
        pin.style.removeProperty("-webkit-mask-image");
        pin.style.removeProperty("mask-image");
      }
    };

    apply();
    window.addEventListener("scroll", apply, { passive: true });
    window.addEventListener("resize", apply);
    // La grille grandit encore après le montage (posters, vidéos, polices) :
    // sans ça le `top` d'épinglage resterait calculé sur une hauteur trop
    // faible et le recul démarrerait au mauvais endroit.
    const ro = new ResizeObserver(apply);
    ro.observe(pin);
    return () => {
      window.removeEventListener("scroll", apply);
      window.removeEventListener("resize", apply);
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

  // ── Tuiles de remplissage du MUR uniquement ──────────────────────────────
  // Elles n'apparaissent QUE pendant le dézoom, pour étoffer les colonnes et
  // les rangées. Elles ne rejoignent jamais les cartes pleines travaillées
  // au-dessus : hors flux (`absolute`) et invisibles tant que le recul n'a pas
  // commencé, elles ne touchent donc pas la grille.
  // ⚠ INTITULÉS INVENTÉS, et désormais PUBLIÉS (client 2026-07-30, qui a
  // confirmé en connaissance de cause). Ce sont des noms de remplissage, pas
  // des automatisations livrées : ils annoncent au public des capacités qui ne
  // sont pas garanties. À REMPLACER par la vraie liste dès qu'elle arrive.
  const fillers: { title: string; meta: string; bg: string; ink: string }[] = [
    { title: t({ fr: "Contrôle de TVA", en: "VAT control" }), meta: t({ fr: "Déclarations & contrôles", en: "Filings & controls" }), bg: "#d2e4fa", ink: "#0c2d4d" },
    { title: t({ fr: "Consolidation", en: "Consolidation" }), meta: t({ fr: "Groupes & filiales", en: "Groups & subsidiaries" }), bg: "#0E7490", ink: "#ffffff" },
    { title: t({ fr: "Relances clients", en: "Customer follow-ups" }), meta: t({ fr: "Recouvrement & encours", en: "Collections & receivables" }), bg: "#f7e3f0", ink: "#3d1b36" },
    { title: t({ fr: "Immobilisations", en: "Fixed assets" }), meta: t({ fr: "Amortissements & tableaux", en: "Depreciation & schedules" }), bg: "#5865E3", ink: "#ffffff" },
    { title: t({ fr: "Notes de frais", en: "Expense reports" }), meta: t({ fr: "Contrôle & refacturation", en: "Checks & rebilling" }), bg: "#d9e2f6", ink: "#0c2d4d" },
    { title: t({ fr: "Rapprochement bancaire", en: "Bank reconciliation" }), meta: t({ fr: "Trésorerie quotidienne", en: "Daily treasury" }), bg: "#0A6BE1", ink: "#ffffff" },
  ];

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

            {/* Tuiles de remplissage du mur. HORS FLUX (`absolute`) : elles
                n'occupent aucune place dans la grille, qui reste donc celle
                des seules cartes travaillées. Le moteur du recul leur donne
                le gabarit d'une carte, les place dans le mur et les fait
                apparaître au fur et à mesure du dézoom. */}
            {fillers.map((f, i) => (
              <div
                key={f.title}
                ref={(el) => { fillerRefs.current[i] = el; }}
                aria-hidden
                className="pointer-events-none absolute left-0 top-0 opacity-0 overflow-hidden rounded-[28px] md:rounded-[40px] p-8 md:p-12 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)]"
                style={{ background: f.bg }}
              >
                <div className="font-poppins font-semibold text-[1.7rem] md:text-[2.2rem] tracking-[-0.02em]" style={{ color: f.ink }}>
                  {f.title}
                </div>
                <div className="mt-5 md:mt-6 font-inter font-semibold text-[15px] md:text-base" style={{ color: f.ink }}>
                  {f.meta}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Cale-scroll : la distance parcourue pendant le recul de caméra.
            Doit rester égale à PULLBACK_VH. */}
        <div aria-hidden className="hidden md:block md:h-[120vh]" />
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
