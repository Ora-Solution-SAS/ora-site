import { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate, type MotionValue } from "framer-motion";
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
 * Privacy section — bubble.io-style scrollytelling (desktop).
 *
 *  Left  : three text cards stacked vertically. Each defines a scroll segment
 *          (min-height) so the user reads them one at a time. Hovering a card
 *          flips it to a blue fill with white text.
 *  Right : a single sticky stage holding a large animated icon (lock → cloud →
 *          check) that plays + swaps to match whichever left card is centered.
 *          No frame — the icon floats on a soft ambient glow.
 *
 *  Mobile (< md): single column, each card with its finished icon inline.
 */

interface PrivacyShowcaseProps {
  theme: "light" | "dark";
}

type IconKind = "lock" | "cloud" | "check";

export default function PrivacyShowcase({ theme }: PrivacyShowcaseProps) {
  const { t } = useLang();
  const dk = theme === "dark";
  const lockColor = dk ? "#60a5fa" : "#2563eb";

  const [activeIdx, setActiveIdx] = useState(0);
  const [isDesktop, setIsDesktop] = useState(true);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);

  const lp0 = useMotionValue(0);
  const lp1 = useMotionValue(0);
  const lp2 = useMotionValue(0);
  const lps = [lp0, lp1, lp2];

  const features: {
    kind: IconKind;
    title: string;
    desc: string;
    chips: { label: string; flag?: boolean }[];
  }[] = [
    {
      kind: "lock",
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
      title: t({ fr: "Chiffrées avant de partir", en: "Encrypted before they leave" }),
      desc: t({
        fr: "Vos données métier et financières sont chiffrées directement sur votre appareil, avant tout envoi. Seuls des blobs illisibles quittent votre machine, la clé qui les ouvre ne sort jamais de votre compte.",
        en: "Your business and financial data is encrypted directly on your device, before anything is sent. Only unreadable blobs leave your machine, and the key that opens them never leaves your account.",
      }),
      chips: [
        { label: t({ fr: "Chiffrement XChaCha20-Poly1305", en: "XChaCha20-Poly1305 encryption" }) },
        { label: t({ fr: "Côté client", en: "Client-side" }) },
      ],
    },
    {
      kind: "check",
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

  // Pin/scrolly only on md+; on mobile show everything finished.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Active-card detection via direct scroll math (same approach as FeaturesScrolly).
  useEffect(() => {
    if (!isDesktop) return;
    let raf = 0;
    const compute = () => {
      raf = 0;
      const triggerY = window.innerHeight * 0.5;
      let bestIdx = 0;
      let bestDistance = Infinity;
      blockRefs.current.forEach((ref, i) => {
        if (!ref) return;
        const rect = ref.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const d = Math.abs(center - triggerY);
        if (d < bestDistance) {
          bestDistance = d;
          bestIdx = i;
        }
      });
      setActiveIdx((prev) => (prev !== bestIdx ? bestIdx : prev));
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(compute);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    compute();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isDesktop]);

  // Play the active icon's animation; on mobile every icon is shown finished.
  useEffect(() => {
    if (!isDesktop) {
      lps.forEach((l) => l.set(1));
      return;
    }
    const controls = animate(lps[activeIdx], 1, { duration: 1.0, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx, isDesktop]);

  return (
    <section
      id="securite"
      data-nav-shy
      className="px-6 md:px-12 pt-32 md:pt-44 pb-20 md:pb-28"
      style={{ background: dk ? (isDesktop ? "#0f172a" : "#000000") : "#ffffff" }}
    >
      <div className="max-w-7xl mx-auto">
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

        {/* ── Scrolly: text cards (left) + sticky animated stage (right) ── */}
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-10 md:gap-16">
          {/* LEFT — stacked text cards */}
          <div className="flex flex-col">
            {features.map((f, i) => (
              <div
                key={f.kind}
                ref={(el) => { blockRefs.current[i] = el; }}
                className="md:min-h-[62vh] flex flex-col justify-center py-6 md:py-0"
              >
                {/* Mobile-only icon above the card */}
                <div className="md:hidden h-20 flex items-end justify-center mb-3">
                  <IconStage kind={f.kind} lp={lps[i]} dk={dk} />
                </div>
                <PrivacyCard
                  title={f.title}
                  desc={f.desc}
                  chips={f.chips}
                  active={isDesktop ? i === activeIdx : true}
                />
              </div>
            ))}
          </div>

          {/* RIGHT — sticky animated design (desktop only). No frame: the icon
              floats on a soft ambient glow. */}
          <div className="hidden md:block">
            <div className="sticky top-24 h-[calc(100vh-8rem)] flex items-center">
              <div className="relative w-full aspect-square max-w-[460px] mx-auto flex items-center justify-center">
                <div
                  aria-hidden
                  className="absolute inset-0 -z-10 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(50% 50% at 50% 45%, rgba(59,130,246,0.16) 0%, transparent 70%)",
                  }}
                />
                {features.map((f, i) => (
                  <motion.div
                    key={f.kind}
                    className="absolute inset-0 flex items-center justify-center"
                    initial={false}
                    animate={{ opacity: i === activeIdx ? 1 : 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="scale-[3]">
                      <IconStage kind={f.kind} lp={lps[i]} dk={dk} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
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
//  PrivacyCard — text card; hovering flips it to a blue fill with white text.
// ─────────────────────────────────────────────────────────────────────────────

function PrivacyCard({
  title,
  desc,
  chips,
  active,
}: {
  title: string;
  desc: string;
  chips: { label: string; flag?: boolean }[];
  active: boolean;
}) {
  return (
    <div
      className={`group w-full p-8 md:p-10 rounded-[30px] border border-gray-200/80 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] transition-all duration-300 hover:bg-[#3b82f6] hover:border-[#3b82f6] hover:shadow-[0_30px_70px_-30px_rgba(59,130,246,0.6)] ${
        active ? "opacity-100" : "md:opacity-45"
      }`}
    >
      <h3 className="font-poppins font-semibold text-xl md:text-[1.5rem] tracking-tight leading-snug text-[#111827] dark:text-white group-hover:text-white transition-colors duration-300">
        {title}
      </h3>
      <p className="mt-3 font-inter text-[14.5px] md:text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 group-hover:text-white/90 transition-colors duration-300">
        {desc}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span
            key={chip.label}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-inter font-semibold bg-blue-50 text-blue-700 ring-1 ring-blue-200/70 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/20 group-hover:bg-white/15 group-hover:text-white group-hover:ring-white/30 transition-colors duration-300"
          >
            {chip.flag ? (
              <SwissFlag className="w-3.5 h-3.5" />
            ) : (
              <Check className="w-3 h-3 text-emerald-500 group-hover:text-white" strokeWidth={3} />
            )}
            {chip.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  IconStage — the three scroll-driven SVG animations.
// ─────────────────────────────────────────────────────────────────────────────

function IconStage({ kind, lp, dk }: { kind: IconKind; lp: MotionValue<number>; dk: boolean }) {
  const accent = dk ? "#60a5fa" : "#2563eb";
  const muted = dk ? "rgba(148,163,184,0.45)" : "rgba(100,116,139,0.32)";
  const stroke = 2;

  // ── LOCK: shackle seats down as you scroll ──
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
