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
  alternatives: [],
  qTotal: 0,
};

/* ---------- HELPERS ---------- */

const $ = sel => document.querySelector(sel);
const num = v => Number(v);

function showPage(n) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  $(`#page${n}`).classList.add("active");
}

/* ---------- MACHINE SELECTION ---------- */

function updateMachineBlocks() {
  $("#arboBlock").style.display = state.machineType === "arbo" ? "block" : "none";
  $("#vitiBlock").style.display = state.machineType === "viti" ? "block" : "none";
  $("#rampeBlock").style.display = state.machineType === "rampe" ? "block" : "none";
}

/* ---------- FAMILY / NOZZLES ---------- */

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

/* ---------- OUTPUTS & COEFS ---------- */

function getOutputsAndCoefs() {
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

  const modelKey = state.modelKey;
  let names, coefs, label;

  if (modelKey === "3r_sans" || modelKey === "4r_sans") {
    names = [
      "Canon G1","Canon G2","Canon D2","Canon D1",
      "Main G1","Main G2","Main D2","Main D1"
    ];
    coefs = Array(8).fill(1);
    label = modelKey === "3r_sans"
      ? "Viti — 3 rangs sans retour"
      : "Viti — 4 rangs sans retour";
  } else if (modelKey === "3r_avec") {
    names = [
      "Canon G1","Canon G2","Canon D2","Canon D1",
      "Main retour G","Main retour D",
      "Main G1","Main G2","Main D2","Main D1"
    ];
    coefs = [1.10,1.10,1.00,0.90,0.80,0.80,0.90,1.00,1.10,1.10];
    label = "Viti — 3 rangs avec retour";
  } else if (modelKey === "4r_avec") {
    names = [
      "Canon G1","Canon G2","Canon D2","Canon D1",
      "Main retour G","Main retour D",
      "Main G1","Main G2","Main D2","Main D1"
    ];
    coefs = [1.15,1.15,0.85,0.85,0.85,0.85,0.85,0.85,1.15,1.15];
    label = "Viti — 4 rangs avec retour";
  } else {
    names = [];
    coefs = [];
    label = "—";
  }

  return { names, coefs, modelLabel: label };
}

/* ---------- PRESSURE ---------- */

function pressureForFlow(qTarget, qRef, pRef) {
  return pRef * Math.pow(qTarget / qRef, 2);
}

function pressureStatus(p, family) {
  if (!Number.isFinite(p)) return "—";
  if (p < family.limitRange[0] || p > family.limitRange[1]) return "Changer";
  if (p < family.optimalRange[0] || p > family.optimalRange[1]) return "Limite";
  return "OK";
}

function scorePressure(p, family) {
  const center = (family.optimalRange[0] + family.optimalRange[1]) / 2;
  if (p < family.limitRange[0] || p > family.limitRange[1])
    return { ok: false, score: 1e9, why: "Hors plage" };

  const dist = Math.abs(p - center);
  const inOptimal = p >= family.optimalRange[0] && p <= family.optimalRange[1];
  const penalty = inOptimal ? 0 : 50;

  return { ok: true, score: dist + penalty, why: inOptimal ? "Dans l’optimum" : "Dans la limite" };
}

