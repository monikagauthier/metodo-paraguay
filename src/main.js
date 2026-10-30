/* ============================================================
   MÉTODO PARAGUAY — comportamento da página
   - Carrossel WhatsApp (swipe, setas, dots, lightbox, teclado, lazy)
   - FAQ accordion acessível
   - CTA fixo mobile (aparece após o hero)
   - Reveal on scroll (IntersectionObserver)
   - Checkout via CONFIG (sem URL inventada)
   ============================================================ */
import { CONFIG } from "./config/site.config.js";

/* ---------- CHECKOUT ---------- */
function resolveCheckoutUrl() {
  // Prioridade: variável de ambiente Vite > config.
  try {
    if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_CHECKOUT_URL) {
      return import.meta.env.VITE_CHECKOUT_URL;
    }
  } catch (_) { /* ambiente sem import.meta.env */ }
  return CONFIG.checkoutUrl || "";
}

function wireCheckoutButtons() {
  const url = resolveCheckoutUrl();
  document.querySelectorAll("[data-checkout]").forEach((btn) => {
    if (url) {
      btn.addEventListener("click", () => { window.location.href = url; });
    } else {
      btn.setAttribute("disabled", "true");
      btn.setAttribute("title", "Configure CONFIG.checkoutUrl (ou VITE_CHECKOUT_URL)");
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        console.warn("[Método Paraguay] Checkout não configurado. Defina CONFIG.checkoutUrl em src/config/site.config.js");
      });
    }
  });
  if (!url) {
    console.warn("[Método Paraguay] checkoutUrl vazio — botões desabilitados até configurar.");
  }
}

/* ---------- CARROSSEL WHATSAPP ---------- */
function renderTestimonials() {
  const track = document.getElementById("carouselTrack");
  const dotsWrap = document.getElementById("carouselDots");
  if (!track) return;

  const items = CONFIG.depoimentos || [];
  track.innerHTML = "";
  dotsWrap.innerHTML = "";

  items.forEach((item, i) => {
    const slide = document.createElement("div");
    slide.className = "carousel__slide";
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-roledescription", "slide");
    slide.setAttribute("aria-label", `${i + 1} de ${items.length}`);

    const card = document.createElement("figure");
    card.className = "testimonial-card";
    card.dataset.real = String(Boolean(item.real));
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Ampliar ${item.alt || "print"} ${i + 1}`);

    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.alt || `Print de conversa ${i + 1}`;
    img.loading = "lazy";
    img.decoding = "async";

    card.appendChild(img);
    slide.appendChild(card);
    track.appendChild(slide);

    const openLb = () => openLightbox(item.src, img.alt);
    card.addEventListener("click", openLb);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLb(); }
    });

    const dot = document.createElement("button");
    dot.className = "carousel__dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Ir para o print ${i + 1}`);
    if (i === 0) dot.setAttribute("aria-current", "true");
    dot.addEventListener("click", () => scrollToSlide(i));
    dotsWrap.appendChild(dot);
  });

  initCarouselNav(items.length);
}

function getSlides() {
  return Array.from(document.querySelectorAll("#carouselTrack .carousel__slide"));
}

function scrollToSlide(index) {
  const slides = getSlides();
  const target = slides[index];
  if (target) target.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
}

function currentIndex() {
  const track = document.getElementById("carouselTrack");
  const slides = getSlides();
  const center = track.scrollLeft + track.clientWidth / 2;
  let best = 0, bestDist = Infinity;
  slides.forEach((s, i) => {
    const sc = s.offsetLeft + s.clientWidth / 2;
    const d = Math.abs(sc - center);
    if (d < bestDist) { bestDist = d; best = i; }
  });
  return best;
}

function updateDots() {
  const idx = currentIndex();
  document.querySelectorAll("#carouselDots .carousel__dot").forEach((d, i) => {
    if (i === idx) d.setAttribute("aria-current", "true");
    else d.removeAttribute("aria-current");
  });
}

