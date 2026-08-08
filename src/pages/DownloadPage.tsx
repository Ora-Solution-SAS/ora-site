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
import { Sun, Moon } from "lucide-react";
import { useLang } from "../lib/i18n";
import DownloadShowcase from "../components/DownloadShowcase";
import DeliverablesShowcase from "../components/DeliverablesShowcase";

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

/** Boîte de support affichée dans la section d'aide. Alignée sur la boîte
 *  générique le 2026-08-03, comme la prise de rendez-vous : c'est un client
 *  installé qui écrit ici, souvent parce que quelque chose ne marche pas, et une
 *  adresse nominative n'est relevée que par une personne. */
const SUPPORT_EMAIL = "contact@ora-solution.com";

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
   Boutons

   Le couple exact de la barre de navigation (Navigation.tsx) : bleu plein
   #3b82f6 pour l'action principale, contour bleu pour la seconde, pastille
   pleine, aucune icône. Repris ici le 2026-08-06 pour que la page de
   téléchargement parle la même langue que le reste du site.
   ────────────────────────────────────────────────────────────────────────── */

const BTN_BASE =
  "inline-flex items-center justify-center rounded-full px-7 py-3.5 text-[15px] font-inter font-semibold transition-all duration-150";

const BTN_SOLID =
  "text-white bg-[#3b82f6] hover:bg-[#2563eb] shadow-[0_2px_10px_rgba(59,130,246,0.22)] hover:shadow-[0_4px_18px_rgba(59,130,246,0.35)] hover:-translate-y-px active:translate-y-0";

const BTN_OUTLINE =
  "border border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/[0.07] dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400/10";

/* ──────────────────────────────────────────────────────────────────────────
   Self-contained CSS — entrance + ambience (no JS animation engine needed)
   ────────────────────────────────────────────────────────────────────────── */

const pageCSS = `
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

@media (prefers-reduced-motion: reduce) {
  .dl-rise { opacity: 1 !important; animation: none !important; transform: none !important; }
}
`;

/* ──────────────────────────────────────────────────────────────────────────
   Download button

   Le hero est en deux colonnes (visuel à gauche, texte à droite) depuis le
   2026-08-05 : les grosses cartes par système ne tiennent plus dans une demi
   largeur, elles sont devenues des boutons. La plateforme détectée passe en
   premier et prend le bouton plein, l'autre reste en contour.
   ────────────────────────────────────────────────────────────────────────── */

