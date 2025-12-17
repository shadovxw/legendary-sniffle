import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import axios from "axios";
import "./style.css";

const api = axios.create({
  baseURL: "https://secrect-santa-backend.onrender.com",
  headers: { "Content-Type": "application/json" }
});

export default function Reveal() {
  const { token } = useParams();
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [alreadyRevealed, setAlreadyRevealed] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [canReveal, setCanReveal] = useState(false);

  /* ---------- CHECK LINK (NO REVEAL YET) ---------- */
  useEffect(() => {
    console.log("hello")
    api
      .get(`/reveal/${token}`)
      .then(({ data }) => {
        console.log("data:", data)
        setResult(data.assignedTo);
        setCanReveal(data.canReveal);
        setLoading(false);
      })
      .catch(err => {
        if (
          err.response?.status === 403 &&
          err.response?.data?.error === "already_revealed"
        ) {
          setAlreadyRevealed(true);
        } else {
          setError(true);
        }
        setLoading(false);
      });
  }, [token]);

  /* ---------- CONFIRM REVEAL ---------- */
const handleReveal = async () => {
  try {
    setRevealed(true);
    await api.post(`/reveal/${token}/confirm`);
  } catch (err) {
    if (err.response?.data?.error === "already_revealed") {
      setAlreadyRevealed(true);
    }
  }
};


  return (
    <div
      className="page-center"
      style={{
        background:
          "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
      }}
    >
      <div
        className="card auth-card"
        style={{
          maxWidth: "32rem",
          background: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(10px)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: "200px",
            height: "200px",
            background:
              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "50%",
            opacity: "0.1"
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            bottom: "-30px",
            left: "-30px",
            width: "150px",
            height: "150px",
            background:
              "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            borderRadius: "50%",
            opacity: "0.1"
          }}
        ></div>

        {/* Snow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            overflow: "hidden"
          }}
        >
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "-10px",
                left: `${Math.random() * 100}%`,
                width: "8px",
                height: "8px",
                background: "white",
                borderRadius: "50%",
                opacity: "0.6",
                animation: `fall ${3 + Math.random() * 3}s linear infinite`,
                animationDelay: `${Math.random() * 3}s`
              }}
            ></div>
          ))}
        </div>

        <style>{`
          @keyframes fall {
            to { transform: translateY(120vh); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes scaleIn {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          @keyframes glow {
            0%,100% {
              box-shadow: 0 0 20px rgba(102,126,234,.5),
                          0 0 40px rgba(118,75,162,.3);
            }
            50% {
              box-shadow: 0 0 30px rgba(102,126,234,.8),
                          0 0 60px rgba(118,75,162,.5);
            }
          }
        `}</style>

        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ fontSize: "2.5rem", animation: "fadeIn .8s" }}>
            🎄 Secret Santa 🎅
          </h1>
          

          {loading ? (
            <p className="subtitle">Loading your magical assignment...</p>
          ) : alreadyRevealed ? (
            <p className="subtitle" style={{ color: "#dc2626" }}>
              🚫 Link already used
            </p>
          ) : error ? (
            <p className="subtitle">❌ Invalid or expired link</p>
          ) : !revealed ? (
            <>
              <p className="subtitle">✨ Your assignment awaits ✨</p>

              <p
  className="subtitle"
  style={{
    fontSize: "0.95rem",
    color: "#6b7280",
    marginBottom: "1rem"
  }}
>
  ⚠️ You can reveal your Secret Santa <strong>only once</strong>.  
  Once opened, this link cannot be used again.
</p>


              <button className="primary full" onClick={handleReveal}>
                🎊 REVEAL MY SECRET SANTA 🎊
              </button>
            </>
          ) : (
            <>
<>
  <p className="subtitle">🎅 You are Secret Santa for:</p>

  <div
    style={{
      background:
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      padding: "2rem",
      borderRadius: "1rem",
      fontSize: "2rem",
      fontWeight: "800",
      marginBottom: "1.5rem",
      animation: "glow 2s infinite"
    }}
  >
    {result}
  </div>

  <div
    style={{
      background: "#f9fafb",
      padding: "1.5rem",
      borderRadius: "0.75rem",
      textAlign: "left",
      fontSize: "0.95rem",
      lineHeight: "1.6",
      color: "#111827"
    }}
  >
    <strong>🎄 Family Secret Santa – 31st December 🎄</strong>
    <br /><br />

    Let’s make our 31st December celebration more fun with a
    <strong> Family Secret Santa!</strong>
    <br /><br />

    <strong>How it works:</strong>
    <ul style={{ paddingLeft: "1.2rem", marginTop: "0.5rem" }}>
      <li>✨ Each person will get one name</li>
      <li>✨ Buy a gift specially suited to that person</li>
      <li>✨ Budget: <strong>₹200</strong></li>
      <li>✨ Bring the gift — we’ll wrap it together</li>
      <li>✨ Gifts will be opened on <strong>31st December 🎉</strong></li>
    </ul>

    <p style={{ marginTop: "1rem" }}>
      Put some thought into it and make it unique and meaningful 💝
    </p>

    <p style={{ fontWeight: "600", marginTop: "0.5rem" }}>
      Looking forward to lots of surprises and laughter!
    </p>

    <p style={{ marginTop: "1rem", fontWeight: "700" }}>
      🎅🎁 Let the Secret Santa fun begin!
    </p>
  </div>
</>

            </>
          )}
        </div>
      </div>
    </div>
  );
}