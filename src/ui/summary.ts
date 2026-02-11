/* ============================================================
   SUMMARY + RESULTS TABLE — Page Résultats
============================================================ */

import { state } from "../state/state";
import { computeAll } from "../core/optimizer";

/* ============================================================
   Remplit le résumé + le tableau
============================================================ */
export function fillSummary() {
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

  set("sumLargeur", state.interligne ?? "—");
  set("sumDose", state.dose ?? "—");
  set("sumVitesse", state.speed ?? "—");

  set("sumQtotal", (state.qTotal ?? 0).toFixed(2));
  set("sumPressure", (state.recommendedPressure ?? 0).toFixed(2));

  // 4) Tableau
  renderResultsTable();
}

/* ============================================================
   Tableau des sorties
============================================================ */
export function renderResultsTable() {
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
