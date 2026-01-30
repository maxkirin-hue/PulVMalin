import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import puppeteer from "puppeteer";

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));

app.post("/pdf", async (req, res) => {
  try {
    const { html } = req.body;

    if (!html) {
      return res.status(400).send("Missing HTML content");
    }

    const browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage"
      ]
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" }
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdf.length
    });

    res.send(pdf);

  } catch (err) {
    console.error(err);
    res.status(500).send("PDF generation error");
  }
});

app.get("/", (req, res) => {
  res.send("PulvMalin PDF backend is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Backend running on port", PORT));

