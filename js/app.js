/* Renders every page from window.CONTENT (generated from content.md by tools/build.py).
   Pages never hard-code facts: all names, numbers and claims come from the data file.
   Design: Direction A "Sticker Studio". */
(function () {
  "use strict";
  var C = window.CONTENT;
  var body = document.body;
  var ROOT = body.getAttribute("data-root") || "";
  var PAGE = body.getAttribute("data-page");
  var DEV = C.build === "dev";
  var app = document.getElementById("app");

  var STAGE_COLORS = ["c-marigold", "c-lilac", "c-pink", "c-mint", "c-teal"];
  var CARD_COLORS = ["c-marigold", "c-white", "c-lilac", "c-teal", "c-pink", "c-mint"];
  var NUM = /(?:^|[^A-Za-z\d])(\d[\d,.]*(?:\+|%|x\b)?(?:\s+in\s+\d+)?)(?![A-Za-z\d])/;

  /* ---------------- helpers ---------------- */
  function h(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v == null || v === false) return;
        if (k === "class") e.className = v;
        else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), v);
        else e.setAttribute(k, v === true ? "" : v);
      });
    }
    add(e, kids);
    return e;
  }
  function add(e, kids) {
    if (kids == null) return;
    if (!Array.isArray(kids)) kids = [kids];
    kids.forEach(function (k) {
      if (k == null || k === false) return;
      e.appendChild(typeof k === "string" ? document.createTextNode(k) : k.nodeType ? k : val(k));
    });
  }
  function isNeeds(x) { return x && typeof x === "object" && x.needs; }
  function val(x) {
    if (x == null) return document.createTextNode("");
    if (typeof x === "string") return document.createTextNode(x);
    if (x.needs) return h("span", { class: "needs" }, x.needs);
    if (x.text != null) return document.createTextNode(x.text);
    return document.createTextNode("");
  }
  function flags(list) {
    if (!DEV || !list || !list.length) return null;
    return h("div", { class: "flags" }, list.map(function (f) { return h("p", { class: "flag" }, f); }));
  }
  function has(list) { return list && list.length; }
  // Script word + wide caps word. Screen readers hear the plain phrase.
  function mix(tag, cls, script, caps, id) {
    return h(tag, { class: "mix " + (cls || ""), id: id }, [
      h("span", { class: "sr-only" }, script + " " + caps),
      h("span", { class: "s", "aria-hidden": "true" }, script),
      h("span", { class: "c", "aria-hidden": "true" }, caps)
    ]);
  }
  // A paragraph is a string (old format) or a list of sentences, some of which may be flagged.
  function para(p) {
    var items = Array.isArray(p) ? p : [p];
    if (!items.length) return null;
    var fl = [];
    var el = h("p", null, items.map(function (s) {
      if (typeof s === "string") return s + " ";
      if (s && s.flags) fl = fl.concat(s.flags);
      return h("span", { class: DEV ? "held" : null }, (s && s.text || "") + " ");
    }));
    return fl.length && DEV ? h("div", null, [el, flags(fl)]) : el;
  }
  function list(items, cls) { return h("ul", { class: cls }, items.map(function (t) { return h("li", null, [t]); })); }

  /* ---------------- theme ---------------- */
  var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>';
  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  function isDark() {
    var t = document.documentElement.getAttribute("data-theme");
    return t ? t === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function themeBtn() {
    var b = h("button", { type: "button", class: "theme-btn" });
    function sync() {
      var d = isDark();
      b.innerHTML = d ? SUN : MOON;
      b.setAttribute("aria-label", d ? "Switch to light mode" : "Switch to dark mode");
    }
    b.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      sync();
    });
    sync();
    return b;
  }

  /* ---------------- shared chrome ---------------- */
  function nav() {
    var links = [["Home", ROOT + "index.html", PAGE === "home"], ["Work", ROOT + "work.html", PAGE === "allwork" || PAGE === "work"], ["Skills", ROOT + "skills.html", PAGE === "skills"], ["About", ROOT + "about.html", PAGE === "about"]];
    if (typeof C.site.resume === "string") links.push(["Resume", ROOT + C.site.resume, false]);
    var parts = C.site.name.split(" ");
    return h("header", { class: "nav" }, h("div", { class: "wrap nav-in" }, [
      h("a", { class: "brand mix", href: ROOT + "index.html", "aria-label": C.site.name + ", home" }, [
        h("span", { class: "s", "aria-hidden": "true" }, parts[0]),
        h("span", { class: "c", "aria-hidden": "true" }, parts.slice(1).join(" "))
      ]),
      h("nav", { class: "nav-links", "aria-label": "Primary" }, links.map(function (l) {
        return h("a", { href: l[1], "aria-current": l[2] ? "page" : null }, l[0]);
      }).concat([h("a", { class: "cta", href: ROOT + "contact.html", "aria-current": PAGE === "contact" ? "page" : null }, "Let’s talk"), themeBtn()]))
    ]));
  }

  // Email and LinkedIn only (no resume button), as big, easy-to-hit buttons
  function contactButtons() {
    var s = C.site;
    // Clicking copies the address (works everywhere) and still opens the visitor's mail app if they have one.
    var sub = h("span", { class: "big-sub" }, s.email);
    var status = h("span", { class: "sr-only", role: "status", "aria-live": "polite" });
    var email = h("a", { class: "big-btn big-email", href: "mailto:" + s.email }, [
      h("span", { class: "big-label" }, "Email me"), sub, status
    ]);
    email.addEventListener("click", function () {
      function done() {
        sub.textContent = "Copied! " + s.email;
        status.textContent = "Email address copied to your clipboard.";
        email.classList.add("copied");
        setTimeout(function () { sub.textContent = s.email; status.textContent = ""; email.classList.remove("copied"); }, 2600);
      }
      function legacyCopy() {
        try {
          var t = document.createElement("textarea"); t.value = s.email; t.setAttribute("readonly", "");
          t.style.position = "absolute"; t.style.left = "-9999px"; document.body.appendChild(t); t.select();
          var ok = document.execCommand("copy"); t.remove();
          if (ok) { done(); return; }
        } catch (e) {}
        // last resort: highlight the address so the visitor can copy it themselves
        sub.textContent = s.email;
        var hint = h("span", { class: "big-hint" }, "Press \u2318C / Ctrl+C to copy");
        if (!email.querySelector(".big-hint")) email.appendChild(hint);
        var r = document.createRange(); r.selectNodeContents(sub);
        var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
        status.textContent = "Email address selected. Press Command C or Control C to copy it.";
        setTimeout(function () { var x = email.querySelector(".big-hint"); if (x) x.remove(); }, 4000);
      }
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(s.email).then(done, legacyCopy);
      else legacyCopy();
    });
    var out = [email];
    if (typeof s.linkedin === "string") out.push(h("a", { class: "big-btn big-li", href: s.linkedin, rel: "noopener" }, [
      h("span", { class: "big-label" }, "LinkedIn \u2197"), h("span", { class: "big-sub" }, "Connect with me")
    ]));
    else if (isNeeds(s.linkedin)) out.push(val(s.linkedin));
    return out;
  }

  function contactSection(asPage) {
    var av = C.site.availability;
    // text on the left, the two big buttons stacked on the right (below on phones)
    var text = h("div", { class: "contact-text" }, [
      mix(asPage ? "h1" : "h2", "contact-title", "Let’s", "Talk", "contact-h"),
      av ? h("p", { class: "sub" }, av.text) : null,
      av ? flags(av.flags) : null,
      asPage && C.hero.support ? h("p", { class: "contact-support" }, C.hero.support) : null
    ]);
    return h("section", { class: "contact" + (asPage ? " contact-page" : ""), id: "contact", "aria-labelledby": "contact-h" },
      h("div", { class: "wrap contact-split" }, [text, h("div", { class: "contact-actions" }, contactButtons())]));
  }

  function footer() {
    return h("footer", { class: "site-foot" }, h("div", { class: "wrap" }, C.site.name));
  }

  function devbar() {
    if (!DEV) return null;
    body.classList.add("flags-on");
    var cb = h("input", { type: "checkbox", checked: true });
    cb.addEventListener("change", function () { body.classList.toggle("flags-on", cb.checked); });
    var bar = h("div", { class: "devbar", role: "region", "aria-label": "Editor tools" }, [
      h("strong", null, "Dev build"), h("label", null, [cb, "Show editor flags"])
    ]);
    setTimeout(function () { if (!document.querySelector(".flag, .needs, .held")) bar.remove(); }, 0);
    return bar;
  }

  function portrait(img, withStickers) {
    var inner = isNeeds(img) ? val(img) : img ? h("img", { src: ROOT + (img.thumb || img.src), alt: img.alt, width: "600", height: "800", decoding: "async" }) : null;
    var kids = [h("div", { class: "arch" }, inner)];
    if (withStickers) {
      kids.push(h("span", { class: "spark", "aria-hidden": "true" }), h("span", { class: "spark two", "aria-hidden": "true" }));
      var cols = ["c-marigold", "c-lilac", "c-white", "c-pink"];
      C.tags.slice(0, 4).forEach(function (t, i) {
        kids.push(h("span", { class: "sticker s" + (i + 1) + " " + cols[i], "aria-hidden": "true" }, t));
      });
      if (has(C.tags)) kids.push(h("p", { class: "sr-only" }, "Focus areas: " + C.tags.join(", ") + "."));
    }
    return h("div", { class: "arch-wrap" }, kids);
  }

  /* ---------------- home ---------------- */
  var state = { stage: null, fn: "All", lens: "All" };
  var ui = {};

  function hero() {
    var parts = C.site.name.split(" ");
    return h("section", { class: "hero", "aria-label": "Introduction" }, [
      nav(),
      h("div", { class: "wrap hero-in" }, [
        h("div", null, [
          mix("h1", "hero-name", parts[0], parts.slice(1).join(" ")),
          h("div", { class: "select-box" }, [
            h("span", { class: "hdl tl", "aria-hidden": "true" }), h("span", { class: "hdl tr", "aria-hidden": "true" }),
            h("span", { class: "hdl bl", "aria-hidden": "true" }), h("span", { class: "hdl br", "aria-hidden": "true" }),
            h("p", { class: "hero-lead" }, C.hero.headline)
          ]),
          C.hero.tagline ? h("p", { class: "hero-tagline" }, C.hero.tagline) : null,
          has(C.hero.intro) ? h("p", { class: "hero-intro" }, C.hero.intro.map(function (s) {
            return typeof s === "string" ? s + " " : h("span", { class: DEV ? "held" : null }, s.text + " ");
          })) : null,
          C.hero.support ? h("p", { class: "hero-support" }, C.hero.support) : null,
          flags(C.hero.flags),
          flags([].concat.apply([], (C.hero.intro || []).filter(function (s) { return s && s.flags; }).map(function (s) { return s.flags; }))),
          h("div", { class: "hero-ctas" }, [
            h("a", { class: "btn primary", href: "#work" }, "See the work"),
            h("a", { class: "btn", href: "#funnel" }, "Pick a stage ↓")
          ])
        ]),
        portrait(C.site.headshot, true)
      ])
    ]);
  }

  function intro() {
    var st = C.stats;
    if (!has(st.items)) return null;
    return h("section", { class: "section", "aria-labelledby": "intro-h" }, h("div", { class: "wrap" }, [
      h("h2", { class: "sr-only", id: "intro-h" }, "Highlights"),
      h("ul", { class: "stats" }, st.items.map(function (s, i) {
        return h("li", { class: CARD_COLORS[[0, 2, 4, 5][i % 4]] }, [h("span", { class: "stat-num" }, s.num), h("span", { class: "stat-label" }, s.label)]);
      })),
      st.footnote ? h("p", { class: "footnote" }, st.footnote) : null,
      flags(st.flags)
    ]));
  }

  function infoPanel() {
    var orgs = [], seen = {};
    C.career.forEach(function (c) { if (!seen[c.org]) { seen[c.org] = 1; orgs.push(c); } });
    function cell(title, el) { return h("div", null, [h("h3", null, title), el]); }
    return h("section", { class: "section tight", "aria-labelledby": "info-h" }, h("div", { class: "wrap" }, [
      h("h2", { class: "sr-only", id: "info-h" }, "At a glance"),
      h("div", { class: "info" }, [
        cell("Education", list(C.about.education.slice().reverse())),
        cell("Experience", h("ul", null, orgs.map(function (c) { return h("li", null, [c.org, h("small", null, c.title)]); }))),
        cell("Languages", list(C.about.languages))
      ])
    ]));
  }

  function funnel() {
    var n = C.stages.length;
    ui.bands = C.stages.map(function (s, i) {
      return h("button", {
        type: "button", class: "band " + STAGE_COLORS[i % STAGE_COLORS.length], "aria-pressed": "false",
        style: "width:" + (100 - i * (48 / Math.max(n - 1, 1))) + "%;--r:" + (i % 2 ? 1.2 : -1.2) + "deg",
        onclick: function () { setStage(state.stage === s.id ? null : s.id); }
      }, s.id);
    });
    ui.panel = h("div", { class: "stage-panel", "aria-live": "polite" });
    return h("section", { class: "section tight", id: "funnel", "aria-labelledby": "funnel-h" }, h("div", { class: "wrap" }, [
      mix("h2", "section-title", "Pick a", "Stage", "funnel-h"),
      h("p", { class: "sub" }, "The work is organized the way a customer moves through the funnel."),
      h("div", { class: "funnel-grid" }, [
        h("div", { class: "funnel", role: "group", "aria-label": "Funnel stages. Select one to filter the work." }, ui.bands.concat([h("span", { class: "funnel-tip", "aria-hidden": "true" })])),
        ui.panel
      ])
    ]));
  }

  function bigNumber(p) {
    var r = (p.result || []).filter(function (x) { return typeof x === "string"; });
    for (var i = 0; i < r.length; i++) {
      var re = new RegExp(NUM.source, "g"), m;
      while ((m = re.exec(r[i]))) {
        var after = r[i].slice(m.index + m[0].length);
        if (!/^\s*(months?|years?|weeks?|days?)\b/i.test(after)) return m[1];
      }
    }
    return null;
  }

  function card(p, i) {
    var url = ROOT + "work/" + p.slug + ".html";
    var num = bigNumber(p);
    var compact = PAGE === "home";  // home cards match the approved mockup; All work keeps the result lines
    var proof = compact ? [] : (p.result || []).slice(0, 2);
    var big = i % 4 === 0 || i % 4 === 3;
    return h("article", { class: "card " + CARD_COLORS[i % CARD_COLORS.length] + (big ? " big" : "") }, [
      h("p", { class: "eyebrow" }, p.org),
      p.note ? h("p", { class: "badge" }, p.note) : null,
      num ? h("span", { class: "card-num", "aria-hidden": "true" }, num) : null,
      h("h3", null, h("a", { href: url }, p.title)),
      p.summary ? h("p", { class: compact ? "card-sum" : null }, p.summary) : null,
      has(proof) ? h("ul", { class: "proof" }, proof.map(function (x) { return h("li", null, [x]); })) : null,
      h("div", { class: "tags" }, p.stages.concat(p.fns).map(function (t) { return h("span", { class: "tag" }, t); })),
      compact ? null : h("span", { class: "card-cta", "aria-hidden": "true" }, "Read the case study →"),
      flags(p.flags)
    ]);
  }

  function chipRow(label, items, key) {
    return h("div", { class: "controls", role: "group", "aria-label": label }, [h("span", { class: "controls-label", "aria-hidden": "true" }, label.replace("Filter by ", ""))]
      .concat(items.map(function (it) {
        var si = key === "stage" ? C.stages.map(function (x) { return x.id; }).indexOf(it.v) : -1;
        var b = h("button", { type: "button", class: "chip chip-" + key + (si > -1 ? " " + STAGE_COLORS[si % STAGE_COLORS.length] : ""), "aria-pressed": "false", "data-v": it.v }, it.t);
        b.addEventListener("click", function () {
          if (key === "stage") setStage(it.v);
          else if (key === "lens") { state.lens = it.v; renderWork(); }
          else { state.fn = it.v; renderWork(); }
        });
        return b;
      })));
  }

  // One filter rule for everything. Cards without stage or function data in content.md
  // can't be placed in a stage or function, so they hide while that filter is on.
  function matches(it) {
    var dt = it.draftTags || {};  // drafted, not-yet-approved tags exist only in the dev build
    var stages = has(it.stages) ? it.stages : (dt.stages || []);
    var fns = has(it.fns) ? it.fns : (dt.fns || []);
    if (state.lens !== "All" && (it.lenses || []).indexOf(state.lens) < 0) return false;
    if (state.stage && stages.indexOf(state.stage) < 0) return false;
    if (state.fn !== "All" && fns.indexOf(state.fn) < 0) return false;
    return true;
  }

  function work(all) {
    ui.lensChips = has(C.lenses) ? chipRow("Filter by lens", [{ t: "All", v: "All" }].concat(C.lenses.map(function (l) { return { t: l, v: l }; })), "lens") : null;
    ui.stageChips = chipRow("Filter by stage", [{ t: "All", v: "" }].concat(C.stages.map(function (s) { return { t: s.id, v: s.id }; })), "stage");
    ui.fnChips = chipRow("Filter by function", [{ t: "All", v: "All" }].concat(C.functions.map(function (f) { return { t: f, v: f }; })), "fn");
    ui.count = h("p", { class: "count", "aria-live": "polite" });
    ui.grid = h("div", { class: "bento" });
    ui.empty = h("p", { class: "empty", hidden: true }, "Nothing matches that combination yet. Clear a filter to see everything.");
    return h("section", { class: "section", id: "work", "aria-labelledby": "work-h" }, h("div", { class: "wrap" }, [
      all ? mix("h1", "section-title page-title", "All", "Work", "work-h") : mix("h2", "section-title", "Selected", "Work", "work-h"),
      all ? h("p", { class: "sub" }, "Every project in one place: case studies first, then the rest. The filters cover all of it.") : null,
      ui.lensChips, ui.stageChips, ui.fnChips, ui.count, ui.grid,
      all ? h("h2", { class: "group-head all-more-head", id: "more-head" }, "More work") : null,
      all ? moreWork() : null,
      ui.empty,
      all ? null : h("p", { class: "section-cta" }, ui.allLink = h("a", { class: "btn primary", href: "work.html" }, "See all work →"))
    ]));
  }

  function moreWork() {
    if (!has(C.more)) return null;
    return h("div", { id: "more" }, [].concat(C.more.filter(function (g) { return has(g.items); }).map(function (g) {
      var cards = [];
      var grp = h("div", null, [
        h("h3", { class: "group-head" }, g.label),
        has(g.notes) ? h("p", { class: "group-sub" }, g.notes.map(val)) : null,
        h("div", { class: "compact" }, g.items.map(function (it) {
          var el = h("article", { class: "card" }, [
            h("h4", null, it.title),
            h("p", null, it.desc),
            has(it.articles) ? h("details", { class: "articles" }, [
              h("summary", null, "Selected articles" + (it.articleLabel ? ", " + it.articleLabel : "")),
              h("ul", null, it.articles.map(function (ar) {
                return h("li", null, [
                  h("a", { href: ar.link, rel: "noopener" }, [ar.title + " \u2197"]),
                  it.articleLabel ? h("small", null, " " + it.articleLabel) : null
                ]);
              }))
            ]) : null,
            it.link ? h("a", { class: "ext", href: it.link, rel: "noopener" }, ["View the public page ↗", h("span", { class: "sr-only" }, ": " + it.title)]) : null,
            flags(it.flags),
            it.draftTags ? flags(it.draftTags.flags) : null
          ]);
          var mc = { el: el, it: it };
          cards.push(mc); ui.moreCards = (ui.moreCards || []).concat([mc]);
          return el;
        }))
      ]);
      ui.moreGroups = (ui.moreGroups || []).concat([{ el: grp, cards: cards }]);
      return grp;
    })));
  }

  function allTools() {
    var tools = [];
    C.stages.forEach(function (s) { s.tools.forEach(function (t) { if (tools.indexOf(t) < 0) tools.push(t); }); });
    C.otherTools.forEach(function (t) { if (tools.indexOf(t) < 0) tools.push(t); });
    return tools;
  }

  // Skill groups: always open on desktop; on phones they start closed and open on tap.
  function phoneCollapsible(wrap) {
    var mq = window.matchMedia("(max-width: 640px)");
    var groups = wrap.querySelectorAll("details");
    function sync() {
      Array.prototype.forEach.call(groups, function (d) { d.open = !mq.matches; });
      wrap.classList.toggle("is-phone", mq.matches);
    }
    Array.prototype.forEach.call(groups, function (d) {
      d.querySelector("summary").addEventListener("click", function (e) { if (!mq.matches) e.preventDefault(); });
    });
    if (mq.addEventListener) mq.addEventListener("change", sync); else mq.addListener(sync);
    sync();
    return wrap;
  }

  function skills(full) {
    var k = C.skills;
    if (!k || !(has(k.proof) || has(k.groups) || has(k.tools))) return null;
    var cardCols = ["c-marigold", "c-lilac", "c-mint", "c-pink", "c-white"];
    function chip(x) {
      return typeof x === "string" ? h("li", null, x) : h("li", { class: DEV ? "held" : null }, x.text);
    }
    var groupFlags = [];
    (k.groups || []).forEach(function (g) { g.items.forEach(function (x) { if (x && x.flags) groupFlags = groupFlags.concat(x.flags); }); });
    return h("section", { class: "section", id: "skills", "aria-labelledby": "skills-h" }, [
      h("div", { class: "wrap" }, [
        mix(full ? "h1" : "h2", "section-title" + (full ? " page-title" : ""), "Skills with", "Proof", "skills-h"),
        has(k.proof) ? h("ul", { class: "proof-grid" }, k.proof.map(function (p, i) {
          return h("li", { class: "proof-card " + cardCols[i % cardCols.length] }, [h("h3", null, p.skill), h("p", null, p.proof)]);
        })) : null,
        full ? null : h("p", { class: "section-cta" }, h("a", { class: "btn primary", href: "skills.html" }, "See all my skills and tools →"))
      ]),
      !full ? null : h("div", { class: "wrap" }, [
        has(k.groups) ? mix("h3", "section-title sub-title", "The full", "Skill set") : null,
        has(k.groups) ? phoneCollapsible(h("div", { class: "skill-groups" }, k.groups.map(function (g) {
          return h("details", { class: "skill-group", open: true }, [
            h("summary", null, h("h4", null, g.name)),
            h("ul", { class: "toollist" }, g.items.map(chip))
          ]);
        }))) : null,
        flags(groupFlags),
        flags(k.flags)
      ]),
      full && (has(k.tools) || has(k.languages) || has(k.learning)) ? h("div", { class: "toolkit-block section" }, h("div", { class: "wrap" }, [
        mix("h3", "section-title", "Tools &", "Platforms"),
        h("div", { class: "tool-cats" }, k.tools.map(function (t) {
          return h("div", null, [h("h4", null, t.cat), list(t.items, "tiles")]);
        })),
        h("div", { class: "lang-learn" }, [
          has(k.languages) ? h("div", null, [h("h4", null, "Languages"), h("p", null, k.languages.join(", "))]) : null,
          has(k.learning) ? h("div", null, [h("h4", null, "Currently learning"), h("p", null, k.learning.join(", "))]) : null
        ])
      ])) : null
    ]);
  }

  function teaser() {
    var a = C.about;
    return h("section", { class: "section", "aria-labelledby": "teaser-h" }, h("div", { class: "wrap teaser" }, [
      mix("h2", "section-title", "A bit", "About me", "teaser-h"),
      h("div", null, (a.teaser && a.teaser.length ? a.teaser : a.paras.slice(0, 2)).map(para).concat([
        flags(a.flags),
        h("a", { class: "btn pink", href: "about.html" }, "More about me →")
      ]))
    ]));
  }

  function setStage(s) {
    state.stage = s || null;
    renderWork();
  }

  function renderWork() {
    (ui.bands || []).forEach(function (b, i) { b.setAttribute("aria-pressed", C.stages[i].id === state.stage ? "true" : "false"); });
    Array.prototype.forEach.call(ui.stageChips.querySelectorAll(".chip"), function (c) {
      c.setAttribute("aria-pressed", (c.getAttribute("data-v") || null) === state.stage ? "true" : "false");
    });
    Array.prototype.forEach.call(ui.fnChips.querySelectorAll(".chip"), function (c) {
      c.setAttribute("aria-pressed", c.getAttribute("data-v") === state.fn ? "true" : "false");
    });
    if (ui.lensChips) Array.prototype.forEach.call(ui.lensChips.querySelectorAll(".chip"), function (c) {
      c.setAttribute("aria-pressed", c.getAttribute("data-v") === state.lens ? "true" : "false");
    });
    (ui.moreCards || []).forEach(function (mc) { mc.el.hidden = !matches(mc.it); });
    (ui.moreGroups || []).forEach(function (g) {
      g.el.hidden = !g.cards.some(function (mc) { return !mc.el.hidden; });
    });
    var moreShown = (ui.moreCards || []).filter(function (mc) { return !mc.el.hidden; }).length;
    var moreHead = document.getElementById("more-head");
    if (moreHead) moreHead.hidden = moreShown === 0;
    var shown = C.projects.filter(matches);
    var s = C.stages.filter(function (x) { return x.id === state.stage; })[0];
    if (ui.panel) ui.panel.textContent = "";
    if (!ui.panel) { /* All work page has no funnel panel */ }
    else if (s) {
      var n = C.projects.filter(function (p) { return p.stages.indexOf(s.id) > -1; }).length;
      add(ui.panel, [h("h3", null, s.id), h("p", null, s.blurb), list(s.tools, "toollist"),
        h("a", { class: "btn primary jump", href: "#work" }, "See " + n + (n === 1 ? " project" : " projects") + " ↓")]);
    } else {
      add(ui.panel, [h("h3", null, "Start anywhere"), h("p", null, "Each pill is a stage of the customer journey. Pick one to see the tools I use there and filter the work.")]);
    }
    ui.grid.textContent = "";
    var onHome = PAGE === "home";
    var visible = onHome ? shown.slice(0, 6) : shown;
    visible.forEach(function (p, i) { ui.grid.appendChild(card(p, i)); });
    var total = shown.length + moreShown;
    ui.empty.hidden = total > 0;
    var filterLabel = (s || state.fn !== "All" || state.lens !== "All" ? " (" + [state.lens !== "All" ? state.lens : null, s ? s.id : null, state.fn !== "All" ? state.fn : null].filter(Boolean).join(", ") + ")" : "");
    ui.count.textContent = (onHome && total > visible.length ? "Showing " + visible.length + " of " : "") +
      total + (total === 1 ? " project" : " projects") + filterLabel;
    if (ui.allLink) {
      var q = [];
      if (state.lens !== "All") q.push("lens=" + encodeURIComponent(state.lens));
      if (state.stage) q.push("stage=" + encodeURIComponent(state.stage));
      if (state.fn !== "All") q.push("fn=" + encodeURIComponent(state.fn));
      ui.allLink.setAttribute("href", "work.html" + (q.length ? "#" + q.join("&") : ""));
      ui.allLink.textContent = total > visible.length ? "See all " + total + " →" : "See all work →";
    }
  }

  function home() {
    add(app, [hero(), h("main", { id: "main", tabindex: "-1" }, [intro(), infoPanel(), funnel(), work(false), skills(false), teaser()]), contactSection(), footer(), devbar()]);
    renderWork();
  }

  function allWorkPage() {
    (location.hash || "").replace(/^#/, "").split("&").forEach(function (kv) {
      var p = kv.split("="), v = decodeURIComponent(p[1] || "");
      if (p[0] === "lens" && C.lenses.indexOf(v) > -1) state.lens = v;
      if (p[0] === "stage" && C.stages.some(function (x) { return x.id === v; })) state.stage = v;
      if (p[0] === "fn" && C.functions.indexOf(v) > -1) state.fn = v;
    });
    add(app, [nav(), h("main", { id: "main", tabindex: "-1" }, [work(true)]), contactSection(), footer(), devbar()]);
    renderWork();
  }

  function skillsPage() {
    add(app, [nav(), h("main", { id: "main", tabindex: "-1", class: "skills-page" }, [skills(true)]), contactSection(), footer(), devbar()]);
  }

  function contactPage() {
    add(app, [nav(), h("main", { id: "main", tabindex: "-1" }, [contactSection(true)]), footer(), devbar()]);
  }

  /* ---------------- case study ---------------- */
  function inlineDiagram(fig, d) {
    var url = ROOT + d.file;
    fetch(url).then(function (r) { if (!r.ok) throw 0; return r.text(); }).then(function (svg) {
      var tmp = document.createElement("div");
      tmp.innerHTML = svg;
      var el = tmp.querySelector("svg");
      if (!el) throw 0;
      el.setAttribute("role", "img");
      el.setAttribute("aria-label", d.label);
      fig.insertBefore(el, fig.firstChild);
    }).catch(function () {
      fig.insertBefore(h("img", { src: url, alt: d.label }), fig.firstChild);
    });
  }

  function row(title, content) {
    return h("section", { class: "case-row" }, [h("h2", null, title), h("div", { class: "body" }, content)]);
  }
  function listOrPara(items) {
    if (items.length === 1) return h("p", null, [items[0]]);
    return list(items);
  }

  function workPage() {
    var slug = body.getAttribute("data-slug");
    var idx = -1;
    C.projects.forEach(function (p, i) { if (p.slug === slug) idx = i; });
    var p = C.projects[idx];
    var main = h("main", { id: "main", tabindex: "-1", class: "wrap" });
    add(app, [nav(), main, contactSection(), footer(), devbar()]);
    if (!p) { add(main, [h("p", { class: "crumb" }, h("a", { href: ROOT + "work.html" }, "← All work")), h("h1", { class: "case-title" }, "Not found")]); return; }
    document.title = p.title + " | " + C.site.name;

    var visuals = [];
    if (p.diagram) {
      var fig = h("figure", { class: "diagram" }, h("figcaption", null, p.diagram.note));
      inlineDiagram(fig, p.diagram);
      visuals.push(fig);
    }
    var imgs = (p.gallery || []).filter(function (g) { return !isNeeds(g); });
    if (imgs.length) {
      visuals.push(h("div", { class: "gallery" }, imgs.map(function (g) {
        return h("figure", null, [
          h("a", { href: ROOT + g.src }, h("img", { src: ROOT + g.thumb, alt: g.alt, loading: "lazy" })),
          g.caption ? h("figcaption", null, g.caption) : null,
          flags(g.flags)
        ]);
      })));
    }
    (p.gallery || []).filter(isNeeds).forEach(function (g) { visuals.push(h("div", { class: "placeholder" }, g.needs)); });
    var prev = C.projects[idx - 1], next = C.projects[idx + 1];
    var num = bigNumber(p);

    add(main, [
      h("p", { class: "crumb" }, h("a", { href: ROOT + "work.html" }, "← All work")),
      h("header", { class: "case-head " + CARD_COLORS[idx % CARD_COLORS.length] }, [
        h("p", { class: "eyebrow" }, [p.org].concat(p.date && typeof p.date === "string" ? [" · " + p.date] : [])),
        isNeeds(p.date) ? h("p", null, val(p.date)) : null,
        p.note ? h("p", { class: "badge", style: "margin-bottom:16px" }, p.note) : null,
        h("h1", { class: "case-title" }, p.title),
        num ? h("p", { class: "card-num", "aria-hidden": "true", style: "margin-bottom:12px" }, num) : null,
        h("p", { class: "case-lead" }, p.summary),
        p.client ? h("p", { class: "case-client" }, [h("b", null, "Client: "), p.client]) : null,
        h("div", { class: "tags" }, p.stages.concat(p.fns).map(function (t) { return h("span", { class: "tag" }, t); })),
        flags(p.flags) ? h("div", { style: "margin-top:16px" }, flags(p.flags)) : null
      ]),
      has(p.problem) ? row(p.problemLabel || "Problem", listOrPara(p.problem)) : null,
      has(p.approach) ? row("Approach", p.approach.map(function (a) { return h("p", null, [a]); })) : null,
      has(p.result) ? row(p.resultLabel || "Result", listOrPara(p.result)) : null,
      has(p.delivered) ? row("What we delivered", listOrPara(p.delivered)) : null,
      p.after ? row(p.after.heading, h("p", null, p.after.text)) : null,
      visuals.length ? row("Gallery", visuals) : null,
      p.link ? row("Read more", h("p", null, h("a", { class: "btn", href: p.link, rel: "noopener" }, (p.linkLabel || "View the public project page") + " ↗"))) : null,
      h("nav", { class: "case-nav", "aria-label": "More case studies" }, [
        prev ? h("a", { href: prev.slug + ".html" }, [h("span", null, "← Previous"), h("b", null, prev.title)]) : null,
        next ? h("a", { class: "next", href: next.slug + ".html" }, [h("span", null, "Next →"), h("b", null, next.title)]) : null
      ])
    ]);
  }

  /* ---------------- about ---------------- */
  // 4-photo collage: headshot tall on the left, two photos stacked beside it, one wide photo underneath
  function collage(headshot, photos, stickers) {
    var real = (photos || []).filter(function (x) { return !isNeeds(x); });
    var tiles = [];
    function tile(img, cls) {
      if (!img) return;
      tiles.push(h("figure", { class: "tile " + cls }, isNeeds(img) ? h("div", { class: "placeholder" }, img.needs)
        : h("img", { src: ROOT + (img.thumb || img.src), alt: img.alt, loading: "lazy", decoding: "async" })));
    }
    // headshot tall left; the two group photos (about-2, about-3) stacked beside it; the singing photo (about-1) wide below
    tile(headshot, "t-a");
    tile(real[1], "t-b");
    tile(real[2], "t-c");
    tile(real[0], "t-d");
    if (!real.length && (photos || []).some(isNeeds)) tiles.push(h("div", { class: "placeholder" }, photos[0].needs));
    var stk = [];
    if (window.STICKERS) (stickers || []).forEach(function (name, i) {
      var s = window.STICKERS.svg(name);
      if (!s) return;
      var el = h("span", { class: "stk stk-" + s.key + " slot-" + (i % 9 + 1), title: name, "aria-hidden": "true" });
      el.innerHTML = s.svg;
      stk.push(el);
    });
    return h("div", { class: "collage-wrap" }, [h("div", { class: "collage" }, tiles)].concat(stk));
  }

  function photoStrip(photos) {
    if (!has(photos)) return null;
    var real = photos.filter(function (x) { return !isNeeds(x); });
    if (!real.length) return h("div", { class: "placeholder" }, photos[0].needs);
    return h("ul", { class: "photo-strip", "aria-label": "Photos" }, real.map(function (ph) {
      return h("li", null, h("figure", null, [
        h("img", { src: ROOT + (ph.thumb || ph.src), alt: ph.alt, loading: "lazy", decoding: "async" }),
        ph.caption ? h("figcaption", null, ph.caption) : null
      ]));
    }));
  }
  function firstText(p) {
    var x = Array.isArray(p) ? p[0] : p;
    return typeof x === "string" ? x : (x && x.text) || "";
  }
  function aboutBody(a) {
    var out = [], placed = false;
    a.paras.forEach(function (p) {
      out.push(para(p));
      if (!placed && /^Outside work/.test(firstText(p))) { out.push(photoStrip(a.photos)); placed = true; }
    });
    if (!placed) out.push(photoStrip(a.photos));
    return out;
  }

  function aboutPage() {
    var a = C.about;
    var main = h("main", { id: "main", tabindex: "-1", class: "wrap" }, [
      h("header", { class: "about-head" }, mix("h1", "about-title", "A bit", "About me")),
      h("div", { class: "about-grid" }, [
        h("div", null, a.paras.map(para).concat([flags(a.flags)])),
        collage(C.site.headshot, a.photos, a.stickers)
      ]),
      h("section", { class: "about-sec", "aria-labelledby": "path-h" }, [
        mix("h2", "section-title", "Career", "Path", "path-h"),
        h("ol", { class: "timeline" }, C.career.map(function (c) {
          return h("li", null, [h("b", null, c.title), h("span", null, c.org + (c.where ? " (" + c.where + ")" : "") + ". " + c.dates)]);
        }))
      ]),
      has(a.education) ? h("section", { class: "about-sec", "aria-labelledby": "edu-h" }, [
        mix("h2", "section-title", "School", "Education", "edu-h"),
        h("ul", { class: "timeline" }, a.education.slice().reverse().map(function (e) { return h("li", null, h("b", null, e)); }))
      ]) : null,
      !a.music ? null : h("section", { class: "about-sec", "aria-labelledby": "lang-h" }, [
        mix("h2", "section-title", "Languages &", "Music", "lang-h"),
        has(a.languages) ? h("p", null, a.languages.join(", ")) : null,
        a.music ? h("p", null, a.music) : null
      ])
    ]);
    add(app, [nav(), main, contactSection(), footer(), devbar()]);
  }

  if (PAGE === "home") home();
  else if (PAGE === "allwork") allWorkPage();
  else if (PAGE === "skills") skillsPage();
  else if (PAGE === "contact") contactPage();
  else if (PAGE === "work") workPage();
  else if (PAGE === "about") aboutPage();
})();
