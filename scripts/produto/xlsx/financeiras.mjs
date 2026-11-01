// Planilhas 19 (Calculadora de Custo de Vida), 20 (Comparador Brasil x Paraguai),
// 21 (Simulador de Mudança) e 23 (Comparador de Remessas).
import { novo, cabecalho, instrucoes, salvar, CAMBIO, CIDADES, ETIQUETAS } from "./common.mjs";

// ---------------------------------------------------------------- 19
export function calculadoraCustoDeVida() {
  const wb = novo("Calculadora de Custo de Vida", "Custo mensal em guaranis e reais, anual, reserva e cenários.");
  instrucoes(wb, "Calculadora de Custo de Vida", "Estime o custo mensal de morar no Paraguai em guaranis e em reais, o custo anual, a reserva recomendada e compare cenários.", [
    "Abra a aba Parâmetros: escolha a cidade, o número de moradores, digite o câmbio do dia, os meses de reserva e a margem de imprevistos.",
    "Na aba Orçamento, digite o valor mensal de cada categoria em guaranis (coluna B). Para compromissos que continuam no Brasil, digite em reais na coluna E da linha indicada.",
    "Para cada valor, escolha a etiqueta (Pesquisado, Oficial, Estimado ou Ilustrativo) e anote a fonte e a data na coluna D.",
    "Os totais em guaranis e reais, o custo anual, o custo por morador e a reserva recomendada são calculados automaticamente.",
    "Na aba Cenários, compare o seu orçamento com três cenários de referência (econômico, intermediário e confortável) do Módulo 4. Os cenários podem ser editados.",
    "Use a aba Pesquisa de preços para registrar anúncios e preços com data, cidade e fonte; a planilha converte tudo para guaranis.",
  ], ["Os cenários de referência são para uma pessoa em Assunção e usam valores ILUSTRATIVOS, exceto as referências de aluguel e internet citadas nas Aulas 4.2 e 4.4."]);

  const p = wb.sheet("Parâmetros", { cols: [44, 22, 60], grid: false, tab: "FF101A17" });
  cabecalho(p, "Parâmetros", "Preencha os campos amarelos. Eles alimentam todas as outras abas.", "C");
  p.row("A5", ["Cidade", "Assunção", "Escolha da lista"], ["rot", "inTxt", "nota"]); p.list("B5", CIDADES);
  p.row("A6", ["Número de moradores", 1, "De 1 a 10"], ["rot", "inInt", "nota"]); p.whole("B6", 1, 10);
  p.row("A7", ["Guaranis por 1 real (Gs./R$)", CAMBIO.gsPorReal, `Exemplo: referência de ${CAMBIO.data}. Atualize.`], ["rot", "inDec", "nota"]); p.decimal("B7", 1, 100000);
  p.row("A8", ["Guaranis por 1 dólar (Gs./US$)", CAMBIO.gsPorDolar, "Fonte: BCP — cotização referencial"], ["rot", "inDec", "nota"]); p.decimal("B8", 1, 100000);
  p.row("A9", ["Data da cotação", CAMBIO.data, "Anote quando atualizar"], ["rot", "inTxt", "nota"]);
  p.row("A10", ["Meses de reserva desejados", 6, "Aula 2.7: em geral 6 ou mais"], ["rot", "inInt", "nota"]); p.whole("B10", 0, 36);
  p.row("A11", ["Margem de imprevistos", 0.1, "Aula 2.2: 10% a 20% conforme a confiança nos valores"], ["rot", "inPct", "nota"]); p.decimal("B11", 0, 1);

  const o = wb.sheet("Orçamento", { cols: [40, 20, 15, 38, 18, 11], freeze: "A6", grid: false, tab: "FFB8995C" });
  cabecalho(o, "Orçamento mensal", "Valores de EXEMPLO (cenário intermediário de uma pessoa em Assunção). Substitua pelos seus.", "F");
  o.row("A5", ["Categoria", "Valor mensal (Gs.)", "Etiqueta", "Fonte e data", "Equivalente (R$)", "% do total"], "cab"); o.height(5, 30);
  const cats = [
    ["Moradia (aluguel + expensas)", 3900000, "Pesquisado", "Anúncio Villa Morra, 31/10/2026"],
    ["Energia, água e gás", 300000, "Ilustrativo", ""],
    ["Internet e celular", 250000, "Pesquisado", "Claro, fibra 400 Mbps, 01/11/2026 + celular"],
    ["Alimentação (supermercado)", 1800000, "Ilustrativo", ""],
    ["Refeições fora e delivery", 600000, "Ilustrativo", ""],
    ["Transporte", 800000, "Ilustrativo", ""],
    ["Saúde (plano e farmácia)", 700000, "Ilustrativo", ""],
    ["Educação", 0, "Ilustrativo", ""],
    ["Lazer", 400000, "Ilustrativo", ""],
    ["Outros gastos", 200000, "Ilustrativo", ""],
  ];
  cats.forEach((c, i) => {
    const r = 6 + i;
    o.row(`A${r}`, [c[0], c[1], c[2], c[3], { f: `=IFERROR(B${r}/Parâmetros!$B$7,0)` }, { f: `=IFERROR(B${r}/$B$18,0)` }], ["rot", "inGs", "inTxt", "inTxt", "cBrl", "cPct"]);
  });
  o.row("A16", ["Compromissos que continuam no Brasil (digite em R$ na coluna E)", { f: "=E16*Parâmetros!$B$7" }, "Estimado", "Ex.: contador, seguro, financiamento", 400, { f: "=IFERROR(B16/$B$18,0)" }], ["rot", "cGs", "inTxt", "inTxt", "inBrl", "cPct"]);
  o.list("C6:C16", ETIQUETAS); o.decimal("B6:B15", 0); o.decimal("E16", 0);
  // Corrigir referências de parâmetros com aspas
  for (const [ref, cell] of o.cells) if (cell.f) cell.f = cell.f.replace(/Parâmetros!/g, "'Parâmetros'!");
  o.row("A18", ["Subtotal mensal", { f: "=SUM(B6:B16)" }, "", "", { f: "=IFERROR(B18/'Parâmetros'!$B$7,0)" }, ""], ["rotB", "tGs", "rot", "rot", "tBrl", "rot"]);
  o.row("A19", ["Margem de imprevistos", { f: "=B18*'Parâmetros'!$B$11" }, "", "", { f: "=IFERROR(B19/'Parâmetros'!$B$7,0)" }, ""], ["rot", "cGs", "rot", "rot", "cBrl", "rot"]);
  o.row("A20", ["CUSTO MENSAL TOTAL", { f: "=B18+B19" }, "", "", { f: "=IFERROR(B20/'Parâmetros'!$B$7,0)" }, ""], ["rotB", "tGs", "rot", "rot", "tBrl", "rot"]);
  o.row("A21", ["Custo anual", { f: "=B20*12" }, "", "", { f: "=E20*12" }, ""], ["rot", "cGs", "rot", "rot", "cBrl", "rot"]);
  o.row("A22", ["Custo mensal por morador", { f: "=IFERROR(B20/'Parâmetros'!$B$6,0)" }, "", "", { f: "=IFERROR(E20/'Parâmetros'!$B$6,0)" }, ""], ["rot", "cGs", "rot", "rot", "cBrl", "rot"]);
  o.row("A23", [{ f: `="Reserva recomendada ("&'Parâmetros'!$B$10&" meses)"` }, { f: "=B20*'Parâmetros'!$B$10" }, "", "", { f: "=E20*'Parâmetros'!$B$10" }, ""], ["rotB", "tGs", "rot", "rot", "tBrl", "rot"]);
  o.row("A25", ["Itens com etiqueta Estimado ou Ilustrativo", { f: '=COUNTIF(C6:C16,"Estimado")+COUNTIF(C6:C16,"Ilustrativo")' }, { f: '=IF(B25/11>0.5,"Use margem de 20% ou mais",IF(B25/11>0.25,"Use margem de pelo menos 15%","Margem de 10% é razoável"))' }], ["rot", "cInt", "cTxt"]);
  o.merge("C25:F25");
  o.set("A27", "Cidade:", "rotB"); o.set("B27", { f: "='Parâmetros'!B5" }, "cTxt");
  o.chart({ type: "pie", title: "Distribuição do custo mensal", cats: "A6:A16", series: [{ name: "Gs.", vals: "B6:B16" }], from: [7, 4], to: [14, 24] });

  const s = wb.sheet("Cenários", { cols: [36, 18, 18, 18, 18], grid: false, tab: "FF3B5A4C" });
  cabecalho(s, "Comparação de cenários", "Cenários de referência para 1 pessoa em Assunção (Módulo 4, valores ilustrativos) e o seu orçamento.", "E");
  s.row("A5", ["Categoria", "Econômico", "Intermediário", "Confortável", "Meu orçamento"], "cab");
  const cen = [[2300000, 3900000, 6000000], [200000, 300000, 500000], [200000, 250000, 350000], [1500000, 1800000, 2500000], [300000, 600000, 1200000], [400000, 800000, 1500000], [500000, 700000, 1000000], [0, 0, 0], [300000, 600000, 1200000]];
  const nomes = ["Moradia", "Energia, água e gás", "Internet e celular", "Supermercado", "Refeições fora", "Transporte", "Saúde", "Educação", "Lazer e outros"];
  const map = ["B6", "B7", "B8", "B9", "B10", "B11", "B12", "B13", "B14+Orçamento!B15+Orçamento!B16"];
  nomes.forEach((n, i) => {
    const r = 6 + i;
    s.row(`A${r}`, [n, cen[i][0], cen[i][1], cen[i][2], { f: `=Orçamento!${map[i]}` }], ["rot", "inGs", "inGs", "inGs", "cGs"]);
  });
  s.row("A15", ["Total mensal (Gs.)", { f: "=SUM(B6:B14)" }, { f: "=SUM(C6:C14)" }, { f: "=SUM(D6:D14)" }, { f: "=SUM(E6:E14)" }], ["rotB", "tGs", "tGs", "tGs", "tGs"]);
  s.row("A16", ["Total mensal (R$)", { f: "=B15/'Parâmetros'!$B$7" }, { f: "=C15/'Parâmetros'!$B$7" }, { f: "=D15/'Parâmetros'!$B$7" }, { f: "=E15/'Parâmetros'!$B$7" }], ["rotB", "tBrl", "tBrl", "tBrl", "tBrl"]);
  s.row("A17", ["Custo anual (R$)", { f: "=B16*12" }, { f: "=C16*12" }, { f: "=D16*12" }, { f: "=E16*12" }], ["rot", "cBrl", "cBrl", "cBrl", "cBrl"]);
  s.row("A18", ["Reserva recomendada (R$)", { f: "=B16*'Parâmetros'!$B$10" }, { f: "=C16*'Parâmetros'!$B$10" }, { f: "=D16*'Parâmetros'!$B$10" }, { f: "=E16*'Parâmetros'!$B$10" }], ["rot", "cBrl", "cBrl", "cBrl", "cBrl"]);
  s.set("A19", "Obs.: 'Meu orçamento' não inclui a margem de imprevistos, para comparação direta com os cenários.", "nota"); s.merge("A19:E19");
  for (const [, cell] of s.cells) if (cell.f) cell.f = cell.f.replace(/(^|[^'])Orçamento!/g, "$1'Orçamento'!");
  s.decimal("B6:D14", 0);
  s.chart({ type: "col", title: "Custo mensal por cenário (R$)", cats: "B5:E5", series: [{ name: "R$ por mês", vals: "B16:E16" }], from: [6, 4], to: [13, 20] });

  const pq = wb.sheet("Pesquisa de preços", { cols: [12, 16, 18, 30, 16, 9, 40, 18], freeze: "A6", grid: false, tab: "FF7A8B83" });
  cabecalho(pq, "Pesquisa de preços", "Registre cada preço com data, cidade e fonte. A coluna H converte para guaranis.", "H");
  pq.row("A5", ["Data", "Cidade", "Bairro", "Item", "Valor", "Moeda", "Fonte / link", "Valor em Gs."], "cab");
  const ex = [["31/10/2026", "Assunção", "Villa Morra", "Apto 1 dorm. ~40 m² (+ IVA)", 600, "USD", "RE/MAX Paraguay (portal)"], ["31/10/2026", "Assunção", "Villa Morra", "Apto 1 dorm. ~44 m²", 3900000, "Gs.", "RE/MAX Paraguay (portal)"], ["31/10/2026", "Assunção", "Villa Morra", "Apto 2 dorm. ~82 m²", 5500000, "Gs.", "RE/MAX Paraguay (portal)"], ["01/11/2026", "Assunção", "—", "Internet fibra 400 Mbps (sem promoção)", 150000, "Gs.", "claro.com.py"]];
  for (let i = 0; i < 40; i++) {
    const r = 6 + i; const e = ex[i] || ["", "", "", "", "", "", ""];
    pq.row(`A${r}`, [e[0], e[1], e[2], e[3], e[4] === "" ? null : e[4], e[5], e[6], { f: `=IF(E${r}="","",IF(F${r}="USD",E${r}*'Parâmetros'!$B$8,IF(F${r}="R$",E${r}*'Parâmetros'!$B$7,E${r})))` }], ["inTxt", "inTxt", "inTxt", "inTxt", "inDec", "inTxt", "inTxt", "cGs"]);
  }
  pq.list("F6:F45", ["Gs.", "USD", "R$"]); pq.list("B6:B45", CIDADES); pq.decimal("E6:E45", 0);
  return salvar(wb, "19-calculadora-de-custo-de-vida.xlsx");
}

// ---------------------------------------------------------------- 20
export function comparadorBrasilParaguai() {
  const wb = novo("Comparador Brasil x Paraguai", "Compara o custo atual no Brasil com o estimado no Paraguai por categoria.");
  instrucoes(wb, "Comparador Brasil x Paraguai", "Compare, categoria por categoria, quanto você gasta hoje no Brasil e quanto estima gastar no Paraguai.", [
    "Na aba Comparação, digite o câmbio do dia (Gs. por real) na célula B5.",
    "Na coluna B, digite o seu gasto mensal atual no Brasil, em reais, por categoria.",
    "Na coluna C, digite o gasto estimado no Paraguai, em guaranis (use a Calculadora de Custo de Vida).",
    "A planilha converte o valor paraguaio para reais e mostra a diferença em reais e em percentual.",
    "A coluna G indica se a categoria fica mais barata, mais cara ou equivalente (diferença de até 5%).",
    "O gráfico compara as duas colunas em reais.",
  ], ["Diferenças grandes em uma categoria podem indicar erro de pesquisa. Revise antes de concluir (Aula 4.10)."]);
  const ws = wb.sheet("Comparação", { cols: [34, 18, 20, 18, 18, 13, 24], freeze: "A8", grid: false, tab: "FF101A17" });
  cabecalho(ws, "Brasil x Paraguai", "Valores de EXEMPLO: Brasil = gasto ilustrativo de uma pessoa em capital brasileira; Paraguai = cenário intermediário (Módulo 4).", "G");
  ws.row("A5", ["Guaranis por 1 real", CAMBIO.gsPorReal, `Referência ${CAMBIO.data}`], ["rotB", "inDec", "nota"]); ws.decimal("B5", 1, 100000);
  ws.row("A7", ["Categoria", "Brasil hoje (R$)", "Paraguai estimado (Gs.)", "Paraguai em R$", "Diferença (R$)", "Diferença %", "Resultado"], "cab"); ws.height(7, 30);
  const d = [["Moradia", 3200, 3900000], ["Energia, água e gás", 450, 300000], ["Internet e celular", 220, 250000], ["Supermercado", 1500, 1800000], ["Refeições fora", 700, 600000], ["Transporte", 900, 800000], ["Saúde", 750, 700000], ["Educação", 0, 0], ["Lazer", 500, 400000], ["Outros", 300, 200000]];
  d.forEach((c, i) => {
    const r = 8 + i;
    ws.row(`A${r}`, [c[0], c[1], c[2], { f: `=IFERROR(C${r}/$B$5,0)` }, { f: `=D${r}-B${r}` }, { f: `=IF(B${r}=0,"",E${r}/B${r})` }, { f: `=IF(AND(B${r}=0,C${r}=0),"—",IF(B${r}=0,"Novo custo",IF(ABS(E${r})<=0.05*B${r},"Equivalente",IF(E${r}<0,"Mais barato no Paraguai","Mais caro no Paraguai"))))` }], ["inTxt", "inBrl", "inGs", "cBrl", "cBrl", "cPct", "cTxt"]);
  });
  ws.decimal("B8:C17", 0);
  ws.row("A18", ["TOTAL", { f: "=SUM(B8:B17)" }, { f: "=SUM(C8:C17)" }, { f: "=SUM(D8:D17)" }, { f: "=D18-B18" }, { f: '=IF(B18=0,"",E18/B18)' }, { f: '=IF(E18<0,"Paraguai mais barato no total","Paraguai mais caro no total")' }], ["rotB", "tBrl", "tGs", "tBrl", "tBrl", "tPct", "tTxt"]);
  ws.condFill("G8:G18", 'ISNUMBER(SEARCH("barato",G8))', "FFDDEFD9");
  ws.condFill("G8:G18", 'ISNUMBER(SEARCH("caro",G8))', "FFF6D3CC");
  ws.chart({ type: "col", title: "Gasto mensal por categoria (R$)", cats: "A8:A17", series: [{ name: "Brasil", vals: "B8:B17" }, { name: "Paraguai", vals: "D8:D17" }], from: [0, 19], to: [7, 38] });
  return salvar(wb, "20-comparador-brasil-x-paraguai.xlsx");
}

// ---------------------------------------------------------------- 21
export function simuladorDeMudanca() {
  const wb = novo("Simulador de Mudança", "Custo inicial, saldo projetado, meses de reserva, necessidade de capital e indicadores de atenção.");
  instrucoes(wb, "Simulador de Mudança", "Calcule quanto a mudança custa, quanto de reserva você precisa e se o plano resiste a um cenário ruim.", [
    "Na aba Entradas, preencha reserva disponível, renda mensal garantida, despesa mensal estimada, meses de transição e de segurança, e a renda nova esperada.",
    "Na aba Custos únicos, digite em reais cada custo da mudança (documentos, transporte, moradia, extraordinários) e a etiqueta de cada valor.",
    "A aba Resultado mostra o custo inicial com margem, o saldo após a chegada, os meses de reserva, a reserva necessária e a necessidade adicional de capital.",
    "Os indicadores de atenção ficam vermelhos quando um limite é ultrapassado (critérios didáticos das Aulas 2.7 e 12.4).",
    "O teste de estresse refaz as contas com o real mais fraco, custos maiores e atraso da renda nova (ajuste os percentuais na aba Entradas).",
    "A aba Projeção mostra o saldo da reserva mês a mês por 18 meses.",
  ], ["A fórmula da reserva necessária é: custos únicos + (despesa − renda garantida) × meses de transição + meses de segurança × despesa (Aula 2.7)."]);

  const e = wb.sheet("Entradas", { cols: [52, 20, 56], grid: false, tab: "FF101A17" });
  cabecalho(e, "Entradas", "Valores de EXEMPLO: casal Ana e Bruno (caso hipotético do curso). Substitua pelos seus.", "C");
  const ent = [
    ["Reserva disponível hoje (R$)", 90000, "inBrl", "Dinheiro que pode ser usado na mudança"],
    ["Renda mensal garantida após a mudança (R$)", 9000, "inBrl", "Renda que já existe e continua (remoto, aposentadoria, aluguel)"],
    ["Despesa mensal estimada no Paraguai (R$)", 12500, "inBrl", "Use a Calculadora de Custo de Vida"],
    ["Meses de transição (até a renda nova começar)", 6, "inInt", "Zero se não houver renda nova prevista"],
    ["Renda nova esperada após a transição (R$/mês)", 5000, "inBrl", "Emprego ou clientes novos; zero se não houver"],
    ["Meses de segurança desejados", 6, "inInt", "Colchão adicional (Aula 2.7)"],
    ["Margem de imprevistos sobre custos únicos", 0.15, "inPct", "10% a 20% (Aula 2.2)"],
    ["Teste de estresse: desvalorização do real", 0.1, "inPct", "Aumenta a despesa em reais"],
    ["Teste de estresse: aumento dos custos únicos", 0.2, "inPct", ""],
    ["Teste de estresse: atraso da renda nova (meses)", 3, "inInt", ""],
  ];
  ent.forEach((v, i) => { const r = 5 + i; e.row(`A${r}`, [v[0], v[1], v[3]], ["rot", v[2], "nota"]); });
  e.decimal("B5:B7", 0); e.whole("B8", 0, 60); e.decimal("B9", 0); e.whole("B10", 0, 60); e.decimal("B11:B13", 0, 1); e.whole("B14", 0, 36);

  const c = wb.sheet("Custos únicos", { cols: [44, 18, 15, 40], freeze: "A6", grid: false, tab: "FFB8995C" });
  cabecalho(c, "Custos únicos da mudança", "Digite em reais. Valores de EXEMPLO ilustrativos; confira taxas oficiais na DNM e emolumentos no cartório.", "D");
  c.row("A5", ["Item", "Valor (R$)", "Etiqueta", "Fonte / observação"], "cab");
  const itens = [
    ["DOCUMENTOS", null], ["Certidões no Brasil", 300, "Estimado", "Cartório"], ["Apostilas (por documento × quantidade)", 550, "Estimado", "5 documentos × R$ 110 (ilustrativo)"], ["Traduções", 900, "Estimado", "Cotação"], ["Taxas migratórias (DNM) e cédula", 1200, "Estimado", "Conferir tabela oficial vigente"],
    ["TRANSPORTE", null], ["Passagens ou combustível e pedágios", 2400, "Estimado", ""], ["Bagagem extra / transporte de bens", 1500, "Estimado", ""],
    ["MORADIA INICIAL", null], ["Hospedagem temporária (2 a 4 semanas)", 2600, "Estimado", ""], ["Depósito / garantia do aluguel", 4200, "Estimado", "1 mês de Gs. 4.500.000 (ilustrativo)"], ["Primeiro aluguel adiantado", 4200, "Estimado", ""], ["Comissão imobiliária", 0, "Estimado", "Perguntar quem paga"], ["Móveis, eletrodomésticos e utensílios", 5500, "Estimado", ""],
    ["OUTROS", null], ["Chip, internet e instalação", 400, "Estimado", ""], ["Plano de saúde / seguro dos primeiros meses", 1500, "Estimado", ""], ["Multas e encerramento de contratos no Brasil", 800, "Estimado", ""], ["Gastos extraordinários", 1000, "Estimado", ""],
  ];
  let r = 6; const valRows = [];
  for (const it of itens) {
    if (it[1] === null) { c.set(`A${r}`, it[0], "rotB"); c.merge(`A${r}:D${r}`); r++; continue; }
    c.row(`A${r}`, [it[0], it[1], it[2], it[3]], ["rot", "inBrl", "inTxt", "inTxt"]); valRows.push(r); r++;
  }
  c.list(`C6:C${r - 1}`, ETIQUETAS); c.decimal(`B6:B${r - 1}`, 0);
  const last = r - 1;
  c.row(`A${r + 1}`, ["Subtotal", { f: `=SUM(B6:B${last})` }], ["rotB", "tBrl"]);
  c.row(`A${r + 2}`, ["Margem de imprevistos", { f: `=B${r + 1}*'Entradas'!B11` }], ["rot", "cBrl"]);
  c.row(`A${r + 3}`, ["CUSTO INICIAL ESTIMADO", { f: `=B${r + 1}+B${r + 2}` }], ["rotB", "tBrl"]);
  const custoRef = `'Custos únicos'!B${r + 3}`;

  const res = wb.sheet("Resultado", { cols: [52, 20, 50], grid: false, tab: "FF3B5A4C" });
  cabecalho(res, "Resultado", "Calculado automaticamente a partir das abas Entradas e Custos únicos.", "C");
  const E = (k) => `'Entradas'!B${k}`;
  res.row("A5", ["Indicador", "Valor", "Como ler"], "cab");
  const rows = [
    ["Custo inicial estimado (com margem)", `=${custoRef}`, "tBrl", "Soma dos custos únicos + margem"],
    ["Saldo da reserva após a chegada", `=${E(5)}-B6`, "cBrl", "Reserva disponível − custo inicial"],
    ["Diferença mensal (despesa − renda garantida)", `=MAX(0,${E(7)}-${E(6)})`, "cBrl", "Quanto sai da reserva por mês na transição"],
    ["Cobertura da despesa pela renda garantida", `=IFERROR(${E(6)}/${E(7)},0)`, "cPct", "100% = renda garantida paga toda a despesa"],
    ["Meses de despesa cobertos pelo saldo", `=IFERROR(B7/${E(7)},0)`, "cDec", "Saldo ÷ despesa mensal"],
    ["Meses até esgotar a reserva (só com a renda garantida)", `=IF(B8=0,999,IFERROR(B7/B8,0))`, "cDec", "999 = a renda garantida cobre a despesa"],
    ["Reserva necessária (fórmula da Aula 2.7)", `=B6+B8*${E(8)}+${E(10)}*${E(7)}`, "tBrl", "Custos + diferença × transição + segurança × despesa"],
    ["Necessidade adicional de capital", `=MAX(0,B12-${E(5)})`, "tBrl", "Quanto falta juntar"],
    ["Saldo após transição e com renda nova", `=B7-B8*${E(8)}`, "cBrl", "Saldo previsto ao fim dos meses de transição"],
  ];
  rows.forEach((v, i) => res.row(`A${6 + i}`, [v[0], { f: v[1] }, v[3]], ["rot", v[2], "nota"]));
  res.set("A16", "Indicadores de atenção", "secao"); res.merge("A16:C16");
  const ind = [
    ["Meses de despesa cobertos pelo saldo", '=IF(B10<3,"CRÍTICO: menos de 3 meses",IF(B10<6,"ATENÇÃO: menos de 6 meses","OK"))'],
    ["Necessidade adicional de capital", '=IF(B13>0,"ATENÇÃO: falta capital para a reserva desejada","OK")'],
    ["Cobertura da despesa pela renda", `=IF(B9>=1,"OK",IF(${E(8)}=0,"ATENÇÃO: renda não cobre a despesa e não há renda nova prevista","Depende da renda nova: acompanhe os gatilhos (Aula 9.10)"))`],
    ["Saldo ao fim da transição", '=IF(B14<0,"CRÍTICO: a reserva acaba antes do fim da transição","OK")'],
  ];
  ind.forEach((v, i) => { res.row(`A${17 + i}`, [v[0], { f: v[1] }], ["rot", "cTxt"]); res.merge(`B${17 + i}:C${17 + i}`); });
  res.condFill("B17:B20", 'LEFT(B17,2)="OK"', "FFDDEFD9");
  res.condFill("B17:B20", 'LEFT(B17,7)="ATENÇÃO"', "FFFBE3C8");
  res.condFill("B17:B20", 'LEFT(B17,7)="CRÍTICO"', "FFF6D3CC");
  res.condFill("B17:B20", 'LEFT(B17,7)="Depende"', "FFFBE3C8");
  res.set("A22", "Teste de estresse", "secao"); res.merge("A22:C22");
  const st = [
    ["Despesa mensal no estresse (real mais fraco)", `=${E(7)}/(1-${E(12)})`, "cBrl"],
    ["Custo inicial no estresse", `=B6*(1+${E(13)})`, "cBrl"],
    ["Reserva necessária no estresse", `=B24+MAX(0,B23-${E(6)})*(${E(8)}+${E(14)})+${E(10)}*B23`, "tBrl"],
    ["Necessidade adicional no estresse", `=MAX(0,B25-${E(5)})`, "tBrl"],
    ["Resultado do teste", '=IF(B26=0,"O plano resiste ao cenário de estresse","O plano NÃO resiste: ajuste data, cidade, padrão ou reserva")', "cTxt"],
  ];
  st.forEach((v, i) => res.row(`A${23 + i}`, [v[0], { f: v[1] }], ["rot", v[2]]));
  res.merge("B27:C27");
  res.condFill("B27", 'LEFT(B27,8)="O plano "', "FFDDEFD9");

  const pj = wb.sheet("Projeção", { cols: [10, 18, 18, 18, 18], freeze: "A6", grid: false, tab: "FF7A8B83" });
  cabecalho(pj, "Projeção da reserva (18 meses)", "Saldo mês a mês, considerando a renda nova a partir do fim da transição.", "E");
  pj.row("A5", ["Mês", "Renda (R$)", "Despesa (R$)", "Resultado do mês", "Saldo da reserva"], "cab");
  pj.row("A6", [0, "", "", "", { f: "='Resultado'!B7" }], ["cInt", "cBrl", "cBrl", "cBrl", "tBrl"]);
  for (let m = 1; m <= 18; m++) {
    const rr = 6 + m;
    pj.row(`A${rr}`, [m, { f: `=${E(6)}+IF(A${rr}>${E(8)},${E(9)},0)` }, { f: `=${E(7)}` }, { f: `=B${rr}-C${rr}` }, { f: `=E${rr - 1}+D${rr}` }], ["cInt", "cBrl", "cBrl", "cBrl", "tBrl"]);
  }
  pj.condFill("E6:E24", "E6<0", "FFF6D3CC");
  pj.chart({ type: "col", title: "Saldo da reserva por mês (R$)", cats: "A6:A24", series: [{ name: "Saldo", vals: "E6:E24" }], from: [6, 4], to: [15, 24] });
  return salvar(wb, "21-simulador-de-mudanca.xlsx");
}

// ---------------------------------------------------------------- 23
export function comparadorDeRemessas() {
  const wb = novo("Comparador de Remessas", "Custo total efetivo de formas de enviar dinheiro do Brasil ao Paraguai.");
  instrucoes(wb, "Comparador de Remessas", "Compare o custo total efetivo (tarifas + IOF + spread) de até 5 formas de enviar dinheiro do Brasil ao Paraguai.", [
    "Na aba Comparador, digite o valor que você tem disponível em reais (B5) e a cotação de referência do dia em guaranis por real (B6).",
    "Para cada opção (linhas 10 a 14), digite: nome, tarifa fixa de envio em R$, alíquota de IOF, cotação oferecida (Gs. por R$), tarifa de recebimento no Paraguai em Gs. e prazo.",
    "A planilha calcula quantos guaranis chegam, o spread implícito, o custo total em reais e em percentual, e destaca a opção mais barata.",
    "Premissa: tarifa e IOF saem do valor disponível; o restante é convertido pela cotação oferecida.",
    "Peça às instituições a cotação final e o valor exato que será creditado, para conferir.",
  ], ["IOF: na referência desta edição, remessa para conta própria no exterior de pessoa física = 3,5% e remessa classificada como investimento = 1,1% (imprensa especializada; confirme com a instituição). Use instituições autorizadas pelo Banco Central do Brasil."]);
  const ws = wb.sheet("Comparador", { cols: [30, 16, 11, 18, 18, 10, 18, 13, 16, 13, 22], freeze: "A10", grid: false, tab: "FF101A17" });
  cabecalho(ws, "Comparador de remessas", "Opções de EXEMPLO com tarifas e spreads ilustrativos. Substitua pelas cotações reais do dia.", "K");
  ws.row("A5", ["Valor disponível para enviar (R$)", 10000], ["rotB", "inBrl"]); ws.decimal("B5", 0);
  ws.row("A6", ["Cotação de referência (Gs. por R$)", CAMBIO.gsPorReal], ["rotB", "inDec"]); ws.decimal("B6", 1, 100000);
  ws.row("A7", ["Valor de referência em Gs. (sem custos)", { f: "=B5*B6" }], ["rot", "tGs"]);
  ws.row("A9", ["Opção", "Tarifa de envio (R$)", "IOF", "Cotação oferecida (Gs./R$)", "Tarifa de recebimento (Gs.)", "Prazo (dias)", "Guaranis recebidos", "Spread implícito", "Custo total (R$)", "Custo total %", "Resultado"], "cab"); ws.height(9, 42);
  const ops = [["Banco tradicional (exemplo)", 150, 0.035, 1033, 0, 3], ["Plataforma de remessa (exemplo)", 0, 0.035, 1063, 0, 1], ["Cartão de débito internacional (exemplo)", 0, 0.035, 1044, 25000, 0], ["", null, null, null, null, null], ["", null, null, null, null, null]];
  ops.forEach((o, i) => {
    const r = 10 + i;
    ws.row(`A${r}`, [o[0], o[1], o[2], o[3], o[4], o[5],
      { f: `=IF(D${r}="","",MAX(0,($B$5-B${r}-$B$5*C${r})*D${r}-E${r}))` },
      { f: `=IF(D${r}="","",1-D${r}/$B$6)` },
      { f: `=IF(D${r}="","",$B$5-G${r}/$B$6)` },
      { f: `=IF(D${r}="","",I${r}/$B$5)` },
      { f: `=IF(D${r}="","",IF(I${r}=MIN($I$10:$I$14),"Mais barata",""))` }], ["inTxt", "inBrl", "inPct", "inDec", "inGs", "inInt", "cGs", "cPct", "cBrl", "cPct", "cTxt"]);
  });
  ws.decimal("B10:B14", 0); ws.decimal("C10:C14", 0, 1); ws.decimal("D10:D14", 0); ws.decimal("E10:E14", 0);
  ws.condFill("K10:K14", 'K10="Mais barata"', "FFDDEFD9");
  ws.set("A16", "Leitura: o custo total em reais é a diferença entre o valor disponível e o valor em reais dos guaranis que efetivamente chegam, pela cotação de referência.", "nota"); ws.merge("A16:K16"); ws.height(16, 30);
  ws.chart({ type: "bar", title: "Custo total efetivo (%)", cats: "A10:A12", series: [{ name: "Custo %", vals: "J10:J12" }], from: [0, 17], to: [7, 34] });
  return salvar(wb, "23-comparador-de-remessas.xlsx");
}
