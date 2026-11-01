// Teste automatizado da área de membros (Chromium headless).
// Verifica: carregamento sem erros de console, rotas, persistência do progresso,
// checklists, plano, calculadora, downloads (HTTP 200), ausência de rolagem horizontal
// em 320–1440 px e funcionamento via file://. Gera capturas em _tmp/telas.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";
import { browser, closeBrowser } from "../lib/pdf.mjs";
import { ROOT } from "../lib/doc.mjs";

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".ttf": "font/ttf", ".pdf": "application/pdf", ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".json": "application/json" };
const server = createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  const file = path.resolve(ROOT, "." + url);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  try { const d = await readFile(file); res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" }); res.end(d); }
  catch { res.writeHead(404); res.end("404"); }
}).listen(0);
const port = server.address().port;
const BASE = `http://localhost:${port}/plataforma/index.html`;
const SHOTS = process.env.SHOTS || path.join(ROOT, "..", "_tmp", "telas");
fs.mkdirSync(SHOTS, { recursive: true });

const resultados = [];
const ok = (nome, cond, det = "") => { resultados.push({ nome, ok: !!cond, det }); console.log(`${cond ? "✓" : "✗"} ${nome}${det ? " — " + det : ""}`); };

const b = await browser();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
const page = await ctx.newPage();
const erros = [];
page.on("console", (m) => { if (m.type() === "error") erros.push(m.text()); });
page.on("pageerror", (e) => erros.push(String(e)));
page.on("requestfailed", (r) => erros.push("falha: " + r.url()));
page.on("response", (r) => { if (r.status() >= 400) erros.push(`HTTP ${r.status()}: ${r.url()}`); });

const rotas = ["#/", "#/modulos", "#/modulo/01", "#/aula/m01-a01", "#/aula/m10-a06", "#/biblioteca", "#/biblioteca?c=Bônus", "#/biblioteca?c=Planilhas", "#/ferramentas", "#/plano", "#/progresso", "#/ajuda", "#/busca?q=apostila", "#/naoexiste"];
await page.goto(BASE, { waitUntil: "load" });
await page.evaluate(() => localStorage.clear());
for (const r of rotas) {
  await page.goto(BASE + r, { waitUntil: "load" });
  await page.waitForTimeout(150);
  const t = await page.evaluate(() => ({ h1: document.querySelector("main h1")?.textContent || "", len: document.querySelector("main").innerText.length }));
  ok(`Rota ${r} renderiza`, t.len > 80 && t.h1, `${t.h1.slice(0, 50)} (${t.len} caracteres)`);
}
ok("Busca por 'apostila' encontra aulas", await page.goto(BASE + "#/busca?q=apostila").then(() => page.waitForTimeout(100)).then(() => page.locator("main ol.aulas li").count()).then((n) => n >= 3));

