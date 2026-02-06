import { state } from "../state/state";
import { generatePdfHtml } from "./pdftemplate";



export async function downloadPdf() {
  if (!state.results.length) {
    alert("Aucun résultat à exporter.");
    return;
  }

  const loader = document.getElementById("pdfLoader") as HTMLElement;
  const btnPdf = document.getElementById("btnPdf") as HTMLButtonElement;

  try {
    loader.style.display = "block";
    btnPdf.disabled = true;

    const html = generatePdfHtml(state);

    const resp = await fetch(
      "https://pulvmalinpdf-backend.onrender.com/pdf",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html }),
      }
    );

    if (!resp.ok) {
      alert("Erreur lors de la génération du PDF.");
      return;
    }

    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "pulvmalin_reglage.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  } catch (e) {
    alert("Impossible de contacter le service PDF.");
    console.error(e);
  } finally {
    loader.style.display = "none";
    btnPdf.disabled = false;
  }
}
export const state = {
  // Page 1
  machineType: null as string | null,
  machineName: "",

  // Page 2
  dose: 0,
  interligne: 0,
  speed: 0,
  familyKey: null as string | null,

  // Modèle de répartition (viti/arbo)
  modelKey: null as string | null,

  // Largeur / vitesse (rampe)
  largeur: 0,
  vitesse: 0,

  // Résultats du calcul
  results: [] as any[],

  // Débit total machine
  qTotal: 0,

  // Pression recommandée
  recommendedPressure: 0,
};
