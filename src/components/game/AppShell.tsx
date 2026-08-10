import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function AppShell({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <header className="safe-top sticky top-0 z-30 border-b border-white/5 bg-background/85 backdrop-blur-md">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
          <Link to="/" className="min-w-0">
            <div className="font-display truncate text-[0.95rem] leading-none font-black tracking-[0.14em] uppercase">
              Formula<span className="text-primary"> Archive</span>
            </div>
            <div className="text-muted-foreground mt-1 truncate text-[0.68rem] tracking-[0.18em] uppercase">
              Alternate history simulator
            </div>
          </Link>
          <div className="shrink-0">{action}</div>
        </div>
        <div className="via-primary/60 h-px bg-gradient-to-r from-transparent to-transparent" />
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-5 safe-bottom">{children}</main>
    </div>
  );
}
