import type { Round } from '../types';

const ROUNDS_KEY = 'gc_rounds';
const CURRENT_ROUND_KEY = 'gc_current_round_id';

function loadRoundsMap(): Record<string, Round> {
  try {
    const raw = localStorage.getItem(ROUNDS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Round>) : {};
  } catch {
    return {};
  }
}

function saveRoundsMap(map: Record<string, Round>): void {
  localStorage.setItem(ROUNDS_KEY, JSON.stringify(map));
}

export const storage = {
  saveRound(round: Round): void {
    const map = loadRoundsMap();
    map[round.id] = round;
    saveRoundsMap(map);
  },

  loadRound(id: string): Round | null {
    return loadRoundsMap()[id] ?? null;
  },

  loadAllRounds(): Round[] {
    const map = loadRoundsMap();
    return Object.values(map).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },

  deleteRound(id: string): void {
    const map = loadRoundsMap();
    delete map[id];
    saveRoundsMap(map);
  },

  saveCurrentRoundId(id: string): void {
    localStorage.setItem(CURRENT_ROUND_KEY, id);
  },

  loadCurrentRoundId(): string | null {
    return localStorage.getItem(CURRENT_ROUND_KEY);
  },

  clearCurrentRoundId(): void {
    localStorage.removeItem(CURRENT_ROUND_KEY);
  },
};
