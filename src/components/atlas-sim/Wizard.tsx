/**
 * Atlas simulation — 3-step project creation wizard.
 *
 * Step 1: project type (auto-advance). Step 2: name + appearance (icon +
 * color). Step 3: visibility (+ team picker / manager access). Creating the
 * project delegates to the store, which navigates to the new project.
 */
import { useState } from "react";
import { Building2, Check, ChevronDown, Lock, Users } from "lucide-react";
import {
  colorOf,
  PROJECT_COLORS,
  PROJECT_ICONS,
  PROJECT_TYPES,
  VISIBILITIES,
  type ProjectColorId,
  type ProjectIconId,
  type ProjectType,
  type Visibility,
} from "./data";
import { PROJECT_ICON, ProjectTile } from "./icons";
import {
  BtnPrimary,
  BtnSoft,
  EASE,
  Eyebrow,
  Input,
  MenuItem,
  Modal,
  ModalClose,
  OptionCard,
  Popover,
} from "./ui";
import { useSim } from "./store";

const VISIBILITY_ICON: Record<Visibility, typeof Lock> = {
  private: Lock,
  team: Users,
  company: Building2,
};

const TEAMS = ["Audit Paris", "Transactions"];

export default function Wizard() {
  const { state } = useSim();
  if (!state.wizardOpen) return null;
  // Inner component mounts/unmounts with wizardOpen, so state resets each time.
  return <WizardDialog />;
}

