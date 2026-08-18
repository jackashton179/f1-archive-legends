import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { achievementById, achievements } from "./achievements";
import {
  applyRace,
  cardId,
  finalStandings,
  generateField,
  planSeason,
  rollCar as rollCarFromPool,
  shinyRoll,
  weightedDriver,
  MAX_YEAR,
  MIN_YEAR,
} from "./engine";
import { emptySave, localSaveAdapter, type SaveAdapter, type SaveData } from "./storage";
import type {
  Car,
  Difficulty,
  Driver,
  Entry,
  PlannedRace,
  RunHistoryEntry,
} from "./types";

export type Phase = "setup" | "driver" | "car" | "combo" | "grid" | "season" | "summary";

type RunState = {
  phase: Phase;
  driver: Driver | null;
  car: Car | null;
  driverShiny: boolean;
  carShiny: boolean;
  driverNew: boolean;
  carNew: boolean;
  driverRerollUsed: boolean;
  carRerollUsed: boolean;
  field: Entry[];
  paperRank: number;
  gridAverage: number;
  gridStrongest: number;
  gridWeakest: number;
  round: number;
  currentRace: PlannedRace | null;
  raceLog: { track: string; label: string; dnf: boolean; pos: number }[];
  standings: Entry[];
  finalPos: number;
  perfect: boolean;
  simulating: boolean;
};

const freshRun = (): RunState => ({
  phase: "setup",
  driver: null,
  car: null,
  driverShiny: false,
  carShiny: false,
  driverNew: false,
  carNew: false,
  driverRerollUsed: false,
  carRerollUsed: false,
  field: [],
  paperRank: 20,
  gridAverage: 0,
  gridStrongest: 0,
  gridWeakest: 0,
  round: 0,
  currentRace: null,
  raceLog: [],
  standings: [],
  finalPos: 0,
  perfect: false,
  simulating: false,
});

