import { forwardRef, useRef, useEffect, useLayoutEffect, useState, type ReactNode, type CSSProperties } from "react";
import { ArrowRight, Volume2, VolumeX, RotateCcw, ChevronDown } from "lucide-react";
import { AnimatedHeroTitle } from "./ui/animated-hero";
import { useMotionValue, useTransform, motion, type MotionValue } from "framer-motion";
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

/* ── CSS ─────────────────────────────────────────────────────── */
const heroCSS = `
@keyframes heroFadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
.hero-stagger { opacity: 0; }
.hero-ready .hero-stagger {
  animation: heroFadeUp 0.9s cubic-bezier(.22,1,.36,1) forwards;
}
.hero-d1 { animation-delay:  60ms; }
.hero-d2 { animation-delay: 180ms; }
.hero-d3 { animation-delay: 310ms; }
.hero-d4 { animation-delay: 440ms; }
.hero-d5 { animation-delay: 570ms; }

@media (prefers-reduced-motion: reduce) {
  .hero-stagger { animation: none !important; opacity: 1 !important; }
  .reveal        { opacity: 1 !important; transform: none !important; }
}

.reveal {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 800ms cubic-bezier(.22,1,.36,1),
              transform 800ms cubic-bezier(.22,1,.36,1);
}
.reveal.visible { opacity: 1; transform: translateY(0); }

/* Browser chrome frame */
.browser-frame {
  background: #f0f0f0;
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 16px;
  box-shadow:
    0 24px 80px rgba(0,0,0,0.10),
    0 8px 24px rgba(0,0,0,0.05),
    0 0 0 1px rgba(0,0,0,0.04);
  overflow: hidden;
}
.browser-chrome {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(0,0,0,0.07);
}
.browser-dots  { display: flex; gap: 6px; flex-shrink: 0; }
.browser-dot   { width: 11px; height: 11px; border-radius: 50%; }
.browser-dot-red   { background: #ff5f57; }
.browser-dot-amber { background: #febc2e; }
.browser-dot-green { background: #28c840; }
/* Living background for the scroll-reveal section — a slow drifting
   blue/teal glow so the white space isn't dead behind the phrases. */
@keyframes revealAuroraDrift {
  0%   { transform: translate3d(-3%, -2%, 0) scale(1);    opacity: 0.8; }
  50%  { transform: translate3d(3%, 2%, 0)  scale(1.08);  opacity: 1;   }
  100% { transform: translate3d(-3%, -2%, 0) scale(1);    opacity: 0.8; }
}
.reveal-aurora { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.reveal-aurora::before {
  content: "";
  position: absolute;
  inset: -25%;
  background:
    radial-gradient(38% 38% at 32% 36%, rgba(59,130,246,0.20), transparent 70%),
    radial-gradient(42% 42% at 68% 64%, rgba(13,148,136,0.20), transparent 70%);
  animation: revealAuroraDrift 16s ease-in-out infinite;
  will-change: transform, opacity;
}
.dark .reveal-aurora::before {
  background:
    radial-gradient(38% 38% at 32% 36%, rgba(59,130,246,0.28), transparent 70%),
    radial-gradient(42% 42% at 68% 64%, rgba(45,212,191,0.26), transparent 70%);
}
@media (prefers-reduced-motion: reduce) {
  .reveal-aurora::before { animation: none; }
}

.browser-urlbar {
  flex: 1;
  height: 24px;
  background: white;
  border-radius: 6px;
  border: 1px solid rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #9ca3af;
  font-family: Inter, sans-serif;
  max-width: 240px;
  margin: 0 auto;
}
`;

/* ── Types ───────────────────────────────────────────────────── */
interface HeroProps {
  theme: "light" | "dark";
  scrollToSection: (id: string) => void;
  openBooking: () => void;
}

