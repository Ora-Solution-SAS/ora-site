import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/lib/i18n";

/**
 * "L'expédition Ora" — the 3 phases of the Ora journey, told minimally.
 *
 * A clean, single-column vertical timeline on the page's normal background.
 * A thin brand-gradient trail draws itself as the user scrolls (rAF-throttled
 * listener — Framer's useScroll does not stay in sync with this site's Lenis
 * smooth-scroll, so we compute progress manually and write to a ref, the same
 * pattern used elsewhere in the app). Each chapter fades up as it enters view.
 */

interface OraJourneyProps {
  theme: "light" | "dark";
  openBooking: () => void;
}

export default function OraJourney({ theme, openBooking }: OraJourneyProps) {
  const { t } = useLang();
  const dk = theme === "dark";
  const containerRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  const bg = dk ? "#111827" : "#fcfbf7";
  const railColor = dk ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";

  // Trail draws as the timeline scrolls through the viewport.
  // Progress mirrors offset ["start 75%", "end 65%"]; written straight to the
  // DOM ref to avoid a re-render per frame.
  useEffect(() => {
    let raf = 0;
    const compute = () => {
      raf = 0;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const denom = vh * 0.1 + rect.height;
      const p = Math.min(1, Math.max(0, (vh * 0.75 - rect.top) / denom));
      if (fillRef.current) fillRef.current.style.height = `${(p * 100).toFixed(3)}%`;
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const chapters = [
    {
      num: "01",
      kicker: t({ fr: "Le point de départ", en: "The starting point" }),
      title: t({ fr: "On cartographie votre terrain.", en: "We map your terrain." }),
      desc: t({
        fr: "On analyse vos workflows Excel, on repère les tâches qui vous freinent et on chiffre le temps que vous allez récupérer.",
        en: "We analyse your Excel workflows, spot the tasks slowing you down and quantify the time you will get back.",
      }),
    },
    {
      num: "02",
      kicker: t({ fr: "La mise en orbite", en: "Into orbit" }),
      title: t({ fr: "On déploie, on embarque vos équipes.", en: "We deploy, we bring your teams aboard." }),
      desc: t({
        fr: "On installe Ora dans votre environnement, on configure vos premiers workflows et on forme votre équipe en quelques jours.",
        en: "We install Ora in your environment, configure your first workflows and train your team in a matter of days.",
      }),
    },
    {
      num: "03",
      kicker: t({ fr: "Le voyage continue", en: "The voyage continues" }),
      title: t({ fr: "On reste à bord, à vos côtés.", en: "We stay aboard, beside you." }),
      desc: t({
        fr: "On suit vos workflows en continu, on ajuste les automatisations quand vos besoins évoluent et on reste disponible.",
        en: "We monitor your workflows continuously, adjust automations as your needs evolve and stay available.",
      }),
    },
  ];

  return (
    <section className="px-6 py-24 md:py-36" style={{ background: bg }}>
      <div className="max-w-2xl mx-auto">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="text-center mb-20 md:mb-24">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`inline-block font-inter text-[11px] font-semibold uppercase tracking-[0.18em] mb-5 ${
              dk ? "text-blue-400" : "text-blue-600"
            }`}
          >
            {t({ fr: "Le voyage", en: "The journey" })}
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
            className={`font-poppins font-light tracking-[-0.04em] leading-[1.1] text-3xl md:text-5xl ${
              dk ? "text-white" : "text-[#111827]"
            }`}
          >
            {t({ fr: "L'expédition Ora", en: "The Ora expedition" })}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.16 }}
            className={`mt-5 mx-auto font-inter text-base leading-[1.7] max-w-md ${
              dk ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {t({
              fr: "Trois chapitres, du chaos de vos tableurs à des workflows qui tournent tout seuls.",
              en: "Three chapters, from spreadsheet chaos to workflows that run themselves.",
            })}
          </motion.p>
        </div>

        {/* ── Timeline ────────────────────────────────────────────────── */}
        <div ref={containerRef} className="relative">
          {/* Faint full-height rail */}
          <div
            aria-hidden
            className="absolute top-1 bottom-1 left-[19px] w-px"
            style={{ background: railColor }}
          />
          {/* Drawn fill — grows with scroll */}
          <div
            ref={fillRef}
            aria-hidden
            className="absolute top-1 left-[19px] w-px"
            style={{
              height: "0%",
              background: "linear-gradient(to bottom, #3b82f6, #0d9488)",
            }}
          />

          <div className="flex flex-col gap-16 md:gap-20">
            {chapters.map((c) => (
              <motion.div
                key={c.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="relative pl-16"
              >
                {/* Numbered node */}
                <div
                  className="absolute top-0 left-0 flex items-center justify-center w-10 h-10 rounded-full"
                  style={{
                    background: bg,
                    border: `1.5px solid ${dk ? "rgba(59,130,246,0.5)" : "rgba(59,130,246,0.4)"}`,
                  }}
                >
                  <span className={`font-poppins font-semibold text-sm ${dk ? "text-blue-400" : "text-blue-600"}`}>
                    {c.num}
                  </span>
                </div>

                <p className={`font-inter text-[12px] font-semibold uppercase tracking-[0.16em] mb-2 ${dk ? "text-gray-500" : "text-gray-400"}`}>
                  {c.kicker}
                </p>
                <h3 className={`font-poppins font-light tracking-[-0.02em] text-xl md:text-2xl leading-snug mb-3 ${dk ? "text-white" : "text-[#111827]"}`}>
                  {c.title}
                </h3>
                <p className={`font-inter text-[15px] leading-[1.7] ${dk ? "text-gray-400" : "text-gray-500"}`}>
                  {c.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Closing CTA ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 md:mt-24 text-center"
        >
          <p className={`font-inter text-base mb-6 ${dk ? "text-gray-400" : "text-gray-500"}`}>
            {t({ fr: "Le premier chapitre commence par un simple appel.", en: "The first chapter starts with a simple call." })}
          </p>
          <button
            onClick={openBooking}
            className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-inter font-semibold text-white transition-all duration-150 hover:-translate-y-px active:translate-y-0 bg-gradient-to-r from-[#3b82f6] to-[#0d9488] shadow-[0_2px_8px_rgba(0,0,0,0.1),0_8px_24px_rgba(37,99,235,0.35)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.1),0_12px_32px_rgba(37,99,235,0.45)]"
          >
            {t({ fr: "Commencer l'aventure", en: "Begin the adventure" })}
            <ArrowRight className="w-4 h-4 opacity-80 group-hover:translate-x-[3px] transition-transform duration-150" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
