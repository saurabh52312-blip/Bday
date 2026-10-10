(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };
  var rnd = function (a, b) { return a + Math.random() * (b - a); };

  var welcome = $('welcome'), site = $('site'), openBtn = $('openBtn'), envBtn = $('envBtn');
  var audio = $('bgm'), musicBtn = $('musicBtn'), musicNote = $('musicNote'), musicIcon = $('musicIcon');
  var canvas = $('fx'), ctx = canvas.getContext('2d');

  /* ---------- Starry backgrounds ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-stars]'), function (box) {
    var n = parseInt(box.getAttribute('data-stars'), 10) || 20;
    for (var i = 0; i < n; i++) {
      var s = document.createElement('span');
      s.className = 'star';
      var size = rnd(2, 5);
      s.style.width = s.style.height = size + 'px';
      s.style.left = rnd(0, 100) + '%';
      s.style.top = rnd(0, 100) + '%';
      s.style.animationDelay = (-rnd(0, 3)) + 's';
      s.style.animationDuration = rnd(2, 5) + 's';
      box.appendChild(s);
    }
  });

  /* ---------- Hearts + petals ---------- */
  var symbols = ['💗', '💖', '💕', '🌸', '✨', '🌹'];
  (function buildFloaters() {
    if (reduceMotion) return;
    var box = $('floaters'), count = window.innerWidth < 600 ? 9 : 16, i;
    for (i = 0; i < count; i++) {
      var s = document.createElement('span');
      s.className = 'floater';
      s.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      s.style.left = rnd(0, 100) + '%';
      s.style.fontSize = rnd(14, 34) + 'px';
      s.style.animationDuration = rnd(9, 21) + 's';
      s.style.animationDelay = (-rnd(0, 15)) + 's';
      s.style.setProperty('--drift', rnd(-40, 40) + 'px');
      box.appendChild(s);
    }
    var pbox = $('petals'), pc = window.innerWidth < 600 ? 10 : 20;
    for (i = 0; i < pc; i++) {
      var p = document.createElement('span');
      p.className = 'petal';
      p.style.left = rnd(0, 100) + '%';
      p.style.width = rnd(9, 18) + 'px';
      p.style.height = rnd(12, 22) + 'px';
      p.style.animationDuration = rnd(9, 18) + 's';
      p.style.animationDelay = (-rnd(0, 16)) + 's';
      p.style.setProperty('--sway', rnd(20, 110) + 'px');
      pbox.appendChild(p);
    }
  })();

  /* ---------- Fairy lights ---------- */
  (function () {
    var box = $('lights'), n = window.innerWidth < 600 ? 14 : 28;
    for (var i = 0; i < n; i++) {
      var b = document.createElement('span');
      b.className = 'bulb';
      var t = i / (n - 1);
      b.style.left = (t * 100) + '%';
      b.style.top = (Math.sin(t * Math.PI) * 26 + 4) + 'px';
      b.style.animationDelay = (-rnd(0, 3)) + 's';
      box.appendChild(b);
    }
  })();

  /* ---------- Canvas: hearts, confetti, fireworks ---------- */
  var particles = [], running = false;
  function resize() {
    var dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  var confettiColors = ['#ff7aa8', '#ffc2d6', '#d63a73', '#fff', '#f6d9a8', '#f9a8d4'];

  function burst(type, amount, ox, oy) {
    if (reduceMotion) amount = Math.min(amount, 8);
    for (var i = 0; i < amount; i++) {
      var a = Math.random() * Math.PI * 2, sp = rnd(2, 8);
      particles.push({
        type: type,
        x: ox == null ? window.innerWidth / 2 : ox,
        y: oy == null ? window.innerHeight * 0.55 : oy,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - (type === 'heart' ? 3 : 5),
        g: type === 'heart' ? -0.02 : 0.16,
        size: type === 'heart' ? rnd(16, 34) : rnd(6, 12),
        rot: Math.random() * 6, vr: rnd(-.15, .15),
        life: 1, decay: type === 'heart' ? 0.006 : 0.008,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)]
      });
    }
    start();
  }

  function firework(x, y) {
    var hue = [330, 345, 40, 350, 20][Math.floor(Math.random() * 5)];
    var n = reduceMotion ? 10 : 46;
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2, sp = rnd(2, 6.5);
      particles.push({
        type: 'spark', x: x, y: y, px: x, py: y,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 0.05,
        size: 2.2, life: 1, decay: rnd(.012, .02),
        color: 'hsl(' + (hue + rnd(-10, 10)) + ',95%,' + rnd(62, 80) + '%)'
      });
    }
    start();
  }

  function start() { if (!running) { running = true; requestAnimationFrame(tick); } }

  function tick() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.px = p.x; p.py = p.y;
      p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= (p.type === 'spark' ? 0.985 : 0.99);
      p.rot += p.vr || 0; p.life -= p.decay;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = Math.max(p.life, 0);
      if (p.type === 'spark') {
        ctx.strokeStyle = p.color; ctx.lineWidth = p.size; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(p.x, p.y); ctx.stroke();
      } else {
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        if (p.type === 'heart') {
          ctx.font = p.size + 'px serif'; ctx.textAlign = 'center'; ctx.fillText('💗', 0, 0);
        } else {
          ctx.fillStyle = p.color; ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
      }
      ctx.restore();
    }
    if (particles.length) requestAnimationFrame(tick);
    else { running = false; ctx.clearRect(0, 0, window.innerWidth, window.innerHeight); }
  }

  /* ---------- Music ---------- */
  var musicOk = true, noteTimer;
  function note(text) {
    musicNote.textContent = text;
    musicNote.classList.add('show');
    clearTimeout(noteTimer);
    noteTimer = setTimeout(function () { musicNote.classList.remove('show'); }, 3500);
  }
  function setMusicUI(playing) {
    musicBtn.classList.toggle('playing', playing);
    musicBtn.classList.toggle('paused', !playing);
    musicBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
    musicBtn.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
    musicIcon.textContent = playing ? '🎵' : '🔇';
  }
  audio.addEventListener('error', function () { musicOk = false; setMusicUI(false); });
  function startMusic() {
    audio.volume = 0.6;
    var p = audio.play();
    if (p && p.then) {
      p.then(function () { setMusicUI(true); }).catch(function () {
        setMusicUI(false);
        note(musicOk ? 'Tap the music button to play 🎶' : 'Music file not found');
      });
    }
  }
  musicBtn.addEventListener('click', function () {
    if (!musicOk) { note('Music file not found (assets/birthday-song.mp3)'); return; }
    if (audio.paused) {
      audio.play().then(function () { setMusicUI(true); }).catch(function () { note('Could not play the music'); });
    } else { audio.pause(); setMusicUI(false); }
  });

  /* ---------- Scroll reveal + progress ---------- */
  function setupReveal() {
    var els = document.querySelectorAll('.reveal,.reveal-left,.reveal-right');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(els, function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    Array.prototype.forEach.call(els, function (el, i) {
      el.style.transitionDelay = ((i % 3) * 0.1) + 's';
      io.observe(el);
    });
  }
  var bar = $('progress');
  window.addEventListener('scroll', function () {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
  }, { passive: true });

  /* ---------- Typewriter ---------- */
  function typeIt() {
    var el = $('typed'), text = el.getAttribute('data-text'), i = 0;
    if (reduceMotion) { el.textContent = text; el.classList.add('done'); return; }
    (function step() {
      el.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(step, 55);
      else el.classList.add('done');
    })();
  }

  /* ---------- Open surprise ---------- */
  var opened = false;
  function openSurprise() {
    if (opened) return;
    opened = true;
    startMusic();
    envBtn.classList.add('open');
    var delay = reduceMotion ? 0 : 1200;
    setTimeout(function () {
      musicBtn.classList.remove('hidden');
      welcome.classList.add('leaving');
      site.classList.remove('hidden');
      document.body.classList.remove('locked');
      window.scrollTo(0, 0);
      setupReveal();
      burst('heart', 26);
      setTimeout(function () { burst('confetti', 80, window.innerWidth / 2, window.innerHeight * 0.3); }, 500);
      setTimeout(function () { typeIt(); }, 900);
      setTimeout(function () { welcome.style.display = 'none'; }, 1100);
      var h = site.querySelector('.hero h2');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    }, delay);
  }
  openBtn.addEventListener('click', openSurprise);
  envBtn.addEventListener('click', openSurprise);

  $('toGallery').addEventListener('click', function (e) {
    e.preventDefault();
    $('gallery').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ---------- Hero tilt (mouse devices) ---------- */
  var tilt = $('tilt');
  if (window.matchMedia('(hover:hover) and (pointer:fine)').matches && !reduceMotion) {
    tilt.parentNode.addEventListener('mousemove', function (e) {
      var r = tilt.getBoundingClientRect();
      var x = (e.clientX - (r.left + r.width / 2)) / r.width;
      var y = (e.clientY - (r.top + r.height / 2)) / r.height;
      tilt.style.animation = 'none';
      tilt.style.transform = 'rotateY(' + (x * 14) + 'deg) rotateX(' + (-y * 14) + 'deg)';
    });
    tilt.parentNode.addEventListener('mouseleave', function () {
      tilt.style.transform = '';
      tilt.style.animation = '';
    });
    /* sparkle cursor trail */
    var last = 0;
    window.addEventListener('mousemove', function (e) {
      var now = Date.now();
      if (now - last < 70) return;
      last = now;
      var s = document.createElement('span');
      s.className = 'spark';
      s.textContent = ['✨', '💗', '✦'][Math.floor(Math.random() * 3)];
      s.style.left = e.clientX + 'px';
      s.style.top = e.clientY + 'px';
      document.body.appendChild(s);
      setTimeout(function () { s.remove(); }, 900);
    });
  }

  /* ---------- Lightbox ---------- */
  var items = Array.prototype.slice.call(document.querySelectorAll('.photo-btn'));
  var lb = $('lightbox'), lbImg = $('lbImg'), lbCap = $('lbCap');
  var current = 0, lastFocus = null;

  function show(i) {
    current = (i + items.length) % items.length;
    var img = items[current].querySelector('img');
    var cap = items[current].closest('.chapter').querySelector('.ch-cap');
    lbImg.src = img.getAttribute('src');
    lbImg.alt = img.alt;
    lbCap.textContent = cap ? cap.textContent : '';
  }
  function openLB(i, btn) {
    lastFocus = btn; show(i); lb.hidden = false;
    document.body.classList.add('locked'); $('lbClose').focus();
  }
  function closeLB() {
    lb.hidden = true; document.body.classList.remove('locked');
    if (lastFocus) lastFocus.focus();
  }
  items.forEach(function (btn, i) {
    btn.addEventListener('click', function () {
      var r = btn.getBoundingClientRect();
      burst('heart', 5, r.left + r.width / 2, r.top + r.height / 2);
      openLB(i, btn);
    });
    var img = btn.querySelector('img');
    img.addEventListener('error', function () {
      img.style.visibility = 'hidden'; img.style.minHeight = '240px';
      btn.style.background = 'linear-gradient(135deg,#ffe3ec,#ffc2d6)';
    });
  });
  $('lbClose').addEventListener('click', closeLB);
  $('lbPrev').addEventListener('click', function () { show(current - 1); });
  $('lbNext').addEventListener('click', function () { show(current + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLB(); });

  /* ---------- Gift overlay ---------- */
  var gift = $('giftOverlay'), giftTimer = null;
  function openGift() {
    gift.hidden = false;
    document.body.classList.add('locked');
    $('giftClose').focus();
    var w = window.innerWidth, h = window.innerHeight;
    function pop() { firework(rnd(w * .15, w * .85), rnd(h * .12, h * .5)); }
    pop(); setTimeout(pop, 250); setTimeout(pop, 500);
    burst('confetti', 90, w / 2, h * 0.35);
    if (!reduceMotion) giftTimer = setInterval(pop, 700);
  }
  function closeGift() {
    gift.hidden = true; clearInterval(giftTimer);
    document.body.classList.remove('locked');
    $('giftBtn').focus();
  }
  $('giftBtn').addEventListener('click', openGift);
  $('giftClose').addEventListener('click', closeGift);
  gift.addEventListener('click', function (e) { if (e.target === gift) closeGift(); });

  document.addEventListener('keydown', function (e) {
    if (!gift.hidden) {
      if (e.key === 'Escape') closeGift();
      return;
    }
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLB();
    else if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'ArrowRight') show(current + 1);
    else if (e.key === 'Tab') {
      var f = lb.querySelectorAll('button'), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  var sx = null;
  lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    sx = null;
  });

  /* ---------- Wish cake ---------- */
  var wishes = [
    '💗 Wish made. I hope it comes true, Shivani.',
    '🌸 May this year bring you lots of happiness.',
    '✨ Whatever you wished for, you deserve it.'
  ];
  var cake = $('candleBtn'), stage = cake.parentNode, wishMsg = $('wishMsg'), wi = 0;
  cake.addEventListener('click', function () {
    if (!cake.classList.contains('out')) {
      cake.classList.add('out'); stage.classList.add('out');
      wishMsg.textContent = wishes[wi++ % wishes.length];
      var r = cake.getBoundingClientRect();
      burst('confetti', 60, r.left + r.width / 2, r.top);
      burst('heart', 12, r.left + r.width / 2, r.top);
    } else {
      cake.classList.remove('out'); stage.classList.remove('out');
      wishMsg.textContent = '🕯️ Tap the candle to make another wish';
    }
  });

  /* ---------- Celebrate again ---------- */
  $('replayBtn').addEventListener('click', function () {
    burst('confetti', 90, window.innerWidth / 2, window.innerHeight * 0.4);
    burst('heart', 24);
    firework(window.innerWidth * .3, window.innerHeight * .3);
    firework(window.innerWidth * .7, window.innerHeight * .35);
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
})();
