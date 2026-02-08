/* ============================================================
   PERSISTANCE DU STATE — PulvMalin
============================================================ */

import { state, AppState } from "./state";

const STORAGE_KEY = "pulvmalin_state_v1";

/* ------------------------------------------------------------
   Sauvegarde automatique
------------------------------------------------------------ */
export function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Impossible de sauvegarder le state :", e);
  }
}

/* ------------------------------------------------------------
   Restauration au démarrage
------------------------------------------------------------ */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const saved: Partial<AppState> = JSON.parse(raw);

    // On copie les valeurs existantes dans le state actuel
    Object.assign(state, saved);

  } catch (e) {
    console.warn("Impossible de charger le state :", e);
  }
}

/* ------------------------------------------------------------
   Activation de la sauvegarde automatique
------------------------------------------------------------ */
export function enableAutoSave() {
  // Sauvegarde toutes les 500 ms si le state change
  let last = JSON.stringify(state);

  setInterval(() => {
    const now = JSON.stringify(state);
    if (now !== last) {
      saveState();
      last = now;
    }
  }, 500);
}