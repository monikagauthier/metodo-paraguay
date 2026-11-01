// Definição de todos os PDFs editoriais do produto.
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./lib/doc.mjs";

const pesquisa = fs.readFileSync(path.join(ROOT, "referencias/base-de-pesquisa.md"), "utf8")
  .replace(/^# .*\n/, "")
  .replace(/^## /gm, "## ");

const sobreGuia = (n, extra = "") =>
  `Este guia reúne o conteúdo integral do **Módulo ${n}** do Método Paraguay: aulas completas, exemplos, procedimentos, checklists e referências oficiais. ${extra} Use o sumário clicável para ir direto ao tema. As ferramentas citadas (planilhas, checklists e modelos) estão na Biblioteca da área de membros e no pacote de distribuição.`;

const guia = (id, n, arquivo, titulo, subtitulo, capa, extra = [], sobreExtra = "") => ({
  id, arquivo, titulo, subtitulo, kicker: `Guia · Módulo ${n}`, rodape: titulo, capa,
  sobre: sobreGuia(n, sobreExtra),
  blocos: [{ tipo: "modulo", n }, ...extra],
});

export const DOCS = [
  {
    id: "01",
    arquivo: "entregaveis/manuais/01-manual-mestre-metodo-paraguay.pdf",
    titulo: "Manual Mestre",
    subtitulo: "O método completo para morar, trabalhar, empreender e organizar sua vida financeira no Paraguai",
    kicker: "Método Paraguay · Edição completa",
    rodape: "Manual Mestre",
    capa: "capa-cidade.jpg",
    compacto: true,
    sobre: "O Manual Mestre é o documento principal do Método Paraguay. Ele reúne os **12 módulos** com todas as aulas, estudos de caso hipotéticos, plano de execução de 13 semanas, glossário, perguntas frequentes, diretório de links oficiais e a base de pesquisa com fontes e datas. Os guias temáticos e as ferramentas aprofundam e aplicam cada módulo.",
    blocos: [
      { tipo: "secao", titulo: "Apresentação do método", arquivo: "apresentacao.md" },
      ...Array.from({ length: 12 }, (_, i) => ({ tipo: "modulo", n: String(i + 1).padStart(2, "0") })),
      { tipo: "secao", titulo: "Estudos de caso", arquivo: "estudos-de-caso.md" },
      { tipo: "secao", titulo: "Plano de execução em 13 semanas", arquivo: "plano-execucao.md" },
      { tipo: "secao", titulo: "Glossário", arquivo: "glossario.md", glossario: true, sumario: false },
      { tipo: "secao", titulo: "Perguntas frequentes", arquivo: "faq.md" },
      { tipo: "diretorio", titulo: "Diretório de links oficiais" },
      { tipo: "secao", titulo: "Referências e base de pesquisa", md: pesquisa },
    ],
  },
  guia("02", "01", "entregaveis/guias/02-guia-de-introducao-ao-paraguai.pdf", "Guia de Introdução ao Paraguai", "Economia, moeda, cultura, cidades e o perfil de quem se adapta", "capa-cidade.jpg",
    [{ tipo: "secao", titulo: "Glossário essencial", arquivo: "glossario.md", glossario: true, sumario: false }]),
  guia("31", "02", "entregaveis/manuais/31-manual-de-planejamento-da-mudanca.pdf", "Manual de Planejamento da Mudança", "Orçamento, documentos, cronograma e reserva antes da viagem", "residencias.jpg",
    [{ tipo: "secao", titulo: "Plano de execução em 13 semanas", arquivo: "plano-execucao.md" }]),
  guia("03", "03", "entregaveis/guias/03-guia-de-documentacao-e-residencia.pdf", "Guia de Documentação e Residência", "Entrada, modalidades de residência, certidões, apostila e cédula", "bandeira-cidade.jpg",
    [{ tipo: "diretorio", titulo: "Diretório de órgãos e serviços oficiais" }], "Inclui o fluxograma do processo migratório (Aula 3.6) e o diretório de órgãos oficiais."),
  guia("04", "04", "entregaveis/guias/04-guia-de-custo-de-vida.pdf", "Guia de Custo de Vida", "Como estimar, comparar e testar o seu orçamento mensal", "horizonte-noturno.jpg", [],
    "Inclui três cenários (econômico, intermediário e confortável) para pessoa, casal e família."),
  guia("05", "05", "entregaveis/guias/05-guia-de-cidades-e-moradia.pdf", "Guia de Cidades e Moradia", "Cidades, bairros, matriz de escolha, visitas e contratos", "residencias.jpg"),
  guia("06", "06", "entregaveis/guias/06-guia-de-bancos-e-cambio.pdf", "Guia de Bancos e Câmbio", "Sistema bancário, contas, remessas, câmbio, fraudes e obrigações", "horizonte-noturno.jpg"),
  guia("07", "07", "entregaveis/manuais/07-manual-de-investimentos.pdf", "Manual de Investimentos", "Mercado financeiro, imóveis, negócios, riscos e diligência", "capa-cidade.jpg", [],
    "Conteúdo educativo: nenhum ativo é recomendado e nenhum retorno é garantido."),
  guia("08", "08", "entregaveis/guias/08-guia-de-empreendedorismo.pdf", "Guia de Empreendedorismo", "Do teste de mercado à empresa formalizada", "bandeira-cidade.jpg"),
  guia("09", "09", "entregaveis/guias/09-guia-de-trabalho-e-renda.pdf", "Guia de Trabalho e Renda", "Emprego, trabalho remoto, serviços, currículo e transição de renda", "residencias.jpg",
    [{ tipo: "secao", titulo: "Entrevistas e metas profissionais", arquivo: "entrevista.md" }]),
  guia("10", "10", "entregaveis/guias/10-guia-de-residencia-fiscal.pdf", "Guia de Residência Fiscal", "O que muda nos dois países e como preparar a conversa com o contador", "horizonte-noturno.jpg",
    [
      { tipo: "secao", titulo: "Fluxogramas e quadro de obrigações", arquivo: "fluxograma-tributario.md" },
      { tipo: "secao", titulo: "Checklist de questões para o contador", arquivo: "perguntas-contador.md" },
    ], "Material educativo: não traz conclusões sobre isenção e não substitui contador."),
  guia("11", "11", "entregaveis/manuais/11-manual-dos-primeiros-30-dias.pdf", "Manual dos Primeiros 30 Dias", "Primeiros dias, serviços essenciais, idioma, convivência e rotina", "capa-cidade.jpg",
    [{ tipo: "secao", titulo: "Serviços essenciais e instalação", arquivo: "servicos-essenciais.md" }]),
  guia("12", "12", "entregaveis/guias/12-plano-de-acao-de-90-dias.pdf", "Plano de Ação de 90 Dias", "Do diagnóstico ao plano executável, com riscos e revisões", "bandeira-cidade.jpg",
    [{ tipo: "secao", titulo: "Plano de execução em 13 semanas", arquivo: "plano-execucao.md" }]),
  {
    id: "17", arquivo: "entregaveis/guias/17-guia-de-frases-em-espanhol.pdf",
    titulo: "Guia de Frases em Espanhol", subtitulo: "Frases prontas para trâmites, moradia, banco, saúde, trabalho e emergências",
    kicker: "Guia prático", rodape: "Guia de Frases em Espanhol", capa: "palco.jpg",
    sobre: "Frases organizadas por situação, com tradução, para os primeiros meses no Paraguai. Complementa a Aula 11.7 e o Bônus 03.",
    blocos: [{ tipo: "secao", titulo: "Frases por situação", arquivo: "frases-espanhol.md" }],
  },
  {
    id: "18", arquivo: "entregaveis/guias/18-diretorio-de-links-oficiais.pdf",
    titulo: "Diretório de Links Oficiais", subtitulo: "Órgãos e serviços do Paraguai e do Brasil, com links clicáveis",
    kicker: "Referência", rodape: "Diretório de Links Oficiais", capa: "marmore.jpg", semSumario: false,
    sobre: "Lista dos portais oficiais citados no Método Paraguay, organizada por tema. Todos os endereços são clicáveis. Confira sempre o conteúdo vigente no próprio portal.",
    blocos: [{ tipo: "diretorio", titulo: "Diretório de links oficiais" }],
  },
  {
    id: "B2", arquivo: "entregaveis/bonus/bonus-02-planner-financeiro-internacional/guia-do-planner-financeiro.pdf",
    titulo: "Planner Financeiro Internacional", subtitulo: "Como planejar despesas, montar a reserva e controlar o dinheiro em dois países",
    kicker: "Bônus 02", rodape: "Bônus 02 · Planner Financeiro", capa: "horizonte-noturno.jpg",
    sobre: "Guia de uso das quatro planilhas financeiras do Método Paraguay, com roteiro, rotina e indicadores.",
    blocos: [{ tipo: "secao", titulo: "Guia do Planner Financeiro", arquivo: "planner-financeiro.md" }],
  },
  {
    id: "B3", arquivo: "entregaveis/bonus/bonus-03-guia-de-espanhol-pratico/guia-de-espanhol-pratico.pdf",
    titulo: "Guia de Espanhol Prático", subtitulo: "Vocabulário por tema, pronúncia, falsos amigos, guarani básico e exercícios",
    kicker: "Bônus 03", rodape: "Bônus 03 · Espanhol Prático", capa: "palco.jpg",
    sobre: "Plano de 8 semanas, vocabulário temático e exercícios com respostas. Use junto com o Guia de Frases (entregável 17).",
    blocos: [{ tipo: "secao", titulo: "Espanhol prático para o Paraguai", arquivo: "espanhol-pratico.md" }],
  },
];
