const { createCanvas } = require("@napi-rs/canvas");

const COLOR = {
  navy: "#0B1D3A",
  navyDeep: "#152A52",
  paper: "#F7F9FC",
  card: "#FFFFFF",
  line: "#E5E7EB",
  muted: "#6B7280",
  ink: "#1F2937",

  blue: "#2563EB",
  blueSoft: "#DBEAFE",
  green: "#16A34A",
  greenSoft: "#DCFCE7",
  purple: "#7C3AED",
  purpleSoft: "#EDE9FE",
  orange: "#EA580C",
  orangeSoft: "#FFEDD5",
  teal: "#0E7C66",
  tealSoft: "#E3F4EF"
};

const CATEGORY_COLOR = {
  "Change Request": { fg: COLOR.blue, bg: COLOR.blueSoft },
  "Production Movement": { fg: COLOR.teal, bg: COLOR.tealSoft },
  Maintenance: { fg: COLOR.muted, bg: "#EEEEEE" },
  Development: { fg: COLOR.purple, bg: COLOR.purpleSoft },
  "Bug Fix": { fg: COLOR.orange, bg: COLOR.orangeSoft }
};

const PRIORITY_COLOR = {
  Low: { fg: COLOR.muted, bg: "#EEEEEE" },
  Medium: { fg: COLOR.blue, bg: COLOR.blueSoft },
  High: { fg: COLOR.orange, bg: COLOR.orangeSoft },
  Critical: { fg: "#FFFFFF", bg: "#DC2626" }
};

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function text(ctx, str, x, y, { size = 16, weight = 400, color = COLOR.ink, font = "sans-serif", align = "left" } = {}) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(str, x, y);
}

function wrapLines(ctx, str, maxWidth, size, weight, font) {
  ctx.font = `${weight} ${size}px ${font}`;
  const words = String(str).split(" ");
  const lines = [];
  let line = "";
  words.forEach(word => {
    const trial = line ? `${line} ${word}` : word;
    if (ctx.measureText(trial).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = trial;
    }
  });
  if (line) lines.push(line);
  return lines;
}

function pill(ctx, label, x, y, { fg, bg }) {
  ctx.font = "700 12px sans-serif";
  const padX = 9;
  const w = ctx.measureText(label).width + padX * 2;
  const h = 21;
  ctx.fillStyle = bg;
  roundRect(ctx, x, y, w, h, 6);
  ctx.fill();
  text(ctx, label, x + padX, y + 14.5, { size: 12, weight: 700, color: fg });
  return w;
}

function circleBadge(ctx, cx, cy, r, bg) {
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

function letterBadge(ctx, cx, cy, r, letter, bg, fg) {
  circleBadge(ctx, cx, cy, r, bg);
  text(ctx, letter, cx, cy + r * 0.35, { size: r * 1.05, weight: 800, color: fg, align: "center" });
}

function drawCheck(ctx, cx, cy, s, color, lw = 3) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.48, cy + s * 0.02);
  ctx.lineTo(cx - s * 0.12, cy + s * 0.38);
  ctx.lineTo(cx + s * 0.5, cy - s * 0.38);
  ctx.stroke();
}

function drawCalendarIcon(ctx, cx, cy, s, color, lw = 2.4) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineJoin = "round";
  const w = s, h = s * 0.86;
  roundRect(ctx, cx - w / 2, cy - h / 2, w, h, 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, cy - h / 2 + h * 0.32);
  ctx.lineTo(cx + w / 2, cy - h / 2 + h * 0.32);
  ctx.stroke();
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.22, cy - h / 2 - h * 0.1);
  ctx.lineTo(cx - w * 0.22, cy - h / 2 + h * 0.14);
  ctx.moveTo(cx + w * 0.22, cy - h / 2 - h * 0.1);
  ctx.lineTo(cx + w * 0.22, cy - h / 2 + h * 0.14);
  ctx.stroke();
}

