/**
 * DownloadShowcase — l'encadré du hero de la page de téléchargement.
 *
 * Transposition fidèle de la mise en scène de la page de téléchargement de
 * ChatGPT (référence validée par le client le 2026-08-05) : un panneau carré
 * en dégradé pastel, une carte de demande blanche posée en haut, et la fenêtre
 * de l'application en bas, débordant du panneau à droite et en bas. Seuls la
 * palette (bleu et teal Ora au lieu du violet) et le contenu sont les nôtres.
 *
 * Toutes les tailles sont exprimées en `cqw` (1cqw = 1 % de la largeur du
 * panneau, qui porte `container-type: inline-size`). La composition se
 * comporte donc exactement comme une image : elle garde ses proportions du
 * mobile au grand écran, sans point de rupture à régler.
 *
 * Les deux thèmes passent par deux calques de fond (`dark:hidden` /
 * `hidden dark:block`), donc aucune prop de thème à passer.
 */

import { FileSpreadsheet, FileText, Table2 } from "lucide-react";
import { useLang } from "../lib/i18n";

/* ──────────────────────────────────────────────────────────────────────────
   Fonds
   ────────────────────────────────────────────────────────────────────────── */

/* ══ LES COULEURS SE METTENT À BOUGER ═══════════════════════════════════════
 *  Client 2026-08-07, pour la première carte d'« Automatisez de bout en bout » :
 *  « j'aimerais que le design à droite soit animé par rapport à ses couleurs à
 *  l'intérieur, un peu à l'idée du design de l'encadré Évaluation financière ».
 *
 *  L'IDÉE est bien celle de ValuationCard : on ne déplace rien DANS le cadre, on
 *  fait glisser le dégradé lui-même derrière une fenêtre fixe. Le MOYEN, lui,
 *  diffère — voir juste en dessous, la version périodique a été refusée.
 *
 *  UN POINT COMMUN AUX DEUX : LA TACHE CLAIRE NE BOUGE PAS. C'est le point de
 *  lumière de la composition, hérité de la référence ; s'il glissait avec la
 *  couleur, le panneau respirerait entier au lieu de laisser passer une teinte.
 *  Elle vit donc sur son propre calque, fixe, par-dessus la nappe mobile.
 */

/*  ⚠ LA PÉRIODICITÉ A ÉTÉ ESSAYÉE ET REFUSÉE le 2026-08-07 : « je ne veux pas
 *  que tu changes le design original, mais juste que les couleurs bougent ».
 *  Un `repeating-linear-gradient` en palindrome faisait bien bouger la couleur,
 *  mais il en montrait DEUX passages — deux zones bleues dans le cadre — là où
 *  la référence n'en a qu'un. Le mouvement était juste, la composition non.
 *
 *  LA RÉPONSE : garder le dégradé D'ORIGINE, non répété, et le faire GLISSER
 *  derrière le cadre. À chaque instant on voit un seul passage bleu → teal,
 *  exactement celui de la référence ; ce sont ses proportions qui respirent.
 *
 *  Deux détails rendent l'illusion exacte :
 *
 *  1. LA NAPPE FAIT 130 % DU CADRE, et les arrêts sont REMAPPÉS pour que la
 *     fenêtre visible reproduise le dégradé d'origine AU REPOS. Un arrêt à x %
 *     de la référence se pose à 11,5 + x × 0,77 sur la nappe. Vérifiable : 0 %
 *     tombe à 11,5 %, 100 % à 88,5 %, soit exactement les bords de la fenêtre.
 *     Sans ce remappage, la nappe agrandie aurait « dézoomé » le dégradé et les
 *     teintes des coins auraient changé.
 *  2. LE MOUVEMENT VA-ET-VIENT (`alternate`) au lieu de boucler. Un dégradé non
 *     répété n'a pas de période : le faire défiler dans un seul sens finirait
 *     par sortir de la matière. En alternant, il n'y a jamais de raccord, donc
 *     jamais de couture à masquer.
 *
 *  Le déplacement suit l'AXE du dégradé — (sin θ, −cos θ) — sinon une partie du
 *  mouvement se ferait le long des bandes, là où rien ne change de couleur.
 */

