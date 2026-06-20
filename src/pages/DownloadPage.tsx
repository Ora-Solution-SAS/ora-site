/**
 * DownloadPage — Hidden client download / install page.
 *
 * Reached ONLY via the private direct link (see App.tsx → PAGE_TO_PATH:
 * "/telechargement/ora-app"). It is deliberately NOT listed in the nav or
 * footer, and NOT added to HIDDEN_PAGES (that set forces a 404 even on direct
 * access — which would defeat the purpose of a shareable client link).
 *
 * Standalone chrome: App.tsx hides the global Navigation + Footer for this
 * page, so the client stays focused on installing.
 *
 * Entrance animations are CSS-based (matching the rest of the site) rather
 * than rAF/JS-driven, and a `dl-ready` safety class force-reveals all content
 * after 1.5s — so the critical download buttons are guaranteed visible even if
 * the animation engine never ticks (e.g. tab loaded in the background).
 *
 * ⚠️ Download links are PLACEHOLDERS for now. Paste the real installer URLs
 * into the DOWNLOADS config below — the buttons activate automatically.
 */

import { useEffect, useState } from "react";
import {
  Download,
  Sparkles,
  Rocket,
  Cpu,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Mail,
  PhoneCall,
  Clock,
  FileDown,
  Sun,
  Moon,
} from "lucide-react";
import { useLang } from "../lib/i18n";

/* ──────────────────────────────────────────────────────────────────────────
   CONFIG — edit these when a new build ships
   ────────────────────────────────────────────────────────────────────────── */

/** Latest released version + date shown in the hero badge. */
const APP_VERSION = "1.0.0";
const RELEASE_DATE = { fr: "Juin 2026", en: "June 2026" };

/**
 * Direct download URLs. These point at same-origin /updates/* paths that
 * Vercel 307-redirects to the release bucket (see vercel.json `redirects`).
 * Leave `url: null` to show a "coming soon" disabled button instead.
 *   mac     → /updates/Ora-latest-macos.dmg      (Apple Silicon build)
 *   windows → /updates/Ora-latest-windows.exe    (404 until a Windows release
 *             is published on the bucket — keep null until then to avoid it)
 * `size` is optional display text (e.g. "78 Mo"); leave null to hide it.
 */
const DOWNLOADS: Record<"windows" | "mac", { url: string | null; size: string | null }> = {
  windows: { url: "/updates/Ora-latest-windows.exe", size: null },
  mac: { url: "/updates/Ora-latest-macos.dmg", size: null },
};

/** Support inbox surfaced in the help section. */
const SUPPORT_EMAIL = "raphael.gaugain@ora-solution.com";

/* ──────────────────────────────────────────────────────────────────────────
   OS detection — highlight the visitor's platform
   ────────────────────────────────────────────────────────────────────────── */

type OS = "windows" | "mac" | "other";

function detectOS(): OS {
  if (typeof navigator === "undefined") return "other";
  const ua = (navigator.userAgent || "").toLowerCase();
  const plat = (
    (navigator as any).userAgentData?.platform ||
    navigator.platform ||
    ""
  ).toLowerCase();
  if (plat.includes("win") || ua.includes("windows")) return "windows";
  if (plat.includes("mac") || ua.includes("mac") || ua.includes("darwin")) return "mac";
  return "other";
}

/* ──────────────────────────────────────────────────────────────────────────
   Brand marks — inline SVG (lucide has no real Windows / Apple-Inc logos)
   ────────────────────────────────────────────────────────────────────────── */

const WindowsMark = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M0 3.449 9.75 2.1v9.451H0V3.449zM10.949 1.949 24 0v11.4H10.949V1.949zM0 12.6h9.75v9.451L0 20.699V12.6zM10.949 12.6H24V24l-13.051-1.351V12.6z" />
  </svg>
);

const AppleMark = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M16.365 1.43c0 1.14-.42 2.2-1.12 2.98-.78.88-2.05 1.56-3.1 1.48-.13-1.1.42-2.27 1.07-3 .73-.82 2.02-1.44 3.15-1.46zM20.7 17.2c-.55 1.27-.82 1.84-1.53 2.96-.99 1.57-2.39 3.52-4.12 3.53-1.54.01-1.94-1-4.03-.99-2.09.01-2.53 1.01-4.07.99-1.73-.02-3.05-1.78-4.04-3.35-2.77-4.4-3.06-9.56-1.35-12.3 1.21-1.95 3.12-3.09 4.92-3.09 1.83 0 2.98 1.01 4.49 1.01 1.47 0 2.36-1.01 4.48-1.01 1.6 0 3.3.87 4.51 2.38-3.96 2.17-3.32 7.83.27 9.86z" />
  </svg>
);

