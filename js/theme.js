/* Light / dark theme switch (the choice is remembered per browser; dark by default). */
(function () {
  const root = document.documentElement, btn = document.querySelector('.theme-t');
  if (!btn) return;
  const label = () => { btn.querySelector('span').textContent = root.dataset.theme === 'dark' ? 'Светлая' : 'Тёмная'; };
  label();
  btn.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('li-theme', root.dataset.theme); } catch (e) {}
    label();
  });
})();
