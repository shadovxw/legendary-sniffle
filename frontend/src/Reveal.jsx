import { useEffect, useState } from "react";

const API_BASE = "https://secrect-santa-backend.onrender.com";

export default function Reveal() {
  // Extract token from URL path (assuming URL like: .../reveal/token-here)
  const token = window.location.pathname.split('/').pop();
  
  const [name, setName] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const res = await fetch(`${API_BASE}/reveal/${token}`);
        if (!res.ok) {
          setError("This link has expired or has already been used");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setName(data.assignedTo);
        setLoading(false);
      } catch (err) {
        setError("Unable to load assignment. Please try again.");
        setLoading(false);
      }
    };

    if (token) {
      checkToken();
    } else {
      setError("Invalid link");
      setLoading(false);
    }
  }, [token]);

  const reveal = async () => {
    try {
      await fetch(`${API_BASE}/reveal/${token}/confirm`, {
        method: 'POST'
      });
      setDone(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="christmas-container">
      <div className="snowflakes" aria-hidden="true">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="snowflake">❅</div>
        ))}
      </div>

      <div className="reveal-wrapper">
        <div className="reveal-card">
          {loading ? (
            <div className="loading-state">
              <div className="spinner">🎁</div>
              <p>Loading your assignment...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <div className="error-icon">😔</div>
              <h2>Oops!</h2>
              <p>{error}</p>
            </div>
          ) : !done ? (
            <div className="ready-state">
              <div className="mystery-box">
                <div className="gift-icon">🎁</div>
                <div className="sparkles">✨✨✨</div>
              </div>
              <h1>Ready to discover your Secret Santa assignment?</h1>
              <p className="hint">Click the button below to reveal who you're gifting to!</p>
              <button onClick={reveal} className="reveal-button">
                <span className="button-icon">🎄</span>
                <span>Reveal My Assignment</span>
                <span className="button-icon">🎄</span>
              </button>
            </div>
          ) : (
            <div className="revealed-state">
              <div className="celebration">
                <div className="confetti">🎉</div>
                <div className="confetti">🎊</div>
                <div className="confetti">✨</div>
                <div className="confetti">🌟</div>
                <div className="confetti">💫</div>
              </div>
              <div className="result-box">
                <h2>You're the Secret Santa for...</h2>
                <div className="name-reveal">
                  <div className="name-wrapper">
                    <span className="name-text">{name}</span>
                  </div>
                </div>
                <div className="message-box">
                  <p>🎁 Time to find the perfect gift!</p>
                  <p className="sub-message">Remember to keep it a secret until the big reveal!</p>
                </div>
              </div>
            </div>
          )}
        </div>
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
          display: flex;
          align-items: center;
          justify-content: center;
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

        .snowflake:nth-child(1) { left: 5%; animation-duration: 10s; animation-delay: 0s; }
        .snowflake:nth-child(2) { left: 15%; animation-duration: 12s; animation-delay: 1s; }
        .snowflake:nth-child(3) { left: 25%; animation-duration: 8s; animation-delay: 2s; }
        .snowflake:nth-child(4) { left: 35%; animation-duration: 15s; animation-delay: 0.5s; }
        .snowflake:nth-child(5) { left: 45%; animation-duration: 11s; animation-delay: 1.5s; }
        .snowflake:nth-child(6) { left: 55%; animation-duration: 9s; animation-delay: 3s; }
        .snowflake:nth-child(7) { left: 65%; animation-duration: 13s; animation-delay: 0.8s; }
        .snowflake:nth-child(8) { left: 75%; animation-duration: 10s; animation-delay: 2.5s; }
        .snowflake:nth-child(9) { left: 85%; animation-duration: 14s; animation-delay: 1.2s; }
        .snowflake:nth-child(10) { left: 95%; animation-duration: 11s; animation-delay: 3.5s; }
        .snowflake:nth-child(11) { left: 10%; animation-duration: 9s; animation-delay: 4s; }
        .snowflake:nth-child(12) { left: 20%; animation-duration: 12s; animation-delay: 2s; }
        .snowflake:nth-child(13) { left: 30%; animation-duration: 10s; animation-delay: 3s; }
        .snowflake:nth-child(14) { left: 40%; animation-duration: 13s; animation-delay: 1s; }
        .snowflake:nth-child(15) { left: 50%; animation-duration: 11s; animation-delay: 2.5s; }
        .snowflake:nth-child(16) { left: 60%; animation-duration: 9s; animation-delay: 0.5s; }
        .snowflake:nth-child(17) { left: 70%; animation-duration: 14s; animation-delay: 3.5s; }
        .snowflake:nth-child(18) { left: 80%; animation-duration: 10s; animation-delay: 1.5s; }
        .snowflake:nth-child(19) { left: 90%; animation-duration: 12s; animation-delay: 2.5s; }
        .snowflake:nth-child(20) { left: 50%; animation-duration: 11s; animation-delay: 4s; }

        @keyframes fall {
          to {
            transform: translateY(110vh) rotate(360deg);
          }
        }

        .reveal-wrapper {
          max-width: 600px;
          width: 100%;
          position: relative;
          z-index: 2;
        }

        .reveal-card {
          background: rgba(255, 255, 255, 0.98);
          border-radius: 2rem;
          padding: 3rem;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
          border: 3px solid rgba(220, 38, 38, 0.3);
          animation: cardEntry 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes cardEntry {
          from {
            opacity: 0;
            transform: scale(0.8) rotateX(-15deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotateX(0);
          }
        }

        .loading-state,
        .error-state {
          text-align: center;
          padding: 2rem 0;
        }

        .spinner {
          font-size: 5rem;
          animation: bounce 1s ease-in-out infinite;
          display: inline-block;
          margin-bottom: 1rem;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        .error-icon {
          font-size: 5rem;
          margin-bottom: 1rem;
        }

        .error-state h2 {
          color: #dc2626;
          margin-bottom: 1rem;
          font-size: 2rem;
        }

        .error-state p {
          color: #64748b;
          font-size: 1.1rem;
        }

        .ready-state {
          text-align: center;
        }

        .mystery-box {
          margin-bottom: 2rem;
          position: relative;
          display: inline-block;
        }

        .gift-icon {
          font-size: 8rem;
          animation: giftFloat 3s ease-in-out infinite;
          display: inline-block;
        }

        @keyframes giftFloat {
          0%, 100% { 
            transform: translateY(0) rotate(0deg); 
          }
          50% { 
            transform: translateY(-20px) rotate(5deg); 
          }
        }

        .sparkles {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 2rem;
          animation: sparkle 2s ease-in-out infinite;
        }

        @keyframes sparkle {
          0%, 100% { 
            opacity: 0.3; 
            transform: translateX(-50%) scale(0.8);
          }
          50% { 
            opacity: 1; 
            transform: translateX(-50%) scale(1.2);
          }
        }

        .ready-state h1 {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #dc2626 0%, #16a34a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 1rem;
          line-height: 1.3;
        }

        .hint {
          color: #64748b;
          font-size: 1.1rem;
          margin-bottom: 2rem;
        }

        .reveal-button {
          width: 100%;
          padding: 1.5rem 2rem;
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
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
          box-shadow: 0 10px 30px rgba(220, 38, 38, 0.4);
        }

        .reveal-button:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 40px rgba(220, 38, 38, 0.5);
        }

        .reveal-button:active {
          transform: translateY(-2px);
        }

        .button-icon {
          font-size: 1.5rem;
          animation: iconSpin 3s linear infinite;
        }

        @keyframes iconSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .revealed-state {
          text-align: center;
          position: relative;
        }

        .celebration {
          position: absolute;
          top: -50px;
          left: 0;
          right: 0;
          height: 200px;
          pointer-events: none;
        }

        .confetti {
          position: absolute;
          font-size: 3rem;
          animation: confettiFall 3s ease-out infinite;
        }

        .confetti:nth-child(1) { 
          left: 10%; 
          animation-delay: 0s; 
          animation-duration: 2.5s;
        }
        .confetti:nth-child(2) { 
          left: 30%; 
          animation-delay: 0.3s; 
          animation-duration: 3s;
        }
        .confetti:nth-child(3) { 
          left: 50%; 
          animation-delay: 0.6s; 
          animation-duration: 2.8s;
        }
        .confetti:nth-child(4) { 
          left: 70%; 
          animation-delay: 0.9s; 
          animation-duration: 3.2s;
        }
        .confetti:nth-child(5) { 
          left: 90%; 
          animation-delay: 1.2s; 
          animation-duration: 2.7s;
        }

        @keyframes confettiFall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(400px) rotate(720deg);
            opacity: 0;
          }
        }

        .result-box {
          padding-top: 3rem;
        }

        .result-box h2 {
          font-size: 1.5rem;
          color: #64748b;
          margin-bottom: 2rem;
          font-weight: 600;
        }

        .name-reveal {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          padding: 3rem 2rem;
          border-radius: 1.5rem;
          margin-bottom: 2rem;
          border: 3px solid #fbbf24;
          box-shadow: 0 15px 40px rgba(251, 191, 36, 0.3);
          position: relative;
          overflow: hidden;
        }

        .name-reveal::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
          animation: glow 3s ease-in-out infinite;
        }

        @keyframes glow {
          0%, 100% {
            transform: translate(0, 0);
            opacity: 0.5;
          }
          50% {
            transform: translate(20px, 20px);
            opacity: 1;
          }
        }

        .name-wrapper {
          position: relative;
          z-index: 1;
        }

        .name-text {
          font-size: 3rem;
          font-weight: 900;
          background: linear-gradient(135deg, #dc2626 0%, #16a34a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: nameReveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: inline-block;
        }

        @keyframes nameReveal {
          from {
            opacity: 0;
            transform: scale(0.5) rotateY(90deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotateY(0);
          }
        }

        .message-box {
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          padding: 1.5rem;
          border-radius: 1rem;
          border: 2px solid #86efac;
        }

        .message-box p {
          font-size: 1.2rem;
          font-weight: 600;
          color: #166534;
          margin-bottom: 0.5rem;
        }

        .sub-message {
          font-size: 1rem !important;
          font-weight: 500 !important;
          color: #15803d !important;
          margin-bottom: 0 !important;
        }

        @media (max-width: 640px) {
          .reveal-card {
            padding: 2rem 1.5rem;
          }

          .ready-state h1 {
            font-size: 1.5rem;
          }

          .gift-icon {
            font-size: 6rem;
          }

          .name-text {
            font-size: 2rem;
          }

          .reveal-button {
            font-size: 1.1rem;
            padding: 1.25rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}