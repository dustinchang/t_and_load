import type { HoleInfo, HoleResult, Round } from "../../types";
import "./Scorecard.css";

export function ScoreBadge({
  strokes,
  result,
}: {
  strokes: number;
  result: HoleResult | null;
}) {
  if (strokes === 0)
    return <span className="score-badge score-badge--empty">—</span>;

  const cls = result
    ? `score-badge score-badge--${result === "triple+" ? "triple" : result}`
    : "score-badge";

  return <span className={cls}>{strokes}</span>;
}

interface ScorecardProps {
  round: Round;
  getPlayerTotal: (playerId: string) => number;
  getPlayerHoleResult: (playerId: string, hole: number) => HoleResult | null;
}

export function Scorecard({
  round,
  getPlayerTotal,
  getPlayerHoleResult,
}: ScorecardProps) {
  const { players, holesInfo, scores, teeBox } = round;

  // Use round.holesInfo when available; fall back to synthetic holes 1..N
  // so the scorecard renders even when the API returned no per-hole data.
  const totalHoles = holesInfo.length || 18;
  const holes: HoleInfo[] =
    holesInfo.length > 0
      ? holesInfo
      : Array.from({ length: totalHoles }, (_, i) => ({
          hole_number: i + 1,
          par: 4,
          handicap: i + 1,
          yardage: {} as HoleInfo["yardage"],
        }));

  // Only render rows for holes that have been played
  const playedHoles = holes.filter((hole) =>
    players.some((p) => (scores[p.id]?.[hole.hole_number]?.strokes ?? 0) > 0),
  );

  return (
    <div className="scorecard-table-wrapper">
      <table className="scorecard-table">
        <thead>
          <tr>
            <th>Hole</th>
            <th>Par</th>
            <th>Yds</th>
            {players.map((p) => (
              <th key={p.id}>{p.name.split(" ")[0]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {playedHoles.map((hole) => {
            const isNinthRow = hole.hole_number === 9;
            return (
              <tr
                key={hole.hole_number}
                className={isNinthRow ? "scorecard-row--nine" : ""}
              >
                <td>{hole.hole_number}</td>
                <td>{hole.par}</td>
                <td>{hole.yardage[teeBox] ?? "—"}</td>
                {players.map((p) => {
                  const s = scores[p.id]?.[hole.hole_number];
                  const result = getPlayerHoleResult(p.id, hole.hole_number);
                  return (
                    <td key={p.id}>
                      <div className="score-cell">
                        <ScoreBadge strokes={s?.strokes ?? 0} result={result} />
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}

          {/* Totals row */}
          <tr className="scorecard-row--total">
            <td colSpan={2}>Total</td>
            <td>—</td>
            {players.map((p) => (
              <td key={p.id}>{getPlayerTotal(p.id) || "—"}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
