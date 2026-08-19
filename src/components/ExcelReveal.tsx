import { useRef, useEffect } from "react";
import { useLang } from "@/lib/i18n";

/* ── Bending-Spoons letter-by-letter scroll-reveal ───────────────────
 *  Pure-black section, phrases stacked as normal flowing text, page scrolls
 *  NORMALLY. A "reading frontier" sweeps through the text as you scroll:
 *  every LETTER's blur + opacity derives from its position along the reading
 *  order — letters above/left of the frontier are crisp white, letters
 *  after it melt into blur, with a smoothstep gradient across roughly one
 *  line of text. Because the horizontal position feeds the formula, letters
 *  of the SAME line sharpen left → right (exactly the Bending Spoons look),
 *  and previously-read phrases stay crisp above.
 *
 *  Perf: letter positions are measured ONCE (and on resize / font load);
 *  each rAF frame only reads scrollY and writes filter/opacity.
 *  Desktop only (hidden on mobile). */

// RECENTRÉE à 0,50 (client 2026-08-03, deuxième passe : « les phrases s'affichent
// un peu trop haut, en scrollant vite on ne peut pas les lire, elles sont déjà
// parties »).
// Cette fraction situe la frontière de netteté dans l'écran, et elle règle DEUX
// choses à la fois, en sens opposés :
//   · plus elle est BASSE (0,56), plus un mot devient net tôt, donc plus longtemps
//     il reste lisible avant de sortir par le haut ;
//   · plus elle est HAUTE (0,30), plus le mot reste flouté, donc plus la découverte
//     suit le geste, mais moins on a le temps de lire.
// Mon passage à 0,30 avait privilégié la découverte au prix du temps de lecture :
// un mot n'était net que dans le premier tiers de l'écran, soit 216 px de scroll
// avant de disparaître. À 0,50 il l'est dès le milieu, ce qui laisse 360 px, tout
// en gardant la moitié basse de l'écran pour la découverte.
// Mon passage à 0,72 était une ERREUR de levier (client 2026-08-04 : « quand on
// scrolle vers le bas il y a déjà la moitié des phrases qui sont affichées »).
// FOCUS ne règle pas la vitesse, il règle la HAUTEUR DE LA ZONE NETTE, et le
// nombre de phrases nettes AFFICHÉES EN MÊME TEMPS vaut :
//     zone nette (FOCUS x vh) / pas entre deux phrases (leur hauteur de texte +
//     le `marginBottom` ci-dessous)
// Correctif suivant à 0,38 : la SECONDE erreur (même jour, message suivant :
// « les phrases sont trop haute et quand l'on scroll on ne les voit plus
// s'animé »). Mesuré directement sur le DOM réel (getBoundingClientRect, pas
// de calcul de tête cette fois) : à 0,38 la transition floue→nette se
// produisait entre 304 et 380 px depuis le haut d'un écran de 900 px, donc
// dans le TIERS SUPÉRIEUR — au-dessus de la zone où l'œil se pose en lisant,
// et sur seulement 76 px de scroll. D'où les deux symptômes à la fois : la
// netteté se joue « trop haut », et hors du regard, l'utilisateur ne voit pas
// le mot se démêler, il le découvre déjà net.
// PORTÉE à 0,46 : la transition tombe désormais entre 376 et 452 px, soit
// 42-50 % de l'écran — recentrée dans la zone de lecture. Avec le pas mesuré à
// 227 px (`marginBottom` redonné à 4,5vh, voir plus bas), le ratio remonte à
// 1,83 : légèrement au-dessus des 1,71 du dernier réglage jamais critiqué côté
// recouvrement, mais c'est le compromis qui corrige la position sans revenir
// au 0,50/8,5vh d'origine.
// PORTÉE de 0,46 à 0,52 puis à 0,58 (client 2026-08-05, deux passes de suite :
// « un tout petit peu plus bas pour qu'elle soit plus centrée », puis « baisse
// l'emplacement d'apparition, il faut qu'elle soit plus bas »). Sur un écran de
// 900 px la transition floue→nette se joue désormais entre 508 et 535 px, soit
// 56-59 % de la hauteur : sous la ligne médiane, dans le bas du champ de
// lecture. Le prix est mécanique et il est payé : la zone nette (FOCUS × vh)
// monte à 522 px, donc plus de matière nette cohabite à l'écran. C'est pour ça
// que `marginBottom` passe à 12vh plus bas — sans quoi, avec des phrases
// désormais plus petites (donc plus courtes en hauteur), on serait remonté vers
// trois phrases nettes en même temps.
const FOCUS = 0.58; //   viewport fraction where the frontier sits
// Hyper-sensitive to scroll: a TIGHT transition band (~one line of reading
// distance) so the reveal edge is crisp and each letter flips blurred→sharp
// with only a few px of scroll — the sweep tracks the finger letter by letter.
// RESSERRÉE de 0,085 à 0,05 puis à 0,03 (client 2026-08-05 : « plus rapide »,
// puis « que la sensibilité d'affichage des lettres par rapport au scroll soit
// plus forte »). C'est LE levier de sensibilité : la bande est la distance de
// scroll sur laquelle un mot passe de flou à net. Elle est tombée de 76 px à
// 45 px puis à 27 px. En dessous de ça la révélation cesserait d'être un
// dégradé pour devenir un interrupteur, mot par mot.
const BAND = 0.03; //    height of the sharp→blurred transition band
// ══ LISSAGE (client 2026-08-05 : « essaye que l'affichage des phrases soit
// beaucoup plus smooth ») ═════════════════════════════════════════════════
// La saccade ne venait PAS de la bande. Elle venait de trois choses, corrigées
// ensemble ici et plus bas ; garder la bande étroite était la contrainte, la
// demande précédente étant justement de la resserrer.
//
// 1. LE BALAYAGE PAR PAQUETS. Un mot devient net selon sa position dans l'ordre
//    de LECTURE : `colShift` avance la frontière pour les mots de droite, d'une
//    fraction de la hauteur de ligne. À ±0,5 hauteur de ligne, l'étalement d'une
//    ligne entière (~50 px) était du même ordre que la bande (27 px) : tous les
//    mots d'une ligne basculaient donc quasiment ensemble, par blocs. En étalant
//    2,4 fois plus, une ligne met bien plus qu'une bande à se révéler, et les
//    mots se déclenchent l'un après l'autre. C'est ÇA qui donne le glissement
//    continu — sans toucher à la sensibilité de chaque mot pris isolément.
const COL_SPREAD = 2.4;
// 2. LE FLOU TROP FORT. 11 px sur un mot de 4,4rem, c'est une tache : l'œil ne
//    suit pas une forme qui se reforme, il voit apparaître un mot. Plus c'est
//    lourd, plus la rastérisation coûte cher aussi, à chaque image et sur
//    chaque mot dans la bande.
const BLUR_MAX = 7.5;
const OP_MIN = 0.08; //  faintest opacity (upcoming text barely ghosted)
const RISE_EM = 0.12; // unread letters sit slightly low and rise into place

