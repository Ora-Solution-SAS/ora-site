import OraLogoSpinner from "../components/OraLogoSpinner";
import { useLang } from "../lib/i18n";

// ── Page ──────────────────────────────────────────────────────────────────

type NotFoundPageProps = {
  theme: "light" | "dark";
  onNavigate: (page: "home" | "for-business" | "not-found") => void;
};

export default function NotFoundPage({ onNavigate }: NotFoundPageProps) {
  const { t } = useLang();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#ffffff] dark:bg-[#111827]">
      {/* Animated logo */}
      <OraLogoSpinner gradientId="g-404" />

      <p className="mt-8 text-[11px] font-semibold uppercase tracking-widest text-blue-500">
        {t({ fr: "Erreur 404", en: "Error 404" })}
      </p>

      <h1 className="mt-3 font-poppins text-5xl md:text-7xl font-bold tracking-[-0.03em] text-[#111827] dark:text-white text-center">
        {t({ fr: "Page introuvable", en: "Page not found" })}
      </h1>

      <p className="mt-5 text-[16px] text-gray-500 dark:text-gray-400 text-center max-w-md">
        {t({
          fr: "Cette page est en cours de construction. Elle sera bientôt disponible.",
          en: "This page is under construction. It will be available soon.",
        })}
      </p>

      <button
        onClick={() => onNavigate("home")}
        className="mt-10 inline-flex items-center px-6 py-3 rounded-full text-[14px] font-semibold text-white bg-gradient-to-r from-[#3b82f6] to-[#0d9488] shadow-[0_2px_10px_rgba(59,130,246,0.22)] hover:shadow-[0_4px_18px_rgba(59,130,246,0.35)] hover:-translate-y-px active:translate-y-0 transition-all duration-150"
      >
        {t({ fr: "Retour à l'accueil", en: "Back to home" })}
      </button>
    </div>
  );
}
