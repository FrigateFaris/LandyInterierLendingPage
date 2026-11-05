/* Home page below the hero: statement, videos, brief, works, studio shots field, services, rates, faq, footer.
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
  // formats of work and prices, as on the studio's Taplink
  const RATES = [
    { n: 'Express', t: 'Быстрый старт: планировка и логика пространства', p: '18 $', u: 'за м²', time: '5 рабочих дней',
      li: ['Консультация дизайнера', 'Обмерный план', 'Планировка с расстановкой мебели — до 3 вариантов', 'Планы демонтажа и монтажа стен'],
      demo: 'https://drive.google.com/file/d/1c12Zp0wg8CcyijvzHS7udI3WsyM8XWum/view?usp=drive_link' },
    { n: 'Express Plus', t: 'Планировка и сразу инженерная база для ремонта', p: '23 $', u: 'за м²', time: '10 рабочих дней',
      li: ['Всё из Express', 'Сантехника с привязками', 'Потолки, освещение и группы света', 'Розетки, раскладка полов, тёплый пол'],
      demo: 'https://drive.google.com/file/d/1tlzy2k1JXFN0olQhdafcy2uowcNCNESv/view?usp=drive_link' },
    { n: 'Full', t: 'Полный дизайн-проект: интерьер виден до ремонта', p: '38 $', u: 'за м²', time: 'от 25 рабочих дней',
      li: ['Всё из Express Plus', 'Развёртки помещений', 'Монтажные узлы', 'Фотореалистичные 3D-визуализации'],
      demo: 'https://drive.google.com/file/d/1N86WTfTj-cGIpifi5gFNE9TfHeTTmnMY/view?usp=sharing', main: true },
    { n: 'Visual', t: 'Реалистичные изображения будущего интерьера', p: '23 $', u: 'за м²', time: 'по объёму проекта',
      li: ['3D-визуализации ключевых помещений', 'Свет, текстуры, материалы и мебель', 'Предметы реальных брендов или аналоги', '2 раунда правок'] }
  ];
  const MORE = [
    { n: 'Mix', t: 'Свой формат для каждого помещения: например, гостиная — Visual, санузел — Express', p: 'Индивидуально',
      demo: 'https://drive.google.com/file/d/1h7wZVIE7nWslDr-RyQ8LQjOae4nZ5_Cj/view?usp=drive_link' },
    { n: 'Авторский надзор', t: 'До 6 выездов в месяц, контроль работ, материалов и расстановки мебели', p: 'Индивидуально' },
    { n: 'Выездная консультация', t: 'Планировка, стиль, материалы, мебель или разбор готового проекта', p: '500 000 сум', u: 'в час · Ташкент' }
  ];
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
  $$('#about, #price').forEach(el => {
    const g = document.createElement('div'); g.className = 'gridlines'; g.setAttribute('aria-hidden', 'true');
    g.innerHTML = '<i></i>'.repeat(12); el.prepend(g);
  });

  /* ---------- works index ---------- */
  const list = $('.wk-list');
  PJ.forEach((p, i) => {
    const a = document.createElement('a');
    a.className = 'wk rv'; a.href = `project.html?id=${p.id}`;
    a.dataset.cat = p.cat; a.dataset.done = p.status === 'Реализован' ? '1' : '';
    // a card: photo, type and status, name, rooms and a full-size button (no hover needed on phones)
    a.innerHTML = `<span class="wk-card"><img src="media/p/${p.id}/t/${p.cover}.webp" alt="${p.name}" loading="lazy"><span class="mono wk-st">${p.status}</span></span>
      <span class="mono wk-type">${p.type}</span>
      <b class="wk-name">${p.name}</b>
      <span class="wk-rooms">${p.rooms.slice(0, 4).join(', ')}${p.rooms.length > 4 ? '…' : ''}</span>
      <span class="btn wk-go">Смотреть проект <i></i></span>`;
    list.appendChild(a); watch(a);
  });
  $('.filters').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', b.parentNode).forEach(x => x.classList.toggle('on', x === b));
    const f = b.dataset.f;
    $$('.wk', list).forEach(r => r.classList.toggle('off', !(f === 'all' || (f === 'done' ? r.dataset.done : r.dataset.cat === f))));
  });

  /* ---------- videos from the sites ---------- */
  if (window.VideoCards) window.VideoCards.render($('.rl-row'), window.VIDEOS, { autoplay: true });

  /* ---------- archive: a still field of photos (no dragging), drifting slowly with the page ---------- */
  const field = $('.ar-field'), plane = $('.ar-plane');
  const ALL = [];
  PJ.forEach((p, pi) => p.shots.forEach((s, si) => ALL.push({ p, pi, s, si })));
  // interleave projects so neighbours differ
  const mixed = [];
  for (let r = 0; ALL.some(x => !x.used); r++) PJ.forEach((p, pi) => { const x = ALL.find(y => y.pi === pi && !y.used); if (x) { x.used = 1; mixed.push(x); } });
  const COLS = innerWidth < 700 ? 9 : 16, CW = innerWidth < 700 ? 150 : 210, GAP = innerWidth < 700 ? 14 : 22;
  const colH = new Array(COLS).fill(0).map((_, c) => (c % 2) * CW * 0.45);
  mixed.forEach(x => {
    const c = colH.indexOf(Math.min(...colH));
    const h = Math.round(CW * x.s.h / x.s.w);
    const el = document.createElement('button');
    el.type = 'button'; el.className = 'ar-item';
    el.style.cssText = `left:${c * (CW + GAP)}px;top:${colH[c]}px;width:${CW}px;height:${h}px`;
    el.innerHTML = `<img src="${x.s.thumb}" alt="${x.p.name}" loading="lazy"><span class="mono">${x.p.name}</span>`;
    el.addEventListener('click', () => window.Viewer.open(x.pi, x.si));
    plane.appendChild(el);
    colH[c] += h + GAP;
  });
  const PW = COLS * (CW + GAP) - GAP, PH = Math.max(...colH);
  plane.style.width = PW + 'px'; plane.style.height = PH + 'px';
  // centred in the field
  const place = () => [Math.min(0, field.clientWidth - PW) / 2, Math.min(0, field.clientHeight - PH) / 3];

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
    li.innerHTML = `<button type="button" class="sv-row"><b>${s.t}</b><i></i></button>
      <div class="sv-more"><div><p>${s.d}</p><ul>${s.li.map(x => `<li class="mono">${x}</li>`).join('')}</ul></div></div>`;
    $('.sv-row', li).addEventListener('click', () => svSet(i));
    if (fine) li.addEventListener('mouseenter', () => svSet(i));
    svList.appendChild(li); watch(li);
  });
  svSet(0);

  /* ---------- rates: four main formats as cards, three more as rows ---------- */
  const demo = u => u ? `<a class="mono rt-demo" href="${u}" target="_blank" rel="noopener">Смотреть образец ↗</a>` : '';
  RATES.forEach(r => {
    const el = document.createElement('article');
    el.className = 'rt rv' + (r.main ? ' main' : '');
    el.innerHTML = `<div class="rt-top"><h3 class="rt-n">${r.n}</h3><p class="rt-t">${r.t}</p></div>
      <p class="rt-p"><b>${r.p}</b><span>${r.u}</span></p>
      <p class="mono rt-time">${r.time}</p>
      <ul class="rt-li">${r.li.map(x => `<li>${x}</li>`).join('')}</ul>
      <div class="rt-act"><button class="btn${r.main ? ' solid' : ''}" type="button" data-lead="Тариф ${r.n}">Выбрать <i></i></button>${demo(r.demo)}</div>`;
    $('.rt-list').appendChild(el); watch(el);
  });
  MORE.forEach(r => {
    const el = document.createElement('div');
    el.className = 'rt-row rv';
    el.innerHTML = `<h3 class="rt-n">${r.n}</h3><p class="rt-t">${r.t}${r.demo ? ' ' + demo(r.demo) : ''}</p>
      <p class="rt-p"><b>${r.p}</b>${r.u ? `<span>${r.u}</span>` : ''}</p>
      <button class="btn" type="button" data-lead="${r.n}">Обсудить <i></i></button>`;
    $('.rt-more').appendChild(el); watch(el);
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
    d.innerHTML = `<button type="button" class="qa-q" aria-expanded="false"><b>${q}</b><i></i></button><div class="qa-a"><div><p>${a}</p></div></div>`;
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

  /* ---------- scroll work: runs only on frames where the page actually moved ----------
     Phones skip the photo-block opening and the field parallax: moving clipped, masked photos every frame is what made them stutter. */
  const walk = $('.walk'), top = $('.top');
  const bleedImg = $('.bl-img img'), bleedBox = $('.bl-img'), bleed = $('.bleed');
  const still = !fine || innerWidth < 900;
  const [px, py] = place();
  plane.style.transform = `translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0)`;
  function frame() {
    queued = false;
    const vh = innerHeight;
    top.classList.toggle('bg', walk.getBoundingClientRect().bottom < 40);
    if (still) return;
    // photo block: opens from the grid frame to full width while it comes in, with a slow parallax inside
    const br = bleed.getBoundingClientRect();
    if (br.bottom > 0 && br.top < vh) {
      const o = clamp((vh - br.top) / (vh * 0.9), 0, 1);
      bleedBox.style.clipPath = `inset(${((1 - o) * 6).toFixed(2)}% calc(var(--pad) * ${(1 - o).toFixed(3)}) round ${((1 - o) * 18).toFixed(1)}px)`;
      bleedImg.style.transform = `translate3d(0,${((br.top / vh) * -8).toFixed(2)}%,0) scale(1.12)`;
    }
    // archive: slow vertical parallax with page scroll
    const fr = field.getBoundingClientRect();
    if (fr.bottom > 0 && fr.top < vh) {
      const sp = clamp((vh - fr.top) / (vh + fr.height), 0, 1);
      plane.style.transform = `translate3d(${px.toFixed(1)}px,${(py - sp * 120).toFixed(1)}px,0)`;
    }
  }
  let queued = false;
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  queue();
})();
