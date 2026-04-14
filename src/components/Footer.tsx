import { Footer } from "./ui/footer";

type Page = "home" | "for-business" | "ora-experience" | "not-found";

interface OraFooterProps {
  onNavigate: (page: Page) => void;
  onBookCall: () => void;
  theme: "dark" | "light";
}

const OraFooter = ({ onNavigate, onBookCall, theme }: OraFooterProps) => {
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
      tagline="Automatisez vos workflows Excel. Gagnez du temps, réduisez les erreurs, concentrez-vous sur ce qui compte vraiment."
      menuItems={[
        {
          title: "Produit",
          links: [
            { text: "Accueil", onClick: () => onNavigate("home") },
            { text: "L'expérience Ora", onClick: () => onNavigate("ora-experience") },
            {
              text: "Solutions entreprise",
              onClick: () => onNavigate("for-business"),
            },
            { text: "Tarifs", onClick: () => onNavigate("not-found") },
            { text: "Réserver un appel", onClick: onBookCall },
          ],
        },
        {
          title: "Ressources",
          links: [
            { text: "Documentation", url: "#" },
            { text: "Support", url: "#" },
            { text: "Blog", onClick: () => onNavigate("not-found") },
          ],
        },
        {
          title: "Réseaux",
          links: [
            { text: "LinkedIn", url: "#" },
            { text: "Twitter / X", url: "#" },
          ],
        },
      ]}
      copyright={`© ${new Date().getFullYear()} Ora – Paris • Luxembourg`}
      bottomLinks={[
        { text: "Mentions légales", url: "#" },
        { text: "Politique de confidentialité", url: "#" },
        { text: "CGU", url: "#" },
      ]}
    />
  );
};

export { OraFooter };
