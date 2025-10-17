// Quick test runner for the Vercel serverless function
const http = require("http");
const handler = require("../api/tipo-cambio-sunat");

// Create a fake req/res and call the handler
const req = new http.IncomingMessage();
req.url = "/api/tipo-cambio-sunat";

const res = new http.ServerResponse(req);
res.on("finish", () => {
  console.log("Finished");
});

// Capture the response body
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
  console.log("Response body:", body);
};

handler(req, res);
