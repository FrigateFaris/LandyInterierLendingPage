/* Project list shared by the home page and project.html. Photos come from js/gallery-data.js (build_gallery.py). */
window.PROJECTS = [
  { id: 'house', code: 'HSE', name: 'Частный дом', short: 'Дом',
    type: 'Жилой интерьер', cat: 'living', status: 'Визуализация', cover: '014', preview: ['014', '010', '013', '015'],
    rooms: ['Гостиная', 'Столовая', 'Кухня', 'Кладовая', 'Кабинет', 'Лестница', 'Холл второго этажа'],
    lead: 'Первый этаж частного дома: открытая гостиная со столовой, кухня-остров с кладовой, кабинет и лестница на второй этаж. Светлый камень, тёплое дерево и мягкий текстиль.' },
  { id: 'hotel', code: 'HTL', name: 'Отель', short: 'Отель',
    type: 'Гостиничный интерьер', cat: 'commercial', status: 'Визуализация', cover: '004', preview: ['004', '037', '052', '064'],
    rooms: ['Ресепшен', 'Лаунж', 'Коридоры', 'Номер 24', 'Номер 34', 'Санузел'],
    lead: 'Путь гостя от ресепшена из подсвеченного оникса до номера: лаунж, коридоры, два типа номеров и санузел в едином языке материалов — дерево, камень, мягкий свет.' },
  { id: 'neoclassic', code: 'NEO', name: 'Квартира «Неоклассика»', short: 'Неоклассика',
    type: 'Жилой интерьер', cat: 'living', status: 'Реализован', cover: '013', preview: ['013', '019'],
    rooms: ['Прихожая', 'Гостиная', 'Столовая', 'Кухня', 'Спальня', 'Детская', 'Ванная'],
    lead: 'Реализованный объект — фото после ремонта. Лепнина, хрустальные люстры, латунь и узорная плитка в светлой палитре.',
    videos: [{ id: 'neo-plan', t: 'От планировки до готовой квартиры' }, { id: 'neo-tour', t: 'Обзор квартиры' }] },
  { id: 'greek', code: 'GRK', name: 'Греческий дом', short: 'Греческий дом',
    type: 'Частный дом', cat: 'living', status: 'Реализован', cover: '002', preview: [],
    rooms: ['Фасад', 'Двор с бассейном', 'Арки', 'Винтовая лестница', 'Терраса'],
    lead: 'Реализованный дом в средиземноморском духе: белые объёмы, арки и винтовая лестница, бассейн во дворе и девичий виноград на стенах. Нигина показывает дом в видео-обзоре.',
    videos: [{ id: 'greek-tour', t: 'Обзор дома с Нигиной' }, { id: 'greek-broll', t: 'Дом и двор' }] },
  { id: 'terrace', code: 'TRC', name: 'Квартира с террасой', short: 'С террасой',
    type: 'Жилой интерьер', cat: 'living', status: 'Визуализация', cover: '', preview: [],
    rooms: ['Прихожая', 'Гостиная', 'Спальня', 'Детская', 'Два санузла', 'Гардеробная', 'Постирочная', 'Терраса'],
    lead: 'Смелая, цветная квартира: цветные двери в прихожей, зелёный бархат и бордовая плитка, детская в голубом и тёплая терраса с видом на город.' },
  { id: 'grey', code: 'GRY', name: 'Квартира в серых тонах', short: 'Серая',
    type: 'Жилой интерьер', cat: 'living', status: 'Визуализация', cover: '', preview: [],
    rooms: ['Гостиная', 'Кухня-столовая', 'Спальня'],
    lead: 'Спокойная квартира в графитово-серой гамме: мягкие диваны, ковёр-зебра, остров из зелёного мрамора и тёплое дерево.' },
  { id: 'graphite', code: 'GRF', name: 'Квартира «Графит»', short: 'Графит',
    type: 'Жилой интерьер', cat: 'living', status: 'Визуализация', cover: '003', preview: ['003'],
    rooms: ['Столовая', 'Кухня', 'Кабинет'],
    lead: 'Тёмная квартира со стеклянными перегородками: мраморная стена в столовой, графитовые фасады кухни, латунные акценты и светлый кабинет.' },
  { id: 'wokebowl', code: 'WKB', name: 'Кафе Wokebowl', short: 'Wokebowl',
    type: 'Общепит', cat: 'commercial', status: 'Визуализация', cover: '010', preview: ['010', '009', '006'],
    rooms: ['Фронт раздачи', 'Зал', 'Посадка у окна', 'Зона заказа'],
    lead: 'Кафе азиатской кухни: белая плитка, зелёные подвесные светильники, неоновая графика на стене и посадка у панорамного окна.' }
];
// fill the preview list up to 6 shots and attach the photos
(function () {
  const G = window.GALLERY || {};
  window.PROJECTS.forEach(p => {
    p.shots = (G[p.id] || []).map(s => Object.assign({ src: `media/p/${p.id}/${s.f}.webp`, thumb: `media/p/${p.id}/t/${s.f}.webp` }, s));
    if (!p.cover && p.shots.length) p.cover = (p.shots.find(s => s.w > s.h) || p.shots[0]).f;
    if (!p.preview.length && p.cover) p.preview.push(p.cover);
    p.videos = (p.videos || []).map(v => Object.assign({ src: `media/v/${v.id}.mp4`, poster: `media/v/${v.id}.jpg`, project: p.id }, v));
    const extra = p.shots.map(s => s.f).filter(f => !p.preview.includes(f));
    while (p.preview.length < 6 && extra.length) p.preview.push(extra.splice(Math.floor(extra.length / 2), 1)[0]);
  });
})();
// studio videos for the home page (Nigina on site and object tours)
window.VIDEOS = [
  { id: 'greek-tour', t: 'Греческий дом', d: 'Обзор реализованного дома', project: 'greek' },
  { id: 'neo-plan', t: 'Неоклассика', d: 'От планировки до готовой квартиры', project: 'neoclassic' },
  { id: 'neo-tour', t: 'Неоклассика', d: 'Обзор квартиры', project: 'neoclassic' }
].map(v => Object.assign({ src: `media/v/${v.id}.mp4`, poster: `media/v/${v.id}.jpg` }, v));
