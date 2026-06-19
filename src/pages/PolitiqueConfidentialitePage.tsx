/**
 * PolitiqueConfidentialitePage — Politique de confidentialité (Privacy policy).
 *
 * Public, bilingual (FR/EN) rendering of Ora_V2/docs/legal/confidentialite.md.
 * This is the LEGAL privacy policy (GDPR). It is distinct from the marketing
 * "Confidentialité et sécurité" page (ConfidentialitePage.tsx).
 * Keep in sync with the source; the EN text is a convenience translation and
 * the French version prevails.
 */

import LegalDocLayout, { type LegalSection } from "@/components/LegalDocLayout";
import { useLang } from "@/lib/i18n";

type Page = "home" | "mentions-legales" | "politique-confidentialite" | "cgu";

type Props = {
  theme: "light" | "dark";
  openBooking: () => void;
  onNavigate: (page: Page) => void;
};

const PolitiqueConfidentialitePage: React.FC<Props> = ({ theme, onNavigate }) => {
  const { t } = useLang();

  const Bullets = ({ items }: { items: React.ReactNode[] }) => (
    <ul className="list-disc pl-5 space-y-1.5">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );

  // Section 2 — data / purpose pairs, rendered as a clean responsive table.
  const dataRows = [
    {
      cat: t({ fr: "Données de compte et profils utilisateurs (identifiants, adresse e-mail, informations de profil)", en: "Account data and user profiles (identifiers, email address, profile information)" }),
      fin: t({ fr: "Création et gestion des comptes, authentification, accès au service", en: "Creation and management of accounts, authentication, access to the service" }),
    },
    {
      cat: t({ fr: "Documents (Excel, CSV, PDF)", en: "Documents (Excel, CSV, PDF)" }),
      fin: t({ fr: "Hébergement, traitement et exécution des automatisations demandées", en: "Hosting, processing and execution of the requested automations" }),
    },
    {
      cat: t({ fr: "Métadonnées de projets (noms de fichiers, structure des projets, liens entre fichiers)", en: "Project metadata (file names, project structure, links between files)" }),
      fin: t({ fr: "Organisation et orchestration des projets", en: "Organization and orchestration of projects" }),
    },
    {
      cat: t({ fr: "Journaux d'audit (y compris journalisation des usages de la clé de séquestre)", en: "Audit logs (including logging of escrow-key usage)" }),
      fin: t({ fr: "Sécurité, traçabilité, respect des obligations légales et contractuelles", en: "Security, traceability, compliance with legal and contractual obligations" }),
    },
    {
      cat: t({ fr: "Messages internes", en: "Internal messages" }),
      fin: t({ fr: "Communication et collaboration au sein du service", en: "Communication and collaboration within the service" }),
    },
    {
      cat: t({ fr: "Données de prise de rendez-vous transmises via le site web (nom, adresse e-mail, créneau choisi, message éventuel)", en: "Booking data submitted through the website (name, email address, chosen slot, optional message)" }),
      fin: t({ fr: "Organisation et suivi des rendez-vous de démonstration et des échanges commerciaux", en: "Organization and follow-up of demo appointments and sales conversations" }),
    },
  ];

  const sections: LegalSection[] = [
    {
      heading: t({ fr: "1. Responsable de traitement", en: "1. Data controller" }),
      body: (
        <>
          <p>{t({
            fr: "Le responsable de traitement est Ora Solution, SAS au capital social de 2040€, dont le siège social est situé 229 rue du faubourg Saint-Honoré 75001 Paris FRANCE, en cours d'immatriculation au RCS de Paris (ci-après « Ora » ou « nous »).",
            en: "The data controller is Ora Solution, a SAS with share capital of 2040€, whose registered office is located at 229 rue du faubourg Saint-Honoré, 75001 Paris, France, currently being registered with the Paris Trade and Companies Register (RCS) (hereinafter “Ora” or “we”).",
          })}</p>
          <p>
            {t({ fr: "Pour toute question relative à la protection de vos données, vous pouvez contacter la société à l'adresse : ", en: "For any question regarding the protection of your data, you can contact the company at: " })}
            <a href="mailto:contact@ora-solution.com" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">contact@ora-solution.com</a>.
          </p>
          <p>{t({
            fr: "Dans le cadre du modèle multi-tenant d'Ora (Organisation, Équipes, Utilisateurs), l'organisation cliente peut, selon les cas, agir en qualité de responsable de traitement pour les données qu'elle traite via le service, Ora intervenant alors en qualité de sous-traitant. La qualification précise est définie dans le contrat conclu avec l'organisation.",
            en: "Within Ora's multi-tenant model (Organization, Teams, Users), the client organization may, in some cases, act as data controller for the data it processes through the service, with Ora then acting as a processor. The precise qualification is defined in the contract entered into with the organization.",
          })}</p>
        </>
      ),
    },
    {
      heading: t({ fr: "2. Données collectées et finalités", en: "2. Data collected and purposes" }),
      body: (
        <>
          <p>{t({ fr: "Nous collectons et traitons les catégories de données suivantes :", en: "We collect and process the following categories of data:" })}</p>
          <div className="overflow-hidden rounded-xl border border-gray-200/70 dark:border-white/10 not-prose">
            <div className="hidden sm:grid sm:grid-cols-2 gap-4 px-4 py-2.5 text-[12px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 border-b border-gray-200/70 dark:border-white/10 bg-black/[0.015] dark:bg-white/[0.02]">
              <span>{t({ fr: "Catégorie de données", en: "Data category" })}</span>
              <span>{t({ fr: "Finalité", en: "Purpose" })}</span>
            </div>
            {dataRows.map((r, i) => (
              <div
                key={i}
                className={`grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-4 px-4 py-3 text-[14px] md:text-[15px] ${i < dataRows.length - 1 ? "border-b border-gray-200/60 dark:border-white/[0.07]" : ""}`}
              >
                <div className="font-medium text-[#111827] dark:text-white">{r.cat}</div>
                <div className="text-gray-600 dark:text-gray-300">{r.fin}</div>
              </div>
            ))}
          </div>
          <p>{t({ fr: "Le contenu des documents est traité de manière chiffrée (voir section 6).", en: "Document content is processed in encrypted form (see Section 6)." })}</p>
        </>
      ),
    },
    {
      heading: t({ fr: "3. Base légale", en: "3. Legal basis" }),
      body: (
        <>
          <p>{t({ fr: "Les traitements reposent, selon les cas, sur les bases légales suivantes :", en: "Depending on the case, the processing relies on the following legal bases:" })}</p>
          <Bullets items={[
            <><strong className="font-semibold text-[#111827] dark:text-white">{t({ fr: "l'exécution du contrat", en: "performance of the contract" })}</strong>{t({ fr: " (fourniture du service et de ses fonctionnalités, gestion du compte) ;", en: " (provision of the service and its features, account management);" })}</>,
            <>{t({ fr: "le respect d'une ", en: "compliance with a " })}<strong className="font-semibold text-[#111827] dark:text-white">{t({ fr: "obligation légale", en: "legal obligation" })}</strong>{t({ fr: " à laquelle Ora est soumise ;", en: " to which Ora is subject;" })}</>,
            <>{t({ fr: "l'", en: "Ora's " })}<strong className="font-semibold text-[#111827] dark:text-white">{t({ fr: "intérêt légitime", en: "legitimate interest" })}</strong>{t({ fr: " d'Ora (sécurité du service, prévention de la fraude, amélioration du service), dans le respect de vos droits et libertés ;", en: " (security of the service, fraud prevention, service improvement), respecting your rights and freedoms;" })}</>,
            <>{t({ fr: "le cas échéant, votre ", en: "where applicable, your " })}<strong className="font-semibold text-[#111827] dark:text-white">{t({ fr: "consentement", en: "consent" })}</strong>{t({ fr: ", lorsque celui-ci est requis.", en: ", when it is required." })}</>,
          ]} />
        </>
      ),
    },
    {
      heading: t({ fr: "4. Hébergement et localisation des données", en: "4. Hosting and data location" }),
      body: (
        <>
          <p>{t({ fr: "Les données sont hébergées au sein de prestataires situés en Europe :", en: "Data is hosted with providers located in Europe:" })}</p>
          <Bullets items={[
            <><strong className="font-semibold text-[#111827] dark:text-white">{t({ fr: "Contenu des documents", en: "Document content" })}</strong>{t({ fr: " : hébergé chez Infomaniak (Object Storage), en Suisse, à Genève. Les documents y sont stockés sous forme chiffrée.", en: ": hosted with Infomaniak (Object Storage), in Switzerland, in Geneva. Documents are stored there in encrypted form." })}</>,
            <><strong className="font-semibold text-[#111827] dark:text-white">{t({ fr: "Données d'authentification et métadonnées", en: "Authentication data and metadata" })}</strong>{t({ fr: " : hébergées chez Supabase, dans la région de Francfort, au sein de l'Union européenne, et donc soumises au RGPD.", en: ": hosted with Supabase, in the Frankfurt region, within the European Union, and therefore subject to the GDPR." })}</>,
          ]} />
          <p>{t({
            fr: "Ce choix d'hébergement vise à offrir un niveau élevé de protection : les données d'authentification et les métadonnées sont localisées dans l'Union européenne ; le contenu des documents est localisé en Suisse, pays bénéficiant d'une décision d'adéquation de la Commission européenne (voir section 8).",
            en: "This hosting choice aims to offer a high level of protection: authentication data and metadata are located within the European Union; document content is located in Switzerland, a country covered by an adequacy decision of the European Commission (see Section 8).",
          })}</p>
        </>
      ),
    },
    {
      heading: t({ fr: "5. Sous-traitants", en: "5. Sub-processors" }),
      body: (
        <>
          <p>{t({
            fr: "Pour la fourniture du service, nous faisons appel à des sous-traitants soigneusement sélectionnés, qui agissent sur instruction et présentent des garanties appropriées au sens de l'article 28 du RGPD :",
            en: "To provide the service, we use carefully selected sub-processors who act on instructions and provide appropriate safeguards within the meaning of Article 28 of the GDPR:",
          })}</p>
          <Bullets items={[
            <><strong className="font-semibold text-[#111827] dark:text-white">Infomaniak</strong>{t({ fr: " (Suisse) : hébergement du contenu chiffré des documents ;", en: " (Switzerland): hosting of encrypted document content;" })}</>,
            <><strong className="font-semibold text-[#111827] dark:text-white">Supabase</strong>{t({ fr: " (Union européenne, région de Francfort) : authentification et hébergement des métadonnées ;", en: " (European Union, Frankfurt region): authentication and metadata hosting;" })}</>,
            <><strong className="font-semibold text-[#111827] dark:text-white">Vercel</strong>{t({ fr: " (États-Unis) : hébergement du site web de présentation ;", en: " (United States): hosting of the marketing website;" })}</>,
            <><strong className="font-semibold text-[#111827] dark:text-white">Cal.com</strong>{t({ fr: " : fourniture du module de prise de rendez-vous accessible depuis le site web (planification et envoi des confirmations).", en: ": provision of the appointment-booking module accessible from the website (scheduling and sending confirmations)." })}</>,
          ]} />
          <p>{t({ fr: "La liste des sous-traitants peut être mise à jour. Toute modification substantielle sera portée à votre connaissance.", en: "The list of sub-processors may be updated. Any material change will be brought to your attention." })}</p>
        </>
      ),
    },
    {
      heading: t({ fr: "6. Sécurité des données", en: "6. Data security" }),
      body: (
        <>
          <p className="font-semibold text-[#111827] dark:text-white">{t({ fr: "6.1 Chiffrement d'enveloppe de bout en bout", en: "6.1 End-to-end envelope encryption" })}</p>
          <p>{t({ fr: "La protection du contenu des documents repose sur un chiffrement d'enveloppe :", en: "Protection of document content relies on envelope encryption:" })}</p>
          <Bullets items={[
            t({ fr: "le contenu de chaque document est chiffré (algorithme XChaCha20-Poly1305) à l'aide d'une clé de chiffrement de données (DEK) aléatoire ;", en: "the content of each document is encrypted (XChaCha20-Poly1305 algorithm) using a random data encryption key (DEK);" }),
            t({ fr: "cette DEK est scellée par cryptographie asymétrique (X25519) pour chaque ayant droit ;", en: "this DEK is sealed using asymmetric cryptography (X25519) for each authorized party;" }),
            t({ fr: "la clé de l'Utilisateur est dérivée de son mot de passe côté client (fonction Argon2id). Ora ne reçoit jamais votre mot de passe en clair.", en: "the User's key is derived from their password on the client side (Argon2id function). Ora never receives your password in clear text." }),
          ]} />
          <p className="font-semibold text-[#111827] dark:text-white pt-2">{t({ fr: "6.2 Accès technique via clé de séquestre (escrow)", en: "6.2 Technical access via escrow key" })}</p>
          <p>{t({ fr: "Nous portons à votre connaissance, de manière claire et sans ambiguïté, l'élément suivant.", en: "We bring the following to your attention, clearly and unambiguously." })}</p>
          <p>{t({
            fr: "En complément des clés des Utilisateurs, la DEK de chaque document est également scellée avec une clé publique dite « de séquestre » (escrow), détenue par Ora. La clé privée correspondante est conservée hors ligne, de façon sécurisée, avec un accès strictement restreint.",
            en: "In addition to the Users' keys, the DEK of each document is also sealed with a public key known as an “escrow” key, held by Ora. The corresponding private key is kept offline, securely, with strictly restricted access.",
          })}</p>
          <p>
            {t({ fr: "Il en résulte qu'", en: "As a result, " })}
            <strong className="font-semibold text-[#111827] dark:text-white">{t({ fr: "Ora dispose de la possibilité technique d'accéder au contenu des documents", en: "Ora has the technical ability to access the content of documents" })}</strong>
            {t({ fr: ", par exemple afin de permettre la récupération d'un compte après la perte d'un mot de passe, de répondre à une obligation légale ou d'assurer la sécurité du service.", en: ", for example to enable account recovery after a lost password, to comply with a legal obligation, or to ensure the security of the service." })}
          </p>
          <p>{t({ fr: "Cette capacité est encadrée :", en: "This capability is governed:" })}</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>{t({ fr: "tout usage de la clé de séquestre est ", en: "any use of the escrow key is " })}<strong className="font-semibold text-[#111827] dark:text-white">{t({ fr: "journalisé et auditable", en: "logged and auditable" })}</strong> ;</li>
            <li>{t({ fr: "cet usage est limité aux cas justifiés mentionnés ci-dessus ;", en: "this use is limited to the justified cases mentioned above;" })}</li>
            <li>{t({ fr: "la clé privée de séquestre est conservée hors ligne, avec un accès restreint à l'équipe habilitée d'Ora.", en: "the escrow private key is kept offline, with access restricted to Ora's authorized team." })}</li>
          </ul>
          <p className="font-semibold text-[#111827] dark:text-white pt-2">{t({ fr: "6.3 Limite de la version actuelle", en: "6.3 Limitation of the current version" })}</p>
          <p>{t({
            fr: "Dans la version actuelle du service, seul le contenu des fichiers est chiffré. En conséquence, les noms de fichiers, certaines métadonnées (telles que la structure des projets) ainsi que le cache local stocké sur votre appareil demeurent en clair, c'est-à-dire non chiffrés. Nous vous recommandons d'en tenir compte dans le choix des intitulés de vos fichiers et projets.",
            en: "In the current version of the service, only file content is encrypted. As a result, file names, certain metadata (such as project structure) and the local cache stored on your device remain in clear, that is, unencrypted. We recommend taking this into account when naming your files and projects.",
          })}</p>
          <p>{t({ fr: "Le renforcement de ces aspects (chiffrement des noms et du cache, rotation des clés) fait l'objet de développements ultérieurs.", en: "Strengthening these aspects (encryption of names and cache, key rotation) is the subject of future development." })}</p>
        </>
      ),
    },
    {
      heading: t({ fr: "7. Durées de conservation", en: "7. Retention periods" }),
      body: (
        <>
          <p>{t({
            fr: "Vos données sont conservées pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées, puis archivées ou supprimées dans le respect des durées légales applicables.",
            en: "Your data is kept for as long as necessary for the purposes for which it was collected, then archived or deleted in accordance with applicable legal retention periods.",
          })}</p>
          <p>{t({ fr: "En particulier :", en: "In particular:" })}</p>
          <Bullets items={[
            t({ fr: "les données de compte sont conservées pendant la durée de la relation contractuelle ;", en: "account data is kept for the duration of the contractual relationship;" }),
            <>{t({ fr: "la suppression d'un document s'effectue selon un mécanisme de ", en: "deletion of a document follows a mechanism of " })}<strong className="font-semibold text-[#111827] dark:text-white">{t({ fr: "suppression douce assortie d'une rétention de 30 jours", en: "soft deletion with a 30-day retention period" })}</strong>{t({ fr: " avant purge définitive. Durant cette période, une restauration reste techniquement possible ; à l'issue de ce délai, les données sont purgées de manière définitive ;", en: " before permanent purge. During this period, restoration remains technically possible; after this period, the data is permanently purged;" })}</>,
            t({ fr: "en cas de départ d'un Utilisateur, les entrées de clés associées à son compte sont supprimées, les documents partagés au niveau Équipe ou Organisation restant accessibles aux autres membres habilités ;", en: "when a User leaves, the key entries associated with their account are deleted, while documents shared at Team or Organization level remain accessible to other authorized members;" }),
            t({ fr: "les journaux d'audit sont conservés pendant une durée proportionnée aux finalités de sécurité et aux obligations légales applicables.", en: "audit logs are kept for a period proportionate to security purposes and applicable legal obligations." }),
          ]} />
        </>
      ),
    },
    {
      heading: t({ fr: "8. Transferts hors de l'Union européenne", en: "8. Transfers outside the European Union" }),
      body: (
        <>
          <p>{t({ fr: "Les données d'authentification et les métadonnées sont hébergées au sein de l'Union européenne (Supabase, région de Francfort).", en: "Authentication data and metadata are hosted within the European Union (Supabase, Frankfurt region)." })}</p>
          <p>{t({
            fr: "Le contenu des documents est hébergé en Suisse (Infomaniak, Genève). La Suisse bénéficie d'une décision d'adéquation de la Commission européenne, reconnaissant un niveau de protection des données adéquat. Ce transfert s'effectue donc dans un cadre conforme au RGPD, sans nécessiter de garanties complémentaires de type clauses contractuelles types.",
            en: "Document content is hosted in Switzerland (Infomaniak, Geneva). Switzerland is covered by an adequacy decision of the European Commission, recognizing an adequate level of data protection. This transfer therefore takes place within a GDPR-compliant framework, without requiring additional safeguards such as standard contractual clauses.",
          })}</p>
          <p>{t({
            fr: "S'agissant du site web de présentation et de son module de prise de rendez-vous, certaines données techniques de connexion ou de réservation peuvent être traitées par des prestataires situés aux États-Unis (l'hébergeur du site et le fournisseur du module de réservation). Ces transferts sont encadrés par des garanties appropriées au sens du RGPD, telles que les clauses contractuelles types de la Commission européenne et, le cas échéant, la certification au Data Privacy Framework.",
            en: "Regarding the marketing website and its appointment-booking module, certain technical connection or booking data may be processed by providers located in the United States (the website host and the booking-module provider). These transfers are governed by appropriate safeguards within the meaning of the GDPR, such as the European Commission's standard contractual clauses and, where applicable, Data Privacy Framework certification.",
          })}</p>
        </>
      ),
    },
    {
      heading: t({ fr: "9. Vos droits", en: "9. Your rights" }),
      body: (
        <>
          <p>{t({ fr: "Conformément au RGPD, vous disposez des droits suivants sur vos données à caractère personnel :", en: "In accordance with the GDPR, you have the following rights over your personal data:" })}</p>
          <Bullets items={[
            <><strong className="font-semibold text-[#111827] dark:text-white">{t({ fr: "droit d'accès", en: "right of access" })}</strong>{t({ fr: " : obtenir la confirmation que des données vous concernant sont traitées et en obtenir une copie ;", en: ": obtain confirmation that data about you is processed and obtain a copy of it;" })}</>,
            <><strong className="font-semibold text-[#111827] dark:text-white">{t({ fr: "droit de rectification", en: "right to rectification" })}</strong>{t({ fr: " : faire corriger des données inexactes ou incomplètes ;", en: ": have inaccurate or incomplete data corrected;" })}</>,
            <><strong className="font-semibold text-[#111827] dark:text-white">{t({ fr: "droit à l'effacement", en: "right to erasure" })}</strong>{t({ fr: " : obtenir la suppression de vos données, dans les conditions prévues par la loi ;", en: ": obtain the deletion of your data, under the conditions provided by law;" })}</>,
            <><strong className="font-semibold text-[#111827] dark:text-white">{t({ fr: "droit à la portabilité", en: "right to portability" })}</strong>{t({ fr: " : recevoir vos données dans un format structuré, couramment utilisé et lisible par machine ;", en: ": receive your data in a structured, commonly used and machine-readable format;" })}</>,
            <><strong className="font-semibold text-[#111827] dark:text-white">{t({ fr: "droit d'opposition", en: "right to object" })}</strong>{t({ fr: " : vous opposer, pour des motifs tenant à votre situation particulière, à un traitement fondé sur l'intérêt légitime ;", en: ": object, on grounds relating to your particular situation, to processing based on legitimate interest;" })}</>,
            <><strong className="font-semibold text-[#111827] dark:text-white">{t({ fr: "droit à la limitation", en: "right to restriction" })}</strong>{t({ fr: " du traitement, dans les cas prévus par la loi.", en: " of processing, in the cases provided by law." })}</>,
          ]} />
          <p>
            {t({ fr: "Vous pouvez exercer ces droits en nous contactant à l'adresse : ", en: "You can exercise these rights by contacting us at: " })}
            <a href="mailto:contact@ora-solution.com" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">contact@ora-solution.com</a>.
          </p>
          <p>{t({
            fr: "Vous disposez également du droit d'introduire une réclamation auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL), 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07, ou via le site www.cnil.fr.",
            en: "You also have the right to lodge a complaint with the French data protection authority (CNIL), 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07, or via www.cnil.fr.",
          })}</p>
          <p>{t({
            fr: "Lorsque Ora agit en qualité de sous-traitant pour le compte de votre organisation, les demandes d'exercice de droits peuvent être adressées au responsable de traitement, c'est-à-dire à votre organisation, qui en assure le suivi.",
            en: "Where Ora acts as a processor on behalf of your organization, requests to exercise rights may be addressed to the data controller, that is, your organization, which handles them.",
          })}</p>
        </>
      ),
    },
    {
      heading: t({ fr: "10. Contact", en: "10. Contact" }),
      body: (
        <p>
          {t({ fr: "Pour toute question relative à la présente Politique de confidentialité, à l'exercice de vos droits ou pour toute autre demande, vous pouvez contacter notre équipe à l'adresse : ", en: "For any question regarding this Privacy Policy, the exercise of your rights or any other request, you can contact our team at: " })}
          <a href="mailto:contact@ora-solution.com" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">contact@ora-solution.com</a>.
        </p>
      ),
    },
  ];

  return (
    <LegalDocLayout
      theme={theme}
      onBackHome={() => onNavigate("home")}
      title={t({ fr: "Politique de confidentialité", en: "Privacy Policy" })}
      lastUpdated={t({ fr: "Dernière mise à jour : 20 juin 2026", en: "Last updated: June 20, 2026" })}
      intro={
        <>
          <p>{t({
            fr: "La présente Politique de confidentialité décrit la manière dont le service Ora collecte, utilise, héberge et protège les données à caractère personnel, conformément au Règlement (UE) 2016/679 (ci-après le « RGPD ») et à la loi française applicable.",
            en: "This Privacy Policy describes how the Ora service collects, uses, hosts and protects personal data, in accordance with Regulation (EU) 2016/679 (the “GDPR”) and applicable French law.",
          })}</p>
          <p>{t({
            fr: "Ora est une application de bureau d'automatisation de flux de travail Excel destinée aux équipes finance, audit et fusions-acquisitions (M&A).",
            en: "Ora is a desktop application for automating Excel workflows, designed for finance, audit and mergers and acquisitions (M&A) teams.",
          })}</p>
        </>
      }
      sections={sections}
    />
  );
};

export default PolitiqueConfidentialitePage;
