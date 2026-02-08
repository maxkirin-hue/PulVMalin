/* ============================================================
   UPDATE RESULTS — Page Résultats
============================================================ */

import { state } from "../state/state";
import { computeAll } from "../core/optimizer";

export function updateResults() {
  // 1) Calcul complet
  computeAll();

  // 2) Helper
  const set = (id: string, value: any) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? "";
  };

  // 3) Résumé haut de page
  set("sumMachine", state.machineName || "—");
  set("sumName", state.userName || "—");

  set("sumFamily", state.familyKey || "—");
  set("sumModel", state.modelKey || "—");

  set("sumMode", state.forcedToggle ? "Mode forcé" : "Automatique");

  set("sumLargeur", state.largeur ?? "—");
  set("sumDose", state.dose ?? "—");
  set("sumVitesse", state.vitesse ?? "—");

set("sumQtotal", (state.qTotal ?? 0).toFixed(2));
set("sumPressure", (state.recommendedPressure ?? 0).toFixed(2));


  // 4) Tableau simplifié (3 colonnes)
  fillResultsTable();
}

function fillResultsTable() {
  const body = document.getElementById("resultBody");
  if (!body) return;

  body.innerHTML = "";

  state.results.forEach(r => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${r.outputName}</td>
      <td class="num">${r.qTarget.toFixed(2)}</td>
      <td>${r.nozzleLabel}</td>
    `;

    body.appendChild(tr);
  });
}
