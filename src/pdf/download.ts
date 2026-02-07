import { generatePdfHtml } from "./pdfTemplate.ts";
import { state } from "../state/state";

declare const html2pdf: any;

export function downloadPdf() {
  const html = generatePdfHtml(state);

  const element = document.createElement("div");
  element.innerHTML = html;

  html2pdf()
    .from(element)
    .set({
      margin: 10,
      filename: "pulvmalin.pdf",
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    })
    .save();
}