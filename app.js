/* ----------------------------------------------------
   MODÈLES, LABELS, PASTILLES
---------------------------------------------------- */
const models = {
  "3r_sans": [0.25, 0.25, 0.5, 0.5, 0.5, 0.5, 0.25, 0.25],
  "3r_avec": [0.25, 0.25, 0.5, 0.25, 0.25, 0.25, 0.25, 0.5, 0.25, 0.25],
  "4r_sans": [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
  "4r_avec": [0.5, 0.5, 0.5, 0.25, 0.25, 0.5, 0.5, 0.5, 0.25, 0.25],

  /* Nouveau modèle Tangentiel 10 sorties – 2 rangs */
  "tangentiel_10": [1,1,1,1,1,1,1,1,1,1]
};

const labels = {
  "3r_sans": [
    "Canon", "Canon", "Main", "Main",
    "Canon", "Canon", "Main", "Main"
  ],
  "4r_sans": [
    "Canon", "Canon", "Main", "Main",
    "Canon", "Canon", "Main", "Main"
  ],
  "3r_avec": [
    "Canon", "Canon", "Main retour", "Main", "Main",
    "Canon", "Canon", "Main retour", "Main", "Main"
  ],
  "4r_avec": [
    "Canon (0.5)", "Canon (0.5)", "Main retour (0.5)", "Main", "Main",
    "Canon (0.5)", "Canon (0.5)", "Main retour (0.5)", "Main", "Main"
  ],

  /* Labels Tangentiel – Option C */
  "tangentiel_10": [
    "Rang 1 – Sortie 1",
    "Rang 1 – Sortie 2",
    "Rang 1 – Sortie 3",
    "Rang 1 – Sortie 4",
    "Rang 1 – Sortie 5",
    "Rang 2 – Sortie 1",
    "Rang 2 – Sortie 2",
    "Rang 2 – Sortie 3",
    "Rang 2 – Sortie 4",
    "Rang 2 – Sortie 5"
  ]
};

/* ----------------------------------------------------
   FAMILLES DE BUSES (ISO + CP4916)
---------------------------------------------------- */

const cp4916_raw = [
  { nom: "CP4916-008", q3: 0.032 },
  { nom: "CP4916-10", q3: 0.048 },
  { nom: "CP4916-12", q3: 0.075 },
  { nom: "CP4916-14", q3: 0.11 },
  { nom: "CP4916-15", q3: 0.13 },
  { nom: "CP4916-16", q3: 0.15 },
  { nom: "CP4916-18", q3: 0.20 },
  { nom: "CP4916-20", q3: 0.21 },
  { nom: "CP4916-22", q3: 0.28 },
  { nom: "CP4916-24", q3: 0.34 },
  { nom: "CP4916-25", q3: 0.36 },
  { nom: "CP4916-26", q3: 0.39 },
  { nom: "CP4916-27", q3: 0.42 },
  { nom: "CP4916-28", q3: 0.45 },
  { nom: "CP4916-30", q3: 0.52 },
  { nom: "CP4916-31", q3: 0.57 },
  { nom: "CP4916-32", q3: 0.61 },
  { nom: "CP4916-34", q3: 0.67 },
  { nom: "CP4916-35", q3: 0.71 },
  { nom: "CP4916-37", q3: 0.79 },
  { nom: "CP4916-39", q3: 0.87 },
  { nom: "CP4916-40", q3: 0.94 },
  { nom: "CP4916-41", q3: 1.03 },
  { nom: "CP4916-43", q3: 1.15 },
  { nom: "CP4916-45", q3: 1.30 },
  { nom: "CP4916-46", q3: 1.24 },
  { nom: "CP4916-47", q3: 1.10 },
  { nom: "CP4916-48", q3: 1.16 },
  { nom: "CP4916-49", q3: 1.30 },
  { nom: "CP4916-51", q3: 1.30 },
  { nom: "CP4916-52", q3: 1.32 },
  { nom: "CP4916-54", q3: 1.35 },
  { nom: "CP4916-55", q3: 1.49 },
  { nom: "CP4916-57", q3: 1.58 },
  { nom: "CP4916-59", q3: 1.71 },
  { nom: "CP4916-61", q3: 1.88 },
  { nom: "CP4916-63", q3: 2.04 },
  { nom: "CP4916-65", q3: 2.16 },
  { nom: "CP4916-67", q3: 2.20 },
  { nom: "CP4916-68", q3: 2.32 },
  { nom: "CP4916-70", q3: 2.39 }
];

const buses = {
  "TeeJet CP4916": {
    pressionNominale: 3,
    buses: cp4916_raw.map(p => ({
      iso: "",
      nom: p.nom,
      q: p.q3
    }))
  },

  "Albuz ATR 80": {
    pressionNominale: 3,
    buses: [
      { iso: "01", nom: "ATR 80 Jaune", q: 0.20 },
      { iso: "015", nom: "ATR 80 Bleu", q: 0.30 },
      { iso: "02", nom: "ATR 80 Rouge", q: 0.40 },
      { iso: "025", nom: "ATR 80 Marron", q: 0.50 },
      { iso: "03", nom: "ATR 80 Gris", q: 0.60 },
      { iso: "04", nom: "ATR 80 Blanc", q: 0.80 }
    ]
  },

  "Lechler IDK 90": {
    pressionNominale: 2,
    buses: [
      { iso: "01", nom: "IDK 90-01", q: 0.39 },
      { iso: "015", nom: "IDK 90-015", q: 0.57 },
      { iso: "02", nom: "IDK 90-02", q: 0.78 },
      { iso: "025", nom: "IDK 90-025", q: 0.97 },
      { iso: "03", nom: "IDK 90-03", q: 1.17 },
      { iso: "04", nom: "IDK 90-04", q: 1.56 }
    ]
  },

  "TeeJet TXR": {
    pressionNominale: 3,
    buses: [
      { iso: "067", nom: "TXR800067", q: 0.26 },
      { iso: "01", nom: "TXR8001", q: 0.39 },
      { iso: "015", nom: "TXR80015", q: 0.57 },
      { iso: "02", nom: "TXR8002", q: 0.78 },
      { iso: "025", nom: "TXR80025", q: 0.97 },
      { iso: "03", nom: "TXR8003", q: 1.17 }
    ]
  },

  "Albuz AMT": {
    pressionNominale: 3,
    buses: [
      { iso: "01", nom: "AMT 80 Jaune", q: 0.20 },
      { iso: "015", nom: "AMT 80 Bleu", q: 0.30 },
      { iso: "02", nom: "AMT 80 Rouge", q: 0.40 },
      { iso: "025", nom: "AMT 80 Marron", q: 0.50 },
      { iso: "03", nom: "AMT 80 Gris", q: 0.60 },
      { iso: "04", nom: "AMT 80 Blanc", q: 0.80 }
    ]
  }
};

const isoColors = {
  "067": "#cccccc",
  "01": "#f28c28",
  "015": "#4caf50",
  "02": "#fdd835",
  "025": "#9c27b0",
  "03": "#2196f3",
  "04": "#f44336",
  "05": "#795548",
  "06": "#9e9e9e",
  "08": "#ffffff"
};

function getIsoColor(iso) {
  return isoColors[iso] || "#999";
}

let currentFamily = buses["TeeJet CP4916"];
let currentPastilles = currentFamily.buses;

/* ----------------------------------------------------
   UTILITAIRES
---------------------------------------------------- */

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function formatNum(v, digits = 2) { return Number.isFinite(v) ? v.toFixed(digits) : "-"; }

/* ----------------------------------------------------
   MISE À JOUR FAMILLE DE BUSES
---------------------------------------------------- */

function updateBuseList() {
  const sel = document.getElementById("buseFamily");
  const familyName = sel.value || "TeeJet CP4916";
  currentFamily = buses[familyName];
  currentPastilles = currentFamily.buses;
}

/* ----------------------------------------------------
   MOTEUR DE CALCUL UNIQUE
---------------------------------------------------- */

function computeSettings({
  dose,
  interligne,
  vitesse,
  coefs,
  pastilles,
  mode = "ideal",
  newInterligne = null,
  newDose = null,
  forcedPressure = null
}) {
  const results = [];
  const Pnom = currentFamily.pressionNominale;

  coefs.forEach((coef, index) => {
    const debitCible = (dose * interligne * vitesse * coef) / 600;

    let best = null;
    let bestDiff = Infinity;

    pastilles.forEach(p => {
      const diff = Math.abs(p.q - debitCible);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = p;
      }
    });

    let pression = Pnom;
    let debitAtPressure = best.q;

    if (mode === "newInterligne") {
      const debit2 = (dose * newInterligne * vitesse * coef) / 600;
      pression = Pnom * Math.pow(debit2 / best.q, 2);
      debitAtPressure = best.q * Math.sqrt(pression / Pnom);

    } else if (mode === "newDose") {
      const debit2 = (newDose * interligne * vitesse * coef) / 600;
      pression = Pnom * Math.pow(debit2 / best.q, 2);
      debitAtPressure = best.q * Math.sqrt(pression / Pnom);

    } else if (mode === "forcePressure" && forcedPressure) {
      pression = forcedPressure;
      debitAtPressure = best.q * Math.sqrt(pression / Pnom);
    }

    pression = clamp(pression, 0, 99);

    results.push({
      index: index + 1,
      coef,
      debitCible,
      pastille: best.nom,
      iso: best.iso,
      q: best.q,
      pression,
      debitAtPressure
    });
  });

  return results;
}
/* ----------------------------------------------------
   NAVIGATION
---------------------------------------------------- */

