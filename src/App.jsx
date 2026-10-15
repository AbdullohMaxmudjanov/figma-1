import { Children, Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import {
  FiActivity, FiAlertCircle, FiArrowRight, FiBarChart2, FiBox, FiCalendar, FiCheck,
  FiCheckCircle, FiCheckSquare, FiClock, FiCoffee, FiColumns, FiDownload, FiEdit2,
  FiFlag, FiGlobe, FiInbox, FiMenu, FiMoon, FiPlus, FiRotateCcw, FiSearch,
  FiSettings, FiSun, FiTag, FiTrash2, FiUpload, FiX, FiZap,
} from "react-icons/fi";
import { STRINGS, LANGS, WEEKDAYS } from "./i18n";
import { uid, todayISO, isOverdue, prioWeight, useLocalStorage, emptyForm } from "./lib";

/* Ikkinchi darajali sahifalar alohida chunk'larda yuklanadi (Performance) */
const TaskModal = lazy(() => import("./components/TaskModal"));
const Pomodoro = lazy(() => import("./views/Pomodoro"));
const CalendarPage = lazy(() => import("./views/Calendar"));
const TagsPage = lazy(() => import("./views/Tags"));
const SettingsPage = lazy(() => import("./views/Settings"));

const seedTasks = () => [
  { id: uid(), title: "TaskFlow dizaynini yakunlash", desc: "Dashboard, sidebar va Kanban ustunlari uchun final UI. Dark mode bilan tekshirish.", status: "inprogress", priority: "high", tag: "Dizayn", dueDate: todayISO(), createdAt: Date.now() - 86400000 * 2, subtasks: [{ id: uid(), text: "Sidebar chizish", done: true }, { id: uid(), text: "Kanban kartalari", done: true }, { id: uid(), text: "Dark mode", done: false }] },
  { id: uid(), title: "API dan vazifalarni yuklash", desc: "Kelajakda backend ulanadi. Hozircha localStorage arxitekturasi tayyor.", status: "todo", priority: "medium", tag: "Dev", dueDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10), createdAt: Date.now() - 86400000, subtasks: [] },
  { id: uid(), title: "Taqdimot slaydlarini tayyorlash", desc: "2 daqiqalik demo: muammo, yechim, funksiyalar, kreativ g'oyalar.", status: "todo", priority: "high", tag: "Taqdimot", dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10), createdAt: Date.now() - 3600000 * 5, subtasks: [{ id: uid(), text: "Reja yozish", done: false }] },
  { id: uid(), title: "Landing page matni", desc: "Mahsulot ta'rifi va afzalliklari yozildi.", status: "done", priority: "low", tag: "Marketing", dueDate: todayISO(), createdAt: Date.now() - 86400000 * 4, subtasks: [{ id: uid(), text: "Sarlavha", done: true }] },
];

