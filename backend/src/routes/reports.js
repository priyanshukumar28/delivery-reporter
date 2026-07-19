const express = require("express");
const fs = require("fs");
const path = require("path");
const prisma = require("../lib/prisma");
const { requireAuth, requireRole } = require("../middleware/auth");
const { renderDailyLedger } = require("../lib/renderReport");
const { renderDailyLedgerPdf } = require("../lib/renderReportPdf");
const { sendReportEmail } = require("../lib/email");

const router = express.Router();
router.use(requireAuth);

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

function resolveLobId(req) {
  if (req.user.role === "SUPER_ADMIN") return req.query.lobId || req.body.lobId || null;
  return req.user.lobId;
}

function buildShareLink(phone, message) {
  const digits = (phone || "").replace(/[^\d]/g, "");
  const base = digits ? `https://wa.me/${digits}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(message)}`;
}

function formatDateMessage(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function currentGeneratedAtLabel() {
  const now = new Date();
  return `${now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} | ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`;
}

function buildMessage({ date, requirements, deliveries, delays = [] }, mode = "whatsapp") {
  const bullet = mode === "email" ? "-" : "\u2022";
  const modules = new Set([...requirements, ...deliveries].map(i => i.module.toLowerCase()));
  const bugs = deliveries.filter(d => d.type === "Bug Fix").length;
  const features = deliveries.filter(d => d.type === "Feature").length;
  const flagged = delays.filter(d => d.status === "Delayed" || d.status === "At Risk").length;

  const lines = [];
  lines.push(`\uD83D\uDCC5 Daily Delivery Update \u2013 ${formatDateMessage(date)}`, "", "\uD83D\uDCE5 Requirements Received", "");

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

  lines.push("---", "", "\u2705 Deliveries Completed", "");

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

  lines.push("---", "", "\u23F1 Delivery Timeline & WIP Updates", "");

  if (delays.length) {
    delays.forEach((item, index) => {
      const label = item.module ? `${item.deliverable} (${item.module})` : item.deliverable;
      lines.push(`${index + 1}. ${label} [${item.status}]`);
      if (item.originalDueDate || item.revisedDueDate) {
        const from = item.originalDueDate ? formatDateMessage(item.originalDueDate) : "—";
        const to = item.revisedDueDate ? formatDateMessage(item.revisedDueDate) : "—";
        lines.push(`   ${bullet} Timeline: ${from} -> ${to}`);
      }
      if (item.reason) lines.push(`   ${bullet} Reason: ${item.reason}`);
      lines.push("");
    });
  } else {
    lines.push("No timeline changes or WIP updates logged for this date.", "");
  }

  lines.push(
    "---", "", "\uD83D\uDCCA Summary", "",
    `${bullet} Requirements Received : ${requirements.length}`,
    `${bullet} Deliveries Completed : ${deliveries.length}`,
    `${bullet} Modules Worked On : ${modules.size}`,
    `${bullet} Bug Fixes : ${bugs}`,
    `${bullet} Features Delivered : ${features}`,
    `${bullet} Delayed / At Risk Items : ${flagged}`
  );

  return lines.join("\n");
}

// pdfkit is a streaming writer — collect its output chunks into a Buffer.
function pdfToBuffer(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on("data", chunk => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}

// Generate (or regenerate) today's ledger for a LOB and cache it as a DailyReport row.
router.post("/generate", requireRole("ANALYST", "SUPER_ADMIN"), async (req, res) => {
  const lobId = resolveLobId(req);
  const date = req.body.date;
  const generatedAtLabel = req.body.generatedAtLabel || currentGeneratedAtLabel();
  if (!lobId || !date) return res.status(400).json({ error: "lobId and date are required." });

  const lob = await prisma.lOB.findUnique({ where: { id: lobId } });
  if (!lob) return res.status(404).json({ error: "LOB not found." });

  const [requirements, deliveries, delays] = await Promise.all([
    prisma.requirement.findMany({ where: { lobId, date }, orderBy: { createdAt: "asc" } }),
    prisma.delivery.findMany({ where: { lobId, date }, orderBy: { createdAt: "asc" } }),
    prisma.delayUpdate.findMany({ where: { lobId, date }, orderBy: { createdAt: "asc" } })
  ]);

  const canvas = renderDailyLedger({ lobName: lob.name, date, requirements, deliveries, generatedAtLabel });
  const fileName = `${lobId}-${date}.png`;
  const filePath = path.join(UPLOAD_DIR, fileName);
  fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

  const pdfDoc = renderDailyLedgerPdf({ lobName: lob.name, date, requirements, deliveries, delays, generatedAtLabel });
  const pdfFileName = `${lobId}-${date}.pdf`;
  const pdfFilePath = path.join(UPLOAD_DIR, pdfFileName);
  fs.writeFileSync(pdfFilePath, await pdfToBuffer(pdfDoc));

  const imageUrl = `${process.env.PUBLIC_URL}/reports/${fileName}`;
  const pdfUrl = `${process.env.PUBLIC_URL}/reports/${pdfFileName}`;
  const message = buildMessage({ date, requirements, deliveries, delays });
  const shareLink = buildShareLink(lob.headPhone, `${message}\n${pdfUrl}`);

  const modules = new Set([...requirements, ...deliveries].map(i => i.module).filter(Boolean)).size;
  const bugFixes = deliveries.filter(d => d.type === "Bug Fix").length;
  const features = deliveries.filter(d => d.type === "Feature").length;
  const delayFlags = delays.filter(d => d.status === "Delayed" || d.status === "At Risk").length;

  const report = await prisma.dailyReport.upsert({
    where: { lobId_date: { lobId, date } },
    update: { imagePath: filePath, imageUrl, pdfPath: pdfFilePath, pdfUrl, shareLink, requirements: requirements.length, deliveries: deliveries.length, modules, bugFixes, features, delayFlags, generatedAt: new Date() },
    create: { lobId, date, imagePath: filePath, imageUrl, pdfPath: pdfFilePath, pdfUrl, shareLink, requirements: requirements.length, deliveries: deliveries.length, modules, bugFixes, features, delayFlags }
  });

  res.status(201).json(report);
});

router.get("/", async (req, res) => {
  const lobId = resolveLobId(req);
  if (!lobId) return res.status(400).json({ error: "lobId is required." });

  const date = req.query.date;
  if (date) {
    const report = await prisma.dailyReport.findUnique({ where: { lobId_date: { lobId, date } } });
    return res.json(report || null);
  }

  const history = await prisma.dailyReport.findMany({
    where: { lobId },
    orderBy: { date: "desc" },
    take: 60
  });
  res.json(history);
});

router.delete("/:id", requireRole("ANALYST", "SUPER_ADMIN"), async (req, res) => {
  const existing = await prisma.dailyReport.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Not found." });
  if (req.user.role !== "SUPER_ADMIN" && existing.lobId !== req.user.lobId) {
    return res.status(403).json({ error: "Not permitted." });
  }
  fs.existsSync(existing.imagePath) && fs.unlinkSync(existing.imagePath);
  if (existing.pdfPath && fs.existsSync(existing.pdfPath)) fs.unlinkSync(existing.pdfPath);
  await prisma.dailyReport.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

// Renders the current entries fresh (so the email reflects latest edits),
// emails the PNG to the LOB Head, and updates the cached DailyReport row.
router.post("/email", requireRole("ANALYST", "SUPER_ADMIN"), async (req, res) => {
  const lobId = resolveLobId(req);
  const date = req.body.date;
  if (!lobId || !date) return res.status(400).json({ error: "lobId and date are required." });

  const lob = await prisma.lOB.findUnique({ where: { id: lobId } });
  if (!lob) return res.status(404).json({ error: "LOB not found." });

  const [requirements, deliveries, delays] = await Promise.all([
    prisma.requirement.findMany({ where: { lobId, date }, orderBy: { createdAt: "asc" } }),
    prisma.delivery.findMany({ where: { lobId, date }, orderBy: { createdAt: "asc" } }),
    prisma.delayUpdate.findMany({ where: { lobId, date }, orderBy: { createdAt: "asc" } })
  ]);

  const generatedAtLabel = currentGeneratedAtLabel();
  const canvas = renderDailyLedger({ lobName: lob.name, date, requirements, deliveries, generatedAtLabel });
  const fileName = `${lobId}-${date}.png`;
  const filePath = path.join(UPLOAD_DIR, fileName);
  fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

  const pdfDoc = renderDailyLedgerPdf({ lobName: lob.name, date, requirements, deliveries, delays, generatedAtLabel });
  const pdfFileName = `${lobId}-${date}.pdf`;
  const pdfFilePath = path.join(UPLOAD_DIR, pdfFileName);
  const pdfBuffer = await pdfToBuffer(pdfDoc);
  fs.writeFileSync(pdfFilePath, pdfBuffer);

  const imageUrl = `${process.env.PUBLIC_URL}/reports/${fileName}`;
  const pdfUrl = `${process.env.PUBLIC_URL}/reports/${pdfFileName}`;
  const message = buildMessage({ date, requirements, deliveries, delays });
  const shareLink = buildShareLink(lob.headPhone, `${message}\n${pdfUrl}`);
  const modules = new Set([...requirements, ...deliveries].map(i => i.module).filter(Boolean)).size;
  const bugFixes = deliveries.filter(d => d.type === "Bug Fix").length;
  const features = deliveries.filter(d => d.type === "Feature").length;
  const delayFlags = delays.filter(d => d.status === "Delayed" || d.status === "At Risk").length;

  try {
    await sendReportEmail({
      to: lob.headEmail,
      subject: `Daily Delivery Update \u2013 ${lob.name} \u2013 ${date}`,
      textBody: message,
      attachmentBuffer: pdfBuffer,
      filename: `daily-delivery-update-${date}.pdf`
    });
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }

  await prisma.dailyReport.upsert({
    where: { lobId_date: { lobId, date } },
    update: { imagePath: filePath, imageUrl, pdfPath: pdfFilePath, pdfUrl, shareLink, requirements: requirements.length, deliveries: deliveries.length, modules, bugFixes, features, delayFlags, generatedAt: new Date() },
    create: { lobId, date, imagePath: filePath, imageUrl, pdfPath: pdfFilePath, pdfUrl, shareLink, requirements: requirements.length, deliveries: deliveries.length, modules, bugFixes, features, delayFlags }
  });

  res.json({ sent: true, to: lob.headEmail });
});

module.exports = router;