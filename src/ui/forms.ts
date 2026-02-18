/* =========================================================
   FORMS UI — familles, pastilles, modèles, navigation
========================================================= */

import { nozzleFamilies } from "../data/nozzles";
import { state } from "../state/state";
import { computeAll, recomputePressureOnly } from "../core/optimizer";
import { getOutputsAndCoefs, buildVitiLibreModel, vitiModels } from "../core/models";
import { fillSummary } from "./summary";
import { buildDocDefinition, generatePdfFilename } from "../pdf/pdfmakeTemplate";
import { resetCalculOnly, resetAll } from "../state/reset";


import { showPage } from "./navigation";

declare const pdfMake: any;

/* Helpers PDF fallback */
function defaultGeneratePdfFilename(): string {
  const name = (state.machineName || "PulvMalin").replace(/\s+/g, "_");
  const date = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  return `${name}_${date}.pdf`;
}
function validatePage2(): boolean {
  if (!state.machineType) {
    alert("Merci de choisir un type de machine.");
    return false;
  }

  if (state.machineType === "arbo" || state.machineType === "tangentiel") {
    if (!state.arboCount || state.arboCount < 2) {
      alert("Merci de renseigner le nombre de buses.");
      return false;
    }
    if (!state.arboRangs) {
      alert("Merci de choisir le nombre de rangs.");
      return false;
    }
  }

  if (state.machineType === "viti" && !state.modelKey) {
    alert("Merci de choisir un modèle viti.");
    return false;
  }

  if (state.machineType === "rampe" && !state.rampeCount) {
    alert("Merci de renseigner le nombre de buses de la rampe.");
    return false;
  }

  return true;
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
  const modelSelect = document.getElementById("vitiModel") as HTMLSelectElement | null;
  const modelBlock = modelSelect?.closest(".form-group") as HTMLElement | null;

  // Bloc modèle libre
  if (libreBlock) {
    libreBlock.style.display =
      state.machineType === "viti" && state.modelKey === "viti_libre"
        ? "block"
        : "none";
  }

  // Cas Jet projeté → on masque le choix de modèle
  if (state.machineType === "viti" && state.modelKey === "3r_avec_jet_projete") {
    if (modelBlock) modelBlock.style.display = "none";
  } else {
    if (modelBlock) modelBlock.style.display = "block";
  }
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
// Bouton Réinitialiser l'application (Page 1)
document.getElementById("btnResetAll")?.addEventListener("click", () => {
  const ok = confirm("Voulez‑vous vraiment réinitialiser l'application ? Toutes les données non sauvegardées seront perdues.");
  if (!ok) return;

  // reset du state global
  resetAll();

  // Masquer tous les blocs machine et revenir à la page 1
  hideAllMachineBlocks();
  showPage(1);

  // Réinitialiser les inputs/selects visibles
  const idsToClear = [
    "dose", "largeur", "vitesse", "machineName",
    "arboCount", "arboRangs", "rampeCount",
    "vitiModel", "libreCanonsG", "libreCanonsD",
    "libreRetourG", "libreRetourD", "libreMainsG", "libreMainsD",
    "familySelect", "forcedNozzle1", "forcedNozzle2",
    "userName"
  ];
  idsToClear.forEach(id => {
    const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
    if (!el) return;
    if (el instanceof HTMLInputElement) {
      if (el.type === "checkbox" || el.type === "radio") el.checked = false;
      else el.value = "";
    } else {
      el.selectedIndex = 0;
    }
  });

  // Remettre à jour les listes dépendantes
  populateFamilySelect();
  updateFamilyOptions();
  updateModelOptions();
  updatePage2Visibility();

  // Désactiver le bouton continuer si nécessaire
  setButtonEnabled("toPage3", false);

  // Vider le résumé et le tableau résultats
  const summaryIds = ["sumMachine","sumName","sumFamily","sumModel","sumMode","sumLargeur","sumDose","sumVitesse","sumQtotal","sumPressure"];
  summaryIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = "—";
  });
  const comparison = document.getElementById("comparisonTable");
  if (comparison) comparison.innerHTML = "";

  // Focus ergonomique
  document.getElementById("btnViti")?.focus();

  // Optionnel : notifier d'autres modules si besoin
  document.dispatchEvent(new CustomEvent("app:reset"));
});



/* =========================================================
   NAVIGATION (verrouillée, unique handlers)
========================================================= */

// utilitaire pour activer/désactiver boutons
function setButtonEnabled(id: string, enabled: boolean) {
  const btn = document.getElementById(id) as HTMLButtonElement | null;
  if (btn) btn.disabled = !enabled;
}

// validation live simple pour Page 2 (active le bouton)
function isPage2InputsFilled(): boolean {
  const dose = Number((document.getElementById("dose") as HTMLInputElement).value);
  const interligne = Number((document.getElementById("largeur") as HTMLInputElement).value);
  const speed = Number((document.getElementById("vitesse") as HTMLInputElement).value);
  return !!dose && !!interligne && !!speed && !!state.machineType;
}

// attacher listeners aux inputs pour activer le bouton "toPage3"
["dose","largeur","vitesse","machineName","arboCount","arboRangs","rampeCount","vitiModel"].forEach(id => {
  const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
  if (el) {
    el.addEventListener("input", () => {
      setButtonEnabled("toPage3", isPage2InputsFilled());
    });
    el.addEventListener("change", () => {
      setButtonEnabled("toPage3", isPage2InputsFilled());
    });
  }
});

