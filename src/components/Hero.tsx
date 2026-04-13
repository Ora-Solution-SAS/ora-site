import { forwardRef, useRef, useEffect, useState, useCallback } from "react";
import { ArrowRight, Play, RefreshCw } from "lucide-react";
import { LogosSlider } from "./LogosSlider";
import { AnimatedHeroTitle } from "./ui/animated-hero";
import { LogoHourglass } from "./LogoHourglass";
import { useTransform, useMotionValue, motion } from "framer-motion";

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

/* ── Component ───────────────────────────────────────────────── */
const Hero = forwardRef<HTMLElement, HeroProps>(
  ({ scrollToSection, openBooking }, ref) => {

    /* ── Mount animation ── */
    const [heroReady, setHeroReady] = useState(false);
    useEffect(() => { requestAnimationFrame(() => setHeroReady(true)); }, []);

    /* ── Play button state ── */
    const [showPlayBtn,   setShowPlayBtn]   = useState(false);
    const [isFreePlaying, setIsFreePlaying] = useState(false); // true while free-play video is running

    /* ── Video preview refs ── */
    const videoRef           = useRef<HTMLVideoElement>(null);
    const frameRef           = useRef<HTMLDivElement>(null); // the browser frame wrapper
    const isPreviewLocked    = useRef(false);  // scroll is locked; video is playing
    const isSnappingRef      = useRef(false);  // snap animation in progress
    const hasPreviewFiredRef = useRef(false);  // snap triggered at least once (no re-trigger)
    const isFreePlayRef      = useRef(false);  // video playing via play-button (no lock)

    /* ── Hourglass scroll-lock ── */
    const revealProgress = useMotionValue(0);
    const lockRef        = useRef<HTMLDivElement>(null);
    const isLockedRef    = useRef(false);

    /* Text reveal motion values */
    const l1o  = useTransform(revealProgress, [0,    0.22], [0, 1]);
    const l1y  = useTransform(revealProgress, [0,    0.22], [24, 0]);
    const l2o  = useTransform(revealProgress, [0.20, 0.40], [0, 1]);
    const l2y  = useTransform(revealProgress, [0.20, 0.40], [24, 0]);
    const l3o  = useTransform(revealProgress, [0.38, 0.58], [0, 1]);
    const l3y  = useTransform(revealProgress, [0.38, 0.58], [24, 0]);
    const ctaO = useTransform(revealProgress, [0.60, 0.75], [0, 1]);

    /* ─────────────────────────────────────────────────────────── *
     *  unlockPreview — release video scroll-lock                  *
     *  showBtn=true  → force-skip path, reveal the play button    *
     * ─────────────────────────────────────────────────────────── */
    const unlockPreview = useCallback((showBtn = false) => {
      if (!isPreviewLocked.current) return;
      isPreviewLocked.current = false;
      isFreePlayRef.current = false;
      videoRef.current?.pause();
      (window as any).__lenis?.start();
      setIsFreePlaying(false);
      if (showBtn) setShowPlayBtn(true);
    }, []);

    /* ─────────────────────────────────────────────────────────── *
     *  handleVideoEnded — called by <video onEnded>               *
     * ─────────────────────────────────────────────────────────── */
    const handleVideoEnded = useCallback(() => {
      if (isPreviewLocked.current) {
        // Natural end of locked playback — unlock and show "Lancer" button
        unlockPreview(true);
      } else if (isFreePlayRef.current) {
        // Natural end of free-play — stop playing state, show "Lancer" again
        isFreePlayRef.current = false;
        setIsFreePlaying(false);
        setShowPlayBtn(true);
      }
    }, [unlockPreview]);

    /* ─────────────────────────────────────────────────────────── *
     *  snapAndLock                                                 *
     *  1. Smooth-scroll (via Lenis) to centre the browser frame   *
     *  2. Once done → lenis.stop() + play video                   *
     *                                                              *
     *  Called ONLY from the wheel handler, never from an          *
     *  IntersectionObserver, so Lenis is guaranteed to be ready.  *
     * ─────────────────────────────────────────────────────────── */
    const snapAndLock = useCallback(() => {
      const el = frameRef.current;
      if (!el) return;

      const rect          = el.getBoundingClientRect();
      const elTop         = window.scrollY + rect.top;
      const elHeight      = rect.height;
      const vh            = window.innerHeight;

      // Read the actual nav height so the frame is centred in the space
      // between the bottom of the navigation bar and the bottom of the viewport.
      const navEl     = document.querySelector("nav") as HTMLElement | null;
      const navHeight = navEl ? navEl.getBoundingClientRect().height : 72;
      const available = vh - navHeight;              // usable vertical space
      const padding   = Math.max(0, (available - elHeight) / 2); // equal top & bottom margin
      const targetScrollY = Math.max(0, elTop - navHeight - padding);

      isSnappingRef.current = true;

      const lenis = (window as any).__lenis;

      // Guard against double-execution (onComplete + setTimeout race)
      let done = false;
      const doLock = () => {
        if (done) return;
        done = true;
        isSnappingRef.current = false;
        isPreviewLocked.current = true;
        lenis?.stop();
        const v = videoRef.current;
        if (v) { v.currentTime = 0; v.play().catch(() => {}); }
      };

      if (lenis) {
        lenis.scrollTo(targetScrollY, {
          duration: 0.7,
          easing: (t: number) => 1 - Math.pow(1 - t, 3),
          lock: true,       // Lenis blocks user wheel input during the animation
          onComplete: doLock,
        });
      } else {
        // Lenis not available — native smooth scroll
        window.scrollTo({ top: targetScrollY, behavior: "smooth" });
      }

      // Fallback: fire doLock after animation duration + generous buffer
      setTimeout(doLock, 900);
    }, []);

    /* ─────────────────────────────────────────────────────────── *
     *  IntersectionObserver — hourglass section                   *
     * ─────────────────────────────────────────────────────────── */
    useEffect(() => {
      const el = lockRef.current;
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isLockedRef.current) {
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
     *  Wheel + touch handlers                                      *
     *                                                              *
     *  Priority order:                                             *
     *   1. isSnappingRef  → block input, Lenis animates           *
     *   2. isPreviewLocked → block; hard scroll skips             *
     *   3. ratio ≥ 0.8 & first time → trigger snap               *
     *   4. isLockedRef    → drive hourglass progress              *
     * ─────────────────────────────────────────────────────────── */
    useEffect(() => {
      const SPEED     = 3600;
      const FAST_SKIP = 60; // deltaY (px) that counts as "hard scroll"

      const unlockHourglass = () => {
        isLockedRef.current = false;
        (window as any).__lenis?.start();
      };
      const driveHourglass = (delta: number) => {
        const next = revealProgress.get() + delta;
        if (next >= 1) { revealProgress.set(1); unlockHourglass(); return; }
        if (next <= 0) { revealProgress.set(0); unlockHourglass(); return; }
        revealProgress.set(next);
      };

      const handleWheel = (e: WheelEvent) => {
        // ① Snap in progress — Lenis's `lock:true` already blocks its own
        //   wheel handler; we also preventDefault so the browser doesn't scroll.
        if (isSnappingRef.current) {
          e.preventDefault();
          return;
        }

        // ② Video lock — only a hard downward scroll breaks out
        if (isPreviewLocked.current) {
          e.preventDefault();
          if (e.deltaY > FAST_SKIP) unlockPreview(true);
          return;
        }

        // ③ Check whether snap should trigger (downward scroll, first time)
        if (!hasPreviewFiredRef.current && e.deltaY > 0) {
          const el = frameRef.current;
          if (el) {
            const { top, bottom, height } = el.getBoundingClientRect();
            const vh = window.innerHeight;
            const visible = Math.min(bottom, vh) - Math.max(top, 0);
            if (visible / height >= 0.8) {
              e.preventDefault();
              hasPreviewFiredRef.current = true;
              snapAndLock();
              return;
            }
          }
        }

        // ④ Hourglass text reveal
        if (isLockedRef.current) {
          e.preventDefault();
          driveHourglass(e.deltaY / SPEED);
        }
      };

      /* Touch ── mirrors wheel logic for mobile */
      let lastTouchY = 0;
      const handleTouchStart = (e: TouchEvent) => {
        if (!isSnappingRef.current && !isPreviewLocked.current && !isLockedRef.current) return;
        lastTouchY = e.touches[0].clientY;
      };
      const handleTouchMove = (e: TouchEvent) => {
        if (isSnappingRef.current) { e.preventDefault(); return; }
        if (!isPreviewLocked.current && !isLockedRef.current) return;
        e.preventDefault();
        const y = e.touches[0].clientY;
        const delta = lastTouchY - y;
        if (isPreviewLocked.current) {
          if (delta > 30) unlockPreview(true);
        } else {
          driveHourglass(delta / SPEED);
        }
        lastTouchY = y;
      };

      window.addEventListener("wheel",      handleWheel,      { passive: false });
      window.addEventListener("touchstart", handleTouchStart, { passive: true  });
      window.addEventListener("touchmove",  handleTouchMove,  { passive: false });
      return () => {
        window.removeEventListener("wheel",      handleWheel);
        window.removeEventListener("touchstart", handleTouchStart);
        window.removeEventListener("touchmove",  handleTouchMove);
      };
    }, [revealProgress, unlockPreview, snapAndLock]);

    /* ── Play-button click handler (works for both "Lancer" and "Relancer") ── */
    const handlePlayClick = useCallback(() => {
      isFreePlayRef.current = true;
      setIsFreePlaying(true);  // button switches to "Relancer"
      setShowPlayBtn(true);    // keep button visible while playing
      const v = videoRef.current;
      if (v) { v.currentTime = 0; v.play().catch(() => {}); }
    }, []);

    /* ══════════════════════════════════════════════════════════ */
    return (
      <>
        <style>{heroCSS}</style>

        <section
          ref={ref}
          id="hero"
          className={`relative overflow-hidden${heroReady ? " hero-ready" : ""}`}
        >
          {/* Background blobs */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <div className="absolute inset-0 bg-[#fcfbf7] dark:bg-[#111827]" />
            <div className="absolute -top-32 -right-32 w-[700px] h-[700px] rounded-full"
              style={{ background: "radial-gradient(circle,rgba(59,130,246,0.07) 0%,transparent 65%)", filter: "blur(60px)" }} />
            <div className="absolute top-1/2 -left-20 w-[600px] h-[600px] rounded-full"
              style={{ background: "radial-gradient(circle,rgba(13,148,136,0.06) 0%,transparent 60%)", filter: "blur(60px)" }} />
          </div>

          {/* ═══ SECTION 1 — above the fold ═══ */}
          <div className="relative z-10 pt-28 md:pt-32 lg:pt-36 pb-0">
            <div className="max-w-5xl mx-auto px-6 lg:px-10 text-center">

              <AnimatedHeroTitle />

              <p className="hero-stagger hero-d2 mt-6 text-[clamp(1rem,2vw,1.175rem)] leading-[1.75] text-gray-500 dark:text-gray-400 font-inter max-w-2xl mx-auto">
                Ora crée des automatisations sur-mesure pour traiter vos données, afin que votre équipe se concentre sur ce qui compte vraiment.
              </p>

              <div className="hero-stagger hero-d3 mt-9 flex flex-wrap items-center justify-center gap-3.5">
                <button
                  onClick={openBooking}
                  className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold font-inter text-white bg-gradient-to-r from-[#3b82f6] to-[#0d9488] shadow-[0_2px_12px_rgba(59,130,246,0.30)] hover:shadow-[0_4px_24px_rgba(59,130,246,0.40)] hover:-translate-y-px active:translate-y-0 transition-all duration-150"
                >
                  Réserver un appel
                  <ArrowRight className="w-4 h-4 opacity-80 group-hover:translate-x-[3px] transition-transform duration-150" />
                </button>
                <button
                  onClick={() => {
                    hasPreviewFiredRef.current = true; // prevent wheel handler from double-triggering
                    snapAndLock();
                  }}
                  className="inline-flex items-center px-7 py-3.5 rounded-full text-[15px] font-semibold font-inter border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.06] hover:border-gray-400 dark:hover:border-white/30 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-150"
                >
                  Voir la démo
                </button>
              </div>
            </div>

            {/* ── Browser frame ──────────────────────────────────
                - Static placeholder on page load (no autoplay)
                - Snap-lock triggers when 80 % visible on scroll
                - Play button appears after a force-skip          */}
            <div
              ref={frameRef}
              id="demo-preview"
              className="hero-stagger hero-d4 relative z-10 mt-10 mx-auto max-w-6xl px-6 lg:px-10"
            >
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

                {/* Video + optional play button */}
                <div className="relative">
                  <video
                    ref={videoRef}
                    src="/demo-main1-safari.mp4"
                    muted
                    playsInline
                    preload="metadata"
                    className="w-full aspect-[16/9] object-cover block"
                    onLoadedMetadata={(e) => { e.currentTarget.playbackRate = 0.7; }}
                    onEnded={handleVideoEnded}
                  />

                  {/* Play / Relancer button — visible after a force-skip */}
                  {showPlayBtn && (
                    <button
                      onClick={handlePlayClick}
                      className="absolute bottom-4 left-4 flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-sm text-gray-800 dark:text-white text-[13px] font-medium font-inter shadow-lg hover:shadow-xl hover:-translate-y-px transition-all duration-150"
                    >
                      {isFreePlaying ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          Relancer
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Lancer
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Logos slider ── */}
          <div className="hero-stagger hero-d5 mx-auto max-w-6xl px-6 lg:px-10">
            <LogosSlider />
          </div>

          {/* ═══ SECTION 2A — scroll-lock: hourglass + text ═══ */}
          <div
            ref={lockRef}
            className="relative z-[1] min-h-screen flex items-center bg-[#fcfbf7] dark:bg-[#111827]"
          >
            <div className="w-full max-w-5xl mx-auto px-6 lg:px-10 py-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">

                <div className="flex items-center justify-center order-2 md:order-1">
                  <LogoHourglass progress={revealProgress} />
                </div>

                <div className="flex flex-col justify-center gap-6 order-1 md:order-2">
                  <motion.p
                    className="font-poppins text-2xl md:text-[1.75rem] lg:text-[2rem] font-medium leading-[1.5] tracking-[-0.025em] text-[#111827] dark:text-white"
                    style={{ opacity: l1o, y: l1y }}
                  >
                    Votre temps est votre actif le plus précieux.
                  </motion.p>
                  <motion.p
                    className="font-poppins text-2xl md:text-[1.75rem] lg:text-[2rem] font-medium leading-[1.5] tracking-[-0.025em] text-[#111827] dark:text-white"
                    style={{ opacity: l2o, y: l2y }}
                  >
                    Cessez de le gaspiller sur Excel.
                  </motion.p>
                  <motion.p
                    className="font-poppins text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.25] tracking-[-0.03em] text-brand-gradient mt-2"
                    style={{ opacity: l3o, y: l3y }}
                  >
                    Utilisez Ora.
                  </motion.p>
                  <motion.button
                    onClick={openBooking}
                    className="mt-4 w-fit inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold font-inter text-white bg-gradient-to-r from-[#3b82f6] to-[#0d9488] shadow-[0_2px_14px_rgba(59,130,246,0.30)] hover:shadow-[0_4px_24px_rgba(59,130,246,0.42)] hover:-translate-y-px transition-all duration-150"
                    style={{ opacity: ctaO }}
                  >
                    Réserver un appel
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>

              </div>
            </div>
          </div>

        </section>
      </>
    );
  },
);

Hero.displayName = "Hero";
export default Hero;
