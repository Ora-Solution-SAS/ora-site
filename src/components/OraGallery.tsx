import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { useLang } from "@/lib/i18n";

/**
 * OraGallery — Bubble-style "what we build" gallery.
 *
 *  Large landscape demo videos that auto-play on their own, each wrapped in a
 *  light-blue framed panel with a category pill tab, laid out in two staggered
 *  rows that bleed off the edges — bubble.io style.
 *
 *  Interactions:
 *   - Click a video → opens an enlarged lightbox (all breakpoints).
 *   - Drag / swipe a row sideways → reveals the side videos (all breakpoints).
 *   - Hover a video → it scales up slightly.
 */

interface OraGalleryProps {
  theme: "light" | "dark";
  openBooking: () => void;
}

type Card = { label: string; src: string; width: string; offset: string };

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function OraGallery({ theme, openBooking }: OraGalleryProps) {
  const { t } = useLang();
  void theme;

  // The video currently opened in the enlarged lightbox (null = closed).
  const [active, setActive] = useState<{ src: string; label: string } | null>(null);

  const topRow: Card[] = [
    { label: t({ fr: "Reporting mensuel", en: "Monthly report" }), src: "/try1.mp4",               width: "w-[210px] md:w-[540px]", offset: "translate-y-0" },
    { label: t({ fr: "Extraction", en: "Extraction" }),           src: "/feature-automate-v3.mp4", width: "w-[210px] md:w-[540px]", offset: "translate-y-7" },
    { label: t({ fr: "Tracking", en: "Tracking" }),               src: "/ora_engineering.mp4",     width: "w-[210px] md:w-[540px]", offset: "-translate-y-2" },
  ];
  const bottomRow: Card[] = [
    { label: t({ fr: "Rapprochement", en: "Reconciliation" }),    src: "/ora_story3-v2.mp4",       width: "w-[210px] md:w-[540px]", offset: "translate-y-3" },
    { label: t({ fr: "Export PDF", en: "PDF export" }),           src: "/ora_story4-v2.mp4",       width: "w-[210px] md:w-[540px]", offset: "translate-y-8" },
    { label: t({ fr: "Multi-dossier", en: "Multi-folder" }),      src: "/feature-automate-v2.mp4", width: "w-[210px] md:w-[540px]", offset: "translate-y-1" },
  ];

  return (
    <section data-nav-shy className="relative overflow-hidden pt-24 md:pt-32 pb-24 md:pb-28 px-6 md:px-12 bg-white dark:bg-black md:dark:bg-[#0f172a]">
      {/* Header */}
      <motion.div
        className="relative z-10 text-center max-w-3xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
      >
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
          {t({ fr: "Ora en action", en: "Ora in action" })}
        </span>
        <h2 className="font-poppins font-medium text-3xl md:text-[2.75rem] tracking-[-0.02em] leading-[1.12] text-[#111827] dark:text-white mt-4">
          {t({ fr: "Vos workflows Excel, ", en: "Your Excel workflows, " })}
          <span className="text-brand-gradient">{t({ fr: "automatisés.", en: "automated." })}</span>
        </h2>
        <p className="font-inter mt-5 text-base md:text-lg leading-[1.7] text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {t({
            fr: "Reporting, extraction, rapprochement, export. Ora transforme vos fichiers en livrables prêts à partager, sans jamais exposer vos données.",
            en: "Reporting, extraction, reconciliation, export. Ora turns your files into share-ready deliverables, without ever exposing your data.",
          })}
        </p>
        <p className="font-inter mt-3 text-[13px] text-gray-400 dark:text-gray-500">
          {t({ fr: "Cliquez pour agrandir · glissez pour parcourir", en: "Click to enlarge · drag to browse" })}
        </p>
      </motion.div>

      {/* Two staggered rows of large landscape video frames.
          Negative margins cancel the section's horizontal padding so the
          scrollable rows bleed full-width to the viewport edges — no white
          side bands clipping the videos. */}
      <motion.div
        className="relative z-10 mt-14 md:mt-20 space-y-2 md:space-y-8 -mx-6 md:-mx-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fadeUp}
      >
        <Row cards={topRow} onOpen={setActive} />
        <Row cards={bottomRow} shift="md:translate-x-16" onOpen={setActive} />
      </motion.div>

      {/* CTA */}
      <motion.div
        className="relative z-10 mt-20 md:mt-52 flex justify-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fadeUp}
      >
        <button
          onClick={openBooking}
          className="group inline-flex items-center gap-3 px-12 py-6 rounded-full text-lg md:text-xl font-inter font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 bg-[#3b82f6] hover:bg-[#2f75e6] shadow-[0_8px_30px_rgba(59,130,246,0.4)] hover:shadow-[0_12px_40px_rgba(59,130,246,0.55)]"
        >
          {t({ fr: "Réserver un appel", en: "Book a call" })}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-150" />
        </button>
      </motion.div>

      {/* Enlarged video lightbox */}
      <Lightbox active={active} onClose={() => setActive(null)} />
    </section>
  );
}

