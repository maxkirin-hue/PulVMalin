/* ----------------------------------------------------
   MODÈLES, LABELS, PASTILLES
---------------------------------------------------- */

// Modèles corrigés selon ta machine

const models = {
  // 3 rangs sans main de retour – 8 sorties
  "3r_sans": [
    0.5, 0.5, // 1,2 canons
    0.5, 0.5, // 3,4 mains
    0.5, 0.5, // 5,6 canons
    0.5, 0.5  // 7,8 mains
  ],

  // 3 rangs avec main de retour – 10 sorties
  // canons : 1,2,6,7 → 0.5
  // mains normales : 3,5,9,10 → 0.5
  // mains de retour : 4,8 → 1.0
  "3r_avec": [
    0.5, 0.5,   // 1,2 canons
    0.5,        // 3 main normale
    1.0,        // 4 main retour
    0.5,        // 5 main normale
    0.5, 0.5,   // 6,7 canons
    1.0,        // 8 main retour
    0.5, 0.5    // 9,10 mains normales
  ],

  // 4 rangs sans main de retour – 8 sorties (schéma générique)
  "4r_sans": [
    0.5, 0.5,
    0.5, 0.5,
    0.5, 0.5,
    0.5, 0.5
  ],

  // 4 rangs avec main de retour – 10 sorties (schéma générique)
  "4r_avec": [
    0.5, 0.5,
    0.5, 0.5,
    0.5, 0.5,
    1.0, 1.0,
    0.5, 0.5
  ]
};

const labels = {
  "3r_sans": [
    "Canon 1", "Canon 2",
    "Main 3", "Main 4",
    "Canon 5", "Canon 6",
    "Main 7", "Main 8"
  ],
  "3r_avec": [
    "Canon 1", "Canon 2",
    "Main 3", "Main retour 4",
    "Main 5",
    "Canon 6", "Canon 7",
    "Main retour 8",
    "Main 9", "Main 10"
  ],
  "4r_sans": [
    "Canon G", "Canon D",
    "Main G 1", "Main D 1",
    "Main G 2", "Main D 2",
    "Main G 3", "Main D 3"
  ],
  "4r_avec": [
    "Canon G", "Canon D",
    "Main G 1", "Main D 1",
    "Main G 2", "Main D 2",
    "Main retour G", "Main retour D",
    "Main G 3", "Main D 3"
  ]
};

