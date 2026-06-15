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
  Timer,
  Check,
  Minus,
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
  /** Headline time-saving for this sector. NOTE: illustrative figures —
   *  confirm each reflects a real, defensible estimate before going live. */
  metric: { value: string; label: string };
  examples: Example[];
};

// ── Cooperative "last-mile" comparison (accounting firms) ──────────────────
// Ora replaces neither the production software nor Excel; it automates the
// manual work that lives between them. Each row shows who covers what.
type CompareCell = "full" | "partial" | "manual" | "none";
type CompareRow = {
  task: { fr: string; en: string };
  prod: CompareCell; // production software (Cegid / Sage / Pennylane…)
  excel: CompareCell; // Excel by hand
  ora: CompareCell;
};

const COMPTABLE_COMPARE: CompareRow[] = [
  { task: { fr: "Tenue, saisie, production du FEC & liasse", en: "Bookkeeping, entry, FEC & tax bundle" }, prod: "full", excel: "none", ora: "none" },
  { task: { fr: "Contrôle de conformité du FEC (A47 A-1)", en: "FEC compliance check (A47 A-1)" }, prod: "partial", excel: "manual", ora: "full" },
  { task: { fr: "Lettrage & rapprochements", en: "Reconciliation & matching" }, prod: "partial", excel: "manual", ora: "full" },
  { task: { fr: "Balance âgée par tiers", en: "Aged balance by account" }, prod: "partial", excel: "manual", ora: "full" },
  { task: { fr: "Cadrage TVA (HT + TVA = TTC, taux FR)", en: "VAT reconciliation (net + VAT = gross)" }, prod: "none", excel: "manual", ora: "full" },
  { task: { fr: "Revue analytique N / N-1 par seuils", en: "Year-over-year analytical review" }, prod: "none", excel: "manual", ora: "full" },
  { task: { fr: "Anomalies, loi de Benford, échantillonnage", en: "Anomalies, Benford's law, sampling" }, prod: "none", excel: "none", ora: "full" },
  { task: { fr: "Fiabilisation des fichiers reçus", en: "Cleaning & vetting received files" }, prod: "none", excel: "manual", ora: "full" },
  { task: { fr: "Rapport PDF versable au dossier", en: "Audit-ready PDF report for the file" }, prod: "none", excel: "none", ora: "full" },
];

