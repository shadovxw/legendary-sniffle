import express from "express";
import cors from "cors";
import { v4 as uuid } from "uuid";

const app = express();
app.use(cors());
app.use(express.json());

/* ---------- IN-MEMORY DATABASE ---------- */
const db = {
  admin: {
    username: "admin",
    password: "santa2025"
  },
  locked: false,
  participants: [
    {
      name: "Ramesh Madhavan",
      token: "ram001-madhavan-2025",
      assignedTo: "Vaishnavi Warrier",
      revealed: false
    },
    {
      name: "Priya Ramesh",
      token: "pri002-ramesh-2025",
      assignedTo: "Uma Kutty",
      revealed: false
    },
    {
      name: "Vaishnavi Warrier",
      token: "vai003-warrier-2025",
      assignedTo: "Devdas",
      revealed: false
    },
    {
      name: "Vrishank Warrier",
      token: "vri004-warrier-2025",
      assignedTo: "Umesh Kutty",
      revealed: false
    },
    {
      name: "Sunitha A",
      token: "sun005-sunitha-2025",
      assignedTo: "Shruti Warrier",
      revealed: false
    },
    {
      name: "Usha Devdas",
      token: "ush006-devdas-2025",
      assignedTo: "Yug",
      revealed: false
    },
    {
      name: "Devdas",
      token: "dev007-devdas-2025",
      assignedTo: "Vrishank Warrier",
      revealed: false
    },
    {
      name: "Shruti Warrier",
      token: "shr008-warrier-2025",
      assignedTo: "Usha Devdas",
      revealed: false
    },
    {
      name: "Sujatha",
      token: "suj009-sujatha-2025",
      assignedTo: "Ramesh Madhavan",
      revealed: false
    },
    {
      name: "Yug",
      token: "yug010-yug-2025",
      assignedTo: "Sanjay A",
      revealed: false
    },
    {
      name: "Padma Kutty",
      token: "pad011-kutty-2025",
      assignedTo: "Sunitha A",
      revealed: false
    },
    {
      name: "Uma Kutty",
      token: "uma012-kutty-2025",
      assignedTo: "Sujatha",
      revealed: false
    },
    {
      name: "Sanjay A",
      token: "san013-sanjay-2025",
      assignedTo: "Padma Kutty",
      revealed: false
    },
    {
      name: "Umesh Kutty",
      token: "ume014-kutty-2025",
      assignedTo: "Priya Ramesh",
      revealed: false
    }
  ]
};

/* ---------- ADMIN LOGIN ---------- */
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username === db.admin.username &&
    password === db.admin.password
  ) {
    return res.json({ success: true });
  }

  res.status(401).json({ success: false });
});

/* ---------- ADD PARTICIPANT ---------- */
app.post("/admin/add", (req, res) => {
  if (db.locked) return res.status(403).send("Locked");

  const { name } = req.body;
  db.participants.push({
    name,
    token: uuid(),
    assignedTo: null,
    revealed: false
  });

  res.json({ success: true });
});

/* ---------- LIST PARTICIPANTS ---------- */
app.get("/admin/list", (req, res) => {
  res.json(
    db.participants.map(p => ({
      id: p.token,
      name: p.name
    }))
  );
});

/* ---------- UPDATE NAME ---------- */
app.put("/admin/update", (req, res) => {
  if (db.locked) return res.status(403).send("Locked");

  const { id, name } = req.body;
  const p = db.participants.find(p => p.token === id);
  if (p) p.name = name;

  res.json({ success: true });
});

/* ---------- DELETE ---------- */
app.delete("/admin/delete/:id", (req, res) => {
  if (db.locked) return res.status(403).send("Locked");

  db.participants = db.participants.filter(
    p => p.token !== req.params.id
  );

  res.json({ success: true });
});

/* ---------- GENERATE & LOCK ---------- */
app.post("/admin/generate", (req, res) => {
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

  res.json(
    db.participants.map(p => ({
      name: p.name,
      link: `https://secrect-santa.onrender.com/reveal/${p.token}`
    }))
  );
});

/* ---------- REGENERATE ---------- */
app.post("/admin/regenerate", (req, res) => {
  db.locked = false;
  db.participants.forEach(p => {
    p.assignedTo = null;
    p.revealed = false;
  });

  res.json({ success: true });
});

/* ---------- CHECK LINK ---------- */
app.get("/reveal/:token", (req, res) => {
  const person = db.participants.find(
    p => p.token === req.params.token
  );

  if (!person) return res.status(404).json({ error: "invalid_link" });
  if (person.revealed)
    return res.status(403).json({ error: "already_revealed" });

  res.json({
    canReveal: true,
    assignedTo: person.assignedTo
  });
});

/* ---------- CONFIRM REVEAL ---------- */
app.post("/reveal/:token/confirm", (req, res) => {
  const person = db.participants.find(
    p => p.token === req.params.token
  );

  if (!person) return res.status(404).json({ error: "invalid_link" });
  if (person.revealed)
    return res.status(403).json({ error: "already_revealed" });

  person.revealed = true;

  res.json({
    success: true,
    assignedTo: person.assignedTo
  });
});

/* ---------- ADMIN STATUS ---------- */
app.get("/admin/status", (req, res) => {
  res.json(
    db.participants.map(p => ({
      name: p.name,
      revealed: p.revealed
    }))
  );
});

/* ---------- ADMIN LINKS ---------- */
app.get("/admin/links", (req, res) => {
  if (!db.locked) {
    return res.status(400).json({ error: "Not yet generated" });
  }

  res.json({
    locked: true,
    links: db.participants.map(p => ({
      name: p.name,
      link: `https://secrect-santa.onrender.com/reveal/${p.token}`
    }))
  });
});

/* ---------- START SERVER ---------- */
app.listen(4000, () => {
  console.log("🎄 Secret Santa server running on port 4000");
});
