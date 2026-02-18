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
  state.qTotal = null;
}

/**
 * Réinitialise TOUT le state
 * (utilisé pour "Recommencer")
 */
export function resetAll() {
  // d'abord le calcul
  resetCalculOnly();

  // champs généraux
  state.machineName = "";
  state.userName = "";
  state.machineType = null;
  state.familyKey = null;
  state.modelKey = null;

  // autres champs potentiels
  state.arboCount = null;
  state.arboRangs = null;
  state.rampeCount = null;
  state.dose = null;
  state.interligne = null;
  state.largeur = null;
  state.speed = null;
  state.vitesse = null;

  // forçages / UI flags
  state.forcedToggle = false;
  state.forcedNozzle1 = null;
  state.forcedNozzle2 = null;

  // nettoyages additionnels
  state.fixedNozzles = [];
  state.calculations = [];
  state.results = [];
  state.userPressureTarget = null;
  state.recommendedPressure = null;
  state.qTotal = null;
}
