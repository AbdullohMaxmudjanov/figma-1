import { useEffect, useState } from "react";

/* Shared helpers (single copy, used by App + lazy views) */
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
export const todayISO = () => new Date().toISOString().slice(0, 10);
export const toISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const isOverdue = (t) => t.dueDate && t.status !== "done" && t.dueDate < todayISO();
export const prioWeight = { high: 0, medium: 1, low: 2 };

export function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) return JSON.parse(raw);
    } catch { /* ignore */ }
    return typeof initial === "function" ? initial() : initial;
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* ignore */ }
  }, [key, val]);
  return [val, setVal];
}

export const emptyForm = { title: "", desc: "", status: "todo", priority: "medium", tag: "", dueDate: "", subtasks: [] };
