import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { storage } from "../services/storage";
import type {
  Round,
  Player,
  HoleScore,
  HoleInfo,
  HoleResult,
  HatDraw,
  HatEffect,
  HatEffectKind,
  CourseDetail,
  TeeBox,
} from "../types";

// ---- Hat effect definitions ----

export const HAT_EFFECTS: HatEffect[] = [
  {
    kind: "double_own",
    label: "Double Down",
    description: "Your score for this hole is doubled.",
    emoji: "2️⃣",
    requiresTarget: false,
  },
  {
    kind: "half_own",
    label: "Half Off",
    description: "Your score for this hole is halved (rounded up).",
    emoji: "½",
    requiresTarget: false,
  },
  {
    kind: "double_other",
    label: "Evil Eye",
    description: "Double another player's score for this hole.",
    emoji: "👿",
    requiresTarget: true,
  },
  {
    kind: "half_other",
    label: "Kind Soul",
    description: "Halve another player's score for this hole (rounded up).",
    emoji: "😇",
    requiresTarget: true,
  },
  {
    kind: "swap_scores",
    label: "Score Swap",
    description: "Swap your score with another player's score for this hole.",
    emoji: "🔄",
    requiresTarget: true,
  },
];

// ---- Score helpers ----

export const DEFAULT_HOLE_SCORE: HoleScore = {
  strokes: 0,
  putts: 0,
  chips: 0,
  fairwayHit: null,
  gir: false,
  penaltyStrokes: 0,
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function classifyResult(strokes: number, par: number): HoleResult | null {
  if (strokes === 0) return null;
  const d = strokes - par;
  if (d <= -2) return "eagle";
  if (d === -1) return "birdie";
  if (d === 0) return "par";
  if (d === 1) return "bogey";
  if (d === 2) return "double";
  return "triple+";
}

/** Pure function — compute a player's hat-game score for one hole from round data. */
export function computeHatScore(
  round: Round,
  playerId: string,
  holeNumber: number,
): number {
  const draws = (round.hatDraws ?? []).filter(
    (d) => d.applied && d.holeNumber === holeNumber,
  );

  // Real (base) strokes for every player on this hole
  const base: Record<string, number> = {};
  for (const p of round.players) {
    base[p.id] = round.scores[p.id]?.[holeNumber]?.strokes ?? 0;
  }

  let score = base[playerId] ?? 0;

  for (const draw of draws) {
    const kind = draw.effect.kind as HatEffectKind;

    // Effects the drawing player applied that target themselves
    if (draw.playerId === playerId) {
      if (kind === "double_own") score = score * 2;
      if (kind === "half_own") score = Math.ceil(score / 2);
      if (kind === "swap_scores" && draw.targetPlayerId)
        score = base[draw.targetPlayerId] ?? score;
    }

    // Effects another player aimed at this player
    if (draw.targetPlayerId === playerId) {
      if (kind === "double_other") score = score * 2;
      if (kind === "half_other") score = Math.ceil(score / 2);
      if (kind === "swap_scores") score = base[draw.playerId] ?? score;
    }
  }

  return Math.max(0, score);
}

// ---- Context ----

interface GameContextValue {
  round: Round | null;
  startRound: (
    course: CourseDetail,
    players: Player[],
    teeBox: TeeBox,
    hatGameEnabled: boolean,
  ) => void;
  setScore: (
    playerId: string,
    holeNumber: number,
    score: Partial<HoleScore>,
  ) => void;
  nextHole: () => void;
  prevHole: () => void;
  completeRound: () => void;
  loadRound: (id: string) => void;
  clearRound: () => void;
  addHatDraw: (playerId: string, holeNumber: number) => HatDraw;
  applyHatDraw: (drawId: string, targetPlayerId?: string) => void;
  getPlayerScore: (playerId: string, holeNumber: number) => HoleScore;
  getPlayerTotal: (playerId: string) => number;
  getPlayerHoleResult: (
    playerId: string,
    holeNumber: number,
  ) => HoleResult | null;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  // Restore active round from localStorage on first mount
  const [round, setRound] = useState<Round | null>(() => {
    const id = storage.loadCurrentRoundId();
    if (!id) return null;
    const r = storage.loadRound(id);
    return r ? { ...r, hatDraws: r.hatDraws ?? [] } : null;
  });

  function startRound(
    course: CourseDetail,
    players: Player[],
    teeBox: TeeBox,
    hatGameEnabled: boolean,
  ) {
    // Build holesInfo from the API response; fall back to synthetic holes if missing
    const rawHoles = course.holes_info?.holes ?? [];
    const numHoles = course.holes || rawHoles.length || 18;
    const holesInfo: HoleInfo[] =
      rawHoles.length > 0
        ? rawHoles
        : Array.from({ length: numHoles }, (_, i) => ({
            hole_number: i + 1,
            par: 4,
            handicap: i + 1,
            yardage: {},
          }));

    const r: Round = {
      id: generateId(),
      courseId: course.id,
      courseName: course.course_name || course.club_name,
      date: new Date().toISOString(),
      players,
      scores: Object.fromEntries(players.map((p) => [p.id, {}])),
      currentHole: 1,
      teeBox,
      isComplete: false,
      hatGameEnabled,
      holesInfo,
      hatDraws: [],
    };
    storage.saveRound(r);
    storage.saveCurrentRoundId(r.id);
    setRound(r);
  }

  function setScore(
    playerId: string,
    holeNumber: number,
    score: Partial<HoleScore>,
  ) {
    setRound((prev) => {
      if (!prev) return prev;
      const existing = prev.scores[playerId]?.[holeNumber] ?? {
        ...DEFAULT_HOLE_SCORE,
      };
      const updated: Round = {
        ...prev,
        scores: {
          ...prev.scores,
          [playerId]: {
            ...prev.scores[playerId],
            [holeNumber]: { ...existing, ...score },
          },
        },
      };
      storage.saveRound(updated);
      return updated;
    });
  }

  function nextHole() {
    setRound((prev) => {
      if (!prev) return prev;
      const total = prev.holesInfo.length || 18;
      if (prev.currentHole >= total) return prev;
      const updated = { ...prev, currentHole: prev.currentHole + 1 };
      storage.saveRound(updated);
      return updated;
    });
  }

  function prevHole() {
    setRound((prev) => {
      if (!prev || prev.currentHole <= 1) return prev;
      const updated = { ...prev, currentHole: prev.currentHole - 1 };
      storage.saveRound(updated);
      return updated;
    });
  }

  function completeRound() {
    setRound((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, isComplete: true };
      storage.saveRound(updated);
      storage.clearCurrentRoundId();
      return updated;
    });
  }

  function loadRound(id: string) {
    const r = storage.loadRound(id);
    setRound(r ? { ...r, hatDraws: r.hatDraws ?? [] } : null);
  }

  function clearRound() {
    storage.clearCurrentRoundId();
    setRound(null);
  }

  // ---- Hat game ----

  function addHatDraw(playerId: string, holeNumber: number): HatDraw {
    const effect = HAT_EFFECTS[Math.floor(Math.random() * HAT_EFFECTS.length)];
    const draw: HatDraw = {
      id: `hat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      playerId,
      holeNumber,
      effect,
      applied: false,
      timestamp: new Date().toISOString(),
    };
    // Persist the draw alongside the round immediately
    setRound((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, hatDraws: [...(prev.hatDraws ?? []), draw] };
      storage.saveRound(updated);
      return updated;
    });
    return draw; // returned before React re-renders — modal captures it
  }

  function applyHatDraw(drawId: string, targetPlayerId?: string) {
    setRound((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        hatDraws: (prev.hatDraws ?? []).map((d) =>
          d.id === drawId ? { ...d, applied: true, targetPlayerId } : d,
        ),
      };
      storage.saveRound(updated);
      return updated;
    });
  }

  // ---- Derived selectors ----

  function getPlayerScore(playerId: string, holeNumber: number): HoleScore {
    return round?.scores[playerId]?.[holeNumber] ?? { ...DEFAULT_HOLE_SCORE };
  }

  function getPlayerTotal(playerId: string): number {
    if (!round) return 0;
    return Object.values(round.scores[playerId] ?? {}).reduce(
      (s, sc) => s + sc.strokes,
      0,
    );
  }

  function getPlayerHoleResult(
    playerId: string,
    holeNumber: number,
  ): HoleResult | null {
    if (!round) return null;
    const score = round.scores[playerId]?.[holeNumber];
    if (!score || score.strokes === 0) return null;
    const info = round.holesInfo.find((h) => h.hole_number === holeNumber);
    if (!info) return null;
    return classifyResult(score.strokes, info.par);
  }

  return (
    <GameContext.Provider
      value={{
        round,
        startRound,
        setScore,
        nextHole,
        prevHole,
        completeRound,
        loadRound,
        clearRound,
        addHatDraw,
        applyHatDraw,
        getPlayerScore,
        getPlayerTotal,
        getPlayerHoleResult,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside <GameProvider>");
  return ctx;
}
