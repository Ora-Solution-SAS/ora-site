/**
 * Le grand livre de démonstration du Workbench, dans ses deux états.
 *
 * Reconstitué d'après les captures du vrai logiciel (client 2026-07-30) :
 * `01_grand_livre_client_a_nettoyer.xlsx` avant, et sa version nettoyée après.
 *
 * Les écritures sont GÉNÉRÉES, pas transcrites une par une : le fichier
 * d'origine est lui-même synthétique (montants en progression régulière,
 * journaux et comptes qui tournent en boucle). Un générateur donne exactement
 * le même rendu tout en restant lisible, et permet d'allonger le fichier sans
 * recopier trois cents lignes.
 *
 * Toute la saleté est posée par-dessus dans `messyLedger` : c'est elle qui fait
 * le contraste avec l'après, donc elle est décrite explicitement plutôt que
 * dispersée dans les données.
 */

/** Une écriture, dans sa forme canonique — celle du fichier NETTOYÉ. */
export type Entry = {
  /** Jour du mois, 1-31. */
  day: number;
  /** Mois, 1-12. */
  month: number;
  journal: string;
  compte: string;
  libelle: string;
  piece: string;
  /** Montant en euros, toujours positif. */
  amount: number;
  side: "debit" | "credit";
};

const JOURNALS = ["AC", "AC", "BQ", "OD"];
const COMPTES = ["401EDF", "401ORA", "401SCI", "401AVO", "606000", "401OVH", "627000", "606100", "421000", "URSSAF", "615000", "616000"];
const LIBELLES = [
  "EDF facture", "edf FACTURE", "Orange SA", "ORANGE sa abonnement",
  "Loyer bureaux", "Honoraires avocat", "Achat fournitures", "OVH hébergement",
  "Frais bancaires", "Carburant", "Note de frais", "URSSAF",
  "Maintenance copieur", "Assurance MMA", "Abonnement logiciel", "Restaurant client",
];

/** Premier montant et pas de la progression, relevés sur la capture. */
const FIRST_AMOUNT = 1280;
const AMOUNT_STEP = 360.07;

/**
 * Les dates avancent par blocs de six dans le mois, les mois tournent sur le
 * premier trimestre, et chaque tour complet démarre trois jours plus tôt. C'est
 * ce qui produit la séquence désordonnée en apparence du fichier d'origine
 * (janvier, février, mars, puis de nouveau janvier).
 */
function dateFor(i: number): { day: number; month: number } {
  const cycle = Math.floor(i / 18);
  const withinCycle = i % 18;
  const month = 1 + Math.floor(withinCycle / 6);
  const position = withinCycle % 6;
  const day = 7 - (month - 1) - cycle * 3 + position * 4;
  return { day, month };
}

/** Le grand livre propre : ce que produit « Nettoyer le fichier ». */
export function cleanLedger(count = 44): Entry[] {
  return Array.from({ length: count }, (_, i) => {
    const { day, month } = dateFor(i);
    return {
      day,
      month,
      journal: JOURNALS[i % JOURNALS.length],
      compte: COMPTES[i % COMPTES.length],
      libelle: LIBELLES[i % LIBELLES.length],
      piece: `FAC-${1000 + i}`,
      amount: Math.round((FIRST_AMOUNT + i * AMOUNT_STEP) * 100) / 100,
      // Une écriture au crédit toutes les trois, comme dans le fichier source.
      side: i % 3 === 0 ? "credit" : "debit",
    };
  });
}

/** Une cellule du fichier SALE, telle qu'Excel l'afficherait. */
export type MessyCell = {
  text: string;
  /** Nombre stocké en texte : Excel colle un triangle vert dans le coin. */
  asText?: boolean;
};

export type MessyRow = {
  /** Ligne entièrement vide, laissée telle quelle dans l'export d'origine. */
  blank?: boolean;
  /** Réplique exacte d'une écriture déjà présente plus haut. */
  duplicate?: boolean;
  cells: MessyCell[];
};

const FR_MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const FR_MONTHS_SHORT = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

const pad = (n: number) => String(n).padStart(2, "0");