/*  ── LES COULEURS INTERAGISSENT ENTRE ELLES ────────────────────────────────
 *  Client 2026-08-07 : « je veux que ce design soit animé par rapport à ses
 *  couleurs à l'intérieur, qu'elles soient mouvantes, comme si elles
 *  interagissaient entre elles ».
 *
 *  LE GLISSEMENT SEUL NE SUFFISAIT PAS, et il ne pouvait pas suffire : déplacer
 *  un dégradé d'un bloc bouge TOUTES ses couleurs ensemble, du même vecteur, à
 *  la même vitesse. Leur rapport ne change jamais, donc rien n'a l'air de
 *  s'influencer — c'est une image qui se décale, pas une matière qui vit.
 *
 *  Pour que deux couleurs paraissent interagir, il faut qu'elles bougent
 *  SÉPARÉMENT. Trois masses de couleur sont donc posées par-dessus le dégradé,
 *  une bleue, une teal, une pâle, chacune avec sa trajectoire, sa respiration et
 *  SA PROPRE HORLOGE. Là où deux d'entre elles se recouvrent, la teinte bascule ;
 *  quand elles s'écartent, elle revient. C'est ce recouvrement variable qu'on lit
 *  comme une interaction.
 *
 *  ⚠ LES TROIS DURÉES SONT PREMIÈRES — 23, 31 et 41 secondes. Avec des durées
 *  qui partagent un diviseur, les trois masses se retrouveraient périodiquement
 *  dans la même configuration et l'œil finirait par reconnaître la boucle. Là,
 *  la figure complète ne se répète qu'au bout de 23 × 31 × 41 secondes, soit un
 *  peu plus de huit heures : jamais, à l'échelle d'une visite.
 *
 *  Les teintes sont celles du dégradé, pas d'autres : la composition reste le
 *  bleu-vers-teal de la référence, ce sont ses frontières qui vivent.
 *
 *  Tout passe par `transform` : les masses sont rastérisées une fois puis
 *  déplacées par le compositeur, sans repeindre. Un `background-position` animé
 *  aurait donné le même dessin en repeignant à chaque image. */

const DS_CSS = `
@keyframes dsPanel {
  from { transform: translate(-3.3%, -3.7%); }
  to   { transform: translate(3.3%, 3.7%); }
}
@keyframes dsPreview {
  from { transform: translate(-2.4%, -4.4%); }
  to   { transform: translate(2.4%, 4.4%); }
}
@keyframes dsBlobA {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%      { transform: translate(9%, 12%) scale(1.14); }
}
@keyframes dsBlobB {
  0%, 100% { transform: translate(0, 0) scale(1.08); }
  50%      { transform: translate(-12%, -9%) scale(0.92); }
}
@keyframes dsBlobC {
  0%, 100% { transform: translate(0, 0) scale(1.04); }
  50%      { transform: translate(8%, -11%) scale(1.16); }
}
.ds-panel { animation: dsPanel 19s ease-in-out infinite alternate; will-change: transform; }
.ds-preview { animation: dsPreview 14s ease-in-out infinite alternate; will-change: transform; }
.ds-blob-a { animation: dsBlobA 23s ease-in-out infinite; will-change: transform; }
.ds-blob-b { animation: dsBlobB 31s ease-in-out infinite; will-change: transform; }
.ds-blob-c { animation: dsBlobC 41s ease-in-out infinite; will-change: transform; }
@media (prefers-reduced-motion: reduce) {
  .ds-panel, .ds-preview, .ds-blob-a, .ds-blob-b, .ds-blob-c { animation: none; }
}
`;

/** Panneau : le dégradé d'origine, aux teintes ET à l'angle d'origine, avec les
 *  seuls arrêts remappés sur la nappe de 130 %. */
const PANEL_FLOW_LIGHT =
  "linear-gradient(138deg, #8fb2f4 11.5%, #a6c7f7 31.5%, #bcdcf1 54.6%, #a5dbd3 76.2%, #8fd0c7 88.5%)";
const PANEL_FLOW_DARK =
  "linear-gradient(138deg, #17325f 11.5%, #1b3a6b 31.5%, #1a4260 54.6%, #14484c 76.2%, #114a4c 88.5%)";

/** La grande tache claire de la référence, séparée et FIXE. */
const PANEL_GLOW_LIGHT = "radial-gradient(62% 52% at 44% 66%, rgba(255,255,255,0.62), transparent 72%)";
const PANEL_GLOW_DARK = "radial-gradient(62% 52% at 44% 66%, rgba(148,197,255,0.16), transparent 72%)";

/** Aperçu du livrable : même famille, un cran plus soutenu. Arrêts remappés
 *  selon la même règle (11,5 + x × 0,77). */
const PREVIEW_FLOW_LIGHT =
  "linear-gradient(152deg, #9cbdf8 11.5%, #a9cdf6 37.7%, #8ed3cd 71.6%, #7ccdc4 88.5%)";
