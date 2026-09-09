import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeftRight,
  ArrowRight,
  ArrowUp,
  Check,
  FileSpreadsheet,
  FileText,
  Gauge,
  Landmark,
  Paperclip,
  PieChart,
  Plus,
  Presentation,
  Scale,
  Send,
  Settings2,
  Sparkles,
  Store,
} from "lucide-react";

/* Visuels de la page produit, composés le 2026-09-09 d'après les écrans RÉELS
   du logiciel (bancs de prévisualisation d'Ora_V2 : `?preview-accueil`,
   `?preview-depot`, `?preview-analyse`, `?preview-dossier`), à la manière des
   médias de legora.com/product/editor : l'application posée sur un fond
   teinté, cadrée dans une fenêtre macOS. Remplacent les vidéos (client
   2026-09-09 : « crée des design style legora du software pour remplacer les
   videos »). Tous les libellés et chiffres viennent des écrans du banc, rien
   n'est inventé : un seul dossier fictif (Atelier Mécanique, FEC 2025,
   444 écritures, résultat 84 540 €) porte toutes les scènes. */

/* ── Mise à l'échelle ────────────────────────────────────────────────────
   Chaque maquette est dessinée à largeur fixe puis réduite au conteneur par
   transform, comme les mockups Atlas (ScaleToFit) : le texte reste net et la
   composition ne se réagence jamais. */
function useScale(designW: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const compute = () => setScale(el.clientWidth / designW);
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [designW]);
  return { ref, scale };
}

/* La fenêtre macOS commune : pastilles, titre « Ora », corps blanc. */
function AppWindow({ width, children }: { width: number; children: ReactNode }) {
  return (
    <div
      className="overflow-hidden rounded-[14px] bg-white font-inter shadow-[0_24px_70px_-24px_rgba(15,23,42,0.35),0_2px_8px_rgba(15,23,42,0.08)] ring-1 ring-black/[0.07]"
      style={{ width }}
    >
      <div className="relative flex h-9 items-center justify-center border-b border-[#eef1f5] bg-white">
        <div className="absolute left-4 flex items-center gap-2">
          <span className="h-[11px] w-[11px] rounded-full bg-[#ff5f57]" />
          <span className="h-[11px] w-[11px] rounded-full bg-[#febc2e]" />
          <span className="h-[11px] w-[11px] rounded-full bg-[#28c840]" />
        </div>
        <span className="text-[12px] font-medium text-[#64748b]">Ora</span>
      </div>
      {children}
    </div>
  );
}

function AFaireBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f5f9] px-2.5 py-1 text-[11px] font-medium text-[#64748b]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#94a3b8]" />
      À faire
    </span>
  );
}

/* ── 1. Héro : l'écran d'accueil ─────────────────────────────────────────
   `?preview-accueil` sans sa grille de modules, qui vit plus bas dans la
   page : accueil du jour, les deux gestes, la barre de l'assistant, la
   reprise des travaux en cours. */
