import { useRef, useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  type MotionValue,
} from "framer-motion";
import { Lock, Check } from "lucide-react";
import { useLang } from "@/lib/i18n";

/**
 * Privacy section — pinned scrollytelling.
 *
 * The section pins (position: sticky) for a tall scroll distance. As the user
 * scrolls down, three icon animations play ONE BY ONE above their cards:
 *   1. A padlock that locks (shackle seats + green glow)        → files stay local
 *   2. A cloud that arrives, tethered to the device (access only) → cloud for login
 *   3. A circle + checkmark that draws in (validated)            → GDPR compliant
 *
 * Because the scene is pinned, the user stays on it while scrolling drives the
 * three animations sequentially — they can't move past until all three are done.
 *
 * Scroll progress is computed manually (rAF + getBoundingClientRect) because
 * Framer's useScroll desyncs with this site's Lenis smooth-scroll. On mobile
 * (< md) we skip the pin and render each icon in its finished state with a
 * simple fade-in (stacked cards can't fit a pinned 100vh scene).
 */

interface PrivacyShowcaseProps {
  theme: "light" | "dark";
}

type IconKind = "lock" | "cloud" | "check";

export default function PrivacyShowcase({ theme }: PrivacyShowcaseProps) {
  const { t } = useLang();
  const dk = theme === "dark";

  const outerRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(true);
  const [phase, setPhase] = useState(0); // 0..3 — how many anims completed

  // 0..1 scroll progress through the pinned section.
  const progress = useMotionValue(0);
  const p = useSpring(progress, { stiffness: 120, damping: 28, mass: 0.5 });

  // Pin only on md+ (stacked cards can't fit a pinned viewport on mobile).
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setPinned(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!pinned) {
      progress.set(1); // mobile: everything shown in its finished state
      setPhase(3);
      return;
    }
    let raf = 0;
    const compute = () => {
      raf = 0;
      const el = outerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const total = el.offsetHeight - vh; // scrollable distance while pinned
      const prog = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      progress.set(prog);
      // Phase = how many of the 3 segments are complete (for the dots).
      const ph = prog >= 0.96 ? 3 : prog >= 0.66 ? 2 : prog >= 0.34 ? 1 : 0;
      setPhase(ph);
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pinned, progress]);

  // Per-card local progress (0..1). Sequential, with a hold between each so
  // each animation FINISHES before the next begins.
  const lp0 = useTransform(p, [0.02, 0.3], [0, 1]);
  const lp1 = useTransform(p, [0.36, 0.64], [0, 1]);
  const lp2 = useTransform(p, [0.7, 0.98], [0, 1]);
  const doneMV = useMotionValue(1); // mobile / finished state

  const cards: {
    kind: IconKind;
    lp: MotionValue<number>;
    title: string;
    desc: string;
    chips: string[];
  }[] = [
    {
      kind: "lock",
      lp: pinned ? lp0 : doneMV,
      title: t({ fr: "Vos fichiers restent sur votre machine", en: "Your files stay on your machine" }),
      desc: t({
        fr: "Vos données métier et financières sont traitées entièrement sur votre appareil. Les fichiers sur lesquels vous travaillez ne sont jamais téléversés vers nos serveurs.",
        en: "Your business and financial data is processed entirely on your device. The files you work on are never uploaded to our servers.",
      }),
      chips: [t({ fr: "100 % local", en: "100% local" }), t({ fr: "Aucun téléversement", en: "No upload" })],
    },
    {
      kind: "cloud",
      lp: pinned ? lp1 : doneMV,
      title: t({ fr: "Le cloud pour l'accès, jamais pour vos données", en: "Cloud only for access, never for data" }),
      desc: t({
        fr: "L'authentification et la gestion des utilisateurs s'appuient sur Supabase, un hébergeur cloud sécurisé et conforme au RGPD. Seules vos informations de connexion et de compte y sont stockées, jamais vos documents.",
        en: "Authentication and user management run on Supabase, a secure, GDPR-compliant cloud provider. Only login and account information is stored there, never your documents.",
      }),
      chips: ["Supabase", t({ fr: "RGPD", en: "GDPR" })],
    },
    {
      kind: "check",
      lp: pinned ? lp2 : doneMV,
      title: t({ fr: "Conforme RGPD par conception", en: "GDPR compliant by design" }),
      desc: t({
        fr: "Aucune donnée client ne quitte votre environnement, vos obligations réglementaires restent donc simples. Les accès sont contrôlés par utilisateur et par équipe.",
        en: "No client data leaves your environment, so your regulatory obligations stay simple. Access is controlled per user and per team.",
      }),
      chips: [t({ fr: "Par utilisateur", en: "Per user" }), t({ fr: "Par équipe", en: "Per team" })],
    },
  ];

  const lockColor = dk ? "#34d399" : "#059669";

  return (
    <section
      ref={outerRef}
      // Tall on desktop so the scene pins while the 3 anims play; auto on mobile.
      style={{ background: dk ? "#0f172a" : "#fcfbf7", height: pinned ? "300vh" : "auto" }}
    >
      <div
        className={`${pinned ? "sticky top-0 min-h-screen flex flex-col justify-center" : ""} px-6 md:px-12 py-20 md:py-0`}
      >
        <div className="max-w-6xl mx-auto w-full">
          {/* ── Header ──────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-3xl mx-auto mb-10 md:mb-14"
          >
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12px] font-semibold uppercase tracking-[0.12em] mb-6 border"
              style={{
                borderColor: dk ? "rgba(16,185,129,0.3)" : "rgba(16,185,129,0.25)",
                background: dk ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.07)",
                color: lockColor,
              }}
            >
              <Lock className="w-3.5 h-3.5" />
              {t({ fr: "Confidentialité", en: "Privacy" })}
            </div>
            <h2 className="font-poppins font-semibold text-3xl md:text-5xl tracking-[-0.03em] leading-[1.12] text-[#111827] dark:text-white mb-5">
              {t({
                fr: "Vos données ne quittent jamais votre environnement.",
                en: "Your data never leaves your environment.",
              })}
            </h2>
            <p className="font-inter text-base md:text-lg leading-relaxed text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              {t({
                fr: "Vos fichiers sensibles sont traités en local et ne sont jamais téléversés. Seul l'accès à votre compte passe par le cloud.",
                en: "Your sensitive files are processed locally and never uploaded. Only account access runs in the cloud.",
              })}
            </p>
          </motion.div>

          {/* ── 3 cards, each topped by its animated icon ─────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 items-stretch">
            {cards.map((card) => (
              <PrivacyCard key={card.kind} {...card} dk={dk} />
            ))}
          </div>

          {/* ── Phase dots (desktop pinned only) ──────────────────────── */}
          {pinned && (
            <div className="hidden md:flex items-center justify-center gap-2.5 mt-10">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: phase > i ? 26 : 10,
                    background:
                      phase > i ? lockColor : dk ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.14)",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  PrivacyCard — one card with its scroll-driven animated icon stage.
// ─────────────────────────────────────────────────────────────────────────────

function PrivacyCard({
  kind,
  lp,
  title,
  desc,
  chips,
  dk,
}: {
  kind: IconKind;
  lp: MotionValue<number>;
  title: string;
  desc: string;
  chips: string[];
  dk: boolean;
}) {
  // Card dims until its own animation begins, then lifts to full presence.
  const cardOpacity = useTransform(lp, [0, 0.25], [0.4, 1]);
  const borderColor = useTransform(
    lp,
    [0.3, 0.9],
    [
      dk ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)",
      dk ? "rgba(16,185,129,0.55)" : "rgba(16,185,129,0.5)",
    ],
  );

  return (
    <motion.div
      style={{ opacity: cardOpacity, borderColor }}
      className="flex flex-col p-8 md:p-9 rounded-[28px] border bg-white dark:bg-white/[0.03] min-h-[300px] md:min-h-[340px]"
    >
      {/* Animated icon stage */}
      <div className="h-20 flex items-center justify-start mb-2">
        <IconStage kind={kind} lp={lp} dk={dk} />
      </div>

      <h3 className="font-poppins font-semibold text-xl md:text-[1.4rem] tracking-tight text-[#111827] dark:text-white leading-snug">
        {title}
      </h3>
      <p className="mt-3 font-inter text-[14.5px] leading-relaxed text-gray-500 dark:text-gray-400 flex-1">
        {desc}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-inter font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 ring-1 ring-emerald-200/70 dark:ring-emerald-400/20"
          >
            <Check className="w-3 h-3" strokeWidth={3} />
            {chip}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  IconStage — the three scroll-driven SVG animations.
// ─────────────────────────────────────────────────────────────────────────────

function IconStage({ kind, lp, dk }: { kind: IconKind; lp: MotionValue<number>; dk: boolean }) {
  const green = dk ? "#34d399" : "#059669";
  const steel = dk ? "#64748b" : "#94a3b8";

  // ── LOCK ──
  const shackleY = useTransform(lp, [0, 1], [-13, 0]);
  const bodyScale = useTransform(lp, [0, 0.85, 1], [0.92, 1.06, 1]);
  const lockGlow = useTransform(lp, [0.45, 1], [0, 0.9]);

  // ── CLOUD ──
  const cloudX = useTransform(lp, [0, 0.8], [42, 0]);
  const cloudY = useTransform(lp, [0, 0.8], [-14, 0]);
  const cloudOpacity = useTransform(lp, [0, 0.5], [0, 1]);
  const tetherOpacity = useTransform(lp, [0.4, 0.9], [0, 1]);

  // ── CHECK ──
  const ringOffset = useTransform(lp, [0, 0.7], [1, 0]);
  const tickOffset = useTransform(lp, [0.5, 1], [1, 0]);
  const checkScale = useTransform(lp, [0.8, 1], [0.9, 1]);
  const checkGlow = useTransform(lp, [0.5, 1], [0, 0.9]);

  if (kind === "lock") {
    return (
      <svg viewBox="0 0 80 80" className="w-[68px] h-[68px] overflow-visible" fill="none" aria-hidden>
        <defs>
          <linearGradient id="pv-lock-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
        </defs>
        <g transform="translate(40, 42)">
          <motion.circle cx="0" cy="6" r="34" fill="none" stroke={green} strokeWidth="1" style={{ opacity: lockGlow }} />
          {/* shackle */}
          <motion.path
            d="M-13 0 V -10 a13 13 0 0 1 26 0 V 0"
            stroke={steel}
            strokeWidth="6"
            strokeLinecap="round"
            style={{ y: shackleY }}
          />
          {/* body */}
          <motion.g style={{ scale: bodyScale }}>
            <rect x="-20" y="-1" width="40" height="33" rx="9" fill="url(#pv-lock-grad)" />
            <circle cx="0" cy="13" r="4" fill={dk ? "#0f172a" : "#ffffff"} />
            <rect x="-1.6" y="15" width="3.2" height="8" rx="1.6" fill={dk ? "#0f172a" : "#ffffff"} />
          </motion.g>
        </g>
      </svg>
    );
  }

  if (kind === "cloud") {
    return (
      <svg viewBox="0 0 80 80" className="w-[72px] h-[68px] overflow-visible" fill="none" aria-hidden>
        <defs>
          <linearGradient id="pv-cloud-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={dk ? "#1e293b" : "#ffffff"} />
            <stop offset="100%" stopColor={dk ? "#0f172a" : "#eef2ff"} />
          </linearGradient>
        </defs>
        {/* device anchor + dashed tether (access only) */}
        <rect x="10" y="52" width="20" height="14" rx="2.5" fill="none" stroke={steel} strokeWidth="2" />
        <motion.path
          d="M28 54 C 42 48, 48 42, 52 30"
          stroke={green}
          strokeWidth="1.5"
          strokeDasharray="3 3"
          style={{ opacity: tetherOpacity }}
        />
        <motion.g style={{ x: cloudX, y: cloudY, opacity: cloudOpacity }}>
          <g transform="translate(40, 12)">
            <path
              d="M6 24 a10 10 0 0 1 1.6 -19 a12.5 12.5 0 0 1 23 3.3 a9 9 0 0 1 -1.6 15.7 Z"
              fill="url(#pv-cloud-grad)"
              stroke={dk ? "rgba(148,163,184,0.45)" : "rgba(100,116,139,0.3)"}
              strokeWidth="1.5"
            />
            {/* key glyph = access only */}
            <circle cx="19" cy="14" r="2.8" fill="none" stroke={green} strokeWidth="1.5" />
            <path d="M19 16.6 v5 M19 19.6 h2.6" stroke={green} strokeWidth="1.5" strokeLinecap="round" />
          </g>
        </motion.g>
      </svg>
    );
  }

  // CHECK
  return (
    <svg viewBox="0 0 80 80" className="w-[68px] h-[68px] overflow-visible" fill="none" aria-hidden>
      <motion.g style={{ scale: checkScale }}>
        <motion.circle cx="40" cy="40" r="26" fill={green} style={{ opacity: checkGlow }} />
        <motion.circle
          cx="40"
          cy="40"
          r="26"
          fill="none"
          stroke={green}
          strokeWidth="3"
          pathLength={1}
          strokeDasharray="1"
          strokeLinecap="round"
          style={{ strokeDashoffset: ringOffset }}
        />
        <motion.path
          d="M29 41 L37 49 L52 32"
          fill="none"
          stroke={dk ? "#ecfdf5" : "#065f46"}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1"
          style={{ strokeDashoffset: tickOffset }}
        />
      </motion.g>
    </svg>
  );
}
