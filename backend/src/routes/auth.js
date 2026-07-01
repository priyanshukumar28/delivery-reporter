const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email and password required." });

  const user = await prisma.user.findUnique({ where: { email }, include: { lob: true } });
  if (!user) return res.status(401).json({ error: "Invalid credentials." });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials." });

  const token = jwt.sign(
    { id: user.id, role: user.role, lobId: user.lobId, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, lob: user.lob }
  });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, include: { lob: true } });
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, lob: user.lob });
});

module.exports = router;
