// Gera o inventário (INVENTARIO.md e distribuicao/inventario.csv) e o pacote ZIP final.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { BIBLIOTECA } from "./biblioteca.mjs";
import { ROOT } from "./lib/doc.mjs";
import { zipBuffer } from "./lib/zip.mjs";

const rel = (p) => path.relative(ROOT, p).split(path.sep).join("/");
const lerJson = (f) => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, "scripts/produto", f), "utf8")); } catch { return []; } };
const pdfs = lerJson("_relatorio-pdfs.json"), forms = lerJson("_relatorio-forms.json"), xlsx = lerJson("_relatorio-xlsx.json");
const plat = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, "scripts/produto/_relatorio-plataforma.json"), "utf8")); } catch { return null; } })();

// Validação estrutural dos pacotes OOXML
const ooxml = BIBLIOTECA.filter((b) => /XLSX|DOCX/.test(b.formato)).map((b) => b.arquivo);
let ooxmlOk = new Set();
try {
  const out = execFileSync("java", [path.join(ROOT, "scripts/tools/OoxmlCheck.java"), ...ooxml.map((f) => path.join(ROOT, f))], { encoding: "utf8" });
  out.split("\n").filter((l) => l.startsWith("OK")).forEach((l) => ooxmlOk.add(rel(l.split(/\s+/)[1])));
} catch (e) { String(e.stdout || "").split("\n").filter((l) => l.startsWith("OK")).forEach((l) => ooxmlOk.add(rel(l.split(/\s+/)[1]))); }

const tam = (b) => (b > 1048576 ? (b / 1048576).toFixed(2).replace(".", ",") + " MB" : Math.max(1, Math.round(b / 1024)) + " KB");
const linhas = BIBLIOTECA.map((b) => {
  const abs = path.join(ROOT, b.arquivo);
  const existe = fs.existsSync(abs);
  const size = existe ? fs.statSync(abs).size : 0;
  let validacao = "Não validado";
  const p = pdfs.find((x) => x.arquivo === b.arquivo);
  const f = forms.find((x) => x.arquivo === b.arquivo);
  const xl = xlsx.find((x) => x.arquivo === b.arquivo);
  if (p) validacao = p.erros.length === 0 && p.sumarioDivergente === 0 && p.temSumarioNavegavel ? `OK — ${p.paginas} p., ${p.links} links (${p.linksExternos} externos), sumário e marcadores navegáveis, fontes embutidas` : "Com ressalvas";
  else if (f) validacao = f.erros.length === 0 && f.campos === f.camposDetectados ? `OK — ${f.paginas} p., ${f.campos} campos preenchíveis` : "Com ressalvas";
  else if (xl) validacao = xl.erros.length === 0 && ooxmlOk.has(b.arquivo) ? `OK — ${xl.formulas} fórmulas sem erro; pacote OOXML íntegro` : "Com ressalvas";
  else if (b.formato === "DOCX") validacao = ooxmlOk.has(b.arquivo) ? "OK — pacote OOXML íntegro, XML bem-formado" : "Com ressalvas";
  return { ...b, existe, size, validacao };
});

