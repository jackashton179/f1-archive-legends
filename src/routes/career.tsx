import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/game/AppShell";
import { GameButton } from "@/components/game/GameButton";
import { achievements } from "@/game/achievements";
import { useGame } from "@/game/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/career")({
  head: () => ({
    meta: [
      { title: "Career & Achievements — Formula Archive" },
      {
        name: "description",
        content:
          "Lifetime championships, wins, podiums and DNFs, plus achievements and your last 20 seasons.",
      },
      { property: "og:title", content: "Career & Achievements — Formula Archive" },
      {
        property: "og:description",
        content: "Lifetime stats, achievements and your most recent 20 alternate-history seasons.",
      },
    ],
  }),
  component: Career,
});

function Career() {
  const { save, shinyDiscovered } = useGame();
  const c = save.career;
  const unlocked = achievements.filter((a) => save.achievements[a.id]).length;

  const stats = [
    ["Seasons", c.seasons],
    ["Titles", c.championships],
    ["Race wins", c.wins],
    ["Podiums", c.podiums],
    ["DNFs", c.dnfs],
    ["Perfect seasons", c.perfects],
    ["Best combo", c.bestCombo],
    ["Shinies", Math.max(c.shinies, shinyDiscovered)],
  ] as const;

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
      <div className="grid gap-5 py-2 pb-10">
        <div>
          <div className="kicker">Career</div>
          <h1 className="mt-1 text-[clamp(2rem,9vw,3.4rem)] leading-[0.9]">Your record</h1>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {stats.map(([label, value]) => (
            <div key={label} className="panel px-3 py-3">
              <span className="text-muted-foreground block text-[0.58rem] tracking-[0.14em] uppercase">
                {label}
              </span>
              <b className="font-display tabular text-2xl">{value}</b>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl">Achievements</h2>
            <span className="text-muted-foreground tabular text-sm">
              {unlocked} / {achievements.length}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {achievements.map((a) => {
              const u = save.achievements[a.id];
              const secret = a.secret && !u;
              return (
                <div
                  key={a.id}
                  className={cn(
                    "panel p-3.5",
                    u ? "border-primary/40" : "opacity-55",
                  )}
                >
                  <div className="text-2xl">{secret ? "❓" : a.icon}</div>
                  <b className="font-display mt-1 block text-[0.86rem] leading-tight">
                    {secret ? "Secret Achievement" : a.name}
                  </b>
                  <p
                    className={cn(
                      "text-muted-foreground mt-1 text-[0.74rem] leading-snug",
                      secret && "blur-[3px] select-none",
                    )}
                  >
                    {secret ? "Hidden until unlocked" : a.desc}
                  </p>
                  {u && (
                    <div className="text-primary mt-2 text-[0.62rem] font-black tracking-[0.1em] uppercase">
                      Unlocked{u.detail ? ` · ${u.detail}` : ""}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-xl">Run history</h2>
          <p className="text-muted-foreground text-[0.78rem]">Your most recent 20 seasons.</p>
          <div className="mt-3 grid gap-2">
            {save.runHistory.length === 0 && (
              <div className="panel text-muted-foreground p-5 text-center text-sm">
                Complete a season and it will appear here.
              </div>
            )}
            {save.runHistory.map((r, i) => (
              <div
                key={`${r.date}-${i}`}
                className={cn(
                  "panel grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3 p-3",
                  r.pos === 1 && "border-gold/50 bg-gold/5",
                )}
              >
                <div
                  className={cn(
                    "font-display tabular text-center text-lg",
                    r.pos === 1 ? "text-gold" : "text-muted-foreground",
                  )}
                >
                  {r.pos === 1 ? "🏆" : `P${r.pos}`}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[0.84rem] font-semibold">
                    {(r.driverShiny || r.carShiny) && <span className="text-gold">✦ </span>}
                    {r.driver} {r.driverYear} / {r.car} {r.carYear}
                  </div>
                  <div className="text-muted-foreground tabular truncate text-[0.72rem]">
                    {r.combo}/200 · {r.points} pts
                    {r.paperRank ? ` · Ranked P${r.paperRank} on paper` : ""}
                  </div>
                </div>
                <div className="tabular shrink-0 text-right text-[0.72rem]">
                  <b className="block">
                    {r.wins}W · {r.podiums}P
                  </b>
                  <span className="text-muted-foreground">
                    {r.dnfs} DNF{r.dnfs === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
