// Planilhas 26 (Planner de 90 Dias), 29 (Matriz de Escolha de Cidade),
// Bônus 01 (Organizador Documental) e Bônus 04 (Mapa de Decisão).
import { novo, cabecalho, instrucoes, salvar, CIDADES } from "./common.mjs";
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./common.mjs";

export const PLANO_SEMANAS = [
  { fase: "Entender e decidir", tarefas: [["Ler os Módulos 1 e 2", "Manual Mestre"], ["Fazer a autoavaliação de adaptação (cada adulto)", "Aula 1.7"], ["Preencher o diagnóstico", "Meu Plano Paraguay"], ["Listar compromissos que continuam no Brasil", "Meu Plano Paraguay"]] },
  { fase: "Entender e decidir", tarefas: [["Escrever objetivo com prazo e critérios de sucesso e de parada", "Aula 12.2"], ["Definir data-alvo de chegada", "Aula 2.1"], ["Dividir as 5 frentes entre os responsáveis", "Aula 2.1"], ["Decidir sobre viagem de teste", "Aula 2.1"]] },
  { fase: "Entender e decidir", tarefas: [["Pesquisar 2 a 4 cidades com o roteiro de 8 pontos", "Módulo 5"], ["Coletar pelo menos 10 anúncios por bairro, com data", "Calculadora (Pesquisa de preços)"], ["Preencher a Matriz de Escolha e a sensibilidade", "Matriz de Escolha de Cidade"], ["Registrar cidades finalistas e motivo", "Meu Plano Paraguay"]] },
  { fase: "Entender e decidir", tarefas: [["Montar orçamento mensal", "Calculadora de Custo de Vida"], ["Listar custos únicos com etiquetas", "Simulador de Mudança"], ["Calcular reserva necessária", "Simulador de Mudança"], ["Fazer teste de estresse e ajustar o plano", "Simulador de Mudança"]] },
  { fase: "Preparar", tarefas: [["Conferir RG, passaporte, CNH e CPF", "Checklist de Documentação"], ["Baixar a lista oficial do trâmite na DNM", "Aula 3.4"], ["Montar quadro documental por pessoa", "Organizador Documental"], ["Verificar regras de menores e animais, se houver", "Aula 2.5"]] },
  { fase: "Preparar", tarefas: [["Pedir certidões sem validade curta", "Organizador Documental"], ["Orçar apostilas e traduções", "Aula 3.5"], ["Avisar empregador ou clientes, se necessário", "Aula 9.5"], ["Pedir autorização formal para trabalho remoto do exterior", "Aula 9.5"]] },
  { fase: "Preparar", tarefas: [["Apostilar documentos recebidos", "Aula 3.5"], ["Avisar encerramento de contratos no Brasil", "Checklist de Mudança"], ["Classificar bens: levar, vender, guardar, doar", "Aula 2.6"], ["Fazer inventário dos bens que vão", "Checklist de Mudança"]] },
  { fase: "Preparar", tarefas: [["Reunião com contador no Brasil", "Checklist de Questões para o Contador"], ["Definir data da saída definitiva (se for o caso)", "Aula 10.6"], ["Levantar bens, direitos, dívidas e fontes pagadoras", "Aula 10.6"], ["Contato com contador no Paraguai", "Aula 10.10"]] },
  { fase: "Preparar", tarefas: [["Reservar hospedagem temporária", "Aula 4.2"], ["Contratar transporte de bens, se houver", "Aula 2.6"], ["Cotar 3 planos de saúde", "Aula 4.6"], ["Pesquisar escola, se houver filhos", "Aula 11.4"]] },
  { fase: "Executar", tarefas: [["Garantir dois meios de pagamento aceitos no Paraguai", "Aula 6.3"], ["Comparar 3 formas de remessa", "Comparador de Remessas"], ["Planejar reserva em mais de uma moeda", "Aula 6.6"], ["Configurar o Controle Financeiro", "Controle Financeiro Internacional"]] },
  { fase: "Executar", tarefas: [["Pedir certidões de validade curta (antecedentes)", "Aula 3.4"], ["Digitalizar todos os documentos com backup", "Aula 11.9"], ["Fazer a revisão do dossiê em 8 pontos", "Aula 3.10"], ["Separar originais e cópias por pessoa", "Checklist de Documentação"]] },
  { fase: "Executar", tarefas: [["Responder às 10 perguntas da revisão final", "Aula 2.8"], ["Ajustar orçamento e reserva", "Simulador de Mudança"], ["Confirmar plano de saúde ativo na chegada", "Aula 11.3"], ["Deixar cópia dos documentos com pessoa de confiança", "Aula 2.8"]] },
  { fase: "Executar", tarefas: [["Viajar e registrar a entrada no posto migratório", "Aula 3.1"], ["Chip, dinheiro e entorno (dias 2 a 4)", "Aula 11.1"], ["Organizar documentos e verificar agendamento na DNM", "Aula 11.1"], ["Revisar a primeira semana e o plano do mês", "Aula 11.2"]] },
];

