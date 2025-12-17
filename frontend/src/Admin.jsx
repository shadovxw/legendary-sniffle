import { useEffect, useState } from "react";

const API_BASE = "https://secrect-santa-backend.onrender.com";

export default function Admin() {
  const [name, setName] = useState("");
  const [list, setList] = useState([]);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await fetch(`${API_BASE}/participants`);
    const data = await res.json();
    setList(data);
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await fetch(`${API_BASE}/participants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    setName("");
    await load();
    setLoading(false);
  };

  const del = async (id) => {
    if (!confirm("Remove this participant?")) return;
    await fetch(`${API_BASE}/participants/${id}`, { method: "DELETE" });
    load();
  };

  const generate = async () => {
    if (list.length < 2) {
      alert("Need at least 2 participants!");
      return;
    }
    setLoading(true);
    const res = await fetch(`${API_BASE}/generate`, { method: "POST" });
    const data = await res.json();
    setLinks(data);
    setLoading(false);
  };

  return (
    <div className="christmas-container">
      <div className="snowflakes" aria-hidden="true">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="snowflake">❅</div>
        ))}
      </div>

      <div className="admin-card">
        <div className="card-header">
          <h1>🎅 Secret Santa Admin</h1>
          <p className="subtitle">Manage participants and generate assignments</p>
        </div>

        <div className="section">
          <h2>✨ Add Participant</h2>
          <div className="input-group">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && add()}
              placeholder="Enter participant name..."
              className="festive-input"
            />
            <button onClick={add} disabled={loading} className="btn-add">
              <span>➕</span> Add
            </button>
          </div>
        </div>

        <div className="section">
          <h2>👥 Participants ({list.length})</h2>
          <div className="participants-list">
            {list.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎁</div>
                <p>No participants yet. Add someone to get started!</p>
              </div>
            ) : (
              list.map((p, idx) => (
                <div key={p.id} className="participant-item" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="participant-info">
                    <span className="participant-number">{idx + 1}</span>
                    <span className="participant-name">{p.name}</span>
                  </div>
                  <button onClick={() => del(p.id)} className="btn-delete">
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {list.length >= 2 && (
          <button onClick={generate} disabled={loading} className="btn-generate">
            <span className="btn-icon">🎄</span>
            <span>Generate Secret Santa</span>
            <span className="btn-icon">🎄</span>
          </button>
        )}

        {links.length > 0 && (
          <div className="section links-section">
            <h2>🔗 Share These Links</h2>
            <div className="links-container">
              {links.map((l, idx) => (
                <div key={l.name} className="link-card" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="link-header">
                    <span className="link-icon">🎁</span>
                    <strong>{l.name}</strong>
                  </div>
                  <button
                    onClick={() => {
                      const message = `Hello ${l.name}! 🎅🎄\n\nYou've been invited to participate in Secret Santa!\n\nClick the link below to find out who you're buying a gift for:\n\n${l.link}\n\nKeep it secret! 🎁`;
                      navigator.clipboard.writeText(message);
                      alert(`Message copied for ${l.name}!`);
                    }}
                    className="btn-copy"
                  >
                    📋 Copy Message
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
          min-height: 100vh;
        }

        .christmas-container {
          min-height: 100vh;
          padding: 2rem 1rem;
          position: relative;
          overflow: hidden;
        }

        .snowflakes {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .snowflake {
          position: absolute;
          top: -10%;
          color: white;
          font-size: 1.5rem;
          opacity: 0.8;
          animation: fall linear infinite;
        }

        .snowflake:nth-child(1) { left: 10%; animation-duration: 10s; animation-delay: 0s; }
        .snowflake:nth-child(2) { left: 20%; animation-duration: 12s; animation-delay: 1s; }
        .snowflake:nth-child(3) { left: 30%; animation-duration: 8s; animation-delay: 2s; }
        .snowflake:nth-child(4) { left: 40%; animation-duration: 15s; animation-delay: 0.5s; }
        .snowflake:nth-child(5) { left: 50%; animation-duration: 11s; animation-delay: 1.5s; }
        .snowflake:nth-child(6) { left: 60%; animation-duration: 9s; animation-delay: 3s; }
        .snowflake:nth-child(7) { left: 70%; animation-duration: 13s; animation-delay: 0.8s; }
        .snowflake:nth-child(8) { left: 80%; animation-duration: 10s; animation-delay: 2.5s; }
        .snowflake:nth-child(9) { left: 90%; animation-duration: 14s; animation-delay: 1.2s; }
        .snowflake:nth-child(10) { left: 15%; animation-duration: 11s; animation-delay: 3.5s; }
        .snowflake:nth-child(11) { left: 25%; animation-duration: 9s; animation-delay: 4s; }
        .snowflake:nth-child(12) { left: 35%; animation-duration: 12s; animation-delay: 2s; }
        .snowflake:nth-child(13) { left: 45%; animation-duration: 10s; animation-delay: 3s; }
        .snowflake:nth-child(14) { left: 55%; animation-duration: 13s; animation-delay: 1s; }
        .snowflake:nth-child(15) { left: 75%; animation-duration: 11s; animation-delay: 2.5s; }

        @keyframes fall {
          to {
            transform: translateY(110vh) rotate(360deg);
          }
        }

        .admin-card {
          max-width: 900px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.98);
          border-radius: 2rem;
          padding: 2.5rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
          position: relative;
          z-index: 2;
          border: 3px solid rgba(220, 38, 38, 0.3);
        }

        .card-header {
          text-align: center;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 3px solid #fee;
        }

        .card-header h1 {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #dc2626 0%, #16a34a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
          animation: titleShine 3s ease-in-out infinite;
        }

        @keyframes titleShine {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.2); }
        }

        .subtitle {
          color: #64748b;
          font-size: 1.1rem;
        }

        .section {
          margin-bottom: 2rem;
        }

        .section h2 {
          font-size: 1.5rem;
          color: #1e293b;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .input-group {
          display: flex;
          gap: 1rem;
        }

        .festive-input {
          flex: 1;
          padding: 1rem 1.5rem;
          border: 2px solid #e2e8f0;
          border-radius: 1rem;
          font-size: 1rem;
          transition: all 0.3s;
          background: white;
        }

        .festive-input:focus {
          outline: none;
          border-color: #dc2626;
          box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1);
        }

        .btn-add {
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: white;
          border: none;
          border-radius: 1rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-add:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(220, 38, 38, 0.3);
        }

        .btn-add:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .participants-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .participant-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 1rem;
          border: 2px solid #e2e8f0;
          transition: all 0.3s;
          animation: slideIn 0.4s ease-out backwards;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
        }

        .participant-item:hover {
          border-color: #dc2626;
          transform: translateX(5px);
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
        }

        .participant-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .participant-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: white;
          border-radius: 50%;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .participant-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e293b;
        }

        .btn-delete {
          padding: 0.5rem 1rem;
          background: white;
          border: 2px solid #fee2e2;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 1.2rem;
        }

        .btn-delete:hover {
          background: #fef2f2;
          border-color: #dc2626;
          transform: scale(1.1);
        }

        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
          color: #64748b;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .btn-generate {
          width: 100%;
          padding: 1.5rem 2rem;
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          color: white;
          border: none;
          border-radius: 1.25rem;
          font-size: 1.25rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-top: 1rem;
        }

        .btn-generate:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(22, 163, 74, 0.4);
        }

        .btn-generate:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-icon {
          font-size: 1.5rem;
          animation: spin 3s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .links-section {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 3px solid #fee;
        }

        .links-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }

        .link-card {
          padding: 1.5rem;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 1rem;
          border: 2px solid #fbbf24;
          animation: fadeInUp 0.5s ease-out backwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
        }

        .link-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .link-icon {
          font-size: 1.5rem;
        }

        .link-header strong {
          font-size: 1.1rem;
          color: #92400e;
        }

        .btn-copy {
          width: 100%;
          padding: 0.75rem;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          border: none;
          border-radius: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-copy:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
        }

        @media (max-width: 768px) {
          .admin-card {
            padding: 1.5rem;
          }

          .input-group {
            flex-direction: column;
          }

          .card-header h1 {
            font-size: 2rem;
          }

          .links-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}