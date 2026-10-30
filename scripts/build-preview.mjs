// Gera um HTML único autossuficiente (CSS + JS + SVGs inline como data URI)
// para preview/screenshot sem servidor. Saída: /tmp/preview.html
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = resolve(ROOT, "public");

let html = readFileSync(resolve(ROOT, "index.html"), "utf8");
const css = readFileSync(resolve(ROOT, "src/styles/styles.css"), "utf8");
let js = readFileSync(resolve(ROOT, "src/main.js"), "utf8");
const cfg = readFileSync(resolve(ROOT, "src/config/site.config.js"), "utf8");

// resolve import do config -> inline
const cfgBody = cfg.replace(/export const CONFIG/, "const CONFIG");
js = js.replace(/import\s+\{\s*CONFIG\s*\}\s+from\s+["'][^"']+["'];?/, cfgBody);
// remove uso de import.meta (não existe em script inline clássico)
js = js.replace(/try\s*\{[\s\S]*?import\.meta[\s\S]*?\}\s*catch\s*\(_\)\s*\{[^}]*\}/, "");

function svgToDataUri(p) {
  const svg = readFileSync(resolve(PUBLIC, "." + p), "utf8");
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

// substitui src/href de /assets/*.svg por data URIs
html = html.replace(/(src|href)="(\/assets\/[^"]+\.svg)"/g, (m, attr, p) => `${attr}="${svgToDataUri(p)}"`);
// substitui depoimentos no config inline também
js = js.replace(/"(\/assets\/[^"]+\.svg)"/g, (m, p) => `"${svgToDataUri(p)}"`);

// remove <link rel=stylesheet> e <script type=module>, injeta inline
html = html.replace(/<link rel="stylesheet"[^>]*>/, `<style>${css}</style>`);
html = html.replace(/<link rel="preload"[^>]*>/, "");
html = html.replace(/<script type="module"[^>]*><\/script>/, `<script>${js}</script>`);

const out = resolve(ROOT, ".preview.html");
writeFileSync(out, html, "utf8");
console.log("wrote " + out + " (" + html.length + " bytes)");
