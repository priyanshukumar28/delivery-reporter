import { useState } from "react";
import styles from "../styles/dashboard.module.css";
import { SortIcon, CloseIcon } from "./icons.jsx";

const TAG_CLASS = {
  Low: "tagMuted",
  Medium: "tagIndigo",
  High: "tagCrimson",
  Critical: "tagCrimson",
  "Change Request": "tagIndigo",
  "Production Movement": "tagTeal",
  Maintenance: "tagMuted",
  Development: "tagIndigo",
  "Bug Fix": "tagCrimson"
};

const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Critical"];
const CATEGORY_OPTIONS = ["Change Request", "Production Movement", "Maintenance", "Development", "Bug Fix"];

function formatShortDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export default function EntryPanel({ title, kind, items, onAdd, onDelete, emptyText, canEdit, filter = "" }) {
  const isRequirement = kind === "requirement";
  const [module, setModule] = useState("");
  const [remarks, setRemarks] = useState(""); // delivery only
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[3]); // Development
  const [priority, setPriority] = useState(PRIORITY_OPTIONS[1]); // requirement only
  const [receivedFrom, setReceivedFrom] = useState("");
  const [receivedDate, setReceivedDate] = useState("");
  const [closedDate, setClosedDate] = useState(""); // delivery only
  const [sortAsc, setSortAsc] = useState(null);

  function clearForm() {
    setModule("");
    setRemarks("");
    setDescription("");
    setCategory(CATEGORY_OPTIONS[3]);
    setPriority(PRIORITY_OPTIONS[1]);
    setReceivedFrom("");
    setReceivedDate("");
    setClosedDate("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!module.trim() || !description.trim()) return;
    if (isRequirement) {
      onAdd({
        module: module.trim(),
        description: description.trim(),
        category,
        priority,
        receivedFrom: receivedFrom.trim() || undefined,
        receivedDate: receivedDate || undefined
      });
    } else {
      onAdd({
        module: module.trim(),
        description: description.trim(),
        category,
        remarks: remarks.trim() || undefined,
        receivedFrom: receivedFrom.trim() || undefined,
        receivedDate: receivedDate || undefined,
        closedDate: closedDate || undefined
      });
    }
    clearForm();
  }

  const visible = items.filter(item => !filter || (item.module || "").toLowerCase().includes(filter.toLowerCase()));
  const sorted = sortAsc === null
    ? visible
    : [...visible].sort((a, b) => (sortAsc ? 1 : -1) * (a.module || "").localeCompare(b.module || ""));

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeadRow}>
        <h3 className={styles.panelTitle}>{title}</h3>
        <button type="button" className={styles.sortBtn} onClick={() => setSortAsc(s => !s)}>
          <SortIcon /> Sort A-Z
        </button>
      </div>

      {canEdit && (
        <form className={styles.entryForm} onSubmit={handleSubmit}>
          <div className={styles.entryFormRow}>
            <div className={styles.entryField}>
              <label>Module Name</label>
              <input placeholder="e.g. Core API" value={module} onChange={e => setModule(e.target.value)} required />
            </div>
            <div className={styles.entryField}>
              <label>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.entryField}>
            <label>{isRequirement ? "Requirement Description" : "Delivery Description"}</label>
            <textarea
              placeholder={isRequirement ? "Details of what is needed..." : "What was shipped today?"}
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              required
            />
          </div>

          <div className={styles.entryFormRow}>
            <div className={styles.entryField}>
              <label>Requirement Received From</label>
              <input placeholder="e.g. Sales / Client name" value={receivedFrom} onChange={e => setReceivedFrom(e.target.value)} />
            </div>
            <div className={styles.entryField}>
              <label>Requirement Received Date</label>
              <input type="date" value={receivedDate} onChange={e => setReceivedDate(e.target.value)} />
            </div>
          </div>

          {isRequirement ? (
            <div className={styles.entryFormRow}>
              <div className={styles.entryField}>
                <label>Priority</label>
                <select value={priority} onChange={e => setPriority(e.target.value)}>
                  {PRIORITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className={styles.entryField} />
            </div>
          ) : (
            <div className={styles.entryFormRow}>
              <div className={styles.entryField}>
                <label>Closed Date</label>
                <input type="date" value={closedDate} onChange={e => setClosedDate(e.target.value)} />
              </div>
              <div className={styles.entryField}>
                <label>Remarks (optional)</label>
                <input placeholder="Internal notes or ticket IDs..." value={remarks} onChange={e => setRemarks(e.target.value)} />
              </div>
            </div>
          )}

          <div className={styles.entryFormActions}>
            <button className={styles.addBtn} type="submit">+ {isRequirement ? "Add Requirement" : "Add Delivery"}</button>
            <button className={styles.clearBtn} type="button" onClick={clearForm}>Clear Form</button>
          </div>
        </form>
      )}

      <div className={styles.tableWrap}>
        <div className={styles.tableHead}>
          <span>Module</span>
          <span>{isRequirement ? "Requirement" : "Delivery"}</span>
          <span>Category</span>
          <span>{isRequirement ? "Priority" : "Closed Date"}</span>
          {canEdit && <span>Edit</span>}
        </div>
        {sorted.length === 0 && <div className={styles.empty}>{emptyText}</div>}
        {sorted.map(item => {
          const metaBits = [];
          if (item.receivedFrom) metaBits.push(`Received from ${item.receivedFrom}`);
          if (item.receivedDate) metaBits.push(`Received ${formatShortDate(item.receivedDate)}`);
          if (!isRequirement && item.remarks) metaBits.push(item.remarks);

          return (
            <div className={styles.tableRow} key={item.id}>
              <span className={styles.rowModule}>{item.module}</span>
              <span className={styles.rowTitle}>
                {item.description}
                {metaBits.length > 0 && <span className={styles.rowMuted} style={{ display: "block", marginTop: 2 }}>{metaBits.join(" · ")}</span>}
              </span>
              <span className={`${styles.tag} ${styles[TAG_CLASS[item.category] || "tagMuted"]}`}>{item.category}</span>
              {isRequirement ? (
                <span className={`${styles.tag} ${styles[TAG_CLASS[item.priority] || "tagMuted"]}`}>{item.priority}</span>
              ) : (
                <span className={styles.rowMuted}>{formatShortDate(item.closedDate) || "—"}</span>
              )}
              {canEdit && (
                <button className={styles.deleteBtn} onClick={() => onDelete(item.id)} title="Remove">
                  <CloseIcon />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}