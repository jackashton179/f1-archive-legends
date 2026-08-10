import driversData from "./data/drivers.json";
import carsData from "./data/cars.json";
import type { Band, Car, Driver, Entry, PlannedRace } from "./types";

export const drivers = driversData as Driver[];
export const cars = carsData as Car[];

export const MIN_YEAR = 1950;
export const MAX_YEAR = 2026;

export const calendar = [
  "Bahrain",
  "Saudi Arabia",
  "Australia",
  "Japan",
  "China",
  "Miami",
  "Imola",
  "Monaco",
  "Canada",
  "Spain",
  "Austria",
  "Britain",
  "Belgium",
  "Hungary",
  "Netherlands",
  "Italy",
  "Azerbaijan",
  "Singapore",
  "USA",
  "Mexico",
  "Brazil",
  "Las Vegas",
  "Qatar",
  "Abu Dhabi",
];

export const POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
export const SHINY_CHANCE = 0.02;

export const cardId = (x: { name: string; year: number }) => `${x.name}|${x.year}`;

export const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)]!;

export function shinyRoll() {
  return Math.random() < SHINY_CHANCE;
}

/** Box-Muller standard normal. */
export function norm() {
  let u = 0;
  let v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j]!, b[i]!];
  }
  return b;
}

export function band(o: number): Band {
  if (o >= 95) return "elite";
  if (o >= 88) return "verygood";
  if (o >= 78) return "mid";
  if (o >= 65) return "weak";
  return "disaster";
}

export function eraDrivers(min: number, max: number) {
  return drivers.filter((x) => x.year >= min && x.year <= max);
}

export function eraCars(min: number, max: number) {
  return cars.filter((x) => x.year >= min && x.year <= max);
}

/** Weighted driver selection by rating band. */
export function weightedDriver(min: number, max: number): Driver {
  const pool = eraDrivers(min, max);
  const r = Math.random();
  const b: Band =
    r < 0.12 ? "elite" : r < 0.34 ? "verygood" : r < 0.68 ? "mid" : r < 0.94 ? "weak" : "disaster";
  const p = pool.filter((x) => band(x.overall) === b);
  return pick(p.length ? p : pool);
}

export function rollCar(min: number, max: number): Car {
  return pick(eraCars(min, max));
}

export function comboLabel(s: number) {
  if (s >= 190) return "☠️ GODLIKE";
  if (s >= 180) return "🔥 TITLE WEAPON";
  if (s >= 170) return "🏎️ STRONG";
  if (s >= 160) return "🟡 MIDFIELD";
  if (s >= 150) return "😬 LOWER MIDFIELD";
  if (s >= 140) return "🐌 BACKMARKER";
  return "💀 CURSED";
}

export function comboText(s: number) {
  return s >= 190
    ? "This is the kind of roll perfect seasons are made for."
    : s >= 180
      ? "You have a genuine championship weapon."
      : s >= 160
        ? "You have something to work with."
        : "You need the universe to be kind.";
}

/** Opponent slot ranges — deliberately dispersed from title threats to backmarkers. */
const SLOT_RANGES: [number, number][] = [
  [186, 198],
  [180, 194],
  [174, 190],
  [168, 185],
  [164, 181],
  [158, 176],
  [154, 172],
  [150, 168],
  [146, 164],
  [142, 161],
  [136, 157],
  [132, 153],
  [128, 149],
  [124, 145],
  [116, 140],
  [110, 135],
  [104, 130],
  [96, 124],
  [88, 118],
];

function bestPair(
  dp: Driver[],
  cp: Car[],
  ud: Set<number>,
  uc: Set<number>,
  lo: number,
  hi: number,
) {
  const cand: { di: number; ci: number; co: number }[] = [];
  for (let di = 0; di < dp.length; di++) {
    if (ud.has(di)) continue;
    for (let ci = 0; ci < cp.length; ci++) {
      if (uc.has(ci)) continue;
      const co = dp[di]!.overall + cp[ci]!.overall;
      if (co >= lo && co <= hi) cand.push({ di, ci, co });
    }
  }
  if (cand.length) return pick(cand);
  const t = (lo + hi) / 2;
  let b: { di: number; ci: number; co: number; ds: number } | null = null;
  for (let di = 0; di < dp.length; di++) {
    if (ud.has(di)) continue;
    for (let ci = 0; ci < cp.length; ci++) {
      if (uc.has(ci)) continue;
      const co = dp[di]!.overall + cp[ci]!.overall;
      const ds = Math.abs(co - t);
      if (!b || ds < b.ds) b = { di, ci, co, ds };
    }
  }
  return b!;
}

