// Planilhas 22 (Controle Financeiro Internacional), 24 (Analisador de Investimentos)
// e 25 (Planilha de Viabilidade Empresarial).
import { novo, cabecalho, instrucoes, salvar, CAMBIO } from "./common.mjs";

const d = (y, m, dd) => new Date(y, m - 1, dd);
const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// ---------------------------------------------------------------- 22
export function controleFinanceiro() {
  const wb = novo("Controle Financeiro Internacional", "Renda, despesas e remessas em reais, guaranis e dólares, com resumo mensal e indicadores.");
  instrucoes(wb, "Controle Financeiro Internacional", "Registre renda, despesas, remessas e reserva em duas moedas e acompanhe os indicadores de saúde financeira.", [
    "Na aba Parâmetros, informe o ano de controle, o câmbio de referência e o saldo atual da reserva.",
    "Na aba Lançamentos, registre cada movimento: data, tipo (Renda, Despesa, Custo de remessa), categoria, país, moeda, valor e a cotação usada no dia (Gs. por unidade da moeda). Para lançamentos em guaranis, a cotação é 1.",
    "As colunas J e K convertem automaticamente cada lançamento para guaranis e para reais.",
    "A aba Resumo mensal soma renda, despesas e custos de remessa por mês e calcula o resultado e a taxa de poupança.",
    "A aba Indicadores mostra meses de reserva, peso da moradia e custo médio de remessas.",
    "A aba Metas profissionais acompanha candidaturas, contatos, entrevistas e propostas por semana (Aula 9.9).",
  ], ["Os lançamentos que vêm preenchidos são EXEMPLOS (marcados como EXEMPLO na descrição). Apague-os antes de começar."]);
  const p = wb.sheet("Parâmetros", { cols: [44, 20, 50], grid: false, tab: "FF101A17" });
  cabecalho(p, "Parâmetros", "Preencha os campos amarelos.", "C");
  p.row("A5", ["Ano de controle", 2026, ""], ["rot", "inInt", "nota"]); p.whole("B5", 2020, 2100);
  p.row("A6", ["Câmbio de referência (Gs. por R$)", CAMBIO.gsPorReal, "Usado para converter Gs. em R$ nos totais"], ["rot", "inDec", "nota"]); p.decimal("B6", 1, 100000);
  p.row("A7", ["Saldo atual da reserva (R$)", 60000, "Atualize mensalmente"], ["rot", "inBrl", "nota"]); p.decimal("B7", 0);
  p.row("A8", ["Meta de meses de reserva", 6, ""], ["rot", "inInt", "nota"]); p.whole("B8", 0, 60);

  const l = wb.sheet("Lançamentos", { cols: [12, 16, 22, 34, 11, 8, 15, 14, 2, 18, 16], freeze: "A6", grid: false, tab: "FFB8995C" });
  cabecalho(l, "Lançamentos", "Um movimento por linha. Para guaranis, use cotação 1. Para reais, Gs. por real; para dólares, Gs. por dólar.", "K");
  l.row("A5", ["Data", "Tipo", "Categoria", "Descrição", "País", "Moeda", "Valor", "Cotação (Gs. por unidade)", "", "Valor em Gs.", "Valor em R$"], "cab"); l.height(5, 30);
  const ex = [
    [d(2026, 11, 5), "Renda", "Salário / pró-labore", "EXEMPLO — salário remoto", "Brasil", "R$", 9000, 1076],
    [d(2026, 11, 6), "Custo de remessa", "Tarifas e IOF", "EXEMPLO — IOF e tarifa da remessa", "Brasil", "R$", 330, 1076],
    [d(2026, 11, 6), "Despesa", "Moradia", "EXEMPLO — aluguel", "Paraguai", "Gs.", 4500000, 1],
    [d(2026, 11, 8), "Despesa", "Alimentação", "EXEMPLO — supermercado", "Paraguai", "Gs.", 1450000, 1],
    [d(2026, 11, 10), "Despesa", "Serviços (energia, água, internet)", "EXEMPLO — ANDE + internet", "Paraguai", "Gs.", 420000, 1],
    [d(2026, 11, 12), "Despesa", "Saúde", "EXEMPLO — plano de saúde", "Paraguai", "Gs.", 1400000, 1],
    [d(2026, 11, 15), "Despesa", "Transporte", "EXEMPLO — aplicativos", "Paraguai", "Gs.", 650000, 1],
    [d(2026, 11, 20), "Despesa", "Compromissos no Brasil", "EXEMPLO — contador no Brasil", "Brasil", "R$", 400, 1076],
    [d(2026, 12, 5), "Renda", "Salário / pró-labore", "EXEMPLO — salário remoto", "Brasil", "R$", 9000, 1080],
    [d(2026, 12, 6), "Despesa", "Moradia", "EXEMPLO — aluguel", "Paraguai", "Gs.", 4500000, 1],
    [d(2026, 12, 9), "Despesa", "Alimentação", "EXEMPLO — supermercado", "Paraguai", "Gs.", 1700000, 1],
  ];
  const N = 300;
  for (let i = 0; i < N; i++) {
    const r = 6 + i; const e = ex[i] || [null, "", "", "", "", "", null, null];
    l.row(`A${r}`, [e[0], e[1], e[2], e[3], e[4], e[5], e[6], e[7], "",
      { f: `=IF(OR(G${r}="",H${r}=""),"",G${r}*H${r})` },
      { f: `=IF(J${r}="","",J${r}/'Parâmetros'!$B$6)` }], ["inData", "inTxt", "inTxt", "inTxt", "inTxt", "inTxt", "inDec", "inDec", "default", "cGs", "cBrl"]);
  }
  const end = 5 + N;
  l.list(`B6:B${end}`, ["Renda", "Despesa", "Custo de remessa"]);
  l.list(`C6:C${end}`, ["Salário / pró-labore", "Serviços prestados", "Aposentadoria", "Aluguel recebido", "Outras rendas", "Moradia", "Alimentação", "Serviços (energia, água, internet)", "Transporte", "Saúde", "Educação", "Lazer", "Compromissos no Brasil", "Documentos e trâmites", "Tarifas e IOF", "Outros"]);
  l.list(`E6:E${end}`, ["Brasil", "Paraguai", "Outro"]); l.list(`F6:F${end}`, ["R$", "Gs.", "USD"]);
  l.date(`A6:A${end}`); l.decimal(`G6:H${end}`, 0);
  // coluna auxiliar de mês (oculta visualmente estreita)
  for (let i = 0; i < N; i++) { const r = 6 + i; l.set(`I${r}`, { f: `=IF(A${r}="","",IF(YEAR(A${r})='Parâmetros'!$B$5,MONTH(A${r}),""))` }, "default"); }

  const rs = wb.sheet("Resumo mensal", { cols: [10, 18, 18, 18, 18, 14, 18], freeze: "A6", grid: false, tab: "FF3B5A4C" });
  cabecalho(rs, "Resumo mensal (R$)", "Somas automáticas por mês do ano de controle, convertidas pelo câmbio de referência.", "G");
  rs.row("A5", ["Mês", "Renda", "Despesas", "Custos de remessa", "Resultado", "Taxa de poupança", "Moradia"], "cab");
  const L = (c) => `'Lançamentos'!$${c}$6:$${c}$${end}`;
  MESES.forEach((m, i) => {
    const r = 6 + i, mm = i + 1;
    rs.row(`A${r}`, [m,
      { f: `=SUMIFS(${L("K")},${L("I")},${mm},${L("B")},"Renda")` },
      { f: `=SUMIFS(${L("K")},${L("I")},${mm},${L("B")},"Despesa")` },
      { f: `=SUMIFS(${L("K")},${L("I")},${mm},${L("B")},"Custo de remessa")` },
      { f: `=B${r}-C${r}-D${r}` },
      { f: `=IF(B${r}=0,"",E${r}/B${r})` },
      { f: `=SUMIFS(${L("K")},${L("I")},${mm},${L("C")},"Moradia")` }], ["rotB", "cBrl", "cBrl", "cBrl", "cBrl", "cPct", "cBrl"]);
  });
  rs.row("A18", ["Ano", { f: "=SUM(B6:B17)" }, { f: "=SUM(C6:C17)" }, { f: "=SUM(D6:D17)" }, { f: "=SUM(E6:E17)" }, { f: '=IF(B18=0,"",E18/B18)' }, { f: "=SUM(G6:G17)" }], ["rotB", "tBrl", "tBrl", "tBrl", "tBrl", "tPct", "tBrl"]);
  rs.condFill("E6:E17", "E6<0", "FFF6D3CC");
  rs.chart({ type: "col", title: "Renda x despesas por mês (R$)", cats: "A6:A17", series: [{ name: "Renda", vals: "B6:B17" }, { name: "Despesas", vals: "C6:C17" }], from: [8, 4], to: [17, 22] });

  const ind = wb.sheet("Indicadores", { cols: [48, 20, 52], grid: false, tab: "FF7A8B83" });
  cabecalho(ind, "Indicadores", "Indicadores de saúde financeira (Aula 6.10).", "C");
  ind.row("A5", ["Indicador", "Valor", "Leitura"], "cab");
  ind.row("A6", ["Meses com lançamentos de despesa", { f: "=COUNTIF('Resumo mensal'!C6:C17,\">0\")" }, ""], ["rot", "cInt", "nota"]);
  ind.row("A7", ["Despesa média mensal (R$)", { f: "=IF(B6=0,0,'Resumo mensal'!C18/B6)" }, "Média dos meses com despesa"], ["rot", "cBrl", "nota"]);
  ind.row("A8", ["Meses de reserva", { f: "=IF(B7=0,0,'Parâmetros'!B7/B7)" }, { f: `=IF(B7=0,"Sem despesas lançadas",IF(B8<'Parâmetros'!B8,"Abaixo da meta: defina valor de reposição mensal","Dentro da meta"))` }], ["rot", "tDec", "cTxt"]);
  ind.row("A9", ["Taxa de poupança do ano", { f: "='Resumo mensal'!F18" }, "Positiva = renda maior que gastos"], ["rot", "tPct", "nota"]);
  ind.row("A10", ["Peso da moradia nas despesas", { f: "=IF('Resumo mensal'!C18=0,0,'Resumo mensal'!G18/'Resumo mensal'!C18)" }, { f: '=IF(B10>0.35,"Acima de 35%: reavalie (referência didática)","Até 35%")' }], ["rot", "tPct", "cTxt"]);
  ind.row("A11", ["Custo de remessa sobre a renda", { f: "=IF('Resumo mensal'!B18=0,0,'Resumo mensal'!D18/'Resumo mensal'!B18)" }, "Compare opções no Comparador de Remessas"], ["rot", "tPct", "nota"]);
  ind.condFill("C8", 'LEFT(C8,6)="Abaixo"', "FFFBE3C8");

  const mt = wb.sheet("Metas profissionais", { cols: [10, 14, 14, 14, 14, 14, 14, 14, 36], freeze: "A7", grid: false, tab: "FF263D33" });
  cabecalho(mt, "Metas profissionais", "Acompanhe a busca de trabalho ou de clientes por semana (Aulas 9.9 e 9.10).", "I");
  mt.row("A5", ["Metas semanais", 10, 5, 1, "", "", "", "", ""], ["rotB", "inInt", "inInt", "inInt", "default", "default", "default", "default", "default"]);
  mt.row("A6", ["Semana", "Candidaturas", "Contatos novos", "Entrevistas", "Propostas", "% meta candid.", "% meta contatos", "% meta entrevistas", "Observações"], "cab"); mt.height(6, 30);
  const exm = [[1, 8, 4, 0, 0, "EXEMPLO"], [2, 11, 6, 1, 0, "EXEMPLO"], [3, 10, 5, 2, 1, "EXEMPLO"]];
  for (let w = 1; w <= 26; w++) {
    const r = 6 + w; const e = exm[w - 1] || [w, null, null, null, null, ""];
    mt.row(`A${r}`, [w, e[1], e[2], e[3], e[4], { f: `=IF(B${r}="","",B${r}/$B$5)` }, { f: `=IF(C${r}="","",C${r}/$C$5)` }, { f: `=IF(D${r}="","",D${r}/$D$5)` }, e[5]], ["cInt", "inInt", "inInt", "inInt", "inInt", "cPct", "cPct", "cPct", "inTxt"]);
  }
  mt.whole("B7:E32", 0, 1000);
  mt.row("A34", ["Total", { f: "=SUM(B7:B32)" }, { f: "=SUM(C7:C32)" }, { f: "=SUM(D7:D32)" }, { f: "=SUM(E7:E32)" }], ["rotB", "tInt", "tInt", "tInt", "tInt"]);
  return salvar(wb, "22-controle-financeiro-internacional.xlsx");
}

