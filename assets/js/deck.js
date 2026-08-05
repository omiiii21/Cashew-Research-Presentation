/* ============================================================
   Deck engine — navigation, presenter timer, speaker notes.
   No dependencies. Charts hook in via the 'slide:enter' event.
   ============================================================ */
(function () {
  'use strict';

  var deck     = document.getElementById('deck');
  var slides   = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var bar      = document.getElementById('progressBar');
  var curEl    = document.getElementById('counterCur');
  var totEl    = document.getElementById('counterTot');
  var prevBtn  = document.getElementById('prevBtn');
  var nextBtn  = document.getElementById('nextBtn');
  var dotsWrap = document.getElementById('dots');
  var notesEl  = document.getElementById('notes');
  var notesBody= document.getElementById('notesBody');
  var helpEl   = document.getElementById('help');
  var timerEl  = document.getElementById('timer');
  var timerTxt = document.getElementById('timerText');

  var index = 0;
  var TOTAL = slides.length;
  var TALK_SECONDS = 10 * 60; /* 10-minute slot */

  /* ---------- build dots ---------- */
  slides.forEach(function (s, i) {
    var b = document.createElement('button');
    b.className = 'dot-btn';
    b.type = 'button';
    b.setAttribute('aria-label', 'Go to slide ' + (i + 1) + (s.dataset.title ? ': ' + s.dataset.title : ''));
    b.addEventListener('click', function () { go(i); });
    dotsWrap.appendChild(b);
  });
  var dots = Array.prototype.slice.call(dotsWrap.children);

  totEl.textContent = String(TOTAL).padStart(2, '0');

  /* ---------- navigation ---------- */
  function go(next, dir) {
    next = Math.max(0, Math.min(TOTAL - 1, next));
    if (next === index && slides[index].classList.contains('is-active')) return;

    var prev = slides[index];
    if (prev && next !== index) {
      prev.classList.remove('is-active');
      prev.classList.add('is-leaving');
      setTimeout(function () { prev.classList.remove('is-leaving'); }, 540);
    }

    index = next;
    var cur = slides[index];

    /* Restart entrance animations by forcing a reflow */
    cur.querySelectorAll('[data-anim]').forEach(function (el) {
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = '';
    });

    cur.classList.add('is-active');
    cur.scrollTop = 0;

    update();
    document.dispatchEvent(new CustomEvent('slide:enter', { detail: { index: index, slide: cur } }));

    if (history.replaceState) history.replaceState(null, '', '#' + (index + 1));
  }

  function next() { go(index + 1); }
  function prev() { go(index - 1); }

  function update() {
    bar.style.width = (TOTAL > 1 ? (index / (TOTAL - 1)) * 100 : 100) + '%';
    curEl.textContent = String(index + 1).padStart(2, '0');
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === TOTAL - 1;
    dots.forEach(function (d, i) { d.classList.toggle('is-active', i === index); });

    var raw = slides[index].dataset.notes;
    if (raw) {
      notesBody.innerHTML = raw.split('|').map(function (p) { return '<p>' + p.trim() + '</p>'; }).join('');
    } else {
      notesBody.innerHTML = '<p>No notes for this slide.</p>';
    }
  }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  /* ---------- keyboard ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var k = e.key;

    if (helpEl.classList.contains('is-open') && (k === 'Escape' || k === '?' || k === '/')) {
      helpEl.classList.remove('is-open');
      e.preventDefault();
      return;
    }

    switch (k) {
      case 'ArrowRight': case 'ArrowDown': case ' ': case 'PageDown':
        next(); e.preventDefault(); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp':
        prev(); e.preventDefault(); break;
      case 'Home':
        go(0); e.preventDefault(); break;
      case 'End':
        go(TOTAL - 1); e.preventDefault(); break;
      case 'f': case 'F':
        toggleFullscreen(); e.preventDefault(); break;
      case 'n': case 'N': case 's': case 'S':
        notesEl.classList.toggle('is-open'); e.preventDefault(); break;
      case 't': case 'T':
        toggleTimer(); e.preventDefault(); break;
      case 'r': case 'R':
        resetTimer(); e.preventDefault(); break;
      case '?': case '/':
        helpEl.classList.toggle('is-open'); e.preventDefault(); break;
      case 'Escape':
        notesEl.classList.remove('is-open'); break;
      default:
        if (/^[0-9]$/.test(k)) {
          var n = k === '0' ? 9 : parseInt(k, 10) - 1;
          if (n < TOTAL) { go(n); e.preventDefault(); }
        }
    }
  });

  /* ---------- click zones (edges only, so charts stay interactive) ---------- */
  deck.addEventListener('click', function (e) {
    if (e.target.closest('a, button, input, .card-img, table')) return;
    var x = e.clientX / window.innerWidth;
    if (x > 0.88) next();
    else if (x < 0.12) prev();
  });

  /* ---------- touch ---------- */
  var tx = 0, ty = 0, ts = 0;
  deck.addEventListener('touchstart', function (e) {
    tx = e.changedTouches[0].clientX;
    ty = e.changedTouches[0].clientY;
    ts = e.timeStamp;
  }, { passive: true });

  deck.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - tx;
    var dy = e.changedTouches[0].clientY - ty;
    if (e.timeStamp - ts > 700) return;
    if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
    if (dx < 0) next(); else prev();
  }, { passive: true });

  /* ---------- fullscreen ---------- */
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      (document.documentElement.requestFullscreen || function () {}).call(document.documentElement);
    } else {
      (document.exitFullscreen || function () {}).call(document);
    }
  }
  var fsBtn = document.getElementById('fsBtn');
  if (fsBtn) fsBtn.addEventListener('click', toggleFullscreen);

  var helpBtn = document.getElementById('helpBtn');
  if (helpBtn) helpBtn.addEventListener('click', function () { helpEl.classList.toggle('is-open'); });
  helpEl.addEventListener('click', function (e) { if (e.target === helpEl) helpEl.classList.remove('is-open'); });

  /* ---------- presenter timer ----------
     Counts up against a 10-minute slot; turns red when over.        */
  var timerOn = false, timerRunning = false, elapsed = 0, tick = null;

  function fmt(s) {
    var m = Math.floor(Math.abs(s) / 60), r = Math.abs(s) % 60;
    return (s < 0 ? '-' : '') + m + ':' + String(r).padStart(2, '0');
  }

  function paintTimer() {
    var left = TALK_SECONDS - elapsed;
    timerTxt.textContent = fmt(left);
    timerEl.classList.toggle('is-over', left < 0);
    timerEl.classList.toggle('is-paused', !timerRunning);
  }

  function toggleTimer() {
    if (!timerOn) {
      timerOn = true; timerRunning = true;
      timerEl.classList.add('is-on');
      tick = setInterval(function () { elapsed++; paintTimer(); }, 1000);
    } else if (timerRunning) {
      timerRunning = false; clearInterval(tick); tick = null;
    } else {
      timerRunning = true;
      tick = setInterval(function () { elapsed++; paintTimer(); }, 1000);
    }
    paintTimer();
  }

  function resetTimer() {
    elapsed = 0;
    paintTimer();
  }

  var timerBtn = document.getElementById('timerBtn');
  if (timerBtn) timerBtn.addEventListener('click', toggleTimer);
  paintTimer();

  /* ---------- redraw charts on resize ---------- */
  var rt = null;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      document.dispatchEvent(new CustomEvent('slide:enter', { detail: { index: index, slide: slides[index] } }));
    }, 180);
  });

  /* ---------- boot ---------- */
  var start = parseInt((location.hash || '').replace('#', ''), 10);
  go(isFinite(start) && start >= 1 && start <= TOTAL ? start - 1 : 0);

  window.Deck = { go: go, next: next, prev: prev, current: function () { return index; } };
})();
