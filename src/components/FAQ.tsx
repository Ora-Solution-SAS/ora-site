import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLang } from "@/lib/i18n";

/**
 * FAQ — preempts the finance/procurement objections (data location, access,
 * Excel skills, delivery time, deployment, security review, pricing). Answers
 * reflect what the product actually does; no fabricated certifications. The
 * "security review" answer is a process commitment — confirm you can honor it.
 */

export default function FAQ() {
  const { t } = useLang();
  const [open, setOpen] = useState<number | null>(0);

  const items = [
    {
      q: t({ fr: "Où sont stockées nos données ?", en: "Where is our data stored?" }),
      a: t({
        fr: "En Europe : Francfort et Genève, hors de portée du CLOUD Act américain. Vos fichiers sont chiffrés sur votre appareil avant tout envoi et restent illisibles sur nos serveurs.",
        en: "In Europe: Frankfurt and Geneva, out of reach of the US CLOUD Act. Your files are encrypted on your device before anything is sent and stay unreadable on our servers.",
      }),
    },
    {
      q: t({ fr: "Qui peut accéder à nos fichiers ?", en: "Who can access our files?" }),
      a: t({
        fr: "Uniquement les personnes que vous autorisez. L'accès est cloisonné par organisation, équipe et utilisateur (refusé par défaut), avec authentification et double facteur (MFA).",
        en: "Only the people you authorise. Access is isolated per organisation, team and user (deny-by-default), with authentication and multi-factor (MFA).",
      }),
    },
    {
      // Objection devenue ambiante depuis les déploiements Claude des Big Four
      // (décision client 2026-08-04) : frontale ICI, et seulement ici. Les
      // cartes de la section « bout en bout » restent obliques, sans nommer
      // l'IA générative. Ton : complémentarité, pas opposition.
      q: t({ fr: "Pourquoi ne pas simplement utiliser ChatGPT ou Claude ?", en: "Why not just use ChatGPT or Claude?" }),
      a: t({
        fr: "Pour rédiger un mail ou synthétiser un document, un chatbot fait très bien l'affaire. Vos livrables chiffrés sont un autre sujet : une IA générative produit un résultat plausible, différent à chaque essai, impossible à contrôler ligne à ligne. Ora repose sur des règles de calcul explicites : même fichier, même livrable, vérifiable et opposable. Et vos dossiers clients ne partent pas dans un chatbot.",
        en: "For drafting an email or summarising a document, a chatbot does the job. Your numbers deliverables are a different matter: generative AI produces a plausible result, different on every try, impossible to check line by line. Ora runs on explicit calculation rules: same file, same deliverable, verifiable and defensible. And your client files never go into a chatbot.",
      }),
    },
    {
      q: t({ fr: "Faut-il maîtriser Excel pour utiliser Ora ?", en: "Do we need to master Excel to use Ora?" }),
      a: t({
        fr: "Non. Vous décrivez votre tâche, on l'automatise. Vos équipes lancent l'automatisation sans connaître les formules ni les macros.",
        en: "No. You describe your task, we automate it. Your teams run the automation without knowing formulas or macros.",
      }),
    },
    {
      q: t({ fr: "Combien de temps pour automatiser un de nos processus ?", en: "How long to automate one of our processes?" }),
      a: t({
        fr: "Quelques jours. Vous nous décrivez votre processus, on le reproduit à l'identique. Pas de template générique, pas de mois d'attente.",
        en: "A few days. You describe your process, we reproduce it exactly. No generic template, no months of waiting.",
      }),
    },
    {
      q: t({ fr: "Et si notre processus évolue ?", en: "What if our process changes?" }),
      a: t({
        fr: "Les automatisations sont mises à jour et activées pour vous sans nouvelle installation. Chacune est signée et vérifiée à l'exécution.",
        en: "Automations are updated and enabled for you with no reinstall. Each one is signed and verified at runtime.",
      }),
    },
    {
      q: t({ fr: "Comment Ora se déploie sur nos postes ?", en: "How does Ora deploy on our machines?" }),
      a: t({
        /* ⚠ CETTE PHRASE DOIT DIRE LA MÊME CHOSE QUE LA NOTE DE
           PlatformShowcase.tsx, quatre écrans plus haut. Les deux se sont
           contredites jusqu'à l'audit du 2026-08-15, et c'était la version
           optimiste qui était en haut de page. Windows étant sorti (client
           2026-09-07 : « tout est disponible dès maintenant »), les deux
           annoncent les deux plateformes. Ne jamais en changer une seule. */
        fr: "Ora est une application desktop native, disponible sur macOS et sur Windows. Vos fichiers Excel se synchronisent automatiquement à chaque enregistrement.",
        en: "Ora is a native desktop app, available on macOS and on Windows. Your Excel files sync automatically on every save.",
      }),
    },
    {
      q: t({ fr: "Pouvez-vous répondre à notre revue de sécurité ?", en: "Can you support our security review?" }),
      a: t({
        fr: "Oui. Nous fournissons la documentation de sécurité et de conformité (hébergement, chiffrement, traitement des données) nécessaire à votre revue. Contactez-nous pour la recevoir.",
        en: "Yes. We provide the security and compliance documentation (hosting, encryption, data handling) your review needs. Contact us to receive it.",
      }),
    },
    {
      q: t({ fr: "Combien ça coûte ?", en: "How much does it cost?" }),
      a: t({
        /* ⚠ « Écrivez-nous » et non « réservez un appel » (2026-09-07) : la
           prise de rendez-vous en ligne est fermée, et une réponse de FAQ qui
           renvoie vers un bouton qui n'existe plus est un cul-de-sac. */
        fr: "Ora s'adapte à votre périmètre : abonnement annuel et accompagnement à la mise en place. Écrivez-nous pour un devis adapté.",
        en: "Ora adapts to your scope: annual subscription and onboarding support. Write to us for a tailored quote.",
      }),
    },
  ];

  return (
    /* ══ LAYOUT EN LARGEUR, CALQUÉ SUR « CONTRÔLE TOTAL » (client 2026-09-02,
       seconde passe : « fais un layout en largeur pour la cohérence visuelle
       avec contrôle total ») ══════════════════════════════════════════════════
       ControlShowcase pose la grammaire : conteneur max-w-7xl, très grand
       titre Instrument Sans à GAUCHE cassé en deux lignes par des `block`
       explicites (la moitié droite reste vide, c'est ce déséquilibre qui fait
       respirer), puis le contenu en grille sur toute la largeur. La FAQ la
       reprend trait pour trait :
         · même conteneur (max-w-7xl, mêmes rembourrages de section) ;
         · titre en deux blocs « Vos questions, » / « nos réponses. », même
           face, même graisse, un cran sous le corps de Contrôle total (5,5 rem
           contre 7 : c'est une section de service, pas une clôture) ;
         · les neuf questions passent en DEUX COLONNES sous le titre, liste à
           filets conservée de la passe précédente.
       ⚠ DEUX COLONNES EXPLICITES (0-4 à gauche, 5-8 à droite) et non un
       `grid-cols-2` sur les neuf entrées : en grille, les items se rangent
       LIGNE PAR LIGNE et l'ordre de lecture zigzague ; en deux piles, chaque
       colonne se lit de haut en bas, et l'ouverture d'une réponse n'allonge
       que sa colonne. Sous lg les deux piles s'empilent et la liste redevient
       continue. */
    <section id="faq" className="relative scroll-mt-24 bg-white px-6 pb-24 pt-16 md:px-12 md:pb-32 md:pt-20 dark:bg-black md:dark:bg-black">
      <div className="mx-auto max-w-7xl">
        <span className="font-inter text-xs font-semibold uppercase tracking-[0.18em] text-blue-500 dark:text-blue-400">
          {t({ fr: "FAQ", en: "FAQ" })}
        </span>
        <h2
          className="mt-4 font-instrument font-normal leading-[0.98] tracking-[-0.03em] text-[#111827] dark:text-white"
          style={{ fontSize: "clamp(2.6rem, 6vw, 5.5rem)" }}
        >
          <span className="block">{t({ fr: "Vos questions,", en: "Your questions," })}</span>
          <span className="block">{t({ fr: "nos réponses.", en: "answered." })}</span>
        </h2>
        {/* La ligne d'appui ne promet rien de neuf : elle reprend le délai
            déjà affiché sur la page de téléchargement et dans la
            réservation. */}
        <p className="mt-5 max-w-[40ch] font-inter text-[14.5px] leading-relaxed text-[#5b6577] dark:text-gray-400">
          {t({
            fr: "Une question qui n'est pas ici ? Écrivez-nous, réponse sous 24 h ouvrées.",
            en: "A question not covered here? Write to us, reply within 1 business day.",
          })}
        </p>

        <div className="mt-10 grid gap-x-16 md:mt-14 lg:grid-cols-2">
          {[items.slice(0, 5), items.slice(5)].map((colonne, c) => (
            <div key={c}>
              {colonne.map((item, k) => {
                const i = c * 5 + k;
                const isOpen = open === i;
                return (
                  <div key={i} className="border-t border-[#0a2540]/[0.10] dark:border-white/[0.08]">
                    <button
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-4 py-4 text-left"
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${i}`}
                      id={`faq-button-${i}`}
                    >
                      <span className="font-inter text-[14.5px] font-semibold text-gray-900 md:text-[15px] dark:text-white">
                        {item.q}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {/* ⚠ `inert` SUR LE PANNEAU FERMÉ (audit du 2026-08-15). Le
                        repli se fait par `grid-template-rows: 0fr` plus un
                        `overflow-hidden` : visuellement le panneau disparaît,
                        mais il reste dans l'arbre d'accessibilité. Un lecteur
                        d'écran entendait donc les NEUF réponses à la suite,
                        comme si tout l'accordéon était ouvert.
                        `inert` plutôt que `hidden` : il retire le contenu de
                        l'arbre et de la tabulation SANS toucher à l'affichage,
                        donc l'animation d'ouverture est conservée. */}
                    <div
                      id={`faq-panel-${i}`}
                      role="region"
                      aria-labelledby={`faq-button-${i}`}
                      inert={!isOpen}
                      className="grid transition-all duration-300 ease-out"
                      style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                    >
                      <div className="overflow-hidden">
                        <p className="max-w-[64ch] pb-4 font-inter text-[14px] leading-relaxed text-gray-500 dark:text-gray-400">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
