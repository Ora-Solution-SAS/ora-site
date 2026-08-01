import { unzipSync, strFromU8 } from "fflate";

/**
 * Lecture du fichier DÉPOSÉ par le visiteur, dans le navigateur, pour l'afficher
 * dans la réplique Excel du Workbench.
 *
 * Pourquoi un lecteur maison plutôt que SheetJS : le paquet `xlsx` publié sur
 * npm est figé en 0.18.5, la version visée par deux avis de sécurité (pollution
 * de prototype, ReDoS) corrigés seulement sur le CDN de l'éditeur. On fait
 * passer ici des fichiers de visiteurs : pas question. Un .xlsx n'étant qu'une
 * archive zip de XML, et l'aperçu ne demandant que les premières lignes de la
 * première feuille, `fflate` (8 Ko, sans avis) plus le DOMParser du navigateur
 * suffisent largement.
 *
 * Le fichier ne quitte JAMAIS la page : tout est lu en mémoire.
 */

/** Bornes de l'aperçu. Au-delà, la réplique n'affiche rien de plus de toute façon. */
const MAX_ROWS = 80;
const MAX_COLS = 14;

export type SheetRead = {
  name: string;
  /** Lignes de valeurs déjà mises en forme pour l'affichage. */
  rows: string[][];
  /** Nombre de lignes réellement présentes dans la feuille. */
  totalRows: number;
  truncated: boolean;
};

export type WorkbookRead = {
  fileName: string;
  sheets: SheetRead[];
};

export class WorkbookReadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkbookReadError";
  }
}

/** Point d'entrée : accepte .xlsx et .csv. */
export async function readUploadedFile(file: File): Promise<WorkbookRead> {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".csv") || lower.endsWith(".txt")) {
    return readDelimited(file);
  }
  if (lower.endsWith(".xlsx") || lower.endsWith(".xlsm")) {
    return readXlsx(file);
  }
  throw new WorkbookReadError(`Format non pris en charge pour l'aperçu : ${file.name}`);
}

// ── CSV et FEC ─────────────────────────────────────────────────────────────

/** Le séparateur est deviné sur la première ligne : le FEC utilise la
 *  tabulation ou le pipe, les exports français le point-virgule. */
function guessDelimiter(line: string): string {
  const candidates = ["\t", ";", "|", ","];
  let best = ";", bestCount = 0;
  for (const d of candidates) {
    const n = line.split(d).length - 1;
    if (n > bestCount) { best = d; bestCount = n; }
  }
  return best;
}

