// Gera os PDFs editoriais (manuais e guias) a partir do conteúdo em /conteudo.
// Uso: node scripts/produto/build-pdfs.mjs [id ...]
import fs from "node:fs";
import path from "node:path";
import { buildHtml, ROOT } from "./lib/doc.mjs";
import { htmlFileToPdf, destPages, pdfStats, closeBrowser } from "./lib/pdf.mjs";
import { DOCS } from "./docs.config.mjs";

const only = process.argv.slice(2);
const HTML_DIR = path.join(ROOT, "scripts/produto/_html");
fs.mkdirSync(HTML_DIR, { recursive: true });
const report = [];

for (const spec of DOCS) {
  if (only.length && !only.includes(spec.id)) continue;
  const htmlPath = path.join(HTML_DIR, `${spec.id}.html`);
  const out = path.join(ROOT, spec.arquivo);
  // 1.ª passagem: descobre em que página cada capítulo/aula caiu
  fs.writeFileSync(htmlPath, buildHtml(spec, {}));
  let r = await htmlFileToPdf(htmlPath, out);
  const pages = destPages(fs.readFileSync(out));
  // 2.ª passagem: sumário com números de página
  fs.writeFileSync(htmlPath, buildHtml(spec, pages));
  r = await htmlFileToPdf(htmlPath, out);
  const pages2 = destPages(fs.readFileSync(out));
  const drift = Object.keys(pages).filter((k) => pages[k] !== pages2[k]).length;
  const st = pdfStats(fs.readFileSync(out));
  const size = fs.statSync(out).size;
  report.push({ id: spec.id, arquivo: spec.arquivo, ...st, tamanhoKB: Math.round(size / 1024), destinos: Object.keys(pages2).length, sumarioDivergente: drift, erros: r.errors });
  console.log(`✓ ${spec.id} ${spec.arquivo} — ${st.paginas} p., ${st.links} links, ${Math.round(size / 1024)} KB${drift ? ` (sumário divergente em ${drift})` : ""}${r.errors.length ? " ERROS: " + r.errors.join("; ") : ""}`);
}
await closeBrowser();
const repPath = path.join(ROOT, "scripts/produto/_relatorio-pdfs.json");
let prev = [];
try { prev = JSON.parse(fs.readFileSync(repPath, "utf8")); } catch {}
const merged = [...prev.filter((p) => !report.find((r) => r.id === p.id)), ...report].sort((a, b) => a.id.localeCompare(b.id));
fs.writeFileSync(repPath, JSON.stringify(merged, null, 2));
