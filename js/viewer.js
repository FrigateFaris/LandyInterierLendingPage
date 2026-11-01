/* Fullscreen photo viewer shared by index.html and project.html.
   Viewer.open(projectIndex, shotIndex, { link: false }) */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const pad = n => String(n).padStart(3, '0');
  const vw = $('.viewer');
  if (!vw) return;
  const img = $('.vw-stage img', vw), cap = $('.vw-cap', vw), cnt = $('.vw-count', vw), title = $('.vw-title', vw),
        thumbs = $('.vw-thumbs', vw), link = $('.vw-link', vw);
  let P = null, i = 0;

  function show(k) {
    const sh = P.shots; i = (k + sh.length) % sh.length;
    img.classList.remove('in'); void img.offsetWidth;
    img.src = sh[i].src; img.alt = `${P.name}, кадр ${i + 1}`; img.classList.add('in');
    cap.textContent = `${P.code}-${pad(i + 1)}${sh[i].ch ? ' · ' + sh[i].ch : ''}`;
    cnt.textContent = `${pad(i + 1)} / ${pad(sh.length)}`;
    [...thumbs.children].forEach((b, n) => b.classList.toggle('on', n === i));
    const on = thumbs.children[i]; if (on) on.scrollIntoView({ block: 'nearest', inline: 'center' });
  }
  function open(pi, k, opt = {}) {
    P = window.PROJECTS[pi];
    title.innerHTML = `<b>${P.name}</b><span class="mono">${P.type} · ${P.status}</span>`;
    thumbs.innerHTML = P.shots.map((s, n) => `<button type="button" data-k="${n}"><img src="${s.thumb}" alt="" loading="lazy"></button>`).join('');
    link.style.display = opt.link === false ? 'none' : '';
    link.href = `project.html?id=${P.id}`;
    show(k || 0);
    vw.classList.add('open'); vw.setAttribute('aria-hidden', 'false'); document.documentElement.classList.add('lock');
  }
  const close = () => { vw.classList.remove('open'); vw.setAttribute('aria-hidden', 'true'); document.documentElement.classList.remove('lock'); };
  $('.vw-close', vw).addEventListener('click', close);
  $('.vw-prev', vw).addEventListener('click', () => show(i - 1));
  $('.vw-next', vw).addEventListener('click', () => show(i + 1));
  thumbs.addEventListener('click', e => { const b = e.target.closest('button'); if (b) show(+b.dataset.k); });
  addEventListener('keydown', e => {
    if (!vw.classList.contains('open')) return;
    if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') show(i - 1); else if (e.key === 'ArrowRight') show(i + 1);
  });
  let tx = null;
  const stage = $('.vw-stage', vw);
  stage.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', e => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1)); tx = null; });
  window.Viewer = { open, close };
})();
