import express from "express";
import { v4 as uuid } from "uuid";
import Admin from "../models/Admin.js";
import Participant from "../models/Participant.js";
import AppState from "../models/AppState.js";

const router = express.Router();

/* Login */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ where: { username, password } });
  if (!admin) return res.status(401).json({ success: false });
  res.json({ success: true });
});

/* Add */
router.post("/add", async (req, res) => {
  const state = await AppState.findByPk(1);
  if (state.locked) return res.status(403).send("Locked");

  await Participant.create({ name: req.body.name, token: uuid() });
  res.json({ success: true });
});

/* List */
router.get("/list", async (_, res) => {
  const list = await Participant.findAll({
    attributes: ["token", "name"]
  });
  res.json(list.map(p => ({ id: p.token, name: p.name })));
});

/* Update */
router.put("/update", async (req, res) => {
  const state = await AppState.findByPk(1);
  if (state.locked) return res.status(403).send("Locked");

  await Participant.update(
    { name: req.body.name },
    { where: { token: req.body.id } }
  );
  res.json({ success: true });
});

/* Delete */
router.delete("/delete/:id", async (req, res) => {
  const state = await AppState.findByPk(1);
  if (state.locked) return res.status(403).send("Locked");

  await Participant.destroy({ where: { token: req.params.id } });
  res.json({ success: true });
});

/* Generate */
router.post("/generate", async (req, res) => {
  const state = await AppState.findByPk(1);
  if (state.locked)
    return res.status(400).json({ error: "Already locked" });

  const participants = await Participant.findAll();
  const names = participants.map(p => p.name);

  let shuffled;
  do {
    shuffled = [...names].sort(() => Math.random() - 0.5);
  } while (shuffled.some((n, i) => n === names[i]));

  for (let i = 0; i < participants.length; i++) {
    await Participant.update(
      { assignedTo: shuffled[i], revealed: false },
      { where: { token: participants[i].token } }
    );
  }

  await AppState.update({ locked: true }, { where: { id: 1 } });

  res.json(
    participants.map(p => ({
      name: p.name,
      link: `https://secrect-santa.onrender.com/reveal/${p.token}`
    }))
  );
});

/* Regenerate */
router.post("/regenerate", async (_, res) => {
  await AppState.update({ locked: false }, { where: { id: 1 } });
  await Participant.update(
    { assignedTo: null, revealed: false },
    { where: {} }
  );
  res.json({ success: true });
});

export default router;
