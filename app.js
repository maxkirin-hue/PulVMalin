/* =========================================================
   PULV MALIN — app.js (version stable + PDF Puppeteer)
   - Débit par rang = dose * interligne * vitesse / 600
   - Coef = fraction d’un rang par sortie
   - Choix pastille: la plus proche du débit cible à 3 bar
   - Pression affichée: pression exacte à régler pour obtenir le débit cible
   - Recalculs: même pastilles + nouvelle interligne / nouvelle dose
   - Export PDF: via backend Puppeteer (Render)
========================================================= */

/* =========================
   CONFIG
========================= */

const PDF_BACKEND_URL = "https://pulvmalinpdf-backend.onrender.com/pdf";

// Statuts pression (bar)
const PRESSURE_OK_MIN = 2.0;
const PRESSURE_OK_MAX = 5.0;
const PRESSURE_LIM_MIN = 1.5;
const PRESSURE_LIM_MAX = 6.0;

// Pression de référence des pastilles
const REF_PRESSURE = 3;

/* =========================
   MODÈLES
   Coef = fraction d’un rang
========================= */

const models = {
  // 3 rangs – sans retour (8 sorties, total coefs = 2.0)
  "3r_sans": [0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25],

  // 3 rangs – avec retour (10 sorties, total coefs = 3.0)
  "3r_avec": [0.25, 0.25, 0.25, 0.5, 0.25, 0.25, 0.25, 0.5, 0.25, 0.25],

  // 4 rangs – sans retour (8 sorties, total coefs = 2.0)
  "4r_sans": [0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25],

  // 4 rangs – avec retour (10 sorties, total coefs = 3.0)
  "4r_avec": [0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.5, 0.5, 0.25, 0.25],
};

const labels = {
  "3r_sans": ["Canon 1", "Canon 2", "Main 3", "Main 4", "Canon 5", "Canon 6", "Main 7", "Main 8"],
  "3r_avec": ["Canon 1", "Canon 2", "Main 3", "Main retour 4", "Main 5", "Canon 6", "Canon 7", "Main retour 8", "Main 9", "Main 10"],
  "4r_sans": ["Canon G", "Canon D", "Main G 1", "Main D 1", "Main G 2", "Main D 2", "Main G 3", "Main D 3"],
  "4r_avec": ["Canon G", "Canon D", "Main G 1", "Main D 1", "Main G 2", "Main D 2", "Main retour G", "Main retour D", "Main G 3", "Main D 3"],
};

/* =========================
   PASTILLES (débit à 3 bar)
   NOTE: remets ici ta liste complète si tu l’avais.
========================= */

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
  { nom: "CP4916-70", q3: 2.39 },
];

/* =========================
   DOM HELPERS
========================= */

function $(id) { return document.getElementById(id); }
function num(v) { return Number(v); }
function isFiniteNumber(v) { return Number.isFinite(v) && !Number.isNaN(v); }
function round(v, d = 2) { return isFiniteNumber(v) ? v.toFixed(d) : "—"; }

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[m]));
}

function showSection(id) {
  document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
  const el = $(id);
  if (el) el.classList.add("active");
}

/* =========================
   PRESSIONS & STATUTS
========================= */

// Q ∝ sqrt(P)  =>  P = Pref * (Q/Qref)^2
function pressureForFlow(qWanted, qAtRef, refPressure = REF_PRESSURE) {
  if (!isFiniteNumber(qWanted) || !isFiniteNumber(qAtRef) || qAtRef <= 0) return NaN;
  return refPressure * Math.pow(qWanted / qAtRef, 2);
}

function pressureStatus(p) {
  if (!isFiniteNumber(p)) return { label: "—", color: "#777", level: "na" };
  if (p < PRESSURE_LIM_MIN || p > PRESSURE_LIM_MAX) return { label: "Changer pastille", color: "#e53935", level: "bad" };
  if (p < PRESSURE_OK_MIN || p > PRESSURE_OK_MAX) return { label: "Limite", color: "#fb8c00", level: "lim" };
  return { label: "OK", color: "#2e7d32", level: "ok" };
}

