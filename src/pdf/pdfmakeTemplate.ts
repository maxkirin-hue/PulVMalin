import { loadPdfImages } from "./image";
import { getSchema, MachineKind } from "./schema";

export async function buildDocDefinition(state) {

  const images = await loadPdfImages();
  const schema = getSchema(state.machineType as MachineKind);
  const buses = schema.getBusPositions(state.results.length);

  return {
    pageSize: "A4",
    pageMargins: [20, 20, 20, 20],

    images,

    content: [

      // ---------------------------------------------------------
      // BANDEAU VERT
      // ---------------------------------------------------------
      {
        table: {
          widths: ["*", "auto", "auto"],
          body: [[
            { text: "PULVMALIN", color: "white", fontSize: 22, bold: true },
            { text: new Date().toLocaleDateString("fr-FR"), color: "white", alignment: "right" },
            { qr: "https://www.pulvmalin.fr", fit: 60 }
          ]]
        },
        layout: "noBorders",
        fillColor: "#2ecc71",
        margin: [0, 0, 0, 15]
      },

      // ---------------------------------------------------------
      // CADRE D’INFOS
      // ---------------------------------------------------------
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
        margin: [0, 0, 0, 15]
      },

      // ---------------------------------------------------------
      // TABLEAU DES SORTIES
      // ---------------------------------------------------------
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
        margin: [0, 0, 0, 15]
      },

      // ---------------------------------------------------------
      // PRESSION RECOMMANDÉE
      // ---------------------------------------------------------
      {
        text: `Pression de travail recommandée : ${(state.recommendedPressure ?? 0).toFixed(1)} bar`,
        alignment: "center",
        fontSize: 18,
        bold: true,
        color: "#2ecc71",
        margin: [0, 0, 0, 20]
      },

// ---------------------------------------------------------
// SCHÉMA MACHINE — VERSION UNIVERSELLE
// ---------------------------------------------------------
{ text: "Schéma machine", style: "section" },

{
  stack: [
    {
      image: schema.imageKey,
      width: 300,
      alignment: "center",
      margin: [0, 0, 0, 10]
    },

    {
      canvas: state.results.flatMap((r, i) => {
        const name = r.outputName;

        // Détection du côté
        const isLeft = name.includes("G");
        const isRight = name.includes("D");

        // Détection du type
        const isCanon = name.toLowerCase().includes("canon");
        const isRetour = name.toLowerCase().includes("retour");
        const isMain = name.toLowerCase().includes("main") && !isRetour;

        // Position de base (centre du schéma)
        const centerX = 150;
        const centerY = 100;

        // Décalages horizontaux
        const x = isLeft ? centerX - 80 : centerX + 80;

        // Décalages verticaux
        let y = centerY;

        if (isCanon) y = centerY - 60;
        else if (isRetour) y = centerY - 20;
        else if (isMain) y = centerY + 20;

        return [
          // Cercle
          {
            type: "circle",
            x,
            y,
            r: 5,
            color: "#2ecc71"
          },

          // Label
          {
            type: "text",
            text: name,
            x: x + (isLeft ? -40 : 10),
            y: y - 3,
            fontSize: 9,
            color: "#333"
          }
        ];
      }),
      width: 300,
      height: 200,
      alignment: "center"
    }
  ],
  alignment: "center",
  margin: [0, 0, 0, 20]
},

      // ---------------------------------------------------------
      // PIED DE PAGE
      // ---------------------------------------------------------
      {
        text: "Les réglages fournis sont indicatifs et ne dispensent pas d’un essai en conditions réelles.",
        alignment: "center",
        fontSize: 9,
        color: "#555",
        margin: [0, 30, 0, 0]
      }
    ],

    styles: {
      section: { fontSize: 14, bold: true, color: "#2ecc71", margin: [0, 10, 0, 5] },
      tableHeader: { bold: true, fillColor: "#f0f0f0" }
    }
  }
}
