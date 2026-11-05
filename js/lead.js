/* Lead capture shared by index.html and project.html:
   - a quick request form in a modal (any element with [data-lead] opens it; data-lead="Текст" pre-selects the interest)
   - a round rotating "Оставить заявку" button fixed in the corner, shown after the hero, hidden over the brief and footer */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const INTEREST = ['Дизайн-проект', 'Авторский надзор', 'Консультация', 'Пока присматриваюсь'];
  const briefHref = $('#price') ? '#price' : 'index.html#price';

  const m = document.createElement('div');
  m.className = 'lead'; m.setAttribute('aria-hidden', 'true');
  m.innerHTML = `<div class="ld-box" role="dialog" aria-label="Оставить заявку">
      <button class="ld-close mono" type="button">Закрыть ✕</button>
      <form class="ld-form" novalidate>
        <span class="mono ld-k">Заявка · ответим в течение дня</span>
        <h3 class="ld-h">Обсудим <em>ваш</em> интерьер</h3>
        <div class="chips ld-int">${INTEREST.map((t, i) => `<button type="button" class="${i ? '' : 'on'}">${t}</button>`).join('')}</div>
        <label class="fld"><input name="name" type="text" placeholder=" " required><span>Как вас зовут</span></label>
        <label class="fld"><input name="phone" type="tel" placeholder=" " required><span>Телефон или @telegram</span></label>
        <div class="ld-bottom"><button class="btn dark" type="submit">Отправить заявку <i></i></button>
          <a class="mono ld-brief" href="${briefHref}">Или заполнить подробный бриф →</a></div>
        <div class="ld-done"><span class="mono ld-k">Принято</span><b>Спасибо!</b><p>Мы свяжемся с вами в течение дня и договоримся о консультации.</p></div>
      </form>
    </div>`;
  document.body.appendChild(m);
  const form = $('.ld-form', m), ints = $('.ld-int', m);
  ints.addEventListener('click', e => { const b = e.target.closest('button'); if (b) $$('button', ints).forEach(x => x.classList.toggle('on', x === b)); });
  function open(pre) {
    $$('button.extra', ints).forEach(x => x.remove());
    if (pre && !$$('button', ints).some(x => x.textContent === pre)) {   // e.g. «Тариф Full»: shown as its own chip
      const b = document.createElement('button'); b.type = 'button'; b.className = 'extra'; b.textContent = pre; ints.prepend(b);
    }
    if (pre) $$('button', ints).forEach(x => x.classList.toggle('on', x.textContent === pre));
    form.classList.remove('sent');
    m.classList.add('open'); m.setAttribute('aria-hidden', 'false'); document.documentElement.classList.add('lock');
    setTimeout(() => $('input', form).focus({ preventScroll: true }), 500);
  }
  const close = () => { m.classList.remove('open'); m.setAttribute('aria-hidden', 'true'); document.documentElement.classList.remove('lock'); };
  $('.ld-close', m).addEventListener('click', close);
  $('.ld-brief', m).addEventListener('click', close);
  m.addEventListener('click', e => { if (e.target === m) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && m.classList.contains('open')) close(); });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const bad = $$('[required]', form).filter(f => !f.value.trim());
    $$('.fld', form).forEach(f => f.classList.remove('bad'));
    if (bad.length) { bad.forEach(f => f.closest('.fld').classList.add('bad')); bad[0].focus(); return; }
    form.classList.add('sent');   // no backend yet
  });
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-lead]'); if (!t) return;
    e.preventDefault(); open(t.dataset.lead || '');
  });

  /* ---------- round floating button ---------- */
  const f = document.createElement('button');
  f.type = 'button'; f.className = 'btn lead-fab'; f.dataset.lead = '';
  f.innerHTML = 'Оставить заявку <i></i>';
  document.body.appendChild(f);
  const walk = $('.walk'), hideOver = $$('#price, .foot, .bleed, .pj-cta, .pj-next');
  (function tick() {
    const past = walk ? walk.getBoundingClientRect().bottom < innerHeight * 0.6 : scrollY > innerHeight * 0.5;
    const over = hideOver.some(el => { const r = el.getBoundingClientRect(); return r.top < innerHeight * 0.85 && r.bottom > innerHeight * 0.3; });
    f.classList.toggle('on', past && !over && !m.classList.contains('open'));
    requestAnimationFrame(tick);
  })();
  window.Lead = { open, close };
})();
