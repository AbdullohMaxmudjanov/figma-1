import { useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import { emptyForm, uid } from "../lib";

/* Vazifa modali — lazy chunk (faqat ochilganda yuklanadi) */
export default function TaskModal({ initial, t, onClose, onSave }) {
  const [form, setForm] = useState(initial || { ...emptyForm });
  const [newSub, setNewSub] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const addSub = () => {
    if (!newSub.trim()) return;
    set("subtasks", [...(form.subtasks || []), { id: uid(), text: newSub.trim(), done: false }]);
    setNewSub("");
  };
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={form.id ? t("mEditT") : t("mAddT")} onClick={(e) => e.stopPropagation()}>
        <h2>{form.id ? t("mEditT") : t("mAddT")}</h2>
        <p className="sub">{t("mSub")}</p>
        <div className="field"><label htmlFor="task-title">{t("fTitle")}</label>
          <input id="task-title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder={t("fTitlePh")} />
        </div>
        <div className="field"><label htmlFor="task-desc">{t("fDesc")}</label>
          <textarea id="task-desc" value={form.desc} onChange={(e) => set("desc", e.target.value)} placeholder={t("fDescPh")} />
        </div>
        <div className="grid-3">
          <div className="field"><label htmlFor="task-status">{t("fStatus")}</label>
            <select id="task-status" value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="todo">{t("todo")}</option><option value="inprogress">{t("inprogress")}</option><option value="done">{t("done")}</option>
            </select></div>
          <div className="field"><label htmlFor="task-prio">{t("fPrio")}</label>
            <select id="task-prio" value={form.priority} onChange={(e) => set("priority", e.target.value)}>
              <option value="low">{t("fLow")}</option><option value="medium">{t("fMed")}</option><option value="high">{t("fHigh")}</option>
            </select></div>
          <div className="field"><label htmlFor="task-due">{t("fDue")}</label>
            <input id="task-due" type="date" value={form.dueDate || ""} onChange={(e) => set("dueDate", e.target.value)} /></div>
        </div>
        <div className="field"><label htmlFor="task-tag">{t("fTag")}</label>
          <input id="task-tag" value={form.tag || ""} onChange={(e) => set("tag", e.target.value)} placeholder={t("fTagPh")} />
        </div>
        <div className="field"><label>{t("fSubs")} ({form.subtasks?.length || 0})</label>
          {(form.subtasks || []).map((s) => (
            <div className="sub-row" key={s.id}>
              <label><input type="checkbox" checked={!!s.done} onChange={() => set("subtasks", form.subtasks.map((x) => (x.id === s.id ? { ...x, done: !x.done } : x)))} />
                <span className={s.done ? "strike" : ""}>{s.text}</span></label>
              <button className="mini-btn" aria-label={t("subDel")} style={{ flex: "0 0 40px" }} onClick={() => set("subtasks", form.subtasks.filter((x) => x.id !== s.id))}><FiX /></button>
            </div>
          ))}
          <div className="sub-row">
            <input id="task-newsub" aria-label={t("fNewSub")} value={newSub} onChange={(e) => setNewSub(e.target.value)} placeholder={t("fNewSub")}
              onKeyDown={(e) => { if (e.key === "Enter") addSub(); }} />
            <button className="mini-btn" aria-label={t("fSave")} style={{ flex: "0 0 60px" }} onClick={addSub}><FiPlus /></button>
          </div>
        </div>
        <div className="modal-btns">
          <button className="btn-ghost" onClick={onClose}>{t("fCancel")}</button>
          <button className="btn-save" onClick={() => onSave(form)}>{t("fSave")}</button>
        </div>
      </div>
    </div>
  );
}