const PREVIEW_FLOW_DARK =
  "linear-gradient(152deg, #24406f 11.5%, #21456a 37.7%, #175055 71.6%, #135054 88.5%)";

const PREVIEW_GLOW_LIGHT = "radial-gradient(58% 46% at 34% 62%, rgba(255,255,255,0.72), transparent 70%)";
const PREVIEW_GLOW_DARK = "radial-gradient(58% 46% at 34% 62%, rgba(148,197,255,0.20), transparent 70%)";

/** Nappe qui glisse : 130 % du cadre, centrée par un débord de 15 % sur les
 *  quatre côtés. Le va-et-vient ne dépasse jamais 4,4 %, donc aucun bord ne peut
 *  entrer dans le cadre — il reste plus de trois fois la marge nécessaire. */
function Nappe({ cls, fond }: { cls: string; fond: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className={cls} style={{ position: "absolute", inset: "-15%", background: fond }} />
    </div>
  );
}

/** Les masses de couleur qui se recouvrent. Chacune déborde largement du cadre
 *  (`inset: -25%`) : une masse dont on verrait le bord cesserait d'être une
 *  nuance du fond pour devenir une forme posée dessus. */
function Masses({ a, b, c }: { a: string; b: string; c: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="ds-blob-a absolute"
        style={{ inset: "-25%", background: `radial-gradient(40% 40% at 30% 34%, ${a}, transparent 70%)` }}
      />
      <div
        className="ds-blob-b absolute"
        style={{ inset: "-25%", background: `radial-gradient(44% 44% at 72% 72%, ${b}, transparent 72%)` }}
      />
      <div
        className="ds-blob-c absolute"
        style={{ inset: "-25%", background: `radial-gradient(36% 36% at 58% 18%, ${c}, transparent 68%)` }}
      />
    </div>
  );
}

/** Aperçu statique, gardé pour les deux vignettes de la barre latérale : elles
 *  font 6 % de la largeur du panneau, une nappe animée n'y serait qu'un
 *  clignotement, et il y en a une par diapositive. */
const PREVIEW_LIGHT = `${PREVIEW_GLOW_LIGHT}, linear-gradient(152deg, #9cbdf8 0%, #a9cdf6 34%, #8ed3cd 78%, #7ccdc4 100%)`;
const PREVIEW_DARK = `${PREVIEW_GLOW_DARK}, linear-gradient(152deg, #24406f 0%, #21456a 34%, #175055 78%, #135054 100%)`;

/* ──────────────────────────────────────────────────────────────────────────
   Petites pièces
   ────────────────────────────────────────────────────────────────────────── */

/** Pastille de fichier citée dans la demande (icône teintée + libellé). */
function Chip({
  icon: Icon,
  tone,
  children,
}: {
  icon: typeof FileText;
  tone: "blue" | "teal";
  children: React.ReactNode;
}) {
  const box =
    tone === "blue"
      ? "bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300"
      : "bg-teal-50 text-teal-600 dark:bg-teal-500/20 dark:text-teal-300";
  const text =
    tone === "blue" ? "text-blue-600 dark:text-blue-300" : "text-teal-600 dark:text-teal-300";

  return (
    <span className="inline-flex items-center gap-[0.7cqw] whitespace-nowrap align-middle">
      <span className={`inline-flex h-[2.7cqw] w-[2.7cqw] items-center justify-center rounded-[0.8cqw] ${box}`}>
        <Icon className="h-[1.7cqw] w-[1.7cqw]" />
      </span>
      <span className={`font-semibold ${text}`}>{children}</span>
    </span>
  );
}

