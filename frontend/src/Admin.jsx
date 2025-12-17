import { useState, useEffect } from "react";
import axios from "axios";
import "./style.css";

const api = axios.create({
  baseURL: "https://secrect-santa-backend.onrender.com",
  headers: { "Content-Type": "application/json" }
});

export default function Admin() {
  const [name, setName] = useState("");
  const [list, setList] = useState([]);
  const [links, setLinks] = useState([]);
  const [isLocked, setIsLocked] = useState(false);

  /* ---------- LOAD PARTICIPANTS ---------- */
  const loadList = async () => {
    const { data } = await api.get("/list");
    setList(data);
  };

  useEffect(() => {
    loadList();
  }, []);

  /* ---------- ADD NAME ---------- */
  const addName = async () => {
    if (!name.trim()) return;
    await api.post("/add", { name: name.trim() });
    setName("");
    loadList();
  };

  /* ---------- GENERATE ---------- */
  const generate = async () => {
    const { data } = await api.post("/generate");
    setLinks(data);
    setIsLocked(true);
  };

  /* ---------- RESET ---------- */
  const resetAll = async () => {
    const confirmed = window.confirm(
      "⚠️ This will remove all names and links. Continue?"
    );
    if (!confirmed) return;

    await api.post("/reset");
    setLinks([]);
    setIsLocked(false);
    loadList();
  };

  /* ---------- COPY MESSAGE ---------- */
  const copyToClipboard = (link) => {
    const message = `Hey! 🎄
This is your Secret Santa link.

Please open it only when you’re ready — once revealed, it can’t be opened again.

👉 ${link}

Happy gifting! 🎁`;

    navigator.clipboard.writeText(message);
  };

  return (
    <div className="container">
      {!isLocked ? (
        <>
          <div className="card">
            <h2>➕ Add Participant</h2>
            <div className="row">
              <input
                placeholder="Enter name"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyPress={e => e.key === "Enter" && addName()}
              />
              <button onClick={addName}>Add</button>
            </div>
          </div>

          <div className="card">
            <h2>👥 Participants ({list.length})</h2>
            {list.map(p => (
              <div key={p.token} className="list-item">
                <span>{p.name}</span>
              </div>
            ))}
          </div>

          {list.length >= 3 && (
            <div className="card">
              <button className="primary full" onClick={generate}>
                🎁 Generate & Lock
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="card">
          <h2>🎅 Secret Santa Generated</h2>
          <button className="regenerate" onClick={resetAll}>
            🔄 Reset for Next Time
          </button>
        </div>
      )}

      {links.length > 0 && (
        <div className="card">
          <h2>🔗 Share Links</h2>
          {links.map(l => (
            <div key={l.name} className="link-box">
              <strong>{l.name}</strong>
              <button onClick={() => copyToClipboard(l.link)}>
                Copy
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