/* =========================
   CALCULS
========================= */

function debitParRang(dose, interligne, vitesse) {
  return (dose * interligne * vitesse) / 600;
}

function pickBestPastilleForTargetAt3bar(qTarget) {
  let best = null;
  let bestDiff = Infinity;
  for (const p of pastilles) {
    const diff = Math.abs(p.q3 - qTarget);
    if (diff < bestDiff) { bestDiff = diff; best = p; }
  }
  return best;
}

/**
 * Calcule un tableau "idéal":
 * - choisit la pastille (proche à 3 bar)
 * - calcule pression exacte pour obtenir le débit cible
 */
function computeIdeal({ dose, interligne, vitesse, modelKey }) {
  const coefs = models[modelKey];
  const names = labels[modelKey];
  if (!coefs || !names) return null;

  const qRang = debitParRang(dose, interligne, vitesse);

  const rows = coefs.map((coef, i) => {
    const qTarget = qRang * coef;
    const best = pickBestPastilleForTargetAt3bar(qTarget);
    const pWork = pressureForFlow(qTarget, best.q3, REF_PRESSURE);
    const st = pressureStatus(pWork);

    return {
      idx: i + 1,
      label: names[i] ?? `Sortie ${i + 1}`,
      coef,
      qTarget,
      pastille: best.nom,
      q3: best.q3,
      pWork,
      status: st.label,
      statusColor: st.color,
    };
  });

  return {
    modelKey,
    dose,
    interligne,
    vitesse,
    qRang,
    rows,
    // garde les pastilles choisies pour recalcul "mêmes pastilles"
    chosenNozzles: rows.map(r => ({ pastille: r.pastille, q3: r.q3 })),
  };
}

/**
 * Recalcule la pression en gardant les mêmes pastilles (mêmes q3),
 * mais avec nouvelle interligne OU nouvelle dose.
 */
function computeWithSameNozzles({ base, newDose, newInterligne }) {
  const coefs = models[base.modelKey];
  const names = labels[base.modelKey];
  if (!coefs || !names) return null;

  const dose = isFiniteNumber(newDose) ? newDose : base.dose;
  const interligne = isFiniteNumber(newInterligne) ? newInterligne : base.interligne;

  const qRang = debitParRang(dose, interligne, base.vitesse);

  const rows = coefs.map((coef, i) => {
    const qTarget = qRang * coef;
    const nozzle = base.chosenNozzles[i];
    const q3 = nozzle?.q3;

    const pWork = pressureForFlow(qTarget, q3, REF_PRESSURE);
    const st = pressureStatus(pWork);

    return {
      idx: i + 1,
      label: names[i] ?? `Sortie ${i + 1}`,
      pastille: nozzle?.pastille ?? "—",
      q3,
      pWork,
      status: st.label,
      statusColor: st.color,
    };
  });

  return { dose, interligne, vitesse: base.vitesse, rows };
}

/* =========================
   AFFICHAGES TABLEAUX
========================= */

