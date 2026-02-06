/* =========================================================
   NAVIGATION ENTRE PAGES
========================================================= */

export function showPage(n: number): void {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelector(`#page${n}`)?.classList.add("active");
}

/* =========================================================
   INITIALISATION NAVIGATION
========================================================= */

export function initNav(): void {
  document.querySelectorAll<HTMLButtonElement>("button[data-back]").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = Number(btn.dataset.back);
      showPage(target);
    });
  });
}
