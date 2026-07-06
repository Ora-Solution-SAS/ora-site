import { Footer } from "./ui/footer";
import { useLang } from "@/lib/i18n";

type Page = "home" | "for-business" | "ora-experience" | "solution-expertise-comptable" | "solution-audit" | "solution-fonds-investissement" | "solution-banque-affaires" | "pricing" | "mentions-legales" | "politique-confidentialite" | "cgu" | "not-found";

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

  // The per-industry pages aren't finished: these links scroll to the
  // homepage "Conçu pour votre métier" section with the matching branch
  // selected (App handles the event, including from other pages).
  const goToIndustry = (id: string) =>
    window.dispatchEvent(new CustomEvent("ora:goto-industry", { detail: { id } }));

  return (
    <Footer
      logo={{
        src: logoSrc,
        alt: "Ora",
        title: "Ora",
        onClick: () => onNavigate("home"),
      }}
      tagline={t({
        fr: "Automatisez vos tâches Excel. Gagnez du temps, réduisez les erreurs, concentrez-vous sur ce qui compte vraiment.",
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
            { text: t({ fr: "Expertise Comptable", en: "Accounting" }), onClick: () => goToIndustry("comptable") },
            { text: t({ fr: "Audit", en: "Audit" }), onClick: () => goToIndustry("audit") },
            { text: t({ fr: "Fonds d'investissement", en: "Investment funds" }), onClick: () => goToIndustry("fonds") },
            { text: t({ fr: "Banque d'affaires", en: "Investment banking" }), onClick: () => goToIndustry("banque") },
          ],
        },
      ]}
      legal={t({
        fr: "ORA SOLUTION · SAS au capital de 2 040 € · Siège social : 229 rue Saint-Honoré, 75001 Paris · SIREN 106 290 950 · SIRET 106 290 950 00018 · RCS Paris · TVA intracommunautaire FR09106290950",
        en: "ORA SOLUTION · SAS with share capital of €2,040 · Registered office: 229 rue Saint-Honoré, 75001 Paris · SIREN 106 290 950 · SIRET 106 290 950 00018 · RCS Paris · Intra-EU VAT FR09106290950",
      })}
      copyright={`© ${new Date().getFullYear()} Ora`}
      bottomLinks={[
        { text: t({ fr: "Mentions légales", en: "Legal notice" }), onClick: () => onNavigate("mentions-legales") },
        { text: t({ fr: "Politique de confidentialité", en: "Privacy policy" }), onClick: () => onNavigate("politique-confidentialite") },
        { text: t({ fr: "CGU", en: "Terms of use" }), onClick: () => onNavigate("cgu") },
      ]}
    />
  );
};

export { OraFooter };
