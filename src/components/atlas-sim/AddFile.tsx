/**
 * Atlas simulation — « Importer un fichier / dossier » modal (2 steps).
 *
 * Step 1: pick file vs folder, fake path browser, document name.
 * Step 2: optional facet classification, then adds the doc to the current
 * project via the store.
 */
import { useState } from "react";
import { FileSpreadsheet, FolderInput } from "lucide-react";
import { FACETS } from "./data";
import { useSim } from "./store";
import { BtnPrimary, BtnSoft, EASE, Eyebrow, Input, Modal, OptionCard } from "./ui";

type Mode = "file" | "folder";

export default function AddFileModal() {
  const { state, actions } = useSim();
  const [step, setStep] = useState<1 | 2>(1);
  const [mode, setMode] = useState<Mode>("file");
  const [path, setPath] = useState("");
  const [name, setName] = useState("");
  const [facetSel, setFacetSel] = useState<Record<string, string[]>>({});

  if (!state.addFileOpen) return null;

  const reset = () => {
    setStep(1);
    setMode("file");
    setPath("");
    setName("");
    setFacetSel({});
  };

  const close = () => {
    actions.closeAddFile();
    reset();
  };

  const browse = () => {
    setPath("~/Documents/Mission Alpha/Grand livre T1.xlsx");
    setName("Grand livre T1");
  };

  const toggleFacet = (facetId: string, valueId: string) =>
    setFacetSel((sel) => {
      const cur = sel[facetId] ?? [];
      return {
        ...sel,
        [facetId]: cur.includes(valueId) ? cur.filter((v) => v !== valueId) : [...cur, valueId],
      };
    });

  const confirm = () => {
    const finalName = name.trim();
    const projectId = state.screen.view === "project" ? state.screen.projectId : "p-alpha";
    actions.addDoc({
      projectId,
      name: finalName,
      format: "xlsx",
      sizeLabel: "1.8 Mo",
      updatedLabel: "à l'instant",
      status: "draft",
      approval: "none",
      assigneeIds: ["me"],
      facets: Object.fromEntries(Object.entries(facetSel).filter(([, v]) => v.length > 0)),
      gx: 550,
      gy: 430,
    });
    actions.closeAddFile();
    actions.showToast(`« ${finalName} » ajouté au projet`);
    reset();
  };

  return (
    <Modal maxW={448} onClose={close}>
      {step === 1 ? (
        <div key={1} style={{ animation: `ora-step-in 240ms ${EASE}` }}>
          <h3 className="font-poppins text-[17px] font-semibold text-[#111827]">
            Que voulez-vous importer ?
          </h3>
          <p className="mt-1 text-[12.5px] font-inter text-[#6b7280]">
            Un fichier ou un dossier entier. Vous le retrouverez dans votre Atlas.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <OptionCard
              icon={<FileSpreadsheet size={15} strokeWidth={2.2} />}
              title="Un fichier"
              hint="Excel, CSV, PDF…"
              selected={mode === "file"}
              onClick={() => setMode("file")}
            />
            <OptionCard
              icon={<FolderInput size={15} strokeWidth={2.2} />}
              title="Un dossier"
              hint="Import récursif"
              selected={mode === "folder"}
              onClick={() => setMode("folder")}
            />
          </div>

          <Eyebrow className="mt-4">CHEMIN DU FICHIER</Eyebrow>
          <div className="mt-1.5 flex items-center gap-2">
            <Input mono value={path} onChange={setPath} placeholder="~/Documents/…" className="flex-1" />
            <BtnSoft onClick={browse}>Parcourir</BtnSoft>
          </div>

          <Eyebrow className="mt-3.5">NOM DU DOCUMENT</Eyebrow>
          <div className="mt-1.5">
            <Input value={name} onChange={setName} />
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <BtnSoft onClick={close}>Annuler</BtnSoft>
            <BtnPrimary disabled={!name.trim()} onClick={() => setStep(2)}>
              Continuer
            </BtnPrimary>
          </div>
        </div>
      ) : (
        <div key={2} style={{ animation: `ora-step-in 240ms ${EASE}` }}>
          <h3 className="font-poppins text-[17px] font-semibold text-[#111827]">
            Classez votre import
          </h3>
          <p className="mt-1 text-[12.5px] font-inter text-[#6b7280]">
            Ajoutez des catégories pour le retrouver facilement. C'est optionnel.
          </p>

          <div className="mt-4 space-y-3.5">
            {FACETS.map((facet) => (
              <div key={facet.id}>
                <div className="text-[11px] font-medium font-inter text-[#6b7280]">{facet.label}</div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {facet.values.map((v) => {
                    const selected = (facetSel[facet.id] ?? []).includes(v.id);
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => toggleFacet(facet.id, v.id)}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium font-inter transition-colors duration-150 ${
                          selected ? "" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                        style={selected ? { background: `${v.color}1a`, color: v.color } : undefined}
                      >
                        {v.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <BtnSoft onClick={() => setStep(1)}>Retour</BtnSoft>
            <BtnPrimary onClick={confirm}>
              {mode === "folder" ? "Importer le dossier" : "Ajouter le fichier"}
            </BtnPrimary>
          </div>
        </div>
      )}
    </Modal>
  );
}
