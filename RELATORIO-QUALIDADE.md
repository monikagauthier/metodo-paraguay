# Relatório de qualidade e pendências — Produto Método Paraguay

**Edição:** 1.0 · **Revisão:** 01/11/2026 · **Branch:** `produto/entregaveis-completos`

## 1. Auditoria inicial (Fase 1)

| Item auditado | Encontrado | Decisão |
|---|---|---|
| Arquitetura | Página de vendas em duas versões: vanilla (testada) e React/Vite/TS/Tailwind (não instalável no ambiente). Sem backend, autenticação, banco de dados ou checkout configurado. | Área de membros feita em **vanilla estático**, como a versão validada da página de vendas. Nada de login, pagamento ou banco foi inventado. |
| Identidade visual | Logotipo "P" dourado com cidade e ponte sobre verde profundo; wordmark serifado; slogan "Inteligência sem fronteiras"; paleta do README (verde #101A17, #263D33; dourado #D8B76E, #F0CC7C; marfim #F5F1E8). | A direção "preto e grafite + dourado" do briefing foi conciliada com a identidade existente: verde quase preto como base, dourado só em destaques, marfim e branco. |
| Imagens | 44 PNGs na raiz: emblema, logotipo, mockups, selos, texturas, cenas urbanas (renderizações geradas por IA) e 10 imagens que simulam conversas de WhatsApp. | Usados: emblema, logotipo, mapa, bandeira e 6 cenas/texturas (otimizados em `assets/produto/img`). **Não usados:** simulações de conversas (seriam depoimentos falsos), "Comunidade" (não existe comunidade) e selo de garantia (depende da oferta real). |
| Página de vendas | Anuncia 6 módulos e bônus genéricos. | O produto tem 12 módulos e 5 bônus definidos no briefing. **A página de vendas não foi alterada** e precisa ser atualizada para refletir o conteúdo real (ver pendências). |
| Ambiente | Sem acesso a npm/pip; busca na web disponível, leitura de páginas bloqueada (HTTP 403); Chromium headless, Node 22 e Java 25 disponíveis; apenas Noto Sans e Lato como fontes. | Geradores próprios de PDF (via Chromium), XLSX, DOCX, ZIP e campos AcroForm. Fontes Manrope/Inter substituídas por Noto Sans/Lato (OFL), embutidas. |

## 2. Pesquisa (Fase 2)

- 60+ consultas a fontes oficiais e imprensa entre 31/10 e 01/11/2026. Resultado em `referencias/base-de-pesquisa.md`, com tipo de fonte (oficial, imprensa, terceiros) e data.
- **Limitação:** as páginas não puderam ser abertas; cada dado foi confirmado pelo trecho do resultado de busca. Isso é declarado em todos os materiais.
- Dados que dependem de tabela vigente ou que só apareceram em fontes de terceiros estão marcados no conteúdo com o quadro "Verificar na fonte oficial" e listados em `referencias/pendencias-verificacao.md` (10 itens de prioridade alta, 14 de prioridade média).
- Nenhuma taxa migratória, lista oficial de documentos ou alíquota não confirmada foi apresentada como certa.

## 3. Conteúdo (Fase 3)

| Verificação | Resultado |
|---|---|
| Módulos e aulas | 12 módulos, 115 aulas (8 a 10 por módulo), mais de 43 mil palavras |
| Estrutura de cada aula | Objetivo, introdução, conteúdo, exemplo prático, erros comuns, checklist, resumo, referências oficiais com data, próximos passos — presente em 115/115 |
| Procedimentos | Aulas procedimentais (3.6, 6.5, 8.3, 9.6, 10.6, 11.4) trazem o que é, para quem, pré-requisitos, onde consultar, documentos, custos, riscos e como verificar a conclusão |
| Exemplos | Todos os casos com pessoas são marcados como hipotéticos. Valores marcados como pesquisados, oficiais, estimados ou ilustrativos |
| Cálculos citados no texto | Conferidos um a um (cenários do Módulo 4, reserva da Aula 2.7, matriz da Aula 5.7, IPS e aguinaldo da Aula 8.8, remessas da Aula 6.5, estudos de caso). Uma inconsistência encontrada na Aula 5.7 e uma nos estudos de caso foram corrigidas |
| Temas sensíveis | Módulo 10 sem conclusões genéricas de isenção; Módulo 6 sem orientação para ocultar patrimônio; Módulo 7 sem recomendação de ativos |
| Itens proibidos | Nenhum depoimento, estatística de alunos, comunidade, suporte humano, consultoria ou videoaula anunciados |

## 4. PDFs editoriais (Fase 4)

17 PDFs gerados (Manual Mestre, 12 guias/manuais de módulo, Guia de Frases, Diretório, 2 PDFs de bônus).

| Verificação | Resultado |
|---|---|
| Abrem corretamente | Sim: renderizados no visualizador de PDF do Chromium (amostras de páginas inspecionadas visualmente) |
| Fontes embutidas | Sim (subconjuntos de Noto Sans e Lato) |
| Sumário funciona | Sim: links internos para cada capítulo e aula, com número de página calculado em duas passagens; divergência de numeração entre passagens = 0 em todos os arquivos |
| Marcadores (outline) | Sim, em todos |
| Links clicáveis | Sim: 1.078 anotações de link no total, das quais 722 para sites externos. **Não foi possível testar se os sites externos respondem** (sem acesso à web a partir do ambiente) |
| Tabelas cortadas | Não observadas nas amostras; linhas de tabela não quebram entre páginas e o cabeçalho se repete |
| Páginas vazias | Não. Aberturas de módulo são páginas inteiras intencionais |
| Paginação | Numeração no rodapé, exceto capa, aberturas e contracapa |
| Manual Mestre | **312 páginas no formato 17 × 24 cm** (aproximadamente 190 páginas A4). Fica acima da meta de 120–180 porque o formato menor favorece a leitura no celular; não há páginas artificiais: as aulas correm em fluxo contínuo dentro de cada módulo |

## 5. Ferramentas (Fase 5)

11 planilhas XLSX e 2 modelos DOCX.

| Verificação | Resultado |
|---|---|
| Fórmulas | 2.025 fórmulas avaliadas por um avaliador próprio compatível com Excel; 0 erros. Os valores calculados ficam gravados no arquivo e o Excel recalcula ao abrir |
| Cálculos testados | Valores-chave conferidos contra o texto das aulas (ex.: cenários de R$ 5.297 / 8.318 / 13.243; reserva de R$ 127.107,50 no Simulador; matriz 68/71/64 e inversão com peso 7) |
| Campos editáveis | Destacados em amarelo e desbloqueados; fórmulas protegidas sem senha |
| Validação de dados | Listas (cidade, etiqueta, moeda, status, Sim/Não) e limites numéricos |
| Gráficos | 11 gráficos (pizza, colunas, barras) |
| Exemplos | Preenchidos e identificados como EXEMPLO/ILUSTRATIVO em cada aba |
| Integridade do pacote | ZIP íntegro, XML bem-formado e relacionamentos válidos em 13/13 arquivos (verificador Java) |
| **Limitação** | Não havia Excel, LibreOffice nem Google Sheets no ambiente. Os arquivos seguem o padrão OOXML, mas **a abertura no Excel e no Google Sheets não pôde ser testada**. Recomenda-se abrir cada arquivo uma vez antes da venda |

## 6. Checklists e documentos preenchíveis

13 PDFs com 1.132 campos AcroForm (caixas de seleção e texto). Campos conferidos visualmente sobre o desenho da página no visualizador do Chromium. **Recomendação:** testar o preenchimento e o salvamento no Adobe Acrobat Reader (computador e celular), que não estava disponível no ambiente.

## 7. Bônus (Fase 6)

| Bônus | Arquivos próprios | Arquivos da biblioteca que o compõem |
|---|---|---|
| 01 Kit Documental | Organizador Documental (XLSX) | Checklist de Documentação (13) |
| 02 Planner Financeiro Internacional | Guia do Planner (PDF) | Planilhas 19, 21, 22, 23 |
| 03 Guia de Espanhol Prático | Guia de Espanhol Prático (PDF) | Guia de Frases (17) |
| 04 Mapa de Decisão | Mapa de Decisão (XLSX e PDF preenchível) | Matriz de Escolha de Cidade (29) |
| 05 Plano Paraguay 90 Dias | Quadro de Acompanhamento Semanal (PDF preenchível) | Planner de 90 Dias (26, PDF e XLSX) |

## 8. Área de membros (Fase 7) — 35/35 verificações automatizadas

Testes em `scripts/produto/tools/test-plataforma.mjs` (Chromium headless):

- 14 rotas renderizam (início, módulos, módulo, aulas, biblioteca e filtros, ferramentas, plano, progresso, ajuda, busca, página não encontrada).
- Aula concluída, checklist da aula e tarefa do plano persistem após recarregar.
- "Continuar estudando" aponta para a aula seguinte; percentual geral atualiza.
- Calculadora rápida calcula e recalcula ao editar.
- 43 downloads respondem HTTP 200; o clique inicia o download.
- Exportação de progresso gera JSON válido; importação implementada.
- Sem rolagem horizontal em 320, 375, 390, 430, 768, 1024 e 1440 px.
- Zero erros de console, de página ou de rede.
- Funciona aberta direto do arquivo (`file://`), sem servidor.

Acessibilidade: link "pular para o conteúdo", foco visível, `aria-current` na navegação, barras de progresso com rótulo, `prefers-reduced-motion` respeitado, tabelas viram cartões em telas estreitas.

**Limitações reais:** progresso salvo apenas no navegador (com exportação/importação); sem controle de acesso (deve ser feito pela hospedagem ou plataforma de vendas — ver README-PRODUTO.md).

## 9. Distribuição (Fase 9)

`distribuicao/metodo-paraguay-v1.0.zip` — 92 arquivos, cerca de 42 MB, com entregáveis, plataforma, assets, conteúdo-fonte, referências, README, inventário e este relatório. Integridade conferida (teste de ZIP e comparação byte a byte com os originais).

## 10. Pendências para a sua decisão

| # | Pendência | Ação sugerida |
|---|---|---|
| 1 | Confirmar os 10 itens de prioridade alta de `referencias/pendencias-verificacao.md` (taxas DNM, lista de documentos, Resolução 407/2026, cédula, IRP do exterior, tratado, IOF, IRRF de não residentes, Investor Pass) | Conferir nas fontes oficiais e atualizar o Markdown |
| 2 | Abrir as planilhas no Excel e no Google Sheets e os PDFs preenchíveis no Acrobat Reader | Teste manual de 30 minutos |
| 3 | Testar os links externos dos PDFs a partir de uma conexão normal | Ferramenta de verificação de links ou amostragem manual |
| 4 | Atualizar a página de vendas (6 módulos → 12; bônus reais; remover elementos sem lastro como "comunidade") | Ajuste em `src/config/site.config.*` e `index.html` |
| 5 | Definir controle de acesso e entrega (checkout, área de membros da plataforma ou hospedagem com login) | Ver README-PRODUTO.md |
| 6 | Substituir renderizações por fotografias reais licenciadas, se desejar | Trocar arquivos em `assets/produto/img` e regenerar |
| 7 | Revisão jurídica e contábil independente dos Módulos 3, 8 e 10 antes da venda | Profissionais habilitados no Brasil e no Paraguai |
