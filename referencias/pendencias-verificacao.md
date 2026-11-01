# Pendências de verificação

Itens que **não puderam ser confirmados diretamente na fonte oficial** durante a produção (31/10 a 01/11/2026). O ambiente tinha busca na web, mas não abria páginas (HTTP 403), então a confirmação foi feita pelos trechos dos resultados de busca. Os itens abaixo aparecem no curso marcados com o quadro "Verificar na fonte oficial" ou com redação condicional.

Antes de publicar uma nova edição, abra cada fonte, confirme o dado e atualize o conteúdo em `conteudo/` e, se for o caso, as planilhas em `scripts/produto/xlsx/`. Depois rode o build (ver README-PRODUTO.md).

## Prioridade alta (afetam decisões e orçamento)

| # | Item | Onde aparece | Fonte a consultar |
|---|---|---|---|
| P1 | Tabela vigente de taxas da DNM (residência temporária, permanente, carnê, multas). Valor citado por terceiros: Gs. 2.926.925 (01/07/2026). | Aula 3.7; Simulador (linha "Taxas migratórias"); FAQ | migraciones.gov.py — aranceles |
| P2 | Lista oficial e atual de documentos da residência temporária para brasileiros e validade aceita de cada certidão. | Aulas 2.3, 3.4; Checklist 13 | migraciones.gov.py — trâmite de residência temporal |
| P3 | Texto da Resolução DNM 407/2026 (categorias, documentos de solvência, prazos de pedido da permanente e multa por atraso). | Aulas 3.3, 3.9; FAQ | migraciones.gov.py / Gaceta Oficial |
| P4 | Dez requisitos e custo da cédula para estrangeiros (resolução de agosto de 2026). | Aula 3.8 | identificaciones.gov.py |
| P5 | Regras de ausência do país na residência temporária e permanente (relatos de terceiros: 12 meses consecutivos na temporária). | Aula 3.9 | Ley 6984/2022 (BACN) e DNM |
| P6 | Conclusão da orientação da DNIT "IRP — ingresos provenientes del exterior" e critérios de residência fiscal paraguaia. | Aulas 10.1, 10.2, 10.8 | dnit.gov.py |
| P7 | Lista atual de acordos para evitar dupla tributação em vigor no Brasil (confirmar ausência do Paraguai). | Aula 10.9; FAQ | Receita Federal |
| P8 | Alíquotas de IOF-câmbio vigentes para remessa a conta própria e investimento. | Aula 6.5; Comparador de Remessas | Receita Federal / Decreto vigente |
| P9 | Alíquotas atuais de IRRF para não residentes por tipo de rendimento e aplicação prática da decisão do STF (Tema 1174) pelo INSS. | Aula 10.3 | Receita Federal, INSS |
| P10 | Pisos e condições do Paraguay Investor Pass (Resolução MIC 283/2026) diretamente no texto oficial. | Aulas 3.3, 7.4, 7.5 | mic.gov.py / suace.gov.py |

## Prioridade média

| # | Item | Onde aparece | Fonte a consultar |
|---|---|---|---|
| M1 | População 2022 de Ciudad del Este, San Lorenzo, Lambaré e Encarnación (distritos). | Aulas 1.6, 5.3, 5.4, 5.5 | INE — população por distrito |
| M2 | Prazo de permanência concedido a visitantes brasileiros. | Aula 3.1 | DNM |
| M3 | Política de horário do Paraguai (horário fixo adotado em 2024) e diferença para Brasília. | Aulas 1.3, 9.5 | Fonte oficial paraguaia |
| M4 | Itens com IVA de 5% e incidência de IVA em locação residencial. | Aulas 4.2, 8.5 | DNIT |
| M5 | Regimes do IRE para pequenos contribuintes (limites do regime simplificado) e limite de obrigatoriedade do IRP. | Aulas 8.5, 10.4 | DNIT |
| M6 | Regras de aguinaldo, férias e indenização (para o cálculo do custo de empregado). | Aula 8.8; Viabilidade (planilha 25) | MTESS — calculadoras |
| M7 | Uso da CNH brasileira e conversão para licença municipal. | Aula 11.5 | Municipalidad / ANTSV |
| M8 | Requisitos sanitários para entrada de animais e raças com restrição relatada. | Aula 2.5 | SENACSA |
| M9 | Procedimento de reconhecimento de estudos do exterior (escola e ensino superior). | Aulas 9.3, 11.4 | MEC / CONES |
| M10 | Regras de veículo de residente e bens de mudança na Aduana. | Aula 2.6 | DNIT — Aduanas |
| M11 | Valor atualizado da garantia de depósitos (75 salários mínimos) e condições. | Aula 7.3 | BCP — depósitos garantizados |
| M12 | Número de emergência policial (911) e números de ambulância e bombeiros. | Aula 11.1 | Policía Nacional / MSPBS |
| M13 | Tarifa vigente de ônibus na região metropolitana e meio de pagamento. | Aula 4.5 | Viceministerio de Transporte / municipalidades |
| M14 | Situação, em 2026, do projeto de lei de nacionalidade e forma de contagem dos 3 anos. | Aula 3.2 | Congreso Nacional (SILpy) |

## Valores de mercado que envelhecem rápido

Atualize a cada nova edição: câmbio de referência (Gs./R$ e Gs./US$), salário mínimo, inflação e Taxa de Política Monetária, anúncios de aluguel, preços de internet e combustível. Esses valores estão em `referencias/base-de-pesquisa.md` (seções 3, 4 e 8), nas Aulas 1.2, 4.2, 4.4, 4.5, 6.6 e em `scripts/produto/xlsx/common.mjs` (constante `CAMBIO`).

## Pendências de material (não são de pesquisa)

| # | Item | Situação |
|---|---|---|
| A1 | Fotografias autênticas do Paraguai | O repositório tem imagens geradas por IA (renderizações). Foram usadas como textura e capa. Recomenda-se substituir por fotos reais licenciadas. |
| A2 | Fontes Manrope e Inter da identidade original | Não disponíveis no ambiente (sem rede). Os materiais usam Noto Sans e Lato (licença OFL), embutidas nos PDFs. |
| A3 | Prints de conversa no estilo WhatsApp na raiz do repositório | Dez imagens "Imagem do ChatGPT 30 de out. de 2026" simulam depoimentos. **Não foram usadas** em nenhum material. Não devem ser publicadas como prova social. |
| A4 | Imagem "Comunidade Paraguay em 3D" e selo "Garantia em 7 dias" | Não foram usados nos entregáveis: não há comunidade disponibilizada e a garantia depende da oferta real. |
