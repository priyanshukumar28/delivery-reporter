require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const lobRoutes = require("./routes/lob");
const entryRoutes = require("./routes/entries");
const reportRoutes = require("./routes/reports");

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.use("/reports", express.static(path.join(__dirname, "uploads")));

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/lobs", lobRoutes);
app.use("/api", entryRoutes);
app.use("/api/reports", reportRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error." });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Delivery Reporter API running on :${PORT}`));
