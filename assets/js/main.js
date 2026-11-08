/* =========================================================
   Asia Engineering Pte Ltd — interactions
   ========================================================= */
(function () {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const body = document.body;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const isDesktop = () => window.innerWidth > 900;
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  $("#year").textContent = new Date().getFullYear();

  /* ---------- split helpers ---------- */
  $$("[data-split]").forEach((el) => {
    el.innerHTML = [...el.textContent].map((c, i) =>
      `<span class="ch" style="--i:${i}">${c === " " ? "&nbsp;" : c}</span>`).join("");
  });

  /* =================== INTRO =================== */
  const intro = $("#intro");
  const startSite = () => {
    body.classList.remove("is-loading");
    body.classList.add("ready");
  };
  if (reduce) {
    intro.remove();
    startSite();
  } else {
    const count = $("#introCount");
    const t0 = performance.now();
    const tickCount = (now) => {
      const p = clamp((now - t0) / 1300, 0, 1);
      count.textContent = String(Math.round(p * 100)).padStart(3, "0");
      if (p < 1) requestAnimationFrame(tickCount);
    };
    requestAnimationFrame(tickCount);
    const finish = () => {
      if (intro.classList.contains("done")) return;
      intro.classList.add("done");
      setTimeout(startSite, 350);
      setTimeout(() => intro.remove(), 1200);
    };
    setTimeout(finish, 2700);
    intro.addEventListener("click", finish); // impatient visitors can skip
  }

  /* =================== FX CANVAS (sparks + lightning) =================== */
  const fx = $("#fx");
  const ctx = fx.getContext("2d");
  let W = 0, H = 0, sparks = [], bolts = [];
  const sizeFx = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    fx.width = W * dpr; fx.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  sizeFx();
  window.addEventListener("resize", sizeFx);

  const burst = (x, y, n = 14, power = 5) => {
    if (reduce) return;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = Math.random() * power + 1;
      sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, life: 1, d: Math.random() * 0.03 + 0.025 });
    }
    loopFx();
  };
  const lightning = (x1, y1, x2, y2) => {
    if (reduce) return;
    const segs = 14, pts = [[x1, y1]];
    for (let i = 1; i < segs; i++) {
      const t = i / segs, off = (Math.random() - 0.5) * 70 * Math.sin(Math.PI * t);
      pts.push([x1 + (x2 - x1) * t + off, y1 + (y2 - y1) * t + (Math.random() - 0.5) * 12]);
    }
    pts.push([x2, y2]);
    // a small branch for realism
    const k = 4 + Math.floor(Math.random() * 6);
    const branch = [pts[k]];
    for (let i = 1; i < 5; i++) branch.push([pts[k][0] + i * (Math.random() * 30 - 15) - i * 10, pts[k][1] + i * 22]);
    bolts.push({ pts, branch, life: 1 });
    loopFx();
  };

  let fxRunning = false;
  function loopFx() {
    if (fxRunning) return;
    fxRunning = true;
    requestAnimationFrame(drawFx);
  }
  function drawFx() {
    ctx.clearRect(0, 0, W, H);
    sparks = sparks.filter((s) => s.life > 0);
    sparks.forEach((s) => {
      s.x += s.vx; s.y += s.vy; s.vy += 0.15; s.vx *= 0.97; s.life -= s.d;
      ctx.strokeStyle = `rgba(182,245,156,${s.life})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 2.5, s.y - s.vy * 2.5); ctx.stroke();
    });
    bolts = bolts.filter((b) => b.life > 0);
    bolts.forEach((b) => {
      ctx.save();
      ctx.shadowColor = "#84c76c"; ctx.shadowBlur = 25;
      [[b.pts, 3.2], [b.branch, 1.4]].forEach(([pts, lw]) => {
        ctx.strokeStyle = `rgba(230,255,220,${b.life})`; ctx.lineWidth = lw;
        ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
      });
      ctx.restore();
      if (b.life > 0.85) { ctx.fillStyle = `rgba(200,255,190,${(b.life - 0.85) * 0.8})`; ctx.fillRect(0, 0, W, H); }
      b.life -= 0.045;
    });
    if (sparks.length || bolts.length) requestAnimationFrame(drawFx);
    else { fxRunning = false; ctx.clearRect(0, 0, W, H); }
  }

  /* =================== CURSOR =================== */
  if (finePointer && !reduce) {
    body.classList.add("has-cursor");
    const dot = $(".cursor-dot"), ring = $(".cursor-ring"), label = $(".cursor-ring span");
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
    });
    (function follow() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(follow);
    })();
    document.addEventListener("mouseover", (e) => {
      const t = e.target.closest("a, button, [data-cursor], .item");
      ring.classList.remove("hover", "label");
      if (!t) return;
      if (t.dataset.cursor) { label.textContent = t.dataset.cursor; ring.classList.add("label"); }
      else ring.classList.add("hover");
    });
    window.addEventListener("mousedown", (e) => burst(e.clientX, e.clientY, 10, 4));

    /* magnetic elements */
    $$(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${x * 0.3}px, ${y * 0.35}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transition = "transform .6s cubic-bezier(.22,1,.36,1)";
        el.style.transform = "";
        setTimeout(() => (el.style.transition = ""), 600);
      });
    });
  }

  /* =================== HEADER + MENU =================== */
  const hdr = $("#hdr");
  let lastY = 0;
  const menuBtn = $("#menuBtn");
  const setMenu = (open) => {
    body.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.querySelector(".mb-text").textContent = open ? "Close" : "Menu";
    body.style.overflow = open ? "hidden" : "";
  };
  menuBtn.addEventListener("click", () => setMenu(!body.classList.contains("menu-open")));
  $$(".menu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  window.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

  /* =================== HERO: spotlight + skyline + breaker =================== */
  const hero = $("#hero");
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty("--mx", e.clientX - r.left + "px");
    hero.style.setProperty("--my", e.clientY - r.top + "px");
  });

  // generate city blocks with windows
  const NS = "http://www.w3.org/2000/svg";
  const mk = (tag, attrs) => { const el = document.createElementNS(NS, tag); for (const k in attrs) el.setAttribute(k, attrs[k]); return el; };
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const buildCity = (group, list, winChance) => {
    list.forEach(([x, w, h]) => {
      const top = 420 - h;
      group.appendChild(mk("rect", { class: "b", x, y: top, width: w, height: h }));
      for (let yy = top + 12; yy < 405; yy += 16) {
        for (let xx = x + 8; xx < x + w - 10; xx += 14) {
          if (rnd() > winChance) continue;
          const lit = rnd() < 0.62;
          const win = mk("rect", { class: "win" + (lit ? " lit" : "") + (lit && rnd() < 0.12 ? " g" : ""), x: xx, y: yy, width: 6, height: 8 });
          win.style.transitionDelay = (rnd() * 1.4).toFixed(2) + "s";
          group.appendChild(win);
        }
      }
    });
  };
  buildCity($("#bgCity"), [[0, 90, 190], [80, 70, 250], [160, 60, 150], [330, 80, 280], [420, 60, 210], [500, 90, 300], [600, 60, 180],
    [900, 70, 240], [980, 90, 330], [1080, 60, 200], [1150, 80, 270], [1360, 70, 230], [1440, 90, 310], [1530, 70, 200]], 0.55);
  buildCity($("#fgCity"), [[30, 110, 130], [180, 90, 170], [300, 120, 110], [430, 80, 150], [560, 100, 120], [880, 110, 160],
    [1000, 90, 120], [1100, 120, 180], [1240, 100, 140], [1350, 110, 110], [1470, 130, 160]], 0.75);

  const breaker = $("#breaker");
  const breakerText = $("#breakerText");
  const statusText = $("#statusText");
  let touched = false;
  const setPower = (on, withFx = true) => {
    body.classList.toggle("powered", on);
    breaker.setAttribute("aria-checked", String(on));
    breakerText.textContent = on ? "Site powered — we're live ⚡" : "Flip to power up the site";
    statusText.textContent = on ? "SITE POWERED" : "SITE STANDBY";
    if (on && withFx) {
      const r = breaker.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      lightning(cx + (Math.random() * 300 - 150), -10, cx, cy);
      setTimeout(() => burst(cx, cy, 26, 7), 60);
    }
  };
  breaker.addEventListener("click", () => { touched = true; setPower(breaker.getAttribute("aria-checked") !== "true"); });
  // show the effect even to visitors who don't click
  setTimeout(() => { if (!touched && window.scrollY < 200) setPower(true); }, 7500);

  /* =================== TAPES & MARQUEES: speed follows scroll =================== */
  const tracks = $$("[data-speed]").map((el) => ({ el, dir: +el.dataset.speed, x: 0 }));
  let velocity = 0;
  if (!reduce) {
    (function marquee() {
      const boost = 1 + Math.min(Math.abs(velocity) * 0.08, 6);
      tracks.forEach((t) => {
        const half = t.el.scrollWidth / 2;
        t.x -= 0.6 * t.dir * boost;
        if (t.x <= -half) t.x += half;
        if (t.x > 0) t.x -= half;
        t.el.style.transform = `translate3d(${t.x}px,0,0)`;
      });
      velocity *= 0.9;
      requestAnimationFrame(marquee);
    })();
  }

  /* =================== ABOUT words =================== */
  const aboutText = $("#aboutText");
  const wrapWords = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
          else { const s = document.createElement("span"); s.className = "w"; s.textContent = part; frag.appendChild(s); }
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) wrapWords(n);
    });
  };
  wrapWords(aboutText);
  const words = $$(".w", aboutText);
  const aboutSec = $("#about");

  /* =================== SERVICES horizontal =================== */
  const svc = $("#services"), svcTrack = $("#svcTrack"), svcBar = $("#svcBar");
  const sizeServices = () => {
    if (isDesktop() && !reduce) svc.style.height = svcTrack.scrollWidth - innerWidth + innerHeight + "px";
    else svc.style.height = "";
  };
  $$(".svc-card, .item").forEach((c) => {
    c.addEventListener("pointermove", (e) => {
      const r = c.getBoundingClientRect();
      c.style.setProperty("--x", e.clientX - r.left + "px");
      c.style.setProperty("--y", e.clientY - r.top + "px");
    });
  });

  /* =================== PROCESS circuit =================== */
  const circuit = $("#circuit"), trace = $("#trace"), traceBg = $("#traceBg");
  const nodes = $$(".node", circuit);
  let traceLen = 0, nodeAt = [];
  const buildCircuit = () => {
    const cr = circuit.getBoundingClientRect();
    const pts = nodes.map((n) => {
      const r = $(".chip-ic", n).getBoundingClientRect();
      return [r.left - cr.left + r.width / 2, r.top - cr.top + r.height / 2];
    });
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    const corners = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      if (Math.abs(x1 - x0) < 2 || Math.abs(y1 - y0) < 2) { d += ` L${x1} ${y1}`; corners.push([x1, y1]); continue; }
      // run the vertical leg just left of the next chip so it never crosses text
      const mx = x1 - Math.min(62, (x1 - x0) / 2), c = Math.min(26, Math.abs(y1 - y0) / 2), sy = Math.sign(y1 - y0);
      d += ` L${mx - c} ${y0} L${mx} ${y0 + c * sy} L${mx} ${y1 - c * sy} L${mx + c} ${y1} L${x1} ${y1}`;
      corners.push([x1, y1]);
    }
    trace.setAttribute("d", d); traceBg.setAttribute("d", d);
    traceLen = trace.getTotalLength();
    trace.style.strokeDasharray = traceLen;
    // where along the trace each node sits
    nodeAt = pts.map(([x, y]) => {
      let best = 0, bd = 1e9;
      for (let l = 0; l <= traceLen; l += 6) {
        const p = trace.getPointAtLength(l), dd = (p.x - x) ** 2 + (p.y - y) ** 2;
        if (dd < bd) { bd = dd; best = l; }
      }
      return best / traceLen;
    });
  };

  /* =================== reveal-on-view: neon, yard =================== */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("on");
      io.unobserve(e.target);
    });
  }, { threshold: 0.6 });
  $$("[data-neon]").forEach((el, i) => { el.style.animationDelay = i * 0.15 + "s"; io.observe(el); });

  /* yard filter */
  const items = $$(".item");
  $$(".chip").forEach((chip) => chip.addEventListener("click", () => {
    $$(".chip").forEach((c) => c.classList.toggle("active", c === chip));
    const f = chip.dataset.filter;
    let i = 0;
    items.forEach((it) => {
      const show = f === "all" || it.dataset.cat === f;
      it.classList.toggle("hide", !show);
      it.classList.remove("pop");
      if (show) { void it.offsetWidth; it.style.setProperty("--i", i++); it.classList.add("pop"); }
    });
  }));

  /* =================== SCROLL LOOP =================== */
  const lmFill = $("#lmFill"), lmVal = $("#lmVal");
  const onScroll = () => {
    const y = window.scrollY;
    velocity = y - lastY;

    hdr.classList.toggle("scrolled", y > 60);
    hdr.classList.toggle("hidden", y > lastY && y > 500 && !body.classList.contains("menu-open"));
    lastY = y;

    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? y / max : 0;
    lmFill.style.height = (p * 100).toFixed(1) + "%";
    lmVal.textContent = String(Math.round(p * 100)).padStart(2, "0") + "%";

    // about words
    if (isDesktop() && !reduce) {
      const r = aboutSec.getBoundingClientRect();
      const ap = clamp(-r.top / (r.height - innerHeight), 0, 1);
      const n = Math.round(ap * 1.15 * words.length);
      words.forEach((w, i) => w.classList.toggle("on", i < n));
    } else {
      const r = aboutText.getBoundingClientRect();
      const ap = clamp((innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.3), 0, 1);
      const n = reduce ? words.length : Math.round(ap * words.length);
      words.forEach((w, i) => w.classList.toggle("on", i < n));
    }

    // services horizontal
    if (isDesktop() && !reduce) {
      const r = svc.getBoundingClientRect();
      const dist = svc.offsetHeight - innerHeight;
      const sp = clamp(-r.top / dist, 0, 1);
      svcTrack.style.transform = `translate3d(${-sp * (svcTrack.scrollWidth - innerWidth)}px,0,0)`;
      svcBar.style.width = sp * 100 + "%";
    }

    // circuit
    if (traceLen) {
      const r = circuit.getBoundingClientRect();
      const cp = reduce ? 1 : clamp((innerHeight * 0.75 - r.top) / (r.height * 0.9), 0, 1);
      trace.style.strokeDashoffset = traceLen * (1 - cp);
      nodes.forEach((n, i) => n.classList.toggle("on", cp >= nodeAt[i] - 0.001));
    }
  };

  const layout = () => { sizeServices(); buildCircuit(); onScroll(); };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", layout);
  window.addEventListener("load", layout);
  if (document.fonts) document.fonts.ready.then(layout);
  layout();

  /* =================== CONTACT FORM =================== */
  $$("#need button").forEach((b) => b.addEventListener("click", () => {
    $$("#need button").forEach((x) => x.classList.toggle("active", x === b));
  }));
  const form = $("#form"), out = $("#fMsgOut");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = (id) => $("#" + id).value.trim();
    let ok = true;
    [["fName", (s) => s], ["fEmail", (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)], ["fMsg", (s) => s]].forEach(([id, test]) => {
      const good = !!test(v(id));
      $("#" + id).parentElement.classList.toggle("err", !good);
      if (!good) ok = false;
    });
    if (!ok) { out.textContent = "Please fill in the required fields."; out.className = "f-msg bad"; return; }
    const need = $("#need button.active").textContent;
    const subject = `Quotation Request – ${need}${v("fCompany") ? " – " + v("fCompany") : ""}`;
    const text = `Name: ${v("fName")}\nCompany: ${v("fCompany")}\nEmail: ${v("fEmail")}\nPhone: ${v("fPhone")}\nService: ${need}\n\nProject details:\n${v("fMsg")}`;
    const r = $(".send").getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 30, 8);
    window.location.href = `mailto:adminasiaeng@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    out.textContent = "Thanks! Your email app is opening with the enquiry ready to send.";
    out.className = "f-msg ok";
    form.reset();
  });
})();
