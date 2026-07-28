import { useState, type FormEvent } from "react";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, CalendarClock, Download, Eye, EyeOff,
  FileSpreadsheet, FileText, LifeBuoy, Lock, LogOut, Mail, PauseCircle,
  PlayCircle, Workflow,
} from "lucide-react";
import { useLang } from "../lib/i18n";

/**
 * EspaceClientPage — "Mon espace Ora", the client sign-in.
 * Premium split-screen: the form on the left, a brand panel on the right
 * (indigo card in the use-case-cards family, with the soft white round in
 * the corner).
 *
 * TEMPORARY AUTH BYPASS (client request 2026-07-24): any credentials are
 * accepted and land on a placeholder in-page "space" view. Nothing is sent
 * anywhere and no session persists. Replace `setView("space")` with the real
 * authentication call when the backend exists.
 * The "not a client yet" block routes to the site's #1 action: booking.
 */

type EspaceClientPageProps = {
  theme: "light" | "dark";
  onNavigate: (page: "home") => void;
  openBooking?: () => void;
};

export default function EspaceClientPage({ theme, onNavigate, openBooking }: EspaceClientPageProps) {
  const { t } = useLang();
  const [view, setView] = useState<"login" | "space">("login");
  const [userEmail, setUserEmail] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const logo = theme === "dark" ? "/logos/logo-color-light.png" : "/logos/logo-color-dark.png";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TEMPORARY bypass: accept anything, enter the placeholder space.
    // No credentials leave the page.
    const email = (new FormData(e.currentTarget as HTMLFormElement).get("email") as string) || "";
    setUserEmail(email);
    setView("space");
  };

  // ── Demo dashboard (post-"login") ───────────────────────────────────
  if (view === "space") {
    return (
      <SpaceView
        userEmail={userEmail}
        onLogout={() => setView("login")}
        onNavigate={onNavigate}
        openBooking={openBooking}
      />
    );
  }

  const inputClass =
    "w-full h-11 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.04] pl-10 pr-3.5 font-inter text-[14px] text-[#111827] dark:text-white placeholder:text-gray-400 outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-colors";

  return (
    <div className="min-h-screen flex bg-[#fcfbf7] dark:bg-black">
      {/* ── Left: sign-in form ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-16">
        <div className="w-full max-w-[23rem] mx-auto">
          {/* Logo → home */}
          <button
            onClick={() => onNavigate("home")}
            className="block"
            aria-label={t({ fr: "Retour à l'accueil", en: "Back home" })}
          >
            <img src={logo} alt="Ora" className="h-8 w-auto" />
          </button>

          <h1 className="mt-10 font-poppins font-semibold text-[1.75rem] tracking-[-0.02em] text-[#111827] dark:text-white">
            {t({ fr: "Mon espace Ora", en: "My Ora space" })}
          </h1>
          <p className="mt-2 font-inter text-[14px] text-gray-500 dark:text-gray-400">
            {t({ fr: "Connectez-vous pour retrouver vos automatisations.", en: "Sign in to access your automations." })}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="ec-email" className="block font-inter text-[13px] font-semibold text-[#111827] dark:text-gray-200 mb-1.5">
                {t({ fr: "Email professionnel", en: "Work email" })}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="ec-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder={t({ fr: "vous@cabinet.fr", en: "you@firm.com" })}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="ec-pwd" className="block font-inter text-[13px] font-semibold text-[#111827] dark:text-gray-200">
                  {t({ fr: "Mot de passe", en: "Password" })}
                </label>
                <button type="button" className="font-inter text-[12.5px] font-medium text-[#3b82f6] hover:underline">
                  {t({ fr: "Mot de passe oublié ?", en: "Forgot password?" })}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="ec-pwd"
                  type={showPwd ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  aria-label={t({ fr: showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe", en: showPwd ? "Hide password" : "Show password" })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="group w-full h-11 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] font-inter font-semibold text-[14.5px] text-white inline-flex items-center justify-center gap-2 shadow-[0_2px_12px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_20px_rgba(59,130,246,0.4)] hover:-translate-y-px active:translate-y-0 transition-all duration-150"
            >
              {t({ fr: "Se connecter", en: "Sign in" })}
              <ArrowRight className="w-4 h-4 opacity-80 transition-transform duration-150 group-hover:translate-x-0.5" />
            </button>

          </form>

          {/* Not a client yet → the site's #1 action */}
          <div className="mt-9 pt-7 border-t border-gray-200/80 dark:border-white/[0.08]">
            <p className="font-inter text-[13.5px] text-gray-500 dark:text-gray-400">
              {t({ fr: "Pas encore client ?", en: "Not a client yet?" })}{" "}
              <button
                type="button"
                onClick={openBooking ?? (() => onNavigate("home"))}
                className="font-semibold text-[#3b82f6] hover:underline"
              >
                {t({ fr: "Réservez un appel découverte", en: "Book a discovery call" })}
              </button>
            </p>
          </div>

          <button
            onClick={() => onNavigate("home")}
            className="mt-7 flex items-center gap-1.5 font-inter text-[13px] text-gray-500 dark:text-gray-400 hover:text-[#111827] dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t({ fr: "Retour à l'accueil", en: "Back to home" })}
          </button>
        </div>
      </div>

      {/* ── Right: brand panel (desktop only). Starts below the fixed nav
          so the nav never sits on the indigo. ──────────────────────── */}
      <div className="hidden lg:flex w-[44%] p-4 pt-[84px]">
        <div className="relative w-full rounded-[28px] overflow-hidden bg-[#5865E3] flex flex-col">
          {/* Soft white round, clipped into the bottom-right corner, kept
              well clear of the copy (use-case-cards family). */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-48 -bottom-64 w-[34rem] h-[34rem] rounded-full"
            style={{ background: "radial-gradient(circle at 42% 40%,#ffffff,#eef3fc 62%,#e3eaf7)" }}
          />
          {/* Faint top light */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(80% 50% at 50% -10%, rgba(255,255,255,0.16) 0%, transparent 65%)" }}
          />

          <div className="relative p-10 xl:p-14">
            <h2 className="font-poppins font-semibold text-[2rem] xl:text-[2.4rem] leading-[1.15] tracking-[-0.02em] text-white max-w-md">
              {t({
                fr: "Toutes vos automatisations, au même endroit.",
                en: "All your automations, in one place.",
              })}
            </h2>
            <p className="mt-4 font-inter text-[15px] leading-relaxed text-white/75 max-w-sm">
              {t({
                fr: "Votre espace client arrive bientôt : vos workflows, vos livrables et votre suivi, réunis.",
                en: "Your client space is coming soon: your workflows, deliverables and follow-up, together.",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SpaceView — the demo dashboard shown after the temporary auth bypass.
//  Everything here is DEMO DATA (same fictional universe as the homepage
//  mockups: Groupe Méridian, dossier Émeraude, FEC Studio). A visible
//  "Espace de démonstration" badge makes that explicit. Replace with real
//  data when the backend exists.
// ─────────────────────────────────────────────────────────────────────────────

function SpaceView({
  userEmail,
  onLogout,
  onNavigate,
  openBooking,
}: {
  userEmail: string;
  onLogout: () => void;
  onNavigate: (page: "home") => void;
  openBooking?: () => void;
}) {
  const { t } = useLang();

  const kpis = [
    { label: t({ fr: "Automatisations actives", en: "Active automations" }), value: "4", icon: Workflow },
    { label: t({ fr: "Exécutions ce mois", en: "Runs this month" }), value: "128", icon: PlayCircle },
    { label: t({ fr: "Livrables générés", en: "Deliverables generated" }), value: "36", icon: FileText },
    { label: t({ fr: "Prochaine exécution", en: "Next run" }), value: t({ fr: "Demain 07:00", en: "Tomorrow 7:00" }), icon: CalendarClock },
  ];

  const automations = [
    {
      name: t({ fr: "Reporting mensuel · Groupe Méridian", en: "Monthly reporting · Groupe Méridian" }),
      meta: t({ fr: "Planifié · chaque 1er du mois · dernière exécution le 1 juil. à 07:00", en: "Scheduled · 1st of each month · last run Jul 1, 7:00 AM" }),
      status: "active" as const,
    },
    {
      name: t({ fr: "Extraction PDF · Relevés bancaires", en: "PDF extraction · Bank statements" }),
      meta: t({ fr: "À la demande · dernière exécution hier à 16:24", en: "On demand · last run yesterday, 4:24 PM" }),
      status: "active" as const,
    },
    {
      name: t({ fr: "Pointage de comptes · Dossier Émeraude", en: "Account matching · Émeraude file" }),
      meta: t({ fr: "Hebdomadaire · lundi 08:00 · dernière exécution le 20 juil.", en: "Weekly · Monday 8:00 AM · last run Jul 20" }),
      status: "active" as const,
    },
    {
      name: t({ fr: "FEC Studio · Exercice 2025", en: "FEC Studio · Fiscal year 2025" }),
      meta: t({ fr: "À la demande · dernière exécution le 12 juil.", en: "On demand · last run Jul 12" }),
      status: "paused" as const,
    },
  ];

  const deliverables = [
    { name: "Reporting_Méridian_juin.xlsx", date: t({ fr: "12 juil.", en: "Jul 12" }), size: "412 Ko", kind: "xlsx" as const },
    { name: "Synthese_IDF_062026.pdf", date: t({ fr: "12 juil.", en: "Jul 12" }), size: "86 Ko", kind: "pdf" as const },
    { name: "Pointage_Emeraude_S29.xlsx", date: t({ fr: "20 juil.", en: "Jul 20" }), size: "264 Ko", kind: "xlsx" as const },
    { name: "FEC_2025_controles.xlsx", date: t({ fr: "1 juil.", en: "Jul 1" }), size: "1,2 Mo", kind: "xlsx" as const },
  ];

  return (
    <div className="min-h-screen bg-[#fcfbf7] dark:bg-black px-6 pt-28 md:pt-32 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-poppins font-semibold text-[1.9rem] md:text-[2.2rem] tracking-[-0.02em] text-[#111827] dark:text-white">
                {t({ fr: "Bonjour", en: "Hello" })}
              </h1>
              <span className="rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200/70 dark:border-blue-400/20 px-3 py-1 font-inter text-[11.5px] font-semibold text-[#3b82f6]">
                {t({ fr: "Espace de démonstration", en: "Demo space" })}
              </span>
            </div>
            <p className="mt-2 font-inter text-[14.5px] text-gray-500 dark:text-gray-400">
              {userEmail
                ? t({ fr: `Connecté en tant que ${userEmail}. `, en: `Signed in as ${userEmail}. ` })
                : ""}
              {t({
                fr: "Les données affichées sont fictives, votre espace réel arrive bientôt.",
                en: "The data shown is fictional, your real space is coming soon.",
              })}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-inter font-semibold text-[13.5px] text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-white/15 hover:bg-gray-100/70 dark:hover:bg-white/[0.06] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {t({ fr: "Se déconnecter", en: "Sign out" })}
          </button>
        </div>

        {/* ── KPI row ────────────────────────────────────────────── */}
        <div className="mt-9 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="rounded-2xl border border-gray-200/80 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] p-5">
                <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                  <Icon className="w-4 h-4" />
                  <span className="font-inter text-[12px] font-semibold uppercase tracking-[0.06em]">{k.label}</span>
                </div>
                <div className="mt-2.5 font-poppins font-semibold text-[1.5rem] tracking-[-0.02em] text-[#111827] dark:text-white">
                  {k.value}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Main grid: automations + right column ──────────────── */}
        <div className="mt-6 grid lg:grid-cols-3 gap-6 items-start">
          {/* Automations */}
          <div className="lg:col-span-2 rounded-2xl border border-gray-200/80 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
              <h2 className="font-poppins font-semibold text-[1.1rem] tracking-[-0.01em] text-[#111827] dark:text-white">
                {t({ fr: "Mes automatisations", en: "My automations" })}
              </h2>
              <span className="font-inter text-[12.5px] text-gray-400">{automations.length}</span>
            </div>
            <ul className="divide-y divide-gray-100 dark:divide-white/[0.06]">
              {automations.map((a) => (
                <li key={a.name} className="flex items-center gap-4 px-6 py-4">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 shrink-0">
                    <Workflow className="w-4 h-4 text-[#3b82f6]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-inter font-semibold text-[14px] text-[#111827] dark:text-white truncate">{a.name}</div>
                    <div className="mt-0.5 font-inter text-[12.5px] text-gray-500 dark:text-gray-400 truncate">{a.meta}</div>
                  </div>
                  {a.status === "active" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 font-inter text-[11.5px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {t({ fr: "Actif", en: "Active" })}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] px-2.5 py-1 font-inter text-[11.5px] font-semibold text-gray-500 dark:text-gray-400 shrink-0">
                      <PauseCircle className="w-3.5 h-3.5" />
                      {t({ fr: "En pause", en: "Paused" })}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Right column: deliverables + support */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200/80 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] overflow-hidden">
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
                <h2 className="font-poppins font-semibold text-[1.1rem] tracking-[-0.01em] text-[#111827] dark:text-white">
                  {t({ fr: "Derniers livrables", en: "Latest deliverables" })}
                </h2>
              </div>
              <ul className="divide-y divide-gray-100 dark:divide-white/[0.06]">
                {deliverables.map((d) => (
                  <li key={d.name} className="flex items-center gap-3 px-6 py-3.5">
                    {d.kind === "xlsx" ? (
                      <FileSpreadsheet className="w-[18px] h-[18px] text-emerald-600 shrink-0" />
                    ) : (
                      <FileText className="w-[18px] h-[18px] text-red-500 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-inter font-medium text-[13px] text-[#111827] dark:text-white truncate">{d.name}</div>
                      <div className="font-inter text-[11.5px] text-gray-400">{d.date} · {d.size}</div>
                    </div>
                    <button
                      type="button"
                      aria-label={t({ fr: "Télécharger (démo)", en: "Download (demo)" })}
                      title={t({ fr: "Indisponible en démo", en: "Unavailable in demo" })}
                      className="p-1.5 rounded-md text-gray-300 dark:text-gray-600 cursor-not-allowed shrink-0"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support / new automation → booking */}
            <div className="rounded-2xl border border-blue-200/60 dark:border-blue-400/20 bg-blue-50/60 dark:bg-blue-500/[0.07] p-6">
              <div className="flex items-center gap-2.5 text-[#3b82f6]">
                <LifeBuoy className="w-[18px] h-[18px]" />
                <h2 className="font-poppins font-semibold text-[1.05rem] tracking-[-0.01em] text-[#111827] dark:text-white">
                  {t({ fr: "Une automatisation à ajouter ?", en: "An automation to add?" })}
                </h2>
              </div>
              <p className="mt-2 font-inter text-[13.5px] leading-relaxed text-gray-600 dark:text-gray-300">
                {t({
                  fr: "Décrivez votre workflow à l'équipe Ora Engineering, on s'occupe du reste.",
                  en: "Describe your workflow to the Ora Engineering team, we handle the rest.",
                })}
              </p>
              <button
                type="button"
                onClick={openBooking ?? (() => onNavigate("home"))}
                className="group mt-4 inline-flex items-center gap-2 rounded-full bg-[#3b82f6] hover:bg-[#2563eb] px-5 py-2.5 font-inter font-semibold text-[13.5px] text-white shadow-[0_2px_10px_rgba(59,130,246,0.25)] transition-all duration-150 hover:-translate-y-px"
              >
                {t({ fr: "Réserver un appel", en: "Book a call" })}
                <ArrowUpRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate("home")}
          className="mt-10 flex items-center gap-1.5 font-inter text-[13px] text-gray-500 dark:text-gray-400 hover:text-[#111827] dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t({ fr: "Retour à l'accueil", en: "Back to home" })}
        </button>
      </div>
    </div>
  );
}
