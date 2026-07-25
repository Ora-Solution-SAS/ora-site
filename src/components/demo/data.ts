import type { LucideIcon } from "lucide-react";
import {
  FileSpreadsheet,
  BookOpenCheck,
  Stethoscope,
  Sparkles,
  FileText,
} from "lucide-react";

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
  /** Drives the small illustrated before/after placeholder. */
  previewVariant: "import" | "workbook" | "diagnostic" | "clean" | "pdf";
};

export const DEMO_AUTOMATIONS: DemoAutomation[] = [
  {
    key: "fec_import",
    Icon: FileSpreadsheet,
    title: { fr: "FEC vers Excel", en: "FEC to Excel" },
    tagline: {
      fr: "Votre FEC brut devient un classeur propre et formaté.",
      en: "Your raw FEC becomes a clean, formatted workbook.",
    },
    desc: {
      fr: "Déposez le FEC tel qu'il sort de votre logiciel : séparateurs, dates AAAAMMJJ et montants en texte sont convertis automatiquement en un Excel lisible, filtrable et prêt à travailler.",
      en: "Drop the FEC exactly as your software exports it: delimiters, AAAAMMJJ dates and text amounts are automatically converted into a readable, filterable, ready-to-use Excel file.",
    },
    accepts: [".txt", ".csv"],
    acceptsLabel: { fr: "FEC (.txt)", en: "FEC (.txt)" },
    outputLabel: { fr: "Classeur Excel formaté", en: "Formatted Excel workbook" },
    previewVariant: "import",
  },
  {
    key: "fec_studio",
    Icon: BookOpenCheck,
    title: { fr: "Classeur d'audit", en: "Audit workbook" },
    tagline: {
      fr: "Un dossier d'audit complet généré depuis votre FEC.",
      en: "A complete audit binder generated from your FEC.",
    },
    desc: {
      fr: "Balances, revue analytique, contrôles et synthèses : Ora construit en une fois un classeur d'audit à votre charte, prêt à présenter en mission.",
      en: "Balances, analytical review, controls and summaries: Ora builds in one pass a branded audit workbook, ready to present.",
    },
    accepts: [".txt"],
    acceptsLabel: { fr: "FEC (.txt)", en: "FEC (.txt)" },
    outputLabel: { fr: "Classeur d'audit Excel", en: "Excel audit workbook" },
    previewVariant: "workbook",
  },
  {
    key: "fec_diagnostic",
    Icon: Stethoscope,
    title: { fr: "Diagnostic d'équilibre", en: "Balance diagnostic" },
    tagline: {
      fr: "Trouve le déséquilibre et propose la correction.",
      en: "Finds the imbalance and suggests the fix.",
    },
    desc: {
      fr: "FEC déséquilibré ? Ora localise l'écriture en cause, explique la cause probable et propose l'écriture correctrice, avec un niveau de confiance.",
      en: "Unbalanced FEC? Ora locates the faulty entry, explains the probable cause and suggests the correcting entry, with a confidence level.",
    },
    accepts: [".txt"],
    acceptsLabel: { fr: "FEC (.txt)", en: "FEC (.txt)" },
    outputLabel: { fr: "Rapport Excel + PDF", en: "Excel + PDF report" },
    previewVariant: "diagnostic",
  },
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
    key: "export_pdf",
    Icon: FileText,
    title: { fr: "Excel vers PDF", en: "Excel to PDF" },
    tagline: {
      fr: "Une feuille Excel devient un PDF de présentation.",
      en: "An Excel sheet becomes a presentation-ready PDF.",
    },
    desc: {
      fr: "Transformez une feuille de calcul en PDF soigné : orientation, mise en page et en-têtes gérés automatiquement, à votre charte.",
      en: "Turn a spreadsheet into a polished PDF: orientation, layout and headers handled automatically, in your brand style.",
    },
    accepts: [".xlsx"],
    acceptsLabel: { fr: "Excel (.xlsx)", en: "Excel (.xlsx)" },
    outputLabel: { fr: "Document PDF", en: "PDF document" },
    previewVariant: "pdf",
  },
];

export function getAutomation(key: string | null): DemoAutomation | null {
  if (!key) return null;
  return DEMO_AUTOMATIONS.find((a) => a.key === key) ?? null;
}
