import type { Player, HoleScore, HoleResult } from '../../types';
import './HoleScoreEntry.css';

function resultLabel(result: HoleResult | null): string {
  if (!result) return '';
  return { eagle: 'Eagle!', birdie: 'Birdie!', par: 'Par', bogey: 'Bogey', double: 'Double', 'triple+': 'Triple+' }[result] ?? '';
}

interface CounterProps {
  label: string;
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  min?: number;
}

function Counter({ label, value, onDecrement, onIncrement, min = 0 }: CounterProps) {
  return (
    <div className="score-counter">
      <span className="score-counter-label">{label}</span>
      <div className="score-counter-control">
        <button
          className="score-counter-btn"
          onClick={onDecrement}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className="score-counter-value">{value}</span>
        <button
          className="score-counter-btn"
          onClick={onIncrement}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

interface HoleScoreEntryProps {
  player: Player;
  score: HoleScore;
  result: HoleResult | null;
  par: number;
  onChange: (partial: Partial<HoleScore>) => void;
  isActive?: boolean;
}

export function HoleScoreEntry({
  player,
  score,
  result,
  par,
  onChange,
  isActive = false,
}: HoleScoreEntryProps) {
  const resultText = resultLabel(result);
  const resultClass = result ? `score-indicator--${result === 'triple+' ? 'triple' : result}` : '';

  const cycleFairway = () => {
    const next: HoleScore['fairwayHit'] =
      score.fairwayHit === null ? 'hit'
      : score.fairwayHit === 'hit' ? 'left'
      : score.fairwayHit === 'left' ? 'right'
      : null;
    onChange({ fairwayHit: next });
  };

  const fairwayLabel = () => {
    if (score.fairwayHit === null) return 'Fairway?';
    if (score.fairwayHit === 'hit') return '✓ Fairway';
    if (score.fairwayHit === 'left') return '← Left';
    return 'Right →';
  };

  const fairwayClass = () => {
    if (score.fairwayHit === null) return 'score-extra-btn';
    if (score.fairwayHit === 'hit') return 'score-extra-btn score-extra-btn--hit-active';
    return 'score-extra-btn score-extra-btn--miss-active';
  };

  return (
    <div className={`score-entry-player${isActive ? ' score-entry-player--active' : ''}`}>
      <div className="score-entry-player-name">
        <span>{player.name}</span>
        {result && (
          <span className={`score-indicator ${resultClass}`}>{resultText}</span>
        )}
      </div>

      <div className="score-counter-row">
        <Counter
          label="Strokes"
          value={score.strokes}
          onDecrement={() => onChange({ strokes: Math.max(1, score.strokes - 1) })}
          onIncrement={() => onChange({ strokes: score.strokes + 1 })}
          min={1}
        />
        <Counter
          label="Putts"
          value={score.putts}
          onDecrement={() => onChange({ putts: Math.max(0, score.putts - 1) })}
          onIncrement={() => onChange({ putts: score.putts + 1 })}
        />
        <Counter
          label="Chips"
          value={score.chips}
          onDecrement={() => onChange({ chips: Math.max(0, score.chips - 1) })}
          onIncrement={() => onChange({ chips: score.chips + 1 })}
        />
      </div>

      <div className="score-extras">
        {par !== 3 && (
          <button className={fairwayClass()} onClick={cycleFairway}>
            {fairwayLabel()}
          </button>
        )}
        <button
          className={`score-extra-btn${score.gir ? ' score-extra-btn--active' : ''}`}
          onClick={() => onChange({ gir: !score.gir })}
        >
          {score.gir ? '✓ GIR' : 'GIR?'}
        </button>
        {score.penaltyStrokes > 0 && (
          <button
            className="score-extra-btn score-extra-btn--miss-active"
            onClick={() => onChange({ penaltyStrokes: 0 })}
          >
            +{score.penaltyStrokes} Penalty
          </button>
        )}
        <button
          className="score-extra-btn"
          onClick={() => onChange({ penaltyStrokes: score.penaltyStrokes + 1 })}
        >
          + Penalty
        </button>
      </div>
    </div>
  );
}
