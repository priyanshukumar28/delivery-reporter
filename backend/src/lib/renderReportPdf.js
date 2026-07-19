const PDFDocument = require("pdfkit");

const COLOR = {
  navy: "#0B1D3A",
  navyDeep: "#152A52",
  ink: "#1F2937",
  muted: "#6B7280",
  line: "#E5E7EB",
  paper: "#F7F9FC",

  blue: "#2563EB",
  blueSoft: "#DBEAFE",
  green: "#16A34A",
  greenSoft: "#DCFCE7",
  purple: "#7C3AED",
  purpleSoft: "#EDE9FE",
  orange: "#EA580C",
  orangeSoft: "#FFEDD5",
  amber: "#D97706",
  amberSoft: "#FEF3C7",
  red: "#DC2626",
  redSoft: "#FEE2E2",
  muted2Soft: "#EEEEEE"
};

const TYPE_COLOR = {
  Feature: { fg: COLOR.blue, bg: COLOR.blueSoft },
  "Bug Fix": { fg: COLOR.orange, bg: COLOR.orangeSoft },
  Enhancement: { fg: COLOR.green, bg: COLOR.greenSoft },
  Configuration: { fg: COLOR.muted, bg: COLOR.muted2Soft },
  Support: { fg: COLOR.muted, bg: COLOR.muted2Soft }
};

const PRIORITY_COLOR = {
  Low: { fg: COLOR.muted, bg: COLOR.muted2Soft },
  Medium: { fg: COLOR.blue, bg: COLOR.blueSoft },
  High: { fg: COLOR.orange, bg: COLOR.orangeSoft },
  Critical: { fg: "#FFFFFF", bg: COLOR.red }
};

const STATUS_COLOR = {
  WIP: { fg: COLOR.blue, bg: COLOR.blueSoft },
  "On Track": { fg: COLOR.green, bg: COLOR.greenSoft },
  Delayed: { fg: COLOR.red, bg: COLOR.redSoft },
  "At Risk": { fg: COLOR.amber, bg: COLOR.amberSoft },
  Completed: { fg: COLOR.muted, bg: COLOR.muted2Soft }
};

const PAGE_W = 612; // US Letter, points
const PAGE_H = 792;
const MARGIN = 40;
const CONTENT_W = PAGE_W - MARGIN * 2;

function formatDateLong(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatWeekday(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-GB", { weekday: "long" });
}

function ensureSpace(doc, needed) {
  const bottom = PAGE_H - MARGIN;
  if (doc.y + needed > bottom) {
    doc.addPage({ size: [PAGE_W, PAGE_H], margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } });
  }
}

function pill(doc, label, x, y, { fg, bg }) {
  doc.font("Helvetica-Bold").fontSize(9);
  const padX = 7;
  const w = doc.widthOfString(label) + padX * 2;
  const h = 16;
  doc.roundedRect(x, y, w, h, 5).fill(bg);
  doc.fillColor(fg).text(label, x + padX, y + 4, { lineBreak: false });
  return w;
}

function sectionHeader(doc, title, color, x, width) {
  ensureSpace(doc, 34);
  doc.font("Helvetica-Bold").fontSize(13).fillColor(color).text(title, x, doc.y, { width });
  const lineY = doc.y + 4;
  doc.moveTo(x, lineY).lineTo(x + width, lineY).strokeColor(COLOR.line).lineWidth(1).stroke();
  doc.y = lineY + 12;
}

function emptyNote(doc, text, x, width) {
  doc.font("Helvetica").fontSize(10.5).fillColor(COLOR.muted).text(text, x, doc.y, { width });
  doc.moveDown(0.6);
}

