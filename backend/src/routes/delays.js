const express = require("express");
const { z } = require("zod");
const prisma = require("../lib/prisma");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

const STATUS_OPTIONS = ["WIP", "On Track", "Delayed", "At Risk", "Completed"];
const CATEGORY_OPTIONS = ["Change Request", "Production Movement", "Maintenance", "Development", "Bug Fix"];
const dateOrEmpty = z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal("")]).optional();

const delaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  module: z.string().optional(),
  deliverable: z.string().min(1),
  category: z.enum(CATEGORY_OPTIONS).default("Development"),
  receivedFrom: z.string().optional(),
  receivedDate: dateOrEmpty,
  originalDueDate: dateOrEmpty,
  revisedDueDate: dateOrEmpty,
  approvalTaken: z.boolean().default(false),
  approvedBy: z.string().optional(),
  approvedDate: dateOrEmpty,
  status: z.enum(STATUS_OPTIONS).default("WIP"),
  reason: z.string().optional()
});

// Resolve which LOB a request should read/write. ANALYST is pinned to their
// own LOB; SUPER_ADMIN may pass ?lobId= to inspect any LOB.
function resolveLobId(req) {
  if (req.user.role === "SUPER_ADMIN") return req.query.lobId || req.body.lobId || null;
  return req.user.lobId;
}

function normalize(data) {
  const out = { ...data };
  if ("originalDueDate" in out) out.originalDueDate = out.originalDueDate || null;
  if ("revisedDueDate" in out) out.revisedDueDate = out.revisedDueDate || null;
  if ("receivedDate" in out) out.receivedDate = out.receivedDate || null;
  if ("approvedDate" in out) out.approvedDate = out.approvedDate || null;
  if ("module" in out) out.module = out.module || null;
  if ("reason" in out) out.reason = out.reason || null;
  if ("receivedFrom" in out) out.receivedFrom = out.receivedFrom || null;
  if ("approvedBy" in out) out.approvedBy = out.approvedBy || null;
  // Approval fields only make sense when approval was actually taken.
  if (out.approvalTaken === false) {
    out.approvedBy = null;
    out.approvedDate = null;
  }
  return out;
}

router.get("/delays", async (req, res) => {
  const lobId = resolveLobId(req);
  const date = req.query.date;
  if (!lobId || !date) return res.status(400).json({ error: "lobId and date are required." });

  const items = await prisma.delayUpdate.findMany({
    where: { lobId, date },
    orderBy: { createdAt: "asc" },
    include: { createdBy: { select: { name: true } } }
  });
  res.json(items);
});

router.post("/delays", requireRole("ANALYST", "SUPER_ADMIN"), async (req, res) => {
  const parsed = delaySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const lobId = resolveLobId(req);
  if (!lobId) return res.status(400).json({ error: "lobId is required." });

  const item = await prisma.delayUpdate.create({
    data: { ...normalize(parsed.data), lobId, createdById: req.user.id }
  });
  res.status(201).json(item);
});

router.put("/delays/:id", requireRole("ANALYST", "SUPER_ADMIN"), async (req, res) => {
  const parsed = delaySchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = await prisma.delayUpdate.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Not found." });
  if (req.user.role !== "SUPER_ADMIN" && existing.lobId !== req.user.lobId) {
    return res.status(403).json({ error: "Not permitted." });
  }

  const item = await prisma.delayUpdate.update({ where: { id: req.params.id }, data: normalize(parsed.data) });
  res.json(item);
});

router.delete("/delays/:id", requireRole("ANALYST", "SUPER_ADMIN"), async (req, res) => {
  const existing = await prisma.delayUpdate.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Not found." });
  if (req.user.role !== "SUPER_ADMIN" && existing.lobId !== req.user.lobId) {
    return res.status(403).json({ error: "Not permitted." });
  }

  await prisma.delayUpdate.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

module.exports = router;