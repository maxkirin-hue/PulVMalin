import { detectRangs } from "../core/optimizer";
import { formatVitiModel } from "../utils/format";

const LOGO = `
  <img src="data:image/svg+xml;base64,
  PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMwIDVDMTcuMzQgNSAxMiAxNy4zNCAxMiAzMGMwIDEyLjY2IDUuMzQgMjUgMTggMjVzMTgtMTIuMzQgMTgtMjVjMC0xMi42Ni01LjM0LTI1LTE4LTI1eiIgZmlsbD0iI2IxZTQ5ZiIvPgo8dGV4dCB4PSIxNSIgeT0iMzUiIGZvbnQtc2l6ZT0iMTJweCIgZmlsbD0id2hpdGUiPkxPR088L3RleHQ+Cjwvc3ZnPg==" 
  style="height:50px;" />
`;

const pdfStyles = `
  body { font-family: Arial, sans-serif; font-size: 11px; padding: 24px; color: #2c3e50; }
  h1 { font-size: 22px; margin-bottom: 6px; }
  .subtitle { font-size: 12px; color: #7f8c8d; margin-bottom: 18px; }
  .section { border: 2px solid #2ecc71; padding: 10px 12px; margin-bottom: 16px; border-radius: 8px; background: #f6fff8; }
  .section-title { font-size: 14px; font-weight: bold; margin-bottom: 6px; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th, td { border: 1px solid #ccc; padding: 4px; font-size: 10px; }
  th { background: #e8f8f0; }
  .pressure-value { font-size: 18px; font-weight: bold; text-align: center; }
  .footer-note { font-size: 9px; color: #7f8c8d; margin-top: 10px; }
`;

export function generatePdfHtml(state) {
  const today = new Date().toLocaleDateString("fr-FR");
  const model =
    state.machineType === "viti"
      ? formatVitiModel(state.modelKey)
      : state.machineName;

  const rangs = detectRangs();
  const nbBuses = state.results.length;

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>${pdfStyles}</style>
      </head>

      <body>

        <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
          <div>${LOGO}</div>
          <div style="text-align:right;">
            <h1>PulvMalin – Fiche de réglage</h1>
            <div class="subtitle">Diagnostic et réglage optimisé</div>
            <div><strong>Date :</strong> ${today}</div>
            <div><strong>Nom :</strong> ${state.userName}</div>
            <div><strong>Machine :</strong> ${state.machineType}</div>
            <div><strong>Modèle :</strong> ${model}</div>
            <div><strong>Famille :</strong> ${state.familyKey}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Synthèse</div>
          <table>
            <tr><td>Nombre de rangs</td><td>${rangs}</td></tr>
            <tr><td>Nombre total de buses</td><td>${nbBuses}</td></tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Paramètres de travail</div>
          <table>
            <tr><td>Interligne</td><td>${state.interligne} m</td></tr>
            <tr><td>Dose</td><td>${state.dose} L/ha</td></tr>
            <tr><td>Vitesse</td><td>${state.speed} km/h</td></tr>
            <tr><td>Débit total</td><td>${state.qTotal.toFixed(2)} L/min</td></tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Pression recommandée</div>
          <div class="pressure-value">${state.recommendedPressure.toFixed(2)} bar</div>
        </div>

        <div class="section">
          <div class="section-title">Détail par sortie</div>
          <table>
            <tr>
              <th>Sortie</th>
              <th>Coef</th>
              <th>Débit cible</th>
              <th>Pastille</th>
              <th>Débit réel</th>
              <th>Écart</th>
            </tr>
            ${state.results
              .map(
                r => `
              <tr>
                <td>${r.outputName}</td>
                <td>${r.coef}</td>
                <td>${r.qTarget.toFixed(2)}</td>
                <td>${r.nozzleLabel}</td>
                <td>${r.qReal.toFixed(2)}</td>
                <td>${(r.relError * 100).toFixed(1)}%</td>
              </tr>`
              )
              .join("")}
          </table>
        </div>

        <div class="footer-note">
          Un bon réglage du pulvérisateur est essentiel pour l’efficacité et la sécurité.
        </div>

      </body>
    </html>
  `;
}
