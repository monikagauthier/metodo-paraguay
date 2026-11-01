// Geração de PDF com o Chromium headless do ambiente (Playwright Core).
// Também contém utilitários de leitura do PDF gerado (páginas, destinos) e
// um gravador de campos AcroForm (checkbox/texto) por atualização incremental.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

function findPlaywright() {
  const cands = [
    process.env.PLAYWRIGHT_CORE,
    "playwright-core",
    "/inner_container/opt/toolchains/.nvm/versions/node/v22.23.4/lib/node_modules/@playwright/mcp/node_modules/playwright-core",
    "/root/.nvm/versions/node/v22.23.4/lib/node_modules/@playwright/mcp/node_modules/playwright-core",
  ].filter(Boolean);
  for (const c of cands) { try { return require(c); } catch {} }
  throw new Error("playwright-core não encontrado. Defina PLAYWRIGHT_CORE com o caminho do pacote.");
}

function findChrome() {
  const cands = [
    process.env.CHROME_PATH,
    "/inner_container/opt/playwright/chromium_headless_shell-1232/chrome-headless-shell-linux64/chrome-headless-shell",
  ].filter(Boolean);
  for (const c of cands) if (fs.existsSync(c)) return c;
  return undefined; // deixa o Playwright decidir
}

let _browser = null;
export async function browser() {
  if (_browser) return _browser;
  const { chromium } = findPlaywright();
  _browser = await chromium.launch({ executablePath: findChrome(), args: ["--disable-crash-reporter", "--no-crashpad", "--font-render-hinting=none"] });
  return _browser;
}
export async function closeBrowser() { if (_browser) await _browser.close(); _browser = null; }

/** Renderiza um arquivo HTML em PDF. Retorna o caminho e as posições de elementos marcados (opcional). */
export async function htmlFileToPdf(htmlPath, pdfPath, { width = "170mm", height = "240mm", fields = false } = {}) {
  const b = await browser();
  const page = await b.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("requestfailed", (r) => errors.push("Falha ao carregar: " + r.url()));
  await page.goto("file://" + path.resolve(htmlPath), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  if (fields) await page.waitForFunction(() => window.__paginated === true, null, { timeout: 30000 });
  let fieldRects = null;
  if (fields) {
    await page.emulateMedia({ media: "print" });
    fieldRects = await page.evaluate(() => {
      const pages = [...document.querySelectorAll(".pg")];
      const res = [];
      pages.forEach((pg, pi) => {
        const pr = pg.getBoundingClientRect();
        pg.querySelectorAll("[data-field]").forEach((el) => {
          const r = el.getBoundingClientRect();
          res.push({ page: pi, name: el.dataset.field, label: el.dataset.label || el.dataset.field, type: el.dataset.type || "text", multiline: el.dataset.multiline === "1",
            x: r.left - pr.left, y: r.top - pr.top, w: r.width, h: r.height, pw: pr.width, ph: pr.height });
        });
      });
      return res;
    });
  }
  fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
  await page.pdf({ path: pdfPath, width, height, printBackground: true, preferCSSPageSize: true, outline: true, tagged: true });
  await page.close();
  return { errors, fieldRects };
}

// ---------- Leitura simples de PDF (xref clássico, como o gerado pelo Chromium) ----------
export function readPdf(buf) {
  const s = buf.toString("latin1");
  const objs = new Map();
  const re = /(\d+) 0 obj\s*/g;
  let m;
  while ((m = re.exec(s))) {
    const start = m.index + m[0].length;
    const end = s.indexOf("endobj", start);
    objs.set(Number(m[1]), { start: m.index, body: s.slice(start, end) });
    re.lastIndex = end;
  }
  const trailer = s.slice(s.lastIndexOf("trailer"));
  const rootN = Number(/\/Root (\d+) 0 R/.exec(trailer)[1]);
  const size = Number(/\/Size (\d+)/.exec(trailer)[1]);
  const startxref = Number(/startxref\s+(\d+)/.exec(s.slice(s.lastIndexOf("startxref")))[1]);
  const catalog = objs.get(rootN).body;
  const pagesN = Number(/\/Pages (\d+) 0 R/.exec(catalog)[1]);
  const pageList = [];
  const walk = (n) => {
    const body = objs.get(n).body;
    if (/\/Type\s*\/Pages/.test(body)) {
      const kids = /\/Kids\s*\[([^\]]*)\]/.exec(body)[1].match(/\d+ 0 R/g).map((k) => Number(k.split(" ")[0]));
      kids.forEach(walk);
    } else pageList.push(n);
  };
  walk(pagesN);
  return { s, objs, rootN, size, startxref, catalog, pageList };
}

