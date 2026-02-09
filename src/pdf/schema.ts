/* =========================================================
   SCHEMAS SVG → Base64
   (Version complète PulvMalin)
========================================================= */

/** Convertit un SVG en dataURL base64 */
function svgToBase64(svg: string): string {
  const base64 = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${base64}`;
}

/* =========================================================
   VITI
========================================================= */
export function vitiSchema(): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="180" viewBox="0 0 500 260">
  <rect x="210" y="100" width="80" height="60" fill="#ccc" stroke="#333"/>
  <line x1="210" y1="130" x2="80" y2="130" stroke="#2ecc71" stroke-width="6"/>

  <circle cx="120" cy="90" r="8" fill="#2ecc71"/>
  <text x="135" y="95" font-size="12" font-family="Arial">Canon G2</text>

  <circle cx="120" cy="130" r="8" fill="#2ecc71"/>
  <text x="135" y="135" font-size="12" font-family="Arial">Canon G1</text>

  <circle cx="120" cy="160" r="8" fill="#2ecc71"/>
  <text x="135" y="165" font-size="12" font-family="Arial">Main 1 G</text>

  <circle cx="120" cy="190" r="8" fill="#2ecc71"/>
  <text x="135" y="195" font-size="12" font-family="Arial">Main 2 G</text>

  <circle cx="120" cy="220" r="8" fill="#2ecc71"/>
  <text x="135" y="225" font-size="12" font-family="Arial">Retour G</text>

  <line x1="290" y1="130" x2="420" y2="130" stroke="#2ecc71" stroke-width="6"/>

  <circle cx="380" cy="90" r="8" fill="#2ecc71"/>
  <text x="300" y="95" font-size="12" font-family="Arial">Canon D2</text>

  <circle cx="380" cy="130" r="8" fill="#2ecc71"/>
  <text x="300" y="135" font-size="12" font-family="Arial">Canon D1</text>

  <circle cx="380" cy="160" r="8" fill="#2ecc71"/>
  <text x="300" y="165" font-size="12" font-family="Arial">Main 1 D</text>

  <circle cx="380" cy="190" r="8" fill="#2ecc71"/>
  <text x="300" y="195" font-size="12" font-family="Arial">Main 2 D</text>

  <circle cx="380" cy="220" r="8" fill="#2ecc71"/>
  <text x="300" y="225" font-size="12" font-family="Arial">Retour D</text>
</svg>`;
  return svgToBase64(svg);
}

/* =========================================================
   ARBO
========================================================= */
export function arboSchema(): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="180" viewBox="0 0 500 260">
  <circle cx="250" cy="130" r="40" fill="#ccc" stroke="#333"/>

  <circle cx="150" cy="60" r="8" fill="#2ecc71"/>
  <text x="165" y="65" font-size="12" font-family="Arial">G5</text>

  <circle cx="150" cy="90" r="8" fill="#2ecc71"/>
  <text x="165" y="95" font-size="12" font-family="Arial">G4</text>

  <circle cx="150" cy="130" r="8" fill="#2ecc71"/>
  <text x="165" y="135" font-size="12" font-family="Arial">G3</text>

  <circle cx="150" cy="170" r="8" fill="#2ecc71"/>
  <text x="165" y="175" font-size="12" font-family="Arial">G2</text>

  <circle cx="150" cy="200" r="8" fill="#2ecc71"/>
  <text x="165" y="205" font-size="12" font-family="Arial">G1</text>

  <circle cx="350" cy="60" r="8" fill="#2ecc71"/>
  <text x="300" y="65" font-size="12" font-family="Arial">D5</text>

  <circle cx="350" cy="90" r="8" fill="#2ecc71"/>
  <text x="300" y="95" font-size="12" font-family="Arial">D4</text>

  <circle cx="350" cy="130" r="8" fill="#2ecc71"/>
  <text x="300" y="135" font-size="12" font-family="Arial">D3</text>

  <circle cx="350" cy="170" r="8" fill="#2ecc71"/>
  <text x="300" y="175" font-size="12" font-family="Arial">D2</text>

  <circle cx="350" cy="200" r="8" fill="#2ecc71"/>
  <text x="300" y="205" font-size="12" font-family="Arial">D1</text>
</svg>`;
  return svgToBase64(svg);
}

/* =========================================================
   TANGENTIEL
========================================================= */
export function tangentielSchema(): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="180" viewBox="0 0 500 260">
  <rect x="180" y="40" width="20" height="180" fill="#ccc" stroke="#333"/>
  <rect x="300" y="40" width="20" height="180" fill="#ccc" stroke="#333"/>

  <circle cx="190" cy="60" r="8" fill="#2ecc71"/>
  <text x="205" y="65" font-size="12" font-family="Arial">G5</text>

  <circle cx="190" cy="90" r="8" fill="#2ecc71"/>
  <text x="205" y="95" font-size="12" font-family="Arial">G4</text>

  <circle cx="190" cy="130" r="8" fill="#2ecc71"/>
  <text x="205" y="135" font-size="12" font-family="Arial">G3</text>

  <circle cx="190" cy="170" r="8" fill="#2ecc71"/>
  <text x="205" y="175" font-size="12" font-family="Arial">G2</text>

  <circle cx="190" cy="200" r="8" fill="#2ecc71"/>
  <text x="205" y="205" font-size="12" font-family="Arial">G1</text>

  <circle cx="310" cy="60" r="8" fill="#2ecc71"/>
  <text x="260" y="65" font-size="12" font-family="Arial">D5</text>

  <circle cx="310" cy="90" r="8" fill="#2ecc71"/>
  <text x="260" y="95" font-size="12" font-family="Arial">D4</text>

  <circle cx="310" cy="130" r="8" fill="#2ecc71"/>
  <text x="260" y="135" font-size="12" font-family="Arial">D3</text>

  <circle cx="310" cy="170" r="8" fill="#2ecc71"/>
  <text x="260" y="175" font-size="12" font-family="Arial">D2</text>

  <circle cx="310" cy="200" r="8" fill="#2ecc71"/>
  <text x="260" y="205" font-size="12" font-family="Arial">D1</text>
</svg>`;
  return svgToBase64(svg);
}

/* =========================================================
   RAMPE
========================================================= */
export function rampeSchema(): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="80" viewBox="0 0 500 120">
  <line x1="50" y1="60" x2="450" y2="60" stroke="#ccc" stroke-width="6"/>

  <circle cx="120" cy="60" r="8" fill="#2ecc71"/>
  <text x="105" y="50" font-size="12" font-family="Arial">G3</text>

  <circle cx="160" cy="60" r="8" fill="#2ecc71"/>
  <text x="145" y="50" font-size="12" font-family="Arial">G2</text>

  <circle cx="200" cy="60" r="8" fill="#2ecc71"/>
  <text x="185" y="50" font-size="12" font-family="Arial">G1</text>

  <circle cx="300" cy="60" r="8" fill="#2ecc71"/>
  <text x="285" y="50" font-size="12" font-family="Arial">D1</text>

  <circle cx="340" cy="60" r="8" fill="#2ecc71"/>
  <text x="325" y="50" font-size="12" font-family="Arial">D2</text>

  <circle cx="380" cy="60" r="8" fill="#2ecc71"/>
  <text x="365" y="50" font-size="12" font-family="Arial">D3</text>
</svg>`;
  return svgToBase64(svg);
}
