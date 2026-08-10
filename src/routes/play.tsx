import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/game/AppShell";
import { GameButton } from "@/components/game/GameButton";
import { CardFace } from "@/components/game/CardFace";
import { EraSlider } from "@/components/game/EraSlider";
import { useGame } from "@/game/store";
import { comboLabel, comboText } from "@/game/engine";
import { carLabel, cn } from "@/lib/utils";
import type { Entry } from "@/game/types";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Start a Season — Formula Archive" },
      {
        name: "description",
        content:
          "Pick a difficulty and era, roll your driver and car, then simulate a full 24-race championship.",
      },
      { property: "og:title", content: "Start a Season — Formula Archive" },
      {
        property: "og:description",
        content: "Roll a driver and car, face the grid and simulate a 24-race championship.",
      },
    ],
  }),
  component: Play,
});

function Play() {
  const g = useGame();
  const { phase } = g.run;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [phase]);

  return (
    <AppShell
      action={
        <Link to="/">
          <GameButton variant="ghost" size="sm">
            Home
          </GameButton>
        </Link>
      }
    >
      <div className="py-2 pb-8">
        {phase === "setup" && <Setup />}
        {phase === "driver" && <DriverRoll />}
        {phase === "car" && <CarRoll />}
        {phase === "combo" && <Combo />}
        {phase === "grid" && <Grid />}
        {phase === "season" && <Season />}
        {phase === "summary" && <Summary />}
      </div>
    </AppShell>
  );
}

