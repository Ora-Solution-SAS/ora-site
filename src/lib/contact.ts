/**
 * ── ÉCRIRE PLUTÔT QUE RÉSERVER, SUR TÉLÉPHONE ───────────────────────────────
 *
 * Client 2026-09-07 : « replace book a call by the possibility to send us an
 * email… only for the mobile version, it doesn't have to change anything on the
 * computer version ».
 *
 * Le site pousse à la prise de rendez-vous — c'est son objectif déclaré dans
 * CLAUDE.md, et il le reste sur PC. Sous `md`, les appels mènent au courriel :
 * les quatre boutons de la version téléphone passent par ici, et par ici
 * seulement, pour que l'adresse ne se retrouve pas recopiée à quatre endroits.
 *
 * L'adresse est celle déjà servie par les CGU, la page de téléchargement et le
 * sélecteur de créneau ; elle n'est pas inventée pour l'occasion.
 */
export const CONTACT_EMAIL = "contact@ora-solution.com";

/**
 * Le lien d'écriture, objet compris. L'objet évite l'arrivée d'un message sans
 * titre, et dit d'où vient la personne.
 */
export function mailtoHref(subject: string) {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

/**
 * Le libellé d'un appel à la réservation, courriel sur téléphone.
 *
 * Dix-huit boutons portent cet appel dans les pages, sous six formulations
 * différentes — « Réserver un appel », « … un appel découverte », « … un appel
 * gratuit », « Réserver mon appel ». Toutes disent la même chose sur téléphone,
 * où le rendez-vous n'est plus le chemin proposé.
 *
 * `narrow` est passé plutôt que lu ici : ces libellés vivent au milieu du JSX,
 * et un hook appelé là serait un hook appelé sous condition.
 */
export function bookingCtaLabel(
  narrow: boolean,
  t: (m: { fr: string; en: string }) => string,
  fallback: { fr: string; en: string },
) {
  return narrow ? t({ fr: "Nous écrire", en: "Email us" }) : t(fallback);
}
