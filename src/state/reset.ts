// src/state/reset.ts
import { state } from "./state";

/**
 * Réinitialise uniquement les données de calcul
 * (utilisé pour "Modifier", nouveau calcul sur même machine)
 */
export function resetCalculOnly() {
  state.calculations = [];
  state.results = [];
  state.fixedNozzles = [];
  state.userPressureTarget = null;
  state.recommendedPressure = null;
}

/**
 * Réinitialise TOUT le state
 * (utilisé pour "Recommencer")
 */
export function resetAll() {
  resetCalculOnly();

  state.machineName = "";
  state.userName = "";
  state.machineType = null;
  state.familyKey = null;
  state.modelKey = null;
}
