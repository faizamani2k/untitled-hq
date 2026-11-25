// Hand-over of generated lookbook photos: #lookdata=<base64 jpeg> uploads it, then shows the home page.
(function () {
  var h = location.hash;
  if (h.indexOf("#lookdata=") !== 0 || !window.SITE_STORAGE) return;
  var parts = decodeURIComponent(h.slice(10)).split("~"); history.replaceState(null, "", location.pathname + "#/");
  var ST = window.SITE_STORAGE;
  window.__lookUpload = Promise.all(parts.map(function (b64, k) {
    var bin = atob(b64), arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return fetch(ST.url + "/storage/v1/object/" + ST.bucket + "/look2/" + Date.now() + "-" + k + "-gen.jpg",
      { method: "POST", headers: { apikey: ST.key, "Content-Type": "image/jpeg" }, body: new Blob([arr], { type: "image/jpeg" }) })
      .then(function (r) { return r.status; }, function () { return 0; });
  }));
})();

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
  steps.forEach(function (t) { t.id = "t" + String(t.n).padStart(2, "0"); });
  var realSteps = steps.filter(function (t) { return !t.isBreak; });

  // shared status and owner, saved for the whole team
  var STATUSES = ["To do", "In progress", "Done", "Blocked"];
  var LIVE = {};
  function statusOf(t) { return (LIVE[t.id] && LIVE[t.id].status) || t.status || (t.n === 1 ? "In progress" : "To do"); }
  function ownerOf(t) { return LIVE[t.id] && LIVE[t.id].owner !== undefined && LIVE[t.id].owner !== null ? (LIVE[t.id].owner || null) : t.owner; }
  function restHeaders(extra) {
    var h = { apikey: window.SITE_STORAGE.key, "Content-Type": "application/json" };
    if (/^eyJ/.test(window.SITE_STORAGE.key)) h.Authorization = "Bearer " + window.SITE_STORAGE.key;
    for (var k in extra) h[k] = extra[k];
    return h;
  }
  function loadLive() {
    if (!window.SITE_STORAGE) return Promise.resolve();
    var ctl = window.AbortController ? new AbortController() : null;
    if (ctl) setTimeout(function () { ctl.abort(); }, 8000);
    return fetch(window.SITE_STORAGE.url + "/rest/v1/plan_status?select=task_id,status,owner,decision,agreed,decided_on,notes", { headers: restHeaders({}), signal: ctl ? ctl.signal : undefined })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (rows) { rows.forEach(function (r) { LIVE[r.task_id] = r; }); })
      .catch(function () {});
  }
  function saveLive(t, patch) {
    var row = { task_id: t.id, status: statusOf(t), owner: ownerOf(t) || "", updated_at: new Date().toISOString() };
    for (var k in patch) row[k] = patch[k];
    var prev = LIVE[t.id] || {};
    LIVE[t.id] = Object.assign({}, prev, row);
    if (!window.SITE_STORAGE) return Promise.reject(new Error("offline"));
    return fetch(window.SITE_STORAGE.url + "/rest/v1/plan_status?on_conflict=task_id", {
      method: "POST",
      headers: restHeaders({ Prefer: "resolution=merge-duplicates,return=minimal" }),
      body: JSON.stringify(row)
    }).then(function (r) { if (!r.ok) throw new Error("save"); });
  }
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
    var who = personName(ownerOf(cur));

    var team = S.team.map(function (p) {
      var mine = realSteps.filter(function (t) { return ownerOf(t) === p.id; }).length;
      var shared = realSteps.filter(function (t) { return ownerOf(t) === "all"; }).length;
      return '<div class="person"><h3>' + esc(p.name) + '</h3><p class="muted">' + esc(p.role) + '</p>' +
        '<p>' + (mine ? mine + (mine === 1 ? " step of their own, " : " steps of their own, ") : "No steps of their own yet, ") + shared + ' shared</p>' +
        '<a href="#/plan/' + p.id + '">See ' + esc(p.name) + '’s steps</a></div>';
    }).join("");

    var unassigned = realSteps.filter(function (t) { return !ownerOf(t); }).length;

    app.innerHTML =
      '<section class="wash" aria-label="Drop 01">' +
        '<h1 class="print"><span>Drop</span><span>01</span></h1>' +
        '<p class="when"><strong>' + longDate(S.dropDate) + '</strong><span class="left">' + leftText + '</span></p>' +
      '</section>' +
      '<section class="look" aria-label="Lookbook"><div class="look-head wrap"><h2 class="h2">Lookbook</h2><label class="upload small-up">Add photos<input type="file" accept="image/*" multiple id="lookup"></label></div>' +
        '<div class="look-rail"><div class="look-track" id="looktrack"></div></div><p class="upmsg wrap" id="lookmsg" role="status"></p></section>' +
      (function () {
        var cells = S.pieces.map(function (p) { return '<a class="rail-item" href="#/pieces/' + p.id + '" tabindex="-1"><img src="' + img(p.refs[0]) + '" alt=""><span>' + esc(p.name) + '</span></a>'; }).join("");
        return '<section class="rail" aria-label="All pieces, scrolling"><div class="rail-track">' + cells + cells + '</div></section>';
      })() +
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
              var w = personName(ownerOf(t));
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

  function fillLook() {
    var track = document.getElementById("looktrack");
    if (!track) return;
    var base = [];
    function draw(urls) {
      if (!urls.length) { track.innerHTML = '<p class="muted wrap">New lookbook photos are on the way.</p>'; return; }
      while (urls.length < 8) urls = urls.concat(urls);
      var cells = urls.map(function (u) { return '<button type="button" class="look-item" data-zoom><img src="' + esc(u) + '" alt="Lookbook photo" loading="lazy"></button>'; }).join("");
      track.innerHTML = cells + cells;
      track.style.animationDuration = (urls.length * 4) + "s";
      wireZoom(track);
    }
    draw(base.slice());
    listPhotos("look2").then(function (extra) {
      if (!extra.length) return;
      draw(extra.concat(base));
    });
    var input = document.getElementById("lookup"), msg = document.getElementById("lookmsg");
    if (!ST) { input.parentNode.remove(); return; }
    input.addEventListener("change", function () {
      var files = Array.prototype.slice.call(input.files); if (!files.length) return;
      msg.textContent = "Adding " + files.length + (files.length === 1 ? " photo\u2026" : " photos\u2026");
      Promise.all(files.map(function (f) { return uploadPhoto("look2", f); })).then(function () { msg.textContent = "Added."; fillLook(); }, function () { msg.textContent = "Some photos didn\u2019t upload. Try again."; });
    });
  }

  function plan(filter) {
    var start = d(steps[0].s), end = d(steps[steps.length - 1].e);
    var total = (+end - +start) / DAY + 1;
    var segs = S.phases.map(function (ph) {
      var a = d(ph.tasks[0].s), b = d(ph.tasks[ph.tasks.length - 1].e);
      var w = ((+b - +a) / DAY + 1) / total * 100;
      return '<div class="seg' + (ph.isBreak ? " brk" : "") + '" style="width:' + w.toFixed(3) + '%" title="' + esc(ph.name) + '"></div>';
    }).join("");
    var tpos = ((+today() - +start) / DAY + 0.5) / total * 100;
    var todayMark = tpos >= 0 && tpos <= 100 ? '<div class="today" style="left:calc(' + tpos.toFixed(3) + '% - 1px)"></div>' : "";
    var brkPh = S.phases.filter(function (p) { return p.isBreak; })[0];
    var brkMid = brkPh ? (((+d(brkPh.tasks[0].s) - +start) / DAY + ((+d(brkPh.tasks[0].e) - +d(brkPh.tasks[0].s)) / DAY + 1) / 2) / total * 100) : null;
    var chips = [["", "All"]].concat(S.team.map(function (p) { return [p.id, p.name]; })).concat([["none", "Nobody yet"]]);
    var owners = [["all", "Everyone"]].concat(S.team.map(function (p) { return [p.id, p.name]; })).concat([["", "Nobody yet"]]);
    var now = +today();

    function keep(t) {
      if (!filter) return true;
      var o = ownerOf(t);
      if (filter === "none") return !o && !t.isBreak;
      return o === filter || o === "all";
    }
    function recLine(t) {
      var r = LIVE[t.id] || {};
      if (r.decision) return '<button type="button" class="rec-link has" data-rec="' + t.id + '"><b>Decided:</b> ' + esc(r.decision.length > 90 ? r.decision.slice(0, 90) + "\u2026" : r.decision) + '</button>';
      return statusOf(t) === "Done" ? '<button type="button" class="rec-link" data-rec="' + t.id + '">Write down what was decided</button>' : '';
    }
    function stClass(s) { return "st-" + s.toLowerCase().replace(/\s+/g, ""); }

    var rows = S.phases.map(function (ph) {
      var list = steps.filter(function (t) { return t.phase === ph.name && keep(t); });
      if (!list.length) return "";
      var real = list.filter(function (t) { return !t.isBreak; });
      var doneN = real.filter(function (t) { return statusOf(t) === "Done"; }).length;
      return '<tbody class="pgroup">' +
        '<tr class="ph"><th colspan="7" scope="colgroup"><span class="ph-name">' + esc(ph.name) + '</span>' +
        '<span class="ph-meta">' + range(ph.tasks[0].s, ph.tasks[ph.tasks.length - 1].e) + (real.length ? '<span data-phdone="' + esc(ph.name) + '">' + doneN + ' of ' + real.length + ' done</span>' : '') + '</span></th></tr>' +
        list.map(function (t) {
          var days = Math.round((+d(t.e) - +d(t.s)) / DAY) + 1;
          var isNow = +d(t.s) <= now && now <= +d(t.e);
          var st = statusOf(t), o = ownerOf(t);
          var cls = ["prow", stClass(st)];
          if (isNow) cls.push("is-now");
          if (t.isBreak) cls.push("brk");
          if (t.isDrop) cls.push("drop");
          var ownerCell = t.isBreak ? '<span class="muted">No work</span>' :
            '<select class="sel own" data-id="' + t.id + '" aria-label="Owner of step ' + stepNo(t) + '">' + owners.map(function (op) {
              return '<option value="' + op[0] + '"' + ((o || "") === op[0] ? " selected" : "") + '>' + esc(op[1]) + '</option>';
            }).join("") + '</select>';
          var statusCell = t.isBreak ? '<span class="muted">Break</span>' :
            '<select class="sel stat ' + stClass(st) + '" data-id="' + t.id + '" aria-label="Status of step ' + stepNo(t) + '">' + STATUSES.map(function (s) {
              return '<option' + (s === st ? " selected" : "") + '>' + s + '</option>';
            }).join("") + '</select>';
          return '<tr class="' + cls.join(" ") + '" data-row="' + t.id + '">' +
            '<td class="c-num">' + (t.isBreak ? "—" : String(stepNo(t)).padStart(2, "0")) + '</td>' +
            '<td class="c-task"><span class="t-title">' + esc(t.t) + '</span>' + (isNow ? ' <span class="flag">Today</span>' : '') +
              (t.note ? '<span class="t-note">' + esc(t.note) + '</span>' : '') +
              (t.isBreak ? '' : recLine(t)) + '</td>' +
            '<td class="c-date"><span class="lbl">Start</span>' + dm(d(t.s)) + '</td>' +
            '<td class="c-date"><span class="lbl">End</span>' + dm(d(t.e)) + '</td>' +
            '<td class="c-days"><span class="lbl">Days</span>' + days + '</td>' +
            '<td class="c-own">' + ownerCell + '</td>' +
            '<td class="c-stat">' + statusCell + '</td>' +
          '</tr>';
        }).join("") + '</tbody>';
    }).join("");

    function counts() {
      var c = { "To do": 0, "In progress": 0, "Done": 0, "Blocked": 0 };
      realSteps.forEach(function (t) { c[statusOf(t)]++; });
      return c;
    }
    function summaryHtml() {
      var c = counts();
      var pct = Math.round(c.Done / realSteps.length * 100);
      return '<div class="sum-item"><b>' + c.Done + '/' + realSteps.length + '</b><span>Done</span></div>' +
        '<div class="sum-item"><b>' + c["In progress"] + '</b><span>In progress</span></div>' +
        '<div class="sum-item"><b>' + c.Blocked + '</b><span>Blocked</span></div>' +
        '<div class="sum-item"><b>' + c["To do"] + '</b><span>To do</span></div>' +
        '<div class="sum-bar" aria-label="' + pct + '% done"><i style="width:' + pct + '%"></i></div>';
    }

    app.innerHTML =
      '<div class="wrap">' +
        '<h1 class="h1">Plan</h1>' +
        '<p class="lede">' + realSteps.length + ' steps, one at a time, to Drop 1 on ' + longDate(S.dropDate) + '. Change a step’s status or owner and it saves for the whole team.</p>' +
        '<div class="summary" id="summary">' + summaryHtml() + '</div>' +
        '<div class="track" aria-hidden="true">' +
          '<div class="bar">' + segs + todayMark + '</div>' +
          '<div class="track-labels"><span style="left:0">' + dm(start) + '</span>' +
          (brkMid != null ? '<span style="left:' + brkMid.toFixed(2) + '%">Lebaran</span>' : '') +
          '<span style="left:100%">' + dm(end) + '</span></div>' +
        '</div>' +
        '<div class="chips" role="group" aria-label="Show steps for">' + chips.map(function (c) {
          return '<button type="button" class="chip" data-f="' + c[0] + '" aria-pressed="' + ((filter || "") === c[0]) + '">' + esc(c[1]) + '</button>';
        }).join("") + '</div>' +
        '<table class="ptable">' +
          '<thead><tr><th scope="col" class="c-num">#</th><th scope="col">Step</th><th scope="col">Start</th><th scope="col">End</th><th scope="col">Days</th><th scope="col">Owner</th><th scope="col">Status</th></tr></thead>' +
          rows +
        '</table>' +
        '<p class="savemsg" role="status" aria-live="polite"></p>' +
        '<div style="height:48px"></div>' +
      '</div>';

    var msg = app.querySelector(".savemsg");
    function flash(text, bad) {
      msg.textContent = text; msg.classList.toggle("bad", !!bad); msg.classList.add("show");
      clearTimeout(flash.t); flash.t = setTimeout(function () { msg.classList.remove("show"); }, 1800);
    }
    function byId(id) { return steps.filter(function (t) { return t.id === id; })[0]; }
    app.querySelectorAll(".chip").forEach(function (b) {
      b.addEventListener("click", function () { location.hash = "#/plan" + (b.dataset.f ? "/" + b.dataset.f : ""); });
    });
    app.querySelectorAll("select.stat").forEach(function (sel) {
      sel.addEventListener("change", function () {
        var t = byId(sel.dataset.id), v = sel.value;
        sel.className = "sel stat " + stClass(v);
        var tr = app.querySelector('[data-row="' + t.id + '"]');
        STATUSES.forEach(function (s) { tr.classList.remove(stClass(s)); }); tr.classList.add(stClass(v));
        if (v === "Done") openRec(t);
        saveLive(t, { status: v }).then(function () { flash("Saved: step " + stepNo(t) + " is " + v.toLowerCase()); }, function () { flash("Couldn’t save. Check your connection and try again.", true); });
        document.getElementById("summary").innerHTML = summaryHtml();
        var ph = S.phases.filter(function (p) { return p.name === t.phase; })[0];
        var real = steps.filter(function (x) { return x.phase === ph.name && !x.isBreak; });
        var el = app.querySelector('[data-phdone="' + ph.name + '"]');
        if (el) el.textContent = real.filter(function (x) { return statusOf(x) === "Done"; }).length + " of " + real.length + " done";
      });
    });
    function openRec(t) {
      var r = LIVE[t.id] || {};
      var dlg = document.getElementById("rec");
      var agreed = (r.agreed || "").split(",").filter(Boolean);
      dlg.querySelector(".rec-step").textContent = "Step " + String(stepNo(t)).padStart(2, "0") + " \u00b7 " + t.phase;
      dlg.querySelector(".rec-title").textContent = t.t;
      dlg.querySelector("#rec-decision").value = r.decision || "";
      dlg.querySelector("#rec-notes").value = r.notes || "";
      dlg.querySelector("#rec-date").value = r.decided_on || new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
      dlg.querySelectorAll("input[name=agreed]").forEach(function (c) { c.checked = agreed.indexOf(c.value) >= 0; });
      dlg.querySelector(".rec-msg").textContent = "";
      dlg.dataset.id = t.id;
      dlg.showModal();
      dlg.querySelector("#rec-decision").focus();
    }
    var dlg = document.getElementById("rec");
    dlg.onsubmit = function (ev) {
      ev.preventDefault();
      if (ev.submitter && ev.submitter.value === "cancel") { dlg.close(); return; }
      var t = byId(dlg.dataset.id);
      var agreed = Array.prototype.map.call(dlg.querySelectorAll("input[name=agreed]:checked"), function (c) { return c.value; }).join(",");
      var patch = { decision: dlg.querySelector("#rec-decision").value.trim(), notes: dlg.querySelector("#rec-notes").value.trim(), agreed: agreed, decided_on: dlg.querySelector("#rec-date").value || null };
      dlg.querySelector(".rec-msg").textContent = "Saving\u2026";
      saveLive(t, patch).then(function () { dlg.close(); plan(filter); flash("Saved: decision for step " + stepNo(t)); },
        function () { dlg.querySelector(".rec-msg").textContent = "Couldn\u2019t save. Check your connection and try again."; });
    };
    app.querySelectorAll("[data-rec]").forEach(function (b) { b.addEventListener("click", function () { openRec(byId(b.dataset.rec)); }); });
    app.querySelectorAll("select.own").forEach(function (sel) {
      sel.addEventListener("change", function () {
        var t = byId(sel.dataset.id), v = sel.value;
        saveLive(t, { owner: v }).then(function () { flash("Saved: step " + stepNo(t) + " is now " + (personName(v) || "nobody’s yet")); }, function () { flash("Couldn’t save. Check your connection and try again.", true); });
      });
    });
  }

  function board() {
    var areas = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
    var main = S.boardMain.map(function (id, i) {
      return '<button type="button" class="mb-tile" style="grid-area:' + areas[i] + '" data-zoom><img src="' + img(id) + '" alt="Mood board reference" loading="lazy"></button>';
    }).join("");
    var more = S.boardMore.map(function (row) {
      return '<div class="jrow">' + row.map(function (id) {
        var r = S.imgRatio[id] || 0.8;
        return '<button type="button" class="j-tile" style="flex:' + r + ' 1 0;aspect-ratio:' + r + '" data-zoom><img src="' + img(id) + '" alt="Mood board reference" loading="lazy"></button>';
      }).join("") + '</div>';
    }).join("");
    var swatches = S.palette.map(function (c) {
      return '<li><span class="sw" style="background:' + c.hex + '"></span><span>' + esc(c.name) + '<br><span class="muted">' + c.hex + '</span></span></li>';
    }).join("");
    var count = S.boardMain.length + S.boardMore.reduce(function (n, r) { return n + r.length; }, 0);

    app.innerHTML =
      '<div class="wrap mb">' +
        '<section class="spread">' +
          '<div class="spread-main">' +
            '<header class="mb-head"><h1 class="mb-title">Mood board</h1><p>Brand direction, vol. 01</p></header>' +
            '<div class="mb-grid">' + main + '</div>' +
          '</div>' +
          '<aside class="mb-side">' +
            '<h2>Colour palette</h2><ul class="mb-pal">' + swatches + '</ul>' +
            '<hr><h2>Keywords</h2><ul class="mb-words">' + S.keywords.map(function (k) { return '<li>' + esc(k) + '</li>'; }).join("") + '</ul>' +
            '<hr><h2>Key pieces</h2><p>' + esc(S.keyPieces) + '</p>' +
          '</aside>' +
        '</section>' +
        '<section class="spread">' +
          '<div class="spread-main">' +
            '<header class="mb-head"><h2 class="mb-title sm">More references</h2></header>' +
            '<div class="jgrid">' + more + '</div>' +
          '</div>' +
          '<aside class="mb-side">' +
            '<h2>Details to steal</h2><ul class="mb-details">' + S.details.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ul>' +
            '<hr><p class="muted">' + count + ' references from the group chat. Tap any photo to see it big. Same board in <a class="textlink" href="' + esc(S.canvaBoard) + '" target="_blank" rel="noopener">Canva</a>.</p>' +
          '</aside>' +
        '</section>' +
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

  function pieces(type) {
    var types = [];
    S.pieces.forEach(function (p) { if (types.indexOf(p.type) < 0) types.push(p.type); });
    var list = S.pieces.filter(function (p) { return !type || p.type === type; });
    app.innerHTML =
      '<div class="wrap">' +
        '<h1 class="h1">Pieces</h1>' +
        '<p class="lede">Every piece from the board, ' + S.pieces.length + ' in all. Each one has its own page for Kenny\u2019s designs. Pick 3 or 4 for Drop 1 by 24 Dec.</p>' +
        '<div class="chips" role="group" aria-label="Show pieces">' + [["", "All"]].concat(types.map(function (t) { return [t, t]; })).map(function (c) {
          return '<button type="button" class="chip" data-t="' + esc(c[0]) + '" aria-pressed="' + ((type || "") === c[0]) + '">' + esc(c[1]) + '</button>';
        }).join("") + '</div>' +
        '<div class="grid">' + list.map(function (p) {
          var i = S.pieces.indexOf(p);
          return '<a class="card" href="#/pieces/' + p.id + '"><div class="shot"><img data-piece="' + p.id + '" src="' + img(p.refs[0]) + '" alt="" loading="lazy"></div>' +
            '<div class="row"><span class="name">' + esc(p.name) + '</span><span class="no">' + String(i + 1).padStart(3, "0") + '</span></div>' +
            '<span class="status">' + esc(p.status) + '</span> <span class="status ref" data-reflabel="' + p.id + '">Reference photo</span></a>';
        }).join("") + '</div>' +
        '<div style="height:64px"></div>' +
      '</div>';
    app.querySelectorAll(".chip").forEach(function (b) {
      b.addEventListener("click", function () { location.hash = "#/pieces" + (b.dataset.t ? "/type/" + encodeURIComponent(b.dataset.t) : ""); });
    });
    if (ST) list.forEach(function (p) {
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
    var spec = p.spec || {};
    var specRows = ["Type"].concat(S.pieceSpec).map(function (k) {
      var v = k === "Type" ? p.type : (spec[k] || "To decide");
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
    else if (key === "pieces" && parts[1] === "type") pieces(decodeURIComponent(parts[2] || ""));
    else if (key === "pieces" && parts[1]) piece(parts[1]);
    else if (key === "pieces") pieces();
    else { key = "home"; home(); fillLook(); }
    document.title = (key === "home" ? "Untitled. Drop 01" : names[key] + ". Untitled");
  }
  var first = true;
  window.addEventListener("hashchange", function () {
    route(); window.scrollTo(0, 0);
    if (!first) app.focus({ preventScroll: true });
  });
  route(); first = false;
  loadLive().then(function () { if (!document.querySelector("select:focus")) route(); });
  // pick up teammates' changes when someone comes back to the tab
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible" && !document.querySelector("select:focus")) loadLive().then(route);
  });
})();

// Receives generated lookbook photos handed over from the team's image tool tab.
(function () {
  var OK = ["https://gemini.google.com"];
  window.addEventListener("message", function (e) {
    if (OK.indexOf(e.origin) < 0 || !e.data || !e.data.lookPhoto || !window.SITE_STORAGE) return;
    var ST = window.SITE_STORAGE, blob = e.data.lookPhoto;
    var h = { apikey: ST.key, "Content-Type": "image/jpeg" };
    fetch(ST.url + "/storage/v1/object/" + ST.bucket + "/look2/" + Date.now() + "-gen.jpg", { method: "POST", headers: h, body: blob })
      .then(function (r) { e.source.postMessage({ lookSaved: r.status }, e.origin); })
      .catch(function () { e.source.postMessage({ lookSaved: 0 }, e.origin); });
  });
  if (window.opener) try { window.opener.postMessage({ lookReady: true }, "https://gemini.google.com"); } catch (x) {}
})();
