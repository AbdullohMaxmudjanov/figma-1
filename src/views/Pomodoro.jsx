import { useEffect, useState } from "react";
import { FiClock, FiCoffee, FiPause, FiPlay, FiRotateCcw, FiZap } from "react-icons/fi";

/* Pomodoro fokus taymer — lazy chunk */
export default function Pomodoro({ t }) {
  const MODES = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
  const [mode, setMode] = useState("focus");
  const [left, setLeft] = useState(MODES.focus);
  const [run, setRun] = useState(false);
  const [rounds, setRounds] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (left <= 0) {
      setRun(false);
      if (mode === "focus") setRounds((r) => r + 1);
      alert(mode === "focus" ? t("focusDone") : t("breakDone"));
      return;
    }
    const id = setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => clearTimeout(id);
  }, [run, left, mode, t]);
  const switchMode = (m) => { setMode(m); setLeft(MODES[m]); setRun(false); };
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return (
    <div className="panel">
      <h3><FiCoffee /> {t("pomoT")}</h3>
      <p className="sub">{t("pomoSub")} {rounds} {t("sessDone")}.</p>
      <div className="pomo">
        <div className="pomo-time">{mm}:{ss}</div>
        <div>
          <div className="pomo-modes">
            <button className={mode === "focus" ? "active" : ""} onClick={() => switchMode("focus")}><FiZap /> {t("mFocus")}</button>
            <button className={mode === "short" ? "active" : ""} onClick={() => switchMode("short")}><FiCoffee /> {t("mShort")}</button>
            <button className={mode === "long" ? "active" : ""} onClick={() => switchMode("long")}><FiClock /> {t("mLong")}</button>
          </div>
          <div className="pomo-btns" style={{ marginTop: 9 }}>
            <button className="btn-primary" style={{ height: 40, padding: "0 18px" }} onClick={() => setRun(!run)}>
              {run ? <><FiPause /> {t("bPause")}</> : <><FiPlay /> {t("bStart")}</>}
            </button>
            <button className="tool-btn" onClick={() => { setRun(false); setLeft(MODES[mode]); }}><FiRotateCcw /> {t("bReset")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
