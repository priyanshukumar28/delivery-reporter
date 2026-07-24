function formatDateLong(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function buildMessageText({ date, requirements, deliveries, delays = [] }, mode = "whatsapp") {
  const bullet = mode === "email" ? "-" : "•";
  const modules = new Set([...requirements, ...deliveries].map(i => (i.module || "").toLowerCase()));
  const bugs = deliveries.filter(d => d.category === "Bug Fix").length;
  const features = deliveries.filter(d => d.category === "Development").length;
  const flagged = delays.filter(d => d.status === "Delayed" || d.status === "At Risk").length;

  const lines = [];
  lines.push(`📅 Daily Delivery Update – ${formatDateLong(date)}`, "", "📥 Requirements Received", "");

  if (requirements.length) {
    requirements.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.module}`);
      lines.push(`   ${bullet} ${item.description}`);
      lines.push(`   ${bullet} Category: ${item.category}`);
      if (item.receivedFrom) lines.push(`   ${bullet} Received From: ${item.receivedFrom}`);
      if (item.receivedDate) lines.push(`   ${bullet} Received Date: ${item.receivedDate}`);
      lines.push("");
    });
  } else {
    lines.push("No requirements received.", "");
  }

  lines.push("---", "", "✅ Deliveries Completed", "");

  if (deliveries.length) {
    deliveries.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.module}`);
      lines.push(`   ${bullet} ${item.description}`);
      lines.push(`   ${bullet} Category: ${item.category}`);
      if (item.receivedFrom) lines.push(`   ${bullet} Received From: ${item.receivedFrom}`);
      if (item.receivedDate) lines.push(`   ${bullet} Received Date: ${item.receivedDate}`);
      if (item.closedDate) lines.push(`   ${bullet} Closed Date: ${item.closedDate}`);
      if (item.remarks) lines.push(`   ${bullet} Remarks: ${item.remarks}`);
      lines.push("");
    });
  } else {
    lines.push("No deliveries completed.", "");
  }

  lines.push("---", "", "⏱ Delivery Timeline & WIP Updates", "");

  if (delays.length) {
    delays.forEach((item, index) => {
      const label = item.module ? `${item.deliverable} (${item.module})` : item.deliverable;
      lines.push(`${index + 1}. ${label} [${item.status}] — ${item.category}`);
      if (item.receivedFrom || item.receivedDate) {
        lines.push(`   ${bullet} Received: ${item.receivedFrom || "—"}${item.receivedDate ? ` on ${item.receivedDate}` : ""}`);
      }
      if (item.originalDueDate || item.revisedDueDate) {
        const from = item.originalDueDate || "—";
        const to = item.revisedDueDate || "—";
        lines.push(`   ${bullet} Timeline: ${from} -> ${to}`);
      }
      let approvalLine = "Not Taken";
      if (item.approvalTaken) {
        const bits = [];
        if (item.approvedBy) bits.push(`by ${item.approvedBy}`);
        if (item.approvedDate) bits.push(`on ${item.approvedDate}`);
        approvalLine = bits.length ? `Taken (${bits.join(", ")})` : "Taken";
      }
      lines.push(`   ${bullet} Revised Date Approval: ${approvalLine}`);
      if (item.reason) lines.push(`   ${bullet} Reason: ${item.reason}`);
      lines.push("");
    });
  } else {
    lines.push("No timeline changes or WIP updates logged for this date.", "");
  }

  lines.push(
    "---", "", "📊 Summary", "",
    `${bullet} Requirements Received : ${requirements.length}`,
    `${bullet} Deliveries Completed : ${deliveries.length}`,
    `${bullet} Modules Worked On : ${modules.size}`,
    `${bullet} Bug Fixes : ${bugs}`,
    `${bullet} Development Items : ${features}`,
    `${bullet} Delayed / At Risk Items : ${flagged}`
  );

  return lines.join("\n");
}