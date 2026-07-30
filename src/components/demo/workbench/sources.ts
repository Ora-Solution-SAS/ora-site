import type { GridCell, GridSource } from "./ExcelPane";
import { widthsFor } from "./ExcelPane";
import {
  CLEAN_COLUMNS, CLEAN_FILENAME, MESSY_COLUMNS, MESSY_FILENAME,
  cleanCells, cleanLedger, messyLedger,
} from "./ledger";
import type { WorkbookRead } from "./readWorkbook";

/**
 * Fabrique les grilles affichées par ExcelPane, quelle que soit leur origine :
 * classeur de démonstration ou fichier réellement déposé par le visiteur.
 *
 * Toute la connaissance « d'où viennent les données » est concentrée ici, ce
 * qui laisse la réplique Excel purement présentationnelle.
 */

const txt = (text: string, numeric = false): GridCell => ({ text, numeric });

/** Le grand livre sale, montré en avant-goût tant que rien n'est déposé. */
export function demoMessySource(): GridSource {
  const entries = cleanLedger(44);
  const rows: GridCell[][] = [
    MESSY_COLUMNS.map((c) => txt(c)),
    ...messyLedger(entries).map((r) =>
      r.blank ? [] : r.cells.map((c) => ({ text: c.text, asText: c.asText }))
    ),
  ];
  return {
    filename: MESSY_FILENAME,
    sheetName: "Grand livre",
    extraTabs: ["xrtcyv"],
    rows,
    widths: [116, 74, 84, 158, 84, 96, 96, 84],
    nameBox: "G13",
    formula: "",
  };
}

/** Le même grand livre après « Nettoyer le fichier ». */
export function demoCleanSource(): GridSource {
  const entries = cleanLedger(44);
  const rows: GridCell[][] = [
    CLEAN_COLUMNS.map((c) => txt(c)),
    ...entries.map((e) => cleanCells(e).map((t, j) => txt(t, j >= 5))),
  ];
  return {
    filename: CLEAN_FILENAME,
    sheetName: "Sheet",
    rows,
    widths: [78, 56, 62, 92, 68, 74, 74],
    nameBox: "A1",
    formula: "Date",
  };
}

/** Une valeur qui « ressemble » à un nombre est alignée à droite, comme Excel. */
const looksNumeric = (s: string) => /^-?[\d  ]+([.,]\d+)?\s*[€%]?$/.test(s.trim()) && /\d/.test(s);

/** Le fichier RÉELLEMENT déposé par le visiteur. */
export function uploadedSource(read: WorkbookRead): GridSource {
  const sheet = read.sheets[0];
  const rows: GridCell[][] = sheet.rows.map((r, i) =>
    r.map((text) => ({ text, numeric: i > 0 && looksNumeric(text) }))
  );
  return {
    filename: read.fileName.replace(/\.[^.]+$/, ""),
    sheetName: sheet.name,
    extraTabs: read.sheets.slice(1).map((s) => s.name),
    rows,
    widths: widthsFor(rows),
    nameBox: "A1",
    formula: rows[0]?.[0]?.text ?? "",
  };
}