function Setup() {
  const { difficulty, setDifficulty, eraMin, eraMax, setEra, startRun, goPhase } = useGame();

  return (
    <div className="rise grid gap-4">
      <div>
        <div className="kicker">Step 1</div>
        <h1 className="mt-1 text-[clamp(2.1rem,9vw,3.4rem)] leading-[0.9]">Season setup</h1>
      </div>

      <div className="panel p-5">
        <div className="kicker">Difficulty</div>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {(
            [
              { id: "easy", title: "Easy", desc: "One driver reroll and one car reroll." },
              { id: "hard", title: "Hard", desc: "No rerolls. Take what you are given." },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              onClick={() => setDifficulty(m.id)}
              className={cn(
                "rounded-2xl border p-4 text-left transition-all",
                difficulty === m.id
                  ? "border-primary bg-primary/10 shadow-[var(--shadow-racing)]"
                  : "border-border bg-surface-2 hover:border-white/25",
              )}
            >
              <b className="font-display block text-lg">{m.title}</b>
              <p className="text-muted-foreground mt-1 text-[0.78rem] leading-snug">{m.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="panel p-5">
        <div className="kicker">Era</div>
        <div className="mt-3">
          <EraSlider min={eraMin} max={eraMax} onChange={setEra} />
        </div>
      </div>

      <GameButton
        variant="primary"
        size="block"
        onClick={() => {
          startRun();
          goPhase("driver");
        }}
      >
        Roll my driver
      </GameButton>
    </div>
  );
}

function RerollNote({ used, available }: { used: boolean; available: boolean }) {
  if (!available) {
    return (
      <p className="text-muted-foreground mt-3 text-center text-[0.74rem] tracking-[0.1em] uppercase">
        Hard mode · no rerolls
      </p>
    );
  }
  return (
    <p className="text-muted-foreground mt-3 text-center text-[0.74rem] tracking-[0.1em] uppercase">
      {used ? "Reroll used" : "1 reroll available"}
    </p>
  );
}

function DriverRoll() {
  const { run, rollDriver, rerollDriver, goPhase, difficulty } = useGame();
  const easy = difficulty === "easy";

  return (
    <div className="rise grid gap-4">
      <div>
        <div className="kicker">Step 2 · Driver</div>
        <h1 className="mt-1 text-[clamp(2rem,8vw,3rem)] leading-[0.9]">Who are you?</h1>
      </div>

      {run.driver ? (
        <CardFace kind="driver" card={run.driver} shiny={run.driverShiny} isNew={run.driverNew} />
      ) : (
        <div className="panel text-muted-foreground grid min-h-64 place-items-center p-6 text-center">
          <div>
            <div className="font-display text-5xl opacity-30">?</div>
            <p className="mt-2 text-sm">Your driver is somewhere in the archive.</p>
          </div>
        </div>
      )}

      <div className="grid gap-2.5">
        {!run.driver ? (
          <GameButton variant="primary" size="block" onClick={rollDriver}>
            Roll driver
          </GameButton>
        ) : (
          <>
            {easy && (
              <GameButton
                variant="solid"
                size="block"
                disabled={run.driverRerollUsed}
                onClick={rerollDriver}
              >
                Reroll driver
              </GameButton>
            )}
            <GameButton variant="primary" size="block" onClick={() => goPhase("car")}>
              Keep · roll the car
            </GameButton>
          </>
        )}
        <RerollNote used={run.driverRerollUsed} available={easy} />
      </div>
    </div>
  );
}

function CarRoll() {
  const { run, rollCar, rerollCar, confirmCombo, difficulty } = useGame();
  const easy = difficulty === "easy";

  return (
    <div className="rise grid gap-4">
      <div>
        <div className="kicker">Step 3 · Car</div>
        <h1 className="mt-1 text-[clamp(2rem,8vw,3rem)] leading-[0.9]">What are you driving?</h1>
      </div>

      {run.car ? (
        <CardFace kind="car" card={run.car} shiny={run.carShiny} isNew={run.carNew} />
      ) : (
        <div className="panel text-muted-foreground grid min-h-64 place-items-center p-6 text-center">
          <div>
            <div className="font-display text-5xl opacity-30">?</div>
            <p className="mt-2 text-sm">Machinery unknown.</p>
          </div>
        </div>
      )}

      <div className="grid gap-2.5">
        {!run.car ? (
          <GameButton variant="primary" size="block" onClick={rollCar}>
            Roll car
          </GameButton>
        ) : (
          <>
            {easy && (
              <GameButton
                variant="solid"
                size="block"
                disabled={run.carRerollUsed}
                onClick={rerollCar}
              >
                Reroll car
              </GameButton>
            )}
            <GameButton variant="primary" size="block" onClick={confirmCombo}>
              See the combination
            </GameButton>
          </>
        )}
        <RerollNote used={run.carRerollUsed} available={easy} />
      </div>
    </div>
  );
}

function Combo() {
  const { run, buildGrid } = useGame();
  if (!run.driver || !run.car) return null;
  const score = run.driver.overall + run.car.overall;

  return (
    <div className="rise grid gap-4">
      <div className="kicker">Step 4 · The package</div>
      <div className={cn("panel p-6", (run.driverShiny || run.carShiny) && "holo")}>
        <div className="relative z-10">
          <h2 className="font-display text-[clamp(1.3rem,5.5vw,2rem)] leading-tight">
            {run.driverShiny && <span className="text-gold">✦ </span>}
            {run.driver.name} {run.driver.year}
            <span className="text-muted-foreground"> + </span>
            {run.carShiny && <span className="text-gold">✦ </span>}
            {carLabel(run.car.name, run.car.year)}
          </h2>
          <div className="mt-6 flex items-end gap-3">
            <div className="font-display tabular text-primary text-[clamp(4.5rem,22vw,8rem)] leading-[0.78]">
              {score}
            </div>
            <div className="pb-2">
              <div className="text-muted-foreground text-[0.7rem] tracking-[0.16em] uppercase">
                / 200
              </div>
              <b className="font-display text-sm">{comboLabel(score)}</b>
            </div>
          </div>
          <p className="text-muted-foreground mt-4">{comboText(score)}</p>
        </div>
      </div>
      <GameButton variant="primary" size="block" onClick={buildGrid}>
        Generate the grid
      </GameButton>
    </div>
  );
}

function Grid() {
  const { run, simulateSeason } = useGame();
  const opponents = run.field.slice(1);
  const sorted = [...opponents].sort((a, b) => b.combo - a.combo);

  return (
    <div className="rise grid gap-4">
      <div>
        <div className="kicker">Step 5 · The grid</div>
        <h1 className="mt-1 text-[clamp(1.8rem,7vw,2.8rem)] leading-[0.95]">
          {run.paperRank === 1
            ? "You are the strongest package on paper."
            : `You rank P${run.paperRank} on paper.`}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Field average <b className="text-foreground tabular">{run.gridAverage.toFixed(1)}</b> ·
          strongest <b className="text-foreground tabular">{run.gridStrongest}</b> · weakest{" "}
          <b className="text-foreground tabular">{run.gridWeakest}</b>
        </p>
      </div>

      <div className="panel p-4">
        <div className="flex h-40 items-end gap-1">
          {sorted.map((x) => (
            <div
              key={x.id}
              title={`${x.driver.name} ${x.driver.year} · ${carLabel(x.car.name, x.car.year)} · ${x.combo}`}
              className={cn(
                "flex-1 rounded-t-md",
                x.combo >= 180
                  ? "bg-gradient-to-t from-primary to-orange-400"
                  : x.combo < 135
                    ? "bg-white/10"
                    : "bg-white/25",
              )}
              style={{ height: `${Math.max(10, Math.min(100, ((x.combo - 80) * 1.5) / 1.78))}%` }}
            />
          ))}
        </div>
        <div className="text-muted-foreground mt-2 flex justify-between text-[0.66rem] tracking-[0.12em] uppercase">
          <span>Strongest rivals</span>
          <span>Backmarkers</span>
        </div>
      </div>

      <div className="panel divide-y divide-white/5 p-1">
        {sorted.slice(0, 5).map((x) => (
          <EntryRow key={x.id} entry={x} />
        ))}
      </div>

      <GameButton variant="primary" size="block" onClick={() => void simulateSeason()}>
        Start the season
      </GameButton>
    </div>
  );
}

function EntryRow({ entry }: { entry: Entry }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5">
      <div className="min-w-0">
        <div className="truncate text-[0.85rem] font-semibold">
          {entry.driver.name} {entry.driver.year}
        </div>
        <div className="text-muted-foreground truncate text-[0.72rem]">
          {carLabel(entry.car.name, entry.car.year)}
        </div>
      </div>
      <b className="font-display tabular shrink-0 text-lg">{entry.combo}</b>
    </div>
  );
}

function Season() {
  const { run } = useGame();
  const race = run.currentRace;

  return (
    <div className="grid gap-4">
      <div>
        <div className="kicker">Season in progress</div>
        <div className="mt-2 flex items-baseline justify-between">
          <h1 className="text-[clamp(1.6rem,6vw,2.4rem)]">Round {run.round} / 24</h1>
          <span className="text-muted-foreground tabular text-sm">
            {run.field.find((x) => x.id === 0)?.points ?? 0} pts
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${(run.round / 24) * 100}%`,
              backgroundImage: "var(--gradient-racing)",
            }}
          />
        </div>
      </div>

      <div className="panel grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-5">
        <div className="min-w-0">
          <div className="font-display truncate text-[clamp(1.5rem,7vw,2.6rem)]">
            {race?.track ?? "Lights out"}
          </div>
          <p className="text-muted-foreground mt-1 text-sm">{race?.note ?? "Formation lap…"}</p>
        </div>
        <div
          className={cn(
            "font-display tabular shrink-0 text-[clamp(2rem,9vw,3.4rem)]",
            race?.dnf ? "text-primary" : race?.pos === 1 ? "text-track" : race && race.pos <= 3 ? "text-gold" : "",
          )}
        >
          {race?.label ?? "—"}
        </div>
      </div>

      <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-12">
        {run.raceLog.map((r, i) => (
          <div
            key={`${r.track}-${i}`}
            className="rounded-lg border border-white/8 bg-black/25 px-1 py-1.5 text-center text-[0.6rem]"
          >
            {r.track.slice(0, 3).toUpperCase()}
            <b
              className={cn(
                "block text-[0.7rem]",
                r.dnf ? "text-primary" : r.pos === 1 ? "text-track" : r.pos <= 3 ? "text-gold" : "",
              )}
            >
              {r.label}
            </b>
          </div>
        ))}
      </div>
    </div>
  );
}

function Summary() {
  const { run, startRun, goPhase } = useGame();
  const navigate = useNavigate();
  const p = run.standings.find((x) => x.id === 0);
  if (!p) return null;
  const pos = run.finalPos;

  const title = run.perfect
    ? "🏆 PERFECT SEASON"
    : pos === 1
      ? "🏆 WORLD CHAMPION"
      : `CHAMPIONSHIP P${pos}`;

  const story = run.perfect
    ? "Twenty-four races. Twenty-four victories. You actually did it."
    : pos === 1
      ? `A championship season with ${p.wins} wins and ${p.podiums} podiums.`
      : pos <= 3
        ? `A genuine title challenge ended P${pos}. ${p.wins} wins proved the potential.`
        : pos <= 10
          ? `A competitive season ended P${pos}.`
          : `A brutal season ended P${pos}. This combination needed a kinder universe.`;

  return (
    <div className="rise grid gap-4">
      <div className={cn("panel p-5", pos === 1 && "holo")}>
        <div className="relative z-10">
          <div className="kicker">Final classification</div>
          <h1 className="mt-1 text-[clamp(2rem,9vw,3.6rem)] leading-[0.9]">{title}</h1>
          <p className="text-muted-foreground mt-2">{story}</p>
          <div className="mt-4 grid grid-cols-4 gap-2">
            <Mini label="Wins" value={p.wins} />
            <Mini label="Podiums" value={p.podiums} />
            <Mini label="DNFs" value={p.dnfs} />
            <Mini label="Points" value={p.points} />
          </div>
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="border-b border-white/8 px-4 py-3">
          <div className="kicker">Final standings</div>
        </div>
        <div className="divide-y divide-white/5">
          {run.standings.map((x, i) => (
            <div
              key={x.id}
              className={cn(
                "grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5",
                x.id === 0 && "bg-primary/10",
              )}
            >
              <span className="font-display tabular text-muted-foreground text-sm">{i + 1}</span>
              <div className="min-w-0">
                <div className="truncate text-[0.85rem] font-semibold">
                  {x.driver.name} {x.driver.year}
                </div>
                <div className="text-muted-foreground truncate text-[0.72rem]">
                  {carLabel(x.car.name, x.car.year)}
                </div>

              </div>
              <div className="shrink-0 text-right">
                <b className="font-display tabular block leading-none">{x.points}</b>
                <span className="text-muted-foreground tabular text-[0.66rem]">
                  {x.combo} OVR · {x.wins}W
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-2.5">
        <GameButton
          variant="primary"
          size="block"
          onClick={() => {
            startRun();
            goPhase("setup");
          }}
        >
          Roll again
        </GameButton>
        <div className="grid grid-cols-2 gap-2.5">
          <GameButton variant="ghost" size="block" onClick={() => void navigate({ to: "/career" })}>
            Career
          </GameButton>
          <GameButton variant="ghost" size="block" onClick={() => void navigate({ to: "/" })}>
            Home
          </GameButton>
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/8 bg-black/25 px-2 py-2 text-center">
      <span className="text-muted-foreground block text-[0.58rem] tracking-[0.12em] uppercase">
        {label}
      </span>
      <b className="font-display tabular text-xl">{value}</b>
    </div>
  );
}
