import { useState } from "react";
import axios from "axios";
import "./style.css";

const api = axios.create({
  baseURL: "http://localhost:4000",
  headers: { "Content-Type": "application/json" }
});

export default function Admin() {
  const [logged, setLogged] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [list, setList] = useState([]);
  const [links, setLinks] = useState([]);
  const [revealStatus, setRevealStatus] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [isLocked, setIsLocked] = useState(false);

  /* ---------- AUTH ---------- */
  const login = async () => {
    setError("");
    try {
      await api.post("/admin/login", {
        username: "admin",
        password
      });
      setLogged(true);
      checkStatus();
    } catch {
      setError("Invalid password. Please try again.");
    }
  };

  /* ---------- STATUS ---------- */
  const checkStatus = async () => {
    try {
      const { data } = await api.get("/admin/links");
      setIsLocked(true);
      setLinks(data.links);
      loadRevealStatus();
    } catch {
      setIsLocked(false);
      loadList();
    }
  };

  /* ---------- LOADERS ---------- */
  const loadList = async () => {
    const { data } = await api.get("/admin/list");
    setList(data);
  };

  const loadRevealStatus = async () => {
    try {
      const { data } = await api.get("/admin/status");
      setRevealStatus(data);
    } catch {
      console.log("Could not load reveal status");
    }
  };

  /* ---------- CRUD ---------- */
  const addName = async () => {
    if (!name.trim()) return;
    await api.post("/admin/add", { name: name.trim() });
    setName("");
    loadList();
  };

  const deleteName = async (id) => {
    await api.delete(`/admin/delete/${id}`);
    loadList();
  };

  const saveEdit = async (id) => {
    if (!editName.trim()) return;
    await api.put("/admin/update", {
      id,
      name: editName.trim()
    });
    setEditingId(null);
    loadList();
  };

  /* ---------- GENERATE ---------- */
  const generate = async () => {
    const { data } = await api.post("/admin/generate");
    setLinks(data);
    setIsLocked(true);
    loadRevealStatus();
  };

  const regenerate = async () => {
    const confirmed = window.confirm(
      "⚠️ This will reset everything. Continue?"
    );
    if (!confirmed) return;

    try {
      await api.post("/admin/regenerate");
      setIsLocked(false);
      setLinks([]);
      setRevealStatus([]);
      loadList();
    } catch {
    }
  };

  /* ---------- HELPERS ---------- */
  const copyToClipboard = (link, name) => {
  const message = `Hey! 🎄
    This is your Secret Santa link.

    Please open it only when you’re ready — once revealed, it can’t be opened again.

    👉 ${link}

    Happy gifting! 🎁`;

    navigator.clipboard.writeText(message);
};


  const copyAllLinks = () => {
    const text = links.map(l => `${l.name}: ${l.link}`).join("\n\n");
    navigator.clipboard.writeText(text);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") login();
  };
  

  /* ---------- LOGIN UI ---------- */
  if (!logged) {
    return (
      <div className="page-center">
        <div className="card auth-card">
          <h1>🎅 Secret Santa</h1>
          <p className="subtitle">Admin Login</p>

          {error && <div className="error-message">{error}</div>}

          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
          />

          <button className="primary full" onClick={login}>
            Login
          </button>
        </div>
      </div>
    );
  }
  

  /* ---------- MAIN UI ---------- */
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
              <div className="list-item" key={p.id}>
                {editingId === p.id ? (
                  <>
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                    />
                    <div>
                      <button onClick={() => saveEdit(p.id)}>Save</button>
                      <button onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <span>{p.name}</span>
                    <div>
                      <button
                        onClick={() => {
                          setEditingId(p.id);
                          setEditName(p.name);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="danger"
                        onClick={() => deleteName(p.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
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
          <button className="regenerate" onClick={regenerate}>
            🔄 Regenerate All
          </button>
        </div>
      )}

      {links.length > 0 && (
        <>
          <div className="card">
            <h2>🔗 Share Links</h2>
            {/* <button className="primary" onClick={copyAllLinks}>
              📋 Copy All
            </button> */}

            {links.map(l => (
              <div key={l.name} className="link-box">
                <strong>{l.name}</strong>
                <button onClick={() => copyToClipboard(l.link, l.name)}>
                  Copy
                </button>
              </div>
            ))}
          </div>

          <div className="card">
            <h2>📊 Reveal Status</h2>
            {revealStatus.map((p, i) => (
              <div key={i} className={p.revealed ? "revealed" : "not-revealed"}>
                <span>{p.name}</span>
                <span className="status-badge">
                  {p.revealed ? "Revealed ✨" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}