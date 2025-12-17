import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "https://secrect-santa-backend.onrender.com"
});

export default function Reveal() {
  const { token } = useParams();
  const [name, setName] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/reveal/${token}`)
      .then(r => setName(r.data.assignedTo))
      .catch(e => setError("Link expired or used"));
  }, [token]);

  const reveal = async () => {
    await api.post(`/reveal/${token}/confirm`);
    setDone(true);
  };

  if (error) return <h2>{error}</h2>;

  return (
    <div className="container">
      {!done ? (
        <>
          <p>Ready?</p>
          <button onClick={reveal}>Reveal</button>
        </>
      ) : (
        <h1>You got: {name}</h1>
      )}
    </div>
  );
}
