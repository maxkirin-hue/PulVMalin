import { nozzleFamilies } from "../data/nozzles";
import { state } from "../state/state";
import { $ } from "../utils/dom";
import { showPage } from "./navigation";
import { computeAll } from "../core/optimizer";


/* =========================================================
   REMPLISSAGE DU SELECT FAMILLE DE BUSES
========================================================= */

const familySelect = document.getElementById("familySelect") as HTMLSelectElement | null;

if (familySelect) {
  familySelect.innerHTML = "";

  Object.entries(nozzleFamilies).forEach(([key, fam]: any) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = fam.label ?? key;
    familySelect.appendChild(opt);
  });
}


/* =========================================================
   VARIANTES DE BUSES
========================================================= */

export function listNozzleVariants(family: any) {
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

/* =========================================================
   FAMILLES DE BUSES
========================================================= */

export function populateFamilySelect() {
  const sel = $("#familySelect") as HTMLSelectElement;
  sel.innerHTML = "";

  const entries = Object.entries(nozzleFamilies).filter(
    ([_, f]: any) =>
      !f.machines || f.machines.includes(state.machineType)
  );

  entries.forEach(([key, fam]: any) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = fam.label;
    sel.appendChild(opt);
  });

  if (entries.length) state.familyKey = entries[0][0];

  sel.addEventListener("change", () => {
    state.familyKey = sel.value;
    populateForcedNozzleSelect();
  });

  populateForcedNozzleSelect();
}

/* =========================================================
   PASTILLES FORCÉES
========================================================= */

export function populateForcedNozzleSelect() {
  const sel1 = $("#forcedNozzle1") as HTMLSelectElement;
  const sel2 = $("#forcedNozzle2") as HTMLSelectElement;

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
   NAVIGATION PAGE 2 → PAGE 3
========================================================= */
const btnToPage3 = $("#toPage3");
if (btnToPage3) {
  btnToPage3.addEventListener("click", () => {
    state.dose = Number(($("#dose") as HTMLInputElement).value);
    state.interligne = Number(($("#largeur") as HTMLInputElement).value);
    state.speed = Number(($("#vitesse") as HTMLInputElement).value);

    const familySelect = document.getElementById("familySelect") as HTMLSelectElement;
    state.familyKey = familySelect.value;

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

    // 1️⃣ Calcul
    computeAll();

    // DEBUG
    console.log("RESULTS:", state.results);

    // 2️⃣ Affichage tableau
  function renderResultsTable() {
  const tbody = document.getElementById("resultBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  state.results.forEach((r, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${r.coef}</td>
      <td>${r.q.toFixed(2)}</td>
      <td>${r.nozzle}</td>
      <td>${r.pressure.toFixed(1)}</td>
      <td>${r.status}</td>
    `;
    tbody.appendChild(tr);
  });
}


    // 3️⃣ Navigation
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
