/* ============================================================
   TEMPLATE PDF — PulvMalin
   Génère le HTML complet pour html2pdf()
============================================================ */

import { formatVitiModel, formatPressure, formatFlow, formatPercent, formatDateFR } from "../utils/format";
import { detectRangs } from "../core/optimizer";

export function generatePdfHtml(state: any): string {
  const today = formatDateFR();

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
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 24px;
          color: #222;
        }
        h1 {
          color: #2ecc71;
          margin-bottom: 8px;
        }
        .section {
          border: 2px solid #2ecc71;
          padding: 12px;
          margin-top: 20px;
          border-radius: 6px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th, td {
          border: 1px solid #ccc;
          padding: 6px;
          text-align: center;
        }
        th {
          background: #f0f0f0;
        }
      </style>
    </head>

    <body>

      <h1>Fiche de réglage — PulvMalin</h1>
      <p><strong>Date :</strong> ${today}</p>
      <p><strong>Nom :</strong> ${state.userName}</p>
      <p><strong>Machine :</strong> ${state.machineType}</p>
      <p><strong>Modèle :</strong> ${model}</p>

      <div class="section">
        <h3>Synthèse</h3>
        <table>
          <tr><td>Nombre de rangs</td><td>${rangs}</td></tr>
          <tr><td>Nombre de buses</td><td>${nbBuses}</td></tr>
          <tr><td>Dose</td><td>${state.dose} L/ha</td></tr>
          <tr><td>Interligne</td><td>${state.interligne} m</td></tr>
          <tr><td>Vitesse</td><td>${state.speed} km/h</td></tr>
        </table>
      </div>

      <div class="section">
        <h3>Détail par sortie</h3>
        <table>
          <tr>
            <th>Sortie</th>
            <th>Débit cible</th>
            <th>Pastille</th>
            <th>Débit réel</th>
            <th>Écart</th>
          </tr>

          ${state.results
            .map(
              (r: any) => `
            <tr>
              <td>${r.outputName}</td>
              <td>${formatFlow(r.qTarget)}</td>
              <td>${r.nozzleLabel}</td>
              <td>${formatFlow(r.qReal)}</td>
              <td>${formatPercent(r.relError)}</td>
            </tr>`
            )
            .join("")}
        </table>
      </div>

    </body>
  </html>
  `;
}
/* ============================================================
   TEMPLATE PDF — PulvMalin (version optimisée html2pdf)
============================================================ */

import { formatVitiModel, formatFlow, formatPercent, formatDateFR } from "../utils/format";
import { detectRangs } from "../core/optimizer";

export function generatePdfHtml(state: any): string {
  const today = formatDateFR();

  const model =
    state.machineType === "viti"
      ? formatVitiModel(state.modelKey)
      : state.machineName;

  const rangs = detectRangs();
  const nbBuses = state.results.length;

  return `
  <div style="
    width: 700px;
    font-family: Arial, sans-serif;
    padding: 20px;
    color: #222;
  ">

    <h1 style="color:#2ecc71; margin-bottom:4px;">Fiche de réglage — PulvMalin</h1>
    <p><strong>Date :</strong> ${today}</p>
    <p><strong>Nom :</strong> ${state.userName}</p>
    <p><strong>Machine :</strong> ${state.machineType}</p>
    <p><strong>Modèle :</strong> ${model}</p>

    <div style="
      border: 2px solid #2ecc71;
      padding: 10px;
      margin-top: 20px;
      border-radius: 6px;
    ">
      <h3 style="margin-top:0;">Synthèse</h3>
      <table style="width:100%; border-collapse:collapse;">
        <tr>
          <td style="border:1px solid #ccc; padding:6px;">Nombre de rangs</td>
          <td style="border:1px solid #ccc; padding:6px;">${rangs}</td>
        </tr>
        <tr>
          <td style="border:1px solid #ccc; padding:6px;">Nombre de buses</td>
          <td style="border:1px solid #ccc; padding:6px;">${nbBuses}</td>
        </tr>
        <tr>
          <td style="border:1px solid #ccc; padding:6px;">Dose</td>
          <td style="border:1px solid #ccc; padding:6px;">${state.dose} L/ha</td>
        </tr>
        <tr>
          <td style="border:1px solid #ccc; padding:6px;">Interligne</td>
          <td style="border:1px solid #ccc; padding:6px;">${state.interligne} m</td>
        </tr>
        <tr>
          <td style="border:1px solid #ccc; padding:6px;">Vitesse</td>
          <td style="border:1px solid #ccc; padding:6px;">${state.speed} km/h</td>
        </tr>
      </table>
    </div>

    <div style="
      border: 2px solid #2ecc71;
      padding: 10px;
      margin-top: 20px;
      border-radius: 6px;
    ">
      <h3 style="margin-top:0;">Détail par sortie</h3>
      <table style="width:100%; border-collapse:collapse;">
        <tr style="background:#f0f0f0;">
          <th style="border:1px solid #ccc; padding:6px;">Sortie</th>
          <th style="border:1px solid #ccc; padding:6px;">Débit cible</th>
          <th style="border:1px solid #ccc; padding:6px;">Pastille</th>
          <th style="border:1px solid #ccc; padding:6px;">Débit réel</th>
          <th style="border:1px solid #ccc; padding:6px;">Écart</th>
        </tr>

        ${state.results
          .map(
            (r: any) => `
          <tr>
            <td style="border:1px solid #ccc; padding:6px;">${r.outputName}</td>
            <td style="border:1px solid #ccc; padding:6px;">${formatFlow(r.qTarget)}</td>
            <td style="border:1px solid #ccc; padding:6px;">${r.nozzleLabel}</td>
            <td style="border:1px solid #ccc; padding:6px;">${formatFlow(r.qReal)}</td>
            <td style="border:1px solid #ccc; padding:6px;">${formatPercent(r.relError)}</td>
          </tr>`
          )
          .join("")}
      </table>
    </div>

  </div>
  `;
}
