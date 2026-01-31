import { nozzleFamilies } from "./data/nozzles.js";

/* =========================
   ÉTAT
========================= */

const state = {
  machine: null,
  family: null,
  model: null,
  forced: false,
  forcedNozzle: null
};

/* =========================
   SORTIES & COEFFICIENTS
========================= */

const outputs = {
  sans_retour: {
    names: [
      "Canon G1","Canon G2","Canon D2","Canon D1",
      "Main G1","Main G2","Main D2","Main D1"
    ],
    models: {
      "3r_sans": Array(8).fill(1),
      "4r_sans": Array(8).fill(1)
    }
  },
  avec_retour: {
    names: [
      "Canon G1","Canon G2","Canon D2","Canon D1",
      "Main retour G","Main retour D",
      "Main G1","Main G2","Main D2","Main D1"
    ],
    models: {
      "3r_avec": [1.10,1.10,1.00,0.90,0.80,0.80,0.90,1.00,1.10,1.10],
      "4r_avec": [1.15,1.15,0.85,0.85,0.85,0.85,0.85,0.85,1.15,1.15]
    }
  }
};

/* =========================
   NAVIGATION
========================= */

function go(step) {
  document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
  document.getElementById(`step${step}`).classList.add("active");
}

/* =========================
   MACHINE
========================= */

function selectMachine(type) {
  state.machine = type;
  populateFamilies();
  populateModels();
  go(2);
}

/* =========================
   FAMILLES
========================= */

function populateFamilies() {
  const sel = document.getElementById("familySelect");
  sel.innerHTML = "";
  Object.entries(nozzleFamilies).forEach(([k,f]) => {
    const o = document.createElement("option");
    o.value = k;
    o.textContent = f.label;
    sel.appendChild(o);
  });
  state.family = sel.value;
}

/* =========================
   MODÈLES
========================= */

function populateModels() {
  const sel = document.getElementById("modelSelect");
  sel.innerHTML = "";
  Object.keys(outputs[state.machine].models).forEach(m => {
    const o = document.createElement("option");
    o.value = m;
    o.textContent = m;
    sel.appendChild(o);
  });
}

/* =========================
   CALCUL
========================= */

function calculate() {
  const dose = +doseInput.value;
  const largeur = +largeurInput.value;
  const vitesse = +vitesseInput.value;

  const qTotal = (dose * largeur * vitesse) / 600;

  const modelKey = modelSelect.value;
  const coefs = outputs[state.machine].models[modelKey];
  const names = outputs[state.machine].names;
  const sumCoef = coefs.reduce((a,b)=>a+b,0);

  const family = nozzleFamilies[state.family];
  const tbody = document.getElementById("resultBody");
  tbody.innerHTML = "";

  coefs.forEach((coef,i)=>{
    const q = qTotal * coef / sumCoef;
    const nozzle = family.nozzles[0];
    const p = family.refPressure * Math.pow(q / nozzle.qRef, 2);
    const status =
      p < family.limitRange[0] || p > family.limitRange[1] ? "Changer" :
      p < family.optimalRange[0] || p > family.optimalRange[1] ? "Limite" : "OK";

    tbody.innerHTML += `
      <tr>
        <td>${names[i]}</td>
        <td>${coef}</td>
        <td>${q.toFixed(2)}</td>
        <td>${nozzle.code}</td>
        <td>${p.toFixed(2)}</td>
        <td>${status}</td>
      </tr>`;
  });

  go(4);
}

/* =========================
   EXPORT
========================= */

window.selectMachine = selectMachine;
window.go = go;
window.calculate = calculate;
