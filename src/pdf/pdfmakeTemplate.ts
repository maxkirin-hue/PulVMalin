import { loadPdfImages } from "./image";
import { getSchema, MachineKind } from "./schema";
import { state } from "../state/state";

export function generatePdfFilename(s: any) {
  const name = (s.machineName || "PulvMalin").replace(/\s+/g, "_");
  const date = new Date().toISOString().slice(0,19).replace(/[:T]/g, "-");
  return `${name}_${date}.pdf`;
}

export async function buildDocDefinition(state: any) {
  const images = await loadPdfImages();
  const schema = getSchema(state.machineType as MachineKind);
  const buses = typeof schema?.getBusPositions === "function" ? schema.getBusPositions((state.results || []).length) : [];
const calcs = state.calculations && state.calculations.length > 1
  ? state.calculations
  : null;

  const rows = (state.results || []).map((r: any) => [
    r.outputName ?? "-",
    r.nozzleLabel ?? "-",
    `${(r.qTarget ?? 0).toFixed(2)} L/min`,
    `${(r.qReal ?? 0).toFixed(2)} L/min`,
    `${((r.relError ?? 0) * 100).toFixed(1)}%`
  ]);

  return {
    pageSize: "A4",
    pageMargins: [20, 20, 20, 20],
    images,
    content: [
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

      {
        table: {
          widths: ["40%", "*"],
          body: [
            ["Nom", state.userName || "-"],
            ["Machine", state.machineType || "-"],
            ["Modèle", state.modelKey || "-"],
            ["Famille", state.familyKey || "-"],
            ["Largeur / interligne", `${state.interligne ?? state.largeur ?? "-"} m`],
            ["Dose", `${state.dose ?? "-"} L/ha`],
            ["Vitesse", `${state.speed ?? state.vitesse ?? "-"} km/h`],
            ["Débit total calculé", `${(state.qTotal ?? 0).toFixed(2)} L/min`]
          ]
        },
        layout: "lightHorizontalLines",
        margin: [0, 0, 0, 15]
      },

      { text: "Comparatif des réglages", style: "section" },

{
  table: {
    widths: [
      "*",
      ...((calcs ?? [state]).map(() => "auto"))
    ],
    body: [
      [
        { text: "Sortie", style: "tableHeader" },
        ...(calcs
          ? calcs.map(c => ({
              text: `${c.label}\n${c.pressure.toFixed(1)} bar`,
              style: "tableHeader",
              alignment: "center"
            }))
          : [{
              text: `${state.recommendedPressure.toFixed(1)} bar`,
              style: "tableHeader"
            }]
        )
      ],

      ...(calcs
        ? calcs[0].results.map((r, i) => [
            r.outputName,
            ...calcs.map(c =>
              `${c.results[i].qReal.toFixed(2)} L/min`
            )
          ])
        : rows
      )
    ]
  },
  layout: "lightHorizontalLines",
  margin: [0, 0, 0, 15]
},




      {
        text: `Pression de travail recommandée : ${(state.recommendedPressure ?? 0).toFixed(1)} bar`,
        alignment: "center",
        fontSize: 18,
        bold: true,
        color: "#2ecc71",
        margin: [0, 0, 0, 20]
      },

      { text: "Schéma machine", style: "section" },

      {
        stack: [
          {
            image: schema?.imageKey ?? "",
            width: 300,
            alignment: "center",
            margin: [0, 0, 0, 10]
          },
          {
            canvas: (state.results || []).flatMap((r: any, i: number) => {
              const name = r.outputName || "";
              const isLeft = name.includes("G");
              const isRight = name.includes("D");
              const isCanon = name.toLowerCase().includes("canon");
              const isRetour = name.toLowerCase().includes("retour");
              const isMain = name.toLowerCase().includes("main") && !isRetour;
              const centerX = 150;
              const centerY = 100;
              const x = isLeft ? centerX - 80 : centerX + 80;
              let y = centerY;
              if (isCanon) y = centerY - 60;
              else if (isRetour) y = centerY - 20;
              else if (isMain) y = centerY + 20;
              return [
                { type: "circle", x, y, r: 5, color: "#2ecc71" },
                { type: "text", text: name, x: x + (isLeft ? -40 : 10), y: y - 3, fontSize: 9, color: "#333" }
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
