import { state } from "../state/state";
import { showPage } from "./navigation";
import { populateFamilySelect } from "./forms";
import { $ } from "../utils/dom";

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

  const btnToPage2 = $("#toPage2");
  if (btnToPage2) {
    btnToPage2.addEventListener("click", () => {
      state.machineName = ($("#machineName") as HTMLInputElement).value.trim();

      if (!state.machineType) {
        alert("Choisis un type de machine.");
        return;
      }

      populateFamilySelect();
      showPage(2);
    });
  }
}
