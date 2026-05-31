import { Footer } from "./ui/footer";
import { useLang } from "@/lib/i18n";

type Page = "home" | "for-business" | "ora-experience" | "solution-expertise-comptable" | "solution-audit" | "solution-fonds-investissement" | "solution-banque-affaires" | "pricing" | "not-found";

interface OraFooterProps {
  onNavigate: (page: Page) => void;
  onBookCall: () => void;
  theme: "dark" | "light";
}

const OraFooter = ({ onNavigate, onBookCall, theme }: OraFooterProps) => {
  const { t } = useLang();
  const logoSrc =
    theme === "dark"
      ? "/logos/logo-color-light.png"
      : "/logos/logo-color-dark.png";

  return (
    <Footer
      logo={{
        src: logoSrc,
        alt: "Ora",
        title: "Ora",
        onClick: () => onNavigate("home"),
      }}
      tagline={t({
        fr: "Automatisez vos workflows Excel. Gagnez du temps, réduisez les erreurs, concentrez-vous sur ce qui compte vraiment.",
        en: "Automate your Excel workflows. Save time, reduce errors, focus on what actually matters.",
      })}
      menuItems={[
        {
          title: t({ fr: "Produit", en: "Product" }),
          links: [
            { text: t({ fr: "Accueil", en: "Home" }), onClick: () => onNavigate("home") },
            // "L'expérience Ora" and "Tarifs" temporarily hidden until live.
            { text: t({ fr: "Réserver un appel", en: "Book a call" }), onClick: onBookCall },
          ],
        },
        {
          title: t({ fr: "Solutions métier", en: "Industry solutions" }),
          links: [
            { text: t({ fr: "Expertise Comptable", en: "Accounting" }), onClick: () => onNavigate("solution-expertise-comptable") },
            { text: t({ fr: "Audit", en: "Audit" }), onClick: () => onNavigate("solution-audit") },
            { text: t({ fr: "Fonds d'investissement", en: "Investment funds" }), onClick: () => onNavigate("solution-fonds-investissement") },
            { text: t({ fr: "Banque d'affaires", en: "Investment banking" }), onClick: () => onNavigate("solution-banque-affaires") },
          ],
        },
      ]}
      copyright={`© ${new Date().getFullYear()} Ora`}
      bottomLinks={[
        { text: t({ fr: "Mentions légales", en: "Legal notice" }), url: "#" },
        { text: t({ fr: "Politique de confidentialité", en: "Privacy policy" }), url: "#" },
        { text: t({ fr: "CGU", en: "Terms of use" }), url: "#" },
      ]}
    />
  );
};

export { OraFooter };
