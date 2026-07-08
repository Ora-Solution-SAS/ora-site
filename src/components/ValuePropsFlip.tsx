import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown, Maximize2, X } from "lucide-react";
import { useLang } from "@/lib/i18n";

/**
 * ValuePropsFlip — the "Tailored automation" split card, now with a scroll-lock
 * 3D flip that reveals a second card (FEC Studio) on its back.
 *
 * Desktop (md+):
 *   When the section fills the viewport the page scroll is locked (Lenis
 *   stopped). The wheel/touch input then scrubs a `progress` MotionValue 0→1,
 *   which rotates the card on its Y axis from 0° to 180°. At 0° the front face
 *   (tailored automation) shows; past 90° the back face (FEC Studio) takes over.
 *   Once fully flipped the scroll unlocks and the page continues. This mirrors
 *   the ExcelReveal scroll-lock pattern so the two feel consistent.
 *
 * Mobile (< md):
 *   No scroll-lock / no 3D (touch-locking is fragile on phones). The two cards
 *   simply stack — front then FEC Studio — so mobile users still get both.
 */

/* ── FEC Studio media ────────────────────────────────────────────────────────
 * Placeholder clip until the real FEC Studio capture is ready. Swap this single
 * path for the final video (e.g. "/fec-studio.mp4") and nothing else changes. */
const FEC_STUDIO_VIDEO = "/fec-studio.mp4";

/* ── Front face — tailored-automation card (identical to ValueProps) ───────── */
function FrontCard({ openBooking }: { openBooking: () => void }) {
  const { t } = useLang();
  return (
    <div className="grid lg:grid-cols-[1.45fr_1fr] rounded-[24px] md:rounded-[32px] overflow-hidden shadow-[0_30px_80px_-30px_rgba(15,23,42,0.25)] bg-white dark:bg-[#0c1830]">
      {/* TEXT panel */}
      <div className="bg-gradient-to-br from-[#f5f8ff] via-[#d3e4fc] to-[#a9c6f4] dark:from-[#0c1830] dark:via-[#0f1d3a] dark:to-[#1c3360] p-8 md:p-14 lg:p-16 flex flex-col justify-center min-h-[440px]">
        <span className="inline-flex w-fit items-center rounded-full border border-blue-300/70 dark:border-blue-400/30 bg-white/60 dark:bg-white/[0.06] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-blue-600 dark:text-blue-300">
          {t({ fr: "Automatisation sur-mesure", en: "Tailored automation" })}
        </span>

        <h3 className="font-poppins font-normal text-[2rem] md:text-[2.6rem] leading-[1.1] tracking-[-0.03em] text-[#111827] dark:text-white mt-6">
          {t({ fr: "Vos tâches Excel, automatisées en un clic.", en: "Your Excel work, automated in one click." })}
        </h3>

        <p className="font-inter mt-5 text-base md:text-[17px] leading-relaxed text-gray-600 dark:text-gray-300 max-w-md">
          {t({
            fr: "Une automatisation sur-mesure ne devrait pas prendre des mois. On la livre en quelques jours, adaptée à votre processus, sans que personne ait à maîtriser Excel.",
            en: "Tailored automation shouldn't take months. We deliver it in days, built around your process, with no one needing to master Excel.",
          })}
        </p>

        <button
          onClick={openBooking}
          className="group mt-8 md:mt-9 inline-flex w-full md:w-fit items-center justify-center gap-2 px-7 py-4 md:py-3.5 rounded-full text-[16px] md:text-[15px] font-semibold font-inter text-white bg-[#3b82f6] hover:bg-[#2563eb] shadow-[0_4px_18px_rgba(59,130,246,0.35)] hover:-translate-y-px transition-all duration-150"
        >
          {t({ fr: "Réserver un appel", en: "Book a call" })}
          <ArrowRight className="w-4 h-4 opacity-90 group-hover:translate-x-[3px] transition-transform duration-150" />
        </button>
      </div>

      {/* IMAGE panel */}
      <div className="relative min-h-[300px] md:min-h-[440px] max-md:order-first overflow-hidden bg-gradient-to-br from-[#eef4ff] to-[#d6e6fd] dark:from-[#0f1d3a] dark:to-[#152a52]">
        <img
          src="/ora_hero_violet-v3.png"
          alt={t({ fr: "Interface Ora : automatisations Excel disponibles", en: "Ora interface: available Excel automations" })}
          className="absolute inset-0 w-full h-full object-cover object-center scale-[1.12]"
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  );
}

