import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Maximize2, X } from "lucide-react";
import { useLang } from "@/lib/i18n";
import InViewVideo from "./InViewVideo";

/**
 * ClosingDemo — the original motion-designer demo clip (ora-1.mp4).
 *
 * Moved (client 2026-07-28) from the bottom of the landing (below the FAQ) to
 * INSIDE the Atlas section, right below the paragraph « Le dossier complet,
 * orchestré et traçable … sans jamais quitter Excel » — hence the `embedded`
 * variant: transparent background (the near-black Atlas gradient shows
 * through), no side padding of its own.
 *
 * Deliberately bare: no decorative layer (client request 2026-07-24). Framed
 * exactly like the hero clip (max-w-5xl · 16/9 · rounded · ring · shadow)
 * with a click-to-enlarge lightbox. Lazy-loaded via InViewVideo (the file is
 * ~23 MB, below the fold).
 */

const DEMO_VIDEO = "/ora-1.mp4";

export default function ClosingDemo({ embedded = false }: { embedded?: boolean }) {
  const { t } = useLang();
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <section
      className={
        embedded
          ? "relative pt-14 md:pt-20 pb-0 bg-transparent"
          : "relative px-6 md:px-12 pt-24 md:pt-32 pb-10 md:pb-14 bg-white dark:bg-black"
      }
    >
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* No heading — the clip stands alone on the bare background
            (client request 2026-07-24). */}
        {/* Framed demo video — same size / treatment as the hero clip */}
        <motion.div
          className="group relative rounded-[20px] md:rounded-[28px] overflow-hidden bg-black ring-1 ring-black/5 dark:ring-white/10 shadow-[0_40px_100px_-30px_rgba(15,23,42,0.45)] cursor-pointer"
          initial={{ opacity: 0, y: 56 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => setLightboxOpen(true)}
        >
          <InViewVideo
            src={DEMO_VIDEO}
            className="pointer-events-none w-full aspect-[16/9] object-cover block"
          />
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
        </motion.div>
      </div>

      {lightboxOpen && <DemoLightbox onClose={() => setLightboxOpen(false)} />}
    </section>
  );
}

// ── Enlarged video overlay (portal so `fixed` escapes any transformed row) ──
function DemoLightbox({ onClose }: { onClose: () => void }) {
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
