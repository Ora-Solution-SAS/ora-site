import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { ArrowRight, Maximize2, X } from "lucide-react";
import { useLang } from "@/lib/i18n";

/**
 * OraHeroVideo — single-video black hero (temporary stand-in for the
 * Bending-Spoons-style 6-video carousel in OraGallery.tsx).
 *
 * Keeps the exact same shell as OraGallery — pure black section, soft overhead
 * light, "Ora en action" eyebrow, the "On s'occupe de vos tâches répétitives…"
 * headline and the "Réserver un appel" CTA — but drops the curved carousel for
 * a single product demo (ora-1.mp4) in a clean frame with a click-to-enlarge
 * lightbox. When the real demo clips are ready, swap this back for <OraGallery>
 * in App.tsx (the carousel code is preserved intact in OraGallery.tsx).
 */

interface OraHeroVideoProps {
  theme: "light" | "dark";
  openBooking: () => void;
}

const DEMO_VIDEO = "/ora-1.mp4";
// Seek past the awkward opening moment of the clip (same as the old demo panel).
const VIDEO_START = 0.5;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function OraHeroVideo({ theme, openBooking }: OraHeroVideoProps) {
  const { t } = useLang();
  void theme;

  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <section data-nav-shy data-nav-dark className="relative overflow-hidden pt-28 md:pt-32 pb-16 md:pb-24 px-6 md:px-12 bg-black">
      {/* Soft white top-light: a gentle overhead glow that lifts the pure
          black and gives the hero depth (the headline sits in the light). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(56% 44% at 50% -8%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.055) 40%, transparent 70%)",
        }}
      />

      {/* Header — same eyebrow + benefit line as the carousel hero. */}
      <motion.div
        className="relative z-10 text-center max-w-[90rem] mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
      >
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
          {t({ fr: "Ora en action", en: "Ora in action" })}
        </span>
        <h2 className="font-inter font-normal text-[clamp(2.2rem,5vw,4.75rem)] tracking-[-0.035em] leading-[1.05] text-white mt-5 text-center">
          <span className="block lg:whitespace-nowrap">
            {t({ fr: "On s'occupe de vos ", en: "We handle the " })}
            <span className="text-brand-gradient">{t({ fr: "tâches répétitives", en: "repetitive tasks" })}</span>
            {t({ fr: ",", en: "," })}
          </span>
          <span className="block lg:whitespace-nowrap">
            {t({ fr: "vous ", en: "so you " })}
            <span className="text-brand-gradient">{t({ fr: "excellez", en: "excel" })}</span>
            {t({ fr: " dans votre métier.", en: " at what you do." })}
          </span>
        </h2>
        <p className="font-inter mt-4 text-[13px] text-gray-500">
          {t({ fr: "Cliquez sur la vidéo pour l'agrandir", en: "Click the video to enlarge" })}
        </p>
      </motion.div>

      {/* Single demo video — rises up softly on arrival, click to enlarge. */}
      <motion.div
        className="relative z-10 mt-10 md:mt-14 w-full max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 56 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="group relative rounded-[20px] md:rounded-[28px] overflow-hidden bg-[#0a0f1c] cursor-pointer ring-1 ring-white/12 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)]"
          onClick={() => setLightboxOpen(true)}
        >
          <video
            src={DEMO_VIDEO}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onLoadedMetadata={(e) => {
              e.currentTarget.currentTime = VIDEO_START;
            }}
            className="pointer-events-none w-full aspect-[16/9] object-cover block"
          />

          {/* Enlarge → opens the in-page lightbox (not native fullscreen). */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(true);
            }}
            aria-label={t({ fr: "Agrandir la vidéo", en: "Enlarge the video" })}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white shadow-lg ring-1 ring-white/15 backdrop-blur-md transition-all duration-150 hover:bg-black/70 hover:ring-white/30"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        className="relative z-10 mt-14 md:mt-20 flex justify-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fadeUp}
      >
        <motion.button
          onClick={openBooking}
          whileHover={{ y: -3, scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 24, mass: 0.6 }}
          className="group inline-flex items-center gap-3 px-12 py-6 rounded-full text-lg md:text-xl font-inter font-semibold text-white bg-[#3b82f6] hover:bg-[#2f75e6] shadow-[0_8px_30px_rgba(59,130,246,0.4)] hover:shadow-[0_18px_55px_rgba(59,130,246,0.6)] transition-[background-color,box-shadow] duration-300 ease-out"
        >
          {t({ fr: "Réserver un appel", en: "Book a call" })}
          <ArrowRight className="w-5 h-5 transition-transform duration-300 ease-out group-hover:translate-x-1" />
        </motion.button>
      </motion.div>

      {lightboxOpen && <DemoLightbox onClose={() => setLightboxOpen(false)} />}
    </section>
  );
}

// ── Enlarged video overlay (portal so `fixed` escapes any transformed row) ──
function DemoLightbox({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  void ref;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
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
            src={DEMO_VIDEO}
            autoPlay
            loop
            controls
            playsInline
            className="w-full aspect-video object-contain bg-black"
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
