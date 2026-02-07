import { $ } from "../utils/dom";

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

  // Gestion des boutons "Retour" et "Modifier"
  document.querySelectorAll("[data-back]").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = (btn as HTMLElement).dataset.back;
      if (target) showPage(Number(target));
    });
  });
}