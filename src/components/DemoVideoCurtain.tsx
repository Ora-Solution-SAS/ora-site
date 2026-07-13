import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2, X } from "lucide-react";
import { useLang } from "@/lib/i18n";

/**
 * DemoVideoCurtain — the white "product demo" panel that rises over the sticky
 * ExcelReveal section (curtain effect), mirroring how AtlasShowcase rises over
 * it elsewhere. Same recipe: `relative z-[20]`, opaque background, a top
 * box-shadow to strengthen the rising edge, and `min-h-screen` so it fully
 * covers the pinned section beneath it.
 *
 * Content is deliberately minimal: the ora-1.mp4 demo in a clean frame on
 * white, with an enlarge button. (Extracted from the old Hero, simplified —
 * no scroll-overlay / replay / fullscreen machinery, since the curtain motion
 * is now driven by the sticky layout, not by the video's own scroll logic.)
 */

const DEMO_VIDEO = "/ora-1.mp4";
// Seek past the awkward opening moment of the clip, like the old Hero did.
const VIDEO_START = 0.5;

export default function DemoVideoCurtain() {
  const { t } = useLang();
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <section
      data-demo-curtain
      className="relative z-[20] min-h-screen flex items-start justify-center overflow-hidden bg-white px-6 md:px-12 pt-[20vh] md:pt-[24vh] pb-24 md:pb-28"
      style={{
        // Top shadow reinforces the "curtain" edge as the panel slides up over
        // the pinned ExcelReveal section beneath it.
        boxShadow: "0 -36px 72px rgba(15,23,42,0.14)",
      }}
    >
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        {/* The old hero headline, now ABOVE the demo — regular weight (not bold). */}
        <p className="mb-8 md:mb-10 font-poppins font-normal text-center text-[1.55rem] md:text-[2.1rem] leading-[1.18] tracking-[-0.025em] text-[#111827] max-w-4xl mx-auto">
          {t({
            fr: "Vos dossiers financiers les plus sensibles, automatisés et orchestrés.",
            en: "Your most sensitive financial dossiers, automated and orchestrated.",
          })}{" "}
          <span className="text-brand-gradient">
            {t({ fr: "Vos données vous appartiennent.", en: "Your data stays yours." })}
          </span>
        </p>

        <div className="group relative rounded-[20px] md:rounded-[28px] overflow-hidden bg-black shadow-[0_40px_100px_-30px_rgba(15,23,42,0.4)] ring-1 ring-black/5">
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
            className="w-full aspect-[16/9] object-cover block"
          />

          {/* Enlarge → opens the in-page lightbox (not native fullscreen). */}
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
        <DemoLightbox onClose={() => setLightboxOpen(false)} />
      )}
    </section>
  );
}

// ── Enlarged video overlay (portal so `fixed` escapes the transformed row) ──
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
