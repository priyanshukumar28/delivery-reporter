import styles from "../styles/dashboard.module.css";

function formatDateLong(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function MessagePreview({ date, requirements, deliveries }) {
  const modules = new Set([...requirements, ...deliveries].map(i => i.module).filter(Boolean));
  const bugs = deliveries.filter(d => d.type === "Bug Fix").length;
  const features = deliveries.filter(d => d.type === "Feature").length;

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeadRow}>
        <h3 className={styles.panelTitle}>Message Preview</h3>
      </div>
      <div className={styles.messageBox}>
        <p className={styles.msgHeading}>📅 Daily Delivery Update – {formatDateLong(date)}</p>

        <p className={styles.msgSection}>📥 Requirements Received</p>
        {requirements.length ? (
          <ul className={styles.msgList}>
            {requirements.map(item => (
              <li key={item.id}>{item.module}: {item.description} ({item.priority})</li>
            ))}
          </ul>
        ) : (
          <p className={styles.msgEmpty}>No requirements received.</p>
        )}

        <hr className={styles.msgRule} />

        <p className={styles.msgSection}>✅ Deliveries Completed</p>
        {deliveries.length ? (
          <ul className={styles.msgList}>
            {deliveries.map(item => (
              <li key={item.id}>{item.module}: {item.description} [{item.type}]</li>
            ))}
          </ul>
        ) : (
          <p className={styles.msgEmpty}>No deliveries completed.</p>
        )}

        <hr className={styles.msgRule} />

        <p className={styles.msgSection}>📊 Summary</p>
        <ul className={styles.msgList}>
          <li>Requirements Received : {requirements.length}</li>
          <li>Deliveries Completed : {deliveries.length}</li>
          <li>Modules Worked On : {modules.size}</li>
          <li>Bug Fixes : {bugs}</li>
          <li>Features Delivered : {features}</li>
        </ul>
      </div>
    </div>
  );
}
