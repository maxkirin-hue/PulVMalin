import { nozzleFamilies } from "./data/nozzles.js";

const state = {
  machineType: null,
  machineName: "",
  familyKey: null,
  modelKey: null,
  dose: null,
  largeur: null,
  vitesse: null,
  arboCount: null,
  rampeCount: null,
  forced: false,
  forcedNozzleValue: "",
  results: [],
  qTotal: 0,
  recommendedPressure: 0,
};

const $ = sel => document.querySelector(sel);
const num = v => Number(v);

function showPage(n) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  $(`#page${n}`).classList.add("active");
}

function statusClass(s) {
  const v = (s || "").toLowerCase();
  if (v.includes("ok")) return "status-ok";
  if (v.includes("limite")) return "status-limit";
  if (v.includes("chang")) return "status-bad";
  return "";
}

/* ---------- BLOCS MACHINE ---------- */

function updateMachineBlocks() {
  $("#arboBlock").style.display = state.machineType === "arbo" ? "block" : "none";
  $("#vitiBlock").style.display = state.machineType === "viti" ? "block" : "none";
  $("#rampeBlock").style.display = state.machineType === "rampe" ? "block" : "none";
}

/* ---------- FAMILLES & PASTILLES ---------- */

function listNozzleVariants(family) {
  const variants = [];
  family.nozzles.forEach(n => {
    if (n.faces) {
      n.faces.forEach(face => {
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

function getVariantByValue(family, value) {
  if (!family || !value) return null;
  return listNozzleVariants(family).find(v => v.value === value) || null;
}

function populateFamilySelect() {
  const sel = $("#familySelect");
  sel.innerHTML = "";

  const entries = Object.entries(nozzleFamilies).filter(([k, f]) =>
    !f.machines || f.machines.includes(state.machineType)
  );

  entries.forEach(([key, fam]) => {
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

function populateForcedNozzleSelect() {
  const sel = $("#forcedNozzleSelect");
  sel.innerHTML = "";

  const fam = nozzleFamilies[state.familyKey];
  if (!fam) return;

  const variants = listNozzleVariants(fam);

  const opt0 = document.createElement("option");
  opt0.value = "";
  opt0.textContent = "Choisir…";
  sel.appendChild(opt0);

  variants.forEach(v => {
    const o = document.createElement("option");
    o.value = v.value;
    o.textContent = v.label;
    sel.appendChild(o);
  });
}

/* ---------- MODÈLES VITI (complète / moitié) ---------- */

const vitiModels = {
  "3r_avec": [
    { name: "Canon G1", role: "moitie", group: 1 },
    { name: "Canon G2", role: "moitie", group: 1 },
    { name: "Canon D2", role: "moitie", group: 1 },
    { name: "Canon D1", role: "moitie", group: 1 },
    { name: "Main retour G", role: "complete", group: 2 },
    { name: "Main retour D", role: "complete", group: 2 },
    { name: "Main G1", role: "moitie", group: 1 },
    { name: "Main G2", role: "moitie", group: 1 },
    { name: "Main D2", role: "moitie", group: 1 },
    { name: "Main D1", role: "moitie", group: 1 },
  ],

  "4r_avec": [
    { name: "Canon G1", role: "complete", group: 1 },
    { name: "Canon G2", role: "complete", group: 1 },
    { name: "Main retour G", role: "complete", group: 1 },
    { name: "Main G1", role: "moitie", group: 2 },
    { name: "Main G2", role: "moitie", group: 2 },
    { name: "Canon D1", role: "complete", group: 1 },
    { name: "Canon D2", role: "complete", group: 1 },
    { name: "Main retour D", role: "complete", group: 1 },
    { name: "Main D1", role: "moitie", group: 2 },
    { name: "Main D2", role: "moitie", group: 2 },
  ],

  "3r_sans": [
    { name: "Canon G1", role: "moitie", group: 1 },
    { name: "Canon G2", role: "moitie", group: 1 },
    { name: "Canon D2", role: "moitie", group: 1 },
    { name: "Canon D1", role: "moitie", group: 1 },
    { name: "Main G1", role: "moitie", group: 1 },
    { name: "Main G2", role: "moitie", group: 1 },
    { name: "Main D2", role: "moitie", group: 1 },
    { name: "Main D1", role: "moitie", group: 1 },
  ],

  "4r_sans": [
    { name: "Canon G1", role: "complete", group: 1 },
    { name: "Canon G2", role: "complete", group: 1 },
    { name: "Main G1", role: "complete", group: 1 },
    { name: "Main G2", role: "complete", group: 1 },
    { name: "Canon D1", role: "complete", group: 1 },
    { name: "Canon D2", role: "complete", group: 1 },
    { name: "Main D1", role: "complete", group: 1 },
    { name: "Main D2", role: "complete", group: 1 },
  ],
};

/* ---------- SORTIES & COEFS SELON MACHINE ---------- */

function getOutputsAndCoefs() {
  if (state.machineType === "viti") {
    const model = vitiModels[state.modelKey];
    if (!model) return { names: [], coefs: [], modelLabel: "—" };

    const names = model.map(o => o.name);
    const coefs = model.map(o => (o.role === "complete" ? 1 : 0.5));

    const label =
      state.modelKey === "3r_avec" ? "Viti — 3 rangs avec retour" :
      state.modelKey === "4r_avec" ? "Viti — 4 rangs avec retour" :
      state.modelKey === "3r_sans" ? "Viti — 3 rangs sans retour" :
      state.modelKey === "4r_sans" ? "Viti — 4 rangs sans retour" : "Viti";

    return { names, coefs, modelLabel: label };
  }

  if (state.machineType === "arbo") {
    const total = state.arboCount;
    const half = total / 2;
    const names = [];
    for (let i = 1; i <= half; i++) names.push(`Sortie G${i}`);
    for (let i = 1; i <= half; i++) names.push(`Sortie D${i}`);
    const coefs = Array(total).fill(1);
    return { names, coefs, modelLabel: "Arbo — 2 rangs (répartition uniforme)" };
  }

  if (state.machineType === "rampe") {
    const n = state.rampeCount;
    const names = [];
    for (let i = 1; i <= n; i++) names.push(`Buse ${i}`);
    const coefs = Array(n).fill(1);
    return { names, coefs, modelLabel: "Rampe désherbage — 1 rang (répartition uniforme)" };
  }

  return { names: [], coefs: [], modelLabel: "—" };
}

/* ---------- PRESSION & CHOIX DE PASTILLE ---------- */

function pressureForFlow(qTarget, qRef, pRef) {
  return pRef * Math.pow(qTarget / qRef, 2);
}

function pressureStatus(p, family) {
  if (!Number.isFinite(p)) return "—";
  if (p < family.limitRange[0] || p > family.limitRange[1]) return "Changer";
  if (p < family.optimalRange[0] || p > family.optimalRange[1]) return "Limite";
  return "OK";
}

function chooseBestVariantForTargetFlow(family, qTarget) {
  const variants = listNozzleVariants(family);
  let best = null;
  let bestScore = 1e9;

  variants.forEach(v => {
    const p = pressureForFlow(qTarget, v.qRef, family.refPressure);

    const center = (family.optimalRange[0] + family.optimalRange[1]) / 2;
    let score;

    if (p < family.limitRange[0] || p > family.limitRange[1]) {
      score = 1e9;
    } else {
      const dist = Math.abs(p - center);
      const penalty =
        p >= family.optimalRange[0] && p <= family.optimalRange[1] ? 0 : 50;
      score = dist + penalty;
    }

    if (score < bestScore) {
      bestScore = score;
      best = v;
    }
  });

  return best || variants[0];
}

/* ---------- VALIDATION ---------- */

function validatePage2() {
  state.dose = num($("#dose").value);
  state.largeur = num($("#largeur").value);
  state.vitesse = num($("#vitesse").value);
  state.familyKey = $("#familySelect").value;

  if (!state.dose || !state.largeur || !state.vitesse) {
    alert("Dose, largeur et vitesse doivent être renseignées.");
    return false;
  }
  if (!state.familyKey) {
    alert("Choisis une famille de buses.");
    return false;
  }

  if (state.machineType === "arbo") {
    state.arboCount = num($("#arboCount").value);
    if (!state.arboCount || state.arboCount < 2 || state.arboCount % 2 !== 0) {
      alert("Le nombre de buses Arbo doit être pair et ≥ 2.");
      return false;
    }
  }

  if (state.machineType === "viti") {
    state.modelKey = $("#vitiModel").value;
    if (!state.modelKey) {
      alert("Choisis un modèle Viti.");
      return false;
    }
  }

  if (state.machineType === "rampe") {
    state.rampeCount = num($("#rampeCount").value);
    if (!state.rampeCount || state.rampeCount < 1) {
      alert("Le nombre de buses de rampe doit être ≥ 1.");
      return false;
    }
  }

  return true;
}

function validatePage3() {
  state.forced = $("#forcedToggle").checked;

if (state.forced) {

  // Récupération des valeurs forcées
  state.forcedNozzleValueGroup1 = $("#forcedNozzle1").value;
  state.forcedNozzleValueGroup2 = $("#forcedNozzle2").value;

  // Groupe 1 obligatoire
  if (!state.forcedNozzleValueGroup1) {
    alert("Choisis la pastille forcée du groupe 1.");
    return false;
  }

  // Certains modèles nécessitent 2 groupes
  const needsTwo =
    state.modelKey === "3r_avec" ||
    state.modelKey === "4r_avec";

  if (needsTwo && !state.forcedNozzleValueGroup2) {
    alert("Choisis la pastille forcée du groupe 2.");
    return false;
  }

} else {
  // Si pas forcé, on vide les valeurs
  state.forcedNozzleValueGroup1 = "";
  state.forcedNozzleValueGroup2 = "";
}

return true;
}/* ---------- CHOIX DE PASTILLE POUR PRESSION UNIQUE ---------- */
function chooseVariantForPressureTarget(family, qTarget, pressureTarget) {
  const variants = listNozzleVariants(family);

  let best = null;
  let bestScore = Infinity;

  variants.forEach(v => {
    const p = pressureForFlow(qTarget, v.qRef, family.refPressure);
    const score = Math.abs(p - pressureTarget);

    if (p >= family.limitRange[0] && p <= family.limitRange[1]) {
      if (score < bestScore) {
        bestScore = score;
        best = v;
      }
    }
  });

  return best || variants[0];
}

/* ---------- CALCUL PRINCIPAL AVEC PRESSION UNIQUE ---------- */

function computeAll() {
  const fam = nozzleFamilies[state.familyKey];
  const { names, coefs, modelLabel } = getOutputsAndCoefs();
  const model = vitiModels[state.modelKey];

  const qParRang = (state.dose * state.largeur * state.vitesse) / 600;

  let rangs = 1;
  if (state.machineType === "viti") {
    if (state.modelKey.includes("3r")) rangs = 3;
    if (state.modelKey.includes("4r")) rangs = 4;
  }
  if (state.machineType === "arbo") rangs = 2;

  const qTotal = qParRang * rangs;
  state.qTotal = qTotal;

  const sumCoef = coefs.reduce((a, b) => a + b, 0);

  const firstPass = [];

  names.forEach((name, idx) => {
    const coef = coefs[idx];
    const qTarget = qTotal * (coef / sumCoef);

    const variant = chooseBestVariantForTargetFlow(fam, qTarget);
    const p = pressureForFlow(qTarget, variant.qRef, fam.refPressure);

    firstPass.push({ name, coef, qTarget, variant, pressure: p });
  });

  const pressures = firstPass.map(r => r.pressure).sort((a, b) => a - b);
  const mid = Math.floor(pressures.length / 2);
  const pressureTarget =
    pressures.length % 2
      ? pressures[mid]
      : (pressures[mid - 1] + pressures[mid]) / 2;

  state.recommendedPressure = pressureTarget;

  const results = [];

  firstPass.forEach((r, idx) => {
    const qTarget = r.qTarget;
    const group = model[idx].group;

    let variant;

    if (state.forced) {
      const forcedValue =
        group === 1
          ? state.forcedNozzleValueGroup1
          : state.forcedNozzleValueGroup2;

      variant = getVariantByValue(fam, forcedValue);
    } else {
      variant = chooseVariantForPressureTarget(fam, qTarget, pressureTarget);
    }

    const p = pressureForFlow(qTarget, variant.qRef, fam.refPressure);
    const status = pressureStatus(p, fam);

    results.push({
      outputName: r.name,
      coef: r.coef,
      qTarget,
      nozzleLabel: variant.label,
      pressure: p,
      status,
    });
  });

  state.results = results;

  renderSummary(modelLabel);
  renderTables();
}

}
/* ---------- RECALCUL POUR NOUVEL INTERLIGNE ---------- */

function recomputePressureForNewInterligne() {
  const newL = num($("#newInterligne").value);
  if (!newL || newL <= 0) {
    alert("Saisis un interligne valide.");
    return;
  }

  const qParRang = (state.dose * newL * state.vitesse) / 600;

  let rangs = 1;
  if (state.machineType === "viti") {
    if (state.modelKey.includes("3r")) rangs = 3;
    if (state.modelKey.includes("4r")) rangs = 4;
  }

  const qTotal = qParRang * rangs;

  const fam = nozzleFamilies[state.familyKey];
  const { coefs } = getOutputsAndCoefs();
  const sumCoef = coefs.reduce((a, b) => a + b, 0);

  const pressures = [];

  state.results.forEach((r, idx) => {
    const coef = coefs[idx];
    const qTarget = qTotal * (coef / sumCoef);

    const variant = listNozzleVariants(fam).find(v => v.label === r.nozzleLabel);
    if (!variant) return;

    const p = pressureForFlow(qTarget, variant.qRef, fam.refPressure);

    r.qTarget = qTarget;
    r.pressure = p;
    r.status = pressureStatus(p, fam);

    pressures.push(p);
  });

  const sorted = pressures.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const recommended =
    sorted.length % 2
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;

  state.recommendedPressure = recommended;
  $("#sumPressure").textContent = recommended.toFixed(2) + " bar";

  renderTables();
}

/* ---------- RENDER SUMMARY & TABLES ---------- */

function renderSummary(modelLabel) {
  $("#sumMachine").textContent =
    state.machineType === "arbo"
      ? "Arbo (2 rangs)"
      : state.machineType === "viti"
      ? "Viti"
      : state.machineType === "rampe"
      ? "Rampe désherbage"
      : "—";

  $("#sumName").textContent = state.machineName || "—";
  $("#sumFamily").textContent = nozzleFamilies[state.familyKey]?.label || "—";
  $("#sumModel").textContent = modelLabel || "—";
  $("#sumMode").textContent = state.forced
    ? "Pastilles forcées (validation)"
    : "Automatique (recommandé)";
  $("#sumQtotal").textContent = state.qTotal.toFixed(2);
  $("#sumPressure").textContent = state.recommendedPressure.toFixed(2) + " bar";
}

function renderTables() {
  const body = $("#resultBody");
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

/* ---------- PDF ---------- */

async function downloadPdf() {
  if (!state.results.length) {
    alert("Aucun résultat à exporter.");
    return;
  }

  const fam = nozzleFamilies[state.familyKey];
  const { modelLabel } = getOutputsAndCoefs();

  const payload = {
    meta: {
      machineLabel:
        state.machineType === "arbo"
          ? "Arbo (2 rangs)"
          : state.machineType === "viti"
          ? "Viti"
          : state.machineType === "rampe"
          ? "Rampe désherbage"
          : "—",
      machineName: state.machineName || "—",
      familyLabel: fam?.label || "—",
      modelLabel: modelLabel || "—",
      modeLabel: state.forced
        ? "Pastilles forcées (validation)"
        : "Automatique (recommandé)",
      qTotal: state.qTotal.toFixed(2),
      recommendedPressure: state.recommendedPressure.toFixed(2),
      generatedAt: new Date().toLocaleString("fr-FR"),
    },
    rows: state.results.map(r => ({
      outputName: r.outputName,
      coef: r.coef.toFixed(2),
      qTarget: r.qTarget.toFixed(2),
      nozzleLabel: r.nozzleLabel,
      pressure: r.pressure.toFixed(2),
      status: r.status,
    })),
  };

  try {
    const resp = await fetch("/api/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      alert("Erreur lors de la génération du PDF.");
      return;
    }

    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pulvmalin_reglage.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (e) {
    alert("Impossible de contacter le service PDF.");
  }
}
/* ---------- INIT BOUTONS MACHINE ---------- */

function initMachineButtons() {
  document.querySelectorAll(".card-btn[data-type]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.machineType = btn.dataset.type;
      updateMachineBlocks();
    });
  });

  $("#toPage2").addEventListener("click", () => {
    state.machineName = $("#machineName").value.trim();
    if (!state.machineType) {
      alert("Choisis un type de machine.");
      return;
    }
    populateFamilySelect();
    showPage(2);
  });
}

/* ---------- NAVIGATION ---------- */

function initNav() {
  document.querySelectorAll("button[data-back]").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = Number(btn.dataset.back);
      showPage(target);
    });
  });

  $("#toPage3").addEventListener("click", () => {
    if (!validatePage2()) return;
    showPage(3);
  });

  $("#toPage4").addEventListener("click", () => {
    if (!validatePage3()) return;
    computeAll();
    showPage(4);
  });

  $("#forcedToggle").addEventListener("change", () => {
    const forced = $("#forcedToggle").checked;
    $("#forcedPanel").style.display = forced ? "grid" : "none";
  });

  $("#btnRecalc").addEventListener("click", recomputePressureForNewInterligne);
  $("#btnPdf").addEventListener("click", downloadPdf);
}

/* ---------- DOM READY ---------- */

window.addEventListener("DOMContentLoaded", () => {
  initMachineButtons();
  initNav();
  showPage(1);
});




