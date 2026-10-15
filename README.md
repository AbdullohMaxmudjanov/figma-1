# TaskFlow — Smart Task Manager ✅

React + Vite yordamida yaratilgan zamonaviy vazifalar boshqaruvi ilovasi.

## 🚀 Ishga tushirish

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
npm run preview
```

## 🐳 Docker container

```bash
docker compose up --build
# → http://localhost:8080
```

Yoki qo'lda:

```bash
docker build -t taskflow .
docker run -p 8080:80 taskflow
```

Container: multi-stage (Node build + Nginx serve), gzip yoqilgan, `/assets` uzoq cache'da.

## ✨ Funksiyalar (talablar bo'yicha)

1. **React + Vite + react-icons** — barcha ikonkalar vektor, emoji yo'q.
2. **5 sahifa + Sidebar** — Doska (Kanban), Statistika, Kalendar, Teglar, Sozlamalar.
3. **3 til** — O'zbek / Русский / English (topbar + Sozlamalardan almashtiriladi, localStorage'da saqlanadi).
4. **CRUD** — vazifa qo'shish, tahrirlash (modal), o'chirish.
4. **3 holat** — Todo / In Progress / Done Kanban doskasi + **Drag & Drop**.
5. **Qidiruv va filtr** — matnli qidiruv, ustuvorlik/teq filtri, 4 xil saralash.
6. **localStorage** — `taskflow.tasks.v1` va `taskflow.theme.v1` kalitlarida saqlanadi.
7. **Responsive** — 1080px / 860px / 640px breakpointlar, mobil sidebar.
8. **Qo'shimcha kreativ funksiyalar:**
   - 🌙 Dark / Light mode
   - 🍅 Pomodoro fokus taymer (25/5/15)
   - 📊 Statistika paneli: progress ring, haftalik faollik
   - ☑ Subtask checklist + progress bar
   - 🔥 Overdue (muddat o'tgan) ajratish
   - ⬇️⬆️ JSON eksport / import

## 🗂 Fayl tuzilishi

```
src/
  App.jsx      — barcha state, Kanban, modal, pomodoro, statistika
  main.jsx     — entry point
  index.css    — to'liq dizayn tizimi (light/dark + responsive)
index.html     — sarlavha va meta
```

## 🧠 Kodni tushuntirish (2 daqiqalik taqdimot rejasi)

1. `useLocalStorage` hooki state-ni localStorage bilan sinxronlaydi.
2. `tasks` — yagona manba; `filtered` — useMemo bilan qidiruv/filtr/sort.
3. `TaskCard` draggable — `dataTransfer` orqali ustunlar orasiga tashlanadi.
4. `TaskModal` — controlled form, subtask qo'shish.
5. `Pomodoro` — `setTimeout` zanjiri bilan taymer.

## 🔗 Demo

`npm run dev` → http://localhost:5173
