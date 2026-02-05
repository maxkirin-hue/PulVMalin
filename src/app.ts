import { nozzleFamilies } from "./data/nozzles.js";
import { generatePdfHtml } from "./pdftemplate.js";

/* ============================================================
   TYPES
============================================================ */

type MachineType = "viti" | "arbo" | "rampe" | null;

type ResultRow = {
  outputName: string;
  coef: number;
  qTarget: number;
  nozzleLabel: string;
  qRef: number;
  pressure: number;
  qReal: number;
  relError: number;
  status: string;
};

type LockedNozzle = {
  nozzleLabel: string;
  qRef: number;
};

type AppState = {
  machineType: MachineType;
  machineName: string;

  familyKey: string | null;
  modelKey: string | null;

  dose: number | null;
  largeur: number | null;
  vitesse: number | null;

  arboCount: number | null;
  rampeCount: number | null;

  forced: boolean;

  results: ResultRow[];
  lockedNozzles: LockedNozzle[] | null;

  qTotal: number;
  recommendedPressure: number;
  
const btnContinue = document.getElementById("btnContinue");
if (btnContinue) {
  btnContinue.addEventListener("click", () => {
    computeAll();
  });
}
};

/* ============================================================
   STATE
============================================================ */

const state: AppState = {
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

  results: [],
  lockedNozzles: null,

  qTotal: 0,
  recommendedPressure: 0,
};

/* ============================================================
   UTILS
============================================================ */

const $ = <T extends HTMLElement>(sel: string): T =>
  document.querySelector(sel) as T;

const num = (v: string): number => Number(v);

/* ============================================================
   PRESSION / HYDRAULIQUE
============================================================ */

function pressureForFlow(qTarget: number, qRef: number, pRef: number): number {
  return pRef * Math.pow(qTarget / qRef, 2);
}

function flowAtPressure(qRef: number, P: number, pref: number): number {
  return qRef * Math.sqrt(P / pref);
}

function pressureStatus(p: number, family: any): string {
  if (!Number.isFinite(p)) return "—";
  if (p < family.limitRange[0] || p > family.limitRange[1]) return "Changer";
  if (p < family.optimalRange[0] || p > family.optimalRange[1]) return "Limite";
  return "OK";
}

/* ============================================================
   CALCUL INITIAL (CHOIX DES BUSES)
============================================================ */

function computeAll(): void {
  const fam = nozzleFamilies[state.familyKey!];
  if (!fam) return;

  const qParRang =
    (state.dose! * state.largeur! * state.vitesse!) / 600;

  const rangs =
    state.machineType === "viti"
      ? state.modelKey!.includes("4r")
        ? 4
        : 3
      : state.machineType === "arbo"
      ? 2
      : 1;

  const qTotal = qParRang * rangs;
  state.qTotal = qTotal;

  const outputs = getOutputsAndCoefs();
  const sumCoef = outputs.coefs.reduce((a, b) => a + b, 0);
  const targets = outputs.coefs.map(c => qTotal * (c / sumCoef));

  const opt = optimizePressureAndNozzlesForFamily(fam, targets);

  state.recommendedPressure = opt.P;

  state.results = outputs.names.map((name, i) => {
    const r = opt.results[i];
    return {
      outputName: name,
      coef: outputs.coefs[i],
      qTarget: r.qTarget,
      nozzleLabel: r.nozzle.code,
      qRef: r.nozzle.qRef,
      pressure: opt.P,
      qReal: r.q,
      relError: r.relErr,
      status: pressureStatus(opt.P, fam),
    };
  });

  // 🔒 VERROUILLAGE DES BUSES
  state.lockedNozzles = state.results.map(r => ({
    nozzleLabel: r.nozzleLabel,
    qRef: r.qRef,
  }));

  renderSummary();
  renderTables();
}

/* ============================================================
   RECALCUL À BUSES FIXES (NOUVELLE FEATURE)
============================================================ */

function recomputeWithLockedNozzles(): void {
  if (!state.lockedNozzles) return;

  const fam = nozzleFamilies[state.familyKey!];

  const qParRang =
    (state.dose! * state.largeur! * state.vitesse!) / 600;

  const rangs =
    state.machineType === "viti"
      ? state.modelKey!.includes("4r")
        ? 4
        : 3
      : state.machineType === "arbo"
      ? 2
      : 1;

  const qTotal = qParRang * rangs;
  state.qTotal = qTotal;

  const outputs = getOutputsAndCoefs();
  const sumCoef = outputs.coefs.reduce((a, b) => a + b, 0);
  const targets = outputs.coefs.map(c => qTotal * (c / sumCoef));

  const P = pressureForFlow(
    targets[0],
    state.lockedNozzles[0].qRef,
    fam.refPressure
  );

  state.recommendedPressure = P;

  state.results = outputs.names.map((name, i) => {
    const qRef = state.lockedNozzles![i].qRef;
    const qReal = flowAtPressure(qRef, P, fam.refPressure);
    const relError = (qReal - targets[i]) / targets[i];

    return {
      outputName: name,
      coef: outputs.coefs[i],
      qTarget: targets[i],
      nozzleLabel: state.lockedNozzles![i].nozzleLabel,
      qRef,
      pressure: P,
      qReal,
      relError,
      status: pressureStatus(P, fam),
    };
  });

  renderSummary();
  renderTables();
}

/* ============================================================
   RENDER
============================================================ */

function renderSummary(): void {
  $("#sumDose").textContent = `${state.dose} L/ha`;
  $("#sumLargeur").textContent = `${state.largeur} m`;
  $("#sumVitesse").textContent = `${state.vitesse} km/h`;
  $("#sumQtotal").textContent = state.qTotal.toFixed(2);
  $("#sumPressure").textContent =
    state.recommendedPressure.toFixed(2) + " bar";
}

function renderTables(): void {
  const body = $("#resultBody");
  body.innerHTML = "";

  state.results.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.outputName}</td>
      <td class="num">${r.qTarget.toFixed(2)}</td>
      <td>${r.nozzleLabel}</td>
      <td class="num">${r.pressure.toFixed(2)}</td>
      <td>${r.status}</td>
    `;
    body.appendChild(tr);
  });
}

/* ============================================================
   EVENTS
============================================================ */

$("#btnRecalc")?.addEventListener("click", recomputeWithLockedNozzles);

/* ============================================================
   INIT
============================================================ */

window.addEventListener("DOMContentLoaded", () => {
  // init UI existante
});
