import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  PieChart,
  TrendingUp,
  Building2,
  FileCheck,
  FileText,
  GitCompare,
  Lock,
  BarChart3,
  Calculator,
  LineChart,
  Table2,
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
const INDUSTRY_ORDER = ["comptable", "audit", "fonds", "banque"];

type Example = { icon: LucideIcon; label: string };

type Industry = {
  id: string;
  icon: LucideIcon;
  /** Solid color for the circular icon badge. */
  iconBg: string;
  name: string;
  tagline: string;
  examples: Example[];
};

export default function IndustrySelector({
  theme,
  openBooking,
}: {
  theme: "light" | "dark";
  // The per-industry solution pages aren't finished yet, so the CTA opens the
  // booking flow directly instead of routing to them.
  openBooking: () => void;
}) {
  const { t } = useLang();
  const [activeIdx, setActiveIdx] = useState(0);
  const dk = theme === "dark";

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
      id: "comptable",
      icon: Briefcase,
      iconBg: "bg-blue-500",
      name: t({ fr: "Expertise comptable", en: "Accounting firms" }),
      tagline: t({
        fr: "Ora reprend là où votre logiciel comptable s'arrête : tous vos contrôles Excel, automatisés.",
        en: "Ora picks up where your accounting software stops: all your Excel checks, automated.",
      }),
      examples: [
        {
          icon: GitCompare,
          label: t({
            fr: "Balances contrôlées et écarts détectés en quelques secondes",
            en: "Trial balances checked, discrepancies flagged in seconds",
          }),
        },
        {
          icon: FileCheck,
          label: t({
            fr: "Extraction de données depuis vos PDF et mise à jour automatique de vos fichiers",
            en: "Data extracted from your PDFs and your files updated automatically",
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
    {
      id: "audit",
      icon: PieChart,
      iconBg: "bg-emerald-500",
      name: t({ fr: "Audit", en: "Audit" }),
      tagline: t({
        fr: "Accélérez vos missions d'audit avec Ora.",
        en: "Speed up your audit engagements with Ora.",
      }),
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
      id: "fonds",
      icon: TrendingUp,
      iconBg: "bg-pink-500",
      name: t({ fr: "Fonds d'investissement", en: "Investment funds" }),
      tagline: t({
        fr: "Simplifiez le suivi de vos portefeuilles.",
        en: "Simplify your portfolio monitoring.",
      }),
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
        fr: "Optimisez vos analyses financières.",
        en: "Optimize your financial analyses.",
      }),
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
  ];

  const active = industries[activeIdx];

  const bg = dk ? "#0f172a" : "#ffffff";

  return (
    <section
      id="industries"
      className="relative py-24 md:py-32 px-6 md:px-12"
      style={{ backgroundColor: bg }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-14 md:mb-20">
          <h2 className="font-poppins font-semibold text-4xl md:text-[3.25rem] tracking-[-0.03em] leading-[1.1] text-[#111827] dark:text-white">
            {t({ fr: "Conçu pour ", en: "Built for " })}
            <span className="text-brand-gradient">
              {t({ fr: "votre métier.", en: "your industry." })}
            </span>
          </h2>
          <p className="mt-5 text-[clamp(1rem,2vw,1.125rem)] leading-[1.7] text-gray-500 dark:text-gray-400 font-inter max-w-2xl mx-auto">
            {t({
              fr: "Sélectionnez votre secteur pour découvrir des exemples concrets d'automatisations Ora.",
              en: "Pick your field to see concrete examples of what Ora automates.",
            })}
          </p>
        </div>

        {/* Two columns: pill list + content panel */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] gap-8 lg:gap-12 items-start">
          {/* LEFT — vertical industry pills (horizontal scroll on mobile) */}
          <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible -mx-6 px-6 lg:mx-0 lg:px-0 pb-1 lg:pb-0">
            {industries.map((ind, i) => {
              const Icon = ind.icon;
              const isActive = i === activeIdx;
              return (
                <button
                  key={ind.id}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={`flex items-center gap-3.5 px-5 py-4 rounded-2xl text-left transition-all duration-200 flex-shrink-0 lg:w-full ${
                    isActive
                      ? "bg-blue-50 dark:bg-white/[0.06] ring-1 ring-blue-200 dark:ring-white/10"
                      : "ring-1 ring-transparent hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${ind.iconBg}`}
                  >
                    <Icon className="w-[18px] h-[18px] text-white" strokeWidth={2.25} />
                  </div>
                  <span
                    className={`font-poppins font-semibold text-[15px] leading-snug whitespace-nowrap lg:whitespace-normal transition-colors duration-200 ${
                      isActive
                        ? "text-[#111827] dark:text-white"
                        : "text-gray-500 dark:text-white/55"
                    }`}
                  >
                    {ind.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* RIGHT — content panel for the active industry */}
          <div
            className="relative rounded-3xl border p-7 md:p-10 border-gray-200/70 dark:border-white/10"
            style={{
              background: dk
                ? "linear-gradient(135deg, rgba(59,130,246,0.06), rgba(13,148,136,0.05))"
                : "linear-gradient(135deg, #f7faff, #f3f9f8)",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <h3 className="font-poppins font-semibold text-2xl md:text-[1.85rem] tracking-[-0.03em] leading-[1.15] text-[#111827] dark:text-white">
                  {active.name}
                </h3>
                <p className="mt-2 font-inter text-[15px] md:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                  {active.tagline}
                </p>

                {/* Concrete automation examples */}
                <ul className="mt-7 flex flex-col gap-3">
                  {active.examples.map((ex) => {
                    const ExIcon = ex.icon;
                    return (
                      <li
                        key={ex.label}
                        className="flex items-center gap-3.5 rounded-2xl px-4 py-3.5 bg-white dark:bg-white/[0.04] border border-gray-200/60 dark:border-white/[0.07] shadow-sm"
                      >
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-[#3b82f6] to-[#0d9488]">
                          <ExIcon className="w-4 h-4 text-white" strokeWidth={2} />
                        </div>
                        <span className="font-inter font-medium text-[14px] md:text-[15px] text-[#111827] dark:text-white/90 leading-snug">
                          {ex.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {/* CTA → booking flow (the per-industry pages aren't live yet) */}
                <button
                  type="button"
                  onClick={openBooking}
                  className="group mt-8 inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-inter font-semibold text-white transition-all duration-150 hover:-translate-y-px active:translate-y-0 bg-gradient-to-r from-[#3b82f6] to-[#0d9488] shadow-[0_4px_20px_rgba(37,99,235,0.30)] hover:shadow-[0_6px_28px_rgba(37,99,235,0.45)]"
                >
                  {t({ fr: "Réserver un appel", en: "Book a call" })}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-[3px] transition-transform duration-150" />
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