// initial state: désactiver bouton si pas prêt
setButtonEnabled("toPage3", isPage2InputsFilled());

// Bouton Jet projeté (Page 1 → Page 2)
document.getElementById("btnJetProjete")?.addEventListener("click", () => {
  state.machineType = "viti";
  state.modelKey = "3r_avec_jet_projete";

  updatePage2Visibility();
  populateFamilySelect();
  updateFamilyOptions();
  updateModelOptions();

  showPage(2);
});

// Bouton standard Page 1 → Page 2
document.getElementById("toPage2")?.addEventListener("click", () => {
  if (!state.machineType) {
    alert("Merci de choisir un type de machine.");
    return;
  }

  updatePage2Visibility();
  populateFamilySelect();
  updateFamilyOptions();
  updateModelOptions();
  showPage(2);
});



// Page 2 → Page 3 (unique handler, validation avant écriture dans state)
document.getElementById("toPage3")?.addEventListener("click", () => {
  // lire sans écrire d'abord
  const dose = Number((document.getElementById("dose") as HTMLInputElement).value);
  const interligne = Number((document.getElementById("largeur") as HTMLInputElement).value);
  const speed = Number((document.getElementById("vitesse") as HTMLInputElement).value);
  const machineName = (document.getElementById("machineName") as HTMLInputElement).value;

  if (!dose || !interligne || !speed) {
    alert("Merci de remplir la dose, l’interligne et la vitesse.");
    return;
  }
if (state.machineType === "arbo" || state.machineType === "tangentiel") {
  const arboRangs = document.getElementById("arboRangs") as HTMLSelectElement;
  const arboCountEl = document.getElementById("arboCount") as HTMLInputElement | null;

  state.arboRangs = Number(arboRangs?.value) === 2 ? 2 : 1;
  state.arboCount = arboCountEl ? Number(arboCountEl.value) : null;
  state.modelKey = null as any;
}

if (state.machineType === "rampe") {
  const rampeCount = document.getElementById("rampeCount") as HTMLInputElement;
  state.rampeCount = Number(rampeCount.value);
  state.modelKey = null as any;
}

  if (!validatePage2()) return;

  // écrire dans le state seulement après validation
  state.dose = dose;
  state.interligne = interligne;
  state.speed = speed;
  state.machineName = machineName;

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

  const rangsSel = document.getElementById("vitiLibreRangs") as HTMLSelectElement | null;
  state.vitiLibreRangs = rangsSel ? (Number(rangsSel.value) as 3 | 4) : 3;

  if (canG + canD + retG + retD + mainG + mainD === 0) {
    alert("Merci de définir au moins une sortie pour le modèle libre.");
    return;
  }

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
  showPage(3);
});

// Page 3 → Page 4
document.getElementById("toPage4")?.addEventListener("click", () => {
  state.forcedToggle = (document.getElementById("forcedToggle") as HTMLInputElement).checked;
  state.forcedNozzle1 = (document.getElementById("forcedNozzle1") as HTMLSelectElement).value;
  state.forcedNozzle2 = (document.getElementById("forcedNozzle2") as HTMLSelectElement).value;

  const userP = Number((document.getElementById("userPressure") as HTMLInputElement).value);
  state.userPressureTarget = userP || null;

  if (state.forcedToggle) {
    const { names } = getOutputsAndCoefs();
    state.fixedNozzles = names.map((_, i) =>
      i % 2 === 0 ? state.forcedNozzle1 : state.forcedNozzle2
    );
  } else if (!state.fixedNozzles || state.fixedNozzles.length === 0) {
    state.fixedNozzles = [];
  }

  computeAll();

  if (!state.calculations) state.calculations = [];

  if (state.calculations.length < 4) {
    const labelParts: string[] = [];
    if (state.interligne) labelParts.push(`${state.interligne.toFixed(2)} m`);
    if (state.dose) labelParts.push(`${state.dose} L/ha`);

    state.calculations.push({
      label: labelParts.join(" – ") || "Réglage",
      pressure: state.recommendedPressure,
      results: structuredClone(state.results),
    });
  }

  fillSummary();
  showPage(4);
});

/* =========================================================
   RE-CALCUL PRESSION (PAGE 4)
========================================================= */

document.getElementById("btnNewSetting")?.addEventListener("click", () => {
  const newI = Number((document.getElementById("newInterligne") as HTMLInputElement).value);
  const newDose = Number((document.getElementById("newDose") as HTMLInputElement).value);

  if (newI > 0) state.interligne = newI;
  if (newDose > 0) state.dose = newDose;

  // Nouveau calcul complet (buses/pastilles inchangées)
  computeAll();

  if (!state.calculations) state.calculations = [];

  if (state.calculations.length < 4) {
    const labelParts: string[] = [];
    if (state.interligne) labelParts.push(`${state.interligne.toFixed(2)} m`);
    if (state.dose) labelParts.push(`${state.dose} L/ha`);

    state.calculations.push({
      label: labelParts.join(" – ") || "Réglage",
      pressure: state.recommendedPressure,
      results: structuredClone(state.results),
    });
  }

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

    // Décision métier selon la destination
    if (target === 1) {
      // Recommencer → reset complet
      resetAll();
    } else if (target === 3) {
      // Modifier → reset calcul uniquement
      resetCalculOnly();
    }

    showPage(target);
  });
});
