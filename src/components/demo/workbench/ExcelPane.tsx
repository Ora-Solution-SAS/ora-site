/**
 * ExcelPane — la fenêtre Excel de gauche du Workbench.
 *
 * Réplique de la capture client (2026-07-30) : barre de titre macOS, rubans,
 * zone de nom + barre de formule, en-têtes de colonnes, grille, onglets de
 * feuille et barre d'état. Volontairement simplifiée là où le détail n'apporte
 * rien (les groupes du ruban sont évoqués, pas reproduits bouton par bouton),
 * fidèle là où le regard se pose : la GRILLE.
 *
 * Purement présentationnel, et surtout AGNOSTIQUE : il affiche la grille qu'on
 * lui donne, qu'elle vienne du classeur de démonstration ou du fichier déposé
 * par le visiteur. C'est ce qui permet d'afficher le vrai fichier de
 * l'utilisateur sans dupliquer la réplique.
 */

export type GridCell = {
  text: string;
  /** Nombre stocké en texte : Excel colle un triangle vert dans le coin. */
  asText?: boolean;
  /** Aligné à droite, comme un nombre. */
  numeric?: boolean;
};

export type GridSource = {
  filename: string;
  sheetName: string;
  /** Onglets supplémentaires, affichés en gris à côté de l'onglet actif. */
  extraTabs?: string[];
  /** Première ligne comprise : c'est l'en-tête du tableau. */
  rows: GridCell[][];
  /** Largeur de chaque colonne, en px de scène. */
  widths: number[];
  nameBox: string;
  formula: string;
};

const RIBBON_TABS = [
  "Accueil", "Insertion", "Dessin", "Mise en page", "Formules",
  "Données", "Révision", "Affichage", "Automatisation", "Développeur", "Ora",
];

const COL_LETTERS = "ABCDEFGHIJKLMNOP".split("");

/** Largeurs déduites du contenu : Excel ajuste au plus long, dans des bornes. */
export function widthsFor(rows: GridCell[][], min = 56, max = 190): number[] {
  const count = Math.max(...rows.map((r) => r.length), 1);
  return Array.from({ length: count }, (_, c) => {
    const longest = rows.reduce((n, r) => Math.max(n, (r[c]?.text ?? "").length), 0);
    return Math.min(max, Math.max(min, 16 + longest * 6.2));
  });
}

