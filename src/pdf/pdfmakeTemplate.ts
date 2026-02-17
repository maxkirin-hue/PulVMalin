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

  const calcs = state.calculations && state.calculations.length
    ? state.calculations
    : [];

  return {
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [20, 20, 20, 20],

    images,

    content: [

      /* =========================
         HEADER
      ========================= */
      {
        table: {
          widths: ["*", "auto", "auto"],
          body: [[
            { text: "PULVMALIN", color: "white", fontSize: 20, bold: true },
            { text: new Date().toLocaleDateString("fr-FR"), color: "white", alignment: "right" },
            { qr: "https://www.pulvmalin.fr", fit: 55 }
          ]]
        },
        layout: "noBorders",
        fillColor: "#2ecc71",
        margin: [0, 0, 0, 10]
      },

      /* =========================
         INFOS MACHINE (resserrées)
      ========================= */
      {
        table: {
          widths: ["32%", "*"],
          body: [
            ["Nom", state.userName || "-"],
            ["Machine", state.machineType || "-"],
            ["Modèle", state.modelKey || "-"],
            ["Famille", state.familyKey || "-"],
            ["Interligne", `${state.interligne ?? "-"} m`],
            ["Dose", `${state.dose ?? "-"} L/ha`],
            ["Vitesse", `${state.speed ?? "-"} km/h`],
            ["Débit total", `${(state.qTotal ?? 0).toFixed(2)} L/min`]
          ]
        },
        layout: "lightHorizontalLines",
        margin: [0, 0, 0, 10]
      },

      /* =========================
         COMPARATIF DES RÉGLAGES
      ========================= */
      { text: "Comparaison des réglages", style: "section" },

      {
        table: {
          widths: [
            "*",
            "auto",
            ...calcs.map(() => "auto")
          ],
          body: [

            /* En‑tête */
            [
              { text: "Sortie", style: "tableHeader" },
              { text: "Pastille", style: "tableHeader" },
              ...calcs.map(c => ({
                text: `${c.label}\n${c.pressure.toFixed(1)} bar`,
                style: "tableHeader",
                alignment: "center"
              }))
            ],

            /* Lignes */
            ...calcs[0].results.map((r: any, i: number) => [
              r.outputName,
              r.nozzleLabel ?? "-",
              ...calcs.map(c =>
                c.results[i].qReal.toFixed(2)
              )
            ])
          ]
        },
        layout: "lightHorizontalLines",
        margin: [0, 0, 0, 10]
      },

      /* =========================
         SCHÉMA MACHINE
      ========================= */
      { text: "Schéma machine", style: "section" },

      {
        stack: [
          {
            image: schema?.imageKey ?? "",
            width: 360,
            alignment: "center",
            margin: [0, 0, 0, 6]
          },

          {
            canvas: (state.results || []).flatMap((r: any) => {
              const name = r.outputName || "";
              const isLeft = name.includes("G");
              const isCanon = name.toLowerCase().includes("canon");
              const isMain = name.toLowerCase().includes("main");

              const cx = 180;
              const cy = 120;

              const x = isLeft ? cx - 95 : cx + 95;
              let y = cy;
              if (isCanon) y -= 55;
              else if (isMain) y += 35;

              return [
                { type: "circle", x, y, r: 5, color: "#2ecc71" },
                {
                  type: "text",
                  text: name,
                  x: x + (isLeft ? -60 : 12),
                  y: y - 4,
                  fontSize: 9,
                  color: "#333"
                }
              ];
            }),
            width: 360,
            height: 240,
            alignment: "center"
          }
        ],
        margin: [0, 0, 0, 10]
      },

      /* =========================
         DISCLAIMER
      ========================= */
      {
        text: "Les réglages fournis sont indicatifs et ne dispensent pas d’un essai en conditions réelles.",
        alignment: "center",
        fontSize: 9,
        color: "#555",
        margin: [0, 10, 0, 0]
      }
    ],

    styles: {
      section: {
        fontSize: 14,
        bold: true,
        color: "#2ecc71",
        margin: [0, 6, 0, 4]
      },
      tableHeader: {
        bold: true,
        fillColor: "#f0f0f0"
      }
    }
  };
}
