/* =========================================================
   PULV MALIN — app.js (parcours 4 pages)
   - Machine -> Famille -> Modèle + paramètres -> Résultats + alternatives
   - ES module compatible Vite / Rollup
========================================================= */

import { nozzleFamilies } from "./data/nozzles.js";

/* =========================
   ÉTAT CENTRAL
========================= */

const state = {
  step: 1,

  machineType: null, // "vigne" | "aero" | "desherbage"
  familyKey: null,
  family: null,

  modelKey: null,

  dose: null,     // L/ha
  largeur: null,  // m
  vitesse: null,  // km/h

  forced: false,
  forcedNozzleValue: "", // "CODE" ou "CODE|side"

  results: [],
  alternatives: [],
};

/* =========================
   HELPERS
========================= */

const $ = id => document.getElementById(id);
const num = v => Number(v);

function round(v, d = 2) {
  return Number.isFinite(v) ? v.toFixed(d) : "—";
}

function setText(id, text) {
  const el = $(id);
  if (!el) return;
  el.textContent = text;
}

function setHTML(id, html) {
  const el = $(id);
  if (!el) return;
  el.innerHTML = html;
}

function showOnlySection(sectionId) {
  document.querySelectorAll("main section").forEach(s => s.classList.remove("active"));
  const el = document.getElementById(sectionId);
  if (el) el.classList.add("active");
}

function pressureForFlow(qTarget, qRef, pRef) {
  return pRef * Math.pow(qTarget / qRef, 2);
}

function pressureStatus(p, family) {
  if (!Number.isFinite(p)) return "—";
  if (p < family.limitRange[0] || p > family.limitRange[1]) return "Changer";
  if (p < family.optimalRange[0] || p > family.optimalRange[1]) return "Limite";
  return "OK";
}

function debitTotal(dose, largeur, vitesse) {
  // L/min total = (Dose(L/ha) * largeur(m) * vitesse(km/h)) / 600
  return (dose * largeur * vitesse) / 600;
}

/* =========================
   MODÈLES DE RÉPARTITION
   (adapte les coef si tu as ton propre modèle exact)
========================= */

const distributionModels = {
  "3r_sans": {
    label: "3 rangs – sans retour",
    outputs: [
      { name: "Gauche", coef: 1 },
      { name: "Centre", coef: 1 },
      { name: "Droite", coef: 1 },
    ],
    hint: "3 sorties à parts égales.",
  },
  "3r_avec": {
    label: "3 rangs – avec retour",
    outputs: [
      { name: "Gauche", coef: 1.1 },
      { name: "Centre", coef: 0.8 },
      { name: "Droite", coef: 1.1 },
    ],
    hint: "Retour : on favorise les côtés.",
  },
  "4r_sans": {
    label: "4 rangs – sans retour",
    outputs: [
      { name: "Extérieur G", coef: 1 },
      { name: "Intérieur G", coef: 1 },
      { name: "Intérieur D", coef: 1 },
      { name: "Extérieur D", coef: 1 },
    ],
    hint: "4 sorties à parts égales.",
  },
  "4r_avec": {
    label: "4 rangs – avec retour",
    outputs: [
      { name: "Extérieur G", coef: 1.15 },
      { name: "Intérieur G", coef: 0.85 },
      { name: "Intérieur D", coef: 0.85 },
      { name: "Extérieur D", coef: 1.15 },
    ],
    hint: "Retour : extérieurs favorisés.",
  },
};

/* =========================
   DONNÉES BUSES — NORMALISATION
========================= */

