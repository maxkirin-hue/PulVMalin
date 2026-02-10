  import { nozzleFamilies } from "../data/nozzles";
  import { state } from "../state/state";
  import { showPage } from "./navigation";
  import { computeAll, recomputePressureOnly } from "../core/optimizer";
  import { generatePdfHtml, generatePdfFilename} from "../pdf/pdfTemplate"; 
  import { formatName, formatVitiModel } from "../utils/format";
  import { buildDocDefinition } from "../pdf/pdfmakeTemplate";
  declare const pdfMake: any;

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

    // 🔥 Règles de familles autorisées par type de machine
    const allowedByMachine: Record<string, string[]> = {
      viti: ["ATR80", "CP4916", "AMT", "AD90"],
      arbo: ["TXR", "IDK", "XR"],
      tangentiel: ["ATR80", "TXR", "IDK90"],   // ❌ pas de CP4916 ici
      rampe: ["XR", "IDK90", "AD90"],
    };

  const allowed = allowedByMachine[state.machineType] ?? [];

  const entries = Object.entries(nozzleFamilies).filter(
    ([key, fam]: any) =>
      allowed.includes(key) &&
      (!fam.machines || fam.machines.includes(state.machineType))
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
   MODÈLES DISPONIBLES SELON MACHINE
========================================================= */

export function updateModelOptions() {
  const sel = document.getElementById("modelSelect") as HTMLSelectElement;
  if (!sel) return;

  let models: string[] = [];

  switch (state.machineType) {

    case "viti":
      models = ["3r_sans", "3r_avec", "4r_sans", "4r_avec"];
      break;

    case "arbo":
      models = ["arbo_3_3", "arbo_4_4", "arbo_5_5"];
      break;

    case "tangentiel":
      models = ["tangentiel_6", "tangentiel_8", "tangentiel_10", "tangentiel_12"];
      break;

    case "rampe":
      models = []; // 🔥 Rampe = pas de modèles imposés
      break;
  }

  sel.innerHTML = "";

  models.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    sel.appendChild(opt);
  });

  // Sélection automatique du premier modèle
  if (models.length > 0) {
    state.modelKey = models[0];
    sel.value = state.modelKey;
  } else {
    state.modelKey = null;
  }
}
/* =========================================================
   FAMILLES DISPONIBLES SELON MACHINE
========================================================= */

export function updateFamilyOptions() {
  const sel = document.getElementById("familySelect") as HTMLSelectElement;
  if (!sel) return;

  let families: string[] = [];

  switch (state.machineType) {

    case "viti":
      families = [ "CP4916", "AMT", "AD90"];
      break;

    case "arbo":
      families = ["TXR", "IDK90", "XR", "ATR80"];
      break;

    case "tangentiel":
      families = ["ATR80", "TXR", "IDK90"];
      break;

    case "rampe":
      families = ["XR", "AD90"];
      break;
  }

  sel.innerHTML = "";

  families.forEach(f => {
    const opt = document.createElement("option");
    opt.value = f;
    opt.textContent = f;
    sel.appendChild(opt);
  });

  if (families.length > 0) {
    state.familyKey = families[0];
    sel.value = state.familyKey;
  }

  populateForcedNozzleSelect();
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
    state.modelKey = modelSel.value;        // ✔ VITI a des modèles
  }

  if (state.machineType === "arbo") {
    const arboRangs = document.getElementById("arboRangs") as HTMLSelectElement;
    state.arboRangs = Number(arboRangs.value);
    state.modelKey = null;                  // 🔥 ARBO n’a PAS de modèle
  }

  if (state.machineType === "rampe") {
    const rampeCount = document.getElementById("rampeCount") as HTMLInputElement;
    state.rampeCount = Number(rampeCount.value);
    state.modelKey = null;                  // ✔ RAMPE n’a pas de modèle
  }

  if (state.machineType === "tangentiel") {
    const tangCount = document.getElementById("tangentielCount") as HTMLInputElement;
    state.arboRangs = Number(tangCount.value);
    state.modelKey = null;                  // 🔥 TANGENTIEL n’a PAS de modèle
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

    function fillSummary() {
      // Nom utilisateur
      const sumName = document.getElementById("sumName") as HTMLElement;
      sumName.textContent = formatName(state.userName ?? "");

      // Type de machine
      const sumMachine = document.getElementById("sumMachine") as HTMLElement;
      sumMachine.textContent = state.machineType ?? "";

      // Modèle machine (VITI ou autre)
      const sumModel = document.getElementById("sumModel") as HTMLElement;
      sumModel.textContent =
        state.machineType === "viti"
          ? formatVitiModel(state.modelKey)
          : state.machineName ?? "";
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
  
function generatePdf(docDefinition) {
  pdfMake.createPdf(docDefinition).download(generatePdfFilename(state));
}

/* =========================================================
    EXPORT PDF
========================================================= */
document.getElementById("btnPdf")?.addEventListener("click", async () => {

  // 1) Construire le docDefinition pdfmake (ATTENTION : async)
  const doc = await buildDocDefinition(state);

  // 2) Générer le PDF
  generatePdf(doc);
});
