/* ----------------------------------------------------
   MODÈLES DE RÉPARTITION (COEFFICIENTS)
---------------------------------------------------- */
const models = {
  "3r_sans": [0.25, 0.25, 0.5, 0.5, 0.5, 0.5, 0.25, 0.25],
  "3r_avec": [0.25, 0.25, 0.5, 0.25, 0.25, 0.25, 0.25, 0.5, 0.25, 0.25],
  "4r_sans": [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
  "4r_avec": [0.5, 0.5, 0.5, 0.25, 0.25, 0.5, 0.5, 0.5, 0.25, 0.25]
};

/* ----------------------------------------------------
   NOMS DES SORTIES (SYMÉTRIQUES GAUCHE / DROITE)
---------------------------------------------------- */
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
  ]
};

/* ----------------------------------------------------
   PASTILLES TEEJET CP4916 (DÉBIT À 3 BAR)
---------------------------------------------------- */
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


/* Débit réel d’une pastille à une pression donnée */
function debitPastille(p, pression) {
  return p.q3 * Math.sqrt(pression / 3);
}

/* ----------------------------------------------------
   NAVIGATION
---------------------------------------------------- */
function showSection(id) {
  document.querySelectorAll("section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function goToSettings() {
  showSection("settings");
}

function goHome() {
  showSection("home");
}

/* ----------------------------------------------------
   MACHINE + RÉGLAGES
---------------------------------------------------- */
function saveMachine() {
  const name = document.getElementById("machineName").value;
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
  const data = JSON.parse(localStorage.getItem("pulveSettings"));
  if (!data) return;

  document.getElementById("dose").value = data.dose;
  document.getElementById("interligne").value = data.interligne;
  document.getElementById("vitesse").value = data.vitesse;
  document.getElementById("modeleRepartition").value = data.modele;

  if (data.modele) {
    showSchema(data.modele);
  }
}

/* ----------------------------------------------------
   SCHÉMA VISUEL GAUCHE / DROITE
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

  leftCoefs.forEach((coef, i) => {
    colLeft.appendChild(createSchemaRow(coef, i + 1, leftNames[i]));
  });

  rightCoefs.forEach((coef, i) => {
    colRight.appendChild(createSchemaRow(coef, i + 1 + mid, rightNames[i]));
  });

  grid.appendChild(colLeft);
  grid.appendChild(colRight);
  container.appendChild(grid);
}

function createSchemaRow(coef, index, label) {
  const row = document.createElement("div");
  row.className = "schema-row";

  const dot = document.createElement("div");
  dot.className = "schema-dot";

  if (coef === 0) dot.style.background = "#ccc";
  if (coef === 0.25) dot.style.background = "#9be7a1";
  if (coef === 0.5) dot.style.background = "#4caf50";
  if (coef === 1) dot.style.background = "#1b5e20";

  const text = document.createElement("span");
  text.className = "coef-label";
  text.innerText = `${index}. ${label} (${coef})`;

  row.appendChild(dot);
  row.appendChild(text);
  return row;
}

/* ----------------------------------------------------
   CALCUL RÉGLAGE IDÉAL (3 BAR)
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

  const pression = 3; // réglage idéal
  const tbody = document.querySelector("#resultTable tbody");
  tbody.innerHTML = "";

  coefs.forEach((coef, index) => {
    const debitCible = (dose * interligne * vitesse * coef) / 600;

    let best = null;
    let bestDiff = Infinity;

    pastilles.forEach(p => {
      const debitReel = debitPastille(p, pression);
      const diff = Math.abs(debitReel - debitCible);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = { nom: p.nom, debit: debitReel };
      }
    });

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${names[index]}</td>
      <td>${coef}</td>
      <td>${debitCible.toFixed(2)}</td>
      <td>${best.nom}</td>
      <td>${best.debit.toFixed(2)}</td>
    `;
    tbody.appendChild(row);
  });

  saveSettings();
  showSection("result");
}

/* ----------------------------------------------------
   CALCUL ALTERNATIF (MÊMES PASTILLES)
---------------------------------------------------- */
function calculatePressureWithSameNozzles() {
  const modelKey = document.getElementById("modeleRepartition").value;
  const coefs = models[modelKey];
  const names = labels[modelKey];
  if (!coefs || !names) return;

  const dose = parseFloat(document.getElementById("dose").value);
  const newInterligne = parseFloat(document.getElementById("newInterligne").value);
  const vitesse = parseFloat(document.getElementById("vitesse").value);

  if (isNaN(dose) || isNaN(newInterligne) || isNaN(vitesse)) {
    alert("Merci de remplir la nouvelle interligne.");
    return;
  }

  const altBody = document.querySelector("#altTable tbody");
  altBody.innerHTML = "";

  const rows = document.querySelectorAll("#resultTable tbody tr");

  coefs.forEach((coef, index) => {
    const row = rows[index];
    if (!row) return;

    const pastilleNom = row.children[4].innerText;
    const pastille = pastilles.find(p => p.nom === pastilleNom);
    if (!pastille) return;

    const debitCible = (dose * newInterligne * vitesse * coef) / 600;

    const pression = 3 * Math.pow(debitCible / pastille.q3, 2);

    let status = "";
    let color = "";

    if (pression < 1.5 || pression > 6) {
      status = "Hors plage";
      color = "#e53935";
    } else if (pression < 2 || pression > 5) {
      status = "Limite";
      color = "#fb8c00";
    } else {
      status = "OK";
      color = "#43a047";
    }

    const altRow = document.createElement("tr");
    altRow.innerHTML = `
      <td>${index + 1}</td>
      <td>${names[index]}</td>
      <td>${pastille.nom}</td>
      <td style="color:${color}; font-weight:600;">
        ${pression.toFixed(1)} bar (${status})
      </td>
    `;
    altBody.appendChild(altRow);
  });

  generateResumeFinal();
}

/* ----------------------------------------------------
   RÉSUMÉ FINAL
---------------------------------------------------- */
function generateResumeFinal() {
  const dose = document.getElementById("dose").value;
  const interligne = document.getElementById("interligne").value;
  const vitesse = document.getElementById("vitesse").value;
  const newInterligne = document.getElementById("newInterligne").value;

  const resume = document.getElementById("resumeFinal");

  resume.innerHTML = `
    <strong>Réglage idéal :</strong><br>
    • Dose : ${dose} L/ha<br>
    • Interligne : ${interligne} m<br>
    • Vitesse : ${vitesse} km/h<br>
    • Pression : 3 bar<br><br>

    <strong>Réglage alternatif :</strong><br>
    • Nouvelle interligne : ${newInterligne} m<br>
    • Pression recalculée pour chaque sortie (voir tableau ci-dessus)<br><br>

    <strong>Conseil :</strong><br>
    • Vert = parfait<br>
    • Orange = limite<br>
    • Rouge = changer de pastille
  `;
}

/* ----------------------------------------------------
   EXPORT PDF
---------------------------------------------------- */
function exportPDF() {
  const element = document.querySelector(".container");

  const opt = {
    margin: 10,
    filename: 'reglage_pulve.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
}

/* ----------------------------------------------------
   EXPORT DES FONCTIONS DANS WINDOW
---------------------------------------------------- */
window.saveMachine = saveMachine;
window.goToSettings = goToSettings;
window.goHome = goHome;
window.showSchema = showSchema;
window.calculateOutputs = calculateOutputs;
window.calculatePressureWithSameNozzles = calculatePressureWithSameNozzles;
window.exportPDF = exportPDF;
window.saveSettings = saveSettings;
window.loadSettings = loadSettings;

