/**
 * LegalDocLayout — shared shell for the legal document pages
 * (Mentions légales, Politique de confidentialité, CGU).
 *
 * Clean, readable single-column layout: back-to-home link, title, last-updated
 * line, optional intro, then a list of numbered sections. Matches the brand
 * typography (Poppins headings, Inter body) and the light/dark section colors.
 *
 * Source text lives in Ora_V2/docs/legal/*.md and is kept in sync here.
 * The internal "à faire valider par un juriste" banner from the source is
 * intentionally NOT rendered on the public site.
 */

import { ArrowLeft } from "lucide-react";
import { useLang } from "@/lib/i18n";

export type LegalSection = { heading: string; body: React.ReactNode };

type Props = {
  theme: "light" | "dark";
  onBackHome: () => void;
  title: string;
  lastUpdated: string;
  intro?: React.ReactNode;
  sections: LegalSection[];
};

const LegalDocLayout: React.FC<Props> = ({
  theme,
  onBackHome,
  title,
  lastUpdated,
  intro,
  sections,
}) => {
  const { t } = useLang();
  const dk = theme === "dark";

  return (
    <main
      className="min-h-screen px-6 md:px-12 pt-32 md:pt-40 pb-24 md:pb-32"
      style={{ backgroundColor: dk ? "#111827" : "#fcfbf7" }}
    >
      <div className="max-w-3xl mx-auto">
        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-2 text-[14px] font-inter font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-150 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t({ fr: "Retour à l'accueil", en: "Back to home" })}
        </button>

        <h1 className="font-poppins font-semibold text-4xl md:text-5xl tracking-[-0.03em] leading-[1.1] text-[#111827] dark:text-white">
          {title}
        </h1>
        <p className="mt-4 font-inter text-[14px] text-gray-400 dark:text-gray-500">
          {lastUpdated}
        </p>

        {intro && (
          <div className="mt-8 font-inter text-[15px] md:text-base leading-[1.75] text-gray-600 dark:text-gray-300 space-y-4">
            {intro}
          </div>
        )}

        <div className="mt-12 space-y-10">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-poppins font-semibold text-xl md:text-[1.4rem] tracking-tight text-[#111827] dark:text-white mb-3">
                {s.heading}
              </h2>
              <div className="font-inter text-[15px] md:text-base leading-[1.75] text-gray-600 dark:text-gray-300 space-y-4">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
};

export default LegalDocLayout;
