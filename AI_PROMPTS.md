# Foydalanilgan AI prompt

**Musobaqa talabi:** "Foydalanilgan AI prompt" ni topshirish kerak — shu fayl shuni qoplaydi.

## Asosiy prompt (bitta, to'liq)

```
React + Vite yordamida "TaskFlow — Smart Task Manager" ilovasini yarat.
Talablar:
1. Dashboard + sidebar layout
2. Vazifalar CRUD (qo'shish, tahrirlash modalda, o'chirish)
3. Todo / In Progress / Done Kanban + drag & drop
4. Qidiruv + priority/tag filter + sort (newest, oldest, due, priority)
5. localStorage da saqlash (custom hook)
6. Responsive + dark/light mode
7. Qo'shimcha: Pomodoro taymer, statistika (progress ring, haftalik bar),
   subtask checklist, overdue highlight, JSON export/import
Bitta App.jsx ichida komponentlarga bo'lib yoz, CSS ni index.css ga yoz.
Hech qanday tashqi UI kutubxona ishlatma, faqat React.
```

## Qo'shimcha aniqlashtirishlar

- `Sidebar` mobil uchun yashirinib ochiladigan bo'lsin (burger + scrim).
- `TaskCard` da subtask checkbox bevosita ishlasin.
- `Pomodoro` 25/5/15 rejimlar bilan `setTimeout` da ishlasin.
- Build `npm run build` bilan xatosiz o'tishi shart.
