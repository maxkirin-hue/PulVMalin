import { state, AppState } from "../state/state";

export const fieldMap: Record<string, keyof AppState> = {
  userName: "userName",
  machineName: "machineName",
  machineType: "machineType",

  familyKey: "familyKey",
  modelKey: "modelKey",

  dose: "dose",
  largeur: "interligne",   // mappe largeur vers interligne
  vitesse: "speed",        // mappe vitesse vers speed
  rampeCount: "rampeCount",

  arboRangs: "arboRangs",
  interligne: "interligne",
  speed: "speed",

  forcedToggle: "forcedToggle",
  forcedNozzle1: "forcedNozzle1",
  forcedNozzle2: "forcedNozzle2",
};

export function bindFormFields() {
  Object.entries(fieldMap).forEach(([id, key]) => {
    const el = document.getElementById(id) as
      | HTMLInputElement
      | HTMLSelectElement
      | null;
    if (!el) return;

    // initialiser le champ depuis state (si valeur existante)
    const current = (state as any)[key];
    if (current !== undefined && current !== null) {
      if (el instanceof HTMLInputElement) {
        if (el.type === "checkbox") {
          el.checked = Boolean(current);
        } else {
          el.value = String(current);
        }
      } else if (el instanceof HTMLSelectElement) {
        el.value = String(current);
      }
    }

    const eventName = el instanceof HTMLSelectElement || (el instanceof HTMLInputElement && el.type === "checkbox")
      ? "change"
      : "input";

    el.addEventListener(eventName, () => {
      let value: any;

      if (el instanceof HTMLInputElement) {
        if (el.type === "checkbox") {
          value = el.checked;
        } else if (el.type === "number") {
          value = el.value === "" ? null : Number(el.value);
        } else {
          value = el.value;
        }
      } else if (el instanceof HTMLSelectElement) {
        const v = el.value;
        const asNum = Number(v);
        value = !Number.isNaN(asNum) && v.trim() !== "" ? asNum : v;
      }

      (state as any)[key] = value;
    });
  });
}