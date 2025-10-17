// Test both serverless API proxies locally
const http = require("http");
const sunat = require("../api/tipo-cambio-sunat");
const coingecko = require("../api/coingecko-bitcoin");

function runHandler(handler, name) {
  return new Promise((resolve) => {
    const req = new http.IncomingMessage();
    req.url = `/api/${name}`;
    const res = new http.ServerResponse(req);

    let body = "";
    const _write = res.write;
    const _end = res.end;
    res.write = function (chunk) {
      body += chunk;
      return _write.apply(this, arguments);
    };
    res.end = function (chunk) {
      if (chunk) body += chunk;
      _end.apply(this, arguments);
      resolve({ name, body });
    };

    handler(req, res);
  });
}

(async () => {
  console.log("Testing SUNAT proxy...");
  const s = await runHandler(sunat, "tipo-cambio-sunat");
  console.log("SUNAT response:", s.body.slice(0, 400));

  console.log("Testing CoinGecko proxy...");
  const c = await runHandler(coingecko, "coingecko-bitcoin");
  console.log("CoinGecko response:", c.body.slice(0, 400));
})();
