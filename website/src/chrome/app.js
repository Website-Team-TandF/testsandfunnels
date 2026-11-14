(function () {
  "use strict";
  var TF = window.TF || {};
  window.dataLayer = window.dataLayer || [];
  function track(event, data) {
    var p = { event: event };
    for (var k in data) { if (Object.prototype.hasOwnProperty.call(data, k)) p[k] = data[k]; }
    window.dataLayer.push(p);
  }
  function store(get, key, val) {
    try { return get ? window.sessionStorage.getItem(key) : window.sessionStorage.setItem(key, val); } catch (e) { return null; }
  }

  /* Header shadow, footer year */
  var header = document.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();

  /* Mobile nav, built from the desktop nav (single source of truth) */
  var menuToggle = document.querySelector(".menu-toggle");
  var mobileNav = document.getElementById("mobile-nav");
  var items = document.querySelectorAll(".nav > ul > li");
  if (menuToggle && mobileNav && items.length) {
    var list = document.createElement("ul");
    items.forEach(function (li) {
      var top = li.querySelector("a.link");
      var sub = li.querySelector("ul.submenu");
      var item = document.createElement("li");
      if (sub) {
        var d = document.createElement("details");
        var s = document.createElement("summary");
        s.textContent = top.textContent;
        d.appendChild(s);
        var c = sub.cloneNode(true);
        c.removeAttribute("class");
        d.appendChild(c);
        item.appendChild(d);
      } else {
        item.appendChild(top.cloneNode(true));
      }
      list.appendChild(item);
    });
    mobileNav.appendChild(list);
    var cta = document.createElement("a");
    cta.className = "btn mnav-cta";
    cta.href = TF.auditHref || "#";
    cta.textContent = "Get your Free Business Audit";
    cta.setAttribute("data-track", "Get your Free Business Audit");
    cta.setAttribute("data-pos", "mobile-nav");
    mobileNav.appendChild(cta);
    var closeNav = function () {
      menuToggle.setAttribute("aria-expanded", "false");
      mobileNav.classList.remove("open");
      document.body.style.overflow = "";
    };
    menuToggle.addEventListener("click", function () {
      if (menuToggle.getAttribute("aria-expanded") === "true") { closeNav(); return; }
      menuToggle.setAttribute("aria-expanded", "true");
      mobileNav.classList.add("open");
      document.body.style.overflow = "hidden";
    });
    mobileNav.addEventListener("click", function (e) { if (e.target.closest("a")) closeNav(); });
    window.addEventListener("resize", function () { if (window.innerWidth > 991) closeNav(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });
  }

  /* Click tracking */
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-track]");
    if (!el) return;
    track(el.getAttribute("data-event") || "cta_click", {
      cta_label: el.getAttribute("data-track"),
      cta_position: el.getAttribute("data-pos") || "",
      page_type: document.body.getAttribute("data-page-type") || ""
    });
  });

  /* Lead source: keep UTMs and click ids for the whole visit, not just the landing page */
  var keys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"];
  var qs = new URLSearchParams(window.location.search);
  keys.forEach(function (k) {
    var v = qs.get(k);
    if (v) store(false, "tf_" + k, v);
  });
  if (!store(true, "tf_landing")) store(false, "tf_landing", window.location.href.split("#")[0]);
  if (!store(true, "tf_ref")) store(false, "tf_ref", document.referrer || "");

  /* Forms */
  document.querySelectorAll("form[data-form]").forEach(function (form) {
    var kind = form.getAttribute("data-form");
    var isApply = kind === "training" || kind === "incubation";
    var startEvt = kind === "audit" ? "audit_form_start" : (isApply ? "apply_start" : "contact_form_start");
    var submitEvt = kind === "audit" ? "audit_form_submit" : (isApply ? "apply_submit" : "contact_form_submit");

    keys.forEach(function (k) { if (form.elements[k]) form.elements[k].value = store(true, "tf_" + k) || ""; });
    if (form.elements["landing_page"]) form.elements["landing_page"].value = store(true, "tf_landing") || window.location.href.split("#")[0];
    if (form.elements["referrer"]) form.elements["referrer"].value = store(true, "tf_ref") || "";
    if (form.elements["source_page"]) form.elements["source_page"].value = window.location.pathname;

    // Prefill selects from the query string, e.g. ?industry=E-commerce or ?topic=Training
    ["industry", "topic"].forEach(function (name) {
      var want = qs.get(name);
      var sel = form.elements[name];
      if (want && sel && sel.tagName === "SELECT") {
        Array.prototype.forEach.call(sel.options, function (o) { if (o.text === want || o.value === want) sel.value = o.value || o.text; });
      }
    });

    var started = false;
    form.addEventListener("focusin", function () {
      if (started) return;
      started = true;
      track(startEvt, { form_type: kind, form_id: form.id });
    });

    var msg = form.querySelector(".form-msg");
    function show(text, isErr, href, label) {
      if (!msg) return;
      msg.className = "form-msg show" + (isErr ? " err" : "");
      msg.textContent = text;
      if (href) {
        msg.appendChild(document.createTextNode(" "));
        var a = document.createElement("a");
        a.href = href; a.target = "_blank"; a.rel = "noopener"; a.textContent = label;
        msg.appendChild(a);
      }
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.elements["company"] && form.elements["company"].value) return; // spam trap
      var data = {};
      var lines = [form.getAttribute("data-wa-intro") || "Hi t&f, I'd like to get in touch."];
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name || el.name === "company" || el.type === "submit" || el.type === "button") return;
        var v = (el.value || "").trim();
        data[el.name] = v;
        if (el.type === "hidden") return;
        var lab = form.querySelector('label[for="' + el.id + '"]');
        if (lab && v) lines.push(lab.firstChild.textContent.trim() + ": " + v);
      });
      data.form_type = kind;
      track(submitEvt, { form_type: kind, form_id: form.id, industry: data.industry || "", monthly_ad_spend: data.monthly_ad_spend || "" });

      if (TF.formEndpoint) {
        var btn = form.querySelector("button[type=submit]");
        if (btn) btn.disabled = true;
        fetch(TF.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
          .then(function (r) {
            if (!r.ok) throw new Error("bad status");
            form.reset();
            show("Thank you, " + (data.name || "") + ". " + (form.getAttribute("data-thanks") || "We have your request and will be in touch."), false);
          })
          .catch(function () {
            show("Your request did not go through. Please call " + TF.phone + " or write to " + TF.email + ".", true);
          })
          .then(function () { if (btn) btn.disabled = false; });
        return;
      }
      var url = "https://wa.me/" + TF.wa + "?text=" + encodeURIComponent(lines.join("\n"));
      var w = window.open(url, "_blank", "noopener");
      show(w ? "We opened WhatsApp with your details. Press send to complete your request." : "Almost done. Open WhatsApp and press send to complete your request.",
        false, w ? "" : url, w ? "" : "Open WhatsApp");
    });
  });
})();

