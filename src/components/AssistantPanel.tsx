import { ChevronDown, FileText, FolderSearch, Mic, Plus } from "lucide-react";
import { useLang } from "@/lib/i18n";

/**
 * AssistantPanel — le panneau de l'assistant, transposé de la capture Euria
 * fournie par le client (orbe en débord, salutation, champ de saisie et sa
 * rangée d'actions).
 *
 * ⚠ IL A DÉMÉNAGÉ. Il vivait dans PlatformShowcase.tsx, dans l'encadré bleu
 * « Assistant » posé à côté du téléchargement. Le 2026-08-14 le client a
 * décidé de FAIRE PORTER L'ASSISTANT PAR ATLAS (« mon but est de faire passer
 * notre super assistant comme le dénommé Atlas, merge cette partie dedans »),
 * et de retirer l'encadré générique de la section plateforme : tant qu'un
 * « Assistant » sans nom subsistait ailleurs, le nom Atlas ne pouvait pas
 * prendre. Il est donc extrait ici, et non recopié — les deux sections ne
 * peuvent pas diverger, et un seul endroit porte l'orbe et ses trois cycles.
 *
 * Cotes en `cqw` (1cqw = 1 % de la largeur du panneau) comme les autres
 * panneaux du site : il se réduit sans point de rupture à régler.
 *
 * Une différence de FOND avec la référence, volontaire : Euria propose de
 * chercher sur le web, Atlas cherche dans VOS dossiers. Écrire « le web » ici
 * contredirait le traitement local revendiqué partout ailleurs sur le site.
 */

/* LE BLEU DE LA RÉFÉRENCE, en TROIS calques et non un seul dégradé linéaire :
   c'est ce qui produit les « nuances » demandées (client 2026-08-11 : « la
   couleur a bien plus de nuances de bleu, je veux qu'elle soit exactement la
   même »), puis réglé une seconde fois sur la capture le 2026-08-14
   (« replique plus ces couleurs-là ») :
     · LE HAUT ÉTAIT TROP BLEU. Sur la capture, le premier tiers est un blanc à
       peine teinté (#e9f1fe) et la couleur ne monte vraiment qu'à mi-hauteur.
     · LE BAS N'ÉTAIT PAS ASSEZ SATURÉ. Le pied tourne autour de #3f86ef, avec
       un foyer franc dans l'angle bas gauche.
     · IL MANQUAIT LA LUEUR DU CENTRE, derrière l'orbe : c'est elle qui fait
       lire la sphère comme une source lumineuse et pas comme un autocollant.
       Radial blanc à 46 % de hauteur, posé AVANT la rampe donc au-dessus. */
export const ASSISTANT_SHELL_LIGHT =
  "radial-gradient(58% 34% at 50% 46%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 72%)," +
  "radial-gradient(118% 74% at 8% 106%, rgba(16,94,240,0.95) 0%, rgba(16,94,240,0.4) 34%, rgba(16,94,240,0) 62%)," +
  "radial-gradient(108% 66% at 98% 104%, rgba(82,150,247,0.8) 0%, rgba(82,150,247,0.26) 38%, rgba(82,150,247,0) 66%)," +
  "linear-gradient(180deg, #e9f1fe 0%, #e1ecfd 18%, #d5e4fc 34%, #bed5fa 50%, #9dc0f8 66%, #74a4f4 82%, #4f8def 94%, #3f86ef 100%)";

/* Les trois cycles de l'orbe. Écrit à la main plutôt qu'en Framer Motion :
   c'est une boucle décorative permanente, elle n'a aucune raison de coûter un
   moteur d'animation JavaScript à chaque image sur une page dont le défilement
   est déjà piloté sur le thread principal par Lenis. En CSS pur, le compositeur
   s'en charge seul. (Pas d'accent guillemet dans ce bloc : template literal.) */