function listNozzleVariants(family) {
  // Retourne une liste plate de variantes:
  // { value, label, code, qRef, faceLabel }
  const variants = [];
  family.nozzles.forEach(n => {
    if (n.faces && Array.isArray(n.faces)) {
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

/* =========================
   UI — REMPLISSAGE SELECTS
========================= */

function populateFamilySelect() {
  const select = $("familySelect");
  if (!select) return;

  select.innerHTML = "";

  const keys = Object.keys(nozzleFamilies)
    .filter(key => nozzleFamilies[key].machines.includes(state.machineType));

  keys.forEach(key => {
    const family = nozzleFamilies[key];
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = family.label;
    select.appendChild(opt);
  });

  if (keys.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Aucune famille disponible";
    select.appendChild(opt);
    state.familyKey = null;
    state.family = null;
    return;
  }

  // Sélection par défaut
  state.familyKey = select.value;
  state.family = nozzleFamilies[state.familyKey];
  populateForcedNozzleSelect();
}

function populateForcedNozzleSelect() {
  const select = $("forcedNozzleSelect");
  if (!select) return;

  select.innerHTML = `<option value="">Choisir…</option>`;

  if (!state.family) return;

  listNozzleVariants(state.family).forEach(v => {
    const opt = document.createElement("option");
    opt.value = v.value;
    opt.textContent = v.label;
    select.appendChild(opt);
  });

  // Réapplique sélection si elle existe
  if (state.forcedNozzleValue) {
    select.value = state.forcedNozzleValue;
  }
}

/* =========================
   NAVIGATION
========================= */

function goToStep(step) {
  state.step = step;

  if (step === 1) showOnlySection("page1-machine");
  if (step === 2) showOnlySection("page2-family");
  if (step === 3) showOnlySection("page3-settings");
  if (step === 4) showOnlySection("page4-results");
}

/* =========================
   ACTIONS UTILISATEUR
========================= */

function selectMachineType(type) {
  state.machineType = type;

  const label =
    type === "vigne" ? "Vigne" :
    type === "aero" ? "Aéro / Tangentiel" :
    type === "desherbage" ? "Désherbage" : type;

  setText("machineTypeHint", `Sélection actuelle : ${label}`);

  // Reset dépendances
  state.familyKey = null;
  state.family = null;
  state.modelKey = null;
  state.results = [];
  state.alternatives = [];

  populateFamilySelect();
}

function onFamilyChanged() {
  const key = $("familySelect")?.value || "";
  state.familyKey = key || null;
  state.family = key ? nozzleFamilies[key] : null;

  // Reset dépendances
  state.forcedNozzleValue = "";
  populateForcedNozzleSelect();
}

function onForcedToggleChanged() {
  const forced = !!$("forcedToggle")?.checked;
  state.forced = forced;

  const panel = $("forcedPanel");
  if (panel) panel.style.display = forced ? "block" : "none";

  if (!forced) {
    state.forcedNozzleValue = "";
    const select = $("forcedNozzleSelect");
    if (select) select.value = "";
  }
}

function onForcedNozzleChanged() {
  state.forcedNozzleValue = $("forcedNozzleSelect")?.value || "";
}

/* =========================
   CALCUL — TABLEAU PRINCIPAL
========================= */

function validateStep3Inputs() {
  state.modelKey = $("modeleRepartition")?.value || "";
  state.dose = num($("dose")?.value);
  state.largeur = num($("largeur")?.value);
  state.vitesse = num($("vitesse")?.value);

  if (!state.machineType) return { ok: false, msg: "Choisis d'abord le type de machine." };
  if (!state.family) return { ok: false, msg: "Choisis une famille de buses (page 2)." };
  if (!state.modelKey || !distributionModels[state.modelKey]) return { ok: false, msg: "Choisis un modèle de répartition." };
  if (!state.dose || !state.largeur || !state.vitesse) return { ok: false, msg: "Dose / largeur / vitesse : valeurs invalides." };

  if (state.forced) {
    if (!state.forcedNozzleValue) return { ok: false, msg: "Mode pastille forcée : sélectionne la pastille montée." };
    const v = getVariantByValue(state.family, state.forcedNozzleValue);
    if (!v) return { ok: false, msg: "Pastille forcée introuvable dans la famille sélectionnée." };
  }

  return { ok: true, msg: "" };
}

function computeMainResults() {
  const family = state.family;
  const model = distributionModels[state.modelKey];

  const qTotal = debitTotal(state.dose, state.largeur, state.vitesse);
  const coefSum = model.outputs.reduce((s, o) => s + o.coef, 0);

  const forcedVariant = state.forced ? getVariantByValue(family, state.forcedNozzleValue) : null;

  const results = model.outputs.map((out, idx) => {
    const qTarget = qTotal * (out.coef / coefSum);

    const variant = forcedVariant || chooseBestVariantForTargetFlow(family, qTarget);
    const p = pressureForFlow(qTarget, variant.qRef, family.refPressure);
    const status = pressureStatus(p, family);

    return {
      index: idx + 1,
      outputName: out.name,
      coef: out.coef,
      qTarget,
      nozzleLabel: variant.label,
      qRef: variant.qRef,
      pressure: p,
      status,
      chosenBy: state.forced ? "forced" : "auto",
    };
  });

  state.results = results;
  return results;
}

/* =========================
   CHOIX AUTO + ALTERNATIVES
========================= */

function scorePressure(p, family) {
  // Objectif: proche du centre de l'optimalRange, et dans les limites.
  const center = (family.optimalRange[0] + family.optimalRange[1]) / 2;

  if (p < family.limitRange[0] || p > family.limitRange[1]) return { ok: false, score: 1e9, why: "Hors plage" };
  const dist = Math.abs(p - center);

  // Pénalité si hors zone optimale mais dans limite
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

  // fallback sécurité
  return best || variants[0];
}

function computeAlternatives() {
  const family = state.family;
  const model = distributionModels[state.modelKey];
  const qTotal = debitTotal(state.dose, state.largeur, state.vitesse);
  const coefSum = model.outputs.reduce((s, o) => s + o.coef, 0);

  // En mode forcé, les "alternatives" sont moins pertinentes: on valide surtout.
  if (state.forced) {
    state.alternatives = [];
    return [];
  }

  const variants = listNozzleVariants(family);

  const alternatives = model.outputs.map((out, idx) => {
    const qTarget = qTotal * (out.coef / coefSum);

    // 1) variante auto (best)
    const best = chooseBestVariantForTargetFlow(family, qTarget);

    // 2) alternatives: on propose 2 autres variantes "proches" (en score)
    const scored = variants
      .map(v => {
        const p = pressureForFlow(qTarget, v.qRef, family.refPressure);
        const s = scorePressure(p, family);
        return { v, p, status: pressureStatus(p, family), score: s.score, why: s.why };
      })
      .sort((a, b) => a.score - b.score);

    const picks = scored.filter(x => x.v.value !== best.value).slice(0, 2);

    const rows = [
      {
        rank: "Auto",
        nozzleLabel: best.label,
        pressure: pressureForFlow(qTarget, best.qRef, family.refPressure),
        status: pressureStatus(pressureForFlow(qTarget, best.qRef, family.refPressure), family),
        why: "Meilleur compromis (optimum/limites)",
      },
      ...picks.map((p, i) => ({
        rank: `Alt ${i + 1}`,
        nozzleLabel: p.v.label,
        pressure: p.p,
        status: p.status,
        why: p.why === "Dans l’optimum" ? "Alternative dans l’optimum" : "Alternative dans la limite",
      })),
    ];

    return {
      outputIndex: idx + 1,
      outputName: out.name,
      rows,
    };
  });

  state.alternatives = alternatives;
  return alternatives;
}

/* =========================
   RENDER
========================= */

function renderSchemaHint() {
  const key = $("modeleRepartition")?.value || "";
  const model = distributionModels[key];
  setHTML("schemaContainer", model ? model.hint : "");
}

function renderResults() {
  // résumé
  const fam = state.family;
  const model = distributionModels[state.modelKey];
  const qTotal = debitTotal(state.dose, state.largeur, state.vitesse);

  setHTML(
    "resumeFinal",
    `
      <div><strong>Machine :</strong> ${state.machineType || "—"}</div>
      <div><strong>Famille :</strong> ${fam?.label || "—"}</div>
      <div><strong>Modèle :</strong> ${model?.label || "—"}</div>
      <div><strong>Mode pastille :</strong> ${state.forced ? "Forcée (validation)" : "Automatique (recommandé)"}</div>
      <div><strong>Débit total cible :</strong> ${round(qTotal, 2)} L/min</div>
    `
  );

  // tableau principal
  const tbody = $("resultTable")?.querySelector("tbody");
  if (tbody) {
    tbody.innerHTML = "";
    state.results.forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.index}</td>
        <td>${r.outputName}</td>
        <td>${round(r.coef, 2)}</td>
        <td>${round(r.qTarget, 2)}</td>
        <td>${r.nozzleLabel}</td>
        <td>${round(r.qRef, 2)}</td>
        <td>${round(r.pressure, 2)}</td>
        <td>${r.status}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // alternatives
  const altBody = $("altTable")?.querySelector("tbody");
  if (altBody) {
    altBody.innerHTML = "";

    if (state.forced) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="6">Mode forcé : alternatives non affichées (objectif = valider les pastilles montées).</td>`;
      altBody.appendChild(tr);
      return;
    }

    state.alternatives.forEach(block => {
      block.rows.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${block.outputIndex} — ${row.rank}</td>
          <td>${block.outputName}</td>
          <td>${row.nozzleLabel}</td>
          <td>${round(row.pressure, 2)}</td>
          <td>${row.status}</td>
          <td>${row.why}</td>
        `;
        altBody.appendChild(tr);
      });
    });
  }
}

/* =========================
   FLOW: CALCUL + NAV
========================= */

function calculateAndGo() {
  const v = validateStep3Inputs();
  if (!v.ok) {
    alert(v.msg);
    return;
  }

  computeMainResults();
  computeAlternatives();
  renderResults();
  goToStep(4);
}

/* =========================
   INIT
========================= */

function wireUI() {
  // Page 2
  $("familySelect")?.addEventListener("change", onFamilyChanged);

  // Page 3
  $("modeleRepartition")?.addEventListener("change", renderSchemaHint);
  $("forcedToggle")?.addEventListener("change", onForcedToggleChanged);
  $("forcedNozzleSelect")?.addEventListener("change", onForcedNozzleChanged);
}

window.addEventListener("DOMContentLoaded", () => {
  wireUI();
  goToStep(1);
  setText("machineTypeHint", "Sélection actuelle : — (choisis un type de machine)");
});

/* =========================
   EXPORTS POUR HTML
========================= */

window.goToStep = goToStep;
window.selectMachineType = selectMachineType;
window.calculateAndGo = calculateAndGo;
