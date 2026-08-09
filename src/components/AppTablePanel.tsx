import { FileSpreadsheet, FileText, Play, Plus, Presentation, RotateCw } from "lucide-react";
import { useEnterOnScroll } from "@/lib/useEnterOnScroll";

/**
 * AppTablePanel — un module d'Ora réduit à UN SEUL PANNEAU-TABLEAU, dans la
 * grammaire de la carte « Plan de projet » de monday.com fournie par le client
 * le 2026-08-08.
 *
 * ── D'OÙ VIENT CE COMPOSANT ────────────────────────────────────────────────
 * Il s'appelait BilanDossierMockup et ne servait qu'à la carte « Des chiffres
 * exacts ». Sa première version répliquait la capture de l'app EN ENTIER :
 * chrome de fenêtre macOS, sidebar, barre du haut, colonne de contenu et rail du
 * coach avec ses quatre suggestions. Verdict du client : « il y a trop
 * d'informations, ça fait pas beau », avec la consigne appuyée sur la carte
 * monday : « ils ont repris des ÉLÉMENTS de leur logiciel, sans faire une page
 * de réplication de logiciel ».
 *
 * LA LEÇON, et elle vaut pour toute maquette d'app du site : une capture
 * recopiée à l'identique se lit comme une capture d'écran, pas comme un visuel.
 * Elle porte une dizaine de zones dont AUCUNE n'est le sujet, et le regard n'a
 * rien à regarder. monday ne montre jamais son application ; il montre UN
 * tableau, détouré, posé sur du vide, et laisse la couleur des cellules faire le
 * travail.
 *
 * ── POURQUOI IL EST PARAMÉTRÉ ──────────────────────────────────────────────
 * Le client a validé le résultat puis demandé « la même chose pour la carte
 * d'après, mais en noir, pour voir ce que ça donne ». Les deux panneaux ne
 * diffèrent que par leur CONTENU et leur PALETTE : le balisage est le même au
 * pixel près. Le dupliquer aurait créé deux vérités à maintenir pour un seul
 * dessin — c'est exactement l'erreur que ce dépôt s'interdit ailleurs. D'où une
 * seule structure, deux jeux de données, deux jeux de jetons de couleur.
 *
 * ── LA GRAMMAIRE monday, POINT PAR POINT ───────────────────────────────────
 *   · un panneau unique, coins doux, grande ombre portée, sur du vide ;
 *   · un titre, puis une rangée d'onglets dont un seul est actif ;
 *   · des lignes GROUPÉES sous une étiquette de couleur, avec un filet vertical
 *     de la même couleur en tête de ligne ;
 *   · les cellules de STATUT en aplat plein et texte blanc — la signature du
 *     look, et la seule source de couleur franche ;
 *   · un second groupe VOLONTAIREMENT FANTÔME (libellés pâles, cellules vides),
 *     qui donne la profondeur sans rien ajouter à lire ;
 *   · deux objets POSÉS PAR-DESSUS, débordant des bords : la pilule d'activité
 *     et le curseur noir.
 *
 * ── AUCUN CHIFFRE, AUCUN LIBELLÉ INVENTÉ ───────────────────────────────────
 * Variante `bilan` : les quatre montants viennent de la capture de l'app au
 * centime près, les trois sources (FEC 2025, balance, grand livre) sont celles
 * que la carte énonce dans sa propre démo, les postes fantômes sont ceux de
 * « Bilan développé » dans la grille bento.
 * Variante `surmesure` : titre, étapes, déclencheurs et « 3 relancés » sont
 * repris de SurMesureMockup, qu'elle remplace ; les automatisations fantômes
 * sont celles du tiroir d'OraAppScene.
 */

type Row = {
  /** Première colonne, celle qui porte le filet de couleur. */
  label: string;
  /** Deuxième colonne, en encre atténuée. Masquée sous md. */
  detail: string;
  /** Troisième colonne : l'aplat plein. */
  statut: string;
  /** Teinte de l'aplat. Assez soutenue pour porter du blanc dans les deux tons. */
  statutCls: string;
  /** Quatrième colonne, optionnelle : un chiffre, aligné à droite. */
  value?: string;
};

