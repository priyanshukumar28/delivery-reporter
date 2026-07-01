function formatDateLong(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function buildMessageText({ date, requirements, deliveries }, mode = "whatsapp") {
  const bullet = mode === "email" ? "-" : "•";
  const modules = new Set([...requirements, ...deliveries].map(i => (i.module || "").toLowerCase()));
  const bugs = deliveries.filter(d => d.type === "Bug Fix").length;
  const features = deliveries.filter(d => d.type === "Feature").length;

  const lines = [];
  lines.push(`📅 Daily Delivery Update – ${formatDateLong(date)}`, "", "📥 Requirements Received", "");

  if (requirements.length) {
    requirements.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.module}`);
      lines.push(`   ${bullet} ${item.description}`);
      if (item.requestedBy) lines.push(`   ${bullet} Requested By: ${item.requestedBy}`);
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
      lines.push(`   ${bullet} Type: ${item.type}`);
      if (item.remarks) lines.push(`   ${bullet} Remarks: ${item.remarks}`);
      lines.push("");
    });
  } else {
    lines.push("No deliveries completed.", "");
  }

  lines.push(
    "---", "", "📊 Summary", "",
    `${bullet} Requirements Received : ${requirements.length}`,
    `${bullet} Deliveries Completed : ${deliveries.length}`,
    `${bullet} Modules Worked On : ${modules.size}`,
    `${bullet} Bug Fixes : ${bugs}`,
    `${bullet} Features Delivered : ${features}`
  );

  return lines.join("\n");
}
