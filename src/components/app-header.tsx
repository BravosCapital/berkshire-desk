import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, FileDown, Moon, Sun } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
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
  { to: "/data", label: "Data" },
  { to: "/methodology", label: "Method" },
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

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex min-w-0 shrink-0 items-baseline gap-2.5">
          <span className="font-display text-lg font-medium tracking-tight sm:text-xl">
            Berkshire Desk
          </span>
          <span className="hidden truncate text-xs text-muted lg:inline">
            Research for BRK.A / BRK.B
          </span>
        </Link>

        <nav
          className="hidden min-w-0 flex-1 items-center gap-0.5 overflow-x-auto md:flex"
          aria-label="Primary"
        >
          {NAV.map((item) => (
            <NavLink key={item.to} item={item} active={pathname === item.to} />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
          <p className="hidden text-right text-kicker leading-snug text-faint xl:block">
            13F {formatDateLabel(filed13)}
            <span className="mx-1.5 text-border-strong">·</span>
            10-Q {formatDateLabel(period10)}
            {pricesAt ? (
              <>
                <span className="mx-1.5 text-border-strong">·</span>
                Prices {new Date(pricesAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              </>
            ) : null}
          </p>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMethodologyOpen(true)}
            className="hidden sm:inline-flex"
            aria-label="Methodology"
          >
            <BookOpen />
          </Button>
          {onExport ? (
            <>
              <Button variant="secondary" size="sm" onClick={onExport} className="hidden sm:inline-flex">
                <FileDown />
                Export
              </Button>
              <Button variant="ghost" size="icon" onClick={onExport} className="sm:hidden" aria-label="Export snapshot">
                <FileDown />
              </Button>
            </>
          ) : null}
          {isPending ? null : user ? (
            <SignedIn>
              <UserButton />
            </SignedIn>
          ) : null}
        </div>
      </div>
      <nav
        className="border-t border-border md:hidden"
        aria-label="Sections"
      >
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 py-1.5">
          {NAV.map((item) => (
            <NavLink key={item.to} item={item} active={pathname === item.to} />
          ))}
        </div>
      </nav>
    </header>
  );
}

function NavLink({
  item,
  active,
}: {
  item: (typeof NAV)[number];
  active: boolean;
}) {
  return (
    <Link
      to={item.to}
      aria-current={active ? "page" : undefined}
      className={cn(
        "shrink-0 rounded-sm px-2.5 py-1.5 text-sm transition-colors",
        active ? "bg-surface-2 text-fg" : "text-muted hover:bg-surface-2 hover:text-fg",
      )}
    >
      {item.label}
    </Link>
  );
}
