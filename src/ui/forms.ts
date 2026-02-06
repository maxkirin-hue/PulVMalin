import { nozzleFamilies } from "../data/nozzles";
import { state } from "../state/state";
import { $ } from "../utils/dom";
import { showPage } from "./navigation";
import { computeAll } from "../core/optimizer";

/* =========================================================
   REMPLISSAGE SELECT FAMILLE DE BUSES (AU CHARGEMENT)
========================================================= */

export function populateFamilySelect() {
  const sel = $("#familySelect") as HTMLSelectElement | null;
  if (!sel) return;

  sel.innerHTML = "";

  const entries = Object.entries(nozzleFamilies).filter(
    ([_, fam]: any) =>
      !fam.machines || fam.machines.includes(state.machineType)
  );

  entries.forEach(([key, fam]: any) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = fam.label ?? key;
    sel.appendChild(opt);
  });

  if (entries.length) {
    state.familyKey = entries[0][0];
    sel.value = state.familyKey;
  }

  sel.addEventListener("change", () => {
    state.familyKey = sel.value;
  });
}

populateFamilySelect();

/* =========================================================
   TABLEAU RÉSULTATS
========================================================= */

function renderResultsTable() {
  const tbody = document.getElementById("resultBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  state.results.forEach((r, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.outputName}</td>
      <td>${r.coef}</td>
      <td>${r.qTarget.toFixed(2)}</td>
      <td>${r.nozzleLabel}</td>
      <td>${r.qReal.toFixed(2)}</td>
      <td>${r.pressure.toFixed(1)}</td>
      <td>${r.status}</td>
    `;
    tbody.appendChild(tr);
  });
}

/* =========================================================
   NAVIGATION PAGE 2 → PAGE 3
========================================================= */

const btnToPage3 = $("#toPage3");
if (btnToPage3) {
  btnToPage3.addEventListener("click", () => {
    state.dose = Number(($("#dose") as HTMLInputElement).value);
    state.interligne = Number(($("#largeur") as HTMLInputElement).value);
    state.speed = Number(($("#vitesse") as HTMLInputElement).value);

    if (!state.dose || !state.interligne || !state.speed) {
      alert("Merci de remplir tous les champs (dose, largeur, vitesse).");
      return;
    }

    if (!state.familyKey) {
      alert("Choisis une famille de buses.");
      return;
    }

    showPage(3);
  });
}

/* =========================================================
   NAVIGATION PAGE 3 → PAGE 4
========================================================= */

const btnToPage4 = $("#toPage4");
if (btnToPage4) {
  btnToPage4.addEventListener("click", () => {
    computeAll();

    console.log("RESULTS:", state.results);

    renderResultsTable();
    showPage(4);
  });
}

/* =========================================================
   BOUTONS RETOUR
========================================================= */

const backToPage2 = $("#backToPage2");
if (backToPage2) {
  backToPage2.addEventListener("click", () => showPage(2));
}

const backToPage3 = $("#backToPage3");
if (backToPage3) {
  backToPage3.addEventListener("click", () => showPage(3));
}
