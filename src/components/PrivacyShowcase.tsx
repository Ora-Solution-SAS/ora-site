import { useRef, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import { Laptop, Cloud, BadgeCheck, Check, Lock } from "lucide-react";
import { useLang } from "@/lib/i18n";

/**
 * Privacy section — scroll-driven animated stage + trust cards.
 *
 * The hero stage tells the story in motion:
 *   - A padlock whose shackle LIFTS when open and SEATS (locks) as the user
 *     scrolls into the section. A green glow + "Verrouillé" pill confirm it.
 *   - A cloud that ARRIVES from the side, tethered to the device by a dashed
 *     line labelled "accès uniquement" — the cloud is only for login, never
 *     for the files, which stay anchored in the local device below the lock.
 *
 * Scroll progress is computed manually (rAF + getBoundingClientRect) and fed
 * into a motion value, because Framer's useScroll does not stay in sync with
 * this site's Lenis smooth-scroll. The card grid uses whileInView entrances.
 */

interface PrivacyShowcaseProps {
  theme: "light" | "dark";
}

export default function PrivacyShowcase({ theme }: PrivacyShowcaseProps) {
  const { t } = useLang();
  const dk = theme === "dark";

  const stageRef = useRef<HTMLDivElement>(null);

  // 0 = unlocked / nothing arrived, 1 = locked / cloud docked.
  const progress = useMotionValue(0);
  // Smooth the raw scroll progress so the lock motion feels weighted.
  const p = useSpring(progress, { stiffness: 120, damping: 26, mass: 0.6 });

  useEffect(() => {
    let raf = 0;
    const compute = () => {
      raf = 0;
      const el = stageRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      // Locks as the stage rises from 85% of the viewport up to its middle.
      const raw = (vh * 0.85 - rect.top) / (vh * 0.55);
      progress.set(Math.min(1, Math.max(0, raw)));
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
  }, [progress]);

  // ── Derived animation values ───────────────────────────────────────────
  // Shackle lifts up (open) → seats down (locked).
  const shackleY = useTransform(p, [0, 1], [-15, 0]);
  // Body gives a tiny settle bounce as it locks.
  const bodyScale = useTransform(p, [0, 0.85, 1], [0.96, 1.03, 1]);
  // Green glow ramps up once it's locking. The soft filled disk stays subtle
  // (caps low) while the thin ring can reach full opacity.
  const glowDiskOpacity = useTransform(p, [0.45, 1], [0, 0.16]);
  const glowRingOpacity = useTransform(p, [0.45, 1], [0, 0.9]);
  // "Verrouillé" pill + check appear at the end.
  const lockedOpacity = useTransform(p, [0.8, 1], [0, 1]);
  const lockedY = useTransform(p, [0.8, 1], [8, 0]);
  // Open-state "Déverrouillé" hint fades out as it locks.
  const openOpacity = useTransform(p, [0, 0.4], [1, 0]);

  // Cloud arrives from the right + up as you scroll in.
  const cloudX = useTransform(p, [0, 0.7], [70, 0]);
  const cloudY = useTransform(p, [0, 0.7], [-22, 0]);
  const cloudOpacity = useTransform(p, [0.1, 0.6], [0, 1]);
  // Dashed tether to the cloud draws in.
  const tetherOpacity = useTransform(p, [0.35, 0.7], [0, 1]);

  const lockColor = dk ? "#34d399" : "#059669";
  const lockColorSoft = dk ? "#10b981" : "#10b981";

  const cards = [
    {
      icon: Laptop,
      title: t({ fr: "Vos fichiers restent sur votre machine", en: "Your files stay on your machine" }),
      desc: t({
        fr: "Vos données métier et financières sont traitées entièrement sur votre appareil. Les fichiers sur lesquels vous travaillez ne sont jamais téléversés vers nos serveurs.",
        en: "Your business and financial data is processed entirely on your device. The files you work on are never uploaded to our servers.",
      }),
      chips: [t({ fr: "100 % local", en: "100% local" }), t({ fr: "Aucun téléversement", en: "No upload" })],
    },
    {
      icon: Cloud,
      title: t({ fr: "Le cloud pour l'accès, jamais pour vos données", en: "Cloud only for access, never for data" }),
      desc: t({
        fr: "L'authentification et la gestion des utilisateurs s'appuient sur Supabase, un hébergeur cloud sécurisé et conforme au RGPD. Seules vos informations de connexion et de compte y sont stockées, jamais vos documents.",
        en: "Authentication and user management run on Supabase, a secure, GDPR-compliant cloud provider. Only login and account information is stored there, never your documents.",
      }),
      chips: ["Supabase", t({ fr: "RGPD", en: "GDPR" })],
    },
    {
      icon: BadgeCheck,
      title: t({ fr: "Conforme RGPD par conception", en: "GDPR compliant by design" }),
      desc: t({
        fr: "Aucune donnée client ne quitte votre environnement, vos obligations réglementaires restent donc simples. Les accès sont contrôlés par utilisateur et par équipe.",
        en: "No client data leaves your environment, so your regulatory obligations stay simple. Access is controlled per user and per team.",
      }),
      chips: [t({ fr: "Par utilisateur", en: "Per user" }), t({ fr: "Par équipe", en: "Per team" })],
    },
  ];

  return (
    <section
      className="py-24 md:py-32 px-6 md:px-12"
      style={{ background: dk ? "#0f172a" : "#fcfbf7" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto mb-12 md:mb-16"
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

        {/* ── Animated stage: padlock locking + cloud arriving ─────────── */}
        <div
          ref={stageRef}
          className="relative mx-auto mb-16 md:mb-20 flex items-center justify-center"
          style={{ height: 320, maxWidth: 560 }}
          aria-hidden
        >
          <svg
            viewBox="0 0 240 200"
            className="w-full h-full overflow-visible"
            fill="none"
          >
            <defs>
              <linearGradient id="pv-lock-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={dk ? "#10b981" : "#10b981"} />
                <stop offset="100%" stopColor={dk ? "#0d9488" : "#0d9488"} />
              </linearGradient>
              <linearGradient id="pv-cloud-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={dk ? "#1e293b" : "#ffffff"} />
                <stop offset="100%" stopColor={dk ? "#0f172a" : "#eef2ff"} />
              </linearGradient>
            </defs>

            {/* Dashed tether from device up to the cloud — "accès uniquement" */}
            <motion.path
              d="M150 70 C 175 60, 185 52, 196 44"
              stroke={lockColor}
              strokeWidth="1.5"
              strokeDasharray="4 4"
              style={{ opacity: tetherOpacity }}
            />

            {/* Cloud — arrives from the right/top */}
            <motion.g style={{ x: cloudX, y: cloudY, opacity: cloudOpacity }}>
              <g transform="translate(178, 18)">
                <path
                  d="M12 30 a12 12 0 0 1 2 -23 a15 15 0 0 1 28 4 a11 11 0 0 1 -2 19 Z"
                  fill="url(#pv-cloud-grad)"
                  stroke={dk ? "rgba(148,163,184,0.4)" : "rgba(100,116,139,0.3)"}
                  strokeWidth="1.5"
                />
                {/* tiny key glyph in the cloud = access only */}
                <circle cx="27" cy="20" r="3.4" fill="none" stroke={lockColor} strokeWidth="1.6" />
                <path d="M27 23 v6 M27 27 h3" stroke={lockColor} strokeWidth="1.6" strokeLinecap="round" />
              </g>
            </motion.g>

            {/* ── Padlock group, centered ── */}
            <g transform="translate(120, 110)">
              {/* Green lock glow (ramps in once locking) */}
              <motion.circle
                cx="0"
                cy="14"
                r="62"
                fill={lockColor}
                style={{ opacity: glowDiskOpacity }}
              />
              <motion.circle
                cx="0"
                cy="14"
                r="50"
                fill="none"
                stroke={lockColor}
                strokeWidth="1"
                style={{ opacity: glowRingOpacity }}
              />

              {/* Shackle — lifts when open, seats when locked */}
              <motion.path
                d="M-22 4 V -16 a22 22 0 0 1 44 0 V 4"
                stroke={dk ? "#64748b" : "#94a3b8"}
                strokeWidth="9"
                strokeLinecap="round"
                style={{ y: shackleY }}
              />

              {/* Lock body */}
              <motion.g style={{ scale: bodyScale }}>
                <rect
                  x="-34"
                  y="2"
                  width="68"
                  height="56"
                  rx="14"
                  fill="url(#pv-lock-grad)"
                />
                {/* Keyhole */}
                <circle cx="0" cy="24" r="6.5" fill={dk ? "#0f172a" : "#ffffff"} />
                <rect x="-2.5" y="27" width="5" height="13" rx="2.5" fill={dk ? "#0f172a" : "#ffffff"} />
              </motion.g>

              {/* Local "data dots" anchored under the lock = stays on device */}
              <g opacity={dk ? 0.5 : 0.45}>
                <circle cx="-46" cy="70" r="3" fill={lockColorSoft} />
                <circle cx="0" cy="78" r="3" fill={lockColorSoft} />
                <circle cx="46" cy="70" r="3" fill={lockColorSoft} />
              </g>
            </g>
          </svg>

          {/* "Déverrouillé" → "Verrouillé" status pill (HTML overlay) */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-inter font-semibold"
            style={{
              bottom: 6,
              opacity: lockedOpacity,
              y: lockedY,
              color: lockColor,
              background: dk ? "rgba(16,185,129,0.12)" : "rgba(16,185,129,0.1)",
              border: `1px solid ${dk ? "rgba(16,185,129,0.3)" : "rgba(16,185,129,0.25)"}`,
            }}
          >
            <Check className="w-3.5 h-3.5" strokeWidth={3} />
            {t({ fr: "Données verrouillées en local", en: "Data locked locally" })}
          </motion.div>
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 text-[12px] font-inter font-medium text-gray-400 dark:text-gray-500"
            style={{ bottom: 10, opacity: openOpacity }}
          >
            {t({ fr: "Scrollez pour verrouiller", en: "Scroll to lock" })}
          </motion.div>
        </div>

        {/* ── Trust cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {cards.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.12 }}
                className="group flex flex-col p-8 md:p-9 rounded-[28px] border border-gray-200/70 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] min-h-[320px] md:min-h-[360px] transition-all duration-200 hover:border-emerald-400/50 hover:shadow-[0_16px_44px_-16px_rgba(16,185,129,0.25)] dark:hover:bg-white/[0.05]"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/15 dark:to-teal-500/15 ring-1 ring-emerald-200/70 dark:ring-emerald-400/20">
                  <Icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} />
                </div>

                <h3 className="mt-6 font-poppins font-semibold text-xl md:text-[1.4rem] tracking-tight text-[#111827] dark:text-white leading-snug">
                  {item.title}
                </h3>
                <p className="mt-3 font-inter text-[14.5px] leading-relaxed text-gray-500 dark:text-gray-400 flex-1">
                  {item.desc}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {item.chips.map((chip) => (
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
          })}
        </div>
      </div>
    </section>
  );
}
