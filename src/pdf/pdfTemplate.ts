function vitiSchema() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="180" viewBox="0 0 500 260">
  <rect x="210" y="100" width="80" height="60" fill="#ccc" stroke="#333"/>
  <line x1="210" y1="130" x2="80" y2="130" stroke="#2ecc71" stroke-width="6"/>
  <circle cx="120" cy="90" r="8" fill="#2ecc71"/><text x="135" y="95" font-size="12" font-family="Arial">Canon G2</text>
  <circle cx="120" cy="130" r="8" fill="#2ecc71"/><text x="135" y="135" font-size="12" font-family="Arial">Canon G1</text>
  <circle cx="120" cy="160" r="8" fill="#2ecc71"/><text x="135" y="165" font-size="12" font-family="Arial">Main 1 G</text>
  <circle cx="120" cy="190" r="8" fill="#2ecc71"/><text x="135" y="195" font-size="12" font-family="Arial">Main 2 G</text>
  <circle cx="120" cy="220" r="8" fill="#2ecc71"/><text x="135" y="225" font-size="12" font-family="Arial">Retour G</text>

  <line x1="290" y1="130" x2="420" y2="130" stroke="#2ecc71" stroke-width="6"/>
  <circle cx="380" cy="90" r="8" fill="#2ecc71"/><text x="300" y="95" font-size="12" font-family="Arial">Canon D2</text>
  <circle cx="380" cy="130" r="8" fill="#2ecc71"/><text x="300" y="135" font-size="12" font-family="Arial">Canon D1</text>
  <circle cx="380" cy="160" r="8" fill="#2ecc71"/><text x="300" y="165" font-size="12" font-family="Arial">Main 1 D</text>
  <circle cx="380" cy="190" r="8" fill="#2ecc71"/><text x="300" y="195" font-size="12" font-family="Arial">Main 2 D</text>
  <circle cx="380" cy="220" r="8" fill="#2ecc71"/><text x="300" y="225" font-size="12" font-family="Arial">Retour D</text>
