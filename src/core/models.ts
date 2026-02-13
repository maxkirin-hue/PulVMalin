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
    const n = state.arboRangs ?? 2;
    const names: string[] = [];
    for (let i = 1; i <= n; i++) names.push(`Buse G${i}`);
    for (let i = 1; i <= n; i++) names.push(`Buse D${i}`);

    return {
      names,
      roles: Array(n * 2).fill("complete"),
      groups: Array(n * 2).fill(1),
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
