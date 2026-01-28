/* ----------------------------------------------------
   CHARGEMENT DU JSON DES BUSES
---------------------------------------------------- */
let data = {};

fetch("buses.json")
  .then(r => r.json())
  .then(json => {
    data = json.TeeJet_CP4916;
  })
  .catch(err => console.error("Erreur JSON :", err));

/* ----------------------------------------------------
   MODÈLES DE RÉPARTITION
---------------------------------------------------- */
const models = {
  "3r_sans": [0.25, 0.25, 0.25, 0.25, 0.5, 0.5, 0.5, 0.5],
  "3r_avec": [0.25, 0.25, 0.25, 0.25, 0.5, 0.5, 0.25, 0.25, 0.25, 0.25],
  "4r_sans": [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
  "4r_avec": [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.25, 0.25]
};

/* ----------------------------------------------------
   LISTE DES PASTILLES TEEJET CP4916
---------------------------------------------------- */
const pastilles = [
  { nom: "CP4916-20", q3: 0.21 },
  { nom: "CP4916-25", q3: 0.26 },
  { nom: "CP4916-30", q3: 0.31 },
  { nom: "CP4916-35", q3: 0.36 },
  { nom: "CP4916-40", q3: 0.42 },
  { nom: "CP4916-45", q3: 0.47 },
  { nom: "CP4916-47", q3: 0.49 },
  { nom: "CP4916-50", q3: 0.52 },
  { nom: "CP4916-55", q3: 0.57 },
  { nom: "CP4916-60", q3: 0.63 },
  { nom: "CP4916-65", q3: 0.68 },
  { nom: "CP4916-70", q3: 0.73 }
];

/* Débit réel d’une pastille à une pression donnée */
function debitPastille(p, pression) {
  return p.q3 * Math.sqrt(pression / 3);
}

/* ----------------------------------------------------
   NAVIGATION ENTRE SECTIONS
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
   SAUVEGARDE DU NOM DE MACHINE
---------------------------------------------------- */
function saveMachine() {
  const name = document.getElementById("machineName").value;
  localStorage.setItem("machine", name);
  alert("Machine enregistrée !");
}

/* ----------------------------------------------------
   AFFICHAGE DU SCHÉMA VERTICAL
---------------------------------------------------- */
function showSchema(modelKey) {
  const container = document.getElementById("schemaContainer");
  container.innerHTML = "";

  const coefs = models[modelKey];
  if (!coefs) return;

  coefs.forEach(coef => {
    const row = document.createElement("div");
    row.className = "schema-row";

    const dot = document.createElement("div");
    dot.className = "schema-dot";

    if (coef === 0) dot.style.background = "#ccc";
    if (coef === 0.25) dot.style.background = "#9be7a1";
    if (coef === 0.5) dot.style.background = "#4caf50";
    if (coef === 1) dot.style.background = "#1b5e20";

    const label = document.createElement("div");
    label.className = "coef-label";
    label.innerText = coef;

    row.appendChild(dot);
    row.appendChild(label);
    container.appendChild(row);
  });
}

/* ----------------------------------------------------
   CALCUL IDÉAL (3 BAR)
---------------------------------------------------- */
function calculateOutputs() {
  const modelKey = document.getElementById("modeleRepartition").value;
  const coefs = models[modelKey];
  if (!coefs) return;

  const dose = parseFloat(document.getElementById("dose").value);
  const interligne = parseFloat(document.getElementById("interligne").value);
  const vitesse = parseFloat(document.getElementById("vitesse").value);
  const pression = 3;

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
      <td>${coef}</td>
      <td>${debitCible.toFixed(2)}</td>
      <td>${best.nom}</td>
      <td>${best.debit.toFixed(2)}</td>
    `;
    tbody.appendChild(row);
  });

  showSection("result");
}

/* ----------------------------------------------------
   CALCUL ALTERNATIF (MÊMES PASTILLES)
---------------------------------------------------- */
function calculatePressureWithSameNozzles() {
  const modelKey = document.getElementById("modeleRepartition").value;
  const coefs = models[modelKey];
  if (!coefs) return;

  const dose = parseFloat(document.getElementById("dose").value);
  const newInterligne = parseFloat(document.getElementById("newInterligne").value);
  const vitesse = parseFloat(document.getElementById("vitesse").value);

  const altBody = document.querySelector("#altTable tbody");
  altBody.innerHTML = "";

  const rows = document.querySelectorAll("#resultTable tbody tr");

  coefs.forEach((coef, index) => {
    const row = rows[index];
    if (!row) return;

    const pastilleNom = row.children[3].innerText;
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
      <td>${coef}</td>
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
    • Pression recalculée pour chaque sortie<br><br>

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
   SAUVEGARDE / CHARGEMENT DES RÉGLAGES
---------------------------------------------------- */
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
}

/* ----------------------------------------------------
   EXPORT DES FONCTIONS
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
