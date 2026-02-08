import { $ } from "../utils/dom";
import { updateResults } from "./updateResults";

export function showPage(n: number): void {
  document.querySelectorAll<HTMLElement>(".page").forEach(p => {
    p.style.display = "none";
  });

  const target = $(`#page${n}`);
  if (target) target.style.display = "block";
}

export function initNavigation(): void {
  // Page d’accueil
  showPage(1);

  // Boutons "Retour" et "Modifier"
  document.querySelectorAll("[data-back]").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = (btn as HTMLElement).dataset.back;
      if (target) showPage(Number(target));
    });
  });

  // Bouton "Continuer" page 1 → page 2
  document.getElementById("toPage2")?.addEventListener("click", () => {
    showPage(2);
  });

  // Bouton "Continuer" page 2 → page 3
  document.getElementById("toPage3")?.addEventListener("click", () => {
    showPage(3);
  });

  // Bouton "Calculer" page 3 → page 4
  document.getElementById("toPage4")?.addEventListener("click", () => {
    updateResults();   // 👈 ENFIN !
    showPage(4);
  });
}