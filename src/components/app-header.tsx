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
            <span className="block">13F {formatDateLabel(filed13)}</span>
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
            aria-label="Methodology"
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

      <nav className="border-t border-border lg:hidden" aria-label="Sections">
        <div className="mx-auto flex max-w-7xl gap-0.5 overflow-x-auto px-2 py-1.5 sm:px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
        active ? "bg-surface-2 font-medium text-fg" : "text-muted hover:bg-surface-2 hover:text-fg",
      )}
    >
      {item.label}
    </Link>
  );
}
