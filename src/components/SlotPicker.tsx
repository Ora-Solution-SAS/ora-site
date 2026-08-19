import { useMemo } from "react";
import { useLang } from "@/lib/i18n";

/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  LE CHOIX DU CRÉNEAU, EN UN ÉCRAN                                        ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Client 2026-08-19 : « pour réserver un appel, fais quelque chose de beaucoup
 * plus straight to the point. Ne mets pas combien d'heures vous passez, etc.
 * Juste réserve un créneau et mets quatre créneaux disponibles par jour, le
 * matin et l'après-midi, un jour sur deux. »
 *
 * Ce qui a été RETIRÉ du parcours avec l'arrivée de cet écran : les quatre
 * questions de qualification (canal, métier, tâche, volume horaire) et l'écran
 * de récapitulation qui les relisait. Ils demandaient quatre clics et une
 * lecture avant de montrer la moindre disponibilité, sur le seul chemin de
 * conversion du site. `QualifierFlow.tsx` et `QualifierResult.tsx` restent dans
 * le dépôt, ils ne sont simplement plus montés.
 *
 * ⚠ CES CRÉNEAUX SONT UNE GRILLE D'AFFICHAGE, PAS UNE DISPONIBILITÉ RÉELLE.
 * Ils sont calculés ici, dans le navigateur, à partir des trois constantes
 * ci-dessous. Cal.com, qui confirme la réservation à l'étape suivante, a SA
 * PROPRE disponibilité, réglée dans le tableau de bord Cal du compte. Si les
 * deux ne disent pas la même chose, le visiteur choisit ici un horaire que Cal
 * refuse ensuite, et c'est pire que pas de sélecteur du tout. La disponibilité
 * Cal doit donc être réglée sur la même grille : ces quatre heures-là, un jour
 * sur deux, en semaine.
 */

/** Deux le matin, deux l'après-midi. L'ordre compte : la moitié gauche de la
 *  grille est le matin, la moitié droite l'après-midi, et l'en-tête de colonnes
 *  s'appuie dessus. Passer à six créneaux demanderait de revoir cet en-tête. */
export const SLOT_TIMES = ["09:30", "11:00", "14:00", "16:30"] as const;

/** « Un jour sur deux ». 1 donnerait tous les jours ouvrés, 3 un jour sur
 *  trois. Les week-ends sont sautés sans consommer le pas (voir buildDays). */
const DAY_STEP = 2;

/** Cinq jours proposés, soit vingt créneaux : assez pour que personne n'ait à
 *  demander « et la semaine d'après ? », assez peu pour tenir sans défilement
 *  interminable dans la colonne droite de la modale. */
const DAYS_SHOWN = 5;

export type Slot = {
  /** `YYYY-MM-DD`, le format attendu par la config `date` de l'embed Cal.com. */
  iso: string;
  /** `HH:MM`, tel qu'affiché sur la pastille. */
  time: string;
  /** Le jour, déjà mis en toutes lettres dans la langue courante. */
  dayLabel: string;
};

/**
 * Construit la liste des jours proposés.
 *
 * On part de DEMAIN, jamais d'aujourd'hui : proposer 09:30 à quelqu'un qui lit
 * la page à 14 h est une case morte, et une grille dont la première ligne est
 * à moitié grisée se lit comme un agenda déjà plein.
 *
 * Le week-end ne consomme pas le pas : on avance d'un jour à la fois jusqu'à
 * retomber en semaine, PUIS on applique le pas. Sans cette distinction, un pas
 * de 2 tombant un vendredi sauterait au dimanche, puis au mardi, et la grille
 * perdrait le lundi et le mercredi sans raison.
 */
function buildDays(step: number, count: number): Date[] {
  const out: Date[] = [];
  const cur = new Date();
  cur.setHours(0, 0, 0, 0);
  cur.setDate(cur.getDate() + 1);

  // Garde-fou : une grille de 5 jours ouvrés un jour sur deux tient largement
  // dans 60 itérations. La borne évite qu'une constante mal réglée (step 0)
  // ne fige l'onglet dans une boucle infinie.
  let guard = 0;
  while (out.length < count && guard++ < 60) {
    const dow = cur.getDay();
    if (dow === 0 || dow === 6) {
      cur.setDate(cur.getDate() + 1);
      continue;
    }
    out.push(new Date(cur));
    cur.setDate(cur.getDate() + step);
  }
  return out;
}

