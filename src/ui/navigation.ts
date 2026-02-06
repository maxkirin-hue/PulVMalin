import { $ } from "../utils/dom";

export function showPage(n: number): void {
  document.querySelectorAll<HTMLElement>(".page").forEach(p => {
    p.style.display = "none";
  });

  const target = $(`#page${n}`);
  if (target) target.style.display = "block";
}

export function initNavigation(): void {
  showPage(1);
}
