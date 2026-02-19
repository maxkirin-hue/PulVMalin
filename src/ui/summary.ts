/* =========================================================
   SUMMARY + RESULTS TABLE — Page Résultats
========================================================= */

import { state } from "../state/state";

/**
 * Met à jour le résumé (haut de page) et déclenche le rendu
 */
export function fillSummary() {
  const set = (id: string, value: any) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? "—";
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

  set(
    "sumQtotal",
    state.qTotal != null ? state.qTotal.toFixed(2) : "—"
  );

  set(
    "sumPressure",
    state.recommendedPressure != null
      ? state.recommendedPressure.toFixed(2)
      : "—"
  );

  renderComparisonTable();

  const counter = document.getElementById("settingsCounter");
  if (counter && state.calculations) {
    counter.textContent = `Réglage ${state.calculations.length} / 4`;
  }
}

/**
 * Tableau comparatif des réglages
 * (tableau principal, même avec un seul réglage)
 */
function renderComparisonTable() {
  const container = document.getElementById("comparisonTable");
  if (!container) return;

  const calcs = state.calculations;
  if (!calcs || calcs.length === 0) {
    container.innerHTML = "";
    return;
  }

  const outputs = calcs[0].results;
  if (!outputs || outputs.length === 0) {
    container.innerHTML = "";
    return;
  }

  let html = `
    <h2>Comparaison des réglages</h2>
    <table class="comparison">
      <thead>
        <tr>
          <th>Sortie</th>
          <th>Pastille</th>`;

  calcs.forEach(c => {
    html += `
      <th>
        ${c.label}
        <div class="pressure">
          ${c.pressure != null ? c.pressure.toFixed(2) + " bar" : "—"}
        </div>
      </th>`;
  });

  html += `</tr></thead><tbody>`;

  outputs.forEach((r, i) => {
    html += `
      <tr>
        <td>${r.outputName ?? "—"}</td>
        <td>
  <span
    class="iso-badge"
    style="--iso-color:${r.nozzleColor || '#666'}"
  >
    ${r.nozzleLabel ?? "—"}
  </span>
</td>

    `;

    calcs.forEach(c => {
      const q = c.results[i]?.qReal;
      html += `
        <td class="num">
          ${q != null ? q.toFixed(2) : "—"}
        </td>`;
    });

    html += `</tr>`;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}
