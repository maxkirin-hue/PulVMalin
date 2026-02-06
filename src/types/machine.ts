import { state } from "../state/state";
import { $ } from "../utils/dom";
import { populateFamilySelect } from "./forms";
import { showPage } from "./navigation";

/* ---------- BLOCS MACHINE ---------- */

export function updateMachineBlocks() {
  const isArbo = state.machineType === "arbo";

  $("#arboBlock")!.style.display = isArbo ? "block" : "none";
  $("#arboModeBlock")!.style.display = isArbo ? "block" : "none";

  $("#vitiBlock")!.style.display =
    state.machineType === "viti" ? "block" : "none";

  $("#rampeBlock")!.style.display =
    state.machineType === "rampe" ? "block" : "none";
}

/* ---------- INIT BOUTONS MACHINE ---------- */

export function initMachineButtons() {
  document.querySelectorAll<HTMLButtonElement>(".card-btn[data-type]")
    .forEach(btn => {
      btn.addEventListener("click", () => {
        state.machineType = btn.dataset.type as
          | "arbo"
          | "viti"
          | "rampe";
        updateMachineBlocks();
      });
    });

  $("#toPage2")!.addEventListener("click", () => {
    state.machineName = ($("#machineName") as HTMLInputElement)
      .value
      .trim();

    if (!state.machineType) {
      alert("Choisis un type de machine.");
      return;
    }

    populateFamilySelect();
    showPage(2);
  });
}
