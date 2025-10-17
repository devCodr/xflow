// Vercel Serverless Function to proxy CoinGecko bitcoin price
// Path: /api/coingecko-bitcoin

const https = require("https");

module.exports = (req, res) => {
  const url =
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,pen";
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
        // Cache for a short period to reduce upstream hits
        res.setHeader(
          "Cache-Control",
          "s-maxage=30, stale-while-revalidate=15"
        );
        res.statusCode = 200;
        res.end(JSON.stringify(json));
      } catch (err) {
        res.statusCode = 502;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            error: "Invalid response from CoinGecko",
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
