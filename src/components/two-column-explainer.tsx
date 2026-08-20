import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const STORAGE_KEY = "brk-two-column-seen";

export function TwoColumnExplainer() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
      }
    } catch {
      // ignore
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <section className="relative overflow-hidden rounded-xl border border-border bg-surface-2 p-5 sm:p-6 print:hidden">
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-3 top-3 rounded-md p-1.5 text-faint transition-colors hover:bg-surface-3 hover:text-fg"
        aria-label="Dismiss"
      >
        <X className="size-4" />
      </button>

      <p className="text-kicker uppercase text-faint">How to read this desk</p>
      <h2 className="mt-1 font-display text-xl font-medium tracking-tight">
        Berkshire in two columns
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        Buffett has described Berkshire this way for decades. Column one is investments at market.
        Column two is the equity value of the wholly-owned businesses. This desk keeps that framing
        live.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)]">
          <p className="text-kicker uppercase text-faint">Column one</p>
          <p className="mt-1 text-sm font-medium text-fg">Investments</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Cash, T-bills, public equities (13F + Japan), bonds, preferreds, warrants — marked at
            market.
          </p>
        </div>
        <div className="rounded-lg bg-surface px-4 py-3 shadow-[var(--shadow-border)]">
          <p className="text-kicker uppercase text-faint">Column two</p>
          <p className="mt-1 text-sm font-medium text-fg">Operating businesses</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            BNSF, BHE, Manufacturing / Service / Retailing and the insurance underwriting franchise,
            capitalized at your multiples.
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted">
        Only parent-level bonds are subtracted. Float and deferred tax are not — they already fund
        or sit inside the columns above. Press{" "}
        <kbd className="rounded-xs bg-surface px-1.5 py-0.5 font-mono text-kicker">M</kbd> anytime
        for Letters & Lessons.
      </p>

      <div className="mt-4">
        <Button variant="secondary" size="sm" onClick={dismiss}>
          Got it
        </Button>
      </div>
    </section>
  );
}
