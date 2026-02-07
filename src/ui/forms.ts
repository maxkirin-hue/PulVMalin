import { nozzleFamilies } from "../data/nozzles";
import { state } from "../state/state";
import { showPage } from "./navigation";
import { computeAll, recomputePressureOnly } from "../core/optimizer";
/* =========================================================
   PAGE 1 → PAGE 2
========================================================= */

document.getElementById("toPage2")?.addEventListener("click", () => {
  const userName = (document.getElementById("userName") as HTMLInputElement).value.trim();
  const machineName = (document.getElementById("machineName") as HTMLInputElement).value.trim();
  const machineType = (document.getElementById("machineType") as HTMLSelectElement).value;

  if (!userName) {
    alert("Merci de saisir votre nom.");
    return;
  }

  if (!machineName) {
    alert("Merci de saisir le modèle de machine.");
    return;
  }

  if (!machineType) {
    alert("Merci de choisir un type de machine.");
    return;
  }

  state.userName = userName;
  state.machineName = machineName;
  state.machineType = machineType;

 showPage(2);
updatePage2Visibility();
populateFamilySelect(); ;
});
/* =========================================================
   AFFICHAGE CONDITIONNEL PAGE 2
========================================================= */

function updatePage2Visibility() {
  const viti = document.getElementById("vitiBlock") as HTMLElement;
  const arbo = document.getElementById("arboBlock") as HTMLElement;
  const tang = document.getElementById("tangentielBlock") as HTMLElement;
  const rampe = document.getElementById("rampeBlock") as HTMLElement;

  if (!viti || !arbo || !tang || !rampe) return;

  // Tout masquer
  viti.style.display = "none";
  arbo.style.display = "none";
  tang.style.display = "none";
  rampe.style.display = "none";

  // Afficher uniquement le bon bloc
  if (state.machineType === "viti") viti.style.display = "block";
  if (state.machineType === "arbo") arbo.style.display = "block";
  if (state.machineType === "tangentiel") tang.style.display = "block";
  if (state.machineType === "rampe") rampe.style.display = "block";
}
/* =========================================================
   FAMILLES
========================================================= */

export function populateFamilySelect() {
  const sel = document.getElementById("familySelect") as HTMLSelectElement;
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
    populateForcedNozzleSelect();
  });

  populateForcedNozzleSelect();
}

/* =========================================================
   PASTILLES
========================================================= */

function listNozzleVariants(family: any) {
  const variants: any[] = [];

  family.nozzles.forEach((n: any) => {
    if (n.faces) {
      n.faces.forEach((face: any) => {
        variants.push({
          value: `${n.code}|${face.side}`,
          label: `${n.code} — ${face.label}`,
          code: n.code,
          qRef: face.qRef,
          faceLabel: face.label,
        });
      });
    } else {
      variants.push({
        value: n.code,
        label: n.code,
        code: n.code,
        qRef: n.qRef,
        faceLabel: null,
      });
    }
  });

  return variants;
}

export function populateForcedNozzleSelect() {
  const sel1 = document.getElementById("forcedNozzle1") as HTMLSelectElement;
  const sel2 = document.getElementById("forcedNozzle2") as HTMLSelectElement;

  if (!sel1 || !sel2) return;

  sel1.innerHTML = "";
  sel2.innerHTML = "";

  const fam = nozzleFamilies[state.familyKey!];
  if (!fam) return;

  const variants = listNozzleVariants(fam);

  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = "Choisir…";

  sel1.appendChild(empty.cloneNode(true));
  sel2.appendChild(empty.cloneNode(true));

  variants.forEach(v => {
    const o1 = document.createElement("option");
    o1.value = v.value;
    o1.textContent = v.label;
    sel1.appendChild(o1);

    const o2 = document.createElement("option");
    o2.value = v.value;
    o2.textContent = v.label;
    sel2.appendChild(o2);
  });
}

