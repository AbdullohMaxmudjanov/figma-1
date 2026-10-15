import { useMemo, useState } from "react";
import { FiCalendar, FiChevronLeft, FiChevronRight, FiEye } from "react-icons/fi";
import { WEEKDAYS, MONTHS } from "../i18n";
import { toISO, todayISO } from "../lib";

/* Kalendar sahifasi — lazy chunk */
export default function CalendarPage({ tasks, t, lang, onEdit }) {
  const now = new Date();
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [sel, setSel] = useState(todayISO());
  const byDate = useMemo(() => {
    const map = {};
    tasks.forEach((x) => {
      if (!x.dueDate) return;
      (map[x.dueDate] = map[x.dueDate] || []).push(x);
    });
    return map;
  }, [tasks]);
  const noDue = tasks.filter((x) => !x.dueDate);
  const first = new Date(cursor.y, cursor.m, 1);
  const lead = (first.getDay() + 6) % 7;
  const days = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const isoOf = (d) => toISO(new Date(cursor.y, cursor.m, d));
  const selTasks = byDate[sel] || [];
  const shift = (dir) => setCursor((c) => {
    const n = new Date(c.y, c.m + dir, 1);
    return { y: n.getFullYear(), m: n.getMonth() };
  });
  return (
    <>
      <div className="panel">
        <div className="cal-head">
          <h3>{MONTHS[lang]?.[cursor.m]} {cursor.y}</h3>
          <div className="cal-nav">
            <button className="icon-btn sm" aria-label={t("prevM")} onClick={() => shift(-1)}><FiChevronLeft /></button>
            <button className="tool-btn" onClick={() => { setCursor({ y: now.getFullYear(), m: now.getMonth() }); setSel(todayISO()); }}>{t("cToday")}</button>
            <button className="icon-btn sm" aria-label={t("nextM")} onClick={() => shift(1)}><FiChevronRight /></button>
          </div>
        </div>
        <div className="cal-grid">
          {(WEEKDAYS[lang] || WEEKDAYS.uz).map((d) => <div key={d} className="cal-dow">{d}</div>)}
          {cells.map((d, i) => {
            if (!d) return <div key={i} className="cal-cell blank" />;
            const iso = isoOf(d);
            const list = byDate[iso] || [];
            return (
              <button key={i} className={`cal-cell ${iso === todayISO() ? "today" : ""} ${iso === sel ? "sel" : ""}`} onClick={() => setSel(iso)}>
                <span className="cal-num">{d}</span>
                {!!list.length && <span className="cal-dots">{list.slice(0, 3).map((x) => (
                  <i key={x.id} className={`dot ${x.status}`} />
                ))}{list.length > 3 && <em>+{list.length - 3}</em>}</span>}
              </button>
            );
          })}
        </div>
      </div>
      <div className="panel" style={{ marginTop: 19 }}>
        <h3><FiCalendar /> {t("cSelected")}: {sel}</h3>
        <p className="sub">{selTasks.length ? `${selTasks.length} ${t("tgTasks")}` : t("cNoTasks")}</p>
        <div className="day-list">
          {selTasks.map((x) => (
            <button key={x.id} className="day-item" onClick={() => onEdit(x)}>
              <span className={`st-dot ${x.status}`} />
              <span className="day-item-title">{x.title}</span>
              <span className="day-item-tag">{x.tag ? `#${x.tag}` : ""}</span>
              <FiEye />
            </button>
          ))}
        </div>
        {!!noDue.length && <p className="sub" style={{ marginTop: 22 }}>{t("cNoDue")}: <b>{noDue.length}</b></p>}
      </div>
    </>
  );
}
