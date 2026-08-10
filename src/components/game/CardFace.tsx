import { cn } from "@/lib/utils";
import { band } from "@/game/engine";
import type { Band, Car, Driver } from "@/game/types";

export const bandColor: Record<Band, string> = {
  elite: "text-primary",
  verygood: "text-gold",
  mid: "text-electric",
  weak: "text-muted-foreground",
  disaster: "text-violet",
};

export const bandLabel: Record<Band, string> = {
  elite: "ELITE",
  verygood: "VERY GOOD",
  mid: "MID",
  weak: "WEAK",
  disaster: "DISASTER",
};

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/8 bg-black/25 px-2.5 py-2">
      <span className="text-muted-foreground block text-[0.62rem] tracking-[0.14em] uppercase">
        {label}
      </span>
      <b className="tabular font-display text-lg">{value}</b>
    </div>
  );
}

type Props = {
  kind: "driver" | "car";
  card: Driver | Car;
  shiny: boolean;
  isNew: boolean;
};

export function CardFace({ kind, card, shiny, isNew }: Props) {
  const b = band(card.overall);
  const isDriver = kind === "driver";
  const d = card as Driver;
  const c = card as Car;

  return (
    <div
      key={`${card.name}-${card.year}-${shiny}`}
      className={cn(
        "panel reveal relative p-5",
        shiny && "holo",
      )}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="kicker">{isDriver ? "Driver" : "Constructor"}</div>
            <h2 className="font-display mt-1 text-[clamp(1.6rem,7vw,2.6rem)] leading-[0.95]">
              {card.name}
            </h2>
            <div className="text-muted-foreground tabular font-display text-lg">{card.year}</div>
          </div>
          <div className="shrink-0 text-right">
            {shiny && (
              <span className="from-gold inline-block rounded-full bg-gradient-to-br to-amber-400 px-2.5 py-1 text-[0.62rem] font-black tracking-[0.1em] text-black">
                ✦ SHINY
              </span>
            )}
            <div className="text-muted-foreground mt-1.5 text-[0.66rem] font-bold tracking-[0.14em] uppercase">
              {isNew ? (shiny ? "✨ New shiny" : "✨ New") : "Collected"}
            </div>
            {card.provisional && (
              <div className="text-muted-foreground/70 text-[0.6rem] tracking-[0.1em] uppercase">
                Provisional
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex items-end gap-3">
          <div className={cn("font-display tabular text-[4.4rem] leading-[0.8]", bandColor[b])}>
            {card.overall}
          </div>
          <div className="pb-1.5">
            <div className="text-muted-foreground text-[0.62rem] tracking-[0.18em] uppercase">
              Overall
            </div>
            <b className="font-display text-sm tracking-[0.08em]">
              {isDriver ? bandLabel[b] : "CAR"}
            </b>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {isDriver ? (
            <>
              <Stat label="Pace" value={d.pace} />
              <Stat label="Consist." value={d.consistency} />
              <Stat label="Racecraft" value={d.racecraft} />
            </>
          ) : (
            <>
              <Stat label="Pace" value={c.pace} />
              <Stat label="Reliab." value={c.reliability} />
              <Stat label="Tyres" value={c.tyres} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
