import { initMachineButtons } from "./ui/machine";
import { initNavigation } from "./ui/navigation";
import "./ui/forms";
import { setupInstallButton, showIosInstallBanner } from "./pwa/install";
import { loadState, enableAutoSave } from "./state/statePersistence";

loadState();      // restaure les données au démarrage
enableAutoSave(); // surveille et sauvegarde automatiquement
setupInstallButton();
showIosInstallBanner();
initNavigation();
initMachineButtons();
