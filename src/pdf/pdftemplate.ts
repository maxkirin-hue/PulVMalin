import { state as appstate } from "../state/state";
import { detectRangs } from "src/core/optimizer";
import { formatVitiModel } from "src/ui/forms";

type PdfState = typeof appstate;

/* =========================================================
   CONFIG
========================================================= */

const familyTargetPressures: Record<string, number> = {
  CP4916: 3,
  AMT: 2.5,
  ATR80: 5,
  IDK90: 5,
  TXR: 5,
  XR: 3,
};

const isoColors: Record<string, string> = {
  "0067": "#cccccc",
  "01": "#f39c12",
  "015": "#3498db",
  "02": "#e74c3c",
  "03": "#f1c40f",
  "04": "#2ecc71",
  "05": "#9b59b6",
  "06": "#1abc9c",
  "08": "#34495e",
  "10": "#000000",
};

function getIsoColor(nozzleLabel?: string): string {
  if (!nozzleLabel) return "#ecf0f1";
  const match = nozzleLabel.match(/(\d{2,4})$/);
  return match ? isoColors[match[1]] || "#ecf0f1" : "#ecf0f1";
}

/* =========================================================
   STYLES
========================================================= */

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
  .pressure-ideal { text-align: center; font-size: 10px; color: #555; }
  .footer-note { font-size: 9px; color: #7f8c8d; margin-top: 10px; }
`;

/* =========================================================
   HEADER
========================================================= */

function renderHeader(state: PdfState): string {
  const today = new Date().toLocaleDateString("fr-FR");

  const model =
    state.machineType === "viti"
      ? formatVitiModel(state.modelKey)
      : state.machineName;

  return `
    <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
      <div>
        <h1>PulvMalin – Fiche de réglage</h1>
        <div class="subtitle">Diagnostic et réglage optimisé de votre pulvérisateur</div>
      </div>
      <div style="text-align:right; font-size:11px;">
        <div><strong>Date :</strong> ${today}</div>
        <div><strong>Nom :</strong> ${state.userName}</div>
        <div><strong>Machine :</strong> ${state.machineType}</div>
        <div><strong>Modèle :</strong> ${model}</div>
        <div><strong>Famille :</strong> ${state.familyKey}</div>
      </div>
    </div>
  `;
}

/* =========================================================
   SYNTHÈSE
========================================================= */

function renderSummary(state: PdfState): string {
  const rangs = detectRangs();
  const nbBuses = state.results.length;

  const model =
    state.machineType === "viti"
      ? formatVitiModel(state.modelKey)
      : state.machineName;

  return `
    <div class="section">
      <div class="section-title">Synthèse</div>
      <table>
        <tr><td>Type de machine</td><td>${state.machineType}</td></tr>
        <tr><td>Modèle</td><td>${model}</td></tr>
        <tr><td>Famille de buses</td><td>${state.familyKey}</td></tr>
        <tr><td>Nombre de rangs</td><td>${rangs}</td></tr>
        <tr><td>Nombre total de buses</td><td>${nbBuses}</td></tr>
      </table>
    </div>
  `;
}

/* =========================================================
   PARAMÈTRES DE TRAVAIL
========================================================= */

function renderSettings(state: PdfState): string {
  return `
    <div class="section">
      <div class="section-title">Paramètres de travail</div>
      <table>
        <tr><td>Largeur / interligne</td><td>${state.interligne} m</td></tr>
        <tr><td>Dose</td><td>${state.dose} L/ha</td></tr>
        <tr><td>Vitesse</td><td>${state.speed} km/h</td></tr>
        <tr><td>Débit total</td><td>${state.qTotal.toFixed(2)} L/min</td></tr>
      </table>
    </div>
  `;
}

/* =========================================================
   PRESSION
========================================================= */

function renderPressure(state: PdfState): string {
  const ideal = familyTargetPressures[state.familyKey!] ?? state.recommendedPressure;
  return `
    <div class="section">
      <div class="section-title">Pression recommandée</div>
      <div class="pressure-value">${state.recommendedPressure.toFixed(2)} bar</div>
      <div class="pressure-ideal">(Idéal famille : ${ideal} bar)</div>
    </div>
  `;
}

/* =========================================================
   TABLEAU DES SORTIES
========================================================= */

function renderTable(state: PdfState): string {
  return `
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
            <td>
              <span style="background:${getIsoColor(r.nozzleLabel)}; padding:3px 6px; border-radius:4px;">
                ${r.nozzleLabel}
              </span>
            </td>
            <td>${r.qReal.toFixed(2)}</td>
            <td>${(r.relError * 100).toFixed(1)}%</td>
          </tr>
        `
          )
          .join("")}
      </table>
    </div>
  `;
}

/* =========================================================
   FOOTER
========================================================= */

function renderFooter(): string {
  return `
    <div class="footer-note">
      Un bon réglage du pulvérisateur est essentiel pour l’efficacité et la sécurité.
    </div>
  `;
}

/* =========================================================
   EXPORT FINAL
========================================================= */

export function generatePdfHtml(state: PdfState): string {
  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>${pdfStyles}</style>
      </head>
      <body>
        ${renderHeader(state)}
        ${renderSummary(state)}
        ${renderSettings(state)}
        ${renderPressure(state)}
        ${renderTable(state)}
        ${renderFooter()}
      </body>
    </html>
  `;
}