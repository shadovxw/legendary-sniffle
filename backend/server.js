import express from "express";
import cors from "cors";
import { v4 as uuid } from "uuid";
import { db, initDB } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

/* ---------- INIT DB ---------- */
initDB()
  .then(() => console.log("Postgres connected"))
  .catch(console.error);

/* ---------- ADD NAME (MANUAL UPLOAD) ---------- */
app.post("/add", async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "name_required" });
  }

  const token = uuid();
  await db.addParticipant(token, name);

  res.json({ success: true });
});

/* ---------- LIST (FOR ADMIN UI) ---------- */
app.get("/list", async (req, res) => {
  const result = await db.listParticipants();
  res.json(result.rows);
});

/* ---------- GENERATE & LOCK ---------- */
app.post("/generate", async (req, res) => {
  const result = await db.listParticipants();
  const participants = result.rows;

  if (participants.length < 2) {
    return res.status(400).json({ error: "not_enough_participants" });
  }

  const names = participants.map(p => p.name);
  let shuffled;

  do {
    shuffled = [...names].sort(() => Math.random() - 0.5);
  } while (shuffled.some((n, i) => n === names[i]));

  const pairs = participants.map((p, i) => ({
    token: p.token,
    assignedTo: shuffled[i]
  }));

  await db.lockAssign(pairs);

  const links = participants.map(p => ({
    name: p.name,
    link: `https://YOUR-RENDER-URL.onrender.com/reveal/${p.token}`
  }));

  res.json(links);
});

/* ---------- CHECK LINK (NO REVEAL) ---------- */
app.get("/reveal/:token", async (req, res) => {
  const result = await db.getParticipantByToken(req.params.token);
  const person = result.rows[0];

  if (!person) {
    return res.status(404).json({ error: "invalid_link" });
  }

  if (person.revealed) {
    return res.status(403).json({ error: "already_revealed" });
  }

  res.json({
    canReveal: true,
    assignedTo: person.assigned_to
  });
});

/* ---------- CONFIRM REVEAL ---------- */
app.post("/reveal/:token/confirm", async (req, res) => {
  const result = await db.getParticipantByToken(req.params.token);
  const person = result.rows[0];

  if (!person) {
    return res.status(404).json({ error: "invalid_link" });
  }

  if (person.revealed) {
    return res.status(403).json({ error: "already_revealed" });
  }

  await db.markRevealed(req.params.token);

  res.json({
    success: true,
    assignedTo: person.assigned_to
  });
});

/* ---------- RESET (OPTIONAL) ---------- */
app.post("/reset", async (req, res) => {
  await db.deleteAll();
  res.json({ success: true });
});

/* ---------- START ---------- */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
