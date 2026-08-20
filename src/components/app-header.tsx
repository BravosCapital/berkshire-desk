import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, FileDown, Moon, Sun } from "lucide-react";
import { SignedIn, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { DeskLogo } from "@/components/desk-logo";
import { useTrackerStore } from "@/lib/store";
import { useFilingsSnapshot } from "@/lib/use-valuation";
import { FILING } from "@/lib/valuation/quarterly";
import { formatDateLabel } from "@/lib/valuation/format";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Overview" },
  { to: "/equities", label: "Equities" },
  { to: "/businesses", label: "Businesses" },
  { to: "/charts", label: "Charts" },
  { to: "/capital", label: "Capital" },
  { to: "/data", label: "Sources" },
  { to: "/methodology", label: "Letters" },
] as const;

export function AppHeader({
  onExport,
  pricesAt,
}: {
  onExport?: () => void;
  pricesAt: string | null;
}) {
  const { user, isPending } = useCurrentUserState();
  const setMethodologyOpen = useTrackerStore((s) => s.setMethodologyOpen);
  const theme = useTrackerStore((s) => s.theme);
  const toggleTheme = useTrackerStore((s) => s.toggleTheme);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const filings = useFilingsSnapshot();
  const filed13 = filings.data?.thirteenF?.filed ?? FILING.thirteenFFiled;
  const period10 = filings.data?.tenQ?.periodEnd ?? FILING.periodEnd;
  const source = filings.data?.source ?? "seed";
  const sourceLabel =
    source === "edgar" ? "EDGAR" : source === "cache" ? "Cache" : "Seed";
  const sourceTone =
    source === "edgar" || source === "cache"
      ? "text-gain"
      : "text-warn";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3">
        <Link
          to="/"
          className="flex min-w-0 shrink-0 items-center gap-2.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <DeskLogo className="size-8 shrink-0 sm:size-9" />
          <span className="min-w-0">
            <span className="block font-display text-base font-medium leading-tight tracking-tight sm:text-lg">
              Berkshire Desk
            </span>
            <span className="hidden text-[11px] leading-none text-muted xl:block">
              Research for BRK.A / BRK.B
            </span>
          </span>
        </Link>

        <nav
          className="ml-1 hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex"
          aria-label="Primary"
        >
          {NAV.map((item) => (
            <NavLink key={item.to} item={item} active={pathname === item.to} />
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
          <p className="mr-1 hidden text-right text-[10px] leading-snug text-faint 2xl:block">
            <span className="block">
              13F {formatDateLabel(filed13)}
              <span className={cn("ml-1.5 font-medium", sourceTone)}>{sourceLabel}</span>
            </span>
            <span className="block">
              10-Q {formatDateLabel(period10)}
              {pricesAt ? (
                <>
                  {" · "}
                  {new Date(pricesAt).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </>
              ) : null}
            </span>
          </p>
          <span
            className={cn(
              "mr-0.5 hidden rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide sm:inline-block 2xl:hidden",
              source === "seed"
                ? "bg-warn-dim text-warn"
                : "bg-gain-dim text-gain",
            )}
            title={`Filings source: ${sourceLabel}`}
          >
            {sourceLabel}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-9"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden size-9 sm:inline-flex"
            onClick={() => setMethodologyOpen(true)}
            aria-label="Letters & Lessons"
          >
            <BookOpen />
          </Button>
          {onExport ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={onExport}
                className="hidden h-9 sm:inline-flex"
              >
                <FileDown />
                Export
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-9 sm:hidden"
                onClick={onExport}
                aria-label="Export snapshot"
              >
                <FileDown />
              </Button>
            </>
          ) : null}
          {!isPending && user ? (
            <SignedIn>
              <UserButton />
            </SignedIn>
          ) : null}
        </div>
      </div>

      {/* Mobile nav — larger touch targets, stronger active state */}
      <nav className="border-t border-border lg:hidden" aria-label="Sections">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-2 py-2 sm:px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV.map((item) => (
            <NavLink key={item.to} item={item} active={pathname === item.to} mobile />
          ))}
        </div>
      </nav>
    </header>
  );
}

function NavLink({
  item,
  active,
  mobile = false,
}: {
  item: (typeof NAV)[number];
  active: boolean;
  mobile?: boolean;
}) {
  return (
    <Link
      to={item.to}
      aria-current={active ? "page" : undefined}
      className={cn(
        "shrink-0 rounded-md text-sm transition-colors",
        mobile
          ? "px-3 py-2 min-h-[40px] flex items-center"
          : "px-2.5 py-1.5",
        active
          ? "bg-surface-2 font-medium text-fg shadow-[var(--shadow-border)]"
          : "text-muted hover:bg-surface-2/70 hover:text-fg",
      )}
    >
      {item.label}
    </Link>
  );
}