function showSection(id) {
  document.querySelectorAll("section").forEach(sec => sec.classList.remove("active"));
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
}

function goToSettings() { showSection("settings"); }
function goHome() { showSection("home"); }
function openSimulator() { showSection("simulator"); }
function openDiagnostic() { showSection("diagnostic"); }

/* ----------------------------------------------------
   MACHINE + RÉGLAGES (localStorage)
---------------------------------------------------- */

function saveMachine() {
  const name = document.getElementById("machineName").value || "";
  localStorage.setItem("machine", name);
  alert("Machine enregistrée !");
}

function saveSettings() {
  const data = {
    dose: document.getElementById("dose").value,
    interligne: document.getElementById("interligne").value,
    vitesse: document.getElementById("vitesse").value,
    modele: document.getElementById("modeleRepartition").value,
    buseFamily: document.getElementById("buseFamily") ? document.getElementById("buseFamily").value : ""
  };
  localStorage.setItem("pulveSettings", JSON.stringify(data));
}

function loadSettings() {
  const data = JSON.parse(localStorage.getItem("pulveSettings"));
  if (!data) return;

  document.getElementById("dose").value = data.dose || "";
  document.getElementById("interligne").value = data.interligne || "";
  document.getElementById("vitesse").value = data.vitesse || "";
  document.getElementById("modeleRepartition").value = data.modele || "";

  if (document.getElementById("buseFamily") && data.buseFamily) {
    document.getElementById("buseFamily").value = data.buseFamily;
  }
  updateBuseList();

  if (data.modele) showSchema(data.modele);

  const machine = localStorage.getItem("machine") || "";
  document.getElementById("machineName").value = machine;
}

