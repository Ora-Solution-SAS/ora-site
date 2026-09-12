import type { CSSProperties } from "react";

/**
 * OraStar — l'étoile du logiciel : QUATRE branches concaves, pas le `Sparkles`
 * de Lucide. Le client a signalé la différence le 2026-09-09, captures à
 * l'appui : c'est la marque de l'assistant dans l'application, elle doit être
 * identique partout où le site montre l'agent.
 *
 * Elle vit ici, dans un fichier à elle, parce qu'elle sert des DEUX CÔTÉS :
 * les maquettes de la page produit (AppMockups) et le panneau « Changement de
 * structure » de la landing (AutomationTabs). La dupliquer la ferait diverger,
 * et importer AppMockups depuis la landing y ferait entrer toutes les
 * maquettes Excel pour un seul SVG.
 */
export default function OraStar({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden>
      <path d="M12 2C12.9 7.6 16.4 11.1 22 12C16.4 12.9 12.9 16.4 12 22C11.1 16.4 7.6 12.9 2 12C7.6 11.1 11.1 7.6 12 2Z" />
    </svg>
  );
}
