/* =========================================================
   Asia Engineering Pte Ltd — interactions & animations
   ========================================================= */
(function () {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Preloader ---------- */
  document.body.classList.add("loading");
  const hidePreloader = () => {
    const p = $("#preloader");
    if (!p || p.classList.contains("hide")) return;
    p.classList.add("hide");
    document.body.classList.remove("loading");
  };
  window.addEventListener("load", () => setTimeout(hidePreloader, 900));
  setTimeout(hidePreloader, 4000); // safety net

  /* ---------- Year ---------- */
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Header + back-to-top on scroll ---------- */
  const header = $("#header");
  const toTop = $("#toTop");
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 40);
    toTop.classList.toggle("show", y > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  const nav = $("#mainNav");
  const toggle = $("#navToggle");
  const setNav = (open) => {
    nav.classList.toggle("open", open);
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  toggle.addEventListener("click", () => setNav(!nav.classList.contains("open")));
  $$("a", nav).forEach((a) => a.addEventListener("click", () => setNav(false)));

  /* ---------- Active nav link ---------- */
  const navLinks = $$(".main-nav a:not(.btn)");
  const sections = navLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  const sectionObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => sectionObs.observe(s));

  /* ---------- Scroll reveal ---------- */
  const revealObs = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const d = parseInt(el.dataset.delay || "0", 10);
        el.style.transitionDelay = d + "ms";
        el.classList.add("in-view");
        // clear delay afterwards so hover transitions stay snappy
        setTimeout(() => (el.style.transitionDelay = ""), d + 1000);
        obs.unobserve(el);
      });
    },
    { threshold: 0.15 }
  );
  $$(".reveal, .reveal-left, .reveal-right").forEach((el) => revealObs.observe(el));

  /* ---------- Typed headline ---------- */
  const typed = $("#typed");
  const words = ["Construction Sites", "Electrical Works", "Site Machinery", "Temporary Power"];
  if (typed && !reduceMotion) {
    let w = 0, i = words[0].length, deleting = true;
    const tick = () => {
      const word = words[w];
      typed.textContent = word.slice(0, i);
      let wait = deleting ? 45 : 85;
      if (deleting && i === 0) { deleting = false; w = (w + 1) % words.length; wait = 300; }
      else if (!deleting && i === words[w].length) { deleting = true; wait = 2200; }
      i += deleting ? -1 : 1;
      if (!deleting && i > words[w].length) i = words[w].length;
      setTimeout(tick, wait);
    };
    setTimeout(tick, 3000);
  }

  /* ---------- Counters ---------- */
  const countObs = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = +el.dataset.count;
        const dur = 1600;
        const start = performance.now();
        const step = (now) => {
          const t = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(target * eased);
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        obs.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );
  $$("[data-count]").forEach((el) => countObs.observe(el));

  /* ---------- 3D tilt cards ---------- */
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    $$(".tilt").forEach((card) => {
      card.addEventListener("mousemove", (ev) => {
        const r = card.getBoundingClientRect();
        const x = (ev.clientX - r.left) / r.width - 0.5;
        const y = (ev.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-8px)`;
      });
      card.addEventListener("mouseleave", () => (card.style.transform = ""));
    });
  }

  /* ---------- Equipment tabs ---------- */
  $$(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      $$(".tab").forEach((t) => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
      $$(".tab-panel").forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      $("#tab-" + tab.dataset.tab).classList.add("active");
    });
  });

  /* ---------- Process timeline fill ---------- */
  const timeline = $(".timeline");
  const fill = $("#timelineFill");
  const mobileTL = window.matchMedia("(max-width: 900px)");
  const updateTimeline = () => {
    if (!timeline || !fill) return;
    const r = timeline.getBoundingClientRect();
    const vh = window.innerHeight;
    const progress = Math.min(Math.max((vh * 0.8 - r.top) / (r.height + vh * 0.3), 0), 1);
    const pct = (progress * 100).toFixed(1) + "%";
    if (mobileTL.matches) { fill.style.height = pct; fill.style.width = ""; }
    else { fill.style.width = pct; fill.style.height = ""; }
  };
  window.addEventListener("scroll", updateTimeline, { passive: true });
  window.addEventListener("resize", updateTimeline);
  updateTimeline();

  /* ---------- Contact form (opens email client) ---------- */
  const form = $("#contactForm");
  const msg = $("#formMsg");
  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    let ok = true;
    ["name", "email", "message"].forEach((id) => {
      const input = $("#" + id);
      const valid = input.value.trim() !== "" && (id !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value));
      input.parentElement.classList.toggle("error", !valid);
      if (!valid) ok = false;
    });
    if (!ok) {
      msg.textContent = "Please fill in the required fields correctly.";
      msg.className = "form-msg err";
      return;
    }
    const v = (id) => $("#" + id).value.trim();
    const subject = `Quotation Request – ${v("service")}${v("company") ? " – " + v("company") : ""}`;
    const body =
      `Name: ${v("name")}\nCompany: ${v("company")}\nEmail: ${v("email")}\nPhone: ${v("phone")}\n` +
      `Service: ${v("service")}\n\nProject Details:\n${v("message")}`;
    window.location.href =
      "mailto:adminasiaeng@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    msg.textContent = "Thank you! Your email app is opening to send the enquiry.";
    msg.className = "form-msg ok";
    form.reset();
  });

  /* ---------- Hero canvas: drifting sparks + electric arcs ---------- */
  const canvas = $("#sparkCanvas");
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    let W, H, dpr, particles = [], bolts = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(90, (W * H) / 16000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 0.6, g: Math.random() < 0.35,
      }));
    };

    const makeBolt = (a, b) => {
      const pts = [{ x: a.x, y: a.y }];
      const segs = 8;
      for (let i = 1; i < segs; i++) {
        const t = i / segs;
        pts.push({
          x: a.x + (b.x - a.x) * t + (Math.random() - 0.5) * 22,
          y: a.y + (b.y - a.y) * t + (Math.random() - 0.5) * 22,
        });
      }
      pts.push({ x: b.x, y: b.y });
      return { pts, life: 1 };
    };

    let mouse = { x: -999, y: -999 };
    canvas.parentElement.addEventListener("mousemove", (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    canvas.parentElement.addEventListener("mouseleave", () => (mouse.x = mouse.y = -999));

    let running = false;
    const start = () => { if (!running) { running = true; requestAnimationFrame(draw); } };
    new IntersectionObserver(([e]) => { if (e.isIntersecting) start(); else running = false; }).observe(canvas);

    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);

      // particles + connecting lines
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        const dxm = p.x - mouse.x, dym = p.y - mouse.y;
        const dm = Math.hypot(dxm, dym);
        if (dm < 120) { p.x += dxm / dm * 1.2; p.y += dym / dm * 1.2; }

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 120) {
            ctx.strokeStyle = `rgba(160, 200, 240, ${(1 - d / 120) * 0.18})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.g ? "rgba(132,199,108,.9)" : "rgba(255,255,255,.7)";
        ctx.shadowBlur = p.g ? 10 : 0; ctx.shadowColor = "#84c76c";
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // occasional electric arc between nearby particles
      if (Math.random() < 0.03 && particles.length > 2) {
        const a = particles[Math.floor(Math.random() * particles.length)];
        let best = null, bd = 1e9;
        particles.forEach((q) => {
          const d = Math.hypot(a.x - q.x, a.y - q.y);
          if (q !== a && d > 60 && d < 220 && d < bd) { bd = d; best = q; }
        });
        if (best) bolts.push(makeBolt(a, best));
      }
      bolts = bolts.filter((b) => b.life > 0);
      bolts.forEach((b) => {
        ctx.strokeStyle = `rgba(170, 235, 140, ${b.life})`;
        ctx.lineWidth = 1.6;
        ctx.shadowBlur = 14; ctx.shadowColor = "#84c76c";
        ctx.beginPath();
        b.pts.forEach((pt, k) => (k ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y)));
        ctx.stroke();
        ctx.shadowBlur = 0;
        b.life -= 0.06;
      });

      requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);
    resize();
  }
})();
