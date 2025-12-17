import express from "express";
import Participant from "../models/Participant.js";

const router = express.Router();

/* Check */
router.get("/:token", async (req, res) => {
  const p = await Participant.findByPk(req.params.token);
  if (!p) return res.status(404).json({ error: "invalid_link" });
  if (p.revealed) return res.status(403).json({ error: "already_revealed" });

  res.json({ canReveal: true, assignedTo: p.assignedTo });
});

/* Confirm */
router.post("/:token/confirm", async (req, res) => {
  const p = await Participant.findByPk(req.params.token);
  if (!p || p.revealed)
    return res.status(403).json({ error: "already_revealed" });

  await p.update({ revealed: true });
  res.json({ success: true, assignedTo: p.assignedTo });
});

export default router;
