import { vitiSchema, arboSchema, tangentielSchema, rampeSchema } from "./schema"; 
// adapte le chemin selon ton projet

export function schemaFor(state: any): string {
  switch (state.machineType) {
    case "viti": return vitiSchema();
    case "arbo": return arboSchema();
    case "tangentiel": return tangentielSchema();
    case "rampe": return rampeSchema();
    default: return "";
  }
}
export function extractBase64(imgTag: string): string | null {
  const match = imgTag.match(/src="data:image\/svg\+xml;base64,([^"]+)"/);
  return match ? match[1] : null;
}
export function buildDocDefinition(state) {

  // Récupération du schéma en base64
  const schemaImgTag = schemaFor(state); // vitiSchema(), arboSchema(), etc.
  const schemaBase64 = extractBase64(schemaImgTag);

  return {
    pageSize: "A4",
    pageMargins: [20, 20, 20, 20],

    content: [

      // HEADER
      {
        columns: [
          [
            { text: "PulvMalin", style: "header" },
            { text: "Fiche de réglage de votre pulvérisateur", style: "subheader" }
          ],
          {
            text: new Date().toLocaleDateString("fr-FR"),
            alignment: "right",
            style: "date"
          }
        ],
        margin: [0, 0, 0, 10]
      },

      // PARAMÈTRES
      { text: "Paramètres de travail", style: "section" },

      {
        table: {
          widths: ["40%", "*"],
          body: [
            ["Nom", state.userName || "-"],
            ["Machine", state.machineType || "-"],
            ["Modèle", state.modelKey || "-"],
            ["Famille", state.familyKey || "-"],
            ["Largeur / interligne", `${state.largeur || state.interligne} m`],
            ["Dose", `${state.dose} L/ha`],
            ["Vitesse", `${state.vitesse} km/h`],
            ["Débit total calculé", `${(state.qTotal ?? 0).toFixed(2)} L/min`]
          ]
        },
        layout: "lightHorizontalLines",
        margin: [0, 0, 0, 10]
      },

      // SORTIES
      { text: "Détail par sortie", style: "section" },

      {
        table: {
          widths: ["*", "*", "*", "*", "*"],
          body: [
            [
              { text: "Sortie", style: "tableHeader" },
              { text: "Pastille", style: "tableHeader" },
              { text: "Débit cible", style: "tableHeader" },
              { text: "Débit réel", style: "tableHeader" },
              { text: "Écart", style: "tableHeader" }
            ],
            ...state.results.map(r => [
              r.outputName,
              r.nozzleLabel,
              `${r.qTarget.toFixed(2)} L/min`,
              `${r.qReal.toFixed(2)} L/min`,
              `${(r.relError * 100).toFixed(1)}%`
            ])
          ]
        },
        layout: "lightHorizontalLines",
        margin: [0, 0, 0, 10]
      },

      // PRESSION
      { text: "Pression de travail recommandée", style: "section" },

      {
        stack: [
          { text: `${(state.recommendedPressure ?? 0).toFixed(1)} bar`, style: "pressure" },
          { text: `(Pression idéale famille : ${state.familyPressure ?? "?"} bar)` }
        ],
        margin: [0, 0, 0, 10]
      },

      // SCHÉMA
      { text: "Schéma machine", style: "section" },

      schemaBase64
        ? { image: `data:image/svg+xml;base64,${schemaBase64}`, width: 300, alignment: "center" }
        : { text: "Aucun schéma disponible" }
    ],

    styles: {
      header: { fontSize: 22, bold: true, color: "#2ecc71" },
      subheader: { fontSize: 12, margin: [0, 2, 0, 0] },
      date: { fontSize: 10, color: "#555" },
      section: { fontSize: 14, bold: true, color: "#2ecc71", margin: [0, 10, 0, 5] },
      tableHeader: { bold: true, fillColor: "#f0f0f0" },
      pressure: { fontSize: 16, bold: true, color: "#2ecc71" }
    }
  };
}