/** Vignette de page dans le rail de gauche. */
function PageThumb({ index, active }: { index: number; active: boolean }) {
  return (
    <div className="flex items-center gap-[1cqw]">
      <span className="w-[1.6cqw] text-right font-inter text-[1.35cqw] text-[#111827]/35 dark:text-white/35">
        {index}
      </span>
      <div
        className={`relative h-[9.4cqw] flex-1 overflow-hidden rounded-[0.9cqw] ${
          active
            ? "bg-white ring-[0.28cqw] ring-blue-500/70 dark:bg-white/15"
            : "bg-white/75 ring-[0.14cqw] ring-white/60 dark:bg-white/[0.07] dark:ring-white/10"
        }`}
      >
        {active ? (
          <>
            <div className="absolute inset-x-[0.6cqw] top-[0.7cqw] h-[0.45cqw] rounded-full bg-[#111827]/25 dark:bg-white/30" />
            <div
              className="absolute inset-x-[0.6cqw] bottom-[0.6cqw] top-[2cqw] rounded-[0.5cqw] dark:hidden"
              style={{ background: PREVIEW_LIGHT }}
            />
            <div
              className="absolute inset-x-[0.6cqw] bottom-[0.6cqw] top-[2cqw] hidden rounded-[0.5cqw] dark:block"
              style={{ background: PREVIEW_DARK }}
            />
          </>
        ) : (
          <div className="flex h-full flex-col justify-center gap-[0.7cqw] px-[0.8cqw]">
            <div className="h-[0.4cqw] w-[70%] rounded-full bg-[#111827]/15 dark:bg-white/20" />
            <div className="h-[0.4cqw] w-full rounded-full bg-[#111827]/10 dark:bg-white/10" />
            <div className="h-[0.4cqw] w-[85%] rounded-full bg-[#111827]/10 dark:bg-white/10" />
            <div className="h-[0.4cqw] w-[45%] rounded-full bg-[#111827]/10 dark:bg-white/10" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Composant
   ────────────────────────────────────────────────────────────────────────── */

export default function DownloadShowcase({ className = "" }: { className?: string }) {
  const { t, lang } = useLang();

  return (
    <div
      data-shot="showcase"
      className={`relative mx-auto aspect-square w-full max-w-[600px] overflow-hidden rounded-[4cqw] text-left ${className}`}
      style={{ containerType: "inline-size" }}
    >
      <style>{DS_CSS}</style>

      {/* Fond du panneau, en TROIS ÉTAGES et dans cet ordre précis :
            1. la nappe du dégradé, qui glisse en bloc ;
            2. les masses de couleur, qui se recouvrent et font vivre la
               frontière bleu / teal ;
            3. la tache claire, FIXE, qui reste le point de lumière.
          Inverser 2 et 3 mettrait les masses par-dessus la lumière et le
          panneau perdrait son relief. Un calque par thème, comme avant. */}
      <div className="absolute inset-0 dark:hidden" aria-hidden="true">
        <Nappe cls="ds-panel" fond={PANEL_FLOW_LIGHT} />
        <Masses a="rgba(143,178,244,0.55)" b="rgba(143,208,199,0.5)" c="rgba(188,220,241,0.45)" />
        <div className="absolute inset-0" style={{ background: PANEL_GLOW_LIGHT }} />
      </div>
      <div className="absolute inset-0 hidden dark:block" aria-hidden="true">
        <Nappe cls="ds-panel" fond={PANEL_FLOW_DARK} />
        <Masses a="rgba(23,50,95,0.6)" b="rgba(17,74,76,0.55)" c="rgba(26,66,96,0.5)" />
        <div className="absolute inset-0" style={{ background: PANEL_GLOW_DARK }} />
      </div>

      {/* ── La demande, posée en haut ─────────────────────────────────────── */}
      <div className="absolute left-[6.3cqw] right-[6.3cqw] top-[14cqw] rounded-[3.6cqw] bg-white px-[4.4cqw] py-[3.4cqw] shadow-[0_2cqw_5cqw_-1.6cqw_rgba(15,23,42,0.28)] dark:bg-[#111827]">
        <p className="font-inter text-[2.7cqw] leading-[1.65] text-[#111827] dark:text-gray-100">
          {lang === "fr" ? (
            <>
              Reprenez le{" "}
              <Chip icon={FileText} tone="blue">
                FEC 2025
              </Chip>
              , la{" "}
              <Chip icon={Table2} tone="teal">
                balance
              </Chip>{" "}
              et le{" "}
              <Chip icon={FileSpreadsheet} tone="blue">
                grand livre
              </Chip>{" "}
              de Nexio SAS et préparez le bilan développé
            </>
          ) : (
            <>
              Take the{" "}
              <Chip icon={FileText} tone="blue">
                FEC 2025
              </Chip>
              , the{" "}
              <Chip icon={Table2} tone="teal">
                trial balance
              </Chip>{" "}
              and the{" "}
              <Chip icon={FileSpreadsheet} tone="blue">
                general ledger
              </Chip>{" "}
              for Nexio SAS and build the detailed balance sheet
            </>
          )}
        </p>
      </div>

      {/* ── La fenêtre de l'application, débordante à droite et en bas ────── */}
      <div className="absolute bottom-[-9cqw] left-[16cqw] right-[-3cqw] top-[37.5cqw] flex flex-col overflow-hidden rounded-[2.4cqw] bg-white/65 shadow-[0_2cqw_6cqw_-2cqw_rgba(15,23,42,0.30)] ring-[0.16cqw] ring-white/60 backdrop-blur-[2px] dark:bg-white/[0.07] dark:ring-white/10">
        {/* Onglets */}
        <div className="flex shrink-0 items-center gap-[1.2cqw] px-[1.8cqw] pt-[1.8cqw]">
          <span className="inline-flex items-center gap-[1cqw] rounded-[1.2cqw] px-[1.6cqw] py-[0.9cqw] font-inter text-[1.85cqw] font-medium text-[#111827]/45 dark:text-white/45">
            <span className="h-[1.7cqw] w-[1.7cqw] rounded-[0.5cqw] bg-[#111827]/15 dark:bg-white/20" />
            {t({ fr: "Synthèse", en: "Summary" })}
          </span>
          <span className="inline-flex items-center gap-[1cqw] rounded-[1.2cqw] bg-white px-[1.6cqw] py-[0.9cqw] font-inter text-[1.85cqw] font-semibold text-[#111827] shadow-[0_0.4cqw_1.2cqw_-0.6cqw_rgba(15,23,42,0.25)] dark:bg-[#111827] dark:text-white">
            <span className="h-[1.7cqw] w-[1.7cqw] rounded-[0.5cqw] bg-gradient-to-r from-[#3b82f6] to-[#0d9488]" />
            {t({ fr: "Bilan développé", en: "Detailed balance sheet" })}
          </span>
        </div>

        {/* Rail des pages + aperçu du livrable */}
        {/* La rangée occupe toute la hauteur restante : l'aperçu et le rail
            sont donc coupés par le bas du panneau, comme dans la référence. */}
        <div className="mt-[1.6cqw] flex min-h-0 flex-1 gap-[1.8cqw] pl-[1.8cqw]">
          <div className="flex w-[13cqw] shrink-0 flex-col gap-[1.1cqw]">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <PageThumb key={n} index={n} active={n === 1} />
            ))}
          </div>

          {/* LA GRANDE DIAPOSITIVE défile elle aussi, sur sa propre période et
              sa propre horloge (14 s contre 19 s pour le panneau). Deux durées
              PREMIÈRES l'une par rapport à l'autre plutôt qu'un rapport simple :
              si elles se recalaient périodiquement, l'œil finirait par attraper
              le battement et lirait deux couches au lieu d'une matière. */}
          <div className="relative min-w-0 flex-1 overflow-hidden rounded-tl-[1.6cqw]">
            {/* Les mêmes masses que le panneau, et c'est voulu : ce sont les
                MÊMES classes, donc les mêmes horloges, donc les deux surfaces
                respirent en phase. Elles se lisent comme une seule matière vue à
                travers deux fenêtres, et non comme deux décors indépendants. */}
            <div className="absolute inset-0 dark:hidden">
              <Nappe cls="ds-preview" fond={PREVIEW_FLOW_LIGHT} />
              <Masses a="rgba(156,189,248,0.5)" b="rgba(124,205,196,0.5)" c="rgba(169,205,246,0.42)" />
              <div className="absolute inset-0" style={{ background: PREVIEW_GLOW_LIGHT }} />
            </div>
            <div className="absolute inset-0 hidden dark:block">
              <Nappe cls="ds-preview" fond={PREVIEW_FLOW_DARK} />
              <Masses a="rgba(36,64,111,0.55)" b="rgba(19,80,84,0.5)" c="rgba(33,69,106,0.45)" />
              <div className="absolute inset-0" style={{ background: PREVIEW_GLOW_DARK }} />
            </div>

            {/* Le bilan développé en filigrane : texture de loin, lecture de près */}
            <div className="absolute bottom-[15cqw] right-[6cqw] flex h-[22cqw] items-end gap-[2.2cqw] opacity-[0.22] dark:opacity-[0.13]">
              <div className="flex h-full w-[5.2cqw] flex-col overflow-hidden rounded-[0.5cqw]">
                <div className="h-[44%] bg-white" />
                <div className="h-[16%] bg-white/70" />
                <div className="h-[25%] bg-white/45" />
                <div className="h-[15%] bg-white/25" />
              </div>
              <div className="flex h-full w-[5.2cqw] flex-col overflow-hidden rounded-[0.5cqw]">
                <div className="h-[38%] bg-white" />
                <div className="h-[27%] bg-white/70" />
                <div className="h-[21%] bg-white/45" />
                <div className="h-[14%] bg-white/25" />
              </div>
            </div>

            <span className="absolute bottom-[13.5cqw] left-[3.4cqw] font-poppins text-[4.2cqw] font-medium tracking-[-0.02em] text-white/85 dark:text-white/70">
              {t({ fr: "Bilan développé", en: "Detailed balance sheet" })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