/* ----------------------------------------------------
   SCHÉMA VISUEL
---------------------------------------------------- */

function showSchema(modelKey) {
  const container = document.getElementById("schemaContainer");
  container.innerHTML = "";

  const coefs = models[modelKey];
  const names = labels[modelKey];
  if (!coefs || !names) return;

  const mid = coefs.length / 2;
  const leftCoefs = coefs.slice(0, mid);
  const rightCoefs = coefs.slice(mid);
  const leftNames = names.slice(0, mid);
  const rightNames = names.slice(mid);

  const grid = document.createElement("div");
  grid.className = "schema-grid";

  const colLeft = document.createElement("div");
  colLeft.className = "schema-col left";

  const colRight = document.createElement("div");
  colRight.className = "schema-col right";

  leftCoefs.forEach((coef, i) => colLeft.appendChild(createSchemaRow(coef, i + 1, leftNames[i])));
  rightCoefs.forEach((coef, i) => colRight.appendChild(createSchemaRow(coef, i + 1 + mid, rightNames[i])));

  grid.appendChild(colLeft);
  grid.appendChild(colRight);
  container.appendChild(grid);
}

function createSchemaRow(coef, index, label) {
  const row = document.createElement("div");
  row.className = "schema-row";

  const dot = document.createElement("div");
  dot.className = "schema-dot";
  dot.dataset.coef = coef;

  const text = document.createElement("span");
  text.className = "coef-label";
  text.innerText = `${index}. ${label} (${coef})`;

  row.appendChild(dot);
  row.appendChild(text);
  return row;
}

