import { useRef, useEffect, useState, type ReactNode, type CSSProperties } from "react";
import { useMotionValue, useTransform, motion, type MotionValue } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLang } from "@/lib/i18n";

/* ── Bending-Spoons-style accumulating scroll-reveal ─────────────
 *  One big paragraph whose words cascade in (blur + slide up), staggered,
 *  as the user scrolls — and STAY on screen once revealed (they accumulate
 *  and fill several lines, exactly like bendingspoons.com). Driven by the
 *  shared `progress` MotionValue so it stays in lockstep with the scroll-lock.
 *  A keyword can be highlighted (brand blue) via `gradientWords`. */
function RevealWord({
  progress, inStart, inEnd, isGradient, children,
}: {
  progress: MotionValue<number>;
  inStart: number; inEnd: number;
  isGradient: boolean; children: ReactNode;
}) {
  // useTransform clamps by default: once past inEnd the word stays at opacity 1
  // (no fade-out) — this is what makes the paragraph accumulate.
  const opacity = useTransform(progress, [inStart, inEnd], [0, 1]);
  const y       = useTransform(progress, [inStart, inEnd], [18, 0]);
  const blurPx  = useTransform(progress, [inStart, inEnd], [8, 0]);
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

function RevealParagraph({
  progress, revealSpan, text, gradientWords = [], className, style,
}: {
  progress: MotionValue<number>;
  revealSpan: [number, number]; // [start, end] of scroll progress to reveal across
  text: string;
  gradientWords?: string[];
  className?: string;
  style?: CSSProperties;
}) {
  const words = text.split(" ");
  const total = words.length;
  const [start, end] = revealSpan;
  const span = end - start;
  // Evenly spaced word starts; each word's fade spans ~2.5 slots so 2-3 words
  // are in transition at any moment (crisp "word by word" like Bending Spoons).
  const step = total > 0 ? span / total : span;
  const per = Math.min(step * 2.5, span);
  const grad = gradientWords.map((g) => g.toLowerCase());
  return (
    <p className={className} style={style}>
      {words.map((w, i) => {
        const wInStart = start + i * step;
        const clean = w.replace(/[.,;:!?]/g, "").toLowerCase();
        return (
          <RevealWord
            key={i}
            progress={progress}
            inStart={wInStart}
            inEnd={wInStart + per}
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
  /* Very faint blue only — no green/teal. Kept low so it reads as a subtle
     bluish depth on the black, never a coloured glow. */
  background:
    radial-gradient(40% 40% at 38% 38%, rgba(59,130,246,0.09), transparent 72%),
    radial-gradient(40% 40% at 64% 62%, rgba(59,130,246,0.06), transparent 74%);
  animation: excelAuroraDrift 16s ease-in-out infinite;
  will-change: transform, opacity;
}
.dark .excel-aurora::before {
  background:
    radial-gradient(40% 40% at 38% 38%, rgba(59,130,246,0.11), transparent 72%),
    radial-gradient(40% 40% at 64% 62%, rgba(59,130,246,0.07), transparent 74%);
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

  /* One accumulating paragraph (Bending-Spoons style): all words reveal across
     the scroll and stay on screen. Reveal happens over [0, 0.92]; the last ~8%
     is a hold before the lock releases and the demo panel rises over it. */
  const REVEAL_SPAN: [number, number] = [0, 0.92];

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

  /* (Nav banner colour handoff removed: the section now runs on the site's
     light/dark background, so the nav keeps its normal theme-aware look.) */

  /* ── Wheel + touch handlers drive the reveal while locked ── */
  useEffect(() => {
    /* Higher SPEED = each wheel/touch delta advances the reveal LESS. 4200
       keeps the word-by-word reveal clearly visible while shortening the
       whole sequence (the user found 5200 dragged on too long). */
    const SPEED = 4200;
    /* Lerp factor per frame — smooths discrete wheel/touch input into a
       continuous, jank-free motion (lower = smoother, higher = snappier). */
    const EASE = 0.19;
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

      {/* `sticky top-0` : une fois le texte terminé, la section reste épinglée
          en haut du viewport pendant que la section Atlas (z supérieur) monte
          par-dessus, effet rideau. Le pin est borné par le wrapper commun
          ExcelReveal + AtlasShowcase dans App.tsx. */}
      <section
        id="excel-reveal"
        ref={lockRef}
        className="sticky top-0 z-[10] hidden md:flex items-center bg-white dark:bg-black overflow-hidden min-h-screen"
      >
        {/* Fond vivant : halo bleu/teal qui dérive lentement (casse le vide) */}
        <div className="excel-aurora" aria-hidden />

        {/* Un seul paragraphe aligné à gauche : les mots apparaissent au scroll
            et RESTENT, remplissant plusieurs lignes — exactement comme
            bendingspoons.com. */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-8 lg:px-16">
          <RevealParagraph
            progress={revealProgress}
            revealSpan={REVEAL_SPAN}
            className="font-instrument font-medium text-[#111827] dark:text-white text-center"
            style={{ fontSize: "clamp(1.9rem, 4vw, 3.7rem)", lineHeight: 1.16, letterSpacing: "-0.03em" }}
            gradientWords={["temps", "time", "Excel", "Ora"]}
            text={t({
              fr: "Votre temps est votre actif le plus précieux. Cessez de gaspiller des heures sur des tâches répétitives à faible valeur ajoutée, sur Excel. Découvrez Ora.",
              en: "Your time is your most valuable asset. Stop wasting hours on repetitive, low-value tasks in Excel. Meet Ora.",
            })}
          />
        </div>
      </section>

      {/* ── Indication de scroll pendant le verrouillage du texte ── */}
      {isLocked && (
        <motion.div
          className="fixed bottom-12 inset-x-0 mx-auto w-fit z-[60] flex flex-col items-center gap-1.5 pointer-events-none text-center"
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