/* ── Enlarged video overlay (portal so `fixed` escapes the 3D-transformed
 *  flip card). Same style as the OraGallery lightbox: dark backdrop, close
 *  button, click-outside / Escape to dismiss. */
function FecLightbox({ label, onClose }: { label: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-8"
      onClick={onClose}
    >
      <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute -top-11 right-0 md:-right-2 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="rounded-2xl overflow-hidden bg-black shadow-2xl ring-1 ring-white/10">
          <video
            src={FEC_STUDIO_VIDEO}
            autoPlay
            loop
            controls
            playsInline
            className="w-full aspect-video object-contain bg-black"
          />
        </div>
        <p className="mt-3 text-center font-inter text-sm text-white/80">{label}</p>
      </div>
    </div>,
    document.body,
  );
}

/* ── Back face — FEC Studio card (same split layout, video on the right) ────── */
function BackCard({ openBooking }: { openBooking: () => void }) {
  const { t } = useLang();
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
    <div className="grid lg:grid-cols-[1.45fr_1fr] h-full rounded-[24px] md:rounded-[32px] overflow-hidden shadow-[0_30px_80px_-30px_rgba(15,23,42,0.25)] bg-white dark:bg-[#0c1830]">
      {/* TEXT panel */}
      <div className="bg-gradient-to-br from-[#f5f8ff] via-[#d3e4fc] to-[#a9c6f4] dark:from-[#0c1830] dark:via-[#0f1d3a] dark:to-[#1c3360] p-8 md:p-14 lg:p-16 flex flex-col justify-center min-h-[440px]">
        <span className="inline-flex w-fit items-center rounded-full border border-blue-300/70 dark:border-blue-400/30 bg-white/60 dark:bg-white/[0.06] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-blue-600 dark:text-blue-300">
          {t({ fr: "Conformité fiscale", en: "Tax compliance" })}
        </span>

        <h3 className="font-poppins font-normal text-[2.4rem] md:text-[3.1rem] leading-[1.05] tracking-[-0.035em] text-[#111827] dark:text-white mt-6">
          FEC Studio.
        </h3>

        <p className="font-inter mt-5 text-base md:text-[17px] leading-relaxed text-gray-600 dark:text-gray-300 max-w-md">
          {t({
            fr: "Générez et contrôlez votre Fichier des Écritures Comptables au format DGFiP. Les anomalies sont repérées avant le contrôle fiscal, pas pendant.",
            en: "Generate and check your FEC accounting file in DGFiP format. Anomalies are caught before the tax audit, not during it.",
          })}
        </p>

        <button
          onClick={openBooking}
          className="group mt-8 md:mt-9 inline-flex w-full md:w-fit items-center justify-center gap-2 px-7 py-4 md:py-3.5 rounded-full text-[16px] md:text-[15px] font-semibold font-inter text-white bg-[#3b82f6] hover:bg-[#2563eb] shadow-[0_4px_18px_rgba(59,130,246,0.35)] hover:-translate-y-px transition-all duration-150"
        >
          {t({ fr: "Réserver un appel", en: "Book a call" })}
          <ArrowRight className="w-4 h-4 opacity-90 group-hover:translate-x-[3px] transition-transform duration-150" />
        </button>
      </div>

      {/* VIDEO panel — the FEC Studio clip, framed by a rich blue gradient (soft
          top glow → deep navy) with a full-screen control. Tighter padding so
          the video reads larger inside the surround. */}
      <div
        className="group relative flex items-center justify-center min-h-[300px] md:min-h-[440px] max-md:order-first overflow-hidden p-3 md:p-5"
        style={{
          background:
            "radial-gradient(130% 120% at 50% -10%, rgba(191,219,254,0.6) 0%, rgba(147,197,253,0.28) 34%, transparent 64%), linear-gradient(158deg, #8fb8ef 0%, #6f9ce6 40%, #5384d6 72%, #3f6cc4 100%)",
        }}
      >
        <video
          src={FEC_STUDIO_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-auto max-h-full object-contain rounded-2xl shadow-[0_28px_70px_-24px_rgba(0,0,0,0.7)] ring-1 ring-white/10"
        />

        {/* Enlarge button — opens the in-page lightbox (not native fullscreen). */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label={t({ fr: "Agrandir la vidéo", en: "Enlarge the video" })}
          className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white shadow-lg ring-1 ring-white/15 backdrop-blur-md transition-all duration-150 hover:bg-black/70 hover:ring-white/30"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
    </div>

    {lightboxOpen && (
      <FecLightbox label="FEC Studio" onClose={() => setLightboxOpen(false)} />
    )}
    </>
  );
}

export default function ValuePropsFlip({ openBooking }: { openBooking: () => void }) {
  const { t } = useLang();

  const progress = useMotionValue(0);
  // Vertical flip: rotate around the X axis (top-over-bottom), not sideways.
  const rotateX = useTransform(progress, [0, 1], [0, 180]);

  const lockRef = useRef<HTMLDivElement>(null);
  const isLockedRef = useRef(false);
  const [isLocked, setIsLocked] = useState(false);
  const hasCompletedRef = useRef(false);

  /* ── IntersectionObserver : lock the page when the section fills the view ── */
  useEffect(() => {
    const el = lockRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          !isLockedRef.current &&
          !hasCompletedRef.current &&
          !(window as any).__oraSuppressHeroLock
        ) {
          isLockedRef.current = true;
          setIsLocked(true);
          const lenis = (window as any).__lenis;
          lenis?.stop();
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

  /* ── Wheel + touch scrub the flip while locked (eased rAF, like ExcelReveal) ── */
  useEffect(() => {
    const SPEED = 4200;
    const EASE = 0.18;
    const EPS = 0.0008;

    const unlock = () => {
      isLockedRef.current = false;
      setIsLocked(false);
      (window as any).__lenis?.start();
    };

    const applyProgress = (next: number) => {
      if (next >= 1) {
        progress.set(1);
        hasCompletedRef.current = true;
        unlock();
        return;
      }
      if (next <= 0) {
        progress.set(0);
        unlock();
        return;
      }
      progress.set(next);
    };

    let target = progress.get();
    let rafId = 0;
    let running = false;

    const tick = () => {
      const current = progress.get();
      const diff = target - current;
      const next = Math.abs(diff) <= EPS ? target : current + diff * EASE;
      applyProgress(next);
      if (isLockedRef.current && Math.abs(target - progress.get()) > EPS) {
        rafId = requestAnimationFrame(tick);
      } else {
        running = false;
      }
    };

    const ensureRunning = () => {
      if (hasCompletedRef.current) { unlock(); return; }
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
  }, [progress]);

  return (
    <>
      {/* ── Desktop : scroll-lock 3D flip ─────────────────────────────────── */}
      <section
        ref={lockRef}
        className="hidden md:flex relative min-h-screen items-center justify-center px-6 lg:px-10"
      >
        <div className="w-full max-w-7xl mx-auto" style={{ perspective: "2200px" }}>
          <motion.div
            data-nav-shy
            className="relative"
            style={{ rotateX, transformStyle: "preserve-3d", willChange: "transform" }}
          >
            {/* Front face (in flow → defines the card height) */}
            <div style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
              <FrontCard openBooking={openBooking} />
            </div>
            {/* Back face (absolute, pre-rotated so it reads upright once flipped) */}
            <div
              className="absolute inset-0"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateX(180deg)",
              }}
            >
              <BackCard openBooking={openBooking} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Scroll hint while the flip is locked */}
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

      {/* ── Mobile : no lock, stack the two cards ─────────────────────────── */}
      <div className="md:hidden max-w-7xl mx-auto py-16 px-4 sm:px-6 space-y-8">
        <FrontCard openBooking={openBooking} />
        <BackCard openBooking={openBooking} />
      </div>
    </>
  );
}
