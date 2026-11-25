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
    archivo: { family: "Archivo", file: "fonts/archivo-latin-700-normal.woff2", weight: 700 }
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
    { name: "Down the leg", fonts: ["anton"], draw: function (w) { var u = w.toUpperCase(); return bg(C.ink) + txt(u, { font: "anton", x: 400, y: 400, size: 150, fill: C.ox, len: fit(u, 720, 95), tr: "rotate(90 400 400) translate(0 55)" }); } }
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
