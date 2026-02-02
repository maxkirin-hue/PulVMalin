// pdftemplate.js

// --------- HEADER ---------
function renderHeader(state) {
  const logoBase64 =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyOCIgaGVpZ2h0PSIxMjgiIGZpbGw9IiMwMDc3Y2MiIHJ4PSIxNiIvPjx0ZXh0IHg9IjY0IiB5PSI3MiIgZm9udC1zaXplPSI0MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk1BPC90ZXh0Pjwvc3ZnPg==";

  const today = new Date().toLocaleDateString("fr-FR");

  return `
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
      <div style="display:flex; align-items:center;">
        <img src="${logoBase64}" style="height:60px; margin-right:12px;" />
        <div>
          <h1 style="margin:0; font-size:22px;">PulvMalin – Fiche de réglage</h1>
          <div class="subtitle">Diagnostic et réglage optimisé de votre pulvérisateur</div>
        </div>
      </div>

      <div style="text-align:right; font-size:11px; color:#555;">
        <div><strong>Date :</strong> ${today}</div>
        <div><strong>Machine :</strong> ${state.machineType}</div>
        <div><strong>Modèle :</strong> ${state.modelKey}</div>
      </div>
    </div>
  `;
}

// --------- CONFIG PRESSIONS ---------

const familyTargetPressures = {
  CP4916: 3,
  AMT: 2.5,
  ATR80: 5,
  IDK90: 5,
  TXR: 5,
  XR: 3
};

// --------- STYLES PDF ---------

const pdfStyles = `
  body {
    font-family: Arial, sans-serif;
    font-size: 11px;
    padding: 24px;
    color: #2c3e50;
  }

  h1 {
    font-size: 22px;
    margin-bottom: 6px;
  }

  .subtitle {
    font-size: 12px;
    color: #7f8c8d;
    margin-bottom: 18px;
  }

  .section {
    border: 2px solid #2ecc71;
    padding: 10px 12px;
    margin-bottom: 16px;
    border-radius: 8px;
    background: #f6fff8;
  }

  .section-title {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 6px;
    color: #2c3e50;
  }

  .info-table {
    width: 100%;
    border-collapse: collapse;
  }

  .info-table td {
    padding: 3px 4px;
    vertical-align: top;
  }

  .info-table td:first-child {
    width: 35%;
    color: #555;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 6px;
  }

  th, td {
    border: 1px solid #ccc;
    padding: 4px;
    font-size: 10px;
  }

  th {
    background: #e8f8f0;
  }

  .pressure-value {
    font-size: 18px;
    font-weight: bold;
    text-align: center;
    margin-top: 4px;
  }

  .pressure-ideal {
    text-align: center;
    font-size: 10px;
    color: #555;
    margin-top: 2px;
  }

  .machine-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 8px;
  }

  /* ARBO */
  .arbo-machine {
    width: 380px;
    height: 260px;
    position: relative;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
  }

  .arbo-body {
    width: 40px;
    background: #2ecc71;
    border-radius: 6px;
  }

  .arbo-column {
    width: 120px;
    position: relative;
  }

  .arbo-nozzle {
    position: absolute;
    left: 10px;
    background: #27ae60;
    color: white;
    padding: 3px 5px;
    border-radius: 4px;
    font-size: 9px;
  }

  /* RAMPE */
  .rampe {
    width: 360px;
    height: 120px;
    margin: 0 auto;
    position: relative;
  }

  .rampe-line {
    width: 100%;
    height: 6px;
    background: #2ecc71;
    position: absolute;
    top: 40px;
    border-radius: 3px;
  }

  .rampe-nozzle {
    position: absolute;
    top: 18px;
    text-align: center;
  }

  .rampe-dot {
    width: 10px;
    height: 10px;
    background: #27ae60;
    border-radius: 50%;
    margin: 0 auto;
  }

  .rampe-label {
    font-size: 9px;
    margin-top: 3px;
  }

  /* VITI */
  .viti-svg-container {
    width: 420px;
    margin: 0 auto;
  }

  .footer-note {
    font-size: 9px;
    color: #7f8c8d;
    margin-top: 10px;
  }
`;

