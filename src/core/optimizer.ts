/* =========================================================
   OPTIMIZER — computeAll + recomputePressureOnly
   - Viti / Arbo / Tangentiel : coefs = parts DU RANG (normalisés AU RANG)
   - Rampe : coefs = pondérations DU TOTAL (normalisés AU TOTAL)
========================================================= */

import { state } from "../state/state";
import { nozzleFamilies, NozzleFamily } from "../data/nozzles";
import { getOutputsAndCoefs } from "./models";

/* =========================================================
   HYDRAULIQUE
========================================================= */

function flowAtPressure(qRef: number, P: number, refP: number): number {
  if (!qRef || qRef <= 0) return 0;
  if (!P || P <= 0) return 0;
  if (!refP || refP <= 0) return qRef;
  return qRef * Math.sqrt(P / refP);
}

function pressureStatus(P: number, fam: NozzleFamily): "ok" | "limit" | "bad" {
  const [min, max] = Array.isArray(fam.limitRange) ? fam.limitRange : [1, 6];
  if (P < min || P > max) return "bad";
  if (P < min + 0.2 || P > max - 0.2) return "limit";
  return "ok";
}

/* =========================================================
   HELPERS MÉTIER
========================================================= */

function getValidatedInputs() {
  const interligne = state.interligne ?? state.largeur;
  const speed = state.speed ?? state.vitesse;
  const dose = state.dose;

  if (
    typeof interligne !== "number" ||
    typeof speed !== "number" ||
    typeof dose !== "number"
  ) return null;

  if (interligne <= 0 || speed <= 0 || dose <= 0) return null;

  return { interligne, speed, dose };
}

function detectRangs(): number {
  if (state.machineType === "rampe") return 1;
  if (state.machineType === "tangentiel") return 2;
  if (state.machineType === "arbo") return state.arboRangs ?? 2;

  if (state.machineType === "viti") {
    const key = (state.modelKey ?? "").toLowerCase();
    if (key.includes("4r")) return 4;
    if (key.includes("3r")) return 3;
    if (key.includes("2r")) return 2;
  }

  return 1;
}

function computeQTotal(dose: number, speed: number, largeurTotale: number): number {
  return (dose * speed * largeurTotale) / 600;
}

/* Viti / Arbo / Tangentiel : coefs = parts DU RANG (normalisés AU RANG) */
function computeTargetsPerRang(qTotal: number, rangs: number, coefs: number[]): number[] {
  const qParRang = qTotal / rangs;
  const sumCoef = coefs.reduce((a, b) => a + b, 0);
  if (!sumCoef) return coefs.map(() => 0);
  return coefs.map(c => qParRang * (c / sumCoef));
}

/* Rampe : coefs = pondérations DU TOTAL (normalisés AU TOTAL) */
function computeTargetsNormalized(qTotal: number, coefs: number[]): number[] {
  const sum = coefs.reduce((a, b) => a + b, 0);
  if (!sum) return coefs.map(() => 0);
  return coefs.map(c => qTotal * (c / sum));
}

/* =========================================================
   OPTIMISATION PRESSION + PASTILLES
========================================================= */

type NozzleVariant = {
  code: string;
  qRef: number;
  color?: string;
};

function getNozzleVariants(fam: NozzleFamily): NozzleVariant[] {
  const variants: NozzleVariant[] = [];

  fam.nozzles.forEach((n: any) => {
    if (Array.isArray(n.faces)) {
      n.faces.forEach((f: any) => {
        if (typeof f.qRef === "number") {
          variants.push({
            code: `${n.code} (${f.label})`,
            qRef: f.qRef,
            color: n.color,
          });
        }
      });
    } else if (typeof n.qRef === "number") {
      variants.push({
        code: n.code,
        qRef: n.qRef,
        color: n.color,
      });
    }
  });

  return variants;
}
function optimizePressureAndNozzles(
  fam: NozzleFamily,
  targets: number[]
) {
  const refP = fam.refPressure ?? 3;
  const [Pmin, Pmax] = fam.limitRange ?? [1, 6];
  const step = 0.1;

  // 🎯 pression cible (logique constructeur retrouvée)
  const preferredP =
    fam.refPressure ??
    (fam.optimalRange
      ? (fam.optimalRange[0] + fam.optimalRange[1]) / 2
      : 3);

  const variants = getNozzleVariants(fam);
  let best: any = null;

  for (let P = Pmin; P <= Pmax + 1e-6; P += step) {
    let sumErr2 = 0;
    const results: any[] = [];

    for (let i = 0; i < targets.length; i++) {
      const qTarget = targets[i];
      let bestNz = variants[0];
      let bestErr = Infinity;
      let bestQ = 0;

      for (const nz of variants) {
        const q = flowAtPressure(nz.qRef, P, refP);
        const err =
          qTarget > 0 ? Math.abs(q - qTarget) / qTarget : 0;

        if (err < bestErr) {
          bestErr = err;
          bestNz = nz;
          bestQ = q;
        }
      }

      sumErr2 += bestErr * bestErr;

      results.push({
        nozzle: bestNz,
        q: bestQ,
        qTarget,
        relErr: bestErr,
      });
    }

    // 🔒 pénalité d’éloignement de la pression cible
    const pressurePenalty = Math.pow((P - preferredP) / preferredP, 2);

    const cost = sumErr2 + 3 * pressurePenalty;

    if (!best || cost < best.cost) {
      best = { P, results, cost };
    }
  }

  return best;
}


