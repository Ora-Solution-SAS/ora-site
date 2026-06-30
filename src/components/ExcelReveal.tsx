import { useRef, useEffect, useState, type ReactNode, type CSSProperties } from "react";
import { useMotionValue, useTransform, motion, type MotionValue } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLang } from "@/lib/i18n";

/* ── Word-by-word scroll-reveal ──────────────────────────────────
 *  A line whose words cascade in (blur + slide up), staggered, while
 *  the user scrolls. Driven by the shared `progress` MotionValue so it
 *  stays in lockstep with the scroll-lock. `range` = [in0, in1, out0, out1]:
 *  words fade IN staggered across [in0, in1], then the whole line fades
 *  OUT together across [out0, out1]. A keyword can be highlighted with the
 *  brand gradient by matching its text in `gradientWords`. */
function RevealWord({
  progress, inStart, inEnd, outStart, outEnd, isGradient, children,
}: {
  progress: MotionValue<number>;
  inStart: number; inEnd: number; outStart: number; outEnd: number;
  isGradient: boolean; children: ReactNode;
}) {
  const opacity = useTransform(progress, [inStart, inEnd, outStart, outEnd], [0, 1, 1, 0]);
  const y       = useTransform(progress, [inStart, inEnd], [26, 0]);
  const blurPx  = useTransform(progress, [inStart, inEnd], [12, 0]);
  const filter  = useTransform(blurPx, (b) => `blur(${b}px)`);
  return (
    <motion.span
      className={`inline-block ${isGradient ? "text-brand-gradient" : ""}`}
      style={{ opacity, y, filter, marginRight: "0.28em", willChange: "transform, opacity, filter" }}
    >
      {children}
    </motion.span>
  );
}

function RevealLine({
  progress, range, text, gradientWords = [], className, style,
}: {
  progress: MotionValue<number>;
  range: [number, number, number, number];
  text: string;
  gradientWords?: string[];
  className?: string;
  style?: CSSProperties;
}) {
  const words = text.split(" ");
  const [inS, inE, outS, outE] = range;
  const span = inE - inS;
  const total = words.length;
  /* Each word's fade-in occupies a sub-window; windows overlap so the
     cascade flows rather than stepping word-by-word. */
  const per  = span * 0.55;
  const step = total > 1 ? (span - per) / (total - 1) : 0;
  const grad = gradientWords.map((g) => g.toLowerCase());
  return (
    <p className={className} style={style}>
      {words.map((w, i) => {
        const wInStart = inS + i * step;
        const clean = w.replace(/[.,;:!?]/g, "").toLowerCase();
        return (
          <RevealWord
            key={i}
            progress={progress}
            inStart={wInStart}
            inEnd={wInStart + per}
            outStart={outS}
            outEnd={outE}
            isGradient={grad.includes(clean)}
          >
            {w}
          </RevealWord>
        );
      })}
    </p>
  );
}

/* Living background — a slow drifting blue/teal glow so the space behind
   the phrases isn't dead. */
const auroraCSS = `
@keyframes excelAuroraDrift {
  0%   { transform: translate3d(-3%, -2%, 0) scale(1);    opacity: 0.8; }
  50%  { transform: translate3d(3%, 2%, 0)  scale(1.08);  opacity: 1;   }
  100% { transform: translate3d(-3%, -2%, 0) scale(1);    opacity: 0.8; }
}
.excel-aurora {
  position: absolute; inset: 0; overflow: hidden; pointer-events: none;
  /* Fade the glow out at the top/bottom edges so it blends seamlessly into the
     white sections above and below (no hard demarcation line). */
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 22%, #000 78%, transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0%, #000 22%, #000 78%, transparent 100%);
}
.excel-aurora::before {
  content: "";
  position: absolute;
  inset: -25%;
  background:
    radial-gradient(38% 38% at 32% 36%, rgba(59,130,246,0.20), transparent 70%),
    radial-gradient(42% 42% at 68% 64%, rgba(13,148,136,0.20), transparent 70%);
  animation: excelAuroraDrift 16s ease-in-out infinite;
  will-change: transform, opacity;
}
.dark .excel-aurora::before {
  background:
    radial-gradient(38% 38% at 32% 36%, rgba(59,130,246,0.28), transparent 70%),
    radial-gradient(42% 42% at 68% 64%, rgba(45,212,191,0.26), transparent 70%);
}
@media (prefers-reduced-motion: reduce) {
  .excel-aurora::before { animation: none; }
}
`;

