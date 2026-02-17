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

export type CalcColumn = {
  label: string;                 // "Réglage 1", "Dose 180", etc.
  pressure: number;
  results: ResultRow[];
}

export interface AppState {
  // Identité / machine
  userName: string;
  machineName: string;
  machineType: "arbo" | "viti" | "rampe" | "tangentiel";

  // Sélection famille
  familyKey: string;        // ex: "CP4916"

  // Modèle viti
  modelKey: string;         // ex: "3r_avec", "4r_sans", "viti_libre"

  // Paramètres communs
  dose: number | null;
  interligne: number | null;
  speed: number | null;

  // Alias UI (compatibilité)
  largeur: number | null;
  vitesse: number | null;

  // Rampe
  rampeCount: number | null;

  // Arbo / Tangentiel
  arboCount: number | null;   // nombre total de buses (pair, ≤ 16)
  arboRangs: 1 | 2 | null;    // 1 ou 2 rangs hydrauliques

  // Résultats calculés
  qTotal: number;
  recommendedPressure: number;
  results: ResultRow[];

  // Pression souhaitée par l'utilisateur (optionnelle)
  userPressureTarget: number | null;

  // Pastilles figées (ordre = sorties)
  fixedNozzles: string[];

  // Mode forcé
  forcedToggle: boolean;
  forcedNozzle1: string;
  forcedNozzle2: string;

   // Historique des réglages (comparatif)
  calculations: CalcColumn[];

}


export const state: AppState = {
  userName: "",
  machineName: "",
  machineType: "arbo",

  familyKey: "",
  modelKey: "",

  dose: null,
  interligne: null,
  speed: null,
  largeur: null,
  vitesse: null,

  rampeCount: null,

  arboCount: null,
  arboRangs: 1,

  qTotal: 0,
  recommendedPressure: 0,
  userPressureTarget: null,
  results: [],

  fixedNozzles: [],

  forcedToggle: false,
  forcedNozzle1: "",
  forcedNozzle2: "",
  calculations: [],

};
