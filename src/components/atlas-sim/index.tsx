/**
 * Atlas simulation — root assembly.
 *
 * A faithful, fully client-side simulation of the Ora software (Atlas module)
 * for the landing page, per docs/atlas-site-simulation-brief.md (Ora_V2).
 * Fixed 1020x660 window meant to be wrapped in <ScaleToFit> by the caller.
 */
import { SimProvider, useSim } from "./store";
import { SIM_KEYFRAMES } from "./ui";
import { Toast } from "./ui";
import Shell from "./Shell";
import Home from "./Home";
import ProjectView from "./ProjectView";
import Wizard from "./Wizard";
import AddFileModal from "./AddFile";
import Inspector from "./Inspector";
import AutomationPanel from "./Automation";
import Tour from "./Tour";
import IntroHint from "./IntroHint";

function SimApp() {
  const { state } = useSim();
  const screen = state.screen;
  const project =
    screen.view === "project" ? state.projects.find((p) => p.id === screen.projectId) : undefined;

  return (
    <div
      data-sim-root
      className="relative overflow-hidden rounded-2xl border border-[#e5e7eb] bg-[#fcfbf7] text-left font-inter antialiased"
      style={{ width: 1020, height: 660 }}
    >
      <style>{SIM_KEYFRAMES}</style>

      <Shell title={project ? project.name : "Votre Atlas"}>
        {screen.view === "project" && project ? (
          <ProjectView projectId={project.id} />
        ) : (
          <Home />
        )}
        {/* Panels anchored to the main area so the sidebar stays visible */}
        <Inspector />
        <AutomationPanel />
      </Shell>

      {/* Window-level overlays */}
      <Wizard />
      <AddFileModal />
      {state.toast && <Toast>{state.toast}</Toast>}

      {/* "Interactive zone" intro cue, then the guided tour spotlight */}
      <IntroHint />
      <Tour />
    </div>
  );
}

export default function AtlasSimulation() {
  return (
    <SimProvider>
      <SimApp />
    </SimProvider>
  );
}
