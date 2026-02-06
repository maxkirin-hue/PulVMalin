import { initMachineButtons } from "./ui/machine";
import { initNav, showPage } from "./ui/navigation";

window.addEventListener("DOMContentLoaded", () => {
  initMachineButtons();
  initNav();
  showPage(1);
});
