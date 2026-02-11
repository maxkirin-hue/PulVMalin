/* =========================================================
   IMPORTS
========================================================= */
import { nozzleFamilies } from "../data/nozzles";
import { state } from "../state/state"; 
import { computeAll, recomputePressureOnly } from "../core/optimizer"; 
import { generatePdfHtml, generatePdfFilename} from "../pdf/pdfTemplate"; 
import { formatName, formatVitiModel } from "../utils/format";
import { buildDocDefinition } from "../pdf/pdfmakeTemplate"; 
import { buildVitiLibreModel } from "../core/models";
import { renderResultsTable } from "./summary";
import { fillSummary } from "./summary";

declare const pdfMake: any;

/* =========================================================
   PAGE SWITCHER
========================================================= */
export function showPage(n: number) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  document.getElementById(`page${n}`)?.classList.remove("hidden");
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
   PAGE 1 → PAGE 2
========================================================= */
document.getElementById("toPage2")?.addEventListener("click", () => {
  const machineSel = document.getElementById("machineType") as HTMLSelectElement;
  state.machineType = machineSel.value;

  updatePage2Visibility();
  showPage(2);
});

/* =========================================================
   PAGE 2 → PAGE 3
========================================================= */
document.getElementById("toPage3")?.addEventListener("click", () => {

  /* ----------- LECTURE DES CHAMPS COMMUNS ----------- */
  state.dose = Number((document.getElementById("dose") as HTMLInputElement).value);
  state.interligne = Number((document.getElementById("largeur") as HTMLInputElement).value);
  state.speed = Number((document.getElementById("vitesse") as HTMLInputElement).value);
  state.machineName = (document.getElementById("machineName") as HTMLInputElement).value;

  /* ----------- VITI ----------- */
  if (state.machineType === "viti") {
    const modelSel = document.getElementById("vitiModel") as HTMLSelectElement;
    state.modelKey = modelSel.value;

    /* ----- MODÈLE LIBRE ----- */
    if (state.modelKey === "viti_libre") {

      const canG = Number((document.getElementById("libreCanonsG") as HTMLInputElement).value);
      const canD = Number((document.getElementById("libreCanonsD") as HTMLInputElement).value);
      const retG = Number((document.getElementById("libreRetourG") as HTMLInputElement).value);
      const retD = Number((document.getElementById("libreRetourD") as HTMLInputElement).value);
      const mainG = Number((document.getElementById("libreMainsG") as HTMLInputElement).value);
      const mainD = Number((document.getElementById("libreMainsD") as HTMLInputElement).value);

      // Validation : au moins une sortie
      if (canG + canD + retG + retD + mainG + mainD === 0) {
        alert("Merci de définir au moins une sortie pour le modèle libre.");
        return;
      }

      // Génération des sorties
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

  /* ----------- ARBO ----------- */
  if (state.machineType === "arbo") {
    const arboCount = document.getElementById("arboCount") as HTMLInputElement;
    const arboRangs = document.getElementById("arboRangs") as HTMLSelectElement;

  
    state.arboRangs = Number(arboRangs.value);
    state.modelKey = null;
  }

  /* ----------- RAMPE ----------- */
  if (state.machineType === "rampe") {
    const rampeCount = document.getElementById("rampeCount") as HTMLInputElement;
    state.rampeCount = Number(rampeCount.value);
    state.modelKey = null;
  }

  /* ----------- TANGENTIEL ----------- */
  if (state.machineType === "tangentiel") {
    const tangCount = document.getElementById("tangentielCount") as HTMLInputElement;
  
    state.modelKey = null;
  }

  /* ----------- VALIDATION GÉNÉRALE ----------- */
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

  // Forced mode
  state.forcedToggle = (document.getElementById("forcedToggle") as HTMLInputElement).checked;
  state.forcedNozzle1 = (document.getElementById("forcedNozzle1") as HTMLSelectElement).value;
  state.forcedNozzle2 = (document.getElementById("forcedNozzle2") as HTMLSelectElement).value;

  // Pression utilisateur
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

  // 🔥 recalcul pression uniquement (pastilles figées)
  recomputePressureOnly();

  // 🔥 on met à jour uniquement la pression affichée
  fillSummary();
});

/* =========================================================
   EXPORT PDF
========================================================= */
function generatePdf(docDefinition) {
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
