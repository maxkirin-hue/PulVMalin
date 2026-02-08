/* ============================================================
   INSTALLATION PWA — PulvMalin
   - Android / Desktop : beforeinstallprompt
   - iOS Safari : bannière manuelle
============================================================ */

let deferredPrompt: any = null;

/* ------------------------------------------------------------
   1) Détection iOS + Safari
------------------------------------------------------------ */
function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isInStandaloneMode(): boolean {
  return ("standalone" in window.navigator) && (window.navigator as any).standalone;
}

/* ------------------------------------------------------------
   2) Affichage bannière iOS
------------------------------------------------------------ */
export function showIosInstallBanner() {
  if (!isIos() || isInStandaloneMode()) return;

  const banner = document.getElementById("iosInstallBanner");
  if (banner) banner.style.display = "block";
}

/* ------------------------------------------------------------
   3) Gestion Android / Desktop (beforeinstallprompt)
------------------------------------------------------------ */
export function setupInstallButton() {
  const btn = document.getElementById("btnInstall");
  if (!btn) return;

  // Android / Desktop
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    btn.style.display = "block";
  });

  btn.addEventListener("click", async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;

    deferredPrompt = null;
    btn.style.display = "none";
  });
}
