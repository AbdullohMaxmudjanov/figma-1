import { FiActivity, FiAward, FiBox, FiDownload, FiGlobe, FiMoon, FiSun, FiTrash2, FiUpload } from "react-icons/fi";
import { LANGS } from "../i18n";

/* Sozlamalar sahifasi — lazy chunk */
export default function SettingsPage({ tasks, setTasks, theme, setTheme, lang, setLang, t, onExport, onImportClick }) {
  const kb = (JSON.stringify(tasks).length / 1024).toFixed(1);
  return (
    <div className="settings-grid">
      <div className="panel">
        <h3><FiSun /> {t("sAppear")}</h3>
        <p className="sub">{t("sAppearSub")}</p>
        <div className="seg">
          <button className={theme === "light" ? "active" : ""} onClick={() => setTheme("light")}><FiSun /> {t("sLight")}</button>
          <button className={theme === "dark" ? "active" : ""} onClick={() => setTheme("dark")}><FiMoon /> {t("sDark")}</button>
        </div>
      </div>
      <div className="panel">
        <h3><FiGlobe /> {t("sLang")}</h3>
        <p className="sub">{t("sLangSub")}</p>
        <div className="seg">
          {LANGS.map((l) => (
            <button key={l.code} className={lang === l.code ? "active" : ""} onClick={() => setLang(l.code)}>{l.label}</button>
          ))}
        </div>
      </div>
      <div className="panel">
        <h3><FiDownload /> {t("sData")}</h3>
        <p className="sub">{t("sDataSub")}. {t("sStorage")}: <b>{kb} KB</b></p>
        <div className="row-btns" style={{ margin: 0 }}>
          <button className="tool-btn" onClick={onExport}><FiDownload /> {t("dExport")}</button>
          <button className="tool-btn" onClick={onImportClick}><FiUpload /> {t("dImport")}</button>
        </div>
        <p className="sub" style={{ marginTop: 14, marginBottom: 8 }}>{t("sDanger")}:</p>
        <button className="tool-btn danger" onClick={() => { if (confirm(t("confirmClear"))) setTasks([]); }}>
          <FiTrash2 /> {t("dClear")}
        </button>
      </div>
      <div className="panel">
        <h3><FiAward /> {t("sAbout")}</h3>
        <p className="sub">{t("sAboutSub")}</p>
        <div className="ring-legend">
          <div><FiBox /> {t("kTotal")}: <b>{tasks.length}</b></div>
          <div><FiActivity /> {t("kDone")}: <b>{tasks.filter((x) => x.status === "done").length}</b></div>
        </div>
      </div>
    </div>
  );
}
