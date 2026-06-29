import { useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { useLang } from "@/lib/i18n";

/**
 * FAQ — preempts the finance/procurement objections (data location, access,
 * Excel skills, delivery time, deployment, security review, pricing). Answers
 * reflect what the product actually does; no fabricated certifications. The
 * "security review" answer is a process commitment — confirm you can honor it.
 */

export default function FAQ({ openBooking }: { openBooking: () => void }) {
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
        fr: "Ora est une application desktop native, disponible sur macOS aujourd'hui, avec Windows en cours de déploiement. Vos fichiers Excel se synchronisent automatiquement à chaque enregistrement.",
        en: "Ora is a native desktop app, available on macOS today, with Windows rolling out. Your Excel files sync automatically on every save.",
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
        fr: "Ora s'adapte à votre périmètre : abonnement annuel et accompagnement à la mise en place. Réservez un appel pour un devis adapté.",
        en: "Ora adapts to your scope: annual subscription and onboarding support. Book a call for a tailored quote.",
      }),
    },
  ];

  return (
    <section id="faq" className="relative py-20 md:py-32 px-6 md:px-12 bg-white dark:bg-[#0f172a] scroll-mt-24">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-500 dark:text-blue-400">
            {t({ fr: "FAQ", en: "FAQ" })}
          </span>
          <h2 className="font-poppins font-semibold text-3xl md:text-[2.75rem] tracking-[-0.03em] leading-[1.12] text-[#111827] dark:text-white mt-4">
            {t({ fr: "Vos questions, nos réponses", en: "Your questions, answered" })}
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className="rounded-2xl border border-gray-200/70 dark:border-white/[0.07] bg-white dark:bg-white/[0.02] overflow-hidden"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 text-left px-5 md:px-6 py-4 md:py-5"
                  aria-expanded={isOpen}
                >
                  <span className="font-poppins font-semibold text-[15px] md:text-[16px] text-gray-900 dark:text-white">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className="grid transition-all duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="font-inter px-5 md:px-6 pb-5 text-[14.5px] leading-relaxed text-gray-500 dark:text-gray-400">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <p className="font-inter text-base text-gray-600 dark:text-gray-300">
            {t({ fr: "Une autre question ?", en: "Another question?" })}
          </p>
          <button
            onClick={openBooking}
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full text-[14px] font-semibold font-inter text-white bg-[#3b82f6] hover:bg-[#2563eb] shadow-[0_2px_12px_rgba(59,130,246,0.30)] hover:shadow-[0_4px_24px_rgba(59,130,246,0.40)] hover:-translate-y-px transition-all duration-150"
          >
            {t({ fr: "Réserver un appel", en: "Book a call" })}
            <ArrowRight className="w-4 h-4 opacity-80 group-hover:translate-x-[3px] transition-transform duration-150" />
          </button>
        </div>
      </div>
    </section>
  );
}
