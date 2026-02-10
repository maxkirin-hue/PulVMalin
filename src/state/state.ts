/* ============================================================
   STATE GLOBAL — PulvMalin (compatible optimizer)
============================================================ */

export interface ResultRow {
  outputName: string;
  coef: number;
  qTarget: number;
  nozzleLabel: string;
  nozzleColor?: string;
  pressure: number;
  qReal: number;
  relError: number;
  status: string;
}

export interface AppState {
  // Identité / machine
  userName: string;
  machineName: string;
  machineType: string;     // "arbo" | "viti" | "rampe" | "tangentiel"

  // Sélection famille
  familyKey: string;        // ex: "CP4916"

  // Modèle viti
  modelKey: string;         // ex: "3r", "4r"

  // Paramètres
  dose: number | null;
  largeur: number | null;
  vitesse: number | null;
  rampeCount: number | null;

  // Paramètres arbo/viti
  arboRangs: number | null;
  interligne: number | null;
  speed: number | null;     // utilisé par optimizer

  // Résultats calculés
  qTotal: number;
  recommendedPressure: number;
  results: ResultRow[];
  
  // Pression souhaitée par l'utilisateur (optionnelle) 
  userPressureTarget: number | null;

  // Pastilles figées
  fixedNozzles: string[];

  // Mode forcé
  forcedToggle: boolean;
  forcedNozzle1: string;
  forcedNozzle2: string;
}

export const state: AppState = {
  userName: "",
  machineName: "",
  machineType: "",

  familyKey: "",
  modelKey: "",

  dose: null,
  largeur: null,
  vitesse: null,
  rampeCount: null,
  arboRangs: null,
  interligne: null,
  speed: null,

  qTotal: 0,
  recommendedPressure: 0,
  userPressureTarget: null,
  results: [],

  fixedNozzles: [],

  forcedToggle: false,
  forcedNozzle1: "",
  forcedNozzle2: ""
};
