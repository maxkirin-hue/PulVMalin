export function showPage(n: number) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  document.getElementById(`page${n}`)?.classList.remove("hidden");
}
