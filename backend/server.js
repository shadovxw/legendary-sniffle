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
  .catch(err => console.error(err));

/* ---------- ADMIN LOGIN ---------- */
app.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;

  const result = await db.getAdmin();
  const admin = result.rows[0];

  if (admin.username === username && admin.password === password) {
    return res.json({ success: true });
  }

  res.status(401).json({ success: false });
});

/* ---------- ADD PARTICIPANT ---------- */
app.post("/admin/add", async (req, res) => {
  const { name } = req.body;

  const participant = {
    token: uuid(),
    name
  };

  await db.addParticipant(participant);
  res.json({ success: true });
});

/* ---------- LIST PARTICIPANTS ---------- */
app.get("/admin/list", async (req, res) => {
  const result = await db.listParticipants();
  const list = result.rows.map(p => ({
    id: p.token,
    name: p.name
  }));

  res.json(list);
});

/* ---------- UPDATE NAME ---------- */
app.put("/admin/update", async (req, res) => {
  const { id, name } = req.body;

  await db.updateName(id, name);
  res.json({ success: true });
});

/* ---------- DELETE NAME ---------- */
app.delete("/admin/delete/:id", async (req, res) => {
  await db.deleteParticipant(req.params.id);
  res.json({ success: true });
});

/* ---------- GENERATE & LOCK ---------- */
app.post("/admin/generate", async (req, res) => {
  const result = await db.listParticipants();
  const participants = result.rows;

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
    link: `https://secrect-santa.onrender.com/reveal/${p.token}`
  }));

  res.json(links);
});

/* ---------- CHECK LINK (NO REVEAL) ---------- */
app.get("/reveal/:token", async (req, res) => {
  const result = await db.listParticipants();
  const person = result.rows.find(p => p.token === req.params.token);

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
  const result = await db.listParticipants();
  const person = result.rows.find(p => p.token === req.params.token);

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

/* ---------- ADMIN STATUS ---------- */
app.get("/admin/status", async (req, res) => {
  const result = await db.listParticipants();

  const status = result.rows.map(p => ({
    name: p.name,
    revealed: p.revealed
  }));

  res.json(status);
});

/* ---------- ADMIN LINKS ---------- */
app.get("/admin/links", async (req, res) => {
  const result = await db.listParticipants();

  const links = result.rows.map(p => ({
    name: p.name,
    link: `https://secrect-santa.onrender.com/reveal/${p.token}`
  }));

  res.json({ links });
});

/* ---------- START ---------- */
app.listen(4000, () => {
  console.log("Server running on port 4000");
});