// ---------------------------------------------------------------- 26
export function planner90() {
  const wb = novo("Planner de 90 Dias", "13 semanas de tarefas com datas, responsáveis, status e painel de progresso.");
  instrucoes(wb, "Planner de 90 Dias", "Organize a mudança em 13 semanas com tarefas, responsáveis, datas calculadas e painel de progresso.", [
    "Na aba Configuração, digite seu nome (ou da família) e a data de início do plano. Todas as datas são calculadas a partir dela.",
    "Na aba Tarefas, as 52 tarefas sugeridas pelo método já estão distribuídas nas 13 semanas. Edite, inclua (nas linhas livres ao final) ou ajuste os textos.",
    "Para cada tarefa, defina o responsável e atualize o status: Pendente, Em andamento ou Concluída.",
    "O Painel mostra o percentual concluído no total, por fase e por semana, e indica se o plano está em dia em relação à data de hoje informada.",
    "Faça o ritual semanal de 30 minutos (Aula 12.8) e atualize o status.",
  ], ["Atrasos de 2 semanas ou mais em tarefas de documentos ou renda pedem revisão da data-alvo (Aula 12.8).", "O PDF do Planner de 90 Dias (mesmo número 26) traz as mesmas semanas em formato de impressão e preenchível."]);
  const c = wb.sheet("Configuração", { cols: [44, 22, 50], grid: false, tab: "FF101A17" });
  cabecalho(c, "Configuração", "Preencha os campos amarelos.", "C");
  c.row("A5", ["Nome / família", "Ana e Bruno (EXEMPLO)", ""], ["rot", "inTxt", "nota"]);
  c.row("A6", ["Data de início do plano", new Date(2026, 11, 1), "As semanas começam nesta data"], ["rot", "inData", "nota"]); c.date("B6");
  c.row("A7", ["Data de hoje (para o painel)", new Date(2026, 11, 29), "Atualize no ritual semanal"], ["rot", "inData", "nota"]); c.date("B7");
  c.row("A8", ["Data-alvo de chegada", { f: "=B6+7*12" }, "Início da semana 13"], ["rot", "cData", "nota"]);
  c.row("A9", ["Semana atual do plano", { f: "=MAX(1,MIN(13,ROUNDDOWN((B7-B6)/7,0)+1))" }, ""], ["rot", "cInt", "nota"]);

  const t = wb.sheet("Tarefas", { cols: [8, 12, 12, 18, 52, 30, 16, 15, 30, 2, 12], freeze: "A6", grid: false, tab: "FFB8995C", landscape: true });
  cabecalho(t, "Tarefas por semana", "Tarefas sugeridas pelo método. Status de EXEMPLO preenchido nas primeiras semanas.", "I");
  t.row("A5", ["Semana", "Início", "Fim", "Fase", "Tarefa", "Ferramenta / aula", "Responsável", "Status", "Observações"], "cab");
  let r = 6;
  PLANO_SEMANAS.forEach((s, w) => {
    s.tarefas.forEach((tk, k) => {
      const status = w < 3 ? "Concluída" : w === 3 ? (k < 2 ? "Concluída" : "Em andamento") : "Pendente";
      t.row(`A${r}`, [w + 1, { f: `='Configuração'!$B$6+7*(A${r}-1)` }, { f: `=B${r}+6` }, s.fase, tk[0], tk[1], k % 2 ? "Bruno" : "Ana", status, ""], ["cInt", "cData", "cData", "cTxt", "inTxt", "inTxt", "inTxt", "inTxt", "inTxt"]);
      r++;
    });
  });
  for (let i = 0; i < 12; i++, r++) t.row(`A${r}`, [null, { f: `=IF(A${r}="","",'Configuração'!$B$6+7*(A${r}-1))` }, { f: `=IF(B${r}="","",B${r}+6)` }, "", "", "", "", "", ""], ["inInt", "cData", "cData", "inTxt", "inTxt", "inTxt", "inTxt", "inTxt", "inTxt"]);
  const last = r - 1;
  t.list(`H6:H${last}`, ["Pendente", "Em andamento", "Concluída"]);
  t.list(`D58:D${last}`, ["Entender e decidir", "Preparar", "Executar"]);
  t.whole(`A58:A${last}`, 1, 13);
  t.condFill(`A6:I${last}`, `$H6="Concluída"`, "FFDDEFD9");
  t.set("K5", { f: "='Configuração'!B7" }, "cData"); t.set("K4", "Hoje (painel)", "nota");
  t.condFill(`A6:I${last}`, `AND($H6<>"Concluída",$E6<>"",$C6<$K$5)`, "FFF6D3CC");

  const pn = wb.sheet("Painel", { cols: [34, 16, 16, 16, 16], grid: false, tab: "FF3B5A4C" });
  cabecalho(pn, "Painel de progresso", "Atualizado automaticamente a partir da aba Tarefas.", "E");
  const T = (col) => `'Tarefas'!$${col}$6:$${col}$${last}`;
  pn.row("A5", ["Progresso geral", { f: `=IF(COUNTA(${T("E")})=0,0,COUNTIF(${T("H")},"Concluída")/COUNTA(${T("E")}))` }], ["rotB", "kpiVPct"]); pn.height(5, 30);
  pn.row("A6", ["Tarefas concluídas", { f: `=COUNTIF(${T("H")},"Concluída")` }], ["rot", "cInt"]);
  pn.row("A7", ["Tarefas em andamento", { f: `=COUNTIF(${T("H")},"Em andamento")` }], ["rot", "cInt"]);
  pn.row("A8", ["Tarefas atrasadas (fim da semana já passou)", { f: `=COUNTIFS(${T("H")},"<>Concluída",${T("C")},"<"&'Configuração'!$B$7)` }], ["rot", "cInt"]);
  pn.row("A9", ["Situação", { f: `=IF(B8=0,"Em dia",IF(B8<=4,"Pequeno atraso: compensar nas próximas semanas","Atraso relevante: revisar a data-alvo"))` }], ["rotB", "tTxt"]); pn.merge("B9:E9");
  pn.condFill("B9", 'B9="Em dia"', "FFDDEFD9"); pn.condFill("B9", 'LEFT(B9,7)="Pequeno"', "FFFBE3C8"); pn.condFill("B9", 'LEFT(B9,6)="Atraso"', "FFF6D3CC");
  pn.row("A11", ["Fase", "Tarefas", "Concluídas", "% concluído"], "cab");
  ["Entender e decidir", "Preparar", "Executar"].forEach((f, i) => {
    const rr = 12 + i;
    pn.row(`A${rr}`, [f, { f: `=COUNTIF(${T("D")},A${rr})` }, { f: `=COUNTIFS(${T("D")},A${rr},${T("H")},"Concluída")` }, { f: `=IF(B${rr}=0,0,C${rr}/B${rr})` }], ["rot", "cInt", "cInt", "tPct"]);
  });
  pn.row("A16", ["Semana", "Tarefas", "Concluídas", "% concluído", "Início"], "cab");
  for (let w = 1; w <= 13; w++) {
    const rr = 16 + w;
    pn.row(`A${rr}`, [w, { f: `=COUNTIF(${T("A")},A${rr})` }, { f: `=COUNTIFS(${T("A")},A${rr},${T("H")},"Concluída")` }, { f: `=IF(B${rr}=0,0,C${rr}/B${rr})` }, { f: `='Configuração'!$B$6+7*(A${rr}-1)` }], ["cInt", "cInt", "cInt", "cPct", "cData"]);
  }
  pn.condFill("D17:D29", "D17=1", "FFDDEFD9");
  pn.chart({ type: "bar", title: "% concluído por fase", cats: "A12:A14", series: [{ name: "% concluído", vals: "D12:D14" }], from: [6, 4], to: [13, 18] });
  return salvar(wb, "26-planner-de-90-dias.xlsx");
}