// ── One staggered, centered row ─────────────────────────────────────────────
// Horizontally scrollable on every breakpoint: users can swipe (touch) or
// drag (mouse) to reveal the side videos. The row starts scrolled to the
// middle so the resting position matches the original centered look. A real
// drag suppresses the click so scrolling never opens the lightbox by accident.
function Row({
  cards,
  shift = "",
  onOpen,
}: {
  cards: Card[];
  shift?: string;
  onOpen: (v: { src: string; label: string }) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // Tracks a pointer drag so we can (a) scroll and (b) tell a click from a drag.
  const drag = useRef({ down: false, startX: 0, startScroll: 0, moved: false });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const center = () => {
      el.scrollLeft = Math.max(0, (el.scrollWidth - el.clientWidth) / 2);
    };
    center();
    window.addEventListener("resize", center);
    return () => window.removeEventListener("resize", center);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    drag.current = { down: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.down) return;
    const el = scrollRef.current;
    if (!el) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 5) drag.current.moved = true;
    el.scrollLeft = drag.current.startScroll - dx;
  };
  const endDrag = () => {
    drag.current.down = false;
    // Clear the moved flag on the next tick so the click handler (which fires
    // right after pointerup) can still read it.
    setTimeout(() => (drag.current.moved = false), 0);
  };

  return (
    <div
      ref={scrollRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      className="flex overflow-x-auto overscroll-x-contain cursor-grab active:cursor-grabbing py-8 md:py-12 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className={`mx-auto flex flex-none items-start gap-4 md:gap-9 px-2 ${shift}`}>
        {cards.map((c) => (
          <VideoFrame
            key={c.label}
            card={c}
            onSelect={() => {
              if (!drag.current.moved) onOpen({ src: c.src, label: c.label });
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── A large auto-playing video inside a light-blue framed panel ─────────────
function VideoFrame({ card, onSelect }: { card: Card; onSelect: () => void }) {
  const { label, src, width, offset } = card;

  return (
    <div
      onClick={onSelect}
      className={`group flex-none ${width} ${offset} relative cursor-pointer transition-transform duration-300 ease-out will-change-transform hover:scale-[1.035] hover:z-10`}
    >
      {/* category pill — tab above the panel */}
      <div className="ml-5 inline-flex rounded-t-xl bg-blue-50 dark:bg-white/10 px-4 pt-2 pb-3 -mb-2 relative">
        <span className="font-inter text-[13px] font-semibold text-blue-700/80 dark:text-gray-300">{label}</span>
      </div>
      {/* light-blue frame around the video — the heavy blue drop-shadow only
          shows on desktop (md+); mobile keeps a clean flat frame. */}
      <div className="relative rounded-[24px] bg-blue-50 p-3 shadow-[0_34px_84px_-44px_rgba(59,130,246,0.16)] transition-shadow duration-300 ease-out group-hover:shadow-[0_44px_100px_-42px_rgba(59,130,246,0.24)]">
        <div className="relative aspect-video rounded-[16px] overflow-hidden bg-[#dbeafe]">
          <video
            src={src}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            // Drag is handled by the row; the video shouldn't capture the pointer.
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

// ── Enlarged video overlay (portal so `fixed` escapes any transformed row) ──
function Lightbox({
  active,
  onClose,
}: {
  active: { src: string; label: string } | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // Prevent the page behind from scrolling while the lightbox is open.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [active, onClose]);

  if (!active) return null;

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
            src={active.src}
            autoPlay
            loop
            controls
            playsInline
            className="w-full aspect-video object-contain bg-black"
          />
        </div>
        <p className="mt-3 text-center font-inter text-sm text-white/80">{active.label}</p>
      </div>
    </div>,
    document.body
  );
}
