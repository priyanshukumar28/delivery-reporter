const express = require("express");
const bcrypt = require("bcryptjs");
const { z } = require("zod");
const prisma = require("../lib/prisma");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  if (req.user.role === "SUPER_ADMIN") {
    const lobs = await prisma.lOB.findMany({ orderBy: { name: "asc" } });
    return res.json(lobs);
  }
  const lob = await prisma.lOB.findUnique({ where: { id: req.user.lobId } });
  res.json(lob ? [lob] : []);
});

const lobSchema = z.object({
  name: z.string().min(1),
  headName: z.string().optional(),
  headPhone: z.string().optional(),
  headEmail: z.string().email().optional()
});

router.post("/", requireRole("SUPER_ADMIN"), async (req, res) => {
  const parsed = lobSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const lob = await prisma.lOB.create({ data: parsed.data });
    res.status(201).json(lob);
  } catch (err) {
    if (err.code === "P2002") return res.status(409).json({ error: "A LOB with this name already exists." });
    throw err;
  }
});

router.put("/:id", requireRole("SUPER_ADMIN"), async (req, res) => {
  const parsed = lobSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const lob = await prisma.lOB.update({ where: { id: req.params.id }, data: parsed.data });
    res.json(lob);
  } catch (err) {
    if (err.code === "P2002") return res.status(409).json({ error: "A LOB with this name already exists." });
    throw err;
  }
});

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["SUPER_ADMIN", "ANALYST"]),
  lobId: z.string().optional()
});

router.post("/users", requireRole("SUPER_ADMIN"), async (req, res) => {
  const parsed = userSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { password, ...rest } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({ data: { ...rest, passwordHash } });
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    if (err.code === "P2002") return res.status(409).json({ error: "A user with this email already exists." });
    throw err;
  }
});

router.get("/users", requireRole("SUPER_ADMIN"), async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, lobId: true, lob: { select: { name: true } } }
  });
  res.json(users);
});

module.exports = router;