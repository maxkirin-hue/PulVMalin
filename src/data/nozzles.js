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
  machines: ["desherbage"],
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
  machines: ["vigne"],
  refPressure: 3,
  optimalRange: [2, 5],
  limitRange: [1.5, 6],
  nozzles: [
    { code: "CP4916-10", color: "violet", qRef: 0.048 },
    { code: "CP4916-12", color: "bleu", qRef: 0.075 },
    { code: "CP4916-14", color: "vert", qRef: 0.11 },
    { code: "CP4916-16", color: "orange", qRef: 0.15 },
    { code: "CP4916-18", color: "rouge", qRef: 0.20 },
    { code: "CP4916-20", color: "marron", qRef: 0.21 },
    { code: "CP4916-22", color: "gris", qRef: 0.28 },
    { code: "CP4916-24", color: "noir", qRef: 0.34 },
    { code: "CP4916-26", color: "vert foncé", qRef: 0.39 },
    { code: "CP4916-28", color: "orange foncé", qRef: 0.45 },
    { code: "CP4916-30", color: "rouge foncé", qRef: 0.52 },
    { code: "CP4916-32", color: "bleu clair", qRef: 0.61 },
    { code: "CP4916-34", color: "vert clair", qRef: 0.67 },
    { code: "CP4916-36", color: "jaune clair", qRef: 0.75 },
    { code: "CP4916-38", color: "orange clair", qRef: 0.83 },
    { code: "CP4916-40", color: "gris clair", qRef: 0.94 },
    { code: "CP4916-42", color: "noir clair", qRef: 1.03 },
    { code: "CP4916-45", color: "vert", qRef: 1.30 }
  ]
},
  /* =====================================================
     AMT — Céramique double face (vigne)
  ===================================================== */
AMT: {
  label: "AMT ALBUZ – Céramique double face",
  machines: ["vigne"],
  refPressure: 10,
  optimalRange: [5, 20],
  limitRange: [2, 50],
  nozzles: [
    { code: "AMT-007", faces: [{ side: "plate", qRef: 0.91 }, { side: "creuse", qRef: 0.65 }] },
    { code: "AMT-010", faces: [{ side: "plate", qRef: 1.89 }, { side: "creuse", qRef: 1.42 }] },
    { code: "AMT-012", faces: [{ side: "plate", qRef: 2.51 }, { side: "creuse", qRef: 2.07 }] },
    { code: "AMT-015", faces: [{ side: "plate", qRef: 3.99 }, { side: "creuse", qRef: 3.15 }] },
    { code: "AMT-018", faces: [{ side: "plate", qRef: 5.70 }, { side: "creuse", qRef: 4.43 }] },
    { code: "AMT-020", faces: [{ side: "plate", qRef: 6.85 }, { side: "creuse", qRef: 5.58 }] },
    { code: "AMT-023", faces: [{ side: "plate", qRef: 9.17 }, { side: "creuse", qRef: 7.12 }] }
  ]
},
  /* =====================================================
     TXR — Cône creux haute pression
     (vigne + aéro)
TXR: {
  label: "TXR ConeJet – Cône creux",
  machines: ["vigne", "aero"],
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
     IDK 90 — Injection d’air (aéro / tangentiel)
  ===================================================== */
  IDK90: {
  label: "IDK 90 – Injection d’air",
  machines: ["aero"],
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
     ATR 80 — Cône creux céramique (aéro)
  ===================================================== */
  ATR80: {
    label: "ATR 80 ALBUZ – Cône creux céramique",
    machines: ["aero"],
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
