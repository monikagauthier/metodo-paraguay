// Montagem do HTML editorial dos PDFs (capa, sumário, capítulos, aulas, seções).
import fs from "node:fs";
import path from "node:path";
import { mdToHtml, esc, inline, slug, loadModule } from "./md.mjs";

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../..");
export const EDICAO = { data: "01/11/2026", rotulo: "Edição 1.0 · Revisão de 01/11/2026", dataBase: "Dados de referência coletados entre 31/10/2026 e 01/11/2026" };

const IMG = (f) => `../../../assets/produto/img/${f}`;
const modCache = new Map();
export function mod(n) {
  const key = String(n).padStart(2, "0");
  if (!modCache.has(key)) modCache.set(key, loadModule(path.join(ROOT, "conteudo", `modulo-${key}`)));
  return modCache.get(key);
}
export const readExtra = (f) => fs.readFileSync(path.join(ROOT, "conteudo", "extras", f), "utf8");

const TEXTURAS = ["marmore.jpg", "palco.jpg", "horizonte-noturno.jpg", "capa-cidade.jpg", "residencias.jpg", "bandeira-cidade.jpg"];

function glossarioHtml(md) {
  const items = md.split("\n").filter((l) => /^\*\*.+\*\*\s+[—-]/.test(l.trim()));
  if (!items.length) return mdToHtml(md).html;
  return `<dl class="glossario">${items.map((l) => {
    const m = /^\*\*(.+?)\*\*\s+[—-]\s+(.*)$/.exec(l.trim());
    return `<dt>${inline(m[1])}</dt><dd>${inline(m[2])}</dd>`;
  }).join("")}</dl>`;
}

function diretorioHtml() {
  const d = JSON.parse(fs.readFileSync(path.join(ROOT, "referencias", "diretorio-oficial.json"), "utf8"));
  return `<p>${esc(d.observacao)}</p>` + d.grupos.map((g) => `<section class="dir-grupo"><h2 id="dir-${slug(g.titulo)}">${esc(g.titulo)}</h2>${g.itens.map((i) =>
    `<div class="dir-item"><b>${esc(i.nome)}</b><a class="u" href="${esc(i.url)}">${esc(i.url)}</a><span class="uso">${esc(i.uso)}</span></div>`).join("")}</section>`).join("");
}

/**
 * spec: { titulo, subtitulo, kicker, rodape, capa, blocos: [...] }
 * blocos: {tipo:'modulo', n} | {tipo:'secao', titulo, md|arquivo, glossario?, sumario?} | {tipo:'diretorio', titulo}
 * pageMap: { id: pagina } para preencher o sumário (2.ª passagem)
 */