/* =========================================================
   computeAll — ORCHESTRATEUR
========================================================= */

export function computeAll(): void {
  if (!state.familyKey) return;

  const fam = nozzleFamilies[state.familyKey];
  if (!fam) return;

  const { names, coefs } = getOutputsAndCoefs();
  if (!coefs.length) {
    state.results = [];
    return;
  }

  const inputs = getValidatedInputs();
  if (!inputs) return;

  const { interligne, speed, dose } = inputs;
  const rangs = detectRangs();

  const largeurTotale =
    state.machineType === "rampe"
      ? (state.largeur ?? interligne)
      : interligne * rangs;

  const qTotal = computeQTotal(dose, speed, largeurTotale);
  state.qTotal = qTotal;

  const targets =
    state.machineType === "rampe"
      ? computeTargetsNormalized(qTotal, coefs)
      : computeTargetsPerRang(qTotal, rangs, coefs);

  const opt = optimizePressureAndNozzles(fam, targets);
  state.recommendedPressure = opt.P;

  state.results = names.map((name, i) => {
    const r = opt.results[i];
    return {
      outputName: name,
      coef: coefs[i],
      qTarget: r.qTarget,
      nozzleLabel: r.nozzle.code,
      nozzleColor: r.nozzle.color,
      pressure: opt.P,
      qReal: r.q,
      relError: r.relErr,
      status: pressureStatus(opt.P, fam),
    };
  });

  (state as any).fixedNozzles = state.results.map(r => r.nozzleLabel);
}

/* =========================================================
   recomputePressureOnly — pression seule, pastilles figées
========================================================= */

function findVariantByLabel(fam: NozzleFamily, label: string): NozzleVariant | null {
  const variants = getNozzleVariants(fam);
  const v = variants.find(x => x.code === label);
  return v ?? null;
}

export function recomputePressureOnly(): void {
  if (!state.familyKey) return;

  const fam = nozzleFamilies[state.familyKey];
  if (!fam) return;

  const { coefs } = getOutputsAndCoefs();
  if (!coefs.length) return;

  const fixedNozzles: string[] = (state as any).fixedNozzles ?? [];
  if (!fixedNozzles.length) return;

  const inputs = getValidatedInputs();
  if (!inputs) return;

  const { interligne, speed, dose } = inputs;
  const rangs = detectRangs();

  const largeurTotale =
    state.machineType === "rampe"
      ? (state.largeur ?? interligne)
      : interligne * rangs;

  const qTotal = computeQTotal(dose, speed, largeurTotale);
  state.qTotal = qTotal;

  const targets =
    state.machineType === "rampe"
      ? computeTargetsNormalized(qTotal, coefs)
      : computeTargetsPerRang(qTotal, rangs, coefs);

  const refP = fam.refPressure ?? 3;
  const [Pmin, Pmax] = fam.limitRange ?? [1, 6];
  const step = 0.1;

  let bestP = refP;
  let bestCost = Infinity;

  const steps = Math.max(1, Math.round((Pmax - Pmin) / step));
  for (let s = 0; s <= steps; s++) {
    const P = +(Pmin + s * step).toFixed(6);
    let sumErr2 = 0;
    let valid = true;

    for (let i = 0; i < targets.length; i++) {
      const label = fixedNozzles[i];
      if (!label) continue;

      const nozzle = findVariantByLabel(fam, label);
      if (!nozzle) {
        valid = false;
        break;
      }

      const q = flowAtPressure(nozzle.qRef, P, refP);
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

  state.recommendedPressure = Number.isFinite(bestCost) ? bestP : refP;
}
