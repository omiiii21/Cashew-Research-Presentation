/* ============================================================
   Charts — hand-rolled SVG. No library, no CDN, works offline.
   Every renderer is idempotent: it clears its host and redraws,
   so slide re-entry and window resize both just work.
   ============================================================ */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  /* Chart type sizes live HERE, not in the stylesheet. Measurement and
     rendering must use the same numbers — when they drifted apart (measured
     at 11.5px, rendered at 13.5px) every label overflowed its gutter. These
     are applied inline so no CSS rule can silently override them. */
  var FS = { cat: 13.5, val: 13, note: 12.5, axis: 12.5 };

  /* ---------- palette pulled from the CSS custom properties ---------- */
  function cssVar(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name);
    return (v && v.trim()) || fallback;
  }

  var C = {};
  function refreshPalette() {
    C = {
      c1: cssVar('--c1', '#C05F3C'),
      c2: cssVar('--c2', '#55703F'),
      c3: cssVar('--c3', '#D9A441'),
      c4: cssVar('--c4', '#7A5638'),
      c5: cssVar('--c5', '#5B7C8D'),
      c6: cssVar('--c6', '#8C5A6E'),
      ink: cssVar('--ink', '#2A1F16'),
      inkSoft: cssVar('--ink-soft', '#6A5644'),
      inkFaint: cssVar('--ink-faint', '#9A876F'),
      edge: cssVar('--paper-edge', '#E3D6BC'),
      paper: cssVar('--paper', '#FDFAF3'),
      leaf: cssVar('--leaf', '#55703F'),
      terracotta: cssVar('--terracotta', '#C05F3C'),
      laterite: cssVar('--laterite', '#9C3D22'),
      gold: cssVar('--gold', '#D9A441'),
      goldDeep: cssVar('--gold-deep', '#B07E22'),
      shell: cssVar('--shell', '#4A3428'),
      slate: cssVar('--slate', '#5B7C8D')
    };
  }
  refreshPalette();

  var RAMP = function () { return [C.c1, C.c2, C.c3, C.c4, C.c5, C.c6]; };

  /* ---------- tiny DOM helpers ---------- */
  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) if (attrs[k] !== null && attrs[k] !== undefined) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  function text(parent, x, y, str, cls, extra) {
    var attrs = Object.assign({ x: x, y: y, class: cls || '' }, extra || {});
    var t = el('text', attrs, parent);
    /* A `fill` presentation attribute loses to any CSS rule that matches the
       element (e.g. `.chart text { fill: ... }`), which silently flattens every
       colour we set here. Promote it to an inline style so it actually wins. */
    if (attrs.fill) t.style.fill = attrs.fill;
    if (attrs['font-weight']) t.style.fontWeight = attrs['font-weight'];
    if (attrs['font-size']) t.style.fontSize = attrs['font-size'] + 'px';
    t.textContent = str;
    return t;
  }

  var REDUCE = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Animate an element in: set the "from" state, then release to "to"
     after two frames so the browser actually runs the transition.
     Honours prefers-reduced-motion by jumping straight to the end state —
     the CSS does the same for the slide choreography.                  */
  function reveal(node, from, to, dur, delay) {
    if (REDUCE) {
      for (var f in to) node.style[f] = to[f];
      return;
    }
    for (var p in from) node.style[p] = from[p];
    node.style.transition = 'none';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        node.style.transition = Object.keys(to).map(function (p) {
          return p.replace(/[A-Z]/g, function (m) { return '-' + m.toLowerCase(); }) +
                 ' ' + (dur || 900) + 'ms cubic-bezier(.22,.68,.32,1) ' + (delay || 0) + 'ms';
        }).join(', ');
        for (var q in to) node.style[q] = to[q];
      });
    });
  }

  /* ---------- text measurement ----------
     Margins used to be a percentage of chart width, which silently clipped
     long category labels and let value labels collide with note text at
     narrower viewports. Measure the real strings instead and size the
     gutters from them. */
  var _measSvg = null;

  function fonts() {
    return {
      sans: cssVar('--sans', 'sans-serif'),
      mono: cssVar('--mono', 'monospace')
    };
  }

  function measure(str, size, weight, family) {
    if (!str) return 0;
    if (!_measSvg) {
      _measSvg = document.createElementNS(NS, 'svg');
      _measSvg.setAttribute('width', '0');
      _measSvg.setAttribute('height', '0');
      _measSvg.setAttribute('aria-hidden', 'true');
      _measSvg.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden;pointer-events:none';
      document.body.appendChild(_measSvg);
    }
    var t = document.createElementNS(NS, 'text');
    t.style.fontSize = (size || 11.5) + 'px';
    t.style.fontWeight = String(weight || 400);
    t.style.fontFamily = family || fonts().sans;
    t.textContent = str;
    _measSvg.appendChild(t);
    var w;
    try { w = t.getComputedTextLength(); } catch (e) { w = 0; }
    _measSvg.removeChild(t);
    /* getComputedTextLength returns 0 in some detached/headless cases */
    return w || str.length * (size || 11.5) * 0.56;
  }

  function fmt(n, dp) {
    if (n === null || n === undefined || isNaN(n)) return '—';
    var d = dp === undefined ? (Math.abs(n) >= 100 ? 0 : Math.abs(n) >= 10 ? 1 : 2) : dp;
    return Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  }

  function niceMax(v) {
    if (v <= 0) return 1;
    var mag = Math.pow(10, Math.floor(Math.log10(v)));
    var n = v / mag;
    var step = n <= 1 ? 1 : n <= 1.5 ? 1.5 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 3 ? 3 : n <= 4 ? 4 : n <= 5 ? 5 : n <= 7.5 ? 7.5 : 10;
    return step * mag;
  }

  function box(host, ratio) {
    var w = host.clientWidth || host.parentElement.clientWidth || 800;
    var h = host.clientHeight;
    if (!h || h < 60) h = Math.round(w / (ratio || 2));
    return { w: w, h: h };
  }

  function frame(host, ratio) {
    host.innerHTML = '';
    var b = box(host, ratio);
    var svg = el('svg', {
      class: 'chart',
      viewBox: '0 0 ' + b.w + ' ' + b.h,
      width: b.w, height: b.h,
      preserveAspectRatio: 'xMidYMid meet',
      role: 'img'
    }, host);
    return { svg: svg, w: b.w, h: b.h };
  }

  /* ============================================================
     1. Trend line — world production over time
     spec: { points:[{x,y}], label, unit, color, annotate:[{x,text}] }
     ============================================================ */
  function trendLine(host, spec) {
    var f = frame(host, 2.1), svg = f.svg, W = f.w, H = f.h;
    var m = { t: 22, r: 22, b: 34, l: 52 };
    var iw = W - m.l - m.r, ih = H - m.t - m.b;
    if (iw < 40 || ih < 40) return;

    var pts = spec.points;
    var maxV = niceMax(Math.max.apply(null, pts.map(function (p) { return p.y; })) * 1.08);
    var minV = spec.zeroBased === false
      ? Math.max(0, Math.min.apply(null, pts.map(function (p) { return p.y; })) * 0.88)
      : 0;

    var X = function (i) { return m.l + (pts.length === 1 ? iw / 2 : (i / (pts.length - 1)) * iw); };
    var Y = function (v) { return m.t + ih - ((v - minV) / (maxV - minV)) * ih; };

    /* gridlines */
    var g = el('g', { class: 'grid' }, svg);
    for (var i = 0; i <= 4; i++) {
      var v = minV + ((maxV - minV) / 4) * i, y = Y(v);
      el('line', { x1: m.l, x2: W - m.r, y1: y, y2: y, stroke: C.edge }, g);
      text(g, m.l - 9, y + 4, fmt(v, spec.dp === undefined ? 1 : spec.dp), 'value-label', { 'text-anchor': 'end', fill: C.inkFaint });
    }

    /* x labels */
    pts.forEach(function (p, i) {
      text(svg, X(i), H - m.b + 20, p.x, 'cat-label', { 'text-anchor': 'middle', fill: C.inkSoft });
    });

    /* area */
    var color = spec.color || C.terracotta;
    var areaD = 'M' + X(0) + ',' + Y(pts[0].y) +
      pts.map(function (p, i) { return 'L' + X(i) + ',' + Y(p.y); }).join('') +
      'L' + X(pts.length - 1) + ',' + Y(minV) + 'L' + X(0) + ',' + Y(minV) + 'Z';

    var gradId = 'grad-' + Math.abs(host.id.split('').reduce(function (a, c) { return a + c.charCodeAt(0); }, 0));
    var defs = el('defs', {}, svg);
    var lg = el('linearGradient', { id: gradId, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el('stop', { offset: '0%', 'stop-color': color, 'stop-opacity': .32 }, lg);
    el('stop', { offset: '100%', 'stop-color': color, 'stop-opacity': .02 }, lg);

    var area = el('path', { d: areaD, fill: 'url(#' + gradId + ')' }, svg);
    reveal(area, { opacity: 0 }, { opacity: 1 }, 900, 380);

    /* line */
    var lineD = pts.map(function (p, i) { return (i ? 'L' : 'M') + X(i) + ',' + Y(p.y); }).join('');
    var line = el('path', { d: lineD, class: 'series-line', stroke: color, fill: 'none' }, svg);
    var len = line.getTotalLength ? line.getTotalLength() : 2000;
    line.style.strokeDasharray = len;
    reveal(line, { strokeDashoffset: len }, { strokeDashoffset: 0 }, 1350, 120);

    /* dots + last value callout */
    pts.forEach(function (p, i) {
      var isLast = i === pts.length - 1;
      var d = el('circle', {
        cx: X(i), cy: Y(p.y), r: isLast ? 6.5 : 4.2,
        fill: isLast ? color : C.paper, stroke: color, 'stroke-width': isLast ? 2.5 : 2.2,
        class: 'dot'
      }, svg);
      reveal(d, { opacity: 0 }, { opacity: 1 }, 400, 700 + i * 70);

      if (p.callout || isLast) {
        var lbl = text(svg, X(i), Y(p.y) - 15, fmt(p.y, spec.dp === undefined ? 1 : spec.dp) + (spec.unit ? ' ' + spec.unit : ''),
          'value-label', { 'text-anchor': i === pts.length - 1 ? 'end' : 'middle', fill: C.ink, 'font-size': isLast ? 13 : 11 });
        reveal(lbl, { opacity: 0 }, { opacity: 1 }, 500, 900 + i * 70);
      }
    });

    if (spec.yLabel) text(svg, m.l - 40, 12, spec.yLabel, 'axis-label', { 'text-anchor': 'start' });
  }

  /* ============================================================
     2. Compare bars — horizontal, two series per category
     spec: { items:[{label, a, b, note}], aLabel, bLabel, unit, dp }
     ============================================================ */
  function compareBars(host, spec) {
    var items = spec.items;
    var dp = spec.dp === undefined ? 0 : spec.dp;

    /* The host carries its own responsive height from the markup. Forcing a
       min-height from a per-row constant here used to push short viewports
       into overflow — bands shrink to fit instead. */
    var f = frame(host, null), svg = f.svg, W = f.w;
    var H = f.h;
    var F = fonts();

    /* Measure the three text gutters so nothing can collide or clip. */
    var labelW = 0, noteW = 0, valW = 0;
    items.forEach(function (d) {
      labelW = Math.max(labelW, measure(d.label, FS.cat, 520, F.sans));
      noteW = Math.max(noteW, measure(d.note, FS.note, 640, F.mono));
      valW = Math.max(valW, measure(fmt(d.a, dp), FS.val, 640, F.mono));
    });
    labelW = Math.min(labelW, W * 0.34);
    noteW = Math.min(noteW, W * 0.30);

    var m = {
      t: 14,
      b: spec.axis ? 30 : 20,
      l: labelW + 20,
      r: noteW ? noteW + 20 : 12
    };
    var valGutter = valW + 14;          /* value label sits just past the bar */
    var iw = W - m.l - m.r - valGutter;
    if (iw < 40) return;

    var maxV = niceMax(Math.max.apply(null, items.map(function (d) { return Math.max(d.a || 0, d.b || 0); })));
    var X = function (v) { return (v / maxV) * iw; };
    var band = (H - m.t - m.b) / items.length;
    /* One bar per row reads far better than a pair of near-identical bars.
       Use it whenever there is no prior-year series to compare against. */
    var single = !!spec.single;
    var bh = single ? Math.min(22, band * 0.62) : Math.min(11, band * 0.30);

    /* vertical gridlines — confined to the plot area, never under the notes */
    var g = el('g', { class: 'grid' }, svg);
    for (var i = 0; i <= 4; i++) {
      var gx = m.l + (iw / 4) * i;
      el('line', { x1: gx, x2: gx, y1: m.t - 4, y2: H - m.b, stroke: C.edge }, g);
      if (spec.axis) {
        text(g, gx, H - m.b + 19, fmt((maxV / 4) * i, spec.axisDp === undefined ? 0 : spec.axisDp),
          'axis-label', { 'text-anchor': i === 0 ? 'start' : (i === 4 ? 'end' : 'middle'), 'font-size': FS.axis });
      }
    }

    items.forEach(function (d, i) {
      var cy = m.t + band * i + band / 2;

      text(svg, m.l - 12, cy + 4.5, d.label, 'cat-label',
        { 'text-anchor': 'end', fill: C.ink, 'font-size': FS.cat });

      /* prior year — muted, sits behind */
      if (!single && d.b !== null && d.b !== undefined) {
        var rb = el('rect', {
          x: m.l, y: cy - bh - 1.5, width: Math.max(2, X(d.b)), height: bh,
          rx: 3, fill: C.inkFaint, opacity: .42
        }, svg);
        reveal(rb, { transform: 'scaleX(0)', transformOrigin: m.l + 'px ' + cy + 'px' },
                   { transform: 'scaleX(1)' }, 800, 100 + i * 45);
      }

      /* current year */
      var ra = el('rect', {
        x: m.l, y: single ? cy - bh / 2 : cy + 1.5, width: Math.max(2, X(d.a)), height: bh,
        rx: 3, fill: d.color || C.terracotta
      }, svg);
      reveal(ra, { transform: 'scaleX(0)', transformOrigin: m.l + 'px ' + cy + 'px' },
                 { transform: 'scaleX(1)' }, 900, 160 + i * 45);

      var lbl = text(svg, m.l + Math.max(2, X(d.a)) + 9, cy + 4.5,
        fmt(d.a, dp), 'value-label', { 'text-anchor': 'start', 'font-size': FS.val });
      reveal(lbl, { opacity: 0 }, { opacity: 1 }, 500, 600 + i * 45);

      if (d.note) {
        var nt = text(svg, W - 8, cy + 4.5, d.note, 'value-label',
          { 'text-anchor': 'end', fill: d.noteColor || C.inkFaint, 'font-size': FS.note });
        reveal(nt, { opacity: 0 }, { opacity: 1 }, 500, 700 + i * 45);
      }
    });
  }

  /* ============================================================
     3. Diverging bars — year-on-year % change
     spec: { items:[{label, value}], unit }
     ============================================================ */
  function deltaBars(host, spec) {
    var items = spec.items;
    var f = frame(host, null), svg = f.svg, W = f.w, H = f.h;
    var F = fonts();

    var maxAbs = niceMax(Math.max.apply(null, items.map(function (d) { return Math.abs(d.value); })) * 1.02);

    /* Measure the widest category label and the widest value label. A fully
       negative bar puts its value label to the LEFT of the plot area, so the
       plot has to start clear of both — otherwise the text runs off the SVG. */
    var labelW = 0, valW = 0;
    items.forEach(function (d) {
      labelW = Math.max(labelW, measure(d.label, FS.cat, 520, F.sans));
      valW = Math.max(valW, measure((d.value >= 0 ? '+' : '') + fmt(d.value, 1) + '%', FS.val, 640, F.mono));
    });
    labelW = Math.min(labelW, W * 0.36);

    var m = { t: 22, b: 16, l: labelW + 18 + valW + 10, r: valW + 14 };
    var iw = W - m.l - m.r;
    if (iw < 40) return;

    var catX = labelW + 8;              /* category labels end here */
    var mid = m.l + iw / 2;
    var X = function (v) { return (v / maxAbs) * (iw / 2); };
    var band = (H - m.t - m.b) / items.length;
    var bh = Math.min(15, band * 0.56);

    /* axis + zero line */
    var g = el('g', { class: 'grid' }, svg);
    [-1, -0.5, 0, 0.5, 1].forEach(function (t) {
      var gx = mid + (iw / 2) * t;
      el('line', { x1: gx, x2: gx, y1: m.t - 8, y2: H - m.b, stroke: t === 0 ? C.inkFaint : C.edge, 'stroke-width': t === 0 ? 1.4 : 1 }, g);
      text(g, gx, m.t - 14, (t > 0 ? '+' : '') + fmt(maxAbs * t, 0) + '%', 'axis-label',
        { 'text-anchor': 'middle', 'font-size': FS.axis });
    });

    items.forEach(function (d, i) {
      var cy = m.t + band * i + band / 2;
      var pos = d.value >= 0;
      var w = Math.abs(X(d.value));

      text(svg, catX, cy + 4.5, d.label, 'cat-label',
        { 'text-anchor': 'end', fill: C.ink, 'font-size': FS.cat });

      var r = el('rect', {
        x: pos ? mid : mid - w, y: cy - bh / 2, width: Math.max(1.5, w), height: bh,
        rx: 3, fill: pos ? C.leaf : C.laterite, opacity: .88
      }, svg);
      reveal(r, { transform: 'scaleX(0)', transformOrigin: mid + 'px ' + cy + 'px' },
                { transform: 'scaleX(1)' }, 880, 120 + i * 50);

      var lbl = text(svg, pos ? mid + w + 8 : mid - w - 8, cy + 4.5,
        (pos ? '+' : '') + fmt(d.value, 1) + '%', 'value-label',
        { 'text-anchor': pos ? 'start' : 'end', fill: pos ? '#3F5730' : '#8A3319', 'font-size': FS.val });
      reveal(lbl, { opacity: 0 }, { opacity: 1 }, 480, 620 + i * 50);
    });
  }

  /* ============================================================
     Pictogram — an icon array. Far more visceral than a bar for
     "almost all of these are gone": you see the survivors.
     spec: { units, filled, cols, caption }
     ============================================================ */
  function pictogram(host, spec) {
    var f = frame(host, 3), svg = f.svg, W = f.w, H = f.h;
    var cols = spec.cols || 20;
    var rows = Math.ceil(spec.units / cols);
    var capH = spec.caption ? 18 : 0;
    var gap = 3;
    var cell = Math.max(4, Math.min((W - (cols - 1) * gap) / cols, (H - capH - (rows - 1) * gap) / rows));
    var gridW = cols * cell + (cols - 1) * gap;
    var x0 = (W - gridW) / 2;
    var y0 = 2;

    for (var i = 0; i < spec.units; i++) {
      var r = Math.floor(i / cols), c = i % cols;
      var on = i < spec.filled;
      var sq = el('rect', {
        x: x0 + c * (cell + gap), y: y0 + r * (cell + gap),
        width: cell, height: cell, rx: Math.min(2, cell * 0.25),
        fill: on ? C.laterite : C.edge,
        opacity: on ? 1 : .75
      }, svg);
      reveal(sq, { opacity: 0 }, { opacity: on ? 1 : .75 }, 320, 40 + i * 7);
    }

    if (spec.caption) {
      text(svg, W / 2, y0 + rows * (cell + gap) + 13, spec.caption, 'axis-label',
        { 'text-anchor': 'middle', 'font-size': 11.5 });
    }
  }

  /* ============================================================
     Trade-flow diagram — where the world's raw nuts travel.
     RAW NUTS ONLY, one unit throughout (million tonnes). The
     earlier version put raw nuts and kernel in the same picture,
     which implied a comparability that does not exist — kernel is
     only ~22% of raw-nut weight. Two columns, not three, so the
     arcs stay readable.
     spec: { left:[...], right:[...], links:[{from,to,weight}] }
     ============================================================ */
  function tradeFlow(host, spec) {
    var f = frame(host, 1.5), svg = f.svg, W = f.w, H = f.h;
    if (W < 200 || H < 140) return;

    var colX = [W * 0.17, W * 0.83];
    var pad = 34;
    var nodeW = Math.min(180, W * 0.30);

    function layout(list, x) {
      var total = list.reduce(function (s, d) { return s + d.value; }, 0);
      var gap = 14;
      var avail = H - pad * 2 - (list.length - 1) * gap;
      var y = pad, out = [];
      list.forEach(function (d) {
        var h = Math.max(30, (d.value / total) * avail);
        out.push({ d: d, x: x, y: y + h / 2, h: h });
        y += h + gap;
      });
      var used = y - gap - pad;
      var shift = (H - pad * 2 - used) / 2;
      out.forEach(function (o) { o.y += shift; });
      return out;
    }

    var L = layout(spec.left, colX[0]);
    var R = layout(spec.right, colX[1]);

    var gLinks = el('g', {}, svg);
    var gNodes = el('g', {}, svg);
    var canPulse = window.CSS && CSS.supports && CSS.supports('offset-path', 'path("M0,0 L1,1")');

    (spec.links || []).forEach(function (lk, i) {
      var a = L[+lk.from.slice(1)], b = R[+lk.to.slice(1)];
      if (!a || !b) return;
      var x1 = a.x + nodeW / 2, x2 = b.x - nodeW / 2;
      var cx = (x1 + x2) / 2;
      var d = 'M' + x1 + ',' + a.y + ' C' + cx + ',' + a.y + ' ' + cx + ',' + b.y + ' ' + x2 + ',' + b.y;
      var p = el('path', { d: d, class: 'flow__arc', stroke: lk.color || C.gold,
                           'stroke-width': Math.max(3, lk.weight), fill: 'none' }, gLinks);
      var len = p.getTotalLength ? p.getTotalLength() : 600;
      p.style.strokeDasharray = len;
      reveal(p, { strokeDashoffset: len, opacity: 0 }, { strokeDashoffset: 0, opacity: .45 }, 1100, 260 + i * 80);

      if (canPulse && !REDUCE) {
        var dot = el('circle', { r: Math.max(3, lk.weight * 0.3), fill: lk.color || C.gold, class: 'flow__pulse' }, gLinks);
        dot.style.offsetPath = 'path("' + d + '")';
        dot.style.animationDelay = (i * 0.5) + 's';
        dot.style.animationDuration = (3 + (i % 3) * 0.45) + 's';
      }
    });

    function nodes(list) {
      list.forEach(function (o, i) {
        var g = el('g', { class: 'flow__node' }, gNodes);
        var h = Math.max(34, o.h), x = o.x - nodeW / 2;
        el('rect', { x: x, y: o.y - h / 2, width: nodeW, height: h, rx: 9,
                     fill: o.d.fill || C.paper, stroke: o.d.stroke || C.edge, 'stroke-width': 2 }, g);
        text(g, o.x, o.y - 3, o.d.label, '',
          { 'text-anchor': 'middle', fill: o.d.textFill || C.ink, 'font-size': 14, 'font-weight': 650 });
        text(g, o.x, o.y + 15, o.d.sub, '',
          { 'text-anchor': 'middle', fill: o.d.subFill || C.inkFaint, 'font-size': 12.5, 'font-weight': 500 });
        reveal(g, { opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }, 620, 90 + i * 80);
      });
    }
    nodes(L); nodes(R);

    /* Column headings are centred on their column, but a heading wider than
       the column would hang off the edge of the chart — clamp it back in. */
    [spec.leftTitle, spec.rightTitle].forEach(function (t, i) {
      if (!t) return;
      var tw = measure(t, FS.axis, 600, fonts().sans);
      var x = Math.max(tw / 2 + 4, Math.min(colX[i], W - tw / 2 - 4));
      var h = text(svg, x, 17, t, 'axis-label',
        { 'text-anchor': 'middle', fill: C.inkFaint, 'font-size': FS.axis });
      reveal(h, { opacity: 0 }, { opacity: 1 }, 500, 60);
    });
  }

  /* ============================================================
     5. Multi-series price lines
     spec: { x:[labels], series:[{name, values, color, dash}], unit, dp }
     ============================================================ */
  function priceLines(host, spec) {
    var f = frame(host, 2.05), svg = f.svg, W = f.w, H = f.h;
    var m = { t: 20, r: Math.max(58, W * 0.12), b: 34, l: 56 };
    var iw = W - m.l - m.r, ih = H - m.t - m.b;
    if (iw < 40 || ih < 40) return;

    var all = spec.series.reduce(function (a, s) { return a.concat(s.values.filter(function (v) { return v !== null; })); }, []);
    var maxV = niceMax(Math.max.apply(null, all) * 1.06);
    var minV = spec.zeroBased === false ? Math.max(0, Math.min.apply(null, all) * 0.9) : 0;

    var X = function (i) { return m.l + (i / (spec.x.length - 1)) * iw; };
    var Y = function (v) { return m.t + ih - ((v - minV) / (maxV - minV)) * ih; };

    var g = el('g', { class: 'grid' }, svg);
    for (var i = 0; i <= 4; i++) {
      var v = minV + ((maxV - minV) / 4) * i, y = Y(v);
      el('line', { x1: m.l, x2: W - m.r, y1: y, y2: y, stroke: C.edge }, g);
      text(g, m.l - 9, y + 4, fmt(v, spec.dp === undefined ? 0 : spec.dp), 'value-label', { 'text-anchor': 'end', fill: C.inkFaint });
    }

    spec.x.forEach(function (lab, i) {
      text(svg, X(i), H - m.b + 20, lab, 'cat-label', { 'text-anchor': 'middle', fill: C.inkSoft });
    });

    spec.series.forEach(function (s, si) {
      var d = '', started = false;
      s.values.forEach(function (v, i) {
        if (v === null || v === undefined) return;
        d += (started ? 'L' : 'M') + X(i) + ',' + Y(v);
        started = true;
      });
      var p = el('path', {
        d: d, class: 'series-line', stroke: s.color || RAMP()[si % 6], fill: 'none',
        'stroke-dasharray': s.dash ? '6 5' : null
      }, svg);
      if (!s.dash) {
        var len = p.getTotalLength ? p.getTotalLength() : 1500;
        p.style.strokeDasharray = len;
        reveal(p, { strokeDashoffset: len }, { strokeDashoffset: 0 }, 1250, 100 + si * 180);
      } else {
        reveal(p, { opacity: 0 }, { opacity: 1 }, 700, 300 + si * 180);
      }

      /* end-of-line label instead of a legend — less eye travel */
      var lastI = -1;
      s.values.forEach(function (v, i) { if (v !== null && v !== undefined) lastI = i; });
      if (lastI >= 0) {
        var dot = el('circle', { cx: X(lastI), cy: Y(s.values[lastI]), r: 5, fill: s.color || RAMP()[si % 6], stroke: C.paper, 'stroke-width': 2 }, svg);
        var lb = text(svg, X(lastI) + 10, Y(s.values[lastI]) + 4, s.name, '',
          { 'text-anchor': 'start', fill: s.color || RAMP()[si % 6], 'font-size': 11, 'font-weight': 640 });
        reveal(dot, { opacity: 0 }, { opacity: 1 }, 400, 1100 + si * 180);
        reveal(lb, { opacity: 0 }, { opacity: 1 }, 400, 1150 + si * 180);
      }
    });

    if (spec.yLabel) text(svg, 6, 12, spec.yLabel, 'axis-label', { 'text-anchor': 'start' });
  }

  /* ============================================================
     6. Stacked share bar — one horizontal bar split by origin
     spec: { parts:[{label,value,color}], unit }
     ============================================================ */
  function shareBar(host, spec) {
    var f = frame(host, 6), svg = f.svg, W = f.w, H = f.h;
    var total = spec.parts.reduce(function (s, p) { return s + p.value; }, 0);
    var x = 0, barH = Math.min(38, H * 0.5), top = (H - barH) / 2 - 6;

    spec.parts.forEach(function (p, i) {
      var w = (p.value / total) * W;
      var r = el('rect', {
        x: x, y: top, width: Math.max(1, w - 2), height: barH,
        rx: 4, fill: p.color || RAMP()[i % 6]
      }, svg);
      reveal(r, { transform: 'scaleX(0)', transformOrigin: x + 'px 0px' }, { transform: 'scaleX(1)' }, 800, 120 + i * 90);

      if (w > 52) {
        var pct = (p.value / total) * 100;
        var t = text(svg, x + w / 2, top + barH / 2 + 4.5, fmt(pct, 0) + '%', '',
          { 'text-anchor': 'middle', fill: '#fff', 'font-size': 12, 'font-weight': 680 });
        reveal(t, { opacity: 0 }, { opacity: 1 }, 400, 620 + i * 90);
      }
      if (w > 40) {
        var lb = text(svg, x + w / 2, top + barH + 17, p.label, '',
          { 'text-anchor': 'middle', fill: C.inkSoft, 'font-size': 10.5 });
        reveal(lb, { opacity: 0 }, { opacity: 1 }, 400, 700 + i * 90);
      }
      x += w;
    });
  }

  /* ============================================================
     Counter animation — big numbers count up on slide entry
     ============================================================ */
  function countUp(node) {
    var to = parseFloat(node.dataset.to);
    var dp = parseInt(node.dataset.dp || '0', 10);
    var prefix = node.dataset.prefix || '';
    var suffix = node.dataset.suffix || '';
    if (isNaN(to)) return;
    if (REDUCE) { node.textContent = prefix + fmt(to, dp) + suffix; return; }
    var dur = 1100, t0 = null;

    function step(ts) {
      if (!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / dur);
      var eased = 1 - Math.pow(1 - k, 3);
      node.textContent = prefix + fmt(to * eased, dp) + suffix;
      if (k < 1) requestAnimationFrame(step);
      else node.textContent = prefix + fmt(to, dp) + suffix;
    }
    node.textContent = prefix + fmt(0, dp) + suffix;
    requestAnimationFrame(step);
  }

  /* ============================================================
     Wire-up: redraw everything on the slide being entered
     ============================================================ */
  var REGISTRY = {
    trendLine: trendLine,
    compareBars: compareBars,
    tradeFlow: tradeFlow,
    pictogram: pictogram,
    deltaBars: deltaBars,
    priceLines: priceLines,
    shareBar: shareBar
  };

  function renderSlide(slide) {
    if (!slide) return;
    refreshPalette();

    slide.querySelectorAll('[data-chart]').forEach(function (host) {
      var kind = host.dataset.chart;
      var key = host.dataset.spec;
      var fn = REGISTRY[kind];
      var spec = window.CHARTS && window.CHARTS[key];
      if (!fn || !spec) return;
      try {
        fn(host, typeof spec === 'function' ? spec() : spec);
      } catch (err) {
        host.innerHTML = '<p class="fine">Chart unavailable.</p>';
        if (window.console) console.error('[chart:' + kind + ':' + key + ']', err);
      }
    });

    slide.querySelectorAll('[data-count]').forEach(countUp);

    /* table microbars sized from their data attribute */
    slide.querySelectorAll('.microbar[data-w]').forEach(function (b) {
      b.style.width = b.dataset.w + '%';
    });
  }

  document.addEventListener('slide:enter', function (e) { renderSlide(e.detail.slide); });

  window.Charts = Object.assign({}, REGISTRY, { render: renderSlide, palette: function () { return C; } });
})();