function WizardDialog() {
  const { actions } = useSim();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [type, setType] = useState<ProjectType>(PROJECT_TYPES[0].id);
  const [icon, setIcon] = useState<ProjectIconId>(PROJECT_TYPES[0].icon);
  const [color, setColor] = useState<ProjectColorId>(PROJECT_TYPES[0].tint);
  const [visibility, setVisibility] = useState<Visibility>("private");
  const [team, setTeam] = useState<string | null>(null);
  const [teamMenuOpen, setTeamMenuOpen] = useState(false);
  const [managerAccess, setManagerAccess] = useState(false);

  const typeDef = PROJECT_TYPES.find((t) => t.id === type)!;

  const pickType = (t: (typeof PROJECT_TYPES)[number]) => {
    setType(t.id);
    setIcon(t.icon);
    setColor(t.tint);
    setStep(2);
  };

  const create = () =>
    actions.createProject({ name: name.trim(), type, icon, color, visibility });

  return (
    <Modal maxW={448} onClose={actions.closeWizard}>
      <ModalClose onClick={actions.closeWizard} />

      {/* Progress indicator */}
      <div className="flex items-center gap-1.5 pr-10">
        {[1, 2, 3].map((s) => (
          <span
            key={s}
            className={`h-1 rounded-full transition-all duration-200 ${
              s === step
                ? "w-7 bg-[#3b82f6]"
                : s < step
                  ? "w-4 bg-[#3b82f6]/50"
                  : "w-4 bg-[#e5e7eb]"
            }`}
          />
        ))}
        <span className="ml-2 text-[10.5px] font-medium font-inter text-[#9ca3af]">
          {step}/3
        </span>
      </div>

      {/* Step body, re-keyed so ora-step-in replays on each transition */}
      <div key={step} style={{ animation: `ora-step-in 240ms ${EASE}` }}>
        {step === 1 && (
          <>
            <StepHeading
              title="On crée quoi aujourd'hui ?"
              subtitle="Choisissez la nature du projet. Vous personnaliserez son icône et ses couleurs à l'étape suivante."
            />
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {PROJECT_TYPES.map((t) => {
                const Icon = PROJECT_ICON[t.icon];
                return (
                  <OptionCard
                    key={t.id}
                    icon={<Icon size={15} strokeWidth={2.2} />}
                    tintSolid={colorOf(t.tint).solid}
                    title={t.label}
                    hint={t.hint}
                    selected={t.id === type}
                    onClick={() => pickType(t)}
                  />
                );
              })}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <StepHeading
              title="Donnez-lui une identité"
              subtitle="Un nom clair et un style qui vous parle. Tout reste modifiable plus tard."
            />

            <Eyebrow className="mt-4">Nom du projet</Eyebrow>
            <div className="mt-1.5">
              <Input
                value={name}
                onChange={setName}
                placeholder="Acquisition NewCo, Audit 2026, …"
                onEnter={() => setStep(3)}
                autoFocus
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Eyebrow>Apparence</Eyebrow>
              <button
                type="button"
                onClick={() => {
                  setIcon(typeDef.icon);
                  setColor(typeDef.tint);
                }}
                className="text-[11.5px] font-medium font-inter text-[#3b82f6] transition-colors hover:text-[#2563eb]"
              >
                Réinitialiser
              </button>
            </div>

            {/* Live preview */}
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-[#eef0f5] bg-[#fcfbf7] p-3">
              <ProjectTile icon={icon} color={color} size={44} />
              <div className="text-[14px] font-semibold font-inter text-[#111827]">
                {name.trim() || "Nouveau projet"}
              </div>
            </div>

            {/* Icon picker */}
            <div className="mt-3 flex items-center gap-1.5">
              {PROJECT_ICONS.map((id) => {
                const Icon = PROJECT_ICON[id];
                const selected = id === icon;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setIcon(id)}
                    title={id}
                    className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors duration-150 ${
                      selected
                        ? "bg-[#eff6ff] text-[#3b82f6] ring-1 ring-[#3b82f6]"
                        : "text-[#6b7280] hover:bg-[#f5f8ff]"
                    }`}
                  >
                    <Icon size={15} strokeWidth={2.2} />
                  </button>
                );
              })}
            </div>

            {/* Color picker */}
            <div className="mt-3 flex items-center gap-2">
              {PROJECT_COLORS.map((c) => {
                const selected = c.id === color;
                return (
                  <button
                    key={c.id}
                    type="button"
                    title={c.label}
                    onClick={() => setColor(c.id)}
                    className="h-6 w-6 rounded-full transition-transform duration-150 hover:scale-110"
                    style={{
                      background: c.solid,
                      boxShadow: selected
                        ? `0 0 0 2px #ffffff, 0 0 0 4px ${c.solid}`
                        : undefined,
                    }}
                  />
                );
              })}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <StepHeading
              title="Qui peut y accéder ?"
              subtitle="Définissez la visibilité du projet. Cela reste modifiable à tout moment."
            />
            <div className="mt-4 flex flex-col gap-2">
              {VISIBILITIES.map((v) => {
                const Icon = VISIBILITY_ICON[v.id];
                return (
                  <OptionCard
                    key={v.id}
                    icon={<Icon size={15} strokeWidth={2.2} />}
                    title={v.label}
                    hint={v.hint}
                    selected={v.id === visibility}
                    onClick={() => setVisibility(v.id)}
                  />
                );
              })}
            </div>

            {visibility === "team" && (
              <div
                className="relative mt-3"
                style={{ animation: `ora-accordion-expand 180ms ${EASE}` }}
              >
                <Eyebrow>Équipe propriétaire</Eyebrow>
                <button
                  type="button"
                  onClick={() => setTeamMenuOpen((o) => !o)}
                  className="mt-1.5 flex h-10 w-full items-center justify-between rounded-xl border border-[#e5e7eb] bg-white px-3.5 text-[12.5px] font-medium font-inter transition-colors hover:bg-[#f5f8ff]"
                >
                  <span className={team ? "text-[#111827]" : "text-[#9ca3af]"}>
                    {team ?? "Sélectionnez une équipe"}
                  </span>
                  <ChevronDown size={13} strokeWidth={2.4} className="text-[#9ca3af]" />
                </button>
                {teamMenuOpen && (
                  <Popover
                    onClose={() => setTeamMenuOpen(false)}
                    className="left-0 top-full mt-1.5"
                    width={240}
                  >
                    {TEAMS.map((t) => (
                      <MenuItem
                        key={t}
                        active={t === team}
                        onClick={() => {
                          setTeam(t);
                          setTeamMenuOpen(false);
                        }}
                      >
                        {t}
                      </MenuItem>
                    ))}
                  </Popover>
                )}
              </div>
            )}

            {visibility === "private" && (
              <div
                className="mt-3"
                style={{ animation: `ora-accordion-expand 180ms ${EASE}` }}
              >
                <button
                  type="button"
                  onClick={() => setManagerAccess((v) => !v)}
                  className="flex w-full items-start gap-2.5 rounded-xl px-1 py-1 text-left"
                >
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors duration-150 ${
                      managerAccess
                        ? "border-[#3b82f6] bg-[#3b82f6] text-white"
                        : "border-[#d1d5db] bg-white"
                    }`}
                  >
                    {managerAccess && <Check size={11} strokeWidth={3} />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[12.5px] font-semibold font-inter text-[#111827]">
                      Donner accès aux managers
                    </span>
                    <span className="mt-0.5 block text-[11.5px] font-inter leading-snug text-[#6b7280]">
                      Vos managers pourront voir ce projet privé (utile pour la
                      continuité en cas d'absence).
                    </span>
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer (steps 2 and 3 only; step 1 advances via cards) */}
      {step >= 2 && (
        <div className="mt-5 flex items-center justify-between">
          <BtnSoft onClick={() => setStep(step - 1)}>Retour</BtnSoft>
          {step === 2 ? (
            <BtnPrimary onClick={() => setStep(3)}>Continuer</BtnPrimary>
          ) : (
            <BtnPrimary onClick={create}>Créer le projet</BtnPrimary>
          )}
        </div>
      )}
    </Modal>
  );
}

function StepHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mt-3.5">
      <h3 className="font-poppins text-[17px] font-semibold tracking-[-0.02em] text-[#111827]">
        {title}
      </h3>
      <p className="mt-1 text-[12.5px] font-inter leading-snug text-[#6b7280]">{subtitle}</p>
    </div>
  );
}
