/* =========================================================
   OPTIMIZER — computeAll + recomputePressureOnly
   - computeAll : recherche la pression unique qui minimise l'erreur
   - recomputePressureOnly : recalcul en gardant pastilles figées
========================================================= */

import { state } from "../state/state";
import { nozzleFamilies, NozzleFamily, Nozzle } from "../data/nozzles";
import { getOutputsAndCoefs } from "./models";

/* Helper: flow scaling law (approximation)
   q scales with sqrt(P) relative to refP */
function flowAtPressure(qRef: number, P: number, refP: number) {
  if (!qRef || qRef <= 0) return 0;
  if (!refP || refP <= 0) return qRef;
  return qRef * Math.sqrt(P / refP);
}

/* Helper: find nozzle in family by code/label/color/faces */
function findNozzleInFamily(fam: NozzleFamily, labelOrCode: string | null | undefined): Nozzle | undefined {
  if (!fam || !labelOrCode) return undefined;
  const key = labelOrCode.trim();

  const byCode = fam.nozzles.find(n => n.code === key);
  if (byCode) return byCode;

  const byCodePartial = fam.nozzles.find(n => n.code.replace(/\s+/g, "").includes(key.replace(/\s+/g, "")));
  if (byCodePartial) return byCodePartial;

  for (const n of fam.nozzles) {
    if (Array.isArray((n as any).faces)) {
      const f = (n as any).faces.find((face: any) => face.label === key || face.side === key);
      if (f) return { ...n, qRef: f.qRef };
    }
  }

  const byColor = fam.nozzles.find(n => (n as any).color === key);
  if (byColor) return byColor;

  return undefined;
}

/* Helper: detect rangs (fallback) */
function detectRangs() {
  if (state.machineType === "viti") {
    // approximate: count of canon groups in outputs if available
    const out = state.outputs ?? [];
    const canonCount = out.filter(o => o.name.toLowerCase().includes("canon")).length;
    return Math.max(1, Math.ceil(canonCount / 2));
  }
  if (state.machineType === "arbo" || state.machineType === "tangentiel") {
    return state.arboRangs ?? 2;
  }
  return 1;
}

/* computeAll:
   - calcule qTotal
   - pour chaque pression candidate, pour chaque sortie choisit la pastille qui minimise l'écart
   - choisit la pression qui minimise l'erreur quadratique totale
   - remplit state.results, state.qTotal, state.recommendedPressure
*/
export function computeAll(): void {
  if (!state.familyKey) return;
  const fam = nozzleFamilies[state.familyKey];
  if (!fam) return;

  const { names: outputNames, coefs } = getOutputsAndCoefs();
  if (!coefs || coefs.length === 0) {
    state.results = [];
    return;
  }

  const interligne = state.interligne ?? state.largeur;
  const speed = state.speed ?? state.vitesse;
  const dose = state.dose;
  if (!interligne || !speed || !dose) return;

  const rangs = detectRangs();
  const largeurTotale = interligne * rangs;
  const qTotal = (dose * largeurTotale * speed) / 600;
  state.qTotal = qTotal;

  const sumCoef = coefs.reduce((a, b) => a + b, 0);
  if (sumCoef === 0) return;
  const targets = coefs.map(c => qTotal * (c / sumCoef));

  const refP = typeof fam.refPressure === "number" ? fam.refPressure : 3;
  const Pmin = Array.isArray(fam.limitRange) ? fam.limitRange[0] : 1;
  const Pmax = Array.isArray(fam.limitRange) ? fam.limitRange[1] : 6;
  const step = 0.1;

  let bestP = refP;
  let bestCost = Infinity;
  let bestAssignment: { label: string; qReal: number }[] = [];

  const steps = Math.max(1, Math.round((Pmax - Pmin) / step));
  for (let s = 0; s <= steps; s++) {
    const P = +(Pmin + s * step).toFixed(6);
    let sumErr2 = 0;
    const assignment: { label: string; qReal: number }[] = [];

    for (let i = 0; i < targets.length; i++) {
      const qTarget = targets[i];
      // find nozzle in family that gives q closest to qTarget at pressure P
      let bestNozzle: Nozzle | undefined;
      let bestDiff = Infinity;
      for (const n of fam.nozzles) {
        // if faces exist, consider each face as separate candidate
        if (Array.isArray((n as any).faces)) {
          for (const f of (n as any).faces) {
            const q = flowAtPressure(f.qRef, P, fam.refPressure);
            const diff = Math.abs(q - qTarget);
            if (diff < bestDiff) {
              bestDiff = diff;
              bestNozzle = { ...n, qRef: f.qRef };
            }
          }
        } else {
          const q = flowAtPressure(n.qRef, P, fam.refPressure);
          const diff = Math.abs(q - qTarget);
          if (diff < bestDiff) {
            bestDiff = diff;
            bestNozzle = n;
          }
        }
      }

      if (!bestNozzle) {
        sumErr2 = Infinity;
        break;
      }

      const qReal = flowAtPressure(bestNozzle.qRef, P, fam.refPressure);
      const relErr = qTarget > 0 ? (qReal - qTarget) / qTarget : 0;
      sumErr2 += relErr * relErr;
      assignment.push({ label: bestNozzle.code, qReal });
    }

    if (sumErr2 < bestCost) {
      bestCost = sumErr2;
      bestP = P;
      bestAssignment = assignment;
    }
  }

  // Build results using bestAssignment
  const results = outputNames.map((name, i) => {
    const coef = coefs[i];
    const qTarget = targets[i];
    const assigned = bestAssignment[i];
    const nozzleLabel = assigned ? assigned.label : "";
    const qReal = assigned ? assigned.qReal : 0;
    const relError = qTarget > 0 ? (qReal - qTarget) / qTarget : 0;
    return {
      outputName: name,
      coef,
      qTarget,
      nozzleLabel,
      nozzleColor: undefined,
      pressure: bestP,
      qReal,
      relError,
      status: ""
    };
  });

  state.results = results;
  state.recommendedPressure = bestP;
}

