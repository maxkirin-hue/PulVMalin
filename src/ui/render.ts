import { state } from "../state/state";
import { nozzleFamilies } from "../data/nozzles";
import { $ } from "../utils/dom";

/* ---------- STATUT CSS ---------- */

export function statusClass(status: string): string {
  const v = (status || "").toLowerCase();
  if (v.includes("ok")) return "status-ok";
  if (v.includes("limite")) return "status-limit";
  if (v.includes("chang")) return "status-bad";
  return "";
}

/* ---------- RÉSUMÉ ---------- */

export function renderSummary(modelLabel: string) {
  $("#sumMachine")!.textContent =
    state.machineType === "arbo"
      ? "Arbo (2 rangs)"
      : state.machineType === "viti"
      ? "Viti"
      : state.machineType === "rampe"
      ? "Rampe désherbage"
      : "—";

  $("#sumName")!.textContent = state.machineName || "—";
  $("#sumFamily")!.textContent =
    nozzleFamilies[state.familyKey!]?.label || "—";
  $("#sumModel")!.textContent = modelLabel || "—";
  $("#sumMode")!.textContent = state.forcedToggle
    ? "Pastilles forcées (validation)"
    : "Automatique (recommandé)";

  $("#sumLargeur")!.textContent = `${state.largeur} m`;
  $("#sumDose")!.textContent = `${state.dose} L/ha`;
  $("#sumVitesse")!.textContent = `${state.vitesse} km/h`;

  $("#sumQtotal")!.textContent = state.qTotal.toFixed(2);
  $("#sumPressure")!.textContent =
    state.recommendedPressure.toFixed(2) + " bar";
}

/* ---------- TABLEAU RÉSULTATS ---------- */

export function renderTables() {
  const body = $("#resultBody")!;
  body.innerHTML = "";

  state.results.forEach(r => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${r.outputName}</td>
      <td class="num">${r.coef.toFixed(2)}</td>
      <td class="num">${r.qTarget.toFixed(2)}</td>
      <td>${r.nozzleLabel}</td>
      <td class="num">${r.pressure.toFixed(2)}</td>
      <td class="${statusClass(r.status)}">${r.status}</td>
    `;

    body.appendChild(tr);
  });
}
