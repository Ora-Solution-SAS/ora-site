import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Globe,
  LayoutDashboard,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import { MockupHome, MockupManager } from "./AtlasMockups";
import { FileChipStrip } from "./StackingCards";
import AtlasSimulation from "./atlas-sim";
import InViewVideo from "./InViewVideo";
import ScaleToFit from "./ScaleToFit";
import ClosingDemo from "./ClosingDemo";

/**
 * Atlas showcase section — Monday.com "Un vrai impact" layout.
 *
 *   1. Brand-mark icon, centered at top
 *   2. Two-line headline ("Atlas." + tagline)
 *   3. Small "Discover Atlas" text link with arrow
 *   4. Two-column row:
 *       - Left  : vertical list of tab pills (icon badge + label).
 *                 Active tab gets a subtle white-on-white pill bg.
 *       - Right : the active app mockup inside a "framed" panel —
 *                 a gradient surface + glow halo — so the mockup
 *                 reads clearly against the pure-black section bg.
 *
 * The frame panel extends slightly beyond the column on desktop
 * (`lg:mr-[-80px]`) and the section uses `overflow-hidden`, so the
 * mockup feels like it spills toward the viewport edge — the same
 * "there's more here" effect Monday's hero uses.
 */

type TabId = "galaxy" | "dashboard" | "manager";

type Tab = {
  id: TabId;
  icon: LucideIcon;
  /** Solid color for the circular icon badge (Monday-style). */
  iconBg: string;
  label: string;
};

