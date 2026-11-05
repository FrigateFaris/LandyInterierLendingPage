/* Vertical video cards (muted preview on hover, or one always playing with autoplay) + a fullscreen player with sound. Used by index.html and project.html.
   VideoCards.render(container, list) — list items: { src, poster, t, d } */
(function () {
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const pad = n => String(n).padStart(2, '0');

  /* ---------- player ---------- */
  const modal = document.createElement('div');
  modal.className = 'vmodal'; modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = `<div class="vm-top"><span class="mono vm-cap"></span><button class="vm-close mono" type="button">Закрыть ✕</button></div>
    <div class="vm-stage"><video controls playsinline preload="metadata"></video></div>`;
  document.body.appendChild(modal);
  const mv = modal.querySelector('video'), cap = modal.querySelector('.vm-cap');
  function open(v) {
    mv.poster = v.poster; mv.src = v.src; cap.textContent = `${v.t} — ${v.d}`;
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); document.documentElement.classList.add('lock');
    mv.muted = false; const p = mv.play(); if (p) p.catch(() => {});
  }
  function close() {
    mv.pause(); mv.removeAttribute('src'); mv.load();
    modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); document.documentElement.classList.remove('lock');
  }
  modal.querySelector('.vm-close').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal || e.target.classList.contains('vm-stage')) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });

  /* ---------- cards ---------- */
  // opts.autoplay: one card always plays muted while the row is on screen (the first by default, then the last hovered)
  function render(box, list, opts = {}) {
    const cards = [];
    let cur = 0, visible = false;
    const start = k => {
      cur = k;
      cards.forEach((c, j) => {
        if (j === k && (visible || !opts.autoplay)) { if (!c.vid.src) c.vid.src = c.v.src; c.b.classList.add('live'); const p = c.vid.play(); if (p) p.catch(() => {}); }
        else { c.b.classList.remove('live'); c.vid.pause(); }
      });
    };
    list.forEach((v, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'rl';
      b.innerHTML = `<span class="rl-media"><img src="${v.poster}" alt="${v.t}" loading="lazy"><video muted loop playsinline preload="none"></video>
          <i class="rl-play" aria-hidden="true"></i></span>
        <span class="mono rl-k">${pad(i + 1)} · ${v.t}</span><span class="rl-d">${v.d}</span>`;
      const vid = b.querySelector('video');
      cards.push({ b, vid, v });
      if (fine) {
        b.addEventListener('mouseenter', () => start(i));
        if (!opts.autoplay) b.addEventListener('mouseleave', () => { b.classList.remove('live'); vid.pause(); });
      }
      b.addEventListener('click', () => { vid.pause(); open(v); });
      box.appendChild(b);
    });
    if (opts.autoplay && 'IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(cur); }, { threshold: 0.25 }).observe(box);
      modal.addEventListener('transitionend', () => { if (!modal.classList.contains('open')) start(cur); });
    }
  }
  window.VideoCards = { render, open, close };
})();
