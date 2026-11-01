// Elementos comuns às planilhas do Método Paraguay.
import path from "node:path";
import fs from "node:fs";
import { Workbook } from "../lib/xlsx.mjs";

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../..");
export const OUT = path.join(ROOT, "entregaveis/planilhas");
export const CAMBIO = { gsPorReal: 1076, gsPorDolar: 5781, data: "28–29/10/2026", fonte: "BCP (via imprensa, 28/10/2026) e PTAX do BCB (29/10/2026); valor derivado" };
export const CIDADES = ["Assunção", "Luque", "San Lorenzo", "Lambaré", "Ciudad del Este", "Encarnación", "Outra"];
export const ETIQUETAS = ["Pesquisado", "Oficial", "Estimado", "Ilustrativo"];

export function novo(title, description) { return new Workbook({ title: `${title} — Método Paraguay`, description }); }

/** Cabeçalho de marca no topo de uma aba. */
export function cabecalho(ws, titulo, subtitulo, ultimaCol = "H") {
  ws.set("A1", "MÉTODO PARAGUAY  ·  INTELIGÊNCIA SEM FRONTEIRAS", "faixa");
  ws.merge(`A1:${ultimaCol}1`); ws.height(1, 20);
  ws.set("A2", titulo, "titulo"); ws.merge(`A2:${ultimaCol}2`); ws.height(2, 30);
  ws.set("A3", subtitulo, "subtitulo"); ws.merge(`A3:${ultimaCol}3`); ws.height(3, 32);
}

/** Aba de instruções padronizada. */
export function instrucoes(wb, titulo, objetivo, passos, observacoes = []) {
  const ws = wb.sheet("Instruções", { cols: [4, 100], grid: false, tab: "FFB8995C" });
  cabecalho(ws, titulo, objetivo, "B");
  let r = 5;
  ws.set(`A${r}`, "Como usar", "secao"); ws.merge(`A${r}:B${r}`); r++;
  passos.forEach((p, i) => { ws.set(`A${r}`, i + 1, "rotB"); ws.set(`B${r}`, p, "texto"); ws.height(r, p.length > 95 ? 32 : 18); r++; });
  r++;
  ws.set(`A${r}`, "Legenda de cores", "secao"); ws.merge(`A${r}:B${r}`); r++;
  ws.set(`A${r}`, "", "inTxt"); ws.set(`B${r}`, "Amarelo-claro: campo editável. Digite ou escolha da lista.", "texto"); r++;
  ws.set(`A${r}`, "", "cTxt"); ws.set(`B${r}`, "Bege: cálculo automático, protegido contra alteração acidental (proteção sem senha).", "texto"); r++;
  ws.set(`A${r}`, "", "tTxt"); ws.set(`B${r}`, "Marfim com texto verde: totais e indicadores.", "texto"); r++;
  r++;
  ws.set(`A${r}`, "Observações importantes", "secao"); ws.merge(`A${r}:B${r}`); r++;
  const obs = [
    "Os valores que vêm preenchidos são EXEMPLOS ILUSTRATIVOS, criados para mostrar o funcionamento. Substitua-os pelos seus dados antes de qualquer decisão.",
    `Câmbio de referência usado nos exemplos: Gs. ${CAMBIO.gsPorReal.toLocaleString("pt-BR")} por real e Gs. ${CAMBIO.gsPorDolar.toLocaleString("pt-BR")} por dólar (${CAMBIO.data}; ${CAMBIO.fonte}). Atualize com a cotação do dia em bcp.gov.py e bcb.gov.br.`,
    "Para remover a proteção (por exemplo, para acrescentar linhas): Excel > Revisão > Desproteger Planilha. Google Sheets: Dados > Proteger páginas e intervalos. Não há senha.",
    "Material educativo. Não substitui orientação de contador, advogado ou instituição financeira.",
    ...observacoes,
  ];
  obs.forEach((o) => { ws.set(`A${r}`, "•", "rot"); ws.set(`B${r}`, o, "texto"); ws.height(r, o.length > 95 ? 32 : 18); r++; });
  r++;
  ws.set(`A${r}`, "Edição 1.0 · Revisão de 01/11/2026", "nota"); ws.merge(`A${r}:B${r}`);
  return ws;
}

export function salvar(wb, nome, subdir) {
  const dir = subdir ? path.join(ROOT, "entregaveis", subdir) : OUT;
  fs.mkdirSync(dir, { recursive: true });
  const p = path.join(dir, nome);
  const values = wb.save(p);
  return { path: p, values };
}
