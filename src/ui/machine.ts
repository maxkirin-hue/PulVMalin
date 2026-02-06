import { state } from "../state/state";
import { $ } from "../utils/dom";
import { showPage } from "./navigation";
import { populateFamilySelect } from "./forms";

/* =========================================================
   SÉLECTION TYPE DE MACHINE
========================================================= */

const machineButtons = document.querySelectorAll("[data-machine]");

machineButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const type = (btn as HTMLElement).dataset.machine;

    if (!type) return;

    // 1️⃣ Enregistre le type de machine
    state.machineType = type as any;

    // 2️⃣ Initialise les familles de buses compatibles
    populateFamilySelect();

    // 3️⃣ Navigation vers la page paramètres
    showPage(2);
  });
});

/* =========================================================
   RETOUR ACCUEIL
========================================================= */

const backToHome = $("#backToHome");
if (backToHome) {
  backToHome.addEventListener("click", () => {
    showPage(1);
  });
}
