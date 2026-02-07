import { state } from "../state/state";
import { nozzleFamilies } from "../data/nozzles";
import { getOutputsAndCoefs } from "./models";
import { flowAtPressure, pressureStatus } from "./hydraulics";

/* =========================================================
   TYPES
========================================================= */

type NozzleVariant = {
  code: string;
  qRef: number;
  color?: string;
};

interface OptimizationResult {
  nozzle: NozzleVariant;
  q: number;
  qTarget: number;
  relErr: number;

 
}

interface OptimizationOutput {
  P: number;
  results: OptimizationResult[];
  Qtot: number;
  relErrTot: number;
  cost: number;
}
function getNozzleVariants(fam: any): NozzleVariant[] {
  const variants: NozzleVariant[] = [];

  (fam?.nozzles ?? []).forEach((n: any) => {
    if (Array.isArray(n.faces)) {
      n.faces.forEach((f: any) => {
        if (typeof f?.qRef === "number") {
          variants.push({
            code: `${n.code} (${f.label})`,
            qRef: f.qRef,
          });
        }
      });
      return;
    }

    if (typeof n?.qRef === "number") {
      variants.push({
        code: n.code,
        qRef: n.qRef,
        color: n.color,
      });
    }
  });

  return variants;
}

/* =========================================================
   DÉTECTION NOMBRE DE RANGS / SORTIES
========================================================= */

function detectRangs(): number {
  let rangs = 1;

  if (state.machineType === "viti") {
    if (state.modelKey?.includes("3r")) rangs = 3;
    if (state.modelKey?.includes("4r")) rangs = 4;
  }

  if (state.machineType === "arbo") {
  rangs = state.arboRangs ?? 2;
}
  
if (state.machineType === "tangentiel") {
  rangs = 2; // gauche + droite
} 
  return rangs;
}
/* =========================================================
   OPTIMISATION PRESSION + PASTILLES (MODE COMPLET)
========================================================= */

export function optimizePressureAndNozzlesForFamily(
  fam: any,
  targets: number[],
  familyKey: string
): OptimizationOutput {
  const refP = fam?.refPressure ?? 3;

  const familyTargetPressures: Record<string, number> = {
    CP4916: 3,
    AMT: 2,
    ATR80: 10,
    IDK90: 5,
    TXR: 10,
    XR: 2,
    AD90: 3,
  };

  const preferredP = familyTargetPressures[familyKey] ?? refP;

  const Pmin = Math.max(fam.limitRange[0], preferredP - 1.5);
  const Pmax = Math.min(fam.limitRange[1], preferredP + 1.5);
  const step = 0.1;

  const variants = getNozzleVariants(fam);
  if (!variants.length) {
    return {
      P: preferredP,
      results: targets.map(t => ({
        nozzle: { code: "—", qRef: 0 },
        q: 0,
        qTarget: t,
        relErr: 0,
      })),
      Qtot: 0,
      relErrTot: 0,
      cost: Number.POSITIVE_INFINITY,
    };
  }

  let best: OptimizationOutput | null = null;

  for (let P = Pmin; P <= Pmax + 1e-6; P += step) {
    const results: OptimizationResult[] = [];
    let Qtot = 0;
    let sumErr2 = 0;

    for (let i = 0; i < targets.length; i++) {
      const qTarget = targets[i];

      let bestNozzle = variants[0];
      let bestErr = Infinity;
      let bestQ = 0;

      for (const nz of variants) {
        const q = flowAtPressure(nz.qRef, P, refP);
        const err = Math.abs(q - qTarget);

        if (err < bestErr) {
          bestErr = err;
          bestNozzle = nz;
          bestQ = q;
        }
      }

      const relErr = qTarget > 0 ? (bestQ - qTarget) / qTarget : 0;

      sumErr2 += relErr * relErr;
      Qtot += bestQ;

      results.push({
        nozzle: bestNozzle,
        q: bestQ,
        qTarget,
        relErr,
      });
    }

    const QtargetTot = targets.reduce((a, b) => a + b, 0);
    const relErrTot = QtargetTot > 0 ? (Qtot - QtargetTot) / QtargetTot : 0;

    const w1 = 1;
    const w2 = 2;
    const w3 = 0.5;

    const cost =
      w1 * sumErr2 +
      w2 * relErrTot * relErrTot +
      w3 * Math.pow((P - preferredP) / preferredP, 2);

    if (!best || cost < best.cost) best = { P, results, Qtot, relErrTot, cost };
  }

  return best!;
}