// Progresso e persistência
await page.goto(BASE + "#/aula/m01-a01"); await page.waitForTimeout(100);
await page.click("#concluir");
const cb = page.locator("#corpo-aula input[data-check]").first();
await cb.check();
await page.reload(); await page.waitForTimeout(150);
ok("Aula concluída persiste após recarregar", (await page.locator("#concluir").getAttribute("aria-pressed")) === "true" || (await page.goto(BASE + "#/aula/m01-a01").then(() => page.locator("#concluir").getAttribute("aria-pressed"))) === "true");
await page.goto(BASE + "#/aula/m01-a01"); await page.waitForTimeout(100);
ok("Checklist da aula persiste", await page.locator("#corpo-aula input[data-check]").first().isChecked());
await page.goto(BASE + "#/"); await page.waitForTimeout(100);
const home = await page.evaluate(() => ({ btn: [...document.querySelectorAll(".hero a.btn")].map((a) => a.textContent + "|" + a.getAttribute("href")).join(), anel: document.querySelector(".hero .anel span")?.textContent }));
ok("Início mostra 'Continuar estudando' para a aula seguinte", /Continuar estudando\|#\/aula\/m01-a02/.test(home.btn), home.btn);
ok("Percentual geral atualizado", home.anel === "1%", home.anel);

// Plano
await page.goto(BASE + "#/plano"); await page.waitForTimeout(100);
await page.locator("input[data-tarefa='w1-t1']").check(); await page.waitForTimeout(100);
await page.reload(); await page.waitForTimeout(150);
ok("Tarefa do plano persiste", await page.locator("input[data-tarefa='w1-t1']").isChecked());

// Calculadora
await page.goto(BASE + "#/ferramentas"); await page.waitForTimeout(100);
const calc = await page.locator("#calc-res").innerText();
ok("Calculadora calcula com o exemplo", /R\$/.test(calc) && /Gs\./.test(calc), calc.split("\n").slice(0, 2).join(" | "));
await page.fill("#c-moradia", "6000000"); await page.waitForTimeout(100);
const calc2 = await page.locator("#calc-res").innerText();
ok("Calculadora recalcula ao editar", calc2 !== calc);

// Biblioteca: filtro e downloads
await page.goto(BASE + "#/biblioteca?c=Checklists"); await page.waitForTimeout(100);
const nCheck = await page.locator("main .arquivo").count();
ok("Filtro Checklists mostra apenas checklists", nCheck >= 8, `${nCheck} cartões`);
await page.goto(BASE + "#/biblioteca"); await page.waitForTimeout(100);
const links = await page.$$eval("main a[download]", (as) => [...new Set(as.map((a) => a.href))]);
let falhas = [];
for (const l of links) { const r = await ctx.request.get(l); if (r.status() !== 200 || (await r.body()).length < 1000) falhas.push(`${r.status()} ${l}`); }
ok(`Downloads da biblioteca respondem 200 (${links.length} arquivos)`, links.length >= 40 && !falhas.length, falhas.join("; "));
const [dl] = await Promise.all([page.waitForEvent("download"), page.locator("main a[download]").first().click()]);
ok("Clique em Baixar inicia o download", !!(await dl.suggestedFilename()), await dl.suggestedFilename());

// Exportar progresso
await page.goto(BASE + "#/progresso"); await page.waitForTimeout(100);
const [ex] = await Promise.all([page.waitForEvent("download"), page.click("#exportar")]);
const expPath = path.join(SHOTS, "progresso.json"); await ex.saveAs(expPath);
const exp = JSON.parse(fs.readFileSync(expPath, "utf8"));
ok("Exportação de progresso gera JSON válido", exp.produto === "metodo-paraguay" && exp.estado.aulas["m01-a01"] === true);

// Responsividade
const larguras = [320, 375, 390, 430, 768, 1024, 1440];
for (const w of larguras) {
  await page.setViewportSize({ width: w, height: 900 });
  let pior = 0, rotaPior = "";
  for (const r of ["#/", "#/modulo/04", "#/aula/m04-a07", "#/biblioteca", "#/ferramentas", "#/plano", "#/progresso", "#/ajuda"]) {
    await page.goto(BASE + r); await page.waitForTimeout(80);
    const o = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (o > pior) { pior = o; rotaPior = r; }
  }
  ok(`Sem rolagem horizontal em ${w}px`, pior <= 0, pior > 0 ? `${pior}px em ${rotaPior}` : "");
}
// Capturas
for (const [w, h, nome] of [[390, 844, "mobile"], [1440, 900, "desktop"]]) {
  await page.setViewportSize({ width: w, height: h });
  for (const r of [["#/", "inicio"], ["#/modulo/03", "modulo"], ["#/aula/m03-a06", "aula"], ["#/biblioteca?c=Bônus", "biblioteca"], ["#/ferramentas", "ferramentas"], ["#/plano", "plano"]]) {
    await page.goto(BASE + r[0]); await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(SHOTS, `${nome}-${r[1]}.png`), fullPage: false });
  }
}
ok("Nenhum erro de console, de página ou de rede", erros.length === 0, erros.slice(0, 5).join(" | "));

// file://
const p2 = await ctx.newPage(); const err2 = [];
p2.on("pageerror", (e) => err2.push(String(e)));
await p2.goto("file://" + path.join(ROOT, "plataforma/index.html") + "#/modulos"); await p2.waitForTimeout(300);
ok("Funciona aberta direto do arquivo (file://)", (await p2.locator("main .cartao").count()) === 12 && !err2.length);

await closeBrowser(); server.close();
const falhou = resultados.filter((r) => !r.ok);
fs.writeFileSync(path.join(ROOT, "scripts/produto/_relatorio-plataforma.json"), JSON.stringify({ data: new Date().toISOString(), total: resultados.length, falhas: falhou.length, resultados }, null, 2));
console.log(`\n${resultados.length - falhou.length}/${resultados.length} verificações aprovadas.`);
if (falhou.length) process.exitCode = 1;
