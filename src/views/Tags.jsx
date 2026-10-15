import { useMemo } from "react";
import { FiEdit2, FiEye, FiTag, FiTrash2 } from "react-icons/fi";

/* Teglar sahifasi — lazy chunk */
export default function TagsPage({ tasks, setTasks, t, onView }) {
  const rows = useMemo(() => {
    const map = {};
    tasks.forEach((x) => {
      if (!x.tag) return;
      map[x.tag] = map[x.tag] || { tag: x.tag, total: 0, todo: 0, inprogress: 0, done: 0 };
      map[x.tag].total += 1;
      map[x.tag][x.status] += 1;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [tasks]);
  const rename = (tag) => {
    const name = prompt(t("tgRenamePrompt"), tag);
    if (!name || !name.trim() || name.trim() === tag) return;
    setTasks((p) => p.map((x) => (x.tag === tag ? { ...x, tag: name.trim() } : x)));
  };
  const remove = (tag) => {
    if (!confirm(`${tag}: ${t("tgDelConfirm")}?`)) return;
    setTasks((p) => p.map((x) => (x.tag === tag ? { ...x, tag: "" } : x)));
  };
  if (!rows.length) return <div className="panel"><p className="sub"><FiTag /> {t("tgEmpty")}</p></div>;
  return (
    <div className="tag-cards">
      {rows.map((r) => (
        <div className="panel tag-card" key={r.tag}>
          <div className="tag-card-head"><span className="big-tag"><FiTag /> {r.tag}</span><b>{r.total} {t("tgTasks")}</b></div>
          <div className="tag-break">
            <span><i className="sq" style={{ background: "#64748b" }} />{t("todo")}: {r.todo}</span>
            <span><i className="sq" style={{ background: "#f59e0b" }} />{t("inprogress")}: {r.inprogress}</span>
            <span><i className="sq" style={{ background: "#10b981" }} />{t("done")}: {r.done}</span>
          </div>
          <div className="tag-card-btns">
            <button className="tool-btn" onClick={() => onView(r.tag)}><FiEye /> {t("tgView")}</button>
            <button className="tool-btn" onClick={() => rename(r.tag)}><FiEdit2 /> {t("tgRename")}</button>
            <button className="tool-btn danger" onClick={() => remove(r.tag)}><FiTrash2 /> {t("tgDelete")}</button>
          </div>
        </div>
      ))}
    </div>
  );
}
