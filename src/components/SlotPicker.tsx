import { Mail } from "lucide-react";
import { useLang } from "@/lib/i18n";

/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  CE FICHIER NE PORTE PLUS QUE LA SORTIE DE SECOURS                       ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * ⚠ LE PRÉ-SÉLECTEUR DE CRÉNEAU A ÉTÉ SUPPRIMÉ LE 2026-09-05, avec tout ce qui
 * le servait : le composant SlotPicker, sa grille de mois, ses quatre heures
 * par jour (DAY_PATTERNS), le type Slot, et surtout buildOpenDays / graine /
 * TAUX_OUVERTURE, qui FABRIQUAIENT la disponibilité en tirant l ouverture d un
 * jour d un hash de sa date.
 *
 * Client : « ca ne va pas car apres on a cal.com qui nous affiche cela, pas
 * coherent ». Le tunnel enchainait deux calendriers, le notre invente puis
 * celui de Cal.com, reel. Ils ne pouvaient que se contredire. Pire, le
 * visiteur choisissait son horaire DEUX FOIS : l embed Cal n accepte qu une
 * date et pas une heure, donc l heure deja cliquee ne partait que dans les
 * notes et Cal la redemandait. La fenetre de reservation n a plus qu un ecran,
 * l embed.
 *
 * ⚠ NE PAS RESSUSCITER CE COMPOSANT depuis l historique git sans brancher la
 * VRAIE disponibilite. Un calendrier maison devant l embed recree exactement la
 * contradiction qu on vient de retirer, et avec elle la mention de rarete qui
 * s appuyait dessus.
 *
 * ✔ LA CONSIGNE CI-DESSUS A ETE HONOREE LE 2026-09-07, pas contournee. Cal.com
 * est parti (client : « cree toi-meme un systeme de calendrier relie a mon
 * adresse mail »), et le calendrier qui l a remplace, BookingFlow.tsx, ne
 * fabrique aucun horaire : il lit l agenda Infomaniak en CalDAV par
 * /api/availability. Les deux griefs de 2026-09-05 tombent donc ensemble :
 *   · plus DEUX calendriers a la suite, donc plus de contradiction possible ;
 *   · plus DEUX choix d horaire, le formulaire recoit l instant exact.
 * Ce qui reste interdit est inchange : un calendrier qui invente sa
 * disponibilite, quel que soit ce qu il y a derriere.
 *
 * Ce qui reste ici est le bouton « aucune date ne me convient », monte sous
 * l embed : il n a jamais dependu de la grille.
 */

/** ── ÉCRIRE PLUTÔT QUE RÉSERVER ────────────────────────────────────────────
 *  Client 2026-08-29 : « il faut aussi un bouton pour juste nous contacter,
 *  qu'on puisse directement nous envoyer un mail ou un message préfait ».
 *
 *  ⚠ IL EST MONTÉ SOUS L'EMBED CAL, et il doit y rester visible SANS
 *  défilement. Il avait été dédoublé le 2026-08-29 pour exister aussi dans le
 *  pré-sélecteur, parce qu'à l'époque il ne s'atteignait qu'après avoir trouvé
 *  une heure — soit jamais, pour celui à qui il s'adresse. Le pré-sélecteur a
 *  disparu le 2026-09-05, il n'a donc plus qu'un point de montage ; mais le
 *  raisonnement tient toujours contre l'embed.
 *  ✔ DETTE LEVÉE LE 2026-09-07. Le grief tenait à l'embed Cal, assez haut pour
 *  pousser ce bouton sous le pli d'une fenêtre bornée à 80 vh. L'embed est
 *  parti ; BookingFlow monte désormais ce bouton lui-même, et seulement sur les
 *  écrans où l'on CHERCHE une date. Mesuré sur un écran de 844 px : il est
 *  visible sans défiler sous la grille du mois.
 *  ⚠ IL N'APPARAÎT PLUS SUR L'ÉCRAN DE CONFIRMATION, à dessein : proposer
 *  d'écrire à quelqu'un avec qui on vient de prendre rendez-vous fabrique un
 *  doute là où l'on vient de rassurer.
 *
 *  ⚠ LE CORPS DU MESSAGE EST PRÉRÉDIGÉ. Un `mailto:` nu ouvre une fenêtre vide,
 *  le visiteur doit trouver quoi écrire et beaucoup referment. Le brouillon
 *  pose la demande et laisse TROIS CHAMPS À TROUS : rien n'est affirmé à la
 *  place du visiteur, on lui épargne seulement la page blanche.
 *
 *  ⚠ LES SAUTS DE LIGNE SONT DES CRLF, encodés par `encodeURIComponent`. Un
 *  simple retour à la ligne non encodé est ignoré par Outlook et par Mail, et
 *  le brouillon arrive en un seul bloc.
 *
 *  ⚠ « RÉPONSE SOUS 24 H OUVRÉES » N'EST PAS INVENTÉ : c'est le mot pour mot de
 *  DownloadPage.tsx, où l'engagement est déjà pris. Deux endroits du site ne
 *  doivent pas promettre deux délais. */
const EMAIL_CONTACT = "contact@ora-solution.com";

export function ContactDirect() {
  const { t } = useLang();
  const corps = t({
    fr:
      "Bonjour,\r\n\r\n" +
      "Aucun créneau ne me convient, je préfère échanger autrement.\r\n\r\n" +
      "Structure : \r\n" +
      "Ce que j'aimerais automatiser : \r\n" +
      "Mes disponibilités : \r\n\r\n" +
      "Merci,\r\n",
    en:
      "Hello,\r\n\r\n" +
      "None of the slots work for me, I would rather talk another way.\r\n\r\n" +
      "Company: \r\n" +
      "What I would like to automate: \r\n" +
      "When I am available: \r\n\r\n" +
      "Thanks,\r\n",
  });
  const sujet = t({ fr: "Demande de rendez-vous Ora", en: "Ora call request" });
  return (
    <div className="mt-5 border-t border-[#0a2540]/[0.08] pt-5 dark:border-white/10">
      <a
        href={`mailto:${EMAIL_CONTACT}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`}
        className="flex w-full items-center justify-center gap-2.5 rounded-[10px] border border-[#0a2540]/[0.14] px-4 py-3 font-inter text-[13.5px] font-semibold text-[#42506b] transition-colors duration-150 hover:border-[#0a2540]/[0.28] hover:bg-[#0a2540]/[0.03] dark:border-white/15 dark:text-gray-300 dark:hover:bg-white/[0.06]"
      >
        <Mail className="h-4 w-4 shrink-0 text-[#5b6577] dark:text-gray-400" strokeWidth={1.9} aria-hidden />
        {t({ fr: "Aucune date ne me convient, nous écrire", en: "No date works for me, write to us" })}
      </a>
      <p className="mt-2 text-center font-inter text-[12px] leading-tight text-[#6b7688] dark:text-gray-500">
        {t({ fr: "Message prérempli, réponse sous 24 h ouvrées", en: "Pre-filled message, reply within 1 business day" })}
      </p>
    </div>
  );
}
