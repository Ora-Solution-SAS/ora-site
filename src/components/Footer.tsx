import { Footer } from "./ui/footer";
import { useLang } from "@/lib/i18n";

type Page = "home" | "for-business" | "ora-experience" | "solution-template" | "not-found";

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
            { text: t({ fr: "L'expérience Ora", en: "The Ora experience" }), onClick: () => onNavigate("ora-experience") },
            {
              text: t({ fr: "Solutions entreprise", en: "Enterprise solutions" }),
              onClick: () => onNavigate("for-business"),
            },
            { text: t({ fr: "Tarifs", en: "Pricing" }), onClick: () => onNavigate("not-found") },
            { text: t({ fr: "Réserver un appel", en: "Book a call" }), onClick: onBookCall },
          ],
        },
        {
          title: t({ fr: "Ressources", en: "Resources" }),
          links: [
            { text: t({ fr: "Documentation", en: "Documentation" }), url: "#" },
            { text: t({ fr: "Support", en: "Support" }), url: "#" },
            { text: t({ fr: "Blog", en: "Blog" }), onClick: () => onNavigate("not-found") },
          ],
        },
        {
          title: t({ fr: "Réseaux", en: "Social" }),
          links: [
            { text: "LinkedIn", url: "#" },
            { text: "Twitter / X", url: "#" },
          ],
        },
      ]}
      copyright={`© ${new Date().getFullYear()} Ora – Paris • Luxembourg`}
      bottomLinks={[
        { text: t({ fr: "Mentions légales", en: "Legal notice" }), url: "#" },
        { text: t({ fr: "Politique de confidentialité", en: "Privacy policy" }), url: "#" },
        { text: t({ fr: "CGU", en: "Terms of use" }), url: "#" },
      ]}
    />
  );
};

export { OraFooter };
