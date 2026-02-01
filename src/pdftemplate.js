export function buildPdfHtml(data) {
  return `
    <html>
      <body>
        <h1>PULV MALIN – Résultats</h1>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      </body>
    </html>
  `;
}
