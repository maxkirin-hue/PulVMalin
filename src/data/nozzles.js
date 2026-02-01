/* =========================================================
   PULV MALIN — Base de données buses / pastilles
   - Organisation par famille
   - Pression de référence par famille
   - Plages optimales et limites
   - Compatibilité par type de machine
========================================================= */

export const nozzleFamilies = {

  /* =====================================================
     XR — Désherbage (rampe uniquement)
  ===================================================== */
  XR: {
    label: "XR TeeJet – Jet plat désherbage",
    machines: ["rampe"], // CORRIGÉ : "desherbage" → "rampe"
    refPressure: 3,
    optimalRange: [2, 4],
    limitRange: [1.5, 6],
    nozzles: [
      { code: "XR110-01", color: "orange", qRef: 0.39 },
      { code: "XR110-015", color: "vert", qRef: 0.59 },
      { code: "XR110-02", color: "jaune", qRef: 0.79 },
      { code: "XR110-025", color: "violet", qRef: 0.99 },
      { code: "XR110-03", color: "bleu", qRef: 1.19 },
      { code: "XR110-04", color: "rouge", qRef: 1.58 },
      { code: "XR110-05", color: "marron", qRef: 1.97 },
      { code: "XR110-06", color: "gris", qRef: 2.37 },
      { code: "XR110-08", color: "blanc", qRef: 3.16 }
    ]
  },

  /* =====================================================
     CP4916 — TeeJet (vigne classique)
  ===================================================== */
  CP4916: {
    label: "CP4916 TeeJet – Pastille vigne",
    machines: ["viti"], // CORRIGÉ : "vigne" → "viti"
    refPressure: 3,
    optimalRange: [2, 5],
    limitRange: [1.5, 6],
    nozzles: [
     { code: "CP4916-20", qRef: 0.21 },
  { code: "CP4916-22", qRef: 0.24 },
  { code: "CP4916-24", qRef: 0.29 },
  { code: "CP4916-25", qRef: 0.31 },
  { code: "CP4916-26", qRef: 0.34 },
  { code: "CP4916-27", qRef: 0.36 },
  { code: "CP4916-28", qRef: 0.39 },
  { code: "CP4916-29", qRef: 0.43 },
  { code: "CP4916-30", qRef: 0.45 },
  { code: "CP4916-31", qRef: 0.49 },
  { code: "CP4916-32", qRef: 0.53 },
  { code: "CP4916-34", qRef: 0.58 },
  { code: "CP4916-35", qRef: 0.62 },
  { code: "CP4916-37", qRef: 0.68 },
  { code: "CP4916-39", qRef: 0.75 },
  { code: "CP4916-40", qRef: 0.81 },
  { code: "CP4916-41", qRef: 0.83 },
  { code: "CP4916-43", qRef: 0.91 },
  { code: "CP4916-45", qRef: 0.99 },
  { code: "CP4916-46", qRef: 1.07 },
  { code: "CP4916-47", qRef: 1.09 },
  { code: "CP4916-48", qRef: 1.13 },
  { code: "CP4916-49", qRef: 1.16 },
  { code: "CP4916-51", qRef: 1.30 },
  { code: "CP4916-52", qRef: 1.32 },
  { code: "CP4916-54", qRef: 1.42 },
  { code: "CP4916-55", qRef: 1.49 },
  { code: "CP4916-57", qRef: 1.58 },
  { code: "CP4916-59", qRef: 1.71 },
  { code: "CP4916-61", qRef: 1.84 },
  { code: "CP4916-63", qRef: 1.94 },
  { code: "CP4916-65", qRef: 2.06 },
  { code: "CP4916-67", qRef: 2.19 },
  { code: "CP4916-68", qRef: 2.26 },
  { code: "CP4916-70", qRef: 2.42 }
    ]
  },

  /* =====================================================
     AMT — Céramique double face (vigne)
  ===================================================== */
  AMT: {
    label: "AMT ALBUZ – Céramique double face",
    machines: ["viti"], // CORRIGÉ : "vigne" → "viti"
    refPressure: 10,
    optimalRange: [5, 20],
    limitRange: [2, 50],
    nozzles: [
      { code: "AMT-007", faces: [{ side: "plate", label: "plate", qRef: 0.91 }, { side: "creuse", label: "creuse", qRef: 0.65 }] },
      { code: "AMT-010", faces: [{ side: "plate", label: "plate", qRef: 1.89 }, { side: "creuse", label: "creuse", qRef: 1.42 }] },
      { code: "AMT-012", faces: [{ side: "plate", label: "plate", qRef: 2.51 }, { side: "creuse", label: "creuse", qRef: 2.07 }] },
      { code: "AMT-015", faces: [{ side: "plate", label: "plate", qRef: 3.99 }, { side: "creuse", label: "creuse", qRef: 3.15 }] },
      { code: "AMT-018", faces: [{ side: "plate", label: "plate", qRef: 5.70 }, { side: "creuse", label: "creuse", qRef: 4.43 }] },
      { code: "AMT-020", faces: [{ side: "plate", label: "plate", qRef: 6.85 }, { side: "creuse", label: "creuse", qRef: 5.58 }] },
      { code: "AMT-023", faces: [{ side: "plate", label: "plate", qRef: 9.17 }, { side: "creuse", label: "creuse", qRef: 7.12 }] }
    ]
  },

  /* =====================================================
     TXR — Cône creux haute pression (vigne + arbo)
  ===================================================== */
  TXR: {
    label: "TXR ConeJet – Cône creux",
    machines: ["viti", "arbo"], // CORRIGÉ : "vigne", "aero" → "viti", "arbo"
    refPressure: 10,
    optimalRange: [6, 15],
    limitRange: [2, 25],
    nozzles: [
      { code: "TXR800053", color: "violet", qRef: 0.367 },
      { code: "TXR800071", color: "bleu", qRef: 0.497 },
      { code: "TXR8001", color: "vert", qRef: 0.701 },
      { code: "TXR80013", color: "jaune", qRef: 0.934 },
      { code: "TXR80015", color: "orange", qRef: 1.051 },
      { code: "TXR80017", color: "rouge", qRef: 1.168 },
      { code: "TXR8002", color: "gris", qRef: 1.401 },
      { code: "TXR80028", color: "noir", qRef: 1.926 },
      { code: "TXR8003", color: "bleu foncé", qRef: 2.151 },
      { code: "TXR80036", color: "violet foncé", qRef: 2.552 },
      { code: "TXR8004", color: "marron", qRef: 2.868 },
      { code: "TXR80049", color: "blanc", qRef: 3.500 }
    ]
  },

  /* =====================================================
     IDK 90 — Injection d'air (arbo)
  ===================================================== */
  IDK90: {
    label: "IDK 90 – Injection d'air",
    machines: ["arbo"], // CORRIGÉ : "aero" → "arbo"
    refPressure: 10,
    optimalRange: [6, 14],
    limitRange: [2, 20],
    nozzles: [
      { code: "IDK90-0067", color: "vert clair", qRef: 0.49 },
      { code: "IDK90-01", color: "vert", qRef: 0.72 },
      { code: "IDK90-015", color: "jaune", qRef: 1.07 },
      { code: "IDK90-02", color: "orange", qRef: 1.45 },
      { code: "IDK90-025", color: "rouge", qRef: 1.81 },
      { code: "IDK90-03", color: "bleu", qRef: 2.17 }
    ]
  },

  /* =====================================================
     ATR 80 — Cône creux céramique (arbo)
  ===================================================== */
  ATR80: {
    label: "ATR 80 ALBUZ – Cône creux céramique",
    machines: ["arbo"], // CORRIGÉ : "aero" → "arbo"
    refPressure: 10,
    optimalRange: [7, 15],
    limitRange: [5, 20],
    angle: 80,
    nozzles: [
      { code: "ATR80-JAUNE",  color: "jaune", qRef: 1.03 },
      { code: "ATR80-ORANGE", color: "orange", qRef: 1.39 },
      { code: "ATR80-ROUGE",  color: "rouge", qRef: 1.92 },
      { code: "ATR80-VERT",   color: "vert", qRef: 2.47 },
      { code: "ATR80-BLEU",   color: "bleu", qRef: 3.40 }
    ]
  }

};
