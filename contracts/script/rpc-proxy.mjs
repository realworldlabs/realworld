// Local JSON-RPC forwarder. forge on Windows gets connection resets from the Robinhood RPC;
// point --fork-url at this proxy instead: node script/rpc-proxy.mjs
import http from "node:http";
const UP = process.env.UPSTREAM ?? "https://rpc.mainnet.chain.robinhood.com";
const PORT = Number(process.env.PORT ?? 8548);
http.createServer(async (req, res) => {
  let body = ""; for await (const c of req) body += c;
  try {
    const r = await fetch(UP, { method: "POST", headers: { "content-type": "application/json" }, body });
    const t = await r.text(); res.writeHead(r.status, { "content-type": "application/json" }); res.end(t);
  } catch (e) { res.writeHead(502); res.end(String(e)); }
}).listen(PORT, "127.0.0.1", () => console.log(`RPC proxy on http://127.0.0.1:${PORT} -> ${UP}`));
