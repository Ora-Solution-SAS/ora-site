import { forwardRef, useRef, useEffect, useState, useCallback } from "react";
import { ArrowRight, Play, RefreshCw } from "lucide-react";
import { LogosSlider } from "./LogosSlider";
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
  ({ scrollToSection: _scrollToSection, openBooking }, ref) => {
    const { t } = useLang();

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

    /* Line reveal — opacity + y */
    const l1o = useTransform(revealProgress, [0,    0.22], [0, 1]);
    const l1y = useTransform(revealProgress, [0,    0.22], [28, 0]);
    const l2o = useTransform(revealProgress, [0.20, 0.44], [0, 1]);
    const l2y = useTransform(revealProgress, [0.20, 0.44], [28, 0]);
    /* fade-in 0.42→0.62, maintenu, fade-out 0.71→0.72 (l'overlay fixe prend le relais) */
    const l3o = useTransform(revealProgress, [0.42, 0.62, 0.71, 0.72], [0, 1, 1, 0]);

    /* "Découvrez Ora." : grows → then exits downward out of the section */
    const l3Size    = useTransform(revealProgress, [0.60, 0.92], ["1.75rem", "3.75rem"]);
    const l3Leading = useTransform(revealProgress, [0.60, 0.92], [1.5, 1.12]);
    const l3Track   = useTransform(revealProgress, [0.60, 0.92], ["-0.025em", "-0.04em"]);
    /* slide-in uniquement — la sortie est gérée par l'overlay fixe */
    const l3TotalY = useTransform(revealProgress, [0.42, 0.62], [28, 0]);

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
     *  Wheel + touch handlers                                      *
     *                                                              *
     *  Priority order:                                             *
     *   1. isSnappingRef   → block input, Lenis animates          *
     *   2. isPreviewLocked → block; hard scroll skips             *
     *   3. ratio ≥ 0.8 & first time → trigger snap               *
     *   4. isLockedRef     → drive text reveal progress           *
     * ─────────────────────────────────────────────────────────── */
    useEffect(() => {
      const FAST_SKIP = 60;
      const SPEED     = 3200;

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

      const driveText = (delta: number) => {
        if (hasTextCompletedRef.current) {
          revealProgress.set(1);
          unlockText();
          return;
        }
        const next = revealProgress.get() + delta;

        /* ── Phase de sortie (>0.71) : overlay fixe + scroll viewport ── */
        if (next > 0.71) {
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

          const ratio = Math.min(Math.max((next - 0.71) / (1.0 - 0.71), 0), 1);

          /* Scroll viewport vers #features */
          if (exitScrollStartRef.current !== null && exitScrollTargetRef.current !== null) {
            window.scrollTo({
              top: exitScrollStartRef.current +
                (exitScrollTargetRef.current - exitScrollStartRef.current) * ratio,
              behavior: "instant" as ScrollBehavior,
            });
          }

          /* Déplace l'overlay fixe + adapte la taille de police */
          if (overlayRef.current && overlayActive.current) {
            const ov = overlayRef.current;
            ov.style.top = `${overlayStartY.current + (overlayEndY.current - overlayStartY.current) * ratio}px`;
            /* Même courbe que l3Size (0.60→0.92 : 1.75rem→3.75rem) */
            if (next < 0.92) {
              const t = Math.min(Math.max((next - 0.60) / 0.32, 0), 1);
              ov.style.fontSize = `${1.75 + t * 2}rem`;
            } else {
              ov.style.fontSize = "3.75rem";
            }
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

      const handleWheel = (e: WheelEvent) => {
        // ① Snap in progress
        if (isSnappingRef.current) {
          e.preventDefault();
          return;
        }
        // ② Video lock
        if (isPreviewLocked.current) {
          e.preventDefault();
          if (e.deltaY > FAST_SKIP) unlockPreview(true);
          return;
        }
        // ③ Snap trigger
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
        // ④ Text reveal
        if (isLockedRef.current) {
          e.preventDefault();
          driveText(e.deltaY / SPEED);
        }
      };

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
          driveText(delta / SPEED);
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
                  onClick={() => {
                    hasPreviewFiredRef.current = true; // prevent wheel handler from double-triggering
                    snapAndLock();
                  }}
                  className="inline-flex items-center px-7 py-3.5 rounded-full text-[15px] font-semibold font-inter border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.06] hover:border-gray-400 dark:hover:border-white/30 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-150"
                >
                  {t({ fr: "Voir la démo", en: "Watch the demo" })}
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
                          {t({ fr: "Relancer", en: "Replay" })}
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          {t({ fr: "Lancer", en: "Play" })}
                        </>
                      )}
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
                className="font-poppins font-bold"
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
          className="fixed left-1/2 z-[200] pointer-events-none font-poppins font-bold"
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