/**
 * Static "app icon" tile — the real Ora app logo (the color icon on a white
 * squircle), the way the installed app appears. No animation. The white tile
 * stays white in both themes, like a genuine app icon.
 */
const OraAppIcon = () => (
  <div className="inline-flex items-center justify-center w-[104px] h-[104px] rounded-[28px] bg-white shadow-[0_22px_46px_-14px_rgba(15,23,42,0.30)] ring-1 ring-black/[0.06] dark:ring-white/10">
    <img
      src="/logos/icon-color.png"
      alt="Ora"
      className="w-[60px] h-[60px] object-contain"
    />
  </div>
);

/* ──────────────────────────────────────────────────────────────────────────
   Self-contained CSS — entrance + ambience (no JS animation engine needed)
   ────────────────────────────────────────────────────────────────────────── */

const pageCSS = `
.dl-aurora { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.dl-aurora::before {
  content: "";
  position: absolute;
  inset: -25%;
  background:
    radial-gradient(620px 620px at 18% 12%, rgba(59,130,246,0.20), transparent 68%),
    radial-gradient(560px 560px at 84% 20%, rgba(13,148,136,0.18), transparent 68%),
    radial-gradient(640px 640px at 50% 92%, rgba(59,130,246,0.12), transparent 68%);
  animation: dlAurora 16s ease-in-out infinite;
  will-change: transform;
}
@keyframes dlAurora {
  0%, 100% { transform: translate3d(-1.5%, -1%, 0) scale(1); }
  50%      { transform: translate3d(1.5%, 1.2%, 0) scale(1.05); }
}

/* Staggered entrance — ends at opacity:1 (forwards), so content settles visible */
@keyframes dlRise {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
.dl-rise { opacity: 0; animation: dlRise 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.dl-d1 { animation-delay: 60ms; }
.dl-d2 { animation-delay: 140ms; }
.dl-d3 { animation-delay: 220ms; }
.dl-d4 { animation-delay: 300ms; }
.dl-d5 { animation-delay: 380ms; }
.dl-d6 { animation-delay: 460ms; }

/* Safety net: once mounted (1.5s) force every element visible, no matter what
   the animation engine did. Guarantees the download buttons are never stuck
   invisible (e.g. background tab pausing rAF / CSS animations). */
.dl-ready .dl-rise { opacity: 1 !important; animation: none !important; transform: none !important; }

@keyframes dlBob {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(2px); }
}
.dl-bob { animation: dlBob 1.6s ease-in-out infinite; }

.dl-grid {
  -webkit-mask-image: radial-gradient(ellipse 72% 62% at 50% 38%, #000 30%, transparent 80%);
  mask-image: radial-gradient(ellipse 72% 62% at 50% 38%, #000 30%, transparent 80%);
}

@media (prefers-reduced-motion: reduce) {
  .dl-aurora::before, .dl-bob { animation: none !important; }
  .dl-rise { opacity: 1 !important; animation: none !important; transform: none !important; }
}
`;

/* ──────────────────────────────────────────────────────────────────────────
   Download card
   ────────────────────────────────────────────────────────────────────────── */

