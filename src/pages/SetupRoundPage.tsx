import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Trash2, Search } from "lucide-react";
import { Layout, TopBar } from "../components/layout/Layout";
import { Button } from "../components/ui/Button";
import { Toggle } from "../components/ui/Toggle";
import { useCourse } from "../context/CourseContext";
import { useGame } from "../context/GameContext";
import type { Player, TeeBox } from "../types";
import "./pages.css";

const TEE_COLORS: Record<TeeBox, string> = {
  championship: "#b8860b",
  back: "#1e40af",
  middle: "#d1d5db",
  forward: "#dc2626",
};

const TEE_LABELS: Record<TeeBox, string> = {
  championship: "Gold",
  back: "Blue",
  middle: "White",
  forward: "Red",
};

function generatePlayerId() {
  return `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function SetupRoundPage() {
  const navigate = useNavigate();
  const { selectedCourse } = useCourse();
  const { startRound } = useGame();

  const [players, setPlayers] = useState<Player[]>([
    { id: generatePlayerId(), name: "", handicap: 0 },
  ]);
  const [teeBox, setTeeBox] = useState<TeeBox>("middle");
  const [hatGame, setHatGame] = useState(false);

  useEffect(() => {
    if (!selectedCourse) navigate("/courses");
  }, [selectedCourse, navigate]);

  if (!selectedCourse) return null;

  function addPlayer() {
    if (players.length >= 4) return;
    setPlayers((prev) => [
      ...prev,
      { id: generatePlayerId(), name: "", handicap: 0 },
    ]);
  }

  function removePlayer(id: string) {
    if (players.length <= 1) return;
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  }

  function updatePlayer(
    id: string,
    field: keyof Player,
    value: string | number,
  ) {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  }

  function handleStart() {
    if (!selectedCourse) return;
    const valid = players.filter((p) => p.name.trim());
    if (valid.length === 0) return;
    startRound(selectedCourse, valid, teeBox, hatGame);
    navigate("/play");
  }

  const teesAvailable: TeeBox[] = ["championship", "back", "middle", "forward"];

  return (
    <Layout
      showNav={false}
      topBar={
        <TopBar
          title="Round Setup"
          subtitle={selectedCourse.course_name || selectedCourse.club_name}
          showBack
        />
      }
    >
      <div className="page animate-fade-in">
        <div className="page-section">
          <div className="stat-grid">
            <div className="stat-card">
              <span className="stat-value">{selectedCourse.holes}</span>
              <span className="stat-label">Holes</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{selectedCourse.par}</span>
              <span className="stat-label">Par</span>
            </div>
          </div>
        </div>

        <div className="page-section">
          <p className="section-title">Select Tee Box</p>
          <div className="tee-selector">
            {teesAvailable.map((tee) => (
              <button
                key={tee}
                className={`tee-btn${teeBox === tee ? " tee-btn--active" : ""}`}
                onClick={() => setTeeBox(tee)}
              >
                <span
                  className="tee-dot"
                  style={{
                    background: TEE_COLORS[tee],
                    border:
                      tee === "middle"
                        ? "1px solid var(--color-border)"
                        : "none",
                  }}
                />
                {TEE_LABELS[tee]}
              </button>
            ))}
          </div>
        </div>

        <div className="page-section">
          <p className="section-title">Players</p>
          <div className="player-list">
            {players.map((player, i) => (
              <div key={player.id} className="player-row">
                <span className="player-row-num">{i + 1}</span>
                <input
                  className="input"
                  placeholder={`Player ${i + 1} name`}
                  value={player.name}
                  onChange={(e) =>
                    updatePlayer(player.id, "name", e.target.value)
                  }
                  style={{ flex: 1 }}
                />
                <input
                  className="input"
                  type="number"
                  placeholder="HCP"
                  value={player.handicap || ""}
                  onChange={(e) =>
                    updatePlayer(player.id, "handicap", Number(e.target.value))
                  }
                  style={{ width: 64 }}
                  min={0}
                  max={54}
                />
                <button
                  className="player-row-remove"
                  onClick={() => removePlayer(player.id)}
                  disabled={players.length <= 1}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          {players.length < 4 && (
            <Button variant="outline" size="sm" onClick={addPlayer}>
              <UserPlus size={15} /> Add Player
            </Button>
          )}
        </div>

        <div className="page-section">
          <div className="card card--padded">
            <Toggle
              label="Enable Hat Game 🎩"
              subLabel="Random score effects on a separate side scorecard"
              checked={hatGame}
              onChange={setHatGame}
            />
          </div>
        </div>

        <div className="page-section">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/courses")}
          >
            <Search size={14} /> Change Course
          </Button>
        </div>

        <Button
          full
          size="lg"
          onClick={handleStart}
          disabled={!players.some((p) => p.name.trim())}
        >
          Tee Off! ⛳
        </Button>
      </div>
    </Layout>
  );
}
