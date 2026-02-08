import { state, AppState } from "../state/state";

export const fieldMap: Record<string, keyof AppState> = {
  userName: "userName",
  machineName: "machineName",
  machineType: "machineType",

  familyKey: "familyKey",
  modelKey: "modelKey",

  dose: "dose",
  largeur: "largeur",
  vitesse: "vitesse",
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
    const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
    if (!el) return;

    el.addEventListener("input", () => {
      let value: any = el.value;

      if (el instanceof HTMLInputElement && el.type === "number") {
        value = value === "" ? null : Number(value);
      }

      (state as any)[key] = value;
    });
  });
}
