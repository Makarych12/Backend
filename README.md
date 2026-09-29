# Python с нуля до Backend

Интерактивный курс для полных новичков: от «что такое код» до написания настоящих серверов
на Python (FastAPI). Всё объясняется максимально простым языком, маленькими шагами,
с аналогиями и без жаргона без объяснения.

## Стек

- **Frontend:** React + Vite + Tailwind CSS
- **Тема:** светлая/тёмная, переключатель в шапке (кнопка ☀️/🌙), сохраняется в `localStorage`
- **Песочница уроков:** настоящий Python в браузере через **Pyodide** (CPython, скомпилированный
  в WebAssembly) — код действительно выполняется, а не имитируется
- **FastAPI в песочнице:** т.к. поднять реальный ASGI-сервер в браузере нельзя, для уроков
  модуля 5+ используется мини-реализация `fastapi`/`pydantic`/`TestClient`
  (`src/utils/miniFastapi.py`), которая подставляется в `sys.modules` — код ученика выглядит
  и пишется один в один как настоящий FastAPI (`from fastapi import FastAPI`), но выполняется
  без сети
- **Встроенный терминал:** имитация окна терминала (`src/components/Terminal.jsx` +
  `src/utils/terminalSimulator.js`) — показывает реалистичный ответ на команды (`pip install`,
  `uvicorn`, `python -m venv` и т.д.), включая ошибки на опечатки, без реального выполнения
- **Прогресс:** сохраняется в `localStorage`, бэкенд для самого приложения не требуется

## Запуск

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # продакшн-сборка в dist/
npm run lint      # oxlint
```

## Структура

```
src/
  data/modules/     — контент уроков (теория, примеры, терминал, песочницы, задания)
  data/cheatsheets.js, data/projects.js
  components/       — Sandbox, Terminal, CommandExplainer, CodeBlock, TaskCard, ThemeToggle, ...
  pages/            — Home, ModulePage, LessonPage, Cheatsheets, Projects
  utils/
    pyodideRunner.js   — загрузка Pyodide и выполнение Python-кода из песочницы
    miniFastapi.py     — мини-FastAPI/Pydantic/TestClient для песочницы (см. выше)
    terminalSimulator.js — резолвер команд для компонента Terminal
  hooks/
    useTheme.js       — светлая/тёмная тема
    useProgress.js    — трекер прогресса на localStorage
```

Курс содержит модули по Python и backend-разработке с теорией, примерами, практикой и
интерактивными песочницами. Модуль «ООП в Python» расширен до 14 уроков: от классов и методов
до свойств, наследования, композиции и мини-проекта корзины заказа. Остальные модули
пересматриваются по полноте тем; прежняя отметка «готово» не означает достаточную глубину.
