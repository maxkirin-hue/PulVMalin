export const state = {
  // Page 1
  machineType: null as string | null,
  machineName: "",

  // Page 2
  dose: 0,
  interligne: 0,
  speed: 0,
  familyKey: null as string | null,

  // Modèle de répartition (viti/arbo)
  modelKey: null as string | null,

  // Largeur / vitesse (rampe)
  largeur: 0,
  vitesse: 0,

  // Résultats du calcul
  results: [] as any[],

  // Débit total machine
  qTotal: 0,

  // Pression recommandée
  recommendedPressure: 0,
};
