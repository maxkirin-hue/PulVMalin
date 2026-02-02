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
    font