export function MockHeroAccueil() {
  const W = 1120;
  const { ref, scale } = useScale(1240);
  const files = [
    { icon: FileText, tint: "#64748b", bg: "#f1f5f9", name: "FEC-2026-atelier-mecanique", kind: "TXT" },
    { icon: FileSpreadsheet, tint: "#16a34a", bg: "#f0fdf4", name: "Bilan développé, Atelier Mécanique", kind: "XLSX" },
    { icon: FileText, tint: "#dc2626", bg: "#fef2f2", name: "Dossier de rendez-vous", kind: "PDF" },
  ];
  return (
    <div
      ref={ref}
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #e8f0fb 0%, #f4f7fc 45%, #fdfcf9 100%)" }}
    >
      <div style={{ transform: `scale(${scale})` }}>
        <AppWindow width={W}>
          <div className="px-12 pb-12 pt-9">
            <p className="text-[13px] font-semibold text-[#0f172a]">Accueil</p>
            <h3 className="mt-4 text-[34px] font-semibold tracking-[-0.02em] text-[#0f172a]">
              Ravi de vous accueillir
            </h3>
            <p className="mt-1 text-[14px] text-[#64748b]">Mercredi 9 septembre</p>

            <div className="mt-6 flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#3b82f6] px-5 py-2.5 text-[14px] font-semibold text-white">
                <FileText className="h-4 w-4" />
                Ouvrir un fichier avec Ora
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-[#0f172a] ring-1 ring-[#e2e8f0]">
                <Plus className="h-4 w-4" />
                Nouveau projet
              </span>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-full bg-white py-3 pl-5 pr-3 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.18)] ring-1 ring-[#eef1f5]">
              <Plus className="h-4 w-4 text-[#64748b]" />
              <Sparkles className="h-4 w-4 text-[#3b82f6]" />
              <span className="flex-1 text-[14px] text-[#94a3b8]">
                Demandez : « analyse cette plaquette »
              </span>
              <Paperclip className="h-4 w-4 text-[#94a3b8]" />
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#bfd7fb]">
                <ArrowUp className="h-4 w-4 text-white" />
              </span>
            </div>

            <p className="mt-9 text-[15px] font-semibold text-[#0f172a]">Vos modules</p>
            <div className="mt-3 grid grid-cols-3 gap-3.5">
              {APP_MODULES.slice(0, 3).map((m) => (
                <div key={m.title} className="flex items-center gap-3 rounded-2xl p-4 ring-1 ring-[#eef1f5]">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: m.bg }}
                  >
                    <m.icon className="h-4 w-4" style={{ color: m.tint }} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-[#0f172a]">{m.title}</p>
                    <p className="truncate text-[11.5px] text-[#94a3b8]">{m.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-8 text-[15px] font-semibold text-[#0f172a]">Reprendre</p>
            <div className="mt-3 divide-y divide-[#f1f5f9] rounded-2xl ring-1 ring-[#eef1f5]">
              {files.map((f) => (
                <div key={f.name} className="flex items-center gap-3.5 px-5 py-3.5">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ background: f.bg }}
                  >
                    <f.icon style={{ color: f.tint, width: 18, height: 18 }} />
                  </span>
                  <div className="flex-1">
                    <p className="text-[13.5px] font-semibold text-[#0f172a]">{f.name}</p>
                    <p className="text-[12px] text-[#94a3b8]">{f.kind}</p>
                  </div>
                  <AFaireBadge />
                </div>
              ))}
            </div>
          </div>
        </AppWindow>
      </div>
    </div>
  );
}

/* ── 2. Le dépôt du FEC, lu et vérifié (`?preview-depot`) ────────────────── */
export function MockDepot() {
  const W = 780;
  const { ref, scale } = useScale(1060);
  const chips: { label: string; bg: string; border: string; color: string }[] = [
    { label: "444 écritures", bg: "#f8fafc", border: "#e2e8f0", color: "#334155" },
    { label: "Exercice 2025 complet", bg: "#eff6ff", border: "#bfdbfe", color: "#1d4ed8" },
    { label: "Partie double équilibrée au centime", bg: "#ecfdf5", border: "#a7f3d0", color: "#047857" },
    { label: "Reprise des à-nouveaux présente", bg: "#ecfdf5", border: "#a7f3d0", color: "#047857" },
    { label: "Saisie régulière sur 12 mois", bg: "#eef2ff", border: "#c7d2fe", color: "#4338ca" },
    { label: "SIREN 812 456 903", bg: "#f5f3ff", border: "#ddd6fe", color: "#6d28d9" },
  ];
  return (
    <div
      ref={ref}
      className="relative aspect-[16/10] w-full overflow-hidden"
      style={{ background: "linear-gradient(150deg, #e9f1fb 0%, #f3f8fd 60%, #fbfdff 100%)" }}
    >
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ transform: `scale(${scale})` }}
      >
        <AppWindow width={W}>
          <div className="px-12 pb-11 pt-9 text-center">
            <h3 className="text-[22px] font-semibold tracking-[-0.01em] text-[#0f172a]">
              Déposez le FEC de l'exercice
            </h3>
            <p className="mt-1.5 text-[13.5px] text-[#94a3b8]">
              À-nouveaux compris ; les réglages viennent après.
            </p>
            <div className="mx-auto mt-8 flex h-[86px] w-[86px] items-center justify-center rounded-full bg-[#10b981]">
              <Check className="h-10 w-10 text-white" strokeWidth={3} />
            </div>
            <p className="mt-5 text-[16px] font-semibold text-[#0f172a]">FEC lu et vérifié</p>
            <div className="mx-auto mt-6 flex max-w-[640px] flex-wrap justify-center gap-2.5">
              {chips.map((c) => (
                <span
                  key={c.label}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium"
                  style={{ background: c.bg, borderColor: c.border, color: c.color }}
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  {c.label}
                </span>
              ))}
            </div>
          </div>
        </AppWindow>
      </div>
    </div>
  );
}

