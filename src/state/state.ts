/* =========================================================
   STATE GLOBAL — PulvMalin (compatible optimizer)
========================================================= */

import { VitiOutput } from "../core/models";

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
  modelKey: string;         // ex: "3r_avec", "4r_sans", "viti_libre"
  outputs: VitiOutput[] | null;

  // Paramètres
  dose: number | null;
  largeur: number | null;   // alias possible pour interligne
  vitesse: number | null;   // alias possible pour speed
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

  // Pastilles figées (tableau de labels ou codes, ordre idéal = ordre des sorties)
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
  outputs: null,

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
