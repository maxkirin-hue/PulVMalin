import { state } from "../state/state";
import { showPage } from "./navigation";
import { populateFamilySelect, updateFamilyOptions } from "./forms";

/* =========================================================
   INITIALISATION DES BOUTONS MACHINE
========================================================= */

export function initMachineButtons() {
  const buttons = document.querySelectorAll("[data-type]");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const type = (btn as HTMLElement).dataset.type;
      if (!type) return;

      state.machineType = type as any;

      state.modelKey = null;
      state.familyKey = null;
      state.results = [];

      hideAllMachineBlocks();

      if (type === "arbo") document.getElementById("arboBlock")!.style.display = "block";
      if (type === "viti") document.getElementById("vitiBlock")!.style.display = "block";
      if (type === "rampe") document.getElementById("rampeBlock")!.style.display = "block";
      if (type === "tangentiel") document.getElementById("tangentielBlock")!.style.display = "block";

      populateFamilySelect();
      updateFamilyOptions();

      showPage(2);
    });
  });

  const toPage2 = document.getElementById("toPage2");
  if (toPage2) {
    toPage2.addEventListener("click", () => {
      state.machineName = (document.getElementById("machineName") as HTMLInputElement)
        .value
        .trim();

      if (!state.machineType) {
        alert("Choisis un type de machine.");
        return;
      }

      populateFamilySelect();
      updateFamilyOptions();
      showPage(2);
    });
  }
}

/* =========================================================
   MASQUER TOUS LES BLOCS MACHINE
========================================================= */

function hideAllMachineBlocks() {
  document.getElementById("arboBlock")!.style.display = "none";
  document.getElementById("vitiBlock")!.style.display = "none";
  document.getElementById("rampeBlock")!.style.display = "none";
  document.getElementById("tangentielBlock")!.style.display = "none";
}
