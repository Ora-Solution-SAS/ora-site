import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ExcelPane, { type GridSource } from "./ExcelPane";
import OraPanel from "./OraPanel";
import { MESSY_FILENAME } from "./ledger";
import { demoCleanSource, demoMessySource, uploadedSource } from "./sources";

/**
 * OraWorkbench — la réplique interactive du logiciel, pour la page /demo.
 *
 * Classeur Excel à gauche, panneau d'extension Ora à droite. Le visiteur clique
 * « Lancer » sur « Nettoyer le fichier » et regarde le classeur sale devenir
 * propre, comme dans le vrai logiciel.
 *
 * PHASE 1 — châssis et séquence scriptée. Le mode réel (dépôt du fichier du
 * visiteur, exécution par le service de démo) et la capture d'e-mail arrivent
 * ensuite ; la modale de fin est déjà en place pour les accueillir.
 *
 * La scène a une taille FIXE mise à l'échelle par un ResizeObserver, comme les
 * autres répliques du site. C'est ce qui garantit que les proportions du
 * logiciel sont respectées quelle que soit la largeur de l'écran. Les
 * transformes ne perturbent pas la détection de clic, la réplique reste donc
 * pleinement cliquable.
 */

const W = 1400;
const H = 880;

/** Les quatre étapes de la modale d'exécution, avec leur durée. */
const STEPS = [
  { label: "Préparation", ms: 700 },
  { label: "Récupération du fichier", ms: 1100 },
  { label: "Exécution", ms: 1600 },
  { label: "Enregistrement", ms: 800 },
];

type Phase = "idle" | "running" | "done";

