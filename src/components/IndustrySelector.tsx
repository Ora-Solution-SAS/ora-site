import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Check,
  PieChart,
  TrendingUp,
  Building2,
  FileCheck,
  FileText,
  GitCompare,
  Lock,
  BarChart3,
  Calculator,
  Combine,
  LineChart,
  Table2,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import { animatedScrollToId } from "@/lib/scrollTo";

/**
 * Industry selector — lets the visitor pick their field (accounting,
 * audit, investment funds, investment banking), see a few concrete
 * automation examples for it, and jump to the dedicated solution page.
 *
 * Layout mirrors the Atlas showcase: a vertical pill list on the left,
 * a content panel on the right. Selecting a pill crossfades the panel.
 * Each panel ends with a CTA that routes to the matching solution page.
 */

// Branch order — must match the `industries` array below. Used to resolve the
// id sent by the "Solutions" nav menu (via the `ora:select-industry` event)
// into the active tab index.
const INDUSTRY_ORDER = ["fonds", "banque", "audit", "comptable"];

type Example = { icon: LucideIcon; label: string };

type Industry = {
  id: string;
  icon: LucideIcon;
  /** Solid color for the circular icon badge. */
  iconBg: string;
  name: string;
  tagline: string;
  /** Headline time-saving for this sector. NOTE: illustrative figures —
   *  confirm each reflects a real, defensible estimate before going live. */
  metric: { value: string; label: string };
  examples: Example[];
};

