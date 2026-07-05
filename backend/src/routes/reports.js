const express = require("express");
const fs = require("fs");
const path = require("path");
const prisma = require("../lib/prisma");
const { requireAuth, requireRole } = require("../middleware/auth");
const { renderDailyLedger } = require("../lib/renderReport");
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

function buildMessage({ date, requirements, deliveries }, mode = "whatsapp") {
  const bullet = mode === "email" ? "-" : "\u2022";
  const modules = new Set([...requirements, ...deliveries].map(i => i.module.toLowerCase()));
  const bugs = deliveries.filter(d => d.type === "Bug Fix").length;
  const features = deliveries.filter(d => d.type === "Feature").length;

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

  lines.push(
    "---", "", "\uD83D\uDCCA Summary", "",
    `${bullet} Requirements Received : ${requirements.length}`,
    `${bullet} Deliveries Completed : ${deliveries.length}`,
    `${bullet} Modules Worked On : ${modules.size}`,
    `${bullet} Bug Fixes : ${bugs}`,
    `${bullet} Features Delivered : ${features}`
  );

  return lines.join("\n");
}

// Generate (or regenerate) today's ledger for a LOB and cache it as a DailyReport row.
router.post("/generate", requireRole("ANALYST", "SUPER_ADMIN"), async (req, res) => {
  const lobId = resolveLobId(req);
  const date = req.body.date;
  const generatedAtLabel = req.body.generatedAtLabel || currentGeneratedAtLabel();
  if (!lobId || !date) return res.status(400).json({ error: "lobId and date are required." });

  const lob = await prisma.lOB.findUnique({ where: { id: lobId } });
  if (!lob) return res.status(404).json({ error: "LOB not found." });

  const [requirements, deliveries] = await Promise.all([
    prisma.requirement.findMany({ where: { lobId, date }, orderBy: { createdAt: "asc" } }),
    prisma.delivery.findMany({ where: { lobId, date }, orderBy: { createdAt: "asc" } })
  ]);

  const canvas = renderDailyLedger({ lobName: lob.name, date, requirements, deliveries, generatedAtLabel });
  const fileName = `${lobId}-${date}.png`;
  const filePath = path.join(UPLOAD_DIR, fileName);
  fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

  const imageUrl = `${process.env.PUBLIC_URL}/reports/${fileName}`;
  const message = buildMessage({ date, requirements, deliveries });
  const shareLink = buildShareLink(lob.headPhone, `${message}\n${imageUrl}`);

  const modules = new Set([...requirements, ...deliveries].map(i => i.module).filter(Boolean)).size;
  const bugFixes = deliveries.filter(d => d.type === "Bug Fix").length;
  const features = deliveries.filter(d => d.type === "Feature").length;

  const report = await prisma.dailyReport.upsert({
    where: { lobId_date: { lobId, date } },
    update: { imagePath: filePath, imageUrl, shareLink, requirements: requirements.length, deliveries: deliveries.length, modules, bugFixes, features, generatedAt: new Date() },
    create: { lobId, date, imagePath: filePath, imageUrl, shareLink, requirements: requirements.length, deliveries: deliveries.length, modules, bugFixes, features }
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

  const [requirements, deliveries] = await Promise.all([
    prisma.requirement.findMany({ where: { lobId, date }, orderBy: { createdAt: "asc" } }),
    prisma.delivery.findMany({ where: { lobId, date }, orderBy: { createdAt: "asc" } })
  ]);

  const generatedAtLabel = currentGeneratedAtLabel();
  const canvas = renderDailyLedger({ lobName: lob.name, date, requirements, deliveries, generatedAtLabel });
  const fileName = `${lobId}-${date}.png`;
  const filePath = path.join(UPLOAD_DIR, fileName);
  fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

  const imageUrl = `${process.env.PUBLIC_URL}/reports/${fileName}`;
  const message = buildMessage({ date, requirements, deliveries });
  const shareLink = buildShareLink(lob.headPhone, `${message}\n${imageUrl}`);
  const modules = new Set([...requirements, ...deliveries].map(i => i.module).filter(Boolean)).size;
  const bugFixes = deliveries.filter(d => d.type === "Bug Fix").length;
  const features = deliveries.filter(d => d.type === "Feature").length;

  try {
    await sendReportEmail({
      to: lob.headEmail,
      subject: `Daily Delivery Update \u2013 ${lob.name} \u2013 ${date}`,
      textBody: message,
      pngBuffer: fs.readFileSync(filePath),
      filename: `daily-delivery-update-${date}.png`
    });
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }

  await prisma.dailyReport.upsert({
    where: { lobId_date: { lobId, date } },
    update: { imagePath: filePath, imageUrl, shareLink, requirements: requirements.length, deliveries: deliveries.length, modules, bugFixes, features, generatedAt: new Date() },
    create: { lobId, date, imagePath: filePath, imageUrl, shareLink, requirements: requirements.length, deliveries: deliveries.length, modules, bugFixes, features }
  });

  res.json({ sent: true, to: lob.headEmail });
});

module.exports = router;