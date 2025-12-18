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
  if (!name) return res.status(400).json({ error: "name_required" });

  await db.addParticipant(name);
  res.json({ success: true });
});

app.delete("/participants/:id", async (req, res) => {
  await db.deleteParticipant(req.params.id);
  res.json({ success: true });
});

/* ---------- GENERATE ---------- */
app.post("/generate", async (_, res) => {
  await db.deactivateRounds();
  const round = await db.createRound();
  const roundId = round.rows[0].id;

  const { rows: people } = await db.listParticipants();
  if (people.length < 2)
    return res.status(400).json({ error: "not_enough_participants" });

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
      roundId,
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

/* ---------- REVEAL (MULTI-VIEW ALLOWED) ---------- */
app.get("/reveal/:token", async (req, res) => {
  const { rows } = await db.getReveal(req.params.token);
  const a = rows[0];

  if (!a || !a.active)
    return res.status(404).json({ error: "expired_link" });

  res.json({ assignedTo: a.assigned_to });
});

/* ---------- ADMIN ---------- */
app.get("/admin/links", async (_, res) => {
  const { rows } = await db.getActiveLinks();
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
  console.log("🚀 Server running on", PORT)
);
