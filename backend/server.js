import express from "express";
import cors from "cors";
import { v4 as uuid } from "uuid";
import { db, initDB } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

await initDB();

/* ---------- PARTICIPANTS ---------- */
app.get("/participants", async (_, res) => {
  const { rows } = await db.listParticipants();
  res.json(rows);
});

app.post("/participants", async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "name_required" });
  }

  await db.addParticipant(name);
  res.json({ success: true });
});

app.delete("/participants/:id", async (req, res) => {
  await db.deleteParticipant(req.params.id);
  res.json({ success: true });
});

/* ---------- GENERATE SECRET SANTA ---------- */
app.post("/generate", async (_, res) => {
  const { rows: people } = await db.listParticipants();

  if (people.length < 2) {
    return res.status(400).json({ error: "not_enough_participants" });
  }

  // Clear old assignments (new game)
  await db.clearAssignments();

  const names = people.map(p => p.name);
  let shuffled;

  do {
    shuffled = [...names].sort(() => Math.random() - 0.5);
  } while (shuffled.some((n, i) => n === names[i]));

  const links = [];

  for (let i = 0; i < people.length; i++) {
    const token = uuid();

    await db.createAssignment(
      token,
      people[i].id,
      shuffled[i]
    );

    links.push({
      name: people[i].name,
      link: `https://secrect-santa.onrender.com/reveal/${token}`
    });
  }

  res.json(links);
});

/* ---------- REVEAL (ALWAYS WORKS) ---------- */
app.get("/reveal/:token", async (req, res) => {
  const { rows } = await db.getReveal(req.params.token);
  const data = rows[0];

  if (!data) {
    return res.status(404).json({ error: "invalid_link" });
  }

  res.json({
    assignedTo: data.assigned_to,
    revealed: data.revealed
  });
});

/* ---------- CONFIRM REVEAL (MARK ONCE) ---------- */
app.post("/reveal/:token/confirm", async (req, res) => {
  await db.markRevealed(req.params.token);
  res.json({ success: true });
});

/* ---------- ADMIN LINKS ---------- */
app.get("/admin/links", async (_, res) => {
  const { rows } = await db.getAllLinks();
  res.json(
    rows.map(r => ({
      name: r.name,
      link: `https://secrect-santa.onrender.com/reveal/${r.token}`
    }))
  );
});

/* ---------- DASHBOARD ---------- */
app.get("/dashboard", async (_, res) => {
  const { rows } = await db.dashboardStatus();
  res.json(rows);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log("🚀 Server running on port", PORT)
);