/* ----------------------------------------------------
   CALCUL RÉGLAGE IDÉAL
---------------------------------------------------- */

function calculateOutputs() {
  const modelKey = document.getElementById("modeleRepartition").value;
  const coefs = models[modelKey];
  const names = labels[modelKey];

  if (!coefs || !names) {
    alert("Merci de choisir un modèle de répartition.");
    return;
  }

  const dose = parseFloat(document.getElementById("dose").value);
  const interligne = parseFloat(document.getElementById("interligne").value);
  const vitesse = parseFloat(document.getElementById("vitesse").value);

  if (isNaN(dose) || isNaN(interligne) || isNaN(vitesse)) {
    alert("Merci de remplir dose, interligne et vitesse.");
    return;
  }

  const results = computeSettings({
    dose,
    interligne,
    vitesse,
    coefs,
    pastilles: currentPastilles,
    mode: "ideal"
  });
   // Calcul de la pression unique recommandée
let sum = 0;
results.forEach(r => sum += r.pression);
const pressionRecommandee = sum / results.length;

// On stocke pour le PDF et le diagnostic
window.pressionRecommandee = pressionRecommandee;

  const tbody = document.querySelector("#resultTable tbody");
  tbody.innerHTML = "";

  results.forEach((r, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${r.index}</td>
      <td>${names[i]}</td>
      <td>${r.coef}</td>
      <td>${formatNum(r.debitCible,2)}</td>
      <td>${r.pastille}</td>
      <td>${formatNum(r.q,2)}</td>
    `;
    tbody.appendChild(row);
  });
document.getElementById("resumeFinal").innerHTML = `
  <strong>Pression de travail recommandée :</strong> 
  ${pressionRecommandee.toFixed(1)} bar
`;
  saveSettings();
  showSection("result");
}

/* ----------------------------------------------------
   CALCUL ALTERNATIF (NOUVELLE INTERLIGNE)
---------------------------------------------------- */

function calculatePressureWithSameNozzles() {
  const modelKey = document.getElementById("modeleRepartition").value;
  const coefs = models[modelKey];
  const names = labels[modelKey];
  if (!coefs || !names) return;

  const dose = parseFloat(document.getElementById("dose").value);
  const interligne = parseFloat(document.getElementById("interligne").value);
  const vitesse = parseFloat(document.getElementById("vitesse").value);
  const newInterligne = parseFloat(document.getElementById("newInterligne").value);

  if (isNaN(dose) || isNaN(interligne) || isNaN(vitesse) || isNaN(newInterligne)) {
    alert("Merci de remplir tous les paramètres, y compris la nouvelle interligne.");
    return;
  }

  const results = computeSettings({
    dose,
    interligne,
    vitesse,
    coefs,
    pastilles: currentPastilles,
    mode: "newInterligne",
    newInterligne
  });

  const altBody = document.querySelector("#altTable tbody");
  altBody.innerHTML = "";

  results.forEach((r, i) => {
    let status = "";
    let color = "";

    if (r.pression < 1.5 || r.pression > 6) {
      status = "Hors plage";
      color = "#e53935";
    } else if (r.pression < 2 || r.pression > 5) {
      status = "Limite";
      color = "#fb8c00";
    } else {
      status = "OK";
      color = "#43a047";
    }

    const altRow = document.createElement("tr");
    altRow.innerHTML = `
      <td>${r.index}</td>
      <td>${names[i]}</td>
      <td>${r.pastille}</td>
      <td style="color:${color}; font-weight:600;">
        ${formatNum(r.pression,1)} bar (${status})
      </td>
    `;
    altBody.appendChild(altRow);
  });

  generateResumeFinal();
}

/* ----------------------------------------------------
   CALCUL PAR NOUVELLE DOSE
---------------------------------------------------- */

function calculatePressureWithNewDose() {
  const modelKey = document.getElementById("modeleRepartition").value;
  const coefs = models[modelKey];
  const names = labels[modelKey];
  if (!coefs || !names) return;

  const dose = parseFloat(document.getElementById("dose").value);
  const interligne = parseFloat(document.getElementById("interligne").value);
  const vitesse = parseFloat(document.getElementById("vitesse").value);
  const newDose = parseFloat(document.getElementById("newDose").value);

  if (isNaN(dose) || isNaN(interligne) || isNaN(vitesse) || isNaN(newDose)) {
    alert("Merci de remplir tous les paramètres, y compris la nouvelle dose.");
    return;
  }

  const results = computeSettings({
    dose,
    interligne,
    vitesse,
    coefs,
    pastilles: currentPastilles,
    mode: "newDose",
    newDose
  });

  const doseBody = document.querySelector("#doseTable tbody");
  doseBody.innerHTML = "";

  results.forEach((r, i) => {
    let status = "";
    let color = "";

    if (r.pression < 1.5 || r.pression > 6) {
      status = "Hors plage";
      color = "#e53935";
    } else if (r.pression < 2 || r.pression > 5) {
      status = "Limite";
      color = "#fb8c00";
    } else {
      status = "OK";
      color = "#43a047";
    }

    const doseRow = document.createElement("tr");
    doseRow.innerHTML = `
      <td>${r.index}</td>
      <td>${names[i]}</td>
      <td>${r.pastille}</td>
      <td style="color:${color}; font-weight:600;">
        ${formatNum(r.pression,1)} bar (${status})
      </td>
    `;
    doseBody.appendChild(doseRow);
  });

  generateResumeFinal();
}

/* ----------------------------------------------------
   RÉSUMÉ FINAL
---------------------------------------------------- */

function generateResumeFinal() {
  const dose = document.getElementById("dose").value || "-";
  const interligne = document.getElementById("interligne").value || "-";
  const vitesse = document.getElementById("vitesse").value || "-";
  const newInterligne = document.getElementById("newInterligne").value || "-";
  const newDose = document.getElementById("newDose").value || "-";

  const resume = document.getElementById("resumeFinal");

  resume.innerHTML = `
    <strong>Réglage idéal :</strong><br>
    • Dose : ${dose} L/ha<br>
    • Interligne : ${interligne} m<br>
    • Vitesse : ${vitesse} km/h<br><br>

    <strong>Réglage alternatif (interligne) :</strong><br>
    • Nouvelle interligne : ${newInterligne} m<br><br>

    <strong>Réglage par nouvelle dose :</strong><br>
    • Nouvelle dose : ${newDose} L/ha<br><br>

    <strong>Conseil :</strong><br>
    • Vert = parfait<br>
    • Orange = limite<br>
    • Rouge = changer de pastille
  `;
}

/* ----------------------------------------------------
   PDF STYLISÉ
---------------------------------------------------- */

function buildPDFRow(item) {
  const row = document.createElement("div");
  row.className = "pdf-row";

  const dot = document.createElement("div");
  dot.className = "pdf-dot";
  dot.dataset.coef = item.coef;

  const text = document.createElement("span");
  text.className = "pdf-label";
  text.innerText = `${item.label} — ${item.pastille} — ${item.debit} L/min`;

  row.appendChild(dot);
  row.appendChild(text);

  return row;
}

function buildPDFLayout() {
  const machine = localStorage.getItem("machine") || "";
  document.getElementById("pdfMachineName").innerText = machine;

  const rows = document.querySelectorAll("#resultTable tbody tr");
  if (!rows.length) return;

  const modelKey = document.getElementById("modeleRepartition").value;
  const coefs = models[modelKey];
  const mid = coefs.length / 2;

  const left = [];
  const right = [];

  rows.forEach((r, i) => {
    const label = r.children[1].innerText;
    const coef = r.children[2].innerText;
    const debit = r.children[3].innerText;
    const pastille = r.children[4].innerText;
    const item = { label, coef, debit, pastille };
    if (i < mid) left.push(item); else right.push(item);
  });

  const container = document.getElementById("pdfPulve");
  container.innerHTML = "";

  const colLeft = document.createElement("div");
  colLeft.className = "pdf-col";
  const colRight = document.createElement("div");
  colRight.className = "pdf-col";

  left.forEach(item => colLeft.appendChild(buildPDFRow(item)));
  right.forEach(item => colRight.appendChild(buildPDFRow(item)));

  container.appendChild(colLeft);
  container.appendChild(colRight);

  document.getElementById("pdfResume").innerHTML = document.getElementById("resumeFinal").innerHTML;
}

/* ----------------------------------------------------
   EXPORT PDF
---------------------------------------------------- */

function exportPDF() {
  buildPDFLayout();

  const pdfBlock = document.getElementById("pdfLayout");

  pdfBlock.style.opacity = "1";
  pdfBlock.style.zIndex = "9999";
  pdfBlock.style.position = "absolute";
  pdfBlock.style.top = "-2000px";
  pdfBlock.style.pointerEvents = "auto";

  setTimeout(() => {
    const opt = {
      margin: 10,
      filename: 'reglage_pulve.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(pdfBlock).save().then(() => {
      pdfBlock.style.opacity = "0";
      pdfBlock.style.zIndex = "-1";
      pdfBlock.style.position = "fixed";
      pdfBlock.style.top = "0";
      pdfBlock.style.pointerEvents = "none";
    });
  }, 300);
}
/* ----------------------------------------------------
   SIMULATEUR INTERACTIF
---------------------------------------------------- */

let simTimer = null;
const SIM_DEBOUNCE = 120;

function initSimulator() {
  const simDose = document.getElementById("simDose");
  const simInter = document.getElementById("simInter");
  const simVite = document.getElementById("simVite");
  const simPress = document.getElementById("simPress");

  const simDoseVal = document.getElementById("simDoseVal");
  const simInterVal = document.getElementById("simInterVal");
  const simViteVal = document.getElementById("simViteVal");
  const simPressVal = document.getElementById("simPressVal");

  function updateLabels() {
    simDoseVal.innerText = simDose.value;
    simInterVal.innerText = Number(simInter.value).toFixed(2);
    simViteVal.innerText = Number(simVite.value).toFixed(1);
    simPressVal.innerText = simPress.value ? `${simPress.value} bar (forcée)` : "—";
  }

  function scheduleCompute() {
    clearTimeout(simTimer);
    simTimer = setTimeout(() => {
      applySimulator(false);
    }, SIM_DEBOUNCE);
  }

  [simDose, simInter, simVite, simPress].forEach(el => {
    el.addEventListener("input", () => {
      updateLabels();
      scheduleCompute();
    });
  });

  updateLabels();
  renderScenarioList();
}

function applySimulator(forceShow = true) {
  const modelKey = document.getElementById("modeleRepartition").value;
  const coefs = models[modelKey];
  const names = labels[modelKey];

  if (!coefs || !names) {
    if (forceShow) alert("Choisissez d'abord un modèle de répartition.");
    return;
  }

  const dose = parseFloat(document.getElementById("simDose").value);
  const interligne = parseFloat(document.getElementById("simInter").value);
  const vitesse = parseFloat(document.getElementById("simVite").value);
  const forcedPressure = parseFloat(document.getElementById("simPress").value);

  const results = computeSettings({
    dose,
    interligne,
    vitesse,
    coefs,
    pastilles: currentPastilles,
    mode: "forcePressure",
    forcedPressure
  });

  const tbody = document.querySelector("#simTable tbody");
  tbody.innerHTML = "";

  results.forEach((r, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${r.index}</td>
      <td>${names[i]}</td>
      <td>${r.coef}</td>
      <td>${formatNum(r.debitCible,2)}</td>
      <td>${r.pastille}</td>
      <td>${formatNum(r.pression,2)}</td>
    `;
    tbody.appendChild(row);
  });
}

