/* =========================================================
   PULV MALIN — app.js (architecture finale)
   - Source unique des buses : data/nozzles.js
   - 1 buse = 1 débit de référence
   - Pression exacte calculée
   - Familles filtrées par type de machine
   - PDF Puppeteer compatible
========================================================= */

import { nozzleFamilies } from "./data/nozzles.js";

/* =========================
   ÉTAT GLOBAL
========================= */

let currentMachineType = null;
let selectedFamily = null;

/* =========================
   CONFIG PDF
========================= */

const PDF_BACKEND_URL = "https://pulvmalinpdf-backend.onrender.com/pdf";

/* =========================
   MODÈLES DE RÉPARTITION
========================= */

const models = {
  "3r_sans": [0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25],
  "3r_avec": [0.25,0.25,0.25,0.5,0.25,0.25,0.25,0.5,0.25,0.25],
  "4r_sans": [0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25],
  "4r_avec": [0.25,0.25,0.25,0.25,0.25,0.25,0.5,0.5,0.25,0.25],
};

const labels = {
  "3r_sans": ["Canon 1","Canon 2","Main 3","Main 4","Canon 5","Canon 6","Main 7","Main 8"],
  "3r_avec": ["Canon 1","Canon 2","Main 3","Main retour 4","Main 5","Canon 6","Canon 7","Main retour 8","Main 9","Main 10"],
  "4r_sans": ["Canon G","Canon D","Main G 1","Main D 1","Main G 2","Main D 2","Main G 3","Main D 3"],
  "4r_avec": ["Canon G","Canon D","Main G 1","Main D 1","Main G 2","Main D 2","Main retour G","Main retour D","Main G 3","Main D 3"],
};

/* =========================
   DOM HELPERS
========================= */

const $ = id => document.getElementById(id);
const num = v => Number(v);
const round = (v,d=2)=>Number.isFinite(v)?v.toFixed(d):"—";

/* =========================
   MACHINE & FAMILLES
========================= */

function setMachineType(type) {
  currentMachineType = type;
  populateFamilySelector();
}

function populateFamilySelector() {
  const select = $("familySelect");
  select.innerHTML = "";

  Object.entries(nozzleFamilies).forEach(([key,family])=>{
    if (family.machines.includes(currentMachineType)) {
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = family.label;
      select.appendChild(opt);
    }
  });

  if (select.options.length) {
    onFamilyChange(select.value);
  }
}

function onFamilyChange(key) {
  selectedFamily = nozzleFamilies[key];
  populateNozzleSelector(selectedFamily);
}

function populateNozzleSelector(family) {
  const select = $("nozzleSelect");
  select.innerHTML = "";

  family.nozzles.forEach(n=>{
    if (n.faces) {
      n.faces.forEach(f=>{
        const opt = document.createElement("option");
        opt.value = `${n.code}|${f.side}`;
        opt.textContent = `${n.code} — ${f.label}`;
        select.appendChild(opt);
      });
    } else {
      const opt = document.createElement("option");
      opt.value = n.code;
      opt.textContent = n.code;
      select.appendChild(opt);
    }
  });
}
function populateFamilySelector() {
  const select = document.getElementById("familySelect");
  if (!select) return;   // ⬅️ PROTECTION

  select.innerHTML = "";

  Object.entries(nozzleFamilies).forEach(([key, family]) => {
    if (family.machines.includes(currentMachineType)) {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = family.label;
      select.appendChild(option);
    }
  });

  if (select.options.length) {
    onFamilyChange(select.value);
  }
}

/* =========================
   BUSE & PRESSION
========================= */

function getSelectedNozzle() {
  const value = $("nozzleSelect").value;

  if (value.includes("|")) {
    const [code,side] = value.split("|");
    const n = selectedFamily.nozzles.find(x=>x.code===code);
    const f = n.faces.find(x=>x.side===side);
    return { code, qRef:f.qRef, face:f.label };
  }

  const n = selectedFamily.nozzles.find(x=>x.code===value);
  return { code:n.code, qRef:n.qRef };
}

function pressureForFlow(qTarget,qRef,pRef) {
  return pRef * Math.pow(qTarget/qRef,2);
}

function pressureStatus(p,family) {
  if (p<family.limitRange[0]||p>family.limitRange[1]) return "Changer de buse";
  if (p<family.optimalRange[0]||p>family.optimalRange[1]) return "Limite";
  return "OK";
}

/* =========================
   CALCULS
========================= */

function debitParRang(dose,interligne,vitesse) {
  return (dose*interligne*vitesse)/600;
}

function computeIdeal({dose,interligne,vitesse,modelKey}) {
  const coefs=models[modelKey];
  const names=labels[modelKey];
  const qRang=debitParRang(dose,interligne,vitesse);
  const nozzle=getSelectedNozzle();

  const rows=coefs.map((coef,i)=>{
    const qTarget=qRang*coef;
    const p=pressureForFlow(qTarget,nozzle.qRef,selectedFamily.refPressure);
    return {
      idx:i+1,
      label:names[i],
      coef,
      qTarget,
      nozzle:nozzle.code,
      face:nozzle.face||"",
      pressure:p,
      status:pressureStatus(p,selectedFamily)
    };
  });

  return {dose,interligne,vitesse,rows};
}

/* =========================
   AFFICHAGE
========================= */

function renderIdealTable(res) {
  const tbody=$("resultTable").querySelector("tbody");
  tbody.innerHTML="";
  res.rows.forEach(r=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`
      <td>${r.idx}</td>
      <td>${r.label}</td>
      <td>${r.coef}</td>
      <td>${round(r.qTarget,3)}</td>
      <td>${r.nozzle}${r.face?` (${r.face})`:""}</td>
      <td><strong>${round(r.pressure,2)} bar</strong></td>
      <td>${r.status}</td>`;
    tbody.appendChild(tr);
  });
}

/* =========================
   ACTION PRINCIPALE
========================= */

function calculateOutputs() {
  const modelKey=$("modeleRepartition").value;
  const dose=num($("dose").value);
  const interligne=num($("interligne").value);
  const vitesse=num($("vitesse").value);

  if(!models[modelKey]||dose<=0||interligne<=0||vitesse<=0){
    alert("Paramètres invalides");
    return;
  }

  const res=computeIdeal({dose,interligne,vitesse,modelKey});
  renderIdealTable(res);
}

/* =========================
   PDF
========================= */

async function exportPDF() {
  const html=document.documentElement.outerHTML;
  const res=await fetch(PDF_BACKEND_URL,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({html})
  });
  const blob=await res.blob();
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;
  a.download="pulvmalin.pdf";
  a.click();
  URL.revokeObjectURL(url);
}

/* =========================
   INIT
========================= */

window.addEventListener("DOMContentLoaded",()=>{
  setMachineType("vigne");
});

/* =========================
   EXPORTS UI
========================= */

window.setMachineType=setMachineType;
window.onFamilyChange=onFamilyChange;
window.calculateOutputs=calculateOutputs;
window.exportPDF=exportPDF;
window.saveMachine = saveMachine;
window.setMachineType = setMachineType;
window.onFamilyChange = onFamilyChange;
window.calculateOutputs = calculateOutputs;
window.exportPDF = exportPDF;

window.showSection = showSection;
window.saveMachine = saveMachine;
window.createTangentielModel = createTangentielModel;
window.calculatePressureWithSameNozzles = calculatePressureWithSameNozzles;
window.calculatePressureWithNewDose = calculatePressureWithNewDose;