export default function AtlasShowcase() {
  const { t } = useLang();
  // Tab state for the lower demo area (pills above the Atlas video). Galaxy
  // shows the video; the other tabs reuse their mockups. The top mockup is no
  // longer tabbed — it always shows the interactive galaxy.
  const [bottomTab, setBottomTab] = useState<TabId>("galaxy");

  // Mobile gets a pure-black section background (night mode); desktop keeps the
  // original deep-navy radial gradient. Matches the md (768px) breakpoint.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const tabs: Tab[] = [
    {
      id: "galaxy",
      icon: Globe,
      iconBg: "bg-pink-500",
      label: t({
        fr: "Visualisez vos dossiers comme une galaxie",
        en: "See your folders as a galaxy",
      }),
    },
    {
      id: "dashboard",
      icon: LayoutDashboard,
      iconBg: "bg-blue-500",
      label: t({
        fr: "Pilotez votre activité en un coup d'œil",
        en: "Steer your work at a glance",
      }),
    },
    {
      id: "manager",
      icon: Users,
      iconBg: "bg-emerald-500",
      label: t({
        fr: "Coordonnez vos équipes en temps réel",
        en: "Coordinate your teams in real time",
      }),
    },
  ];

  return (
    <section
      id="atlas"
      data-nav-dark
      data-nav-shy
      className="relative z-[20] py-24 md:py-32 px-6 md:px-12 overflow-hidden"
      style={{
        background: isMobile
          ? "radial-gradient(ellipse at 50% 0%, #0a0a0a 0%, #000 55%, #000 100%)"
          : "radial-gradient(ellipse at 50% 0%, #0f1424 0%, #060810 55%, #000 100%)",
        // ── FLUIDITÉ DE LA REMONTÉE (client 2026-08-05 : « la remontée de la
        // partie Atlas est un peu buggée, fluidifie-la ») ──────────────────
        // La section n'est pas animée : elle défile normalement et passe
        // PAR-DESSUS la pile de cartes épinglées grâce à son `z-20`. C'est donc
        // au navigateur de la redessiner à chaque image du scroll, et c'était
        // cher : gradient radial plein écran, halo, cadre, et la simulation
        // Atlas entière dessous.
        //   · `translateZ(0)` la promeut en COUCHE de composition. Le
        //     rideau devient un simple déplacement de couche au lieu d'une
        //     repeinture, ce qui est exactement le mouvement recherché.
        //   · `contain: paint` promet au navigateur que rien ne déborde de la
        //     boîte — vrai, `overflow-hidden` est déjà là — donc il peut élaguer
        //     tout le dessin hors cadre au lieu de l'évaluer.
        // L'ombre portée haute, elle, est passée en calque (voir juste après) :
        // en `box-shadow` de 72 px de flou sur un bloc pleine largeur, elle
        // était re-floutée à chaque image, et c'était le poste le plus lourd.
        transform: "translateZ(0)",
        contain: "paint",
      }}
    >
      <style>{`
        @keyframes atlasStar{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        .atlas-star{animation:atlasStar 4.5s ease-in-out infinite;will-change:transform}
        @media (prefers-reduced-motion:reduce){.atlas-star{animation:none}}
      `}</style>

      {/* Ombre du bord haut, en dégradé plutôt qu'en `box-shadow` : le rendu à
          l'écran est le même, mais un dégradé est peint UNE fois dans la couche
          et se contente ensuite de bouger avec elle. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-16 md:h-24 -z-0"
        style={{ background: "linear-gradient(to bottom, rgba(2,6,23,0.42), transparent)" }}
      />
      {/* Scroll-triggered stagger entrance: each major block fades up
          when the section enters the viewport. `once: true` means the
          animation plays a single time (no replay when scrolling back).
          `margin: "-80px"` triggers slightly before the section is fully
          in view so the entrance feels anticipatory, not delayed. */}
      <motion.div
        className="max-w-7xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
        }}
      >
        {/* Atlas brand visual — star-trail decorative image.
            Custom entrance overrides the generic fadeInUp:
              - Spring physics: small overshoot for a satisfying "landing"
              - Scales up from 0.4 + rotates from -25° → 0° + fades in
            Once landed, the inner img loops a gentle floating motion
            (translateY ±6px over 4s) so the star feels "alive" without
            stealing attention from the headline. */}
        <motion.div
          className="flex justify-center mb-7"
          variants={{
            hidden: { opacity: 0, scale: 0.3, rotate: -35 },
            visible: {
              opacity: 1,
              scale: 1,
              rotate: 0,
              // Slower spring (lower stiffness, higher mass) → entrance
              // takes ~1.4s so the user actually sees the scale+rotate
              // happen as they scroll into the section. Slight overshoot
              // preserved for the "satisfying landing" feel.
              transition: {
                type: "spring",
                stiffness: 45,
                damping: 14,
                mass: 1.4,
              },
            },
          }}
        >
          {/* Flottement passé de Framer Motion à une ANIMATION CSS : la boucle
              était infinie, donc un rappel JavaScript à chaque image pendant
              toute la durée de vie de la page, y compris section hors écran.
              En CSS, le compositeur la mène seul et la suspend hors écran. */}
          <img
            src="/logos/star-trail.png"
            alt=""
            aria-hidden
            className="atlas-star h-16 md:h-20 w-auto object-contain select-none pointer-events-none"
          />
        </motion.div>

        {/* Headline */}
        <motion.h2
          className="font-poppins font-medium text-4xl md:text-[3.75rem] tracking-[-0.03em] leading-[1.05] text-center max-w-3xl mx-auto"
          variants={fadeInUp}
        >
          <span className="block text-white">{t({ fr: "Atlas.", en: "Atlas." })}</span>
          <span className="block text-white mt-1">
            {t({ fr: "Vos dossiers, en orbite.", en: "Your folders, in orbit." })}
          </span>
        </motion.h2>

        {/* Discover link */}
        <motion.div
          className="flex justify-center mt-8 mb-14 md:mb-20"
          variants={fadeInUp}
        >
          <button
            type="button"
            className="group inline-flex items-center gap-2 text-[14px] font-semibold font-inter text-white/70 hover:text-white transition-colors duration-150"
          >
            {t({ fr: "Découvrez Atlas", en: "Discover Atlas" })}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-[2px] transition-transform duration-150" />
          </button>
        </motion.div>

        {/* Full-width interactive app screen (no tabs — the galaxy is the
            single hero mockup here; feature switching lives in the lower
            demo, below the paragraph). */}
        <motion.div variants={fadeInUp}>
          {/* Framed app screen — tighter frame that hugs the screen, centered,
              fits without side-scroll. */}
          <div className="relative w-full max-w-[1052px] mx-auto">
            {/* Soft sky-blue halo behind the frame (pure radial gradient,
                no blur filter — avoids scroll-time repaints). */}
            <div
              aria-hidden
              className="absolute -inset-3 lg:-inset-5 -z-10 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 45%, rgba(125,211,252,0.26) 0%, rgba(96,165,250,0.15) 35%, rgba(56,189,248,0.06) 60%, transparent 80%)",
              }}
            />

            <div
              className="relative rounded-3xl overflow-hidden p-3 md:p-4"
              style={{
                background:
                  "linear-gradient(135deg, rgba(186,230,253,0.14) 0%, rgba(147,197,253,0.09) 50%, rgba(186,230,253,0.14) 100%)",
                border: "1px solid rgba(186,230,253,0.22)",
                boxShadow:
                  "0 28px 72px rgba(56,189,248,0.28), 0 10px 36px rgba(96,165,250,0.18), 0 3px 14px rgba(56,189,248,0.10), inset 0 1px 0 rgba(255,255,255,0.07)",
              }}
            >
              {/* Scales the 1020px simulation down to fit on narrow screens
                  (centered at full size on desktop). Faithful replica of the
                  real Atlas software per docs/atlas-site-simulation-brief.md. */}
              <ScaleToFit>
                <AtlasSimulation />
              </ScaleToFit>
            </div>
          </div>
        </motion.div>

        {/* ── Bloc explicatif — MISE EN PAGE MONDAY (client 2026-08-05 :
            « améliore le layout de la partie Le dossier complet orchestré et
            traçable, je trouve ça affreux, prends l'exemple de monday.com »)
            ────────────────────────────────────────────────────────────────
            Ma version précédente empilait trois blocs CENTRÉS de largeurs
            différentes — un titre, une phrase, une rangée de pastilles, puis
            une grille de trois colonnes — sous une maquette elle aussi centrée.
            Quatre axes de centrage à la suite, aucune colonne commune : ça ne
            faisait pas une mise en page, ça faisait un empilement.

            Monday ne centre presque jamais ce genre de bloc. Sa grammaire, ici
            reprise : DEUX colonnes, tout aligné à gauche sur une même verticale,
            le discours d'un côté et les preuves de l'autre. La colonne de droite
            est une LISTE séparée par des filets, pas une grille : trois lignes se
            lisent de haut en bas, alors que trois colonnes obligent l'œil à
            repartir à gauche à chaque fois.

            Les pastilles de formats restent (demande du 2026-08-05), mais sous
            le paragraphe et alignées avec lui, au lieu de flotter au centre. */}
        <motion.div
          className="mt-20 md:mt-28 grid lg:grid-cols-2 gap-x-16 gap-y-12 items-start text-left"
          variants={fadeInUp}
        >
          <div>
            {/* Titre donné par le client le 2026-08-07. Mesure élargie de 13
                à 22 caractères et corps plafonné à 3 rem : la phrase est deux
                fois plus longue que « Le dossier complet, orchestré et
                traçable » qu'elle remplace, et serait tombée sur six lignes
                dans l'ancien gabarit. */}
            <h3 className="font-poppins font-semibold tracking-[-0.03em] leading-[1.08] text-white text-[clamp(1.9rem,3.4vw,3rem)] max-w-[22ch]">
              {t({
                fr: "Création de système d'orchestration sur mesure pour votre organisation avec Atlas",
                en: "Custom orchestration systems built for your organisation, with Atlas",
              })}
            </h3>
            <p className="mt-6 font-inter text-base md:text-lg leading-[1.7] text-gray-300 max-w-[46ch]">
              {t({
                fr: "Atlas transforme un dossier de deal ou de mission en une carte vivante, sans jamais quitter Excel.",
                en: "Atlas turns a deal or engagement dossier into a living map, without ever leaving Excel.",
              })}
            </p>
            <div className="mt-10">
              <FileChipStrip />
            </div>
          </div>

          <div className="lg:pt-2">
            {[
              {
                t: t({ fr: "Chaque fichier relié", en: "Every file linked" }),
                d: t({
                  fr: "Un document est rattaché à ses sources, ses dérivés et ses livrables. La lignée complète d'un chiffre, de la donnée brute au livrable final.",
                  en: "A document is attached to its sources, its derivatives and its deliverables. The full lineage of a figure, from raw data to final deliverable.",
                }),
              },
              {
                t: t({ fr: "Le statut d'un coup d'œil", en: "Status at a glance" }),
                d: t({
                  fr: "Vous voyez où en est chaque document et ce qui reste à valider, sans ouvrir les fichiers un par un.",
                  en: "See where each document stands and what is still to validate, without opening files one by one.",
                }),
              },
              {
                t: t({ fr: "Un journal par document", en: "A log per document" }),
                d: t({
                  fr: "Qui a fait quoi, et quand. Chaque document porte son propre journal d'audit, consultable à tout moment.",
                  en: "Who did what, and when. Every document carries its own audit trail, available at any time.",
                }),
              },
            ].map((c, i) => (
              <div
                key={c.t}
                className={`py-7 first:pt-0 ${i > 0 ? "border-t border-white/[0.12]" : ""}`}
              >
                <h4 className="font-poppins font-semibold text-[18px] md:text-[19px] tracking-[-0.01em] text-white">
                  {c.t}
                </h4>
                <p className="mt-2.5 font-inter text-[15px] md:text-base leading-relaxed text-gray-400 max-w-[52ch]">
                  {c.d}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Démo complète (ora-1.mp4) — déplacée ici depuis le bas de la
            landing (client 2026-07-28) : juste sous le paragraphe, sur le
            fond noir de la section. */}
        <ClosingDemo embedded />

        {/* Lower tabbed demo (TabPills + 3 video/mockup carousel) — hidden for
            now at the client's request. Flip `false` to `true` to restore. */}
        {false && (
        <motion.div className="mt-14 md:mt-16" variants={fadeInUp}>
          <TabPills tabs={tabs} active={bottomTab} onSelect={setBottomTab} />

          <div className="relative max-w-5xl mx-auto">
            {/* No surrounding frame — the cards float directly (Bubble-style),
                lifted only by a soft ambient glow behind the active card. */}
            <div
              aria-hidden
              className="absolute -inset-8 -z-10 pointer-events-none"
              style={{
                background:
                  "radial-gradient(48% 58% at 50% 50%, rgba(96,165,250,0.22) 0%, rgba(56,189,248,0.10) 46%, transparent 76%)",
              }}
            />
            {/* Stage — Bubble-style carousel with NO frame: the active card is
                centred, neighbours peek on the sides, clipped only by the
                section's own overflow. */}
            <div className="relative w-full" style={{ aspectRatio: "16 / 10" }}>
                {tabs.map((tab, i) => {
                  const activeI = tabs.findIndex((t) => t.id === bottomTab);
                  const offset = i - activeI;
                  const isActive = offset === 0;
                  // Coverflow WITHOUT wrap-around: only the IMMEDIATE neighbours
                  // peek. So the first tab shows just a right peek, the last just
                  // a left peek, and the middle ("Pilotez") shows both.
                  const isPeek = offset === 1 || offset === -1;
                  // Horizontal track: each card sits one ~104% "step" left/right
                  // of centre, so cards slide in from the correct side.
                  const x = `${-50 + offset * 104}%`;
                  return (
                    <motion.div
                      key={tab.id}
                      className="absolute top-1/2 left-1/2 w-[74%] rounded-2xl overflow-hidden ring-1 ring-black/[0.06] bg-white shadow-[0_24px_56px_-22px_rgba(8,12,28,0.55)]"
                      style={{
                        aspectRatio: "16 / 10",
                        zIndex: isActive ? 3 : 2,
                      }}
                      initial={false}
                      animate={{
                        opacity: isActive ? 1 : isPeek ? 0.5 : 0,
                        scale: isActive ? 1 : 0.72,
                        x,
                        y: "-50%",
                        filter: isActive ? "blur(0px)" : "blur(3px)",
                      }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {tab.id === "galaxy" ? (
                        <InViewVideo
                          src="/ora_atlas.mp4"
                          className="absolute inset-0 w-full h-full object-cover block"
                        />
                      ) : (
                        // Mockups are taller than the 16/10 card: anchor to the
                        // top so the meaningful header + cards show (cropped at
                        // the bottom, like a windowed screenshot).
                        <div className="absolute inset-x-0 top-0">
                          <ScaleToFit>
                            {tab.id === "dashboard" ? <MockupHome /> : <MockupManager />}
                          </ScaleToFit>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
          </div>
        </motion.div>
        )}
      </motion.div>
    </section>
  );
}

/** Horizontal row of feature tab pills (icon badge + label). Shared by the
    interactive mockup (top) and the demo-video area (below the paragraph). */
function TabPills({
  tabs,
  active,
  onSelect,
}: {
  tabs: Tab[];
  active: TabId;
  onSelect: (id: TabId) => void;
}) {
  return (
    <div className="flex justify-center mb-10 md:mb-14">
      {/* One unified rounded selector (Bubble-style): the active tab is an
          outlined pill, the others are plain text inside the same track. */}
      <div className="inline-flex flex-wrap justify-center items-center gap-1.5 p-1.5 rounded-full border border-white/[0.12] bg-white/[0.03]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelect(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full transition-all duration-200 ${
                isActive
                  ? "border border-white/70 bg-white/[0.07]"
                  : "border border-transparent hover:bg-white/[0.05]"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${tab.iconBg}`}
              >
                <Icon className="w-[15px] h-[15px] text-white" strokeWidth={2.25} />
              </div>
              <span
                className={`font-poppins font-semibold text-[13px] md:text-[14px] leading-snug whitespace-nowrap transition-colors duration-200 ${
                  isActive ? "text-white" : "text-white/55 hover:text-white/80"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Fade-up entrance — used by every staggered child in the section. */
const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
  },
};
