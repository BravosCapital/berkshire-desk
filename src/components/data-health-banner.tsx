import { Link } from "@tanstack/react-router";
import type { DeskHealth } from "@/lib/data-health";
import { formatDateLabel } from "@/lib/valuation/format";
import { cn } from "@/lib/utils";

export function DataHealthBanner({ health }: { health: DeskHealth }) {
  if (!health.degraded) return null;

  const q = health.quotes;
  const critical = q.mode === "seed";

  return (
    <div
      role="status"
      className={cn(
        "border-b px-4 py-2.5 text-sm sm:px-6",
        critical
          ? "border-warn/40 bg-warn-dim text-warn"
          : "border-border bg-surface-2 text-muted",
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-baseline justify-between gap-2">
        <p className="leading-relaxed">
          <span className="font-medium text-fg">Data status · </span>
          {health.summary}
          {q.mode !== "live" ? (
            <>
              . Seed table dated{" "}
              <span className="font-mono tabular text-fg">
                {formatDateLabel(q.fallbackAsOf)}
              </span>
              . IV and portfolio weights use these marks until the live feed recovers.
            </>
          ) : null}
        </p>
        <Link
          to="/data"
          className="shrink-0 text-xs font-medium text-fg underline-offset-2 hover:underline"
        >
          Sources →
        </Link>
      </div>
    </div>
  );
}