// Pastilles CP4916 (débit à 3 bar)
const pastilles = [
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

/* ----------------------------------------------------
   UTILITAIRES
---------------------------------------------------- */

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function formatNum(v, d = 2) { return Number.isFinite(v) ? v.toFixed(d) : "-"; }

/* ----------------------------------------------------
   MOTEUR DE CALCUL
   mode: "ideal" | "newInterligne" | "newDose" | "forcePressure"
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

  coefs.forEach((coef, index) => {
    const debitCible = (dose * interligne * vitesse * coef) / 600;

    let best = null;
    let bestDiff = Infinity;

    pastilles.forEach(p => {
      const debitReel = p.q3;
      const diff = Math.abs(debitReel - debitCible);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = p;
      }
    });

    let pression = 3;
    let debitAtPressure = best.q3;

    if (mode === "newInterligne") {
      const debit2 = (dose * newInterligne * vitesse * coef) / 600;
      pression = 3 * Math.pow(debit2 / best.q3, 2);
      debitAtPressure = best.q3 * Math.sqrt(pression / 3);
    } else if (mode === "newDose") {
      const debit2 = (newDose * interligne * vitesse * coef) / 600;
      pression = 3 * Math.pow(debit2 / best.q3, 2);
      debitAtPressure = best.q3 * Math.sqrt(pression / 3);
    } else if (mode === "forcePressure" && forcedPressure) {
      pression = forcedPressure;
      debitAtPressure = best.q3 * Math.sqrt(pression / 3);
    }

    pression = clamp(pression, 0, 99);

    results.push({
      index: index + 1,
      coef,
      debitCible,
      pastille: best.nom,
      q3: best.q3,
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
  document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
}

function goToSettings() { showSection("settings"); }
function goHome() { showSection("home"); }
function openSimulator() { showSection("simulator"); }
function openCustomModel() { showSection("customModel"); }

/* ----------------------------------------------------
   MACHINE + RÉGLAGES
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
    modele: document.getElementById("modeleRepartition").value
  };
  localStorage.setItem("pulveSettings", JSON.stringify(data));
}

function loadSettings() {
  const data = JSON.parse(localStorage.getItem("pulveSettings") || "null");
  if (data) {
    document.getElementById("dose").value = data.dose || "";
    document.getElementById("interligne").value = data.interligne || "";
    document.getElementById("vitesse").value = data.vitesse || "";
    document.getElementById("modeleRepartition").value = data.modele || "";
    if (data.modele) showSchema(data.modele);
  }
  const machine = localStorage.getItem("machine") || "";
  const mInput = document.getElementById("machineName");
  if (mInput) mInput.value = machine;
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

  const mid = Math.ceil(coefs.length / 2);
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
    pastilles,
    mode: "ideal"
  });

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
      <td>${formatNum(r.q3,2)}</td>
    `;
    tbody.appendChild(row);
  });

  saveSettings();
  showSection("result");
}

/* ----------------------------------------------------
   CALCUL ALTERNATIF (INTERLIGNE)
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
    pastilles,
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
    pastilles,
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
    • Vitesse : ${vitesse} km/h<br>
    • Pression : 3 bar<br><br>

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
   PDF
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
  const coefs = models[modelKey] || [];
  const mid = Math.ceil(coefs.length / 2);

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

  document.getElementById("pdfResume").innerHTML =
    document.getElementById("resumeFinal").innerHTML;
}

function exportPDF() {
  buildPDFLayout();

  const pdfBlock = document.getElementById("pdfLayout");
  pdfBlock.style.opacity = "1";
  pdfBlock.style.zIndex = "9999";

  setTimeout(() => {
    const opt = {
      margin: 10,
      filename: 'reglage_pulve.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(pdfBlock).save().then(() => {
      pdfBlock.style.opacity = "0";
      pdfBlock.style.zIndex = "-1";
    });
  }, 300);
}

/* ----------------------------------------------------
   SIMULATEUR
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
    simPressVal.innerText = simPress.value ? `${simPress.value} bar` : "—";
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
    pastilles,
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
   SCÉNARIOS SIMULATEUR
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
    pressure: Number(document.getElementById("simPress").value)
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
          Modèle ${s.model} • Dose ${s.dose} L/ha • Inter ${s.interligne} m • Vit ${s.vitesse} km/h • P ${s.pressure} bar
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

  let html = `<h2>Comparatif scénarios</h2><table border="1" cellpadding="6" cellspacing="0"><thead><tr><th>Nom</th><th>Modèle</th><th>Dose</th><th>Interligne</th><th>Vitesse</th><th>Pression</th></tr></thead><tbody>`;
  list.forEach(s => {
    html += `<tr><td>${s.name}</td><td>${s.model}</td><td>${s.dose}</td><td>${s.interligne}</td><td>${s.vitesse}</td><td>${s.pressure}</td></tr>`;
  });
  html += `</tbody></table>`;
  const w = window.open("", "_blank", "noopener");
  w.document.write(html);
  w.document.close();
}

/* ----------------------------------------------------
   MODÈLE PERSONNALISÉ
---------------------------------------------------- */

function buildCustomCoefInputs() {
  const n = Number(document.getElementById("customCount").value);
  const container = document.getElementById("customCoefContainer");
  container.innerHTML = "";

  for (let i = 1; i <= n; i++) {
    const row = document.createElement("div");
    row.className = "customCoefRow";
    row.innerHTML = `
      <label>Sortie ${i}</label>
      <input type="text" placeholder="Nom (ex : Main G ${i})" id="customLabel_${i}">
      <input type="number" step="0.01" value="0.5" id="customCoef_${i}">
    `;
    container.appendChild(row);
  }
}

function saveCustomModel() {
  const name = document.getElementById("customName").value.trim();
  const n = Number(document.getElementById("customCount").value);

  if (!name) {
    alert("Nom du modèle obligatoire");
    return;
  }

  const coefs = [];
  const lbls = [];

  for (let i = 1; i <= n; i++) {
    const coef = Number(document.getElementById(`customCoef_${i}`).value);
    const lbl = document.getElementById(`customLabel_${i}`).value.trim() || `Sortie ${i}`;
    coefs.push(coef);
    lbls.push(lbl);
  }

  models[name] = coefs;
  labels[name] = lbls;

  // Ajouter dans la liste des modèles du select
  const select = document.getElementById("modeleRepartition");
  const opt = document.createElement("option");
  opt.value = name;
  opt.textContent = `Perso – ${name}`;
  select.appendChild(opt);

  alert("Modèle personnalisé enregistré !");
}

/* ----------------------------------------------------
   INIT
---------------------------------------------------- */

window.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  initSimulator();
  const customCount = document.getElementById("customCount");
  if (customCount) {
    customCount.addEventListener("input", buildCustomCoefInputs);
    buildCustomCoefInputs();
  }
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
window.openCustomModel = openCustomModel;
window.saveCustomModel = saveCustomModel;
window.buildCustomCoefInputs = buildCustomCoefInputs;
window.loadScenario = loadScenario;
window.deleteScenario = deleteScenario;