/* ── Scroll-lock reveal section ──────────────────────────────────
 *  Faithful copy of the original Hero reveal, now standalone between
 *  Features and Atlas. When the section enters the viewport the page
 *  scroll is locked; the wheel/touch then scrubs the three phrases —
 *  each appears word by word, holds, then leaves before the next.
 *  Once the third phrase ("Découvrez Ora.") is fully shown the scroll
 *  unlocks and the page continues into Atlas. (The old "fly into the
 *  Features heading" handoff is dropped — there is no target here.) */
export default function ExcelReveal() {
  const { t } = useLang();

  const revealProgress = useMotionValue(0);
  const lockRef = useRef<HTMLDivElement>(null);
  const isLockedRef = useRef(false);
  /* State mirror of isLockedRef — drives the on-screen "keep scrolling" hint. */
  const [isLocked, setIsLocked] = useState(false);
  const hasTextCompletedRef = useRef(false);

  /* Diaporama : chaque phrase entre PUIS sort avant que la suivante n'arrive.
     Les fenêtres [in0, in1, out0, out1] ne se chevauchent pas → une à la fois. */
  const LINE1_RANGE: [number, number, number, number] = [0.02, 0.22, 0.26, 0.32];
  const LINE2_RANGE: [number, number, number, number] = [0.34, 0.50, 0.52, 0.58];

  /* Ligne 3 : entre (0.56→0.66), grandit (0.62→0.96) et RESTE affichée jusqu'à
     la fin du lock. Elle ne s'efface jamais d'elle-même : à la sortie du lock,
     le scroll naturel fait monter la section Atlas par-dessus, progressivement. */
  const l3o      = useTransform(revealProgress, [0.56, 0.66], [0, 1]);
  const l3y      = useTransform(revealProgress, [0.56, 0.66], [28, 0]);
  const l3Blur   = useTransform(revealProgress, [0.56, 0.66], [12, 0]);
  const l3Filter = useTransform(l3Blur, (b) => `blur(${b}px)`);
  const l3Size    = useTransform(revealProgress, [0.62, 0.96], ["2.25rem", "3.75rem"]);
  const l3Leading = useTransform(revealProgress, [0.62, 0.96], [1.5, 1.12]);
  const l3Track   = useTransform(revealProgress, [0.62, 0.96], ["-0.025em", "-0.04em"]);

  /* ── IntersectionObserver : lock the page when the section is in view ── */
  useEffect(() => {
    const el = lockRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        // `__oraSuppressHeroLock` is set while a programmatic scroll (e.g. the
        // "Solutions" menu animated scroll) travels through this section, so
        // the lock doesn't capture it mid-flight.
        if (
          entry.isIntersecting &&
          !isLockedRef.current &&
          !hasTextCompletedRef.current &&
          !(window as any).__oraSuppressHeroLock
        ) {
          isLockedRef.current = true;
          setIsLocked(true);
          const lenis = (window as any).__lenis;
          lenis?.stop();
          /* Recale la section pile en haut du viewport. */
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
          else window.scrollTo(0, top);
        }
      },
      { threshold: 0.9 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* ── Wheel + touch handlers drive the reveal while locked ── */
  useEffect(() => {
    const SPEED = 4800;
    /* Lerp factor per frame — smooths discrete wheel/touch input into a
       continuous, jank-free motion (lower = smoother, higher = snappier). */
    const EASE = 0.18;
    /* Below this gap we snap to target and stop the rAF loop. */
    const EPS = 0.0008;

    const unlockText = () => {
      isLockedRef.current = false;
      setIsLocked(false);
      (window as any).__lenis?.start();
    };

    const applyProgress = (next: number) => {
      if (next >= 1) {
        revealProgress.set(1);
        hasTextCompletedRef.current = true;
        // On relâche simplement le lock : le scroll naturel reprend et fait
        // monter la section Atlas progressivement (pas de saut brutal).
        unlockText();
        return;
      }
      if (next <= 0) {
        revealProgress.set(0);
        unlockText();
        return;
      }
      revealProgress.set(next);
    };

    /* Target progress fed by raw input; the rAF loop eases current → target. */
    let target = revealProgress.get();
    let rafId = 0;
    let running = false;

    const tick = () => {
      const current = revealProgress.get();
      const diff = target - current;
      const next = Math.abs(diff) <= EPS ? target : current + diff * EASE;
      applyProgress(next);
      if (isLockedRef.current && Math.abs(target - revealProgress.get()) > EPS) {
        rafId = requestAnimationFrame(tick);
      } else {
        running = false;
      }
    };

    const ensureRunning = () => {
      if (hasTextCompletedRef.current) { unlockText(); return; }
      if (!running) {
        running = true;
        rafId = requestAnimationFrame(tick);
      }
    };

    const addInput = (rawDelta: number) => {
      target = Math.min(Math.max(target + rawDelta, 0), 1);
      ensureRunning();
    };

    const handleWheel = (e: WheelEvent) => {
      if (!isLockedRef.current) return;
      e.preventDefault();
      addInput(e.deltaY / SPEED);
    };

    let lastTouchY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (!isLockedRef.current) return;
      lastTouchY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!isLockedRef.current) return;
      e.preventDefault();
      const y = e.touches[0].clientY;
      addInput((lastTouchY - y) / SPEED);
      lastTouchY = y;
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [revealProgress]);

  return (
    <>
      <style>{auroraCSS}</style>

      <section
        id="excel-reveal"
        ref={lockRef}
        className="relative z-[20] flex items-center justify-center bg-white dark:bg-[#111827] overflow-hidden min-h-screen"
      >
        {/* Fond vivant : halo bleu/teal qui dérive lentement (casse le vide) */}
        <div className="excel-aurora" aria-hidden />

        {/* Les 3 lignes sont superposées (absolute inset-0) et centrées :
            une seule visible à la fois → effet diaporama, pas d'empilement. */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 lg:px-10 text-center h-[42vh] min-h-[220px] flex items-center justify-center">

          {/* Ligne 1 — révélation mot par mot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <RevealLine
              progress={revealProgress}
              range={LINE1_RANGE}
              className="font-poppins font-normal text-[#111827] dark:text-white"
              style={{ fontSize: "clamp(1.75rem, 3.2vw, 2.75rem)", lineHeight: 1.4, letterSpacing: "-0.025em" }}
              gradientWords={["temps", "time"]}
              text={t({
                fr: "Votre temps est votre actif le plus précieux.",
                en: "Your time is your most valuable asset.",
              })}
            />
          </div>

          {/* Ligne 2 — révélation mot par mot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <RevealLine
              progress={revealProgress}
              range={LINE2_RANGE}
              className="font-poppins font-normal text-[#111827] dark:text-white"
              style={{ fontSize: "clamp(1.75rem, 3.2vw, 2.75rem)", lineHeight: 1.4, letterSpacing: "-0.025em" }}
              gradientWords={["Excel"]}
              text={t({
                fr: "Cessez de le gaspiller sur Excel.",
                en: "Stop wasting it on Excel.",
              })}
            />
          </div>

          {/* Ligne 3 — grandit puis reste affichée comme conclusion. */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ opacity: l3o, y: l3y, filter: l3Filter }}
          >
            <motion.p
              className="inline-block font-poppins font-normal whitespace-nowrap"
              style={{ fontSize: l3Size, lineHeight: l3Leading, letterSpacing: l3Track }}
            >
              <span className="text-[#111827] dark:text-white">{t({ fr: "Découvrez ", en: "Meet " })}</span>
              <span className="text-brand-gradient">Ora.</span>
            </motion.p>
          </motion.div>

        </div>
      </section>

      {/* ── Indication de scroll pendant le verrouillage du texte ── */}
      {isLocked && (
        <motion.div
          className="fixed bottom-7 left-1/2 z-[60] -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="text-[12px] font-inter font-medium tracking-wide text-gray-400 dark:text-gray-500">
            {t({ fr: "Continuez à faire défiler", en: "Keep scrolling" })}
          </span>
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
