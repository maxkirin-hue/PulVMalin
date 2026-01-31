/* =========================================================
   PULV MALIN — app.js (FINAL)
   - ES module compatible Vite / Rollup
   - Source unique des buses : data/nozzles.js
   - Aucune fonction en double
   - Aucune référence fantôme
========================================================= */

import { nozzleFamilies } from "./data/nozzles.js";

/* =========================
   ÉTAT GLOBAL
========================= */

let currentMachineType = "vigne";
let selectedFamily = null;

/* =========================
   HELPERS
========================= */

const $ = id => document.getElementById(id);
const num = v => Number(v);
const round = (v, d = 2) => Number.isFinite(v) ? v.toFixed(d) : "—";
/* =========================
   NAVIGATION SECTIONS
========================= */

function showSection(id) {
  document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
}

/* =========================
   MACHINE (PERSISTENCE)
========================= */

function saveMachine() {
  const name = document.getElementById("machineName")?.value || "";
  localStorage.setItem("machineName", name);
  alert("Machine enregistrée !");
}


/* =========================
   MACHINE & FAMILLES
========================= */

function setMachineType(type) {
  currentMachineType = type;
  populateFamilySelector();
}

function populateFamilySelector() {
  const select = $("familySelect");
  if (!select) return;

  select.innerHTML = "";

  Object.entries(nozzleFamilies).forEach(([key, family]) => {
    if (family.machines.includes(currentMachineType)) {
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = family.label;
      select.appendChild(opt);
    }
  });

  if (select.options.length > 0) {
    onFamilyChange(select.value);
  }
}

function onFamilyChange(key) {
  selectedFamily = nozzleFamilies[key];
  populateNozzleSelector(selectedFamily);
}

function populateNozzleSelector(family) {
  const select = $("nozzleSelect");
  if (!select) return;

  select.innerHTML = "";

  family.nozzles.forEach(nozzle => {
    if (nozzle.faces) {
      nozzle.faces.forEach(face => {
        const opt = document.createElement("option");
        opt.value = `${nozzle.code}|${face.side}`;
        opt.textContent = `${nozzle.code} — ${face.label}`;
        select.appendChild(opt);
      });
    } else {
      const opt = document.createElement("option");
      opt.value = nozzle.code;
      opt.textContent = nozzle.code;
      select.appendChild(opt);
    }
  });
}

/* =========================
   BUSE & PRESSION
========================= */

function getSelectedNozzle() {
  const value = $("nozzleSelect")?.value;
  if (!value || !selectedFamily) return null;

  if (value.includes("|")) {
    const [code, side] = value.split("|");
    const nozzle = selectedFamily.nozzles.find(n => n.code === code);
    const face = nozzle.faces.find(f => f.side === side);
    return { code, qRef: face.qRef, face: face.label };
  }

  const nozzle = selectedFamily.nozzles.find(n => n.code === value);
  return { code: nozzle.code, qRef: nozzle.qRef };
}

function pressureForFlow(qTarget, qRef, pRef) {
  return pRef * Math.pow(qTarget / qRef, 2);
}

function pressureStatus(p, family) {
  if (p < family.limitRange[0] || p > family.limitRange[1]) return "Changer de buse";
  if (p < family.optimalRange[0] || p > family.optimalRange[1]) return "Limite";
  return "OK";
}

/* =========================
   CALCULS
========================= */

function debitParRang(dose, interligne, vitesse) {
  return (dose * interligne * vitesse) / 600;
}

function calculateOutputs() {
  const dose = num($("dose")?.value);
  const interligne = num($("interligne")?.value);
  const vitesse = num($("vitesse")?.value);

  if (!dose || !interligne || !vitesse) {
    alert("Paramètres invalides.");
    return;
  }

  const nozzle = getSelectedNozzle();
  if (!nozzle) {
    alert("Aucune buse sélectionnée.");
    return;
  }

  const qTarget = debitParRang(dose, interligne, vitesse);
  const pressure = pressureForFlow(
    qTarget,
    nozzle.qRef,
    selectedFamily.refPressure
  );

  renderResult({
    nozzle,
    pressure,
    status: pressureStatus(pressure, selectedFamily)
  });
}

/* =========================
   AFFICHAGE
========================= */

function renderResult(res) {
  const target = $("result");
  if (!target) return;

  target.innerHTML = `
    <div><strong>Famille :</strong> ${selectedFamily.label}</div>
    <div><strong>Buse :</strong> ${res.nozzle.code}${res.nozzle.face ? ` (${res.nozzle.face})` : ""}</div>
    <div><strong>Pression à régler :</strong> ${round(res.pressure, 2)} bar</div>
    <div><strong>Statut :</strong> ${res.status}</div>
  `;
}

/* =========================
   INIT
========================= */

window.addEventListener("DOMContentLoaded", () => {
  populateFamilySelector();
});

/* =========================
   EXPORTS POUR HTML
========================= */

window.setMachineType = setMachineType;
window.onFamilyChange = onFamilyChange;
window.calculateOutputs = calculateOutputs;
window.showSection = showSection;
window.saveMachine = saveMachine;





