import { initMachineButtons } from "./ui/machine";
import { initNavigation } from "./ui/navigation";
import "./ui/forms";
import { setupInstallButton, showIosInstallBanner } from "./pwa/install";

setupInstallButton();
showIosInstallBanner();
initNavigation();
initMachineButtons();
