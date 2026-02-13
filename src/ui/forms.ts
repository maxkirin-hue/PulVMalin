/* =========================================================
   FORMS UI — familles, pastilles, modèles, navigation
========================================================= */

import { nozzleFamilies } from "../data/nozzles";
import { state } from "../state/state";
import { computeAll, recomputePressureOnly } from "../core/optimizer";
import { getOutputsAndCoefs, buildVitiLibreModel, vitiModels } from "../core/models";
import { renderResultsTable, fillSummary } from "./summary";
import { buildDocDefinition, generatePdfFilename } from "../pdf/pdfmakeTemplate";
import { showPage } from "./navigation";

declare const pdfMake: any;

/* Helpers PDF fallback */
function defaultGeneratePdfFilename(): string {
  const name = (state.machineName || "PulvMalin").replace(/\s+/g, "_");
  const date = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  return `${name}_${date}.pdf`;
}

/* =========================================================
   FAMILLES & PASTILLES
========================================================= */

export function populateFamilySelect() {
  const sel = document.getElementById("familySelect") as HTMLSelectElement;
  if (!sel) return;

  sel.innerHTML = "";

  const families = Object.keys(nozzleFamilies);
  if (families.length === 0) {
    sel.appendChild(new Option("—", ""));
    return;
  }

  families.forEach(f => {
    const opt = document.createElement("option");
    opt.value = f;
    opt.textContent = `${f} — ${nozzleFamilies[f].label}`;
    sel.appendChild(opt);
  });

  if (!state.familyKey) state.familyKey = families[0];
  sel.value = state.familyKey;
}

export function updateFamilyOptions() {
  const forced1 = document.getElementById("forcedNozzle1") as HTMLSelectElement;
  const forced2 = document.getElementById("forcedNozzle2") as HTMLSelectElement;
  if (!forced1 || !forced2) return;

  const fam = nozzleFamilies[state.familyKey];
  const list = fam ? fam.nozzles.map(n => n.code) : [];

  forced1.innerHTML = "";
  forced2.innerHTML = "";

  list.forEach(n => {
    forced1.appendChild(new Option(n, n));
    forced2.appendChild(new Option(n, n));
  });

  if (list.length > 0) {
    if (!state.forcedNozzle1) state.forcedNozzle1 = list[0];
    if (!state.forcedNozzle2) state.forcedNozzle2 = list[0];
    forced1.value = state.forcedNozzle1;
    forced2.value = state.forcedNozzle2;
  }
}

/* =========================================================
   MODÈLES VITI
========================================================= */

export function updateModelOptions() {
  const sel = document.getElementById("vitiModel") as HTMLSelectElement;
  if (!sel) return;

  if (state.machineType !== "viti") {
    sel.innerHTML = "";
    return;
  }

  sel.innerHTML = `
    <option value="">Choisir…</option>
    <option value="3r_sans">3 rangs — sans retour (8 sorties)</option>
    <option value="3r_avec">3 rangs — avec retour (10 sorties)</option>
    <option value="4r_sans">4 rangs — sans retour (8 sorties)</option>
    <option value="4r_avec">4 rangs — avec retour (10 sorties)</option>
    <option value="viti_libre">Personalisé</option>
  `;
}

/* =========================================================
   VISIBILITÉ
========================================================= */

export function hideAllMachineBlocks() {
  const ids = ["arboBlock", "vitiBlock", "rampeBlock", "tangentielBlock"];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
}

function updatePage2Visibility() {
  const libreBlock = document.getElementById("vitiLibreBlock");
  if (!libreBlock) return;

  libreBlock.style.display =
    state.machineType === "viti" && state.modelKey === "viti_libre"
      ? "block"
      : "none";
}

/* =========================================================
   LISTENERS
========================================================= */

document.getElementById("vitiModel")?.addEventListener("change", () => {
  const modelSel = document.getElementById("vitiModel") as HTMLSelectElement;
  state.modelKey = modelSel.value;
  updatePage2Visibility();
});

document.getElementById("forcedToggle")?.addEventListener("change", () => {
  const panel = document.getElementById("forcedPanel");
  const checked = (document.getElementById("forcedToggle") as HTMLInputElement).checked;
  if (panel) panel.style.display = checked ? "block" : "none";
  state.forcedToggle = checked;
});

document.getElementById("familySelect")?.addEventListener("change", () => {
  const sel = document.getElementById("familySelect") as HTMLSelectElement;
  state.familyKey = sel.value;
  updateFamilyOptions();
});

/* =========================================================
   NAVIGATION
========================================================= */

document.getElementById("toPage2")?.addEventListener("click", () => {
  updatePage2Visibility();
  populateFamilySelect();
  updateFamilyOptions();
  updateModelOptions();
  showPage(2);
});

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

      // Injection du modèle libre dans la source de vérité
      vitiModels["viti_libre"] = buildVitiLibreModel({
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
    state.arboRangs = Number(arboRangs.value) === 2 ? 2 : 1;
   state.modelKey = null as any;
  }

  if (state.machineType === "rampe") {
    const rampeCount = document.getElementById("rampeCount") as HTMLInputElement;
    state.rampeCount = Number(rampeCount.value);
    state.modelKey = null as any;
  }

  if (state.machineType === "tangentiel") {
    state.modelKey = null as any;
  }

  if (!state.dose || !state.interligne || !state.speed) {
    alert("Merci de remplir tous les champs.");
    return;
  }

  showPage(3);
});

document.getElementById("toPage4")?.addEventListener("click", () => {
  state.forcedToggle = (document.getElementById("forcedToggle") as HTMLInputElement).checked;
  state.forcedNozzle1 = (document.getElementById("forcedNozzle1") as HTMLSelectElement).value;
  state.forcedNozzle2 = (document.getElementById("forcedNozzle2") as HTMLSelectElement).value;

  const userP = Number((document.getElementById("userPressure") as HTMLInputElement).value);
  state.userPressureTarget = userP || null;

  if (state.forcedToggle) {
    const { names } = getOutputsAndCoefs();
    state.fixedNozzles = names.map((_, i) => (i % 2 === 0 ? state.forcedNozzle1 : state.forcedNozzle2));
  } else {
    state.fixedNozzles = [];
  }

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
  const filename =
    typeof generatePdfFilename === "function"
      ? generatePdfFilename(state)
      : defaultGeneratePdfFilename();

  pdfMake.createPdf(docDefinition).download(filename);
}

document.getElementById("btnPdf")?.addEventListener("click", async () => {
  const loader = document.getElementById("pdfLoader");
  if (loader) loader.style.display = "block";

  const doc = await buildDocDefinition(state);
  generatePdf(doc);

  if (loader) loader.style.display = "none";
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
