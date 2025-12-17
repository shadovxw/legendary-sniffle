import { useEffect, useState } from "react";
import axios from "axios";
import "./style.css";

const api = axios.create({
  baseURL: "http://localhost:4000",
  headers: { "Content-Type": "application/json" }
});

export default function Dashboard() {
  const [revealStatus, setRevealStatus] = useState([]);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 5000); // auto-refresh
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    const { data } = await api.get("/admin/status");
    setRevealStatus(data);
  };

  return (
    <div className="container">
      <h1>📊 Dashboard</h1>

      <div className="card">
        {revealStatus.map((p, i) => (
          <div
            key={i}
            className={p.revealed ? "revealed" : "not-revealed"}
          >
            <span>{p.name}</span>
            <span className="status-badge">
              {p.revealed ? "Revealed ✨" : "Pending"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