type Unit = { el: HTMLElement; yInSec: number; colShift: number; lastB: number; lastO: number };

type Phrase = { text: string };

export default function ExcelReveal() {
  const { t } = useLang();
  const sectionRef = useRef<HTMLElement>(null);
  const unitElsRef = useRef<HTMLElement[]>([]);

  const phrases: Phrase[] = [
    {
      text: t({
        fr: "Votre temps est votre actif le plus précieux.",
        en: "Your time is your most valuable asset.",
      }),
    },
    {
      text: t({
        fr: "Des relevés PDF à ressaisir, des balances Excel brutes à retraiter, des comptes à rapprocher. À chaque clôture.",
        en: "PDF statements to re-key, raw Excel balances to rework, accounts to reconcile. Every close.",
      }),
      // Highlight the manual TASK verbs — the action the accountant does by
      // hand is more telling than the file format.
    },
    // ── LE VIRAGE VERS LE CONSEIL (client 2026-08-07) ────────────────────
    // Deux phrases là où il y en avait une. La séquence disait « on
    // automatise, donc vous conseillez » ; le client veut que le POURQUOI
    // soit dit, et il tient en une phrase : la production seule ne suffit
    // plus à justifier les honoraires.
    //
    // Écrites sans chiffre ni promesse de gain : ni « x heures par mois », ni
    // « + n % de marge ». Le constat du marché est une observation partagée
    // par la profession, pas une statistique qu'Ora aurait produite — et le
    // site ne s'autorise que ce qu'il peut tenir.
    {
      text: t({
        fr: "La production seule ne suffit plus. Ce que vos clients attendent aujourd'hui, c'est le regard que vous portez sur leurs chiffres.",
        en: "Production alone is no longer enough. What your clients want today is the reading you bring to their numbers.",
      }),
    },
    {
      text: t({
        fr: "On automatise cette chaîne de bout en bout, de la ressaisie au livrable. Le cabinet produit plus vite, et votre expertise part là où elle crée de la valeur : le conseil.",
        en: "We automate that chain end to end, from data entry to deliverable. The firm produces faster, and your expertise goes where it creates value: advisory.",
      }),
    },
    // ── Deux phrases NOUVELLES (client 2026-08-04) : c'est ICI que le site
    // casse l'argument « j'upload dans un chatbot ». Frontal sur la CATÉGORIE
    // (IA générative), jamais sur une marque : décision client, le manifeste
    // noir est le seul endroit frontal du site avec la FAQ, les cartes de
    // vente restent obliques (voir la mémoire llm-differentiation-stance).
    {
      text: t({
        fr: "Là où une IA générative improvise, Ora calcule. Même fichier, même livrable, vérifiable ligne à ligne.",
        en: "Where generative AI improvises, Ora computes. Same file, same deliverable, verifiable line by line.",
      }),
    },
    // « Conforme au RGPD » : auto-déclaration standard, déjà revendiquée sur le
    // site. Pour l'AI Act, « pensée pour » et jamais « conforme » : le cœur
    // d'Ora est déterministe, donc hors du champ des systèmes d'IA du
    // règlement, et aucune certification AI Act n'existe à revendiquer.
    // Formulation validée par le client (2026-08-04).
    {
      text: t({
        fr: "Vos données restent chez vous. Une solution européenne, conforme au RGPD, pensée pour l'AI Act.",
        en: "Your data stays with you. A European solution, GDPR compliant, designed with the AI Act in mind.",
      }),
    },
  ];

  unitElsRef.current = [];
  const collect = (el: HTMLElement | null) => {
    if (el && !unitElsRef.current.includes(el)) unitElsRef.current.push(el);
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let units: Unit[] = [];
    let raf = 0;
    let active = false;
    let lastSecTop = Number.NaN; // skip the whole loop when nothing scrolled

    /* Measure every letter ONCE, relative to the SECTION (not the page): its
       centre offset inside the section + a horizontal shift (fraction of the
       line advanced × line height) so the frontier flows in READING ORDER.
       Section-relative offsets stay valid even if content above the section
       reflows (which, with page-Y offsets, caused the reveal to "jump"). */
    const measure = () => {
      const els = unitElsRef.current;
      const secTop = section.getBoundingClientRect().top;
      units = els.map((el) => {
        const r = el.getBoundingClientRect();
        const p = el.closest("p");
        const pr = p ? p.getBoundingClientRect() : r;
        const lineH = p ? parseFloat(getComputedStyle(p).lineHeight) || r.height : r.height;
        const colP = pr.width > 0 ? (r.left + r.width / 2 - pr.left) / pr.width : 0;
        return {
          el,
          yInSec: r.top - secTop + r.height / 2,
          colShift: (colP - 0.5) * lineH * COL_SPREAD,
          lastB: -1,
          lastO: -1,
        };
      });
      lastSecTop = Number.NaN; // force a repaint on the next frame
      // La géométrie vient de changer sous les mots : la réécriture qui suit
      // doit être SÈCHE, sinon chacun animerait depuis la valeur qu'il avait
      // dans l'ancienne mise en page. La classe est remise juste après.
      section.classList.remove("xr-live");
    };

    /* One getBoundingClientRect per frame (the section), then pure math per
       letter. We only WRITE styles that actually changed (quantised), so at a
       steady scroll only the ~one line crossing the band repaints — the blur
       filter is never re-rasterised on the hundreds of already-settled
       letters. That is what keeps it buttery. */
    const frame = () => {
      const secTop = section.getBoundingClientRect().top;
      if (secTop !== lastSecTop) {
        lastSecTop = secTop;
        const vh = window.innerHeight || 1;
        const lo = FOCUS - BAND / 2;
        for (let i = 0; i < units.length; i++) {
          const u = units[i];
          const pEff = (secTop + u.yInSec + u.colShift) / vh;
          let x = (pEff - lo) / BAND;
          x = x < 0 ? 0 : x > 1 ? 1 : x;
          // 3. LA MARCHE D'ESCALIER, les deux derniers points du lissage.
          //    · SMOOTHERSTEP (6x⁵-15x⁴+10x³) au lieu de smoothstep : sa
          //      dérivée SECONDE s'annule aussi aux deux bouts, donc le mot ne
          //      démarre ni ne s'arrête par un à-coup. Avec une bande de 27 px,
          //      soit trois ou quatre images de scroll, ce détail se voyait.
          //    · QUANTIFICATION cinq fois plus fine : le flou avançait par
          //      paliers de 0,25 px et l'opacité par paliers de 0,02, hérités
          //      d'une bande trois fois plus large où ils passaient inaperçus.
          //      Ramenés à 0,05 px et 0,005. Le garde-fou anti-réécriture reste
          //      en place, il laisse simplement passer les vraies nuances.
          const e = x * x * x * (x * (x * 6 - 15) + 10); // smootherstep
          const bQ = Math.round(e * BLUR_MAX * 20) / 20; // 0.05px steps
          const oQ = Math.round((1 - e * (1 - OP_MIN)) * 200) / 200; // 0.005 steps
          if (bQ === u.lastB && oQ === u.lastO) continue; // nothing to do
          u.lastB = bQ;
          u.lastO = oQ;
          const s = u.el.style;
          s.filter = bQ < 0.03 ? "" : `blur(${bQ}px)`;
          s.opacity = oQ >= 0.999 ? "" : String(oQ);
          s.transform = e < 0.005 ? "" : `translateY(${(e * RISE_EM).toFixed(3)}em)`;
        }
        // Le fondu n'est armé qu'APRÈS la toute première écriture (voir
        // `.xr-live` dans src/index.css). Avant elle les mots sont encore nus,
        // donc nets : armé tout de suite, le navigateur aurait animé ce net
        // vers le flou et la section se serait affichée en clair avant de se
        // brouiller sous les yeux. Une classe sur la SECTION suffit, il n'y a
        // rien à suivre mot par mot.
        section.classList.add("xr-live");
      }
      if (active) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (active) return;
      // Always re-measure when the section comes into view: offsets are
      // section-relative (scroll-independent) and cheap at word granularity,
      // so this is robust to any layout that wasn't final at mount.
      measure();
      active = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      active = false;
      if (raf) cancelAnimationFrame(raf);
    };

    const onResize = () => {
      measure();
    };

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { rootMargin: "25% 0px 25% 0px" },
    );
    io.observe(section);
    window.addEventListener("resize", onResize);
    (document as { fonts?: { ready?: Promise<unknown> } }).fonts?.ready?.then(() => {
      measure();
    });
    measure();
    frame(); // paint initial state once even if not yet active

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [t]);

  /* Render a word as ONE animated span (blur + opacity + rise applied at the
     WORD level). Far fewer elements than per-letter → only ~35 composited
     layers instead of 250+, so scrolling stays buttery. The reading-order
     cascade (colShift per word) still sweeps word after word left→right, which
     at this font size reads as a continuous reveal — and matches how Bending
     Spoons blurs (by word/region, not per glyph). */
  /* PHRASES tout blanc (client 2026-08-05, référence Bending Spoons fournie en
     capture) : les mots-clés portaient `text-brand-gradient`, donc un bleu
     plein, dans quatre phrases sur six. Chez Bending Spoons il n'y a aucun
     accent de couleur — le seul relief du manifeste est la frontière de
     netteté qui balaie le texte, et un mot bleu ajoutait un troisième signal
     qui la diluait. Les listes `gradient` sont supprimées avec.
     SEULE EXCEPTION, rétablie dans la foulée (même jour, message suivant :
     « que la couleur bleue soit sur le mot Ora à la fin, juste sur ce mot-là
     comme c'était avant ») : le tout dernier mot de la section. Là il ne
     concurrence plus rien, il SIGNE. D'où le paramètre `blue`, réservé à ce
     seul appel — ne pas le rouvrir aux phrases. */
  const wordStyle = { marginRight: "0.26em", willChange: "opacity, filter, transform" } as const;
  const renderWord = (w: string, key: number, blue = false) => (
    <span
      key={key}
      ref={collect}
      className={`xr-word inline-block whitespace-nowrap${blue ? " text-brand-gradient" : ""}`}
      style={wordStyle}
    >
      {w}
    </span>
  );

  return (
    <section
      ref={sectionRef}
      id="excel-reveal"
      data-nav-dark
      /* `bg-black` RETIRÉ (client 2026-08-03 : « enlève ce fond noir »). C'est
         désormais le conteneur parent, marqué `data-hero-bg` dans App.tsx, qui
         porte la couleur : OraHeroDemo la fait basculer du blanc au noir en même
         temps que son bloc de clôture, une fois le bouton « Réserver un appel »
         passé. Tant que ce fond restait ici, il s'affichait par-dessus celui du
         parent et le noir apparaissait donc toujours d'emblée.
         L'animation de révélation des phrases n'est pas touchée. */
      className="relative hidden md:block"
    >
      {/* Bending-Spoons layout: LEFT-aligned, full-width, big type. Stacked
          with a gap so ~2 phrases are on screen at once (previous crisp above,
          next blurred below). pb = black breathing space after the last line.
          PADDING, not a child margin (a margin collapses out → white line). */}
      {/* pt ramené de 20 à 13vh (client 2026-08-04) : troisième levier, celui de
          la toute PREMIÈRE phrase. Elle attendait 144 px de noir avant même
          d'entrer dans la zone de révélation, ce qui donnait l'impression que la
          section met du temps à démarrer. */}
      <div className="px-6 md:px-[5.5vw] pt-[13vh] pb-[11vh]">
        {phrases.map((phrase, pi) => {
          return (
            <p
              key={pi}
              className="font-instrument font-normal text-white text-left text-balance"
              style={{
                // Descendue de 5rem à 3,9rem (« des lettres moins grandes »),
                // puis REMONTÉE à 4,4rem (client 2026-08-05, capture Bending
                // Spoons à l'appui : « légèrement plus grande »). Atterrissage
                // à mi-chemin de l'ancien réglage, ce qui est bien la taille
                // de la référence : chez eux une phrase occupe deux ou trois
                // lignes pleine largeur, pas plus.
                fontSize: "clamp(1.95rem, 3.95vw, 4.4rem)",
                lineHeight: 1.12,
                // DESSERRÉ de -0,035 à -0,028em : à cette taille, un
                // interlettrage aussi serré redensifie le mot et le fait paraître
                // plus GRAS. Desserrer est, avec le lissage ci-dessous, ce qui
                // affine réellement la police.
                letterSpacing: "-0.028em",
                // « Une police plus fine » : Instrument Sans s'arrête à 400, qui
                // est DÉJÀ la graisse posée ici, il n'existe pas de 300 à
                // demander. Le vrai levier sur un fond noir est le lissage : par
                // défaut macOS rend le texte clair sur fond sombre en
                // subpixel, ce qui l'ÉPAISSIT visiblement. En antialiased, les
                // mêmes glyphes retrouvent leur graisse dessinée.
                WebkitFontSmoothing: "antialiased",
                MozOsxFontSmoothing: "grayscale",
                // Balance the wrapped lines so no lone word is left on the last
                // line (a widow) — complete, even lines read much better.
                textWrap: "balance",
                // PORTÉ de 4,5 à 9vh (client 2026-08-04), puis à 12vh
                // (2026-08-05) : les phrases ayant rapetissé, leur bloc de texte
                // occupe moins de hauteur, donc le PAS entre deux phrases s'est
                // resserré tout seul. Sans compensation, et avec FOCUS remonté à
                // 0,58, on serait passé de moins de deux phrases nettes à
                // presque trois. À 12vh le pas revient vers 245 px.
                marginBottom: "12vh",
              }}
            >
              {phrase.text.split(" ").map((w, wi) => renderWord(w, wi))}
            </p>
          );
        })}

        {/* Conclusion — « Découvrez Ora » scrolls with the flow and reveals
            word-by-word LAST, like the phrases (no pinned panel). */}
        <p
          className="font-instrument font-normal text-white text-left"
          style={{
            // Suit la même trajectoire que les phrases, ratio conservé.
            fontSize: "clamp(2.4rem, 5.4vw, 5.7rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.032em",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
            marginBottom: 0,
          }}
        >
          {renderWord(t({ fr: "Découvrez", en: "Meet" }), 90)}
          {renderWord("Ora.", 91, true)}
        </p>
      </div>
    </section>
  );
}