/* ----------------------------------------------------
   SCÉNARIOS
---------------------------------------------------- */

function saveScenario() {
  const modelKey = document.getElementById("modeleRepartition").value;
  if (!modelKey) { alert("Choisissez un modèle avant d'enregistrer."); return; }

  const scenario = {
    id: Date.now(),
    name: `Scénario ${new Date().toLocaleString()}`,
    model: modelKey,
    dose: Number(document.getElementById("simDose").value),
    interligne: Number(document.getElementById("simInter").value),
    vitesse: Number(document.getElementById("simVite").value),
    pressure: Number(document.getElementById("simPress").value),
    buseFamily: document.getElementById("buseFamily") ? document.getElementById("buseFamily").value : ""
  };

  const list = JSON.parse(localStorage.getItem("simScenarios") || "[]");
  list.unshift(scenario);
  localStorage.setItem("simScenarios", JSON.stringify(list));
  renderScenarioList();
}

function renderScenarioList() {
  const list = JSON.parse(localStorage.getItem("simScenarios") || "[]");
  const container = document.getElementById("scenarioList");
  container.innerHTML = "";

  if (!list.length) {
    container.innerHTML = "<div class='small-note'>Aucun scénario enregistré.</div>";
    return;
  }

  list.forEach(s => {
    const el = document.createElement("div");
    el.className = "scenario-item";
    el.innerHTML = `
      <input type="checkbox" data-id="${s.id}" />
      <div class="scenario-meta">
        <div class="scenario-name">${s.name}</div>
        <div class="scenario-desc">
          Dose ${s.dose} L/ha • Inter ${s.interligne} m • Vit ${s.vitesse} km/h • P ${s.pressure} bar
        </div>
      </div>
      <div class="scenario-actions">
        <button class="tiny" onclick="loadScenario(${s.id})">Charger</button>
        <button class="tiny danger" onclick="deleteScenario(${s.id})">Suppr</button>
      </div>
    `;
    container.appendChild(el);
  });
}

