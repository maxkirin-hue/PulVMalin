import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import puppeteer from "puppeteer";

const app = express();

// CORS plus permissif pour le debug
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(bodyParser.json({ limit: "10mb" }));

// Route de health check pour Render
app.get("/", (req, res) => {
  res.json({ 
    status: "running",
    message: "PulvMalin PDF backend is ready",
    timestamp: new Date().toISOString()
  });
});

// Route principale PDF
app.post("/pdf", async (req, res) => {
  console.log("📥 Nouvelle requête PDF reçue");
  
  try {
    const { html } = req.body;
    
    if (!html) {
      console.error("❌ HTML manquant dans la requête");
      return res.status(400).json({ 
        error: "Missing HTML content",
        received: Object.keys(req.body)
      });
    }

    console.log(`📄 HTML reçu: ${html.length} caractères`);
    
    // Lancement de Puppeteer avec timeout
    console.log("🚀 Lancement de Puppeteer...");
    const browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu"
      ],
      timeout: 30000 // 30 secondes max pour lancer le browser
    });

    console.log("✅ Browser lancé");
    const page = await browser.newPage();
    
    // Timeout pour setContent
    await Promise.race([
      page.setContent(html, { 
        waitUntil: "networkidle0",
        timeout: 15000 
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout setContent")), 20000)
      )
    ]);

    console.log("📝 Contenu HTML chargé");

    // Génération du PDF
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { 
        top: "10mm", 
        bottom: "10mm", 
        left: "10mm", 
        right: "10mm" 
      },
      preferCSSPageSize: false
    });

    await browser.close();
    console.log(`✅ PDF généré: ${pdf.length} bytes`);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=reglage_pulve.pdf",
      "Content-Length": pdf.length,
      "Cache-Control": "no-cache"
    });
    
    res.send(pdf);
    console.log("📤 PDF envoyé au client");

  } catch (err) {
    console.error("❌ Erreur lors de la génération PDF:", err);
    
    // Log détaillé de l'erreur
    console.error("Stack:", err.stack);
    
    res.status(500).json({ 
      error: "PDF generation error",
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint de test pour vérifier que Puppeteer fonctionne
app.get("/test-pdf", async (req, res) => {
  try {
    console.log("🧪 Test Puppeteer...");
    
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    
    const page = await browser.newPage();
    await page.setContent("<h1>Test PDF</h1>", { waitUntil: "networkidle0" });
    const pdf = await page.pdf({ format: "A4" });
    await browser.close();
    
    res.set("Content-Type", "application/pdf");
    res.send(pdf);
    console.log("✅ Test réussi");
    
  } catch (err) {
    console.error("❌ Test échoué:", err);
    res.status(500).json({ error: err.message });
  }
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error("🔥 Erreur non gérée:", err);
  res.status(500).json({ 
    error: "Internal server error",
    message: err.message 
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Backend démarré sur le port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🔍 Test: http://localhost:${PORT}/test-pdf`);
});

// Gestion propre de l'arrêt
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM reçu, arrêt du serveur...');
  process.exit(0);
});
