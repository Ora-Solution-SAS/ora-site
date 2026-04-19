import { useState, useEffect } from "react";
import {
  ArrowRight, CalendarDays, Wrench, Monitor, Eye, Zap, CheckCircle, Package,
} from "lucide-react";
import { useLang } from "@/lib/i18n";

const pageCSS = `
@keyframes prFadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
.pr-stagger { opacity: 0; }
.pr-ready .pr-stagger {
  animation: prFadeUp 0.85s cubic-bezier(.22,1,.36,1) forwards;
}
.pr-d1 { animation-delay:  60ms; }
.pr-d2 { animation-delay: 160ms; }
.pr-d3 { animation-delay: 260ms; }
.pr-d4 { animation-delay: 360ms; }

@keyframes prCardIn {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}
.pr-card { opacity: 0; }
.pr-card.visible {
  animation: prCardIn 0.7s cubic-bezier(.22,1,.36,1) forwards;
}
`;

interface Props {
  theme: "light" | "dark";
  openBooking: () => void;
  onNavigate: (page: "home" | "for-business" | "ora-experience" | "solution-template" | "solution-expertise-comptable" | "solution-audit" | "not-found" | "pricing") => void;
}

export default function PricingPage({ theme, openBooking }: Props) {
  const { t } = useLang();
  const dk = theme === "dark";
  const [ready, setReady] = useState(false);

  const bg         = dk ? "#111827" : "#fcfbf7";
  const bgContrast = dk ? "#0f172a" : "#ffffff";
  const textPrimary   = dk ? "text-white"    : "text-gray-900";
  const textSecondary = dk ? "text-gray-400" : "text-gray-500";
  const borderMuted   = dk ? "border-white/[0.07]" : "border-gray-200/70";
  const cardBg        = dk ? "bg-white/[0.03]" : "bg-white";

  useEffect(() => {
    requestAnimationFrame(() => setReady(true));
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>(".pr-card");
    if (!cards.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = el.dataset.delay ?? "0";
            setTimeout(() => el.classList.add("visible"), parseInt(delay, 10));
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1 },
    );
    cards.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, []);

  const includes = [
    {
      icon: Zap,
      title: t({ fr: "Automatisations de base", en: "Core automations" }),
      desc: t({ fr: "Vos workflows clés configurés dès le démarrage. Rapports, réconciliations, consolidations : les tâches répétitives disparaissent dès la première semaine.", en: "Your key workflows set up from day one. Reports, reconciliations, consolidations: repetitive tasks disappear from week one." }),
    },
    {
      icon: Monitor,
      title: t({ fr: "Logiciel desktop Ora", en: "Ora desktop software" }),
      desc: t({ fr: "L'application installée sur votre machine, sans abonnement cloud. Mises à jour incluses, données 100% locales. Fonctionne avec vos fichiers Excel existants.", en: "The application installed on your machine, no cloud subscription. Updates included, 100% local data. Works with your existing Excel files." }),
    },
    {
      icon: Eye,
      title: t({ fr: "Suivi manager", en: "Manager view" }),
      desc: t({ fr: "Vue en temps réel sur l'avancée de chaque fichier de travail. Commentaires, modifications effectuées, statut par section. La supervision du dossier est fluide et centralisée.", en: "Real-time visibility on the progress of every working file. Comments, edits made, status by section. File oversight is seamless and centralised." }),
    },
    {
      icon: Wrench,
      title: t({ fr: "On-demand engineering", en: "On-demand engineering" }),
      desc: t({ fr: "Besoin d'une nouvelle automatisation ? Décrivez-la, notre équipe la livre en quelques jours. Pas de backlog, pas de ticket oublié. Votre métier évolue, Ora évolue avec vous.", en: "Need a new automation? Describe it, our team delivers it in days. No backlog, no forgotten ticket. Your business evolves, Ora evolves with you." }),
    },
  ];

  const modelPoints = [
    {
      label: t({ fr: "Frais de setup", en: "Setup fee" }),
      desc: t({ fr: "Couvre la configuration initiale, l'intégration à vos fichiers existants et la livraison des premières automatisations. Défini ensemble lors de l'appel découverte.", en: "Covers initial configuration, integration with your existing files, and delivery of the first automations. Agreed together during the discovery call." }),
    },
    {
      label: t({ fr: "Licence mensuelle par utilisateur", en: "Monthly per-user licence" }),
      desc: t({ fr: "Accès au logiciel Ora, aux mises à jour, au suivi manager et au service on-demand engineering. Le tarif est établi selon le nombre d'utilisateurs et vos besoins spécifiques.", en: "Access to Ora software, updates, manager view and on-demand engineering service. The rate is set based on the number of users and your specific needs." }),
    },
  ];

  return (
    <div className={ready ? "pr-ready" : ""}>
      <style>{pageCSS}</style>

      {/* ══════════════════════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden pt-28 pb-24 md:pt-36 md:pb-32 px-6 lg:px-10"
        style={{ background: bg }}
      >
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full"
            style={{
              background: dk
                ? "radial-gradient(ellipse, rgba(59,130,246,0.09) 0%, transparent 65%)"
                : "radial-gradient(ellipse, rgba(191,220,255,0.45) 0%, transparent 65%)",
              filter: "blur(72px)",
            }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">

          <div
            className={[
              "pr-stagger pr-d1",
              "inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-7",
              "text-[11px] font-inter font-semibold uppercase tracking-[0.16em]",
              dk
                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                : "bg-blue-50 text-blue-600 border border-blue-100",
            ].join(" ")}
          >
            {t({ fr: "Tarifs", en: "Pricing" })}
          </div>

          <h1
            className={[
              "pr-stagger pr-d2",
              "font-poppins text-[clamp(2rem,4.5vw,3.6rem)] font-semibold leading-[1.1] tracking-[-0.03em]",
              textPrimary,
            ].join(" ")}
          >
            <span className="block">{t({ fr: "Un tarif adapté", en: "Pricing built" })}</span>
            <span className="block text-brand-gradient">{t({ fr: "à vos besoins.", en: "around your needs." })}</span>
          </h1>

          <p
            className={[
              "pr-stagger pr-d3",
              "font-inter mt-6 text-[clamp(1rem,1.7vw,1.1rem)] leading-[1.8] max-w-2xl mx-auto",
              textSecondary,
            ].join(" ")}
          >
            {t({
              fr: "Le périmètre d'Ora dépend de votre métier, de vos volumes et de vos processus. Chaque déploiement est différent, chaque tarif aussi. Un appel de 30 minutes suffit pour cadrer votre proposition.",
              en: "Ora's scope depends on your industry, your volumes, and your processes. Every deployment is different, every price too. A 30-minute call is all it takes to scope your proposal.",
            })}
          </p>

          <div className="pr-stagger pr-d4 mt-9 flex flex-wrap justify-center gap-3">
            <button
              onClick={openBooking}
              className={[
                "group inline-flex items-center gap-2.5 px-7 py-3.5",
                "rounded-full text-[15px] font-inter font-semibold text-white",
                "transition-all duration-150 hover:-translate-y-px active:translate-y-0",
                "bg-gradient-to-r from-blue-600 via-blue-500 to-teal-600",
                "shadow-[0_1px_3px_rgba(0,0,0,0.10),0_8px_24px_rgba(37,99,235,0.32)]",
                "hover:shadow-[0_1px_3px_rgba(0,0,0,0.10),0_10px_32px_rgba(37,99,235,0.44)]",
              ].join(" ")}
            >
              <CalendarDays className="w-4 h-4 opacity-80" />
              {t({ fr: "Obtenir mon tarif", en: "Get my quote" })}
              <ArrowRight className="w-4 h-4 opacity-80 group-hover:opacity-100 group-hover:translate-x-[3px] transition-all duration-150" />
            </button>
          </div>

          <p className={["pr-stagger pr-d4 mt-4 font-inter text-[13px]", textSecondary].join(" ")}>
            {t({ fr: "Gratuit, sans engagement", en: "Free, no commitment" })}
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          2. MODELE TARIFAIRE
      ══════════════════════════════════════════════════════════ */}
      <section
        className="py-24 md:py-32 px-6 lg:px-10"
        style={{ background: bgContrast }}
      >
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-14 max-w-2xl mx-auto">
            <div
              className={[
                "inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5",
                "text-[11px] font-inter font-semibold uppercase tracking-[0.16em]",
                dk
                  ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                  : "bg-teal-50 text-teal-700 border border-teal-100",
              ].join(" ")}
            >
              {t({ fr: "Modèle tarifaire", en: "Pricing model" })}
            </div>
            <h2
              className={[
                "font-poppins text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.03em]",
                textPrimary,
              ].join(" ")}
            >
              {t({ fr: "Setup", en: "Setup" })}
              <span className="text-brand-gradient">{t({ fr: " + licence mensuelle.", en: " + monthly licence." })}</span>
            </h2>
            <p className={["font-inter mt-4 text-[1.05rem] leading-relaxed", textSecondary].join(" ")}>
              {t({
                fr: "Un modèle simple et transparent. Pas d'abonnement opaque, pas de frais cachés.",
                en: "A simple, transparent model. No opaque subscription, no hidden fees.",
              })}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {modelPoints.map((pt, i) => (
              <div
                key={i}
                className={[
                  "pr-card flex gap-5 p-7 rounded-[20px] border",
                  borderMuted, cardBg,
                ].join(" ")}
                data-delay={String(i * 100)}
              >
                <div
                  className={[
                    "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5",
                    dk ? "bg-blue-500/10" : "bg-blue-50",
                  ].join(" ")}
                >
                  <Package className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3
                    className={[
                      "font-poppins text-[15px] font-semibold tracking-tight leading-snug mb-1.5",
                      textPrimary,
                    ].join(" ")}
                  >
                    {pt.label}
                  </h3>
                  <p className={["font-inter text-[14px] leading-relaxed", textSecondary].join(" ")}>
                    {pt.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div
            className={[
              "mt-8 max-w-3xl mx-auto flex items-start gap-4 px-6 py-5 rounded-2xl border",
              borderMuted,
              dk ? "bg-white/[0.025]" : "bg-blue-50/40",
            ].join(" ")}
          >
            <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
            <p className={["font-inter text-[14px] leading-relaxed", textSecondary].join(" ")}>
              {t({
                fr: "Le tarif exact est établi lors de l'appel découverte, en fonction du nombre d'utilisateurs, des automatisations souhaitées et du périmètre de votre déploiement.",
                en: "The exact price is set during the discovery call, based on the number of users, the automations needed, and your deployment scope.",
              })}
            </p>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          3. CE QUI EST INCLUS
      ══════════════════════════════════════════════════════════ */}
      <section
        className="py-24 md:py-32 px-6 lg:px-10"
        style={{ background: bg }}
      >
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2
              className={[
                "font-poppins text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.03em]",
                textPrimary,
              ].join(" ")}
            >
              {t({ fr: "Tout est inclus.", en: "Everything included." })}
            </h2>
            <p className={["font-inter mt-4 text-[1.05rem] leading-relaxed", textSecondary].join(" ")}>
              {t({
                fr: "Quel que soit le tarif, chaque client Ora bénéficie de l'ensemble des services.",
                en: "Whatever the price, every Ora client gets the full service.",
              })}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {includes.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className={[
                    "pr-card p-7 rounded-[20px] border transition-colors duration-200",
                    borderMuted, cardBg,
                    dk ? "hover:bg-white/[0.05]" : "hover:bg-gray-50/70",
                  ].join(" ")}
                  data-delay={String(i * 80)}
                >
                  <div
                    className={[
                      "w-10 h-10 rounded-xl flex items-center justify-center mb-5",
                      dk ? "bg-blue-500/10" : "bg-blue-50",
                    ].join(" ")}
                  >
                    <Icon className="w-5 h-5 text-blue-500" />
                  </div>
                  <h3
                    className={[
                      "font-poppins text-[15px] font-semibold tracking-tight leading-snug mb-2",
                      textPrimary,
                    ].join(" ")}
                  >
                    {item.title}
                  </h3>
                  <p className={["font-inter text-[13.5px] leading-relaxed", textSecondary].join(" ")}>
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          4. CTA
      ══════════════════════════════════════════════════════════ */}
      <section
        className="py-24 md:py-28 px-6 lg:px-10"
        style={{ background: bgContrast }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <div
            className={[
              "rounded-[32px] px-10 py-16 border",
              borderMuted,
              dk ? "bg-white/[0.03]" : "bg-gray-50/80",
            ].join(" ")}
          >
            <CalendarDays className="w-10 h-10 text-blue-500 mx-auto mb-6" />

            <h2
              className={[
                "font-poppins text-[clamp(1.6rem,3vw,2.5rem)] font-semibold tracking-[-0.03em]",
                textPrimary,
              ].join(" ")}
            >
              {t({ fr: "Parlons de votre projet.", en: "Let's talk about your project." })}
            </h2>

            <p className={["font-inter mt-4 text-[1.05rem] leading-relaxed", textSecondary].join(" ")}>
              {t({
                fr: "30 minutes, sans engagement. On évalue ensemble vos besoins et on vous prépare une proposition tarifaire sur mesure.",
                en: "30 minutes, no strings attached. We assess your needs together and prepare a tailored pricing proposal.",
              })}
            </p>

            <button
              onClick={openBooking}
              className={[
                "mt-9 group inline-flex items-center gap-2.5 px-8 py-4",
                "rounded-full text-[15px] font-inter font-semibold text-white",
                "transition-all duration-150 hover:-translate-y-px active:translate-y-0",
                "bg-gradient-to-r from-blue-600 via-blue-500 to-teal-600",
                "shadow-[0_4px_20px_rgba(37,99,235,0.28)]",
                "hover:shadow-[0_6px_28px_rgba(37,99,235,0.42)]",
              ].join(" ")}
            >
              {t({ fr: "Réserver un appel gratuit", en: "Book a free call" })}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-[3px] transition-transform duration-150" />
            </button>

            <div className="mt-8 flex flex-wrap justify-center gap-6">
              {[
                t({ fr: "Sans engagement", en: "No commitment" }),
                t({ fr: "Proposition sous 48h", en: "Proposal within 48h" }),
                t({ fr: "Démarrage en moins d'une semaine", en: "Live in under a week" }),
              ].map((label) => (
                <span
                  key={label}
                  className={["font-inter flex items-center gap-1.5 text-[13px]", textSecondary].join(" ")}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
