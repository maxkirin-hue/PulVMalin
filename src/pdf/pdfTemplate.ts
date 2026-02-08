function vitiSchema() {
  return `
<svg width="500" height="260">
  <rect x="210" y="100" width="80" height="60" fill="#ccc" stroke="#333"/>
  <line x1="210" y1="130" x2="80" y2="130" stroke="#2ecc71" stroke-width="6"/>
  <circle cx="120" cy="90" r="8" fill="#2ecc71"/><text x="135" y="95">Canon G2</text>
  <circle cx="120" cy="130" r="8" fill="#2ecc71"/><text x="135" y="135">Canon G1</text>
  <circle cx="120" cy="160" r="8" fill="#2ecc71"/><text x="135" y="165">Main 1 G</text>
  <circle cx="120" cy="190" r="8" fill="#2ecc71"/><text x="135" y="195">Main 2 G</text>
  <circle cx="120" cy="220" r="8" fill="#2ecc71"/><text x="135" y="225">Retour G</text>

  <line x1="290" y1="130" x2="420" y2="130" stroke="#2ecc71" stroke-width="6"/>
  <circle cx="380" cy="90" r="8" fill="#2ecc71"/><text x="300" y="95">Canon D2</text>
  <circle cx="380" cy="130" r="8" fill="#2ecc71"/><text x="300" y="135">Canon D1</text>
  <circle cx="380" cy="160" r="8" fill="#2ecc71"/><text x="300" y="165">Main 1 D</text>
  <circle cx="380" cy="190" r="8" fill="#2ecc71"/><text x="300" y="195">Main 2 D</text>
  <circle cx="380" cy="220" r="8" fill="#2ecc71"/><text x="300" y="225">Retour D</text>
</svg>
`;
}
function arboSchema() {
  return `
<svg width="500" height="260">
  <circle cx="250" cy="130" r="40" fill="#ccc" stroke="#333"/>

  <circle cx="150" cy="60" r="8" fill="#2ecc71"/><text x="165" y="65">G5</text>
  <circle cx="150" cy="90" r="8" fill="#2ecc71"/><text x="165" y="95">G4</text>
  <circle cx="150" cy="130" r="8" fill="#2ecc71"/><text x="165" y="135">G3</text>
  <circle cx="150" cy="170" r="8" fill="#2ecc71"/><text x="165" y="175">G2</text>
  <circle cx="150" cy="200" r="8" fill="#2ecc71"/><text x="165" y="205">G1</text>

  <circle cx="350" cy="60" r="8" fill="#2ecc71"/><text x="300" y="65">D5</text>
  <circle cx="350" cy="90" r="8" fill="#2ecc71"/><text x="300" y="95">D4</text>
  <circle cx="350" cy="130" r="8" fill="#2ecc71"/><text x="300" y="135">D3</text>
  <circle cx="350" cy="170" r="8" fill="#2ecc71"/><text x="300" y="175">D2</text>
  <circle cx="350" cy="200" r="8" fill="#2ecc71"/><text x="300" y="205">D1</text>
</svg>
`;
}
function tangentielSchema() {
  return `
<svg width="500" height="260">
  <rect x="180" y="40" width="20" height="180" fill="#ccc" stroke="#333"/>
  <rect x="300" y="40" width="20" height="180" fill="#ccc" stroke="#333"/>

  <circle cx="190" cy="60" r="8" fill="#2ecc71"/><text x="205" y="65">G5</text>
  <circle cx="190" cy="90" r="8" fill="#2ecc71"/><text x="205" y="95">G4</text>
  <circle cx="190" cy="130" r="8" fill="#2ecc71"/><text x="205" y="135">G3</text>
  <circle cx="190" cy="170" r="8" fill="#2ecc71"/><text x="205" y="175">G2</text>
  <circle cx="190" cy="200" r="8" fill="#2ecc71"/><text x="205" y="205">G1</text>

  <circle cx="310" cy="60" r="8" fill="#2ecc71"/><text x="260" y="65">D5</text>
  <circle cx="310" cy="90" r="8" fill="#2ecc71"/><text x="260" y="95">D4</text>
  <circle cx="310" cy="130" r="8" fill="#2ecc71"/><text x="260" y="135">D3</text>
  <circle cx="310" cy="170" r="8" fill="#2ecc71"/><text x="260" y="175">D2</text>
  <circle cx="310" cy="200" r="8" fill="#2ecc71"/><text x="260" y="205">D1</text>
</svg>
`;
}
function rampeSchema() {
  return `
<svg width="500" height="120">
  <line x1="50" y1="60" x2="450" y2="60" stroke="#ccc" stroke-width="6"/>

  <circle cx="120" cy="60" r="8" fill="#2ecc71"/><text x="105" y="50">G3</text>
  <circle cx="160" cy="60" r="8" fill="#2ecc71"/><text x="145" y="50">G2</text>
  <circle cx="200" cy="60" r="8" fill="#2ecc71"/><text x="185" y="50">G1</text>

  <circle cx="300" cy="60" r="8" fill="#2ecc71"/><text x="285" y="50">D1</text>
  <circle cx="340" cy="60" r="8" fill="#2ecc71"/><text x="325" y="50">D2</text>
  <circle cx="380" cy="60" r="8" fill="#2ecc71"/><text x="365" y="50">D3</text>
</svg>
`;
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
  <div style="font-family:Arial; width:700px; color:#222;">

    <div style="background:#2ecc71; color:white; padding:15px; border-radius:8px;">
      <div style="font-size:26px; font-weight:bold;">PulvMalin</div>
      <div style="font-size:18px;">Fiche de réglage de votre pulvérisateur</div>
      <div style="float:right; margin-top:-40px;">${today}</div>
    </div>

    <h3>Paramètres de travail</h3>
    <table style="width:100%; border-collapse:collapse;">
      <tr><td>Nom</td><td>${state.userName}</td></tr>
      <tr><td>Machine</td><td>${state.machineType}</td></tr>
      <tr><td>Modèle</td><td>${state.modelKey}</td></tr>
      <tr><td>Famille</td><td>${state.familyKey ?? "-"}</td></tr>
      <tr><td>Largeur / interligne</td><td>${state.largeur ?? state.interligne} m</td></tr>
      <tr><td>Dose</td><td>${state.dose} L/ha</td></tr>
      <tr><td>Vitesse</td><td>${state.vitesse} km/h</td></tr>
      <tr><td>Débit total calculé</td><td>${(state.qTotal ?? 0).toFixed(2)} L/min</td></tr>
    </table>

    <h3>Détail par sortie</h3>
    <table style="width:100%; border-collapse:collapse;">
      <tr style="background:#f0f0f0;">
        <th>Sortie</th><th>Pastille</th><th>Débit cible</th><th>Débit réel</th><th>Écart</th>
      </tr>
      ${state.results.map(r => `
        <tr>
          <td>${r.outputName}</td>
          <td>${r.nozzleLabel}</td>
          <td>${r.qTarget.toFixed(2)} L/min</td>
          <td>${r.qReal.toFixed(2)} L/min</td>
          <td>${(r.relError*100).toFixed(1)}%</td>
        </tr>
      `).join("")}
    </table>

    <h3>Pression de travail recommandée</h3>
    <div style="border:2px solid #2ecc71; padding:10px; border-radius:6px;">
      <strong>${(state.recommendedPressure ?? 0).toFixed(1)} bar</strong><br>
(Pression idéale famille : ${state.familyPressure ?? "?"} bar)
      (Pression idéale famille : ${state.familyPressure ?? "?"} bar)
    </div>

    <h3>Schéma machine</h3>
    <div>${schema()}</div>

  </div>
  `;
}
