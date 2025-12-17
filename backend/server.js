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
  const data = JSON.parse(fs.readFileSync(DB));
  console.log("📂 DB READ:", JSON.stringify(data, null, 2));
  return data;
};

const writeDB = (data) => {
  console.log("💾 DB WRITE:", JSON.stringify(data, null, 2));
  fs.writeFileSync(DB, JSON.stringify(data, null, 2));
};

/* ---------- Admin Login ---------- */
app.post("/admin/login", (req, res) => {
  console.log("➡️ POST /admin/login", req.body);

  const { username, password } = req.body;
  const db = readDB();

  if (username === db.admin.username && password === db.admin.password) {
    console.log("✅ Admin login success");
    return res.json({ success: true });
  }

  console.log("❌ Admin login failed");
  res.status(401).json({ success: false });
});

/* ---------- Add Names ---------- */
app.post("/admin/add", (req, res) => {
  console.log("➡️ POST /admin/add", req.body);

  const { name } = req.body;
  const db = readDB();

  if (db.locked) {
    console.log("🔒 Add blocked: DB is locked");
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

  console.log("➕ Participant added:", participant);
  res.json({ success: true });
});

/* ---------- Get Participants ---------- */
app.get("/admin/list", (req, res) => {
  console.log("➡️ GET /admin/list");

  const db = readDB();
  const list = db.participants.map(p => ({ id: p.token, name: p.name }));

  console.log("📤 Sending participants:", list);
  res.json(list);
});

/* ---------- Update Name ---------- */
app.put("/admin/update", (req, res) => {
  console.log("➡️ PUT /admin/update", req.body);

  const { id, name } = req.body;
  const db = readDB();

  if (db.locked) {
    console.log("🔒 Update blocked: DB is locked");
    return res.status(403).send("Locked");
  }

  const p = db.participants.find(p => p.token === id);
  if (p) {
    console.log(`✏️ Updating name ${p.name} → ${name}`);
    p.name = name;
  }

  writeDB(db);
  res.json({ success: true });
});

/* ---------- Delete Name ---------- */
app.delete("/admin/delete/:id", (req, res) => {
  console.log("➡️ DELETE /admin/delete", req.params.id);

  const db = readDB();

  if (db.locked) {
    console.log("🔒 Delete blocked: DB is locked");
    return res.status(403).send("Locked");
  }

  db.participants = db.participants.filter(
    p => p.token !== req.params.id
  );

  writeDB(db);
  console.log("🗑️ Participant deleted:", req.params.id);
  res.json({ success: true });
});

/* ---------- Generate & Lock ---------- */
app.post("/admin/generate", (req, res) => {
  console.log("➡️ POST /admin/generate");

  const db = readDB();
  if (db.locked) {
    console.log("❌ Already locked");
    return res.status(400).json({ error: "Already locked" });
  }

  const names = db.participants.map(p => p.name);
  let shuffled;

  do {
    shuffled = [...names].sort(() => Math.random() - 0.5);
  } while (shuffled.some((n, i) => n === names[i]));

  console.log("🎲 Original names:", names);
  console.log("🎲 Shuffled names:", shuffled);

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

  console.log("🔒 Generated & Locked");
  console.log("📤 Sending links:", links);

  res.json(links);
});

/* ---------- Regenerate ---------- */
app.post("/admin/regenerate", (req, res) => {
  console.log("➡️ POST /admin/regenerate");

  const db = readDB();

  db.locked = false;
  db.participants.forEach(p => {
    p.assignedTo = null;
    p.revealed = false;
  });

  writeDB(db);
  console.log("🔓 Unlocked and reset");

  res.json({ success: true });
});

/* ---------- Reveal ---------- */
// app.get("/reveal/:token", (req, res) => {
//   console.log("➡️ GET /reveal", req.params.token);

//   const db = readDB();
//   const person = db.participants.find(p => p.token === req.params.token);

//   if (!person) {
//     console.log("❌ Invalid token");
//     return res.status(404).json({ error: "Invalid link" });
//   }

//   if (person.revealed) {
//     console.log(`⚠️ Already revealed for ${person.name}`);
//     return res.status(403).json({
//       error: "already_revealed"
//     });
//   }

//   console.log(`🎁 ${person.name} revealed → ${person.assignedTo}`);
//   res.json({ assignedTo: person.assignedTo });
// });
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

  // DO NOT update DB here
  res.json({
    canReveal: true,
    assignedTo: person.assignedTo // safe to send now
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

  // ✅ Update DB ONLY after button click
  person.revealed = true;
  writeDB(db);

  res.json({
    success: true,
    assignedTo: person.assignedTo
  });
});


/* ---------- Admin Status ---------- */
app.get("/admin/status", (req, res) => {
  console.log("➡️ GET /admin/status");

  const db = readDB();
  const status = db.participants.map(p => ({
    name: p.name,
    revealed: p.revealed
  }));

  console.log("📤 Reveal status:", status);
  res.json(status);
});

/* ---------- Admin Links ---------- */
app.get("/admin/links", (req, res) => {
  console.log("➡️ GET /admin/links");

  const db = readDB();

  if (!db.locked) {
    console.log("❌ Not generated yet");
    return res.status(400).json({ error: "Not yet generated" });
  }

  const links = db.participants.map(p => ({
    name: p.name,
    link: `http://localhost:5173/reveal/${p.token}`
  }));

  console.log("📤 Sending stored links:", links);
  res.json({ locked: true, links });
});

app.listen(4000, () =>
  console.log("🚀 Backend running on http://localhost:4000")
);
