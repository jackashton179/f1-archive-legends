import type {
  AchievementState,
  CareerStats,
  Collection,
  RunHistoryEntry,
} from "./types";

export type SaveData = {
  career: CareerStats;
  achievements: AchievementState;
  runHistory: RunHistoryEntry[];
  collection: Collection;
};

export const emptySave = (): SaveData => ({
  career: {
    seasons: 0,
    championships: 0,
    wins: 0,
    podiums: 0,
    dnfs: 0,
    perfects: 0,
    bestCombo: 0,
    lowestChampCombo: 999,
    shinies: 0,
  },
  achievements: {},
  runHistory: [],
  collection: { d: [], c: [], sd: [], sc: [] },
});

/**
 * Persistence abstraction. A cloud/account-backed adapter can be dropped in
 * later without touching the engine or the UI.
 */
export interface SaveAdapter {
  load(): SaveData;
  save(data: SaveData): void;
}

const KEYS = {
  career: "ppsCareer",
  achievements: "ppsAchievements",
  history: "ppsRunHistory",
  d: "ppsD",
  c: "ppsC",
  sd: "ppsSD",
  sc: "ppsSC",
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Default adapter — browser localStorage, using the original save keys. */
export const localSaveAdapter: SaveAdapter = {
  load() {
    if (typeof window === "undefined") return emptySave();
    const base = emptySave();
    return {
      career: { ...base.career, ...read(KEYS.career, {}) },
      achievements: read<AchievementState>(KEYS.achievements, {}),
      runHistory: read<RunHistoryEntry[]>(KEYS.history, []),
      collection: {
        d: read<string[]>(KEYS.d, []),
        c: read<string[]>(KEYS.c, []),
        sd: read<string[]>(KEYS.sd, []),
        sc: read<string[]>(KEYS.sc, []),
      },
    };
  },
  save(data) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(KEYS.career, JSON.stringify(data.career));
      localStorage.setItem(KEYS.achievements, JSON.stringify(data.achievements));
      localStorage.setItem(KEYS.history, JSON.stringify(data.runHistory));
      localStorage.setItem(KEYS.d, JSON.stringify(data.collection.d));
      localStorage.setItem(KEYS.c, JSON.stringify(data.collection.c));
      localStorage.setItem(KEYS.sd, JSON.stringify(data.collection.sd));
      localStorage.setItem(KEYS.sc, JSON.stringify(data.collection.sc));
    } catch {
      /* storage unavailable — game still playable for this session */
    }
  },
};
