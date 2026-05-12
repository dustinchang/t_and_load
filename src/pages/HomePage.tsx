import { useNavigate } from "react-router-dom";
import { Sun, Moon, Plus, ChevronRight } from "lucide-react";
import { Layout, TopBar } from "../components/layout/Layout";
import { Button } from "../components/ui/Button";
import { useTheme } from "../context/ThemeContext";
import { storage } from "../services/storage";
import type { Round } from "../types";
import "./pages.css";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function roundTotal(round: Round): number {
  return round.players.reduce((best, p) => {
    const total = Object.values(round.scores[p.id] ?? {}).reduce(
      (s, sc) => s + sc.strokes,
      0,
    );
    return best === 0 ? total : Math.min(best, total);
  }, 0);
}

export function HomePage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const rounds = storage.loadAllRounds();
  const activeId = storage.loadCurrentRoundId();
  const activeRound = activeId ? storage.loadRound(activeId) : null;

  return (
    <Layout
      topBar={
        <TopBar
          title="Golf Caddie"
          actions={
            <button
              className="btn btn--ghost btn--icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          }
        />
      }
    >
      <div className="page animate-fade-in">
        <div className="page-hero">
          <div className="page-hero-logo">⛳</div>
          <h1 className="page-hero-title">Golf Caddie</h1>
          <p className="page-hero-subtitle">
            Score tracking · the hat game · stat history
          </p>
        </div>

        {activeRound && !activeRound.isComplete && (
          <div className="page-section">
            <div
              className="round-card"
              style={{
                borderColor: "var(--color-primary)",
                background: "var(--color-primary-dim)",
              }}
              onClick={() => navigate("/play")}
            >
              <div className="round-card-icon">🏌️</div>
              <div className="round-card-info">
                <div className="round-card-name">Resume Round</div>
                <div className="round-card-meta">
                  {activeRound.courseName} · Hole {activeRound.currentHole}
                </div>
              </div>
              <ChevronRight size={18} color="var(--color-primary)" />
            </div>
          </div>
        )}

        <div className="page-section">
          <Button full size="lg" onClick={() => navigate("/setup")}>
            <Plus size={20} /> Start New Round
          </Button>
        </div>

        {rounds.length > 0 && (
          <div className="page-section">
            <p className="section-title">Recent Rounds</p>
            <div className="round-list">
              {rounds.slice(0, 6).map((r) => (
                <div
                  key={r.id}
                  className="round-card"
                  onClick={() => navigate(`/scorecard?id=${r.id}`)}
                >
                  <div className="round-card-icon">⛳</div>
                  <div className="round-card-info">
                    <div className="round-card-name">{r.courseName}</div>
                    <div className="round-card-meta">
                      {formatDate(r.date)} ·{" "}
                      {r.players.map((p) => p.name).join(", ")}
                      {r.hatGameEnabled ? " · 🎩" : ""}
                    </div>
                  </div>
                  <div className="round-card-score">{roundTotal(r) || "—"}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {rounds.length === 0 && (
          <div className="empty-state animate-fade-in">
            <div className="empty-state-icon">🌿</div>
            <div className="empty-state-title">No rounds yet</div>
            <p className="empty-state-body">
              Tap "Start New Round" to set up players and tee off!
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