// ---------------------------------------------------------------- 24
export function analisadorDeInvestimentos() {
  const wb = novo("Analisador de Investimentos", "Retorno líquido, real e na moeda de referência; matriz de riscos; diligência e painel de decisão.");
  instrucoes(wb, "Analisador de Investimentos", "Compare até 4 oportunidades pelo retorno líquido e real, na sua moeda de referência, com matriz de riscos e checklist de diligência.", [
    "Na aba Análise, preencha os dados de cada oportunidade (colunas C a F): valor, retorno bruto anual esperado, prazo, custos, imposto sobre o ganho, inflação da moeda do ativo e variação cambial esperada.",
    "A planilha calcula valor final, ganho líquido, retorno líquido anual, retorno real e retorno na sua moeda de referência (Aula 7.6).",
    "Na aba Matriz de riscos, dê probabilidade (1 a 5) e impacto (1 a 5) para cada risco. A pontuação é probabilidade × impacto.",
    "Na aba Diligência, marque Sim ou Não em cada item do checklist (Aula 7.9).",
    "O Painel resume tudo e sugere uma classificação: aceitar com acompanhamento, mitigar antes, recusar ou reduzir a exposição.",
  ], ["Ferramenta educativa. Não recomenda ativos e não garante retorno. Retornos esperados são hipóteses suas.", "Os exemplos preenchidos são ILUSTRATIVOS e não representam produtos reais."]);
  const a = wb.sheet("Análise", { cols: [46, 4, 20, 20, 20, 20], freeze: "C6", grid: false, tab: "FF101A17" });
  cabecalho(a, "Análise de retorno", "Oportunidades de EXEMPLO, ilustrativas. Valores na moeda de cada ativo.", "F");
  a.row("A5", ["Item", "", "Oportunidade 1", "Oportunidade 2", "Oportunidade 3", "Oportunidade 4"], "cab");
  const inputs = [
    ["Nome", "inTxt", ["CDA em guaranis (exemplo)", "Imóvel para aluguel (exemplo)", "Fundo com resgate em 5 anos (exemplo)", ""]],
    ["Moeda do ativo", "inTxt", ["PYG", "USD", "USD", ""]],
    ["Valor investido", "inDec", [50000000, 130000, 20000, null]],
    ["Retorno bruto anual esperado", "inPct", [0.08, 0.046, 0.12, null]],
    ["Prazo (anos)", "inDec", [1, 5, 5, null]],
    ["Custos iniciais (% do valor)", "inPct", [0, 0.04, 0.01, null]],
    ["Custos anuais (% do valor)", "inPct", [0, 0, 0.015, null]],
    ["Imposto sobre o ganho (% — confirme com contador)", "inPct", [0.08, 0.1, 0.08, null]],
    ["Inflação anual esperada da moeda do ativo", "inPct", [0.03, 0.025, 0.025, null]],
    ["Variação cambial anual esperada (moeda do ativo x sua referência)", "inPct", [0, 0, 0, null]],
    ["Liquidez (1 = muito baixa, 5 = imediata)", "inInt", [3, 1, 1, null]],
    ["Ofertante supervisionado (BCP / Superintendencia de Valores)?", "inTxt", ["Sim", "Não se aplica", "Sim", ""]],
  ];
  inputs.forEach((it, i) => { const r = 6 + i; a.set(`A${r}`, it[0], "rot"); ["C", "D", "E", "F"].forEach((c, k) => a.set(`${c}${r}`, it[2][k], it[1])); });
  a.list("C17:F17", ["Sim", "Não", "Não se aplica"]); a.whole("C16:F16", 1, 5); a.decimal("C8:F8", 0); a.decimal("C10:F10", 0, 100);
  a.set("A19", "Resultados", "secao"); a.merge("A19:F19");
  const calc = [
    ["Valor final bruto", (c) => `=IF(${c}8="","",${c}8*(1+${c}9)^${c}10)`, "cDec"],
    ["Custos totais", (c) => `=IF(${c}8="","",${c}8*${c}11+${c}8*${c}12*${c}10)`, "cDec"],
    ["Ganho antes de impostos", (c) => `=IF(${c}8="","",${c}20-${c}8-${c}21)`, "cDec"],
    ["Imposto estimado", (c) => `=IF(${c}8="","",MAX(0,${c}22)*${c}13)`, "cDec"],
    ["Ganho líquido", (c) => `=IF(${c}8="","",${c}22-${c}23)`, "tDec"],
    ["Retorno líquido anual", (c) => `=IF(${c}8="","",(1+${c}24/${c}8)^(1/${c}10)-1)`, "tPct"],
    ["Retorno real anual (descontada a inflação)", (c) => `=IF(${c}8="","",(1+${c}25)/(1+${c}14)-1)`, "cPct"],
    ["Retorno anual na moeda de referência", (c) => `=IF(${c}8="","",(1+${c}25)*(1+${c}15)-1)`, "tPct"],
  ];
  calc.forEach((it, i) => { const r = 20 + i; a.set(`A${r}`, it[0], "rot"); ["C", "D", "E", "F"].forEach((c) => a.set(`${c}${r}`, { f: it[1](c) }, it[2])); });
  a.chart({ type: "col", title: "Retorno líquido anual x real", cats: "C6:E6", series: [{ name: "Líquido", vals: "C25:E25" }, { name: "Real", vals: "C26:E26" }], from: [7, 4], to: [14, 22] });

  const m = wb.sheet("Matriz de riscos", { cols: [36, 11, 11, 11, 11, 11, 11, 11, 11], freeze: "B7", grid: false, tab: "FFB8995C" });
  cabecalho(m, "Matriz de riscos", "Probabilidade (P) e impacto (I) de 1 a 5. Pontuação = P × I. 1–6 baixo · 7–14 médio · 15–25 alto (Aula 7.9).", "I");
  m.row("A5", ["", "Oport. 1", "", "Oport. 2", "", "Oport. 3", "", "Oport. 4", ""], "cab");
  m.merge("B5:C5"); m.merge("D5:E5"); m.merge("F5:G5"); m.merge("H5:I5");
  m.row("A6", ["Risco", "P", "I", "P", "I", "P", "I", "P", "I"], "cab");
  const riscos = ["Crédito (o emissor não pagar)", "Mercado (preço cair)", "Câmbio", "Liquidez (não conseguir vender)", "Jurídico / documental", "Operacional / gestão", "Concentração (peso no patrimônio)"];
  const exR = [[2, 3, 2, 2, 1, 2, 2, 2, 1, 2, 1, 2, 2, 3], [1, 2, 3, 3, 2, 3, 4, 4, 3, 4, 2, 3, 4, 4], [3, 4, 3, 3, 2, 3, 4, 4, 2, 3, 3, 3, 2, 3]];
  riscos.forEach((rk, i) => {
    const r = 7 + i; m.set(`A${r}`, rk, "rot");
    ["B", "D", "F", "H"].forEach((c, k) => {
      const ex = exR[k]; const nc = String.fromCharCode(c.charCodeAt(0) + 1);
      m.set(`${c}${r}`, ex ? ex[i * 2] : null, "inInt"); m.set(`${nc}${r}`, ex ? ex[i * 2 + 1] : null, "inInt");
    });
  });
  m.whole("B7:I13", 1, 5);
  m.set("A15", "Pontuação por risco (P × I)", "secao"); m.merge("A15:I15");
  m.row("A16", ["Risco", "Oport. 1", "", "Oport. 2", "", "Oport. 3", "", "Oport. 4", ""], "cab");
  riscos.forEach((rk, i) => {
    const r = 17 + i, src = 7 + i; m.set(`A${r}`, rk, "rot");
    [["B", "C"], ["D", "E"], ["F", "G"], ["H", "I"]].forEach(([p, q]) => { m.set(`${p}${r}`, { f: `=IF(OR(${p}${src}="",${q}${src}=""),"",${p}${src}*${q}${src})` }, "cInt"); m.merge(`${p}${r}:${q}${r}`); });
  });
  m.row("A24", ["Maior pontuação", { f: "=MAX(B17:B23)" }, "", { f: "=MAX(D17:D23)" }, "", { f: "=MAX(F17:F23)" }, "", { f: "=MAX(H17:H23)" }, ""], ["rotB", "tInt", "tInt", "tInt", "tInt", "tInt", "tInt", "tInt", "tInt"]);
  ["B24:C24", "D24:E24", "F24:G24", "H24:I24"].forEach((x) => m.merge(x));
  m.condFill("B17:I23", "B17>=15", "FFF6D3CC"); m.condFill("B17:I23", "AND(B17>=7,B17<15)", "FFFBE3C8");

  const dl = wb.sheet("Diligência", { cols: [64, 12, 12, 12, 12], freeze: "B6", grid: false, tab: "FF3B5A4C" });
  cabecalho(dl, "Checklist de diligência antes de investir", "Responda Sim ou Não para cada oportunidade (Aulas 7.9 e 7.10).", "E");
  dl.row("A5", ["Item", "Oport. 1", "Oport. 2", "Oport. 3", "Oport. 4"], "cab");
  const itens = ["Consigo explicar o investimento em duas frases", "O ofertante consta da lista oficial de supervisionados (BCP / SV)", "Li o contrato, o regulamento ou o prospecto inteiro", "Conheço todos os custos (entrada, manutenção, saída)", "Confirmei a tributação com contador", "Sei como e quando posso resgatar ou vender", "Simulei o cenário pessimista", "O valor cabe na minha escada de liquidez (Aula 7.7)", "Ouvi um profissional independente, sem comissão sobre a venda", "Não há promessa de retorno garantido nem pressa", "O pagamento vai para conta da instituição, não para pessoa física", "Pesquisei o nome da empresa e dos responsáveis"];
  const exD = [["Sim", "Sim", "Sim", "Sim", "Sim", "Sim", "Sim", "Sim", "Não", "Sim", "Sim", "Sim"], ["Sim", "Não", "Sim", "Não", "Não", "Sim", "Sim", "Não", "Não", "Sim", "Sim", "Sim"], ["Não", "Sim", "Não", "Sim", "Não", "Sim", "Não", "Não", "Não", "Não", "Sim", "Não"]];
  itens.forEach((it, i) => { const r = 6 + i; dl.set(`A${r}`, it, "rot"); ["B", "C", "D", "E"].forEach((c, k) => dl.set(`${c}${r}`, exD[k] ? exD[k][i] : null, "inTxt")); });
  dl.list("B6:E17", ["Sim", "Não"]);
  dl.row("A19", ["Itens atendidos (%)", ...["B", "C", "D", "E"].map((c) => ({ f: `=IF(COUNTA(${c}6:${c}17)=0,"",COUNTIF(${c}6:${c}17,"Sim")/12)` }))], ["rotB", "tPct", "tPct", "tPct", "tPct"]);
  dl.condFill("B6:E17", 'B6="Não"', "FFF6D3CC");

  const pn = wb.sheet("Painel", { cols: [40, 24, 24, 24, 24], grid: false, tab: "FF263D33" });
  cabecalho(pn, "Painel de decisão", "Resumo automático. A decisão final é sua e deve considerar orientação profissional.", "E");
  pn.row("A5", ["", { f: "='Análise'!C6" }, { f: "='Análise'!D6" }, { f: "='Análise'!E6" }, { f: "='Análise'!F6" }], ["cab", "cab", "cab", "cab", "cab"]); pn.height(5, 32);
  const cols = ["C", "D", "E", "F"], mcols = ["B", "D", "F", "H"], dcols = ["B", "C", "D", "E"];
  pn.row("A6", ["Retorno líquido anual", ...cols.map((c) => ({ f: `='Análise'!${c}25` }))], ["rot", "cPct", "cPct", "cPct", "cPct"]);
  pn.row("A7", ["Retorno na moeda de referência", ...cols.map((c) => ({ f: `='Análise'!${c}27` }))], ["rot", "cPct", "cPct", "cPct", "cPct"]);
  pn.row("A8", ["Liquidez (1 a 5)", ...cols.map((c) => ({ f: `=IF('Análise'!${c}16="","",'Análise'!${c}16)` }))], ["rot", "cInt", "cInt", "cInt", "cInt"]);
  pn.row("A9", ["Maior risco (P × I)", ...mcols.map((c) => ({ f: `='Matriz de riscos'!${c}24` }))], ["rot", "cInt", "cInt", "cInt", "cInt"]);
  pn.row("A10", ["Diligência atendida", ...dcols.map((c) => ({ f: `='Diligência'!${c}19` }))], ["rot", "cPct", "cPct", "cPct", "cPct"]);
  pn.row("A11", ["Classificação sugerida", ...cols.map((c, k) => ({ f: `=IF('Análise'!${c}8="","",IF('Análise'!${c}17="Não","Recusar: ofertante não supervisionado",IF(${dcols[k + 1] ? "" : ""}${["B", "C", "D", "E"][k]}9>=15,"Alto risco: recusar ou reduzir muito a exposição",IF(${["B", "C", "D", "E"][k]}10<0.75,"Completar a diligência antes de decidir",IF(${["B", "C", "D", "E"][k]}9>=7,"Risco médio: mitigar antes de investir","Risco baixo: aceitar com acompanhamento")))))` }))], ["rotB", "tTxt", "tTxt", "tTxt", "tTxt"]);
  pn.height(11, 44);
  pn.condFill("B11:E11", 'LEFT(B11,5)="Risco"', "FFFBE3C8"); pn.condFill("B11:E11", 'OR(LEFT(B11,4)="Alto",LEFT(B11,7)="Recusar")', "FFF6D3CC");
  pn.set("A13", "Critérios: maior risco 15+ = alto; 7 a 14 = médio; diligência abaixo de 75% = completar antes. Critérios didáticos das Aulas 7.9 e 7.10.", "nota"); pn.merge("A13:E13"); pn.height(13, 30);
  return salvar(wb, "24-analisador-de-investimentos.xlsx");
}

