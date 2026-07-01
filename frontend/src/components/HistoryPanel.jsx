import styles from "../styles/dashboard.module.css";
import { HistoryIcon } from "./icons.jsx";

export default function HistoryPanel({ history, date, onSelectDate, onSave, saving }) {
  return (
    <div className={styles.panel} id="history">
      <div className={styles.panelHeadRow}>
        <h3 className={styles.panelTitle}>History</h3>
        <button className={styles.exportPrimary} onClick={onSave} disabled={saving}>
          <HistoryIcon /> {saving ? "Saving..." : "Save Today to History"}
        </button>
      </div>

      {history.length === 0 ? (
        <div className={styles.historyEmpty}>
          <span className={styles.historyEmptyIcon}><HistoryIcon /></span>
          <span>No previous reports saved yet.</span>
        </div>
      ) : (
        <div className={styles.historyList}>
          {history.map(item => (
            <div
              key={item.id}
              className={`${styles.historyItem} ${item.date === date ? styles.active : ""}`}
              onClick={() => onSelectDate(item.date)}
            >
              <span className={styles.historyDate}>{item.date}</span>
              <span className={styles.historyMeta}>
                {item.requirements} reqs &middot; {item.deliveries} deliveries
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
