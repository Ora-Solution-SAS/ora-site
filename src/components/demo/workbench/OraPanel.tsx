/**
 * OraPanel — la fenêtre d'extension Ora, à droite du Workbench.
 *
 * Réplique de la capture client (2026-07-30). Décision assumée : TOUT est
 * répliqué, y compris ce qui suppose une session (Atlas, classeurs ouverts,
 * avatar, Envoyer, Exporter en PDF, compteurs de filtres). Ces éléments sont
 * inertes — c'est leur présence qui donne l'impression d'être dans le vrai
 * logiciel, et c'est précisément l'effet recherché.
 *
 * La liste d'automatisations est celle du VRAI panneau, pas celle du backend de
 * démo. Seules les entrées marquées `runnable` sont jouables ; les autres
 * portent une pastille et ne réagissent pas.
 */

export type PanelAutomation = {
  key: string;
  title: string;
  /** Famille affichée en pastille à droite du titre. */
  family?: "QUALITÉ" | "EXPORT";
  /** Ligne grise sous le titre, à la place de la famille. */
  note?: string;
  desc?: string;
  /** Produit un fichier, avec sa durée estimée. */
  output?: string;
  runnable?: boolean;
  /** Mise en avant, comme « Nettoyer le fichier » dans la capture. */
  featured?: boolean;
};

export const PANEL_AUTOMATIONS: PanelAutomation[] = [
  {
    key: "clean_file",
    title: "Nettoyer le fichier",
    note: "Déjà utilisée sur ce fichier",
    runnable: true,
    featured: true,
  },
  {
    key: "transpose",
    title: "Transposer le tableau",
    family: "QUALITÉ",
    output: "≈ 10 s",
    desc: "Pivote, les lignes deviennent des colonnes.",
  },
  {
    key: "export_csv",
    title: "Exporter en CSV",
    family: "EXPORT",
    output: "≈ 5 s",
    desc: "Sauvegarde l'aperçu actuel au format CSV.",
  },
  {
    key: "aggregate",
    title: "Agréger des fichiers identiques",
    family: "QUALITÉ",
    desc: "Empile des fichiers de même structure en un seul tableau, avec la trace du fichier d'origine.",
  },
  {
    key: "anonymise",
    title: "Anonymiser des colonnes",
    family: "QUALITÉ",
    desc: "Remplace les données nominatives par des pseudonymes stables avant de partager un fichier.",
  },
  {
    key: "compare",
    title: "Comparer deux versions",
    family: "QUALITÉ",
    desc: "Lignes ajoutées, supprimées et cellules modifiées entre le fichier ouvert et une version précédente.",
  },
];

const FILTERS = [
  { label: "☆ Favoris", count: 0 },
  { label: "Qualité", count: 5 },
  { label: "Export", count: 3 },
  { label: "Tout", count: 8, active: true },
];