function drawDownloadIcon(ctx, cx, cy, s, color, lw = 3) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(cx, cy - s * 0.48);
  ctx.lineTo(cx, cy + s * 0.14);
  ctx.moveTo(cx - s * 0.28, cy - s * 0.14);
  ctx.lineTo(cx, cy + s * 0.18);
  ctx.lineTo(cx + s * 0.28, cy - s * 0.14);
  ctx.moveTo(cx - s * 0.48, cy + s * 0.48);
  ctx.lineTo(cx + s * 0.48, cy + s * 0.48);
  ctx.stroke();
}

function drawUpRightIcon(ctx, cx, cy, s, color, lw = 3) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.4, cy + s * 0.4);
  ctx.lineTo(cx + s * 0.42, cy - s * 0.42);
  ctx.moveTo(cx - s * 0.02, cy - s * 0.42);
  ctx.lineTo(cx + s * 0.42, cy - s * 0.42);
  ctx.lineTo(cx + s * 0.42, cy + s * 0.02);
  ctx.stroke();
}

function drawListIcon(ctx, cx, cy, s, color, lw = 2.4) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = "round";
  [-0.32, 0, 0.32].forEach(o => {
    ctx.beginPath();
    ctx.arc(cx - s * 0.4, cy + s * o, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.24, cy + s * o);
    ctx.lineTo(cx + s * 0.42, cy + s * o);
    ctx.stroke();
  });
}

function drawStar(ctx, cx, cy, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? s * 0.5 : s * 0.22;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function drawClockIcon(ctx, cx, cy, s, color, lw = 2.4) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy, s * 0.48, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx, cy - s * 0.28);
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + s * 0.2, cy + s * 0.05);
  ctx.stroke();
}

function drawClipboardIcon(ctx, cx, cy, s, color, lw = 2.6) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  const w = s * 0.62, h = s * 0.82;
  roundRect(ctx, cx - w / 2, cy - h / 2, w, h, 8);
  ctx.stroke();
  roundRect(ctx, cx - w * 0.22, cy - h / 2 - h * 0.07, w * 0.44, h * 0.14, 4);
  ctx.stroke();
  ctx.beginPath();
  [-0.08, 0.08, 0.24].forEach(o => {
    ctx.moveTo(cx - w * 0.28, cy + h * o);
    ctx.lineTo(cx + w * 0.28, cy + h * o);
  });
  ctx.stroke();
}

function drawBoxWithCheck(ctx, cx, cy, s, color, lw = 2.6) {
  drawBoxIcon(ctx, cx, cy, s, color, lw);
  const bx = cx + s * 0.32, by = cy + s * 0.28, br = s * 0.16;
  circleBadge(ctx, bx, by, br, COLOR.greenSoft);
  drawCheck(ctx, bx, by, br * 1.1, COLOR.green, br * 0.24);
}

function drawBoxIcon(ctx, cx, cy, s, color, lw = 2.6) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineJoin = "round";
  const w = s * 0.82, h = s * 0.7, top = s * 0.24;
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, cy - h / 2 + top);
  ctx.lineTo(cx, cy - h / 2 - top * 0.15);
  ctx.lineTo(cx + w / 2, cy - h / 2 + top);
  ctx.lineTo(cx + w / 2, cy + h / 2);
  ctx.lineTo(cx, cy + h / 2 + top * 0.15);
  ctx.lineTo(cx - w / 2, cy + h / 2);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, cy - h / 2 + top);
  ctx.lineTo(cx, cy + top * 0.05);
  ctx.lineTo(cx + w / 2, cy - h / 2 + top);
  ctx.moveTo(cx, cy + top * 0.05);
  ctx.lineTo(cx, cy + h / 2 + top * 0.15);
  ctx.stroke();
}

