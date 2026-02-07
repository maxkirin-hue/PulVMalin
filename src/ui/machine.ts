import { state } from "../state/state";
import { showPage } from "./navigation";
import { populateFamilySelect } from "./forms";

export function initMachineButtons() {
  const buttons = document.querySelectorAll("[data-type]");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const type = (btn as HTMLElement).dataset.type;
      if (!type) return;

      state.machineType = type as any;

      // 1️⃣ Masquer tous les blocs
      hideAllMachineBlocks();

      // 2️⃣ Afficher le bon bloc
      if (type === "arbo") {
        document.getElementById("arboBlock")!.style.display = "block";
      }
      if (type === "viti") {
        document.getElementById("vitiBlock")!.style.display = "block";
      }
      if (type === "rampe") {
        document.getElementById("rampeBlock")!.style.display = "block";
      }

      // 3️⃣ Charger les familles compatibles
      populateFamilySelect();

      // 4️⃣ Aller à la page 2
      showPage(2);
    });
  });
}

function hideAllMachineBlocks() {
  document.getElementById("arboBlock")!.style.display = "none";
  document.getElementById("vitiBlock")!.style.display = "none";
  document.getElementById("rampeBlock")!.style.display = "none";
}
