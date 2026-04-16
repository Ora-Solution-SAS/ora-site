import { useState, useEffect, useRef } from "react";
import {
  ArrowRight, Clock, FileSpreadsheet, Mail, GitMerge, Zap,
  CheckCircle2, BarChart3, RefreshCcw, FileText, Database,
} from "lucide-react";
import { useLang } from "@/lib/i18n";

interface OraExperiencePageProps {
  theme: "light" | "dark";
  openBooking: () => void;
  onNavigate?: (page: "home" | "for-business" | "ora-experience" | "not-found") => void;
}

// ── Keyframes & page-local CSS ───────────────────────────────────────────────
const pageCSS = `
@keyframes xpFadeUp {
  from { opacity: 0; transform: translateY(32px); }
  to   { opacity: 1; transform: translateY(0); }
}
.xp-stagger { opacity: 0; }
.xp-ready .xp-stagger {
  animation: xpFadeUp 0.9s cubic-bezier(.22,1,.36,1) forwards;
}
.xp-d1 { animation-delay:  40ms; }
.xp-d2 { animation-delay: 160ms; }
.xp-d3 { animation-delay: 280ms; }
.xp-d4 { animation-delay: 400ms; }
.xp-d5 { animation-delay: 520ms; }

@keyframes xpReveal {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
.xp-reveal { opacity: 0; }
.xp-reveal.visible {
  animation: xpReveal 0.75s cubic-bezier(.22,1,.36,1) forwards;
}

@keyframes xpLineGrow {
  from { height: 0; }
  to   { height: 100%; }
}
.xp-line { height: 0; overflow: hidden; }
.xp-line.visible {
  animation: xpLineGrow 1.4s cubic-bezier(.22,1,.36,1) forwards;
}

@keyframes xpGradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.xp-animated-gradient {
  background: linear-gradient(120deg, #3b82f6, #0d9488, #3b82f6);
  background-size: 200% 200%;
  animation: xpGradientShift 5s ease-in-out infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@keyframes xpStepGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
  50%       { box-shadow: 0 0 0 8px rgba(59,130,246,0.12); }
}
.xp-step-dot { animation: xpStepGlow 3s ease-in-out infinite; }
`;

// ── Component ────────────────────────────────────────────────────────────────