export type GridSummary = {
  field: Entry[];
  paperRank: number;
  average: number;
  strongest: number;
  weakest: number;
};

export function generateField(
  driver: Driver,
  car: Car,
  min: number,
  max: number,
): GridSummary {
  const player: Entry = {
    id: 0,
    driver,
    car,
    combo: driver.overall + car.overall,
    points: 0,
    wins: 0,
    podiums: 0,
    dnfs: 0,
  };
  const dp = shuffle(eraDrivers(min, max).filter((x) => cardId(x) !== cardId(driver)));
  const cp = shuffle(eraCars(min, max).filter((x) => cardId(x) !== cardId(car)));
  const ud = new Set<number>();
  const uc = new Set<number>();
  const field: Entry[] = [player];
  const shift = Math.round(norm() * 7);

  for (let i = 0; i < 19; i++) {
    const [lo, hi] = SLOT_RANGES[i]!;
    const ch = bestPair(dp, cp, ud, uc, lo + shift, hi + shift);
    ud.add(ch.di);
    uc.add(ch.ci);
    field.push({
      id: i + 1,
      driver: dp[ch.di]!,
      car: cp[ch.ci]!,
      combo: ch.co,
      points: 0,
      wins: 0,
      podiums: 0,
      dnfs: 0,
    });
  }

  const o = field.slice(1);
  return {
    field,
    paperRank: 1 + o.filter((x) => x.combo > player.combo).length,
    average: o.reduce((s, x) => s + x.combo, 0) / o.length,
    strongest: Math.max(...o.map((x) => x.combo)),
    weakest: Math.min(...o.map((x) => x.combo)),
  };
}

export function planSeason(field: Entry[]): PlannedRace[] {
  const plan: PlannedRace[] = [];
  for (const tr of calendar) {
    const race = field.map((e) => {
      const dd = e.driver;
      const cc = e.car;
      const dA = 0.45 * dd.pace + 0.3 * dd.consistency + 0.25 * dd.racecraft;
      const cA = 0.5 * cc.pace + 0.25 * cc.reliability + 0.25 * cc.tyres;
      let str = 0.8 * (e.combo / 2) + 0.2 * ((dA + cA) / 2);
      str += norm() * 2.6 + norm() * Math.max(1.3, 3.6 - 0.03 * (dd.consistency - 50));
      const df =
        0.008 + 0.00075 * (100 - cc.reliability) + 0.00018 * (100 - dd.consistency);
      return { entry: e, strength: str, dnf: Math.random() < df };
    });
    const order = [
      ...race.filter((x) => !x.dnf).sort((a, b) => b.strength - a.strength),
      ...race.filter((x) => x.dnf),
    ];
    const rp = order.map((x, i) => ({
      id: x.entry.id,
      add: !x.dnf && i < 10 ? POINTS[i]! : 0,
      dnf: x.dnf,
      pos: i + 1,
    }));
    const pi = order.findIndex((x) => x.entry.id === 0);
    const pr = order[pi]!;
    const label = pr.dnf ? "DNF" : "P" + (pi + 1);
    const note = pr.dnf
      ? Math.random() < 0.55
        ? `Mechanical failure at ${tr}.`
        : `Caught in an incident at ${tr}.`
      : pi === 0
        ? "Brilliant victory."
        : pi < 3
          ? "Strong podium finish."
          : pi <= 6
            ? "A very solid points haul."
            : pi >= 15
              ? "A weekend to forget."
              : "Scrapped for points.";
    plan.push({ track: tr, label, note, pos: pi + 1, dnf: pr.dnf, rp });
  }
  return plan;
}

export function applyRace(field: Entry[], race: PlannedRace) {
  race.rp.forEach((z) => {
    const e = field.find((x) => x.id === z.id);
    if (!e) return;
    e.points += z.add;
    if (z.dnf) e.dnfs++;
    if (!z.dnf && z.pos === 1) e.wins++;
    if (!z.dnf && z.pos <= 3) e.podiums++;
  });
}

export function finalStandings(field: Entry[]) {
  return [...field].sort((a, b) => b.points - a.points || b.wins - a.wins);
}

export function seasonStory(pos: number, wins: number, podiums: number, perfect: boolean) {
  if (perfect) return "Twenty-four races. Twenty-four victories. You actually did it.";
  if (pos === 1) return `A championship season with ${wins} wins and ${podiums} podiums.`;
  if (pos <= 3)
    return `A genuine title challenge ended P${pos}. ${wins} wins proved the potential.`;
  if (pos <= 10) return `A competitive season ended P${pos}.`;
  return `A brutal season ended P${pos}. This combination needed a kinder universe.`;
}
