/* =========================================================
   IMPORTS
========================================================= */
import { state } from "../state/state";
import { computeAll, recomputePressureOnly } from "../core/optimizer";
import { buildDocDefinition } from "../pdf/pdfmakeTemplate";
import { buildVitiLibreModel } from "../core/models";
import { renderResultsTable, fillSummary } from "./summary";

declare const pdfMake: any;

/* =========================================================
   PAGE SWITCHER
========================================================= */
export function showPage(n: number) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  document.getElementById(`page${n}`)?.classList.remove("hidden");
}

/* =========================================================
   FAMILLES & PASTILLES (MODE FORCÉ)
========================================================= */

export function populateFamilySelect() {
  const sel = document.getElementById("familySelect") as HTMLSelectElement;
  if (!sel) return;

  sel.innerHTML = "";

  const families = ["Albuz ATR", "Albuz TVI", "Teejet XR", "Lechler IDK"];

  families.forEach(f => {
    const opt = document.createElement("option");
    opt.value = f;
    opt.textContent = f;
    sel.appendChild(opt);
  });

  if (!state.familyKey) {
    state.familyKey = families[0];
  }

  sel.value = state.familyKey;
}

export function updateFamilyOptions() {
  const fam = state.familyKey;
  const forced1 = document.getElementById("forcedNozzle1") as HTMLSelectElement;
  const forced2 = document.getElementById("forcedNozzle2") as HTMLSelectElement;

  if (!fam || !forced1 || !forced2) return;

  const nozzlesByFamily: Record<string, string[]> = {
    "Albuz ATR": ["ATR 80", "ATR 100", "ATR 120"],
    "Albuz TVI": ["TVI 80", "TVI 100", "TVI 120"],
    "Teejet XR": ["XR 80", "XR 110", "XR 150"],
    "Lechler IDK": ["IDK 80", "IDK 110", "IDK 150"]
  };

  const list = nozzlesByFamily[fam] ?? [];

  forced1.innerHTML = "";
  forced2.innerHTML = "";

  list.forEach(n => {
    const opt1 = document.createElement("option");
    opt1.value = n;
    opt1.textContent = n;
    forced1.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = n;
    opt2.textContent = n;
    forced2.appendChild(opt2);
  });

  if (list.length > 0) {
    if (!state.forcedNozzle1) state.forcedNozzle1 = list[0];
    if (!state.forcedNozzle2) state.forcedNozzle2 = list[0];

    forced1.value = state.forcedNozzle1;
    forced2.value = state.forcedNozzle2;
  }
}

/* =========================================================
   VISIBILITÉ DU BLOC MODÈLE LIBRE
========================================================= */
function updatePage2Visibility() {
  const libreBlock = document.getElementById("vitiLibreBlock");

  if (state.machineType === "viti" && state.modelKey === "viti_libre") {
    libreBlock.style.display = "block";
  } else {
    libreBlock.style.display = "none";
  }
}

/* =========================================================
   CHANGEMENT DE MODÈLE VITI
========================================================= */
document.getElementById("vitiModel")?.addEventListener("change", () => {
  const modelSel = document.getElementById("vitiModel") as HTMLSelectElement;
  state.modelKey = modelSel.value;

  updatePage2Visibility();
});

/* =========================================================
   MODE FORCÉ / AUTOMATIQUE
========================================================= */
document.getElementById("forcedToggle")?.addEventListener("change", () => {
  const panel = document.getElementById("forcedPanel");
  const checked = (document.getElementById("forcedToggle") as HTMLInputElement).checked;

  panel.style.display = checked ? "block" : "none";
  state.forcedToggle = checked;
});

document.getElementById("familySelect")?.addEventListener("change", () => {
  const sel = document.getElementById("familySelect") as HTMLSelectElement;
  state.familyKey = sel.value;
  updateFamilyOptions();
});

/* =========================================================
   PAGE 1 → PAGE 2
   (machineType est déjà géré par machine.ts via les boutons)
========================================================= */
document.getElementById("toPage2")?.addEventListener("click", () => {
  // On ne touche pas à machineType ici, il est défini dans machine.ts
  updatePage2Visibility();
  populateFamilySelect();
  updateFamilyOptions();
  showPage(2);
});

