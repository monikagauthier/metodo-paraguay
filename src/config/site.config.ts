/**
 * Config TypeScript para a versão React/Vite.
 * (A versão vanilla usa site.config.js — mantenha os dois em sincronia
 *  ou migre tudo para este arquivo ao adotar o build React.)
 */
import type { Testimonial } from "../components/WhatsAppTestimonials";

export const CONFIG = {
  marca: "PARAGUAY",
  produto: "Método Paraguay",
  slogan: "Inteligência sem fronteiras.",

  // Prefira variável de ambiente Vite: VITE_CHECKOUT_URL
  checkoutUrl: import.meta.env.VITE_CHECKOUT_URL ?? "",

  preco: "R$ 9,90",
  precoAnterior: null as string | null, // só se R$ 97,00 foi realmente praticado
  garantia7Dias: true,

  assetsBase: "/assets/paraguay",

  depoimentos: Array.from({ length: 10 }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    return {
      src: `/assets/paraguay/depoimentos/depoimento-${n}.svg`, // troque para .webp
      alt: `Print de conversa ${n}`,
      real: false,
    } satisfies Testimonial;
  }),
};
