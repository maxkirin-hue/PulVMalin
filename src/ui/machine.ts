import { state } from "../state/state";
import { showPage } from "./navigation";

/* =========================================================
   OUTILS DOM
========================================================= */

const $ = (sel: string): HTMLElement => document.querySelector(sel)!;

/* =========================================================
   AFFICHAGE DES BLOCS SELON MACHINE
========================================================= */

function updateMachineBlocks(): void {
  const isArbo = state.machineType === "arbo";

  ($("#arboBlock") as HTMLElement).style.display = isArbo ? "block" : "none";
  ($("#arboModeBlock") as HTMLElement).style.display = isArbo ? "block" : "none";

  ($("#vitiBlock") as HTMLElement).style.display =
    state.machineType === "viti" ? "block" : "none";

  ($("#rampeBlock") as HTMLElement).style.display =
    state.machineType === "rampe" ? "block" : "none";
}

/* =========================================================
   INITIALISATION DES BOUTONS MACHINE
========================================================= */

export function initMachineButtons(): void {
  document
    .querySelectorAll<HTMLButtonElement>(".card-btn[data-type]")
    .forEach(btn => {
      btn.addEventListener("click", () => {
        state.machineType = btn.dataset.type as any;
        updateMachineBlocks();
      });
    });

  $("#toPage2").addEventListener("click", () => {
    state.machineName = ($("#machineName") as HTMLInputElement).value.trim();

    if (!state.machineType) {
      alert("Choisis un type de machine.");
      return;
    }

    showPage(2);
  });
}