function toIso(d: Date): string {
  // Pas de `toISOString()` ici : il convertit en UTC et, pour un visiteur à
  // l'est de Greenwich, un minuit local devient la veille 22 h. La date envoyée
  // à Cal.com serait alors décalée d'un jour.
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function SlotPicker({ onPick }: { onPick: (slot: Slot) => void }) {
  const { t, lang } = useLang();
  const locale = lang === "en" ? "en-GB" : "fr-FR";

  // `useMemo` sans dépendance : la grille est calculée à l'ouverture de la
  // modale et ne doit plus bouger tant qu'elle est ouverte. Sans lui, chaque
  // rendu rappellerait `new Date()` et un visiteur qui laisse la fenêtre
  // ouverte à cheval sur minuit verrait la grille se décaler sous ses yeux.
  const days = useMemo(() => buildDays(DAY_STEP, DAYS_SHOWN), []);

  return (
    <div className="flex max-h-[68vh] flex-col md:max-h-[80vh]">
      {/* L'EN-TÊTE DE COLONNES, posé UNE fois. Répéter « Matin » et
          « Après-midi » sur chacune des cinq lignes ferait dix libellés pour
          une information qui ne change jamais. Il est en `grid-cols-2` sur la
          même largeur que la grille de pastilles en dessous : chaque moitié
          coiffe donc exactement ses deux créneaux.
          `sticky` : la liste défile sous lui, l'en-tête doit rester lisible
          quand on descend vers les derniers jours. */}
      <div className="sticky top-0 z-10 grid grid-cols-2 gap-2 border-b border-[#0a2540]/[0.08] bg-white px-5 pb-2.5 pt-5 dark:border-white/10 dark:bg-black md:px-7">
        {[
          { fr: "Matin", en: "Morning" },
          { fr: "Après-midi", en: "Afternoon" },
        ].map((c) => (
          <span
            key={c.en}
            className="font-inter text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[#6b7688] dark:text-gray-500"
          >
            {t(c)}
          </span>
        ))}
      </div>

      <div className="overflow-y-auto px-5 pb-5 pt-1 md:px-7">
        {days.map((d) => {
          const iso = toIso(d);
          const dayLabel = d.toLocaleDateString(locale, {
            weekday: "long",
            day: "numeric",
            month: "long",
          });
          return (
            <div key={iso} className="border-b border-[#0a2540]/[0.06] py-4 last:border-b-0 dark:border-white/[0.07]">
              {/* Le jour en toutes lettres. `first-letter:uppercase` et pas une
                  capitale dans la chaîne : `toLocaleDateString` rend « jeudi »
                  en minuscule en français et « Thursday » capitalisé en
                  anglais, la règle typographique est portée par le CSS pour ne
                  pas avoir à corriger l'une des deux langues à la main.
                  ⚠ SURTOUT PAS `capitalize` : il met une majuscule à CHAQUE
                  mot et rendait « Lundi 24 Août », ce qui est une faute en
                  français (les noms de mois ne prennent pas la capitale). */}
              <p className="font-inter text-[13.5px] font-semibold text-[#111827] first-letter:uppercase dark:text-white">
                {dayLabel}
              </p>

              {/* QUATRE PASTILLES, une par créneau, sur une seule rangée pour
                  que la coupure matin/après-midi tombe au milieu et réponde à
                  l'en-tête. Elles restent en 4 colonnes même sur téléphone :
                  « 09:30 » fait cinq caractères, quatre tiennent dans la
                  largeur d'un mobile, et repasser en 2×2 casserait
                  l'alignement avec l'en-tête. */}
              <div className="mt-2.5 grid grid-cols-4 gap-2">
                {SLOT_TIMES.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => onPick({ iso, time, dayLabel })}
                    className="rounded-[8px] border border-[#0a2540]/[0.12] bg-white py-2.5 font-inter text-[13.5px] font-semibold text-[#42506b] transition-colors duration-150 hover:border-[#3b82f6] hover:bg-[#3b82f6] hover:text-white dark:border-white/15 dark:bg-white/[0.04] dark:text-gray-200 dark:hover:border-[#3b82f6] dark:hover:bg-[#3b82f6] dark:hover:text-white"
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