function loadScenario(id) {
  const list = JSON.parse(localStorage.getItem("simScenarios") || "[]");
  const s = list.find(x => x.id === id);
  if (!s) return;

  document.getElementById("simDose").value = s.dose;
  document.getElementById("simInter").value = s.interligne;
  document.getElementById("simVite").value = s.vitesse;
  document.getElementById("simPress").value = s.pressure;

  if (document.getElementById("buseFamily") && s.buseFamily) {
    document.getElementById("buseFamily").value = s.buseFamily;
    updateBuseList();
  }

  applySimulator();
}

function deleteScenario(id) {
  let list = JSON.parse(localStorage.getItem("simScenarios") || "[]");
  list = list.filter(x => x.id !== id);
  localStorage.setItem("simScenarios", JSON.stringify(list));
  renderScenarioList();
}

function clearScenarios() {
  if (!confirm("Supprimer tous les scénarios enregistrés ?")) return;
  localStorage.removeItem("simScenarios");
  renderScenarioList();
}

function compareScenarios() {
  const checks = Array.from(document.querySelectorAll("#scenarioList input[type=checkbox]:checked"));
  if (checks.length < 2) { alert("Sélectionnez au moins 2 scénarios pour comparer."); return; }

  const ids = checks.map(c => Number(c.dataset.id));
  const list = JSON.parse(localStorage.getItem("simScenarios") || "[]").filter(s => ids.includes(s.id));

  let html = `<h2>Comparatif scénarios</h2>
  <table border="1" cellpadding="6" cellspacing="0">
  <thead><tr>
  <th>Nom</th><th>Dose</th><th>Interligne</th><th>Vitesse</th><th>Pression</th><th>Buses</th>
  </tr></thead><tbody>`;

  list.forEach(s => {
    html += `<tr>
      <td>${s.name}</td>
      <td>${s.dose}</td>
      <td>${s.interligne}</td>
      <td>${s.vitesse}</td>
      <td>${s.pressure}</td>
      <td>${s.buseFamily || ""}</td>
    </tr>`;
  });

  html += `</tbody></table>`;
  const w = window.open("", "_blank", "noopener");
  w.document.write(html);
  w.document.close();
}

