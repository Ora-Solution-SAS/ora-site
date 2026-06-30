import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/lib/i18n";

/**
 * OraGallery — Bubble-style "what we build" gallery.
 *
 *  Large landscape demo videos that auto-play on their own, each wrapped in a
 *  light-blue framed panel with a category pill tab, laid out in two staggered
 *  rows that bleed off the edges — bubble.io style.
 */

interface OraGalleryProps {
  theme: "light" | "dark";
  openBooking: () => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function OraGallery({ theme, openBooking }: OraGalleryProps) {
  const { t } = useLang();
  void theme;

  const topRow = [
    { label: t({ fr: "Reporting mensuel", en: "Monthly report" }), src: "/try1.mp4",               width: "w-[210px] md:w-[540px]", offset: "translate-y-0" },
    { label: t({ fr: "Extraction", en: "Extraction" }),           src: "/feature-automate-v3.mp4", width: "w-[210px] md:w-[540px]", offset: "translate-y-7" },
    { label: t({ fr: "Tracking", en: "Tracking" }),               src: "/ora_engineering.mp4",     width: "w-[210px] md:w-[540px]", offset: "-translate-y-2" },
  ];
  const bottomRow = [
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
      </motion.div>

      {/* Two staggered rows of large landscape video frames */}
      <motion.div
        className="relative z-10 mt-14 md:mt-20 space-y-2 md:space-y-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fadeUp}
      >
        <Row cards={topRow} />
        <Row cards={bottomRow} shift="ml-10 md:ml-0 md:translate-x-20" />
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
    </section>
  );
}

// ── One staggered, centered row ─────────────────────────────────────────────
// Layout is identical to before. The only addition is that on mobile the row
// becomes horizontally scrollable so the user can swipe left/right; we start it
// scrolled to the middle so the resting position matches the original centered
// look. Desktop is untouched (centered, bleeds off the edges, no scroll).
function Row({ cards, shift = "" }: { cards: { label: string; src: string; width: string; offset: string }[]; shift?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const center = () => {
      if (window.matchMedia("(max-width: 767px)").matches) {
        el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
      }
    };
    center();
    window.addEventListener("resize", center);
    return () => window.removeEventListener("resize", center);
  }, []);

  return (
    <div
      ref={scrollRef}
      className="flex justify-start md:justify-center overflow-x-auto md:overflow-x-visible pt-3 pb-8 md:py-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className={`flex flex-none items-start gap-4 md:gap-9 px-2 ${shift}`}>
        {cards.map((c) => (
          <VideoFrame key={c.label} label={c.label} src={c.src} width={c.width} offset={c.offset} />
        ))}
      </div>
    </div>
  );
}

// ── A large auto-playing video inside a light-blue framed panel ─────────────
function VideoFrame({ label, src, width, offset }: { label: string; src: string; width: string; offset: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Tap a video on mobile to open it full-screen. iOS Safari only supports the
  // proprietary webkitEnterFullscreen on the <video> element itself. On desktop
  // the click is a no-op so the behaviour is exactly as before.
  const enterFullscreen = () => {
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    const video = videoRef.current as
      | (HTMLVideoElement & {
          webkitEnterFullscreen?: () => void;
          webkitRequestFullscreen?: () => void;
        })
      | null;
    if (!video) return;
    if (video.requestFullscreen) video.requestFullscreen().catch(() => {});
    else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
    else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
  };

  return (
    <div className={`flex-none ${width} ${offset}`}>
      {/* category pill — tab above the panel */}
      <div className="ml-5 inline-flex rounded-t-xl bg-blue-50 dark:bg-white/10 px-4 pt-2 pb-3 -mb-2 relative">
        <span className="font-inter text-[13px] font-semibold text-blue-700/80 dark:text-gray-300">{label}</span>
      </div>
      {/* light-blue frame around the video — the heavy blue drop-shadow only
          shows on desktop (md+); mobile keeps a clean flat frame. */}
      <div className="relative rounded-[24px] bg-blue-50 ring-1 ring-blue-100 p-3 md:shadow-[0_34px_80px_-34px_rgba(59,130,246,0.45)]">
        <div className="relative aspect-video rounded-[16px] overflow-hidden bg-[#dbeafe]">
          <video
            ref={videoRef}
            src={src}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onClick={enterFullscreen}
            className="absolute inset-0 h-full w-full object-cover cursor-zoom-in md:cursor-auto"
          />
        </div>
      </div>
    </div>
  );
}