type Content = {
  title: string;
  tabs: string[];
  action: { label: string; icon: typeof RotateCw };
  /** Les trois pastilles de pièces, réservées à la variante `bilan`. */
  pieces: boolean;
  /** Badge à la place des pièces, quand il n'y en a pas. */
  badge?: string;
  groupLabel: string;
  headers: string[];
  rows: Row[];
  ghostLabel: string;
  ghostRows: string[];
  pill: string;
};

const CONTENUS: Record<"bilan" | "surmesure", Content> = {
  bilan: {
    title: "Bilan développé et SIG",
    tabs: ["Synthèse", "Bilan", "SIG"],
    action: { label: "Recalculer", icon: RotateCw },
    pieces: true,
    groupLabel: "Bilan 2026",
    headers: ["Poste", "Source", "Contrôle", "Montant"],
    // Trois « Conforme » et une ligne « À relire » : tout vert ne prouverait
    // rien, du rouge laisserait croire que l'outil se trompe. Une seule ligne
    // signalée montre au contraire que le contrôle tourne, ce qui est la
    // promesse même de la carte qui porte ce panneau.
    rows: [
      { label: "Total du bilan", detail: "Balance", statut: "Conforme", statutCls: "bg-emerald-500", value: "662 250,20 €" },
      { label: "Fonds de roulement", detail: "Balance", statut: "Conforme", statutCls: "bg-emerald-500", value: "+253 040 €" },
      { label: "Besoin en fonds de roulement", detail: "Grand livre", statut: "À relire", statutCls: "bg-amber-500", value: "+134 470 €" },
      { label: "Trésorerie nette", detail: "FEC 2025", statut: "Conforme", statutCls: "bg-emerald-500", value: "+118 570 €" },
    ],
    ghostLabel: "Soldes intermédiaires",
    ghostRows: ["Valeur ajoutée", "Excédent brut d'exploitation", "Capacité d'autofinancement"],
    pill: "Recalcul du bilan développé",
  },
  surmesure: {
    title: "Rapprochement bancaire",
    tabs: ["Étapes", "Journal", "Paramètres"],
    action: { label: "Lancer", icon: Play },
    pieces: false,
    badge: "Sur mesure",
    groupLabel: "Construit depuis votre brief",
    // Trois colonnes seulement : une étape n'a pas de montant. La quatrième est
    // omise plutôt que remplie d'un tiret, ce qui aurait ajouté une colonne à
    // lire pour ne rien dire.
    headers: ["Étape", "Déclencheur", "Statut"],
    rows: [
      { label: "Export bancaire", detail: "Lundis 9h00", statut: "Configuré", statutCls: "bg-emerald-500" },
      { label: "Pointage avec le grand livre", detail: "1 200 lignes", statut: "Configuré", statutCls: "bg-emerald-500" },
      { label: "Relance des écarts", detail: "Écart > 50 €", statut: "3 relancés", statutCls: "bg-blue-500" },
    ],
    ghostLabel: "Autres automatisations",
    ghostRows: ["Balance âgée 30/60/90", "Anonymiser des colonnes", "Tests sur le journal"],
    pill: "Rapprochement en cours",
  },
};

/** Jetons de couleur. Le ton `dark` n'est pas le thème sombre du site : c'est un
 *  OBJET noir posé sur une carte grise claire, et il reste noir dans les deux
 *  thèmes — exactement comme le panneau blanc reste blanc. */
