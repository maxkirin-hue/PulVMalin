/* ---------- TYPES ---------- */

export interface NozzleVariant {
  code: string;
  qRef: number;
  faceLabel?: string | null;
}

export interface NozzleFamily {
  refPressure: number;
  optimalRange: [number, number];
  limitRange: [number, number];
  nozzles: NozzleVariant[];
}

/* ---------- HYDRAULIQUE ---------- */

export function pressureForFlow(
  qTarget: number,
  qRef: number,
  pRef: number
): number {
  return pRef * Math.pow(qTarget / qRef, 2);
}

export function flowAtPressure(
  qRef: number,
  pressure: number,
  pRef: number
): number {
  return qRef * Math.sqrt(pressure / pRef);
}

/* ---------- STATUT PRESSION ---------- */

export function pressureStatus(
  pressure: number,
  family: NozzleFamily
): "OK" | "Limite" | "Changer" | "—" {
  if (!Number.isFinite(pressure)) return "—";

  if (
    pressure < family.limitRange[0] ||
    pressure > family.limitRange[1]
  ) {
    return "Changer";
  }

  if (
    pressure < family.optimalRange[0] ||
    pressure > family.optimalRange[1]
  ) {
    return "Limite";
  }

  return "OK";
}

/* ---------- CHOIX DE PASTILLE (PRESSION CIBLE) ---------- */

export function chooseVariantForPressureTarget(
  family: NozzleFamily,
  qTarget: number,
  pressureTarget: number
): NozzleVariant {
  let best: NozzleVariant | null = null;
  let bestScore = Infinity;

  family.nozzles.forEach(nz => {
    const p = pressureForFlow(qTarget, nz.qRef, family.refPressure);
    const score = Math.abs(p - pressureTarget);

    if (
      p >= family.limitRange[0] &&
      p <= family.limitRange[1] &&
      score < bestScore
    ) {
      bestScore = score;
      best = nz;
    }
  });

  return best ?? family.nozzles[0];
}

/* ---------- CHOIX OPTIMAL AUTOMATIQUE ---------- */

export function chooseBestVariantForTargetFlow(
  family: NozzleFamily,
  qTarget: number
): NozzleVariant {
  let best: NozzleVariant | null = null;
  let bestScore = Infinity;

  const center =
    (family.optimalRange[0] + family.optimalRange[1]) / 2;

  family.nozzles.forEach(nz => {
    const p = pressureForFlow(qTarget, nz.qRef, family.refPressure);

    if (
      p < family.limitRange[0] ||
      p > family.limitRange[1]
    ) {
      return;
    }

    const dist = Math.abs(p - center);
    const penalty =
      p >= family.optimalRange[0] &&
      p <= family.optimalRange[1]
        ? 0
        : 50;

    const score = dist + penalty;

    if (score < bestScore) {
      bestScore = score;
      best = nz;
    }
  });

  return best ?? family.nozzles[0];
}
