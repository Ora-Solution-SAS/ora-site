/**
 * MentionsLegalesPage — Mentions légales (Legal notice).
 *
 * Public, bilingual (FR/EN) rendering of Ora_V2/docs/legal/mentions-legales.md.
 * Keep in sync with that source. The EN text is a convenience translation and
 * the French version prevails.
 */

import LegalDocLayout, { type LegalSection } from "@/components/LegalDocLayout";
import { useLang } from "@/lib/i18n";

type Page = "home" | "confidentialite" | "politique-confidentialite" | "mentions-legales" | "cgu";

type Props = {
  theme: "light" | "dark";
  openBooking: () => void;
  onNavigate: (page: Page) => void;
};

const MentionsLegalesPage: React.FC<Props> = ({ theme, onNavigate }) => {
  const { t } = useLang();

  // Editor identity — label / value pairs.
  const identity: { label: string; value: React.ReactNode }[] = [
    { label: t({ fr: "Raison sociale", en: "Company name" }), value: "Ora Solution" },
    { label: t({ fr: "Forme juridique", en: "Legal form" }), value: "SAS" },
    { label: t({ fr: "Capital social", en: "Share capital" }), value: "2040€" },
    { label: t({ fr: "Siège social", en: "Registered office" }), value: "229 rue du faubourg Saint-Honoré, 75001 Paris, FRANCE" },
    { label: t({ fr: "Numéro SIREN", en: "SIREN number" }), value: t({ fr: "En cours d'immatriculation", en: "Being registered" }) },
    { label: t({ fr: "Immatriculation", en: "Registration" }), value: t({ fr: "RCS de Paris", en: "Paris Trade and Companies Register (RCS)" }) },
    { label: t({ fr: "Numéro de TVA intracommunautaire", en: "Intra-EU VAT number" }), value: t({ fr: "En cours d'immatriculation", en: "Being registered" }) },
    { label: t({ fr: "Téléphone", en: "Phone" }), value: (<a href="tel:+33768081904" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">+33 7 68 08 19 04</a>) },
    { label: t({ fr: "Adresse de contact", en: "Contact email" }), value: (<a href="mailto:contact@ora-solution.com" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">contact@ora-solution.com</a>) },
  ];

  const sections: LegalSection[] = [
    {
      heading: t({ fr: "1. Éditeur", en: "1. Publisher" }),
      body: (
        <>
          <p>{t({ fr: "Le service Ora est édité par :", en: "The Ora service is published by:" })}</p>
          <ul className="space-y-1.5">
            {identity.map((row) => (
              <li key={row.label}>
                <span className="font-medium text-[#111827] dark:text-white">{row.label} : </span>
                {row.value}
              </li>
            ))}
          </ul>
          <p>{t({
            fr: "Ora est une application de bureau d'automatisation de flux de travail et de gestion des données destinée aux équipes finance, audit et fusions-acquisitions (M&A).",
            en: "Ora is a desktop application for workflow automation and data management, designed for finance, audit and mergers and acquisitions (M&A) teams.",
          })}</p>
        </>
      ),
    },
    {
      heading: t({ fr: "2. Directeur de la publication", en: "2. Publication director" }),
      body: (
        <p>{t({ fr: "Le directeur de la publication est Monsieur Lucas Imbert.", en: "The publication director is Mr. Lucas Imbert." })}</p>
      ),
    },
    {
      heading: t({ fr: "3. Hébergeurs", en: "3. Hosts" }),
      body: (
        <>
          <div>
            <p className="font-semibold text-[#111827] dark:text-white">{t({ fr: "3.1 Contenu des documents", en: "3.1 Document content" })}</p>
            <p>{t({ fr: "Le contenu des documents est hébergé, sous forme chiffrée, par :", en: "Document content is hosted, in encrypted form, by:" })}</p>
            <ul className="mt-1.5 space-y-0.5">
              <li className="font-medium text-[#111827] dark:text-white">Infomaniak Network SA</li>
              <li>Rue Eugène-Marziano 25, 1227 Les Acacias (Genève), {t({ fr: "Suisse", en: "Switzerland" })}</li>
              <li>{t({ fr: "Téléphone", en: "Phone" })} : +41 22 820 35 44</li>
              <li>{t({ fr: "Service : Object Storage (Suisse, Genève)", en: "Service: Object Storage (Switzerland, Geneva)" })}</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-[#111827] dark:text-white">{t({ fr: "3.2 Authentification et métadonnées", en: "3.2 Authentication and metadata" })}</p>
            <p>{t({ fr: "Les données d'authentification et les métadonnées sont hébergées par :", en: "Authentication data and metadata are hosted by:" })}</p>
            <ul className="mt-1.5 space-y-0.5">
              <li className="font-medium text-[#111827] dark:text-white">Supabase, Inc.</li>
              <li>548 Market Street, San Francisco, CA 94104, {t({ fr: "États-Unis", en: "United States" })}</li>
              <li>{t({ fr: "Service : authentification et hébergement des métadonnées, données localisées dans la région de Francfort (Union européenne)", en: "Service: authentication and metadata hosting, data located in the Frankfurt region (European Union)" })}</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-[#111827] dark:text-white">{t({ fr: "3.3 Site web", en: "3.3 Website" })}</p>
            <p>{t({ fr: "Le site web associé au service est hébergé par :", en: "The website associated with the service is hosted by:" })}</p>
            <ul className="mt-1.5 space-y-0.5">
              <li className="font-medium text-[#111827] dark:text-white">Vercel Inc.</li>
              <li>340 S Lemon Ave #4133, Walnut, CA 91789, {t({ fr: "États-Unis", en: "United States" })}</li>
            </ul>
          </div>
        </>
      ),
    },
    {
      heading: t({ fr: "4. Contact", en: "4. Contact" }),
      body: (
        <>
          <p>
            {t({ fr: "Pour toute question, vous pouvez contacter l'Éditeur à l'adresse suivante : ", en: "For any question, you can contact the Publisher at: " })}
            <a href="mailto:contact@ora-solution.com" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">contact@ora-solution.com</a>.
          </p>
          <p>{t({
            fr: "Pour toute question relative à la protection des données personnelles, vous pouvez contacter la société à l'adresse citée précédemment.",
            en: "For any question regarding the protection of personal data, you can contact the company at the address mentioned above.",
          })}</p>
        </>
      ),
    },
    {
      heading: t({ fr: "5. Propriété intellectuelle", en: "5. Intellectual property" }),
      body: (
        <>
          <p>{t({
            fr: "L'ensemble des éléments composant le service Ora et, le cas échéant, le site web associé (notamment le logiciel, les interfaces, la marque « Ora », les logos, les textes, la structure et les bases de données) est protégé par les dispositions relatives à la propriété intellectuelle. Ces éléments sont la propriété exclusive de l'Éditeur ou de ses concédants.",
            en: "All elements making up the Ora service and, where applicable, the associated website (in particular the software, interfaces, the “Ora” trademark, logos, text, structure and databases) are protected by intellectual property law. These elements are the exclusive property of the Publisher or its licensors.",
          })}</p>
          <p>{t({
            fr: "Toute reproduction, représentation, modification, adaptation ou exploitation, totale ou partielle, de ces éléments, par quelque procédé que ce soit, sans l'autorisation écrite préalable de l'Éditeur, est interdite et constitue une contrefaçon susceptible d'engager la responsabilité de son auteur.",
            en: "Any reproduction, representation, modification, adaptation or exploitation, in whole or in part, of these elements, by any means whatsoever, without the prior written authorization of the Publisher, is prohibited and constitutes an infringement that may render its author liable.",
          })}</p>
          <p>{t({
            fr: "Les conditions d'utilisation du service sont précisées dans les Conditions Générales d'Utilisation et la Politique de confidentialité.",
            en: "The terms of use of the service are set out in the Terms of Use and the Privacy Policy.",
          })}</p>
        </>
      ),
    },
  ];

  return (
    <LegalDocLayout
      theme={theme}
      onBackHome={() => onNavigate("home")}
      title={t({ fr: "Mentions légales", en: "Legal notice" })}
      lastUpdated={t({ fr: "Dernière mise à jour : 20 juin 2026", en: "Last updated: June 20, 2026" })}
      sections={sections}
    />
  );
};

export default MentionsLegalesPage;