/** Mapa nome-do-destino -> número da página (1-based). */
export function destPages(buf) {
  const pdf = readPdf(buf);
  const res = {};
  const dm = /\/Dests (\d+) 0 R/.exec(pdf.catalog);
  if (!dm) return res;
  const body = pdf.objs.get(Number(dm[1])).body;
  const re = /\/([^\s/\[]+)\s*\[(\d+) 0 R/g;
  let m;
  while ((m = re.exec(body))) {
    const name = m[1].replace(/#([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
    const idx = pdf.pageList.indexOf(Number(m[2]));
    if (idx >= 0) res[name] = idx + 1;
  }
  return res;
}

export function pdfStats(buf) {
  const s = buf.toString("latin1");
  const pdf = readPdf(buf);
  return {
    paginas: pdf.pageList.length,
    links: (s.match(/\/Subtype \/Link/g) || []).length,
    linksExternos: (s.match(/\/URI \(/g) || []).length,
    fontesEmbutidas: new Set((s.match(/\/FontName \/[A-Z]{6}\+[^\s\/]+/g) || []).map((x) => x.split("+")[1])).size,
    temSumarioNavegavel: /\/Outlines \d+ 0 R/.test(pdf.catalog),
    campos: (s.match(/\/FT \/(Btn|Tx)/g) || []).length,
  };
}

// ---------- Campos de formulário (AcroForm) via atualização incremental ----------
const pdfStr = (t) => "(" + String(t).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)") + ")";

/**
 * Adiciona campos preenchíveis a um PDF gerado pelo Chromium.
 * rects: [{page, name, type:'check'|'text', multiline, x,y,w,h (px CSS), pw, ph (px da página)}]
 */
export function addFormFields(pdfPath, rects) {
  const buf = fs.readFileSync(pdfPath);
  const pdf = readPdf(buf);
  let next = pdf.size;
  const newObjs = [];
  const add = (body) => { const n = next++; newObjs.push({ n, body }); return n; };

  const font = add("<</Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding>>");
  const zapf = add("<</Type /Font /Subtype /Type1 /BaseFont /ZapfDingbats>>");
  const byPage = new Map();
  const fieldRefs = [];
  const used = new Set();

  for (const r of rects) {
    const pageN = pdf.pageList[r.page];
    if (!pageN) continue;
    const pbody = pdf.objs.get(pageN).body;
    const mb = /\/MediaBox\s*\[\s*([\d.\-]+)\s+([\d.\-]+)\s+([\d.\-]+)\s+([\d.\-]+)\s*\]/.exec(pbody);
    const W = Number(mb[3]), H = Number(mb[4]);
    const sx = W / r.pw, sy = H / r.ph;
    const x1 = r.x * sx, y2 = H - r.y * sy, x2 = (r.x + r.w) * sx, y1 = H - (r.y + r.h) * sy;
    const w = x2 - x1, h = y2 - y1;
    let name = r.name; let k = 2; while (used.has(name)) name = `${r.name}_${k++}`; used.add(name);
    let annot;
    if (r.type === "check") {
      const onAp = add(`<</Type /XObject /Subtype /Form /BBox [0 0 ${w.toFixed(2)} ${h.toFixed(2)}] /Resources <</Font <</ZaDb ${zapf} 0 R>>>> /Length 0>>`);
      const sz = (Math.min(w, h) * 0.8).toFixed(2);
      const onStream = `q 0.722 0.6 0.36 rg BT /ZaDb ${sz} Tf ${(w * 0.15).toFixed(2)} ${(h * 0.2).toFixed(2)} Td (4) Tj ET Q`;
      newObjs[newObjs.length - 1].body = `<</Type /XObject /Subtype /Form /BBox [0 0 ${w.toFixed(2)} ${h.toFixed(2)}] /Resources <</Font <</ZaDb ${zapf} 0 R>>>> /Length ${onStream.length}>>\nstream\n${onStream}\nendstream`;
      const offAp = add(`<</Type /XObject /Subtype /Form /BBox [0 0 ${w.toFixed(2)} ${h.toFixed(2)}] /Length 0>>\nstream\n\nendstream`);
      annot = add(`<</Type /Annot /Subtype /Widget /FT /Btn /T ${pdfStr(name)} /TU ${pdfStr(r.label || name)} /V /Off /AS /Off /F 4 /P ${pageN} 0 R /Rect [${x1.toFixed(2)} ${y1.toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)}] /MK <</CA (4)>> /DA (/ZaDb 0 Tf 0.722 0.6 0.36 rg) /AP <</N <</Yes ${onAp} 0 R /Off ${offAp} 0 R>>>>>>`);
    } else {
      const fs_ = r.multiline ? 9 : Math.max(7, Math.min(10, h * 0.6));
      const flags = r.multiline ? 4096 : 0;
      const apS = "/Tx BMC EMC";
      const ap = add(`<</Type /XObject /Subtype /Form /BBox [0 0 ${w.toFixed(2)} ${h.toFixed(2)}] /Resources <</Font <</Helv ${font} 0 R>>>> /Length ${apS.length}>>\nstream\n${apS}\nendstream`);
      annot = add(`<</Type /Annot /Subtype /Widget /FT /Tx /T ${pdfStr(name)} /TU ${pdfStr(r.label || name)} /Ff ${flags} /F 4 /P ${pageN} 0 R /Rect [${x1.toFixed(2)} ${y1.toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)}] /DA (/Helv ${fs_.toFixed(1)} Tf 0.1 0.1 0.1 rg) /V () /AP <</N ${ap} 0 R>>>>`);
    }
    fieldRefs.push(annot);
    if (!byPage.has(pageN)) byPage.set(pageN, []);
    byPage.get(pageN).push(annot);
  }

  // Reescreve páginas com /Annots
  const rewritten = [];
  for (const [pageN, annots] of byPage) {
    let body = pdf.objs.get(pageN).body.trim();
    const refs = annots.map((a) => `${a} 0 R`).join(" ");
    if (/\/Annots\s*\[/.test(body)) body = body.replace(/\/Annots\s*\[/, `/Annots [${refs} `);
    else if (/\/Annots\s+(\d+) 0 R/.test(body)) {
      const an = Number(/\/Annots\s+(\d+) 0 R/.exec(body)[1]);
      const arr = pdf.objs.get(an).body.trim().replace(/^\[/, "").replace(/\]$/, "");
      body = body.replace(/\/Annots\s+\d+ 0 R/, `/Annots [${refs} ${arr}]`);
    } else body = body.replace(/>>\s*$/, ` /Annots [${refs}]>>`);
    rewritten.push({ n: pageN, body });
  }
  // Novo catálogo com AcroForm
  let cat = pdf.catalog.trim();
  const acro = `/AcroForm <</Fields [${fieldRefs.map((f) => `${f} 0 R`).join(" ")}] /NeedAppearances true /DA (/Helv 0 Tf 0 g) /DR <</Font <</Helv ${font} 0 R /ZaDb ${zapf} 0 R>>>>>>`;
  cat = cat.replace(/>>\s*$/, ` ${acro}>>`);
  rewritten.push({ n: pdf.rootN, body: cat });

  const all = [...newObjs, ...rewritten].sort((a, b) => a.n - b.n);
  let tail = "\n";
  const offsets = [];
  let pos = buf.length + 1;
  for (const o of all) {
    const chunk = `${o.n} 0 obj\n${o.body}\nendobj\n`;
    offsets.push({ n: o.n, off: pos });
    tail += chunk;
    pos += Buffer.byteLength(chunk, "latin1");
  }
  const xrefPos = pos;
  let xref = "xref\n";
  for (const o of offsets) xref += `${o.n} 1\n${String(o.off).padStart(10, "0")} 00000 n \n`;
  const info = /\/Info (\d+) 0 R/.exec(pdf.s.slice(pdf.s.lastIndexOf("trailer")));
  xref += `trailer\n<</Size ${next} /Root ${pdf.rootN} 0 R${info ? ` /Info ${info[1]} 0 R` : ""} /Prev ${pdf.startxref}>>\nstartxref\n${xrefPos}\n%%EOF\n`;
  fs.writeFileSync(pdfPath, Buffer.concat([buf, Buffer.from(tail + xref, "latin1")]));
  return fieldRefs.length;
}
