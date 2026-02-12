// src/ui/navigation.ts

/**
 * showPage(n)
 * - retire les classes d'affichage des autres pages
 * - ajoute la classe d'affichage sur la page demandée
 * - gère à la fois .active (CSS moderne) et .hidden (fallback)
 * - renvoie true si la page a été trouvée et affichée, false sinon
 */
export function showPage(n: number): boolean {
  const pages = document.querySelectorAll<HTMLElement>(".page");
  pages.forEach(p => {
    p.classList.remove("active");
    p.classList.add("hidden");
  });

  const target = document.getElementById(`page${n}`);
  if (!target) {
    console.warn(`showPage: page${n} introuvable`);
    return false;
  }

  target.classList.remove("hidden");
  target.classList.add("active");

  // Optionnel : focus sur le premier champ pour accessibilité
  const firstInput = target.querySelector<HTMLElement>("input, select, button, textarea");
  if (firstInput) firstInput.focus();

  return true;
}

/**
 * goBack() : si tu veux un bouton "Retour" simple qui navigue vers la page précédente
 * (implémentation minimale, tu peux remplacer par un historique plus sophistiqué)
 */
export function goBack(defaultPage = 1) {
  // recherche la page active actuelle
  const current = document.querySelector<HTMLElement>(".page.active");
  if (!current) {
    showPage(defaultPage);
    return;
  }

  const id = current.id || "";
  const match = id.match(/page(\d+)/);
  if (!match) {
    showPage(defaultPage);
    return;
  }

  const curNum = parseInt(match[1], 10);
  const prev = Math.max(1, curNum - 1);
  showPage(prev);
}

// Expose pour debug dans la console (facultatif)
if (typeof window !== "undefined") {
  (window as any).showPage = showPage;
  (window as any).goBack = goBack;
}