function initCarouselNav(count) {
  const track = document.getElementById("carouselTrack");
  const prev = document.getElementById("carouselPrev");
  const next = document.getElementById("carouselNext");

  prev?.addEventListener("click", () => scrollToSlide(Math.max(0, currentIndex() - 1)));
  next?.addEventListener("click", () => scrollToSlide(Math.min(count - 1, currentIndex() + 1)));

  let raf;
  track?.addEventListener("scroll", () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(updateDots);
  });

  // navegação por teclado quando o carrossel tem foco
  track?.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); scrollToSlide(Math.min(count - 1, currentIndex() + 1)); }
    if (e.key === "ArrowLeft") { e.preventDefault(); scrollToSlide(Math.max(0, currentIndex() - 1)); }
  });
}

/* ---------- LIGHTBOX ---------- */
let lastFocused = null;
function openLightbox(src, alt) {
  const lb = document.getElementById("lightbox");
  const img = document.getElementById("lightboxImg");
  if (!lb || !img) return;
  lastFocused = document.activeElement;
  img.src = src;
  img.alt = alt || "";
  lb.classList.add("open");
  lb.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  document.getElementById("lightboxClose")?.focus();
}
function closeLightbox() {
  const lb = document.getElementById("lightbox");
  if (!lb) return;
  lb.classList.remove("open");
  lb.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (lastFocused) lastFocused.focus();
}
function initLightbox() {
  const lb = document.getElementById("lightbox");
  document.getElementById("lightboxClose")?.addEventListener("click", closeLightbox);
  lb?.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lb?.classList.contains("open")) closeLightbox();
  });
}

/* ---------- FAQ ---------- */
function initFaq() {
  document.querySelectorAll(".faq-item").forEach((item) => {
    const btn = item.querySelector(".faq-item__q");
    const ans = item.querySelector(".faq-item__a");
    btn?.addEventListener("click", () => {
      const open = item.getAttribute("aria-expanded") === "true";
      item.setAttribute("aria-expanded", String(!open));
      btn.setAttribute("aria-expanded", String(!open));
      ans.style.maxHeight = open ? "0px" : ans.scrollHeight + "px";
    });
  });
}

/* ---------- STICKY CTA ---------- */
function initStickyCta() {
  const cta = document.getElementById("stickyCta");
  const hero = document.querySelector(".hero");
  if (!cta || !hero) return;
  const io = new IntersectionObserver(
    ([entry]) => cta.classList.toggle("visible", !entry.isIntersecting),
    { threshold: 0.1 }
  );
  io.observe(hero);
}

/* ---------- REVEAL ON SCROLL ---------- */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    return; // sem observer: conteúdo permanece visível (padrão do CSS)
  }
  // arma a animação só agora que sabemos que o JS roda
  document.documentElement.classList.add("js-reveal");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  els.forEach((el) => io.observe(el));
}

/* ---------- INIT ---------- */
function injectConfigText() {
  document.querySelectorAll("[data-price]").forEach((el) => (el.textContent = CONFIG.preco));
  const oldEl = document.getElementById("priceOld");
  const launchEl = document.getElementById("priceLaunch");
  if (CONFIG.precoAnterior) {
    if (oldEl) { oldEl.textContent = CONFIG.precoAnterior; oldEl.hidden = false; }
    if (launchEl) launchEl.hidden = true;
  } else {
    if (oldEl) oldEl.hidden = true;
    if (launchEl) launchEl.hidden = false;
  }
  // garantia
  const g = document.getElementById("guaranteeSection");
  if (g && !CONFIG.garantia7Dias) g.hidden = true;
  // ano no copyright
  const y = document.getElementById("copyYear");
  if (y) y.textContent = String(new Date().getFullYear());
}

document.addEventListener("DOMContentLoaded", () => {
  injectConfigText();
  renderTestimonials();
  initCarouselNav(CONFIG.depoimentos.length);
  initLightbox();
  initFaq();
  initStickyCta();
  initReveal();
  wireCheckoutButtons();
});
