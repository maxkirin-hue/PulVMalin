// src/main.ts
import { loadState, enableAutoSave } from "./state/statePersistence";
import { bindFormFields } from "./ui/bindFormFields";
import { initMachineButtons } from "./ui/machine";
import {
  populateFamilySelect,
  updateFamilyOptions,
  updateModelOptions,
  hideAllMachineBlocks
} from "./ui/forms";
import { showPage } from "./ui/navigation";
import { setupInstallButton, showIosInstallBanner } from "./pwa/install";
import { fillSummary } from "./ui/summary";

/**
 * Initialize the application once the DOM is ready.
 * Order:
 * 1. restore persisted state
 * 2. bind DOM fields to state
 * 3. prepare UI selects and blocks
 * 4. init machine controls
 * 5. PWA helpers
 * 6. show first page and enable autosave
 */
function initApp() {
  try {
    // 1) Restore persisted state
    loadState();

    // 2) Bind form fields to state (reads current state to initialize inputs)
    bindFormFields();

    // 3) Prepare UI selects / blocks
    hideAllMachineBlocks();
    populateFamilySelect();
    updateFamilyOptions();
    updateModelOptions();

    // 4) Initialize machine buttons / selectors
    initMachineButtons();

    // 5) PWA helpers (safe to call even if module is a no-op)
    setupInstallButton();
    showIosInstallBanner();

    // 6) Show page 1 by default and refresh summary if any state restored
    showPage(1);
    fillSummary();

    // 7) Enable automatic saving after initialization
    enableAutoSave();

    // lightweight debug
    // eslint-disable-next-line no-console
    console.info("PulvMalin initialized");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Initialization error:", err);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