function renderDailyLedgerPdf(data) {
  const doc = new PDFDocument({
    size: [PAGE_W, PAGE_H],
    margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
    bufferPages: true
  });

  const modules = [...new Set([...data.requirements, ...data.deliveries].map(i => i.module).filter(Boolean))];
  const bugFixes = data.deliveries.filter(d => d.type === "Bug Fix").length;
  const features = data.deliveries.filter(d => d.type === "Feature").length;
  const delays = data.delays || [];
  const flagged = delays.filter(d => d.status === "Delayed" || d.status === "At Risk").length;

  // ---- Header ----
  doc.rect(MARGIN, MARGIN, CONTENT_W, 64).fill(COLOR.navy);
  doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(18).text("Daily Delivery Update", MARGIN + 18, MARGIN + 14, { lineBreak: false });
  doc.fillColor("#BFD0F7").font("Helvetica-Bold").fontSize(11).text(data.lobName, MARGIN + 18, MARGIN + 38, { lineBreak: false });
  doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(12).text(formatDateLong(data.date), MARGIN, MARGIN + 14, { width: CONTENT_W - 18, align: "right", lineBreak: false });
  doc.fillColor("#BFD0F7").font("Helvetica").fontSize(9.5).text(formatWeekday(data.date), MARGIN, MARGIN + 30, { width: CONTENT_W - 18, align: "right", lineBreak: false });
  doc.y = MARGIN + 64 + 16;

  // ---- Stat tiles ----
  const tiles = [
    { value: data.requirements.length, label: "Requirements Received", fg: COLOR.blue, bg: COLOR.blueSoft },
    { value: data.deliveries.length, label: "Deliveries Completed", fg: COLOR.green, bg: COLOR.greenSoft },
    { value: modules.length, label: "Modules Worked On", fg: COLOR.purple, bg: COLOR.purpleSoft },
    { value: bugFixes, label: "Bug Fixes", fg: COLOR.orange, bg: COLOR.orangeSoft },
    { value: features, label: "Features Delivered", fg: COLOR.blue, bg: COLOR.blueSoft },
    { value: flagged, label: "Delayed / At Risk", fg: flagged ? COLOR.red : COLOR.muted, bg: flagged ? COLOR.redSoft : COLOR.muted2Soft }
  ];
  ensureSpace(doc, 62);
  const tileGap = 8;
  const tileW = (CONTENT_W - tileGap * (tiles.length - 1)) / tiles.length;
  const tileY = doc.y;
  tiles.forEach((tile, i) => {
    const x = MARGIN + i * (tileW + tileGap);
    doc.roundedRect(x, tileY, tileW, 58, 8).fillAndStroke(tile.bg, COLOR.line);
    doc.fillColor(tile.fg).font("Helvetica-Bold").fontSize(18).text(String(tile.value), x, tileY + 10, { width: tileW, align: "center", lineBreak: false });
    doc.fillColor(COLOR.ink).font("Helvetica-Bold").fontSize(7.4).text(tile.label, x + 4, tileY + 34, { width: tileW - 8, align: "center", lineBreak: false });
  });
  doc.y = tileY + 58 + 18;

  // ---- Requirements Received ----
  sectionHeader(doc, "Requirements Received", COLOR.blue, MARGIN, CONTENT_W);
  if (!data.requirements.length) {
    emptyNote(doc, "No requirements received.", MARGIN, CONTENT_W);
  } else {
    data.requirements.forEach((item, index) => {
      ensureSpace(doc, 40);
      const rowY = doc.y;
      const tagW = pill(doc, item.priority, MARGIN, rowY, PRIORITY_COLOR[item.priority] || PRIORITY_COLOR.Medium);
      doc.fillColor(COLOR.ink).font("Helvetica-Bold").fontSize(10).text(`${index + 1}. ${item.module}`, MARGIN + tagW + 8, rowY + 3, { width: CONTENT_W - tagW - 8 });
      doc.y = Math.max(doc.y, rowY + 20) + 6;
      doc.font("Helvetica").fontSize(10).fillColor(COLOR.ink).text(item.description, MARGIN, doc.y, { width: CONTENT_W });
      if (item.requestedBy) {
        doc.font("Helvetica-Oblique").fontSize(9).fillColor(COLOR.muted).text(`Requested by ${item.requestedBy}`, MARGIN, doc.y + 2, { width: CONTENT_W });
      }
      doc.moveDown(0.7);
      const ruleY = doc.y;
      doc.moveTo(MARGIN, ruleY).lineTo(MARGIN + CONTENT_W, ruleY).strokeColor(COLOR.line).lineWidth(0.5).stroke();
      doc.y = ruleY + 10;
    });
  }
  doc.moveDown(0.4);

  // ---- Deliveries Completed ----
  sectionHeader(doc, "Deliveries Completed", COLOR.green, MARGIN, CONTENT_W);
  if (!data.deliveries.length) {
    emptyNote(doc, "No deliveries completed.", MARGIN, CONTENT_W);
  } else {
    data.deliveries.forEach((item, index) => {
      ensureSpace(doc, 40);
      const rowY = doc.y;
      const tagW = pill(doc, item.type, MARGIN, rowY, TYPE_COLOR[item.type] || TYPE_COLOR.Feature);
      doc.fillColor(COLOR.ink).font("Helvetica-Bold").fontSize(10).text(`${index + 1}. ${item.module}`, MARGIN + tagW + 8, rowY + 3, { width: CONTENT_W - tagW - 8 });
      doc.y = Math.max(doc.y, rowY + 20) + 6;
      doc.font("Helvetica").fontSize(10).fillColor(COLOR.ink).text(item.description, MARGIN, doc.y, { width: CONTENT_W });
      if (item.remarks) {
        doc.font("Helvetica-Oblique").fontSize(9).fillColor(COLOR.muted).text(item.remarks, MARGIN, doc.y + 2, { width: CONTENT_W });
      }
      doc.moveDown(0.7);
      const ruleY = doc.y;
      doc.moveTo(MARGIN, ruleY).lineTo(MARGIN + CONTENT_W, ruleY).strokeColor(COLOR.line).lineWidth(0.5).stroke();
      doc.y = ruleY + 10;
    });
  }
  doc.moveDown(0.4);

  // ---- Delivery Timeline & WIP Updates (new section) ----
  sectionHeader(doc, "Delivery Timeline & WIP Updates", COLOR.amber, MARGIN, CONTENT_W);
  if (!delays.length) {
    emptyNote(doc, "No timeline changes or WIP updates logged for this date.", MARGIN, CONTENT_W);
  } else {
    delays.forEach((item, index) => {
      ensureSpace(doc, 54);
      const rowY = doc.y;
      const tagW = pill(doc, item.status, MARGIN, rowY, STATUS_COLOR[item.status] || STATUS_COLOR.WIP);
      const label = item.module ? `${index + 1}. ${item.deliverable} (${item.module})` : `${index + 1}. ${item.deliverable}`;
      doc.fillColor(COLOR.ink).font("Helvetica-Bold").fontSize(10).text(label, MARGIN + tagW + 8, rowY + 3, { width: CONTENT_W - tagW - 8 });
      doc.y = Math.max(doc.y, rowY + 20) + 6;

      const dateBits = [];
      if (item.originalDueDate) dateBits.push(`Original due: ${formatDateLong(item.originalDueDate)}`);
      if (item.revisedDueDate) dateBits.push(`Revised to: ${formatDateLong(item.revisedDueDate)}`);
      if (dateBits.length) {
        doc.font("Helvetica-Bold").fontSize(9).fillColor(COLOR.ink).text(dateBits.join("   ->   "), MARGIN, doc.y, { width: CONTENT_W });
      }
      if (item.reason) {
        doc.font("Helvetica").fontSize(9.5).fillColor(COLOR.muted).text(item.reason, MARGIN, doc.y + 2, { width: CONTENT_W });
      }
      doc.moveDown(0.7);
      const ruleY = doc.y;
      doc.moveTo(MARGIN, ruleY).lineTo(MARGIN + CONTENT_W, ruleY).strokeColor(COLOR.line).lineWidth(0.5).stroke();
      doc.y = ruleY + 10;
    });
  }
  doc.moveDown(0.4);

  // ---- Modules worked on ----
  sectionHeader(doc, "Modules Worked On", COLOR.orange, MARGIN, CONTENT_W);
  if (!modules.length) {
    emptyNote(doc, "No modules yet.", MARGIN, CONTENT_W);
  } else {
    ensureSpace(doc, 26);
    let mx = MARGIN, my = doc.y;
    const maxX = MARGIN + CONTENT_W;
    doc.font("Helvetica-Bold").fontSize(9);
    modules.forEach(mod => {
      const w = doc.widthOfString(mod) + 18;
      if (mx + w > maxX) {
        mx = MARGIN;
        my += 24;
        ensureSpace(doc, 24);
      }
      doc.roundedRect(mx, my, w, 20, 6).fill(COLOR.orangeSoft);
      doc.fillColor(COLOR.orange).text(mod, mx + 9, my + 5.5, { lineBreak: false });
      mx += w + 8;
    });
    doc.y = my + 30;
  }

  // ---- Footer ----
  ensureSpace(doc, 40);
  const stamp = data.generatedAtLabel || new Date().toLocaleString();
  doc.font("Helvetica").fontSize(8.5).fillColor(COLOR.muted)
    .text(`Report generated on ${stamp}`, MARGIN, doc.y, { width: CONTENT_W, align: "center" });

  return doc;
}

module.exports = { renderDailyLedgerPdf };