/** Les six écritures de date qui cohabitent dans le fichier d'origine. */
function messyDate(e: Entry, variant: number): MessyCell {
  const d = pad(e.day), m = pad(e.month);
  switch (variant) {
    case 0: return { text: `${d}/${m}/2024` };
    case 1: return { text: `2024-${m}-${d}`, asText: true };
    case 2: return { text: `${e.day} ${FR_MONTHS_SHORT[e.month - 1]} 2024`, asText: true };
    case 3: return { text: `${d}/${m}/24`, asText: true };
    case 4: return { text: `${e.day} ${FR_MONTHS[e.month - 1]} 2024`, asText: true };
    default: return { text: `${d}.${m}.2024`, asText: true };
  }
}

/** Les quatre écritures de montant qui cohabitent. */
function messyAmount(amount: number, variant: number): MessyCell {
  const fixed = amount.toFixed(2).replace(".", ",");
  const [whole, cents] = fixed.split(",");
  const spaced = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const dotted = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  switch (variant) {
    case 0: return { text: `${spaced},${cents} €`, asText: true };
    case 1: return { text: fixed };
    case 2: return { text: `${spaced},${cents}` };
    default: return { text: `${dotted},${cents}`, asText: true };
  }
}

/**
 * Le grand livre SALE. Six défauts cumulés, ceux de la capture :
 * dates dans six formats, montants dans quatre, nombres et comptes stockés en
 * texte, lignes vides, un doublon parfait, et des libellés à la casse et aux
 * espaces incohérents.
 */
export function messyLedger(entries: Entry[]): MessyRow[] {
  const rows: MessyRow[] = [];
  entries.forEach((e, i) => {
    // Deux respirations vides, aux mêmes endroits que dans le fichier source.
    if (i === 10 || i === 24) rows.push({ blank: true, cells: [] });

    const libelle = i % 4 === 1 ? ` ${e.libelle}` : e.libelle;
    const amountCell = messyAmount(e.amount, i % 4);
    rows.push({
      cells: [
        messyDate(e, i % 6),
        { text: e.journal },
        // Les comptes tout en chiffres ont été importés en texte.
        { text: e.compte, asText: /^\d+$/.test(e.compte) },
        { text: libelle },
        { text: e.piece },
        e.side === "debit" ? amountCell : { text: "" },
        e.side === "credit" ? amountCell : { text: "" },
        { text: "" },
      ],
    });

    // Le doublon : l'écriture 7 est recopiée à l'identique un peu plus bas.
    if (i === 16) {
      const dup = entries[7];
      const dupAmount = messyAmount(dup.amount, 1);
      rows.push({
        duplicate: true,
        cells: [
          messyDate(dup, 1),
          { text: dup.journal },
          { text: dup.compte, asText: /^\d+$/.test(dup.compte) },
          { text: dup.libelle },
          { text: dup.piece },
          dup.side === "debit" ? dupAmount : { text: "" },
          dup.side === "credit" ? dupAmount : { text: "" },
          { text: "" },
        ],
      });
    }
  });
  return rows;
}

/** Rendu d'une écriture propre, colonne par colonne. */
export function cleanCells(e: Entry): string[] {
  const fixed = e.amount.toFixed(2).replace(".", ",");
  const [whole, cents] = fixed.split(",");
  const amount = `${whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ")},${cents}`;
  return [
    `${pad(e.day)}/${pad(e.month)}/2024`,
    e.journal,
    e.compte,
    e.libelle,
    e.piece,
    e.side === "debit" ? amount : "",
    e.side === "credit" ? amount : "",
  ];
}

export const MESSY_COLUMNS = ["Date", "JOURNAL", "Compte", "Libellé", "Pièce", "Débit", "Crédit", "Analytique"];
/** La colonne « Analytique », vide de bout en bout, disparaît au nettoyage. */
export const CLEAN_COLUMNS = ["Date", "Journal", "Compte", "Libellé", "Pièce", "Débit", "Crédit"];

export const MESSY_FILENAME = "01_grand_livre_client_a_nettoyer";
export const CLEAN_FILENAME = "01_grand_livre_client_a_nettoyer_nettoye";
