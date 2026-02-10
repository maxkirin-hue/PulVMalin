import { loadPdfImages } from "./image";
import { getSchema, MachineKind } from "./schema";
function isoColor(label: string) {
  if (label.includes("025")) return "#3498db";
  if (label.includes("03")) return "#2ecc71";
  if (label.includes("04")) return "#f1c40f";
  if (label.includes("05")) return "#e67e22";
  if (label.includes("06")) return "#e74c3c";
  return "#7f8c8d";
}


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
     // ---------------------------------------------------------
// CADRE D’INFOS COMPACT (GRILLE)
// ---------------------------------------------------------
{
  table: {
    widths: ["25%", "25%", "25%", "25%"],
    body: [
      [
        { text: "Nom", bold: true }, { text: state.userName || "-" },
        { text: "Machine", bold: true }, { text: state.machineType || "-" }
      ],
      [
        { text: "Modèle", bold: true }, { text: state.modelKey || "-" },
        { text: "Famille", bold: true }, { text: state.familyKey || "-" }
      ],
      [
        { text: "Largeur", bold: true }, { text: `${state.largeur || state.interligne} m` },
        { text: "Dose", bold: true }, { text: `${state.dose} L/ha` }
      ],
      [
        { text: "Vitesse", bold: true }, { text: `${state.vitesse} km/h` },
        { text: "Débit total", bold: true }, { text: `${(state.qTotal ?? 0).toFixed(2)} L/min` }
      ]
    ]
  },
  layout: {
    hLineWidth: () => 0.8,
    vLineWidth: () => 0.8,
    hLineColor: () => "#2ecc71",
    vLineColor: () => "#2ecc71",
    paddingLeft: () => 4,
    paddingRight: () => 4,
    paddingTop: () => 2,
    paddingBottom: () => 2
  },
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
// PRESSION RECOMMANDÉE (CADRE)
// ---------------------------------------------------------
{
  table: {
    widths: ["*"],
    body: [
      [
        {
          text: `Pression recommandée : ${(state.recommendedPressure ?? 0).toFixed(1)} bar`,
          alignment: "center",
          fontSize: 16,
          bold: true,
          color: "#2ecc71",
          margin: [0, 5, 0, 5]
        }
      ]
    ]
  },
  layout: {
    hLineWidth: () => 1,
    vLineWidth: () => 1,
    hLineColor: () => "#2ecc71",
    vLineColor: () => "#2ecc71"
  },
  margin: [0, 0, 0, 20]
},
    // ---------------------------------------------------------
// SCHÉMA MACHINE (CADRE + BUSES + LABELS)
// ---------------------------------------------------------
{
  width: 300,
  height: 200,
  alignment: "center",
  stack: [

<<<<<<< HEAD
      // ---------------------------------------------------------
      // SCHÉMA MACHINE (corrigé)
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
            canvas: buses.map(b => ({
              type: "circle",
              x: b.x,
              y: b.y,
              r: 5,
              color: "#2ecc71"
            })),
            width: 300,
            height: 200,
            alignment: "center"
          }
        ],
        alignment: "center",
        margin: [0, 0, 0, 20]
      },

=======
    // Cadre vert
    {
      canvas: [
        {
          type: "rect",
          x: 0,
          y: 0,
          w: 300,
          h: 200,
          r: 6,
          lineWidth: 1,
          lineColor: "#2ecc71"
        }
      ],
      absolutePosition: { x: 0, y: 0 }
    },

    // Image du schéma
    {
      image: schema.imageKey,
      width: 300,
      absolutePosition: { x: 0, y: 0 }
    },

    // Buses + labels
    ...buses.map((b, i) => ({
      absolutePosition: { x: b.x, y: b.y },
      stack: [
        {
          canvas: [
            {
              type: "circle",
              x: 0,
              y: 0,
              r: 6,
              color: isoColor(state.results[i].nozzleLabel)
            }
          ]
        },
        {
          text: state.results[i].outputName,
          fontSize: 8,
          alignment: b.x < 150 ? "left" : "right",
          margin: b.x < 150 ? [10, -4, 0, 0] : [-40, -4, 0, 0]
        }
      ]
    }))
  ],
  margin: [0, 0, 0, 20]
},
>>>>>>> 861c98a2ec53a364d56e65dc888a9de871df6a02
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
  };
}