export default function OraWorkbench({ file }: { file?: File | null }) {
  const mediaRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(0);
  const [cleaned, setCleaned] = useState(false);

  // Le fichier déposé, lu DANS LE NAVIGATEUR : il ne sert qu'à l'affichage, ne
  // quitte jamais la page, et le lecteur n'est téléchargé qu'au moment où un
  // fichier arrive vraiment.
  const [uploaded, setUploaded] = useState<GridSource | null>(null);
  const [reading, setReading] = useState(false);
  const [readError, setReadError] = useState<string | null>(null);

  const demoMessy = useMemo(demoMessySource, []);
  const demoClean = useMemo(demoCleanSource, []);

  useEffect(() => {
    if (!file) { setUploaded(null); setReadError(null); return; }
    let cancelled = false;
    setReading(true);
    setReadError(null);
    (async () => {
      try {
        const { readUploadedFile } = await import("./readWorkbook");
        const read = await readUploadedFile(file);
        if (!cancelled) setUploaded(uploadedSource(read));
      } catch (e) {
        // L'aperçu n'est qu'un confort : s'il échoue, l'automatisation reste
        // lançable, on le dit simplement au visiteur.
        if (!cancelled) setReadError(e instanceof Error ? e.message : "Aperçu indisponible pour ce fichier.");
      } finally {
        if (!cancelled) setReading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [file]);

  // Mise à l'échelle de la scène, même patron que les autres répliques.
  useEffect(() => {
    const media = mediaRef.current, stage = stageRef.current;
    if (!media || !stage) return;
    const fit = () => {
      const s = Math.min(media.clientWidth / W, media.clientHeight / H);
      // Une première mesure à zéro écrirait scale(0) et la scène resterait
      // écrasée jusqu'à la mesure suivante. On laisse la valeur précédente.
      if (s <= 0) return;
      stage.style.transform = `translateX(-50%) scale(${s})`;
    };
    const ro = new ResizeObserver(fit);
    ro.observe(media);
    fit();
    return () => ro.disconnect();
  }, []);

  // Déroulé de l'exécution. Les minuteries sont annulées au démontage comme à
  // l'annulation, sinon un aller-retour rapide laisserait la modale avancer
  // toute seule après coup.
  const timers = useRef<number[]>([]);
  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const run = useCallback((key: string) => {
    if (key !== "clean_file" || phase === "running") return;
    clearTimers();
    setPhase("running");
    setStep(0);
    let elapsed = 0;
    STEPS.forEach((s, i) => {
      elapsed += s.ms;
      timers.current.push(window.setTimeout(() => setStep(i + 1), elapsed));
    });
    timers.current.push(window.setTimeout(() => {
      setCleaned(true);
      setPhase("done");
    }, elapsed + 250));
  }, [phase, clearTimers]);

  const cancel = useCallback(() => {
    clearTimers();
    setPhase("idle");
    setStep(0);
  }, [clearTimers]);

  const reset = useCallback(() => {
    clearTimers();
    setPhase("idle");
    setStep(0);
    setCleaned(false);
  }, [clearTimers]);

  useEffect(() => clearTimers, [clearTimers]);

  // Quelle grille afficher : le fichier du visiteur dès qu'il est lisible,
  // sinon le classeur de démonstration en avant-goût.
  const source: GridSource = uploaded ?? (cleaned ? demoClean : demoMessy);
  const panelFilename = uploaded?.filename ?? MESSY_FILENAME;

  return (
    <div ref={mediaRef} className="relative mx-auto aspect-[1400/880] w-full max-w-[1400px]">
      <div
        ref={stageRef}
        className="absolute left-1/2 top-0 origin-top"
        style={{ width: W, height: H }}
      >
        <div className="flex h-full gap-4">
          <div className="min-w-0 flex-1">
            <ExcelPane
              source={source}
              loading={reading}
              highlightRow={phase === "running" && step >= 3 ? step : null}
            />
          </div>

          <div className="relative w-[452px] shrink-0">
            <OraPanel filename={panelFilename} onRun={run} busy={phase === "running"} />

            {/* Voile + modales, cantonnés au panneau comme dans le logiciel. */}
            {phase !== "idle" && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[12px] bg-white/72 backdrop-blur-[2px] px-5">
                {phase === "running" ? <RunningModal step={step} onCancel={cancel} /> : <DoneModal onClose={reset} />}
              </div>
            )}
          </div>
        </div>
      </div>

      {readError && (
        <p className="mt-3 text-center font-inter text-[13px] text-[#b45309]">
          ⚠ {readError} L'automatisation reste lançable.
        </p>
      )}
    </div>
  );
}

/** Écran 2 du client : logo, titre, quatre étapes à barres, Annuler. */
function RunningModal({ step, onCancel }: { step: number; onCancel: () => void }) {
  return (
    <div className="w-full rounded-[18px] bg-white p-6 shadow-[0_30px_70px_-20px_rgba(15,23,42,.4),0_0_0_1px_rgba(15,23,42,.05)]">
      <img src="/logos/icon-color.png" alt="" aria-hidden className="mx-auto h-[46px] w-auto" />
      <div className="mt-4 text-center font-poppins text-[16px] font-semibold tracking-[-0.02em] text-[#111827]">
        Nettoyer le fichier
      </div>

      <div className="mt-5 space-y-3.5">
        {STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <div key={s.label}>
              <div className="flex items-center gap-2 text-[12px]">
                <span className={done ? "text-[#2f6ff0]" : active ? "text-[#2f6ff0]" : "text-[#c9ccd3]"}>
                  {done ? "✓" : "●"}
                </span>
                <span className={done || active ? "font-medium text-[#111827]" : "text-[#a0a4ad]"}>{s.label}</span>
              </div>
              <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-[#eef0f4]">
                <i
                  className="block h-full rounded-full bg-[#2f6ff0] transition-[width] ease-out"
                  style={{ width: done ? "100%" : active ? "62%" : "0%", transitionDuration: `${s.ms}ms` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="mx-auto mt-5 block font-inter text-[12px] text-[#8b909b] hover:text-[#111827]"
      >
        ✕ Annuler
      </button>
    </div>
  );
}

/**
 * Écran 3 du client. « Envoyer par e-mail » est le point d'accroche prévu pour
 * la capture d'e-mail du site : il ouvrira le formulaire existant en phase 3.
 * « Envoyer à un membre » reste inerte, comme dans le vrai logiciel hors projet.
 */
function DoneModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="w-full rounded-[18px] bg-white p-6 shadow-[0_30px_70px_-20px_rgba(15,23,42,.4),0_0_0_1px_rgba(15,23,42,.05)]">
      <div className="flex items-start gap-3">
        <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#e6f6ee] text-[15px] text-[#12a150]">✓</span>
        <div>
          <div className="font-poppins text-[16px] font-semibold tracking-[-0.02em] text-[#111827]">C'est fait</div>
          <p className="mt-1 font-inter text-[11.5px] leading-[1.45] text-[#6b7280]">
            Le fichier s'ouvre dans Excel. Il n'est pas conservé dans vos projets.
          </p>
        </div>
      </div>

      <div className="mt-5 text-[8.5px] font-bold uppercase tracking-[0.09em] text-[#a0a4ad]">Transmettre le résultat</div>
      <div className="mt-2 grid grid-cols-2 gap-2.5">
        <div className="rounded-[12px] p-3 ring-1 ring-[#f0f0f2] opacity-55">
          <span className="flex h-[26px] w-[26px] items-center justify-center rounded-[8px] bg-[#f4f5f7] text-[12px] text-[#8b909b]">👥</span>
          <div className="mt-2 font-inter text-[11.5px] font-semibold text-[#111827]">Envoyer à un membre</div>
          <div className="mt-0.5 font-inter text-[10px] leading-[1.35] text-[#a0a4ad]">Par message dans Ora, avec le document joint.</div>
        </div>
        <button type="button" className="rounded-[12px] p-3 text-left ring-1 ring-[#dbe6fb] transition-colors hover:bg-[#f7faff]">
          <span className="flex h-[26px] w-[26px] items-center justify-center rounded-[8px] bg-[#eaf1ff] text-[12px] text-[#2f6ff0]">✉</span>
          <div className="mt-2 font-inter text-[11.5px] font-semibold text-[#111827]">Envoyer par e-mail</div>
          <div className="mt-0.5 font-inter text-[10px] leading-[1.35] text-[#8b909b]">Ouvre un brouillon avec le fichier en pièce jointe.</div>
        </button>
      </div>

      <p className="mt-3 font-inter text-[10px] text-[#a0a4ad]">
        L'envoi à un membre nécessite un fichier enregistré dans un projet.
      </p>

      <button
        type="button"
        onClick={onClose}
        className="ml-auto mt-4 block rounded-full bg-[#2f6ff0] px-5 py-2 font-inter text-[12px] font-semibold text-white transition-colors hover:bg-[#245bd0]"
      >
        Terminé
      </button>
    </div>
  );
}