// ---------------------------------------------------------------- 25
export function viabilidadeEmpresarial() {
  const wb = novo("Planilha de Viabilidade Empresarial", "Projeção de 12 meses, ponto de equilíbrio, folha com IPS e payback.");
  instrucoes(wb, "Planilha de Viabilidade Empresarial", "Teste a viabilidade de um negócio com projeção de 12 meses, ponto de equilíbrio, custo de pessoal e prazo de retorno.", [
    "Na aba Premissas, preencha investimento inicial, preço médio, custo variável, vendas do primeiro mês, crescimento, impostos sobre vendas, custos fixos e equipe.",
    "O custo de cada empregado inclui salário, IPS patronal (16,5% no regime geral) e provisão de aguinaldo (1/12 do salário). Confirme com contador e com as calculadoras do MTESS.",
    "A aba Projeção calcula receita, margem, custos, resultado antes do IRE, IRE estimado (10%) e resultado acumulado por 12 meses.",
    "A aba Resultado mostra ponto de equilíbrio em receita e em unidades, margem de contribuição e o mês em que o investimento é recuperado (se acontecer em 12 meses).",
    "Compare o ponto de equilíbrio com o resultado do seu teste de mercado (Aula 8.10).",
  ], ["O IRE mensal aqui é uma aproximação didática (10% sobre resultado positivo). A apuração real é anual e depende do regime. Consulte contador.", "Os valores preenchidos são EXEMPLO ilustrativo (quiosque de café)."]);
  const p = wb.sheet("Premissas", { cols: [50, 20, 46], grid: false, tab: "FF101A17" });
  cabecalho(p, "Premissas", "EXEMPLO ilustrativo: quiosque de café em Assunção. Substitua pelos seus números.", "C");
  const P = [
    ["Investimento inicial (Gs.)", 85000000, "inGs", "Equipamentos, reforma, estoque inicial, constituição"],
    ["Preço médio de venda (Gs.)", 22000, "inGs", "Ticket médio"],
    ["Custo variável por venda (Gs.)", 8800, "inGs", "Insumos, embalagem, taxa de cartão"],
    ["Vendas no mês 1 (unidades)", 3200, "inInt", "Base: teste de mercado"],
    ["Crescimento mensal das vendas", 0.05, "inPct", ""],
    ["Impostos e taxas sobre a receita (%)", 0.02, "inPct", "Ajuste com o contador; o IVA tem regras próprias"],
    ["Aluguel do ponto (Gs./mês)", 6500000, "inGs", ""],
    ["Contador e sistemas (Gs./mês)", 2200000, "inGs", ""],
    ["Energia, água, internet (Gs./mês)", 1800000, "inGs", ""],
    ["Marketing (Gs./mês)", 1500000, "inGs", ""],
    ["Outros custos fixos (Gs./mês)", 1000000, "inGs", ""],
    ["Número de empregados", 2, "inInt", ""],
    ["Salário bruto por empregado (Gs.)", 3044000, "inGs", "Salário mínimo desde 01/07/2026: Gs. 3.044.000"],
    ["IPS patronal", 0.165, "inPct", "Regime geral"],
    ["Provisão de aguinaldo (fração do salário)", 1 / 12, "inPct", "Aproximação didática"],
    ["Pró-labore / retirada do empreendedor (Gs./mês)", 4000000, "inGs", ""],
    ["Alíquota do IRE", 0.1, "inPct", "Regimes Simple e General (DNIT)"],
  ];
  P.forEach((v, i) => p.row(`A${5 + i}`, [v[0], v[1], v[3]], ["rot", v[2], "nota"]));
  p.decimal("B5:B11", 0); p.decimal("B12:B15", 0); p.whole("B16", 0, 1000); p.decimal("B17", 0); p.decimal("B18:B19", 0, 1); p.decimal("B20", 0); p.decimal("B21", 0, 1);
  p.row("A23", ["Custo mensal por empregado (Gs.)", { f: "=B17*(1+B18+B19)" }, "Salário + IPS patronal + aguinaldo"], ["rotB", "tGs", "nota"]);
  p.row("A24", ["Folha mensal total (Gs.)", { f: "=B23*B16" }, ""], ["rotB", "tGs", "nota"]);
  p.row("A25", ["Custos fixos mensais totais (Gs.)", { f: "=SUM(B11:B15)+B24+B20" }, "Inclui folha e pró-labore"], ["rotB", "tGs", "nota"]);
  // B11..B15 são aluguel até outros: ajuste de índice
  p.cells.get("B25").f = "SUM(B11:B15)+B24+B20";

  const pr = wb.sheet("Projeção", { cols: [8, 13, 17, 17, 17, 17, 17, 17, 17, 17, 12], freeze: "B6", grid: false, tab: "FFB8995C" });
  cabecalho(pr, "Projeção de 12 meses (Gs.)", "Calculada a partir das Premissas.", "J");
  pr.row("A5", ["Mês", "Vendas (un.)", "Receita", "Custos variáveis", "Impostos s/ receita", "Margem de contribuição", "Custos fixos", "Resultado antes do IRE", "IRE estimado", "Resultado acumulado", "Mês recuperado"], "cab"); pr.height(5, 32);
  const Q = (k) => `'Premissas'!$B$${k}`;
  for (let mth = 1; mth <= 12; mth++) {
    const r = 5 + mth;
    pr.row(`A${r}`, [mth,
      { f: mth === 1 ? `=${Q(8)}` : `=ROUND(B${r - 1}*(1+${Q(9)}),0)` },
      { f: `=B${r}*${Q(6)}` }, { f: `=B${r}*${Q(7)}` }, { f: `=C${r}*${Q(10)}` }, { f: `=C${r}-D${r}-E${r}` }, { f: `='Premissas'!$B$25` }, { f: `=F${r}-G${r}` }, { f: `=MAX(0,H${r})*${Q(21)}` },
      { f: mth === 1 ? `=-${Q(5)}+H${r}-I${r}` : `=J${r - 1}+H${r}-I${r}` }, { f: `=IF(J${r}>=0,A${r},"")` }], ["cInt", "cInt", "cGs", "cGs", "cGs", "cGs", "cGs", "cGs", "cGs", "tGs", "cInt"]);
  }
  pr.row("A18", ["Total", { f: "=SUM(B6:B17)" }, { f: "=SUM(C6:C17)" }, { f: "=SUM(D6:D17)" }, { f: "=SUM(E6:E17)" }, { f: "=SUM(F6:F17)" }, { f: "=SUM(G6:G17)" }, { f: "=SUM(H6:H17)" }, { f: "=SUM(I6:I17)" }, ""], ["rotB", "tInt", "tGs", "tGs", "tGs", "tGs", "tGs", "tGs", "tGs", "rot"]);
  pr.condFill("H6:H17", "H6<0", "FFF6D3CC"); pr.condFill("J6:J17", "J6>=0", "FFDDEFD9");
  pr.chart({ type: "col", title: "Receita x custos totais por mês (Gs.)", cats: "A6:A17", series: [{ name: "Receita", vals: "C6:C17" }, { name: "Custos fixos", vals: "G6:G17" }], from: [0, 19], to: [9, 38] });

  const rs = wb.sheet("Resultado", { cols: [52, 22, 46], grid: false, tab: "FF3B5A4C" });
  cabecalho(rs, "Resultado", "Indicadores de viabilidade.", "C");
  rs.row("A5", ["Indicador", "Valor", "Leitura"], "cab");
  rs.row("A6", ["Margem de contribuição (%)", { f: `=IFERROR((${Q(6)}-${Q(7)}-${Q(6)}*${Q(10)})/${Q(6)},0)` }, "(preço − custo variável − impostos) ÷ preço"], ["rot", "tPct", "nota"]);
  rs.row("A7", ["Ponto de equilíbrio — receita mensal (Gs.)", { f: "=IFERROR('Premissas'!B25/B6,0)" }, "Custos fixos ÷ margem de contribuição"], ["rot", "tGs", "nota"]);
  rs.row("A8", ["Ponto de equilíbrio — unidades por mês", { f: `=IFERROR(ROUNDUP(B7/${Q(6)},0),0)` }, ""], ["rot", "tInt", "nota"]);
  rs.row("A9", ["Vendas previstas no mês 1 (un.)", { f: `=${Q(8)}` }, ""], ["rot", "cInt", "nota"]);
  rs.row("A10", ["Cobertura do equilíbrio no mês 1", { f: "=IFERROR(B9/B8,0)" }, "Acima de 100% = já cobre os custos no mês 1"], ["rot", "tPct", "nota"]);
  rs.row("A11", ["Resultado acumulado em 12 meses (após investimento)", { f: "='Projeção'!J17" }, "Positivo = investimento recuperado em 12 meses"], ["rot", "tGs", "nota"]);
  rs.row("A12", ["Mês de recuperação do investimento", { f: `=IF(COUNT('Projeção'!K6:K17)=0,"Não recupera em 12 meses",MIN('Projeção'!K6:K17))` }, "Primeiro mês com acumulado ≥ 0"], ["rot", "tTxt", "nota"]);
  rs.row("A13", ["Diagnóstico", { f: '=IF(B10<0.8,"Vendas iniciais bem abaixo do equilíbrio: revise preço, custos ou valide mais",IF(B11<0,"Viável no operacional, mas sem retorno do investimento em 12 meses","Indicadores favoráveis: confirme premissas com teste real"))' }, ""], ["rotB", "tTxt", "nota"]);
  rs.merge("B13:C13"); rs.height(13, 32);
  return salvar(wb, "25-planilha-de-viabilidade-empresarial.xlsx");
}