/* =========================================================
   PAGE 2 → PAGE 3
========================================================= */
document.getElementById("toPage3")?.addEventListener("click", () => {
  state.dose = Number((document.getElementById("dose") as HTMLInputElement).value);
  state.interligne = Number((document.getElementById("largeur") as HTMLInputElement).value);
  state.speed = Number((document.getElementById("vitesse") as HTMLInputElement).value);
  state.machineName = (document.getElementById("machineName") as HTMLInputElement).value;

  if (state.machineType === "viti") {
    const modelSel = document.getElementById("vitiModel") as HTMLSelectElement;
    state.modelKey = modelSel.value;
  }

  if (state.machineType === "arbo") {
    const arboCount = document.getElementById("arboCount") as HTMLInputElement;
    state.arboCount = Number(arboCount.value);
    const arboRangs = document.getElementById("arboRangs") as HTMLSelectElement;
state.arboRangs = Number(arboRangs.value);
  }

  if (state.machineType === "rampe") {
    const rampeCount = document.getElementById("rampeCount") as HTMLInputElement;
    state.rampeCount = Number(rampeCount.value);
  }
if (state.machineType === "tangentiel") {
  const tangCount = document.getElementById("tangentielCount") as HTMLInputElement;
  state.arboCount = Number(tangCount.value); // même logique que arbo
}
  if (!state.dose || !state.interligne || !state.speed) {
    alert("Merci de remplir tous les champs.");
    return;
  }

  showPage(3);
});
/* =========================================================
   PAGE 3 → PAGE 4
========================================================= */

document.getElementById("toPage4")?.addEventListener("click", () => {
  computeAll();
  console.log("RESULTS:", state.results);
  renderResultsTable();
  fillSummary();
  showPage(4);
});

/* =========================================================
   TABLEAU DES RÉSULTATS
========================================================= */

function renderResultsTable() {
  const tbody = document.getElementById("resultBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  state.results.forEach((r, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.outputName}</td>
      <td>${r.qTarget.toFixed(2)}</td>
      <td>${r.nozzleLabel}</td>
      <td>${r.nozzleColor ?? ""}
    `;
    tbody.appendChild(tr);
  });
}

/* =========================================================
   RÉSUMÉ PAGE 4
========================================================= */
function formatVitiModel(key: string | null): string {
  if (!key) return "";
  const map: Record<string, string> = {
    "3r_sans": "3 rangs — sans retour",
    "3r_avec": "3 rangs — avec retour",
    "4r_sans": "4 rangs — sans retour",
    "4r_avec": "4 rangs — avec retour",
  };
  return map[key] ?? key;
}
function fillSummary() {
  (document.getElementById("sumMachine") as HTMLElement).textContent =
    state.machineType ?? "";

  (document.getElementById("sumName") as HTMLElement).textContent =
    state.userName ?? "";

  (document.getElementById("sumModel") as HTMLElement).textContent =
    state.machineType === "viti"
      ? formatVitiModel(state.modelKey)
      : state.machineName ?? "";

  (document.getElementById("sumFamily") as HTMLElement).textContent =
    state.familyKey ?? "";

  (document.getElementById("sumMode") as HTMLElement).textContent =
    state.familyKey ?? "";

  (document.getElementById("sumLargeur") as HTMLElement).textContent =
    state.interligne?.toString() ?? "";

  (document.getElementById("sumDose") as HTMLElement).textContent =
    state.dose?.toString() ?? "";

  (document.getElementById("sumVitesse") as HTMLElement).textContent =
    state.speed?.toString() ?? "";

  (document.getElementById("sumPressure") as HTMLElement).textContent =
    state.recommendedPressure?.toFixed(1) ?? "";

  (document.getElementById("sumQtotal") as HTMLElement).textContent =
    state.qTotal?.toFixed(2) ?? "";
}

/* =========================================================
   RE-CALCUL PRESSION (PAGE 4)
========================================================= */
document.getElementById("btnRecalc")?.addEventListener("click", () => {
  const newI = Number((document.getElementById("newInterligne") as HTMLInputElement).value);
  const newDose = Number((document.getElementById("newDose") as HTMLInputElement).value);

  if (newI) state.interligne = newI;
  if (newDose) state.dose = newDose;

  // 🔥 recalcul pression uniquement (pastilles figées)
  recomputePressureOnly();

  // 🔥 on met à jour uniquement la pression affichée
  fillSummary();
});