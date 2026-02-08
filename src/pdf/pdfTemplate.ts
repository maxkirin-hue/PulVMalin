/* ============================================================
   TEMPLATE PDF — PulvMalin (version optimisée html2pdf)
============================================================ */

import { formatVitiModel, formatFlow, formatPercent, formatDateFR } from "../utils/format";
import { detectRangs } from "../core/optimizer";

export function generatePdfHtml(state: any): string {
  const today = formatDateFR();
  const model = state.machineType === "viti"
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

    <!-- Bandeau -->
    <div style="
      background:#2ecc71;
      color:white;
      padding:15px;
      border-radius:8px;
      margin-bottom:20px;
    ">
      <h1 style="margin:0; font-size:26px;">Fiche de réglage — PulvMalin</h1>
      <div style="font-size:14px;">${today}</div>
    </div>

    <!-- Identité -->
    <p><strong>Nom :</strong> ${state.userName}</p>
    <p><strong>Machine :</strong> ${state.machineType}</p>
    <p><strong>Modèle :</strong> ${model}</p>
    <p><strong>Famille :</strong> ${state.familyKey || "—"}</p>

    <!-- Synthèse -->
    <div style="
      border: 2px solid #2ecc71;
      padding: 10px;
      margin-top: 20px;
      border-radius: 6px;
    ">
      <h3 style="margin-top:0;">Synthèse</h3>
      <table style="width:100%; border-collapse:collapse;">
        <tr><td style="border:1px solid #ccc; padding:6px;">Nombre de rangs</td><td style="border:1px solid #ccc; padding:6px;">${rangs}</td></tr>
        <tr><td style="border:1px solid #ccc; padding:6px;">Nombre de buses</td><td style="border:1px solid #ccc; padding:6px;">${nbBuses}</td></tr>
        <tr><td style="border:1px solid #ccc; padding:6px;">Dose</td><td style="border:1px solid #ccc; padding:6px;">${state.dose} L/ha</td></tr>
        <tr><td style="border:1px solid #ccc; padding:6px;">Largeur / interligne</td><td style="border:1px solid #ccc; padding:6px;">${state.largeur ?? state.interligne} m</td></tr>
        <tr><td style="border:1px solid #ccc; padding:6px;">Vitesse</td><td style="border:1px solid #ccc; padding:6px;">${state.vitesse} km/h</td></tr>
        <tr><td style="border:1px solid #ccc; padding:6px;">Pression recommandée</td><td style="border:1px solid #ccc; padding:6px;">${state.recommendedPressure.toFixed(1)} bar</td></tr>
      </table>
    </div>

    <!-- Tableau -->
    <div style="
      border: 2px solid #2ecc71;
      padding: 10px;
      margin-top: 20px;
      border-radius: 6px;
      page-break-inside: avoid;
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

        ${state.results.map(r => `
          <tr>
            <td style="border:1px solid #ccc; padding:6px;">${r.outputName}</td>
            <td style="border:1px solid #ccc; padding:6px;">${formatFlow(r.qTarget)}</td>
            <td style="border:1px solid #ccc; padding:6px;">${r.nozzleLabel}</td>
            <td style="border:1px solid #ccc; padding:6px;">${formatFlow(r.qReal)}</td>
            <td style="border:1px solid #ccc; padding:6px;">${formatPercent(r.relError)}</td>
          </tr>
        `).join("")}
      </table>
    </div>

  </div>
  `;
}
