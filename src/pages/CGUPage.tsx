/**
 * CGUPage — Conditions Générales d'Utilisation (Terms of Use).
 *
 * Public, bilingual (FR/EN) rendering of Ora_V2/docs/legal/cgu.md.
 * Keep in sync with that source. The EN text is a translation provided for
 * convenience and should be reviewed; the French version prevails.
 */

import LegalDocLayout, { type LegalSection } from "@/components/LegalDocLayout";
import { useLang } from "@/lib/i18n";

type Page = "home" | "mentions-legales" | "politique-confidentialite" | "cgu";

type Props = {
  theme: "light" | "dark";
  openBooking: () => void;
  onNavigate: (page: Page) => void;
};

const CGUPage: React.FC<Props> = ({ theme, onNavigate }) => {
  const { t } = useLang();

  const Bullets = ({ items }: { items: string[] }) => (
    <ul className="list-disc pl-5 space-y-1.5">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );

  const sections: LegalSection[] = [
    {
      heading: t({ fr: "1. Objet", en: "1. Purpose" }),
      body: (
        <>
          <p>{t({
            fr: "Les présentes CGU ont pour objet de définir les modalités et conditions dans lesquelles l'utilisateur (ci-après « vous » ou « l'Utilisateur ») accède au service Ora et l'utilise, ainsi que les droits et obligations des parties dans ce cadre.",
            en: "These Terms set out the terms and conditions under which the user (hereinafter “you” or “the User”) accesses and uses the Ora service, as well as the rights and obligations of the parties in that context.",
          })}</p>
          <p>{t({
            fr: "Elles s'appliquent à toute utilisation du service, quel que soit le terminal ou le mode d'accès utilisé.",
            en: "They apply to any use of the service, whatever the device or access method used.",
          })}</p>
        </>
      ),
    },
    {
      heading: t({ fr: "2. Acceptation des conditions", en: "2. Acceptance of the terms" }),
      body: (
        <>
          <p>{t({
            fr: "En créant un compte, en accédant au service ou en l'utilisant, vous reconnaissez avoir lu, compris et accepté sans réserve l'intégralité des présentes CGU.",
            en: "By creating an account, accessing the service or using it, you acknowledge that you have read, understood and accepted these Terms in full and without reservation.",
          })}</p>
          <p>{t({
            fr: "Si vous utilisez le service au nom d'une organisation, vous déclarez et garantissez disposer du pouvoir d'engager cette organisation, qui sera alors liée par les présentes CGU.",
            en: "If you use the service on behalf of an organization, you represent and warrant that you have the authority to bind that organization, which will then be bound by these Terms.",
          })}</p>
          <p>{t({
            fr: "Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser le service.",
            en: "If you do not accept these terms, you must not use the service.",
          })}</p>
        </>
      ),
    },
    {
      heading: t({ fr: "3. Description du service", en: "3. Description of the service" }),
      body: (
        <>
          <p>{t({ fr: "Ora est une application de bureau permettant notamment :", en: "Ora is a desktop application that lets you, among other things:" })}</p>
          <Bullets items={[
            t({ fr: "d'orchestrer des projets et de visualiser les fichiers associés (vue de type « galaxie ») ;", en: "orchestrate projects and visualize the associated files (a “galaxy”-style view);" }),
            t({ fr: "de stocker des documents (Excel, CSV, PDF) dans un espace de stockage cloud chiffré ;", en: "store documents (Excel, CSV, PDF) in encrypted cloud storage;" }),
            t({ fr: "de synchroniser automatiquement les modifications apportées aux fichiers Excel vers le cloud ;", en: "automatically sync changes made to Excel files to the cloud;" }),
            t({ fr: "d'exécuter un ensemble d'automatisations de nettoyage de données, d'audit et de production de tableaux de bord.", en: "run a set of automations for data cleaning, auditing and dashboard production." }),
          ]} />
          <p>{t({
            fr: "Le service repose sur un modèle multi-tenant organisé selon la hiérarchie suivante : Organisation, Équipes, Utilisateurs. Le partage des documents s'effectue par niveau d'accès : Privé, Équipe ou Organisation.",
            en: "The service is based on a multi-tenant model organized in the following hierarchy: Organization, Teams, Users. Document sharing is done by access level: Private, Team or Organization.",
          })}</p>
          <p>{t({
            fr: "L'Éditeur se réserve le droit de faire évoluer les fonctionnalités du service à tout moment, dans les conditions prévues à l'article 9.",
            en: "The Publisher reserves the right to change the features of the service at any time, under the conditions set out in Article 9.",
          })}</p>
        </>
      ),
    },
    {
      heading: t({ fr: "4. Compte et accès", en: "4. Account and access" }),
      body: (
        <>
          <p>{t({
            fr: "L'accès au service nécessite la création d'un compte utilisateur. L'authentification et la gestion des comptes sont assurées via le prestataire Supabase.",
            en: "Access to the service requires the creation of a user account. Authentication and account management are handled through the provider Supabase.",
          })}</p>
          <p>{t({ fr: "Vous vous engagez à :", en: "You undertake to:" })}</p>
          <Bullets items={[
            t({ fr: "fournir des informations exactes, à jour et complètes lors de la création de votre compte ;", en: "provide accurate, up-to-date and complete information when creating your account;" }),
            t({ fr: "préserver la confidentialité de vos identifiants de connexion, notamment de votre mot de passe ;", en: "keep your login credentials confidential, in particular your password;" }),
            t({ fr: "nous informer sans délai de toute utilisation non autorisée de votre compte ou de toute atteinte à la sécurité.", en: "notify us without delay of any unauthorized use of your account or any breach of security." }),
          ]} />
          <p>{t({
            fr: "Vous êtes responsable de toute activité réalisée depuis votre compte. Votre mot de passe sert également à dériver, côté client, la clé de chiffrement protégeant vos documents (voir article 7). À ce titre, sa confidentialité revêt une importance particulière.",
            en: "You are responsible for all activity carried out from your account. Your password is also used, on the client side, to derive the encryption key protecting your documents (see Article 7). For that reason, its confidentiality is particularly important.",
          })}</p>
        </>
      ),
    },
    {
      heading: t({ fr: "5. Obligations de l'Utilisateur", en: "5. User obligations" }),
      body: (
        <>
          <p>{t({
            fr: "Vous vous engagez à utiliser le service conformément aux présentes CGU, aux lois et règlements applicables, ainsi qu'aux droits des tiers.",
            en: "You undertake to use the service in accordance with these Terms, applicable laws and regulations, and the rights of third parties.",
          })}</p>
          <p>{t({ fr: "Vous vous interdisez notamment :", en: "In particular, you must not:" })}</p>
          <Bullets items={[
            t({ fr: "d'utiliser le service à des fins illicites, frauduleuses ou portant atteinte aux droits de tiers ;", en: "use the service for unlawful or fraudulent purposes, or in a way that infringes the rights of third parties;" }),
            t({ fr: "de téléverser des contenus pour lesquels vous ne disposez pas des droits nécessaires ;", en: "upload content for which you do not hold the necessary rights;" }),
            t({ fr: "de tenter d'accéder de manière non autorisée au service, à ses systèmes ou aux données d'autres utilisateurs ;", en: "attempt to gain unauthorized access to the service, its systems or other users' data;" }),
            t({ fr: "de perturber, surcharger ou compromettre l'intégrité ou la sécurité du service ;", en: "disrupt, overload or compromise the integrity or security of the service;" }),
            t({ fr: "de procéder à toute opération de rétro-ingénierie, de décompilation ou de désassemblage du service, sauf dans les limites autorisées par la loi ;", en: "reverse-engineer, decompile or disassemble the service, except within the limits permitted by law;" }),
            t({ fr: "de contourner les mesures techniques de protection mises en place.", en: "circumvent the technical protection measures in place." }),
          ]} />
          <p>{t({
            fr: "Vous êtes seul responsable des contenus que vous traitez via le service et des conséquences de leur utilisation.",
            en: "You are solely responsible for the content you process through the service and for the consequences of its use.",
          })}</p>
        </>
      ),
    },
    {
      heading: t({ fr: "6. Propriété intellectuelle", en: "6. Intellectual property" }),
      body: (
        <>
          <p className="font-semibold text-[#111827] dark:text-white">{t({ fr: "6.1 Propriété d'Ora", en: "6.1 Ora's ownership" })}</p>
          <p>{t({
            fr: "Le service, dans tous ses composants (logiciel, interfaces, marques, logos, textes, structure, bases de données), est et demeure la propriété exclusive de l'Éditeur ou de ses concédants, et est protégé par les dispositions relatives à la propriété intellectuelle.",
            en: "The service, in all its components (software, interfaces, trademarks, logos, text, structure, databases), is and remains the exclusive property of the Publisher or its licensors, and is protected by intellectual property law.",
          })}</p>
          <p>{t({
            fr: "Les présentes CGU vous concèdent un droit d'utilisation personnel, non exclusif, non cessible et révocable du service, limité à la durée de votre accès et aux finalités prévues. Aucune autre cession de droit n'est consentie.",
            en: "These Terms grant you a personal, non-exclusive, non-transferable and revocable right to use the service, limited to the duration of your access and to the intended purposes. No other transfer of rights is granted.",
          })}</p>
          <p className="font-semibold text-[#111827] dark:text-white pt-2">{t({ fr: "6.2 Vos contenus", en: "6.2 Your content" })}</p>
          <p>{t({
            fr: "Vous conservez l'ensemble des droits de propriété intellectuelle sur les documents et données que vous téléversez ou créez via le service (ci-après vos « Contenus »).",
            en: "You retain all intellectual property rights in the documents and data you upload or create through the service (hereinafter your “Content”).",
          })}</p>
          <p>{t({
            fr: "Vous concédez à l'Éditeur une licence limitée, strictement nécessaire à l'hébergement, au traitement et à la fourniture du service, pour la durée de l'utilisation. Cette licence ne confère à l'Éditeur aucun droit d'exploitation de vos Contenus au-delà de l'exécution du service.",
            en: "You grant the Publisher a limited license, strictly necessary for the hosting, processing and provision of the service, for the duration of use. This license gives the Publisher no right to exploit your Content beyond operating the service.",
          })}</p>
        </>
      ),
    },
    {
      heading: t({ fr: "7. Données et confidentialité", en: "7. Data and privacy" }),
      body: (
        <>
          <p>{t({
            fr: "Le traitement de vos données personnelles est régi par notre Politique de confidentialité, qui fait partie intégrante des présentes CGU. Nous vous invitons à en prendre connaissance attentivement.",
            en: "The processing of your personal data is governed by our Privacy Policy, which forms an integral part of these Terms. We invite you to read it carefully.",
          })}</p>
          <p>{t({ fr: "L'architecture de sécurité repose sur un chiffrement d'enveloppe de bout en bout :", en: "The security architecture relies on end-to-end envelope encryption:" })}</p>
          <Bullets items={[
            t({ fr: "le contenu de chaque document est chiffré (algorithme XChaCha20-Poly1305) à l'aide d'une clé de chiffrement de données (DEK) aléatoire ;", en: "the content of each document is encrypted (XChaCha20-Poly1305 algorithm) using a random data encryption key (DEK);" }),
            t({ fr: "cette DEK est elle-même scellée par cryptographie asymétrique (X25519) au bénéfice des ayants droit ;", en: "this DEK is itself sealed using asymmetric cryptography (X25519) for the benefit of authorized parties;" }),
            t({ fr: "la clé de l'Utilisateur est dérivée de son mot de passe côté client (fonction Argon2id). Ora ne reçoit jamais votre mot de passe en clair.", en: "the User's key is derived from their password on the client side (Argon2id function). Ora never receives your password in clear text." }),
          ]} />
          <p>{t({
            fr: "Le contenu des documents est hébergé chez Infomaniak (Object Storage, en Suisse, à Genève). Les données d'authentification et les métadonnées sont hébergées chez Supabase (région de Francfort, au sein de l'Union européenne).",
            en: "Document content is hosted with Infomaniak (Object Storage, in Switzerland, in Geneva). Authentication data and metadata are hosted with Supabase (Frankfurt region, within the European Union).",
          })}</p>
        </>
      ),
    },
    {
      heading: t({ fr: "8. Accès technique via clé de séquestre (escrow)", en: "8. Technical access via escrow key" }),
      body: (
        <>
          <p>{t({
            fr: "Cette clause décrit une capacité d'accès technique d'Ora. Elle vous est communiquée de manière claire et explicite afin que votre acceptation des présentes CGU soit pleinement éclairée.",
            en: "This clause describes a technical access capability held by Ora. It is communicated to you clearly and explicitly so that your acceptance of these Terms is fully informed.",
          })}</p>
          <p>{t({
            fr: "En complément des clés des Utilisateurs, la DEK de chaque document est également scellée avec une clé publique dite « de séquestre » (escrow), détenue par Ora. La clé privée correspondante est conservée hors ligne, de façon sécurisée, avec un accès restreint.",
            en: "In addition to the Users' keys, the DEK of each document is also sealed with a public key known as an “escrow” key, held by Ora. The corresponding private key is kept offline, securely, with restricted access.",
          })}</p>
          <p>
            {t({ fr: "Cela signifie qu'", en: "This means that " })}
            <strong className="font-semibold text-[#111827] dark:text-white">{t({ fr: "Ora dispose de la possibilité technique d'accéder au contenu des documents", en: "Ora has the technical ability to access the content of documents" })}</strong>
            {t({ fr: ", par exemple afin de permettre la récupération d'un compte après la perte d'un mot de passe.", en: ", for example to enable account recovery after a lost password." })}
          </p>
          <p>{t({ fr: "Les engagements suivants encadrent cette capacité :", en: "The following commitments govern this capability:" })}</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>{t({ fr: "tout usage de la clé de séquestre est ", en: "any use of the escrow key is " })}<strong className="font-semibold text-[#111827] dark:text-white">{t({ fr: "journalisé et auditable", en: "logged and auditable" })}</strong> ;</li>
            <li>{t({ fr: "cet usage est réservé à des cas justifiés, tels que la récupération de compte, le respect d'une obligation légale ou la sécurité du service ;", en: "this use is reserved for justified cases, such as account recovery, compliance with a legal obligation, or the security of the service;" })}</li>
            <li>{t({ fr: "la clé privée de séquestre est conservée hors ligne, son accès étant strictement restreint.", en: "the escrow private key is kept offline, with strictly restricted access." })}</li>
          </ul>
          <p>{t({
            fr: "En acceptant les présentes CGU, vous reconnaissez avoir été informé de cette possibilité d'accès technique et vous y consentez. Les modalités de traitement associées sont précisées dans la Politique de confidentialité.",
            en: "By accepting these Terms, you acknowledge that you have been informed of this technical access capability and you consent to it. The associated processing terms are set out in the Privacy Policy.",
          })}</p>
        </>
      ),
    },
    {
      heading: t({ fr: "9. Disponibilité, maintenance et mises à jour", en: "9. Availability, maintenance and updates" }),
      body: (
        <>
          <p>{t({
            fr: "L'Éditeur s'efforce d'assurer la disponibilité du service de manière continue, sans toutefois pouvoir garantir une disponibilité ininterrompue.",
            en: "The Publisher strives to keep the service continuously available, without however being able to guarantee uninterrupted availability.",
          })}</p>
          <p>{t({
            fr: "L'accès au service peut être temporairement suspendu pour des raisons de maintenance, de mise à jour, d'évolution technique ou en cas de force majeure. L'Éditeur s'efforce, dans la mesure du possible, d'informer les Utilisateurs préalablement aux interruptions programmées.",
            en: "Access to the service may be temporarily suspended for maintenance, updates, technical changes or in the event of force majeure. As far as possible, the Publisher endeavors to inform Users ahead of scheduled interruptions.",
          })}</p>
          <p>{t({
            fr: "Le service peut faire l'objet de mises à jour automatiques destinées à en améliorer les fonctionnalités, la sécurité ou la performance. Certaines fonctionnalités peuvent être ajoutées, modifiées ou retirées. Les automatisations sont distribuées sous forme de modules cloud signés et peuvent être mises à jour sans nouvelle version du logiciel.",
            en: "The service may receive automatic updates intended to improve its features, security or performance. Some features may be added, changed or removed. Automations are distributed as signed cloud modules and may be updated without a new version of the software.",
          })}</p>
        </>
      ),
    },
    {
      heading: t({ fr: "10. Responsabilité et garanties", en: "10. Liability and warranties" }),
      body: (
        <>
          <p>{t({
            fr: "Le service est fourni dans les conditions décrites aux présentes CGU. Dans les limites autorisées par la loi, l'Éditeur ne fournit aucune garantie expresse ou implicite quant à l'adéquation du service à un besoin particulier ou à l'absence d'erreur.",
            en: "The service is provided under the conditions described in these Terms. To the extent permitted by law, the Publisher gives no express or implied warranty as to the fitness of the service for a particular purpose or the absence of errors.",
          })}</p>
          <p>{t({
            fr: "Vous demeurez responsable de la vérification des résultats produits par les automatisations et de leur usage. Les automatisations constituent une aide au traitement de données et ne sauraient se substituer au jugement professionnel de l'Utilisateur, en particulier dans un contexte financier, d'audit ou de M&A.",
            en: "You remain responsible for verifying the results produced by the automations and for their use. The automations are an aid to data processing and cannot replace the User's professional judgment, particularly in a financial, audit or M&A context.",
          })}</p>
          <p>{t({
            fr: "Dans les limites autorisées par la loi, la responsabilité de l'Éditeur ne saurait être engagée pour les dommages indirects, notamment la perte de données non imputable à l'Éditeur, la perte de chiffre d'affaires ou de profits, ou tout préjudice commercial.",
            en: "To the extent permitted by law, the Publisher cannot be held liable for indirect damages, in particular loss of data not attributable to the Publisher, loss of revenue or profits, or any commercial harm.",
          })}</p>
          <p>{t({
            fr: "Aucune stipulation des présentes CGU n'a pour effet de limiter ou d'exclure la responsabilité de l'Éditeur dans les cas où une telle limitation serait prohibée par la loi applicable.",
            en: "Nothing in these Terms limits or excludes the Publisher's liability in cases where such a limitation would be prohibited by applicable law.",
          })}</p>
        </>
      ),
    },
    {
      heading: t({ fr: "11. Suspension et résiliation", en: "11. Suspension and termination" }),
      body: (
        <>
          <p>{t({
            fr: "Vous pouvez cesser d'utiliser le service à tout moment et demander la clôture de votre compte dans les conditions prévues par votre contrat ou par la Politique de confidentialité.",
            en: "You may stop using the service at any time and request the closure of your account under the conditions set out in your contract or in the Privacy Policy.",
          })}</p>
          <p>{t({
            fr: "L'Éditeur peut suspendre ou résilier votre accès, en tout ou partie, en cas de manquement aux présentes CGU, d'usage portant atteinte à la sécurité du service ou aux droits de tiers, ou pour tout motif légitime, le cas échéant après information préalable.",
            en: "The Publisher may suspend or terminate your access, in whole or in part, in the event of a breach of these Terms, use that harms the security of the service or the rights of third parties, or for any legitimate reason, where appropriate after prior notice.",
          })}</p>
          <p>{t({
            fr: "En cas de départ d'un Utilisateur, les entrées de clés associées à son compte sont supprimées. Les documents partagés au niveau Équipe ou Organisation demeurent accessibles aux autres membres habilités. Les modalités de conservation et de suppression des données figurent dans la Politique de confidentialité (suppression douce assortie d'une rétention de 30 jours avant purge définitive).",
            en: "When a User leaves, the key entries associated with their account are deleted. Documents shared at Team or Organization level remain accessible to other authorized members. The data retention and deletion arrangements are set out in the Privacy Policy (soft deletion with a 30-day retention period before permanent purge).",
          })}</p>
        </>
      ),
    },
    {
      heading: t({ fr: "12. Modification des CGU", en: "12. Changes to the Terms" }),
      body: (
        <>
          <p>{t({
            fr: "L'Éditeur peut faire évoluer les présentes CGU afin de tenir compte des évolutions légales, réglementaires, techniques ou fonctionnelles du service. La version applicable est celle en vigueur au moment de votre utilisation du service.",
            en: "The Publisher may amend these Terms to reflect legal, regulatory, technical or functional changes to the service. The applicable version is the one in force at the time you use the service.",
          })}</p>
          <p>{t({
            fr: "En cas de modification substantielle, l'Éditeur vous en informe par un moyen approprié, par voie électronique ou via le service, avant son entrée en vigueur. La poursuite de l'utilisation du service après l'entrée en vigueur des CGU modifiées vaut acceptation de celles-ci. Si vous n'acceptez pas ces modifications, il vous appartient de cesser d'utiliser le service.",
            en: "In the event of a material change, the Publisher will inform you by an appropriate means, electronically or through the service, before it takes effect. Continuing to use the service after the amended Terms take effect constitutes acceptance of them. If you do not accept these changes, it is your responsibility to stop using the service.",
          })}</p>
        </>
      ),
    },
    {
      heading: t({ fr: "13. Droit applicable et juridiction", en: "13. Governing law and jurisdiction" }),
      body: (
        <>
          <p>{t({ fr: "Les présentes CGU sont régies par le droit français.", en: "These Terms are governed by French law." })}</p>
          <p>{t({
            fr: "À défaut de résolution amiable, tout litige relatif à leur validité, leur interprétation ou leur exécution sera soumis aux juridictions compétentes, sous réserve des dispositions légales impératives applicables, notamment en matière de protection des consommateurs.",
            en: "Failing an amicable resolution, any dispute relating to their validity, interpretation or performance will be submitted to the competent courts, subject to applicable mandatory legal provisions, in particular regarding consumer protection.",
          })}</p>
        </>
      ),
    },
    {
      heading: t({ fr: "14. Contact", en: "14. Contact" }),
      body: (
        <p>
          {t({ fr: "Pour toute question relative aux présentes CGU ou à la protection des données personnelles, vous pouvez contacter l'Éditeur à l'adresse suivante : ", en: "For any question regarding these Terms or the protection of personal data, you can contact the Publisher at: " })}
          <a href="mailto:contact@ora-solution.com" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">contact@ora-solution.com</a>.
        </p>
      ),
    },
  ];

  return (
    <LegalDocLayout
      theme={theme}
      onBackHome={() => onNavigate("home")}
      title={t({ fr: "Conditions Générales d'Utilisation", en: "Terms of Use" })}
      lastUpdated={t({ fr: "Dernière mise à jour : 20 juin 2026", en: "Last updated: June 20, 2026" })}
      intro={
        <>
          <p>{t({
            fr: "Les présentes Conditions Générales d'Utilisation (ci-après les « CGU ») régissent l'accès au service Ora et son utilisation. Ora est une application de bureau d'automatisation de flux de travail Excel, destinée aux équipes finance, audit et fusions-acquisitions (M&A).",
            en: "These Terms of Use (the “Terms”) govern access to and use of the Ora service. Ora is a desktop application for automating Excel workflows, designed for finance, audit and mergers and acquisitions (M&A) teams.",
          })}</p>
          <p>{t({
            fr: "Le service Ora est édité par Ora Solution, SAS au capital de 2040€, dont le siège social est situé 229 rue du faubourg Saint-Honoré 75001 Paris FRANCE, en cours d'immatriculation au RCS de Paris (ci-après « Ora », « nous » ou « l'Éditeur »).",
            en: "The Ora service is published by Ora Solution, a SAS with share capital of 2040€, whose registered office is located at 229 rue du faubourg Saint-Honoré, 75001 Paris, France, currently being registered with the Paris Trade and Companies Register (RCS) (hereinafter “Ora”, “we” or “the Publisher”).",
          })}</p>
        </>
      }
      sections={sections}
    />
  );
};

export default CGUPage;
