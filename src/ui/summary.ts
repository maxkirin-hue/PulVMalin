/* =========================================================
   SUMMARY + RESULTS TABLE — Page Résultats
========================================================= */

import { state } from "../state/state";

/**
 * Met à jour le résumé (haut de page) et appelle le rendu du tableau.
 * Exportée pour être utilisée par forms.ts
 */
export function fillSummary() {
  // 1) Calcul complet (s'assure que state est à jour)


  // 2) Helper pour écrire dans le DOM
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

  const largeur = state.interligne ?? state.largeur ?? "—";
  const vitesse = state.speed ?? state.vitesse ?? "—";

  set("sumLargeur", largeur);
  set("sumDose", state.dose ?? "—");
  set("sumVitesse", vitesse);

  set("sumQtotal", (state.qTotal ?? 0).toFixed(2));
  set("sumPressure", (state.recommendedPressure ?? 0).toFixed(2));

  // 4) Rendu du tableau des sorties
  renderResultsTable();
  // 5) Tableau comparatif si plusieurs réglages
renderComparisonTable();
}


/**
 * Rendu du tableau simplifié des résultats (3 colonnes).
 * Exportée pour être utilisée par forms.ts
 */
export function renderResultsTable() {
  const body = document.getElementById("resultBody");
  if (!body) return;

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
}
/**
 * Rendu du tableau comparatif multi-réglages (colonnes)
 */
function renderComparisonTable() {
  const container = document.getElementById("comparisonTable");
  if (!container) return;

  const calcs = state.calculations;
  if (!calcs || calcs.length < 2) {
    container.innerHTML = "";
    return;
  }

  const outputs = calcs[0].results;

  let html = `<table class="comparison">
    <thead>
      <tr>
        <th>Sortie</th>`;

  calcs.forEach(c => {
    html += `<th>${c.label}<br><small>${c.pressure.toFixed(2)} bar</small></th>`;
  });

  html += `</tr></thead><tbody>`;

  outputs.forEach((r, i) => {
    html += `<tr>
      <td>${r.outputName}</td>`;

    calcs.forEach(c => {
      const cr = c.results[i];
      html += `<td class="num">${cr.qReal.toFixed(2)}</td>`;
    });

    html += `</tr>`;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}
