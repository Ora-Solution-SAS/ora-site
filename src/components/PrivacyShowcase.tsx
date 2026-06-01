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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 items-start">
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
    <div className="flex flex-col items-center">
      {/* Animated icon — sits ABOVE the card, horizontally centered. */}
      <div className="h-20 md:h-24 flex items-end justify-center mb-5 md:mb-6">
        <IconStage kind={kind} lp={lp} dk={dk} />
      </div>

      {/* Card */}
      <motion.div
        style={{ opacity: cardOpacity, borderColor }}
        className="w-full flex flex-col p-8 md:p-9 rounded-[28px] border bg-white dark:bg-white/[0.03] min-h-[280px] md:min-h-[320px]"
      >
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
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  IconStage — the three scroll-driven SVG animations.
// ─────────────────────────────────────────────────────────────────────────────

function IconStage({ kind, lp, dk }: { kind: IconKind; lp: MotionValue<number>; dk: boolean }) {
  // Minimalist, modern-SaaS: thin monochrome outline strokes, no filled
  // bodies, no glow. One accent green, one muted line color.
  const green = dk ? "#34d399" : "#059669";
  const muted = dk ? "rgba(148,163,184,0.45)" : "rgba(100,116,139,0.32)";
  const stroke = 2;

  // ── LOCK: shackle seats down as you scroll ──
  const shackleY = useTransform(lp, [0, 1], [-7, 0]);
  // colour shifts from muted (open) to green (locked)
  const lockColor = useTransform(lp, [0.55, 1], [muted, green]);

  // ── CLOUD: arrives (drifts down + fades in) ──
  const cloudY = useTransform(lp, [0, 0.85], [-14, 0]);
  const cloudScale = useTransform(lp, [0, 0.85, 1], [0.85, 1.04, 1]);
  const cloudOpacity = useTransform(lp, [0, 0.55], [0, 1]);

  // ── CHECK: ring then tick draw in ──
  const ringOffset = useTransform(lp, [0, 0.65], [1, 0]);
  const tickOffset = useTransform(lp, [0.55, 1], [1, 0]);

  if (kind === "lock") {
    return (
      <svg viewBox="0 0 48 48" className="w-16 h-16 md:w-20 md:h-20 overflow-visible" fill="none" aria-hidden>
        <g transform="translate(24, 26)">
          {/* shackle — lifts when open, seats (down) as it locks */}
          <motion.path
            d="M-9 -2 V -9 a9 9 0 0 1 18 0 V -2"
            stroke={muted}
            strokeWidth={stroke}
            strokeLinecap="round"
            style={{ y: shackleY }}
          />
          {/* body outline (colour shifts to green when locked) */}
          <motion.rect
            x="-13" y="-2" width="26" height="20" rx="5"
            fill="none"
            strokeWidth={stroke}
            style={{ stroke: lockColor }}
          />
          {/* keyhole dot */}
          <motion.circle cx="0" cy="8" r="2.2" style={{ fill: lockColor }} />
        </g>
      </svg>
    );
  }

  if (kind === "cloud") {
    return (
      <svg viewBox="0 0 48 48" className="w-16 h-16 md:w-20 md:h-20 overflow-visible" fill="none" aria-hidden>
        {/* a single, clean cloud — drifts down + fades in, centered */}
        <motion.path
          d="M16 32 a8 8 0 0 1 1 -15.2 a9.5 9.5 0 0 1 18 2.6 a7 7 0 0 1 -1.2 12.6 Z"
          fill="none"
          stroke={green}
          strokeWidth={stroke}
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{ y: cloudY, scale: cloudScale, opacity: cloudOpacity }}
        />
      </svg>
    );
  }

  // CHECK
  return (
    <svg viewBox="0 0 48 48" className="w-16 h-16 md:w-20 md:h-20 overflow-visible" fill="none" aria-hidden>
      <motion.circle
        cx="24" cy="24" r="16"
        fill="none"
        stroke={green}
        strokeWidth={stroke}
        pathLength={1}
        strokeDasharray="1"
        strokeLinecap="round"
        transform="rotate(-90 24 24)"
        style={{ strokeDashoffset: ringOffset }}
      />
      <motion.path
        d="M17 24.5 L22 29.5 L31.5 19"
        fill="none"
        stroke={green}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1"
        style={{ strokeDashoffset: tickOffset }}
      />
    </svg>
  );
}
