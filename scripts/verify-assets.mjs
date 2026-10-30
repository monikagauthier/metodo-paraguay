// Verifica que todo asset referenciado em index.html e no config existe no disco.
// Equivale ao "checar imagens quebradas" sem precisar de servidor.
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = resolve(ROOT, "public");

function toDisk(p) {
  // caminhos absolutos do site (/assets/...) resolvem dentro de public/
  if (p.startsWith("/")) return resolve(PUBLIC, "." + p);
  return resolve(ROOT, p);
}

const refs = new Set();

// 1) src/href de index.html
const html = readFileSync(resolve(ROOT, "index.html"), "utf8");
for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  const v = m[1];
  if (v.startsWith("/assets/")) refs.add(v);
}

// 2) depoimentos do config
const cfg = readFileSync(resolve(ROOT, "src/config/site.config.js"), "utf8");
for (const m of cfg.matchAll(/"(\/assets\/[^"]+)"/g)) refs.add(m[1]);

let missing = 0;
console.log(`Verificando ${refs.size} assets referenciados...\n`);
for (const r of [...refs].sort()) {
  const ok = existsSync(toDisk(r));
  console.log(`${ok ? "✓" : "✗ FALTANDO"}  ${r}`);
  if (!ok) missing++;
}
console.log(`\n${missing === 0 ? "OK — nenhum asset quebrado." : missing + " asset(s) faltando."}`);
process.exit(missing === 0 ? 0 : 1);
