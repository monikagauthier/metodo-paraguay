# Método Paraguay — Produto completo (entregáveis e área de membros)

Este documento explica o que foi produzido, como usar, como publicar e como manter o produto. A página de vendas continua documentada no [README.md](README.md).

## O que existe

| Item | Onde | Quantidade |
|---|---|---|
| Conteúdo integral das aulas (fonte editável, Markdown) | `conteudo/modulo-01` … `modulo-12` | 12 módulos, 115 aulas |
| Extras (apresentação, estudos de caso, glossário, FAQ, plano de 13 semanas, frases, espanhol prático, perguntas ao contador, fluxogramas fiscais) | `conteudo/extras/` | 13 arquivos |
| Manual Mestre e guias temáticos (PDF editorial, sumário clicável com páginas, marcadores, links) | `entregaveis/manuais/`, `entregaveis/guias/` | 15 PDFs + 2 PDFs de bônus |
| Checklists e documentos preenchíveis (PDF com campos AcroForm) | `entregaveis/checklists/`, `entregaveis/modelos/30-…`, `entregaveis/planilhas/26-….pdf`, bônus 04 e 05 | 13 PDFs |
| Planilhas com fórmulas, validação, proteção sem senha e gráficos | `entregaveis/planilhas/`, bônus 01 e 04 | 11 XLSX |
| Modelos editáveis | `entregaveis/modelos/` | 2 DOCX |
| Área de membros | `plataforma/` | 1 aplicação estática |
| Base de pesquisa, diretório oficial e pendências | `referencias/` | 3 arquivos |
| Inventário | `INVENTARIO.md`, `distribuicao/inventario.csv` | 43 itens |
| Pacote final | `distribuicao/metodo-paraguay-v1.0.zip` | 1 ZIP |
| Relatório de qualidade e pendências | `RELATORIO-QUALIDADE.md` | — |

A lista completa, com caminho, tamanho e status de validação de cada arquivo, está no [INVENTARIO.md](INVENTARIO.md).

## Como usar (aluno)

1. Abra `plataforma/index.html` no navegador, ou acesse a área de membros publicada.
2. Siga os módulos na ordem. Em cada aula, marque os itens do checklist e clique em **Concluir aula**.
3. Baixe os materiais na **Biblioteca**. PDFs preenchíveis: use o Adobe Acrobat Reader para preencher e salvar. Planilhas: Excel ou Google Sheets.
4. Use o **Plano de ação** e o documento **Meu Plano Paraguay** para transformar o curso em execução.

O progresso fica salvo no navegador (localStorage). A página **Progresso** permite exportar e importar um arquivo para levar o progresso a outro aparelho.

## Como publicar a área de membros

A área de membros é estática: HTML, CSS e JavaScript sem dependências e sem build. Ela precisa ser publicada **junto** com as pastas `entregaveis/` e `assets/produto/`, preservando a estrutura:

```
(raiz publicada)/
├── plataforma/          ← área de membros (index.html)
├── entregaveis/         ← arquivos para download
└── assets/produto/      ← fontes e imagens usadas pela plataforma e pelos PDFs
```

O jeito mais simples é descompactar `distribuicao/metodo-paraguay-v1.0.zip` em qualquer hospedagem estática e apontar o acesso para `plataforma/index.html`.

### Controle de acesso: o que NÃO está incluído

Não havia autenticação, banco de dados nem integração de pagamento no repositório, e nada disso foi inventado. Para restringir o acesso a compradores, use um recurso real da sua hospedagem ou da plataforma de checkout, por exemplo:

- área de membros da própria plataforma de vendas (hospedando os arquivos ou incorporando o link);
- hospedagem com proteção por senha ou por login (por exemplo, recursos de autenticação do provedor);
- entrega do ZIP por e-mail transacional após a compra.

Enquanto não houver controle de acesso, quem tiver o endereço consegue abrir a área de membros e baixar os arquivos.

## Como gerar tudo de novo

Requisitos: Node.js 18+, Java 17+ (somente para validação de OOXML e utilitário de imagens), e o Chromium usado pelo Playwright (`playwright-core`). No ambiente original, o caminho do Playwright e do Chromium headless é detectado automaticamente; em outra máquina, defina:

```bash
export PLAYWRIGHT_CORE=/caminho/para/node_modules/playwright-core
export CHROME_PATH=/caminho/para/chrome-headless-shell   # ou chrome
```

Comandos:

```bash
npm run produto:xlsx        # 11 planilhas + verificação de fórmulas
npm run produto:docx        # 2 modelos DOCX
npm run produto:pdf         # manuais e guias (2 passagens para numerar o sumário)
npm run produto:forms       # PDFs preenchíveis
npm run produto:plataforma  # plataforma/data/dados.js
npm run produto:testar      # testes automatizados da área de membros
npm run produto:distribuir  # inventário + ZIP
npm run produto:build       # tudo, na ordem
java scripts/tools/OoxmlCheck.java entregaveis/planilhas/*.xlsx entregaveis/modelos/*.docx
```

Nenhum pacote npm precisa ser instalado: os geradores de PDF, XLSX, DOCX e ZIP são próprios (pasta `scripts/produto/lib/`).

## Como manter

### Atualizar conteúdo

1. Edite o Markdown em `conteudo/modulo-XX/modulo-XX.md`. Cada aula começa com `# Aula N.N — Título` e segue o roteiro de seções `##`.
2. Recursos do dialeto: tabelas, listas, checklists (`- [ ] item`), quadros (`> [!verificar]`, `> [!atencao]`, `> [!dica]`, `> [!importante]`, `> [!legal]`) e fluxogramas (bloco `:::fluxo Título` com linhas `Etapa | descrição`).
3. Evite os caracteres ≈, ≥, ≤ e setas (→): a fonte embutida não tem esses glifos. Use "~", "a partir de", "até" e texto.
4. Rode `npm run produto:pdf`, `npm run produto:plataforma` e `npm run produto:distribuir`.

### Atualizar valores de referência

Câmbio, salário mínimo, inflação, anúncios e preços mudam. Os pontos de atualização estão listados em `referencias/pendencias-verificacao.md` (seção "Valores de mercado"). O câmbio usado nos exemplos das planilhas fica em `scripts/produto/xlsx/common.mjs` (`CAMBIO`).

### Atualizar a edição

Troque a data em `scripts/produto/lib/doc.mjs` (`EDICAO`) e regenere tudo com `npm run produto:build`.

### Acrescentar um arquivo à biblioteca

Inclua a entrada em `scripts/produto/biblioteca.mjs` (id, nome, caminho, formato, categoria, descrição e módulos). A plataforma, o inventário e o ZIP passam a incluí-lo.

## Estrutura de pastas

```
conteudo/            fonte editável das aulas e extras
entregaveis/         arquivos finais (manuais, guias, checklists, planilhas, modelos, bonus)
plataforma/          área de membros (index.html, css, js, data/dados.js gerado)
assets/produto/      imagens otimizadas da marca e fontes (OFL)
referencias/         base de pesquisa, diretório oficial (JSON) e pendências
distribuicao/        ZIP final e inventário em CSV
scripts/produto/     geradores, configurações e testes
scripts/tools/       utilitários Java (imagens e validação OOXML)
```

## Licenças de fontes

Noto Sans e Lato são distribuídas sob a SIL Open Font License 1.1 e foram embutidas nos PDFs e usadas na plataforma.
