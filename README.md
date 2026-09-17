<div align="center">

  <svg width="96" height="96" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#0D99FF"/>
    <path d="M2 17L12 22L22 17" stroke="#0D99FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M2 12L12 17L22 12" stroke="#0D99FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>

  <h1>Ligma</h1>

  <p><strong>Бесплатный веб-аналог Figma на базе Node.js и Fabric.js</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Node.js-18%2B-0d99ff?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
    <img src="https://img.shields.io/badge/Express.js-4.x-1e1e1e?style=for-the-badge&logo=express&logoColor=white" alt="Express">
    <img src="https://img.shields.io/badge/Fabric.js-5.3-2c2c2c?style=for-the-badge&logo=javascript&logoColor=white" alt="Fabric.js">
    <img src="https://img.shields.io/badge/License-MIT-0d99ff?style=for-the-badge" alt="License">
  </p>

  <br>

</div>

---

## <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0d99ff" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg> О проекте

**Ligma** — это автономный веб-редактор векторной графики и пользовательских интерфейсов. Проект сочетает удобство и логику Figma с полной независимостью от облачных сервисов: файлы создаются прямо на вашем компьютере в структурированном виде, с автоматической поддержкой репозиториев **Git**.

---

## <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0d99ff" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg> Ключевые возможности

### Стартовый хаб (`/home/`)
* **Автоопределение ОС**: Интеграция с системой для получения локального имени пользователя Windows.
* **Проверка Git**: Автоматическое обнаружение установленного Git в системе и опциональная инициализация репозитория при создании проекта.
* **Локальное хранение**: Все проекты сохраняются на Рабочем столе по пути `Desktop/Ligma/Projects/<Название>/`.
* **Steam-style библиотека**: Карточки проектов с динамическими превью-миниатюрами и списком недавних файлов.

### Векторный редактор (`/editor/`)
* **Векторные инструменты**: Прямоугольники, окружности, линии, кисть свободной формы и тексты.
* **Интеграция с Google Fonts**: Динамическая загрузка веб-шрифтов (*Inter, Roboto, Montserrat, JetBrains Mono, Fira Code* и др.).
* **Изображения**: Импорт картинок через Drag-and-Drop на холст, вставку из буфера обмена (`Ctrl+V`) или проводник.
* **Интерактивные слои**: 
  * Перетаскивание слоев мышью (Drag-and-Drop) для изменения порядка наложения.
  * Управление порядком через кнопки подьема/спуска (`▲`/`▼`).
* **Умный экспорт PNG**: Автоматическое определение общих границ всех объектов (Bounding Box), экспорт с прозрачным фоном и высокими разрешениями без захвата фона редактора.
* **Кастомное контекстное меню**: Вызов по правой кнопке мыши (Дублирование, Изменение Z-индекса, Быстрая вставка картинок, Удаление).
* **Автосохранение**: Сохранение состояния холста в JSON и генерация превью проекта в фоновом режиме.

---

## <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0d99ff" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> Интерфейс приложения

```text
┌────────────────────────────────────────────────────────────────────────────────┐
│ Ligma Editor                                                  [Сохранено]      │
├──────────────┬──────────────────────────────────────────────────┬──────────────┤
│  СЛОИ        │  ХОЛСТ (FABRIC.JS CANVAS)                         │  СВОЙСТВА    │
│              │                                                  │              │
│  [▲] [▼] Текст│         ┌───────────────────────┐                │  Позиция X/Y │
│  [▲] [▼] Картинка       │  Ligma Design         │                │  Размер W/H  │
│  [▲] [▼] Прямоугольн.   └───────────────────────┘                │  Заливка     │
│              │                                                  │  Обводка     │
│              │  [ПКМ] -> Контекстное меню                        │  Шрифты      │
└──────────────┴──────────────────────────────────────────────────┴──────────────┤
│ Drag-and-Drop слоев | Google Fonts | Умный прозрачный экспорт PNG              │
└────────────────────────────────────────────────────────────────────────────────┘
```

## Быстрый запуск
### Требования
- Node.js: версии 16.x или выше
- Git (опционально): для автоматической инициализации Git-репозиториев в проектах
## Установка и запуск
1. Клонируйте репозиторий
```
git clone https://github.com/JunDevX/Ligma.git
cd Ligma
```
2. Установите зависимости
```
npm install
```
3. Запустите проекта и начните работу
```
npm start
```
ИЛИ
```
node server.js
```
4. Начните работу
```
http://localhost:3000/
```
## Структура проекта
```
Ligma/
├── package.json
├── server.js              # Express сервер + API работы с файловой системой ОС
└── public/
    ├── home/              # Стартовый хаб (/home/)
    │   ├── index.html
    │   ├── style.css
    │   └── app.js
    └── editor/            # Графический редактор (/editor/)
        ├── index.html
        ├── style.css
        └── app.js
```
### Горячие клавишы
| Клавиша | Назначение |
| --- | --- |
| V | Инструмент выравнивания и выделения (Select) |
| R | Прямоугольник (Rectangle) |
| O | Окружность (Circle) |
| L | Прямая линия (Line) |
| P | Кисть свободного рисования (Pencil) |
| T | Вставка текста (Text) |
| I | Загрузить изображение с диска |
| Ctrl+v | Вставить изображение из буфера обмена |
| Ctrl+D | Дублировать выделенный объект |
| Delete / Backspace | Удалить выделенный оюъект |

### Лицензия и благодарности
Проект работает на базе лицензии `GNU GENERAL PUBLIC LICENSE v3.0`
| Ресурсы проекта |
| --- |
Больше информации о проекте [https://ligma.com/about](https://ligma.pages.dev/about)
Контакты разроботчиков проекта [https://ligma.com/contacts](https://ligma.pages.dev/contacts)
Альтернативная страница проекта [https://jundevx.pages.dev/ligma](https://ligma.pages.dev/internet)
Страничка GitHub: [https://ligma.com/githubpage](https://ligma.pages.dev/githubredirect)

| Финансовая поддержка |
| --- |
Страницы финансовой поддержки [https://ligma.com/donate](https://ligma.pages.dev/donate)
Наши другие проекты [https://ligma.com/otherprojects](https://ligma.pages.dev/projects)
Сраница проекта [https://ligma.com/](https://ligma.pages.dev/)

| Новости проекта |
| --- |
Discord [https://ligma.com/discord](https://ligma.pages.dev/discordredirect)
Telegram [https://ligma.com/telegram](https://ligma.pages.dev/telegramredirect)
News about updates [https://ligma.com/news/updates](https://ligma.pages.dev/news/updates)
News about project [https://ligma.com/news/](https://ligma.pages.dev/news/project)