/* =========================================================
   RE-CALCUL PRESSION EN FIXANT LES PASTILLES
   - version robuste qui utilise mapping pastille->sortie si nécessaire
========================================================= */

function buildFixedMapForOutputs(outputNames: string[], fixedNozzles: string[], fam: NozzleFamily) {
  const n = outputNames.length;
  const map: (string | null)[] = new Array(n).fill(null);
  if (!fixedNozzles || fixedNozzles.length === 0) return map;

  if (fixedNozzles.length === n) {
    for (let i = 0; i < n; i++) map[i] = fixedNozzles[i] || null;
    return map;
  }

  const used = new Set<number>();
  for (const label of fixedNozzles) {
    let assigned = false;
    for (let i = 0; i < n; i++) {
      if (used.has(i)) continue;
      const out = outputNames[i].toLowerCase();
      const l = label.toLowerCase();
      if (out.includes(l) || l.includes(out)) {
        map[i] = label;
        used.add(i);
        assigned = true;
        break;
      }
      const m = l.match(/g\d+|d\d+/);
      if (m && out.includes(m[0])) {
        map[i] = label;
        used.add(i);
        assigned = true;
        break;
      }
    }
    if (assigned) continue;
    for (let i = 0; i < n; i++) {
      if (!used.has(i)) {
        map[i] = label;
        used.add(i);
        break;
      }
    }
  }

  return map;
}

export function recomputePressureOnly(): void {
  if (!state.familyKey) return;
  const fam = nozzleFamilies[state.familyKey];
  if (!fam) return;

  const { names: outputNames, coefs } = getOutputsAndCoefs();
  if (!coefs || coefs.length === 0) return;

  const fixedNozzles: string[] = (state as any).fixedNozzles ?? [];
  if (!fixedNozzles || fixedNozzles.length === 0) return;

  const interligne = state.interligne ?? state.largeur;
  const speed = state.speed ?? state.vitesse;
  const dose = state.dose;
  if (!interligne || !speed || !dose) return;

  const rangs = detectRangs();
  const largeurTotale = interligne * rangs;
  const qTotal = (dose * largeurTotale * speed) / 600;
  state.qTotal = qTotal;

const qParRang = qTotal / rangs;
const targets = coefs.map(c => qParRang * c);



  const fixedMap = buildFixedMapForOutputs(outputNames, fixedNozzles, fam);

  const refP = typeof fam.refPressure === "number" ? fam.refPressure : 3;
  const Pmin = Array.isArray(fam.limitRange) ? fam.limitRange[0] : 1;
  const Pmax = Array.isArray(fam.limitRange) ? fam.limitRange[1] : 6;
  const step = 0.1;

  let bestP = refP;
  let bestCost = Infinity;

  const steps = Math.max(1, Math.round((Pmax - Pmin) / step));
  for (let s = 0; s <= steps; s++) {
    const P = +(Pmin + s * step).toFixed(6);
    let sumErr2 = 0;
    let valid = true;

    for (let i = 0; i < targets.length; i++) {
      const label = fixedMap[i];
      if (!label) continue;

      const nozzle = findNozzleInFamily(fam, label);
      if (!nozzle || typeof nozzle.qRef !== "number") {
        valid = false;
        break;
      }

      const q = flowAtPressure(nozzle.qRef, P, fam.refPressure);
      const qTarget = targets[i] ?? 0;
      const relErr = qTarget > 0 ? (q - qTarget) / qTarget : 0;
      sumErr2 += relErr * relErr;
    }

    if (!valid) continue;

    if (sumErr2 < bestCost) {
      bestCost = sumErr2;
      bestP = P;
    }
  }

  state.recommendedPressure = isFinite(bestCost) ? bestP : refP;
}
