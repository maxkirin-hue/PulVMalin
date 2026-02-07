export interface AppState {
  userName: string | null;

  machineType: string | null;
  machineName: string | null;

  dose: number | null;
  interligne: number | null;
  speed: number | null;

  familyKey: string | null;

  // Viti
  modelKey: string | null;

  // Arbo
  arboCount: number | null;
  arboRangs: number | null;

  // Rampe
  rampeCount: number | null;

  // Résultats
  qTotal: number | null;
  recommendedPressure: number | null;

  results: any[];

  // Pastilles figées pour recalcul pression
  fixedNozzles?: string[];
}

export const state: AppState = {
  userName: null,

  machineType: null,
  machineName: null,

  dose: null,
  interligne: null,
  speed: null,

  familyKey: null,

  modelKey: null,
  arboCount: null,
  rampeCount: null,
arboRangs: null,
  qTotal: null,
  recommendedPressure: null,

  results: [],
  fixedNozzles: [],
};