const TONS = {
  light: {
    panel: "bg-white ring-black/[0.05] shadow-[0_30px_70px_-28px_rgba(15,23,42,0.45)]",
    title: "text-[#111827]",
    tabOn: "border-[#2563eb] text-[#2563eb]",
    tabOff: "text-gray-400",
    plus: "text-gray-300",
    action: "text-gray-500",
    group: "text-[#2563eb]",
    ghostGroup: "text-violet-500/80",
    head: "text-gray-400",
    frame: "ring-gray-100",
    divide: "border-gray-100",
    edge: "border-[#2563eb]",
    ghostEdge: "border-violet-300",
    label: "text-[#111827]",
    detail: "text-gray-500",
    value: "text-[#111827]",
    ghostLabel: "text-gray-300",
    bone: "bg-gray-100",
    ghostCell: "bg-gray-50/60",
    badge: "bg-blue-50 text-blue-600",
  },
  dark: {
    panel: "bg-[#0f1522] ring-white/10 shadow-[0_34px_80px_-26px_rgba(2,6,23,0.75)]",
    title: "text-white",
    tabOn: "border-blue-400 text-blue-400",
    tabOff: "text-white/40",
    plus: "text-white/25",
    action: "text-white/55",
    group: "text-blue-400",
    ghostGroup: "text-violet-400/70",
    head: "text-white/40",
    frame: "ring-white/10",
    divide: "border-white/10",
    edge: "border-blue-500",
    ghostEdge: "border-violet-500/60",
    label: "text-white/90",
    detail: "text-white/50",
    value: "text-white",
    ghostLabel: "text-white/25",
    bone: "bg-white/10",
    ghostCell: "bg-white/[0.03]",
    badge: "bg-blue-500/15 text-blue-300",
  },
} as const;

/** Les trois pièces du dossier, réduites à leurs pastilles : elles tiennent la
 *  place des logos d'intégration de la carte monday, et disent en trois carrés
 *  ce que trois tuiles disaient en six lignes de texte. */
const PIECES = [
  { icon: FileSpreadsheet, light: "bg-emerald-50 text-emerald-600", dark: "bg-emerald-500/15 text-emerald-400" },
  { icon: FileText, light: "bg-rose-50 text-rose-500", dark: "bg-rose-500/15 text-rose-400" },
  { icon: Presentation, light: "bg-violet-50 text-violet-600", dark: "bg-violet-500/15 text-violet-400" },
];

