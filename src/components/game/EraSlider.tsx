import { MAX_YEAR, MIN_YEAR, eraCars, eraDrivers } from "@/game/engine";

export function EraSlider({
  min,
  max,
  onChange,
}: {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
}) {
  const span = MAX_YEAR - MIN_YEAR;
  const left = ((min - MIN_YEAR) / span) * 100;
  const right = ((max - MIN_YEAR) / span) * 100;
  const dCount = eraDrivers(min, max).length;
  const cCount = eraCars(min, max).length;

  const setMin = (v: number) => onChange(Math.min(v, max - 1), max);
  const setMax = (v: number) => onChange(min, Math.max(v, min + 1));

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <span className="text-muted-foreground block text-[0.62rem] font-bold tracking-[0.16em] uppercase">
            Earliest
          </span>
          <b className="font-display tabular text-3xl">{min}</b>
        </div>
        <div className="min-w-0 text-right">
          <span className="text-muted-foreground block text-[0.62rem] font-bold tracking-[0.16em] uppercase">
            Latest
          </span>
          <b className="font-display tabular text-3xl">{max}</b>
        </div>
      </div>

      <div className="relative mt-4 h-12 touch-none">
        <div className="absolute top-5 right-0 left-0 h-2 rounded-full bg-white/8" />
        <div
          className="absolute top-5 h-2 rounded-full"
          style={{
            left: `${left}%`,
            width: `${right - left}%`,
            backgroundImage: "var(--gradient-racing)",
          }}
        />
        <input
          className="era-thumb"
          type="range"
          min={MIN_YEAR}
          max={MAX_YEAR}
          value={min}
          aria-label="Earliest season"
          style={{ zIndex: 3 }}
          onChange={(e) => setMin(+e.target.value)}
        />
        <input
          className="era-thumb"
          type="range"
          min={MIN_YEAR}
          max={MAX_YEAR}
          value={max}
          aria-label="Latest season"
          style={{ zIndex: 4 }}
          onChange={(e) => setMax(+e.target.value)}
        />
      </div>

      <p className="text-muted-foreground mt-1 text-center text-[0.78rem]">
        {min === MIN_YEAR && max === MAX_YEAR ? "All-time · " : ""}
        {min}–{max} · {dCount} drivers · {cCount} cars
      </p>
    </div>
  );
}
