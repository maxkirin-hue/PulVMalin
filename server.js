import express from "express";
import puppeteer from "puppeteer";
import { buildPdfHtml } from "./src/pdfTemplate.js"; // si tu l’as

const app = express();
app.use(express.json({ limit: "5mb" }));

// Servir le front
app.use(express.static("public"));
app.use("/src", express.static("src"));

// API PDF
app.post("/api/pdf", async (req, res) => {
  let browser;
  try {
    const html = buildPdfHtml(req.body);

    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.emulateMediaType("print");

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "14mm", bottom: "14mm", left: "14mm", right: "14mm" }
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=pulvmalin.pdf");
    res.send(pdf);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "PDF generation failed" });
  } finally {
    if (browser) await browser.close();
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server running on port", port));
