/* =========================================================
   OPTIMIZER — computeAll + recomputePressureOnly
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
  const [min, max] = fam.limitRange ?? [1, 6];
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

  if (!interligne || !speed || !dose) return null;
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
  targets: number[],
  names: string[]
) {
  const refP = fam.refPressure ?? 3;
  const [Pmin, Pmax] = fam.limitRange ?? [1, 6];
  const step = 0.1;

  const preferredP =
    fam.refPressure ??
    (fam.optimalRange
      ? (fam.optimalRange[0] + fam.optimalRange[1]) / 2
      : 3);

  const variants = getNozzleVariants(fam);
  const groups = names.map(n =>
    n.toLowerCase().includes("retour") ? "retour" :
    n.toLowerCase().includes("canon") ? "canon" : "main"
  );

  const uniqueGroups = Array.from(new Set(groups));
  let best: any = null;

  for (let P = Pmin; P <= Pmax + 1e-6; P += step) {
    let sumErr2 = 0;
    const results: any[] = new Array(targets.length);

    for (const g of uniqueGroups) {
      const idxs = groups
        .map((gg, i) => (gg === g ? i : -1))
        .filter(i => i >= 0);

      const qTargetGroup = idxs.reduce((s, i) => s + targets[i], 0);

      let bestNz = variants[0];
      let bestErr = Infinity;
      let bestQ = 0;

      for (const nz of variants) {
        const q = flowAtPressure(nz.qRef, P, refP);
        if (q < qTargetGroup) continue;

        const err = (q - qTargetGroup) / qTargetGroup;
        if (err < bestErr) {
          bestErr = err;
          bestNz = nz;
          bestQ = q;
        }
      }

      for (const i of idxs) {
        const qTarget = targets[i];
        const relErr = (bestQ - qTarget) / qTarget;

        results[i] = {
          nozzle: bestNz,
          q: bestQ,
          qTarget,
          relErr,
        };

        sumErr2 += relErr * relErr;
      }
    }

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

  const { names, roles, groups } = getOutputsAndCoefs();
  if (!names.length) return;

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

  const qParRang = qTotal / rangs;

  const groupRoleSum: Record<number, number> = {};
  roles.forEach((r, i) => {
    const g = groups[i];
    groupRoleSum[g] = (groupRoleSum[g] ?? 0) + (r === "complete" ? 1 : 0.5);
  });

  const totalRole = Object.values(groupRoleSum).reduce((a, b) => a + b, 0);

  const groupFlow: Record<number, number> = {};
  Object.keys(groupRoleSum).forEach(g => {
    groupFlow[+g] = qParRang * (groupRoleSum[+g] / totalRole);
  });

  const targets = roles.map((r, i) =>
    groupFlow[groups[i]] * (r === "complete" ? 1 : 0.5)
  );

  const opt = optimizePressureAndNozzles(fam, targets, names);
  state.recommendedPressure = opt.P;

  state.results = names.map((name, i) => {
    const r = opt.results[i];
return {
  outputName: name,
  coef: roles[i] === "complete" ? 1 : 0.5,
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
