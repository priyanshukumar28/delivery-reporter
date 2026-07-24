import { useState } from "react";
import styles from "../styles/dashboard.module.css";
import { SortIcon, CloseIcon } from "./icons.jsx";

const STATUS_OPTIONS = ["WIP", "On Track", "Delayed", "At Risk", "Completed"];
const CATEGORY_OPTIONS = ["Change Request", "Production Movement", "Maintenance", "Development", "Bug Fix"];

const STATUS_TAG_CLASS = {
  WIP: "tagIndigo",
  "On Track": "tagTeal",
  Delayed: "tagCrimson",
  "At Risk": "tagAmber",
  Completed: "tagMuted"
};

const CATEGORY_TAG_CLASS = {
  "Change Request": "tagIndigo",
  "Production Movement": "tagTeal",
  Maintenance: "tagMuted",
  Development: "tagIndigo",
  "Bug Fix": "tagCrimson"
};

function formatShortDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export default function DelayPanel({ items, onAdd, onDelete, filter = "" }) {
  const [module, setModule] = useState("");
  const [deliverable, setDeliverable] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[3]);
  const [receivedFrom, setReceivedFrom] = useState("");
  const [receivedDate, setReceivedDate] = useState("");
  const [originalDueDate, setOriginalDueDate] = useState("");
  const [revisedDueDate, setRevisedDueDate] = useState("");
  const [approvalTaken, setApprovalTaken] = useState(false);
  const [approvedBy, setApprovedBy] = useState("");
  const [approvedDate, setApprovedDate] = useState("");
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [reason, setReason] = useState("");
  const [sortAsc, setSortAsc] = useState(null);

  function clearForm() {
    setModule("");
    setDeliverable("");
    setCategory(CATEGORY_OPTIONS[3]);
    setReceivedFrom("");
    setReceivedDate("");
    setOriginalDueDate("");
    setRevisedDueDate("");
    setApprovalTaken(false);
    setApprovedBy("");
    setApprovedDate("");
    setStatus(STATUS_OPTIONS[0]);
    setReason("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!deliverable.trim()) return;
    onAdd({
      module: module.trim() || undefined,
      deliverable: deliverable.trim(),
      category,
      receivedFrom: receivedFrom.trim() || undefined,
      receivedDate: receivedDate || undefined,
      originalDueDate: originalDueDate || undefined,
      revisedDueDate: revisedDueDate || undefined,
      approvalTaken,
      approvedBy: approvalTaken ? (approvedBy.trim() || undefined) : undefined,
      approvedDate: approvalTaken ? (approvedDate || undefined) : undefined,
      status,
      reason: reason.trim() || undefined
    });
    clearForm();
  }

  const visible = items.filter(item => !filter || (item.module || "").toLowerCase().includes(filter.toLowerCase()));
  const sorted = sortAsc === null
    ? visible
    : [...visible].sort((a, b) => (sortAsc ? 1 : -1) * (a.deliverable || "").localeCompare(b.deliverable || ""));

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeadRow}>
        <div>
          <h3 className={styles.panelTitle}>Delivery Timeline &amp; WIP Updates</h3>
          <p className={styles.panelSubtitle}>Flag any deliverable that&apos;s slipping (e.g. bumped by an urgent requirement) or still in progress.</p>
        </div>
        <button type="button" className={styles.sortBtn} onClick={() => setSortAsc(s => !s)}>
          <SortIcon /> Sort A-Z
        </button>
      </div>

      <form className={styles.entryForm} onSubmit={handleSubmit}>
        <div className={styles.entryFormRow}>
          <div className={styles.entryField}>
            <label>Module Name</label>
            <input placeholder="e.g. Core API" value={module} onChange={e => setModule(e.target.value)} />
          </div>
          <div className={styles.entryField}>
            <label>Deliverable / Task</label>
            <input placeholder="e.g. Invoice reconciliation job" value={deliverable} onChange={e => setDeliverable(e.target.value)} required />
          </div>
        </div>

        <div className={styles.entryFormRow}>
          <div className={styles.entryField}>
            <label>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className={styles.entryField}>
            <label>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
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

        <div className={styles.entryFormRow}>
          <div className={styles.entryField}>
            <label>Original Due Date</label>
            <input type="date" value={originalDueDate} onChange={e => setOriginalDueDate(e.target.value)} />
          </div>
          <div className={styles.entryField}>
            <label>Revised Due Date</label>
            <input type="date" value={revisedDueDate} onChange={e => setRevisedDueDate(e.target.value)} />
          </div>
        </div>

        <div className={styles.entryFormRow}>
          <div className={styles.entryField}>
            <label>Revised Date Approval Taken?</label>
            <select value={approvalTaken ? "yes" : "no"} onChange={e => setApprovalTaken(e.target.value === "yes")}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
          {approvalTaken && (
            <div className={styles.entryField}>
              <label>Approved By</label>
              <input placeholder="e.g. LOB Head name" value={approvedBy} onChange={e => setApprovedBy(e.target.value)} />
            </div>
          )}
        </div>

        {approvalTaken && (
          <div className={styles.entryFormRow}>
            <div className={styles.entryField}>
              <label>Approval Date</label>
              <input type="date" value={approvedDate} onChange={e => setApprovedDate(e.target.value)} />
            </div>
            <div className={styles.entryField} />
          </div>
        )}

        <div className={styles.entryFormRow}>
          <div className={styles.entryField}>
            <label>Reason (optional)</label>
            <input placeholder="e.g. Bumped by urgent SSO requirement" value={reason} onChange={e => setReason(e.target.value)} />
          </div>
          <div className={styles.entryField} />
        </div>

        <div className={styles.entryFormActions}>
          <button className={styles.addBtn} type="submit">+ Add Update</button>
          <button className={styles.clearBtn} type="button" onClick={clearForm}>Clear Form</button>
        </div>
      </form>

      <div className={styles.tableWrap}>
        <div className={styles.delayTableHead}>
          <span>Module</span>
          <span>Deliverable</span>
          <span>Original Due</span>
          <span>Revised Due</span>
          <span>Status</span>
          <span>Details</span>
          <span>Edit</span>
        </div>
        {sorted.length === 0 && <div className={styles.empty}>No timeline changes or WIP updates logged for this date yet.</div>}
        {sorted.map(item => {
          const detailBits = [];
          if (item.receivedFrom) detailBits.push(`From: ${item.receivedFrom}`);
          if (item.receivedDate) detailBits.push(`Recd: ${formatShortDate(item.receivedDate)}`);
          if (item.reason) detailBits.push(item.reason);
          detailBits.push(item.approvalTaken
            ? `Approved${item.approvedBy ? ` by ${item.approvedBy}` : ""}${item.approvedDate ? ` on ${formatShortDate(item.approvedDate)}` : ""}`
            : "Approval not taken");

          return (
            <div className={styles.delayTableRow} key={item.id}>
              <span className={styles.rowModule}>{item.module || "—"}</span>
              <span className={styles.rowTitle}>
                {item.deliverable}
                <span className={`${styles.tag} ${styles[CATEGORY_TAG_CLASS[item.category] || "tagMuted"]}`} style={{ display: "inline-block", marginLeft: 6 }}>{item.category}</span>
              </span>
              <span className={styles.rowMuted}>{formatShortDate(item.originalDueDate)}</span>
              <span className={styles.rowMuted}>{formatShortDate(item.revisedDueDate)}</span>
              <span className={`${styles.tag} ${styles[STATUS_TAG_CLASS[item.status] || "tagMuted"]}`}>{item.status}</span>
              <span className={styles.rowRemarks}>{detailBits.join(" · ")}</span>
              <button className={styles.deleteBtn} onClick={() => onDelete(item.id)} title="Remove">
                <CloseIcon />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}