export default function App() {
  const [tasks, setTasks] = useLocalStorage("taskflow.tasks.v1", seedTasks);
  const [theme, setTheme] = useLocalStorage("taskflow.theme.v1", "light");
  const [lang, setLang] = useLocalStorage("taskflow.lang.v1", "uz");
  const [view, setView] = useState("board"); // board | dashboard | calendar | tags | settings
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const fileRef = useRef(null);

  const t = (k) => STRINGS[lang]?.[k] ?? STRINGS.uz[k] ?? k;
  const loader = (<div className="panel"><p className="sub">{t("loading")}</p></div>);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.lang = lang;
  }, [theme, lang]);

  const tags = useMemo(() => [...new Set(tasks.map((x) => x.tag).filter(Boolean))], [tasks]);

  const filtered = useMemo(() => {
    let list = [...tasks];
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((x) => (x.title + " " + (x.desc || "") + " " + (x.tag || "")).toLowerCase().includes(q));
    if (priorityFilter !== "all") list = list.filter((x) => x.priority === priorityFilter);
    if (tagFilter !== "all") list = list.filter((x) => x.tag === tagFilter);
    list.sort((a, b) => {
      if (sortBy === "due") return (a.dueDate || "9999") < (b.dueDate || "9999") ? -1 : 1;
      if (sortBy === "priority") return prioWeight[a.priority] - prioWeight[b.priority];
      if (sortBy === "oldest") return a.createdAt - b.createdAt;
      return b.createdAt - a.createdAt;
    });
    return list;
  }, [tasks, search, priorityFilter, tagFilter, sortBy]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((x) => x.status === "done").length;
    const inprog = tasks.filter((x) => x.status === "inprogress").length;
    const todo = tasks.filter((x) => x.status === "todo").length;
    const overdue = tasks.filter(isOverdue).length;
    const high = tasks.filter((x) => x.priority === "high" && x.status !== "done").length;
    return { total, done, inprog, todo, overdue, high, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [tasks]);

  const weekly = useMemo(() => {
    const days = WEEKDAYS[lang] || WEEKDAYS.uz;
    const out = days.map((d) => ({ d, created: 0 }));
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    tasks.forEach((x) => {
      const idx = Math.floor((new Date(x.createdAt) - monday) / 86400000);
      if (idx >= 0 && idx < 7) out[idx].created += 1;
    });
    return out;
  }, [tasks, lang]);

  /* ----- CRUD ----- */
  const openAdd = (status = "todo") => { setEditing({ ...emptyForm, status, id: null }); setModalOpen(true); };
  const openEdit = (task) => { setEditing({ ...task, subtasks: (task.subtasks || []).map((s) => ({ ...s })) }); setModalOpen(true); };
  const saveTask = (form) => {
    if (!form.title.trim()) { alert(t("needTitle")); return; }
    if (form.id) setTasks((p) => p.map((x) => (x.id === form.id ? { ...form, title: form.title.trim() } : x)));
    else setTasks((p) => [{ ...form, id: uid(), title: form.title.trim(), createdAt: Date.now() }, ...p]);
    setModalOpen(false); setEditing(null);
  };
  const removeTask = (id) => { if (confirm(t("delConfirm"))) setTasks((p) => p.filter((x) => x.id !== id)); };
  const moveTask = (id, status) => setTasks((p) => p.map((x) => (x.id === id ? { ...x, status } : x)));
  const advance = (task) => {
    const next = task.status === "todo" ? "inprogress" : task.status === "inprogress" ? "done" : null;
    if (next) moveTask(task.id, next);
  };
  const toggleSub = (taskId, subId) =>
    setTasks((p) => p.map((x) => (x.id === taskId ? { ...x, subtasks: (x.subtasks || []).map((s) => (s.id === subId ? { ...s, done: !s.done } : s)) } : x)));

  const onDropTo = (e, status) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/task-id");
    if (id) moveTask(id, status);
    setDragOver(null);
  };

  /* ----- export / import ----- */
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "taskflow-backup.json"; a.click();
  };
  const importJSON = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        if (Array.isArray(data)) { setTasks(data); alert(`${data.length} ${t("importedOk")}`); }
        else alert(t("badFile"));
      } catch { alert(t("badFile")); }
    };
    r.readAsText(f); e.target.value = "";
  };

  const go = (v) => { setView(v); setSidebarOpen(false); };
  const counts = {
    todo: filtered.filter((x) => x.status === "todo").length,
    inprogress: filtered.filter((x) => x.status === "inprogress").length,
    done: filtered.filter((x) => x.status === "done").length,
  };

  const titles = {
    board: [t("boardTitle"), t("boardSub")],
    dashboard: [t("dashTitle"), t("dashSub")],
    calendar: [t("calTitle"), t("calSub")],
    tags: [t("tagsTitle"), t("tagsSub")],
    settings: [t("setTitle"), t("setSub")],
  };

  return (
    <div className="app">
      <a className="skip-link" href="#main">{t("skipLink")}</a>
      {sidebarOpen && <div className="scrim" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="logo"><FiZap /></div>
          <div><h1>TaskFlow</h1><p>{t("brandSub")}</p></div>
        </div>
        <nav className="nav">
          <div className="nav-label">{t("menu")}</div>
          <NavBtn icon={<FiColumns />} label={t("navBoard")} badge={stats.total} active={view === "board"} onClick={() => go("board")} />
          <NavBtn icon={<FiBarChart2 />} label={t("navDash")} active={view === "dashboard"} onClick={() => go("dashboard")} />
          <NavBtn icon={<FiCalendar />} label={t("navCal")} active={view === "calendar"} onClick={() => go("calendar")} />
          <NavBtn icon={<FiTag />} label={t("navTags")} badge={tags.length} active={view === "tags"} onClick={() => go("tags")} />
          <NavBtn icon={<FiSettings />} label={t("navSettings")} active={view === "settings"} onClick={() => go("settings")} />
          <div className="nav-label">{t("tagsLabel")}</div>
        </nav>
        <div className="side-section">
          <div className="tag-row">
            <button className={`tag-chip ${tagFilter === "all" ? "active" : ""}`} onClick={() => setTagFilter("all")}>{t("all")}</button>
            {tags.map((tag) => (
              <button key={tag} className={`tag-chip ${tagFilter === tag ? "active" : ""}`} onClick={() => { setTagFilter(tag); go("board"); }}>#{tag}</button>
            ))}
          </div>
        </div>
        <div className="side-footer">
          <div className="promo">
            <b><FiCoffee /> {t("promoT")}</b>
            <span>{t("promoS")}</span>
            <button onClick={() => go("dashboard")}>{t("promoBtn")}</button>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="container topbar-inner">
          <button className="burger" aria-label={t("menu")} onClick={() => setSidebarOpen(true)}><FiMenu /></button>
          <div className="search"><FiSearch />
            <input aria-label={t("searchPh")} placeholder={t("searchPh")} value={search} onChange={(e) => setSearch(e.target.value)} />
            {search && <button className="x-btn" aria-label={t("clearSearch")} onClick={() => setSearch("")}><FiX /></button>}
          </div>
          <div className="top-actions">
            <label className="lang-select" title={t("sLang")}>
              <FiGlobe />
              <select aria-label={t("sLang")} value={lang} onChange={(e) => setLang(e.target.value)}>
                {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </label>
            <button className="icon-btn" title={t("themeToggle")} aria-label={t("themeToggle")} onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
              {theme === "light" ? <FiMoon /> : <FiSun />}
            </button>
            <button className="btn-primary" onClick={() => openAdd("todo")}><FiPlus /> <span className="hide-m">{t("newTask")}</span></button>
          </div>
          </div>
        </header>

        <main className="content container" id="main">
          <h2 className="page-title">{titles[view][0]}</h2>
          <p className="page-sub">{titles[view][1]}</p>

          <div className="stats">
            <StatCard tint="rgba(99,102,241,.13)" ico={<FiBox />} k={t("kTotal")} v={stats.total} s={`${stats.done} ${t("completedSoFar")}`} />
            <StatCard tint="rgba(245,158,11,.16)" ico={<FiClock />} k={t("kProg")} v={stats.inprog} s={`${stats.todo} ${t("waiting")}`} />
            <StatCard tint="rgba(16,185,129,.15)" ico={<FiCheckCircle />} k={t("kDone")} v={stats.done} s={`${stats.pct}% ${t("finished")}`} />
            <StatCard tint="rgba(239,68,68,.13)" ico={<FiAlertCircle />} k={t("kOver")} v={stats.overdue} s={`${stats.high} ${t("highPrio")}`} />
          </div>

          {view === "board" && (
            <>
              <div className="filters">
                <select className="select" aria-label={t("fPrio")} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                  <option value="all">{t("fAllPrio")}</option>
                  <option value="high">{t("fHigh")}</option>
                  <option value="medium">{t("fMed")}</option>
                  <option value="low">{t("fLow")}</option>
                </select>
                <select className="select" aria-label={t("fTag")} value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
                  <option value="all">{t("fAllTags")}</option>
                  {tags.map((x) => <option key={x} value={x}>#{x}</option>)}
                </select>
                <select className="select" aria-label={t("fSort")} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="newest">{t("fNew")}</option>
                  <option value="oldest">{t("fOld")}</option>
                  <option value="due">{t("fDue")}</option>
                  <option value="priority">{t("fPrio")}</option>
                </select>
                {(search || priorityFilter !== "all" || tagFilter !== "all") && (
                  <button className="clear-btn" onClick={() => { setSearch(""); setPriorityFilter("all"); setTagFilter("all"); }}>
                    <FiX /> {t("fClear")}
                  </button>
                )}
              </div>
              <div className="row-btns">
                <button className="tool-btn" onClick={() => openAdd("todo")}><FiPlus /> {t("todo")}</button>
                <button className="tool-btn" onClick={() => openAdd("inprogress")}><FiPlus /> {t("inprogress")}</button>
                <button className="tool-btn" onClick={() => openAdd("done")}><FiPlus /> {t("done")}</button>
                <button className="tool-btn" onClick={exportJSON}><FiDownload /> {t("dExport")}</button>
              </div>
              <div className="board">
                <Column title={t("todo")} n={counts.todo} color="#64748b" drag={dragOver === "todo"}
                  onDragOver={(e) => { e.preventDefault(); setDragOver("todo"); }} onDrop={(e) => onDropTo(e, "todo")}
                  empty={[t("emptyT"), t("emptyS")]}>
                  {filtered.filter((x) => x.status === "todo").map((x) => (
                    <TaskCard key={x.id} task={x} t={t} onEdit={() => openEdit(x)} onDelete={() => removeTask(x.id)}
                      onAdvance={() => advance(x)} onToggleSub={(s) => toggleSub(x.id, s)} nextLabel={t("nextStart")} nextIcon={<FiArrowRight />} />
                  ))}
                </Column>
                <Column title={t("inprogress")} n={counts.inprogress} color="#f59e0b" drag={dragOver === "inprogress"}
                  onDragOver={(e) => { e.preventDefault(); setDragOver("inprogress"); }} onDrop={(e) => onDropTo(e, "inprogress")}
                  empty={[t("emptyT"), t("emptyS")]}>
                  {filtered.filter((x) => x.status === "inprogress").map((x) => (
                    <TaskCard key={x.id} task={x} t={t} onEdit={() => openEdit(x)} onDelete={() => removeTask(x.id)}
                      onAdvance={() => advance(x)} onToggleSub={(s) => toggleSub(x.id, s)} nextLabel={t("nextFinish")} nextIcon={<FiCheck />} />
                  ))}
                </Column>
                <Column title={t("done")} n={counts.done} color="#10b981" drag={dragOver === "done"}
                  onDragOver={(e) => { e.preventDefault(); setDragOver("done"); }} onDrop={(e) => onDropTo(e, "done")}
                  empty={[t("emptyT"), t("emptyS")]}>
                  {filtered.filter((x) => x.status === "done").map((x) => (
                    <TaskCard key={x.id} task={x} t={t} done onEdit={() => openEdit(x)} onDelete={() => removeTask(x.id)}
                      onAdvance={() => moveTask(x.id, "todo")} onToggleSub={(s) => toggleSub(x.id, s)} nextLabel={t("nextBack")} nextIcon={<FiRotateCcw />} />
                  ))}
                </Column>
              </div>
            </>
          )}

          {view === "dashboard" && (
            <>
              <div className="progress-wrap">
                <div className="panel">
                  <h3><FiActivity /> {t("pTitle")}</h3>
                  <p className="sub">{t("pSub")}</p>
                  <div className="ring-row">
                    <svg className="ring" viewBox="0 0 120 120" role="img" aria-label={`${t("pTitle")}: ${stats.pct}%`}>
                      <circle cx="60" cy="60" r="50" fill="none" stroke="var(--bg-soft)" strokeWidth="13" />
                      <circle cx="60" cy="60" r="50" fill="none" stroke="url(#g)" strokeWidth="13" strokeLinecap="round"
                        strokeDasharray={`${(stats.pct / 100) * 314} 314`} transform="rotate(-90 60 60)" />
                      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#4f46e5" /><stop offset="100%" stopColor="#be185d" />
                      </linearGradient></defs>
                      <text x="60" y="68" textAnchor="middle" fontSize="22" fontWeight="900" fill="var(--text)">{stats.pct}%</text>
                    </svg>
                    <div className="ring-legend">
                      <div><span className="sq" style={{ background: "#64748b" }} />{t("todo")}: <b>{stats.todo}</b></div>
                      <div><span className="sq" style={{ background: "#f59e0b" }} />{t("inprogress")}: <b>{stats.inprog}</b></div>
                      <div><span className="sq" style={{ background: "#10b981" }} />{t("done")}: <b>{stats.done}</b></div>
                      <div><span className="sq" style={{ background: "#ef4444" }} />{t("fHigh")}: <b>{stats.high}</b></div>
                    </div>
                  </div>
                </div>
                <div className="panel">
                  <h3><FiBarChart2 /> {t("wTitle")}</h3>
                  <p className="sub">{t("wSub")}</p>
                  <div className="bars">
                    {weekly.map((w, i) => (
                      <div className="bar-col" key={i}>
                        <div className="bar" style={{ height: `${8 + w.created * 22}px` }} />
                        <span className="bar-day">{w.d}</span>
                      </div>
                    ))}
                  </div>
                  <div className="legend"><span><i style={{ background: "#6366f1" }} />{t("createdLeg")}</span></div>
                </div>
              </div>
              <Suspense fallback={loader}><Pomodoro t={t} /></Suspense>
              <div className="row-btns" style={{ marginTop: 16 }}>
                <button className="tool-btn" onClick={exportJSON}><FiDownload /> {t("dExport")}</button>
                <button className="tool-btn" onClick={() => fileRef.current?.click()}><FiUpload /> {t("dImport")}</button>
                <button className="tool-btn danger" onClick={() => { if (confirm(t("confirmClear"))) setTasks([]); }}><FiTrash2 /> {t("dClear")}</button>
              </div>
            </>
          )}

          {view === "calendar" && (
            <Suspense fallback={loader}><CalendarPage tasks={tasks} t={t} lang={lang} onEdit={openEdit} /></Suspense>
          )}
          {view === "tags" && (
            <Suspense fallback={loader}>
              <TagsPage tasks={tasks} setTasks={setTasks} t={t} onView={(tag) => { setTagFilter(tag); go("board"); }} />
            </Suspense>
          )}
          {view === "settings" && (
            <Suspense fallback={loader}>
              <SettingsPage tasks={tasks} setTasks={setTasks} theme={theme} setTheme={setTheme}
                lang={lang} setLang={setLang} t={t} onExport={exportJSON} onImportClick={() => fileRef.current?.click()} />
            </Suspense>
          )}
          <input ref={fileRef} type="file" accept=".json" hidden onChange={importJSON} />
        </main>
      </div>

      {modalOpen && (
        <Suspense fallback={null}>
          <TaskModal initial={editing} t={t} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={saveTask} />
        </Suspense>
      )}
    </div>
  );
}

/* ---------- small components (initial bundle) ---------- */
function NavBtn({ icon, label, badge, active, onClick }) {
  return (
    <button className={`nav-btn ${active ? "active" : ""}`} onClick={onClick}>
      <span className="ico">{icon}</span> {label}
      {badge !== undefined && <span className="count-badge">{badge}</span>}
    </button>
  );
}

function StatCard({ ico, k, v, s, tint }) {
  return <div className="stat" style={{ "--tint": tint }}><div className="dot-ico">{ico}</div><div className="k">{k}</div><div className="v">{v}</div><div className="s">{s}</div></div>;
}

function Column({ title, n, color, children, drag, onDragOver, onDrop, empty }) {
  return (
    <div className={`column ${drag ? "dragover" : ""}`} onDragOver={onDragOver} onDrop={onDrop}>
      <div className="col-head"><span className="col-dot" style={{ background: color }} /><h2>{title}</h2><span className="col-n">{n}</span></div>
      <div className="task-list">{Children.count(children)
        ? children
        : <div className="empty"><FiInbox size={22} /><p>{empty?.[0]}<br />{empty?.[1]}</p></div>}</div>
    </div>
  );
}

const PRIO_META = {
  high: { icon: <FiFlag />, cls: "high" },
  medium: { icon: <FiFlag />, cls: "medium" },
  low: { icon: <FiFlag />, cls: "low" },
};

function TaskCard({ task, t, done, onEdit, onDelete, onAdvance, onToggleSub, nextLabel, nextIcon }) {
  const total = task.subtasks?.length || 0;
  const ready = task.subtasks?.filter((s) => s.done).length || 0;
  const prio = PRIO_META[task.priority] || PRIO_META.medium;
  const prioName = task.priority === "high" ? t("fHigh") : task.priority === "medium" ? t("fMed") : t("fLow");
  return (
    <div className={`task ${done ? "done-task" : ""} ${isOverdue(task) ? "is-overdue" : ""}`} draggable
      onDragStart={(e) => e.dataTransfer.setData("text/task-id", task.id)}>
      <div className="task-top">
        <span className={`prio ${prio.cls}`}>{prio.icon} {prioName}</span>
        {task.tag && <span className="task-tag"><FiTag /> {task.tag}</span>}
      </div>
      <h3 onClick={onEdit}>{task.title}</h3>
      {task.desc && <p>{task.desc}</p>}
      {!!total && (
        <>
          <div className="sub-line"><FiCheckSquare /> {ready}/{total}</div>
          <div className="sub-progress"><i style={{ width: `${(ready / total) * 100}%` }} /></div>
          <div className="sub-list">
            {task.subtasks.slice(0, 3).map((s) => (
              <label key={s.id} className={s.done ? "is-done" : ""}>
                <input type="checkbox" checked={!!s.done} onChange={() => onToggleSub(s.id)} /> {s.text}
              </label>
            ))}
          </div>
        </>
      )}
      <div className="task-meta">
        <span className="date"><FiCalendar /> {task.dueDate || "—"}</span>
        {isOverdue(task) && <span className="overdue"><FiAlertCircle /> {t("overdueTag")}</span>}
      </div>
      <div className="task-actions">
        <button className="mini-btn" title={t("editTask")} aria-label={t("editTask")} onClick={onEdit}><FiEdit2 /></button>
        <button className="mini-btn del" title={t("delTask")} aria-label={t("delTask")} onClick={onDelete}><FiTrash2 /></button>
        <button className="mini-btn go" onClick={onAdvance}>{nextIcon} {nextLabel}</button>
      </div>
    </div>
  );
}
