import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Trash2 } from "lucide-react";
import { Layout, TopBar } from "../components/layout/Layout";
import { Button } from "../components/ui/Button";
import { Toggle } from "../components/ui/Toggle";
import { useGame } from "../context/GameContext";
import type { CourseDetail, Player, TeeBox } from "../types";
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

function buildSyntheticCourse(
  name: string,
  holes: number,
  par: number,
): CourseDetail {
  return {
    id: 0,
    club_name: name || "My Round",
    course_name: name || "My Round",
    location: {
      address: "",
      city: "",
      state: "",
      zip: "",
      country: "",
      latitude: 0,
      longitude: 0,
    },
    holes,
    par,
    // Empty holes array → GameContext will generate synthetic hole rows
    holes_info: { number_of_holes: holes, holes: [] },
  };
}

export function SetupRoundPage() {
  const navigate = useNavigate();
  const { startRound } = useGame();

  const [courseName, setCourseName] = useState("");
  const [numHoles, setNumHoles] = useState<9 | 18>(18);
  const [totalPar, setTotalPar] = useState(72);
  const [teeBox, setTeeBox] = useState<TeeBox>("middle");
  const [hatGame, setHatGame] = useState(false);
  const [players, setPlayers] = useState<Player[]>([
    { id: generatePlayerId(), name: "", handicap: 0 },
  ]);

  // Keep par in sync when holes changes (sensible defaults)
  function handleHolesChange(h: 9 | 18) {
    setNumHoles(h);
    setTotalPar(h === 9 ? 36 : 72);
  }

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
    const valid = players.filter((p) => p.name.trim());
    if (valid.length === 0) return;
    const course = buildSyntheticCourse(courseName.trim(), numHoles, totalPar);
    startRound(course, valid, teeBox, hatGame);
    navigate("/play");
  }

  const teesAvailable: TeeBox[] = ["championship", "back", "middle", "forward"];

  return (
    <Layout showNav={false} topBar={<TopBar title="Round Setup" showBack />}>
      <div className="page animate-fade-in">
        {/* Course info */}
        <div className="page-section">
          <p className="section-title">Course (optional)</p>
          <input
            className="input"
            placeholder="Course name (e.g. Pebble Beach)"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            style={{ width: "100%" }}
          />
          <div className="stat-grid" style={{ marginTop: "var(--space-3)" }}>
            <button
              className={`tee-btn${numHoles === 9 ? " tee-btn--active" : ""}`}
              onClick={() => handleHolesChange(9)}
            >
              9 Holes
            </button>
            <button
              className={`tee-btn${numHoles === 18 ? " tee-btn--active" : ""}`}
              onClick={() => handleHolesChange(18)}
            >
              18 Holes
            </button>
          </div>
          <div
            style={{
              marginTop: "var(--space-3)",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <label
              className="section-title"
              style={{ margin: 0, whiteSpace: "nowrap" }}
            >
              Total Par
            </label>
            <input
              className="input"
              type="number"
              value={totalPar}
              onChange={(e) => setTotalPar(Math.max(1, Number(e.target.value)))}
              min={18}
              max={99}
              style={{ width: 80 }}
            />
          </div>
        </div>

        {/* Tee box */}
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

        {/* Players */}
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

        {/* Hat game */}
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
