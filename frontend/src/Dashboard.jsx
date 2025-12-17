import { useEffect, useState } from "react";

const API_BASE = "https://secrect-santa-backend.onrender.com";

export default function Dashboard() {
  const [status, setStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard`);
      const data = await res.json();
      setStatus(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const revealed = status.filter(s => s.revealed).length;
  const total = status.length;
  const percentage = total > 0 ? Math.round((revealed / total) * 100) : 0;

  return (
    <div className="christmas-container">
      <div className="snowflakes" aria-hidden="true">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="snowflake">❅</div>
        ))}
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <h1>🎄 Secret Santa Dashboard</h1>
          <p className="subtitle">Track who's discovered their Secret Santa assignment</p>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner">🎁</div>
            <p>Loading...</p>
          </div>
        ) : status.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>No active Secret Santa round yet!</p>
            <p className="empty-hint">Generate assignments from the Admin panel to get started.</p>
          </div>
        ) : (
          <>
            <div className="progress-section">
              <div className="progress-header">
                <span className="progress-label">Overall Progress</span>
                <span className="progress-stats">{revealed} of {total} revealed</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${percentage}%` }}
                >
                  <span className="progress-percentage">{percentage}%</span>
                </div>
              </div>
            </div>

            <div className="status-grid">
              {status.map((s, idx) => (
                <div 
                  key={s.name} 
                  className={s.revealed ? "status-card revealed" : "status-card pending"}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="status-icon">
                    {s.revealed ? '🎁' : '📦'}
                  </div>
                  <div className="status-info">
                    <span className="status-name">{s.name}</span>
                    <span className="status-badge">
                      {s.revealed ? '✅ Revealed' : '⏳ Waiting'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="refresh-note">
              <span>🔄</span> Auto-refreshing every 5 seconds
            </div>
          </>
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

        .dashboard-card {
          max-width: 1000px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.98);
          border-radius: 2rem;
          padding: 2.5rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
          position: relative;
          z-index: 2;
          border: 3px solid rgba(22, 163, 74, 0.3);
        }

        .card-header {
          text-align: center;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 3px solid #dcfce7;
        }

        .card-header h1 {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #16a34a 0%, #dc2626 100%);
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

        .loading-state {
          text-align: center;
          padding: 4rem 2rem;
        }

        .spinner {
          font-size: 4rem;
          animation: bounce 1s ease-in-out infinite;
          display: inline-block;
          margin-bottom: 1rem;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #64748b;
        }

        .empty-icon {
          font-size: 5rem;
          margin-bottom: 1rem;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        .empty-hint {
          margin-top: 0.5rem;
          font-size: 0.95rem;
          color: #94a3b8;
        }

        .progress-section {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          padding: 2rem;
          border-radius: 1.5rem;
          margin-bottom: 2rem;
          border: 2px solid #86efac;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .progress-label {
          font-size: 1.25rem;
          font-weight: 700;
          color: #166534;
        }

        .progress-stats {
          font-size: 1.1rem;
          font-weight: 600;
          color: #15803d;
        }

        .progress-bar {
          height: 2.5rem;
          background: white;
          border-radius: 1.25rem;
          overflow: hidden;
          box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.1);
          position: relative;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
          border-radius: 1.25rem;
          transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 4rem;
          position: relative;
          overflow: hidden;
        }

        .progress-fill::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(255, 255, 255, 0.3), 
            transparent
          );
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          to {
            left: 100%;
          }
        }

        .progress-percentage {
          color: white;
          font-weight: 700;
          font-size: 1.1rem;
          position: relative;
          z-index: 1;
        }

        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .status-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          border-radius: 1.25rem;
          transition: all 0.3s;
          border: 2px solid;
          animation: slideIn 0.4s ease-out backwards;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
        }

        .status-card.revealed {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          border-color: #6ee7b7;
        }

        .status-card.pending {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-color: #fbbf24;
        }

        .status-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }

        .status-icon {
          font-size: 2.5rem;
          animation: iconPulse 2s ease-in-out infinite;
        }

        @keyframes iconPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .status-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .status-name {
          font-size: 1.15rem;
          font-weight: 700;
          color: #1e293b;
        }

        .status-card.revealed .status-badge {
          background: rgba(5, 150, 105, 0.2);
          color: #065f46;
          border: 1px solid #6ee7b7;
        }

        .status-card.pending .status-badge {
          background: rgba(217, 119, 6, 0.2);
          color: #92400e;
          border: 1px solid #fbbf24;
        }

        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 0.75rem;
          font-size: 0.9rem;
          font-weight: 600;
          align-self: flex-start;
        }

        .refresh-note {
          text-align: center;
          color: #64748b;
          font-size: 0.9rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        @media (max-width: 768px) {
          .dashboard-card {
            padding: 1.5rem;
          }

          .card-header h1 {
            font-size: 2rem;
          }

          .status-grid {
            grid-template-columns: 1fr;
          }

          .progress-section {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}