const ORB_CSS = `
@keyframes psBlob {
  0%   { border-radius: 52% 48% 46% 54% / 50% 46% 54% 50%; }
  25%  { border-radius: 46% 54% 52% 48% / 54% 52% 48% 46%; }
  50%  { border-radius: 50% 50% 54% 46% / 46% 54% 46% 54%; }
  75%  { border-radius: 54% 46% 48% 52% / 52% 48% 52% 48%; }
  100% { border-radius: 52% 48% 46% 54% / 50% 46% 54% 50%; }
}
@keyframes psFloat {
  0%   { transform: translate3d(0, 0, 0) rotate(0deg); }
  50%  { transform: translate3d(0, -2.5%, 0) rotate(2.5deg); }
  100% { transform: translate3d(0, 0, 0) rotate(0deg); }
}
@keyframes psGlow {
  0%   { opacity: 0.66; transform: scale(1); }
  50%  { opacity: 0.92; transform: scale(1.06); }
  100% { opacity: 0.66; transform: scale(1); }
}
.ps-orb   { animation: psBlob 9s ease-in-out infinite; will-change: border-radius; }
.ps-float { animation: psFloat 7s ease-in-out infinite; will-change: transform; }
.ps-glow  { animation: psGlow 11s ease-in-out infinite; will-change: opacity, transform; }
@media (prefers-reduced-motion: reduce) {
  .ps-orb, .ps-float, .ps-glow { animation: none !important; }
  .ps-orb { border-radius: 50%; }
  .ps-glow { opacity: 0.8; }
}
`;

/**
 * `forceLight` — rend le panneau dans son habit CLAIR quel que soit le thème du
 * site. Il le faut dans la section Atlas : celle-ci est noire en permanence,
 * thème clair compris, et sa coque bleue est posée en dur. Sans ce drapeau, un
 * visiteur en thème sombre verrait le panneau basculer en encre foncée sur une
 * nappe restée bleue. Ailleurs (encadré de page claire), le comportement par
 * défaut suit le thème comme avant.
 */
