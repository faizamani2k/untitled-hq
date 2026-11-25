(function () {
  "use strict";
  var S = window.SITE;
  var app = document.getElementById("app");
  var DAY = 86400000;

  // ---------- helpers ----------
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function d(str) { var p = str.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function today() { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var DOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  function dm(x) { return x.getDate() + " " + MON[x.getMonth()]; }
  function range(s, e) {
    var a = d(s), b = d(e);
    if (+a === +b) return dm(a);
    if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) return a.getDate() + "–" + dm(b);
    return dm(a) + " – " + dm(b);
  }
  function longDate(str) { var x = d(str); return DOW[x.getDay()] + " " + x.getDate() + " " + ["January","February","March","April","May","June","July","August","September","October","November","December"][x.getMonth()] + " " + x.getFullYear(); }
  function img(id) { return "img/board/" + id + ".jpg"; }
  function personName(id) {
    if (id === "all") return "Everyone";
    for (var i = 0; i < S.team.length; i++) if (S.team[i].id === id) return S.team[i].name;
    return null;
  }

  // flatten the plan into numbered steps
  var steps = [];
  S.phases.forEach(function (ph) {
    ph.tasks.forEach(function (t) {
      steps.push(Object.assign({ n: steps.length + 1, phase: ph.name, isBreak: !!ph.isBreak }, t));
    });
  });
  var realSteps = steps.filter(function (t) { return !t.isBreak; });
  function stepNo(t) { return realSteps.indexOf(t) + 1; }

  function currentIndex() {
    var now = +today();
    for (var i = 0; i < steps.length; i++) {
      if (+d(steps[i].s) <= now && now <= +d(steps[i].e)) return i;
    }
    for (var j = 0; j < steps.length; j++) if (+d(steps[j].s) > now) return j;
    return steps.length - 1;
  }

  // ---------- photo storage (optional) ----------
  var ST = window.SITE_STORAGE;
  function stHeaders(extra) {
    var h = { apikey: ST.key };
    // older "anon" keys are JWTs and also go in Authorization; newer publishable keys don't
    if (/^eyJ/.test(ST.key)) h.Authorization = "Bearer " + ST.key;
    for (var k in extra) h[k] = extra[k];
    return h;
  }
  function listPhotos(pieceId) {
    if (!ST) return Promise.resolve([]);
    return fetch(ST.url + "/storage/v1/object/list/" + ST.bucket, {
      method: "POST",
      headers: stHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ prefix: pieceId + "/", limit: 200, sortBy: { column: "created_at", order: "desc" } })
    }).then(function (r) { return r.ok ? r.json() : []; })
      .then(function (rows) {
        return rows.filter(function (o) { return o.name && o.id; }).map(function (o) {
          return ST.url + "/storage/v1/object/public/" + ST.bucket + "/" + pieceId + "/" + encodeURIComponent(o.name);
        });
      }).catch(function () { return []; });
  }
  function uploadPhoto(pieceId, file) {
    var safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
    var path = pieceId + "/" + Date.now() + "-" + safe;
    return fetch(ST.url + "/storage/v1/object/" + ST.bucket + "/" + path, {
      method: "POST",
      headers: stHeaders({ "Content-Type": file.type || "application/octet-stream", "x-upsert": "false" }),
      body: file
    }).then(function (r) { if (!r.ok) throw new Error("upload"); });
  }

  // ---------- lightbox ----------
  var lb = document.getElementById("lightbox");
  var lbImg = lb.querySelector("img");
  var lbList = [], lbAt = 0;
  function lbShow(i) {
    lbAt = (i + lbList.length) % lbList.length;
    lbImg.src = lbList[lbAt].src;
    lbImg.alt = lbList[lbAt].alt || "";
    lb.querySelector(".lb-count").textContent = (lbAt + 1) + " of " + lbList.length;
  }
  function openLightbox(list, i) {
    lbList = list; lbShow(i);
    if (typeof lb.showModal === "function") lb.showModal(); else lb.setAttribute("open", "");
  }
  lb.addEventListener("click", function (e) {
    var a = e.target.getAttribute && e.target.getAttribute("data-lb");
    if (a === "prev") lbShow(lbAt - 1);
    else if (a === "next") lbShow(lbAt + 1);
    else if (a === "close" || e.target === lb) lb.close();
  });
  lb.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") lbShow(lbAt - 1);
    if (e.key === "ArrowRight") lbShow(lbAt + 1);
  });
  function wireZoom(root) {
    var btns = root.querySelectorAll("[data-zoom]");
    var list = Array.prototype.map.call(btns, function (b) { var im = b.querySelector("img"); return { src: im.getAttribute("src"), alt: im.getAttribute("alt") }; });
    Array.prototype.forEach.call(btns, function (b, i) { b.addEventListener("click", function () { openLightbox(list, i); }); });
  }

  // ---------- pages ----------
  function home() {
    var drop = d(S.dropDate);
    var left = Math.round((+drop - +today()) / DAY);
    var leftText = left > 1 ? left + " days to go" : left === 1 ? "Tomorrow" : left === 0 ? "Today" : "Dropped";
    var ci = currentIndex();
    var cur = steps[ci];
    var nexts = steps.slice(ci + 1, ci + 4);
    var who = personName(cur.owner);

    var team = S.team.map(function (p) {
      var mine = realSteps.filter(function (t) { return t.owner === p.id; }).length;
      var shared = realSteps.filter(function (t) { return t.owner === "all"; }).length;
      return '<div class="person"><h3>' + esc(p.name) + '</h3><p class="muted">' + esc(p.role) + '</p>' +
        '<p>' + (mine ? mine + (mine === 1 ? " step of their own, " : " steps of their own, ") : "No steps of their own yet, ") + shared + ' shared</p>' +
        '<a href="#/plan/' + p.id + '">See ' + esc(p.name) + '’s steps</a></div>';
    }).join("");

    var unassigned = realSteps.filter(function (t) { return !t.owner; }).length;

    app.innerHTML =
      '<section class="wash" aria-label="Drop 01">' +
        '<h1 class="print"><span>Drop</span><span>01</span></h1>' +
        '<p class="when"><strong>' + longDate(S.dropDate) + '</strong><span class="left">' + leftText + '</span></p>' +
      '</section>' +
      '<div class="wrap">' +
        '<section class="sec now">' +
          '<div>' +
            '<h2 class="h2">' + (+d(cur.s) <= +today() ? "Right now" : "Coming up") + '</h2>' +
            '<p class="now-task">' + esc(cur.t) + '</p>' +
            '<div class="meta">' + (cur.isBreak ? '<span class="step">Break</span>' : '<span class="step">Step ' + stepNo(cur) + ' of ' + realSteps.length + '</span>') +
              '<span>' + range(cur.s, cur.e) + '</span>' +
              (cur.isBreak ? '' : '<span><b>' + (who ? esc(who) : "Nobody yet") + '</b></span>') + '</div>' +
            (cur.note ? '<p class="muted">' + esc(cur.note) + '</p>' : '') +
          '</div>' +
          '<div>' +
            '<h2 class="h2">Up next</h2>' +
            '<ol class="next-list">' + nexts.map(function (t) {
              var w = personName(t.owner);
              return '<li><span class="n">' + (t.isBreak ? "—" : String(stepNo(t)).padStart(2, "0")) + '</span><span>' + esc(t.t) + '</span>' +
                '<span class="d">' + range(t.s, t.e) + (t.isBreak ? "" : ", " + (w ? esc(w) : "nobody yet")) + '</span></li>';
            }).join("") + '</ol>' +
            '<p><a class="textlink" href="#/plan">See the whole plan</a></p>' +
          '</div>' +
        '</section>' +
        '<section class="sec">' +
          '<h2 class="h2">The team</h2>' +
          '<div class="team">' + team + '</div>' +
          (unassigned ? '<p class="muted small" style="margin-top:20px">' + unassigned + ' steps have nobody on them yet. Split them up when you agree roles on 2 Dec.</p>' : '') +
        '</section>' +
        '<section class="sec">' +
          '<h2 class="h2">Names in the running</h2>' +
          '<p class="muted" style="margin-top:-6px">Shortlist five and vote by 27 Nov. Until then the site calls the label Untitled.</p>' +
          '<ul class="names">' + S.names.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join("") + '</ul>' +
        '</section>' +
      '</div>';
  }

  function plan(filter) {
    var start = d(steps[0].s), end = d(steps[steps.length - 1].e);
    var total = (+end - +start) / DAY + 1;
    var segs = S.phases.map(function (ph) {
      var a = d(ph.tasks[0].s), b = d(ph.tasks[ph.tasks.length - 1].e);
      var w = ((+b - +a) / DAY + 1) / total * 100;
      return '<div class="seg' + (ph.isBreak ? " brk" : "") + '" style="width:' + w.toFixed(3) + '%" title="' + esc(ph.name) + ', ' + range(ph.tasks[0].s, ph.tasks[ph.tasks.length - 1].e) + '"></div>';
    }).join("");
    var tpos = ((+today() - +start) / DAY + 0.5) / total * 100;
    var todayMark = tpos >= 0 && tpos <= 100 ? '<div class="today" style="left:calc(' + tpos.toFixed(3) + '% - 1px)"></div>' : "";
    var brkPh = S.phases.filter(function (p) { return p.isBreak; })[0];
    var brkMid = brkPh ? (((+d(brkPh.tasks[0].s) - +start) / DAY + ((+d(brkPh.tasks[0].e) - +d(brkPh.tasks[0].s)) / DAY + 1) / 2) / total * 100) : null;

    var chips = [["", "All"]].concat(S.team.map(function (p) { return [p.id, p.name]; })).concat([["none", "Nobody yet"]]);
    var now = +today();
    var ci = currentIndex();

    var body = S.phases.map(function (ph) {
      var rows = steps.filter(function (t) { return t.phase === ph.name; }).filter(function (t) {
        if (!filter) return true;
        if (filter === "none") return !t.owner && !t.isBreak;
        return t.owner === filter || t.owner === "all";
      });
      if (!rows.length) return "";
      return '<section class="phase"><div class="phase-head"><h2>' + esc(ph.name) + '</h2><span>' + range(ph.tasks[0].s, ph.tasks[ph.tasks.length - 1].e) + '</span></div><ol class="tasks">' +
        rows.map(function (t) {
          var isNow = steps.indexOf(t) === ci && +d(t.s) <= now;
          var cls = ["task"];
          if (+d(t.e) < now) cls.push("past");
          if (isNow) cls.push("is-now");
          if (t.done) cls.push("done");
          if (t.isBreak) cls.push("brk");
          if (t.isDrop) cls.push("drop");
          var w = personName(t.owner);
          return '<li class="' + cls.join(" ") + '">' +
            '<span class="num">' + (t.isBreak ? "—" : String(stepNo(t)).padStart(2, "0")) + '</span>' +
            '<span class="title">' + esc(t.t) + (isNow ? ' <span class="flag">Now</span>' : '') + (t.done ? ' <span class="flag" style="color:var(--olive)">Done</span>' : '') + '</span>' +
            '<span class="info"><span class="dates">' + range(t.s, t.e) + '</span>' +
            (t.isBreak ? '<span class="who none">No work</span>' : '<span class="who' + (w ? '' : ' none') + '">' + (w ? esc(w) : "Nobody yet") + '</span>') + '</span>' +
            (t.note ? '<p class="note">' + esc(t.note) + '</p>' : '') +
          '</li>';
        }).join("") + '</ol></section>';
    }).join("");

    app.innerHTML =
      '<div class="wrap">' +
        '<h1 class="h1">Plan</h1>' +
        '<p class="lede">' + realSteps.length + ' steps, one at a time. Each one starts when the one before it ends. Drop 1 is on ' + longDate(S.dropDate) + '.</p>' +
        '<div class="track" aria-hidden="true">' +
          '<div class="bar">' + segs + todayMark + '</div>' +
          '<div class="track-labels"><span style="left:0">' + dm(start) + '</span>' +
          (brkMid != null ? '<span style="left:' + brkMid.toFixed(2) + '%">Lebaran</span>' : '') +
          '<span style="left:100%">' + dm(end) + '</span></div>' +
        '</div>' +
        '<div class="chips" role="group" aria-label="Show steps for">' + chips.map(function (c) {
          return '<button type="button" class="chip" data-f="' + c[0] + '" aria-pressed="' + ((filter || "") === c[0]) + '">' + esc(c[1]) + '</button>';
        }).join("") + '</div>' +
        (filter && filter !== "none" ? '<p class="muted small">Showing ' + esc(personName(filter)) + '’s steps and the ones everyone does together.</p>' : '') +
        body +
        '<div style="height:48px"></div>' +
      '</div>';
    app.querySelectorAll(".chip").forEach(function (b) {
      b.addEventListener("click", function () { location.hash = "#/plan" + (b.dataset.f ? "/" + b.dataset.f : ""); });
    });
  }

  function board() {
    var count = S.board.reduce(function (a, g) { return a + g.imgs.length; }, 0);
    app.innerHTML =
      '<div class="wrap">' +
        '<h1 class="h1">Board</h1>' +
        '<p class="lede">' + count + ' references from the group chat, sorted by idea. Tap one to see it big. There’s also a <a class="textlink" href="' + esc(S.canvaBoard) + '" target="_blank" rel="noopener">version in Canva</a>.</p>' +
        S.board.map(function (g) {
          return '<section class="group"><div class="group-head"><h2>' + esc(g.name) + '</h2><p>' + esc(g.note) + '</p></div>' +
            '<div class="masonry">' + g.imgs.map(function (id) {
              return '<button type="button" class="tile" data-zoom><img src="' + img(id) + '" alt="Reference: ' + esc(g.name.toLowerCase()) + '" loading="lazy"></button>';
            }).join("") + '</div></section>';
        }).join("") +
        '<div style="height:48px"></div>' +
      '</div>';
    wireZoom(app);
  }

  function style() {
    app.innerHTML =
      '<div class="wrap">' +
        '<h1 class="h1">Style</h1>' +
        '<p class="lede">The rules every piece follows. Tap a colour to copy its code.</p>' +
        '<section class="sec"><h2 class="h2">Colour</h2><div class="swatches">' +
          S.palette.map(function (c) {
            return '<button type="button" class="swatch" data-hex="' + c.hex + '"><span class="chipc" style="background:' + c.hex + '"></span><b>' + esc(c.name) + '</b><span>' + c.hex + '</span></button>';
          }).join("") +
        '</div></section>' +
        '<section class="sec"><h2 class="h2">In six words</h2><ul class="keywords">' + S.keywords.map(function (k) { return '<li>' + esc(k) + '</li>'; }).join("") + '</ul></section>' +
        '<section class="sec"><h2 class="h2">Lettering</h2>' +
          '<div class="typerow"><div><h3>Blackletter</h3><p>Tonal embroidery, neck labels, small marks.</p></div><p class="sample s-black">Saint Cendre</p></div>' +
          '<div class="typerow"><div><h3>Flowing script</h3><p>Across the chest, down a sleeve.</p></div><p class="sample s-script">Drop one</p></div>' +
          '<div class="typerow"><div><h3>Cracked condensed</h3><p>Big back prints that crack as they wear.</p></div><p class="sample s-crack">Works 01</p></div>' +
        '</section>' +
        '<section class="sec"><h2 class="h2">Details to use</h2><ul class="ruled">' + S.details.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ul></section>' +
      '</div>';
    app.querySelectorAll(".swatch").forEach(function (b) {
      b.addEventListener("click", function () {
        var hex = b.dataset.hex, span = b.querySelector("span:last-child");
        var done = function () { span.textContent = "Copied " + hex; b.setAttribute("data-copied", ""); setTimeout(function () { span.textContent = hex; b.removeAttribute("data-copied"); }, 1600); };
        if (navigator.clipboard) navigator.clipboard.writeText(hex).then(done, done); else done();
      });
    });
  }

  function pieces() {
    app.innerHTML =
      '<div class="wrap">' +
        '<h1 class="h1">Pieces</h1>' +
        '<p class="lede">Candidates for Drop 1. Pick 3 or 4 by 24 Dec. Kenny’s designs go on each piece’s page.</p>' +
        '<div class="grid">' + S.pieces.map(function (p, i) {
          return '<a class="card" href="#/pieces/' + p.id + '"><div class="shot"><img data-piece="' + p.id + '" src="' + img(p.refs[0]) + '" alt="" loading="lazy"></div>' +
            '<div class="row"><span class="name">' + esc(p.name) + '</span><span class="no">' + String(i + 1).padStart(3, "0") + '</span></div>' +
            '<span class="status">' + esc(p.status) + '</span> <span class="status ref" data-reflabel="' + p.id + '">Reference photo</span></a>';
        }).join("") + '</div>' +
        '<div style="height:64px"></div>' +
      '</div>';
    if (ST) S.pieces.forEach(function (p) {
      listPhotos(p.id).then(function (urls) {
        if (!urls.length) return;
        var im = app.querySelector('img[data-piece="' + p.id + '"]'); if (im) im.src = urls[0];
        var lab = app.querySelector('[data-reflabel="' + p.id + '"]'); if (lab) lab.remove();
      });
    });
  }

  function piece(id) {
    var idx = -1;
    S.pieces.forEach(function (p, i) { if (p.id === id) idx = i; });
    if (idx < 0) { location.hash = "#/pieces"; return; }
    var p = S.pieces[idx];
    var specRows = Object.keys(p.spec).map(function (k) {
      var v = p.spec[k];
      return '<tr><th scope="row">' + esc(k) + '</th><td' + (v === "To decide" ? ' class="tbd"' : '') + '>' + esc(v) + '</td></tr>';
    }).join("");

    app.innerHTML =
      '<div class="wrap">' +
        '<a class="back" href="#/pieces">All pieces</a>' +
        '<div class="piece">' +
          '<div class="piece-main"><div class="shot"><img id="mainshot" src="' + img(p.refs[0]) + '" alt="' + esc(p.name) + '"></div>' +
            '<p class="muted small" id="mainlabel">Reference photo from the board until Kenny adds a design.</p></div>' +
          '<div>' +
            '<p class="muted" style="margin:0">' + String(idx + 1).padStart(3, "0") + '</p>' +
            '<h1 class="h1" style="margin-top:4px;font-size:clamp(56px,9vw,104px)">' + esc(p.name) + '</h1>' +
            '<span class="status">' + esc(p.status) + '</span>' +
            '<table class="spec">' + specRows + '</table>' +
          '</div>' +
        '</div>' +
        '<section class="sec" style="border-bottom:0">' +
          '<h2 class="h2">Kenny’s designs</h2>' +
          '<div id="designs"></div>' +
        '</section>' +
        '<section class="sec" style="padding-top:0;border-bottom:0">' +
          '<h2 class="h2">References</h2>' +
          '<div class="thumbs" id="refs">' + p.refs.map(function (r) { return '<button type="button" data-zoom><img src="' + img(r) + '" alt="Reference for ' + esc(p.name) + '"></button>'; }).join("") + '</div>' +
        '</section>' +
      '</div>';
    wireZoom(app.querySelector("#refs"));
    renderDesigns(p);
  }

  function renderDesigns(p) {
    var box = document.getElementById("designs");
    if (!box) return;
    if (!ST) {
      box.innerHTML = '<div class="empty"><b>No designs yet</b>Sketches and photos for the ' + esc(p.name.toLowerCase()) + ' will show here.</div>';
      return;
    }
    box.innerHTML = '<p class="muted">Loading…</p>';
    listPhotos(p.id).then(function (urls) {
      var grid = urls.length
        ? '<div class="thumbs" id="mine">' + urls.map(function (u) { return '<button type="button" data-zoom><img src="' + esc(u) + '" alt="Design for ' + esc(p.name) + '" loading="lazy"></button>'; }).join("") + '</div>'
        : '<div class="empty"><b>No designs yet</b>Add sketches or photos for the ' + esc(p.name.toLowerCase()) + '.</div>';
      box.innerHTML = grid +
        '<label class="upload">Add photos<input type="file" accept="image/*" multiple></label>' +
        '<p class="upmsg" role="status"></p>';
      if (urls.length) {
        wireZoom(box.querySelector("#mine"));
        var main = document.getElementById("mainshot"); if (main) main.src = urls[0];
        var lab = document.getElementById("mainlabel"); if (lab) lab.textContent = "Latest design.";
      }
      var input = box.querySelector("input"), msg = box.querySelector(".upmsg");
      input.addEventListener("change", function () {
        var files = Array.prototype.slice.call(input.files);
        if (!files.length) return;
        msg.textContent = "Adding " + files.length + (files.length === 1 ? " photo…" : " photos…");
        Promise.all(files.map(function (f) { return uploadPhoto(p.id, f); })).then(function () {
          renderDesigns(p);
        }, function () {
          msg.textContent = "Some photos didn’t upload. Check your connection and try again.";
        });
      });
    });
  }

  // ---------- router ----------
  function route() {
    var h = (location.hash || "#/").replace(/^#\/?/, "");
    var parts = h.split("/");
    var key = parts[0] || "home";
    var names = { home: "Untitled", plan: "Plan", board: "Board", style: "Style", pieces: "Pieces" };
    document.querySelectorAll(".nav a").forEach(function (a) {
      if (a.dataset.route === key) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    if (key === "plan") plan(parts[1]);
    else if (key === "board") board();
    else if (key === "style") style();
    else if (key === "pieces" && parts[1]) piece(parts[1]);
    else if (key === "pieces") pieces();
    else { key = "home"; home(); }
    document.title = (key === "home" ? "Untitled. Drop 01" : names[key] + ". Untitled");
  }
  var first = true;
  window.addEventListener("hashchange", function () {
    route(); window.scrollTo(0, 0);
    if (!first) app.focus({ preventScroll: true });
  });
  route(); first = false;
})();
