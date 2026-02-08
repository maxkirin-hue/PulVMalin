/* ============================================================
   SW UPDATER — PulvMalin
   Détection et mise à jour propre du Service Worker
============================================================ */

export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker.register("/service-worker.js").then(reg => {
    // Nouveau SW trouvé
    reg.onupdatefound = () => {
      const newWorker = reg.installing;
      if (!newWorker) return;

      newWorker.onstatechange = () => {
        // Le SW est prêt à remplacer l'ancien
        if (newWorker.state === "installed") {
          if (navigator.serviceWorker.controller) {
            // Une mise à jour est disponible
            showUpdateBanner(reg);
          }
        }
      };
    };
  });
}

/* ------------------------------------------------------------
   Affiche une bannière "Nouvelle version disponible"
------------------------------------------------------------ */
function showUpdateBanner(reg: ServiceWorkerRegistration) {
  const banner = document.getElementById("updateBanner");
  if (!banner) return;

  banner.style.display = "block";

  const btn = document.getElementById("btnUpdateNow");
  if (!btn) return;

  btn.addEventListener("click", () => {
    if (!reg.waiting) return;

    // Demande au SW d'activer immédiatement
    reg.waiting.postMessage({ type: "SKIP_WAITING" });

    // Recharge l'app proprement
    window.location.reload();
  });
}