const express = require("express");
const { z } = require("zod");
const prisma = require("../lib/prisma");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

const CATEGORY_OPTIONS = ["Change Request", "Production Movement", "Maintenance", "Development", "Bug Fix"];
const dateOrEmpty = z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal("")]).optional();

const requirementSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  module: z.string().min(1),
  description: z.string().min(1),
  receivedFrom: z.string().optional(),
  receivedDate: dateOrEmpty,
  category: z.enum(CATEGORY_OPTIONS).default("Development"),
  priority: z.enum(["Low", "Medium", "High", "Critical"]).default("Medium")
});

const deliverySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  module: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(CATEGORY_OPTIONS).default("Development"),
  receivedFrom: z.string().optional(),
  receivedDate: dateOrEmpty,
  closedDate: dateOrEmpty,
  remarks: z.string().optional()
});

// Resolve which LOB a request should read/write. ANALYST is pinned to their
// own LOB; SUPER_ADMIN may pass ?lobId= to inspect any LOB.
function resolveLobId(req) {
  if (req.user.role === "SUPER_ADMIN") return req.query.lobId || req.body.lobId || null;
  return req.user.lobId;
}

// Empty-string date inputs from <input type="date"> must become null, not "".
function normalize(data) {
  const out = { ...data };
  if ("receivedDate" in out) out.receivedDate = out.receivedDate || null;
  if ("closedDate" in out) out.closedDate = out.closedDate || null;
  return out;
}

router.get("/requirements", async (req, res) => {
  const lobId = resolveLobId(req);
  const date = req.query.date;
  if (!lobId || !date) return res.status(400).json({ error: "lobId and date are required." });

  const items = await prisma.requirement.findMany({
    where: { lobId, date },
    orderBy: { createdAt: "asc" },
    include: { createdBy: { select: { name: true } } }
  });
  res.json(items);
});

router.post("/requirements", requireRole("ANALYST", "SUPER_ADMIN"), async (req, res) => {
  const parsed = requirementSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const lobId = resolveLobId(req);
  if (!lobId) return res.status(400).json({ error: "lobId is required." });

  const item = await prisma.requirement.create({
    data: { ...normalize(parsed.data), lobId, createdById: req.user.id }
  });
  res.status(201).json(item);
});

router.put("/requirements/:id", requireRole("ANALYST", "SUPER_ADMIN"), async (req, res) => {
  const parsed = requirementSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = await prisma.requirement.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Not found." });
  if (req.user.role !== "SUPER_ADMIN" && existing.lobId !== req.user.lobId) {
    return res.status(403).json({ error: "Not permitted." });
  }

  const item = await prisma.requirement.update({ where: { id: req.params.id }, data: normalize(parsed.data) });
  res.json(item);
});

router.delete("/requirements/:id", requireRole("ANALYST", "SUPER_ADMIN"), async (req, res) => {
  const existing = await prisma.requirement.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Not found." });
  if (req.user.role !== "SUPER_ADMIN" && existing.lobId !== req.user.lobId) {
    return res.status(403).json({ error: "Not permitted." });
  }

  await prisma.requirement.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

router.get("/deliveries", async (req, res) => {
  const lobId = resolveLobId(req);
  const date = req.query.date;
  if (!lobId || !date) return res.status(400).json({ error: "lobId and date are required." });

  const items = await prisma.delivery.findMany({
    where: { lobId, date },
    orderBy: { createdAt: "asc" },
    include: { createdBy: { select: { name: true } } }
  });
  res.json(items);
});

router.post("/deliveries", requireRole("ANALYST", "SUPER_ADMIN"), async (req, res) => {
  const parsed = deliverySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const lobId = resolveLobId(req);
  if (!lobId) return res.status(400).json({ error: "lobId is required." });

  const item = await prisma.delivery.create({
    data: { ...normalize(parsed.data), lobId, createdById: req.user.id }
  });
  res.status(201).json(item);
});

router.put("/deliveries/:id", requireRole("ANALYST", "SUPER_ADMIN"), async (req, res) => {
  const parsed = deliverySchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = await prisma.delivery.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Not found." });
  if (req.user.role !== "SUPER_ADMIN" && existing.lobId !== req.user.lobId) {
    return res.status(403).json({ error: "Not permitted." });
  }

  const item = await prisma.delivery.update({ where: { id: req.params.id }, data: normalize(parsed.data) });
  res.json(item);
});

router.delete("/deliveries/:id", requireRole("ANALYST", "SUPER_ADMIN"), async (req, res) => {
  const existing = await prisma.delivery.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Not found." });
  if (req.user.role !== "SUPER_ADMIN" && existing.lobId !== req.user.lobId) {
    return res.status(403).json({ error: "Not permitted." });
  }

  await prisma.delivery.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

module.exports = router;