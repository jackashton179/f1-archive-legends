import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

const gameButton = cva(
  "font-display inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-black tracking-[0.06em] uppercase transition-all duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-35 select-none min-h-12",
  {
    variants: {
      variant: {
        primary:
          "text-primary-foreground shadow-[var(--shadow-racing)] [background-image:var(--gradient-racing)] hover:brightness-110",
        solid: "bg-secondary text-foreground hover:bg-accent",
        ghost: "border border-border bg-transparent text-foreground hover:bg-white/5",
        gold: "bg-gradient-to-br from-gold to-amber-400 text-black hover:brightness-110",
        green: "bg-gradient-to-br from-emerald-400 to-teal-300 text-black hover:brightness-110",
      },
      size: {
        default: "",
        sm: "min-h-10 px-3.5 py-2.5 text-[0.72rem]",
        block: "w-full",
      },
    },
    defaultVariants: { variant: "solid", size: "default" },
  },
);

export type GameButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof gameButton>;

export function GameButton({ className, variant, size, ...props }: GameButtonProps) {
  return <button className={cn(gameButton({ variant, size }), className)} {...props} />;
}
