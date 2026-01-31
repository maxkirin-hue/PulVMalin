/* =======================
   MODÈLES
======================= */

const models = {
  "3r_sans": [0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25],
  "3r_avec": [0.25,0.25,0.25,0.5,0.25,0.25,0.25,0.5,0.25,0.25],
  "4r_sans": [0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25],
  "4r_avec": [0.25,0.25,0.25,0.25,0.25,0.25,0.5,0.5,0.25,0.25]
};

const labels = {
  "3r_sans": ["Canon 1","Canon 2","Main 3","Main 4","Canon 5","Canon 6","Main 7","Main 8"],
  "3r_avec": ["Canon 1","Canon 2","Main 3","Retour 4","Main 5","Canon 6","Canon 7","Retour 8","Main 9","Main 10"],
  "4r_sans": ["Canon G","Canon D","Main G1","Main D1","Main G2","Main D2","Main G3","Main D3"],
  "4r_avec": ["Canon G","Canon D","Main G1","Main D1","Main G2","Main D2","Retour G","Retour D","Main G3","Main D3"]
};

/* =======================
   PASTILLES
======================= */

const pastilles = [
  {nom:"CP4916-20",q3:0.21},{nom:"CP4916-24",q3:0.34},
  {nom:"CP4916-28",q3:0.45},{nom:"CP4916-32",q3:0.61},
  {nom:"CP4916-37",q3:0.79},{nom:"CP4916-41",q3:1.03},
  {nom:"CP4916-45",q3:1.30},{nom:"CP4916-52",q3:1.32}
];

/* =======================
   NAVIGATION
======================= */

function showSection(id){
  document.querySelectorAll("section").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}
function showSchema(modelKey) {
  const container = document.getElementById("schemaContainer");
  container.innerHTML = "";

  const coefs = models[modelKey];
  const names = labels[modelKey];

  if (!coefs || !names) return;

  const list = document.createElement("ul");
  list.style.listStyle = "none";
  list.style.padding = "0";

  coefs.forEach((coef, i) => {
    const li = document.createElement("li");
    li.style.padding = "4px 0";
    li.innerHTML = `<strong>${names[i]}</strong> — coef ${coef}`;
    list.appendChild(li);
  });

  container.appendChild(list);
}
/* =======================
   MACHINE
======================= */

function saveMachine(){
  localStorage.setItem("machine",document.getElementById("machineName").value);
}

/* =======================
   CALCUL
======================= */

function calculateOutputs(){
  const modelKey = document.getElementById("modeleRepartition").value;
  const coefs = models[modelKey];
  const names = labels[modelKey];

  if (!coefs || !names) {
    alert("Choisis un modèle de répartition");
    return;
  }

  const dose = Number(document.getElementById("dose").value);
  const inter = Number(document.getElementById("interligne").value);
  const vit = Number(document.getElementById("vitesse").value);

  if (!dose || !inter || !vit) {
    alert("Dose, interligne et vitesse doivent être renseignées");
    return;
  }

  const debitRang = (dose * inter * vit) / 600;
  const tbody = document.querySelector("#resultTable tbody");
  tbody.innerHTML = "";

  coefs.forEach((coef, i) => {
    const cible = debitRang * coef;

    let best = pastilles[0];
    pastilles.forEach(p => {
      if (Math.abs(p.q3 - cible) < Math.abs(best.q3 - cible)) {
        best = p;
      }
    });

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${i + 1}</td>
      <td>${names[i]}</td>
      <td>${coef}</td>
      <td>${cible.toFixed(2)}</td>
      <td>${best.nom}</td>
      <td>${best.q3}</td>
    `;
    tbody.appendChild(row);
  });

  showSection("result");
}

/* =======================
   TANGENTIEL
======================= */

function createTangentielModel(){
  const n=+nbBusesTangentiel.value;
  const coef=2/n;
  models["2r_tangentiel"]=Array(n).fill(coef);
  labels["2r_tangentiel"]=Array.from({length:n},(_,i)=>`Buse ${i+1}`);

  const sel=modeleRepartition;
  if(!sel.querySelector('[value="2r_tangentiel"]')){
    sel.innerHTML+=`<option value="2r_tangentiel">2 rangs – Tangentiel</option>`;
  }
  sel.value="2r_tangentiel";
  showSection("settings");
}

/* =======================
   PDF (PUPPETEER)
======================= */

async function exportPDF(){
  pdfLoader.classList.remove("hidden");

  const machine=localStorage.getItem("machine")||"—";
  const html=`
  <html><body>
  <h1>PULV MALIN</h1>
  <h3>Machine : ${machine}</h3>
  ${resultTable.outerHTML}
  </body></html>`;

  const res=await fetch("https://pulvmalinpdf-backend.onrender.com/pdf",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({html})
  });

  const blob=await res.blob();
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;a.download="reglage_pulve.pdf";a.click();
  URL.revokeObjectURL(url);

  pdfLoader.classList.add("hidden");
}


