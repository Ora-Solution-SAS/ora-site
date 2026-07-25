import type { LucideIcon } from "lucide-react";
import { FileSpreadsheet, BookOpenCheck, Sparkles, FileText } from "lucide-react";

// Catalog of the automations offered in the online demo (/demo page).
//
// PLACEHOLDER CONTENT: the final list of 5 automations is not decided yet.
// Everything below (keys, titles, descriptions, examples) can be swapped
// without touching the flow components. Keys must simply match the backend
// registry once the demo service (ora-demo-service) is live.

export type Localized = { fr: string; en: string };

export type DemoAutomation = {
  key: string;
  Icon: LucideIcon;
  title: Localized;
  /** One-liner always visible on the card. */
  tagline: Localized;
  /** Longer pitch revealed when the card is hovered or selected. */
  desc: Localized;
  /** Allowed file extensions, lowercase, with the leading dot. */
  accepts: string[];
  acceptsLabel: Localized;
  outputLabel: Localized;
  /** Drives the drawn before/after placeholder when no image is provided. */
  previewVariant: "import" | "workbook" | "diagnostic" | "clean" | "pdf" | "chart";
  /** Real illustration (public/ path, e.g. a screenshot of the output).
   * When set, the carousel shows it instead of the drawn placeholder. */
  image?: string;
};

export const DEMO_AUTOMATIONS: DemoAutomation[] = [
  {
    key: "clean_file",
    Icon: Sparkles,
    title: { fr: "Nettoyage de fichier", en: "File cleanup" },
    tagline: {
      fr: "Doublons, lignes vides, formats : tout est nettoyé.",
      en: "Duplicates, empty rows, formats: everything cleaned.",
    },
    desc: {
      fr: "Idéal pour n'importe quel export : suppression des doublons et lignes vides, en-têtes normalisés, dates et nombres en texte convertis en vraies valeurs.",
      en: "Perfect for any export: duplicates and empty rows removed, headers normalized, text dates and numbers converted into real values.",
    },
    accepts: [".xlsx", ".csv"],
    acceptsLabel: { fr: "Excel ou CSV", en: "Excel or CSV" },
    outputLabel: { fr: "Fichier nettoyé et formaté", en: "Cleaned, formatted file" },
    previewVariant: "clean",
  },
  {
    key: "fec_studio_light",
    Icon: BookOpenCheck,
    title: { fr: "FEC Studio", en: "FEC Studio" },
    tagline: {
      fr: "L'essentiel de l'analyse d'un FEC, en un classeur.",
      en: "The essentials of FEC analysis, in one workbook.",
    },
    desc: {
      fr: "Balances en tableaux croisés dynamiques, top 10 des postes de charges et leur saisonnalité en graphiques, saisonnalité du chiffre d'affaires : un classeur d'analyse à la charte Ora, généré depuis votre FEC.",
      en: "Balances as pivot tables, top 10 expense accounts with seasonality charts, and revenue seasonality: an Ora-branded analysis workbook generated from your FEC.",
    },
    accepts: [".txt"],
    acceptsLabel: { fr: "FEC (.txt)", en: "FEC (.txt)" },
    outputLabel: { fr: "Classeur d'analyse Excel", en: "Excel analysis workbook" },
    previewVariant: "workbook",
  },
  {
    key: "ca_saisonnalite",
    Icon: FileSpreadsheet,
    title: { fr: "Saisonnalité du CA", en: "Revenue seasonality" },
    tagline: {
      fr: "La saisonnalité de votre CA, en graphiques.",
      en: "Your revenue seasonality, in charts.",
    },
    desc: {
      fr: "À partir du FEC, Ora construit la saisonnalité de votre chiffre d'affaires et le classement du CA par poste, avec des graphiques prêts à présenter.",
      en: "From the FEC, Ora builds your revenue seasonality and the ranking of revenue by account, with presentation-ready charts.",
    },
    accepts: [".txt"],
    acceptsLabel: { fr: "FEC (.txt)", en: "FEC (.txt)" },
    outputLabel: { fr: "Classeur Excel + graphiques", en: "Excel workbook + charts" },
    previewVariant: "chart",
  },
  {
    key: "pdf_tableaux_excel",
    Icon: FileText,
    title: { fr: "PDF vers Excel", en: "PDF to Excel" },
    tagline: {
      fr: "Les tableaux d'un PDF deviennent un classeur Excel.",
      en: "PDF tables become an Excel workbook.",
    },
    desc: {
      fr: "Extraction des tableaux d'un PDF, même scanné (OCR), vers un classeur Excel structuré : un tableau par feuille, montants et dates convertis en vraies valeurs.",
      en: "Extracts the tables of a PDF, even scanned (OCR), into a structured Excel workbook: one table per sheet, amounts and dates converted into real values.",
    },
    accepts: [".pdf"],
    acceptsLabel: { fr: "PDF (.pdf)", en: "PDF (.pdf)" },
    outputLabel: { fr: "Classeur Excel", en: "Excel workbook" },
    previewVariant: "import",
  },
];

export function getAutomation(key: string | null): DemoAutomation | null {
  if (!key) return null;
  return DEMO_AUTOMATIONS.find((a) => a.key === key) ?? null;
}
