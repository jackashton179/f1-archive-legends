import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/game/AppShell";
import { GameButton } from "@/components/game/GameButton";
import { cardId, cars, drivers } from "@/game/engine";
import { useGame } from "@/game/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/archive")({
  head: () => ({
    meta: [
      { title: "The Formula Archive — Collection" },
      {
        name: "description",
        content:
          "Browse every discovered driver and car season card, hunt shiny variants and track your collection progress.",
      },
      { property: "og:title", content: "The Formula Archive — Collection" },
      {
        property: "og:description",
        content: "Every driver and car season card you have discovered, plus shiny variants.",
      },
    ],
  }),
  component: Archive,
});

type Filter = "all" | "driver" | "car" | "found" | "missing" | "shiny";

const ALL_CARDS = [
  ...drivers.map((x) => ({ ...x, t: "driver" as const })),
  ...cars.map((x) => ({ ...x, t: "car" as const })),
].sort((a, b) => a.year - b.year || a.name.localeCompare(b.name));

function Archive() {
  const { save, discovered, shinyDiscovered } = useGame();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const sets = useMemo(
    () => ({
      d: new Set(save.collection.d),
      c: new Set(save.collection.c),
      sd: new Set(save.collection.sd),
      sc: new Set(save.collection.sc),
    }),
    [save.collection],
  );

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_CARDS.filter((x) => {
      const key = cardId(x);
      const owned = x.t === "driver" ? sets.d.has(key) : sets.c.has(key);
      const shiny = x.t === "driver" ? sets.sd.has(key) : sets.sc.has(key);
      if (filter === "driver" && x.t !== "driver") return false;
      if (filter === "car" && x.t !== "car") return false;
      if (filter === "found" && !owned) return false;
      if (filter === "missing" && owned) return false;
      if (filter === "shiny" && !shiny) return false;
      if (q) {
        if (!owned) return false;
        if (!`${x.name} ${x.year}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [query, filter, sets]);

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "driver", label: "Drivers" },
    { id: "car", label: "Cars" },
    { id: "found", label: "Found" },
    { id: "missing", label: "Missing" },
    { id: "shiny", label: "Shiny" },
  ];

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
      <div className="grid gap-4 py-2 pb-10">
        <div>
          <div className="kicker">Collection</div>
          <h1 className="mt-1 text-[clamp(2rem,9vw,3.4rem)] leading-[0.9]">The Archive</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            <b className="text-foreground tabular">{discovered}</b> / {ALL_CARDS.length} discovered ·{" "}
            <b className="text-gold tabular">✦ {shinyDiscovered}</b> shiny
          </p>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search discovered cards…"
          className="border-border bg-surface-2 placeholder:text-muted-foreground/70 focus:border-primary h-12 w-full rounded-xl border px-4 text-base outline-none"
        />

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "font-display shrink-0 rounded-full border px-3.5 py-2 text-[0.7rem] tracking-[0.08em] uppercase",
                filter === f.id
                  ? "border-primary bg-primary/15 text-foreground"
                  : "border-border text-muted-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {list.slice(0, 600).map((x) => {
            const key = cardId(x);
            const owned = x.t === "driver" ? sets.d.has(key) : sets.c.has(key);
            const shiny = x.t === "driver" ? sets.sd.has(key) : sets.sc.has(key);
            return (
              <div
                key={`${x.t}-${key}`}
                className={cn(
                  "panel relative p-3",
                  shiny && "holo",
                  !owned && "opacity-45 grayscale",
                )}
              >
                <div className="relative z-10">
                  <div className="text-muted-foreground text-[0.58rem] tracking-[0.14em] uppercase">
                    {x.t === "driver" ? "Driver" : "Car"}
                  </div>
                  <b className="mt-0.5 block truncate text-[0.86rem]">{owned ? x.name : "???"}</b>
                  <div className="text-muted-foreground tabular mt-0.5 text-[0.72rem]">
                    {owned ? `${x.year} · ${x.overall} OVR` : "Undiscovered"}
                  </div>
                  {shiny && (
                    <div className="text-gold mt-1 text-[0.62rem] font-black tracking-[0.1em]">
                      ✦ SHINY
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {list.length > 600 && (
          <p className="text-muted-foreground text-center text-[0.75rem]">
            Showing the first 600 of {list.length} — refine your search to see more.
          </p>
        )}
        {list.length === 0 && (
          <p className="text-muted-foreground py-10 text-center text-sm">Nothing matches yet.</p>
        )}
      </div>
    </AppShell>
  );
}