// ---------------------------------------------------------------- 29
export function matrizCidade() {
  const wb = novo("Matriz de Escolha de Cidade", "Matriz ponderada para comparar cidades, com análise de sensibilidade.");
  instrucoes(wb, "Matriz de Escolha de Cidade", "Compare até 4 cidades com critérios e pesos pessoais, veja o percentual de cada uma e teste a sensibilidade da decisão.", [
    "Na aba Matriz, escreva os nomes das cidades (C6 a F6).",
    "Liste até 12 critérios (coluna A) e dê um peso de 1 a 5 para cada (coluna B).",
    "Dê uma nota de 1 a 5 para cada cidade em cada critério.",
    "A planilha calcula a pontuação ponderada, o máximo possível, o percentual e a cidade mais bem avaliada.",
    "Na área de sensibilidade, escolha um critério e um peso alternativo para ver se a classificação muda (Aula 5.7).",
    "Se a diferença entre as duas primeiras for menor que 5 pontos percentuais, planeje uma estada de teste (Aula 12.3).",
  ], ["O exemplo preenchido reproduz a Aula 5.7 (Assunção, Encarnación e Ciudad del Este) e é ILUSTRATIVO."]);
  const m = wb.sheet("Matriz", { cols: [40, 10, 16, 16, 16, 16], freeze: "C7", grid: false, tab: "FF101A17" });
  cabecalho(m, "Matriz ponderada", "Pesos e notas de 1 a 5. EXEMPLO da Aula 5.7.", "F");
  m.row("A6", ["Critério", "Peso", "Assunção", "Encarnación", "Ciudad del Este", ""], ["cab", "cab", "inTxt", "inTxt", "inTxt", "inTxt"]);
  const crit = [["Custo de moradia", 4, 2, 4, 3], ["Saúde", 5, 5, 3, 3], ["Distância do Brasil", 3, 2, 3, 5], ["Internet", 4, 5, 4, 4], ["Ritmo de vida", 3, 3, 5, 2]];
  for (let i = 0; i < 12; i++) {
    const r = 7 + i; const c = crit[i] || ["", null, null, null, null];
    m.row(`A${r}`, [c[0], c[1], c[2], c[3], c[4], null], ["inTxt", "inInt", "inInt", "inInt", "inInt", "inInt"]);
  }
  m.whole("B7:F18", 1, 5);
  m.row("A20", ["Pontuação ponderada", "", ...["C", "D", "E", "F"].map((c) => ({ f: `=IF(${c}6="","",SUMPRODUCT($B$7:$B$18,${c}7:${c}18))` }))], ["rotB", "rot", "tInt", "tInt", "tInt", "tInt"]);
  m.row("A21", ["Máximo possível", { f: "=SUM(B7:B18)*5" }, "", "", "", ""], ["rot", "cInt", "rot", "rot", "rot", "rot"]);
  m.row("A22", ["Percentual do máximo", "", ...["C", "D", "E", "F"].map((c) => ({ f: `=IF(${c}6="","",IFERROR(${c}20/$B$21,0))` }))], ["rotB", "rot", "tPct", "tPct", "tPct", "tPct"]);
  m.row("A24", ["Cidade mais bem avaliada", { f: "=IFERROR(INDEX(C6:F6,1,MATCH(MAX(C22:F22),C22:F22,0)),\"\")" }], ["rotB", "tTxt"]); m.merge("B24:D24");
  m.row("A25", ["Diferença para a segunda colocada (p.p.)", { f: "=IFERROR((MAX(C22:F22)-LARGE2)*100,0)" }], ["rot", "tDec"]);
  // LARGE não é usado: segunda maior = MAX dos valores menores que o máximo
  m.cells.get("B25").f = '(MAX(C22:F22)-MAX(IF(OR(C22="",C22=MAX(C22:F22)),0,C22),IF(OR(D22="",D22=MAX(C22:F22)),0,D22),IF(OR(E22="",E22=MAX(C22:F22)),0,E22),IF(OR(F22="",F22=MAX(C22:F22)),0,F22)))*100';
  m.row("A26", ["Recomendação", { f: '=IF(B25<5,"Empate técnico: faça uma estada de teste nas finalistas","Diferença clara: registre a decisão e o motivo")' }], ["rotB", "tTxt"]); m.merge("B26:F26");
  m.set("A28", "Análise de sensibilidade", "secao"); m.merge("A28:F28");
  m.row("A29", ["Critério a testar", "Saúde"], ["rot", "inTxt"]); m.listRef("B29", "$A$7:$A$18");
  m.row("A30", ["Peso alternativo", 7], ["rot", "inInt"]); m.whole("B30", 0, 20);
  m.row("A31", ["Peso atual do critério", { f: "=IFERROR(INDEX(B7:B18,MATCH(B29,A7:A18,0)),0)" }], ["rot", "cInt"]);
  m.row("A32", ["Novo máximo possível", { f: "=(SUM(B7:B18)-B31+B30)*5" }], ["rot", "cInt"]);
  m.row("A33", ["Pontuação com o peso alternativo", "", ...["C", "D", "E", "F"].map((c) => ({ f: `=IF(${c}6="","",${c}20+($B$30-$B$31)*IFERROR(INDEX(${c}7:${c}18,MATCH($B$29,$A$7:$A$18,0)),0))` }))], ["rotB", "rot", "tInt", "tInt", "tInt", "tInt"]);
  m.row("A34", ["Percentual com o peso alternativo", "", ...["C", "D", "E", "F"].map((c) => ({ f: `=IF(${c}6="","",IFERROR(${c}33/$B$32,0))` }))], ["rot", "rot", "tPct", "tPct", "tPct", "tPct"]);
  m.row("A35", ["Mais bem avaliada no teste", { f: "=IFERROR(INDEX(C6:F6,1,MATCH(MAX(C34:F34),C34:F34,0)),\"\")" }], ["rotB", "tTxt"]); m.merge("B35:D35");
  m.row("A36", ["A ordem mudou?", { f: '=IF(B35=B24,"Não: a decisão é robusta a este peso","Sim: a decisão é sensível a este critério")' }], ["rotB", "tTxt"]); m.merge("B36:F36");
  m.chart({ type: "col", title: "Percentual do máximo por cidade", cats: "C6:E6", series: [{ name: "Pesos atuais", vals: "C22:E22" }, { name: "Peso alternativo", vals: "C34:E34" }], from: [7, 5], to: [15, 24] });
  return salvar(wb, "29-matriz-de-escolha-de-cidade.xlsx");
}

