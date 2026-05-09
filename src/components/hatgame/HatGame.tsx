import { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { useGame, computeHatScore } from "../../context/GameContext";
import type { Round, HatDraw, HoleInfo, Player } from "../../types";
import "./HatGame.css";

// ---- Hat Draw Modal ----

interface HatDrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  holeNumber: number;
}

type DrawStep = "idle" | "revealed" | "targeting" | "done";

export function HatDrawModal({
  isOpen,
  onClose,
  player,
  holeNumber,
}: HatDrawModalProps) {
  const { round, addHatDraw, applyHatDraw } = useGame();
  const [step, setStep] = useState<DrawStep>("idle");
  const [currentDraw, setCurrentDraw] = useState<HatDraw | null>(null);

  const otherPlayers = round?.players.filter((p) => p.id !== player.id) ?? [];

  function handleDraw() {
    // addHatDraw returns the new draw immediately (before the async set)
    const draw = addHatDraw(player.id, holeNumber);
    setCurrentDraw(draw);
    setStep("revealed");
  }

  function handleRevealContinue() {
    if (!currentDraw) return;
    if (currentDraw.effect.requiresTarget && otherPlayers.length > 0) {
      setStep("targeting");
    } else {
      applyHatDraw(currentDraw.id);
      setStep("done");
    }
  }

  function handleSelectTarget(targetId: string) {
    if (!currentDraw) return;
    applyHatDraw(currentDraw.id, targetId);
    setStep("done");
  }

  function handleClose() {
    setStep("idle");
    setCurrentDraw(null);
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`🎩 Hat Draw — ${player.name}`}
    >
      <div className="hat-game-modal-body">
        {step === "idle" && (
          <>
            <div className="hat-icon">🎩</div>
            <p className="hat-prompt">
              Reach into the hat and draw your fate for Hole {holeNumber}!
            </p>
            <Button full onClick={handleDraw}>
              Draw from the Hat
            </Button>
          </>
        )}

        {(step === "revealed" || step === "targeting") && currentDraw && (
          <>
            <div className="hat-effect-card">
              <span className="hat-effect-emoji">
                {currentDraw.effect.emoji}
              </span>
              <span className="hat-effect-label">
                {currentDraw.effect.label}
              </span>
              <p className="hat-effect-description">
                {currentDraw.effect.description}
              </p>
            </div>

            {step === "revealed" && (
              <Button full onClick={handleRevealContinue}>
                {currentDraw.effect.requiresTarget
                  ? "Choose Target →"
                  : "Apply Effect"}
              </Button>
            )}

            {step === "targeting" && (
              <div className="hat-target-section">
                <span className="hat-target-label">
                  Choose a player to target:
                </span>
                <div className="hat-target-list">
                  {otherPlayers.map((p) => (
                    <button
                      key={p.id}
                      className="hat-target-btn"
                      onClick={() => handleSelectTarget(p.id)}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {step === "done" && currentDraw && (
          <>
            <div className="hat-effect-card">
              <span className="hat-effect-emoji">
                {currentDraw.effect.emoji}
              </span>
              <span className="hat-effect-label">
                {currentDraw.effect.label}
              </span>
              <p className="hat-effect-description">
                Applied to the hat scorecard for Hole {holeNumber}!
              </p>
            </div>
            <Button full onClick={handleClose}>
              Done
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}

// ---- Hat Scorecard ----

interface HatScorecardProps {
  round: Round;
}

export function HatScorecard({ round }: HatScorecardProps) {
  const appliedDraws = (round.hatDraws ?? []).filter((d) => d.applied);

  // Build a complete list of holes to display — use round.holesInfo when
  // available, otherwise generate synthetic entries (1..N, par 4) so the
  // scorecard renders even when the API didn't return per-hole data.
  const totalHoles = round.holesInfo.length || 18;
  const holes: HoleInfo[] =
    round.holesInfo.length > 0
      ? round.holesInfo
      : Array.from({ length: totalHoles }, (_, i) => ({
          hole_number: i + 1,
          par: 4,
          handicap: i + 1,
          yardage: {} as HoleInfo["yardage"],
        }));

  // Only show hole rows where at least one player has a score
  const playedHoles = holes.filter((hole) =>
    round.players.some(
      (p) => (round.scores[p.id]?.[hole.hole_number]?.strokes ?? 0) > 0,
    ),
  );

  return (
    <div>
      <div className="hat-scorecard-header">
        <span className="hat-scorecard-badge">🎩 Hat Game Scorecard</span>
      </div>

      <div className="scorecard-table-wrapper">
        <table className="scorecard-table">
          <thead>
            <tr>
              <th>Hole</th>
              {round.players.map((p) => (
                <th key={p.id}>{p.name.split(" ")[0]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {playedHoles.length === 0 && (
              <tr>
                <td
                  colSpan={round.players.length + 1}
                  style={{
                    textAlign: "center",
                    color: "var(--color-text-muted)",
                    padding: "var(--space-4)",
                  }}
                >
                  No scores entered yet
                </td>
              </tr>
            )}

            {playedHoles.map((hole) => (
              <tr key={hole.hole_number}>
                <td>{hole.hole_number}</td>
                {round.players.map((p) => {
                  const realScore =
                    round.scores[p.id]?.[hole.hole_number]?.strokes ?? 0;
                  const hatScore = computeHatScore(
                    round,
                    p.id,
                    hole.hole_number,
                  );
                  // Show the hat-modified score; highlight when it differs from the real score
                  const changed = hatScore !== realScore && realScore > 0;
                  return (
                    <td
                      key={p.id}
                      style={{
                        color: changed ? "var(--color-accent)" : undefined,
                        fontWeight: changed ? 700 : undefined,
                      }}
                    >
                      {realScore === 0 ? "—" : hatScore}
                      {changed && (
                        <sup
                          style={{ fontSize: 9, opacity: 0.6, marginLeft: 2 }}
                        >
                          ({realScore})
                        </sup>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Hat game totals — sum hat scores over every played hole */}
            <tr className="scorecard-row--total">
              <td>Total</td>
              {round.players.map((p) => {
                const total = holes.reduce(
                  (sum, hole) =>
                    sum + computeHatScore(round, p.id, hole.hole_number),
                  0,
                );
                return <td key={p.id}>{total || "—"}</td>;
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Draw history */}
      {appliedDraws.length > 0 && (
        <div className="hat-draw-history">
          <p
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--color-text-muted)",
              fontWeight: 600,
            }}
          >
            Draw History
          </p>
          {appliedDraws.map((draw) => {
            const owner = round.players.find((p) => p.id === draw.playerId);
            const target = draw.targetPlayerId
              ? round.players.find((p) => p.id === draw.targetPlayerId)
              : null;
            return (
              <div key={draw.id} className="hat-draw-item">
                <span className="hat-draw-item-emoji">{draw.effect.emoji}</span>
                <div className="hat-draw-item-info">
                  <div className="hat-draw-item-title">
                    {owner?.name} — {draw.effect.label}
                  </div>
                  <div className="hat-draw-item-sub">
                    {target
                      ? `Targeting: ${target.name}`
                      : draw.effect.description}
                  </div>
                </div>
                <span className="hat-draw-item-hole">H{draw.holeNumber}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
