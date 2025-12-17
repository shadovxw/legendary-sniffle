import express from "express";
import cors from "cors";
import fs from "fs";
import { v4 as uuid } from "uuid";

const app = express();
app.use(cors());
app.use(express.json());

const DB = "./data.json";

/* ---------- DB HELPERS ---------- */
const readDB = () => {
  return JSON.parse(fs.readFileSync(DB));
};

const writeDB = (data) => {
  fs.writeFileSync(DB, JSON.stringify(data, null, 2));
};

/* ---------- Admin Login ---------- */
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  const db = readDB();

  if (username === db.admin.username && password === db.admin.password) {
    return res.json({ success: true });
  }

  res.status(401).json({ success: false });
});

/* ---------- Add Names ---------- */
app.post("/admin/add", (req, res) => {
  const { name } = req.body;
  const db = readDB();

  if (db.locked) {
    return res.status(403).send("Locked");
  }

  const participant = {
    name,
    token: uuid(),
    assignedTo: null,
    revealed: false
  };

  db.participants.push(participant);
  writeDB(db);

  res.json({ success: true });
});

/* ---------- Get Participants ---------- */
app.get("/admin/list", (req, res) => {
  const db = readDB();
  const list = db.participants.map(p => ({ id: p.token, name: p.name }));
  res.json(list);
});

/* ---------- Update Name ---------- */
app.put("/admin/update", (req, res) => {
  const { id, name } = req.body;
  const db = readDB();

  if (db.locked) {
    return res.status(403).send("Locked");
  }

  const p = db.participants.find(p => p.token === id);
  if (p) {
    p.name = name;
  }

  writeDB(db);
  res.json({ success: true });
});

/* ---------- Delete Name ---------- */
app.delete("/admin/delete/:id", (req, res) => {
  const db = readDB();

  if (db.locked) {
    return res.status(403).send("Locked");
  }

  db.participants = db.participants.filter(
    p => p.token !== req.params.id
  );

  writeDB(db);
  res.json({ success: true });
});

/* ---------- Generate & Lock ---------- */
app.post("/admin/generate", (req, res) => {
  const db = readDB();
  if (db.locked) {
    return res.status(400).json({ error: "Already locked" });
  }

  const names = db.participants.map(p => p.name);
  let shuffled;

  do {
    shuffled = [...names].sort(() => Math.random() - 0.5);
  } while (shuffled.some((n, i) => n === names[i]));

  db.participants.forEach((p, i) => {
    p.assignedTo = shuffled[i];
    p.revealed = false;
  });

  db.locked = true;
  writeDB(db);

  const links = db.participants.map(p => ({
    name: p.name,
    link: `http://localhost:5173/reveal/${p.token}`
  }));

  res.json(links);
});

/* ---------- Regenerate ---------- */
app.post("/admin/regenerate", (req, res) => {
  const db = readDB();

  db.locked = false;
  db.participants.forEach(p => {
    p.assignedTo = null;
    p.revealed = false;
  });

  writeDB(db);
  res.json({ success: true });
});

/* ---------- CHECK LINK (NO REVEAL) ---------- */
app.get("/reveal/:token", (req, res) => {
  const db = readDB();
  const person = db.participants.find(p => p.token === req.params.token);

  if (!person) {
    return res.status(404).json({ error: "invalid_link" });
  }

  if (person.revealed) {
    return res.status(403).json({ error: "already_revealed" });
  }

  res.json({
    canReveal: true,
    assignedTo: person.assignedTo
  });
});

/* ---------- CONFIRM REVEAL ---------- */
app.post("/reveal/:token/confirm", (req, res) => {
  const db = readDB();
  const person = db.participants.find(p => p.token === req.params.token);

  if (!person) {
    return res.status(404).json({ error: "invalid_link" });
  }

  if (person.revealed) {
    return res.status(403).json({ error: "already_revealed" });
  }

  person.revealed = true;
  writeDB(db);

  res.json({
    success: true,
    assignedTo: person.assignedTo
  });
});

/* ---------- Admin Status ---------- */
app.get("/admin/status", (req, res) => {
  const db = readDB();
  const status = db.participants.map(p => ({
    name: p.name,
    revealed: p.revealed
  }));

  res.json(status);
});

/* ---------- Admin Links ---------- */
app.get("/admin/links", (req, res) => {
  const db = readDB();

  if (!db.locked) {
    return res.status(400).json({ error: "Not yet generated" });
  }

  const links = db.participants.map(p => ({
    name: p.name,
    link: `http://localhost:5173/reveal/${p.token}`
  }));

  res.json({ locked: true, links });
});

app.listen(4000);