// ---------------------------------------------------------------- Bônus 01
export function organizadorDocumental() {
  const wb = novo("Organizador Documental", "Controle de documentos por pessoa com datas de pedido, validade, apostila e tradução.");
  instrucoes(wb, "Organizador Documental (Bônus 01 — Kit Documental)", "Controle cada documento de cada pessoa: quando pedir, quando vence, se já tem apostila e tradução e se vence antes da entrega na DNM.", [
    "Na aba Configuração, informe a data prevista de entrega do dossiê na DNM e os nomes das pessoas.",
    "Na aba Documentos, uma linha por documento e por pessoa. Preencha órgão, datas de pedido e de emissão e a validade em dias aceita pelo trâmite.",
    "A planilha calcula a data de vencimento e os dias de folga em relação à entrega, e mostra o status do documento.",
    "Marque Apostila e Tradução como Sim, Não ou Não se aplica.",
    "A aba Resumo mostra o total de documentos prontos, pendentes e com risco de vencer antes da entrega.",
  ], ["Validade: use a validade aceita pela DNM para cada documento (confira na página do trâmite). Os valores de exemplo são ILUSTRATIVOS.", "Use junto com o Checklist de Documentação (entregável 13)."]);
  const c = wb.sheet("Configuração", { cols: [44, 24, 40], grid: false, tab: "FF101A17" });
  cabecalho(c, "Configuração", "", "C");
  c.row("A5", ["Data prevista de entrega na DNM", new Date(2027, 2, 10)], ["rot", "inData"]); c.date("B5");
  ["Ana (EXEMPLO)", "Bruno (EXEMPLO)", "", "", "", ""].forEach((n, i) => c.row(`A${7 + i}`, [`Pessoa ${i + 1}`, n], ["rot", "inTxt"]));
  const ws = wb.sheet("Documentos", { cols: [18, 34, 22, 13, 13, 11, 13, 11, 12, 12, 30], freeze: "C6", grid: false, tab: "FFB8995C", landscape: true });
  cabecalho(ws, "Documentos", "Uma linha por documento e por pessoa.", "K");
  ws.row("A5", ["Pessoa", "Documento", "Órgão emissor", "Pedido em", "Emitido em", "Validade (dias)", "Vence em", "Folga (dias)", "Apostila", "Tradução", "Status"], "cab"); ws.height(5, 30);
  const DOCS = ["RG / documento de identidade", "Passaporte", "Certidão de nascimento", "Certidão de casamento / divórcio", "Antecedentes criminais (PF)", "Antecedentes estaduais", "Comprovante de entrada no Paraguai", "Antecedentes policiais no Paraguai", "Comprovantes de renda", "Histórico escolar", "Carteira de vacinação", "Certificado veterinário (animal)", "Outro"];
  const ex = [["Ana (EXEMPLO)", "Certidão de nascimento", "Cartório de Registro Civil", new Date(2026, 11, 8), new Date(2026, 11, 15), 180, "Sim", "Sim"], ["Ana (EXEMPLO)", "Antecedentes criminais (PF)", "Polícia Federal", new Date(2027, 1, 1), new Date(2027, 1, 1), 90, "Sim", "Não"], ["Bruno (EXEMPLO)", "Certidão de casamento / divórcio", "Cartório de Registro Civil", new Date(2026, 11, 3), null, 180, "Não", "Não"], ["Bruno (EXEMPLO)", "Antecedentes criminais (PF)", "Polícia Federal", new Date(2026, 9, 20), new Date(2026, 9, 20), 90, "Sim", "Sim"]];
  for (let i = 0; i < 60; i++) {
    const r = 6 + i; const e = ex[i] || ["", "", "", null, null, null, "", ""];
    ws.row(`A${r}`, [e[0], e[1], e[2], e[3], e[4], e[5],
      { f: `=IF(OR(E${r}="",F${r}=""),"",E${r}+F${r})` },
      { f: `=IF(G${r}="","",G${r}-'Configuração'!$B$5)` }, e[6], e[7],
      { f: `=IF(B${r}="","",IF(E${r}="",IF(D${r}="","A pedir","Pedido, aguardando"),IF(AND(H${r}<>"",H${r}<0),"VENCE ANTES DA ENTREGA",IF(OR(I${r}="Não",J${r}="Não"),"Falta apostila ou tradução","Pronto"))))` }], ["inTxt", "inTxt", "inTxt", "inData", "inData", "inInt", "cData", "cInt", "inTxt", "inTxt", "cTxt"]);
  }
  ws.listRef("A6:A65", "'Configuração'!$B$7:$B$12"); ws.list("B6:B65", DOCS); ws.list("I6:J65", ["Sim", "Não", "Não se aplica"]); ws.date("D6:E65"); ws.whole("F6:F65", 0, 3650);
  ws.condFill("K6:K65", 'K6="Pronto"', "FFDDEFD9"); ws.condFill("K6:K65", 'K6="VENCE ANTES DA ENTREGA"', "FFF6D3CC"); ws.condFill("K6:K65", 'OR(K6="Falta apostila ou tradução",K6="Pedido, aguardando")', "FFFBE3C8");
  const rs = wb.sheet("Resumo", { cols: [44, 16], grid: false, tab: "FF3B5A4C" });
  cabecalho(rs, "Resumo", "", "B");
  const K = "'Documentos'!$K$6:$K$65";
  [["Documentos listados", `=COUNTA('Documentos'!$B$6:$B$65)`], ["Prontos", `=COUNTIF(${K},"Pronto")`], ["A pedir", `=COUNTIF(${K},"A pedir")`], ["Pedidos, aguardando", `=COUNTIF(${K},"Pedido, aguardando")`], ["Falta apostila ou tradução", `=COUNTIF(${K},"Falta apostila ou tradução")`], ["VENCEM ANTES DA ENTREGA", `=COUNTIF(${K},"VENCE ANTES DA ENTREGA")`]].forEach((v, i) => rs.row(`A${5 + i}`, [v[0], { f: v[1] }], [i === 5 ? "rotB" : "rot", i === 0 ? "tInt" : "cInt"]));
  rs.row("A12", ["% pronto", { f: "=IF(B5=0,0,B6/B5)" }], ["rotB", "kpiVPct"]); rs.height(12, 30);
  return salvar(wb, "bonus-01-organizador-documental.xlsx", "bonus/bonus-01-kit-documental");
}