export default function OraPanel({
  filename,
  onRun,
  busy,
}: {
  filename: string;
  onRun: (key: string) => void;
  busy: boolean;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[12px] bg-white shadow-[0_2px_6px_rgba(15,23,42,.10),0_30px_70px_-28px_rgba(15,23,42,.42),0_0_0_1px_rgba(15,23,42,.06)]">
      {/* ── Barre de titre ── */}
      <div className="relative flex h-[34px] shrink-0 items-center border-b border-[#ececef] bg-[#f7f7f8] px-3">
        <div className="flex items-center gap-[6px]">
          <i className="block h-[10px] w-[10px] rounded-full bg-[#ff5f57]" />
          <i className="block h-[10px] w-[10px] rounded-full bg-[#febc2e]" />
          <i className="block h-[10px] w-[10px] rounded-full bg-[#28c840]" />
        </div>
        <span className="absolute left-1/2 -translate-x-1/2 text-[11.5px] font-semibold text-[#3f4652]">Ora</span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-4 pt-3">
        {/* ── Atlas + avatar ── */}
        <div className="flex items-center justify-between">
          <span className="font-poppins text-[17px] font-semibold tracking-[-0.02em] text-[#111827]">Atlas</span>
          <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#3b82f6] text-[11px] font-semibold text-white">T</span>
        </div>

        {/* ── Classeurs ouverts ── */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[8.5px] font-bold uppercase tracking-[0.09em] text-[#a0a4ad]">Classeurs ouverts</span>
          <span className="flex items-center gap-1 truncate rounded-[6px] bg-[#eaf1ff] px-2 py-[3px] text-[10px] font-medium text-[#1c60e8] ring-1 ring-[#cfe0ff]">
            <IcoDoc /> <span className="max-w-[110px] truncate">{filename}</span>
          </span>
          <span className="max-w-[92px] truncate text-[10px] text-[#a0a4ad]">Ora_Prospects_Cabinets…</span>
        </div>

        {/* ── Fil de retour + actions de vue ── */}
        <div className="mt-3 flex items-center justify-between text-[10.5px] text-[#6b7280]">
          <span>← Demo · Ora v1</span>
          <span className="flex items-center gap-2 text-[#9ca3af]">▤ ⤢</span>
        </div>

        {/* ── Carte du fichier ── */}
        <div className="mt-2.5 flex items-start gap-2.5">
          <span className="mt-[3px] flex h-[26px] w-[26px] items-center justify-center rounded-[7px] bg-[#e9f7ee] text-[#177245]"><IcoDoc /></span>
          <div className="min-w-0 flex-1">
            <div className="truncate font-poppins text-[15px] font-semibold tracking-[-0.02em] text-[#111827]">{filename}</div>
            <div className="mt-1 flex items-center gap-2 text-[9.5px]">
              <span className="font-semibold text-[#8b909b]">XLSX</span>
              <span className="flex items-center gap-1 font-medium text-[#1c60e8]"><i className="block h-[5px] w-[5px] rounded-full bg-[#1c60e8]" />En cours</span>
              <span className="flex items-center gap-1 font-medium text-[#d9534f]">⊘ Modifications demandées</span>
            </div>
          </div>
          <span className="mt-[3px] text-[12px] text-[#9ca3af]">⟲ ↗</span>
        </div>

        {/* ── Ligne d'actions ── */}
        <div className="mt-3 flex items-center gap-2">
          <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-[7px] px-2 py-[6px] text-[10px] text-[#5b616e] ring-1 ring-[#ececef]">
            <IcoDoc /> <span className="truncate">Ce classeur : {filename}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1 rounded-[7px] px-2 py-[6px] text-[10px] text-[#5b616e] ring-1 ring-[#ececef]">Exporter en PDF ⌄</span>
          <span className="flex shrink-0 items-center gap-1 rounded-[7px] bg-[#2f6ff0] px-2.5 py-[6px] text-[10px] font-semibold text-white">✈ Envoyer</span>
        </div>

        {/* ── Filtres ── */}
        <div className="mt-3 flex items-center gap-1.5">
          {FILTERS.map((f) => (
            <span
              key={f.label}
              className={`flex items-center gap-1 rounded-full px-2.5 py-[4px] text-[10px] font-medium ${
                f.active ? "bg-[#111827] text-white" : "text-[#5b616e] ring-1 ring-[#ececef]"
              }`}
            >
              {f.label} <b className={f.active ? "text-white" : "text-[#a0a4ad]"}>{f.count}</b>
            </span>
          ))}
        </div>

        {/* ── Recherche ── */}
        <div className="mt-2.5 flex items-center gap-2 rounded-[9px] px-2.5 py-[8px] text-[11px] text-[#a0a4ad] ring-1 ring-[#ececef]">
          <IcoSearch /> Rechercher une automatisation…
        </div>

        {/* ── Suggestions ── */}
        <div className="mt-3 flex items-center gap-1.5 text-[8.5px] font-bold uppercase tracking-[0.09em] text-[#5b616e]">
          <span className="text-[#2f6ff0]">✦</span> Suggestions pour ce fichier
        </div>

        <div className="mt-2 space-y-2 overflow-hidden">
          {PANEL_AUTOMATIONS.map((a) => (
            <AutomationRow key={a.key} a={a} busy={busy} onRun={onRun} />
          ))}
        </div>
      </div>

      {/* ── Journal ── */}
      <div className="flex h-[28px] shrink-0 items-center gap-2 border-t border-[#ececef] px-4 text-[9.5px] font-bold uppercase tracking-[0.09em] text-[#5b616e]">
        &gt;_ Journal <span className="font-medium normal-case tracking-normal text-[#a0a4ad]">· 0</span>
        <span className="ml-auto text-[#9ca3af]">⌃</span>
      </div>
    </div>
  );
}

function AutomationRow({ a, busy, onRun }: { a: PanelAutomation; busy: boolean; onRun: (key: string) => void }) {
  const live = !!a.runnable && !busy;
  return (
    <div
      className={`flex items-start gap-2.5 rounded-[11px] p-2.5 ${
        a.featured ? "bg-[#f2f7ff] ring-1 ring-[#d8e6ff]" : "ring-1 ring-[#f0f0f2]"
      }`}
    >
      <span className={`mt-[1px] flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-[7px] text-[11px] ${
        a.featured ? "bg-[#dcecff] text-[#1c60e8]" : "bg-[#f4f5f7] text-[#8b909b]"
      }`}>
        {a.featured ? "✦" : "▷"}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate font-inter text-[12px] font-bold text-[#111827]">{a.title}</span>
          {a.family && (
            <span className="shrink-0 rounded-[4px] bg-[#f0f1f4] px-1.5 py-[1px] text-[7.5px] font-bold tracking-[0.06em] text-[#7b8190]">
              {a.family}
            </span>
          )}
        </div>
        {a.note && <div className="mt-[2px] text-[10px] text-[#8b909b]">{a.note}</div>}
        {a.output && (
          <div className="mt-[3px] flex items-center gap-1.5">
            <span className="rounded-[4px] bg-[#eaf1ff] px-1.5 py-[1px] text-[7.5px] font-bold tracking-[0.06em] text-[#2f6ff0]">
              PRODUIT UN FICHIER
            </span>
            <span className="text-[8.5px] text-[#a0a4ad]">{a.output}</span>
          </div>
        )}
        {a.desc && <div className="mt-[3px] text-[10px] leading-[1.35] text-[#8b909b]">{a.desc}</div>}
      </div>

      {!a.featured && <span className="mt-[2px] shrink-0 text-[11px] text-[#c9ccd3]">☆</span>}

      <button
        type="button"
        disabled={!live}
        onClick={() => live && onRun(a.key)}
        className={`mt-[1px] shrink-0 rounded-full px-2.5 py-[5px] text-[10px] font-semibold transition-colors duration-150 ${
          a.featured
            ? "bg-[#2f6ff0] text-white hover:bg-[#245bd0] disabled:opacity-60"
            : "bg-[#eaf1ff] text-[#2f6ff0]"
        } ${live ? "cursor-pointer" : "cursor-default"}`}
      >
        ▷ Lancer
      </button>
    </div>
  );
}

const IcoDoc = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" />
  </svg>
);

const IcoSearch = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
  </svg>
);