export default function OraExperiencePage({ theme, openBooking, onNavigate }: OraExperiencePageProps) {
  const { t } = useLang();
  const dk = theme === "dark";
  const [ready, setReady] = useState(false);
  const lineRef = useRef<HTMLDivElement>(null);

  // ── Data ──────────────────────────────────────────────────────────────────
  const painPoints = [
    { icon: Clock,           label: t({ fr: "3 à 5 heures perdues chaque semaine sur la mise à jour de rapports Excel", en: "3 to 5 hours lost each week updating Excel reports" }) },
    { icon: RefreshCcw,      label: t({ fr: "Copier-coller manuel entre fichiers, e-mails et tableaux de bord", en: "Manual copy-paste between files, emails and dashboards" }) },
    { icon: FileSpreadsheet, label: t({ fr: "Formules cassées, versions multiples, erreurs humaines coûteuses", en: "Broken formulas, multiple versions, costly human errors" }) },
    { icon: Mail,            label: t({ fr: "Envoi de rapports manuels avec risque d'oubli ou de mauvaise pièce jointe", en: "Manual report sending with risk of oversight or wrong attachment" }) },
  ];

  const steps = [
    {
      num: "01",
      title: t({ fr: "Ora s'intègre à Excel", en: "Ora integrates with Excel" }),
      desc: t({ fr: "Ora fonctionne comme une extension directement dans votre Excel existant. Pas de migration, pas de nouvel outil à apprendre. Vos fichiers restent les mêmes, Ora gère les automatisations en arrière-plan.", en: "Ora works as an extension directly inside your existing Excel. No migration, no new tool to learn. Your files stay the same, Ora handles automation in the background." }),
      icon: Database,
    },
    {
      num: "02",
      title: t({ fr: "Des automatisations sur mesure", en: "Tailored automations" }),
      desc: t({ fr: "Nous configurons vos premiers workflows avec vous, adaptés à vos besoins exacts. Et si vos besoins évoluent, vous pouvez demander de nouvelles automatisations à tout moment, sans délai.", en: "We configure your first workflows with you, tailored to your exact needs. And if your needs evolve, you can request new automations at any time, without delay." }),
      icon: GitMerge,
    },
    {
      num: "03",
      title: t({ fr: "Laissez faire Ora, reprenez le contrôle", en: "Let Ora run, take back control" }),
      desc: t({ fr: "Ora s'occupe de la production. Rapports, réconciliations, envois automatiques : tout est prêt quand vous en avez besoin. Vous validez les résultats, vous ne les fabriquez plus.", en: "Ora handles production. Reports, reconciliations, automatic dispatch: everything is ready when you need it. You validate results, you no longer produce them." }),
      icon: CheckCircle2,
    },
  ];

  // 3 exemples représentatifs, suffisamment généraux
  const examples = [
    {
      icon: BarChart3,
      tag: t({ fr: "Reporting", en: "Reporting" }),
      title: t({ fr: "Rapports mensuels générés automatiquement", en: "Monthly reports generated automatically" }),
      desc: t({ fr: "Ora collecte, nettoie et structure vos données, puis génère et envoie vos rapports aux bons destinataires, au bon moment.", en: "Ora collects, cleans and structures your data, then generates and sends your reports to the right recipients at the right time." }),
    },
    {
      icon: GitMerge,
      tag: t({ fr: "Réconciliation", en: "Reconciliation" }),
      title: t({ fr: "Rapprochements sans erreur", en: "Error-free reconciliations" }),
      desc: t({ fr: "Factures, relevés bancaires, exports CRM : Ora croise vos sources, détecte les écarts et produit un fichier propre à chaque fois.", en: "Invoices, bank statements, CRM exports: Ora cross-checks your sources, detects discrepancies and delivers a clean file every time." }),
    },
    {
      icon: FileText,
      tag: t({ fr: "Traitement de données", en: "Data processing" }),
      title: t({ fr: "CSV, PDF, e-mails : tout devient exploitable", en: "CSV, PDF, emails: everything becomes usable" }),
      desc: t({ fr: "Quelle que soit la source, Ora extrait, normalise et route vos données exactement là où elles doivent aller.", en: "Whatever the source, Ora extracts, normalizes and routes your data exactly where it needs to go." }),
    },
  ];

  // Entrance animation trigger
  useEffect(() => {
    requestAnimationFrame(() => setReady(true));
    window.scrollTo({ top: 0 });
  }, []);

  // Scroll-triggered .xp-reveal elements
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>(".xp-reveal");
    if (!targets.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = parseInt(el.dataset.delay ?? "0", 10);
            setTimeout(() => el.classList.add("visible"), delay);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.1 },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  // Timeline vertical line grow
  useEffect(() => {
    if (!lineRef.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          lineRef.current?.classList.add("visible");
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(lineRef.current);
    return () => io.disconnect();
  }, []);

  // ── Shared design tokens ─────────────────────────────────────────────────
  // Alternating backgrounds — same palette as the welcome page
  const bg         = dk ? "#111827" : "#fcfbf7";
  const bgContrast = dk ? "#0f172a" : "#ffffff";
  const border     = dk ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const cardBg     = dk ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.85)";

  return (
    <div className={ready ? "xp-ready" : ""}>
      <style>{pageCSS}</style>

      {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden pt-32 pb-32 md:pt-44 md:pb-44 px-6"
        style={{ background: bg }}
      >
        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full"
            style={{
              background: dk
                ? "radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 70%)"
                : "radial-gradient(ellipse, rgba(191,220,255,0.55) 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />
          <div
            className="absolute bottom-0 right-1/4 w-[500px] h-[400px] rounded-full"
            style={{
              background: dk
                ? "radial-gradient(ellipse, rgba(13,148,136,0.07) 0%, transparent 70%)"
                : "radial-gradient(ellipse, rgba(167,243,208,0.3) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div
            className={`xp-stagger xp-d1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.18em] mb-8 ${
              dk
                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                : "bg-blue-50 text-blue-600 border border-blue-100"
            }`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-current"
              style={{ boxShadow: "0 0 6px currentColor" }}
            />
            {t({ fr: "L'expérience Ora", en: "The Ora experience" })}
          </div>

          {/* H1 — Poppins bold, tight tracking, same pattern as homepage */}
          <h1
            className={`xp-stagger xp-d2 font-poppins font-bold tracking-[-0.04em] leading-[1.06] text-5xl md:text-7xl ${
              dk ? "text-white" : "text-[#111827]"
            }`}
          >
            {t({ fr: "Vos workflows Excel,", en: "Your Excel workflows," })}{" "}
            <br className="hidden sm:block" />
            <span className="xp-animated-gradient">{t({ fr: "automatisés pour vous.", en: "automated for you." })}</span>
          </h1>

          {/* Subheadline */}
          <p
            className={`xp-stagger xp-d3 mt-7 mx-auto text-base md:text-lg leading-[1.75] max-w-[540px] ${
              dk ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {t({ fr: "Ora automatise vos tâches Excel répétitives et vous redonne du temps pour l'essentiel.", en: "Ora automates your repetitive Excel tasks and gives you back time for what matters." })}
          </p>

          {/* CTA */}
          <div className="xp-stagger xp-d4 mt-10 flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={openBooking}
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold text-white transition-all duration-150 hover:-translate-y-px active:translate-y-0 bg-gradient-to-r from-[#3b82f6] to-[#0d9488] shadow-[0_2px_8px_rgba(0,0,0,0.1),0_8px_24px_rgba(37,99,235,0.35)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.1),0_12px_32px_rgba(37,99,235,0.45)]"
            >
              {t({ fr: "Réserver un appel gratuit", en: "Book a free call" })}
              <ArrowRight className="w-4 h-4 opacity-80 group-hover:translate-x-[3px] transition-transform duration-150" />
            </button>
            <span className={`text-[13px] ${dk ? "text-gray-500" : "text-gray-400"}`}>
              {t({ fr: "30 min · Sans engagement", en: "30 min · No commitment" })}
            </span>
          </div>

          {/* Micro stats */}
          <div
            className={`xp-stagger xp-d5 mt-14 flex items-center justify-center gap-10 flex-wrap ${
              dk ? "text-gray-500" : "text-gray-400"
            }`}
            style={{ fontSize: 13 }}
          >
            {[
              ["5h+", t({ fr: "économisées / semaine", en: "saved / week" })],
              ["0",   t({ fr: "erreur humaine", en: "human errors" })],
              [t({ fr: "< 1 sem.", en: "< 1 week" }), t({ fr: "pour déployer", en: "to deploy" })],
            ].map(([val, label]) => (
              <div key={val} className="flex flex-col items-center gap-1">
                <span
                  className={`font-poppins font-bold text-2xl ${dk ? "text-white" : "text-[#111827]"}`}
                >
                  {val}
                </span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. LE PROBLÈME ──────────────────────────────────────────────── */}
      <section
        className="py-24 md:py-32 px-6"
        style={{ background: bgContrast }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div
              className="xp-reveal inline-block px-3.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.15em] mb-5"
              style={{
                background: dk ? "rgba(239,68,68,0.1)" : "#fef2f2",
                color: dk ? "#f87171" : "#dc2626",
                border: `1px solid ${dk ? "rgba(239,68,68,0.2)" : "#fecaca"}`,
              }}
            >
              {t({ fr: "Le problème", en: "The problem" })}
            </div>
            <h2
              className={`xp-reveal font-poppins font-bold tracking-[-0.03em] text-3xl md:text-5xl leading-[1.12] ${
                dk ? "text-white" : "text-[#111827]"
              }`}
              data-delay="100"
            >
              {t({ fr: "Chaque semaine, vos équipes", en: "Every week, your teams" })}{" "}
              <br />
              {t({ fr: "perdent des heures sur des tâches", en: "lose hours on tasks" })}{" "}
              <br />
              {t({ fr: "qui devraient être automatiques.", en: "that should be automatic." })}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {painPoints.map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={i}
                  className="xp-reveal flex items-start gap-4 p-5 rounded-2xl"
                  style={{
                    background: dk ? "rgba(239,68,68,0.04)" : "#fff8f8",
                    border: `1px solid ${dk ? "rgba(239,68,68,0.12)" : "#fecaca"}`,
                  }}
                  data-delay={String(i * 70)}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: dk ? "rgba(239,68,68,0.1)" : "#fee2e2" }}
                  >
                    <Icon className="w-4 h-4" style={{ color: dk ? "#f87171" : "#dc2626" }} />
                  </div>
                  <p className={`text-[14.5px] leading-relaxed pt-1 ${dk ? "text-gray-400" : "text-gray-600"}`}>
                    {p.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Transition arrow */}
          <div className="flex justify-center mt-12">
            <div className="xp-reveal flex flex-col items-center gap-2" data-delay="350">
              <div
                className="w-px h-10"
                style={{
                  background: `linear-gradient(to bottom, transparent, #3b82f6)`,
                }}
              />
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #0d9488)",
                  boxShadow: "0 4px 16px rgba(59,130,246,0.35)",
                }}
              >
                <ArrowRight className="w-4 h-4 text-white rotate-90" />
              </div>
              <span className="text-xs font-semibold tracking-widest uppercase text-blue-500">
                {t({ fr: "Avec Ora", en: "With Ora" })}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. COMMENT ÇA MARCHE ────────────────────────────────────────── */}
      <section
        className="py-24 md:py-36 px-6"
        style={{ background: bg }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <div
              className={`xp-reveal inline-block px-3.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.15em] mb-5 ${
                dk
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  : "bg-blue-50 text-blue-600 border border-blue-100"
              }`}
            >
              {t({ fr: "Comment ça marche", en: "How it works" })}
            </div>
            <h2
              className={`xp-reveal font-poppins font-bold tracking-[-0.03em] text-3xl md:text-5xl leading-[1.12] ${
                dk ? "text-white" : "text-[#111827]"
              }`}
              data-delay="100"
            >
              {t({ fr: "Opérationnel en moins d'une semaine.", en: "Up and running in less than a week." })}
            </h2>
            <p
              className={`xp-reveal mt-4 mx-auto text-base leading-relaxed max-w-md ${
                dk ? "text-gray-400" : "text-gray-500"
              }`}
              data-delay="200"
            >
              {t({ fr: "Nous configurons tout pour vous, sans toucher à votre organisation actuelle.", en: "We set everything up for you, without touching your current organization." })}
            </p>
          </div>

          {/* Steps with vertical timeline line */}
          <div className="relative">
            {/* Animated line — desktop only */}
            <div
              className="hidden md:block absolute left-1/2 top-8 bottom-8 w-px -translate-x-1/2 overflow-hidden"
              style={{ background: "transparent" }}
            >
              <div
                ref={lineRef}
                className="xp-line w-full"
                style={{
                  background: "linear-gradient(to bottom, #3b82f6, #0d9488)",
                  opacity: 0.25,
                }}
              />
            </div>

            <div className="space-y-14 md:space-y-20">
              {steps.map((step, i) => {
                const Icon = step.icon;
                const isRight = i % 2 !== 0;
                return (
                  <div
                    key={i}
                    className="xp-reveal relative md:grid md:grid-cols-2 md:gap-16 items-center"
                    data-delay={String(i * 130)}
                  >
                    {/* Text */}
                    <div className={`${isRight ? "md:order-2 md:pl-10" : "md:pr-10"} pl-14 md:pl-0`}>
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider mb-4 ${
                          dk
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {t({ fr: "Étape", en: "Step" })} {step.num}
                      </div>
                      <h3
                        className={`font-poppins font-bold tracking-tight text-xl md:text-2xl leading-snug mb-3 ${
                          dk ? "text-white" : "text-[#111827]"
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p className={`text-[15px] leading-relaxed ${dk ? "text-gray-400" : "text-gray-500"}`}>
                        {step.desc}
                      </p>
                    </div>

                    {/* Icon block — desktop */}
                    <div
                      className={`hidden md:flex ${isRight ? "md:order-1 justify-end md:pr-10" : "justify-start md:pl-10"}`}
                    >
                      <div
                        className="w-20 h-20 rounded-3xl flex items-center justify-center"
                        style={{
                          background: dk
                            ? "rgba(59,130,246,0.08)"
                            : "linear-gradient(135deg, #eff6ff, #f0fdf4)",
                          border: `1px solid ${dk ? "rgba(59,130,246,0.15)" : "#bfdbfe"}`,
                          boxShadow: "0 8px 28px rgba(59,130,246,0.1)",
                        }}
                      >
                        <Icon className="w-9 h-9 text-blue-500" />
                      </div>
                    </div>

                    {/* Mobile step dot */}
                    <div
                      className="xp-step-dot absolute left-0 md:hidden w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white top-0"
                      style={{
                        background: "linear-gradient(135deg, #3b82f6, #0d9488)",
                        boxShadow: "0 4px 14px rgba(59,130,246,0.35)",
                      }}
                    >
                      {i + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. EXEMPLES D'AUTOMATISATION ────────────────────────────────── */}
      <section
        className="py-24 md:py-32 px-6"
        style={{ background: bgContrast }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div
              className={`xp-reveal inline-block px-3.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.15em] mb-5 ${
                dk
                  ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                  : "bg-teal-50 text-teal-700 border border-teal-100"
              }`}
            >
              {t({ fr: "Ce qu'Ora automatise", en: "What Ora automates" })}
            </div>
            <h2
              className={`xp-reveal font-poppins font-bold tracking-[-0.03em] text-3xl md:text-5xl leading-[1.12] ${
                dk ? "text-white" : "text-[#111827]"
              }`}
              data-delay="80"
            >
              {t({ fr: "Concret, dès la première semaine.", en: "Concrete, from the first week." })}
            </h2>
            <p
              className={`xp-reveal mt-4 mx-auto text-base leading-relaxed max-w-md ${
                dk ? "text-gray-400" : "text-gray-500"
              }`}
              data-delay="160"
            >
              {t({ fr: "Les cas d'usage d'Ora varient selon votre métier. Voici quelques exemples.", en: "Ora use cases vary by industry. Here are a few examples." })}
            </p>
          </div>

          {/* 3 example cards — simple horizontal list */}
          <div className="grid md:grid-cols-3 gap-4">
            {examples.map((ex, i) => {
              const Icon = ex.icon;
              return (
                <div
                  key={i}
                  className="xp-reveal group p-6 rounded-[22px] border transition-all duration-200 hover:-translate-y-1"
                  style={{
                    background: cardBg,
                    borderColor: border,
                    boxShadow: dk
                      ? "none"
                      : "0 2px 12px rgba(0,0,0,0.04)",
                  }}
                  data-delay={String(i * 90)}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                    style={{
                      background: dk ? "rgba(59,130,246,0.1)" : "#dbeafe",
                    }}
                  >
                    <Icon className="w-5 h-5 text-blue-500" />
                  </div>
                  <div
                    className={`text-[10px] font-semibold uppercase tracking-widest mb-2 ${
                      dk ? "text-blue-400" : "text-blue-600"
                    }`}
                  >
                    {ex.tag}
                  </div>
                  <h3
                    className={`font-poppins font-bold tracking-tight text-[1rem] leading-snug mb-2 ${
                      dk ? "text-white" : "text-[#111827]"
                    }`}
                  >
                    {ex.title}
                  </h3>
                  <p className={`text-[13.5px] leading-relaxed ${dk ? "text-gray-400" : "text-gray-500"}`}>
                    {ex.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Link toward Solutions */}
          <div className="xp-reveal flex justify-center mt-10" data-delay="300">
            <button
              onClick={() => onNavigate?.("not-found")}
              className={`inline-flex items-center gap-2 text-[14px] font-semibold transition-colors duration-150 ${
                dk
                  ? "text-blue-400 hover:text-blue-300"
                  : "text-blue-600 hover:text-blue-700"
              }`}
            >
              {t({ fr: "Voir les cas d'usage par secteur d'activité", en: "See use cases by industry" })}
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-[3px] transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ── 5. CTA FINAL ────────────────────────────────────────────────── */}
      <section
        className="py-24 md:py-32 px-6"
        style={{ background: bgContrast }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <div
            className="xp-reveal rounded-[32px] px-8 py-16 md:px-14 md:py-20 relative overflow-hidden border"
            style={{
              background: dk
                ? "rgba(59,130,246,0.04)"
                : "linear-gradient(135deg, #eff6ff, #f0fdfa)",
              borderColor: dk ? "rgba(59,130,246,0.15)" : "#bfdbfe",
            }}
          >
            {/* Background blobs */}
            <div
              className="absolute -top-20 -right-20 w-60 h-60 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)",
                filter: "blur(28px)",
              }}
              aria-hidden
            />
            <div
              className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(13,148,136,0.08) 0%, transparent 70%)",
                filter: "blur(28px)",
              }}
              aria-hidden
            />

            <div className="relative z-10">
              <div
                className="w-13 h-13 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #0d9488)",
                  boxShadow: "0 8px 24px rgba(59,130,246,0.35)",
                  width: 52,
                  height: 52,
                }}
              >
                <Zap className="w-6 h-6 text-white" />
              </div>

              <h2
                className={`font-poppins font-bold tracking-[-0.03em] text-3xl md:text-4xl leading-[1.12] mb-4 ${
                  dk ? "text-white" : "text-[#111827]"
                }`}
              >
                {t({ fr: "Prêt à reprendre votre temps ?", en: "Ready to reclaim your time?" })}
              </h2>

              <p className={`text-base leading-relaxed mb-8 max-w-sm mx-auto ${dk ? "text-gray-400" : "text-gray-500"}`}>
                {t({ fr: "En 30 minutes, nous cartographions ce qu'Ora peut automatiser dans votre quotidien. Vous repartez avec un plan concret.", en: "In 30 minutes, we map out what Ora can automate in your daily work. You leave with a concrete plan." })}
              </p>

              <button
                onClick={openBooking}
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-full text-[15px] font-semibold text-white transition-all duration-150 hover:-translate-y-px active:translate-y-0 bg-gradient-to-r from-[#3b82f6] to-[#0d9488] shadow-[0_4px_20px_rgba(37,99,235,0.35)] hover:shadow-[0_6px_28px_rgba(37,99,235,0.5)]"
              >
                {t({ fr: "Réserver un appel découverte", en: "Book a discovery call" })}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-[3px] transition-transform duration-150" />
              </button>

              <p className={`mt-4 text-[12px] ${dk ? "text-gray-600" : "text-gray-400"}`}>
                {t({ fr: "Gratuit · 30 minutes · Sans engagement", en: "Free · 30 minutes · No commitment" })}
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
