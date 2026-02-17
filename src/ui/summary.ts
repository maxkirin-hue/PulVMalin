/* =========================================================
   SUMMARY + RESULTS TABLE — Page Résultats
========================================================= */

import { state } from "../state/state";

/**
 * Met à jour le résumé (haut de page) et déclenche les rendus
 */
export function fillSummary() {
  const set = (id: string, value: any) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? "";
  };

  // Résumé machine
  set("sumMachine", state.machineName || "—");
  set("sumName", state.userName || "—");
  set("sumFamily", state.familyKey || "—");
  set("sumModel", state.modelKey || "—");
  set("sumMode", state.forcedToggle ? "Mode forcé" : "Automatique");

  const largeur = state.interligne ?? state.largeur ?? "—";
  const vitesse = state.speed ?? state.vitesse ?? "—";

  set("sumLargeur", largeur);
  set("sumDose", state.dose ?? "—");
  set("sumVitesse", vitesse);
  set("sumQtotal", (state.qTotal ?? 0).toFixed(2));
  set("sumPressure", (state.recommendedPressure ?? 0).toFixed(2));

  // Rendus
  renderResultsTable();
  renderComparisonTable();
}

/**
 * Tableau simple (3 colonnes)
 * Visible uniquement s’il n’y a qu’un seul réglage
 */
export function renderResultsTable() {
  const body = document.getElementById("resultBody");
  const wrapper = document.querySelector(".table-wrapper") as HTMLElement;

  if (!body || !wrapper) return;

  body.innerHTML = "";

  (state.results || []).forEach((r: any) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.outputName ?? "—"}</td>
      <td class="num">${typeof r.qTarget === "number" ? r.qTarget.toFixed(2) : "—"}</td>
      <td>${r.nozzleLabel ?? "—"}</td>
    `;
    body.appendChild(tr);
  });

  // Affiché par défaut (sera masqué si comparatif)
  wrapper.style.display = "";
}

/**
 * Tableau comparatif multi‑réglages
 * Remplace le tableau simple dès qu’il y a ≥ 2 réglages
 */
function renderComparisonTable() {
  const container = document.getElementById("comparisonTable");
  const simpleTable = document.querySelector(".table-wrapper") as HTMLElement;

  if (!container || !simpleTable) return;

  const calcs = state.calculations;

  // Pas de comparatif → tableau simple
  if (!calcs || calcs.length < 2) {
    container.innerHTML = "";
    simpleTable.style.display = "";
    return;
  }

  // Comparatif actif → on masque le tableau simple
  simpleTable.style.display = "none";

  const outputs = calcs[0].results;

  let html = `
    <h2>Comparaison des réglages</h2>
    <table class="comparison">
      <thead>
        <tr>
          <th>Sortie</th>`;

  calcs.forEach(c => {
    html += `
      <th>
        ${c.label}
        <div class="pressure">${c.pressure.toFixed(2)} bar</div>
      </th>`;
  });

  html += `</tr></thead><tbody>`;

  outputs.forEach((r, i) => {
    html += `<tr><td>${r.outputName}</td>`;
    calcs.forEach(c => {
      html += `<td class="num">${c.results[i].qReal.toFixed(2)}</td>`;
    });
    html += `</tr>`;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}
