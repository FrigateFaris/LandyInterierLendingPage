/* project.html?id=<project>: title, spec table, every photo in an editorial rhythm, next project. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const pad = (n, l = 2) => String(n).padStart(l, '0');
  const PJ = window.PROJECTS;
  const id = new URLSearchParams(location.search).get('id');
  const pi = Math.max(0, PJ.findIndex(p => p.id === id));
  const P = PJ[pi], next = PJ[(pi + 1) % PJ.length];
  document.title = `${P.name} — Landy Interior`;

  /* ---------- head ---------- */
  $('.pj-pos').textContent = P.type;
  $('.pj-title').innerHTML = P.name.split(' ').map(w => `<span class="ln"><span>${w}</span></span>`).join(' ');
  const chapters = [...new Set(P.shots.map(s => s.ch).filter(Boolean))];
  $('.pj-table').innerHTML = [['Тип', P.type], ['Статус', P.status], ['Помещения', P.rooms.join(', ')]]
    .map(([k, v]) => `<div><dt class="mono">${k}</dt><dd>${v}</dd></div>`).join('');
  $('.pj-lead').textContent = P.lead;
  const cover = P.shots.find(s => s.f === P.cover) || P.shots[0];
  $('.pj-cover img').src = cover.src; $('.pj-cover img').alt = P.name;

  /* ---------- chapters (hotel) ---------- */
  const chNav = $('.pj-chapters');
  if (chapters.length > 1) chNav.innerHTML = chapters.map((c, i) => `<a href="#ch-${i}">${c}</a>`).join('');
  else chNav.remove();

  /* ---------- gallery: landscape = full row, portraits in pairs/trios with alternating weights ---------- */
  const gal = $('.pj-gallery');
  const fig = (s, cls) => `<figure class="ph ${cls}" data-k="${P.shots.indexOf(s)}"><div class="ph-in"><img src="${s.src}" alt="${P.name}, кадр ${P.shots.indexOf(s) + 1}" loading="lazy" width="${s.w}" height="${s.h}"></div>
    ${s.ch ? `<figcaption class="mono"><span>${s.ch}</span></figcaption>` : ''}</figure>`;
  let html = '', row = 0;
  const groups = chapters.length > 1 ? chapters.map(c => [c, P.shots.filter(s => s.ch === c)]) : [['', P.shots]];
  groups.forEach(([c, shots], gi) => {
    if (c) html += `<h2 class="ph-ch" id="ch-${gi}">${c}</h2>`;
    const queue = shots.slice();
    while (queue.length) {
      const s = queue[0];
      if (s.w > s.h) { html += `<div class="ph-row r-wide">${fig(queue.shift(), 'wide')}</div>`; row++; continue; }
      const port = []; while (queue.length && queue[0].w <= queue[0].h && port.length < (row % 3 === 2 ? 3 : 2)) port.push(queue.shift());
      const kind = port.length === 3 ? 'r-three' : port.length === 2 ? (row % 2 ? 'r-pair-b' : 'r-pair-a') : 'r-single';
      html += `<div class="ph-row ${kind}">${port.map(x => fig(x, '')).join('')}</div>`;
      row++;
      if (row === 4) html += `<div class="cta-strip"><p>Нравится этот проект? <em>Сделаем похожий</em> под вашу планировку и бюджет.</p>
        <button class="btn" type="button" data-lead="Дизайн-проект">Оставить заявку <i></i></button></div>`;
    }
  });
  if (P.videos.length) html = `<h2 class="ph-ch" id="video">Вживую</h2><div class="pj-videos"></div>` + html;
  gal.innerHTML = html;
  if (P.videos.length && window.VideoCards) window.VideoCards.render($('.pj-videos'), P.videos.map(v => Object.assign({ d: P.name }, v, { t: v.t })));
  gal.addEventListener('click', e => { const f = e.target.closest('.ph'); if (f) window.Viewer.open(pi, +f.dataset.k, { link: false }); });

  /* ---------- next ---------- */
  const nx = $('.pj-next');
  nx.href = `project.html?id=${next.id}`;
  $('.pj-next-t').textContent = next.name;
  $('.pj-next-img img').src = `media/p/${next.id}/${next.cover}.webp`;

  /* ---------- reveal + parallax ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.ph, .ph-ch, .pj-cta, .pj-next').forEach(el => io.observe(el));
  requestAnimationFrame(() => document.documentElement.classList.add('ready'));
  const coverImg = $('.pj-cover img'), coverBox = $('.pj-cover');
  const top = $('.top'), darks = $$('.is-dark');
  function frame() {
    const vh = innerHeight;
    const r = coverBox.getBoundingClientRect();
    const p = clamp(1 - r.bottom / (vh + r.height), 0, 1);
    coverImg.style.transform = `translate3d(0,${(p * 14).toFixed(2)}%,0) scale(${(1.16 - p * 0.12).toFixed(4)})`;
    const overDark = darks.some(d => { const b = d.getBoundingClientRect(); return b.top < 40 && b.bottom > 40; });
    top.classList.toggle('on-light', document.documentElement.dataset.theme === 'light' && !overDark);
    top.classList.toggle('bg', scrollY > 60);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