/* ── 3. Le dossier prêt à générer (`?preview-dossier`) ───────────────────── */
export function MockDossier() {
  const W = 700;
  const { ref, scale } = useScale(1000);
  const outputs = [
    { icon: FileSpreadsheet, label: "Classeur", kind: "XLSX", tint: "#16a34a", bg: "#f0fdf4" },
    { icon: FileText, label: "Dossier", kind: "PDF", tint: "#dc2626", bg: "#fef2f2" },
    { icon: Presentation, label: "Présentation", kind: "PPTX", tint: "#d97706", bg: "#fffbeb" },
  ];
  return (
    <div
      ref={ref}
      className="relative aspect-[16/10] w-full overflow-hidden"
      style={{ background: "linear-gradient(150deg, #f6f4ee 0%, #f6f7fb 55%, #eef1f8 100%)" }}
    >
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ transform: `scale(${scale})` }}
      >
        <AppWindow width={W}>
          <div className="px-12 pb-10 pt-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eff6ff]">
              <FileText className="h-6 w-6 text-[#3b82f6]" />
            </div>
            <h3 className="mt-5 text-[22px] font-semibold tracking-[-0.01em] text-[#0f172a]">
              Tout est prêt
            </h3>
            <p className="mx-auto mt-2.5 max-w-[440px] text-[13.5px] leading-[1.65] text-[#64748b]">
              Classeur, dossier PDF et présentation, en une génération, à la charte du
              cabinet. Le design et les slides s'ajustent ensuite, devant les pièces
              produites.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-xl bg-[#3b82f6] px-6 py-3 text-[14px] font-semibold text-white">
                <FileText className="h-4 w-4" />
                Générer le dossier
              </span>
            </div>
            <div className="mt-3 flex items-center justify-center">
              <span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-[13px] font-medium text-[#334155] ring-1 ring-[#e2e8f0]">
                <Settings2 className="h-4 w-4" />
                Réglages du dossier
              </span>
            </div>
            <div className="mt-7 flex items-center justify-center gap-2.5 border-t border-[#f1f5f9] pt-6">
              {outputs.map((o) => (
                <span
                  key={o.label}
                  className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-medium text-[#334155] ring-1 ring-[#e8edf3]"
                  style={{ background: o.bg }}
                >
                  <o.icon className="h-3.5 w-3.5" style={{ color: o.tint }} />
                  {o.label}
                  <span className="text-[#94a3b8]">{o.kind}</span>
                </span>
              ))}
            </div>
          </div>
        </AppWindow>
      </div>
    </div>
  );
}

/* ── 4. L'analyse du dossier : la pièce à gauche, les chiffres à droite
   (`?preview-analyse`). Les montants sont ceux du banc. ⚠ L'app est
   explicite là-dessus, et le visuel doit l'être aussi : l'analyse est
   RECALCULÉE DEPUIS LE FEC, pas lue dans le PDF affiché. La page de gauche
   ne porte donc pas de tableau qui laisserait croire à une lecture. ─────── */
const DEPENSES = [
  { label: "Coût d'achat des marchandises vendues", value: "371 000 €", pct: 40 },
  { label: "Charges de personnel", value: "247 200 €", pct: 27 },
  { label: "Consommations en provenance de tiers", value: "149 260 €", pct: 16 },
  { label: "Dotations aux amortissements et provisions", value: "52 000 €", pct: 6 },
];

export function MockAnalyse() {
  const W = 1010;
  const { ref, scale } = useScale(1180);
  return (
    <div
      ref={ref}
      className="relative aspect-[16/10] w-full overflow-hidden"
      style={{ background: "linear-gradient(150deg, #ebedf9 0%, #f2f3fb 55%, #fafbff 100%)" }}
    >
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ transform: `scale(${scale})` }}
      >
        <AppWindow width={W}>
          <div className="flex">
            {/* Le lecteur PDF */}
            <div className="flex flex-1 items-center justify-center bg-[#585f6b] px-9 py-8">
              <div className="w-[380px] rounded-[3px] bg-white px-8 py-7 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                <p className="text-[11px] font-bold text-[#0f172a]">
                  3. Activité et résultats de l'exercice
                </p>
                {[92, 100, 97, 100, 88, 96, 62].map((w, i) => (
                  <div
                    key={i}
                    className="mt-[7px] h-[5px] rounded-sm bg-[#e5e7eb]"
                    style={{ width: `${w}%` }}
                  />
                ))}
                <p className="mt-5 text-[10px] font-bold text-[#0f172a]">
                  3.2 Investissements et structure financière
                </p>
                {[100, 94, 99, 90, 55].map((w, i) => (
                  <div
                    key={i}
                    className="mt-[7px] h-[5px] rounded-sm bg-[#e5e7eb]"
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Les chiffres recalculés */}
            <div className="w-[430px] border-l border-[#eef1f5] px-7 py-7">
              <div className="rounded-2xl bg-gradient-to-br from-[#eff6ff] to-[#ecfeff] px-6 py-5">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#64748b]">
                  Résultat de l'exercice
                </p>
                <p className="mt-1 text-[34px] font-semibold tracking-[-0.02em] text-[#0f172a]">
                  84 540 <span className="text-[20px] text-[#64748b]">€</span>
                </p>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  ["Valeur ajoutée", "405 740 €"],
                  ["Excédent brut", "153 740 €"],
                  ["Trésorerie nette", "83 450 €"],
                ].map(([l, v]) => (
                  <div key={l}>
                    <p className="text-[9.5px] font-semibold uppercase tracking-[0.06em] text-[#94a3b8]">{l}</p>
                    <p className="mt-1 text-[14px] font-semibold text-[#0f172a]">{v}</p>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#94a3b8]">
                Les plus grosses dépenses
              </p>
              <div className="mt-2 overflow-hidden rounded-xl ring-1 ring-[#eef1f5]">
                <div className="flex items-center justify-between bg-[#f8fafc] px-4 py-2.5">
                  <span className="text-[12.5px] font-semibold text-[#0f172a]">Chiffre d'affaires</span>
                  <span className="text-[12.5px] font-semibold text-[#0f172a]">926 000 €</span>
                </div>
                {DEPENSES.map((d) => (
                  <div key={d.label} className="border-t border-[#f1f5f9] px-4 py-2.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-[12px] text-[#334155]">{d.label}</span>
                      <span className="shrink-0 text-[12px] font-medium text-[#0f172a]">
                        {d.value} <span className="text-[#94a3b8]">{d.pct} % du CA</span>
                      </span>
                    </div>
                    <div className="mt-1.5 h-[3px] w-full rounded bg-[#f1f5f9]">
                      <div
                        className="h-full rounded bg-[#ef4444]"
                        style={{ width: `${d.pct * 2}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AppWindow>
      </div>
    </div>
  );
}

/* ── 5. L'assistant, sur la bande sombre : la conversation ancrée aux
   montants affichés, avec la phrase d'honnêteté de l'app reprise telle
   quelle. ────────────────────────────────────────────────────────────────── */
export function MockAssistant() {
  const W = 820;
  const { ref, scale } = useScale(1040);
  return (
    <div ref={ref} className="relative aspect-[16/10] w-full overflow-hidden bg-[#0d1526]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(90% 80% at 50% 0%, rgba(59,130,246,0.16) 0%, transparent 65%)" }}
      />
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ transform: `scale(${scale})` }}
      >
        <AppWindow width={W}>
          <div className="px-9 pb-8 pt-7">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3b82f6]">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </span>
              <p className="text-[14.5px] font-semibold text-[#0f172a]">Interrogez ces chiffres</p>
              <p className="text-[12px] text-[#94a3b8]">· réponses tirées des seuls montants affichés</p>
            </div>

            <div className="mt-5 flex justify-end">
              <p className="rounded-2xl rounded-br-md bg-[#3b82f6] px-4 py-2.5 text-[13px] font-medium text-white">
                Explique la formation du résultat en trois phrases
              </p>
            </div>
            <div className="mt-3 max-w-[560px] rounded-2xl rounded-bl-md bg-[#f8fafc] px-5 py-4 ring-1 ring-[#eef1f5]">
              <p className="text-[13px] leading-[1.7] text-[#334155]">
                Le résultat de l'exercice, 84 540 €, se forme sur 926 000 € de chiffre
                d'affaires. Les achats de marchandises (371 000 €) et les charges de
                personnel (247 200 €) absorbent l'essentiel de la marge. La trésorerie
                nette ressort à 83 450 €.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["FEC 2025 · 444 écritures", "Résultat · 84 540 €", "CA · 926 000 €"].map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-[#64748b] ring-1 ring-[#e2e8f0]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "Quelles questions poser au client sur ces chiffres ?",
                "Qu'est-ce qui mérite d'être surveillé l'an prochain ?",
              ].map((q) => (
                <span
                  key={q}
                  className="rounded-full border border-[#bfdbfe] bg-white px-3.5 py-1.5 text-[12.5px] font-medium text-[#2563eb]"
                >
                  {q}
                </span>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-full py-2.5 pl-5 pr-2.5 ring-1 ring-[#e2e8f0]">
              <span className="flex-1 text-[13px] text-[#94a3b8]">Une question sur ces chiffres...</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3b82f6]">
                <Send className="h-3.5 w-3.5 text-white" />
              </span>
            </div>
            <p className="mt-3 text-[11px] leading-[1.6] text-[#94a3b8]">
              Le modèle ne lit pas le PDF et ne calcule rien : il reformule les chiffres
              ci-dessus, anonymisés avant l'envoi. À relire par le cabinet.
            </p>
          </div>
        </AppWindow>
      </div>
    </div>
  );
}

/* ── 6. Les modules, tels que l'accueil du logiciel les présente ─────────── */
export const APP_MODULES = [
  {
    icon: ArrowLeftRight,
    tint: "#d97706",
    bg: "#fffbeb",
    title: "Changement de structure",
    sub: "Comparatif avant / après",
  },
  {
    icon: PieChart,
    tint: "#7c3aed",
    bg: "#f5f3ff",
    title: "Bilan développé et SIG",
    sub: "Le bilan et la formation du résultat",
  },
  {
    icon: Store,
    tint: "#2563eb",
    bg: "#eff6ff",
    title: "Prévisionnel d'activité",
    sub: "Dix métiers et neuf filières agricoles : le plan banque",
  },
  {
    icon: Landmark,
    tint: "#059669",
    bg: "#ecfdf5",
    title: "Prévisionnel immobilier",
    sub: "Dossier banque en 5 min",
  },
  {
    icon: Scale,
    tint: "#dc2626",
    bg: "#fef2f2",
    title: "Évaluation d'entreprise",
    sub: "Cinq approches combinées",
  },
  {
    icon: Gauge,
    tint: "#0284c7",
    bg: "#f0f9ff",
    title: "Suivi budgétaire",
    sub: "Réalisé contre budget",
  },
];

export function ModuleCard({ module: m }: { module: (typeof APP_MODULES)[number] }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-5 font-inter shadow-[0_1px_2px_rgba(15,23,42,0.05)] ring-1 ring-[#e8edf3]">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: m.bg }}>
        <m.icon className="h-5 w-5" style={{ color: m.tint }} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-[#0f172a]">{m.title}</p>
        <p className="mt-0.5 truncate text-[13px] text-[#64748b]">{m.sub}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-[#94a3b8]" />
    </div>
  );
}