function renderIdealTable(result) {
  const tbody = document.querySelector("#resultTable tbody");
  tbody.innerHTML = "";

  result.rows.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.idx}</td>
      <td>${escapeHtml(r.label)}</td>
      <td>${r.coef}</td>
      <td>${round(r.qTarget, 3)}</td>
      <td>${escapeHtml(r.pastille)}</td>
      <td>${round(r.q3, 3)}</td>
      <td style="font-weight:700;color:${r.statusColor}">${round(r.pWork, 2)} bar</td>
      <td style="font-weight:700;color:${r.statusColor}">${escapeHtml(r.status)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderAltInterligneTable(alt, targetTableId) {
  const tbody = document.querySelector(`#${targetTableId} tbody`);
  tbody.innerHTML = "";

  alt.rows.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.idx}</td>
      <td>${escapeHtml(r.label)}</td>
      <td>${escapeHtml(r.pastille)}</td>
      <td style="font-weight:700;color:${r.statusColor}">${round(r.pWork, 2)} bar</td>
      <td style="font-weight:700;color:${r.statusColor}">${escapeHtml(r.status)}</td>
    `;
    tbody.appendChild(tr);
  });
}

/* =========================
   SCHÉMA
========================= */

function showSchema(modelKey) {
  const container = $("schemaContainer");
  container.innerHTML = "";

  const coefs = models[modelKey];
  const names = labels[modelKey];
  if (!coefs || !names) return;

  const wrap = document.createElement("div");
  wrap.className = "schema-list";

  coefs.forEach((coef, i) => {
    const row = document.createElement("div");
    row.className = "schema-row";

    const dot = document.createElement("div");
    dot.className = "schema-dot";
    dot.dataset.coef = String(coef);

    const text = document.createElement("div");
    text.className = "schema-text";
    text.innerHTML = `<strong>${escapeHtml(names[i] ?? `Sortie ${i + 1}`)}</strong> — coef ${coef}`;

    row.appendChild(dot);
    row.appendChild(text);
    wrap.appendChild(row);
  });

  container.appendChild(wrap);
}

/* =========================
   TANGENTIEL 2 RANGS
   - Débit total = 2 rangs
   - Chaque buse : 2 / nbBuses (fraction de rang)
========================= */

function createTangentielModel() {
  const n = num($("nbBusesTangentiel")?.value);
  if (!isFiniteNumber(n) || n < 1 || n > 60) {
    alert("Nombre de buses invalide.");
    return;
  }

  const coef = 2 / n;
  models["2r_tangentiel"] = Array(n).fill(coef);
  labels["2r_tangentiel"] = Array.from({ length: n }, (_, i) => `Buse ${i + 1}`);

  const sel = $("modeleRepartition");
  if (sel && !sel.querySelector('option[value="2r_tangentiel"]')) {
    const opt = document.createElement("option");
    opt.value = "2r_tangentiel";
    opt.textContent = "2 rangs — Tangentiel/Aéro";
    sel.appendChild(opt);
  }

  if (sel) sel.value = "2r_tangentiel";
  showSection("settings");
  showSchema("2r_tangentiel");
}

/* =========================
   PERSISTENCE
========================= */

function saveMachine() {
  localStorage.setItem("machine", $("machineName")?.value || "");
  alert("Machine enregistrée !");
}

function loadMachine() {
  const v = localStorage.getItem("machine") || "";
  if ($("machineName")) $("machineName").value = v;
}

function saveSettings() {
  const data = {
    modelKey: $("modeleRepartition")?.value || "",
    dose: $("dose")?.value || "",
    interligne: $("interligne")?.value || "",
    vitesse: $("vitesse")?.value || "",
  };
  localStorage.setItem("pulvmalin_settings", JSON.stringify(data));
}

function loadSettings() {
  const raw = localStorage.getItem("pulvmalin_settings");
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    if ($("dose")) $("dose").value = data.dose ?? "";
    if ($("interligne")) $("interligne").value = data.interligne ?? "";
    if ($("vitesse")) $("vitesse").value = data.vitesse ?? "";
    if ($("modeleRepartition")) $("modeleRepartition").value = data.modelKey ?? "";
    if (data.modelKey) showSchema(data.modelKey);
  } catch {
    // ignore
  }
}

/* =========================
   UI ACTIONS
========================= */

let lastBaseResult = null;

function calculateOutputs() {
  const modelKey = $("modeleRepartition")?.value;
  const dose = num($("dose")?.value);
  const interligne = num($("interligne")?.value);
  const vitesse = num($("vitesse")?.value);

  if (!modelKey || !models[modelKey]) {
    alert("Choisis un modèle de répartition.");
    return;
  }
  if (!isFiniteNumber(dose) || dose <= 0 || !isFiniteNumber(interligne) || interligne <= 0 || !isFiniteNumber(vitesse) || vitesse <= 0) {
    alert("Dose, interligne et vitesse doivent être renseignées (valeurs > 0).");
    return;
  }

  const base = computeIdeal({ dose, interligne, vitesse, modelKey });
  lastBaseResult = base;

  renderIdealTable(base);
  renderResume(base);

  // Pré-remplis champs alternatifs si présents dans ton HTML
  if ($("newInterligne")) $("newInterligne").value = "";
  if ($("newDose")) $("newDose").value = "";

  // Affiche les sections de recalcul si elles existent
  if ($("altTable")) clearTableBody("altTable");
  if ($("doseTable")) clearTableBody("doseTable");

  saveSettings();
  showSection("result");
}

function clearTableBody(tableId) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  if (tbody) tbody.innerHTML = "";
}

function calculatePressureWithSameNozzles() {
  if (!lastBaseResult) {
    alert("Lance d'abord un calcul (réglage idéal).");
    return;
  }
  const newInter = num($("newInterligne")?.value);
  if (!isFiniteNumber(newInter) || newInter <= 0) {
    alert("Nouvelle interligne invalide.");
    return;
  }

  const alt = computeWithSameNozzles({ base: lastBaseResult, newInterligne: newInter });
  renderAltInterligneTable(alt, "altTable");
  renderResume(lastBaseResult, { altInterligne: newInter });
}

function calculatePressureWithNewDose() {
  if (!lastBaseResult) {
    alert("Lance d'abord un calcul (réglage idéal).");
    return;
  }
  const newDose = num($("newDose")?.value);
  if (!isFiniteNumber(newDose) || newDose <= 0) {
    alert("Nouvelle dose invalide.");
    return;
  }

  const alt = computeWithSameNozzles({ base: lastBaseResult, newDose });
  renderAltInterligneTable(alt, "doseTable");
  renderResume(lastBaseResult, { altDose: newDose });
}

/* =========================
   RÉSUMÉ
========================= */

function renderResume(base, extras = {}) {
  const target = $("resumeFinal");
  const pdfTarget = $("pdfResume");

  const machine = localStorage.getItem("machine") || "—";
  const modelLabel = $("modeleRepartition")?.selectedOptions?.[0]?.textContent || base.modelKey;

  const html = `
    <div class="resume">
      <div><strong>Machine :</strong> ${escapeHtml(machine)}</div>
      <div><strong>Modèle :</strong> ${escapeHtml(modelLabel)}</div>
      <div><strong>Dose :</strong> ${round(base.dose, 0)} L/ha</div>
      <div><strong>Interligne :</strong> ${round(base.interligne, 2)} m</div>
      <div><strong>Vitesse :</strong> ${round(base.vitesse, 1)} km/h</div>
      <div class="note">Les pastilles sont choisies au plus proche de 3 bar, puis la pression exacte est calculée pour être juste.</div>
      ${isFiniteNumber(extras.altInterligne) ? `<div><strong>Alternative interligne :</strong> ${round(extras.altInterligne,2)} m (mêmes pastilles)</div>` : ""}
      ${isFiniteNumber(extras.altDose) ? `<div><strong>Alternative dose :</strong> ${round(extras.altDose,0)} L/ha (mêmes pastilles)</div>` : ""}
    </div>
  `;

  if (target) target.innerHTML = html;
  if (pdfTarget) pdfTarget.innerHTML = html;
}

/* =========================
   PDF LAYOUT (schéma + tableaux)
========================= */

function buildPdfSchemaFromModel(modelKey) {
  const coefs = models[modelKey] || [];
  const names = labels[modelKey] || [];

  const items = coefs.map((c, i) => `
    <div class="pdf-schema-row">
      <div class="pdf-dot" data-coef="${c}"></div>
      <div><strong>${escapeHtml(names[i] ?? `Sortie ${i + 1}`)}</strong> — coef ${c}</div>
    </div>
  `).join("");

  return `<div class="pdf-schema">${items}</div>`;
}

function buildPdfHtml() {
  const machine = localStorage.getItem("machine") || "—";
  const modelKey = $("modeleRepartition")?.value || "—";
  const modelLabel = $("modeleRepartition")?.selectedOptions?.[0]?.textContent || modelKey;

  const idealTable = $("resultTable") ? $("resultTable").outerHTML : "";
  const altTable = $("altTable") ? $("altTable").outerHTML : "";
  const doseTable = $("doseTable") ? $("doseTable").outerHTML : "";
  const resume = $("pdfResume") ? $("pdfResume").innerHTML : "";

  const schema = buildPdfSchemaFromModel(modelKey);

  // Styles inline (Puppeteer-safe)
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  body{font-family:Arial,sans-serif;color:#222;font-size:12px}
  .brand{font-size:28px;font-weight:900;text-align:center;color:#2e7d32;margin:0}
  .brand span{color:#43a047}
  .sub{margin:4px 0 14px 0;text-align:center}
  h2{color:#2e7d32;border-bottom:2px solid #c8e6c9;padding-bottom:4px;margin:18px 0 10px}
  table{width:100%;border-collapse:collapse;margin-top:6px}
  th,td{border:1px solid #ddd;padding:6px;vertical-align:top}
  th{background:#e8f5e9}
  .resume{border:1px solid #e6f3ea;background:#f3fbf5;padding:10px;border-radius:8px}
  .note{margin-top:6px;color:#2b6b2b}
  .pdf-schema{display:grid;grid-template-columns:1fr 1fr;gap:6px}
  .pdf-schema-row{display:flex;gap:8px;align-items:center;padding:4px 0}
  .pdf-dot{width:12px;height:12px;border-radius:50%;border:1px solid #333}
  .pdf-dot[data-coef="0.25"]{background:#9be7a1}
  .pdf-dot[data-coef="0.5"]{background:#4caf50}
  .pdf-dot[data-coef="1"]{background:#1b5e20}
  .muted{color:#666}
  .block{break-inside:avoid}
</style>
</head>
<body>
  <h1 class="brand">PULV <span>MALIN</span></h1>
  <div class="sub"><strong>Machine :</strong> ${escapeHtml(machine)} <span class="muted">—</span> <strong>Modèle :</strong> ${escapeHtml(modelLabel)}</div>

  <h2>Schéma</h2>
  <div class="block">${schema}</div>

  <h2>Réglage idéal</h2>
  <div class="block">${idealTable}</div>

  ${altTable ? `
    <h2>Alternative interligne (mêmes pastilles)</h2>
    <div class="block">${altTable}</div>
  ` : ""}

  ${doseTable ? `
    <h2>Alternative dose (mêmes pastilles)</h2>
    <div class="block">${doseTable}</div>
  ` : ""}

  <h2>Résumé</h2>
  <div class="block">${resume}</div>
</body>
</html>`;
}

