// Servidor estático mínimo para preview/testes locais.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = resolve(ROOT, "public");
const PORT = process.env.PORT || 8080;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".json": "application/json",
};

createServer(async (req, res) => {
  try {
    let url = decodeURIComponent(req.url.split("?")[0]);
    if (url === "/") url = "/index.html";
    // tenta public/ primeiro (assets), depois a raiz do projeto (index.html, /src/*)
    const candidates = [resolve(PUBLIC, "." + url), resolve(ROOT, "." + normalize(url))];
    for (const file of candidates) {
      if (!file.startsWith(ROOT)) continue;
      try {
        const data = await readFile(file);
        res.writeHead(200, { "Content-Type": TYPES[extname(file)] || "application/octet-stream" });
        res.end(data);
        return;
      } catch { /* próximo candidato */ }
    }
    res.writeHead(404); res.end("404");
  } catch (e) {
    res.writeHead(500); res.end(String(e));
  }
}).listen(PORT, () => console.log(`serving on http://localhost:${PORT}`));
