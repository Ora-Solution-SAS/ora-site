import { useEffect, useRef } from "react";
import { motion, useMotionValue, useInView, animate, useTransform, type MotionValue } from "framer-motion";
import { Lock, Check, ShieldCheck } from "lucide-react";
import { useLang } from "@/lib/i18n";

/** Small inline Swiss flag (red rounded square + white cross). */
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
 * Privacy section — Joko-style tile grid.
 *
 *  Three tiles side by side: each holds a blue-gradient visual with one of the
 *  animated security icons (lock / cloud / check) that draws itself in when
 *  the tile scrolls into view — and replays on hover. Under each tile sits a
 *  short title; hovering the tile unfolds its paragraph beneath the title.
 *
 *  Mobile (< md): tiles stack and paragraphs are always visible (no hover).
 */

interface PrivacyShowcaseProps {
  theme: "light" | "dark";
}

type IconKind = "lock" | "cloud" | "check";

export default function PrivacyShowcase({ theme }: PrivacyShowcaseProps) {
  const { t } = useLang();
  const dk = theme === "dark";
  const lockColor = dk ? "#60a5fa" : "#2563eb";

  const features: { kind: IconKind; title: string; desc: string }[] = [
    {
      kind: "lock",
      title: t({ fr: "En local", en: "On-device" }),
      desc: t({
        fr: "Les automatisations s'exécutent localement, sur votre appareil. Le traitement de vos fichiers se fait chez vous, nos serveurs ne servent qu'à stocker vos données chiffrées, jamais à les analyser.",
        en: "Automations run locally, on your own device. Your files are processed on your side; our servers only store your encrypted data, they never analyze it.",
      }),
    },
    {
      kind: "cloud",
      title: t({ fr: "Chiffrement", en: "Encryption" }),
      desc: t({
        fr: "Vos données métier et financières sont chiffrées directement sur votre appareil, avant tout envoi. Seuls des blobs illisibles quittent votre machine, la clé qui les ouvre ne sort jamais de votre compte.",
        en: "Your business and financial data is encrypted directly on your device, before anything is sent. Only unreadable blobs leave your machine, and the key that opens them never leaves your account.",
      }),
    },
    {
      kind: "check",
      title: t({ fr: "En Suisse", en: "In Switzerland" }),
      desc: t({
        fr: "Aucun fichier client n'est utilisé pour entraîner des modèles d'IA. Vos données servent uniquement à votre travail. Stockées chiffrées en Suisse, chez un hébergeur conforme au RGPD, hors CLOUD Act américain.",
        en: "No client file is ever used to train AI models. Your data serves only your work. Stored encrypted in Switzerland, with a GDPR-compliant host, outside the US CLOUD Act.",
      }),
    },
  ];

  return (
    <section
      id="securite"
      data-nav-shy
      className="relative px-6 md:px-12 pt-44 md:pt-64 pb-20 md:pb-28"
      style={{ background: dk ? "#0f172a" : "#ffffff" }}
    >
      {/* Very soft blue ambient glows so the tiles lift off the flat background. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: dk
            ? "radial-gradient(38% 26% at 24% 32%, rgba(59,130,246,0.14) 0%, transparent 70%), radial-gradient(42% 30% at 78% 60%, rgba(59,130,246,0.11) 0%, transparent 72%)"
            : "radial-gradient(36% 26% at 22% 30%, rgba(59,130,246,0.10) 0%, transparent 70%), radial-gradient(42% 30% at 80% 58%, rgba(96,165,250,0.08) 0%, transparent 72%)",
        }}
      />
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* ── Header ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto mb-14 md:mb-20"
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
          <h2 className="font-poppins font-semibold text-3xl md:text-[2.75rem] tracking-[-0.03em] leading-[1.12] text-[#111827] dark:text-white mb-5">
            {t({ fr: "Vos données vous appartiennent.", en: "Your data belongs to you." })}
          </h2>
          <p className="font-inter text-base md:text-lg leading-relaxed text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            {t({
              fr: "Vos fichiers sont chiffrés sur votre appareil avant d'être stockés en Suisse. Sur nos serveurs, ils n'existent que sous forme de données illisibles.",
              en: "Your files are encrypted on your device before being stored in Switzerland. On our servers, they exist only as unreadable data.",
            })}
          </p>
        </motion.div>

        {/* ── Joko-style tile row. Flex (not grid) on md+ so the hovered
            tile can widen while its neighbours slide aside. ─────────── */}
        <div className="flex flex-col md:flex-row gap-10 md:gap-8 lg:gap-10">
          {features.map((f, i) => (
            <PrivacyTile key={f.kind} kind={f.kind} title={f.title} desc={f.desc} dk={dk} index={i} />
          ))}
        </div>

        {/* ── Trust strip — quick reassurance markers ──────────────────── */}
        <div className="mt-14 md:mt-20 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 font-inter text-[13px] font-medium text-gray-500 dark:text-gray-400">
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
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  PrivacyTile — blue visual + word + paragraph revealed on hover.
// ─────────────────────────────────────────────────────────────────────────────

function PrivacyTile({
  kind,
  title,
  desc,
  dk,
  index,
}: {
  kind: IconKind;
  title: string;
  desc: string;
  dk: boolean;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const lp = useMotionValue(0);

  // Draw the icon in when the tile first scrolls into view…
  useEffect(() => {
    if (inView) {
      const controls = animate(lp, 1, { duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: index * 0.12 });
      return () => controls.stop();
    }
  }, [inView, lp, index]);

  // …and replay the draw-in on hover.
  const onEnter = () => {
    lp.set(0);
    animate(lp, 1, { duration: 0.9, ease: [0.22, 1, 0.36, 1] });
  };

  return (
    <motion.div
      ref={ref}
      // flex-grow animates: the hovered tile widens, neighbours slide aside.
      className="group md:flex-[1_1_0%] md:hover:flex-[1.35_1_0%] transition-[flex-grow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] min-w-0"
      onMouseEnter={onEnter}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
    >
      {/* Visual — brand-blue gradient sky, Joko-style, icon floating center.
          Fixed height on md+ so widening the tile never changes the row
          height; colors invert on hover (light face, blue icon). */}
      <div
        className="relative aspect-[4/3] md:aspect-auto md:h-[280px] lg:h-[300px] rounded-[24px] overflow-hidden"
        style={{
          // Flat solid blue (from the reference swatch), no gradient.
          background: dk ? "#2b4bb0" : "#4169E1",
        }}
      >
        {/* soft top glow, like light coming from above */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(90% 60% at 50% -10%, rgba(255,255,255,0.14) 0%, transparent 60%)",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-out group-hover:scale-110">
          <div className="scale-[1.9] md:scale-[2.1]">
            <IconStage kind={kind} lp={lp} accent="#ffffff" muted="rgba(255,255,255,0.55)" />
          </div>
        </div>
      </div>

      {/* Word */}
      <h3 className="mt-5 text-center font-poppins font-semibold text-xl md:text-2xl tracking-[-0.02em] text-[#111827] dark:text-white">
        {title}
      </h3>

      {/* Paragraph — folded on desktop, unfolds on hover; always open < md */}
      <div className="grid grid-rows-[1fr] md:grid-rows-[0fr] md:group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
        <div className="overflow-hidden min-h-0">
          <p className="pt-2.5 text-center font-inter text-[15px] md:text-base leading-relaxed text-gray-500 dark:text-gray-400 md:opacity-0 md:translate-y-1 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-500">
            {desc}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  IconStage — the three draw-in SVG animations (lock / cloud / check).
// ─────────────────────────────────────────────────────────────────────────────

function IconStage({
  kind,
  lp,
  accent,
  muted,
}: {
  kind: IconKind;
  lp: MotionValue<number>;
  accent: string;
  muted: string;
}) {
  const stroke = 2;

  // ── LOCK: shackle seats down ──
  const shackleY = useTransform(lp, [0, 1], [-7, 0]);
  const lockColor = useTransform(lp, [0.55, 1], [muted, accent]);
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
          <motion.path
            d="M-9 -2 V -9 a9 9 0 0 1 18 0 V -2"
            stroke={muted}
            strokeWidth={stroke}
            strokeLinecap="round"
            style={{ y: shackleY }}
          />
          <motion.rect
            x="-13" y="-2" width="26" height="20" rx="5"
            fill="none"
            strokeWidth={stroke}
            style={{ stroke: lockColor }}
          />
          <motion.circle cx="0" cy="8" r="2.2" style={{ fill: lockColor }} />
        </motion.g>
      </svg>
    );
  }

  if (kind === "cloud") {
    return (
      <svg viewBox="0 0 48 48" className="w-20 h-20 md:w-24 md:h-24 overflow-visible" fill="none" aria-hidden>
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