// --------- HTML COMPLET ---------

export function generatePdfHtml(state) {
  const html = `
  <html>
  <head>
    <meta charset="utf-8" />
    <style>${pdfStyles}</style>
  </head>
  <body>
    ${renderHeader(state)}
    ${renderSettings(state)}
    ${renderPressure(state)}
    ${renderTable(state)}
    ${renderMachine(state)}
    ${renderFooterNote()}
  </body>
  </html>
  `;
  return html;
}

// --------- BLOCS DE RENDU ---------

function renderSettings(state) {
  return `
  <div class="section">
    <div class="section-title">Paramètres de travail</div>
    <table class="info-table">
      <tr><td>Largeur de travail</td><td><strong>${state.largeur} m</strong></td></tr>
      <tr><td>Dose</td><td><strong>${state.dose} L/ha</strong></td></tr>
      <tr><td>Vitesse</td><td><strong>${state.vitesse} km/h</strong></td></tr>
      <tr><td>Modèle</td><td><strong>${state.modelKey}</strong></td></tr>
      <tr><td>Type de machine</td><td><strong>${state.machineType}</strong></td></tr>
      <tr><td>Débit total calculé</td><td><strong>${state.qTotal.toFixed(2)} L/min</strong></td></tr>
    </table>
  </div>`;
}

function renderPressure(state) {
  const famKey = state.familyKey;
  const ideal = familyTargetPressures[famKey] || state.recommendedPressure;
  return `
  <div class="section">
    <div class="section-title">Pression de travail recommandée</div>
    <div class="pressure-value">${state.recommendedPressure.toFixed(2)} bar</div>
    <div class="pressure-ideal">(Pression idéale famille : ${ideal} bar)</div>
  </div>`;
}

function renderTable(state) {
  return `
  <div class="section">
    <div class="section-title">Détail par sortie</div>
    <table>
      <tr>
        <th>Sortie</th>
        <th>Coef</th>
        <th>Débit cible (L/min)</th>
        <th>Pastille / buse</th>
        <th>Débit réel (L/min)</th>
        <th>Pression (bar)</th>
        <th>Écart %</th>
      </tr>
      ${state.results.map(r => `
        <tr>
          <td>${r.outputName}</td>
          <td>${r.coef}</td>
          <td>${r.qTarget.toFixed(2)}</td>

          <!-- Affichage clair de la face AMT -->
          <td>${r.nozzleLabel}${r.face ? ` (${r.face})` : ""}</td>

          <td>${r.qReal.toFixed(2)}</td>
          <td>${state.recommendedPressure.toFixed(2)}</td>
          <td>${(r.relError * 100).toFixed(1)}%</td>
        </tr>
      `).join("")}
    </table>
  </div>`;
}

function renderMachine(state) {
  if (state.machineType === "arbo") return renderArboDiagram(state);
  if (state.machineType === "rampe") return renderRampeDiagram(state);
  if (state.machineType === "viti") return renderVitiDiagram(state);
  return "";
}

function renderFooterNote() {
  return `
    <div class="footer-note">
      Pensez à optimiser la répartition de votre mélange produit/eau sur votre végétation.
      Un bon réglage de votre pulvé, un bon produit au bon moment, dans de bonnes conditions (hygrométrie, vent, etc.) sont essentiels.
    </div>
  `;
}

// --------- Schéma ARBO ---------

function renderArboDiagram(state) {
  const left = state.results.filter(r => r.outputName.toLowerCase().includes("g"));
  const right = state.results.filter(r => r.outputName.toLowerCase().includes("d"));

  return `
  <div class="section">
    <div class="section-title">Schéma machine – Arbo</div>
    <div class="machine-wrapper">
      <div class="arbo-machine">
        <div class="arbo-column">
          ${left.map((r, i) => `
            <div class="arbo-nozzle" style="top:${i * 32}px;">${r.nozzleLabel}</div>
          `).join("")}
        </div>
        <div class="arbo-body"></div>
        <div class="arbo-column">
          ${right.map((r, i) => `
            <div class="arbo-nozzle" style="top:${i * 32}px;">${r.nozzleLabel}</div>
          `).join("")}
        </div>
      </div>
    </div>
  </div>`;
}