// ---------------------------------------------------------------- Bônus 04
export function mapaDeDecisao() {
  const wb = novo("Mapa de Decisão", "Prontidão, custo por cidade e prioridades em um único painel de decisão.");
  instrucoes(wb, "Mapa de Decisão (Bônus 04)", "Responda se você está pronto para executar, compare o peso do custo de vida de cada cidade na sua renda e registre as suas prioridades.", [
    "Na aba Prontidão, responda Sim, Parcial ou Não às 16 perguntas, agrupadas em finanças, documentos, renda e família/adaptação.",
    "Na aba Custo por cidade, informe sua renda mensal e reserva em reais, o câmbio e o custo mensal estimado de até 4 cidades em guaranis (use a Calculadora de Custo de Vida).",
    "Na aba Prioridades, ordene suas 5 prioridades e associe cada uma a uma cidade que a atende melhor.",
    "O Painel combina tudo: status de prontidão (Pronto para executar, Preparar antes ou Fazer viagem de teste), cidade com menor peso na renda e lembretes.",
  ], ["Critérios de pontuação didáticos: Sim = 2, Parcial = 1, Não = 0. 75% ou mais = pronto; 50% a 74% = preparar; abaixo de 50% = testar antes (Aulas 1.7 e 12.4)."]);
  const p = wb.sheet("Prontidão", { cols: [22, 70, 14, 10], freeze: "A6", grid: false, tab: "FF101A17" });
  cabecalho(p, "Prontidão para executar", "Respostas de EXEMPLO. Substitua pelas suas.", "D");
  p.row("A5", ["Grupo", "Pergunta", "Resposta", "Pontos"], "cab");
  const Q = [
    ["Finanças", "Tenho reserva para pelo menos 6 meses de despesa no Paraguai, além dos custos únicos?", "Parcial"],
    ["Finanças", "Meu orçamento usa preços pesquisados (não apenas ilustrativos)?", "Sim"],
    ["Finanças", "Fiz o teste de estresse e o plano resistiu?", "Não"],
    ["Finanças", "Tenho dois meios de pagamento que funcionam no Paraguai?", "Sim"],
    ["Documentos", "RG ou passaporte em bom estado e válidos?", "Sim"],
    ["Documentos", "Sei exatamente quais documentos o meu trâmite exige?", "Sim"],
    ["Documentos", "Sei onde e como apostilar e traduzir?", "Parcial"],
    ["Documentos", "Meu cronograma respeita a validade das certidões?", "Parcial"],
    ["Renda", "Minha renda mensal está garantida durante a transição?", "Parcial"],
    ["Renda", "Tenho autorização por escrito para trabalhar do exterior (se remoto)?", "Sim"],
    ["Renda", "Conversei com contador sobre a minha situação fiscal?", "Não"],
    ["Renda", "Tenho plano e gatilhos se a renda nova demorar?", "Sim"],
    ["Família e adaptação", "Todos os adultos fizeram a autoavaliação de adaptação?", "Sim"],
    ["Família e adaptação", "Tenho espanhol suficiente para resolver problemas simples?", "Parcial"],
    ["Família e adaptação", "Escola e saúde estão mapeadas perto da moradia pretendida?", "Parcial"],
    ["Família e adaptação", "Já visitei a cidade ou farei estada de teste?", "Não"],
  ];
  Q.forEach((q, i) => { const r = 6 + i; p.row(`A${r}`, [q[0], q[1], q[2], { f: `=IF(C${r}="Sim",2,IF(C${r}="Parcial",1,0))` }], ["cTxt", "rot", "inTxt", "cInt"]); p.height(r, 30); });
  p.list("C6:C21", ["Sim", "Parcial", "Não"]);
  p.condFill("C6:C21", 'C6="Não"', "FFF6D3CC"); p.condFill("C6:C21", 'C6="Parcial"', "FFFBE3C8"); p.condFill("C6:C21", 'C6="Sim"', "FFDDEFD9");
  p.row("A23", ["Grupo", "Pontos", "Máximo", "%"], "cab");
  ["Finanças", "Documentos", "Renda", "Família e adaptação"].forEach((g, i) => { const r = 24 + i; p.row(`A${r}`, [g, { f: `=SUMIF($A$6:$A$21,A${r},$D$6:$D$21)` }, 8, { f: `=B${r}/C${r}` }], ["rot", "cInt", "cInt", "tPct"]); });
  p.row("A28", ["Total", { f: "=SUM(B24:B27)" }, 32, { f: "=B28/C28" }], ["rotB", "tInt", "tInt", "tPct"]);

  const c = wb.sheet("Custo por cidade", { cols: [40, 18, 18, 18, 18], grid: false, tab: "FFB8995C" });
  cabecalho(c, "Custo por cidade", "EXEMPLO: renda e custos ilustrativos.", "E");
  c.row("A5", ["Renda mensal garantida (R$)", 9000], ["rot", "inBrl"]); c.row("A6", ["Reserva disponível após custos únicos (R$)", 58900], ["rot", "inBrl"]); c.row("A7", ["Guaranis por 1 real", 1076], ["rot", "inDec"]);
  c.decimal("B5:B7", 0);
  c.row("A9", ["", "Cidade 1", "Cidade 2", "Cidade 3", "Cidade 4"], "cab");
  c.row("A10", ["Nome da cidade", "Assunção", "Luque", "Encarnación", ""], ["rot", "inTxt", "inTxt", "inTxt", "inTxt"]);
  c.row("A11", ["Custo mensal estimado (Gs.)", 13500000, 12100000, 11400000, null], ["rot", "inGs", "inGs", "inGs", "inGs"]); c.decimal("B11:E11", 0);
  c.row("A12", ["Custo mensal (R$)", ...["B", "C", "D", "E"].map((x) => ({ f: `=IF(${x}11="","",${x}11/$B$7)` }))], ["rot", "cBrl", "cBrl", "cBrl", "cBrl"]);
  c.row("A13", ["Custo / renda garantida", ...["B", "C", "D", "E"].map((x) => ({ f: `=IF(${x}11="","",${x}12/$B$5)` }))], ["rot", "tPct", "tPct", "tPct", "tPct"]);
  c.row("A14", ["Meses de despesa cobertos pela reserva", ...["B", "C", "D", "E"].map((x) => ({ f: `=IF(${x}11="","",$B$6/${x}12)` }))], ["rot", "tDec", "tDec", "tDec", "tDec"]);
  c.condFill("B13:E13", "AND(B13<>\"\",B13>1)", "FFFBE3C8");
  c.chart({ type: "col", title: "Custo mensal por cidade (R$)", cats: "B10:D10", series: [{ name: "R$ por mês", vals: "B12:D12" }], from: [0, 16], to: [5, 32] });

  const pr = wb.sheet("Prioridades", { cols: [10, 52, 24], grid: false, tab: "FF3B5A4C" });
  cabecalho(pr, "Prioridades", "Ordene as 5 prioridades mais importantes e indique a cidade que melhor atende cada uma.", "C");
  pr.row("A5", ["Ordem", "Prioridade", "Cidade que melhor atende"], "cab");
  [["Saúde perto de casa", "Assunção"], ["Custo de moradia", "Encarnación"], ["Emprego do Bruno", "Assunção"], ["Internet para trabalho remoto", "Assunção"], ["Ritmo de vida tranquilo", "Encarnación"]].forEach((x, i) => pr.row(`A${6 + i}`, [i + 1, x[0], x[1]], ["cInt", "inTxt", "inTxt"]));
  pr.listRef("C6:C10", "'Custo por cidade'!$B$10:$E$10");
  pr.row("A12", ["", "Cidade mais citada nas prioridades", { f: "=IF(COUNTIF(C6:C10,'Custo por cidade'!B10)>=MAX(COUNTIF(C6:C10,'Custo por cidade'!C10),COUNTIF(C6:C10,'Custo por cidade'!D10),COUNTIF(C6:C10,'Custo por cidade'!E10)),'Custo por cidade'!B10,IF(COUNTIF(C6:C10,'Custo por cidade'!C10)>=MAX(COUNTIF(C6:C10,'Custo por cidade'!D10),COUNTIF(C6:C10,'Custo por cidade'!E10)),'Custo por cidade'!C10,IF(COUNTIF(C6:C10,'Custo por cidade'!D10)>=COUNTIF(C6:C10,'Custo por cidade'!E10),'Custo por cidade'!D10,'Custo por cidade'!E10)))" }], ["rot", "rotB", "tTxt"]);

  const pn = wb.sheet("Painel", { cols: [44, 52], grid: false, tab: "FF263D33" });
  cabecalho(pn, "Painel de decisão", "Resumo automático das três abas.", "B");
  pn.row("A5", ["Prontidão geral", { f: "='Prontidão'!D28" }], ["rotB", "kpiVPct"]); pn.height(5, 30);
  pn.row("A6", ["Status", { f: '=IF(\'Prontidão\'!D28>=0.75,"Pronto para executar",IF(\'Prontidão\'!D28>=0.5,"Preparar antes: resolva os itens Não e Parcial","Fazer viagem de teste e preparar antes de decidir"))' }], ["rotB", "tTxt"]);
  pn.row("A7", ["Grupo mais fraco", { f: "=INDEX('Prontidão'!A24:A27,MATCH(MIN('Prontidão'!D24:D27),'Prontidão'!D24:D27,0))" }], ["rot", "cTxt"]);
  pn.row("A8", ["Cidade com menor peso na renda", { f: "=IFERROR(INDEX('Custo por cidade'!B10:E10,1,MATCH(MIN('Custo por cidade'!B13:E13),'Custo por cidade'!B13:E13,0)),\"\")" }], ["rot", "cTxt"]);
  pn.row("A9", ["Cidade mais citada nas prioridades", { f: "='Prioridades'!C12" }], ["rot", "cTxt"]);
  pn.row("A10", ["Coincidem?", { f: '=IF(B8=B9,"Sim: custo e prioridades apontam para a mesma cidade","Não: use a Matriz de Escolha de Cidade (planilha 29) para decidir com pesos")' }], ["rotB", "tTxt"]);
  pn.height(6, 30); pn.height(10, 30);
  pn.condFill("B6", 'LEFT(B6,6)="Pronto"', "FFDDEFD9"); pn.condFill("B6", 'LEFT(B6,8)="Preparar"', "FFFBE3C8"); pn.condFill("B6", 'LEFT(B6,5)="Fazer"', "FFF6D3CC");
  return salvar(wb, "bonus-04-mapa-de-decisao.xlsx", "bonus/bonus-04-mapa-de-decisao");
}
