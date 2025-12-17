import { useEffect, useState } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "https://secrect-santa-backend.onrender.com"
});

export default function Admin() {
  const [name, setName] = useState("");
  const [list, setList] = useState([]);
  const [links, setLinks] = useState([]);

  const load = async () => {
    const { data } = await api.get("/participants");
    setList(data);
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    await api.post("/participants", { name });
    setName("");
    load();
  };

  const del = async (id) => {
    await api.delete(`/participants/${id}`);
    load();
  };

  const generate = async () => {
    const { data } = await api.post("/generate");
    setLinks(data);
  };

  return (
    <div className="container">
      <h1>Admin</h1>

      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Name"
      />
      <button onClick={add}>Add</button>

      {list.map(p => (
        <div key={p.id}>
          {p.name}
          <button onClick={() => del(p.id)}>❌</button>
        </div>
      ))}

      <button onClick={generate}>🎁 Generate</button>

      {links.map(l => (
        <div key={l.name}>
          {l.name}
          <button onClick={() =>
            navigator.clipboard.writeText(l.link)
          }>
            Copy Link
          </button>
        </div>
      ))}
    </div>
  );
}
