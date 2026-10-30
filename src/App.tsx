/**
 * App.tsx — composição da página de vendas Método Paraguay (versão React).
 * Espelha a versão vanilla (index.html). Seções em ordem vertical contínua.
 */
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Zap, ShieldCheck, BadgeCheck, TrendingUp, Landmark, FileCheck,
  MapPin, Globe, Check, ArrowRight, Plus,
} from "lucide-react";
import { CONFIG } from "./config/site.config";
import WhatsAppTestimonials from "./components/WhatsAppTestimonials";

/* ---------- helpers ---------- */
function useCheckout() {
  const url = CONFIG.checkoutUrl;
  const go = () => {
    if (url) window.location.href = url;
    else console.warn("[Método Paraguay] checkoutUrl vazio — configure VITE_CHECKOUT_URL.");
  };
  return { url, go, disabled: !url };
}

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.12 });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function CtaButton({ label }: { label: string }) {
  const { go, disabled } = useCheckout();
  return (
    <button
      type="button"
      onClick={go}
      disabled={disabled}
      title={disabled ? "Configure VITE_CHECKOUT_URL" : undefined}
      className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-gold-grad px-7 py-4 font-title text-base font-extrabold text-green-deep shadow-gold transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:grayscale"
    >
      {label} <span data-price>{CONFIG.preco}</span>
      <ArrowRight size={18} className="transition group-hover:translate-x-1" />
    </button>
  );
}

const ASSET = CONFIG.assetsBase;

