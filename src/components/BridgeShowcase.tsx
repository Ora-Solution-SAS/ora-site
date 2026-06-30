import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Play, Video } from "lucide-react";
import { useLang } from "@/lib/i18n";

/**
 * BridgeShowcase — "Ora en action" (white).
 *
 *  Part 1 (pinned, scroll-driven): the four diagonal bars of the Ora logo
 *  unfold from the brand mark into the DECK of a bridge spanning "La tech"
 *  (left) → "Vos données" (right). The logo literally becomes the bridge.
 *
 *  The whole animation FINISHES by ~80% of the pin scroll and then HOLDS on
 *  the completed design for the rest — so the scene never releases while it is
 *  still half-built. The spring is snappy (low lag) so the visual tracks scroll.
 *
 *  Part 2: positioning headline + example-video PLACEHOLDER frames (monday-style).
 *
 *  On mobile the pin is skipped and the bridge renders finished.
 */

// ── Ora logo bars (200×200 viewBox) centred into the 480×220 bridge stage ───
const OFF_X = 140;
const OFF_Y = 12;
const LOGO: number[][] = [
  [187, 72, 87, 10],
  [186, 125, 37, 34],
  [162, 165, 13, 73],
  [115, 190, 14, 128],
].map(([x1, y1, x2, y2]) => [x1 + OFF_X, y1 + OFF_Y, x2 + OFF_X, y2 + OFF_Y]);

// ── Bridge deck: 4 horizontal segments laid end-to-end across the span ──────
const DECK_Y = 116;
const DECK_X0 = 72;
const DECK_X1 = 408;
const SEG = (DECK_X1 - DECK_X0) / 4;
const DECK: number[][] = [0, 1, 2, 3].map((i) => [
  DECK_X0 + i * SEG,
  DECK_Y,
  DECK_X0 + (i + 1) * SEG,
  DECK_Y,
]);

interface BridgeShowcaseProps {
  theme: "light" | "dark";
}

