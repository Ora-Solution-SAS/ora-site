/**
 * L'interrupteur de la réservation en ligne, dans un module à lui.
 *
 * Il est lu à DEUX endroits qui ne peuvent pas se le passer par prop :
 * BookingFlow, qui décide d'appeler le service ou non, et la colonne de gauche
 * de la fenêtre dans App.tsx, dont la phrase d'accroche doit dire la même
 * chose. Elle promettait « choisissez une heure, c'est tout » à côté d'un
 * panneau annonçant que la réservation n'est pas ouverte : deux moitiés de la
 * même fenêtre qui se contredisaient à trois centimètres d'écart.
 *
 * ⚠ FERMÉ PAR DÉFAUT. Le raisonnement complet est dans l'en-tête de
 * BookingFlow.tsx : un drapeau qu'il faudrait poser pour DÉSACTIVER laisserait
 * la réservation ouverte partout où on l'a oublié, c'est-à-dire là où les
 * identifiants manquent aussi.
 */
export const BOOKING_ENABLED =
  // `import.meta.env` n'existe que sous Vite : hors du navigateur (un script
  // de vérification, un futur rendu serveur) l'accès direct lève. Le repli
  // laisse la réservation FERMÉE, ce qui est le bon défaut.
  (import.meta.env?.VITE_BOOKING_ENABLED as string | undefined) === "true";
