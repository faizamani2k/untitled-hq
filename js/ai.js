// "Ask AI" image maker. Free Pollinations image endpoint (no key, about one image per 15 s).
(function () {
  "use strict";
  var BRAND = "streetwear brand style: washed black, charcoal, faded grey, bone and oxblood palette, sun-faded, distressed, gothic and script lettering, raw concrete, high-end fashion photography, no real brand logos";
  var PRESETS = {
    lettering: { label: "Lettering", add: "typography design only, lettering artwork on a plain background, centered, print-ready graphic", w: 1024, h: 1024 },
    graphic: { label: "Shirt graphic", add: "screen print graphic design for a t-shirt, isolated artwork on a plain background, one or two colours", w: 1024, h: 1024 },
    garment: { label: "Blank garment", add: "product photo of a single garment, flat lay on raw concrete, top-down, soft light, no text, no logo", w: 896, h: 1120 },
    look: { label: "Model look", add: "full body fashion lookbook photo of a model, portrait, editorial", w: 896, h: 1120 },
    free: { label: "Anything", add: "", w: 1024, h: 1024 }
  };
  var GAP = 16000;

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function url(prompt, p, seed) {
    return "https://image.pollinations.ai/prompt/" + encodeURIComponent(prompt) +
      "?width=" + p.w + "&height=" + p.h + "&seed=" + seed + "&nologo=true&model=flux";
  }
  function store() { return window.SITE_STORAGE; }
  function saveBlob(blob) {
    var ST = store(); if (!ST) return Promise.reject();
    return fetch(ST.url + "/storage/v1/object/" + ST.bucket + "/ai/" + Date.now() + ".jpg",
      { method: "POST", headers: { apikey: ST.key, "Content-Type": blob.type || "image/jpeg" }, body: blob })
      .then(function (r) { if (!r.ok) throw new Error("save"); });
  }
  function listSaved() {
    var ST = store(); if (!ST) return Promise.resolve([]);
    return fetch(ST.url + "/storage/v1/object/list/" + ST.bucket, {
      method: "POST", headers: { apikey: ST.key, "Content-Type": "application/json" },
      body: JSON.stringify({ prefix: "ai/", limit: 200, sortBy: { column: "created_at", order: "desc" } })
    }).then(function (r) { return r.ok ? r.json() : []; }).then(function (rows) {
      var hide = (window.SITE && window.SITE.hiddenAI) || [];
      return rows.filter(function (o) { return o.id && hide.indexOf(o.name) < 0; }).map(function (o) { return ST.url + "/storage/v1/object/public/" + ST.bucket + "/ai/" + encodeURIComponent(o.name); });
    }).catch(function () { return []; });
  }

  window.AskAI = {
    mount: function (root) {
      var form = root.querySelector("#ai-form"), out = root.querySelector("#ai-out"), msg = root.querySelector("#ai-msg"),
        saved = root.querySelector("#ai-saved"), btn = root.querySelector("#ai-go"), running = false, stop = false;

      function drawSaved() {
        listSaved().then(function (urls) {
          saved.innerHTML = urls.length ? urls.map(function (u) { return '<button type="button" class="ai-tile" data-zoom><img src="' + esc(u) + '" alt="Saved AI image" loading="lazy"></button>'; }).join("")
            : '<p class="muted">Nothing saved yet. Tap Save on any result to keep it here for the team.</p>';
          if (window.__wireZoom) window.__wireZoom(saved);
        });
      }

      out.addEventListener("click", function (e) {
        var b = e.target.closest("button[data-act]"); if (!b) return;
        var card = b.closest(".ai-card"), img = card.querySelector("img");
        if (b.dataset.act === "dl") {
          var a = document.createElement("a"); a.href = img.src; a.target = "_blank"; a.rel = "noopener"; a.download = "untitled-ai.jpg"; document.body.appendChild(a); a.click(); a.remove();
        } else if (b.dataset.act === "save") {
          b.textContent = "Saving…"; b.disabled = true;
          fetch(img.src).then(function (r) { return r.blob(); }).then(saveBlob).then(function () { b.textContent = "Saved"; drawSaved(); },
            function () { b.textContent = "Try again"; b.disabled = false; });
        }
      });

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (running) { stop = true; btn.textContent = "Stopping…"; return; }
        var text = form.querySelector("#ai-prompt").value.trim();
        if (!text) { msg.textContent = "Describe what you want first."; return; }
        var p = PRESETS[form.querySelector("#ai-kind").value], n = +form.querySelector("#ai-n").value;
        var full = [text, p.add, BRAND].filter(Boolean).join(", ");
        running = true; stop = false; btn.textContent = "Stop";
        var cards = [];
        for (var i = 0; i < n; i++) cards.push('<figure class="ai-card waiting"><div class="ai-shot"><span>Waiting</span></div><figcaption><button type="button" data-act="save" disabled>Save to site</button><button type="button" data-act="dl" disabled>Open</button></figcaption></figure>');
        out.insertAdjacentHTML("afterbegin", cards.join(""));
        var slots = Array.prototype.slice.call(out.querySelectorAll(".ai-card.waiting")).slice(0, n);
        (async function () {
          for (var k = 0; k < n && !stop; k++) {
            var card = slots[k];
            card.querySelector(".ai-shot span").textContent = "Making " + (k + 1) + " of " + n + "…";
            msg.textContent = "Making image " + (k + 1) + " of " + n + ". The free service makes one about every 15 seconds.";
            var t0 = Date.now();
            var ok = await new Promise(function (res) {
              var im = new Image(); im.crossOrigin = "anonymous"; im.alt = text;
              im.onload = function () { card.querySelector(".ai-shot").innerHTML = ""; card.querySelector(".ai-shot").appendChild(im); res(true); };
              im.onerror = function () { res(false); };
              im.src = url(full, p, Math.floor(Math.random() * 1e9));
            });
            card.classList.remove("waiting");
            if (ok) card.querySelectorAll("button").forEach(function (b) { b.disabled = false; });
            else card.querySelector(".ai-shot").innerHTML = "<span>Didn’t come through. Try again in a minute.</span>";
            if (k < n - 1 && !stop) await sleep(Math.max(0, GAP - (Date.now() - t0)));
          }
          slots.forEach(function (c) { if (c.classList.contains("waiting")) c.remove(); });
          msg.textContent = stop ? "Stopped." : "Done. Save the ones you like so the team can see them.";
          running = false; btn.textContent = "Make images";
        })();
      });
      drawSaved();
    }
  };
})();