</svg>`;
  
  const base64 = btoa(unescape(encodeURIComponent(svg)));
  return `<img src="data:image/svg+xml;base64,${base64}" style="max-width: 100%; height: auto;" alt="Schéma viti">`;
}

function arboSchema() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="180" viewBox="0 0 500 260">
  <circle cx="250" cy="130" r="40" fill="#ccc" stroke="#333"/>

  <circle cx="150" cy="60" r="8" fill="#2ecc71"/><text x="165" y="65" font-size="12" font-family="Arial">G5</text>
  <circle cx="150" cy="90" r="8" fill="#2ecc71"/><text x="165" y="95" font-size="12" font-family="Arial">G4</text>
  <circle cx="150" cy="130" r="8" fill="#2ecc71"/><text x="165" y="135" font-size="12" font-family="Arial">G3</text>
  <circle cx="150" cy="170" r="8" fill="#2ecc71"/><text x="165" y="175" font-size="12" font-family="Arial">G2</text>
  <circle cx="150" cy="200" r="8" fill="#2ecc71"/><text x="165" y="205" font-size="12" font-family="Arial">G1</text>

  <circle cx="350" cy="60" r="8" fill="#2ecc71"/><text x="300" y="65" font-size="12" font-family="Arial">D5</text>
  <circle cx="350" cy="90" r="8" fill="#2ecc71"/><text x="300" y="95" font-size="12" font-family="Arial">D4</text>
  <circle cx="350" cy="130" r="8" fill="#2ecc71"/><text x="300" y="135" font-size="12" font-family="Arial">D3</text>
  <circle cx="350" cy="170" r="8" fill="#2ecc71"/><text x="300" y="175" font-size="12" font-family="Arial">D2</text>
  <circle cx="350" cy="200" r="8" fill="#2ecc71"/><text x="300" y="205" font-size="12" font-family="Arial">D1</text>
</svg>`;
  
  const base64 = btoa(unescape(encodeURIComponent(svg)));
  return `<img src="data:image/svg+xml;base64,${base64}" style="max-width: 100%; height: auto;" alt="Schéma arbo">`;
}
function tangentielSchema() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="180" viewBox="0 0 500 260">
  <rect x="180" y="40" width="20" height="180" fill="#ccc" stroke="#333"/>
  <rect x="300" y="40" width="20" height="180" fill="#ccc" stroke="#333"/>

  <circle cx="190" cy="60" r="8" fill="#2ecc71"/><text x="205" y="65" font-size="12" font-family="Arial">G5</text>
  <circle cx="190" cy="90" r="8" fill="#2ecc71"/><text x="205" y="95" font-size="12" font-family="Arial">G4</text>
  <circle cx="190" cy="130" r="8" fill="#2ecc71"/><text x="205" y="135" font-size="12" font-family="Arial">G3</text>
  <circle cx="190" cy="170" r="8" fill="#2ecc71"/><text x="205" y="175" font-size="12" font-family="Arial">G2</text>
  <circle cx="190" cy="200" r="8" fill="#2ecc71"/><text x="205" y="205" font-size="12" font-family="Arial">G1</text>

  <circle cx="310" cy="60" r="8" fill="#2ecc71"/><text x="260" y="65" font-size="12" font-family="Arial">D5</text>
  <circle cx="310" cy="90" r="8" fill="#2ecc71"/><text x="260" y="95" font-size="12" font-family="Arial">D4</text>
  <circle cx="310" cy="130" r="8" fill="#2ecc71"/><text x="260" y="135" font-size="12" font-family="Arial">D3</text>
  <circle cx="310" cy="170" r="8" fill="#2ecc71"/><text x="260" y="175" font-size="12" font-family="Arial">D2</text>
  <circle cx="310" cy="200" r="8" fill="#2ecc71"/><text x="260" y="205" font-size="12" font-family="Arial">D1</text>
</svg>`;
  
  const base64 = btoa(unescape(encodeURIComponent(svg)));
  return `<img src="data:image/svg+xml;base64,${base64}" style="max-width: 100%; height: auto;" alt="Schéma tangentiel">`;
}

function rampeSchema() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="80" viewBox="0 0 500 120">
  <line x1="50" y1="60" x2="450" y2="60" stroke="#ccc" stroke-width="6"/>

  <circle cx="120" cy="60" r="8" fill="#2ecc71"/><text x="105" y="50" font-size="12" font-family="Arial">G3</text>
  <circle cx="160" cy="60" r="8" fill="#2ecc71"/><text x="145" y="50" font-size="12" font-family="Arial">G2</text>
  <circle cx="200" cy="60" r="8" fill="#2ecc71"/><text x="185" y="50" font-size="12" font-family="Arial">G1</text>

  <circle cx="300" cy="60" r="8" fill="#2ecc71"/><text x="285" y="50" font-size="12" font-family="Arial">D1</text>
  <circle cx="340" cy="60" r="8" fill="#2ecc71"/><text x="325" y="50" font-size="12" font-family="Arial">D2</text>
  <circle cx="380" cy="60" r="8" fill="#2ecc71"/><text x="365" y="50" font-size="12" font-family="Arial">D3</text>
</svg>`;
  
  const base64 = btoa(unescape(encodeURIComponent(svg)));
  return `<img src="data:image/svg+xml;base64,${base64}" style="max-width: 100%; height: auto;" alt="Schéma rampe">`;
}
export function generatePdfFilename(state: any): string {
  const userName = (state.userName || "utilisateur").replace(/[^a-z0-9]/gi, '_');
  const machineType = (state.machineType || "machine").replace(/[^a-z0-9]/gi, '_');
  const date = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
  
  return `fiche_${userName}_${machineType}_${date}.pdf`;
}

