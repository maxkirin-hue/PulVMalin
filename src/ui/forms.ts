import { nozzleFamilies } from "../data/nozzles";
import { state } from "../state/state";
import { $ } from "../utils/dom";

/* ---------- FAMILLES & PASTILLES ---------- */

export function listNozzleVariants(family: any) {
  const variants: any[] = [];

  family.nozzles.forEach((n: any) => {
    if (n.faces) {
      n.faces.forEach((face: any) => {
        variants.push({
          value: `${n.code}|${face.side}`,
          label: `${n.code} — ${face.label}`,
          code: n.code,
          qRef: face.qRef,
          faceLabel: face.label,
        });
      });
    } else {
      variants.push({
        value: n.code,
        label: n.code,
        code: n.code,
        qRef: n.qRef,
        faceLabel: null,
      });
    }
  });

  return variants;
}

export function populateFamilySelect() {
  const sel = $("#familySelect") as HTMLSelectElement;
  sel.innerHTML = "";

  const entries = Object.entries(nozzleFamilies).filter(
    ([_, f]: any) =>
      !f.machines || f.machines.includes(state.machineType)
  );

  entries.forEach(([key, fam]: any) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = fam.label;
    sel.appendChild(opt);
  });

  if (entries.length) state.familyKey = entries[0][0];

  sel.addEventListener("change", () => {
    state.familyKey = sel.value;
    populateForcedNozzleSelect();
  });

  populateForcedNozzleSelect();
}

export function populateForcedNozzleSelect() {
  const sel1 = $("#forcedNozzle1") as HTMLSelectElement;
  const sel2 = $("#forcedNozzle2") as HTMLSelectElement;

  if (!sel1 || !sel2) return;

  sel1.innerHTML = "";
  sel2.innerHTML = "";

  const fam = nozzleFamilies[state.familyKey!];
  if (!fam) return;

  const variants = listNozzleVariants(fam);

  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = "Choisir…";

  sel1.appendChild(empty.cloneNode(true));
  sel2.appendChild(empty.cloneNode(true));

  variants.forEach(v => {
    const o1 = document.createElement("option");
    o1.value = v.value;
    o1.textContent = v.label;
    sel1.appendChild(o1);

    const o2 = document.createElement("option");
    o2.value = v.value;
    o2.textContent = v.label;
    sel2.appendChild(o2);
  });
}
