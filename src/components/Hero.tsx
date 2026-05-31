import { forwardRef, useRef, useEffect, useState } from "react";
import { ArrowRight, Volume2, VolumeX } from "lucide-react";
import { AnimatedHeroTitle } from "./ui/animated-hero";
import { useMotionValue, useTransform, motion } from "framer-motion";
import { useLang } from "@/lib/i18n";

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

      const shouldPlay = isVisible && !isManuallyPaused;

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
    }, [isVisible, isManuallyPaused]);

    const togglePlayPause = () => {
      const video = videoRef.current;
      if (!video) return;
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
    const hasTextCompletedRef   = useRef(false);
    /* overlay fixe pour la sortie du texte */
    const exitScrollStartRef    = useRef<number | null>(null);
    const exitScrollTargetRef   = useRef<number | null>(null);
    const l3Ref         = useRef<HTMLParagraphElement>(null);
    const overlayRef    = useRef<HTMLDivElement>(null);
    const overlayStartY = useRef(0);
    const overlayEndY   = useRef(0);
    const overlayActive = useRef(false);

    /* Line reveal — opacity + y.
       Adjusted timings: lines 1 & 2 reveal faster, "Découvrez Ora." appears
       earlier AND reaches peak size by 0.55. The exit phase starts
       immediately at 0.55 (no hold) so the descent feels continuous. */
    const l1o = useTransform(revealProgress, [0,    0.16], [0, 1]);
    const l1y = useTransform(revealProgress, [0,    0.16], [28, 0]);
    const l2o = useTransform(revealProgress, [0.14, 0.30], [0, 1]);
    const l2y = useTransform(revealProgress, [0.14, 0.30], [28, 0]);
    /* fade-in 0.28→0.42, immediate fade-out 0.55→0.56 (overlay takes over) */
    const l3o = useTransform(revealProgress, [0.28, 0.42, 0.55, 0.56], [0, 1, 1, 0]);

    /* "Découvrez Ora." : grows → hits peak by 0.55 → overlay descends */
    const l3Size    = useTransform(revealProgress, [0.40, 0.55], ["1.75rem", "3.75rem"]);
    const l3Leading = useTransform(revealProgress, [0.40, 0.55], [1.5, 1.12]);
    const l3Track   = useTransform(revealProgress, [0.40, 0.55], ["-0.025em", "-0.04em"]);
    /* slide-in uniquement — la sortie est gérée par l'overlay fixe */
    const l3TotalY = useTransform(revealProgress, [0.28, 0.42], [28, 0]);

    /* ─────────────────────────────────────────────────────────── *
     *  IntersectionObserver — text scroll-lock section            *
     * ─────────────────────────────────────────────────────────── */
    useEffect(() => {
      const el = lockRef.current;
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isLockedRef.current && !hasTextCompletedRef.current) {
            isLockedRef.current = true;
            (window as any).__lenis?.stop();
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
      const EXIT_START = 0.55;
      const EXIT_BOOST = 2;
      /* Lerp factor per frame — smooths the discrete wheel/touch input into
         a continuous, jank-free motion (lower = smoother, higher = snappier). */
      const EASE       = 0.18;
      /* Below this gap we snap to target and stop the rAF loop. */
      const EPS        = 0.0008;

      const unlockText = () => {
        isLockedRef.current = false;
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
        }

        if (next >= 1) {
          revealProgress.set(1);
          hasTextCompletedRef.current = true;
          /* Snap final sur #features */
          if (exitScrollTargetRef.current !== null) {
            window.scrollTo({ top: exitScrollTargetRef.current, behavior: "instant" as ScrollBehavior });
          }
          cleanupExit();
          unlockText();
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
            <div className="absolute inset-0 bg-[#fcfbf7] dark:bg-[#111827]" />
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
                  className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold font-inter text-white bg-gradient-to-r from-[#3b82f6] to-[#0d9488] shadow-[0_2px_12px_rgba(59,130,246,0.30)] hover:shadow-[0_4px_24px_rgba(59,130,246,0.40)] hover:-translate-y-px active:translate-y-0 transition-all duration-150"
                >
                  {t({ fr: "Réserver un appel", en: "Book a call" })}
                  <ArrowRight className="w-4 h-4 opacity-80 group-hover:translate-x-[3px] transition-transform duration-150" />
                </button>
                <button
                  onClick={() => scrollToSection("demo-preview")}
                  className="inline-flex items-center px-7 py-3.5 rounded-full text-[15px] font-semibold font-inter border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.06] hover:border-gray-400 dark:hover:border-white/30 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-150"
                >
                  {t({ fr: "Voir la démo", en: "Watch the demo" })}
                </button>
              </div>
            </div>

            {/* ── Browser frame ──────────────────────────────────
                Autoplays muted+loop, no scroll lock. The user can
                scroll past freely. The "Voir la démo" button above
                just smooth-scrolls to this section.               */}
            <div
              id="demo-preview"
              className="hero-stagger hero-d4 relative z-10 mt-10 mx-auto max-w-6xl px-6 lg:px-10"
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
                  <div className="browser-urlbar">app.ora.io</div>
                  <div style={{ width: 56 }} />
                </div>

                <div className="relative overflow-hidden">
                  <video
                    ref={videoRef}
                    src="/ora-1.mp4"
                    muted={isMuted}
                    loop
                    playsInline
                    preload="auto"
                    onClick={togglePlayPause}
                    className="w-full aspect-[16/9] object-cover block cursor-pointer"
                    onLoadedMetadata={(e) => {
                      e.currentTarget.playbackRate = 1.0;
                      // Pre-seek so the first frame is ready the instant the
                      // white overlay clears (no flash of black).
                      e.currentTarget.currentTime = 0.1;
                    }}
                  />

                  {/* Mute / unmute toggle — top right */}
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
            className="relative z-[20] min-h-screen flex items-center justify-center bg-[#fcfbf7] dark:bg-[#111827]"
          >
            <div className="w-full max-w-3xl mx-auto px-6 lg:px-10 text-center flex flex-col gap-7">

              {/* Ligne 1 */}
              <motion.p
                className="font-poppins font-medium text-[#111827] dark:text-white"
                style={{
                  opacity: l1o,
                  y: l1y,
                  fontSize: "clamp(1.4rem, 2.5vw, 1.85rem)",
                  lineHeight: 1.5,
                  letterSpacing: "-0.025em",
                }}
              >
                {t({
                  fr: "Votre temps est votre actif le plus précieux.",
                  en: "Your time is your most valuable asset.",
                })}
              </motion.p>

              {/* Ligne 2 */}
              <motion.p
                className="font-poppins font-medium text-[#111827] dark:text-white"
                style={{
                  opacity: l2o,
                  y: l2y,
                  fontSize: "clamp(1.4rem, 2.5vw, 1.85rem)",
                  lineHeight: 1.5,
                  letterSpacing: "-0.025em",
                }}
              >
                {t({
                  fr: "Cessez de le gaspiller sur Excel.",
                  en: "Stop wasting it on Excel.",
                })}
              </motion.p>

              {/* Ligne 3 — grandit puis l'overlay fixe prend le relais pour rejoindre le H2 */}
              <motion.p
                ref={l3Ref}
                className="font-poppins font-medium"
                style={{
                  opacity: l3o,
                  y: l3TotalY,
                  fontSize: l3Size,
                  lineHeight: l3Leading,
                  letterSpacing: l3Track,
                }}
              >
                <span className="text-[#111827] dark:text-white">{t({ fr: "Découvrez ", en: "Meet " })}</span>
                <span className="text-brand-gradient">Ora.</span>
              </motion.p>

            </div>
          </div>

        </section>

        {/* ── Overlay fixe : "Découvrez Ora." en vol vers le titre de #features ── */}
        <div
          ref={overlayRef}
          className="fixed left-1/2 z-[200] pointer-events-none font-poppins font-medium"
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
