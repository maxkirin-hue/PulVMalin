import { state } from "../state/state";

/* =========================================================
   MODÈLES VITI
========================================================= */

export interface VitiOutput {
  name: string;
  role: "complete" | "moitie";
  group: 1 | 2;
}

export interface OutputsAndCoefs {
  names: string[];
  roles: ("complete" | "moitie")[];
  groups: (1 | 2)[];
  modelLabel: string;
}
type ModelOutputDef = {
  name: string;
  role: "complete" | "moitie";
  group: 1 | 2;
  nozzleCount?: number; // nombre de buses physiques (défaut = 1)
};

export const vitiModels: Record<string, ModelOutputDef[]> = {

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

  "3r_avec_jet_projete": [
  { name: "Canon G1", role: "moitie", group: 1, nozzleCount: 1 },
  { name: "Canon G2", role: "moitie", group: 1, nozzleCount: 1 },
  { name: "Canon D2", role: "moitie", group: 1, nozzleCount: 1 },
  { name: "Canon D1", role: "moitie", group: 1, nozzleCount: 1 },

  { name: "Main retour G", role: "complete", group: 2, nozzleCount: 2 },
  { name: "Main retour D", role: "complete", group: 2, nozzleCount: 2 },

  { name: "Main G1", role: "moitie", group: 1, nozzleCount: 2 },
  { name: "Main G2", role: "moitie", group: 1, nozzleCount: 2 },
  { name: "Main D2", role: "moitie", group: 1, nozzleCount: 2 },
  { name: "Main D1", role: "moitie", group: 1, nozzleCount: 2 },
],



  "viti_libre": []
};

/* =========================================================
   SORTIES & COEFFICIENTS
========================================================= */

export function getOutputsAndCoefs(): OutputsAndCoefs {

  if (state.machineType === "viti") {
    const model = vitiModels[state.modelKey!];
    if (!model) {
      return { names: [], roles: [], groups: [], modelLabel: "—" };
    }

    const names = model.map(o => o.name);
    const roles = model.map(o => o.role);
    const groups = model.map(o => o.group);

    const modelLabel =
      state.modelKey === "3r_avec" ? "Viti — 3 rangs avec retour" :
      state.modelKey === "4r_avec" ? "Viti — 4 rangs avec retour" :
      state.modelKey === "3r_sans" ? "Viti — 3 rangs sans retour" :
      state.modelKey === "4r_sans" ? "Viti — 4 rangs sans retour" :
      "Viti";

    return { names, roles, groups, modelLabel };
  }
if (state.machineType === "arbo") {
  const n = state.arboCount ?? 0;
  const r = state.arboRangs ?? 1;

  // validations métier
  if (n < 2 || n > 16 || n % 2 !== 0) {
    throw new Error("En arbo, le nombre de buses doit être pair (2 à 16).");
  }

  if (r === 2 && n % 4 !== 0) {
    throw new Error("En arbo 2 rangs, le nombre de buses doit être divisible par 4.");
  }

  // construction symétrique G/D
  const half = n / 2;
  const names = [
    ...Array.from({ length: half }, (_, i) => `Buse G${i + 1}`),
    ...Array.from({ length: half }, (_, i) => `Buse D${i + 1}`),
  ];

  return {
    names,
    roles: Array(n).fill("complete"),
    groups: Array(n).fill(1),
    modelLabel: "Arbo",
  };

  }

  if (state.machineType === "tangentiel") {
    let n = state.arboRangs ?? 2;
    if (n % 2 !== 0) n -= 1;
    const perSide = n / 2;
    const names: string[] = [];
    for (let i = 1; i <= perSide; i++) names.push(`Buse G${i}`);
    for (let i = 1; i <= perSide; i++) names.push(`Buse D${i}`);

    return {
      names,
      roles: Array(n).fill("complete"),
      groups: Array(n).fill(1),
      modelLabel: "Tangentiel",
    };
  }

  if (state.machineType === "rampe") {
    const n = state.rampeCount ?? 1;
    const names = Array.from({ length: n }, (_, i) => `Buse ${i + 1}`);

    return {
      names,
      roles: Array(n).fill("complete"),
      groups: Array(n).fill(1),
      modelLabel: "Rampe désherbage",
    };
  }

  return { names: [], roles: [], groups: [], modelLabel: "—" };
}


export function buildVitiLibreModel(params: {
  canonsG: number;
  canonsD: number;
  retourG: number;
  retourD: number;
  mainsG: number;
  mainsD: number;
}): VitiOutput[] {

  const outs: VitiOutput[] = [];

  const add = (count: number, base: string, group: 1 | 2) => {
    if (count <= 0) return;

    const role: VitiOutput["role"] =
      count === 1 ? "complete" : "moitie";

    for (let i = 1; i <= count; i++) {
      outs.push({
        name: `${base} ${i}`,
        role,
        group
      });
    }
  };

  add(params.canonsG, "Canon G", 1);
  add(params.canonsD, "Canon D", 1);

  add(params.retourG, "Main retour G", 2);
  add(params.retourD, "Main retour D", 2);

  add(params.mainsG, "Main G", 1);
  add(params.mainsD, "Main D", 1);

  return outs;
}