/* =========================================================
   CALCUL GLOBAL COMPLET (PASTILLES + PRESSION)
========================================================= */

export function computeAll(): void {
  if (!state.familyKey) return;

  const fam = nozzleFamilies[state.familyKey];
  if (!fam) return;

  const { names, coefs } = getOutputsAndCoefs();
  if (!names.length || !coefs.length) return;

  const rangs = detectRangs();
  const largeurTotale = state.interligne! * rangs;

  const qTotal = (state.dose! * largeurTotale * state.speed!) / 600;
  state.qTotal = qTotal;

  const sumCoef = coefs.reduce((a, b) => a + b, 0);
  const targets = coefs.map(c => qTotal * (c / sumCoef));

  const opt = optimizePressureAndNozzlesForFamily(fam, targets, state.familyKey);

  state.recommendedPressure = opt.P;

  state.results = names.map((name, idx) => {
    const r = opt.results[idx];

    return {
      outputName: name,
      coef: coefs[idx],
      qTarget: r.qTarget,
      nozzleLabel: r.nozzle.code,
      nozzleColor: r.nozzle.color,
      pressure: opt.P,
      qReal: r.q,
      relError: r.relErr,
      status: pressureStatus(opt.P, fam as any),
    };
  });

  // on fige le choix des pastilles pour les recalculs ultérieurs
  (state as any).fixedNozzles = state.results.map(r => r.nozzleLabel);
}

/* =========================================================
   OUTILS POUR LE RECALCUL PRESSION SEULEMENT
========================================================= */

function findNozzleVariantByLabel(fam: any, label: string): NozzleVariant {
  const variants = getNozzleVariants(fam);
  const found = variants.find(v => v.code === label);
  return found ?? variants[0];
}

/* =========================================================
   RECALCUL PRESSION EN FIXANT LES PASTILLES
   - on peut changer dose et/ou interligne AVANT d’appeler cette fonction
   - les pastilles restent celles de state.fixedNozzles
========================================================= */

export function recomputePressureOnly(): void {
  if (!state.familyKey) return;

  const fam = nozzleFamilies[state.familyKey];
  if (!fam) return;

  const { coefs } = getOutputsAndCoefs();
  if (!coefs.length) return;

  const fixedNozzles: string[] = (state as any).fixedNozzles ?? [];
  if (!fixedNozzles.length) return;

  const rangs = detectRangs();
  const largeurTotale = state.interligne! * rangs;

  const qTotal = (state.dose! * largeurTotale * state.speed!) / 600;
  state.qTotal = qTotal;

  const sumCoef = coefs.reduce((a, b) => a + b, 0);
  const targets = coefs.map(c => qTotal * (c / sumCoef));

  const refP = fam?.refPressure ?? 3;
  const Pmin = fam.limitRange[0];
  const Pmax = fam.limitRange[1];
  const step = 0.1;

  let bestP = refP;
  let bestCost = Infinity;

  for (let P = Pmin; P <= Pmax + 1e-6; P += step) {
    let sumErr2 = 0;

    for (let i = 0; i < targets.length; i++) {
      const nozzleLabel = fixedNozzles[i];
      const nozzle = findNozzleVariantByLabel(fam, nozzleLabel);
      const q = flowAtPressure(nozzle.qRef, P, refP);
      const qTarget = targets[i];

      const relErr = qTarget > 0 ? (q - qTarget) / qTarget : 0;
      sumErr2 += relErr * relErr;
    }

    if (sumErr2 < bestCost) {
      bestCost = sumErr2;
      bestP = P;
    }
  }

  state.recommendedPressure = bestP;
}