/* =========================
   EXPORT PDF via Puppeteer + Loader
========================= */

async function exportPDF() {
  const loader = $("pdfLoader");
  if (loader) loader.classList.remove("hidden");

  try {
    if (!lastBaseResult) {
      alert("Lance d'abord un calcul.");
      return;
    }

    const html = buildPdfHtml();

    const response = await fetch(PDF_BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html }),
    });

    if (!response.ok) {
      const msg = await response.text();
      throw new Error(msg || "Erreur backend PDF");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "reglage_pulve.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Export PDF error:", err);
    alert("Erreur lors de la génération du PDF.");
  } finally {
    if (loader) loader.classList.add("hidden");
  }
}

/* =========================
   INIT
========================= */

window.addEventListener("DOMContentLoaded", () => {
  loadMachine();
  loadSettings();
});

/* =========================
   EXPORT GLOBAL (HTML onclick)
========================= */

window.showSection = showSection;
window.showSchema = showSchema;

window.saveMachine = saveMachine;
window.createTangentielModel = createTangentielModel;

window.calculateOutputs = calculateOutputs;
window.calculatePressureWithSameNozzles = calculatePressureWithSameNozzles;
window.calculatePressureWithNewDose = calculatePressureWithNewDose;

window.exportPDF = exportPDF;
