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

    // Colonne sortie
    const tdOut = document.createElement("td");
    tdOut.textContent = r.outputName;

    // Coef
    const tdCoef = document.createElement("td");
    tdCoef.className = "num";
    tdCoef.textContent = r.coef.toFixed(2);

    // Débit cible
    const tdTarget = document.createElement("td");
    tdTarget.className = "num";
    tdTarget.textContent = r.qTarget.toFixed(2);

    // Pastille / buse (avec couleur ISO)
    const tdNozzle = document.createElement("td");

    if (r.nozzleColor) {
      const badge = document.createElement("span");
      badge.className = "iso-badge";
      badge.textContent = r.nozzleLabel;
      badge.style.backgroundColor = r.nozzleColor;

      // lisibilité sur couleurs claires (jaune)
      badge.style.color =
        r.nozzleColor === "yellow" || r.nozzleColor === "#ffff00"
          ? "#000"
          : "#fff";

      tdNozzle.appendChild(badge);
    } else {
      tdNozzle.textContent = r.nozzleLabel;
    }

    // Pression
    const tdP = document.createElement("td");
    tdP.className = "num";
    tdP.textContent = r.pressure.toFixed(2);

    // Statut
    const tdStatus = document.createElement("td");
    tdStatus.className = statusClass(r.status);
    tdStatus.textContent = r.status;

    tr.appendChild(tdOut);
    tr.appendChild(tdCoef);
    tr.appendChild(tdTarget);
    tr.appendChild(tdNozzle);
    tr.appendChild(tdP);
    tr.appendChild(tdStatus);

    body.appendChild(tr);
  });
}