/* Retourne l'offsetTop absolu sans inclure les CSS transforms */
function getPageOffsetTop(el: HTMLElement): number {
  let top = 0;
  let cur: HTMLElement | null = el;
  while (cur) { top += cur.offsetTop; cur = cur.offsetParent as HTMLElement | null; }
  return top;
}

/* ── Component ───────────────────────────────────────────────── */
const Hero = forwardRef<HTMLElement, HeroProps>(
  ({ scrollToSection, openBooking }, ref) => {
    const { t } = useLang();

    /* ── Mount animation ── */
    const [heroReady, setHeroReady] = useState(false);
    useEffect(() => { requestAnimationFrame(() => setHeroReady(true)); }, []);

    /* ────────────────────────────────────────────────────────────── *
     *  Hero video — autoplay with user controls
     *  ──────────────────────────────────────────────────────────── *
     *  We try to autoplay WITH sound first. If the browser blocks it
     *  (most cases, due to autoplay policy), we fall back to muted
     *  and update the UI so the top-right button reflects the state.
     *  Two gates can pause the video:
     *    • isVisible        — is the video ≥30% in viewport?
     *    • isManuallyPaused — did the user click to pause? */
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isManuallyPaused, setIsManuallyPaused] = useState(false);
    // The video plays once (no loop). When it finishes we surface a replay
    // button instead of looping it back automatically.
    const [hasEnded, setHasEnded] = useState(false);

    // Track visibility
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;
      const observer = new IntersectionObserver(
        ([entry]) =>
          setIsVisible(entry.isIntersecting && entry.intersectionRatio >= 0.3),
        { threshold: [0, 0.3, 0.6, 1] },
      );
      observer.observe(video);
      return () => observer.disconnect();
    }, []);

    // Coordination — try to autoplay with sound. If the browser
    // blocks it, fall back to muted and sync the UI state.
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const shouldPlay = isVisible && !isManuallyPaused && !hasEnded;

      if (shouldPlay && video.paused) {
        video.muted = isMuted;
        video.play().catch(() => {
          // Autoplay-with-sound blocked → retry muted
          if (!video.muted) {
            video.muted = true;
            setIsMuted(true);
            video.play().catch(() => {});
          }
        });
      } else if (!shouldPlay && !video.paused) {
        video.pause();
      }
    // isMuted is intentionally excluded — toggleMute handles user-driven
    // mute changes directly on the element (no re-render needed).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVisible, isManuallyPaused, hasEnded]);

    // Restart the video from the beginning (used by the replay button and by
    // clicking the video once it has finished).
    const replay = () => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = 0;
      setHasEnded(false);
      setIsManuallyPaused(false);
      video.play().catch(() => {});
    };

    const togglePlayPause = () => {
      const video = videoRef.current;
      if (!video) return;
      if (video.ended || hasEnded) {
        replay();
        return;
      }
      if (video.paused) {
        setIsManuallyPaused(false);
        video.play().catch(() => {});
      } else {
        setIsManuallyPaused(true);
        video.pause();
      }
    };

    const toggleMute = () => {
      const video = videoRef.current;
      if (!video) return;
      const next = !video.muted;
      video.muted = next;
      setIsMuted(next);
    };

    /* ── Text scroll-lock ── */
    const revealProgress        = useMotionValue(0);
    const lockRef               = useRef<HTMLDivElement>(null);
    const isLockedRef           = useRef(false);
    /* State mirror of isLockedRef — drives the on-screen "keep scrolling" hint
       so the user understands the brief scroll capture is intentional. */
    const [isLocked, setIsLocked] = useState(false);
    /* Once the reveal animation has fully played, we collapse the (now empty)
       scroll-lock section to height 0. Otherwise, scrolling back up shows a
       tall blank gap with the aurora glow between the hero video and the
       #features "Découvrez Ora." heading. */
    const [textDone, setTextDone] = useState(false);
    const hasTextCompletedRef   = useRef(false);
    /* overlay fixe pour la sortie du texte */
    const exitScrollStartRef    = useRef<number | null>(null);
    const exitScrollTargetRef   = useRef<number | null>(null);
    const l3Ref         = useRef<HTMLParagraphElement>(null);
    const overlayRef    = useRef<HTMLDivElement>(null);
    const overlayStartY = useRef(0);
    const overlayEndY   = useRef(0);
    const overlayActive = useRef(false);

    /* Line reveal — diaporama : chaque phrase entre PUIS sort (fade + slide)
       avant que la suivante n'arrive. Les trois sont superposées au centre,
       donc une seule est visible à la fois (plus d'empilement).
         • Ligne 1 : visible ~0.07 → 0.18, sort 0.18 → 0.25
         • Ligne 2 : entre 0.27 → 0.34, sort 0.45 → 0.52
         • Ligne 3 : entre 0.54 → 0.62, grandit, puis l'overlay prend le relais
       Le "vol" de "Meet Ora." vers le titre Features démarre à EXIT_START (0.72). */
    /* Lignes 1 & 2 : révélation mot par mot (voir <RevealLine>). Les fenêtres
       [in0, in1, out0, out1] ne se chevauchent pas → une phrase à la fois. */
    const LINE1_RANGE: [number, number, number, number] = [0.02, 0.22, 0.26, 0.32];
    const LINE2_RANGE: [number, number, number, number] = [0.34, 0.50, 0.52, 0.58];

    /* fade-in 0.54→0.62, immediate fade-out 0.72→0.73 (overlay takes over) */
    const l3o = useTransform(revealProgress, [0.54, 0.62, 0.72, 0.73], [0, 1, 1, 0]);
    const l3Blur = useTransform(revealProgress, [0.54, 0.62], [12, 0]);
    const l3Filter = useTransform(l3Blur, (b) => `blur(${b}px)`);

    /* "Meet Ora." : grows → hits peak by EXIT_START (0.72) → overlay flies */
    const l3Size    = useTransform(revealProgress, [0.56, 0.72], ["2.25rem", "3.75rem"]);
    const l3Leading = useTransform(revealProgress, [0.56, 0.72], [1.5, 1.12]);
    const l3Track   = useTransform(revealProgress, [0.56, 0.72], ["-0.025em", "-0.04em"]);
    /* slide-in uniquement — la sortie est gérée par l'overlay fixe */
    const l3TotalY = useTransform(revealProgress, [0.54, 0.62], [28, 0]);

    /* ─────────────────────────────────────────────────────────── *
     *  IntersectionObserver — text scroll-lock section            *
     * ─────────────────────────────────────────────────────────── */
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
            /* Recale la section pile en haut du viewport. Le seuil 0.9 fige le
               scroll avec la section ~10% trop basse, ce qui décentre la phrase
               (visible maintenant qu'une seule ligne est centrée à la fois). */
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

    /* ─────────────────────────────────────────────────────────── *
     *  Wheel + touch handlers — text reveal only                  *
     *                                                              *
     *  The video preview no longer snap-locks. Scrolling past it  *
     *  is completely free. The only scroll-lock left drives the   *
     *  text reveal section ("Votre temps est votre actif…").      *
     * ─────────────────────────────────────────────────────────── */
    useEffect(() => {
      const SPEED      = 4800;
      const EXIT_START = 0.72;
      const EXIT_BOOST = 2;
      /* Lerp factor per frame — smooths the discrete wheel/touch input into
         a continuous, jank-free motion (lower = smoother, higher = snappier). */
      const EASE       = 0.18;
      /* Below this gap we snap to target and stop the rAF loop. */
      const EPS        = 0.0008;

      const unlockText = () => {
        isLockedRef.current = false;
        setIsLocked(false);
        (window as any).__lenis?.start();
      };
      /* Nettoie l'overlay et réinitialise les refs d'exit */
      const cleanupExit = () => {
        if (overlayRef.current) overlayRef.current.style.display = "none";
        overlayActive.current       = false;
        exitScrollStartRef.current  = null;
        exitScrollTargetRef.current = null;
        document.body.classList.remove("hero-text-exiting");
      };

      /* Applies a concrete progress value: drives the MotionValue and, in the
         exit phase, moves the viewport + overlay. Called AT MOST once per frame
         from the rAF tick, so font-size / scrollTo writes never stack up within
         a single frame (the root cause of the previous stutter). */
      const applyProgress = (next: number) => {
        /* ── Phase de sortie (>0.55) : overlay fixe + scroll viewport ── */
        if (next > EXIT_START) {
          /* Initialisation : une seule fois au début de la phase */
          if (exitScrollStartRef.current === null) {
            exitScrollStartRef.current = window.scrollY;

            const featuresEl = document.getElementById("features");
            const h2El = document.querySelector<HTMLElement>("#features .features-heading h2");

            if (featuresEl) {
              exitScrollTargetRef.current =
                featuresEl.getBoundingClientRect().top + window.scrollY;
            }

            /* Position écran du texte animé au moment du déclenchement */
            const l3El = l3Ref.current;
            if (l3El && h2El && overlayRef.current && exitScrollTargetRef.current !== null) {
              const rect = l3El.getBoundingClientRect();
              overlayStartY.current = rect.top;
              /* Position layout du H2 (sans transforms FadeInOnScroll) */
              overlayEndY.current   = getPageOffsetTop(h2El) - exitScrollTargetRef.current;

              const cs = window.getComputedStyle(l3El);
              const ov = overlayRef.current;
              ov.style.top           = `${overlayStartY.current}px`;
              ov.style.fontSize      = cs.fontSize;
              ov.style.lineHeight    = cs.lineHeight;
              ov.style.letterSpacing = cs.letterSpacing;
              ov.style.display       = "block";
              overlayActive.current  = true;
            }

            document.body.classList.add("hero-text-exiting");
          }

          const ratio = Math.min(Math.max((next - EXIT_START) / (1.0 - EXIT_START), 0), 1);

          /* Scroll viewport vers #features */
          if (exitScrollStartRef.current !== null && exitScrollTargetRef.current !== null) {
            window.scrollTo({
              top: exitScrollStartRef.current +
                (exitScrollTargetRef.current - exitScrollStartRef.current) * ratio,
              behavior: "instant" as ScrollBehavior,
            });
          }

          /* Déplace l'overlay fixe. l3Size atteint 3.75rem à EXIT_START,
             donc à l'entrée de l'overlay la taille est déjà au max. */
          if (overlayRef.current && overlayActive.current) {
            const ov = overlayRef.current;
            ov.style.top = `${overlayStartY.current + (overlayEndY.current - overlayStartY.current) * ratio}px`;
            ov.style.fontSize = "3.75rem";
          }
        } else if (overlayActive.current) {
          /* On est repassé SOUS le seuil de sortie (l'utilisateur remonte) :
             on masque l'overlay volant et on réinitialise la phase de sortie.
             Sans ça, l'overlay fixe "Découvrez Ora." resterait affiché en même
             temps que le texte en flux du même contenu → effet de dédoublement. */
          cleanupExit();
        }

        if (next >= 1) {
          revealProgress.set(1);
          hasTextCompletedRef.current = true;
          /* Snap final sur #features */
          if (exitScrollTargetRef.current !== null) {
            window.scrollTo({ top: exitScrollTargetRef.current, behavior: "instant" as ScrollBehavior });
          }
          /* IMPORTANT: no cleanupExit() here. The fixed overlay must keep
             covering the heading spot while the empty reveal section
             collapses and the scroll re-anchors (next React commit), and
             while the real heading's FadeInOnScroll finishes. Hiding the
             overlay now produced 1-2 frames where NEITHER the overlay NOR
             the real heading was visible — the "phrase blinks" bug. The
             textDone layout effect performs the seamless handoff. */
          unlockText();
          setTextDone(true);
          return;
        }

        if (next <= 0) {
          cleanupExit();
          revealProgress.set(0);
          unlockText();
          return;
        }

        revealProgress.set(next);
      };

      /* Target progress fed by raw input; the rAF loop eases current → target. */
      let target = revealProgress.get();
      let rafId  = 0;
      let running = false;

      const tick = () => {
        const current = revealProgress.get();
        const diff = target - current;
        let next: number;
        if (Math.abs(diff) <= EPS) {
          next = target;                 // settle exactly
        } else {
          next = current + diff * EASE;   // ease toward target
        }
        applyProgress(next);

        // Keep ticking while still locked and not yet settled.
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
        // Boost the exit phase so the descent stays brisk.
        const boost = revealProgress.get() >= EXIT_START ? EXIT_BOOST : 1;
        target = Math.min(Math.max(target + rawDelta * boost, 0), 1);
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

      window.addEventListener("wheel",      handleWheel,      { passive: false });
      window.addEventListener("touchstart", handleTouchStart, { passive: true  });
      window.addEventListener("touchmove",  handleTouchMove,  { passive: false });
      return () => {
        if (rafId) cancelAnimationFrame(rafId);
        window.removeEventListener("wheel",      handleWheel);
        window.removeEventListener("touchstart", handleTouchStart);
        window.removeEventListener("touchmove",  handleTouchMove);
      };
    }, [revealProgress]);

    /* When the reveal section collapses (textDone → true), the layout above
       #features shrinks by ~100vh. Re-anchor the scroll onto #features in the
       same frame (before paint) so the viewport stays put — no jump.

       Then hand off from the fixed overlay to the real heading WITHOUT any
       blink: the real heading fades in (FadeInOnScroll) UNDER the overlay,
       which sits at the exact same position with identical typography. Only
       once the heading is fully opaque do we hide the overlay. */
    useLayoutEffect(() => {
      if (!textDone) return;
      const featuresEl = document.getElementById("features");
      if (featuresEl) {
        const target = featuresEl.getBoundingClientRect().top + window.scrollY;
        const lenis = (window as any).__lenis;
        if (lenis) lenis.scrollTo(target, { immediate: true, force: true });
        else window.scrollTo(0, target);
      }

      const release = () => {
        if (overlayRef.current) overlayRef.current.style.display = "none";
        overlayActive.current = false;
        exitScrollStartRef.current = null;
        exitScrollTargetRef.current = null;
      };

      /* Un-hide .features-heading now (the overlay still covers the spot). */
      document.body.classList.remove("hero-text-exiting");

      const h2 = document.querySelector<HTMLElement>(
        "#features .features-heading h2",
      );
      /* FadeInOnScroll wraps the h2 — wait for ITS opacity to reach 1. */
      const fadeWrapper = h2?.parentElement ?? null;
      const started = performance.now();
      let raf = 0;
      const waitForHeading = () => {
        const opaque = fadeWrapper
          ? parseFloat(getComputedStyle(fadeWrapper).opacity) >= 0.99
          : true;
        /* 1.2s cap — never leave the overlay stuck if the fade never fires. */
        if (opaque || performance.now() - started > 1200) release();
        else raf = requestAnimationFrame(waitForHeading);
      };
      raf = requestAnimationFrame(waitForHeading);
      return () => cancelAnimationFrame(raf);
    }, [textDone]);

    /* ══════════════════════════════════════════════════════════ */
    return (
      <>
        <style>{heroCSS}</style>

        <section
          ref={ref}
          id="hero"
          className={`relative${heroReady ? " hero-ready" : ""}`}
        >
          {/* Background blobs — overflow-hidden ici pour clipper les cercles hors-section */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
            <div className="absolute inset-0 bg-white dark:bg-[#111827]" />
            <div className="absolute -top-32 -right-32 w-[700px] h-[700px] rounded-full"
              style={{ background: "radial-gradient(circle,rgba(59,130,246,0.07) 0%,transparent 65%)", filter: "blur(60px)" }} />
            <div className="absolute top-1/2 -left-20 w-[600px] h-[600px] rounded-full"
              style={{ background: "radial-gradient(circle,rgba(13,148,136,0.06) 0%,transparent 60%)", filter: "blur(60px)" }} />
          </div>

          {/* ═══ SECTION 1 — above the fold ═══ */}
          <div className="relative z-10 pt-28 md:pt-32 lg:pt-36 pb-16 md:pb-24">
            <div className="max-w-5xl mx-auto px-6 lg:px-10 text-center">

              <AnimatedHeroTitle />

              <p className="hero-stagger hero-d2 mt-6 text-[clamp(1rem,2vw,1.175rem)] leading-[1.75] text-gray-500 dark:text-gray-400 font-inter max-w-2xl mx-auto">
                {t({
                  fr: "Ora crée des automatisations sur-mesure pour traiter vos données, afin que votre équipe se concentre sur ce qui compte vraiment.",
                  en: "Ora builds tailored automations that handle your data, so your team can focus on what actually matters.",
                })}
              </p>

              <div className="hero-stagger hero-d3 mt-9 flex flex-wrap items-center justify-center gap-3.5">
                <button
                  onClick={openBooking}
                  className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold font-inter text-white bg-[#3b82f6] hover:bg-[#2563eb] shadow-[0_2px_12px_rgba(59,130,246,0.30)] hover:shadow-[0_4px_24px_rgba(59,130,246,0.40)] hover:-translate-y-px active:translate-y-0 transition-all duration-150"
                >
                  {t({ fr: "Réserver un appel", en: "Book a call" })}
                  <ArrowRight className="w-4 h-4 opacity-80 group-hover:translate-x-[3px] transition-transform duration-150" />
                </button>
                <button
                  onClick={() => scrollToSection("demo-preview")}
                  className="inline-flex items-center px-7 py-3.5 rounded-full text-[15px] font-semibold font-inter border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:bg-[#3b82f6] hover:text-white hover:border-[#3b82f6] dark:hover:bg-[#3b82f6] dark:hover:text-white dark:hover:border-[#3b82f6] shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-150"
                >
                  {t({ fr: "Voir la démo", en: "Watch the demo" })}
                </button>
              </div>
            </div>

            {/* ── Browser frame ──────────────────────────────────
                Autoplays muted, plays once (no loop), no scroll lock.
                When it finishes, a replay button appears. The user can
                scroll past freely. The "Voir la démo" button above
                just smooth-scrolls to this section.               */}
            <div
              id="demo-preview"
              className="hero-stagger hero-d4 relative z-10 mt-10 mx-auto max-w-7xl px-3 sm:px-6 lg:px-10"
            >
              {/* Browser frame — clean visible chrome. The video area is
                  covered by a white overlay until the user scrolls; when
                  they do, the overlay slides upward and fades out while
                  the video gently rises into view + starts playing. */}
              <div className="browser-frame">
                <div className="browser-chrome">
                  <div className="browser-dots">
                    <div className="browser-dot browser-dot-red" />
                    <div className="browser-dot browser-dot-amber" />
                    <div className="browser-dot browser-dot-green" />
                  </div>
                  <div className="browser-urlbar">ora-solution.com</div>
                  <div style={{ width: 56 }} />
                </div>

                <div className="relative overflow-hidden">
                  <video
                    ref={videoRef}
                    src="/ora-1.mp4"
                    muted={isMuted}
                    playsInline
                    preload="auto"
                    onClick={togglePlayPause}
                    onEnded={() => setHasEnded(true)}
                    className="w-full aspect-[16/9] object-cover block cursor-pointer"
                    onLoadedMetadata={(e) => {
                      e.currentTarget.playbackRate = 1.0;
                      // Pre-seek so the first frame is ready the instant the
                      // white overlay clears (no flash of black).
                      e.currentTarget.currentTime = 0.1;
                    }}
                  />

                  {/* Mute / unmute toggle — top right (hidden once ended) */}
                  {!hasEnded && (
                    <button
                      type="button"
                      onClick={toggleMute}
                      aria-label={isMuted ? t({ fr: "Activer le son", en: "Unmute" }) : t({ fr: "Couper le son", en: "Mute" })}
                      aria-pressed={!isMuted}
                      className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/55 backdrop-blur-md text-white flex items-center justify-center shadow-lg ring-1 ring-white/15 hover:bg-black/75 hover:ring-white/30 transition-all duration-150"
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  {/* Replay overlay — shown when the video has played through.
                      No auto-loop: the user explicitly chooses to replay. */}
                  {hasEnded && (
                    <button
                      type="button"
                      onClick={replay}
                      aria-label={t({ fr: "Revoir la vidéo", en: "Replay the video" })}
                      className="absolute inset-0 z-10 flex items-center justify-center bg-black/35 backdrop-blur-[1px] transition-opacity duration-200"
                    >
                      <span className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-black/65 text-white text-[15px] font-semibold font-inter shadow-lg ring-1 ring-white/20 hover:bg-black/80 transition-all duration-150">
                        <RotateCcw className="w-4 h-4" />
                        {t({ fr: "Revoir la vidéo", en: "Replay" })}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Logos slider — masqué en V1, à réactiver avec les premiers clients ── */}
          {/* <div className="hero-stagger hero-d5 mx-auto max-w-6xl px-6 lg:px-10">
            <LogosSlider />
          </div> */}

          {/* ═══ SECTION 2A — texte piloté par scroll-lock ═══ */}
          <div
            ref={lockRef}
            className={`relative z-[20] flex items-center justify-center bg-white dark:bg-[#111827] overflow-hidden ${
              textDone ? "h-0 min-h-0 pointer-events-none" : "min-h-screen"
            }`}
          >
            {/* Fond vivant : halo bleu/teal qui dérive lentement (casse le vide) */}
            <div className="reveal-aurora" aria-hidden />

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

              {/* Ligne 3 — grandit puis l'overlay fixe prend le relais pour rejoindre le H2.
                  Le <p> reste inline-block (tight) pour que le calcul de vol soit exact. */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                style={{ opacity: l3o, y: l3TotalY, filter: l3Filter }}
              >
                <motion.p
                  ref={l3Ref}
                  className="inline-block font-poppins font-normal whitespace-nowrap"
                  style={{ fontSize: l3Size, lineHeight: l3Leading, letterSpacing: l3Track }}
                >
                  <span className="text-[#111827] dark:text-white">{t({ fr: "Découvrez ", en: "Meet " })}</span>
                  <span className="text-brand-gradient">Ora.</span>
                </motion.p>
              </motion.div>

            </div>
          </div>

        </section>

        {/* ── Indication de scroll pendant le verrouillage du texte ──────────
            Pendant la révélation pilotée par scroll, la page capte brièvement
            la molette. Ce repère discret (chevron qui rebondit + libellé) montre
            que le défilement n'est pas bloqué : il suffit de continuer. */}
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

        {/* ── Overlay fixe : "Découvrez Ora." en vol vers le titre de #features ── */}
        <div
          ref={overlayRef}
          className="fixed left-1/2 z-[200] pointer-events-none font-poppins font-normal"
          style={{
            display: "none",
            transform: "translateX(-50%)",
            letterSpacing: "-0.04em",
            lineHeight: 1.12,
            whiteSpace: "nowrap",
          }}
        >
          <span className="text-[#111827] dark:text-white">{t({ fr: "Découvrez ", en: "Meet " })}</span>
          <span className="text-brand-gradient">Ora.</span>
        </div>

      </>
    );
  },
);

Hero.displayName = "Hero";
export default Hero;
