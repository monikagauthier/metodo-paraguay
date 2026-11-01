// Gera todas as planilhas e verifica: fórmulas sem erro e valores-chave esperados.
import { calculadoraCustoDeVida, comparadorBrasilParaguai, simuladorDeMudanca, comparadorDeRemessas } from "./xlsx/financeiras.mjs";
import { controleFinanceiro, analisadorDeInvestimentos, viabilidadeEmpresarial } from "./xlsx/gestao.mjs";
import { planner90, matrizCidade, organizadorDocumental, mapaDeDecisao } from "./xlsx/planejamento.mjs";
import { isErr } from "./lib/formula.mjs";
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./xlsx/common.mjs";

const builders = [calculadoraCustoDeVida, comparadorBrasilParaguai, simuladorDeMudanca, controleFinanceiro, comparadorDeRemessas, analisadorDeInvestimentos, viabilidadeEmpresarial, planner90, matrizCidade, organizadorDocumental, mapaDeDecisao];
const report = [];
let fail = 0;
for (const b of builders) {
  const { path: p, values } = b();
  const errs = [...values].filter(([, v]) => isErr(v));
  const size = fs.statSync(p).size;
  report.push({ arquivo: path.relative(ROOT, p), formulas: values.size, erros: errs.map(([k, v]) => `${k}=${v.code}`), tamanhoKB: Math.round(size / 1024) });
  console.log(`${errs.length ? "✗" : "✓"} ${path.relative(ROOT, p)} — ${values.size} fórmulas, ${errs.length} com erro, ${Math.round(size / 1024)} KB`);
  if (errs.length) { fail++; console.log("   ", errs.slice(0, 8).map(([k, v]) => `${k}=${v.code}`).join("  ")); }
  // valores-chave para conferência manual
  const pick = (k) => values.get(k);
  const keys = {
    "19-calculadora-de-custo-de-vida.xlsx": ["Orçamento!B18", "Orçamento!B20", "Orçamento!E20", "Orçamento!B23", "Cenários!B16", "Cenários!C16", "Cenários!D16", "Pesquisa de preços!H6"],
    "20-comparador-brasil-x-paraguai.xlsx": ["Comparação!B18", "Comparação!D18", "Comparação!E18", "Comparação!G18", "Comparação!G8"],
    "21-simulador-de-mudanca.xlsx": ["Resultado!B6", "Resultado!B7", "Resultado!B10", "Resultado!B12", "Resultado!B13", "Resultado!B17", "Resultado!B25", "Resultado!B27", "Projeção!E24"],
    "22-controle-financeiro-internacional.xlsx": ["Resumo mensal!B16", "Resumo mensal!C16", "Resumo mensal!E16", "Resumo mensal!C17", "Indicadores!B7", "Indicadores!B8", "Indicadores!C8", "Indicadores!B10", "Metas profissionais!F8"],
    "23-comparador-de-remessas.xlsx": ["Comparador!G10", "Comparador!I10", "Comparador!J10", "Comparador!G11", "Comparador!J11", "Comparador!J12", "Comparador!K11"],
    "24-analisador-de-investimentos.xlsx": ["Análise!C25", "Análise!D25", "Análise!E25", "Análise!C26", "Matriz de riscos!B24", "Matriz de riscos!D24", "Matriz de riscos!F24", "Diligência!B19", "Painel!B11", "Painel!C11", "Painel!D11"],
    "25-planilha-de-viabilidade-empresarial.xlsx": ["Premissas!B23", "Premissas!B25", "Resultado!B6", "Resultado!B7", "Resultado!B8", "Resultado!B10", "Resultado!B11", "Resultado!B12", "Resultado!B13"],
    "26-planner-de-90-dias.xlsx": ["Configuração!B9", "Painel!B5", "Painel!B6", "Painel!B8", "Painel!B9", "Painel!D12", "Tarefas!B58"],
    "29-matriz-de-escolha-de-cidade.xlsx": ["Matriz!C20", "Matriz!D20", "Matriz!E20", "Matriz!B21", "Matriz!C22", "Matriz!D22", "Matriz!B24", "Matriz!B25", "Matriz!B26", "Matriz!C33", "Matriz!D33", "Matriz!B35", "Matriz!B36"],
    "bonus-01-organizador-documental.xlsx": ["Documentos!G6", "Documentos!H6", "Documentos!K6", "Documentos!K7", "Documentos!K8", "Documentos!K9", "Resumo!B5", "Resumo!B6", "Resumo!B10"],
    "bonus-04-mapa-de-decisao.xlsx": ["Prontidão!D28", "Painel!B6", "Painel!B7", "Painel!B8", "Painel!B9", "Painel!B10"],
  }[path.basename(p)] || [];
  for (const k of keys) console.log(`      ${k} = ${JSON.stringify(pick(k))}`);
}
fs.writeFileSync(path.join(ROOT, "scripts/produto/_relatorio-xlsx.json"), JSON.stringify(report, null, 2));
if (fail) process.exitCode = 1;