export function generatePdfHtml(state: any): string {
  const today = new Date().toLocaleDateString("fr-FR");

  function schema() {
    switch (state.machineType) {
      case "viti": return vitiSchema();
      case "arbo": return arboSchema();
      case "tangentiel": return tangentielSchema();
      case "rampe": return rampeSchema();
      default: return "";
    }
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 11px;
      color: #222;
      margin: 0;
      padding: 0;
      line-height: 1.3;
    }
    .container {
      width: 100%;
      max-width: 210mm;
      padding: 0 15mm 15mm 15mm;
    }
    .header {
      background: #2ecc71;
      color: white;
      padding: 12px 15mm;
      margin-bottom: 10px;
      position: relative;
    }
    .header-title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 2px;
    }
    .header-subtitle {
      font-size: 13px;
    }
    .header-date {
      position: absolute;
      top: 12px;
      right: 15mm;
      font-size: 11px;
    }
    h3 {
      font-size: 13px;
      margin: 8px 0 5px 0;
      color: #2ecc71;
      border-bottom: 1px solid #2ecc71;
      padding-bottom: 3px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
      font-size: 10px;
    }
    table td, table th {
      padding: 3px 5px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }
    table tr:last-child td {
      border-bottom: none;
    }
    table th {
      background: #f5f5f5;
      font-weight: bold;
      border-bottom: 2px solid #2ecc71;
    }
    .info-table td:first-child {
      font-weight: bold;
      width: 40%;
      color: #555;
    }
    .pressure-box {
      border: 2px solid #2ecc71;
      padding: 8px;
      border-radius: 6px;
      margin: 5px 0 8px 0;
      font-size: 11px;
    }
    .pressure-box strong {
      font-size: 14px;
      color: #2ecc71;
    }
    .schema-container {
      text-align: center;
      margin-top: 5px;
      display: block;
    }
    .schema-container svg {
      max-width: 100%;
      height: auto;
      display: inline-block;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-title">PulvMalin</div>
      <div class="header-subtitle">Fiche de réglage de votre pulvérisateur</div>
      <div class="header-date">${today}</div>
    </div>

    <h3>Paramètres de travail</h3>
    <table class="info-table">
      <tr><td>Nom</td><td>${state.userName || "-"}</td></tr>
      <tr><td>Machine</td><td>${state.machineType || "-"}</td></tr>
      <tr><td>Modèle</td><td>${state.modelKey || "-"}</td></tr>
      <tr><td>Famille</td><td>${state.familyKey || "-"}</td></tr>
      <tr><td>Largeur / interligne</td><td>${state.largeur || state.interligne || "-"} m</td></tr>
      <tr><td>Dose</td><td>${state.dose || "-"} L/ha</td></tr>
      <tr><td>Vitesse</td><td>${state.vitesse || "-"} km/h</td></tr>
      <tr><td>Débit total calculé</td><td>${(state.qTotal ?? 0).toFixed(2)} L/min</td></tr>
    </table>

    <h3>Détail par sortie</h3>
    <table>
      <thead>
        <tr>
          <th>Sortie</th>
          <th>Pastille</th>
          <th>Débit cible</th>
          <th>Débit réel</th>
          <th>Écart</th>
        </tr>
      </thead>
      <tbody>
        ${(state.results || []).map(r => `
          <tr>
            <td>${r.outputName || "-"}</td>
            <td>${r.nozzleLabel || "-"}</td>
            <td>${(r.qTarget || 0).toFixed(2)} L/min</td>
            <td>${(r.qReal || 0).toFixed(2)} L/min</td>
            <td>${((r.relError || 0) * 100).toFixed(1)}%</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <h3>Pression de travail recommandée</h3>
    <div class="pressure-box">
      <strong>${(state.recommendedPressure ?? 0).toFixed(1)} bar</strong><br>
      (Pression idéale famille : ${state.familyPressure ?? "?"} bar)
    </div>

    <h3>Schéma machine</h3>
    <div class="schema-container">
      ${schema()}
    </div>
  </div>
</body>
</html>
  `;
}