import { useState } from "react";
import styles from "../styles/dashboard.module.css";
import { buildMessageText } from "../utils/message.js";
import { CopyIcon, DownloadIcon, PrintIcon, TrashIcon } from "./icons.jsx";

export default function ExportPanel({ date, requirements, deliveries, report, generating, onGenerate, onClearToday }) {
  const [copied, setCopied] = useState("");

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
    const current = report || (await onGenerate());
    if (current?.imageUrl) window.open(current.imageUrl, "_blank");
  }

  function print() {
    window.print();
  }

  async function clearToday() {
    if (!window.confirm(`Delete all ${requirements.length + deliveries.length} requirement/delivery entries logged for ${date}? This cannot be undone.`)) return;
    await onClearToday();
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
        <button className={styles.exportDanger} onClick={clearToday}>
          <TrashIcon /> Clear Today&apos;s Data
        </button>
      </div>
    </div>
  );
}