/* ----------------------------------------------------
   DIAGNOSTIC TERRAIN
---------------------------------------------------- */

function openDiagnostic() {
  const modelKey = document.getElementById("modeleRepartition").value;
  if (!modelKey) {
    alert("Choisissez un modèle avant d’ouvrir le diagnostic.");
    return;
  }

  const container = document.getElementById("diagTableContainer");
  container.innerHTML = "";

  const rows = document.querySelectorAll("#resultTable tbody tr");
  if (!rows.length) {
    alert("Faites d’abord un réglage idéal pour récupérer les pastilles.");
    return;
  }

  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>#</th>
        <th>Sortie</th>
        <th>Pastille</th>
        <th>Débit mesuré (L/min)</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  rows.forEach((r, i) => {
    const name = r.children[1].innerText.trim();
    const pastille = r.children[4].innerText.trim();

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${name}</td>
      <td>${pastille}</td>
      <td><input type="number" step="0.01" data-index="${i}" class="diagInput"></td>
    `;
    tbody.appendChild(tr);
  });

  container.appendChild(table);
  showSection("diagnostic");
}

function generateDiagnostic() {
  const pressure = parseFloat(document.getElementById("diagPressure").value);
  if (isNaN(pressure)) {
    alert("Indique la pression mesurée.");
    return;
  }

  const modelKey = document.getElementById("modeleRepartition").value;
  const names = labels[modelKey];

  let msg = "<h3>Résultats du diagnostic</h3>";

  const inputs = document.querySelectorAll(".diagInput");

  inputs.forEach((input, i) => {
    const measured = parseFloat(input.value);
    if (isNaN(measured)) return;

    const pastilleName = input.parentElement.previousElementSibling.innerText.trim();
    const pastille = currentPastilles.find(p => p.nom === pastilleName);

    if (!pastille) {
      msg += `<div style="color:#e53935;">Pastille inconnue : ${pastilleName}</div>`;
      return;
    }

    const theoretical = pastille.q * Math.sqrt(pressure / currentFamily.pressionNominale);
    const diff = Math.abs(measured - theoretical) / theoretical * 100;

    let status = "";
    let color = "";

    if (diff <= 5) { status = "OK"; color = "#43a047"; }
    else if (diff <= 10) { status = "Limite"; color = "#fb8c00"; }
    else { status = "À changer"; color = "#e53935"; }

    msg += `
      <div style="margin:6px 0;">
        <strong>${names[i]}</strong> — ${pastilleName}<br>
        Mesuré : ${measured.toFixed(2)} L/min — Théorique : ${theoretical.toFixed(2)} L/min<br>
        <span style="color:${color}; font-weight:700;">${status} (${diff.toFixed(1)} %)</span>
      </div>
    `;
  });

  document.getElementById("diagTableContainer").innerHTML += msg;
}

/* ----------------------------------------------------
   INIT
---------------------------------------------------- */

window.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  updateBuseList();
  initSimulator();
});

/* ----------------------------------------------------
   EXPORT DES FONCTIONS
---------------------------------------------------- */

window.saveMachine = saveMachine;
window.goToSettings = goToSettings;
window.goHome = goHome;
window.showSchema = showSchema;
window.calculateOutputs = calculateOutputs;
window.calculatePressureWithSameNozzles = calculatePressureWithSameNozzles;
window.calculatePressureWithNewDose = calculatePressureWithNewDose;
window.exportPDF = exportPDF;
window.saveSettings = saveSettings;
window.loadSettings = loadSettings;
window.openSimulator = openSimulator;
window.applySimulator = applySimulator;
window.saveScenario = saveScenario;
window.compareScenarios = compareScenarios;
window.clearScenarios = clearScenarios;
window.renderScenarioList = renderScenarioList;
window.updateBuseList = updateBuseList;
window.openDiagnostic = openDiagnostic;
window.generateDiagnostic = generateDiagnostic;



