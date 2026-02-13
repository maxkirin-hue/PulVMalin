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

  if (typeof interligne !== "number" || typeof speed !== "number" || typeof dose !== "number") return null;
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
  groups: (1 | 2)[],
) {
  const refP = fam.refPressure ?? 3;
  const [Pmin, Pmax] = fam.limitRange ?? [1, 6];
  const step = 0.1;

  const preferredP =
    fam.refPressure ??
    (fam.optimalRange ? (fam.optimalRange[0] + fam.optimalRange[1]) / 2 : 3);

  const variants = getNozzleVariants(fam);
  if (!variants.length) {
    return {
      P: preferredP,
      results: targets.map(t => ({
        nozzle: { code: "—", qRef: 0, color: undefined },
        q: 0,
        qTarget: t,
        relErr: 0,
      })),
      cost: Number.POSITIVE_INFINITY,
    };
  }

  const uniqueGroups = Array.from(new Set(groups));
  let best: any = null;

  for (let P = Pmin; P <= Pmax + 1e-6; P += step) {
    let sumErr2 = 0;
    const results: any[] = new Array(targets.length);

    for (const g of uniqueGroups) {
      const idxs = groups
        .map((gg, i) => (gg === g ? i : -1))
        .filter(i => i >= 0);

      const groupTargets = idxs.map(i => targets[i] ?? 0);
      const maxTarget = Math.max(...groupTargets, 0);

      let bestNz = variants[0];
      let bestCostGroup = Infinity;
      let bestQ = 0;

      for (const nz of variants) {
        const q = flowAtPressure(nz.qRef, P, refP);

        // coût groupe = somme des erreurs relatives², avec pénalité énorme si sous-dimensionné
        let costGroup = 0;
        for (const i of idxs) {
          const t = targets[i] ?? 0;
          if (t <= 0) continue;

          if (q < t) {
            costGroup += 1e6 + ((t - q) / t); // interdit sous-dimensionnement
          } else {
            const rel = (q - t) / t;
            costGroup += rel * rel;
          }
        }

        // petit biais pour éviter de choisir une buse trop grosse si plusieurs équivalents
        if (maxTarget > 0 && q >= maxTarget) {
          costGroup += 0.02 * ((q - maxTarget) / maxTarget);
        }

        if (costGroup < bestCostGroup) {
          bestCostGroup = costGroup;
          bestNz = nz;
          bestQ = q;
        }
      }

      for (const i of idxs) {
        const qTarget = targets[i] ?? 0;
        const relErr = qTarget > 0 ? (bestQ - qTarget) / qTarget : 0;

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

    if (!best || cost < best.cost) best = { P, results, cost };
  }

  return best;
}

/* =========================================================
   TARGETS — logique débit
========================================================= */

function roleWeight(role: "complete" | "moitie"): number {
  return role === "complete" ? 1 : 0.5;
}

function computeTargets(
  qTotal: number,
  rangs: number,
  roles: ("complete" | "moitie")[],
): number[] {
  const weights = roles.map(roleWeight);
  const sumW = weights.reduce((a, b) => a + b, 0);
  if (!sumW) return weights.map(() => 0);

  // Rampe : pondération sur le TOTAL
  if (state.machineType === "rampe") {
    return weights.map(w => qTotal * (w / sumW));
  }

  // Viti / Arbo / Tangentiel : pondération sur UN RANG
  const qParRang = qTotal / rangs;
  return weights.map(w => qParRang * (w / sumW));
}

/* =========================================================
   computeAll — ORCHESTRATEUR
========================================================= */

export function computeAll(): void {
  if (!state.familyKey) return;

  const fam = nozzleFamilies[state.familyKey];
  if (!fam) return;

  const { names, roles, groups } = getOutputsAndCoefs();
  if (!names.length) {
    state.results = [];
    state.fixedNozzles = [];
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

  const targets = computeTargets(qTotal, rangs, roles);

  const opt = optimizePressureAndNozzles(fam, targets, groups);
  state.recommendedPressure = opt.P;

  state.results = names.map((name, i) => {
    const r = opt.results[i];
    return {
      outputName: name,
      coef: roleWeight(roles[i]),
      qTarget: r.qTarget,
      nozzleLabel: r.nozzle.code,
      nozzleColor: r.nozzle.color,
      pressure: opt.P,
      qReal: r.q,
      relError: r.relErr,
      status: pressureStatus(opt.P, fam),
    };
  });

  state.fixedNozzles = state.results.map(r => r.nozzleLabel);
}

/* =========================================================
   recomputePressureOnly — pression seule, pastilles figées
========================================================= */

function findVariantByLabel(fam: NozzleFamily, label: string): NozzleVariant | null {
  const variants = getNozzleVariants(fam);
  return variants.find(v => v.code === label) ?? null;
}

export function recomputePressureOnly(): void {
  if (!state.familyKey) return;

  const fam = nozzleFamilies[state.familyKey];
  if (!fam) return;

  const { names, roles, groups } = getOutputsAndCoefs();
  if (!names.length) return;

  const fixedNozzles = state.fixedNozzles ?? [];
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

  const targets = computeTargets(qTotal, rangs, roles);

  const refP = fam.refPressure ?? 3;
  const [Pmin, Pmax] = fam.limitRange ?? [1, 6];
  const step = 0.1;

  const preferredP =
    fam.refPressure ??
    (fam.optimalRange ? (fam.optimalRange[0] + fam.optimalRange[1]) / 2 : 3);

  let bestP = preferredP;
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
      const t = targets[i] ?? 0;

      if (t > 0 && q < t) {
        sumErr2 += 1e6 + ((t - q) / t);
      } else {
        const rel = t > 0 ? (q - t) / t : 0;
        sumErr2 += rel * rel;
      }
    }

    if (!valid) continue;

    const pressurePenalty = Math.pow((P - preferredP) / preferredP, 2);
    const cost = sumErr2 + 3 * pressurePenalty;

    if (cost < bestCost) {
      bestCost = cost;
      bestP = P;
    }
  }

  state.recommendedPressure = Number.isFinite(bestCost) ? bestP : preferredP;
}
