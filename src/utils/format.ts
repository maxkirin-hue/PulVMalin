
/* ============================================================
   FORMAT UTILITIES — PulvMalin
   Centralise toutes les petites fonctions de formatage
   pour éviter les doublons et les imports circulaires.
============================================================ */

/**
 * Formate un modèle VITI (3r_sans → "3 rangs – sans retour")
 */
export function formatVitiModel(key: string | null): string {
  if (!key) return "";
  return key
    .replace("3r_", "3 rangs – ")
    .replace("4r_", "4 rangs – ")
    .replace("_sans", "sans retour")
    .replace("_avec", "avec retour");
}

/**
 * Formate une pression (2.345 → "2.3 bar")
 */
export function formatPressure(value: number | null): string {
  if (value == null || isNaN(value)) return "-";
  return `${value.toFixed(1)} bar`;
}

/**
 * Formate un débit (12.345 → "12.35 L/min")
 */
export function formatFlow(value: number | null): string {
  if (value == null || isNaN(value)) return "-";
  return `${value.toFixed(2)} L/min`;
}

/**
 * Formate une date FR propre
 */
export function formatDateFR(date: Date = new Date()): string {
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Formate un pourcentage (0.123 → "12.3 %")
 */
export function formatPercent(value: number | null): string {
  if (value == null || isNaN(value)) return "-";
  return `${(value * 100).toFixed(1)} %`;
}

/**
 * Formate un nom propre (trim + capitalisation)
 */
export function formatName(name: string): string {
  const clean = name.trim();
  if (!clean) return "";
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}