export default function AssistantPanel({
  forceLight = false,
  prompt,
  answer,
  sources,
}: {
  forceLight?: boolean;
  /** La demande écrite dans le champ. À défaut, la demande d'origine. */
  prompt?: string;
  /** Une ligne de réponse d'Atlas, affichée sous le champ. Absente = pas de
   *  bloc réponse du tout (l'état d'origine du panneau, champ vide). */
  answer?: string;
  /** Les fichiers dans lesquels Atlas est allé chercher, en pastilles. */
  sources?: string[];
}) {
  const { t } = useLang();

  return (
    <div
      className={`relative mx-auto w-full rounded-[3.2cqw] p-[2.4cqw] ring-1 ${
        forceLight ? "bg-white/55 ring-white/60" : "bg-white/55 ring-white/60 dark:bg-white/[0.06] dark:ring-white/10"
      }`}
      style={{ containerType: "inline-size" }}
    >
      <style>{ORB_CSS}</style>
      {/* Rembourrage vertical généreux : sur la référence le panneau occupe
          environ 40 % de la hauteur du cadre. Au rembourrage d'origine il n'en
          prenait que 28 % et laissait un grand vide au-dessus de lui. */}
      <div className={`relative rounded-[2.6cqw] bg-white px-[5cqw] pb-[8cqw] pt-[13cqw] ${forceLight ? "" : "dark:bg-[#111827]"}`}>
        {/* L'ORBE, à cheval sur le bord haut du panneau comme sur la
            référence : c'est ce débord qui donne sa profondeur à la
            composition. Le halo est un second calque, flouté, DERRIÈRE l'orbe.
            Diamètre porté de 13 à 19 cqw : sur la référence l'orbe pèse près
            d'un quart de la largeur du cadre, à 13 il passait pour une puce.

            ⚠ ÉCLAIRAGE INVERSÉ le 2026-08-14, et c'est LE point qui manquait.
            La version précédente éclairait par le HAUT GAUCHE (clair à 32/26 %,
            sombre en bas), le réflexe pour une bille. La capture fait
            l'inverse : le sommet est un bleu profond presque marine et le
            point vif, franchement cyan, se trouve en BAS À DROITE. C'est ce
            qui lui donne son air de source lumineuse plutôt que de perle.

            ET CE N'EST PAS UN CERCLE. Sur la capture, la forme est
            légèrement irrégulière, un galet plutôt qu'un rond parfait. Elle
            est donc dessinée en rayons asymétriques — ce qui donne du même
            coup l'animation demandée (« une animation pour que le rond
            bouge ») : les quatre rayons dérivent lentement les uns par rapport
            aux autres, la forme respire sans jamais se déformer franchement.
            Trois cycles de durées PREMIÈRES ENTRE ELLES (9 s, 7 s, 11 s) :
            leur combinaison ne se répète qu'au bout de plus de dix minutes, on
            ne surprend donc jamais la boucle. */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
          <div
            aria-hidden
            className="ps-glow absolute inset-[-50%] rounded-full blur-[4cqw]"
            style={{ background: "radial-gradient(circle, rgba(45,140,246,0.7) 0%, rgba(45,140,246,0) 70%)" }}
          />
          <div className="ps-float relative h-[19cqw] w-[19cqw]">
            <div
              className="ps-orb h-full w-full"
              style={{
                background:
                  "radial-gradient(circle at 68% 78%, #6fe0ff 0%, #35c5f8 12%, #1ea0f3 26%, #1673ea 44%, #1a4ed6 64%, #1b37b4 82%, #152a86 100%)",
                boxShadow:
                  "inset -0.6cqw -0.8cqw 2.6cqw rgba(255,255,255,0.34), inset 1cqw 1.1cqw 2.8cqw rgba(8,22,66,0.55)",
              }}
            />
          </div>
        </div>

        <p className={`text-center font-inter text-[3.4cqw] font-medium tracking-[-0.01em] text-[#111827] ${forceLight ? "" : "dark:text-white"}`}>
          {t({ fr: "Bonjour Thomas, ", en: "Hello Thomas, " })}
          <span className="text-[#2f7df0]">
            {t({ fr: "que puis-je faire pour vous ?", en: "how can I help you today?" })}
          </span>
        </p>

        {/* Le champ de saisie et sa rangée d'actions. */}
        <div className={`mt-[4.4cqw] rounded-[2.2cqw] px-[3.4cqw] py-[2.8cqw] ring-1 ring-[#0a2540]/[0.10] ${forceLight ? "" : "dark:ring-white/10"}`}>
          {/* La demande. Quand elle vient du carrousel (`prompt`), elle est
              écrite en ENCRE PLEINE et non en gris : ce n'est plus un
              texte d'invite, c'est une question posée. */}
          <p
            className={
              prompt
                ? `font-inter text-[2.9cqw] text-[#111827] ${forceLight ? "" : "dark:text-white"}`
                : `font-inter text-[2.9cqw] text-[#6b7688] ${forceLight ? "" : "dark:text-gray-500"}`
            }
          >
            {prompt ??
              t({
                fr: "Demandez un bilan développé sur le dossier Nexio",
                en: "Ask for a detailed balance sheet on the Nexio file",
              })}
          </p>
          <div className="mt-[3.2cqw] flex items-center gap-[3cqw]">
            <Plus className={`h-[3.4cqw] w-[3.4cqw] shrink-0 text-[#6b7280] ${forceLight ? "" : "dark:text-gray-400"}`} strokeWidth={2} />
            <span className="inline-flex items-center gap-[1.4cqw] font-inter text-[2.8cqw] font-medium text-[#2f7df0]">
              <FolderSearch className="h-[3.2cqw] w-[3.2cqw]" strokeWidth={1.9} />
              {t({ fr: "Vos dossiers", en: "Your files" })}
              <ChevronDown className="h-[2.6cqw] w-[2.6cqw]" strokeWidth={2.2} />
            </span>
            <Mic className={`ml-auto h-[3.4cqw] w-[3.4cqw] shrink-0 text-[#6b7280] ${forceLight ? "" : "dark:text-gray-400"}`} strokeWidth={1.9} />
          </div>
        </div>

        {/* LA RÉPONSE. Rendue seulement quand le carrousel en fournit une :
            sans elle, le panneau reste exactement ce qu'il était, un champ
            prêt à recevoir une demande. Les pastilles du dessous nomment les
            fichiers ouverts — c'est ce qui distingue Atlas d'un chatbot, la
            réponse dit d'où elle vient. */}
        {answer && (
          <div
            className={`mt-[3cqw] rounded-[2.2cqw] px-[3.4cqw] py-[3cqw] ring-1 ring-[#0a2540]/[0.07] ${
              forceLight ? "bg-[#f4f8ff]" : "bg-[#f4f8ff] dark:bg-white/[0.04] dark:ring-white/10"
            }`}
          >
            <p className={`font-inter text-[2.85cqw] leading-[1.55] text-[#0a2540] ${forceLight ? "" : "dark:text-gray-200"}`}>
              {answer}
            </p>
            {sources && sources.length > 0 && (
              <div className="mt-[2.6cqw] flex flex-wrap gap-[1.6cqw]">
                {sources.map((s) => (
                  <span
                    key={s}
                    className={`inline-flex items-center gap-[1.2cqw] rounded-full bg-white px-[2.2cqw] py-[1.1cqw] font-inter text-[2.4cqw] font-medium text-[#2f7df0] ring-1 ring-[#2f7df0]/20 ${
                      forceLight ? "" : "dark:bg-white/[0.06] dark:ring-white/10"
                    }`}
                  >
                    <FileText className="h-[2.6cqw] w-[2.6cqw]" strokeWidth={1.9} />
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