function drawPuzzleIcon(ctx, cx, cy, s, color, lw = 2.4) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineJoin = "round";
  const w = s * 0.66, h = s * 0.66, bump = s * 0.13;
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, cy - h / 2);
  ctx.lineTo(cx + w / 2 - bump * 1.3, cy - h / 2);
  ctx.arc(cx + w / 2 - bump * 1.3, cy - bump * 0.1, bump, -Math.PI / 2, Math.PI / 2, false);
  ctx.lineTo(cx + w / 2 - bump * 1.3, cy + h / 2);
  ctx.lineTo(cx - w / 2, cy + h / 2);
  ctx.lineTo(cx - w / 2, cy + bump * 1.1);
  ctx.arc(cx - w / 2, cy + bump * 0.1, bump, Math.PI / 2, -Math.PI / 2, false);
  ctx.lineTo(cx - w / 2, cy - h / 2);
  ctx.closePath();
  ctx.stroke();
}

function formatDateLong(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatWeekday(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-GB", { weekday: "long" });
}

function statTiles(requirements, deliveries) {
  const modules = new Set([...requirements, ...deliveries].map(i => i.module).filter(Boolean)).size;
  const bugFixes = deliveries.filter(d => d.category === "Bug Fix").length;
  const devItems = deliveries.filter(d => d.category === "Development").length;
  return [
    { letter: "R", icon: null, value: requirements.length, label: ["Requirements", "Received"], fg: COLOR.blue, bg: COLOR.blueSoft },
    { letter: null, icon: "check", value: deliveries.length, label: ["Deliveries", "Completed"], fg: COLOR.green, bg: COLOR.greenSoft },
    { letter: "M", icon: null, value: modules, label: ["Modules", "Worked On"], fg: COLOR.purple, bg: COLOR.purpleSoft },
    { letter: "B", icon: null, value: bugFixes, label: ["Bug Fixes", "Delivered"], fg: COLOR.orange, bg: COLOR.orangeSoft },
    { letter: "D", icon: null, value: devItems, label: ["Development", "Items"], fg: COLOR.blue, bg: COLOR.blueSoft }
  ];
}

function drawBadgeIcon(ctx, tile, cx, cy, r) {
  circleBadge(ctx, cx, cy, r, tile.bg);
  if (tile.icon === "check") {
    drawCheck(ctx, cx, cy, r * 1.05, tile.fg, r * 0.16);
  } else {
    text(ctx, tile.letter, cx, cy + r * 0.35, { size: r * 1.05, weight: 800, color: tile.fg, align: "center" });
  }
}

/**
 * Renders the WhatsApp-shareable daily delivery summary card.
 * data: { lobName, date, requirements: [{description, priority, category, module, requestedBy, receivedFrom, receivedDate}],
 *         deliveries: [{description, category, module, remarks, receivedFrom, receivedDate, closedDate}] }
 */
function renderDailyLedger(data) {
  const W = 1024;
  const PAD = 32;
  const contentW = W - PAD * 2;

  const headerY = 24, headerH = 190;
  const gap = 24;

  const statY = headerY + headerH + gap;
  const statH = 190;
  const statGap = 16;
  const statW = (contentW - statGap * 4) / 5;

  const rowH = 92;
  const EMPTY_PANEL_H = 300;
  const panel1Y = statY + statH + gap;
  const panel1H = Math.max(EMPTY_PANEL_H, 118 + Math.max(data.requirements.length, data.deliveries.length, 1) * rowH);
  const panelW = (contentW - gap) / 2;

  const panel2Y = panel1Y + panel1H + gap;
  const modules = [...new Set([...data.requirements, ...data.deliveries].map(i => i.module).filter(Boolean))];
  const modulesRows = Math.ceil(modules.length / 3);
  const panel2H = Math.max(230, 90 + Math.max(1, modulesRows) * 44);

  const footerY = panel2Y + panel2H + gap;
  const footerH = 100;
  const height = footerY + footerH + PAD;

  const canvas = createCanvas(W, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = COLOR.paper;
  ctx.fillRect(0, 0, W, height);

  // ---- Header banner ----
  const grad = ctx.createLinearGradient(PAD, headerY, W - PAD, headerY + headerH);
  grad.addColorStop(0, COLOR.navy);
  grad.addColorStop(1, COLOR.navyDeep);
  ctx.fillStyle = grad;
  roundRect(ctx, PAD, headerY, contentW, headerH, 20);
  ctx.fill();

  circleBadge(ctx, PAD + 66, headerY + headerH / 2, 44, COLOR.blue);
  drawCheck(ctx, PAD + 66, headerY + headerH / 2, 46, "#FFFFFF", 7);

  text(ctx, "Daily Delivery Update", PAD + 130, headerY + 78, { size: 38, weight: 800, color: "#FFFFFF", font: "sans-serif" });
  text(ctx, data.lobName, PAD + 130, headerY + 118, { size: 21, weight: 700, color: "#BFD0F7" });

  const badgeSize = 52;
  const badgeX = W - PAD - 220;
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  roundRect(ctx, badgeX, headerY + headerH / 2 - badgeSize / 2, badgeSize, badgeSize, 12);
  ctx.fill();
  drawCalendarIcon(ctx, badgeX + badgeSize / 2, headerY + headerH / 2, badgeSize * 0.5, "#FFFFFF", 2.6);
  text(ctx, formatDateLong(data.date), badgeX + badgeSize + 18, headerY + headerH / 2 - 4, { size: 21, weight: 800, color: "#FFFFFF" });
  text(ctx, formatWeekday(data.date), badgeX + badgeSize + 18, headerY + headerH / 2 + 22, { size: 15, weight: 500, color: "#BFD0F7" });

  // ---- Stat tiles ----
  const tiles = statTiles(data.requirements, data.deliveries);
  tiles.forEach((tile, i) => {
    const x = PAD + i * (statW + statGap);
    ctx.fillStyle = tile.bg;
    roundRect(ctx, x, statY, statW, statH, 14);
    ctx.globalAlpha = 0.35;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = COLOR.card;
    roundRect(ctx, x, statY, statW, statH, 14);
    ctx.fill();
    ctx.strokeStyle = COLOR.line;
    ctx.lineWidth = 1;
    roundRect(ctx, x, statY, statW, statH, 14);
    ctx.stroke();

    const cx = x + statW / 2;
    drawBadgeIcon(ctx, tile, cx, statY + 54, 28);
    text(ctx, String(tile.value), cx, statY + 128, { size: 34, weight: 800, color: tile.fg, align: "center" });
    text(ctx, tile.label[0], cx, statY + 156, { size: 13.5, weight: 700, color: COLOR.ink, align: "center" });
    text(ctx, tile.label[1], cx, statY + 174, { size: 13.5, weight: 500, color: COLOR.muted, align: "center" });
  });

  // ---- Requirements / Deliveries panels ----
  function drawEntryPanel(x, title, accent, accentBg, items, iconFn, emptyIconFn, emptyText, renderTagFn, metaFn) {
    ctx.fillStyle = COLOR.card;
    roundRect(ctx, x, panel1Y, panelW, panel1H, 14);
    ctx.fill();
    ctx.strokeStyle = COLOR.line;
    roundRect(ctx, x, panel1Y, panelW, panel1H, 14);
    ctx.stroke();

    const headCx = x + 44, headCy = panel1Y + 46;
    circleBadge(ctx, headCx, headCy, 22, accentBg);
    iconFn(ctx, headCx, headCy, 22, accent, 3);
    text(ctx, title, x + 78, panel1Y + 54, { size: 20, weight: 800, color: accent });

    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 24, panel1Y + 76);
    ctx.lineTo(x + panelW - 24, panel1Y + 76);
    ctx.stroke();

    if (!items.length) {
      const cx = x + panelW / 2;
      const cy = panel1Y + 76 + (panel1H - 76) / 2 - 20;
      emptyIconFn(ctx, cx, cy, 74, "#C7CDD8", 2.4);
      text(ctx, emptyText, cx, cy + 68, { size: 15, weight: 700, color: COLOR.muted, align: "center" });
      return;
    }

    let y = panel1Y + 76 + 26;
    items.forEach((item, index) => {
      const rowTop = y;
      const tagInfo = renderTagFn(item);
      const tagW = pill(ctx, tagInfo.label, x + 54, rowTop, tagInfo.color);
      const lineBaseline = rowTop + 14.5;
      text(ctx, String(index + 1).padStart(2, "0"), x + 24, lineBaseline, { size: 12, weight: 700, color: COLOR.muted, font: "monospace" });
      text(ctx, item.module, x + 54 + tagW + 10, lineBaseline, { size: 13, weight: 700, color: COLOR.ink });
      const lines = wrapLines(ctx, item.description, panelW - 48, 14, 600, "sans-serif");
      text(ctx, lines[0] || "", x + 24, rowTop + 42, { size: 14, weight: 600, color: COLOR.ink });
      const meta = metaFn(item);
      if (meta) text(ctx, meta, x + 24, rowTop + 62, { size: 12, weight: 500, color: COLOR.muted });
      if (index < items.length - 1) {
        ctx.strokeStyle = COLOR.line;
        ctx.beginPath();
        ctx.moveTo(x + 24, rowTop + rowH - 12);
        ctx.lineTo(x + panelW - 24, rowTop + rowH - 12);
        ctx.stroke();
      }
      y += rowH;
    });
  }

  function requirementMeta(item) {
    const bits = [];
    if (item.requestedBy) bits.push(`Requested by ${item.requestedBy}`);
    if (item.receivedFrom) bits.push(`Received from ${item.receivedFrom}`);
    if (item.receivedDate) bits.push(`Recd ${item.receivedDate}`);
    return bits.join("  \u00B7  ");
  }

  function deliveryMeta(item) {
    const bits = [];
    if (item.receivedFrom) bits.push(`From ${item.receivedFrom}`);
    if (item.receivedDate) bits.push(`Recd ${item.receivedDate}`);
    if (item.closedDate) bits.push(`Closed ${item.closedDate}`);
    if (item.remarks) bits.push(item.remarks);
    return bits.join("  \u00B7  ");
  }

  drawEntryPanel(
    PAD, "Requirements Received", COLOR.blue, COLOR.blueSoft,
    data.requirements, drawDownloadIcon, drawClipboardIcon, "No requirements received.",
    item => ({ label: item.priority, color: PRIORITY_COLOR[item.priority] || PRIORITY_COLOR.Medium }),
    requirementMeta
  );
  drawEntryPanel(
    PAD + panelW + gap, "Deliveries Completed", COLOR.green, COLOR.greenSoft,
    data.deliveries, drawCheck, drawBoxWithCheck, "No deliveries completed.",
    item => ({ label: item.category, color: CATEGORY_COLOR[item.category] || CATEGORY_COLOR.Development }),
    deliveryMeta
  );

  // ---- Summary Overview panel ----
  const sumX = PAD;
  ctx.fillStyle = COLOR.card;
  roundRect(ctx, sumX, panel2Y, panelW, panel2H, 14);
  ctx.fill();
  ctx.strokeStyle = COLOR.line;
  roundRect(ctx, sumX, panel2Y, panelW, panel2H, 14);
  ctx.stroke();

  circleBadge(ctx, sumX + 44, panel2Y + 46, 22, COLOR.blueSoft);
  drawUpRightIcon(ctx, sumX + 44, panel2Y + 46, 22, COLOR.blue, 3);
  text(ctx, "Summary Overview", sumX + 78, panel2Y + 54, { size: 20, weight: 800, color: COLOR.blue });
  ctx.strokeStyle = COLOR.blue;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sumX + 24, panel2Y + 76);
  ctx.lineTo(sumX + panelW - 24, panel2Y + 76);
  ctx.stroke();

  const miniW = (panelW - 48) / 5;
  tiles.forEach((tile, i) => {
    const cx = sumX + 24 + miniW * i + miniW / 2;
    const cy = panel2Y + 76 + 44;
    drawBadgeIcon(ctx, tile, cx, cy, 20);
    text(ctx, String(tile.value), cx, cy + 46, { size: 22, weight: 800, color: tile.fg, align: "center" });
    text(ctx, tile.label[0], cx, cy + 66, { size: 11, weight: 700, color: COLOR.ink, align: "center" });
    text(ctx, tile.label[1], cx, cy + 80, { size: 11, weight: 500, color: COLOR.muted, align: "center" });
  });

  // ---- Modules Worked On panel ----
  const modX = PAD + panelW + gap;
  ctx.fillStyle = COLOR.card;
  roundRect(ctx, modX, panel2Y, panelW, panel2H, 14);
  ctx.fill();
  ctx.strokeStyle = COLOR.line;
  roundRect(ctx, modX, panel2Y, panelW, panel2H, 14);
  ctx.stroke();

  circleBadge(ctx, modX + 44, panel2Y + 46, 22, COLOR.orangeSoft);
  drawListIcon(ctx, modX + 44, panel2Y + 46, 22, COLOR.orange, 2.6);
  text(ctx, "Modules Worked On", modX + 78, panel2Y + 54, { size: 20, weight: 800, color: COLOR.orange });
  ctx.strokeStyle = COLOR.orange;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(modX + 24, panel2Y + 76);
  ctx.lineTo(modX + panelW - 24, panel2Y + 76);
  ctx.stroke();

  if (!modules.length) {
    const cx = modX + panelW / 2;
    const cy = panel2Y + 76 + (panel2H - 76) / 2 - 18;
    drawPuzzleIcon(ctx, cx, cy, 80, "#F0B27A", 2.4);
    text(ctx, "No modules yet", cx, cy + 62, { size: 15, weight: 700, color: COLOR.muted, align: "center" });
  } else {
    let mx = modX + 24, my = panel2Y + 76 + 34;
    const maxX = modX + panelW - 24;
    modules.forEach(mod => {
      ctx.font = "700 13px sans-serif";
      const w = ctx.measureText(mod).width + 24;
      if (mx + w > maxX) {
        mx = modX + 24;
        my += 40;
      }
      ctx.fillStyle = COLOR.orangeSoft;
      roundRect(ctx, mx, my - 22, w, 30, 8);
      ctx.fill();
      text(ctx, mod, mx + 12, my - 2, { size: 13, weight: 700, color: COLOR.orange });
      mx += w + 10;
    });
  }

  // ---- Footer ----
  ctx.fillStyle = COLOR.card;
  roundRect(ctx, PAD, footerY, contentW, footerH, 14);
  ctx.fill();
  ctx.strokeStyle = COLOR.line;
  roundRect(ctx, PAD, footerY, contentW, footerH, 14);
  ctx.stroke();

  circleBadge(ctx, PAD + 46, footerY + footerH / 2, 22, COLOR.blueSoft);
  drawStar(ctx, PAD + 46, footerY + footerH / 2, 22, COLOR.blue);
  text(ctx, "Thank you for your continued support.", PAD + 82, footerY + footerH / 2 - 6, { size: 15.5, weight: 800, color: COLOR.ink });
  text(ctx, "Let's keep driving excellence together!", PAD + 82, footerY + footerH / 2 + 16, { size: 13.5, weight: 500, color: COLOR.muted });

  const dividerX = PAD + contentW * 0.62;
  ctx.strokeStyle = COLOR.line;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(dividerX, footerY + 20);
  ctx.lineTo(dividerX, footerY + footerH - 20);
  ctx.stroke();

  const rightIconX = dividerX + 46;
  circleBadge(ctx, rightIconX, footerY + footerH / 2, 22, COLOR.blueSoft);
  drawClockIcon(ctx, rightIconX, footerY + footerH / 2, 22, COLOR.blue, 2.6);
  // Prefer the caller's own local-time label (the server's clock/timezone isn't the analyst's).
  const now = new Date();
  const stamp = data.generatedAtLabel
    || `${now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} | ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`;
  text(ctx, "Report Generated On", rightIconX + 36, footerY + footerH / 2 - 6, { size: 13, weight: 500, color: COLOR.muted });
  text(ctx, stamp, rightIconX + 36, footerY + footerH / 2 + 16, { size: 15, weight: 800, color: COLOR.ink });

  return canvas;
}

module.exports = { renderDailyLedger };