export default function ExcelPane({
  source,
  /** Index de ligne mis en évidence, 0 = ligne d'en-tête. */
  highlightRow,
  /** Voile d'attente, le temps de lire le fichier déposé. */
  loading,
}: {
  source: GridSource;
  highlightRow?: number | null;
  loading?: boolean;
}) {
  const { widths, rows } = source;

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[12px] bg-white shadow-[0_2px_6px_rgba(15,23,42,.10),0_30px_70px_-28px_rgba(15,23,42,.42),0_0_0_1px_rgba(15,23,42,.06)]">
      {/* ── Barre de titre ── */}
      <div className="relative flex h-[38px] shrink-0 items-center border-b border-[#e6e6ea] bg-[#f6f6f7] px-3">
        <div className="flex items-center gap-[6px]">
          <i className="block h-[11px] w-[11px] rounded-full bg-[#ff5f57]" />
          <i className="block h-[11px] w-[11px] rounded-full bg-[#febc2e]" />
          <i className="block h-[11px] w-[11px] rounded-full bg-[#28c840]" />
        </div>
        <div className="ml-4 flex items-center gap-2 text-[10.5px] text-[#6b7280]">
          <span>Enregistrement automatique</span>
          <span className="flex h-[13px] w-[24px] items-center rounded-full bg-[#d5d7db] px-[2px]">
            <i className="block h-[9px] w-[9px] rounded-full bg-white" />
          </span>
        </div>
        <div className="absolute left-1/2 flex max-w-[46%] -translate-x-1/2 items-center gap-1.5 text-[11.5px] font-semibold text-[#3f4652]">
          <span className="flex h-[13px] w-[13px] shrink-0 items-center justify-center rounded-[3px] bg-[#107C41] text-[7px] font-bold text-white">X</span>
          <span className="truncate">{source.filename}</span>
        </div>
      </div>

      {/* ── Onglets du ruban ── */}
      <div className="flex shrink-0 items-end gap-[14px] border-b border-[#e6e6ea] bg-white px-4 pt-1.5">
        {RIBBON_TABS.map((tab) => {
          const active = tab === "Accueil";
          return (
            <span
              key={tab}
              className={`relative pb-1.5 text-[11px] ${
                active ? "font-semibold text-[#111827]" : tab === "Ora" ? "font-semibold text-[#1c60e8]" : "text-[#5b616e]"
              }`}
            >
              {tab}
              {active && <i className="absolute inset-x-0 -bottom-px block h-[2px] rounded-full bg-[#107C41]" />}
            </span>
          );
        })}
      </div>

      {/* ── Ruban, évoqué : les groupes lisibles, pas chaque bouton ── */}
      <div className="flex h-[62px] shrink-0 items-center gap-4 border-b border-[#e6e6ea] bg-[#fbfbfc] px-4">
        <div className="flex flex-col items-center gap-1 text-[9px] text-[#5b616e]">
          <span className="flex h-7 w-7 items-center justify-center rounded-[5px] bg-white text-[11px] ring-1 ring-[#e2e3e7]">⎘</span>
          Coller
        </div>
        <span className="h-9 w-px bg-[#e6e6ea]" />
        <div className="flex items-center gap-1.5">
          <span className="flex h-[22px] w-[104px] items-center rounded-[4px] bg-white px-2 text-[9.5px] text-[#111827] ring-1 ring-[#e2e3e7]">Calibri (Corps)</span>
          <span className="flex h-[22px] w-[40px] items-center rounded-[4px] bg-white px-2 text-[9.5px] text-[#111827] ring-1 ring-[#e2e3e7]">11</span>
          <span className="text-[11px] font-bold text-[#111827]">G</span>
          <span className="text-[11px] italic text-[#111827]">I</span>
          <span className="text-[11px] text-[#111827] underline">S</span>
        </div>
        <span className="h-9 w-px bg-[#e6e6ea]" />
        <span className="flex h-[22px] w-[112px] items-center rounded-[4px] bg-white px-2 text-[9.5px] text-[#111827] ring-1 ring-[#e2e3e7]">Standard</span>
        <span className="h-9 w-px bg-[#e6e6ea]" />
        <div className="flex flex-col gap-[3px] text-[9px] text-[#5b616e]">
          <span>Mise en forme conditionnelle</span>
          <span>Mettre sous forme de tableau</span>
          <span>Styles de cellule</span>
        </div>
      </div>

      {/* ── Zone de nom + barre de formule ── */}
      <div className="flex h-[30px] shrink-0 items-center gap-2 border-b border-[#e6e6ea] bg-white px-3">
        <span className="flex h-[20px] w-[58px] items-center rounded-[4px] px-2 text-[10.5px] text-[#111827] ring-1 ring-[#e2e3e7]">
          {source.nameBox}
        </span>
        <span className="text-[11px] text-[#9ca3af]">✕ ✓</span>
        <span className="text-[11px] italic text-[#6b7280]">fx</span>
        <span className="truncate text-[10.5px] text-[#111827]">{source.formula}</span>
      </div>

      {/* ── Grille ── */}
      <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
        <div className="flex h-[19px] border-b border-[#d8d9dd] bg-[#f6f6f7] text-[9.5px] text-[#5b616e]">
          <span className="w-[26px] shrink-0 border-r border-[#d8d9dd]" />
          {widths.map((w, i) => (
            <span key={i} className="flex shrink-0 items-center justify-center border-r border-[#d8d9dd]" style={{ width: w }}>
              {COL_LETTERS[i]}
            </span>
          ))}
        </div>

        <div className="text-[10.5px] leading-none text-[#111827]">
          {rows.slice(0, 34).map((row, i) => (
            <div
              key={i}
              className="flex h-[19px] border-b border-[#e9eaec] transition-colors duration-300"
              style={highlightRow === i ? { background: "rgba(59,130,246,.14)" } : undefined}
            >
              <span className="flex w-[26px] shrink-0 items-center justify-center border-r border-[#d8d9dd] bg-[#f6f6f7] text-[9px] text-[#5b616e]">
                {i + 1}
              </span>
              {widths.map((w, j) => {
                const cell = row[j];
                return (
                  <span
                    key={j}
                    className={`relative flex shrink-0 items-center overflow-hidden whitespace-nowrap border-r border-[#e9eaec] px-1.5 ${
                      i === 0 ? "font-semibold" : ""
                    } ${cell?.numeric ? "justify-end" : ""}`}
                    style={{ width: w }}
                  >
                    {cell?.asText && (
                      <i
                        aria-hidden
                        className="absolute left-0 top-0 block"
                        style={{ width: 0, height: 0, borderTop: "5px solid #16a34a", borderRight: "5px solid transparent" }}
                      />
                    )}
                    {cell?.text}
                  </span>
                );
              })}
              {/* La grille se poursuit visuellement au-delà des colonnes remplies. */}
              <span className="flex-1" />
            </div>
          ))}
        </div>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <span className="font-inter text-[12px] text-[#6b7280]">Lecture de votre fichier…</span>
          </div>
        )}
      </div>

      {/* ── Onglets de feuille + barre d'état ── */}
      <div className="flex h-[26px] shrink-0 items-center gap-1 border-t border-[#e6e6ea] bg-[#f6f6f7] px-3 text-[10px]">
        <span className="mr-1 text-[#9ca3af]">◀ ▶</span>
        <span className="max-w-[160px] truncate rounded-t-[4px] border-b-[2px] border-[#107C41] bg-white px-2.5 py-[3px] font-semibold text-[#111827]">
          {source.sheetName}
        </span>
        {source.extraTabs?.map((t) => (
          <span key={t} className="max-w-[120px] truncate px-2.5 py-[3px] text-[#5b616e]">{t}</span>
        ))}
        <span className="px-1.5 text-[#6b7280]">+</span>
      </div>
      <div className="flex h-[22px] shrink-0 items-center gap-2 border-t border-[#e6e6ea] bg-[#f6f6f7] px-3 text-[9.5px] text-[#5b616e]">
        Prêt <span className="text-[#9ca3af]">·</span> Accessibilité : vérification terminée
      </div>
    </div>
  );
}
