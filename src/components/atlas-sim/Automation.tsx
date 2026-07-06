/**
 * Atlas simulation — automation workspace (brief §3.6) and the two-step
 * post-automation dialog (brief §3.7, the signature moment).
 *
 * The panel slides in from the right (~500px, "side-by-side with Excel"
 * feel), lists the automation catalog with favorites/suggestions, simulates
 * runs (Préparation → Exécution → Enregistrement, ~2 s) with a live journal,
 * then walks through « Votre fichier est prêt » → « C'est fait ».
 */
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FilePlus2,
  History,
  Mail,
  Maximize2,
  Minimize2,
  RefreshCw,
  Rocket,
  Search,
  Send,
  Sparkles,
  Star,
  TriangleAlert,
  Users,
  X,
  Zap,
} from "lucide-react";
import {
  AUTO_CATEGORIES,
  AUTO_OUTPUT,
  AUTOMATIONS,
  autoCategoryOf,
  FORMAT_LABEL,
  MEMBERS,
  type Automation,
  type AutoCategory,
  type Doc,
} from "./data";
import { useSim } from "./store";
import {
  Avatar,
  BtnPrimary,
  BtnSoft,
  Card,
  EASE,
  Eyebrow,
  Input,
  MenuItem,
  Modal,
  ModalClose,
  OptionCard,
  Spinner,
} from "./ui";
import { FileTile } from "./icons";

type RunPhase = "prep" | "exec" | "save";
const PHASE_LABEL: Record<RunPhase, string> = {
  prep: "Préparation…",
  exec: "Exécution…",
  save: "Enregistrement…",
};

type Tab = "favorites" | AutoCategory | "all";

interface JournalLine {
  time: string;
  glyph: "✓" | "⚠" | "✗" | "▶";
  text: string;
}
const GLYPH_COLOR: Record<JournalLine["glyph"], string> = {
  "✓": "#10b981",
  "⚠": "#d97706",
  "✗": "#ef4444",
  "▶": "#3b82f6",
};

/** Post-automation dialog state machine. */
interface PostAuto {
  auto: Automation;
  step: 1 | 2;
  option: "save" | "replace" | "open";
  name: string;
  targetProjectId: string;
  showProjectPicker: boolean;
  saved: boolean;
  finalName: string;
  membersOpen: boolean;
  memberSend: Record<string, "sending" | "sent">;
  emailDone: boolean;
}

export default function AutomationPanel() {
  const { state } = useSim();
  const doc = state.docs.find((d) => d.id === state.automationDocId);
  if (!doc) return null;
  // Key by doc so all local state resets when opening for another file.
  return <PanelInner key={doc.id} doc={doc} />;
}

