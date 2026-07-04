(() => {
  "use strict";

  /* ---------- Preloader ---------- */
  window.addEventListener("load", () => {
    setTimeout(() => document.body.classList.add("loaded"), 500);
  });

  /* ---------- Custom cursor ---------- */
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  if (dot && ring && matchMedia("(hover:hover)").matches) {
    let rx = 0, ry = 0, x = 0, y = 0;
    window.addEventListener("mousemove", (e) => {
      x = e.clientX; y = e.clientY;
      dot.style.left = x + "px"; dot.style.top = y + "px";
    });
    const loop = () => {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      ring.style.left = rx + "px"; ring.style.top = ry + "px";
      requestAnimationFrame(loop);
    };
    loop();
    document.querySelectorAll("a, button, [data-lightbox]").forEach((el) => {
      el.addEventListener("mouseenter", () => { ring.style.width = "50px"; ring.style.height = "50px"; ring.style.opacity = "0.9"; });
      el.addEventListener("mouseleave", () => { ring.style.width = "34px"; ring.style.height = "34px"; ring.style.opacity = "0.5"; });
    });
  }

  /* ---------- Navbar scroll state + progress ---------- */
  const navbar = document.getElementById("navbar");
  const navProgress = document.getElementById("navProgress");
  const onScroll = () => {
    const y = window.scrollY;
    navbar.classList.toggle("scrolled", y > 30);
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    navProgress.style.width = docH > 0 ? (y / docH) * 100 + "%" : "0%";

    const backTop = document.getElementById("backToTop");
    backTop.classList.toggle("visible", y > 700);
  };
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    })
  );

  /* ---------- Theme toggle (persisted for the session only) ---------- */
  const themeToggle = document.getElementById("themeToggle");
  let theme = "light";
  const applyTheme = (t) => {
    theme = t;
    document.documentElement.setAttribute("data-theme", t === "dark" ? "dark" : "light");
    themeToggle.setAttribute("aria-pressed", String(t === "dark"));
  };
  if (matchMedia("(prefers-color-scheme: dark)").matches) applyTheme("dark");
  themeToggle.addEventListener("click", () => applyTheme(theme === "dark" ? "light" : "dark"));

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );
  revealEls.forEach((el) => io.observe(el));

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll(".stat-number");
  const countIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const duration = 1400;
        const start = performance.now();
        const step = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target);
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        countIO.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((el) => countIO.observe(el));

  /* ---------- Smooth anchor scroll offset for fixed navbar ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 78;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  document.getElementById("heroScroll").addEventListener("click", () => {
    document.getElementById("sobre").scrollIntoView({ behavior: "smooth" });
  });

  /* ---------- Back to top ---------- */
  document.getElementById("backToTop").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- Testimonials carousel ---------- */
  const track = document.getElementById("testimonialTrack");
  const cards = track ? Array.from(track.children) : [];
  const dotsWrap = document.getElementById("testimonialDots");
  let current = 0;
  let carouselTimer;

  const renderDots = () => {
    dotsWrap.innerHTML = "";
    cards.forEach((_, i) => {
      const b = document.createElement("button");
      b.setAttribute("aria-label", "Ver depoimento " + (i + 1));
      if (i === current) b.classList.add("active");
      b.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(b);
    });
  };

  const goTo = (i) => {
    cards[current].classList.remove("active");
    current = (i + cards.length) % cards.length;
    cards[current].classList.add("active");
    Array.from(dotsWrap.children).forEach((d, idx) => d.classList.toggle("active", idx === current));
    resetTimer();
  };

  const resetTimer = () => {
    clearInterval(carouselTimer);
    carouselTimer = setInterval(() => goTo(current + 1), 5500);
  };

  if (cards.length) {
    cards[0].classList.add("active");
    renderDots();
    resetTimer();
  }

  /* ---------- Lightbox ---------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const openLightbox = (src, alt) => {
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
  };
  const closeLightbox = () => {
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
  };
  document.querySelectorAll("[data-lightbox]").forEach((el) => {
    const trigger = () => {
      const img = el.querySelector("img");
      openLightbox(el.dataset.lightbox, img ? img.alt : "");
    };
    el.addEventListener("click", trigger);
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); trigger(); }
    });
  });
  document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

  /* ---------- Contact form (demo — no backend wired up) ---------- */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      status.textContent = "Preencha os campos obrigatórios para continuar.";
      status.style.color = "var(--red-accent)";
      return;
    }
    status.style.color = "var(--blue-mid)";
    status.textContent = "Mensagem enviada com sucesso. Nossa equipe responderá em breve.";
    form.reset();
  });
})();
