# Método Paraguay — Página de Vendas

> **Produto completo (aulas, manuais, planilhas, checklists, bônus e área de membros):** veja [README-PRODUTO.md](README-PRODUTO.md), [INVENTARIO.md](INVENTARIO.md) e [RELATORIO-QUALIDADE.md](RELATORIO-QUALIDADE.md).

Página de vendas mobile-first para o **Método Paraguay** — _Inteligência sem fronteiras._

Entregue em **duas versões coerentes** que compartilham os mesmos assets, paleta e estrutura:

| Versão | Para quê | Como rodar |
|---|---|---|
| **Vanilla** (`index.html` + `src/`) | Abre direto no navegador, sem build, sem dependências. É a que foi testada e validada neste ambiente. | `npm run serve:static` e abra `http://localhost:8080` |
| **React + Vite + TS + Tailwind** | Stack pedido no briefing (Framer Motion, Lucide, Embla). Pronta para `npm install` quando houver acesso ao registro npm. | `npm install && npm run dev` |

> **Por que duas versões?** O ambiente onde a página foi construída está em modo
> `INTEGRATIONS_ONLY` — sem acesso ao registro npm nem a CDNs, então
> React/Vite/Tailwind/Framer/Embla **não puderam ser instalados aqui**. Para não
> entregar algo não testado, a versão **vanilla** replica 100% do comportamento e
> do visual e foi validada no navegador (headless Chromium, 320→1440px). A versão
> **React** está completa em código e espelha os mesmos componentes — basta
> instalar as dependências num ambiente com rede.

---

## Paleta e tipografia

- Verde profundo `#101A17` · Verde secundário `#263D33`
- Dourado `#D8B76E` · Dourado luminoso `#F0CC7C`
- Marfim `#F5F1E8` · Branco `#FFFFFF`
- Títulos: **Manrope** · Texto: **Inter** (com fallback `system-ui` — o ambiente
  não tem acesso ao Google Fonts; para carregar as fontes reais em produção, veja
  "Fontes" abaixo).

---

## Estrutura da página (ordem exata, vertical contínua no mobile)

Hero → Por que o Paraguai → Conheça o Método → Módulos → Bônus →
**Provas sociais (WhatsApp)** → Oferta → Garantia → FAQ → Rodapé.

---

## Como trocar as imagens

Todos os assets ficam em **`/public/assets/paraguay/`**. Hoje são **placeholders SVG
rotulados** (ex.: "FOTO: ASSUNÇÃO AO PÔR DO SOL", "ADICIONAR PRINT REAL"). Para
publicar, substitua pelos arquivos reais mantendo o nome, ou aponte o novo nome no
config.

```
public/assets/paraguay/
├── hero-asuncion.svg          → hero-asuncion.webp      (Assunção ao pôr do sol)
├── bandeira-paraguai.svg      → bandeira-paraguai.webp
├── asuncion-crescimento.svg   → asuncion-crescimento.webp
├── mockups/
│   ├── ebook-3d.svg           → ebook-3d.webp (PNG com transparência)
│   ├── notebook.svg           → notebook.webp
│   ├── smartphone.svg         → smartphone.webp
│   └── tablet.svg             → tablet.webp (opcional)
├── modulo-01.svg … modulo-06.svg
├── caixa-presente.svg         → caixa-presente.webp (preta e dourada)
├── oferta-skyline.svg         → oferta-skyline.webp
├── selo-garantia.svg          → selo-garantia.webp (3D dourado)
└── depoimentos/
    └── depoimento-01.svg … depoimento-10.svg  → .webp (prints reais)
```

### Prints do WhatsApp (provas sociais)

1. Coloque os arquivos em `public/assets/paraguay/depoimentos/` como
   `depoimento-01.webp` … `depoimento-10.webp`.
2. Edite a lista em **`src/config/site.config.js`** (vanilla) ou
   **`src/config/site.config.ts`** (React): troque `.svg` por `.webp` e mude
   `real: false` → `real: true` em cada item inserido.
3. A lista é totalmente configurável — adicione, remova ou reordene à vontade.

> **Importante:** enquanto `real: false`, cada slide mostra um placeholder neutro
> "Adicionar print real". **Nada de conversas, nomes ou mensagens inventadas** —
> apenas o que você inserir. Publique só prints com autorização de uso e com dados
> pessoais protegidos.

---

## Onde configurar o checkout

Não há URL inventada. Defina a URL **real** do seu gateway em UM destes lugares:

- **Vanilla:** `src/config/site.config.js` → campo `checkoutUrl`.
- **React:** variável de ambiente `VITE_CHECKOUT_URL` (copie `.env.example` → `.env`),
  ou o campo `checkoutUrl` em `src/config/site.config.ts`.

Enquanto a URL estiver vazia, **todos os botões de compra ficam desabilitados** e
avisam no console — para você não publicar um CTA que não leva a lugar nenhum.

---

## Preço, oferta e garantia (config)

Em `site.config.*`:

- `preco`: `"R$ 9,90"`.
- `precoAnterior`: deixe `null` → exibe **"Oferta especial de lançamento"**.
  Só preencha (`"R$ 97,00"`) se esse preço foi **realmente praticado** (exibe riscado).
- `garantia7Dias`: `true` só se a oferta realmente tem 7 dias de reembolso
  (`false` esconde a seção de garantia).

---

## Fontes (produção)

O fallback atual é `system-ui`. Para as fontes reais, adicione ao `<head>` de
`index.html` (e `index-react.html`):

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

Ou, melhor para performance, auto-hospede os `.woff2` e declare `@font-face`.

---

## Scripts

```bash
npm run serve:static     # servidor estático da versão vanilla (porta 8080)
npm run gen:placeholders # regenera os SVGs placeholder
npm run verify:assets    # confere se todo asset referenciado existe (sem imagem quebrada)

# versão React (requer npm install com acesso à rede):
npm run dev              # servidor de desenvolvimento Vite
npm run build            # build de produção
```

---

## Acabamento implementado

- Mobile-first (base 390px), validado em 320/375/390/430/768/1024/1440px.
- **Sem rolagem horizontal da página** (a única rolagem horizontal é o carrossel).
- Carrossel WhatsApp: swipe, setas, dots, lightbox, Esc/teclado, lazy-load,
  ~15% do próximo print visível no mobile, proporção preservada.
- FAQ accordion acessível (ARIA).
- CTA fixo no rodapé mobile (some no topo, aparece após o hero; oculto no desktop).
- Animações discretas ao rolar (IntersectionObserver) com fallback: sem JS, o
  conteúdo aparece normalmente (nunca tela em branco).
- `prefers-reduced-motion` respeitado.
- SEO: `<title>`, meta description, Open Graph, `lang="pt-BR"`, HTML semântico.

Veja **`RELATORIO.md`** para o relatório de pendências e testes.