function PanelInner({ doc }: { doc: Doc }) {
  const { state, actions } = useSim();
  const [fullscreen, setFullscreen] = useState(false);
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [runningId, setRunningId] = useState<string | null>(null);
  const [phase, setPhase] = useState<RunPhase>("prep");
  const [doneBannerId, setDoneBannerId] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [detailAuto, setDetailAuto] = useState<Automation | null>(null);
  const [journalOpen, setJournalOpen] = useState(false);
  const [journal, setJournal] = useState<JournalLine[]>([
    { time: "09:41:02", glyph: "▶", text: `Session ouverte sur « ${doc.name} »` },
    { time: "09:41:02", glyph: "✓", text: "Fichier synchronisé" },
  ]);
  const [postAuto, setPostAuto] = useState<PostAuto | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clockRef = useRef(3); // fake seconds after 09:41:02

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const log = (glyph: JournalLine["glyph"], text: string) => {
    const s = 2 + (clockRef.current += 2);
    const time = `09:41:${String(s).padStart(2, "0")}`;
    setJournal((j) => [...j, { time, glyph, text }]);
  };

  const project = state.projects.find((p) => p.id === doc.projectId);
  const projectName = project?.name ?? "Audit Alpha 2026";

  /* ------------------------------------------------------------- run flow */

  const startRun = (auto: Automation) => {
    if (runningId) return;
    setDoneBannerId(null);
    setRunningId(auto.id);
    setPhase("prep");
    log("▶", `Lancement « ${auto.title} »`);
    timers.current.push(
      setTimeout(() => {
        setPhase("exec");
        log("✓", "Préparation terminée");
      }, 600),
      setTimeout(() => {
        setPhase("save");
        log("✓", "Exécution terminée");
      }, 1500),
      setTimeout(() => {
        setRunningId(null);
        log("✓", "Fichier enregistré");
        if (auto.output === "analyzes") {
          setDoneBannerId(auto.id);
        } else {
          setPostAuto({
            auto,
            step: 1,
            option: "save",
            name: auto.producesName ?? `${doc.name} (résultat)`,
            targetProjectId: doc.projectId,
            showProjectPicker: false,
            saved: false,
            finalName: "",
            membersOpen: false,
            memberSend: {},
            emailDone: false,
          });
        }
      }, 2000)
    );
  };

  const cancelRun = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setRunningId(null);
    log("⚠", "Exécution annulée");
  };

  /* -------------------------------------------------------------- catalog */

  const q = search.trim().toLowerCase();
  const visible = AUTOMATIONS.filter((a) => {
    if (tab === "favorites" && !state.favoriteAutoIds.includes(a.id)) return false;
    if (tab !== "favorites" && tab !== "all" && a.category !== tab) return false;
    if (q && !`${a.title} ${a.description}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const suggestions: { auto: Automation; reason: string }[] =
    doc.format === "pdf"
      ? [{ auto: AUTOMATIONS.find((a) => a.id === "export-pdf")!, reason: "Déjà utilisée sur ce fichier" }]
      : [
          { auto: AUTOMATIONS.find((a) => a.id === "retraitement-fec")!, reason: "Correspond aux colonnes détectées" },
          { auto: AUTOMATIONS.find((a) => a.id === "detection-doublons")!, reason: "Déjà utilisée sur ce fichier" },
        ];

  const tabDefs: { id: Tab; label: string; count: number; color?: string }[] = [
    { id: "favorites", label: "Favoris", count: state.favoriteAutoIds.length },
    ...AUTO_CATEGORIES.map((c) => ({
      id: c.id as Tab,
      label: c.label,
      count: AUTOMATIONS.filter((a) => a.category === c.id).length,
      color: c.color,
    })),
    { id: "all", label: "Tout", count: AUTOMATIONS.length },
  ];

  /* --------------------------------------------------------------- render */

  return (
    <>
      {/* click-catcher */}
      <div className="absolute inset-0 z-20" onClick={() => actions.closeAutomation()} />
      <div
        data-tour="auto-panel"
        className={`absolute inset-y-0 right-0 z-30 flex flex-col border-l border-[#e5e7eb] bg-[#fcfbf7] shadow-[-24px_0_48px_-24px_rgba(15,23,42,.25)] ${
          fullscreen ? "left-0 w-auto" : "w-[500px]"
        }`}
        style={{ animation: `ora-drawer-in 200ms ${EASE}` }}
      >
        {/* Header */}
        <div className="border-b border-[#eef0f5] bg-white p-3.5">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => actions.closeAutomation()}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#6b7280] transition-colors hover:bg-[#f5f8ff]"
            >
              <ArrowLeft size={15} strokeWidth={2.2} />
            </button>
            <FileTile format={doc.format} size={34} />
            <div className="min-w-0">
              <div className="truncate font-poppins text-[13.5px] font-semibold text-[#111827]">{doc.name}</div>
              <div className="text-[10.5px] font-inter text-[#9ca3af]">
                {FORMAT_LABEL[doc.format]} · {doc.sizeLabel}
              </div>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <HeaderIcon title="Historique" onClick={() => actions.showToast("Historique du fichier (démo)")}>
                <History size={13} strokeWidth={2.2} />
              </HeaderIcon>
              <HeaderIcon title="Ouvrir dans Excel" onClick={() => actions.showToast("Ouverture dans Excel…")}>
                <ExternalLink size={13} strokeWidth={2.2} />
              </HeaderIcon>
              <HeaderIcon title="Envoyer" onClick={() => actions.showToast("Envoi disponible après exécution")}>
                <Send size={13} strokeWidth={2.2} />
              </HeaderIcon>
              <HeaderIcon
                title={fullscreen ? "Côte à côte" : "Plein écran"}
                onClick={() => setFullscreen((f) => !f)}
              >
                {fullscreen ? <Minimize2 size={13} strokeWidth={2.2} /> : <Maximize2 size={13} strokeWidth={2.2} />}
              </HeaderIcon>
            </div>
          </div>
        </div>

        {/* Tabs + search */}
        <div className="px-3.5 pt-3">
          <div className="flex flex-wrap gap-1.5">
            {tabDefs.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[11.5px] font-medium font-inter transition-colors ${
                    active
                      ? "border-[#3b82f6] bg-[#eff6ff] text-[#3b82f6]"
                      : "border-[#e5e7eb] bg-white text-[#6b7280] hover:bg-[#f5f8ff]"
                  }`}
                >
                  {t.id === "favorites" ? (
                    <Star size={11} strokeWidth={2.4} className="text-[#f59e0b]" fill="#f59e0b" />
                  ) : t.color ? (
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: t.color }} />
                  ) : null}
                  {t.label}
                  <span className="text-[10px] text-[#9ca3af]">{t.count}</span>
                </button>
              );
            })}
          </div>
          <div className="relative mt-2.5">
            <Search size={12} strokeWidth={2.4} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une automatisation…"
              className="h-8 w-full rounded-full border border-[#e5e7eb] bg-white pl-8 pr-3 text-[12px] font-inter text-[#111827] placeholder:text-[#9ca3af] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/15"
            />
          </div>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3.5" data-lenis-prevent>
          {tab === "all" && !q && (
            <div data-tour="auto-run">
              <div className="mb-2 flex items-center gap-1.5">
                <Sparkles size={13} strokeWidth={2.4} className="text-[#3b82f6]" />
                <span className="text-[12px] font-semibold font-inter text-[#111827]">
                  Suggestions pour ce fichier
                </span>
              </div>
              <div className="space-y-2">
                {suggestions.map(({ auto, reason }) => {
                  const cat = autoCategoryOf(auto.category);
                  return (
                    <Card key={auto.id} className="flex items-center gap-2.5 p-3">
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: cat.soft, color: cat.color }}
                      >
                        <Zap size={13} strokeWidth={2.4} />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[12.5px] font-semibold font-inter text-[#111827]">
                          {auto.title}
                        </div>
                        <div className="text-[10.5px] font-inter text-[#9ca3af]">{reason}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => startRun(auto)}
                        className="ml-auto shrink-0 rounded-full bg-[#eff6ff] px-2.5 py-1 text-[11.5px] font-semibold font-inter text-[#3b82f6] transition-colors hover:bg-[#dbeafe]"
                      >
                        Lancer
                      </button>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {visible.map((auto) => (
            <AutomationCard
              key={auto.id}
              auto={auto}
              running={runningId === auto.id}
              phase={phase}
              showDoneBanner={doneBannerId === auto.id}
              onLaunch={() => startRun(auto)}
              onCancel={cancelRun}
              onOpenDetail={() => setDetailAuto(auto)}
              onOpenReport={() => setReportOpen(true)}
              onCloseBanner={() => setDoneBannerId(null)}
            />
          ))}
          {visible.length === 0 && (
            <div className="py-10 text-center">
              <div className="text-[13px] font-semibold font-inter text-[#111827]">Aucune automatisation</div>
              <div className="mt-1 text-[12px] font-inter text-[#6b7280]">
                Ajustez votre recherche ou changez d'onglet.
              </div>
            </div>
          )}
        </div>

        {/* Journal */}
        <div className="border-t border-[#eef0f5] bg-white">
          <button
            type="button"
            onClick={() => setJournalOpen((o) => !o)}
            className="flex w-full items-center justify-between px-3.5 py-2"
          >
            <span className="text-[10.5px] font-semibold font-inter uppercase tracking-[0.14em] text-[#9ca3af]">
              Journal · {journal.length}
            </span>
            {journalOpen ? (
              <ChevronDown size={13} strokeWidth={2.4} className="text-[#9ca3af]" />
            ) : (
              <ChevronUp size={13} strokeWidth={2.4} className="text-[#9ca3af]" />
            )}
          </button>
          {journalOpen && (
            <div
              className="max-h-[140px] overflow-y-auto px-3.5 pb-2"
              data-lenis-prevent
              style={{ animation: `ora-accordion-expand 180ms ${EASE}` }}
            >
              {journal.map((line, i) => (
                <div key={i} className="font-mono text-[10.5px] leading-relaxed text-[#6b7280]">
                  <span className="text-[#9ca3af]">{line.time}</span>{" "}
                  <span style={{ color: GLYPH_COLOR[line.glyph] }}>{line.glyph}</span> {line.text}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail drawer over the panel */}
        {detailAuto && (
          <AutomationDetail
            auto={detailAuto}
            onBack={() => setDetailAuto(null)}
            onLaunch={() => {
              setDetailAuto(null);
              startRun(detailAuto);
            }}
          />
        )}

        {/* Report modal (analyses) */}
        {reportOpen && <ReportModal onClose={() => setReportOpen(false)} />}

        {/* Post-automation dialog */}
        {postAuto && (
          <PostAutoDialog
            doc={doc}
            projectName={projectName}
            postAuto={postAuto}
            setPostAuto={setPostAuto}
          />
        )}
      </div>
    </>
  );
}

function HeaderIcon({
  children,
  title,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-full text-[#6b7280] transition-colors hover:bg-[#f5f8ff]"
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------- automation card */

function AutomationCard({
  auto,
  running,
  phase,
  showDoneBanner,
  onLaunch,
  onCancel,
  onOpenDetail,
  onOpenReport,
  onCloseBanner,
}: {
  auto: Automation;
  running: boolean;
  phase: RunPhase;
  showDoneBanner: boolean;
  onLaunch: () => void;
  onCancel: () => void;
  onOpenDetail: () => void;
  onOpenReport: () => void;
  onCloseBanner: () => void;
}) {
  const { state, actions } = useSim();
  const cat = autoCategoryOf(auto.category);
  const out = AUTO_OUTPUT[auto.output];
  const favorite = state.favoriteAutoIds.includes(auto.id);

  return (
    <div>
      <Card
        className="cursor-pointer p-3.5 transition-transform duration-150 hover:-translate-y-px"
      >
        <div className="flex items-start gap-2.5" onClick={onOpenDetail}>
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
            style={{ background: cat.soft, color: cat.color }}
          >
            <Zap size={14} strokeWidth={2.4} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[12.5px] font-bold font-inter text-[#111827]">{auto.title}</span>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-medium font-inter ${out.chip}`}>
                {out.label}
              </span>
              <span className="text-[10.5px] font-inter text-[#9ca3af]">{auto.durationLabel}</span>
            </div>
            <p className="mt-1 text-[11.5px] font-inter leading-snug text-[#6b7280] line-clamp-2">
              {auto.description}
            </p>
            <p className="mt-1 text-[10.5px] font-inter text-[#9ca3af]">Prérequis : {auto.prereq}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!actions.toggleFavoriteAuto(auto.id)) {
                  actions.showToast("Limite atteinte (8 favoris max). Retirez-en un pour continuer.");
                }
              }}
              className="transition-colors"
            >
              <Star
                size={14}
                strokeWidth={2.2}
                className={favorite ? "text-[#f59e0b]" : "text-[#d1d5db] hover:text-[#9ca3af]"}
                fill={favorite ? "#f59e0b" : "none"}
              />
            </button>
            {running ? (
              <div className="flex items-center gap-2" style={{ animation: `ora-accordion-expand 180ms ${EASE}` }}>
                <Spinner size={13} />
                <span className="text-[12px] font-inter text-[#6b7280]">{PHASE_LABEL[phase]}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancel();
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[#9ca3af] transition-colors hover:bg-[#f5f8ff] hover:text-[#6b7280]"
                >
                  <X size={12} strokeWidth={2.4} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onLaunch();
                }}
                className="rounded-full bg-[#eff6ff] px-3 py-1.5 text-[12px] font-semibold font-inter text-[#3b82f6] transition-colors hover:bg-[#dbeafe]"
              >
                Lancer
              </button>
            )}
          </div>
        </div>
      </Card>

      {showDoneBanner && (
        <div
          className="mt-2 rounded-xl border border-[#10b981]/25 bg-[#d1fae5]/50 p-3"
          style={{ animation: `ora-accordion-expand 180ms ${EASE}` }}
        >
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} strokeWidth={2.4} className="text-[#047857]" />
            <span className="text-[12px] font-semibold font-inter text-[#047857]">Terminé en 2,5 s</span>
          </div>
          <div className="mt-1 text-[11px] font-inter text-[#374151]">{auto.example.after}</div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={onOpenReport}
              className="rounded-full bg-white px-2.5 py-1 text-[11.5px] font-semibold font-inter text-[#047857] transition-colors hover:bg-[#d1fae5]"
            >
              Voir le rapport
            </button>
            <BtnSoft small onClick={onCloseBanner}>
              Fermer
            </BtnSoft>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------- detail drawer */

function AutomationDetail({
  auto,
  onBack,
  onLaunch,
}: {
  auto: Automation;
  onBack: () => void;
  onLaunch: () => void;
}) {
  const cat = autoCategoryOf(auto.category);
  const out = AUTO_OUTPUT[auto.output];
  return (
    <div
      className="absolute inset-y-0 right-0 z-40 flex w-full flex-col bg-white"
      style={{ animation: `ora-drawer-in 200ms ${EASE}` }}
    >
      <div className="flex items-center gap-2.5 border-b border-[#eef0f5] p-3.5">
        <button
          type="button"
          onClick={onBack}
          className="flex h-7 w-7 items-center justify-center rounded-full text-[#6b7280] transition-colors hover:bg-[#f5f8ff]"
        >
          <ArrowLeft size={15} strokeWidth={2.2} />
        </button>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-xl"
          style={{ background: cat.soft, color: cat.color }}
        >
          <Zap size={14} strokeWidth={2.4} />
        </div>
        <div>
          <div className="font-poppins text-[13.5px] font-semibold text-[#111827]">{auto.title}</div>
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium font-inter ${out.chip}`}>
              {out.label}
            </span>
            <span className="text-[10px] font-inter text-[#9ca3af]">{auto.durationLabel}</span>
          </div>
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4" data-lenis-prevent>
        <section>
          <Eyebrow>Quand l'utiliser</Eyebrow>
          <p className="mt-1 text-[12.5px] font-inter leading-relaxed text-[#374151]">{auto.whenToUse}</p>
        </section>
        <section>
          <Eyebrow>Entrée attendue</Eyebrow>
          <p className="mt-1 text-[12.5px] font-inter leading-relaxed text-[#374151]">{auto.input}</p>
        </section>
        <section>
          <Eyebrow>Ce que vous obtenez</Eyebrow>
          <p className="mt-1 text-[12.5px] font-inter leading-relaxed text-[#374151]">{auto.result}</p>
        </section>
        <section>
          <Eyebrow>Exemple</Eyebrow>
          <div className="mt-1.5 flex items-center gap-2.5 rounded-xl border border-[#eef0f5] p-3">
            <div className="min-w-0 flex-1">
              <div className="text-[10.5px] font-inter text-[#9ca3af]">Avant</div>
              <div className="text-[12px] font-inter text-[#374151]">{auto.example.before}</div>
            </div>
            <ArrowRight size={14} strokeWidth={2.2} className="shrink-0 text-[#9ca3af]" />
            <div className="min-w-0 flex-1">
              <div className="text-[10.5px] font-inter text-[#9ca3af]">Après</div>
              <div className="text-[12px] font-inter text-[#374151]">{auto.example.after}</div>
            </div>
          </div>
        </section>
      </div>
      <div className="border-t border-[#eef0f5] p-3.5">
        <BtnPrimary className="w-full" onClick={onLaunch}>
          Lancer
        </BtnPrimary>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- report modal */

const REPORT_FINDINGS = [
  "Écriture 4021 et 4022 : même montant 1 250,00 €, même date",
  "Facture F-2026-118 saisie deux fois",
  "Libellé approché : « LOYER JANV » / « LOYER JANVIER »",
];

function ReportModal({ onClose }: { onClose: () => void }) {
  const { actions } = useSim();
  return (
    <Modal maxW={480} onClose={onClose}>
      <ModalClose onClick={onClose} />
      <h3 className="font-poppins text-[16px] font-semibold text-[#111827]">Rapport d'analyse</h3>
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#f59e0b]/30 bg-[#fef3c7] p-3">
        <TriangleAlert size={14} strokeWidth={2.4} className="shrink-0 text-[#b45309]" />
        <span className="text-[12.5px] font-semibold font-inter text-[#92400e]">
          14 doublons suspects identifiés
        </span>
      </div>
      <div className="mt-3 space-y-2">
        {REPORT_FINDINGS.map((f, i) => (
          <div key={i} className="flex items-start gap-2 text-[12px] font-inter text-[#374151]">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f59e0b]" />
            {f}
          </div>
        ))}
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <BtnSoft onClick={onClose}>Fermer</BtnSoft>
        <BtnPrimary
          onClick={() => {
            actions.showToast("Rapport exporté en PDF");
            onClose();
          }}
        >
          Exporter en PDF
        </BtnPrimary>
      </div>
    </Modal>
  );
}

/* -------------------------------------------- post-automation dialog §3.7 */

function PostAutoDialog({
  doc,
  projectName,
  postAuto,
  setPostAuto,
}: {
  doc: Doc;
  projectName: string;
  postAuto: PostAuto;
  setPostAuto: React.Dispatch<React.SetStateAction<PostAuto | null>>;
}) {
  const { state, actions } = useSim();
  const p = postAuto;
  const targetProject = state.projects.find((pr) => pr.id === p.targetProjectId);
  const targetName = targetProject?.name ?? projectName;

  const ctaLabel =
    p.option === "save"
      ? "Enregistrer et ouvrir dans Excel"
      : p.option === "replace"
        ? "Remplacer et ouvrir dans Excel"
        : "Ouvrir sans enregistrer";

  const confirmStep1 = () => {
    if (p.option === "save") {
      actions.saveAutomationResult(doc.id, p.auto, p.name.trim() || (p.auto.producesName ?? "Résultat"));
      setPostAuto({ ...p, step: 2, saved: true, finalName: p.name.trim() || (p.auto.producesName ?? "Résultat") });
    } else if (p.option === "replace") {
      actions.patchDoc(doc.id, { updatedLabel: "à l'instant" });
      setPostAuto({ ...p, step: 2, saved: true, finalName: doc.name });
    } else {
      setPostAuto({ ...p, step: 2, saved: false, finalName: "" });
    }
  };

  const finish = () => {
    setPostAuto(null);
    actions.closeAutomation();
    actions.showToast("Ouverture dans Excel…");
  };

  const sendToMember = (memberId: string) => {
    setPostAuto((cur) => (cur ? { ...cur, memberSend: { ...cur.memberSend, [memberId]: "sending" } } : cur));
    setTimeout(() => {
      setPostAuto((cur) => (cur ? { ...cur, memberSend: { ...cur.memberSend, [memberId]: "sent" } } : cur));
    }, 700);
  };

  return (
    <Modal maxW={470} onClose={() => setPostAuto(null)}>
      {p.step === 1 ? (
        <div key={1} style={{ animation: `ora-step-in 240ms ${EASE}` }}>
          <h3 className="font-poppins text-[17px] font-semibold text-[#111827]">Votre fichier est prêt</h3>
          <p className="mt-1 text-[12.5px] font-inter text-[#6b7280]">
            L'automatisation « {p.auto.title} » a créé un nouveau fichier : « {doc.name} » n'a pas été
            modifié.
          </p>

          <div className="mt-4 space-y-2.5">
            <OptionCard
              icon={<FilePlus2 size={15} strokeWidth={2.2} />}
              title="Enregistrer comme nouveau fichier"
              hint={`Ajouté au projet « ${targetName} », relié à « ${doc.name} ». Visible dans l'Atlas du projet.`}
              selected={p.option === "save"}
              onClick={() => setPostAuto({ ...p, option: "save" })}
            >
              {p.option === "save" && (
                <div className="mt-2.5" style={{ animation: `ora-accordion-expand 180ms ${EASE}` }}>
                  <Eyebrow>Nom du document</Eyebrow>
                  <div className="mt-1.5" onClick={(e) => e.stopPropagation()}>
                    <Input value={p.name} onChange={(v) => setPostAuto({ ...p, name: v })} />
                  </div>
                  <div
                    className="mt-2 flex items-center gap-1.5 text-[11.5px] font-inter text-[#6b7280]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Projet : <span className="font-semibold text-[#111827]">{targetName}</span>
                    <button
                      type="button"
                      onClick={() => setPostAuto({ ...p, showProjectPicker: !p.showProjectPicker })}
                      className="font-medium text-[#3b82f6] hover:underline"
                    >
                      Changer
                    </button>
                  </div>
                  {p.showProjectPicker && (
                    <div
                      className="mt-1.5 rounded-xl border border-[#eef0f5] p-1"
                      style={{ animation: `ora-accordion-expand 180ms ${EASE}` }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {state.projects.map((pr) => (
                        <MenuItem
                          key={pr.id}
                          active={pr.id === p.targetProjectId}
                          onClick={() =>
                            setPostAuto({ ...p, targetProjectId: pr.id, showProjectPicker: false })
                          }
                        >
                          {pr.name}
                        </MenuItem>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </OptionCard>

            <OptionCard
              icon={<RefreshCw size={15} strokeWidth={2.2} />}
              title={`Remplacer « ${doc.name} »`}
              hint="Le contenu actuel du fichier d'origine est écrasé par ce résultat. Excel recharge la nouvelle version."
              selected={p.option === "replace"}
              onClick={() => setPostAuto({ ...p, option: "replace" })}
            />
            <OptionCard
              icon={<Rocket size={15} strokeWidth={2.2} />}
              title="Ouvrir sans enregistrer"
              hint="Simple aperçu dans Excel : le fichier ne sera pas conservé dans vos projets."
              selected={p.option === "open"}
              onClick={() => setPostAuto({ ...p, option: "open" })}
            />
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <BtnSoft onClick={() => setPostAuto(null)}>Annuler</BtnSoft>
            <BtnPrimary onClick={confirmStep1}>{ctaLabel}</BtnPrimary>
          </div>
        </div>
      ) : (
        <div key={2} style={{ animation: `ora-step-in 240ms ${EASE}` }}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d1fae5] text-[#047857]">
            <CheckCircle2 size={20} strokeWidth={2.2} />
          </div>
          <h3 className="mt-3 font-poppins text-[17px] font-semibold text-[#111827]">C'est fait</h3>
          <p className="mt-1 text-[12.5px] font-inter text-[#6b7280]">
            {p.saved
              ? `« ${p.finalName} » est enregistré dans le projet « ${targetName} » et s'ouvre dans Excel.`
              : "Le fichier s'ouvre dans Excel, sans être conservé dans vos projets."}
          </p>

          <Eyebrow className="mt-4">Transmettre le résultat</Eyebrow>
          <div className="mt-2 grid grid-cols-2 gap-2.5">
            {/* Send to member */}
            <div className={p.saved ? "" : "opacity-50 pointer-events-none"}>
              <button
                type="button"
                onClick={() => setPostAuto({ ...p, membersOpen: !p.membersOpen })}
                className={`w-full rounded-2xl border p-3 text-left transition-all duration-150 hover:-translate-y-px hover:bg-[#f5f8ff] ${
                  p.membersOpen ? "border-[#3b82f6] bg-[#eff6ff]" : "border-[#e5e7eb] bg-white"
                }`}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eff6ff] text-[#3b82f6]">
                  <Users size={13} strokeWidth={2.2} />
                </div>
                <div className="mt-2 text-[12.5px] font-semibold font-inter text-[#111827]">
                  Envoyer à un membre
                </div>
                <div className="mt-0.5 text-[10.5px] font-inter leading-snug text-[#6b7280]">
                  Par message dans Ora, avec le document joint.
                </div>
              </button>
            </div>

            {/* Send by email */}
            <button
              type="button"
              onClick={() => setPostAuto({ ...p, emailDone: true })}
              className={`w-full rounded-2xl border p-3 text-left transition-all duration-150 ${
                p.emailDone
                  ? "border-[#10b981] bg-[#d1fae5]/40"
                  : "border-[#e5e7eb] bg-white hover:-translate-y-px hover:bg-[#f5f8ff]"
              }`}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                  p.emailDone ? "bg-[#d1fae5] text-[#047857]" : "bg-[#eff6ff] text-[#3b82f6]"
                }`}
              >
                {p.emailDone ? <CheckCircle2 size={13} strokeWidth={2.4} /> : <Mail size={13} strokeWidth={2.2} />}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[12.5px] font-semibold font-inter text-[#111827]">
                {p.emailDone ? "Brouillon créé" : "Envoyer par e-mail"}
              </div>
              <div className="mt-0.5 text-[10.5px] font-inter leading-snug text-[#6b7280]">
                {p.emailDone
                  ? "Le fichier est joint au brouillon ouvert dans Mail."
                  : "Ouvre un brouillon avec le fichier en pièce jointe."}
              </div>
            </button>
          </div>

          {/* Member list (unfolds from « Envoyer à un membre ») */}
          {p.saved && p.membersOpen ? (
            <div className="mt-2.5 rounded-2xl border border-[#eef0f5] p-1.5" style={{ animation: `ora-accordion-expand 180ms ${EASE}` }}>
              {MEMBERS.filter((m) => m.id !== "me").map((m) => {
                const st = p.memberSend[m.id];
                return (
                  <div key={m.id} className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-[#f5f8ff]">
                    <Avatar name={m.name} color={m.color} size={22} />
                    <div className="min-w-0">
                      <div className="text-[12px] font-semibold font-inter text-[#111827]">{m.name}</div>
                      <div className="text-[10.5px] font-inter text-[#9ca3af]">{m.email}</div>
                    </div>
                    <div className="ml-auto">
                      {st === "sending" ? (
                        <Spinner size={12} />
                      ) : st === "sent" ? (
                        <span className="flex items-center gap-1 text-[11.5px] font-semibold font-inter text-[#10b981]">
                          <CheckCircle2 size={12} strokeWidth={2.4} /> Envoyé
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => sendToMember(m.id)}
                          className="text-[11.5px] font-medium font-inter text-[#3b82f6] hover:underline"
                        >
                          Envoyer
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : !p.saved ? (
            <p className="mt-2 text-[10.5px] font-inter text-[#9ca3af]">
              L'envoi à un membre nécessite un fichier enregistré dans un projet.
            </p>
          ) : null}

          <div className="mt-5 flex justify-end">
            <BtnPrimary onClick={finish}>Terminé</BtnPrimary>
          </div>
        </div>
      )}
    </Modal>
  );
}