/* ---------- página ---------- */
export default function App() {
  const [stickyVisible, setStickyVisible] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setStickyVisible(!e.isIntersecting),
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const benefits = [
    { icon: TrendingUp, t: "Ambiente econômico", d: "Um mercado em movimento, com oportunidades em diferentes setores." },
    { icon: Landmark, t: "Sistema tributário", d: "Entenda as particularidades do modelo de tributação local." },
    { icon: FileCheck, t: "Residência legal", d: "Conheça as possibilidades de residência previstas em lei." },
    { icon: MapPin, t: "Qualidade de vida", d: "Aspectos do dia a dia que pesam na hora de decidir." },
    { icon: Globe, t: "Localização no Mercosul", d: "Posição estratégica no centro da América do Sul." },
  ];

  const modules = [
    { n: "01", t: "Panorama do Paraguai", d: "Visão geral do país, contexto e pontos de partida." },
    { n: "02", t: "Residência legal", d: "Possibilidades de residência previstas na legislação." },
    { n: "03", t: "Tributação", d: "Como funciona o sistema tributário e suas particularidades." },
    { n: "04", t: "Abrir empresas", d: "Caminhos para estruturar um negócio no país." },
    { n: "05", t: "Custo de vida", d: "Referências do dia a dia para planejar sua mudança." },
    { n: "06", t: "Planejamento financeiro", d: "Organização financeira para decisões mais conscientes." },
  ];

  const bonuses = [
    { t: "Checklists práticos", d: "Listas para acompanhar cada etapa do processo." },
    { t: "Modelos de documentos", d: "Modelos prontos para você adaptar ao seu caso." },
    { t: "Mapa de oportunidades", d: "Um panorama visual dos caminhos possíveis." },
    { t: "Comunidade de alunos", d: "Espaço para trocar experiências com outros alunos." },
  ];

  const faqs = [
    { q: "O Método Paraguay é indicado para quem?", a: "Para quem tem interesse em entender residência, tributação, negócios e qualidade de vida no Paraguai de forma organizada, antes de tomar decisões." },
    { q: "Como recebo o acesso ao conteúdo?", a: "O conteúdo é digital e o acesso é liberado após a confirmação do pagamento, pela plataforma do checkout." },
    { q: "O conteúdo é atualizado?", a: "O material reflete o conteúdo disponível no momento da compra. Eventuais atualizações, quando houver, são informadas na própria plataforma." },
    { q: "Tenho suporte se precisar?", a: "O suporte disponível é referente ao acesso e à entrega do conteúdo, pelos canais de contato informados na compra." },
    { q: "Posso pedir reembolso?", a: "Sim. Dentro do prazo de 7 dias a partir da compra, você pode solicitar o reembolso conforme a política da oferta." },
    { q: "Preciso morar no Paraguai para utilizar o método?", a: "Não. O conteúdo é informativo e pode ser estudado de onde você estiver, para apoiar suas decisões." },
    { q: "O método ensina sobre residência e abertura de empresas?", a: "Sim. Há módulos dedicados a residência legal e à estruturação de empresas, apresentando os caminhos de forma organizada. Não substitui orientação profissional individualizada." },
  ];

  return (
    <div className="font-body">
      {/* ===== HERO ===== */}
      <header ref={heroRef} className="relative flex min-h-[100svh] items-end overflow-hidden pb-14">
        <div className="absolute inset-0 z-0">
          <img src={`${ASSET}/hero-asuncion.svg`} alt="Vista de Assunção ao pôr do sol" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-green-deep/25 via-green-deep/75 to-green-deep/95" />
        </div>
        <div className="absolute left-0 right-0 top-0 z-[5] flex items-center justify-between p-5">
          <span className="font-title text-lg font-extrabold tracking-[0.3em] text-ivory">PARAGUAY<span className="text-gold">.</span></span>
        </div>
        <img src={`${ASSET}/bandeira-paraguai.svg`} alt="Bandeira do Paraguai" className="absolute right-[18px] top-[86px] z-[2] w-[92px] rounded-lg border border-ivory/20 shadow-soft md:w-[120px]" />
        <div className="relative z-[3] mx-auto w-full max-w-[1180px] px-5">
          <div className="mb-6 flex flex-wrap gap-2.5">
            {[["Acesso imediato", Zap], ["Compra segura", ShieldCheck], ["Garantia de 7 dias", BadgeCheck]].map(([label, Icon]) => {
              const I = Icon as typeof Zap;
              return (
                <span key={label as string} className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-ivory/[0.08] px-3 py-1.5 text-xs font-semibold backdrop-blur">
                  <I size={15} className="text-gold" /> {label as string}
                </span>
              );
            })}
          </div>
          <h1 className="mb-4 font-title text-4xl font-extrabold leading-tight md:text-6xl">
            DESCUBRA UM NOVO HORIZONTE DE <span className="text-gold">OPORTUNIDADES</span>
          </h1>
          <p className="mb-6 max-w-[46ch] text-ivory/85">
            Tudo o que você precisa saber sobre residência, impostos, negócios e qualidade de vida no Paraguai, em um único guia.
          </p>
          <CtaButton label="QUERO ACESSO POR" />
        </div>
      </header>

      <main>
        {/* ===== POR QUE O PARAGUAI ===== */}
        <section className="bg-ivory py-16 text-green-deep md:py-24">
          <div className="mx-auto w-full max-w-[1180px] px-5 md:grid md:grid-cols-2 md:items-center md:gap-10">
            <Reveal>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#8a7338]">Por que o Paraguai?</p>
              <h2 className="mb-2.5 font-title text-3xl font-extrabold md:text-4xl">UM PAÍS EM PLENO CRESCIMENTO</h2>
              <div className="my-6 aspect-[5/4] overflow-hidden rounded-[18px] shadow-soft md:my-0">
                <img src={`${ASSET}/asuncion-crescimento.svg`} alt="Cidade de Assunção em desenvolvimento" loading="lazy" className="h-full w-full object-cover" />
              </div>
            </Reveal>
            <Reveal className="grid gap-3.5">
              {benefits.map(({ icon: Icon, t, d }) => (
                <div key={t} className="flex items-start gap-3.5 rounded-xl border border-green-deep/10 bg-white p-4 shadow-[0_4px_14px_rgba(16,26,23,0.05)]">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-green-deep text-gold"><Icon size={22} /></span>
                  <div>
                    <h3 className="font-title text-base font-extrabold">{t}</h3>
                    <p className="text-sm text-[#46514b]">{d}</p>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* ===== CONHEÇA O MÉTODO ===== */}
        <section className="bg-[radial-gradient(120%_90%_at_50%_0%,#1b2d27_0%,#101A17_60%)] py-16 text-center md:py-24">
          <div className="mx-auto w-full max-w-[1180px] px-5">
            <Reveal>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-gold">O produto</p>
              <h2 className="mb-3.5 font-title text-3xl font-extrabold md:text-4xl">CONHEÇA O MÉTODO PARAGUAY</h2>
              <p className="mx-auto mb-7 max-w-[54ch] text-ivory/80">Um guia completo, prático e organizado para você conhecer possibilidades e tomar decisões mais conscientes.</p>
            </Reveal>
            <Reveal className="my-8 grid gap-4 md:grid-cols-3 md:items-end">
              <div className="rounded-[18px] border border-gold/20 bg-gradient-to-br from-green-secondary/60 to-green-deep/60 p-4 shadow-soft md:col-span-3 md:mx-auto md:max-w-[520px]">
                <img src={`${ASSET}/mockups/ebook-3d.svg`} alt="Livro digital Método Paraguay em 3D" loading="lazy" className="mx-auto max-h-[360px] w-auto object-contain drop-shadow-2xl" />
              </div>
              {[["notebook", "notebook"], ["smartphone", "smartphone"], ["tablet", "tablet"]].map(([f, n]) => (
                <div key={f} className="rounded-[18px] border border-gold/20 bg-gradient-to-br from-green-secondary/60 to-green-deep/60 p-4 shadow-soft">
                  <img src={`${ASSET}/mockups/${f}.svg`} alt={`Método Paraguay em ${n}`} loading="lazy" className="mx-auto max-h-[300px] w-auto object-contain drop-shadow-2xl" />
                </div>
              ))}
            </Reveal>
            <Reveal className="mx-auto grid max-w-[520px] gap-3 text-left">
              {["Passo a passo detalhado", "Linguagem simples e objetiva", "Conteúdo organizado por módulos", "Materiais complementares"].map((b) => (
                <div key={b} className="flex items-center gap-3 rounded-xl border border-gold/15 bg-ivory/5 px-4 py-3.5 text-sm">
                  <Check size={20} className="shrink-0 text-gold" /> {b}
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* ===== MÓDULOS ===== */}
        <section className="bg-green-deep py-16 md:py-24">
          <div className="mx-auto w-full max-w-[1180px] px-5">
            <Reveal>
              <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.22em] text-gold">Conteúdo</p>
              <h2 className="mb-2 text-center font-title text-3xl font-extrabold md:text-4xl">O QUE VOCÊ VAI APRENDER</h2>
              <p className="mx-auto mb-8 max-w-[50ch] text-center text-ivory/70">Seis módulos organizados para você avançar com clareza, do panorama geral às decisões financeiras.</p>
            </Reveal>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {modules.map((m) => (
                <Reveal key={m.n}>
                  <article className="grid grid-cols-[92px_1fr_auto] items-center gap-3.5 rounded-[18px] border border-gold/15 bg-gradient-to-br from-[#1a2a24] to-[#14211c] p-3.5 shadow-soft transition hover:-translate-y-1 hover:border-gold/50">
                    <div className="h-[72px] w-[92px] overflow-hidden rounded-[10px]">
                      <img src={`${ASSET}/modulo-${m.n}.svg`} alt={m.t} loading="lazy" className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <span className="font-title text-[0.72rem] font-extrabold tracking-[0.18em] text-gold">MÓDULO {m.n}</span>
                      <h3 className="my-0.5 font-title text-base font-extrabold">{m.t}</h3>
                      <p className="text-[0.84rem] text-ivory/70">{m.d}</p>
                    </div>
                    <ArrowRight size={22} className="shrink-0 text-gold" />
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ===== BÔNUS ===== */}
        <section className="bg-[radial-gradient(130%_80%_at_80%_10%,#1d2f28_0%,#101A17_55%)] py-16 md:py-24">
          <div className="mx-auto w-full max-w-[1180px] px-5">
            <Reveal>
              <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.22em] text-gold">Vai além do guia</p>
              <h2 className="mb-7 text-center font-title text-3xl font-extrabold md:text-4xl">BÔNUS EXCLUSIVOS</h2>
            </Reveal>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {bonuses.map((b) => (
                <Reveal key={b.t}>
                  <article className="relative overflow-hidden rounded-[18px] bg-gold-grad p-5 text-green-deep shadow-gold">
                    <span className="absolute right-3.5 top-3.5 rounded-full bg-green-deep px-2.5 py-1 text-[0.66rem] font-extrabold uppercase tracking-wider text-gold">Bônus</span>
                    <h3 className="mb-1.5 font-title text-lg font-extrabold">{b.t}</h3>
                    <p className="text-sm font-medium text-[#3a3018]">{b.d}</p>
                  </article>
                </Reveal>
              ))}
            </div>
            <Reveal className="mx-auto mt-8 max-w-[260px]">
              <img src={`${ASSET}/caixa-presente.svg`} alt="Caixa de presente preta e dourada representando os bônus" loading="lazy" className="mx-auto drop-shadow-2xl" />
            </Reveal>
          </div>
        </section>

        {/* ===== PROVAS SOCIAIS WHATSAPP ===== */}
        <WhatsAppTestimonials items={CONFIG.depoimentos} />

        {/* ===== OFERTA ===== */}
        <section className="relative overflow-hidden py-20 text-center">
          <div className="absolute inset-0 z-0">
            <img src={`${ASSET}/oferta-skyline.svg`} alt="Skyline de Assunção à noite" loading="lazy" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-green-deep/85 to-green-deep/95" />
          </div>
          <div className="relative z-[2] mx-auto w-full max-w-[1180px] px-5">
            <Reveal>
              <h2 className="mx-auto mb-5 max-w-[18ch] font-title text-3xl font-extrabold md:text-5xl">COMECE HOJE A EXPLORAR NOVAS OPORTUNIDADES</h2>
              <div className="mb-2 flex flex-col items-center gap-1">
                {CONFIG.precoAnterior ? (
                  <span className="text-base text-ivory/60 line-through">{CONFIG.precoAnterior}</span>
                ) : (
                  <span className="text-[0.82rem] font-bold uppercase tracking-[0.14em] text-gold">Oferta especial de lançamento</span>
                )}
                <span className="font-title text-6xl font-extrabold leading-none text-gold md:text-7xl">{CONFIG.preco}</span>
              </div>
              <p className="mb-6 text-ivory/80">Pagamento único. Acesso digital ao conteúdo.</p>
              <CtaButton label="QUERO MEU ACESSO POR" />
            </Reveal>
          </div>
        </section>

        {/* ===== GARANTIA ===== */}
        {CONFIG.garantia7Dias && (
          <section className="bg-green-deep py-16 text-center md:py-24">
            <div className="mx-auto w-full max-w-[1180px] px-5">
              <Reveal>
                <img src={`${ASSET}/selo-garantia.svg`} alt="Selo de garantia de 7 dias" loading="lazy" className="mx-auto mb-5 w-[150px] drop-shadow-[0_14px_26px_rgba(216,183,110,0.3)]" />
                <h2 className="mb-3 font-title text-2xl font-extrabold md:text-3xl">GARANTIA DE 7 DIAS</h2>
                <p className="mx-auto max-w-[50ch] text-ivory/80">Você tem 7 dias para acessar o conteúdo. Se concluir que não é para você dentro desse prazo, pode solicitar o reembolso.</p>
              </Reveal>
            </div>
          </section>
        )}

        {/* ===== FAQ ===== */}
        <section className="bg-[#132019] py-16 md:py-24">
          <div className="mx-auto w-full max-w-[1180px] px-5">
            <Reveal><h2 className="mb-7 text-center font-title text-2xl font-extrabold md:text-4xl">PERGUNTAS FREQUENTES</h2></Reveal>
            <div className="mx-auto grid max-w-[760px] gap-3">
              {faqs.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
            </div>
          </div>
        </section>
      </main>

      {/* ===== RODAPÉ ===== */}
      <footer className="border-t border-gold/15 bg-green-deep py-10 pb-28 text-center lg:pb-10">
        <div className="mx-auto w-full max-w-[1180px] px-5">
          <span className="mb-2 inline-block font-title text-xl font-extrabold tracking-[0.3em] text-ivory">PARAGUAY<span className="text-gold">.</span></span>
          <p className="mb-5 text-sm text-gold">Inteligência sem fronteiras.</p>
          <nav className="mb-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-ivory/75" aria-label="Links do rodapé">
            <a href="#" className="hover:text-gold">Termos de Uso</a>
            <a href="#" className="hover:text-gold">Política de Privacidade</a>
            <a href="#" className="hover:text-gold">Contato</a>
          </nav>
          <p className="text-xs text-ivory/45">© {new Date().getFullYear()} Método Paraguay. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* ===== CTA FIXO MOBILE ===== */}
      <div className={`fixed inset-x-0 bottom-0 z-[60] bg-gradient-to-t from-green-deep/95 to-transparent p-4 transition-transform lg:hidden ${stickyVisible ? "translate-y-0" : "translate-y-full"}`} style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
        <div className="mx-auto max-w-[1180px]"><CtaButton label="QUERO MEU ACESSO POR" /></div>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-gold/20 bg-ivory/[0.04]">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3.5 px-4 py-4 text-left font-title text-base font-bold text-ivory"
      >
        {q}
        <Plus size={20} className={`shrink-0 text-gold transition-transform ${open ? "rotate-45" : ""}`} />
      </button>
      <div className="grid transition-all" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
        <div className="overflow-hidden">
          <p className="px-4 pb-4 text-sm text-ivory/80">{a}</p>
        </div>
      </div>
    </div>
  );
}
