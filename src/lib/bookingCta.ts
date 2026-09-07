/**
 * bookingCta — ce que fait, et ce que dit, l'appel à l'action principal du site.
 *
 * ══ POURQUOI CE MODULE EXISTE ═══════════════════════════════════════════════
 * Client 2026-09-07 : « supprime tout court le bouton "réserver un appel" pour
 * l'instant », puis, sur la question du remplaçant : « Nous écrire » à la place.
 * Le mot « réserver » ne doit plus apparaître tant que le calendrier n'est pas
 * ouvert, sous peine de promettre une prise de rendez-vous qui n'existe pas.
 *
 * Le bouton est posé à une VINGTAINE d'endroits rien que sur l'accueil : barre
 * de navigation (deux fois, bureau et tiroir mobile), hero (deux fois, bureau
 * et mobile), panneaux d'automatisation, grille bento, Atlas, plateforme, bloc
 * de clôture, pied de page, fenêtres d'agrandissement. Les changer un par un,
 * c'est en oublier un, et un seul bouton resté sur « Réserver un appel » ouvre
 * une fenêtre qui dit le contraire.
 *
 * Tout passe donc par ici : LE LIBELLÉ et LE GESTE. Rétablir la réservation ne
 * demande pas de rouvrir vingt fichiers, seulement de poser
 * `VITE_BOOKING_ENABLED=true` (voir bookingEnabled.ts).
 *
 * ⚠ LE GESTE N'EST PAS CÂBLÉ ICI. Chaque bouton appelle déjà `openBooking`,
 * transmis depuis App.tsx : c'est LÀ que la bascule se fait, en une ligne, vers
 * l'ouverture du brouillon de courriel. Ce module ne porte que le libellé et la
 * construction du lien, pour que rien n'ait à connaître les deux.
 */

import { BOOKING_ENABLED } from "@/components/booking/bookingEnabled";

/** L'adresse de contact, la même que la sortie de secours de SlotPicker.tsx. */
export const EMAIL_CONTACT = "contact@ora-solution.com";

/**
 * Le libellé de l'appel à l'action principal.
 *
 * ⚠ « Nous écrire » ET NON « Nous contacter ». Le premier dit le geste exact
 * qui va suivre — une fenêtre de courriel s'ouvre — le second laisse croire à
 * un formulaire, voire à un numéro. Un bouton doit annoncer ce qu'il fait.
 */
export const BOOKING_CTA = BOOKING_ENABLED
  ? { fr: "Réserver un appel", en: "Book a call" }
  : { fr: "Nous écrire", en: "Write to us" };

/** La variante des blocs de clôture, qui parlaient à la première personne. */
export const BOOKING_CTA_MINE = BOOKING_ENABLED
  ? { fr: "Réserver mon appel", en: "Book my call" }
  : { fr: "Nous écrire", en: "Write to us" };

/**
 * Le brouillon de message.
 *
 * ⚠ IL EST PRÉRÉDIGÉ, et c'est le même parti pris que la sortie de secours de
 * la fenêtre de réservation : un `mailto:` nu ouvre une page blanche, le
 * visiteur doit trouver quoi écrire, et beaucoup referment. Le brouillon pose
 * la demande et laisse TROIS CHAMPS À TROUS — rien n'est affirmé à sa place, on
 * lui épargne seulement la page blanche.
 *
 * ⚠ LES SAUTS DE LIGNE SONT DES CRLF. Certains clients de messagerie ignorent
 * un `\n` seul dans un `mailto:` et rendent le corps sur une seule ligne.
 */
export function contactMailto(lang: "fr" | "en"): string {
  const sujet =
    lang === "fr" ? "Prise de contact Ora" : "Getting in touch with Ora";
  const corps =
    lang === "fr"
      ? "Bonjour,\r\n\r\n" +
        "J'aimerais en savoir plus sur Ora.\r\n\r\n" +
        "Structure : \r\n" +
        "Ce que j'aimerais automatiser : \r\n" +
        "Mes disponibilités pour un échange : \r\n\r\n" +
        "Merci,\r\n"
      : "Hello,\r\n\r\n" +
        "I would like to know more about Ora.\r\n\r\n" +
        "Company: \r\n" +
        "What I would like to automate: \r\n" +
        "When I am available for a call: \r\n\r\n" +
        "Thanks,\r\n";
  return `mailto:${EMAIL_CONTACT}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`;
}
