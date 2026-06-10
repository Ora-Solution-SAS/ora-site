/**
 * MentionsLegalesPage — Legal notices.
 *
 * Standard French "mentions légales" layout (éditeur, hébergeur, propriété
 * intellectuelle, données personnelles, cookies, responsabilité), bilingual.
 *
 * NOTE: company-identity fields (legal name, SIRET/RCS, registered address,
 * publication director…) are placeholders marked « [À compléter] ». Replace
 * them with the real details before going live.
 */

import { ArrowLeft } from "lucide-react";
import { useLang } from "@/lib/i18n";

type Page = "home" | "confidentialite" | "mentions-legales";

type Props = {
  theme: "light" | "dark";
  openBooking: () => void;
  onNavigate: (page: Page) => void;
};

type Section = { heading: string; body: React.ReactNode };

const MentionsLegalesPage: React.FC<Props> = ({ theme, onNavigate }) => {
  const { t, lang } = useLang();
  const dk = theme === "dark";

  // Placeholder marker, styled so it's obvious what still needs filling in.
  const TODO = ({ children }: { children: React.ReactNode }) => (
    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 font-medium">
      {children}
    </span>
  );

  const lastUpdated = lang === "fr" ? "Dernière mise à jour : juin 2026" : "Last updated: June 2026";

  const sections: Section[] = [
    {
      heading: t({ fr: "1. Éditeur du site", en: "1. Site publisher" }),
      body: (
        <>
          <p>
            {t({
              fr: "Le présent site est édité par :",
              en: "This website is published by:",
            })}
          </p>
          <ul className="mt-3 space-y-1.5">
            <li>{t({ fr: "Raison sociale : ", en: "Company name: " })}<TODO>Ora [À compléter]</TODO></li>
            <li>{t({ fr: "Forme juridique : ", en: "Legal form: " })}<TODO>[À compléter]</TODO></li>
            <li>{t({ fr: "Capital social : ", en: "Share capital: " })}<TODO>[À compléter]</TODO></li>
            <li>{t({ fr: "Siège social : ", en: "Registered office: " })}<TODO>[À compléter]</TODO></li>
            <li>{t({ fr: "SIREN / RCS : ", en: "Company registration no.: " })}<TODO>[À compléter]</TODO></li>
            <li>{t({ fr: "N° TVA intracommunautaire : ", en: "VAT number: " })}<TODO>[À compléter]</TODO></li>
            <li>{t({ fr: "Adresse e-mail : ", en: "Email: " })}<a href="mailto:raphael.gaugain@ora-solution.com" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">raphael.gaugain@ora-solution.com</a></li>
            <li>{t({ fr: "Directeur de la publication : ", en: "Publication director: " })}<TODO>[À compléter]</TODO></li>
          </ul>
        </>
      ),
    },
    {
      heading: t({ fr: "2. Hébergement", en: "2. Hosting" }),
      body: (
        <p>
          {t({
            fr: "Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis. Les données applicatives chiffrées sont, quant à elles, stockées chez un hébergeur situé en Suisse et conforme au RGPD.",
            en: "The website is hosted by Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA. Encrypted application data is stored with a Switzerland-based, GDPR-compliant host.",
          })}
        </p>
      ),
    },
    {
      heading: t({ fr: "3. Propriété intellectuelle", en: "3. Intellectual property" }),
      body: (
        <p>
          {t({
            fr: "L'ensemble des contenus présents sur ce site (textes, visuels, logos, vidéos, code, marque Ora) est protégé par le droit de la propriété intellectuelle et reste la propriété exclusive de l'éditeur, sauf mention contraire. Toute reproduction ou réutilisation, totale ou partielle, sans autorisation écrite préalable est interdite.",
            en: "All content on this website (text, visuals, logos, videos, code, the Ora brand) is protected by intellectual property law and remains the exclusive property of the publisher, unless stated otherwise. Any reproduction or reuse, in whole or in part, without prior written authorization is prohibited.",
          })}
        </p>
      ),
    },
    {
      heading: t({ fr: "4. Données personnelles", en: "4. Personal data" }),
      body: (
        <p>
          {t({
            fr: "Ora traite vos fichiers de manière locale et chiffrée : vos données métier ne sont jamais lisibles sur nos serveurs. Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données personnelles, ainsi que d'un droit d'opposition. Pour exercer ces droits, écrivez-nous à ",
            en: "Ora processes your files locally and encrypted: your business data is never readable on our servers. Under the GDPR, you have the right to access, rectify, erase and port your personal data, as well as the right to object. To exercise these rights, email us at ",
          })}
          <a href="mailto:raphael.gaugain@ora-solution.com" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
            raphael.gaugain@ora-solution.com
          </a>
          .
        </p>
      ),
    },
    {
      heading: t({ fr: "5. Cookies", en: "5. Cookies" }),
      body: (
        <p>
          {t({
            fr: "Ce site utilise uniquement les cookies strictement nécessaires à son fonctionnement et, le cas échéant, des cookies de mesure d'audience anonymisés. Aucun cookie publicitaire n'est déposé. Vous pouvez configurer votre navigateur pour refuser les cookies non essentiels.",
            en: "This website only uses cookies strictly necessary for its operation and, where applicable, anonymized analytics cookies. No advertising cookies are set. You can configure your browser to refuse non-essential cookies.",
          })}
        </p>
      ),
    },
    {
      heading: t({ fr: "6. Responsabilité", en: "6. Liability" }),
      body: (
        <p>
          {t({
            fr: "L'éditeur s'efforce d'assurer l'exactitude des informations diffusées sur ce site, sans pouvoir en garantir l'exhaustivité ni l'absence d'erreurs. L'éditeur ne saurait être tenu responsable des dommages directs ou indirects résultant de l'utilisation du site ou de l'impossibilité d'y accéder.",
            en: "The publisher strives to ensure the accuracy of the information on this website, without guaranteeing its completeness or being error-free. The publisher cannot be held liable for any direct or indirect damages resulting from the use of, or inability to access, the website.",
          })}
        </p>
      ),
    },
    {
      heading: t({ fr: "7. Droit applicable", en: "7. Governing law" }),
      body: (
        <p>
          {t({
            fr: "Les présentes mentions légales sont régies par le droit français. Tout litige relatif à leur interprétation ou à leur exécution relève des tribunaux compétents.",
            en: "These legal notices are governed by French law. Any dispute relating to their interpretation or performance falls under the jurisdiction of the competent courts.",
          })}
        </p>
      ),
    },
  ];

  return (
    <main
      className="min-h-screen px-6 md:px-12 pt-32 md:pt-40 pb-24 md:pb-32"
      style={{ backgroundColor: dk ? "#111827" : "#fcfbf7" }}
    >
      <div className="max-w-3xl mx-auto">
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="inline-flex items-center gap-2 text-[14px] font-inter font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-150 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t({ fr: "Retour à l'accueil", en: "Back to home" })}
        </button>

        <h1 className="font-poppins font-semibold text-4xl md:text-5xl tracking-[-0.03em] leading-[1.1] text-[#111827] dark:text-white">
          {t({ fr: "Mentions légales", en: "Legal notices" })}
        </h1>
        <p className="mt-4 font-inter text-[14px] text-gray-400 dark:text-gray-500">{lastUpdated}</p>

        <div className="mt-12 space-y-10">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-poppins font-semibold text-xl md:text-[1.4rem] tracking-tight text-[#111827] dark:text-white mb-3">
                {s.heading}
              </h2>
              <div className="font-inter text-[15px] md:text-base leading-[1.75] text-gray-600 dark:text-gray-300">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
};

export default MentionsLegalesPage;