export default function AppTablePanel({
  variant = "bilan",
  tone = "light",
  still = false,
}: {
  variant?: "bilan" | "surmesure";
  tone?: "light" | "dark";
  /** Rendu directement dans l'état final, sans entrée au scroll : pour les
   *  copies du MUR du hero, qui vivent dans une scène épinglée où ce mécanisme
   *  ne peut pas fonctionner (voir useEnterOnScroll). */
  still?: boolean;
}) {
  const { ref, hidden, armed } = useEnterOnScroll<HTMLDivElement>(still);
  const c = CONTENUS[variant];
  const t = TONS[tone];
  const Action = c.action.icon;

  /* Gabarits de colonnes, en classes LITTÉRALES : la colonne « detail » tombe
     sous md, où quatre colonnes ne tiennent plus.
     ⚠ `minmax(0,1fr)` et non `1fr` : une colonne `1fr` conserve
     `min-width: auto`, donc elle refuse de descendre sous la largeur de son
     texte. « Besoin en fonds de roulement » élargissait ainsi le tableau au-delà
     de la carte, qui débordait à son tour du viewport — sur mobile la colonne
     Montant était coupée et le titre de la carte avec elle. `truncate` ne peut
     rien tant que le parent n'a pas le droit de rétrécir. */
  const cols = c.rows[0].value
    ? "grid-cols-[minmax(0,1fr)_78px_88px] md:grid-cols-[minmax(0,1fr)_92px_98px_104px]"
    : "grid-cols-[minmax(0,1fr)_88px] md:grid-cols-[minmax(0,1fr)_92px_98px]";

  return (
    <div ref={ref} className="relative flex w-full items-center lg:h-full">
      <div
        style={{
          transform: hidden ? "translate3d(0,84px,0) scale(0.985)" : "translate3d(0,0,0) scale(1)",
          opacity: hidden ? 0 : 1,
          transition: armed
            ? "transform 1100ms cubic-bezier(0.22,1,0.36,1) 160ms, opacity 620ms cubic-bezier(0.22,1,0.36,1) 160ms"
            : undefined,
          willChange: armed ? "transform, opacity" : undefined,
        }}
        className={`w-full rounded-[14px] p-4 ring-1 md:p-5 ${t.panel}`}
      >
        <div className={`font-poppins text-[16px] font-semibold tracking-[-0.02em] md:text-[18px] ${t.title}`}>
          {c.title}
        </div>

        {/* ── Onglets, un seul actif, et l'action à droite ── */}
        <div className={`mt-3 flex items-end justify-between gap-4 border-b ${t.divide}`}>
          <div className="flex items-end gap-4">
            {c.tabs.map((o, i) => (
              <span
                key={o}
                className={`pb-2 font-inter text-[11.5px] ${
                  i === 0 ? `border-b-2 font-semibold ${t.tabOn}` : `font-medium ${t.tabOff}`
                }`}
              >
                {o}
              </span>
            ))}
            <Plus className={`mb-2.5 h-3 w-3 ${t.plus}`} />
          </div>
          <div className="hidden items-center gap-2 pb-1.5 sm:flex">
            {c.pieces && (
              <div className="flex items-center gap-1">
                {PIECES.map((p, i) => (
                  <span
                    key={i}
                    className={`flex h-[19px] w-[19px] items-center justify-center rounded-[5px] ${
                      tone === "dark" ? p.dark : p.light
                    }`}
                  >
                    <p.icon className="h-[10px] w-[10px]" />
                  </span>
                ))}
              </div>
            )}
            {c.badge && (
              <span className={`rounded-full px-2 py-0.5 font-inter text-[10px] font-semibold ${t.badge}`}>
                {c.badge}
              </span>
            )}
            <span className={`inline-flex items-center gap-1.5 font-inter text-[11px] font-medium ${t.action}`}>
              <Action className="h-3 w-3" />
              {c.action.label}
            </span>
          </div>
        </div>

        {/* ── Le groupe visible ── */}
        <div className="mt-3.5">
          <div className={`font-inter text-[12.5px] font-semibold ${t.group}`}>{c.groupLabel}</div>

          <div className={`mt-1.5 grid ${cols} items-center gap-px pl-2.5 font-inter text-[10px] font-medium ${t.head}`}>
            <span>{c.headers[0]}</span>
            <span className="hidden md:block">{c.headers[1]}</span>
            <span className="text-center">{c.headers[2]}</span>
            {c.headers[3] && <span className="text-right">{c.headers[3]}</span>}
          </div>

          <div className={`mt-1 overflow-hidden rounded-[7px] ring-1 ${t.frame}`}>
            {c.rows.map((r) => (
              <div key={r.label} className={`grid ${cols} items-stretch border-b last:border-b-0 ${t.divide}`}>
                {/* Filet vertical en tête de ligne, comme chez monday. */}
                <div className={`flex min-w-0 items-center border-l-[3px] py-[9px] pl-2 pr-2 ${t.edge}`}>
                  <span className={`truncate font-inter text-[11.5px] font-medium ${t.label}`}>{r.label}</span>
                </div>
                <div className={`hidden min-w-0 items-center border-l px-2 md:flex ${t.divide}`}>
                  <span className={`truncate font-inter text-[10.5px] ${t.detail}`}>{r.detail}</span>
                </div>
                {/* La cellule de statut : aplat PLEIN et bord à bord, texte
                    blanc centré. C'est elle qui colore le panneau. */}
                <div className={`flex items-center justify-center ${r.statutCls}`}>
                  <span className="font-inter text-[10.5px] font-semibold text-white">{r.statut}</span>
                </div>
                {r.value && (
                  <div className={`flex items-center justify-end border-l px-2.5 ${t.divide}`}>
                    <span className={`font-inter text-[11.5px] font-medium tabular-nums ${t.value}`}>{r.value}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Le groupe fantôme ── */}
        <div className="mt-3.5">
          <div className={`font-inter text-[12.5px] font-semibold ${t.ghostGroup}`}>{c.ghostLabel}</div>
          <div className={`mt-1.5 overflow-hidden rounded-[7px] ring-1 ${t.frame}`}>
            {c.ghostRows.map((label) => (
              <div key={label} className={`grid ${cols} items-stretch border-b last:border-b-0 ${t.divide}`}>
                <div className={`flex min-w-0 items-center border-l-[3px] py-[9px] pl-2 pr-2 ${t.ghostEdge}`}>
                  <span className={`truncate font-inter text-[11.5px] font-medium ${t.ghostLabel}`}>{label}</span>
                </div>
                <div className={`hidden items-center border-l px-2 md:flex ${t.divide}`}>
                  <span className={`h-[6px] w-12 rounded-full ${t.bone}`} />
                </div>
                <div className={`flex items-center justify-center border-l ${t.divide} ${t.ghostCell}`}>
                  <span className={`h-[6px] w-10 rounded-full ${t.bone}`} />
                </div>
                {c.rows[0].value && (
                  <div className={`flex items-center justify-end border-l px-2.5 ${t.divide}`}>
                    <span className={`h-[6px] w-12 rounded-full ${t.bone}`} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Les deux objets posés PAR-DESSUS, débordant du panneau ──
          Même patron que la pilule d'OraHomeMockup, et même rôle que la pilule
          orange de la carte monday : dire qu'il se passe quelque chose. Elle
          arrive après le panneau, jamais avec lui. Elle reste BLANCHE sur le
          panneau noir : c'est un objet posé dessus, pas une partie de lui. */}
      <div
        aria-hidden
        style={{
          transform: hidden ? "translate3d(0,26px,0) scale(0.94)" : "translate3d(0,0,0) scale(1)",
          opacity: hidden ? 0 : 1,
          transition: armed
            ? "transform 900ms cubic-bezier(0.22,1,0.36,1) 520ms, opacity 600ms cubic-bezier(0.22,1,0.36,1) 520ms"
            : undefined,
          willChange: armed ? "transform, opacity" : undefined,
        }}
        className="pointer-events-none absolute -left-3 bottom-6 z-10 flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-4 ring-1 ring-black/[0.04] shadow-[0_18px_44px_-12px_rgba(15,23,42,0.35)] md:-left-8 md:bottom-8"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-black/[0.05]">
          <img src="/logos/icon-color.png" alt="" className="h-4 w-auto" />
        </span>
        <span className="whitespace-nowrap font-inter text-[11.5px] font-medium text-[#111827]">{c.pill}</span>
      </div>
      <svg
        aria-hidden
        viewBox="0 0 32 32"
        style={{
          opacity: hidden ? 0 : 1,
          transform: hidden ? "translate3d(0,18px,0)" : "translate3d(0,0,0)",
          transition: armed
            ? "transform 900ms cubic-bezier(0.22,1,0.36,1) 620ms, opacity 500ms cubic-bezier(0.22,1,0.36,1) 620ms"
            : undefined,
        }}
        // AU-DESSUS de la pilule et non dessous, comme sur la carte monday : la
        // pointe mord le bord haut de la pilule et désigne le tableau. Calée sur
        // le COIN de la pastille et non sur le texte — la pointe du tracé est à
        // 9/32 de la largeur du svg, d'où l'ancrage. Trop à droite, le curseur se
        // posait sur la première lettre du libellé.
        className="pointer-events-none absolute bottom-[46px] left-4 z-20 h-7 w-7 drop-shadow-[0_6px_14px_rgba(0,0,0,0.35)] md:bottom-[52px] md:-left-1 md:h-8 md:w-8"
      >
        <path
          d="M9 4 L9 27 L14.6 21.6 L18 29.4 L22.4 27.4 L19 19.8 L26.6 19.8 Z"
          fill="#0b0b0f"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