function DownloadCard({ os, recommended }: { os: "windows" | "mac"; recommended: boolean }) {
  const { t } = useLang();
  const target = DOWNLOADS[os];
  const isMac = os === "mac";
  const platformLabel = isMac ? "Mac" : "Windows";

  return (
    <div
      className={`relative rounded-3xl border p-7 text-left transition-all duration-200 hover:-translate-y-1 bg-white border-gray-200/80 shadow-[0_2px_18px_rgba(15,23,42,0.05)] hover:shadow-[0_10px_34px_rgba(15,23,42,0.10)] dark:bg-white/[0.03] dark:border-white/10 ${
        recommended ? "ring-2 ring-blue-500/55 dark:ring-blue-400/45" : ""
      }`}
    >
      {recommended && (
        <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-inter font-semibold text-white bg-gradient-to-r from-[#3b82f6] to-[#0d9488] shadow-md">
          <Sparkles className="w-3 h-3" />
          {t({ fr: "Recommandé pour vous", en: "Recommended for you" })}
        </span>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-500/15 dark:to-teal-500/15 text-[#111827] dark:text-white flex-shrink-0">
          {isMac ? <AppleMark className="w-7 h-7" /> : <WindowsMark className="w-6 h-6" />}
        </div>
        <div>
          <h3 className="font-poppins font-semibold text-xl tracking-[-0.02em] text-[#111827] dark:text-white">
            {isMac ? "macOS" : "Windows"}
          </h3>
          <p className="font-inter text-sm text-gray-500 dark:text-gray-400">
            {isMac
              ? t({ fr: "macOS 12 ou plus récent", en: "macOS 12 or newer" })
              : t({ fr: "Windows 10 ou 11 (64-bit)", en: "Windows 10 or 11 (64-bit)" })}
          </p>
        </div>
      </div>

      {/* Mac hardware note — Apple Silicon only */}
      {isMac && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl px-4 py-3 bg-amber-50 border border-amber-100 text-amber-700 dark:bg-amber-400/10 dark:border-amber-400/20 dark:text-amber-300">
          <Cpu className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p className="font-inter text-[13px] leading-relaxed">
            {t({
              fr: "Puce Apple Silicon requise (M1, M2, M3 ou plus récent). Les Mac Intel ne sont pas encore pris en charge.",
              en: "Apple Silicon required (M1, M2, M3 or newer). Intel Macs aren't supported yet.",
            })}
          </p>
        </div>
      )}

      <div className="mt-6">
        {target.url ? (
          <a
            href={target.url}
            download
            className="group inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 rounded-full text-[15px] font-inter font-semibold text-white bg-gradient-to-r from-[#3b82f6] to-[#0d9488] shadow-[0_4px_20px_rgba(37,99,235,0.32)] hover:shadow-[0_6px_28px_rgba(37,99,235,0.45)] hover:-translate-y-px active:translate-y-0 transition-all duration-150"
          >
            <Download className="w-4 h-4 dl-bob" />
            {t({ fr: `Télécharger pour ${platformLabel}`, en: `Download for ${platformLabel}` })}
          </a>
        ) : (
          <div className="inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 rounded-full text-[15px] font-inter font-semibold cursor-not-allowed border text-gray-400 border-gray-200 bg-gray-50 dark:text-gray-500 dark:border-white/10 dark:bg-white/[0.03]">
            <Clock className="w-4 h-4" />
            {t({ fr: "Disponible très bientôt", en: "Available very soon" })}
          </div>
        )}

        <p className="mt-3 text-center font-inter text-[12px] text-gray-400 dark:text-gray-500">
          {target.url
            ? `${target.size ? `${target.size} · ` : ""}${t({
                fr: "Installation en quelques secondes",
                en: "Installs in seconds",
              })}`
            : t({
                fr: "Le lien de téléchargement sera bientôt actif.",
                en: "The download link will be active soon.",
              })}
        </p>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Page
   ────────────────────────────────────────────────────────────────────────── */

type Props = {
  theme: "light" | "dark";
  openBooking: () => void;
  onNavigate?: (page: "home") => void;
  onToggleTheme?: () => void;
};

export default function DownloadPage({ theme, openBooking, onNavigate, onToggleTheme }: Props) {
  const { t, lang, setLang } = useLang();
  const [os] = useState<OS>(() => detectOS());

  // Safety net: after 1.5s, force-reveal all `.dl-rise` content regardless of
  // whether the entrance animation actually ran (see pageCSS `.dl-ready`).
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setReady(true), 1500);
    return () => clearTimeout(id);
  }, []);

  const dk = theme === "dark";
  const bg = dk ? "#111827" : "#fcfbf7";
  const bgContrast = dk ? "#0f172a" : "#ffffff";

  // Show the detected platform first, and badge it as recommended.
  const order: ("windows" | "mac")[] = os === "mac" ? ["mac", "windows"] : ["windows", "mac"];

  const steps = [
    {
      Icon: FileDown,
      title: t({ fr: "Téléchargez Ora", en: "Download Ora" }),
      desc: t({
        fr: "Choisissez votre système et récupérez le fichier d'installation. Un seul fichier, rien à configurer.",
        en: "Pick your system and grab the installer. One file, nothing to configure.",
      }),
    },
    {
      Icon: Sparkles,
      title: t({ fr: "Installez en un clin d'œil", en: "Install in a snap" }),
      desc: t({
        fr: "Ouvrez le fichier téléchargé et laissez-vous guider. Quelques secondes suffisent.",
        en: "Open the downloaded file and follow along. It only takes a few seconds.",
      }),
    },
    {
      Icon: Rocket,
      title: t({ fr: "Lancez l'aventure", en: "Start the journey" }),
      desc: t({
        fr: "Ouvrez Ora, connectez votre premier fichier Excel, et regardez vos tâches s'automatiser.",
        en: "Open Ora, connect your first Excel file, and watch your tasks automate themselves.",
      }),
    },
  ];

  const year = new Date().getFullYear();

  return (
    <div
      className={`min-h-screen text-[#111827] dark:text-white ${ready ? "dl-ready" : ""}`}
      style={{ backgroundColor: bg }}
    >
      <style>{pageCSS}</style>

      {/* ── Minimal top bar : logo + language switch ──────────────────────── */}
      <header className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5">
        <button
          type="button"
          onClick={() => onNavigate?.("home")}
          className="inline-flex items-center"
          aria-label="Ora"
        >
          <img
            src={dk ? "/logos/logo-color-light.png" : "/logos/logo-color-dark.png"}
            alt="Ora"
            className="h-7 w-auto"
          />
        </button>

        <div className="flex items-center gap-2">
          {/* Manual dark / light toggle — the system preference still applies as
              the default and live-updates when no manual choice is made. */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={dk ? "Passer en mode clair" : "Passer en mode sombre"}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/[0.06] transition-colors"
            >
              {dk ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          <div className="inline-flex items-center rounded-full border border-gray-200 dark:border-white/10 p-0.5 text-[12px] font-inter font-semibold">
            {(["fr", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`px-2.5 py-1 rounded-full transition-colors ${
                  lang === l
                    ? "bg-gradient-to-r from-[#3b82f6] to-[#0d9488] text-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 md:px-12 pt-8 md:pt-12 pb-20 md:pb-28">
        {/* Subtle grid + aurora ambience */}
        <div
          className="dl-grid absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage: `linear-gradient(to right, ${
              dk ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"
            } 1px, transparent 1px), linear-gradient(to bottom, ${
              dk ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"
            } 1px, transparent 1px)`,
            backgroundSize: "56px 56px",
          }}
        />
        <div className="dl-aurora" aria-hidden="true" />

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center">
          {/* Static Ora app icon — evokes the app you're about to install */}
          <div className="dl-rise">
            <OraAppIcon />
          </div>

          {/* Eyebrow */}
          <p className="dl-rise dl-d1 mt-7 inline-flex items-center gap-2 font-inter text-[12px] font-semibold uppercase tracking-[0.18em] text-blue-500">
            <Sparkles className="w-3.5 h-3.5" />
            {t({ fr: "Bienvenue à bord", en: "Welcome aboard" })}
          </p>

          {/* Title */}
          <h1 className="dl-rise dl-d2 mt-4 font-poppins font-semibold tracking-[-0.03em] leading-[1.05] text-4xl md:text-6xl text-[#111827] dark:text-white">
            {t({ fr: "Votre aventure Ora ", en: "Your Ora journey " })}
            <span className="text-brand-gradient">
              {t({ fr: "commence ici.", en: "starts here." })}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="dl-rise dl-d3 mt-6 max-w-2xl font-inter text-base md:text-lg leading-relaxed text-gray-500 dark:text-gray-400">
            {t({
              fr: "Téléchargez l'application, installez-la en quelques secondes, et laissez Ora prendre en main vos tâches Excel les plus répétitives. On a hâte de vous voir gagner du temps.",
              en: "Download the app, install it in seconds, and let Ora take over your most repetitive Excel tasks. We can't wait to watch you save time.",
            })}
          </p>

          {/* Version badge */}
          <div className="dl-rise dl-d4 mt-7 inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-inter text-[13px] font-medium border bg-white/70 border-gray-200 text-gray-600 dark:bg-white/[0.04] dark:border-white/10 dark:text-gray-300 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            {t({ fr: "Dernière version", en: "Latest version" })}
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="font-semibold text-[#111827] dark:text-white">v{APP_VERSION}</span>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            {t(RELEASE_DATE)}
          </div>

          {/* Download cards */}
          <div className="dl-rise dl-d5 mt-12 w-full grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
            {order.map((key) => (
              <DownloadCard key={key} os={key} recommended={os === key} />
            ))}
          </div>

          {/* Trust line — reuse the site's "local & secure" promise */}
          <div className="dl-rise dl-d6 mt-8 inline-flex items-center gap-2 font-inter text-[13px] text-gray-500 dark:text-gray-400">
            <ShieldCheck className="w-4 h-4 text-teal-500" />
            {t({
              fr: "Traitement 100% local · vos fichiers restent chez vous",
              en: "100% local processing · your files stay with you",
            })}
          </div>
        </div>
      </section>

      {/* ── INSTALL STEPS ─────────────────────────────────────────────────── */}
      <section
        className="relative px-6 md:px-12 py-20 md:py-28"
        style={{ backgroundColor: bgContrast }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center">
            <p className="dl-rise font-inter text-[12px] font-semibold uppercase tracking-[0.18em] text-blue-500">
              {t({ fr: "Prise en main", en: "Getting started" })}
            </p>
            <h2 className="dl-rise dl-d1 mt-3 font-poppins font-semibold tracking-[-0.03em] text-3xl md:text-5xl text-[#111827] dark:text-white">
              {t({ fr: "Votre aventure, en 3 étapes", en: "Your journey, in 3 steps" })}
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, i) => {
              const StepIcon = step.Icon;
              return (
                <div
                  key={i}
                  className={`dl-rise dl-d${i + 2} relative rounded-3xl border p-7 bg-white border-gray-200/70 shadow-[0_2px_16px_rgba(15,23,42,0.04)] dark:bg-white/[0.03] dark:border-white/10`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 text-white shadow-[0_4px_14px_rgba(37,99,235,0.3)]">
                      <StepIcon className="w-5 h-5" />
                    </div>
                    <span className="font-poppins font-semibold text-5xl leading-none text-gray-100 dark:text-white/10 select-none">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 font-poppins font-semibold text-lg tracking-[-0.02em] text-[#111827] dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 font-inter text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HELP & CONTACT ────────────────────────────────────────────────── */}
      <section className="relative px-6 md:px-12 py-20 md:py-28" style={{ backgroundColor: bg }}>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="dl-rise inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-500">
            <PhoneCall className="w-6 h-6" />
          </div>

          <h2 className="dl-rise dl-d1 mt-6 font-poppins font-semibold tracking-[-0.03em] text-3xl md:text-4xl text-[#111827] dark:text-white">
            {t({ fr: "Un grain de sable ? On est là.", en: "Hit a snag? We're here." })}
          </h2>
          <p className="dl-rise dl-d2 mt-4 mx-auto max-w-xl font-inter text-base leading-relaxed text-gray-500 dark:text-gray-400">
            {t({
              fr: "Une question pendant l'installation, un doute sur la configuration ? Notre équipe vous répond vite et vous accompagne pas à pas.",
              en: "A question during install, unsure about your setup? Our team replies fast and walks you through it.",
            })}
          </p>

          <div className="dl-rise dl-d3 mt-9 flex items-center justify-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={openBooking}
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-inter font-semibold text-white bg-gradient-to-r from-[#3b82f6] to-[#0d9488] shadow-[0_4px_20px_rgba(37,99,235,0.32)] hover:shadow-[0_6px_28px_rgba(37,99,235,0.45)] hover:-translate-y-px active:translate-y-0 transition-all duration-150"
            >
              <PhoneCall className="w-4 h-4" />
              {t({ fr: "Réserver un appel", en: "Book a call" })}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-[3px] transition-transform duration-150" />
            </button>
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                t({ fr: "Aide installation Ora", en: "Ora install help" }),
              )}`}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-inter font-semibold border transition-all duration-150 hover:-translate-y-px active:translate-y-0 border-gray-300 text-[#111827] hover:bg-gray-50 dark:border-white/15 dark:text-white dark:hover:bg-white/[0.06]"
            >
              <Mail className="w-4 h-4" />
              {t({ fr: "Écrire au support", en: "Email support" })}
            </a>
          </div>

          <div className="dl-rise dl-d4 mt-8 inline-flex items-center gap-2 font-inter text-[13px] text-gray-400 dark:text-gray-500">
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
            {t({ fr: "Réponse sous 24 h ouvrées", en: "Reply within 1 business day" })}
          </div>
        </div>

        {/* Minimal standalone footer line (no full site footer on this page) */}
        <div className="max-w-3xl mx-auto mt-16 pt-8 border-t border-gray-200/70 dark:border-white/10 text-center font-inter text-[12px] text-gray-400 dark:text-gray-500">
          © {year} Ora. {t({ fr: "Tous droits réservés.", en: "All rights reserved." })}
        </div>
      </section>
    </div>
  );
}
