// src/pdf/image.ts

async function toBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

export async function loadPdfImages() {
  return {
    tangentielPng: await toBase64('/assets/images/tangentiel.png'),
    arboPng: await toBase64('/assets/images/arbo.png'),
    vitiSansRetourPng: await toBase64('/assets/images/viti_sans_retour.png'),
    vitiAvecRetourPng: await toBase64('/assets/images/viti_avec_retour.png'),
    rampePng: await toBase64('/assets/images/rampe.png'),
  };
}
