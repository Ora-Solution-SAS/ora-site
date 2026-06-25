import { useState, useRef, useEffect, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import {
  FileSpreadsheet,
  Zap,
  Check,
  CheckCircle2,
  Folder,
  FolderOpen,
  Lock,
  Shield,
  ClipboardCheck,
  Gift,
  Network,
  type LucideIcon,
} from "lucide-react";
import { useLang } from "@/lib/i18n";

/**
 * Monday.com-style accordion for "L'expérience Ora".
 *
 *  - 4 cards laid out in a single flex row.
 *  - Default state: all cards dark (#0a0a0a) with white text — just the
 *    brand mark + title visible. Reads as a "thumbnail strip".
 *  - Click a card: it expands (flex-grow) and its background animates to
 *    its brand color. The full mockup visual fades in inside.
 *  - The previously-active card collapses back to the thumbnail size.
 *  - Mobile (< md): falls back to a simple vertical stack with each card
 *    always in its colored "active" state (accordion doesn't work well on
 *    narrow viewports).
 *
 * Why this works for Ora vs Monday: Monday uses 3D characters as the
 * "active state reveal". We use the product mockups (Excel grid, folder
 * tree, flow chips, task list) — they're better than characters because
 * they actually teach the user what the feature does.
 */

// ─────────────────────────────────────────────────────────
//  Visuals — the "character equivalent" for each card.
//  Shown only when the card is active.
// ─────────────────────────────────────────────────────────

function AuditVisual() {
  const { t } = useLang();
  return (
    <div className="w-full max-w-[280px] flex flex-col gap-2.5">
      {/* Audit report mockup */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200/60 overflow-hidden">
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-100">
          <div className="w-2 h-2 rounded-full bg-red-400/80" />
          <div className="w-2 h-2 rounded-full bg-amber-400/80" />
          <div className="w-2 h-2 rounded-full bg-green-400/80" />
          <span className="ml-auto text-[10px] font-medium text-gray-400">
            {t({ fr: "Rapport d'audit", en: "Audit report" })}
          </span>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <ClipboardCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">
                {t({ fr: "Audit Excel personnalisé", en: "Custom Excel audit" })}
              </p>
              <p className="text-[10px] text-gray-500 truncate">
                {t({ fr: "Livré sous 48h", en: "Delivered in 48h" })}
              </p>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-3 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-[11px]">
              <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" strokeWidth={3} />
              <span className="text-gray-700 font-medium">
                {t({ fr: "3 automatisations identifiées", en: "3 automations identified" })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" strokeWidth={3} />
              <span className="text-gray-700 font-medium">
                {t({ fr: "~12h économisées/semaine", en: "~12h saved/week" })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" strokeWidth={3} />
              <span className="text-gray-700 font-medium">
                {t({ fr: "Plan de structuration", en: "Restructuring plan" })}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Bonus offer badge */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl px-3 py-2.5 flex items-center gap-2 shadow-lg">
        <Gift className="w-4 h-4 text-white flex-shrink-0" />
        <span className="text-xs font-bold text-white">
          {t({ fr: "+ 1 automatisation offerte", en: "+ 1 automation, on us" })}
        </span>
      </div>
    </div>
  );
}

function EngineeringVisual() {
  const { t } = useLang();
  return (
    <div className="w-full max-w-[280px] bg-white rounded-2xl shadow-lg border border-gray-200/60 overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-100">
        <div className="w-2 h-2 rounded-full bg-red-400/80" />
        <div className="w-2 h-2 rounded-full bg-amber-400/80" />
        <div className="w-2 h-2 rounded-full bg-green-400/80" />
        <span className="ml-auto text-[10px] font-medium text-gray-400">
          Engineering
        </span>
      </div>
      <div className="p-4">
        {/* Speed headline */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-amber-600 fill-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[18px] font-bold text-gray-900 leading-none">
              {t({ fr: "3-5 jours", en: "3-5 days" })}
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              {t({ fr: "demande → livraison", en: "request → delivery" })}
            </p>
          </div>
        </div>
        {/* Mini timeline */}
        <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="text-[11px] text-gray-700 font-medium">
              {t({ fr: "Demande reçue", en: "Request received" })}
            </span>
            <span className="ml-auto text-[9px] text-gray-400 font-medium">J1</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="text-[11px] text-gray-700 font-medium">
              {t({ fr: "Automatisation conçue", en: "Workflow designed" })}
            </span>
            <span className="ml-auto text-[9px] text-gray-400 font-medium">J2</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full border-2 border-amber-500 border-t-transparent animate-spin flex-shrink-0" />
            <span className="text-[11px] text-gray-700 font-medium">
              {t({ fr: "Livraison clé en main", en: "Turnkey delivery" })}
            </span>
            <span className="ml-auto text-[9px] text-gray-400 font-medium">J3-5</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FoldersVisual() {
  const { t } = useLang();
  return (
    <div className="w-full max-w-[280px] bg-white rounded-2xl shadow-lg border border-gray-200/60 overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-100">
        <div className="w-2 h-2 rounded-full bg-red-400/80" />
        <div className="w-2 h-2 rounded-full bg-amber-400/80" />
        <div className="w-2 h-2 rounded-full bg-green-400/80" />
        <span className="ml-auto text-[10px] font-medium text-gray-400">
          {t({ fr: "Bibliothèque", en: "Library" })}
        </span>
      </div>
      <div className="p-3 flex flex-col gap-1.5 text-[11px]">
        <div className="flex items-center gap-1.5 text-gray-800 font-semibold">
          <FolderOpen className="w-3.5 h-3.5 text-blue-500" />
          <span>Clients</span>
          <span className="ml-auto text-[9px] font-medium text-gray-400">12</span>
        </div>
        <div className="ml-4 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-gray-700">
            <Folder className="w-3 h-3 text-blue-400" />
            <span>Acme Corp</span>
          </div>
          <div className="ml-3.5 flex items-center gap-1.5 text-gray-500">
            <FileSpreadsheet className="w-3 h-3 text-emerald-500" />
            <span className="truncate">2025-Q4.xlsx</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-700">
            <Folder className="w-3 h-3 text-blue-400" />
            <span>Beta Inc</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-gray-800 font-semibold">
          <Folder className="w-3.5 h-3.5 text-blue-500" />
          <span>{t({ fr: "Rapports", en: "Reports" })}</span>
          <span className="ml-auto text-[9px] font-medium text-gray-400">24</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-800 font-semibold">
          <Folder className="w-3.5 h-3.5 text-blue-500" />
          <span>Archive</span>
          <span className="ml-auto text-[9px] font-medium text-gray-400">156</span>
        </div>
      </div>
    </div>
  );
}

function FlowVisual() {
  const { t } = useLang();
  return (
    <div className="flex flex-col items-center gap-2.5 w-full max-w-[260px]">
      <div className="flex items-center gap-2 bg-white px-3.5 py-2.5 rounded-xl shadow-sm border border-gray-200/60 w-full">
        <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0">
          <FileSpreadsheet className="w-3 h-3 text-blue-500" />
        </div>
        <span className="text-[11px] font-medium text-gray-700">
          {t({ fr: "Vos données", en: "Your data" })}
        </span>
      </div>
      <div className="w-px h-3 bg-gray-300" />
      <div className="flex items-center gap-2 bg-gradient-to-br from-[#3b82f6] to-[#0d9488] px-4 py-3 rounded-xl shadow-lg text-white w-full">
        <Zap className="w-3.5 h-3.5" />
        <span className="text-xs font-semibold">
          {t({ fr: "Ora · automatisation sur-mesure", en: "Ora · tailored workflow" })}
        </span>
      </div>
      <div className="w-px h-3 bg-gray-300" />
      <div className="grid grid-cols-2 gap-2 w-full">
        <div className="flex items-center gap-1.5 bg-white px-2.5 py-2 rounded-lg shadow-sm border border-gray-200/60">
          <CheckCircle2 className="w-3 h-3 text-teal-500 flex-shrink-0" />
          <span className="text-[10px] font-medium text-gray-700">
            {t({ fr: "Rapport", en: "Report" })}
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-white px-2.5 py-2 rounded-lg shadow-sm border border-gray-200/60">
          <CheckCircle2 className="w-3 h-3 text-teal-500 flex-shrink-0" />
          <span className="text-[10px] font-medium text-gray-700">
            {t({ fr: "Envoi", en: "Send" })}
          </span>
        </div>
      </div>
    </div>
  );
}


function SecurityVisual() {
  const { t } = useLang();
  return (
    <div className="w-full max-w-[280px] bg-white rounded-2xl shadow-lg border border-gray-200/60 overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-100">
        <div className="w-2 h-2 rounded-full bg-red-400/80" />
        <div className="w-2 h-2 rounded-full bg-amber-400/80" />
        <div className="w-2 h-2 rounded-full bg-green-400/80" />
        <span className="ml-auto text-[10px] font-medium text-gray-400">
          {t({ fr: "Sécurité", en: "Security" })}
        </span>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Lock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-900 truncate">
              {t({ fr: "Données locales", en: "Local data" })}
            </p>
            <p className="text-[10px] text-gray-500 truncate">
              {t({ fr: "Aucun envoi cloud", en: "No cloud transfer" })}
            </p>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-3 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-[11px]">
            <Shield className="w-3 h-3 text-emerald-500 flex-shrink-0" />
            <span className="text-gray-700 font-medium">
              {t({ fr: "Conforme RGPD", en: "GDPR compliant" })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" strokeWidth={3} />
            <span className="text-gray-700 font-medium">
              {t({ fr: "Chiffrement local", en: "Local encryption" })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" strokeWidth={3} />
            <span className="text-gray-700 font-medium">
              {t({ fr: "Audit complet", en: "Full audit trail" })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  Card data
// ─────────────────────────────────────────────────────────

type CardData = {
  tag: string;
  brandSuffix: string;
  title: string;
  /** One-sentence value pitch, always visible below the title. */
  desc: string;
  /** Three concrete benefits shown on the card's resting face — they fill the
   *  formerly-empty bottom area and crossfade out when the mockup takes over. */
  points: string[];
  /** The brand color the card animates to when active. */
  activeColor: string;
  /** When true, the active bg is light enough that text should be dark. */
  darkText?: boolean;
  /** Optional small badge displayed below the brand mark (e.g. "via Atlas"). */
  subBadge?: { icon: LucideIcon; label: string };
  /** Optional URL of an image shown on the card's dark/inactive face.
   *  Fades out when the card becomes active and the visual takes over. */
  inactiveImage?: string;
  /** Optional CSS `bottom` offset for the inactive image, used to vertically
   *  align illustrations whose subject sits at a different height in the PNG.
   *  e.g. "5%" raises the image. Defaults to "0". */
  inactiveImageBottom?: string;
  visual: ReactNode;
};

// On the black "expérience Ora" section, cards rest as dark glassy panels
// (a hair lighter than the section) and turn cobalt on hover/active.
const INACTIVE_BG = "#14161d";

// Color every card animates to on hover/active — the Ora audit cobalt blue.
const ACTIVE_BG = "#3457E8";

// ─────────────────────────────────────────────────────────
//  AccordionCard — the single card component.
//  Expands when active, collapses when not.
// ─────────────────────────────────────────────────────────

function AccordionCard({
  data,
  isActive,
  onActivate,
  driftClass,
}: {
  data: CardData;
  isActive: boolean;
  onActivate: () => void;
  /** CSS class that applies the ambient horizontal drift keyframe animation. */
  driftClass: string;
}) {
  // Cards rest as dark glassy panels and animate to cobalt on hover/active.
  // Text stays light in both states, just brighter when active.
  const onLight = false;
  const palette = isActive
    ? {
        logo: "/logos/icon-light.png",
        wordmark: "text-white",
        suffix: "text-white/75",
        tag: "text-white/60",
        title: "text-white",
        desc: "text-white/85",
      }
    : {
        logo: "/logos/icon-light.png",
        wordmark: "text-white/90",
        suffix: "text-white/45",
        tag: "text-white/40",
        title: "text-white/95",
        desc: "text-white/60",
      };

  return (
    <button
      type="button"
      onClick={onActivate}
      // Hover/focus also activates so the user doesn't have to discover
      // the click affordance. CSS transitions on the parent grid handle
      // the width animation — no JS measurement per frame.
      onMouseEnter={onActivate}
      onFocus={onActivate}
      className={`ora-card-tr relative rounded-[28px] overflow-hidden text-left h-[520px] min-w-0 cursor-pointer ${driftClass} ${
        isActive ? "" : "ring-1 ring-white/10"
      }`}
      style={{
        backgroundColor: isActive ? data.activeColor : INACTIVE_BG,
        // Ombre douce et teintée cobalt — assez subtile pour les cartes
        // claires au repos, sans halo agressif comme sur l'ancien fond noir.
        boxShadow:
          "0 14px 40px -16px rgba(52,87,232,0.25), 0 4px 14px -8px rgba(52,87,232,0.12)",
        willChange: "transform",
      }}
    >
      {/* Soft white gradient at the bottom — "lit from below" effect */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 z-0"
        style={{
          background:
            "linear-gradient(to top, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.03) 35%, transparent 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col h-full p-6 md:p-7">
        {/* Brand mark + step tag */}
        <div className="flex items-start justify-between mb-5 gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={palette.logo}
              alt=""
              className="w-7 h-7 object-contain flex-shrink-0"
              aria-hidden
            />
            <span className="font-poppins text-sm tracking-tight truncate">
              <span
                className={`font-semibold ora-text-tr ${palette.wordmark}`}
              >
                ora
              </span>
              <span
                className={`ml-1.5 ora-text-tr ${palette.suffix}`}
              >
                {data.brandSuffix}
              </span>
            </span>
          </div>
          <span
            className={`font-inter text-[11px] uppercase tracking-[0.18em] font-semibold flex-shrink-0 ora-text-tr ${palette.tag}`}
          >
            {data.tag}
          </span>
        </div>

        {/* Optional sub-badge — small chip below the brand mark
            (e.g. "via Atlas" on the Organisation card) */}
        {data.subBadge && (
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border self-start mb-4 ora-text-tr ${
              onLight
                ? "border-gray-900/15 bg-gray-900/[0.06] text-gray-700"
                : "border-white/15 bg-white/[0.08] text-white/85"
            }`}
          >
            <data.subBadge.icon className="w-3 h-3" />
            <span className="text-[11px] font-semibold tracking-tight">
              {data.subBadge.label}
            </span>
          </div>
        )}

        {/* Title — fixed moderate size in both states. */}
        <h3
          className={`font-poppins font-medium text-[1.35rem] md:text-[1.5rem] tracking-[-0.025em] leading-[1.15] ora-text-tr ${palette.title}`}
        >
          {data.title}
        </h3>

        {/* Value pitch — always visible so the resting card already sells. */}
        <p
          className={`font-inter text-[13.5px] leading-[1.65] mt-3 ora-text-tr ${palette.desc}`}
        >
          {data.desc}
        </p>

        {/* Bottom slot — benefits (resting face) ⇄ mockup (active face).
            Both stacked in the same grid cell and crossfaded, so the card
            never shows a large empty area. */}
        <div className="mt-auto pt-6 grid flex-1 min-h-0">
          {/* Benefit list — fills the resting card with concrete value. */}
          <div
            className="ora-points-tr flex flex-col gap-3 justify-end pb-1"
            style={{
              gridArea: "1 / 1",
              opacity: isActive ? 0 : 1,
              pointerEvents: "none",
            }}
          >
            {data.points.map((point) => (
              <div key={point} className="flex items-center gap-2.5">
                <span className="w-[22px] h-[22px] rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-emerald-400" strokeWidth={3} />
                </span>
                <span className="font-inter font-medium text-[13px] text-white/75 leading-snug">
                  {point}
                </span>
              </div>
            ))}
          </div>

          {/* Visual — ALWAYS mounted, opacity toggled via CSS. */}
          <div
            className="ora-mockup-tr flex items-center justify-center min-h-0"
            style={{
              gridArea: "1 / 1",
              opacity: isActive ? 1 : 0,
              pointerEvents: isActive ? "auto" : "none",
              willChange: "opacity",
            }}
          >
            {data.visual}
          </div>
        </div>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────
//  Carousel
// ─────────────────────────────────────────────────────────

export default function OraExperienceCarousel() {
  const { t } = useLang();
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  // Only run the ambient drift animation while the carousel is on screen.
  // 5 large cards animating transform forever (even off-screen) keeps the
  // compositor busy and makes the whole page's scroll stutter. Pausing when
  // out of view frees those frames → smoother site-wide scroll.
  const [drifting, setDrifting] = useState(false);

  // ─── Cursor parallax ───
  // Row width > viewport. Cursor right → row slides left → reveals the
  // off-screen cards on the right. Vice versa.
  //
  // Snappy spring (high stiffness, low mass) → the row catches up to
  // the cursor quickly. Less inertia drag → feels reactive, not lazy.
  // The cursor position across the container maps to the FULL row overflow:
  // cursor at the left edge → row at rest; cursor at the right edge → row
  // shifted by its entire overflow, so the LAST card is fully revealed (the
  // old fixed ±0.22 factor left it permanently half off-screen).
  const cursorX = useMotionValue(0);
  const parallaxX = useSpring(cursorX, {
    stiffness: 180,
    damping: 20,
    mass: 0.4,
  });

  // Pause/resume the ambient drift based on viewport visibility.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setDrifting(entry.isIntersecting),
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // scrollWidth includes the overflowing cards on the right.
    const overflow = Math.max(0, el.scrollWidth - rect.width);
    const norm = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    cursorX.set(-norm * overflow);
  };

  const handleMouseLeave = () => {
    // Smoothly return to rest when the cursor leaves the carousel
    cursorX.set(0);
  };

  const cards: CardData[] = [
    {
      tag: "01",
      brandSuffix: t({ fr: "audit", en: "audit" }),
      title: t({
        fr: "Audit offert + une automatisation offerte.",
        en: "Complimentary audit + a complimentary automation.",
      }),
      desc: t({
        fr: "On analyse vos fichiers et vos processus, et on vous montre exactement où vous perdez du temps.",
        en: "We analyze your files and processes, and show you exactly where you lose time.",
      }),
      points: [
        t({ fr: "Audit complet livré sous 48h", en: "Full audit delivered in 48h" }),
        t({ fr: "Automatisations prioritaires identifiées", en: "Priority automations identified" }),
        t({ fr: "Une automatisation offerte pour essayer", en: "One automation free to try" }),
      ],
      activeColor: ACTIVE_BG,
      inactiveImage: "/logos/engineering-illustration.png",
      inactiveImageBottom: "6%",
      visual: <AuditVisual />,
    },
    {
      tag: "02",
      brandSuffix: t({ fr: "sur-mesure", en: "tailored" }),
      title: t({
        fr: "Des automatisations conçues pour vous.",
        en: "Automations built for you, not for everyone.",
      }),
      desc: t({
        fr: "Vous décrivez votre façon de travailler, on la reproduit à l'identique. Pas de template générique.",
        en: "You describe your workflow, we replicate it exactly. No generic templates.",
      }),
      points: [
        t({ fr: "Conçu autour de vos fichiers réels", en: "Built around your real files" }),
        t({ fr: "Validé avec vous à chaque étape", en: "Validated with you at every step" }),
        t({ fr: "Évolue avec votre métier", en: "Evolves with your business" }),
      ],
      activeColor: ACTIVE_BG,
      inactiveImage: "/logos/tailored-illustration.png",
      inactiveImageBottom: "6%",
      visual: <FlowVisual />,
    },
    {
      tag: "03",
      brandSuffix: t({ fr: "organisation", en: "organization" }),
      title: t({
        fr: "Vos dossiers Excel, parfaitement structurés.",
        en: "Your Excel folders, perfectly structured.",
      }),
      desc: t({
        fr: "Atlas cartographie tous vos dossiers et retrouve n'importe quel fichier en quelques secondes.",
        en: "Atlas maps all your folders and finds any file in seconds.",
      }),
      points: [
        t({ fr: "Vue d'ensemble de toute votre activité", en: "Bird's-eye view of your whole operation" }),
        t({ fr: "Recherche instantanée de fichiers", en: "Instant file search" }),
        t({ fr: "Avancement des équipes en temps réel", en: "Team progress in real time" }),
      ],
      activeColor: ACTIVE_BG,
      inactiveImage: "/logos/organisation-illustration.png",
      // Sub-badge: signals this feature is powered by the Atlas product
      subBadge: {
        icon: Network,
        label: t({ fr: "via Atlas", en: "via Atlas" }),
      },
      visual: <FoldersVisual />,
    },
    {
      tag: "04",
      brandSuffix: t({ fr: "engineering", en: "engineering" }),
      title: t({
        fr: "Sur-mesure, rapide, à la demande.",
        en: "Tailored, fast, on demand.",
      }),
      desc: t({
        fr: "Une nouvelle demande ? Notre équipe la livre clé en main en quelques jours.",
        en: "A new request? Our team delivers it turnkey in a few days.",
      }),
      points: [
        t({ fr: "Besoin décrit en 5 minutes", en: "Need described in 5 minutes" }),
        t({ fr: "Livraison en 3 à 5 jours", en: "Delivered in 3 to 5 days" }),
        t({ fr: "Sans toucher à votre organisation", en: "Without disrupting your setup" }),
      ],
      activeColor: ACTIVE_BG,
      inactiveImage: "/logos/audit-illustration.png",
      inactiveImageBottom: "6%",
      visual: <EngineeringVisual />,
    },
    {
      tag: "05",
      brandSuffix: t({ fr: "sécurité", en: "security" }),
      title: t({
        fr: "Vos données restent chez vous.",
        en: "Your data stays with you.",
      }),
      desc: t({
        fr: "Tout s'exécute sur votre machine. Vos fichiers sont chiffrés avant tout envoi.",
        en: "Everything runs on your machine. Your files are encrypted before anything is sent.",
      }),
      points: [
        t({ fr: "Calcul 100% local", en: "100% local compute" }),
        t({ fr: "Chiffrement XChaCha20-Poly1305", en: "XChaCha20-Poly1305 encryption" }),
        t({ fr: "Données hébergées en Suisse", en: "Data hosted in Switzerland" }),
      ],
      activeColor: ACTIVE_BG,
      visual: <SecurityVisual />,
    },
  ];

  return (
    <>
      {/* Ambient drift keyframes — each card slowly translates a few
          pixels horizontally on a long loop, with different phases per
          card. Pure CSS transform, GPU-accelerated, ~free perf-wise.
          Creates the gentle "breathing" motion that catches the eye
          (Monday-style) without distracting from content. */}
      {/* Inline CSS for the carousel:
          - Ambient drift keyframes (subtle constant horizontal sway)
          - Synchronized transition classes — all properties share the same
            720ms duration and Apple-style smooth easing, so width / color /
            text / mockup all complete at the same moment instead of
            finishing at staggered times (which read as "popping").
          - Mockup opacity has a 120ms delay so it starts fading in only
            AFTER the card has begun expanding — eliminates the feeling
            of two animations fighting for attention in the first frames. */}
      <style>{`
        /* Ambient drift — all cards move IN UNISON (same direction at any
           given moment). Single keyframe applied to all 5 cards with no
           phase offset → the whole row glides together left-and-back. */
        @keyframes oraCardDrift {
          0%, 100% { transform: translate3d(-10px, 0, 0); }
          50%      { transform: translate3d(10px, 0, 0); }
        }
        .ora-card-drift-1,
        .ora-card-drift-2,
        .ora-card-drift-3,
        .ora-card-drift-4,
        .ora-card-drift-5 {
          animation: oraCardDrift 8s ease-in-out infinite;
        }

        /* Paused while the carousel is off screen — stops the constant
           compositing that was stuttering the rest of the page's scroll. */
        .ora-drift-paused .ora-card-drift-1,
        .ora-drift-paused .ora-card-drift-2,
        .ora-drift-paused .ora-card-drift-3,
        .ora-drift-paused .ora-card-drift-4,
        .ora-drift-paused .ora-card-drift-5 {
          animation-play-state: paused;
        }

        /* All accordion transitions share one duration + easing so the
           whole state change reads as a single coordinated motion.
           cubic-bezier(0.16, 1, 0.3, 1) is smoother than expo-out — long
           gentle deceleration, no abrupt finish. */
        .ora-card-tr {
          transition: background-color 900ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ora-text-tr {
          transition: color 900ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ora-mockup-tr {
          /* Mockup fades in 180ms after the card starts expanding —
             eliminates the "popping" sensation of two animations
             starting on the same frame. */
          transition: opacity 700ms cubic-bezier(0.16, 1, 0.3, 1) 180ms;
        }
        .ora-points-tr {
          /* Benefit list fades out quickly (no delay) so it clears the
             stage before the mockup fades in on top of it. */
          transition: opacity 400ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        @media (prefers-reduced-motion: reduce) {
          .ora-card-drift-1, .ora-card-drift-2, .ora-card-drift-3,
          .ora-card-drift-4, .ora-card-drift-5 { animation: none; }
        }
      `}</style>

      {/* Desktop / tablet: Monday-style accordion + cursor parallax.

          Outer ref tracks cursor position. The motion.div applies a
          spring-smoothed counter-direction translateX so the row "leans
          away" from the cursor (Monday signature). Inner grid handles
          the accordion expansion via grid-template-columns transition. */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`hidden md:block ${drifting ? "" : "ora-drift-paused"}`}
      >
        <motion.div
          style={{ x: parallaxX, willChange: "transform" }}
          className="w-full"
        >
          <div
            className="grid gap-4 lg:gap-5"
            style={{
              // Inactive cards: 360px wide (much bigger presence). Active
              // card: 560px (fixed so the row width is predictable).
              // The row is intentionally wider than viewport — that's
              // what creates the natural "défilé" feel as parallax shifts
              // the row to reveal off-screen cards.
              gridTemplateColumns: cards
                .map((_, i) => (i === activeIdx ? "560px" : "360px"))
                .join(" "),
              transition:
                "grid-template-columns 900ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {cards.map((card, i) => (
              <AccordionCard
                key={i}
                data={card}
                isActive={i === activeIdx}
                onActivate={() => setActiveIdx(i)}
                driftClass={`ora-card-drift-${i + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Mobile: simple vertical stack. Each card is always "active" so
          the user sees all 4 mockups by scrolling, without an accordion
          interaction that's hard to discover on touch. */}
      <div className="md:hidden flex flex-col gap-4">
        {cards.map((card, i) => {
          const useDarkText = card.darkText;
          const palette = useDarkText
            ? {
                logo: "/logos/icon-dark.png",
                wordmark: "text-gray-900",
                suffix: "text-gray-700",
                tag: "text-gray-500",
                title: "text-gray-900",
              }
            : {
                logo: "/logos/icon-light.png",
                wordmark: "text-white",
                suffix: "text-white/75",
                tag: "text-white/60",
                title: "text-white",
              };
          return (
            <div
              key={i}
              className="relative rounded-[24px] overflow-hidden p-6"
              style={{
                backgroundColor: card.activeColor,
                boxShadow:
                  "0 18px 50px -12px rgba(56,189,248,0.30), 0 6px 22px -8px rgba(96,165,250,0.20)",
              }}
            >
              {/* Bottom white glow (same as desktop) */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-32 z-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 35%, transparent 100%)",
                }}
              />
              {/* All content wrapped in z-10 so it sits above the bottom gradient */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={palette.logo}
                      alt=""
                      className="w-7 h-7 object-contain"
                      aria-hidden
                    />
                    <span className="font-poppins text-sm tracking-tight">
                      <span className={`font-semibold ${palette.wordmark}`}>ora</span>
                      <span className={`${palette.suffix} ml-1.5`}>
                        {card.brandSuffix}
                      </span>
                    </span>
                  </div>
                  <span
                    className={`font-inter text-[11px] uppercase tracking-[0.18em] font-semibold ${palette.tag}`}
                  >
                    {card.tag}
                  </span>
                </div>
                <h3
                  className={`font-poppins font-medium text-2xl tracking-[-0.025em] leading-[1.15] ${palette.title}`}
                >
                  {card.title}
                </h3>
                <p
                  className={`font-inter text-[13.5px] leading-[1.65] mt-3 mb-6 ${
                    useDarkText ? "text-gray-600" : "text-white/80"
                  }`}
                >
                  {card.desc}
                </p>
                <div className="flex items-center justify-center">{card.visual}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
