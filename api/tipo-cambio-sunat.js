// Simple Vercel Serverless Function to proxy SUNAT exchange rate
// Path: /api/tipo-cambio-sunat
// This avoids CORS issues by requesting the external API server-side.

const https = require("https");

module.exports = (req, res) => {
  const url = "https://api.apis.net.pe/v1/tipo-cambio-sunat";

  const options = new URL(url);

  const request = https.request(options, (response) => {
    let data = "";
    response.on("data", (chunk) => {
      data += chunk;
    });
    response.on("end", () => {
      try {
        const json = JSON.parse(data);
        res.setHeader("Content-Type", "application/json");
        // Cache for short time (60 seconds) to reduce upstream calls
        res.setHeader(
          "Cache-Control",
          "s-maxage=60, stale-while-revalidate=30"
        );
        res.statusCode = 200;
        res.end(JSON.stringify(json));
      } catch (err) {
        res.statusCode = 502;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            error: "Invalid response from upstream",
            details: err.message,
          })
        );
      }
    });
  });

  request.on("error", (err) => {
    res.statusCode = 502;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({ error: "Upstream request failed", details: err.message })
    );
  });

  request.end();
};