function DownloadButton({ os, primary }: { os: "windows" | "mac"; primary: boolean }) {
  const { t } = useLang();
  const target = DOWNLOADS[os];
  const platformLabel = os === "mac" ? "Mac" : "Windows";

  if (!target.url) {
    return (
      <span
        className={`${BTN_BASE} cursor-not-allowed border border-gray-200 text-gray-400 dark:border-white/10 dark:text-gray-500`}
      >
        {t({ fr: `${platformLabel}, très bientôt`, en: `${platformLabel}, very soon` })}
      </span>
    );
  }

  return (
    <a href={target.url} download className={`${BTN_BASE} ${primary ? BTN_SOLID : BTN_OUTLINE}`}>
      {t({ fr: `Télécharger pour ${platformLabel}`, en: `Download for ${platformLabel}` })}
    </a>
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

  // Fond uni sur toute la page (demande client du 2026-08-06) : plus
  // d'alternance blanc cassé / blanc, ni quadrillage, ni aurora. Les seules
  // surfaces colorées restantes sont les deux encadrés produit.
  const bg = dk ? "#000000" : "#ffffff";

  // Show the detected platform first, and badge it as recommended.
  const order: ("windows" | "mac")[] = os === "mac" ? ["mac", "windows"] : ["windows", "mac"];

  const steps = [
    {
      title: t({ fr: "Téléchargez Ora", en: "Download Ora" }),
      desc: t({
        fr: "Choisissez votre système et récupérez le fichier d'installation. Un seul fichier, rien à configurer.",
        en: "Pick your system and grab the installer. One file, nothing to configure.",
      }),
    },
    {
      title: t({ fr: "Installez en un clin d'œil", en: "Install in a snap" }),
      desc: t({
        fr: "Ouvrez le fichier téléchargé et laissez-vous guider. Quelques secondes suffisent.",
        en: "Open the downloaded file and follow along. It only takes a few seconds.",
      }),
    },
    {
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
      <section className="relative overflow-hidden px-6 md:px-12 pt-6 md:pt-10 pb-10 md:pb-14">
        {/* Deux colonnes : l'encadré produit à gauche, le texte et les boutons
            à droite. Sur mobile, le texte passe devant le visuel. */}
        <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 lg:order-1">
            <DownloadShowcase className="dl-rise dl-d5" />
          </div>

          <div className="order-1 flex flex-col items-center text-center lg:order-2 lg:items-start lg:text-left">
            {/* Eyebrow */}
            <p className="dl-rise dl-d1 font-inter text-[11px] font-semibold uppercase tracking-[0.15em] text-blue-600 dark:text-blue-400">
              {t({ fr: "Bienvenue à bord", en: "Welcome aboard" })}
            </p>

            {/* Titre en Instrument Sans graisse normale, la face fine du site
                (même traitement que les headings de StackingCards). */}
            <h1 className="dl-rise dl-d2 mt-3 font-instrument font-normal tracking-[-0.025em] leading-[1.08] text-[2.3rem] md:text-[2.9rem] xl:text-[3.2rem] text-[#111827] dark:text-white">
              {t({ fr: "Votre aventure Ora ", en: "Your Ora journey " })}
              <span className="text-brand-gradient">
                {t({ fr: "commence ici.", en: "starts here." })}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="dl-rise dl-d3 mt-6 max-w-xl font-inter text-base md:text-lg leading-relaxed text-gray-500 dark:text-gray-400">
              {t({
                fr: "Téléchargez l'application, installez-la en quelques secondes, et laissez Ora prendre en main vos tâches les plus répétitives. On a hâte de vous voir gagner du temps.",
                en: "Download the app, install it in seconds, and let Ora take over your most repetitive tasks. We can't wait to watch you save time.",
              })}
            </p>

            {/* Boutons de téléchargement, plateforme détectée en premier */}
            <div className="dl-rise dl-d4 mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              {order.map((key) => (
                <DownloadButton key={key} os={key} primary={os === key || os === "other"} />
              ))}
            </div>

            {/* Prérequis matériel, gardé visible : il évite un échec d'install */}
            <p className="dl-rise dl-d4 mt-5 max-w-md font-inter text-[13px] leading-relaxed text-gray-400 dark:text-gray-500">
              {t({
                fr: "Sur Mac, puce Apple Silicon requise (M1, M2, M3 ou plus récent). Sur Windows, version 10 ou 11 en 64 bits.",
                en: "On Mac, Apple Silicon required (M1, M2, M3 or newer). On Windows, version 10 or 11 in 64-bit.",
              })}
            </p>

            {/* Version et promesse, sur une seule ligne discrète */}
            <p className="dl-rise dl-d5 mt-6 font-inter text-[13px] text-gray-500 dark:text-gray-400">
              {t({ fr: "Version", en: "Version" })} {APP_VERSION}
              <span className="mx-2 text-gray-300 dark:text-gray-600">·</span>
              {t(RELEASE_DATE)}
              <span className="mx-2 text-gray-300 dark:text-gray-600">·</span>
              {t({
                fr: "traitement 100% local",
                en: "100% local processing",
              })}
            </p>
          </div>
        </div>
      </section>

      {/* ── LIVRABLES : texte à gauche, encadré à droite ───────────────────── */}
      <section className="relative px-6 md:px-12 py-10 md:py-14" style={{ backgroundColor: bg }}>
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-left">
            <p className="dl-rise font-inter text-[11px] font-semibold uppercase tracking-[0.15em] text-blue-600 dark:text-blue-400">
              {t({ fr: "Ce qui sort d'Ora", en: "What Ora delivers" })}
            </p>

            <h2 className="dl-rise dl-d1 mt-3 font-instrument font-normal tracking-[-0.025em] leading-[1.08] text-[2.1rem] md:text-[2.6rem] xl:text-[2.9rem] text-[#111827] dark:text-white">
              {t({ fr: "Un dossier complet, ", en: "A complete file, " })}
              <span className="text-brand-gradient">
                {t({ fr: "en trois pièces.", en: "in three files." })}
              </span>
            </h2>

            <p className="dl-rise dl-d2 mt-6 max-w-xl mx-auto lg:mx-0 font-inter text-base md:text-lg leading-relaxed text-gray-500 dark:text-gray-400">
              {t({
                fr: "Chaque livrable de conseil sort en trois formats d'un seul geste : un classeur Excel dont les formules restent vivantes, un dossier PDF prêt à envoyer, une présentation pour le rendez-vous.",
                en: "Every advisory deliverable comes out in three formats at once: an Excel workbook with live formulas, a PDF report ready to send, a deck for the meeting.",
              })}
            </p>

            {/* Trois promesses en liste filetée, sans icône : même langage que
                les filets de la section « en 3 étapes ». */}
            <div className="dl-rise dl-d3 mt-8 max-w-md mx-auto divide-y divide-gray-200/70 border-t border-gray-200/70 dark:divide-white/10 dark:border-white/10 lg:mx-0">
              {[
                {
                  fr: "Calculs déterministes, vérifiables ligne à ligne",
                  en: "Deterministic calculations, checkable line by line",
                },
                {
                  fr: "Logo, polices et palette de votre cabinet appliqués",
                  en: "Your firm's logo, fonts and palette applied",
                },
                {
                  fr: "Aucune donnée client envoyée à un modèle d'IA",
                  en: "No client data sent to an AI model",
                },
              ].map((row, i) => (
                <p key={i} className="py-3 font-inter text-[15px] text-gray-600 dark:text-gray-300">
                  {t(row)}
                </p>
              ))}
            </div>
          </div>

          <div className="dl-rise dl-d4">
            <DeliverablesShowcase />
          </div>
        </div>
      </section>

      {/* ── INSTALL STEPS ─────────────────────────────────────────────────────
          Refonte du 2026-08-06 : les cartes blanches à ombre disparaissaient
          sur le fond blanc. Passage à un traitement éditorial, sans boîte :
          un filet en haut de chaque colonne, dont le premier tiers reprend le
          dégradé de marque, puis le numéro, le titre et le texte. */}
      <section className="relative px-6 md:px-12 py-14 md:py-20" style={{ backgroundColor: bg }}>
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl">
            <p className="dl-rise font-inter text-[11px] font-semibold uppercase tracking-[0.15em] text-blue-600 dark:text-blue-400">
              {t({ fr: "Prise en main", en: "Getting started" })}
            </p>
            <h2 className="dl-rise dl-d1 mt-3 font-instrument font-normal tracking-[-0.025em] leading-[1.08] text-[2.1rem] md:text-[2.6rem] text-[#111827] dark:text-white">
              {t({ fr: "Votre aventure, en 3 étapes", en: "Your journey, in 3 steps" })}
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={i} className={`dl-rise dl-d${i + 2} relative pt-6`}>
                {/* Filet de tête, avec son amorce en bleu */}
                <span className="absolute inset-x-0 top-0 h-px bg-gray-200 dark:bg-white/10" />
                <span className="absolute left-0 top-0 h-px w-1/3 bg-[#3b82f6]" />

                <span className="font-inter text-[12px] font-semibold tracking-[0.14em] text-blue-600 dark:text-blue-400">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <h3 className="mt-4 font-instrument font-normal tracking-[-0.02em] text-[1.35rem] leading-snug text-[#111827] dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-2.5 font-inter text-[15px] leading-relaxed text-gray-500 dark:text-gray-400">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HELP & CONTACT ────────────────────────────────────────────────── */}
      <section className="relative px-6 md:px-12 py-14 md:py-20" style={{ backgroundColor: bg }}>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="dl-rise dl-d1 font-instrument font-normal tracking-[-0.025em] leading-[1.1] text-[2rem] md:text-[2.5rem] text-[#111827] dark:text-white">
            {t({ fr: "Un grain de sable ? On est là.", en: "Hit a snag? We're here." })}
          </h2>
          <p className="dl-rise dl-d2 mt-4 mx-auto max-w-xl font-inter text-base leading-relaxed text-gray-500 dark:text-gray-400">
            {t({
              fr: "Une question pendant l'installation, un doute sur la configuration ? Notre équipe vous répond vite et vous accompagne pas à pas.",
              en: "A question during install, unsure about your setup? Our team replies fast and walks you through it.",
            })}
          </p>

          <div className="dl-rise dl-d3 mt-9 flex items-center justify-center gap-3 flex-wrap">
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                t({ fr: "Aide installation Ora", en: "Ora install help" }),
              )}`}
              className={`${BTN_BASE} ${BTN_OUTLINE}`}
            >
              {t({ fr: "Écrire au support", en: "Email support" })}
            </a>
            <button type="button" onClick={openBooking} className={`${BTN_BASE} ${BTN_SOLID}`}>
              {t({ fr: "Réserver un appel", en: "Book a call" })}
            </button>
          </div>

          <p className="dl-rise dl-d4 mt-6 font-inter text-[13px] text-gray-400 dark:text-gray-500">
            {t({ fr: "Réponse sous 24 h ouvrées", en: "Reply within 1 business day" })}
          </p>
        </div>

        {/* Minimal standalone footer line (no full site footer on this page) */}
        <div className="max-w-3xl mx-auto mt-16 pt-8 border-t border-gray-200/70 dark:border-white/10 text-center font-inter text-[12px] text-gray-400 dark:text-gray-500">
          © {year} Ora. {t({ fr: "Tous droits réservés.", en: "All rights reserved." })}
        </div>
      </section>
    </div>
  );
}
