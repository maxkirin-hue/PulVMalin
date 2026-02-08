import { state } from "../state/state";

/* =========================================================
   MODÈLES VITI
========================================================= */

export interface VitiOutput {
  name: string;
  role: "complete" | "moitie";
  group: 1 | 2;
}

export const vitiModels: Record<string, VitiOutput[]> = {
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
    { name: "Main G1", role: "complete", group: 1 },
    { name: "Main G2", role: "complete", group: 1 },
    { name: "Main D2", role: "complete", group: 1 },
    { name: "Main D1", role: "complete", group: 1 },
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

/* =========================================================
   SORTIES & COEFFICIENTS
========================================================= */

export interface OutputsAndCoefs {
  names: string[];
  coefs: number[];
  modelLabel: string;
}

export function getOutputsAndCoefs(): OutputsAndCoefs {

  /* ============================
       MODE VITI
  ============================ */
  if (state.machineType === "viti") {
    const model = vitiModels[state.modelKey!];
    if (!model) return { names: [], coefs: [], modelLabel: "—" };

    const names = model.map(o => o.name);
    const coefs = model.map(o => (o.role === "complete" ? 1 : 0.5));

    const modelLabel =
      state.modelKey === "3r_avec" ? "Viti — 3 rangs avec retour" :
      state.modelKey === "4r_avec" ? "Viti — 4 rangs avec retour" :
      state.modelKey === "3r_sans" ? "Viti — 3 rangs sans retour" :
      state.modelKey === "4r_sans" ? "Viti — 4 rangs sans retour" :
      "Viti";

    return { names, coefs, modelLabel };
  }

  /* ============================
       MODE ARBO
  ============================ */
  if (state.machineType === "arbo") {
    const n = state.arboRangs ?? 2;
    const names: string[] = [];

    for (let i = 1; i <= n; i++) names.push(`Buse G${i}`);
    for (let i = 1; i <= n; i++) names.push(`Buse D${i}`);

    return {
      names,
      coefs: Array(n * 2).fill(1),
      modelLabel: "Arbo",
    };
  }

  /* ============================
       MODE TANGENTIEL
  ============================ */
  if (state.machineType === "tangentiel") {
    const n = state.arboRangs ?? 2;
    const names: string[] = [];

    for (let i = 1; i <= n; i++) names.push(`Buse G${i}`);
    for (let i = 1; i <= n; i++) names.push(`Buse D${i}`);

    return {
      names,
      coefs: Array(n * 2).fill(1),
      modelLabel: "Tangentiel",
    };
  }

  /* ============================
       MODE RAMPE
  ============================ */
  if (state.machineType === "rampe") {
    const n = state.rampeCount ?? 1;
    const names = Array.from({ length: n }, (_, i) => `Buse ${i + 1}`);

    return {
      names,
      coefs: Array(n).fill(1),
      modelLabel: "Rampe désherbage",
    };
  }

  return { names: [], coefs: [], modelLabel: "—" };
}
