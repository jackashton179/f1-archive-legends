import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/game/AppShell";
import { GameButton } from "@/components/game/GameButton";
import { useGame } from "@/game/store";
import { cars, drivers } from "@/game/engine";
import { achievements } from "@/game/achievements";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Formula Archive — Alternate History F1 Season Simulator" },
      {
        name: "description",
        content:
          "Roll a random historic F1 driver and car, face a randomly generated grid and simulate a 24-race alternate-history championship.",
      },
      { property: "og:title", content: "Formula Archive" },
      {
        property: "og:description",
        content:
          "Roll a random historic F1 driver and car, then simulate a 24-race alternate-history season.",
      },
    ],
  }),
  component: Home,
});

const TOTAL = drivers.length + cars.length;

function Home() {
  const { save, discovered, shinyDiscovered, resetCurrentRun } = useGame();
  const unlocked = achievements.filter((a) => save.achievements[a.id]).length;

  return (
    <AppShell>
      <div className="flex min-h-[calc(100dvh-9rem)] flex-col justify-center gap-6 py-4">
        <div>
          <div className="kicker">Season {save.career.seasons + 1}</div>
          <h1 className="mt-2 text-[clamp(3rem,15vw,6rem)] leading-[0.82]">
            FORMULA
            <br />
            <span className="text-primary">ARCHIVE</span>
          </h1>
          <p className="text-muted-foreground mt-4 max-w-md text-[0.95rem]">
            Pull a driver. Pull a car. Take whatever the universe gives you and race twenty-four
            rounds against a grid that never repeats.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Tile label="Seasons" value={save.career.seasons} />
          <Tile label="Titles" value={save.career.championships} />
          <Tile label="Shinies" value={shinyDiscovered} accent="text-gold" />
        </div>

        <div className="grid gap-2.5">
          <Link to="/play" onClick={resetCurrentRun}>
            <GameButton variant="primary" size="block">
              Start a season
            </GameButton>
          </Link>
          <div className="grid grid-cols-2 gap-2.5">
            <Link to="/archive">
              <GameButton variant="ghost" size="block">
                Archive
              </GameButton>
            </Link>
            <Link to="/career">
              <GameButton variant="ghost" size="block">
                Career
              </GameButton>
            </Link>
          </div>
        </div>

        <div className="panel flex flex-wrap items-center justify-between gap-3 p-4 text-[0.78rem]">
          <span className="text-muted-foreground">
            <b className="text-foreground tabular">{discovered}</b> / {TOTAL} cards discovered
          </span>
          <span className="text-muted-foreground">
            <b className="text-foreground tabular">{unlocked}</b> / {achievements.length}{" "}
            achievements
          </span>
        </div>
      </div>
    </AppShell>
  );
}

function Tile({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="panel px-3 py-3">
      <span className="text-muted-foreground block text-[0.6rem] tracking-[0.16em] uppercase">
        {label}
      </span>
      <b className={`font-display tabular text-2xl ${accent ?? ""}`}>{value}</b>
    </div>
  );
}
