/* Home page below the hero: statement, videos, brief, works index, studio shots, services, process, faq, footer.
   Plain JS, transform/opacity only; works from file:// (no fetch). Data: js/projects.js + js/gallery-data.js. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const pad = (n, l = 2) => String(n).padStart(l, '0');
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const PJ = window.PROJECTS;

  const SERVICES = [
    { t: 'Дизайн-проект', img: 'media/p/house/014.webp', cap: 'HSE · гостиная', d: 'Полный комплект: обмеры, планировка, концепция и рабочие чертежи для строителей.',
      li: ['Обмерный план', 'Планировочные решения', 'Концепция и материалы', 'Чертежи и ведомости'] },
    { t: '3D-визуализация', img: 'media/p/graphite/003.webp', cap: 'GRF · столовая', d: 'Фотореалистичные виды каждой комнаты — вы видите интерьер до начала ремонта.',
      li: ['Все помещения', 'Правки до согласования', 'Видео-прогулка'] },
    { t: 'Комплектация', img: 'media/p/hotel/052.webp', cap: 'HTL · номер', d: 'Подбираем и заказываем мебель, свет и отделку в рамках согласованной сметы.',
      li: ['Смета до закупок', 'Проверенные поставщики', 'Контроль поставок'] },
    { t: 'Авторский надзор', img: 'media/p/neoclassic/013.webp', cap: 'NEO · реализованный объект', d: 'Выезжаем на объект и следим, чтобы ремонт шёл строго по проекту.',
      li: ['Выезды на объект', 'Решения по ходу стройки', 'Приёмка этапов'] }
  ];
  const STEPS = [
    { t: 'Знакомство и замер', img: 'media/steps/measure.webp', pos: '50% 30%', d: 'Встречаемся на объекте, обсуждаем образ жизни, привычки и бюджет. Делаем точные обмеры.',
      r: ['Обмерный план', 'Техническое задание'], you: 'Доступ на объект и ваши пожелания' },
    { t: 'Планировка', img: 'media/steps/plan.webp', pos: '50% 45%', d: 'Предлагаем варианты: зоны, хранение, расстановка мебели, сценарии жизни.',
      r: ['Варианты планировки', 'Расстановка мебели'], you: 'Выбрать вариант' },
    { t: 'Концепция и 3D', img: 'media/p/house/014.webp', pos: '50% 50%', d: 'Подбираем стиль, материалы и свет, показываем каждую комнату на визуализациях.',
      r: ['Визуализации всех помещений', 'Подборка материалов'], you: 'Согласовать или дать правки' },
    { t: 'Рабочие чертежи', img: 'media/steps/drawings.webp', pos: '50% 40%', d: 'Готовим документацию, по которой работают строители.',
      r: ['Альбом чертежей', 'Ведомости отделки'], you: 'Ничего — работаем мы' },
    { t: 'Комплектация', img: 'media/p/neoclassic/018.webp', pos: '50% 40%', d: 'Считаем смету, подбираем и заказываем мебель, свет и отделку.',
      r: ['Смета', 'График поставок'], you: 'Утвердить смету' },
    { t: 'Реализация', img: 'media/p/neoclassic/013.webp', pos: '50% 50%', d: 'Ведём авторский надзор: выезжаем на объект и следим, чтобы ремонт шёл строго по проекту.',
      r: ['Готовый интерьер, как на визуализациях'], you: 'Принимать этапы работ' }
  ];
  // studio shots block: a few of the best frames across the projects
  const SHOTS = [['house', '014'], ['hotel', '004'], ['neoclassic', '013'], ['greek', '007'], ['terrace', '024'], ['grey', '001'],
    ['graphite', '003'], ['wokebowl', '010'], ['terrace', '042'], ['hotel', '037'], ['neoclassic', '007'], ['house', '024']];
  const FAQ = [
    ['С чего начинается работа?', 'С консультации и выезда на объект: знакомимся, обсуждаем задачу и бюджет, делаем замеры. Затем фиксируем объём работ и сроки в договоре.'],
    ['Можно заказать только планировку или только визуализацию?', 'Да. Каждый этап можно взять отдельно — например, планировку для перепланировки или визуализации по готовому плану.'],
    ['Сколько длится дизайн-проект?', 'Зависит от площади и сложности. Точный график этапов фиксируем в договоре после замера.'],
    ['Вы работаете с коммерческими объектами?', 'Да: отели, кафе и рестораны, офисы. В индексе проектов — отель и кафе Wokebowl.'],
    ['Что такое авторский надзор?', 'Мы регулярно приезжаем на объект, отвечаем на вопросы строителей и следим, чтобы ремонт шёл строго по чертежам.'],
    ['Работаете ли вы за пределами Ташкента?', 'Да, выезд обсуждаем индивидуально; часть работы можно вести онлайн.']
  ];

  /* ---------- reveal ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
    { rootMargin: '0px 0px -10% 0px' });
  const watch = el => io.observe(el);
  $$('.rv, .st-line, .sec-head, .meta-row').forEach(watch);

  /* ---------- drafting lines: only where the page is about drawings ---------- */
  $$('#about, #process, #price').forEach(el => {
    const g = document.createElement('div'); g.className = 'gridlines'; g.setAttribute('aria-hidden', 'true');
    g.innerHTML = '<i></i>'.repeat(12); el.prepend(g);
  });

  /* ---------- works index ---------- */
  const list = $('.wk-list');
  PJ.forEach((p, i) => {
    const a = document.createElement('a');
    a.className = 'wk rv'; a.href = `project.html?id=${p.id}`;
    a.dataset.cat = p.cat; a.dataset.done = p.status === 'Реализован' ? '1' : '';
    // every row shows its cover photo right away (phones and tablets have no hover)
    a.innerHTML = `<span class="wk-card"><img src="media/p/${p.id}/t/${p.cover}.webp" alt="${p.name}" loading="lazy"></span>
      <span class="wk-name"><b>${p.name}</b><span class="mono wk-type">${p.type}</span></span>
      <span class="wk-rooms">${p.rooms.slice(0, 4).join(', ')}${p.rooms.length > 4 ? '…' : ''}</span>
      <span class="mono wk-st">${p.status}<em>Смотреть →</em></span>`;
    list.appendChild(a); watch(a);
  });
  $('.filters').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', b.parentNode).forEach(x => x.classList.toggle('on', x === b));
    const f = b.dataset.f;
    $$('.wk', list).forEach(r => r.classList.toggle('off', !(f === 'all' || (f === 'done' ? r.dataset.done : r.dataset.cat === f))));
  });
  $('.views').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', b.parentNode).forEach(x => x.classList.toggle('on', x === b));
    $('.works').classList.toggle('as-grid', b.dataset.v === 'grid');
  });

  /* ---------- videos from the sites ---------- */
  if (window.VideoCards) window.VideoCards.render($('.rl-row'), window.VIDEOS, { autoplay: true });

  /* ---------- studio shots: grey until hovered, click opens the viewer ---------- */
  const arGrid = $('.ar-grid');
  SHOTS.forEach(([id, f]) => {
    const pi = PJ.findIndex(p => p.id === id), p = PJ[pi], si = p ? p.shots.findIndex(x => x.f === f) : -1;
    if (si < 0) return;
    const el = document.createElement('button');
    el.type = 'button'; el.className = 'ar-item rv';
    el.innerHTML = `<img src="${p.shots[si].thumb}" alt="${p.name}" loading="lazy"><span class="mono">${p.name}</span>`;
    el.addEventListener('click', () => window.Viewer.open(pi, si));
    arGrid.appendChild(el); watch(el);
  });

  /* ---------- services ---------- */
  const svList = $('.sv-list'), svImg = $('.sv-img'), svCap = $('.sv-cap');
  SERVICES.forEach(s => { const i = new Image(); i.src = s.img; });
  function svSet(i) {
    $$('.sv', svList).forEach((x, k) => x.classList.toggle('on', k === i));
    const im = document.createElement('img'); im.src = SERVICES[i].img; im.alt = SERVICES[i].t;
    svImg.appendChild(im); requestAnimationFrame(() => im.classList.add('in'));
    while (svImg.children.length > 2) svImg.firstChild.remove();
    svCap.textContent = SERVICES[i].cap;
  }
  SERVICES.forEach((s, i) => {
    const li = document.createElement('li');
    li.className = 'sv rv';
    li.innerHTML = `<button type="button" class="sv-row"><span class="mono">${pad(i + 1)}</span><b>${s.t}</b><i></i></button>
      <div class="sv-more"><div><p>${s.d}</p><ul>${s.li.map(x => `<li class="mono">${x}</li>`).join('')}</ul></div></div>`;
    $('.sv-row', li).addEventListener('click', () => svSet(i));
    if (fine) li.addEventListener('mouseenter', () => svSet(i));
    svList.appendChild(li); watch(li);
  });
  svSet(0);

  /* ---------- process: six compact cards — picture, step, what we do, what the client gets ---------- */
  const stList = $('.st-list');
  STEPS.forEach((s, i) => {
    const li = document.createElement('li');
    li.className = 'st rv';
    li.innerHTML = `<div class="st-img"><img src="${s.img}" alt="${s.t}" loading="lazy" style="object-position:${s.pos}"></div>
      <div class="st-t"><span class="mono">${pad(i + 1)}</span><b>${s.t}</b></div>
      <p class="st-d">${s.d}</p>
      <p class="st-r"><span class="mono">Результат</span>${s.r.join(' · ')}</p>`;
    stList.appendChild(li); watch(li);
  });

  /* ---------- brief ---------- */
  const bf = $('.bf'), range = $('.bf-range'), areaLbl = $('.bf-area'), rows = $('.sh-rows');
  const no = 'LI-' + pad(Math.floor(Math.random() * 9000) + 1000, 4);
  $('.sh-no').textContent = no;
  const val = key => {
    const g = $(`[data-key="${key}"]`);
    const on = $$('button.on', g).map(b => b.dataset.v || b.textContent.trim());
    return g.hasAttribute('data-single') ? on[0] : on;
  };
  $$('[data-key]', bf).forEach(g => g.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (g.hasAttribute('data-single')) $$('button', g).forEach(x => x.classList.toggle('on', x === b));
    else b.classList.toggle('on');
    updBrief();
  }));
  range.addEventListener('input', updBrief);
  const svg = $('.sh-plan svg'), planL = $('.sh-plan-l');
  function plan(rooms, area) {
    // a quick schematic: the selected rooms split the plan into strips, sized by a rough weight
    const W = { 'Гостиная': 3, 'Кухня': 2, 'Спальня': 2.2, 'Детская': 1.6, 'Кабинет': 1.3, 'Прихожая': 1.1, 'Санузел': 0.9, 'Гардеробная': 0.8 };
    const rs = rooms.length ? rooms : ['Гостиная'];
    const tot = rs.reduce((a, r) => a + (W[r] || 1), 0);
    const top = rs.filter((_, i) => i % 2 === 0), bot = rs.filter((_, i) => i % 2 === 1);
    let out = '';
    [[top, 4, bot.length ? 66 : 112], [bot, 74, 42]].forEach(([row, y, h]) => {
      if (!row.length) return;
      const sum = row.reduce((a, r) => a + (W[r] || 1), 0); let x = 4;
      row.forEach(r => {
        const w = (192 * (W[r] || 1)) / sum;
        out += `<rect x="${x.toFixed(1)}" y="${y}" width="${(w - 2).toFixed(1)}" height="${h}"/><text x="${(x + 5).toFixed(1)}" y="${y + 12}">${r}</text>`;
        out += `<text class="sq" x="${(x + 5).toFixed(1)}" y="${y + h - 6}">${Math.round(area * (W[r] || 1) / tot)} м²</text>`;
        x += w;
      });
    });
    svg.innerHTML = out;
    planL.textContent = `Схема · ${area} м² · ${rs.length} пом.`;
  }
  function updBrief() {
    const area = +range.value;
    areaLbl.textContent = `${area} м²`;
    range.style.setProperty('--p', ((area - 30) / 570 * 100).toFixed(1) + '%');
    const R = [['Объект', val('type')], ['Площадь', `${area} м²`], ['Помещения', val('rooms').join(', ') || '—'], ['Формат', val('pack')]];
    rows.innerHTML = R.map(([k, v]) => `<div><dt class="mono">${k}</dt><dd>${v}</dd></div>`).join('');
    plan(val('rooms'), area);
  }
  updBrief();
  bf.addEventListener('submit', e => {
    e.preventDefault();
    const bad = $$('[required]', bf).filter(f => !f.value.trim());
    $$('.fld', bf).forEach(f => f.classList.remove('bad'));
    if (bad.length) { bad.forEach(f => f.closest('.fld').classList.add('bad')); bad[0].focus(); return; }
    $('.sheet').classList.add('sent');
  });

  /* ---------- faq ---------- */
  const fq = $('.faq-list');
  FAQ.forEach(([q, a], i) => {
    const d = document.createElement('div');
    d.className = 'qa rv';
    d.innerHTML = `<button type="button" class="qa-q" aria-expanded="false"><span class="mono">${pad(i + 1)}</span><b>${q}</b><i></i></button><div class="qa-a"><div><p>${a}</p></div></div>`;
    $('.qa-q', d).addEventListener('click', () => {
      const open = !d.classList.contains('open');
      $$('.qa', fq).forEach(x => { x.classList.remove('open'); $('.qa-q', x).setAttribute('aria-expanded', 'false'); });
      if (open) { d.classList.add('open'); $('.qa-q', d).setAttribute('aria-expanded', 'true'); }
    });
    fq.appendChild(d); watch(d);
  });

  /* ---------- footer: Tashkent time ---------- */
  const clock = $('.foot-clock');
  const tick = () => { clock.textContent = 'Ташкент ' + new Date().toLocaleTimeString('ru-RU', { timeZone: 'Asia/Tashkent', hour: '2-digit', minute: '2-digit' }); };
  tick(); setInterval(tick, 20000);
  watch($('.foot-word'));

  /* ---------- per-frame work ---------- */
  const walk = $('.walk'), top = $('.top'), darks = $$('.is-dark');
  const light = () => document.documentElement.dataset.theme === 'light';
  const bleedImg = $('.bl-img img'), bleedBox = $('.bl-img'), bleed = $('.bleed');
  function frame() {
    const vh = innerHeight;
    // photo block: opens from the grid frame to full width while it comes in, with a slow parallax inside
    const br = bleed.getBoundingClientRect();
    if (br.bottom > 0 && br.top < vh) {
      const o = clamp((vh - br.top) / (vh * 0.9), 0, 1);
      bleedBox.style.clipPath = `inset(${((1 - o) * 6).toFixed(2)}% calc(var(--pad) * ${(1 - o).toFixed(3)}) round ${((1 - o) * 18).toFixed(1)}px)`;
      bleedImg.style.transform = `translate3d(0,${((br.top / vh) * -8).toFixed(2)}%,0) scale(1.12)`;
    }
    // header: dark text over the light page, light over the hero and the dark bands
    const overDark = darks.some(d => { const r = d.getBoundingClientRect(); return r.top < 40 && r.bottom > 40; });
    top.classList.toggle('on-light', light() && walk.getBoundingClientRect().bottom < 40 && !overDark);
    top.classList.toggle('bg', walk.getBoundingClientRect().bottom < 40);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