/** One comparison cell — section is always dark, so colors are light-on-dark. */
function CompareCellView({ v, partial, manual }: { v: CompareCell; partial: string; manual: string }) {
  if (v === "full")
    return (
      <span className="flex justify-center">
        <span className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center">
          <Check className="w-3.5 h-3.5 text-emerald-400" strokeWidth={3} />
        </span>
      </span>
    );
  if (v === "partial") return <span className="block text-center text-[11px] font-semibold text-amber-400">{partial}</span>;
  if (v === "manual") return <span className="block text-center text-[11px] font-medium text-white/45">{manual}</span>;
  return (
    <span className="flex justify-center text-white/25">
      <Minus className="w-3.5 h-3.5" strokeWidth={2.5} />
    </span>
  );
}

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
  // independent of the site theme, so force the dark styling on.
  const dk = true;

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
      metric: {
        value: t({ fr: "2 h → 3 min", en: "2 h → 3 min" }),
        label: t({ fr: "par contrôle de balance", en: "per trial-balance check" }),
      },
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
        fr: "Vos feuilles de travail et vos rapprochements, prêts pendant que vous révisez.",
        en: "Your working papers and reconciliations, ready while you review.",
      }),
      metric: {
        value: t({ fr: "3 h → 5 min", en: "3 h → 5 min" }),
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
      id: "fonds",
      icon: TrendingUp,
      iconBg: "bg-pink-500",
      name: t({ fr: "Fonds d'investissement", en: "Investment funds" }),
      tagline: t({
        fr: "Votre NAV et votre reporting consolidé, prêts chaque matin, sans retraitement.",
        en: "Your NAV and consolidated reporting, ready every morning, with no rework.",
      }),
      metric: {
        value: t({ fr: "4 h → 6 min", en: "4 h → 6 min" }),
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
        value: t({ fr: "3 h → 4 min", en: "3 h → 4 min" }),
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
  ];

  const active = industries[activeIdx];

  const bg = "#06070a";

  return (
    <section
      id="industries"
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
        </motion.div>

        {/* Horizontal industry tabs */}
        <motion.div
          className="flex flex-wrap justify-center gap-2.5 md:gap-3 mb-8 md:mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
        >
          {industries.map((ind, i) => {
            const Icon = ind.icon;
            const isActive = i === activeIdx;
            return (
              <button
                key={ind.id}
                type="button"
                onClick={() => setActiveIdx(i)}
                className={`flex items-center gap-3 px-4 md:px-5 py-2.5 md:py-3 rounded-full transition-all duration-200 ${
                  isActive
                    ? "bg-blue-50 dark:bg-white/[0.08] ring-1 ring-blue-200 dark:ring-white/15"
                    : "ring-1 ring-transparent hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${ind.iconBg}`}>
                  <Icon className="w-[16px] h-[16px] text-white" strokeWidth={2.25} />
                </div>
                <span
                  className={`font-poppins font-semibold text-[14px] md:text-[15px] whitespace-nowrap transition-colors duration-200 ${
                    isActive ? "text-[#111827] dark:text-white" : "text-gray-500 dark:text-white/55"
                  }`}
                >
                  {ind.name}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* Large panel for the active industry */}
        <motion.div
          className="relative rounded-3xl border p-6 md:p-10 border-gray-200/70 dark:border-white/10 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -8% 0px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
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

              {/* Headline time-saving stat for this sector */}
              <div className="mt-5 inline-flex items-center gap-2.5 rounded-full px-4 py-2 bg-blue-50 dark:bg-white/[0.06] border border-blue-100 dark:border-white/10">
                <Timer className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={2.25} />
                <span className="font-poppins font-semibold text-[15px] text-[#111827] dark:text-white">
                  {active.metric.value}
                </span>
                <span className="font-inter text-[13px] text-gray-500 dark:text-gray-400">
                  {active.metric.label}
                </span>
              </div>

              {/* Concrete automation examples */}
              <ul className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              {/* Cooperative comparison — accounting firms only */}
              {active.id === "comptable" && (
                <div className="mt-8">
                  <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400 dark:text-white/40 mb-3">
                    {t({ fr: "Le dernier kilomètre, automatisé", en: "The last mile, automated" })}
                  </div>
                  <div className="rounded-2xl border border-gray-200/60 dark:border-white/10 overflow-x-auto">
                    <div className="min-w-[540px]">
                      {/* header */}
                      <div className="grid grid-cols-[1.5fr_repeat(3,minmax(0,0.85fr))] items-center px-4 py-2.5 text-[11px] font-semibold border-b border-gray-200/60 dark:border-white/10">
                        <div className="text-gray-400 dark:text-white/45">{t({ fr: "Étape du dossier", en: "Workflow step" })}</div>
                        <div className="text-center text-gray-500 dark:text-white/55">{t({ fr: "Logiciel compta", en: "Accounting software" })}</div>
                        <div className="text-center text-gray-500 dark:text-white/55">{t({ fr: "Excel à la main", en: "Excel by hand" })}</div>
                        <div className="text-center font-bold text-brand-gradient">Ora</div>
                      </div>
                      {/* rows */}
                      {COMPTABLE_COMPARE.map((row, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-[1.5fr_repeat(3,minmax(0,0.85fr))] items-center px-4 py-3 border-t border-gray-200/50 dark:border-white/[0.06] first:border-t-0"
                        >
                          <div className="text-[12.5px] text-[#111827] dark:text-white/85 pr-3 leading-snug">{t(row.task)}</div>
                          <CompareCellView v={row.prod} partial={t({ fr: "Partiel", en: "Partial" })} manual={t({ fr: "À la main", en: "By hand" })} />
                          <CompareCellView v={row.excel} partial={t({ fr: "Partiel", en: "Partial" })} manual={t({ fr: "À la main", en: "By hand" })} />
                          <div className="rounded-lg bg-blue-500/[0.08] py-1.5">
                            <CompareCellView v={row.ora} partial={t({ fr: "Partiel", en: "Partial" })} manual={t({ fr: "À la main", en: "By hand" })} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-[12px] leading-relaxed text-gray-500 dark:text-white/45">
                    {t({
                      fr: "Ora ne remplace ni votre logiciel de production, ni Excel. Il automatise le travail manuel entre les deux : ce que vous sortez de Cegid, Sage ou Pennylane, fiabilisé et tracé en un clic.",
                      en: "Ora replaces neither your production software nor Excel. It automates the manual work in between: whatever you export from Cegid, Sage or Pennylane, cleaned and traced in one click.",
                    })}
                  </p>
                </div>
              )}

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
        </motion.div>
      </div>
    </section>
  );
}