type GameContextValue = {
  ready: boolean;
  save: SaveData;
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  eraMin: number;
  eraMax: number;
  setEra: (min: number, max: number) => void;
  run: RunState;
  goPhase: (p: Phase) => void;
  startRun: () => void;
  resetCurrentRun: () => void;
  rollDriver: () => void;
  rerollDriver: () => void;
  rollCar: () => void;
  rerollCar: () => void;
  confirmCombo: () => void;
  buildGrid: () => void;
  simulateSeason: () => Promise<void>;
  discovered: number;
  shinyDiscovered: number;
  totalCards: number;
  hasCard: (kind: "driver" | "car", key: string, shiny?: boolean) => boolean;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({
  children,
  adapter = localSaveAdapter,
}: {
  children: ReactNode;
  adapter?: SaveAdapter;
}) {
  const [ready, setReady] = useState(false);
  const [save, setSave] = useState<SaveData>(() => emptySave());
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [eraMin, setEraMin] = useState(MIN_YEAR);
  const [eraMax, setEraMax] = useState(MAX_YEAR);
  const [run, setRun] = useState<RunState>(freshRun);
  const saveRef = useRef(save);
  saveRef.current = save;
  const runRef = useRef(run);
  runRef.current = run;

  useEffect(() => {
    setSave(adapter.load());
    setReady(true);
  }, [adapter]);

  const persist = useCallback(
    (next: SaveData) => {
      saveRef.current = next;
      setSave(next);
      adapter.save(next);
    },
    [adapter],
  );

  const unlock = useCallback(
    (data: SaveData, id: string, detail: string): SaveData => {
      if (data.achievements[id]) return data;
      const a = achievementById(id);
      if (!a) return data;
      const next: SaveData = {
        ...data,
        achievements: {
          ...data.achievements,
          [id]: { date: new Date().toISOString(), detail },
        },
      };
      setTimeout(() => {
        toast(`${a.icon}  ${a.name}`, {
          description: detail || a.desc,
          duration: 3600,
        });
      }, 0);
      return next;
    },
    [],
  );

  const collectionChecks = useCallback(
    (data: SaveData): SaveData => {
      const discovered = data.collection.d.length + data.collection.c.length;
      const shinyTotal = data.collection.sd.length + data.collection.sc.length;
      let next: SaveData = {
        ...data,
        career: { ...data.career, shinies: Math.max(data.career.shinies || 0, shinyTotal) },
      };
      if (discovered >= 100) next = unlock(next, "collector", `${discovered} cards discovered.`);
      if (discovered >= 250) next = unlock(next, "archivist", `${discovered} cards discovered.`);
      if (shinyTotal >= 1)
        next = unlock(next, "shiny", "Your first shiny entered the Formula Archive.");
      return next;
    },
    [unlock],
  );

  const setEra = useCallback((min: number, max: number) => {
    setEraMin(Math.max(MIN_YEAR, Math.min(min, MAX_YEAR - 1)));
    setEraMax(Math.min(MAX_YEAR, Math.max(max, MIN_YEAR + 1)));
  }, []);

  const goPhase = useCallback((p: Phase) => setRun((r) => ({ ...r, phase: p })), []);

  /** Reset temporary season/run state only. Persistent save data is deliberately untouched. */
  const resetCurrentRun = useCallback(() => {
    setRun(freshRun());
  }, []);

  const startRun = useCallback(() => {
    resetCurrentRun();
  }, [resetCurrentRun]);

  const collect = useCallback(
    (kind: "driver" | "car", card: Driver | Car, shiny: boolean) => {
      const key = cardId(card);
      const data = saveRef.current;
      const c = data.collection;
      const list = kind === "driver" ? c.d : c.c;
      const shinyList = kind === "driver" ? c.sd : c.sc;
      const isNew = !list.includes(key);
      const isNewShiny = shiny && !shinyList.includes(key);
      const collection = {
        ...c,
        [kind === "driver" ? "d" : "c"]: isNew ? [...list, key] : list,
        [kind === "driver" ? "sd" : "sc"]: isNewShiny ? [...shinyList, key] : shinyList,
      } as SaveData["collection"];
      persist(collectionChecks({ ...data, collection }));
      return { isNew, isNewShiny };
    },
    [collectionChecks, persist],
  );

  const rollDriver = useCallback(() => {
    if (runRef.current.driver) return;
    const driver = weightedDriver(eraMin, eraMax);
    const shiny = shinyRoll();
    const { isNew, isNewShiny } = collect("driver", driver, shiny);
    setRun((r) => ({ ...r, driver, driverShiny: shiny, driverNew: isNew || isNewShiny }));
  }, [collect, eraMin, eraMax]);

  const rerollDriver = useCallback(() => {
    const cur = runRef.current;
    if (difficulty !== "easy" || cur.driverRerollUsed || !cur.driver) return;
    const driver = weightedDriver(eraMin, eraMax);
    const shiny = shinyRoll();
    const { isNew, isNewShiny } = collect("driver", driver, shiny);
    setRun((r) => ({
      ...r,
      driver,
      driverShiny: shiny,
      driverNew: isNew || isNewShiny,
      driverRerollUsed: true,
    }));
  }, [collect, difficulty, eraMin, eraMax]);

  const rollCar = useCallback(() => {
    if (runRef.current.car) return;
    const car = rollCarFromPool(eraMin, eraMax);
    const shiny = shinyRoll();
    const { isNew, isNewShiny } = collect("car", car, shiny);
    setRun((r) => ({ ...r, car, carShiny: shiny, carNew: isNew || isNewShiny }));
  }, [collect, eraMin, eraMax]);

  const rerollCar = useCallback(() => {
    const cur = runRef.current;
    if (difficulty !== "easy" || cur.carRerollUsed || !cur.car) return;
    const car = rollCarFromPool(eraMin, eraMax);
    const shiny = shinyRoll();
    const { isNew, isNewShiny } = collect("car", car, shiny);
    setRun((r) => ({
      ...r,
      car,
      carShiny: shiny,
      carNew: isNew || isNewShiny,
      carRerollUsed: true,
    }));
  }, [collect, difficulty, eraMin, eraMax]);

  /** Roll-time achievement checks (fires when the combination is revealed). */
  const confirmCombo = useCallback(() => {
    const r = runRef.current;
    if (!r.driver || !r.car) return;
    const combo = r.driver.overall + r.car.overall;
    let data: SaveData = {
      ...saveRef.current,
      career: {
        ...saveRef.current.career,
        bestCombo: Math.max(saveRef.current.career.bestCombo || 0, combo),
      },
    };
    if (combo >= 195)
      data = unlock(data, "god_tier", `${combo}/200 · ${r.driver.name} + ${r.car.name}`);
    if (combo < 140) data = unlock(data, "oh_dear", `${combo}/200. Good luck.`);
    if (r.driver.overall >= 95 && r.car.overall >= 95)
      data = unlock(
        data,
        "dream_team",
        `${r.driver.name} ${r.driver.year} + ${r.car.name} ${r.car.year}`,
      );
    if (r.driverShiny && r.carShiny)
      data = unlock(data, "double_shiny", "Both sides of the combination were shiny.");
    if ((r.driverShiny && r.driver.overall >= 95) || (r.carShiny && r.car.overall >= 95))
      data = unlock(data, "holy_grail", "A 95+ shiny pull.");
    data = collectionChecks(data);
    persist(data);
    setRun((prev) => ({ ...prev, phase: "combo" }));
  }, [collectionChecks, persist, unlock]);

  const buildGrid = useCallback(() => {
    const r = runRef.current;
    if (!r.driver || !r.car) return;
    const g = generateField(r.driver, r.car, eraMin, eraMax);
    setRun((prev) => ({
      ...prev,
      field: g.field,
      paperRank: g.paperRank,
      gridAverage: g.average,
      gridStrongest: g.strongest,
      gridWeakest: g.weakest,
      phase: "grid",
    }));
  }, [eraMin, eraMax]);

  const simulateSeason = useCallback(async () => {
    const state = runRef.current;
    if (!state.field.length || state.simulating) return;
    const field: Entry[] = state.field.map((e) => ({
      ...e,
      points: 0,
      wins: 0,
      podiums: 0,
      dnfs: 0,
    }));
    const plan = planSeason(field);
    setRun((r) => ({
      ...r,
      phase: "season",
      simulating: true,
      round: 0,
      raceLog: [],
      currentRace: null,
      field,
    }));

    for (let i = 0; i < plan.length; i++) {
      const race = plan[i]!;
      applyRace(field, race);
      setRun((r) => ({
        ...r,
        round: i + 1,
        currentRace: race,
        raceLog: [
          { track: race.track, label: race.label, dnf: race.dnf, pos: race.pos },
          ...r.raceLog,
        ],
        field: field.map((e) => ({ ...e })),
      }));
      await new Promise((q) => setTimeout(q, 400));
    }

    const standings = finalStandings(field);
    const pos = standings.findIndex((x) => x.id === 0) + 1;
    const p = standings.find((x) => x.id === 0)!;
    const perfect = p.wins === 24 && p.dnfs === 0;

    let data: SaveData = { ...saveRef.current };
    const career = { ...data.career };
    career.seasons = (career.seasons || 0) + 1;
    career.wins = (career.wins || 0) + p.wins;
    career.podiums = (career.podiums || 0) + p.podiums;
    career.dnfs = (career.dnfs || 0) + p.dnfs;
    career.bestCombo = Math.max(career.bestCombo || 0, p.combo);
    data = { ...data, career };

    if (pos === 1) {
      career.championships = (career.championships || 0) + 1;
      career.lowestChampCombo = Math.min(career.lowestChampCombo || 999, p.combo);
      data = { ...data, career };
      data = unlock(
        data,
        "world_champion",
        `${p.driver.name} ${p.driver.year} · ${p.combo}/200`,
      );
      if (p.combo < 160) data = unlock(data, "how", `Champion with only ${p.combo}/200.`);
      if (p.dnfs === 0) data = unlock(data, "clean_sweep", "World Champion with zero DNFs.");
      if (state.driverShiny || state.carShiny)
        data = unlock(
          data,
          "shiny_champ",
          "A shiny was part of the title-winning combination.",
        );
    }
    if (perfect) {
      career.perfects = (career.perfects || 0) + 1;
      data = { ...data, career };
      data = unlock(data, "perfect", "24 wins from 24 races.");
    }
    if (p.wins >= 15) data = unlock(data, "dominant", `${p.wins} victories.`);
    if (p.combo < 150 && p.podiums > 0)
      data = unlock(
        data,
        "dragging",
        `${p.combo}/200 package scored ${p.podiums} podium(s).`,
      );
    if (career.seasons >= 100)
      data = unlock(data, "touch_grass", `${career.seasons} seasons completed. Seriously.`);

    if (pos === 1 && standings.length > 1) {
      const margin = p.points - standings[1]!.points;
      if (margin === 1) data = unlock(data, "photo_finish", "Won the title by exactly 1 point.");
    } else if (pos === 2) {
      const deficit = standings[0]!.points - p.points;
      if (deficit <= 3)
        data = unlock(data, "heartbreak", `Lost the championship by ${deficit} point(s).`);
    }

    const finalRace = plan[plan.length - 1];
    if (pos !== 1 && finalRace && finalRace.dnf)
      data = unlock(data, "pain", "A final-race DNF ended the title dream.");

    if (state.paperRank >= 15 && p.wins > 0)
      data = unlock(
        data,
        "zero_hero",
        `Started P${state.paperRank} on paper and still won a race.`,
      );

    const entry: RunHistoryEntry = {
      date: new Date().toISOString(),
      pos,
      driver: p.driver.name,
      driverYear: p.driver.year,
      car: p.car.name,
      carYear: p.car.year,
      driverShiny: state.driverShiny,
      carShiny: state.carShiny,
      combo: p.combo,
      points: p.points,
      wins: p.wins,
      podiums: p.podiums,
      dnfs: p.dnfs,
      paperRank: state.paperRank,
    };
    data = { ...data, runHistory: [entry, ...data.runHistory].slice(0, 20) };
    data = collectionChecks(data);
    persist(data);

    setRun((r) => ({
      ...r,
      standings,
      finalPos: pos,
      perfect,
      simulating: false,
      phase: "summary",
    }));
  }, [collectionChecks, persist, unlock]);

  const value = useMemo<GameContextValue>(() => {
    const discovered = save.collection.d.length + save.collection.c.length;
    const shinyDiscovered = save.collection.sd.length + save.collection.sc.length;
    return {
      ready,
      save,
      difficulty,
      setDifficulty,
      eraMin,
      eraMax,
      setEra,
      run,
      goPhase,
      startRun,
      resetCurrentRun,
      rollDriver,
      rerollDriver,
      rollCar,
      rerollCar,
      confirmCombo,
      buildGrid,
      simulateSeason,
      discovered,
      shinyDiscovered,
      totalCards: 0,
      hasCard: (kind, key, shiny) => {
        const c = save.collection;
        const list = shiny ? (kind === "driver" ? c.sd : c.sc) : kind === "driver" ? c.d : c.c;
        return list.includes(key);
      },
    };
  }, [
    ready,
    save,
    difficulty,
    eraMin,
    eraMax,
    setEra,
    run,
    goPhase,
    startRun,
    resetCurrentRun,
    rollDriver,
    rerollDriver,
    rollCar,
    rerollCar,
    confirmCombo,
    buildGrid,
    simulateSeason,
  ]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}

export const totalAchievements = achievements.length;
