/**
 * WhatsAppTestimonials.tsx
 * Carrossel de prints de WhatsApp — React + Embla + Framer Motion + Lucide.
 *
 * - Lê uma lista CONFIGURÁVEL de imagens (props.items).
 * - 1 print por vez no mobile, ~15% do próximo visível.
 * - Swipe no dedo (Embla), setas, dots, lightbox, teclado, lazy-load.
 * - Placeholder "Adicionar print real" quando item.real === false.
 *
 * NÃO contém depoimentos/nomes/mensagens inventados: só renderiza o que
 * você colocar em `items`. Troque .svg por .webp ao inserir prints reais.
 */
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type Testimonial = {
  src: string;
  alt: string;
  /** true = print real; false = placeholder neutro "Adicionar print real" */
  real?: boolean;
};

type Props = {
  items: Testimonial[];
  title?: string;
  subtitle?: string;
};

export default function WhatsAppTestimonials({
  items,
  title = "VEJA O QUE ESTÃO FALANDO SOBRE O MÉTODO PARAGUAY",
  subtitle = "Confira experiências compartilhadas por quem já conhece o nosso conteúdo.",
}: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    loop: false,
    dragFree: false,
    containScroll: "trimSnaps",
  });
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState<Testimonial | null>(null);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  // Fecha o lightbox com Escape
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  // Navegação por teclado no carrossel
  const onTrackKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollNext();
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollPrev();
    }
  };

  return (
    <section
      className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-b from-green-deep to-[#132019]"
      aria-labelledby="testi-title"
    >
      <div className="mx-auto w-full max-w-[1180px] px-5">
        <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.22em] text-gold">
          Provas sociais
        </p>
        <h2
          id="testi-title"
          className="text-center font-title text-2xl font-extrabold md:text-4xl"
        >
          {title}
        </h2>
        <p className="mx-auto mb-8 mt-2 max-w-[48ch] text-center text-ivory/70">
          {subtitle}
        </p>

        <div className="relative">
          {/* viewport */}
          <div
            className="overflow-hidden"
            ref={emblaRef}
            tabIndex={0}
            role="region"
            aria-roledescription="carrossel"
            aria-label="Prints de conversas do WhatsApp"
            onKeyDown={onTrackKey}
          >
            {/* track */}
            <div className="flex gap-4 px-0.5 py-1.5">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="min-w-0 shrink-0 grow-0 basis-[85%] md:basis-[360px]"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} de ${items.length}`}
                >
                  <figure
                    className="relative aspect-[9/16] cursor-zoom-in overflow-hidden rounded-[18px] border border-gold/30 bg-green-secondary shadow-soft"
                    tabIndex={0}
                    role="button"
                    aria-label={`Ampliar ${item.alt}`}
                    onClick={() => setLightbox(item)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setLightbox(item);
                      }
                    }}
                  >
                    <img
                      src={item.src}
                      alt={item.alt}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full bg-green-secondary object-contain"
                    />
                    {item.real === false && (
                      <span className="absolute bottom-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-1 text-[0.68rem] font-bold tracking-wider text-green-deep">
                        ADICIONAR PRINT REAL
                      </span>
                    )}
                  </figure>
                </div>
              ))}
            </div>
          </div>

          {/* controles */}
          <div className="mt-1.5 flex items-center justify-center gap-[18px]">
            <button
              type="button"
              aria-label="Print anterior"
              onClick={scrollPrev}
              className="grid h-[46px] w-[46px] place-items-center rounded-full border border-gold/40 bg-ivory/[0.08] text-gold transition hover:scale-105 hover:bg-gold/20"
            >
              <ChevronLeft size={22} />
            </button>

            <div className="flex items-center gap-2" role="tablist" aria-label="Posição no carrossel">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Ir para o print ${i + 1}`}
                  aria-current={selected === i}
                  onClick={() => scrollTo(i)}
                  className={
                    "h-2 rounded-full transition-all " +
                    (selected === i ? "w-[22px] bg-gold" : "w-2 bg-ivory/30")
                  }
                />
              ))}
            </div>

            <button
              type="button"
              aria-label="Próximo print"
              onClick={scrollNext}
              className="grid h-[46px] w-[46px] place-items-center rounded-full border border-gold/40 bg-ivory/[0.08] text-gold transition hover:scale-105 hover:bg-gold/20"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(8,13,11,0.92)] p-5 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Print ampliado"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setLightbox(null);
            }}
          >
            <button
              type="button"
              aria-label="Fechar"
              onClick={() => setLightbox(null)}
              className="absolute right-[18px] top-[18px] grid h-[46px] w-[46px] place-items-center rounded-full border border-gold/40 bg-ivory/[0.12] text-ivory"
            >
              <X size={24} />
            </button>
            <motion.img
              src={lightbox.src}
              alt={lightbox.alt}
              className="max-h-[86vh] max-w-full rounded-[14px] object-contain shadow-soft"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
