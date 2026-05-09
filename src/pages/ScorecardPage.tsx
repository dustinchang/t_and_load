import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Layout, TopBar } from "../components/layout/Layout";
import { Scorecard } from "../components/scorecard/Scorecard";
import { HatScorecard } from "../components/hatgame/HatGame";
import { Button } from "../components/ui/Button";
import { useGame } from "../context/GameContext";
import "./pages.css";

export function ScorecardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { round, loadRound, getPlayerTotal, getPlayerHoleResult } = useGame();

  const idParam = searchParams.get("id");

  useEffect(() => {
    // Only reload if viewing a specific historical round by ?id=
    if (idParam) loadRound(idParam);
  }, [idParam]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!round) {
    return (
      <Layout topBar={<TopBar title="Scorecard" />}>
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">No scorecard</div>
          <p className="empty-state-body">
            Start a round to see your scorecard here.
          </p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </Layout>
    );
  }

  const stats = round.players.map((p) => {
    const total = getPlayerTotal(p.id);
    const scores = round.scores[p.id] ?? {};
    const holesPlayed = Object.values(scores).filter(
      (s) => s.strokes > 0,
    ).length;
    const totalPutts = Object.values(scores).reduce((s, sc) => s + sc.putts, 0);
    const totalChips = Object.values(scores).reduce((s, sc) => s + sc.chips, 0);
    const girs = Object.values(scores).filter((s) => s.gir).length;
    const fairways = Object.values(scores).filter(
      (s) => s.fairwayHit === "hit",
    ).length;
    return {
      player: p,
      total,
      holesPlayed,
      totalPutts,
      totalChips,
      girs,
      fairways,
    };
  });

  return (
    <Layout
      topBar={<TopBar title="Scorecard" subtitle={round.courseName} showBack />}
    >
      <div className="page animate-fade-in">
        <div className="page-section">
          <Scorecard
            round={round}
            getPlayerTotal={getPlayerTotal}
            getPlayerHoleResult={getPlayerHoleResult}
          />
        </div>

        {stats.map(
          ({
            player,
            total,
            holesPlayed,
            totalPutts,
            totalChips,
            girs,
            fairways,
          }) => (
            <div key={player.id} className="page-section">
              <p className="section-title">{player.name}</p>
              <div className="stat-grid">
                <div className="stat-card">
                  <span className="stat-value">{total || "—"}</span>
                  <span className="stat-label">Total Score</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{holesPlayed}</span>
                  <span className="stat-label">Holes Played</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{totalPutts}</span>
                  <span className="stat-label">Putts</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{totalChips}</span>
                  <span className="stat-label">Chips</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{girs}</span>
                  <span className="stat-label">Greens in Reg</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{fairways}</span>
                  <span className="stat-label">Fairways Hit</span>
                </div>
              </div>
            </div>
          ),
        )}

        {round.hatGameEnabled && (
          <div className="page-section">
            <HatScorecard round={round} />
          </div>
        )}

        <div className="page-section">
          {!round.isComplete && (
            <Button
              full
              onClick={() => navigate("/play")}
              style={{ marginBottom: "var(--space-2)" }}
            >
              Continue Round
            </Button>
          )}
          <Button variant="secondary" full onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      </div>
    </Layout>
  );
}
