/**
 * Atlas simulation — guided tour overlay.
 *
 * Replicates the "spotlight" onboarding of the old InteractiveGalaxy: a dark,
 * blurred mask covers the whole window and blocks interaction, leaving only
 * the active step's element lit and clickable, while an instruction card leads
 * the user step by step through the WHOLE software (projects → documents →
 * inspector → automation → galaxy).
 *
 * The tour reads the shared store to auto-advance when the user performs the
 * highlighted action, and each « Suivant » can also drive the demo forward, so
 * the flow never gets stuck whether the user clicks along or just follows.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, MousePointerClick, Sparkles, X } from "lucide-react";
import { useSim } from "./store";
import type { SimActions, SimState } from "./store";
import { EASE } from "./ui";

interface Step {
  key: string;
  /** data-tour value of the element to spotlight (absent = full dim) */
  target?: string;
  title: string;
  body: string;
  hint?: string;
  /** true when the app state already satisfies this step (auto-advance) */
  done?: (s: SimState) => boolean;
  /** side effect performed when « Suivant » is pressed (drives the demo) */
  onNext?: (a: SimActions) => void;
}

const STEPS: Step[] = [
  {
    key: "welcome",
    target: "project-alpha",
    title: "Bienvenue dans Atlas",
    body: "Atlas réunit tous les fichiers d'une mission au même endroit : audit, deal, dossier client. Suivons un fichier de bout en bout.",
    hint: "Suivez le guide",
  },
  {
    key: "open-project",
    target: "project-alpha",
    title: "Ouvrez un dossier",
    body: "Chaque carte est une mission. Ouvrez « Audit Alpha 2026 » pour explorer ses documents.",
    hint: "Cliquez le projet",
    done: (s) => s.screen.view === "project",
    onNext: (a) => a.openProject("p-alpha"),
  },
  {
    key: "doc-list",
    target: "doc-list",
    title: "Les documents de la mission",
    body: "Chaque fichier porte un statut, des catégories et un journal d'audit. Tout reste dans Excel, rien ne se perd.",
    hint: "Vue d'ensemble",
  },
  {
    key: "open-doc",
    target: "doc-row",
    title: "Ouvrez un fichier",
    body: "Ouvrez « FEC janvier » pour voir son suivi, sa validation par le manager et qui a fait quoi.",
    hint: "Cliquez le document",
    done: (s) => s.inspectorDocId != null,
    onNext: (a) => a.openInspector("d-fec"),
  },
  {
    key: "inspector",
    target: "inspector",
    title: "L'inspecteur du document",
    body: "Statut, validation manager, discussion d'équipe et historique complet : toute la vie du fichier tient dans ce panneau.",
    hint: "Panneau de suivi",
  },
  {
    key: "open-auto",
    target: "inspector-auto",
    title: "Lancez une automatisation",
    body: "C'est ici qu'Ora travaille pour vous. Ouvrez l'atelier d'automatisation du fichier.",
    hint: "Cliquez Automatisation",
    done: (s) => s.automationDocId != null,
    onNext: (a) => a.openAutomation("d-fec"),
  },
    {
    key: "run-auto",
    // Spotlight the whole panel so the post-automation dialog (rendered inside
    // it) stays lit and clickable if the user actually runs an automation.
    target: "auto-panel",
    title: "Choisissez une automatisation",
    body: "Par exemple « Retraitement FEC ». Ora l'exécute en local, crée un nouveau fichier et l'enregistre dans la mission, relié à sa source.",
    hint: "Cliquez Lancer",
    // Auto-advances once the run produced a new document.
  },
  {
    key: "galaxy",
    target: "view-toggle",
    title: "La galaxie du dossier",
    body: "La vue Galaxie relie chaque fichier à ses sources et à ses livrables : la lignée complète d'un chiffre, d'un coup d'œil.",
    hint: "Passez en Galaxie",
    done: (s) => s.projectTab === "galaxy",
    onNext: (a) => {
      a.closeAutomation();
      a.closeInspector();
      a.setProjectTab("galaxy");
    },
  },
  {
    key: "explore",
    target: "galaxy",
    title: "À vous de jouer",
    body: "Chaque lien raconte d'où vient un fichier. Survolez, cliquez, ouvrez l'inspecteur : explorez librement la démo.",
    hint: "Exploration libre",
  },
];

const WIN_W = 1020;
const WIN_H = 660;
const CARD_W = 300;
const PAD = 8; // padding around the spotlit element