export function buildHtml(spec, pageMap = {}) {
  const toc = [];
  const body = [];
  let texI = 0;
  for (const b of spec.blocos) {
    if (b.tipo === "modulo") {
      const m = mod(b.n);
      const capId = `cap-${m.id}`;
      const minutos = m.aulas.reduce((s, a) => s + a.minutos, 0);
      toc.push({ id: capId, t: `Módulo ${m.numero} — ${m.titulo}`, filhos: m.aulas.map((a) => ({ id: a.id, t: `${a.codigo} ${a.titulo}` })) });
      body.push(`<section class="abertura" id="${capId}"><div class="tex" style="background-image:url('${IMG(TEXTURAS[texI++ % TEXTURAS.length])}')"></div>
        <div class="rot">Módulo</div><div class="num">${m.numero}</div>
        <div class="cx"><h1>${esc(m.titulo)}</h1><div class="sub">${esc(m.subtitulo)}</div><div class="filete"></div>
        <ul>${m.objetivos.map((o) => `<li>${inline(o)}</li>`).join("")}</ul>
        <div class="meta">${m.aulas.length} aulas · cerca de ${minutos} min de leitura · Nível: ${esc(m.nivel)}</div></div></section>`);
      body.push(`<section class="miolo">`);
      for (const a of m.aulas) {
        body.push(`<article class="aula" id="${a.id}"><header class="aula-cab"><div class="cod">Aula ${esc(a.codigo)} · Módulo ${m.numero}</div><h1>${inline(a.titulo)}</h1><div class="tempo">Leitura estimada: ${a.minutos} min</div><div class="filete"></div></header>${a.html}</article>`);
      }
      body.push(`</section>`);
    } else if (b.tipo === "secao") {
      const md = b.md ?? readExtra(b.arquivo);
      const id = b.id || `sec-${slug(b.titulo)}`;
      const r = mdToHtml(md, { idPrefix: id + "-" });
      const filhos = b.sumario === false ? [] : r.headings.filter((h) => h.lvl === 2).map((h) => ({ id: h.id, t: h.text }));
      toc.push({ id, t: b.titulo, filhos: b.sumarioFilhos === false ? [] : filhos });
      body.push(`<section class="miolo"><h1 class="sec" id="${id}">${esc(b.titulo)}</h1>${b.glossario ? glossarioHtml(md) : r.html}</section>`);
    } else if (b.tipo === "diretorio") {
      const id = "sec-diretorio";
      toc.push({ id, t: b.titulo, filhos: [] });
      body.push(`<section class="miolo"><h1 class="sec" id="${id}">${esc(b.titulo)}</h1>${diretorioHtml()}</section>`);
    } else if (b.tipo === "html") {
      body.push(b.html);
    }
  }

  const pg = (id) => (pageMap[id] ? String(pageMap[id]) : "·");
  const tocHtml = `<section class="sumario"><h1 id="sumario">Sumário</h1><ol>${toc.map((c) =>
    `<li class="s1"><a href="#${c.id}"><span class="t">${esc(c.t)}</span><span class="d"></span><span class="p">${pg(c.id)}</span></a>${c.filhos.length ? `<ol>${c.filhos.map((f) =>
      `<li class="s2"><a href="#${f.id}"><span class="t">${inline(f.t)}</span><span class="d"></span><span class="p">${pg(f.id)}</span></a></li>`).join("")}</ol>` : ""}</li>`).join("")}</ol></section>`;

  const intro = `<section class="pagina-intro miolo"><div class="selo-data">${EDICAO.rotulo}</div>
    <h2 style="margin-top:0">Sobre este material</h2>${mdToHtml(spec.sobre || "").html}
    <aside class="callout callout-legal"><p class="callout-t">Informação geral, não é orientação profissional</p>
    <p>Este material tem finalidade educacional. Ele não substitui a análise de advogado, contador, despachante habilitado ou instituição financeira para o seu caso. Regras migratórias, tributárias, bancárias e valores mudam: cada informação sujeita a mudança traz a fonte e a data de consulta. ${EDICAO.dataBase}.</p></aside>
    <p style="font-size:7.6pt;color:#5E6B65">Método Paraguay — Inteligência sem fronteiras. Todos os direitos reservados. Exemplos com pessoas são <strong>casos hipotéticos</strong> criados para fins didáticos.</p></section>`;

  const capa = `<section class="capa"><div class="foto" style="background-image:url('${IMG(spec.capa || "capa-cidade.jpg")}')"></div><div class="veu"></div><div class="moldura"></div>
    <div class="topo"><img class="emblema" src="${IMG("emblema.png")}" alt="Emblema Método Paraguay"><div class="kicker">${esc(spec.kicker)}</div><h1>${esc(spec.titulo)}</h1><div class="sub">${esc(spec.subtitulo || "")}</div><div class="filete"></div></div>
    <div class="base"><div class="marca">MÉTODO PARAGUAY</div><div class="slogan">Inteligência sem fronteiras</div><div class="edicao">${EDICAO.rotulo}</div></div></section>`;

  const contracapa = `<section class="contracapa"><div class="cx"><img src="${IMG("emblema.png")}" alt=""><div class="marca">MÉTODO PARAGUAY</div>
    <p style="letter-spacing:2pt;text-transform:uppercase;font-size:6.4pt;color:#D8B76E">Inteligência sem fronteiras</p>
    <p>Conhecimento, planejamento e segurança para decidir com liberdade.</p><p style="font-size:6.8pt;color:#9C9787">${EDICAO.rotulo}</p></div></section>`;

  const rodape = `MÉTODO PARAGUAY  ·  ${spec.rodape || spec.titulo}`.toUpperCase().replace(/"/g, "'");
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(spec.titulo)} — Método Paraguay</title>
<link rel="stylesheet" href="../templates/pdf.css"><style>@page { @bottom-left { content: "${rodape}"; } }</style></head>
<body>${capa}${intro}${spec.semSumario ? "" : tocHtml}${body.join("\n")}${contracapa}</body></html>`;
}
