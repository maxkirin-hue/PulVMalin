function computeSettings({
  dose,
  interligne,
  vitesse,
  coefs,
  pastilles,
  mode = "ideal",
  newInterligne = null,
  newDose = null,
  forcedPressure = null
}) {
  const results = [];

  if (!currentFamily) {
    alert("Choisissez un type de buses.");
    return [];
  }

  const Pnom = currentFamily.pressionNominale;

  coefs.forEach((coef, index) => {
    const debitCible = (dose * interligne * vitesse * coef) / 600;

    // Trouver la buse la plus proche
    let best = null;
    let bestDiff = Infinity;

    pastilles.forEach(p => {
      const diff = Math.abs(p.q - debitCible);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = p;
      }
    });

    let pression = Pnom;
    let debitAtPressure = best.q;

    if (mode === "newInterligne") {
      const debit2 = (dose * newInterligne * vitesse * coef) / 600;
      pression = Pnom * Math.pow(debit2 / best.q, 2);
      debitAtPressure = best.q * Math.sqrt(pression / Pnom);

    } else if (mode === "newDose") {
      const debit2 = (newDose * interligne * vitesse * coef) / 600;
      pression = Pnom * Math.pow(debit2 / best.q, 2);
      debitAtPressure = best.q * Math.sqrt(pression / Pnom);

    } else if (mode === "forcePressure" && forcedPressure) {
      pression = forcedPressure;
      debitAtPressure = best.q * Math.sqrt(pression / Pnom);
    }

    pression = clamp(pression, 0, 99);

    results.push({
      index: index + 1,
      coef,
      debitCible,
      pastille: best.nom,
      iso: best.iso,
      q: best.q,
      pression,
      debitAtPressure
    });
  });

  return results;
}