interface Hole {
  left: number;
  top: number;
  width: number;
  height: number;
}

export default function Tour() {
  const { state, actions } = useSim();
  const step = state.tourStep;
  const rootRef = useRef<HTMLDivElement>(null);
  const [hole, setHole] = useState<Hole | null>(null);
  // Baseline doc count captured when the "run-auto" step starts, so we can
  // detect that the user actually produced a new file.
  const runBaseRef = useRef<number | null>(null);

  const active = step != null && step >= 0 && step < STEPS.length;
  const current = active ? STEPS[step] : null;

  // The tour is started by <IntroHint> (after the "interactive" cue) or by the
  // restart pill below — no auto-start observer here.

  /* ------------------------------------------- capture run-auto baseline */
  useEffect(() => {
    if (!active) {
      runBaseRef.current = null;
      return;
    }
    if (current?.key === "run-auto" && runBaseRef.current == null) {
      runBaseRef.current = state.docs.length;
    }
  }, [active, current?.key, state.docs.length]);

  /* ----------------------------------------------- measure spotlight rect */
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const measure = () => {
      const overlay = rootRef.current;
      const root = overlay?.closest("[data-sim-root]") as HTMLElement | null;
      if (root && current?.target) {
        const rootRect = root.getBoundingClientRect();
        const scale = rootRect.width / WIN_W || 1;
        const el = document.querySelector(`[data-tour="${current.target}"]`);
        if (el) {
          const r = el.getBoundingClientRect();
          const left = (r.left - rootRect.left) / scale - PAD;
          const top = (r.top - rootRect.top) / scale - PAD;
          const width = r.width / scale + PAD * 2;
          const height = r.height / scale + PAD * 2;
          setHole({
            left: clamp(left, 0, WIN_W),
            top: clamp(top, 0, WIN_H),
            width: clamp(width, 0, WIN_W - clamp(left, 0, WIN_W)),
            height: clamp(height, 0, WIN_H - clamp(top, 0, WIN_H)),
          });
        } else {
          setHole(null);
        }
      } else {
        setHole(null);
      }
      raf = requestAnimationFrame(measure);
    };
    measure();
    return () => cancelAnimationFrame(raf);
  }, [active, current?.target, current?.key, step]);

  /* ------------------------------------------------------- auto-advance */
  useEffect(() => {
    if (!active || !current) return;
    let ok = current.done ? current.done(state) : false;
    if (current.key === "run-auto") {
      ok = runBaseRef.current != null && state.docs.length > runBaseRef.current;
    }
    if (!ok) return;
    const t = setTimeout(() => {
      actions.setTourStep(step! + 1 < STEPS.length ? step! + 1 : -1);
      if (step! + 1 >= STEPS.length) actions.endTour();
    }, 420);
    return () => clearTimeout(t);
  }, [
    active,
    current,
    step,
    actions,
    state,
    state.screen,
    state.inspectorDocId,
    state.automationDocId,
    state.projectTab,
    state.docs.length,
  ]);

  const next = useCallback(() => {
    if (step == null) return;
    current?.onNext?.(actions);
    if (step + 1 < STEPS.length) actions.setTourStep(step + 1);
    else actions.endTour();
  }, [step, current, actions]);

  const prev = useCallback(() => {
    if (step == null || step === 0) return;
    actions.setTourStep(step - 1);
  }, [step, actions]);

  /* --------------------------------------------- restart pill (tour off) */
  if (!active) {
    return (
      <div ref={rootRef} className="pointer-events-none absolute inset-0 z-[55]">
        <button
          type="button"
          onClick={() => actions.startTour()}
          className="pointer-events-auto absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full border border-[#e5e7eb] bg-white/95 px-3 py-1.5 text-[11.5px] font-semibold font-inter text-[#3b82f6] shadow-[0_8px_24px_-10px_rgba(15,23,42,.35)] backdrop-blur transition-colors hover:bg-white"
        >
          <Sparkles size={13} strokeWidth={2.4} />
          Revoir la visite guidée
        </button>
      </div>
    );
  }

  // Card placement: opposite side of the spotlight's horizontal center.
  let cardLeft: number;
  let cardTop: number;
  if (!hole) {
    cardLeft = (WIN_W - CARD_W) / 2;
    cardTop = WIN_H - 250;
  } else {
    const center = hole.left + hole.width / 2;
    if (center < WIN_W / 2) {
      cardLeft = Math.min(hole.left + hole.width + 16, WIN_W - CARD_W - 12);
    } else {
      cardLeft = Math.max(hole.left - CARD_W - 16, 12);
    }
    cardTop = clamp(hole.top, 14, WIN_H - 230);
  }

  const maskStyle = {
    position: "absolute" as const,
    background: "rgba(10,14,28,0.74)",
    backdropFilter: "blur(3px)",
    WebkitBackdropFilter: "blur(3px)",
    pointerEvents: "auto" as const,
  };

  return (
    <div ref={rootRef} className="absolute inset-0 z-[55]">
      {/* Dark blurred mask with a cut-out around the active element */}
      {hole ? (
        <>
          <div style={{ ...maskStyle, left: 0, top: 0, width: WIN_W, height: Math.max(0, hole.top) }} onClick={stop} />
          <div
            style={{ ...maskStyle, left: 0, top: hole.top + hole.height, width: WIN_W, height: Math.max(0, WIN_H - (hole.top + hole.height)) }}
            onClick={stop}
          />
          <div style={{ ...maskStyle, left: 0, top: hole.top, width: Math.max(0, hole.left), height: hole.height }} onClick={stop} />
          <div
            style={{ ...maskStyle, left: hole.left + hole.width, top: hole.top, width: Math.max(0, WIN_W - (hole.left + hole.width)), height: hole.height }}
            onClick={stop}
          />
          {/* Glowing ring around the spotlight */}
          <div
            className="pointer-events-none absolute rounded-xl"
            style={{
              left: hole.left,
              top: hole.top,
              width: hole.width,
              height: hole.height,
              boxShadow: "0 0 0 2px rgba(96,165,250,0.95), 0 0 0 8px rgba(59,130,246,0.22)",
              transition: `all 260ms ${EASE}`,
            }}
          />
        </>
      ) : (
        <div style={{ ...maskStyle, inset: 0, width: WIN_W, height: WIN_H }} onClick={stop} />
      )}

      {/* Instruction card */}
      <div
        key={current!.key}
        className="absolute z-[60] overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white"
        style={{
          left: cardLeft,
          top: cardTop,
          width: CARD_W,
          boxShadow: "0 24px 64px -16px rgba(8,12,28,.55), 0 4px 16px rgba(8,12,28,.28)",
          animation: `ora-modal-pop 220ms ${EASE}`,
        }}
      >
        {/* progress bar */}
        <div className="h-1 w-full bg-[#eef0f5]">
          <div
            className="h-full bg-[#3b82f6] transition-all duration-300"
            style={{ width: `${((step! + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <div className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold font-inter uppercase tracking-[0.14em] text-[#3b82f6]">
              <Sparkles size={12} strokeWidth={2.6} />
              Guide · étape {step! + 1}/{STEPS.length}
            </span>
            <button
              type="button"
              onClick={() => actions.endTour()}
              className="flex h-6 w-6 items-center justify-center rounded-full text-[#9ca3af] transition-colors hover:bg-[#f5f8ff] hover:text-[#6b7280]"
              title="Passer la visite"
            >
              <X size={13} strokeWidth={2.4} />
            </button>
          </div>

          <div className="mb-1 font-poppins text-[15px] font-semibold tracking-[-0.01em] text-[#111827]">
            {current!.title}
          </div>
          <p className="text-[12.5px] font-inter leading-relaxed text-[#6b7280]">{current!.body}</p>

          <div className="mt-4 flex items-center justify-between">
            {current!.hint ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eff6ff] px-2.5 py-1 text-[10.5px] font-semibold font-inter text-[#3b82f6]">
                <MousePointerClick size={12} strokeWidth={2.4} />
                {current!.hint}
              </span>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-1.5">
              {step! > 0 && (
                <button
                  type="button"
                  onClick={prev}
                  className="rounded-full px-2.5 py-1.5 text-[12px] font-medium font-inter text-[#6b7280] transition-colors hover:bg-[#f5f8ff]"
                >
                  Précédent
                </button>
              )}
              <button
                type="button"
                onClick={next}
                className="inline-flex items-center gap-1 rounded-full bg-[#3b82f6] px-3 py-1.5 text-[12px] font-semibold font-inter text-white transition-colors hover:bg-[#2563eb]"
              >
                {step! < STEPS.length - 1 ? "Suivant" : "Terminer"}
                <ArrowRight size={13} strokeWidth={2.4} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function stop(e: React.MouseEvent) {
  e.stopPropagation();
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
