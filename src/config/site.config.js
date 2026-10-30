/**
 * SITE CONFIG — edite este arquivo para trocar imagens, preço e checkout.
 * Nada aqui é inventado: o checkout começa vazio e precisa ser preenchido
 * com a URL real do seu gateway.
 */

export const CONFIG = {
  marca: "PARAGUAY",
  produto: "Método Paraguay",
  slogan: "Inteligência sem fronteiras.",

  // === CHECKOUT ===
  // Cole aqui a URL real do seu checkout (Hotmart, Kiwify, Eduzz, etc.).
  // Em build com Vite, prefira import.meta.env.VITE_CHECKOUT_URL.
  // Enquanto estiver vazio, os botões ficam desabilitados e avisam no console.
  checkoutUrl: "",

  // === PREÇO ===
  preco: "R$ 9,90",
  // Só preencha precoAnterior se o preço de R$ 97,00 foi REALMENTE praticado.
  // Deixe como null para exibir apenas "Oferta especial de lançamento".
  precoAnterior: null, // ex.: "R$ 97,00"

  // === GARANTIA ===
  // Deixe true SOMENTE se a oferta realmente oferece 7 dias de reembolso.
  garantia7Dias: true,

  // === BASE DOS ASSETS ===
  assetsBase: "/assets/paraguay",

  // === PROVAS SOCIAIS (WhatsApp) ===
  // Lista configurável. Adicione/remova/reordene livremente.
  // Troque .svg por .webp quando colar os prints reais.
  // `real: false` => mostra placeholder "Adicionar print real".
  depoimentos: [
    { src: "/assets/paraguay/depoimentos/depoimento-01.svg", alt: "Print de conversa 01", real: false },
    { src: "/assets/paraguay/depoimentos/depoimento-02.svg", alt: "Print de conversa 02", real: false },
    { src: "/assets/paraguay/depoimentos/depoimento-03.svg", alt: "Print de conversa 03", real: false },
    { src: "/assets/paraguay/depoimentos/depoimento-04.svg", alt: "Print de conversa 04", real: false },
    { src: "/assets/paraguay/depoimentos/depoimento-05.svg", alt: "Print de conversa 05", real: false },
    { src: "/assets/paraguay/depoimentos/depoimento-06.svg", alt: "Print de conversa 06", real: false },
    { src: "/assets/paraguay/depoimentos/depoimento-07.svg", alt: "Print de conversa 07", real: false },
    { src: "/assets/paraguay/depoimentos/depoimento-08.svg", alt: "Print de conversa 08", real: false },
    { src: "/assets/paraguay/depoimentos/depoimento-09.svg", alt: "Print de conversa 09", real: false },
    { src: "/assets/paraguay/depoimentos/depoimento-10.svg", alt: "Print de conversa 10", real: false },
  ],
};
