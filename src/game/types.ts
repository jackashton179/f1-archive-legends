export type Driver = {
  name: string;
  year: number;
  decade: number;
  overall: number;
  pace: number;
  consistency: number;
  racecraft: number;
  provisional?: boolean;
  liveSeason?: boolean;
};

export type Car = {
  name: string;
  year: number;
  decade: number;
  overall: number;
  pace: number;
  reliability: number;
  tyres: number;
  provisional?: boolean;
  liveSeason?: boolean;
};

export type Difficulty = "easy" | "hard";

export type Band = "elite" | "verygood" | "mid" | "weak" | "disaster";

export type Entry = {
  id: number;
  driver: Driver;
  car: Car;
  combo: number;
  points: number;
  wins: number;
  podiums: number;
  dnfs: number;
};

export type RacePoint = { id: number; add: number; dnf: boolean; pos: number };

export type PlannedRace = {
  track: string;
  label: string;
  note: string;
  pos: number;
  dnf: boolean;
  rp: RacePoint[];
};

export type CareerStats = {
  seasons: number;
  championships: number;
  wins: number;
  podiums: number;
  dnfs: number;
  perfects: number;
  bestCombo: number;
  lowestChampCombo: number;
  shinies: number;
};

export type AchievementState = Record<string, { date: string; detail: string }>;

export type RunHistoryEntry = {
  date: string;
  pos: number;
  driver: string;
  driverYear: number;
  car: string;
  carYear: number;
  driverShiny: boolean;
  carShiny: boolean;
  combo: number;
  points: number;
  wins: number;
  podiums: number;
  dnfs: number;
  paperRank: number;
};

export type Collection = {
  d: string[];
  c: string[];
  sd: string[];
  sc: string[];
};