export function BridgeAnimation({ theme }: BridgeShowcaseProps) {
  const { t } = useLang();
  void theme;

  const outerRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(true);

  const progress = useMotionValue(0);
  // Snappy spring → tracks the scroll closely (little lag), so the design isn't
  // still catching up when the pin releases.
  const p = useSpring(progress, { stiffness: 260, damping: 38, mass: 0.4 });

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setPinned(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!pinned) {
      progress.set(1);
      return;
    }
    let raf = 0;
    const compute = () => {
      raf = 0;
      const el = outerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const total = el.offsetHeight - vh;
      const prog = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      progress.set(prog);
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

  // ── Per-bar endpoints: logo → deck. Everything wraps up by ~p=0.5 ────────
  const bars = LOGO.map((logo, i) => {
    const s = 0.04 + i * 0.05;
    const e = 0.34 + i * 0.05; // last bar finishes ~0.49
    return {
      x1: useTransform(p, [s, e], [logo[0], DECK[i][0]]),
      y1: useTransform(p, [s, e], [logo[1], DECK[i][1]]),
      x2: useTransform(p, [s, e], [logo[2], DECK[i][2]]),
      y2: useTransform(p, [s, e], [logo[3], DECK[i][3]]),
    };
  });

  // Supporting structure + payoff — all done by ~p=0.8, then it holds.
  const structureDraw = useTransform(p, [0.42, 0.66], [1, 0]);
  const structureOpacity = useTransform(p, [0.4, 0.56], [0, 1]);
  const labelsOpacity = useTransform(p, [0.1, 0.3], [0, 1]);
  const payoffOpacity = useTransform(p, [0.62, 0.8], [0, 1]);
  const payoffY = useTransform(p, [0.62, 0.8], [22, 0]);

  return (
    <section ref={outerRef} className="relative bg-white dark:bg-black md:dark:bg-[#0f172a]">
      {/* ════ PART 1 — the logo unfolds into a bridge (white) ════ */}
      <div data-nav-shy style={{ height: pinned ? "220vh" : "auto" }} className="relative">
        <div
          className={`${pinned ? "sticky top-0 min-h-screen flex flex-col justify-center" : "py-24"} px-6 md:px-12`}
        >
          <div className="max-w-4xl mx-auto w-full text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
              {t({ fr: "Notre raison d'être", en: "Why we exist" })}
            </span>
            <p className="font-inter mt-4 mb-10 md:mb-16 text-lg md:text-2xl leading-snug text-gray-700 dark:text-gray-200 max-w-2xl mx-auto">
              {t({
                fr: "L'automatisation avance vite. Confier ses données, beaucoup moins.",
                en: "Automation moves fast. Trusting it with your data, much less so.",
              })}
            </p>

            {/* the bridge stage */}
            <div className="relative w-full max-w-3xl mx-auto">
              <svg viewBox="0 0 480 220" className="w-full overflow-visible" fill="none" aria-hidden>
                <defs>
                  <linearGradient id="oraDeck" x1={DECK_X0} y1="0" x2={DECK_X1} y2="0" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#3b82f6" />
                    <stop offset="1" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>

                {/* subtle suspension arc */}
                <motion.path
                  d={`M${DECK_X0} ${DECK_Y} Q240 ${DECK_Y - 70} ${DECK_X1} ${DECK_Y}`}
                  stroke="url(#oraDeck)"
                  strokeWidth={2}
                  strokeLinecap="round"
                  opacity={0.5}
                  pathLength={1}
                  strokeDasharray={1}
                  style={{ strokeDashoffset: structureDraw, opacity: structureOpacity }}
                />
                {/* piers under the deck ends */}
                {[DECK_X0, DECK_X1].map((x) => (
                  <motion.line
                    key={x}
                    x1={x}
                    y1={DECK_Y}
                    x2={x}
                    y2={DECK_Y + 52}
                    stroke="url(#oraDeck)"
                    strokeWidth={3}
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray={1}
                    style={{ strokeDashoffset: structureDraw, opacity: structureOpacity }}
                  />
                ))}

                {/* THE LOGO BARS — unfold from the brand mark into the deck */}
                {bars.map((b, i) => (
                  <motion.line
                    key={i}
                    x1={b.x1 as unknown as number}
                    y1={b.y1 as unknown as number}
                    x2={b.x2 as unknown as number}
                    y2={b.y2 as unknown as number}
                    stroke="url(#oraDeck)"
                    strokeWidth={18}
                    strokeLinecap="round"
                  />
                ))}
              </svg>

              {/* anchor labels */}
              <motion.div style={{ opacity: labelsOpacity }} className="absolute left-0 bottom-1 md:bottom-3 text-left">
                <div className="font-poppins font-semibold text-[12px] md:text-sm text-blue-600 leading-tight">
                  {t({ fr: "L'automatisation", en: "Automation" })}
                </div>
                <div className="font-inter text-[10px] md:text-[11px] text-gray-400">
                  {t({ fr: "Productivité · gains de temps", en: "Productivity · time saved" })}
                </div>
              </motion.div>
              <motion.div style={{ opacity: labelsOpacity }} className="absolute right-0 bottom-1 md:bottom-3 text-right">
                <div className="font-poppins font-semibold text-[12px] md:text-sm text-teal-600 leading-tight">
                  {t({ fr: "Vos données", en: "Your data" })}
                </div>
                <div className="font-inter text-[10px] md:text-[11px] text-gray-400">
                  {t({ fr: "Souveraineté · confidentialité", en: "Sovereignty · privacy" })}
                </div>
              </motion.div>
            </div>

            {/* payoff */}
            <motion.p
              style={{ opacity: payoffOpacity, y: payoffY }}
              className="font-poppins font-medium text-xl md:text-3xl tracking-[-0.02em] text-[#111827] dark:text-white mt-10 md:mt-14"
            >
              {t({ fr: "Ora, c'est ", en: "Ora is " })}
              <span className="text-brand-gradient">{t({ fr: "automatiser sans renoncer à vos données.", en: "automation without giving up your data." })}</span>
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  WhiteShowcase — monday-style example-video placeholders.
// ─────────────────────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function BridgeShowcase({ theme }: BridgeShowcaseProps) {
  const { t } = useLang();
  void theme;
  const cases = [
    {
      tab: t({ fr: "Reporting mensuel", en: "Monthly report" }),
      title: t({ fr: "Vos reportings, générés en un clic.", en: "Your reports, generated in one click." }),
      video: "/try1.mp4",
      benefits: [
        t({ fr: "Mise en forme prête à partager", en: "Formatting ready to share" }),
        t({ fr: "S'adapte à votre modèle de reporting", en: "Adapts to your reporting template" }),
        t({ fr: "Généré en quelques secondes", en: "Generated in seconds" }),
      ],
    },
    {
      tab: t({ fr: "Tracking", en: "Tracking" }),
      title: t({ fr: "Vos indicateurs suivis en continu.", en: "Your metrics tracked continuously." }),
      benefits: [
        t({ fr: "Suivi en continu, sans saisie", en: "Continuous tracking, no manual entry" }),
        t({ fr: "KPIs consolidés automatiquement", en: "KPIs consolidated automatically" }),
        t({ fr: "Écarts signalés en temps réel", en: "Gaps flagged in real time" }),
      ],
    },
    {
      tab: t({ fr: "Rapprochement", en: "Reconciliation" }),
      title: t({ fr: "Vos rapprochements, automatisés.", en: "Your reconciliations, automated." }),
      benefits: [
        t({ fr: "Écarts détectés tout seuls", en: "Gaps detected automatically" }),
        t({ fr: "Relevé et écritures comparés", en: "Statement and entries compared" }),
        t({ fr: "Fiabilité renforcée", en: "Stronger reliability" }),
      ],
    },
    {
      tab: t({ fr: "Multi-dossier", en: "Multi-folder" }),
      title: t({ fr: "Tous vos dossiers traités d'un coup.", en: "All your folders handled at once." }),
      benefits: [
        t({ fr: "Tous vos dossiers en une vue", en: "All your folders in one view" }),
        t({ fr: "Zéro copier-coller", en: "Zero copy-paste" }),
        t({ fr: "Traitement en lot", en: "Batch processing" }),
      ],
    },
    {
      tab: t({ fr: "Export PDF", en: "PDF export" }),
      title: t({ fr: "Vos tableaux en rapport PDF.", en: "Your sheets as a PDF report." }),
      benefits: [
        t({ fr: "Mise en page automatique", en: "Automatic layout" }),
        t({ fr: "Prêt à envoyer", en: "Ready to send" }),
        t({ fr: "À partir de votre Excel", en: "Straight from your Excel" }),
      ],
    },
  ];

  const [active, setActive] = useState(0);
  const cur = cases[active];

  return (
    <section data-nav-shy className="relative pt-24 md:pt-36 pb-24 md:pb-32 px-6 md:px-12 bg-white dark:bg-black md:dark:bg-[#0f172a]">
      <div className="max-w-[1500px] mx-auto">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-10 md:mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            {t({ fr: "Ora en action", en: "Ora in action" })}
          </span>
          <h2 className="font-poppins font-normal text-3xl md:text-[2.75rem] tracking-[-0.02em] leading-[1.14] text-[#111827] dark:text-white mt-4">
            {t({ fr: "L'automatisation, sans jamais ", en: "Automation, without ever " })}
            <span className="text-brand-gradient">{t({ fr: "exposer vos données.", en: "exposing your data." })}</span>
          </h2>
        </motion.div>

        {/* Sliding tab bar (monday-style): the active pill slides between tabs. */}
        <div className="flex justify-center mb-8 md:mb-10">
          <div className="inline-flex flex-wrap justify-center gap-1.5 p-2 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-[0_8px_30px_-14px_rgba(15,23,42,0.22)]">
            {cases.map((c, i) => {
              const isActive = i === active;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  className="relative px-5 md:px-7 py-3 rounded-full transition-colors duration-200"
                >
                  {isActive && (
                    <motion.div
                      layoutId="ora-action-pill"
                      className="absolute inset-0 rounded-full bg-transparent ring-1 ring-gray-300 dark:ring-white/25"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span
                    className={`relative font-inter font-semibold text-[15px] md:text-[16px] whitespace-nowrap transition-colors duration-200 ${
                      isActive ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    {c.tab}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* monday-style: a big coloured video card (left) + a stat counter and
            a review (right). The big card swaps to match the active keyword. */}
        <div className="max-w-4xl mx-auto">
          {/* single coloured card holding the video */}
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-[30px] p-7 md:p-10 flex flex-col text-center text-white shadow-[0_30px_75px_-34px_rgba(59,130,246,0.5)]"
            style={{ background: "linear-gradient(150deg, #5a9bf2 0%, #69b1ef 55%, #5cc4dd 100%)" }}
          >
            <div className="font-inter text-[13px] font-bold uppercase tracking-[0.14em] text-white/75">
              Ora · {cur.tab}
            </div>
            <h3 className="font-poppins font-semibold text-[2rem] md:text-[2.6rem] tracking-[-0.025em] leading-[1.08] text-white mt-3 max-w-xl mx-auto">
              {cur.title}
            </h3>

            {/* the video, framed inside the coloured card — keep the frame thin
                so the video itself gets as much room as possible */}
            <div className="mt-6 md:mt-8 rounded-[16px] bg-white/10 p-1 md:p-1.5 ring-1 ring-white/20">
              <VideoSlot label={cur.tab} src={(cur as { video?: string }).video} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function VideoSlot({ label, src }: { label?: string; src?: string }) {
  const { t } = useLang();

  // When a real video is provided, play it inside the slot (with controls).
  if (src) {
    return (
      <div className="relative mx-auto w-full max-w-[620px] aspect-[1608/1080] rounded-[12px] overflow-hidden bg-[#0b1220]">
        <video
          src={src}
          controls
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <span className="pointer-events-none absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 dark:bg-white/10 border border-gray-200 dark:border-white/10 text-[11px] font-inter font-semibold text-gray-600 dark:text-gray-300 backdrop-blur-sm">
          <Video className="w-3.5 h-3.5 text-blue-500" />
          {label ? `${label} · ${t({ fr: "démo", en: "demo" })}` : t({ fr: "Vidéo d'exemple", en: "Example video" })}
        </span>
      </div>
    );
  }

  return (
    <div className="group relative h-full min-h-[240px] md:min-h-[330px] rounded-[12px] overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#eef4ff] via-white to-[#e9f7f5] dark:from-blue-500/[0.06] dark:via-transparent dark:to-teal-500/[0.06]">
      <div className="absolute inset-1.5 rounded-[12px] border-2 border-dashed border-blue-200/70 dark:border-white/10 pointer-events-none" />
      <span className="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 dark:bg-white/10 border border-gray-200 dark:border-white/10 text-[11px] font-inter font-semibold text-gray-500 dark:text-gray-300 backdrop-blur-sm">
        <Video className="w-3.5 h-3.5 text-blue-500" />
        {label ? `${label} · ${t({ fr: "démo", en: "demo" })}` : t({ fr: "Vidéo d'exemple", en: "Example video" })}
      </span>
      <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-white dark:bg-white/10 shadow-[0_8px_28px_-8px_rgba(37,99,235,0.45)] ring-1 ring-blue-100 dark:ring-white/15 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
        <Play className="w-6 h-6 md:w-7 md:h-7 text-blue-600 dark:text-blue-400 translate-x-[2px]" fill="currentColor" />
      </div>
    </div>
  );
}
