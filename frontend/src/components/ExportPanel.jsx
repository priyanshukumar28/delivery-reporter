import { useState } from "react";
import api from "../api/client";
import styles from "../styles/dashboard.module.css";
import { buildMessageText } from "../utils/message.js";
import { CopyIcon, DownloadIcon, PrintIcon, TrashIcon } from "./icons.jsx";

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 5L2 7" />
    </svg>
  );
}

export default function ExportPanel({ date, requirements, deliveries, generating, onGenerate, onClearToday }) {
  const [copied, setCopied] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  async function copy(mode) {
    const text = buildMessageText({ date, requirements, deliveries }, mode);
    await navigator.clipboard.writeText(text);
    setCopied(mode);
    setTimeout(() => setCopied(""), 1800);
  }

  function downloadTxt() {
    const text = buildMessageText({ date, requirements, deliveries }, "email");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `delivery-report-${date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadPng() {
    const current = await onGenerate();
    if (current?.imageUrl) window.open(current.imageUrl, "_blank");
  }

  function print() {
    window.print();
  }

  async function clearToday() {
    if (!window.confirm(`Delete all ${requirements.length + deliveries.length} requirement/delivery entries logged for ${date}? This cannot be undone.`)) return;
    await onClearToday();
  }

  async function emailToHead() {
    setSendingEmail(true);
    try {
      const { data } = await api.post("/reports/email", { date });
      window.alert(`Report emailed to ${data.to}.`);
    } catch (err) {
      window.alert(err.response?.data?.error || "Failed to send email.");
    } finally {
      setSendingEmail(false);
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeadRow}>
        <h3 className={styles.panelTitle}>Export Options</h3>
      </div>
      <div className={styles.exportRow}>
        <button className={styles.exportPrimary} onClick={() => copy("whatsapp")}>
          <CopyIcon /> {copied === "whatsapp" ? "Copied!" : "Copy WhatsApp Message"}
        </button>
        <button className={styles.exportPrimary} onClick={() => copy("email")}>
          <CopyIcon /> {copied === "email" ? "Copied!" : "Copy Email Message"}
        </button>
        <button className={styles.exportGhost} onClick={downloadTxt}>
          <DownloadIcon /> Download as TXT
        </button>
        <button className={styles.exportGhost} onClick={downloadPng} disabled={generating}>
          <DownloadIcon /> {generating ? "Generating..." : "Download as PNG"}
        </button>
        <button className={styles.exportGhost} onClick={print}>
          <PrintIcon /> Print
        </button>
        <button className={styles.exportPrimary} onClick={emailToHead} disabled={sendingEmail}>
          <MailIcon /> {sendingEmail ? "Sending..." : "Email to LOB Head"}
        </button>
        <button className={styles.exportDanger} onClick={clearToday}>
          <TrashIcon /> Clear Today&apos;s Data
        </button>
      </div>
    </div>
  );
}