/** Découpe une ligne en respectant les champs entre guillemets. */
function splitLine(line: string, delimiter: string): string[] {
  const out: string[] = [];
  let cur = "", inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        // Guillemet doublé : c'est un guillemet littéral, pas une fermeture.
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = false;
      } else cur += c;
    } else if (c === '"') inQuotes = true;
    else if (c === delimiter) { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

async function readDelimited(file: File): Promise<WorkbookRead> {
  const text = await file.text();
  const lines = text.split(/\r\n|\n|\r/).filter((l, i, a) => l.length > 0 || i < a.length - 1);
  if (!lines.length) throw new WorkbookReadError("Le fichier est vide.");
  const delimiter = guessDelimiter(lines[0]);
  const rows = lines.slice(0, MAX_ROWS).map((l) => splitLine(l, delimiter).slice(0, MAX_COLS));
  return {
    fileName: file.name,
    sheets: [{
      name: file.name.replace(/\.[^.]+$/, "").slice(0, 24),
      rows,
      totalRows: lines.length,
      truncated: lines.length > MAX_ROWS,
    }],
  };
}

// ── XLSX ───────────────────────────────────────────────────────────────────

const parseXml = (xml: string) => new DOMParser().parseFromString(xml, "application/xml");

/** « BC12 » → 54. */
function columnIndex(ref: string): number {
  const letters = ref.match(/^[A-Z]+/)?.[0] ?? "A";
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

/**
 * Identifiants de format de nombre qui désignent une date. Les 14-22 et 45-47
 * sont les formats intégrés d'Excel ; les formats personnalisés sont reconnus à
 * leur code (présence de j/m/a ou d/m/y hors littéraux).
 */
const BUILTIN_DATE_FMTS = new Set([14, 15, 16, 17, 18, 19, 20, 21, 22, 45, 46, 47]);

function dateFormatIds(stylesXml: string | undefined): Set<number> {
  const dateStyles = new Set<number>();
  if (!stylesXml) return dateStyles;
  const doc = parseXml(stylesXml);

  const customDateFmts = new Set<number>();
  doc.querySelectorAll("numFmts > numFmt").forEach((n) => {
    const id = Number(n.getAttribute("numFmtId"));
    const code = (n.getAttribute("formatCode") ?? "").replace(/\[[^\]]*\]|"[^"]*"/g, "");
    if (/[dmyhjs]/i.test(code) && /[dmyj]/i.test(code)) customDateFmts.add(id);
  });

  // L'index d'un style de cellule est sa position dans cellXfs.
  doc.querySelectorAll("cellXfs > xf").forEach((xf, i) => {
    const id = Number(xf.getAttribute("numFmtId") ?? 0);
    if (BUILTIN_DATE_FMTS.has(id) || customDateFmts.has(id)) dateStyles.add(i);
  });
  return dateStyles;
}

/** Numéro de série Excel → JJ/MM/AAAA. Le 30/12/1899 comme origine absorbe le
 *  fameux bug de l'année bissextile 1900. */
function serialToDate(serial: number): string {
  const ms = Date.UTC(1899, 11, 30) + Math.round(serial) * 86_400_000;
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
}

function formatNumber(raw: string): string {
  const n = Number(raw);
  if (!Number.isFinite(n)) return raw;
  if (Number.isInteger(n)) return String(n);
  return raw.replace(".", ",");
}

async function readXlsx(file: File): Promise<WorkbookRead> {
  let files: Record<string, Uint8Array>;
  try {
    files = unzipSync(new Uint8Array(await file.arrayBuffer()));
  } catch {
    throw new WorkbookReadError("Ce fichier n'a pas pu être ouvert comme un classeur Excel.");
  }

  const read = (path: string) => (files[path] ? strFromU8(files[path]) : undefined);

  // Chaînes partagées : la plupart des textes d'un xlsx vivent ici.
  const shared: string[] = [];
  const sharedXml = read("xl/sharedStrings.xml");
  if (sharedXml) {
    parseXml(sharedXml).querySelectorAll("si").forEach((si) => {
      // Un `si` peut être découpé en plusieurs `t` (texte enrichi) : on recolle.
      shared.push(Array.from(si.querySelectorAll("t")).map((t) => t.textContent ?? "").join(""));
    });
  }

  const dateStyles = dateFormatIds(read("xl/styles.xml"));

  // Ordre et noms des feuilles, résolus via les relations plutôt que par le
  // nom de fichier : rien ne garantit que la feuille 1 soit sheet1.xml.
  const relTargets = new Map<string, string>();
  const relsXml = read("xl/_rels/workbook.xml.rels");
  if (relsXml) {
    parseXml(relsXml).querySelectorAll("Relationship").forEach((r) => {
      relTargets.set(r.getAttribute("Id") ?? "", (r.getAttribute("Target") ?? "").replace(/^\/?xl\//, ""));
    });
  }

  const wbXml = read("xl/workbook.xml");
  if (!wbXml) throw new WorkbookReadError("Classeur illisible : le descripteur est absent.");
  const sheetDefs = Array.from(parseXml(wbXml).querySelectorAll("sheets > sheet")).map((s) => ({
    name: s.getAttribute("name") ?? "Feuille",
    target: relTargets.get(s.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id") ?? "") ?? "",
  }));

  const sheets: SheetRead[] = [];
  for (const def of sheetDefs) {
    const xml = read(`xl/${def.target}`);
    if (!xml) continue;
    sheets.push(readSheet(def.name, xml, shared, dateStyles));
    // Seule la première feuille est affichée : inutile de tout décoder.
    if (sheets.length >= 3) break;
  }
  if (!sheets.length) throw new WorkbookReadError("Aucune feuille lisible dans ce classeur.");

  return { fileName: file.name, sheets };
}

function readSheet(name: string, xml: string, shared: string[], dateStyles: Set<number>): SheetRead {
  const doc = parseXml(xml);
  const rowNodes = Array.from(doc.querySelectorAll("sheetData > row"));
  const rows: string[][] = [];

  for (const rowNode of rowNodes.slice(0, MAX_ROWS)) {
    const cells: string[] = [];
    rowNode.querySelectorAll("c").forEach((c) => {
      const col = columnIndex(c.getAttribute("r") ?? "A1");
      if (col >= MAX_COLS) return;
      // Les cellules vides sont omises du XML : on comble les trous.
      while (cells.length < col) cells.push("");
      cells.push(cellValue(c, shared, dateStyles));
    });
    rows.push(cells);
  }

  return { name, rows, totalRows: rowNodes.length, truncated: rowNodes.length > MAX_ROWS };
}

function cellValue(c: Element, shared: string[], dateStyles: Set<number>): string {
  const type = c.getAttribute("t");
  if (type === "inlineStr") {
    return Array.from(c.querySelectorAll("is t")).map((t) => t.textContent ?? "").join("");
  }
  const raw = c.querySelector("v")?.textContent ?? "";
  if (raw === "") return "";
  if (type === "s") return shared[Number(raw)] ?? "";
  if (type === "str" || type === "e") return raw;
  if (type === "b") return raw === "1" ? "VRAI" : "FAUX";

  // Numérique : c'est le style qui dit si c'est une date.
  const styleIndex = Number(c.getAttribute("s") ?? -1);
  if (styleIndex >= 0 && dateStyles.has(styleIndex)) {
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return serialToDate(n);
  }
  return formatNumber(raw);
}
