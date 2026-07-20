import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, ClipboardCheck, FileText, Mail, PieChart, Sparkles, X, type LucideIcon } from "lucide-react";
import { useLang } from "@/lib/i18n";
import ReportingMockup from "./ReportingMockup";
import PointageMockup from "./PointageMockup";

/**
 * UseCases — Bending-Spoons-style acquisition cards, adapted to Ora use cases:
 * two large pastel-BLUE rounded cards side by side, each with a bold title, a
 * "watch the demo" pill, an icon meta line, ring-bulleted facts, and the demo
 * clip filling the bottom of the card (bleeding to the card's bottom edge).
 * Sits right above the "Votre Excel vous coûte plus que du temps" section.
 */

type UseCase = {
  title: string;
  metaIcon: LucideIcon;
  meta: string;
  bullets: string[];
  video: string;
  poster: string;
  /** Card background (blue family, pastel or saturated). */
  bg: string;
  /** Primary ink color on that background. */
  ink: string;
  /** Secondary text color. */
  sub: string;
  /** Saturated background → white text + translucent white pill. */
  dark?: boolean;
  /** Card bg matches the clip's own canvas → drop the frame (no rounding, no
   *  shadow) so the video melts into the card and only its UI floats. */
  blend?: boolean;
  /** Decorative layer: peach circle (WeTransfer) or white outline rings
   *  (Streamyard). */
  decor?: "circle" | "rings";
  /** Replace the video media zone with a custom static mockup composition
   *  (Bending-Spoons style). The video is kept for the "Voir la démo"
   *  lightbox. */
  mockup?: "reporting" | "pointage";
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function UseCases({ openBooking }: { openBooking: () => void }) {
  const { t } = useLang();
  const [active, setActive] = useState<UseCase | null>(null);

  const cases: UseCase[] = [
    {
      title: t({ fr: "Automatisation FEC", en: "FEC automation" }),
      metaIcon: PieChart,
      meta: t({ fr: "Audit & commissariat aux comptes", en: "Audit & statutory engagements" }),
      bullets: [
        t({ fr: "Importez le FEC de vos clients, contrôlez son intégrité en quelques secondes", en: "Import your clients' FEC file and check its integrity in seconds" }),
        t({ fr: "Écritures atypiques repérées et documentées automatiquement", en: "Unusual entries flagged and documented automatically" }),
      ],
      video: "/final-fec.mp4",
      poster: "/posters/final-fec.jpg",
      // Sampled from the FEC clip's own canvas background so the card and the
      // video blend into one continuous surface.
      bg: "#d2e4fa",
      ink: "#0c2d4d",
      sub: "#2f5474",
      blend: true,
    },
    {
      title: t({ fr: "Reporting mensuel", en: "Monthly reporting" }),
      metaIcon: Mail,
      meta: t({ fr: "Équipes finance & contrôle de gestion", en: "Finance & controlling teams" }),
      bullets: [
        t({ fr: "Le classeur est retraité, mis en forme et prêt à partager en un clic", en: "Your workbook is cleaned, formatted and share-ready in one click" }),
        t({ fr: "Envoi par mail automatique, le même livrable chaque mois", en: "Sent by email automatically, the same deliverable every month" }),
      ],
      video: "/ora_reporting_v3.mp4",
      poster: "/posters/ora_reporting_v3.jpg",
      // WeTransfer indigo — white text. Media zone = custom Ora+PDF mockup
      // (see `mockup`), so the decorative circle is dropped.
      bg: "#5865E3",
      ink: "#ffffff",
      sub: "rgba(255,255,255,0.78)",
      dark: true,
      mockup: "reporting",
    },
    {
      title: t({ fr: "Pointage de comptes", en: "Account matching" }),
      metaIcon: ClipboardCheck,
      meta: t({ fr: "Expertise comptable & révision", en: "Accounting firms & review" }),
      bullets: [
        t({ fr: "Vos comptes sont pointés automatiquement, les écarts ressortent immédiatement", en: "Your accounts are matched automatically, discrepancies stand out immediately" }),
        t({ fr: "La révision démarre sur des soldes justifiés, sans pointage manuel", en: "Review starts from justified balances, no manual ticking" }),
      ],
      video: "/ora_pointage_v3.mp4",
      poster: "/posters/ora_pointage_v3.jpg",
      // Streamyard royal blue — white text. Media zone = custom PDF-bilan
      // pointage mockup (see `mockup`); the video stays in the lightbox.
      bg: "#1E63E6",
      ink: "#ffffff",
      sub: "rgba(255,255,255,0.78)",
      dark: true,
      mockup: "pointage",
    },
    {
      title: t({ fr: "Extraction", en: "Extraction" }),
      metaIcon: FileText,
      meta: t({ fr: "Factures, relevés & liasses PDF", en: "Invoices, statements & PDF files" }),
      bullets: [
        t({ fr: "Vos PDF sont lus et transformés en tableau Excel exploitable, sans ressaisie", en: "Your PDFs are read and turned into a usable Excel table, no re-keying" }),
        t({ fr: "Chaque ligne, montant et référence extraits fidèlement, prêts à traiter", en: "Every line, amount and reference extracted faithfully, ready to work with" }),
      ],
      video: "/ora_pdf_extract.mp4",
      poster: "/posters/ora_pdf_extract.jpg",
      // Same pale blue as the FEC card (client swatch, 2026-07-19).
      bg: "#d2e4fa",
      ink: "#1c2a5e",
      sub: "#47548f",
      blend: true,
    },
  ];

  return (
    <div className="relative mb-40 md:mb-64">
      {/* Header */}
      <motion.div
        className="text-center max-w-3xl mx-auto mb-12 md:mb-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
      >
        <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
          {t({ fr: "Cas d'usage", en: "Use cases" })}
        </span>
        <h2 className="font-poppins font-medium text-3xl md:text-[2.75rem] tracking-[-0.03em] leading-[1.12] text-[#111827] dark:text-white mt-4">
          {t({ fr: "Concrètement, ce qu'Ora automatise", en: "Concretely, what Ora automates" })}
        </h2>
      </motion.div>

      {/* Cards */}
      <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-7xl mx-auto">
        {cases.map((c, i) => {
          const Icon = c.metaIcon;
          return (
            <motion.div
              key={c.title}
              className={`group relative overflow-hidden rounded-[28px] md:rounded-[36px] p-7 md:p-10 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)] transition-shadow duration-300 ease-out hover:shadow-[0_34px_70px_-24px_rgba(15,23,42,0.5)] ${c.mockup ? "flex flex-col" : ""}`}
              style={{ background: c.bg }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 22, mass: 0.6 }}
              variants={{
                hidden: { opacity: 0, y: 32 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: (i % 2) * 0.12 } },
              }}
            >
              {/* Decorative layer, clipped by the card. "circle": the big
                  peach disc behind the visual (WeTransfer). "rings":
                  concentric white squircle outlines (Streamyard). */}
              {c.decor === "circle" && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-[46%] w-[105%] aspect-square -translate-x-1/2 rounded-full"
                  style={{ background: "radial-gradient(circle at 38% 30%, #e4ebff 0%, #cbd6fb 55%, #b3c1f6 100%)" }}
                />
              )}
              {c.decor === "rings" && (
                <div aria-hidden className="pointer-events-none absolute inset-0">
                  <div className="absolute left-1/2 top-[58%] w-[62%] aspect-[4/3] -translate-x-1/2 -translate-y-1/2 rounded-[48px] border-2 border-white/25" />
                  <div className="absolute left-1/2 top-[58%] w-[82%] aspect-[4/3] -translate-x-1/2 -translate-y-1/2 rounded-[64px] border-2 border-white/15" />
                  <div className="absolute left-1/2 top-[58%] w-[102%] aspect-[4/3] -translate-x-1/2 -translate-y-1/2 rounded-[80px] border-2 border-white/[0.08]" />
                </div>
              )}

              {/* Title + demo pill */}
              <div className="relative flex items-center justify-between gap-4">
                <h3 className="font-poppins font-semibold text-[1.7rem] md:text-[2.2rem] tracking-[-0.02em]" style={{ color: c.ink }}>
                  {c.title}
                </h3>
                <button
                  type="button"
                  onClick={() => setActive(c)}
                  className={`group inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 md:px-5 py-2 md:py-2.5 font-inter font-semibold text-[13px] md:text-[15px] transition-colors duration-200 ${
                    c.dark ? "bg-white/15 hover:bg-white/25" : "bg-white/70 hover:bg-white"
                  }`}
                  style={{ color: c.ink }}
                >
                  {t({ fr: "Voir la démo", en: "Watch the demo" })}
                  <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>

              {/* Meta line */}
              <div className="relative mt-5 md:mt-6 flex items-center gap-2.5" style={{ color: c.ink }}>
                <Icon className="w-[18px] h-[18px]" />
                <span className="font-inter font-semibold text-[15px] md:text-base">{c.meta}</span>
              </div>

              {/* Bullets — small ring markers, Bending-Spoons style */}
              <ul className="relative mt-3 space-y-2.5">
                {c.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 font-inter text-[14px] md:text-[15.5px] leading-relaxed" style={{ color: c.sub }}>
                    <span
                      aria-hidden
                      className="mt-[7px] h-[7px] w-[7px] shrink-0 rounded-full border-[1.5px]"
                      style={{ borderColor: c.sub }}
                    />
                    {b}
                  </li>
                ))}
              </ul>

              {/* Media zone. `mockup`: the static Ora+PDF+Envoyer composition
                  bleeding to the card's side + bottom edges. Otherwise the demo
                  clip in native 16:9 (nothing cropped); with `blend` it bleeds
                  to the edges with a top gradient in the card colour so the
                  clip's upper edge melts into the card (no visible seam). */}
              {c.mockup ? (
                <div className="relative mt-auto pt-7 md:pt-9 -mx-3 md:-mx-6 -mb-7 md:-mb-10 origin-bottom transition-transform duration-500 ease-out group-hover:scale-[1.05]">
                  {c.mockup === "reporting" ? <ReportingMockup /> : <PointageMockup />}
                </div>
              ) : (
                <div
                  className={
                    c.blend
                      ? "relative mt-6 md:mt-7 -mx-7 md:-mx-10 -mb-7 md:-mb-10"
                      : "relative mt-7 md:mt-9 rounded-[18px] md:rounded-[22px] overflow-hidden shadow-[0_18px_44px_-18px_rgba(15,23,42,0.3)]"
                  }
                >
                  <video
                    src={c.video}
                    poster={c.poster}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="w-full aspect-video object-cover block"
                  />
                  {c.blend && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 top-0 h-8 md:h-10"
                      style={{ background: `linear-gradient(to bottom, ${c.bg} 0%, transparent 100%)` }}
                    />
                  )}
                </div>
              )}
            </motion.div>
          );
        })}

      </div>

      {/* Closing block — frameless, directly on the page background. The 4
          cases above are only SAMPLES: any Excel workflow can be automated
          (library + Ora Engineering custom scripts). Turns "my case isn't
          listed" into the site's #1 action: booking a call. */}
      <motion.div
        className="relative mt-14 md:mt-20 max-w-3xl mx-auto text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={{
          hidden: { opacity: 0, y: 32 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
        }}
      >
        <div className="flex items-center justify-center gap-2.5 text-blue-600 dark:text-blue-400">
          <Sparkles className="w-[18px] h-[18px]" />
          <span className="font-inter font-semibold text-[15px] md:text-base">
            {t({ fr: "Ora Engineering, automatisation sur mesure", en: "Ora Engineering, custom automation" })}
          </span>
        </div>
        <h3 className="font-poppins font-semibold text-3xl md:text-[2.5rem] tracking-[-0.03em] leading-[1.12] text-[#111827] dark:text-white mt-3">
          {t({ fr: "Et votre workflow ?", en: "What about your workflow?" })}
        </h3>
        <button
          type="button"
          onClick={openBooking}
          className="group mt-7 inline-flex items-center gap-2.5 rounded-full bg-[#3b82f6] hover:bg-[#2563eb] px-9 py-4 font-inter font-semibold text-[15px] md:text-base text-white shadow-[0_2px_12px_rgba(59,130,246,0.30)] hover:shadow-[0_4px_24px_rgba(59,130,246,0.40)] hover:-translate-y-px active:translate-y-0 transition-all duration-150"
        >
          {t({ fr: "Réserver un appel", en: "Book a call" })}
          <ArrowRight className="w-4 h-4 opacity-80 transition-transform duration-150 group-hover:translate-x-[3px]" />
        </button>
      </motion.div>

      {active && <UseCaseLightbox item={active} onClose={() => setActive(null)} />}
    </div>
  );
}

// ── Enlarged demo overlay (same pattern as the demo-video lightbox) ─────────
function UseCaseLightbox({ item, onClose }: { item: UseCase; onClose: () => void }) {
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
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 backdrop-blur-xl p-4 md:p-8"
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
            src={item.video}
            poster={item.poster}
            autoPlay
            loop
            controls
            playsInline
            className="w-full aspect-video object-contain bg-black"
          />
        </div>
        <p className="mt-3 text-center font-inter text-sm text-white/80">{item.title}</p>
      </div>
    </div>,
    document.body
  );
}
