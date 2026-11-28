// Açılış ekranı: logo çizilir, isim belirir, sonra yumuşakça kaybolur (dokununca hemen geçer)
(() => {
  const root = document.documentElement, sp = document.getElementById("splash");
  if (!sp || !root.classList.contains("splash")) return;
  try { sessionStorage.setItem("cp_acilis", "1"); } catch (e) {}
  let bitti = false;
  const bitir = () => {
    if (bitti) return; bitti = true;
    sp.classList.add("out");
    setTimeout(() => root.classList.remove("splash"), 250);
    setTimeout(() => sp.remove(), 1100);
  };
  setTimeout(bitir, 2900);
  sp.addEventListener("click", bitir);
})();

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
let barRaf = 0;
const onScroll = () => {
  if (barRaf) return;
  barRaf = requestAnimationFrame(() => {
    barRaf = 0;
    // İlk 220px boyunca kademeli koyulaşma (yumuşak eğri)
    const t = Math.min(1, Math.max(0, window.scrollY / 220));
    const e = t * t * (3 - 2 * t);
    bar.style.setProperty("--bar", e.toFixed(3));
    bar.classList.toggle("solid", t > .5);
  });
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

document.getElementById("yil").textContent = new Date().getFullYear();
const ys = document.getElementById("yil-sayisi");
if (ys) ys.textContent = new Date().getFullYear() - 2006;

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
      o: rand(.15, .55), t: rand(0, 6), z: 0
    }));
    for (const m of motes) m.z = .15 + (m.r - .4) / 1.2 * .55; // büyük zerre = yakın = kaydırınca daha hızlı
  }
  let lastY = window.scrollY;
  function frame(t) {
    const dy = window.scrollY - lastY; lastY = window.scrollY;
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
      m.x += m.vx; m.y += m.vy - dy * m.z;
      if (m.y < -5) { m.y = h + 5; m.x = rand(0, w); }
      if (m.y > h + 5) { m.y = -5; m.x = rand(0, w); }
      if (m.x < -5) m.x = w + 5; if (m.x > w + 5) m.x = -5;
      const tw = .6 + .4 * Math.sin(t * .001 + m.t);
      ctx.fillStyle = `rgba(255,222,180,${m.o * tw})`;
      ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2); ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  }
  let raf;
  setup();
  // Telefonda adres çubuğu açılıp kapanınca boyut değişir; zerreleri yeniden dağıtma, sadece tuvali ayarla
  let lastW = window.innerWidth;
  window.addEventListener("resize", () => {
    if (window.innerWidth !== lastW) { lastW = window.innerWidth; setup(); return; }
    w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(frame);
  });
  raf = requestAnimationFrame(frame);
  requestAnimationFrame(() => requestAnimationFrame(() => cv.classList.add("on")));
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
    card.classList.add("son");   // açarken altın halka gelir
    dlg.dataset.v = tarz;
    dlg.classList.remove("show");
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", ""); document.body.classList.add("modal-open");
    if (tarz === "b") document.body.classList.add("recede");
    void dlg.offsetWidth;
    requestAnimationFrame(() => {
      dlg.classList.add("show");
      if (tarz === "b") document.body.classList.add("receded");
    });
  }

  // Panel kapanınca bakılan ürünü yumuşak bir altın halkayla kısa süre işaretle.
  // Tarayıcının ani odak çerçevesini (fare/dokunmada) kaldır; klavyede kalsın.
  let klavye = false;
  window.addEventListener("keydown", () => { klavye = true; }, true);
  window.addEventListener("pointerdown", () => { klavye = false; }, true);
  function odakTemizle() {
    if (kart && !klavye && document.activeElement === kart) kart.blur();
  }

  function kapat() {
    if (busy) return;
    if (reduceMotion) { if (kart) kart.classList.remove("son"); (dlg.close ? dlg.close() : dlg.removeAttribute("open")); odakTemizle(); return; }
    busy = true;
    if (kart) kart.classList.remove("son");   // kapatırken hemen gider
    dlg.classList.remove("show");
    document.body.classList.remove("receded");
    setTimeout(() => {
      (dlg.close ? dlg.close() : dlg.removeAttribute("open")); document.body.classList.remove("recede"); busy = false;
      odakTemizle();
    }, 620);
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
  // Görselleri önceden çöz, geçiş anında takılma olmasın
  slides.forEach((s) => s.decode && s.decode().catch(() => {}));
  setInterval(() => {
    if (document.hidden) return;
    const prev = slides[i];
    i = (i + 1) % slides.length;
    const cur = slides[i];
    cur.classList.remove("off");
    prev.classList.replace("on", "off");   // giden fotoğrafın yakınlaşması yarıda kesilmez
    cur.classList.add("on");
    setTimeout(() => prev.classList.remove("off"), 2400);
    if (cap) {
      cap.classList.add("out");
      setTimeout(() => { cap.textContent = cur.dataset.ad; cap.classList.remove("out"); }, 900);
    }
  }, 6500);
})();

// Giriş yazıları: aşağı kaydırınca hafifçe yukarı kayıp solarak çıkar
(() => {
  const ht = document.querySelector(".hero-text");
  if (!ht || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let tick = false;
  const upd = () => {
    const k = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * .75)));
    const e = k * k * (3 - 2 * k);
    ht.style.transform = k ? `translate3d(0, ${(-e * 70).toFixed(1)}px, 0)` : "";
    ht.style.opacity = k ? (1 - e * .95).toFixed(3) : "";
    // Üst barın altına giren kısım yumuşakça kaybolsun (yazı logonun arkasında görünmesin)
    const hb = bar.getBoundingClientRect().bottom;
    const off = hb - ht.getBoundingClientRect().top;
    if (off > -80) {
      const m = `linear-gradient(to bottom, transparent ${Math.max(0, off).toFixed(0)}px, #000 ${(Math.max(0, off) + 80).toFixed(0)}px)`;
      ht.style.webkitMaskImage = m; ht.style.maskImage = m;
    } else if (ht.style.maskImage) { ht.style.webkitMaskImage = ""; ht.style.maskImage = ""; }
    tick = false;
  };
  window.addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
  upd();
})();

// Tüm bölümler: kaydırırken içerik aşağıdan yumuşakça gelir, yukarıdan çıkarken hafifçe solar (iki yönde de)
(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const els = [...document.querySelectorAll(".section > *, .footer > *")];
  els.forEach((el) => { el.style.transition = "opacity .45s ease-out, transform .6s cubic-bezier(.22,1,.36,1)"; el.style.willChange = "opacity, transform"; });
  const sm = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
  let tick = false;
  const upd = () => {
    const vh = window.innerHeight;
    const sonda = window.scrollY + vh >= document.documentElement.scrollHeight - 4;   // sayfanın sonu: kalanların hepsi görünür
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) continue;
      const giris = sonda ? 1 : sm((vh - r.top) / (vh * .18));      // alttan girerken 0→1
      const cikis = sm(r.bottom / (vh * .18));          // üstten çıkarken 1→0
      const v = Math.min(giris, cikis);
      const dir = giris < cikis ? 1 : -1;               // aşağıdan mı geliyor, yukarıdan mı çıkıyor
      el.style.opacity = (.08 + .92 * v).toFixed(3);
      el.style.transform = v >= .999 ? "none" : `translate3d(0, ${(dir * (1 - v) * 48).toFixed(1)}px, 0)`;
    }
    tick = false;
  };
  window.addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
  window.addEventListener("resize", upd);
  upd();
})();
