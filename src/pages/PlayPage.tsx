import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, CheckSquare } from "lucide-react";
import { Layout, TopBar } from "../components/layout/Layout";
import { HoleMap } from "../components/map/HoleMap";
import { HoleScoreEntry } from "../components/scorecard/HoleScoreEntry";
import { HatDrawModal } from "../components/hatgame/HatGame";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { useGame } from "../context/GameContext";
import { useGeolocation } from "../hooks/useGeolocation";
import { useOSMData } from "../hooks/useOSMData";
import type { Player } from "../types";
import "./pages.css";

export function PlayPage() {
  const navigate = useNavigate();
  const {
    round,
    setScore,
    nextHole,
    prevHole,
    completeRound,
    getPlayerScore,
    getPlayerHoleResult,
  } = useGame();

  const [hatDrawPlayer, setHatDrawPlayer] = useState<Player | null>(null);
  const [showHatPlayerPicker, setShowHatPlayerPicker] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);

  const { position, isWatching, startWatching, stopWatching, distanceTo } =
    useGeolocation();
  const { features } = useOSMData(null, null); // coords populated when course has lat/lng from API

  if (!round) {
    return (
      <Layout topBar={<TopBar title="Play" />}>
        <div className="empty-state">
          <div className="empty-state-icon">🏌️</div>
          <div className="empty-state-title">No active round</div>
          <p className="empty-state-body">
            Start a new round from the home screen.
          </p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </Layout>
    );
  }

  const currentHoleInfo = round.holesInfo.find(
    (h) => h.hole_number === round.currentHole,
  );
  const totalHoles = round.holesInfo.length || 18;
  const currentYards = currentHoleInfo?.yardage[round.teeBox] ?? null;

  const greenFeature = features.find(
    (f) => f.type === "green" && f.holeRef === String(round.currentHole),
  );
  const pinLat = greenFeature
    ? greenFeature.coordinates.reduce((s, c) => s + c[0], 0) /
      greenFeature.coordinates.length
    : null;
  const pinLng = greenFeature
    ? greenFeature.coordinates.reduce((s, c) => s + c[1], 0) /
      greenFeature.coordinates.length
    : null;
  const distanceToPin = pinLat && pinLng ? distanceTo(pinLat, pinLng) : null;
  const mapCenter: [number, number] = greenFeature
    ? [pinLat!, pinLng!]
    : [37.5, -122];

  function handleFinish() {
    completeRound();
    navigate("/scorecard");
  }

  return (
    <Layout
      topBar={
        <TopBar
          title={round.courseName}
          subtitle={`Hole ${round.currentHole} of ${totalHoles}`}
          showBack
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFinishModal(true)}
            >
              <CheckSquare size={16} /> Finish
            </Button>
          }
        />
      }
    >
      <div className="hole-nav">
        <button
          className="hole-nav-btn"
          onClick={prevHole}
          disabled={round.currentHole <= 1}
        >
          <ChevronLeft size={22} />
        </button>
        <div className="hole-nav-info">
          <div className="hole-nav-number">Hole {round.currentHole}</div>
          {currentHoleInfo && (
            <div className="hole-nav-par">
              Par {currentHoleInfo.par} · HCP {currentHoleInfo.handicap}
            </div>
          )}
          {currentYards && (
            <div className="hole-nav-yardage">{currentYards} yds</div>
          )}
        </div>
        <button
          className="hole-nav-btn"
          onClick={nextHole}
          disabled={round.currentHole >= totalHoles}
        >
          <ChevronRight size={22} />
        </button>
      </div>

      <div className="page">
        {features.length > 0 && (
          <div className="page-section">
            <HoleMap
              features={features.filter(
                (f) => !f.holeRef || f.holeRef === String(round.currentHole),
              )}
              center={mapCenter}
              height={260}
              position={position}
              distanceToPin={distanceToPin}
            />
            <div style={{ marginTop: "var(--space-2)" }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={isWatching ? stopWatching : startWatching}
              >
                {isWatching ? "⏹ Stop GPS" : "📍 Start GPS"}
              </Button>
            </div>
          </div>
        )}

        <div className="page-section">
          <div className="score-entry">
            {round.players.map((player) => {
              const score = getPlayerScore(player.id, round.currentHole);
              const result = getPlayerHoleResult(player.id, round.currentHole);
              return (
                <HoleScoreEntry
                  key={player.id}
                  player={player}
                  score={score}
                  result={result}
                  par={currentHoleInfo?.par ?? 4}
                  onChange={(partial) =>
                    setScore(player.id, round.currentHole, partial)
                  }
                />
              );
            })}
          </div>
        </div>

        <div className="page-section">
          <Button
            full
            onClick={
              round.currentHole < totalHoles
                ? nextHole
                : () => setShowFinishModal(true)
            }
          >
            {round.currentHole < totalHoles
              ? `Next: Hole ${round.currentHole + 1} →`
              : "Finish Round ✓"}
          </Button>
        </div>
      </div>

      {/* Hat game floating button */}
      {round.hatGameEnabled && (
        <button
          className="hat-float-btn"
          onClick={() => {
            if (round.players.length === 1) setHatDrawPlayer(round.players[0]);
            else setShowHatPlayerPicker(true);
          }}
          title="Draw from the Hat"
        >
          🎩
        </button>
      )}

      {hatDrawPlayer && (
        <HatDrawModal
          isOpen={true}
          onClose={() => setHatDrawPlayer(null)}
          player={hatDrawPlayer}
          holeNumber={round.currentHole}
        />
      )}

      <Modal
        isOpen={showHatPlayerPicker}
        onClose={() => setShowHatPlayerPicker(false)}
        title="🎩 Who's Drawing?"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
          }}
        >
          {round.players.map((p) => (
            <Button
              key={p.id}
              variant="secondary"
              full
              onClick={() => {
                setShowHatPlayerPicker(false);
                setHatDrawPlayer(p);
              }}
            >
              {p.name}
            </Button>
          ))}
        </div>
      </Modal>

      <Modal
        isOpen={showFinishModal}
        onClose={() => setShowFinishModal(false)}
        title="Finish Round?"
        center
      >
        <p
          style={{
            color: "var(--color-text-muted)",
            marginBottom: "var(--space-5)",
            fontSize: "var(--text-sm)",
          }}
        >
          This will complete the round and take you to the final scorecard.
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
          }}
        >
          <Button full onClick={handleFinish}>
            Yes, Finish Round
          </Button>
          <Button
            variant="ghost"
            full
            onClick={() => setShowFinishModal(false)}
          >
            Keep Playing
          </Button>
        </div>
      </Modal>
    </Layout>
  );
}
