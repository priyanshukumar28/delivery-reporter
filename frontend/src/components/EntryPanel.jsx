import { useState } from "react";
import styles from "../styles/dashboard.module.css";
import { SortIcon, CloseIcon } from "./icons.jsx";

const TAG_CLASS = {
  Low: "tagMuted",
  Medium: "tagIndigo",
  High: "tagCrimson",
  Critical: "tagCrimson",
  Feature: "tagIndigo",
  "Bug Fix": "tagCrimson",
  Enhancement: "tagTeal",
  Configuration: "tagMuted",
  Support: "tagMuted"
};

const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Critical"];
const TYPE_OPTIONS = ["Feature", "Enhancement", "Bug Fix", "Configuration", "Support"];

export default function EntryPanel({ title, kind, items, onAdd, onDelete, emptyText, canEdit, filter = "" }) {
  const isRequirement = kind === "requirement";
  const [module, setModule] = useState("");
  const [side, setSide] = useState(isRequirement ? "" : TYPE_OPTIONS[0]); // requestedBy or type
  const [description, setDescription] = useState("");
  const [tail, setTail] = useState(isRequirement ? PRIORITY_OPTIONS[1] : ""); // priority or remarks
  const [sortAsc, setSortAsc] = useState(null);

  function clearForm() {
    setModule("");
    setSide(isRequirement ? "" : TYPE_OPTIONS[0]);
    setDescription("");
    setTail(isRequirement ? PRIORITY_OPTIONS[1] : "");
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!module.trim() || !description.trim()) return;
    if (isRequirement) {
      onAdd({ module: module.trim(), description: description.trim(), requestedBy: side.trim() || undefined, priority: tail });
    } else {
      onAdd({ module: module.trim(), description: description.trim(), type: side, remarks: tail.trim() || undefined });
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
            {isRequirement ? (
              <div className={styles.entryField}>
                <label>Requested By</label>
                <input placeholder="e.g. Sales" value={side} onChange={e => setSide(e.target.value)} />
              </div>
            ) : (
              <div className={styles.entryField}>
                <label>Delivery Type</label>
                <select value={side} onChange={e => setSide(e.target.value)}>
                  {TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            )}
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

          <div className={styles.entryField}>
            <label>{isRequirement ? "Priority" : "Remarks (optional)"}</label>
            {isRequirement ? (
              <select value={tail} onChange={e => setTail(e.target.value)}>
                {PRIORITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : (
              <input placeholder="Internal notes or ticket IDs..." value={tail} onChange={e => setTail(e.target.value)} />
            )}
          </div>

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
          <span>{isRequirement ? "Requested By" : "Type"}</span>
          <span>{isRequirement ? "Priority" : "Remarks"}</span>
          {canEdit && <span>Edit</span>}
        </div>
        {sorted.length === 0 && <div className={styles.empty}>{emptyText}</div>}
        {sorted.map(item => (
          <div className={styles.tableRow} key={item.id}>
            <span className={styles.rowModule}>{item.module}</span>
            <span className={styles.rowTitle}>{item.description}</span>
            {isRequirement ? (
              <span className={styles.rowMuted}>{item.requestedBy || "—"}</span>
            ) : (
              <span className={`${styles.tag} ${styles[TAG_CLASS[item.type] || "tagMuted"]}`}>{item.type}</span>
            )}
            {isRequirement ? (
              <span className={`${styles.tag} ${styles[TAG_CLASS[item.priority] || "tagMuted"]}`}>{item.priority}</span>
            ) : (
              <span className={styles.rowRemarks}>{item.remarks || "—"}</span>
            )}
            {canEdit && (
              <button className={styles.deleteBtn} onClick={() => onDelete(item.id)} title="Remove">
                <CloseIcon />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