/* t&f interactions: scroll progress, reveal, counters, video lightbox, VSL player, rails, filters, tilt, marquee.
   Everything degrades to the plain page; motion is skipped under prefers-reduced-motion. */
(function () {
  "use strict";
  var doc = document;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  function track(e, d) {
    var p = { event: e };
    for (var k in d) { if (Object.prototype.hasOwnProperty.call(d, k)) p[k] = d[k]; }
    (window.dataLayer = window.dataLayer || []).push(p);
  }

  /* ---------- scroll progress + floating CTA ---------- */
  var prog = $("#progress"), fcta = $("#fcta"), formsInView = 0, ticking = false;
  function onScroll() {
    ticking = false;
    var h = doc.documentElement, max = h.scrollHeight - window.innerHeight;
    if (prog) prog.style.transform = "scaleX(" + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ")";
    if (fcta) fcta.classList.toggle("show", window.scrollY > 560 && formsInView === 0);
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); } }, { passive: true });
  if ("IntersectionObserver" in window) {
    var fo = new IntersectionObserver(function (es) {
      es.forEach(function (e) { formsInView += e.isIntersecting ? 1 : -1; });
      formsInView = Math.max(0, formsInView);
      onScroll();
    }, { threshold: 0.2 });
    $$("form[data-form]").forEach(function (f) { fo.observe(f); });
  }
  onScroll();

  /* ---------- hero: pointer parallax on the background blobs ---------- */
  var hero = $(".hero");
  if (hero && fine && !reduce) {
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 2 - 1).toFixed(3));
      hero.style.setProperty("--my", ((e.clientY - r.top) / r.height * 2 - 1).toFixed(3));
    }, { passive: true });
  }

  /* ---------- scroll reveal (only below-the-fold elements are hidden, so nothing flashes) ---------- */
  if ("IntersectionObserver" in window && !reduce) {
    var sel = ".card-d,.card-s,.niche,.metric,.steps-l li,.quote,.vt,.rail-item,.infl-card,.tbl-wrap,.sec>.wrap>h2,.sec>.wrap>.intro,.faq details,.bento>div,.reel,.vec-band,.statband,.step,.why li,.price,.chain,.vsl-grid>*,.script";
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
        var t = e.target;
        setTimeout(function () { t.classList.remove("rv", "in"); t.style.removeProperty("--i"); }, 1500);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    $$(sel).forEach(function (el) {
      if (el.parentElement && el.parentElement.closest(".rv")) return;
      if (el.getBoundingClientRect().top < window.innerHeight * 0.98) return;
      var sibs = Array.prototype.filter.call(el.parentElement ? el.parentElement.children : [], function (c) { return c.tagName === el.tagName; });
      el.style.setProperty("--i", Math.min(Math.max(0, sibs.indexOf(el)), 5));
      el.classList.add("rv");
      io.observe(el);
    });
  }

  /* ---------- counters ---------- */
  function fmt(v, dec) { return v.toLocaleString("en-IN", { minimumFractionDigits: dec, maximumFractionDigits: dec }); }
  function runCount(el) {
    var to = parseFloat(el.getAttribute("data-count")), dec = parseInt(el.getAttribute("data-dec") || "0", 10);
    var pre = el.getAttribute("data-prefix") || "", suf = el.getAttribute("data-suffix") || "", final = el.textContent;
    if (isNaN(to)) return;
    var t0 = null, dur = 1500;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur), e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = pre + fmt(to * e, dec) + suf;
      if (p < 1) window.requestAnimationFrame(step); else el.textContent = final;
    }
    el.textContent = pre + fmt(0, dec) + suf;
    window.requestAnimationFrame(step);
  }
  var cEls = $$("[data-count]");
  if (cEls.length && "IntersectionObserver" in window && !reduce) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    cEls.forEach(function (el) { co.observe(el); });
  }

  /* ---------- marquee: duplicate the track so the loop is seamless ---------- */
  $$("[data-dup]").forEach(function (ul) {
    if (reduce) return;
    Array.prototype.slice.call(ul.children).forEach(function (li) {
      var c = li.cloneNode(true); c.setAttribute("aria-hidden", "true"); ul.appendChild(c);
    });
  });

  /* ---------- tilt on cards (mouse only) ---------- */
  if (fine && !reduce) {
    $$(".card-d,.infl-card").forEach(function (el) {
      el.setAttribute("data-tilt", "");
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty("--rx", (-y * 5).toFixed(2) + "deg");
        el.style.setProperty("--ry", (x * 6).toFixed(2) + "deg");
      });
      el.addEventListener("mouseleave", function () { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); });
    });
  }

  /* ---------- rails and filters ---------- */
  $$("[data-rail]").forEach(function (b) {
    b.addEventListener("click", function () {
      var list = $("[data-rail-list]", b.closest("section"));
      if (list) list.scrollBy({ left: parseInt(b.getAttribute("data-rail"), 10) * list.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" });
    });
  });
  $$(".chipbar").forEach(function (bar) {
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-filter]");
      if (!b) return;
      $$("button", bar).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      var cat = b.getAttribute("data-filter");
      $$("[data-cat]", bar.closest("section")).forEach(function (it) { it.hidden = !!cat && it.getAttribute("data-cat") !== cat; });
      track("media_filter", { filter: cat || "All" });
    });
  });

  /* ---------- video lightbox ---------- */
  var modal = $("#modal"), box = $("#modal-box"), screen = $("#modal-screen"), mx = $("#modal-x"), lastFocus = null;
  function openVid(el) {
    var vsl = el.closest("[data-vsl]");
    if (vsl) { startVsl(vsl); return; }
    if (!modal) return;
    lastFocus = el;
    var slot = el.getAttribute("data-slot") || "", src = el.getAttribute("data-src"), title = el.getAttribute("data-title") || "Video";
    box.classList.toggle("portrait", el.hasAttribute("data-portrait"));
    screen.innerHTML = "";
    if (src) {
      var v = doc.createElement("video");
      v.controls = true; v.autoplay = true; v.playsInline = true; v.src = src;
      var po = el.getAttribute("data-poster"); if (po) v.poster = po;
      screen.appendChild(v);
    } else {
      var w = doc.createElement("div"), eq = doc.createElement("div"), h = doc.createElement("h3"), p = doc.createElement("p"), p2 = doc.createElement("p");
      eq.className = "eq"; eq.innerHTML = "<i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>";
      h.textContent = title;
      p.textContent = el.getAttribute("data-brief") || "";
      p2.style.marginTop = ".8rem"; p2.style.fontWeight = "600";
      p2.textContent = "Video slot " + slot + ". Add " + slot + ".mp4 to the media folder and rebuild.";
      w.appendChild(eq); w.appendChild(h); w.appendChild(p); w.appendChild(p2); screen.appendChild(w);
    }
    modal.classList.add("open");
    doc.body.style.overflow = "hidden";
    if (mx) mx.focus();
    track("video_open", { video_slot: slot, real_file: !!src });
  }
  function closeVid() {
    if (!modal || !modal.classList.contains("open")) return;
    modal.classList.remove("open");
    screen.innerHTML = "";
    doc.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  doc.addEventListener("click", function (e) {
    var v = e.target.closest(".vid");
    if (v) { e.preventDefault(); openVid(v); return; }
    var o = e.target.closest("[data-open]");
    if (o) {
      var t = $('.vid[data-slot="' + o.getAttribute("data-open") + '"]');
      if (t && t.closest("[data-vsl]")) { t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" }); setTimeout(function () { openVid(t); }, reduce ? 0 : 450); }
      else if (t) openVid(t);
      return;
    }
    if (e.target === modal || e.target.closest("#modal-x")) closeVid();
  });
  doc.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeVid();
    if (e.key === "Tab" && modal && modal.classList.contains("open") && mx) { e.preventDefault(); mx.focus(); }
  });

  /* ---------- VSL: real <video> when a file exists, otherwise a timed demo of chapters + CTA unlock ---------- */
  function startVsl(root) {
    if (root.__on) return;
    root.__on = true;
    var vid = $(".vid", root), dur = parseFloat(root.getAttribute("data-dur")) || 240;
    var bar = $(".vsl-prog i", root), cta = $(".vsl-cta", root), chs = $$(".chapters button", root);
    var slot = vid.getAttribute("data-slot"), src = vid.getAttribute("data-src"), seen = {};
    function mark(t) {
      var p = Math.max(0, Math.min(1, t / dur));
      bar.style.width = (p * 100).toFixed(1) + "%";
      if (p >= 0.3) cta.classList.add("on");
      var cur = -1;
      chs.forEach(function (b, i) { if (t >= parseFloat(b.getAttribute("data-t"))) cur = i; });
      chs.forEach(function (b, i) { b.classList.toggle("on", i === cur); });
      if (src) [25, 50, 75, 100].forEach(function (m) { if (p * 100 >= m && !seen[m]) { seen[m] = 1; track("vsl_progress", { video_slot: slot, percent: m }); } });
    }
    if (src) {
      var holder = doc.createElement("div"), v = doc.createElement("video");
      holder.className = "r-16x9";
      holder.style.cssText = "position:relative;border-radius:24px;overflow:hidden;background:#000;box-shadow:0 30px 80px rgba(0,0,0,.45)";
      v.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
      v.src = src; v.controls = true; v.autoplay = true; v.playsInline = true;
      var po = vid.getAttribute("data-poster"); if (po) v.poster = po;
      holder.appendChild(v); vid.parentNode.replaceChild(holder, vid);
      v.addEventListener("loadedmetadata", function () { if (v.duration) dur = v.duration; });
      v.addEventListener("timeupdate", function () { mark(v.currentTime); });
      chs.forEach(function (b) { b.addEventListener("click", function () { v.currentTime = parseFloat(b.getAttribute("data-t")); v.play(); }); });
      track("vsl_play", { video_slot: slot });
      return;
    }
    var t = 0, speed = 14, timer = null;
    var screenEl = doc.createElement("div");
    screenEl.className = "modal-screen"; screenEl.style.cssText = "position:absolute;inset:0;z-index:2;aspect-ratio:auto";
    var eq = doc.createElement("div"), h = doc.createElement("h3"), p = doc.createElement("p");
    eq.className = "eq"; eq.innerHTML = "<i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>";
    p.textContent = "Timed demo of the player. The real video replaces this screen.";
    var wrap = doc.createElement("div"); wrap.appendChild(eq); wrap.appendChild(h); wrap.appendChild(p); screenEl.appendChild(wrap);
    vid.appendChild(screenEl);
    $$(".vid-play,.vid-meta", vid).forEach(function (x) { x.style.display = "none"; });
    function label() { var cur = chs.filter(function (b) { return t >= parseFloat(b.getAttribute("data-t")); }).pop(); h.textContent = cur ? cur.textContent.replace(/^\d+:\d+/, "") : ""; }
    function tick() {
      t += 0.25 * speed; mark(t); label();
      if (t >= dur) { clearInterval(timer); p.textContent = "Demo finished."; }
    }
    timer = setInterval(tick, 250); tick();
    chs.forEach(function (b) { b.addEventListener("click", function () { t = parseFloat(b.getAttribute("data-t")); mark(t); label(); }); });
  }
  $$(".vsl-player .chapters button").forEach(function (b) {
    b.addEventListener("click", function () { var root = b.closest("[data-vsl]"); if (!root.__on) { startVsl(root); } });
  });

  /* ---------- anchor links to the hero form focus the first field ---------- */
  doc.addEventListener("click", function (e) {
    var a = e.target.closest('a[href$="#hero-form"],a[href="#apply"]');
    if (!a) return;
    setTimeout(function () { var i = $("#hero-form input, #apply input"); if (i && a.getAttribute("href").indexOf("hero-form") > -1) i.focus({ preventScroll: true }); }, 600);
  });
})();
