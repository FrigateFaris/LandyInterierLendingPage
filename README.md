# Landy Interior — лендинг

Статичный сайт: открывается двойным кликом по `index.html` или с любого статичного хостинга.

```
index.html          главная: hero-прогулка, работы, архив, услуги, процесс, видео, бриф, вопросы
project.html        страница проекта: project.html?id=house | hotel | neoclassic | greek | terrace | grey | graphite | wokebowl
css/                hero.css (hero + кнопки), site.css (разделы, темы), project.css
js/                 hero-video.js (прогулка по кадрам), site.js (разделы главной), project.js,
                    projects.js (список проектов), gallery-data.js (все фото, генерируется),
                    viewer.js (просмотр фото), videos.js, lead.js (заявки), theme.js (светлая/тёмная)
media/apartment/    кадры hero: frames/ (компьютер, 60 fps) и frames-m/ (телефон, 30 fps), WebP
media/p/<проект>/   фото проектов (до 2200 px) и t/ — превью 640 px, WebP
media/v/            видео 720×1280 H.264 + обложки WebP
media/steps/        картинки этапов работы
media/brand/        логотипы Landy (SVG из исходника .ai)
tools/              скрипты пересборки медиа (Python + ffmpeg из imageio-ffmpeg)
```

Скрипты в `tools/` берут исходники из `Downloads\Telegram Desktop` и `LandyGroup-исходники\design-interior`
(туда же перенесены старые варианты hero и исходные видео).