// --------- Schéma RAMPE ---------

function renderRampeDiagram(state) {
  const count = state.results.length || 1;
  const spacing = 320 / Math.max(1, (count - 1));

  return `
  <div class="section">
    <div class="section-title">Schéma machine – Rampe</div>
    <div class="machine-wrapper">
      <div class="rampe">
        <div class="rampe-line"></div>
        ${state.results.map((r, i) => `
          <div class="rampe-nozzle" style="left:${i * spacing}px;">
            <div class="rampe-dot"></div>
            <div class="rampe-label">${r.nozzleLabel}</div>
          </div>
        `).join("")}
      </div>
    </div>
  </div>`;
}

// --------- Schéma VITI ---------

function renderVitiDiagram(state) {
  const r = state.results;

  const getLabel = (idx) => (r[idx] ? r[idx].nozzleLabel : "");

  return `
  <div class="section">
    <div class="section-title">Schéma machine – Vigne</div>
    <div class="machine-wrapper">
      <div class="viti-svg-container">
        <svg viewBox="0 0 420 260" xmlns="http://www.w3.org/2000/svg">

          <rect x="0" y="0" width="420" height="260" fill="#f0f0f0" rx="10"/>

          <rect x="170" y="60" width="80" height="120" rx="16" fill="#f1c40f" stroke="#d4ac0d" stroke-width="2"/>
          <rect x="185" y="75" width="50" height="90" rx="10" fill="#fcf3cf"/>
          <rect x="195" y="155" width="30" height="20" rx="4" fill="#bdc3c7"/>

          <rect x="150" y="190" width="120" height="10" fill="#7f8c8d"/>
          <circle cx="170" cy="210" r="12" fill="#34495e"/>
          <circle cx="250" cy="210" r="12" fill="#34495e"/>

          <rect x="60" y="90" width="90" height="6" fill="#27ae60"/>
          <rect x="60" y="140" width="90" height="6" fill="#27ae60"/>
          <rect x="60" y="180" width="90" height="6" fill="#27ae60"/>

          <rect x="270" y="90" width="90" height="6" fill="#27ae60"/>
          <rect x="270" y="140" width="90" height="6" fill="#27ae60"/>
          <rect x="270" y="180" width="90" height="6" fill="#27ae60"/>

          <circle cx="60" cy="90" r="7" fill="#27ae60"/>
          <circle cx="60" cy="140" r="7" fill="#27ae60"/>

          <circle cx="150" cy="90" r="5" fill="#2ecc71"/>
          <circle cx="150" cy="140" r="5" fill="#2ecc71"/>
          <circle cx="150" cy="180" r="5" fill="#2ecc71"/>

          <circle cx="360" cy="90" r="7" fill="#27ae60"/>
          <circle cx="360" cy="140" r="7" fill="#27ae60"/>

          <circle cx="270" cy="90" r="5" fill="#2ecc71"/>
          <circle cx="270" cy="140" r="5" fill="#2ecc71"/>
          <circle cx="270" cy="180" r="5" fill="#2ecc71"/>

          <text x="20" y="80" font-size="9" fill="#2c3e50">${getLabel(0)}</text>
          <text x="20" y="135" font-size="9" fill="#2c3e50">${getLabel(1)}</text>

          <text x="80" y="80" font-size="9" fill="#2c3e50">${getLabel(2)}</text>
          <text x="80" y="135" font-size="9" fill="#2c3e50">${getLabel(3)}</text>
          <text x="80" y="175" font-size="9" fill="#2c3e50">${getLabel(4)}</text>

          <text x="300" y="80" font-size="9" fill="#2c3e50">${getLabel(5)}</text>
          <text x="300" y="135" font-size="9" fill="#2c3e50">${getLabel(6)}</text>

          <text x="320" y="80" font-size="9" fill="#2c3e50">${getLabel(7)}</text>
          <text x="320" y="135" font-size="9" fill="#2c3e50">${getLabel(8)}</text>
          <text x="320" y="175" font-size="9" fill="#2c3e50">${getLabel(9)}</text>

        </svg>
      </div>
    </div>
  </div>`;
}
