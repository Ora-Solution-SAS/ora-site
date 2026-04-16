/**
 * ConfidentialitePage — Confidentialité & Sécurité des données
 *
 * Message clé : Ora utilise l'IA pour générer et déployer le code
 * d'automatisation, mais le logiciel tourne entièrement en local chez
 * le client. Aucune donnée ne quitte son environnement.
 */

import { useEffect, useRef } from "react";
import {
  ShieldCheck,
  Cpu,
  Lock,
  ServerOff,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Zap,
  Eye,
  HardDrive,
} from "lucide-react";
import { useLang } from "@/lib/i18n";

type Page =
  | "home"
  | "for-business"
  | "ora-experience"
  | "solution-template"
  | "solution-expertise-comptable"
  | "solution-audit"
  | "solution-fonds-investissement"
  | "solution-banque-affaires"
  | "confidentialite"
  | "not-found";

type Props = {
  theme: "light" | "dark";
  openBooking: () => void;
  onNavigate: (page: Page) => void;
};

/* ── Page-local CSS ──────────────────────────────────────────────── */
const pageCSS = `
@keyframes cfFadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
.cf-stagger { opacity: 0; }
.cf-ready .cf-stagger {
  animation: cfFadeUp 0.85s cubic-bezier(.22,1,.36,1) forwards;
}
.cf-d1 { animation-delay:  60ms; }
.cf-d2 { animation-delay: 180ms; }
.cf-d3 { animation-delay: 300ms; }
.cf-d4 { animation-delay: 420ms; }
.cf-d5 { animation-delay: 540ms; }

@keyframes cfCardIn {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}
.cf-card { opacity: 0; }
.cf-card.visible {
  animation: cfCardIn 0.7s cubic-bezier(.22,1,.36,1) forwards;
}

@keyframes cfPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(13,148,136,0); }
  50%       { box-shadow: 0 0 0 8px rgba(13,148,136,0.12); }
}
.cf-shield-pulse {
  animation: cfPulse 3s ease-in-out infinite;
}
`;

