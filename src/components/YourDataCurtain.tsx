import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";

/**
 * YourDataCurtain — the "Vos données restent chez vous" panel, pulled out of
 * the FeaturesScrolly list so it can act as the sticky partner beneath Atlas:
 * it pins (`sticky top-0`, z-10) while AtlasShowcase (z-20) rises up over it,
 * exactly like ExcelReveal + the demo video at the top of the page. The
 * `relative` wrapper in App.tsx bounds the pin to these two sections.
 *
 * Desktop (md+) only — it pins. On mobile it renders as a normal stacked
 * section (no curtain), so the message is still shown.
 */
export default function YourDataCurtain() {
  const { t } = useLang();

  return (
    <section
      data-nav-shy
      className="sticky top-0 z-[10] min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-[#111827] px-6 md:px-12 py-20 md:py-0"
    >
      <motion.div
        className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] gap-10 md:gap-16 items-center"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Text */}
        <div>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/[0.08] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-500 dark:text-blue-400">
              {t({ fr: "Local & sécurisé", en: "Local & secure" })}
            </span>
          </div>
          <h3 className="font-poppins font-semibold text-3xl md:text-[2.75rem] tracking-[-0.02em] text-gray-900 dark:text-white leading-[1.12]">
            {t({ fr: "Vos données restent chez vous", en: "Your data stays with you" })}
          </h3>
          <p className="font-inter mt-5 text-base md:text-lg leading-relaxed text-gray-500 dark:text-gray-400 max-w-lg">
            {t({
              fr: "Le traitement s'exécute en local, sur votre machine. Vos fichiers sont chiffrés sur votre appareil avant tout envoi, puis stockés en Suisse, illisibles sur nos serveurs.",
              en: "Processing runs locally, on your machine. Your files are encrypted on your device before anything is sent, then stored in Switzerland, unreadable on our servers.",
            })}
          </p>
        </div>

        {/* Video — dark navy frame matched to the clip's own background. */}
        <div className="relative w-full rounded-[30px] p-5 md:p-7" style={{ background: "linear-gradient(180deg, #0c0c2a 0%, #080820 55%, #06061a 100%)" }}>
          <div className="relative w-full rounded-[18px] overflow-hidden" style={{ aspectRatio: "16 / 10" }}>
            <video
              src="/feature-secure.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="w-full h-full object-cover block"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