/* =========================================================
   PAGE 2 → PAGE 3
========================================================= */
document.getElementById("toPage3")?.addEventListener("click", () => {
  state.dose = Number((document.getElementById("dose") as HTMLInputElement).value);
  state.interligne = Number((document.getElementById("largeur") as HTMLInputElement).value);
  state.speed = Number((document.getElementById("vitesse") as HTMLInputElement).value);
  state.machineName = (document.getElementById("machineName") as HTMLInputElement).value;

  const famSel = document.getElementById("familySelect") as HTMLSelectElement;
  if (famSel) state.familyKey = famSel.value;

  if (state.machineType === "viti") {
    const modelSel = document.getElementById("vitiModel") as HTMLSelectElement;
    state.modelKey = modelSel.value;

    if (state.modelKey === "viti_libre") {
      const canG = Number((document.getElementById("libreCanonsG") as HTMLInputElement).value);
      const canD = Number((document.getElementById("libreCanonsD") as HTMLInputElement).value);
      const retG = Number((document.getElementById("libreRetourG") as HTMLInputElement).value);
      const retD = Number((document.getElementById("libreRetourD") as HTMLInputElement).value);
      const mainG = Number((document.getElementById("libreMainsG") as HTMLInputElement).value);
      const mainD = Number((document.getElementById("libreMainsD") as HTMLInputElement).value);

      if (canG + canD + retG + retD + mainG + mainD === 0) {
        alert("Merci de définir au moins une sortie pour le modèle libre.");
        return;
      }

      state.outputs = buildVitiLibreModel({
        canonsG: canG,
        canonsD: canD,
        retourG: retG,
        retourD: retD,
        mainsG: mainG,
        mainsD: mainD,
      });
    }
  }

  if (state.machineType === "arbo") {
    const arboRangs = document.getElementById("arboRangs") as HTMLSelectElement;
    state.arboRangs = Number(arboRangs.value);
    state.modelKey = null;
  }

  if (state.machineType === "rampe") {
    const rampeCount = document.getElementById("rampeCount") as HTMLInputElement;
    state.rampeCount = Number(rampeCount.value);
    state.modelKey = null;
  }

  if (state.machineType === "tangentiel") {
    const tangCount = document.getElementById("tangentielCount") as HTMLInputElement;
    // si besoin : state.arboRangs ou autre
    state.modelKey = null;
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
  state.forcedToggle = (document.getElementById("forcedToggle") as HTMLInputElement).checked;
  state.forcedNozzle1 = (document.getElementById("forcedNozzle1") as HTMLSelectElement).value;
  state.forcedNozzle2 = (document.getElementById("forcedNozzle2") as HTMLSelectElement).value;

  const userP = Number((document.getElementById("userPressure") as HTMLInputElement).value);
  state.userPressureTarget = userP || null;

  computeAll();
  renderResultsTable();
  fillSummary();
  showPage(4);
});

/* =========================================================
   RE-CALCUL PRESSION (PAGE 4)
========================================================= */
document.getElementById("btnRecalc")?.addEventListener("click", () => {
  const newI = Number((document.getElementById("newInterligne") as HTMLInputElement).value);
  const newDose = Number((document.getElementById("newDose") as HTMLInputElement).value);

  if (newI) state.interligne = newI;
  if (newDose) state.dose = newDose;

  recomputePressureOnly();
  fillSummary();
});

/* =========================================================
   EXPORT PDF
========================================================= */
function generatePdf(docDefinition: any) {
  pdfMake.createPdf(docDefinition).download(generatePdfFilename(state));
}

document.getElementById("btnPdf")?.addEventListener("click", async () => {
  document.getElementById("pdfLoader")!.style.display = "block";

  const doc = await buildDocDefinition(state);

  generatePdf(doc);

  document.getElementById("pdfLoader")!.style.display = "none";
});

/* =========================================================
   BOUTONS RETOUR
========================================================= */
document.querySelectorAll("[data-back]").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = Number((btn as HTMLElement).getAttribute("data-back"));
    showPage(target);
  });
});