const data = "01/11/2026";
const md = [`# Inventário de entregáveis — Método Paraguay`, ``, `Gerado automaticamente por \`scripts/produto/build-distribuicao.mjs\` em ${data}. Status de validação vem dos relatórios de build (\`scripts/produto/_relatorio-*.json\`).`, ``,
  `| Nº | Entregável | Caminho | Formato | Tamanho | Geração | Validação | Atualização | Fontes |`, `|---|---|---|---|---|---|---|---|---|`,
  ...linhas.map((l) => `| ${l.id} | ${l.nome} | \`${l.arquivo}\` | ${l.formato} | ${l.existe ? tam(l.size) : "—"} | ${l.existe ? "Gerado" : "AUSENTE"} | ${l.validacao} | ${data} | ${l.fontes || "Conteúdo dos módulos " + l.modulos.join(", ")} |`),
  ``, `## Outros componentes`, ``,
  `| Componente | Caminho | Status |`, `|---|---|---|`,
  `| Conteúdo-fonte das 115 aulas (Markdown editável) | \`conteudo/modulo-01..12/\` | Escrito |`,
  `| Extras do Manual Mestre (apresentação, casos, glossário, FAQ, plano, frases, perguntas ao contador) | \`conteudo/extras/\` | Escrito |`,
  `| Base de pesquisa e pendências | \`referencias/\` | Ver pendencias-verificacao.md |`,
  `| Área de membros | \`plataforma/\` | ${plat ? `${plat.total - plat.falhas}/${plat.total} verificações automatizadas aprovadas` : "Não testada"} |`,
  `| Pacote de distribuição | \`distribuicao/metodo-paraguay-v1.0.zip\` | Gerado |`, ``].join("\n");
fs.writeFileSync(path.join(ROOT, "INVENTARIO.md"), md);
const csvEsc = (s) => `"${String(s ?? "").replace(/"/g, '""')}"`;
fs.mkdirSync(path.join(ROOT, "distribuicao"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "distribuicao/inventario.csv"), "\ufeff" + ["id;nome;caminho;formato;tamanho_bytes;geracao;validacao;atualizacao;fontes", ...linhas.map((l) => [l.id, l.nome, l.arquivo, l.formato, l.size, l.existe ? "Gerado" : "AUSENTE", l.validacao, data, l.fontes || ""].map(csvEsc).join(";"))].join("\n"));

// ---------------- ZIP
const incluir = ["entregaveis", "plataforma", "assets/produto", "conteudo", "referencias"];
const entradas = [];
const raiz = "metodo-paraguay-v1.0/";
const walk = (d) => { for (const n of fs.readdirSync(d)) { const p = path.join(d, n); const st = fs.statSync(p); if (st.isDirectory()) walk(p); else entradas.push({ name: raiz + rel(p), data: fs.readFileSync(p), store: /\.(pdf|xlsx|docx|jpg|png|zip)$/i.test(n) }); } };
incluir.forEach((d) => walk(path.join(ROOT, d)));
for (const f of ["README-PRODUTO.md", "INVENTARIO.md", "RELATORIO-QUALIDADE.md"]) if (fs.existsSync(path.join(ROOT, f))) entradas.push({ name: raiz + f, data: fs.readFileSync(path.join(ROOT, f)) });
entradas.push({ name: raiz + "LEIA-ME.txt", data: `MÉTODO PARAGUAY — Pacote de entregáveis (Edição 1.0, revisão de 01/11/2026)\r\n\r\nComo começar:\r\n1. Abra plataforma/index.html no navegador (área de membros com aulas, biblioteca, ferramentas e plano).\r\n2. Ou vá direto à pasta entregaveis/: manuais, guias, checklists (PDF preenchível), planilhas (XLSX), modelos (DOCX/PDF) e bônus.\r\n3. Comece pelo Manual Mestre (entregaveis/manuais/01-manual-mestre-metodo-paraguay.pdf).\r\n\r\nPDFs preenchíveis: use o Adobe Acrobat Reader para preencher e salvar.\r\nPlanilhas: Excel ou Google Sheets. Campos amarelos são editáveis; fórmulas protegidas sem senha.\r\nConteúdo educativo: não substitui advogado, contador ou instituição financeira. Confira sempre as fontes oficiais.\r\n` });
const zipPath = path.join(ROOT, "distribuicao/metodo-paraguay-v1.0.zip");
fs.writeFileSync(zipPath, zipBuffer(entradas));
console.log(`✓ INVENTARIO.md (${linhas.length} entregáveis, ${linhas.filter((l) => !l.existe).length} ausentes)`);
console.log(`✓ ${rel(zipPath)} — ${entradas.length} arquivos, ${tam(fs.statSync(zipPath).size)}`);
