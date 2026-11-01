/* Scroll-scrubbed walk hero.
   The clip is played as an image sequence on a canvas: every scroll position draws two neighbouring
   frames blended by the fractional index, so motion stays fluid at any scroll speed (no video seeking).
   Room titles are driven by video time (CFG.scenes). */
(function () {
  const CFG = window.HERO;
  const walk = document.querySelector('.walk');
  const canvas = document.querySelector('.walk-canvas');
  const ctx = canvas.getContext('2d');
  const layer = document.querySelector('.spots');
  const intro = document.querySelector('.intro');
  const hint = document.querySelector('.hint');
  const outro = document.querySelector('.outro');
  const chapter = document.querySelector('.chapter');
  const chNum = chapter.querySelector('.ch-num');
  const chName = chapter.querySelector('.ch-name');
  const bar = document.querySelector('.rail-fill');
  const ticks = document.querySelector('.rail-ticks');
  const loader = document.querySelector('.loader');

  const DUR = CFG.duration;                       // seconds of video
  const TOTAL = DUR + (CFG.tail || 0.9);           // extra scroll after the last frame for the outro
  walk.style.height = `calc(${TOTAL * CFG.vhPerSecond}vh + 100vh)`;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const pad = n => String(n).padStart(2, '0');

  /* ---------- pacing: like the reference, the camera almost stops at every detail and
     hurries through doorways and turns. Scroll cost per video second = base + bumps at stops. ---------- */
  const PACE = CFG.pace || { base: 0.35, stops: [] };
  const STEPS = 2000, cum = new Float32Array(STEPS + 1);
  for (let i = 1; i <= STEPS; i++) {
    const t = (i - 0.5) / STEPS * DUR;
    let w = PACE.base;
    PACE.stops.forEach(([c, amp, sig]) => { w += amp * Math.exp(-0.5 * ((t - c) / sig) ** 2); });
    cum[i] = cum[i - 1] + w;
  }
  for (let i = 1; i <= STEPS; i++) cum[i] /= cum[STEPS];
  // scroll-time (0..DUR, linear in scroll) <-> video time
  function toVideo(st) {
    const v = clamp(st / DUR, 0, 1);
    let lo = 0, hi = STEPS;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] < v) lo = m; else hi = m; }
    const k = (v - cum[lo]) / ((cum[hi] - cum[lo]) || 1);
    return (lo + k) / STEPS * DUR;
  }
  function fromVideo(t) {
    const x = clamp(t / DUR, 0, 1) * STEPS, i = Math.floor(x), j = Math.min(i + 1, STEPS);
    return (cum[i] + (cum[j] - cum[i]) * (x - i)) * DUR;
  }

  /* ---------- frames: coarse pass first (every 16th), then refined, so the walk is usable at once ---------- */
  const SEQ = (innerWidth < 900 && CFG.framesMobile) || CFG.frames;
  const N = SEQ.count;
  const imgs = new Array(N), ok = new Uint8Array(N);
  let shown = false, dirty = true, curIdx = 0;
  const t0 = performance.now();
  const show = () => {
    if (shown) return; shown = true;
    if (loader) loader.style.setProperty('--p', 1);
    // let the sign finish drawing before the curtain lifts
    setTimeout(() => document.documentElement.classList.add('ready'), Math.max(0, 2100 - (performance.now() - t0)));
    if (loader) setTimeout(() => loader.remove(), Math.max(0, 2100 - (performance.now() - t0)) + 1500);
    dirty = true;
  };
  const order = [], seen = new Uint8Array(N);
  [16, 8, 4, 2, 1].forEach(step => { for (let i = 0; i < N; i += step) if (!seen[i]) { seen[i] = 1; order.push(i); } });
  if (!seen[N - 1]) order.splice(1, 0, N - 1);
  let firstPass = Math.ceil(N / 16), inFlight = 0, next = 0;
  const firstTotal = firstPass;
  function pump() {
    while (inFlight < 8 && next < order.length) {
      const i = order[next++], im = new Image();
      inFlight++;
      im.decoding = 'async';
      im.onload = () => {
        // decode() is only a hint (some engines never settle it), so it is not awaited
        if (im.decode) im.decode().catch(() => {});
        ok[i] = 1; inFlight--;
        if (loader) loader.style.setProperty('--p', Math.min(1, (firstTotal - firstPass + 1) / firstTotal).toFixed(3));
        if (--firstPass <= 0) show();
        if (Math.abs(i - curIdx) < 20) dirty = true;
        pump();
      };
      im.onerror = () => { inFlight--; pump(); };
      im.src = SEQ.dir + 'f' + String(i + 1).padStart(4, '0') + '.jpg';
      imgs[i] = im;
    }
  }
  pump();
  setTimeout(show, 5000);   // never keep the page behind the loader
  function nearest(i) {     // closest frame already in memory
    for (let d = 0; d < N; d++) {
      if (i - d >= 0 && ok[i - d]) return i - d;
      if (i + d < N && ok[i + d]) return i + d;
    }
    return -1;
  }

  /* ---------- scene titles: on arrival in each zone a big room title appears at the side
     (sides alternate), then leaves before the next zone; every line is scrubbed by scroll ---------- */
  const scenes = (CFG.scenes || []).map((sc, i, all) => {
    const el = document.createElement('div');
    el.className = 'scene ' + (sc.side || 'left');
    el.innerHTML = `<span class="m"><span>${pad(i + 1)} / ${pad(all.length)} — ${sc.eyebrow}</span></span>` +
      `<h3>${sc.title.split('\n').map(l => `<span class="m"><span>${l}</span></span>`).join('')}</h3>` +
      `<span class="m sub"><span>${sc.sub}</span></span>`;
    layer.appendChild(el);
    return Object.assign({ el, lines: [...el.querySelectorAll('.m > span')] }, sc);
  });
  const shadeL = document.querySelector('.side-shade.l'), shadeR = document.querySelector('.side-shade.r');

  /* ---------- chapters ---------- */
  CFG.chapters.forEach((c, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.dataset.label = c.name; b.setAttribute('aria-label', c.name);
    b.style.left = (fromVideo(c.t) / TOTAL * 100) + '%';
    b.addEventListener('click', () => scrollToTime(c.t + 0.05));
    ticks.appendChild(b);
  });
  let activeCh = -1;
  function setChapter(i) {
    if (i === activeCh) return;
    activeCh = i;
    chapter.classList.remove('in'); void chapter.offsetWidth;
    chNum.textContent = `${pad(i + 1)} / ${pad(CFG.chapters.length)}`;
    chName.textContent = CFG.chapters[i].name;
    chapter.classList.add('in');
    [...ticks.children].forEach((b, k) => b.classList.toggle('on', k <= i));
  }

  /* ---------- drawing ---------- */
  let vw = innerWidth, vh = innerHeight, dpr = 1;
  function resize() {
    vw = innerWidth; vh = innerHeight; dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr);
    dirty = true;
  }
  resize();
  // the two frames around a fractional index, ready to blend
  function pair(fi) {
    const a = Math.floor(fi), b = Math.min(a + 1, N - 1), k = fi - a;
    if (ok[a] && ok[b]) return [imgs[a], imgs[b], k];
    const n = nearest(Math.round(fi));
    return n < 0 ? null : [imgs[n], null, 0];
  }
  function blit(c, p, sx, sy, sw, sh, dw, dh) {
    c.globalAlpha = 1; c.drawImage(p[0], sx, sy, sw, sh, 0, 0, dw, dh);
    if (p[1] && p[2] > 0.02) { c.globalAlpha = p[2]; c.drawImage(p[1], sx, sy, sw, sh, 0, 0, dw, dh); c.globalAlpha = 1; }
  }

  /* ---------- render ---------- */
  function render(st) {
    const t = st < DUR ? toVideo(st) : st;     // st = linear scroll time, t = video time
    const fi = clamp(Math.min(t, DUR) / DUR, 0, 1) * (N - 1);
    curIdx = Math.round(fi);
    const p = pair(fi);
    if (p) {
      const IW = p[0].naturalWidth, IH = p[0].naturalHeight;
      const cs = Math.max(canvas.width / IW, canvas.height / IH);   // cover
      const sw = canvas.width / cs, sh = canvas.height / cs;
      blit(ctx, p, (IW - sw) / 2, (IH - sh) / 2, sw, sh, canvas.width, canvas.height);
    }

    const ease = x => 1 - Math.pow(1 - clamp(x, 0, 1), 3);
    let sl = 0, sr = 0;   // side shades follow the visible title
    scenes.forEach(sc => {
      const [a, b] = sc.t;
      const inP = clamp((t - a) / 0.32, 0, 1), outP = clamp((t - (b - 0.24)) / 0.24, 0, 1);
      if (inP <= 0 || outP >= 1) { sc.el.style.visibility = 'hidden'; return; }
      sc.el.style.visibility = 'visible';
      // lines rise out of their masks one after another; on the way out they drift up and fade
      sc.lines.forEach((ln, k) => {
        const e = ease((inP - k * 0.1) / 0.6), o = ease((outP - k * 0.06) / 0.7);
        ln.style.transform = `translate3d(0,${((1 - e) * 110 - o * 30).toFixed(1)}%,0)`;
        ln.style.opacity = (1 - o).toFixed(3);
      });
      const vis = sstep(0, 0.6, inP) * (1 - sstep(0.2, 1, outP));
      if (sc.side === 'right') sr = Math.max(sr, vis); else sl = Math.max(sl, vis);
    });
    shadeL.style.opacity = sl.toFixed(3);
    shadeR.style.opacity = sr.toFixed(3);

    // chapters / text layers
    let ci = 0; CFG.chapters.forEach((c, i) => { if (t >= c.t) ci = i; });
    setChapter(ci);
    const introOut = sstep(0.05, 0.9, t);
    intro.style.opacity = (1 - introOut).toFixed(3);
    intro.style.transform = `translate3d(0,${(-introOut * 60).toFixed(1)}px,0)`;
    intro.style.visibility = introOut >= 1 ? 'hidden' : 'visible';
    hint.style.opacity = (1 - sstep(0.02, 0.3, t)).toFixed(3);
    const outIn = sstep(DUR + 0.2, DUR + 0.75, t);
    outro.style.opacity = outIn.toFixed(3);
    outro.style.transform = `translate3d(0,${((1 - outIn) * 40).toFixed(1)}px,0)`;
    outro.style.visibility = outIn > 0 ? 'visible' : 'hidden';
    document.documentElement.classList.toggle('at-end', outIn > 0.5);
    chapter.parentElement.style.opacity = (sstep(0.5, 1.0, t) * (1 - outIn)).toFixed(3);
    bar.style.transform = `scaleX(${(st / TOTAL).toFixed(4)})`;
  }

  /* ---------- smooth scroll -> time ---------- */
  function readT() {
    const top = walk.getBoundingClientRect().top + scrollY;
    return clamp((scrollY - top) / (walk.offsetHeight - vh), 0, 1) * TOTAL;
  }
  function scrollToTime(t) {
    const top = walk.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top + fromVideo(t) / TOTAL * (walk.offsetHeight - vh), behavior: 'smooth' });
  }
  let cur = readT(), target = cur, last = performance.now();
  addEventListener('scroll', () => { target = readT(); }, { passive: true });
  addEventListener('resize', () => { resize(); target = readT(); });
  const DAMP = CFG.damping || 4.5;
  (function tick(now) {
    const dt = Math.min(0.066, (now - last) / 1000); last = now;
    const prev = cur;
    cur += (target - cur) * (1 - Math.exp(-dt * DAMP));
    if (Math.abs(target - cur) < 0.0005) cur = target;
    if (dirty || cur !== prev) { render(cur); dirty = false; }
    requestAnimationFrame(tick);
  })(last);

  window.__hero = { render, toVideo, fromVideo, get t() { return cur; }, loaded: () => ok.reduce((a, b) => a + b, 0) };
})();
