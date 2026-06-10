import { useRef, useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  type MotionValue,
} from "framer-motion";
import { Lock, Check, ShieldCheck } from "lucide-react";
import { useLang } from "@/lib/i18n";

/** Small inline Swiss flag (red rounded square + white cross) — a reassuring
 *  trust marker for "hosted in Switzerland". */
function SwissFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="7" fill="#D52B1E" />
      <rect x="13.5" y="7" width="5" height="18" rx="1" fill="#fff" />
      <rect x="7" y="13.5" width="18" height="5" rx="1" fill="#fff" />
    </svg>
  );
}

/**
 * Privacy section — pinned scrollytelling.
 *
 * The section pins (position: sticky) for a tall scroll distance. As the user
 * scrolls down, three icon animations play ONE BY ONE above their cards:
 *   1. A padlock that locks (shackle seats + blue accent)       → files stay local
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
    chips: { label: string; flag?: boolean }[];
  }[] = [
    {
      kind: "lock",
      lp: pinned ? lp0 : doneMV,
      title: t({ fr: "Traitées sur votre machine", en: "Processed on your machine" }),
      desc: t({
        fr: "Les automatisations s'exécutent localement, sur votre appareil. Le traitement de vos fichiers se fait chez vous, nos serveurs ne servent qu'à stocker vos données chiffrées, jamais à les analyser.",
        en: "Automations run locally, on your own device. Your files are processed on your side; our servers only store your encrypted data, they never analyze it.",
      }),
      chips: [
        { label: t({ fr: "Calcul local", en: "Local compute" }) },
        { label: t({ fr: "Déchiffré chez vous", en: "Decrypted on your side" }) },
      ],
    },
    {
      kind: "cloud",
      lp: pinned ? lp1 : doneMV,
      title: t({ fr: "Chiffrés avant de partir", en: "Encrypted before they leave" }),
      desc: t({
        fr: "Vos données métier et financières sont chiffrées directement sur votre appareil, avant tout envoi. Seuls des blobs illisibles quittent votre machine, la clé qui les ouvre ne sort jamais de votre compte.",
        en: "Your business and financial data is encrypted directly on your device, before anything is sent. Only unreadable blobs leave your machine, and the key that opens them never leaves your account.",
      }),
      chips: [
        { label: t({ fr: "Chiffrement AES-256", en: "AES-256 encryption" }) },
        { label: t({ fr: "Côté client", en: "Client-side" }) },
      ],
    },
    {
      kind: "check",
      lp: pinned ? lp2 : doneMV,
      title: t({ fr: "Jamais utilisées pour entraîner des modèles", en: "Never used to train models" }),
      desc: t({
        fr: "Aucun fichier client n'est utilisé pour entraîner des modèles d'IA. Vos données servent uniquement à votre travail. Stockées chiffrées en Suisse, chez un hébergeur conforme au RGPD, hors CLOUD Act américain.",
        en: "No client file is ever used to train AI models. Your data serves only your work. Stored encrypted in Switzerland, with a GDPR-compliant host, outside the US CLOUD Act.",
      }),
      chips: [
        { label: t({ fr: "Aucun entraînement IA", en: "No AI training" }) },
        { label: t({ fr: "Hébergé en Suisse", en: "Hosted in Switzerland" }), flag: true },
      ],
    },
  ];

  const lockColor = dk ? "#60a5fa" : "#2563eb";

  return (
    <section
      id="securite"
      ref={outerRef}
      // Tall on desktop so the scene pins while the 3 anims play; auto on mobile.
      style={{ background: dk ? "#0f172a" : "#ffffff", height: pinned ? "300vh" : "auto" }}
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
                borderColor: dk ? "rgba(59,130,246,0.3)" : "rgba(59,130,246,0.25)",
                background: dk ? "rgba(59,130,246,0.1)" : "rgba(59,130,246,0.07)",
                color: lockColor,
              }}
            >
              <Lock className="w-3.5 h-3.5" />
              {t({ fr: "Confidentialité", en: "Privacy" })}
            </div>
            <h2 className="font-poppins font-semibold text-3xl md:text-5xl tracking-[-0.03em] leading-[1.12] text-[#111827] dark:text-white mb-5">
              {t({
                fr: "Vos données vous appartiennent.",
                en: "Your data belongs to you.",
              })}
            </h2>
            <p className="font-inter text-base md:text-lg leading-relaxed text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              {t({
                fr: "Vos fichiers sont chiffrés sur votre appareil avant d'être stockés en Suisse. Sur nos serveurs, ils n'existent que sous forme de données illisibles.",
                en: "Your files are encrypted on your device before being stored in Switzerland. On our servers, they exist only as unreadable data.",
              })}
            </p>
          </motion.div>

          {/* ── 3 cards, each topped by its animated icon ─────────────── */}
          {/* items-stretch + h-full inside each card → all three cards share
              the height of the tallest one. */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 items-stretch">
            {cards.map((card) => (
              <PrivacyCard key={card.kind} {...card} dk={dk} />
            ))}
          </div>

          {/* ── Trust strip — quick reassurance markers under the cards ──── */}
          <div className="mt-10 md:mt-12 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 font-inter text-[13px] font-medium text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              {t({ fr: "Chiffrement de bout en bout", en: "End-to-end encryption" })}
            </span>
            <span className="inline-flex items-center gap-2">
              <SwissFlag className="w-4 h-4" />
              {t({ fr: "Données hébergées en Suisse", en: "Data hosted in Switzerland" })}
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              {t({ fr: "Conforme RGPD", en: "GDPR compliant" })}
            </span>
            <span className="inline-flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" strokeWidth={3} />
              {t({ fr: "Hors CLOUD Act", en: "Outside the CLOUD Act" })}
            </span>
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
  chips: { label: string; flag?: boolean }[];
  dk: boolean;
}) {
  // Card dims until its own animation begins, then lifts to full presence.
  const cardOpacity = useTransform(lp, [0, 0.25], [0.4, 1]);
  const borderColor = useTransform(
    lp,
    [0.3, 0.9],
    [
      dk ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)",
      dk ? "rgba(59,130,246,0.55)" : "rgba(59,130,246,0.5)",
    ],
  );

  return (
    <div className="flex flex-col items-center h-full">
      {/* Animated icon — sits ABOVE the card, horizontally centered. */}
      <div className="h-24 md:h-28 flex items-end justify-center mb-5 md:mb-6">
        <IconStage kind={kind} lp={lp} dk={dk} />
      </div>

      {/* Card — flex-1 so every card fills the equal grid-row height. */}
      <motion.div
        style={{ opacity: cardOpacity, borderColor }}
        className="w-full flex-1 flex flex-col p-8 md:p-9 rounded-[28px] border bg-white dark:bg-white/[0.03] min-h-[280px] md:min-h-[320px]"
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
              key={chip.label}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-inter font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 ring-1 ring-blue-200/70 dark:ring-blue-400/20"
            >
              {chip.flag ? (
                <SwissFlag className="w-3.5 h-3.5" />
              ) : (
                <Check className="w-3 h-3 text-emerald-500" strokeWidth={3} />
              )}
              {chip.label}
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
  // bodies, no glow. One brand accent (blue), one muted line color.
  const accent = dk ? "#60a5fa" : "#2563eb";
  const muted = dk ? "rgba(148,163,184,0.45)" : "rgba(100,116,139,0.32)";
  const stroke = 2;

  // ── LOCK: shackle seats down as you scroll ──
  const shackleY = useTransform(lp, [0, 1], [-7, 0]);
  // colour shifts from muted (open) to brand blue (locked)
  const lockColor = useTransform(lp, [0.55, 1], [muted, accent]);
  // Fade the whole lock in (like the cloud / check) so it isn't already drawn
  // at rest while the two other icons are still invisible.
  const lockOpacity = useTransform(lp, [0, 0.22], [0, 1]);

  // ── CLOUD: arrives (drifts down + fades in) ──
  const cloudY = useTransform(lp, [0, 0.85], [-14, 0]);
  const cloudScale = useTransform(lp, [0, 0.85, 1], [0.85, 1.04, 1]);
  const cloudOpacity = useTransform(lp, [0, 0.55], [0, 1]);

  // ── CHECK: ring then tick draw in ──
  const ringOffset = useTransform(lp, [0, 0.65], [1, 0]);
  const tickOffset = useTransform(lp, [0.55, 1], [1, 0]);

  if (kind === "lock") {
    return (
      <svg viewBox="0 0 48 48" className="w-20 h-20 md:w-24 md:h-24 overflow-visible" fill="none" aria-hidden>
        <motion.g transform="translate(24, 26)" style={{ opacity: lockOpacity }}>
          {/* shackle — lifts when open, seats (down) as it locks */}
          <motion.path
            d="M-9 -2 V -9 a9 9 0 0 1 18 0 V -2"
            stroke={muted}
            strokeWidth={stroke}
            strokeLinecap="round"
            style={{ y: shackleY }}
          />
          {/* body outline (colour shifts to brand blue when locked) */}
          <motion.rect
            x="-13" y="-2" width="26" height="20" rx="5"
            fill="none"
            strokeWidth={stroke}
            style={{ stroke: lockColor }}
          />
          {/* keyhole dot */}
          <motion.circle cx="0" cy="8" r="2.2" style={{ fill: lockColor }} />
        </motion.g>
      </svg>
    );
  }

  if (kind === "cloud") {
    return (
      <svg viewBox="0 0 48 48" className="w-20 h-20 md:w-24 md:h-24 overflow-visible" fill="none" aria-hidden>
        {/* a single, clean cloud — drifts down + fades in, centered */}
        <motion.path
          d="M16 32 a8 8 0 0 1 1 -15.2 a9.5 9.5 0 0 1 18 2.6 a7 7 0 0 1 -1.2 12.6 Z"
          fill="none"
          stroke={accent}
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
    <svg viewBox="0 0 48 48" className="w-20 h-20 md:w-24 md:h-24 overflow-visible" fill="none" aria-hidden>
      <motion.circle
        cx="24" cy="24" r="16"
        fill="none"
        stroke={accent}
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
        stroke={accent}
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