/* ── Component ──────────────────────────────────────────────────── */
const ConfidentialitePage: React.FC<Props> = ({ theme, openBooking }) => {
  const { t } = useLang();
  const heroRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const steps = [
    {
      num: "01",
      icon: Cpu,
      title: t({
        fr: "L'IA conçoit le code d'automatisation",
        en: "AI designs the automation code",
      }),
      desc: t({
        fr: "Nous utilisons l'IA pour analyser vos besoins et générer rapidement le code Python qui alimentera vos automatisations Excel. Cela nous permet de déployer en jours, pas en semaines.",
        en: "We use AI to analyze your needs and quickly generate the Python code that powers your Excel automations. That lets us deploy in days, not weeks.",
      }),
    },
    {
      num: "02",
      icon: HardDrive,
      title: t({
        fr: "Le code est installé sur votre machine",
        en: "The code is installed on your machine",
      }),
      desc: t({
        fr: "Le programme généré est déployé directement dans votre environnement, sur votre poste ou votre serveur interne. Il ne communique avec aucun serveur externe.",
        en: "The generated program is deployed directly into your environment, on your workstation or internal server. It talks to no external server whatsoever.",
      }),
    },
    {
      num: "03",
      icon: Lock,
      title: t({
        fr: "Vos données restent chez vous",
        en: "Your data stays with you",
      }),
      desc: t({
        fr: "Une fois en place, Ora tourne en circuit fermé. Vos fichiers Excel, vos chiffres, vos données clients ne quittent jamais votre infrastructure.",
        en: "Once in place, Ora runs in a closed loop. Your Excel files, your numbers, your client data never leave your infrastructure.",
      }),
    },
  ];

  const guarantees = [
    {
      icon: ServerOff,
      title: t({ fr: "Aucun envoi vers le cloud", en: "Nothing sent to the cloud" }),
      desc: t({
        fr: "Le logiciel installé ne transmet aucune donnée vers des serveurs distants. Pas de stockage externe, pas d'API tiers accédant à vos fichiers.",
        en: "The installed software transmits no data to remote servers. No external storage, no third-party APIs touching your files.",
      }),
    },
    {
      icon: ShieldCheck,
      title: t({ fr: "Compatible avec vos obligations RGPD", en: "Compatible with your GDPR obligations" }),
      desc: t({
        fr: "Vos données confidentielles, vos données clients et vos données financières restent dans votre périmètre. Ora ne crée aucun risque de fuite vers l'extérieur.",
        en: "Your confidential, client and financial data stay within your perimeter. Ora introduces no risk of outside leakage.",
      }),
    },
    {
      icon: Eye,
      title: t({ fr: "Transparence totale sur le code", en: "Total code transparency" }),
      desc: t({
        fr: "Le code Python déployé est lisible et auditable. Vous savez exactement ce qui tourne sur votre machine, sans boîte noire.",
        en: "The deployed Python code is readable and auditable. You know exactly what is running on your machine, no black box.",
      }),
    },
    {
      icon: Zap,
      title: t({ fr: "Réactivité sans compromis sur la sécurité", en: "Speed without compromising security" }),
      desc: t({
        fr: "L'IA accélère notre travail de conception, mais elle n'intervient jamais dans l'exécution de vos automatisations. Vitesse et sécurité ne sont pas incompatibles.",
        en: "AI speeds up our design work, but never steps into the execution of your automations. Speed and security are not at odds.",
      }),
    },
  ];

  const comparisons = [
    {
      criterion: t({ fr: "Exécution du traitement", en: "Where processing runs" }),
      ora: t({ fr: "Sur votre machine, en local", en: "On your machine, locally" }),
      aiModels: t({ fr: "Sur des serveurs distants", en: "On remote servers" }),
    },
    {
      criterion: t({ fr: "Stockage de vos données", en: "Where your data is stored" }),
      ora: t({ fr: "Aucun, jamais", en: "Nowhere, ever" }),
      aiModels: t({ fr: "Dans le cloud du fournisseur", en: "In the vendor's cloud" }),
    },
    {
      criterion: t({ fr: "Accès à vos fichiers", en: "Access to your files" }),
      ora: t({ fr: "Uniquement en local", en: "Local only" }),
      aiModels: t({ fr: "Transmis au modèle IA", en: "Sent to the AI model" }),
    },
    {
      criterion: t({ fr: "Audit du code", en: "Code audit" }),
      ora: t({ fr: "Code lisible et vérifiable", en: "Readable, verifiable code" }),
      aiModels: t({ fr: "Boîte noire opaque", en: "Opaque black box" }),
    },
    {
      criterion: t({ fr: "Conformité RGPD", en: "GDPR compliance" }),
      ora: t({ fr: "Naturellement conforme", en: "Compliant by design" }),
      aiModels: t({ fr: "À vérifier au cas par cas", en: "Case-by-case verification" }),
    },
  ];

  // Hero entrance
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const raf = requestAnimationFrame(() => el.classList.add("cf-ready"));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Scroll-triggered card reveals
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            (el as HTMLElement).style.animationDelay = `${i * 80}ms`;
            el.classList.add("visible");
            obs.unobserve(el);
          }
        },
        { threshold: 0.12 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const dk = theme === "dark";
  const bg = dk ? "#111827" : "#fcfbf7";
  const bgContrast = dk ? "#0f172a" : "#ffffff";

  return (
    <main className="pt-[68px]">
      <style>{pageCSS}</style>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative overflow-hidden py-24 md:py-36 px-6 md:px-12"
        style={{ background: bg }}
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="cf-stagger cf-d1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[12px] font-semibold uppercase tracking-[0.12em] mb-8"
            style={{
              borderColor: dk ? "rgba(13,148,136,0.3)" : "rgba(13,148,136,0.25)",
              background: dk ? "rgba(13,148,136,0.1)" : "rgba(13,148,136,0.07)",
              color: dk ? "#2dd4bf" : "#0d9488",
            }}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {t({ fr: "Confidentialité et sécurité", en: "Privacy and security" })}
          </div>

          {/* Title */}
          <h1 className="cf-stagger cf-d2 font-poppins font-semibold text-4xl md:text-[3.5rem] leading-[1.1] tracking-[-0.03em] text-[#111827] dark:text-white mb-6">
            {t({ fr: "Vos données restent", en: "Your data stays" })}{" "}
            <span className="text-brand-gradient">{t({ fr: "les vôtres.", en: "yours." })}</span>
          </h1>

          {/* Subtitle */}
          <p className="cf-stagger cf-d3 font-inter text-lg leading-relaxed text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10">
            {t({
              fr: "Ora utilise l'IA pour concevoir vos automatisations rapidement. Mais le logiciel qui tourne chez vous n'envoie rien nulle part. Vos données financières restent dans votre environnement, sans exception.",
              en: "Ora uses AI to design your automations quickly. But the software that runs on your side sends nothing anywhere. Your financial data stays in your environment, no exceptions.",
            })}
          </p>

          {/* Shield icon */}
          <div className="cf-stagger cf-d4 flex justify-center">
            <div
              className="cf-shield-pulse w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{
                background: dk
                  ? "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(13,148,136,0.15))"
                  : "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(13,148,136,0.08))",
                border: dk ? "1px solid rgba(13,148,136,0.25)" : "1px solid rgba(13,148,136,0.2)",
              }}
            >
              <ShieldCheck className="w-9 h-9 text-teal-500" />
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMENT CA MARCHE ────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 md:px-12" style={{ background: bgContrast }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-semibold text-3xl md:text-4xl tracking-[-0.03em] leading-[1.12] text-[#111827] dark:text-white">
              {t({ fr: "L'IA accélère la conception.", en: "AI speeds up design." })}<br />
              <span className="text-brand-gradient">{t({ fr: "Votre machine exécute.", en: "Your machine runs it." })}</span>
            </h2>
            <p className="mt-4 font-inter text-base leading-relaxed text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              {t({
                fr: "Comprendre comment Ora fonctionne, c'est comprendre pourquoi vos données sont protégées par construction.",
                en: "Understanding how Ora works is understanding why your data is protected by design.",
              })}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  ref={(el) => { cardRefs.current[i] = el; }}
                  className="cf-card p-7 rounded-[22px] border border-gray-200/70 dark:border-white/[0.07]"
                  style={{ background: dk ? "rgba(255,255,255,0.03)" : "#ffffff" }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400">
                      {t({ fr: "Étape", en: "Step" })} {step.num}
                    </span>
                  </div>
                  <h3 className="font-poppins font-semibold text-[1rem] leading-snug mb-2 text-[#111827] dark:text-white">
                    {step.title}
                  </h3>
                  <p className="font-inter text-[13.5px] leading-relaxed text-gray-500 dark:text-gray-400">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── GARANTIES ────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 md:px-12" style={{ background: bg }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-semibold text-3xl md:text-4xl tracking-[-0.03em] leading-[1.12] text-[#111827] dark:text-white">
              {t({ fr: "Ce que cela garantit", en: "What this guarantees" })}{" "}
              <span className="text-brand-gradient">{t({ fr: "concrètement.", en: "in practice." })}</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {guarantees.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  ref={(el) => { cardRefs.current[steps.length + i] = el; }}
                  className="cf-card flex gap-5 p-6 rounded-[20px] border border-gray-200/70 dark:border-white/[0.07]"
                  style={{ background: dk ? "rgba(255,255,255,0.03)" : "#ffffff" }}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mt-0.5">
                    <Icon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-poppins font-semibold text-[15px] leading-snug mb-1.5 text-[#111827] dark:text-white">
                      {item.title}
                    </h3>
                    <p className="font-inter text-[13.5px] leading-relaxed text-gray-500 dark:text-gray-400">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ─────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 md:px-12" style={{ background: bgContrast }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-poppins font-semibold text-3xl md:text-4xl tracking-[-0.03em] leading-[1.12] text-[#111827] dark:text-white">
              {t({ fr: "Ora vs. les outils IA classiques.", en: "Ora vs. typical AI tools." })}
            </h2>
            <p className="mt-4 font-inter text-base leading-relaxed text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              {t({
                fr: "Les outils IA grand public traitent vos données sur leurs serveurs. Ora a été conçu pour que ce cas de figure n'existe pas.",
                en: "Consumer AI tools process your data on their servers. Ora was designed so that scenario simply doesn't exist.",
              })}
            </p>
          </div>

          <div
            className="rounded-[24px] overflow-hidden border border-gray-200/70 dark:border-white/[0.08]"
            ref={(el) => { cardRefs.current[steps.length + guarantees.length] = el; }}
          >
            {/* Header */}
            <div
              className="grid grid-cols-3 text-[12px] font-semibold uppercase tracking-[0.1em] px-6 py-4 border-b border-gray-200/60 dark:border-white/[0.07]"
              style={{ background: dk ? "rgba(255,255,255,0.04)" : "#f8f7f3" }}
            >
              <span className="text-gray-400 dark:text-gray-500">{t({ fr: "Critère", en: "Criterion" })}</span>
              <span className="text-teal-600 dark:text-teal-400 text-center">Ora</span>
              <span className="text-gray-400 dark:text-gray-500 text-center">{t({ fr: "Outils IA classiques", en: "Typical AI tools" })}</span>
            </div>

            {comparisons.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-3 px-6 py-4 items-center text-[13.5px] ${i < comparisons.length - 1 ? "border-b border-gray-200/50 dark:border-white/[0.06]" : ""}`}
                style={{ background: i % 2 === 0 ? "transparent" : dk ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.015)" }}
              >
                <span className="font-inter font-medium text-[#111827] dark:text-white pr-4">{row.criterion}</span>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                  <span className="font-inter text-teal-700 dark:text-teal-300 text-center">{row.ora}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="font-inter text-gray-400 dark:text-gray-500 text-center">{row.aiModels}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 md:px-12" style={{ background: bg }}>
        <div className="max-w-4xl mx-auto">
          <div
            className="rounded-[32px] border px-8 md:px-16 py-16 md:py-20 grid md:grid-cols-2 gap-12 items-center"
            style={{
              background: "linear-gradient(135deg, #eff6ff 0%, #f0fdfa 100%)",
              borderColor: "rgba(59,130,246,0.15)",
            }}
          >
            {/* Left */}
            <div>
              <div className="inline-block px-3.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.15em] mb-5 bg-teal-100 text-teal-700 border border-teal-200">
                {t({ fr: "Appel découverte", en: "Discovery call" })}
              </div>
              <h2 className="font-poppins font-semibold tracking-[-0.03em] text-3xl md:text-4xl leading-[1.12] text-[#111827] mb-4">
                {t({
                  fr: "Des questions sur la sécurité de vos données ?",
                  en: "Questions about your data security?",
                })}
              </h2>
              <p className="font-inter text-base leading-relaxed text-gray-600 mb-8">
                {t({
                  fr: "Nous expliquons en détail comment Ora fonctionne dans votre environnement. Aucune donnée ne sort de votre infrastructure. Discutons-en.",
                  en: "We explain in detail how Ora runs inside your environment. No data leaves your infrastructure. Let's talk it through.",
                })}
              </p>
              <button
                onClick={openBooking}
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold font-inter text-white bg-gradient-to-r from-[#3b82f6] to-[#0d9488] shadow-[0_2px_12px_rgba(59,130,246,0.30)] hover:shadow-[0_4px_24px_rgba(59,130,246,0.42)] hover:-translate-y-px transition-all duration-150"
              >
                {t({ fr: "Réserver mon appel", en: "Book my call" })}
                <ArrowRight className="w-4 h-4 opacity-80 group-hover:translate-x-[3px] transition-transform duration-150" />
              </button>
              <p className="mt-3 font-inter text-[12px] text-gray-400">{t({ fr: "Gratuit · Sans engagement", en: "Free · No commitment" })}</p>
            </div>

            {/* Right */}
            <div className="flex flex-col gap-5">
              {[
                {
                  icon: Zap,
                  title: t({ fr: "30 minutes chrono", en: "30 minutes, tops" }),
                  desc: t({
                    fr: "Un format court et structuré, pensé pour aller à l'essentiel.",
                    en: "Short and structured, designed to cut straight to the point.",
                  }),
                },
                {
                  icon: ShieldCheck,
                  title: t({ fr: "Architecture expliquée", en: "Architecture, explained" }),
                  desc: t({
                    fr: "On détaille précisément ce qui tourne sur votre machine et ce qui n'est jamais transmis.",
                    en: "We walk through exactly what runs on your machine and what is never transmitted.",
                  }),
                },
                {
                  icon: CheckCircle2,
                  title: t({ fr: "Conformité vérifiée ensemble", en: "Compliance checked together" }),
                  desc: t({
                    fr: "Nous passons en revue vos contraintes RGPD et internes pour vous donner une réponse concrète.",
                    en: "We review your GDPR and internal requirements together to give you a concrete answer.",
                  }),
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-white/70 border border-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-inter font-semibold text-[14px] text-[#111827] mb-0.5">{item.title}</p>
                      <p className="font-inter text-[13px] leading-relaxed text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ConfidentialitePage;
