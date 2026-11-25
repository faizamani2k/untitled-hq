// Lettering maker: one word in a dozen styles, drawn as SVG, downloadable as PNG.
(function () {
  "use strict";
  var FONTS = {
    anton: { family: "Anton", file: "fonts/anton-latin-400-normal.woff2" },
    shoulders: { family: "Shoulders", file: "fonts/big-shoulders-display-latin-900-normal.woff2", weight: 900 },
    pirata: { family: "Pirata One", file: "fonts/pirata-one-latin-400-normal.woff2" },
    fraktur: { family: "Blackletter", file: "fonts/unifrakturcook-latin-700-normal.woff2", weight: 700 },
    doulaise: { family: "Monsieur La Doulaise", file: "fonts/monsieur-la-doulaise-latin-400-normal.woff2" },
    pinyon: { family: "Script", file: "fonts/pinyon-script-latin-400-normal.woff2" },
    dirt: { family: "Rubik Dirt", file: "fonts/rubik-dirt-latin-400-normal.woff2" },
    archivo: { family: "Archivo", file: "fonts/archivo-latin-700-normal.woff2", weight: 700 },
    maguntia: { family: "UnifrakturMaguntia", file: "fonts/unifrakturmaguntia-latin-400-normal.woff2" },
    grenze: { family: "Grenze Gotisch", file: "fonts/grenze-gotisch-latin-400-normal.woff2" },
    vibes: { family: "Great Vibes", file: "fonts/great-vibes-latin-400-normal.woff2" },
    abril: { family: "Abril Fatface", file: "fonts/abril-fatface-latin-400-normal.woff2" },
    glitch: { family: "Rubik Glitch", file: "fonts/rubik-glitch-latin-400-normal.woff2" },
    wet: { family: "Rubik Wet Paint", file: "fonts/rubik-wet-paint-latin-400-normal.woff2" },
    marker: { family: "Permanent Marker", file: "fonts/permanent-marker-latin-400-normal.woff2" },
    salt: { family: "Rock Salt", file: "fonts/rock-salt-latin-400-normal.woff2" },
    metal: { family: "Metal Mania", file: "fonts/metal-mania-latin-400-normal.woff2" },
    monoton: { family: "Monoton", file: "fonts/monoton-latin-400-normal.woff2" },
    bebas: { family: "Bebas Neue", file: "fonts/bebas-neue-latin-400-normal.woff2" },
    rye: { family: "Rye", file: "fonts/rye-latin-400-normal.woff2" }
  };
  var C = { ink: "#1A1A1A", char: "#3A3A3A", fade: "#8C8C8C", bone: "#EDE6D6", ox: "#7A1E22", olive: "#5E5B45" };

  var CRACK = '<filter id="k" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">' +
    '<feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="4" seed="3" result="p"/>' +
    '<feColorMatrix in="p" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -18 12.5" result="pm"/>' +
    '<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="5" result="q"/>' +
    '<feColorMatrix in="q" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -20 14.9" result="qm"/>' +
    '<feComposite in="pm" in2="qm" operator="in" result="w"/><feComposite in="SourceGraphic" in2="w" operator="in"/></filter>';

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function fit(word, max, per) { return Math.min(max, Math.max(120, word.length * per)); }
  function txt(word, o) {
    var f = FONTS[o.font];
    return '<text x="' + (o.x || 400) + '" y="' + o.y + '" text-anchor="' + (o.anchor || "middle") + '" font-family="' + f.family + '"' +
      (f.weight ? ' font-weight="' + f.weight + '"' : "") + ' font-size="' + o.size + '" fill="' + (o.fill || "none") + '"' +
      (o.stroke ? ' stroke="' + o.stroke + '" stroke-width="' + (o.sw || 3) + '"' : "") +
      (o.len ? ' textLength="' + o.len + '" lengthAdjust="spacingAndGlyphs"' : "") +
      (o.ls ? ' letter-spacing="' + o.ls + '"' : "") +
      (o.filter ? ' filter="url(#k)"' : "") + (o.tr ? ' transform="' + o.tr + '"' : "") +
      (o.op ? ' opacity="' + o.op + '"' : "") + '>' + esc(word) + '</text>';
  }

  var STYLES = [
    { name: "Cracked block", fonts: ["anton"], draw: function (w) { var u = w.toUpperCase(); return bg(C.ink) + txt(u, { font: "anton", y: 470, size: 230, fill: C.bone, len: fit(u, 720, 120), filter: true }); } },
    { name: "Gothic", fonts: ["pirata"], draw: function (w) { return bg(C.bone) + txt(w, { font: "pirata", y: 455, size: 210, fill: C.ink, len: fit(w, 700, 105) }); } },
    { name: "Fraktur, oxblood", fonts: ["fraktur"], draw: function (w) { return bg(C.bone) + txt(w, { font: "fraktur", y: 450, size: 180, fill: C.ox, len: fit(w, 700, 100) }); } },
    { name: "Flowing script", fonts: ["doulaise"], draw: function (w) { return bg(C.ink) + txt(w, { font: "doulaise", y: 470, size: 230, fill: C.bone, len: fit(w, 700, 95), tr: "rotate(-6 400 400)" }); } },
    { name: "Fine script", fonts: ["pinyon"], draw: function (w) {
      return bg(C.bone) + txt(w, { font: "pinyon", y: 430, size: 170, fill: C.ink, len: fit(w, 640, 90) }) +
        '<path d="M150 500 C 300 470, 520 540, 660 480" fill="none" stroke="' + C.ink + '" stroke-width="5" stroke-linecap="round"/>'; } },
    { name: "Echo outline", fonts: ["shoulders"], draw: function (w) {
      var u = w.toUpperCase(), L = fit(u, 700, 110), s = bg(C.char);
      [250, 420, 590].forEach(function (y, i) { s += txt(u, { font: "shoulders", y: y, size: 180, stroke: C.bone, sw: 3, len: L, fill: i === 1 ? C.bone : "none", op: i === 1 ? 1 : 0.5 }); });
      return s; } },
    { name: "Dirt print", fonts: ["dirt"], draw: function (w) { var u = w.toUpperCase(); return bg(C.char) + txt(u, { font: "dirt", y: 460, size: 170, fill: C.bone, len: fit(u, 700, 105) }); } },
    { name: "Arched gothic", fonts: ["pirata", "archivo"], draw: function (w) {
      return bg(C.bone) + '<defs><path id="arc" d="M110 520 A 300 260 0 0 1 690 520"/></defs>' +
        '<text font-family="Pirata One" font-size="150" fill="' + C.ink + '" text-anchor="middle"><textPath href="#arc" startOffset="50%">' + esc(w) + '</textPath></text>' +
        txt("EST. 2027", { font: "archivo", y: 600, size: 34, fill: C.ink, ls: 10 }); } },
    { name: "Oval badge", fonts: ["pinyon"], draw: function (w) {
      return bg("#B9B7B3") + '<ellipse cx="400" cy="400" rx="300" ry="150" fill="none" stroke="#FFFFFF" stroke-width="10"/>' +
        txt(w, { font: "pinyon", y: 440, size: 130, fill: "#FFFFFF", len: fit(w, 470, 70) }); } },
    { name: "Split stack", fonts: ["shoulders"], draw: function (w) {
      var u = w.toUpperCase(), h = Math.ceil(u.length / 2), a = u.slice(0, h), b = u.slice(h) || " ";
      return bg(C.olive) + txt(a, { font: "shoulders", y: 380, size: 300, fill: C.bone, len: fit(a, 640, 150), filter: true }) +
        txt(b, { font: "shoulders", y: 640, size: 300, fill: C.bone, len: fit(b, 640, 150), filter: true }); } },
    { name: "Wide label", fonts: ["archivo"], draw: function (w) {
      var u = w.toUpperCase();
      return bg(C.bone) + '<line x1="110" y1="330" x2="690" y2="330" stroke="' + C.ink + '" stroke-width="4"/>' +
        txt(u, { font: "archivo", y: 425, size: 90, fill: C.ink, len: fit(u, 580, 75) }) +
        '<line x1="110" y1="475" x2="690" y2="475" stroke="' + C.ink + '" stroke-width="4"/>' +
        txt("DROP 01", { font: "archivo", y: 540, size: 30, fill: C.ink, ls: 14 }); } },
    { name: "Down the leg", fonts: ["anton"], draw: function (w) { var u = w.toUpperCase(); return bg(C.ink) + txt(u, { font: "anton", x: 400, y: 400, size: 150, fill: C.ox, len: fit(u, 720, 95), tr: "rotate(90 400 400) translate(0 55)" }); } },
    { name: "Old gothic", fonts: ["maguntia"], draw: function (w) { return bg(C.ink) + txt(w, { font: "maguntia", y: 455, size: 190, fill: C.bone, len: fit(w, 700, 100) }); } },
    { name: "Tall gothic", fonts: ["grenze"], draw: function (w) { return bg(C.bone) + txt(w, { font: "grenze", y: 470, size: 240, fill: C.ink, len: fit(w, 640, 95) }); } },
    { name: "Tonal gothic", fonts: ["pirata"], draw: function (w) { return bg(C.ink) + txt(w, { font: "pirata", y: 455, size: 210, fill: "#2A2A2A", stroke: "#4A4A4A", sw: 2, len: fit(w, 700, 105) }); } },
    { name: "Gothic, cracked", fonts: ["maguntia"], draw: function (w) { return bg(C.char) + txt(w, { font: "maguntia", y: 460, size: 200, fill: C.bone, len: fit(w, 700, 100), filter: true }); } },
    { name: "Wedding script", fonts: ["vibes"], draw: function (w) { return bg(C.bone) + txt(w, { font: "vibes", y: 460, size: 200, fill: C.ox, len: fit(w, 660, 95) }); } },
    { name: "Script on chest", fonts: ["vibes"], draw: function (w) { return bg(C.ink) + txt(w, { font: "vibes", y: 440, size: 170, fill: C.bone, len: fit(w, 740, 105), tr: "rotate(-4 400 400)" }) + '<path d="M90 500 C 300 520, 520 470, 720 505" fill="none" stroke="' + C.bone + '" stroke-width="3"/>'; } },
    { name: "Serif luxe", fonts: ["abril"], draw: function (w) { var u = w.toUpperCase(); return bg(C.bone) + txt(u, { font: "abril", y: 450, size: 140, fill: C.ink, len: fit(u, 660, 85) }); } },
    { name: "Glitch", fonts: ["glitch"], draw: function (w) { var u = w.toUpperCase(); return bg(C.ink) + txt(u, { font: "glitch", x: 408, y: 455, size: 150, fill: C.ox, len: fit(u, 680, 90) }) + txt(u, { font: "glitch", y: 450, size: 150, fill: C.bone, len: fit(u, 680, 90) }); } },
    { name: "Wet paint", fonts: ["wet"], draw: function (w) { var u = w.toUpperCase(); return bg(C.bone) + txt(u, { font: "wet", y: 440, size: 150, fill: C.ox, len: fit(u, 680, 90) }); } },
    { name: "Marker tag", fonts: ["marker"], draw: function (w) { return bg(C.fade) + txt(w, { font: "marker", y: 450, size: 160, fill: C.ink, len: fit(w, 660, 85), tr: "rotate(-8 400 400)" }); } },
    { name: "Hand scrawl", fonts: ["salt"], draw: function (w) { return bg(C.ink) + txt(w, { font: "salt", y: 430, size: 110, fill: C.bone, len: fit(w, 680, 80), tr: "rotate(-5 400 400)" }); } },
    { name: "Metal", fonts: ["metal"], draw: function (w) { var u = w.toUpperCase(); return bg(C.ink) + txt(u, { font: "metal", y: 460, size: 170, fill: C.bone, len: fit(u, 700, 100) }); } },
    { name: "Neon lines", fonts: ["monoton"], draw: function (w) { var u = w.toUpperCase(); return bg(C.ink) + txt(u, { font: "monoton", y: 450, size: 130, fill: C.bone, len: fit(u, 700, 95) }); } },
    { name: "Western", fonts: ["rye"], draw: function (w) { var u = w.toUpperCase(); return bg(C.bone) + txt(u, { font: "rye", y: 450, size: 130, fill: C.ink, len: fit(u, 660, 85) }) + txt("SINCE 2027", { font: "archivo", y: 540, size: 30, fill: C.ox, ls: 12 }); } },
    { name: "Bold sans, faded", fonts: ["bebas"], draw: function (w) { var u = w.toUpperCase(); return '<defs><linearGradient id="fd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#77746f"/><stop offset="1" stop-color="#141414"/></linearGradient></defs><rect width="800" height="800" fill="url(#fd)"/>' + txt(u, { font: "bebas", y: 500, size: 300, fill: C.bone, len: fit(u, 720, 120), filter: true }); } },
    { name: "Repeat wall", fonts: ["bebas"], draw: function (w) { var u = w.toUpperCase(), s = bg(C.ox); for (var y = 110; y < 800; y += 110) s += txt(u, { font: "bebas", y: y, size: 110, fill: y === 440 ? C.bone : "none", stroke: C.bone, sw: 1.5, len: fit(u, 740, 70) }); return s; } },
    { name: "Circle stamp", fonts: ["archivo", "pirata"], draw: function (w) { var u = w.toUpperCase();
      return bg(C.bone) + '<defs><path id="cr" d="M400 400 m -250 0 a 250 250 0 1 1 500 0 a 250 250 0 1 1 -500 0"/></defs>' +
        '<circle cx="400" cy="400" r="290" fill="none" stroke="' + C.ink + '" stroke-width="6"/><circle cx="400" cy="400" r="200" fill="none" stroke="' + C.ink + '" stroke-width="3"/>' +
        '<text font-family="Archivo" font-weight="700" font-size="46" fill="' + C.ink + '" letter-spacing="8"><textPath href="#cr" startOffset="0">' + esc(u) + ' \u2022 ' + esc(u) + ' \u2022 ' + '</textPath></text>' +
        txt(w.charAt(0).toUpperCase(), { font: "pirata", y: 470, size: 220, fill: C.ink }); } },
    { name: "Flourish across chest", fonts: ["doulaise"], draw: function (w) {
      var L = fit(w, 760, 120);
      return '<defs><linearGradient id="fc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3836"/><stop offset=".55" stop-color="#1c1c1c"/><stop offset="1" stop-color="#0f0f0f"/></linearGradient></defs><rect width="800" height="800" fill="url(#fc)"/>' +
        '<path d="M30 430 C 160 330, 300 470, 400 405 S 650 330, 775 420" fill="none" stroke="' + C.bone + '" stroke-width="3.5" stroke-linecap="round"/>' +
        '<path d="M60 455 C 230 500, 560 500, 760 445" fill="none" stroke="' + C.bone + '" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M330 300 C 360 360, 420 470, 470 520" fill="none" stroke="' + C.bone + '" stroke-width="2" stroke-linecap="round"/>' +
        txt(w, { font: "doulaise", y: 452, size: 220, fill: "none", stroke: C.bone, sw: 4, len: L }) + txt(w, { font: "doulaise", y: 450, size: 220, fill: C.bone, len: L }); } },
    { name: "Monogram", fonts: ["maguntia", "archivo"], draw: function (w) { var u = w.toUpperCase();
      return bg(C.ink) + txt(w.charAt(0).toUpperCase(), { font: "maguntia", y: 520, size: 420, fill: C.bone }) + txt(u, { font: "archivo", y: 680, size: 34, fill: C.fade, ls: 16 }); } }
  ];
  function bg(c) { return '<rect width="800" height="800" fill="' + c + '"/>'; }

  function svg(style, word, fontCss) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">' +
      '<defs>' + (fontCss ? '<style>' + fontCss + '</style>' : '') + CRACK + '</defs>' + style.draw(word) + '</svg>';
  }

  var cache = {};
  function fontData(key) {
    if (cache[key]) return cache[key];
    var f = FONTS[key];
    cache[key] = fetch(f.file).then(function (r) { return r.blob(); }).then(function (b) {
      return new Promise(function (res) { var fr = new FileReader(); fr.onload = function () { res(fr.result); }; fr.readAsDataURL(b); });
    }).then(function (data) { return "@font-face{font-family:'" + f.family + "';src:url(" + data + ") format('woff2');" + (f.weight ? "font-weight:" + f.weight + ";" : "") + "}"; });
    return cache[key];
  }

  function download(style, word) {
    return Promise.all(style.fonts.map(fontData)).then(function (css) {
      var s = svg(style, word, css.join(""));
      var img = new Image();
      var url = URL.createObjectURL(new Blob([s], { type: "image/svg+xml" }));
      return new Promise(function (res, rej) {
        img.onload = function () {
          var c = document.createElement("canvas"); c.width = 1600; c.height = 1600;
          c.getContext("2d").drawImage(img, 0, 0, 1600, 1600);
          URL.revokeObjectURL(url);
          c.toBlob(function (b) {
            var a = document.createElement("a");
            a.href = URL.createObjectURL(b);
            a.download = (word || "lettering").toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + style.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".png";
            document.body.appendChild(a); a.click(); a.remove(); res();
          }, "image/png");
        };
        img.onerror = rej;
        img.src = url;
      });
    });
  }

  window.Lettering = {
    mount: function (root) {
      var input = root.querySelector("#lt-word"), grid = root.querySelector("#lt-grid");
      function draw() {
        var w = (input.value || "").trim().slice(0, 24) || "Untitled";
        grid.innerHTML = STYLES.map(function (st, i) {
          return '<figure class="lt-card"><div class="lt-art">' + svg(st, w) + '</div>' +
            '<figcaption><span>' + esc(st.name) + '</span><button type="button" class="lt-dl" data-i="' + i + '">Download PNG</button></figcaption></figure>';
        }).join("");
      }
      input.addEventListener("input", draw);
      grid.addEventListener("click", function (e) {
        var b = e.target.closest(".lt-dl"); if (!b) return;
        var w = (input.value || "").trim().slice(0, 24) || "Untitled";
        b.textContent = "Saving…";
        download(STYLES[+b.dataset.i], w).then(function () { b.textContent = "Downloaded"; }, function () { b.textContent = "Try again"; })
          .then(function () { setTimeout(function () { b.textContent = "Download PNG"; }, 1500); });
      });
      draw();
    }
  };
})();
