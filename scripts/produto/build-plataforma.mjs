// Gera plataforma/data/dados.js a partir do conteúdo e do manifesto da biblioteca.
// O arquivo é um script (window.MP_DADOS = ...) para funcionar também em file://.
import fs from "node:fs";
import path from "node:path";
import { ROOT, mod, readExtra, EDICAO } from "./lib/doc.mjs";
import { mdToHtml } from "./lib/md.mjs";
import { BIBLIOTECA, BONUS, CATEGORIAS } from "./biblioteca.mjs";
import { PLANO_SEMANAS } from "./xlsx/planejamento.mjs";

const modulos = [];
for (let i = 1; i <= 12; i++) {
  const m = mod(String(i).padStart(2, "0"));
  modulos.push({
    id: m.id, numero: m.numero, titulo: m.titulo, subtitulo: m.subtitulo, nivel: m.nivel, descricao: m.descricao, objetivos: m.objetivos,
    guia: BIBLIOTECA.find((b) => b.modulos.length === 1 && b.modulos[0] === m.numero && /PDF$/.test(b.formato))?.id || null,
    aulas: m.aulas.map((a) => ({ id: a.id, codigo: a.codigo, titulo: a.titulo, minutos: a.minutos, html: a.html, texto: a.md.replace(/[#*>|`\[\]()-]/g, " ").replace(/\s+/g, " ").slice(0, 4000) })),
  });
}
const biblioteca = BIBLIOTECA.map((b) => {
  const abs = path.join(ROOT, b.arquivo);
  const existe = fs.existsSync(abs);
  return { ...b, href: "../" + b.arquivo, tamanho: existe ? fs.statSync(abs).size : 0, existe };
});
const faltando = biblioteca.filter((b) => !b.existe);
if (faltando.length) { console.error("Arquivos ausentes:", faltando.map((f) => f.arquivo)); process.exitCode = 1; }

const dados = {
  edicao: EDICAO,
  modulos,
  biblioteca,
  bonus: BONUS,
  categorias: CATEGORIAS,
  plano: PLANO_SEMANAS.map((s, i) => ({ semana: i + 1, fase: s.fase, tarefas: s.tarefas.map((t, k) => ({ id: `w${i + 1}-t${k + 1}`, texto: t[0], ferramenta: t[1] })) })),
  faq: mdToHtml(readExtra("faq.md"), { idPrefix: "faq-" }).html,
  apresentacao: mdToHtml(readExtra("apresentacao.md"), { idPrefix: "ap-" }).html,
  cambio: { gsPorReal: 1076, gsPorDolar: 5781, data: "28–29/10/2026" },
};
const out = path.join(ROOT, "plataforma/data/dados.js");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, "/* Gerado por scripts/produto/build-plataforma.mjs — não editar à mão. */\nwindow.MP_DADOS = " + JSON.stringify(dados) + ";\n");
console.log(`✓ plataforma/data/dados.js — ${modulos.length} módulos, ${modulos.reduce((s, m) => s + m.aulas.length, 0)} aulas, ${biblioteca.length} arquivos na biblioteca (${Math.round(fs.statSync(out).size / 1024)} KB)`);
