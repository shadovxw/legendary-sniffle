import { useEffect, useState } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "https://secrect-santa-backend.onrender.com"
});

export default function Dashboard() {
  const [status, setStatus] = useState([]);

  const load = async () => {
    const { data } = await api.get("/dashboard");
    setStatus(data);
  };

  useEffect(() => {
    load();
    const i = setInterval(load, 5000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="container">
      <h1>Dashboard</h1>
      {status.map(s => (
        <div key={s.name}>
          {s.name} — {s.revealed ? "✅ Revealed" : "⏳ Pending"}
        </div>
      ))}
    </div>
  );
}