function chooseBestVariantForTargetFlow(family, qTarget) {
  const variants = listNozzleVariants(family);
  let best = null;
  let bestScore = 1e9;

  variants.forEach(v => {
    const p = pressureForFlow(qTarget, v.qRef, family.refPressure);
    const s = scorePressure(p, family);
    if (s.score < bestScore) {
      bestScore = s.score;
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
    state.forcedNozzleValue = $("#forcedNozzleSelect").value;
    if (!state.forcedNozzleValue) {
      alert("En mode pastille forcée, choisis la pastille montée.");
      return false;
    }
  } else {
    state.forcedNozzleValue = "";
  }

  return true;
}

/* ---------- CALCUL ---------- */

function computeAll() {
  const fam = nozzleFamilies[state.familyKey];
  const { names, coefs, modelLabel } = getOutputsAndCoefs();

  const sumCoef = coefs.reduce((a, b) => a + b, 0);
  const qTotal = (state.dose * state.largeur * state.vitesse) / 600;
  state.qTotal = qTotal;

  const forcedVariant = state.forced ? getVariantByValue(fam, state.forcedNozzleValue) : null;

  const results = [];
  const alternatives = [];

  names.forEach((name, idx) => {
    const coef = coefs[idx];
    const qTarget = qTotal * (coef / sumCoef);

    const variant = forcedVariant || chooseBestVariantForTargetFlow(fam, qTarget);
    const p = pressureForFlow(qTarget, variant.qRef, fam.refPressure);
    const status = pressureStatus(p, fam);

    results.push({
      outputName: name,
      coef,
      qTarget,
      nozzleLabel: variant.label,
      pressure: p,
      status,
    });

    if (!state.forced) {
      const allVariants = listNozzleVariants(fam);
      const scored = allVariants.map(v => {
        const pp = pressureForFlow(qTarget, v.qRef, fam.refPressure);
        const s = scorePressure(pp, fam);
        return {
          v,
          p: pp,
          status: pressureStatus(pp, fam),
          score: s.score,
          why: s.why,
        };
      }).sort((a, b) => a.score - b.score);

      const best = scored[0];
      const alts = scored.slice(1, 3);

      alternatives.push(
        {
          outputName: name,
          nozzleLabel: best.v.label,
          pressure: best.p,
          status: best.status,
          why: "Meilleur compromis (optimum/limites)",
        },
        ...alts.map(x => ({
          outputName: name,
          nozzleLabel: x.v.label,
          pressure: x.p,
          status: x.status,
          why: x.why === "Dans l’optimum" ? "Alternative dans l’optimum" : "Alternative dans la limite",
        }))
      );
    }
  });

  state.results = results;
  state.alternatives = alternatives;

  renderSummary(modelLabel);
  renderTables();
}

/* ---------- RENDER ---------- */

function renderSummary(modelLabel) {
  $("#sumMachine").textContent =
    state.machineType === "arbo" ? "Arbo (2 rangs)" :
    state.machineType === "viti" ? "Viti" :
    state.machineType === "rampe" ? "Rampe désherbage" : "—";

  $("#sumName").textContent = state.machineName || "—";
  $("#sumFamily").textContent = nozzleFamilies[state.familyKey]?.label || "—";
  $("#sumModel").textContent = modelLabel || "—";
  $("#sumMode").textContent = state.forced ? "Pastilles forcées (validation)" : "Automatique (recommandé)";
  $("#sumQtotal").textContent = state.qTotal.toFixed(2);
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

  const altBody = $("#altBody");
  altBody.innerHTML = "";

  if (state.forced) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="5">Mode pastille forcée : alternatives non proposées.</td>`;
    altBody.appendChild(tr);
  } else if (!state.alternatives.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="5">Aucune alternative calculée.</td>`;
    altBody.appendChild(tr);
  } else {
    state.alternatives.forEach(a => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${a.outputName}</td>
        <td>${a.nozzleLabel}</td>
        <td class="num">${a.pressure.toFixed(2)}</td>
        <td class="${statusClass(a.status)}">${a.status}</td>
        <td>${a.why}</td>
      `;
      altBody.appendChild(tr);
    });
  }
}

function statusClass(s) {
  const v = (s || "").toLowerCase();
  if (v.includes("ok")) return "status-ok";
  if (v.includes("limite")) return "status-limit";
  if (v.includes("chang")) return "status-bad";
  return "";
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
        state.machineType === "arbo" ? "Arbo (2 rangs)" :
        state.machineType === "viti" ? "Viti" :
        state.machineType === "rampe" ? "Rampe désherbage" : "—",
      machineName: state.machineName || "—",
      familyLabel: fam?.label || "—",
      modelLabel: modelLabel || "—",
      modeLabel: state.forced ? "Pastilles forcées (validation)" : "Automatique (recommandé)",
      qTotal: state.qTotal.toFixed(2),
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
    alternatives: state.forced
      ? []
      : state.alternatives.map(a => ({
          outputName: a.outputName,
          nozzleLabel: a.nozzleLabel,
          pressure: a.pressure.toFixed(2),
          status: a.status,
          why: a.why,
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

/* ---------- INIT ---------- */

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
// PARTIE FINALE CORRIGÉE DU FICHIER app.js
// Remplacez la fin de votre fichier (à partir de la fonction initNav) par ce code

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

  // Bouton PDF - CORRIGÉ : c'est #btnPdf dans le HTML, pas #pdfBtn
  $("#btnPdf").addEventListener("click", downloadPdf);
}

function initForcedMode() {
  const toggle = $("#forcedToggle");
  // CORRIGÉ : c'est #forcedPanel dans le HTML, pas #forcedSelectWrapper
  const panel = $("#forcedPanel");

  toggle.addEventListener("change", () => {
    panel.style.display = toggle.checked ? "block" : "none";
  });
}

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  initMachineButtons();
  initNav();
  initForcedMode();
  showPage(1);
});
