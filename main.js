// WhatsApp linkleri: data-wa içindeki mesajla wa.me linki oluşturur
const WA_NUMBER = "905446814261";
document.querySelectorAll("[data-wa]").forEach((el) => {
  el.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(el.dataset.wa)}`;
  el.target = "_blank";
  el.rel = "noopener";
});

// Kaydırınca yumuşak belirme
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }),
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// Üst bar: kaydırınca koyulaşır
const bar = document.querySelector(".topbar");
const onScroll = () => bar.classList.toggle("solid", window.scrollY > 40);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

document.getElementById("yil").textContent = new Date().getFullYear();

// Ürün kategorileri
const tabs = document.querySelectorAll(".tab");
const cards = document.querySelectorAll(".card");
tabs.forEach((t) => t.addEventListener("click", () => {
  tabs.forEach((x) => x.classList.toggle("active", x === t));
  const f = t.dataset.filter;
  cards.forEach((c) => {
    const show = f === "all" || c.dataset.cat === f;
    c.classList.toggle("hide", !show);
    c.classList.remove("pop");
    if (show) { c.classList.add("in"); void c.offsetWidth; c.classList.add("pop"); }
  });
}));

// Kart sırası (sırayla belirme için)
document.querySelectorAll(".products .card").forEach((c, i) => c.style.setProperty("--i", i % 4));

// Giriş görselinde hafif paralaks
const heroImg = document.querySelector(".hero-panel .slides");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (heroImg && !reduce) {
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const y = Math.min(window.scrollY, window.innerHeight);
      heroImg.style.setProperty("--par", (y * 0.12).toFixed(1) + "px");
      ticking = false;
    });
  }, { passive: true });
}

// Arka plan animasyonu: birkaç büyük, çok yavaş kayan sıcak ışık lekesi ve süzülen toz zerreleri
(() => {
  const cv = document.getElementById("ambient");
  if (!cv || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const ctx = cv.getContext("2d");
  let w, h, dpr, glows, motes;
  const rand = (a, b) => a + Math.random() * (b - a);
  function setup() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = cv.clientWidth; h = cv.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    glows = [0, 1, 2].map((i) => ({
      x: rand(0, w), y: rand(0, h), r: rand(Math.max(w, h) * .35, Math.max(w, h) * .6),
      a: rand(0, Math.PI * 2), s: rand(.00008, .00016), k: [.07, .05, .04][i]
    }));
    const n = w < 600 ? 22 : 45;
    motes = Array.from({ length: n }, () => ({
      x: rand(0, w), y: rand(0, h), r: rand(.4, 1.6), vy: rand(-.12, -.03), vx: rand(-.05, .05),
      o: rand(.15, .55), t: rand(0, 6)
    }));
  }
  function frame(t) {
    ctx.clearRect(0, 0, w, h);
    for (const g of glows) {
      const x = g.x + Math.cos(t * g.s + g.a) * w * .18;
      const y = g.y + Math.sin(t * g.s * 1.3 + g.a) * h * .14;
      const grd = ctx.createRadialGradient(x, y, 0, x, y, g.r);
      grd.addColorStop(0, `rgba(216,170,110,${g.k})`);
      grd.addColorStop(1, "rgba(216,170,110,0)");
      ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
    }
    for (const m of motes) {
      m.x += m.vx; m.y += m.vy;
      if (m.y < -5) { m.y = h + 5; m.x = rand(0, w); }
      if (m.x < -5) m.x = w + 5; if (m.x > w + 5) m.x = -5;
      const tw = .6 + .4 * Math.sin(t * .001 + m.t);
      ctx.fillStyle = `rgba(255,222,180,${m.o * tw})`;
      ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2); ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  }
  let raf;
  setup();
  window.addEventListener("resize", setup);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(frame);
  });
  raf = requestAnimationFrame(frame);
})();

// ===== Ürün detay penceresi =====
(() => {
  const dlg = document.getElementById("detay");
  if (!dlg || !window.URUNLER) return;
  const $ = (id) => document.getElementById(id);
  const etiket = { genislik: "Genişlik", kalinlik: "Kalınlık", boy: "Boy" };
  const texClass = { "beyaz-tavan": "tex-white", "kapi-lambrisi": "tex-door", "crp": "tex-crp" };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let kart = null, busy = false;

  function doldur(id) {
    const u = window.URUNLER[id];
    const img = dlg.querySelector(".detail-img");
    img.className = "detail-img"; img.innerHTML = "";
    if (u.gorsel) img.innerHTML = `<img src="${u.gorsel}" alt="${u.ad}">`;
    else img.classList.add("tex", texClass[id] || "tex-white");
    $("detay-kat").textContent = u.kategori || "";
    $("detay-ad").textContent = u.ad;
    $("detay-acik").textContent = u.aciklama || "";
    $("detay-olcu").innerHTML = Object.entries(u.olculer || {})
      .filter(([, v]) => v).map(([k, v]) => `<div><dt>${etiket[k] || k}</dt><dd>${v}</dd></div>`).join("");
    $("detay-ozel").innerHTML = [...(u.ozellikler || []), ...(u.renkler || [])].map((x) => `<li>${x}</li>`).join("");
    $("detay-wa").href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Merhaba, ${u.ad} için fiyat bilgisi alabilir miyim?`)}`;
  }

  // Açılış tarzı: "a" yan panel (şu an kullanılan), "b" odak, "c" alt sayfa.
  // Değiştirmek için sadece bu satırı düzenlemek yeterli.
  const tarz = "a";

  function ac(id, card) {
    if (busy || !window.URUNLER[id]) return;
    doldur(id); kart = card;
    dlg.dataset.v = tarz;
    dlg.classList.remove("show");
    dlg.showModal(); document.body.classList.add("modal-open");
    if (tarz === "b") document.body.classList.add("recede");
    void dlg.offsetWidth;
    requestAnimationFrame(() => {
      dlg.classList.add("show");
      if (tarz === "b") document.body.classList.add("receded");
    });
  }

  function kapat() {
    if (busy) return;
    if (reduceMotion) { dlg.close(); return; }
    busy = true;
    dlg.classList.remove("show");
    document.body.classList.remove("receded");
    setTimeout(() => { dlg.close(); document.body.classList.remove("recede"); busy = false; }, 620);
  }

  dlg.addEventListener("cancel", (e) => { e.preventDefault(); kapat(); });
  dlg.addEventListener("close", () => document.body.classList.remove("modal-open"));
  dlg.querySelector(".detail-close").addEventListener("click", kapat);
  dlg.addEventListener("click", (e) => { if (e.target === dlg) kapat(); });

  document.querySelectorAll(".card[data-id]").forEach((card) => {
    card.addEventListener("click", (e) => { if (e.target.closest(".link-wa")) return; ac(card.dataset.id, card); });
    card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ac(card.dataset.id, card); } });
  });
})();

// ===== Uygulama örnekleri (liste doluysa bölüm görünür) =====
(() => {
  const list = window.UYGULAMALAR || [];
  const sec = document.getElementById("uygulamalar");
  if (!sec || !list.length) return;
  sec.querySelector(".app-grid").innerHTML = list.map((u) => `
    <figure class="app-item reveal in">
      <img src="${u.gorsel}" alt="${u.baslik || u.urun || "Uygulama örneği"}" loading="lazy">
      <figcaption>${u.urun ? `<span>${u.urun}</span>` : ""}<strong>${u.baslik || ""}</strong>${u.yer ? `<small> · ${u.yer}</small>` : ""}</figcaption>
    </figure>`).join("");
  sec.hidden = false;
})();

// Giriş görseli: birkaç saniyede bir sıradaki ürüne yumuşak geçiş
(() => {
  const slides = [...document.querySelectorAll(".hero-panel .slide")];
  const cap = document.querySelector(".slide-cap-txt");
  if (slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let i = 0;
  setInterval(() => {
    if (document.hidden) return;
    const next = (i + 1) % slides.length;
    slides[next].classList.add("on");
    slides[i].classList.remove("on");
    i = next;
    if (cap) {
      cap.classList.add("out");
      setTimeout(() => { cap.textContent = slides[i].dataset.ad; cap.classList.remove("out"); }, 900);
    }
  }, 6500);
})();