export default function IndustrySelector({
  openBooking,
}: {
  theme: "light" | "dark";
  // The per-industry solution pages aren't finished yet, so the CTA opens the
  // booking flow directly instead of routing to them.
  openBooking: () => void;
}) {
  const { t } = useLang();
  const [activeIdx, setActiveIdx] = useState(0);
  // This section is intentionally always rendered on a dark/black background,
  // independent of the site theme — the markup below hard-codes the dark styling.

  // Mobile uses pure black; desktop keeps the original near-black (#06070a).
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Triggered by the "Solutions" nav menu: select the requested branch and
  // scroll here with the shared accelerating animation (slow start, faster and
  // faster).
  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent).detail?.id as string | undefined;
      const idx = id ? INDUSTRY_ORDER.indexOf(id) : -1;
      if (idx >= 0) setActiveIdx(idx);
      animatedScrollToId("industries");
    };
    window.addEventListener("ora:select-industry", handler);
    return () => window.removeEventListener("ora:select-industry", handler);
  }, []);

  const industries: Industry[] = [
    {
      id: "fonds",
      icon: TrendingUp,
      iconBg: "bg-pink-500",
      name: t({ fr: "Fonds d'investissement", en: "Investment funds" }),
      tagline: t({
        fr: "Votre NAV et votre reporting consolidé, prêts chaque matin, sans retraitement.",
        en: "Your NAV and consolidated reporting, ready every morning, with no rework.",
      }),
      metric: {
        value: t({ fr: "Des heures → minutes", en: "Hours → minutes" }),
        label: t({ fr: "par reporting de NAV", en: "per NAV report" }),
      },
      examples: [
        {
          icon: BarChart3,
          label: t({
            fr: "Reporting de portefeuille consolidé",
            en: "Consolidated portfolio reporting",
          }),
        },
        {
          icon: Calculator,
          label: t({
            fr: "Calcul de NAV automatisé",
            en: "Automated NAV calculation",
          }),
        },
        {
          icon: TrendingUp,
          label: t({
            fr: "Suivi de performance par position",
            en: "Performance tracking per holding",
          }),
        },
      ],
    },
    {
      id: "banque",
      icon: Building2,
      iconBg: "bg-amber-500",
      name: t({ fr: "Banque d'affaires", en: "Investment banking" }),
      tagline: t({
        fr: "Vos comparables et vos decks de valorisation, mis à jour directement à la source.",
        en: "Your comps and valuation decks, updated straight from the source.",
      }),
      metric: {
        value: t({ fr: "Des heures → minutes", en: "Hours → minutes" }),
        label: t({ fr: "par mise à jour de comparables", en: "per comps refresh" }),
      },
      examples: [
        {
          icon: LineChart,
          label: t({
            fr: "Modèles de valorisation mis à jour",
            en: "Valuation models kept up to date",
          }),
        },
        {
          icon: Table2,
          label: t({
            fr: "Comparables extraits et formatés",
            en: "Comparables extracted and formatted",
          }),
        },
        {
          icon: FileText,
          label: t({
            fr: "Decks de données financières générés",
            en: "Financial data decks generated",
          }),
        },
      ],
    },
    {
      id: "audit",
      icon: PieChart,
      iconBg: "bg-emerald-500",
      name: t({ fr: "Audit", en: "Audit" }),
      tagline: t({
        fr: "Vos feuilles de travail et vos rapprochements, prêts pendant que vous révisez.",
        en: "Your working papers and reconciliations, ready while you review.",
      }),
      metric: {
        value: t({ fr: "Des heures → minutes", en: "Hours → minutes" }),
        label: t({ fr: "par rapprochement", en: "per reconciliation" }),
      },
      examples: [
        {
          icon: FileCheck,
          label: t({
            fr: "Tests de cohérence sur vos échantillons",
            en: "Consistency tests across your samples",
          }),
        },
        {
          icon: FileText,
          label: t({
            fr: "Feuilles de travail générées automatiquement",
            en: "Working papers generated automatically",
          }),
        },
        {
          icon: GitCompare,
          label: t({
            fr: "Rapprochement grand livre / pièces justificatives",
            en: "Ledger vs supporting-documents reconciliation",
          }),
        },
      ],
    },
    {
      id: "comptable",
      icon: Briefcase,
      iconBg: "bg-blue-500",
      name: t({ fr: "Expertise comptable", en: "Accounting firms" }),
      tagline: t({
        fr: "Ora n'est pas un logiciel de comptabilité : c'est la passerelle qui automatise tous vos retraitements Excel répétitifs pour vous faire gagner du temps et vous recentrer sur votre vrai métier.",
        en: "Ora isn't accounting software: it's the bridge that automates all your repetitive Excel rework, so you save time and refocus on what you do best.",
      }),
      metric: {
        value: t({ fr: "Des heures → minutes", en: "Hours → minutes" }),
        label: t({ fr: "par fichier retraité", en: "per file reworked" }),
      },
      examples: [
        {
          icon: Table2,
          label: t({
            fr: "Fichiers clients hétérogènes remis en forme automatiquement",
            en: "Mismatched client files reformatted automatically",
          }),
        },
        {
          icon: Combine,
          label: t({
            fr: "Données éparpillées dans plusieurs fichiers, consolidées en un clic",
            en: "Data scattered across files, consolidated in one click",
          }),
        },
        {
          icon: Lock,
          label: t({
            fr: "Dossiers clients chiffrés et stockés en Suisse",
            en: "Client files encrypted and stored in Switzerland",
          }),
        },
      ],
    },
  ];

  const active = industries[activeIdx];
  const ActiveIcon = active.icon;

  const bg = isMobile ? "#000000" : "#06070a";

  return (
    <section
      id="industries"
      data-nav-shy
      className="dark relative py-24 md:py-32 px-6 md:px-12"
      style={{ backgroundColor: bg }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Heading — animated entrance on scroll */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -12% 0px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="font-poppins font-semibold text-4xl md:text-[3.25rem] tracking-[-0.03em] leading-[1.1] text-[#111827] dark:text-white">
            {t({ fr: "Éprouvé sur les secteurs les plus ", en: "Proven in the most " })}
            <span className="text-brand-gradient">
              {t({ fr: "exigeants.", en: "demanding sectors." })}
            </span>
          </h2>
          <p className="mt-5 text-[clamp(1rem,2vw,1.125rem)] leading-[1.7] text-gray-500 dark:text-gray-400 font-inter max-w-2xl mx-auto">
            {t({
              fr: "Audit, M&A, fonds, expertise comptable : là où la confidentialité et la précision ne tolèrent aucune erreur, Ora automatise déjà le travail Excel. Explorez les exemples par secteur.",
              en: "Audit, M&A, funds, accounting: where confidentiality and precision leave no room for error, Ora already automates the Excel work. Browse the examples by sector.",
            })}
          </p>
        </motion.div>

        {/* Industry tabs — unified segmented control with a sliding active
            pill (Framer shared-layout). Reads as one cohesive control rather
            than four floating buttons. */}
        <motion.div
          className="flex justify-center mb-10 md:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
        >
          <div className="inline-flex flex-wrap justify-center gap-1 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
            {industries.map((ind, i) => {
              const Icon = ind.icon;
              const isActive = i === activeIdx;
              return (
                <button
                  key={ind.id}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  className="relative flex items-center gap-2.5 px-3.5 md:px-4 py-2.5 rounded-xl transition-colors duration-200"
                >
                  {isActive && (
                    <motion.div
                      layoutId="industry-tab-active"
                      className="absolute inset-0 rounded-xl bg-white/[0.10] ring-1 ring-white/[0.14] shadow-[0_2px_14px_rgba(0,0,0,0.35)]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <div className={`relative w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${ind.iconBg}`}>
                    <Icon className="w-[15px] h-[15px] text-white" strokeWidth={2.25} />
                  </div>
                  <span
                    className={`relative font-poppins font-semibold text-[13px] md:text-[14px] whitespace-nowrap transition-colors duration-200 ${
                      isActive ? "text-white" : "text-white/55 hover:text-white/80"
                    }`}
                  >
                    {ind.name}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Active industry panel — two-column: identity + headline metric +
            CTA on the left, the concrete automation list on the right. */}
        <motion.div
          className="relative rounded-[28px] border border-white/10 overflow-hidden max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -8% 0px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          style={{
            background: "linear-gradient(135deg, rgba(59,130,246,0.07), rgba(13,148,136,0.05))",
          }}
        >
          {/* Hairline sheen along the top edge */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="grid md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] gap-8 md:gap-12 p-7 md:p-10 items-stretch"
            >
              {/* LEFT — identity, headline metric, CTA */}
              <div className="flex flex-col">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${active.iconBg} shadow-[0_6px_22px_rgba(0,0,0,0.35)]`}
                  >
                    <ActiveIcon className="w-6 h-6 md:w-7 md:h-7 text-white" strokeWidth={2.25} />
                  </div>
                  <h3 className="font-poppins font-semibold text-2xl md:text-[1.85rem] tracking-[-0.03em] leading-[1.1] text-white">
                    {active.name}
                  </h3>
                </div>

                <p className="mt-5 font-inter text-[15px] md:text-base text-gray-300/90 leading-relaxed">
                  {active.tagline}
                </p>

                {/* Headline time-saving stat + CTA, pinned to the bottom so
                    the column stays balanced across sectors. */}
                <div className="mt-auto pt-7">
                  <div className="inline-flex items-center gap-3 rounded-2xl pl-3 pr-5 py-3 bg-white/[0.04] border border-white/10">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-[#3b82f6] to-[#0d9488]">
                      <Timer className="w-4 h-4 text-white" strokeWidth={2.25} />
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="font-poppins font-semibold text-[15px] md:text-base text-white">
                        {active.metric.value}
                      </span>
                      <span className="font-inter text-[12.5px] text-gray-400">
                        {active.metric.label}
                      </span>
                    </div>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={openBooking}
                      className="group mt-6 inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-[15px] font-inter font-semibold text-white transition-all duration-150 hover:-translate-y-px active:translate-y-0 bg-gradient-to-r from-[#3b82f6] to-[#0d9488] shadow-[0_4px_20px_rgba(37,99,235,0.30)] hover:shadow-[0_6px_28px_rgba(37,99,235,0.45)]"
                    >
                      {t({ fr: "Réserver un appel", en: "Book a call" })}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-[3px] transition-transform duration-150" />
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT — concrete automations for this sector */}
              <div className="flex flex-col justify-center">
                <div className="text-[11px] font-inter font-semibold uppercase tracking-[0.16em] text-gray-500 mb-3">
                  {t({ fr: "Ce qu'Ora automatise", en: "What Ora automates" })}
                </div>
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] divide-y divide-white/[0.06] overflow-hidden">
                  {active.examples.map((ex) => {
                    const ExIcon = ex.icon;
                    return (
                      <div
                        key={ex.label}
                        className="group flex items-center gap-3.5 px-4 py-4 transition-colors duration-150 hover:bg-white/[0.035]"
                      >
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-[#3b82f6] to-[#0d9488] shadow-[0_2px_10px_rgba(37,99,235,0.25)]">
                          <ExIcon className="w-4 h-4 text-white" strokeWidth={2} />
                        </div>
                        <span className="font-inter font-medium text-[14px] md:text-[15px] text-white/90 leading-snug">
                          {ex.label}
                        </span>
                        <Check className="w-4 h-4 text-emerald-400/70 ml-auto flex-shrink-0" strokeWidth={2.5} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
