import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTrackerStore } from "@/lib/store";
import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

export function MethodologyDialog() {
  const open = useTrackerStore((s) => s.methodologyOpen);
  const setOpen = useTrackerStore((s) => s.setMethodologyOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Letters & Lessons</DialogTitle>
          <DialogDescription>
            Independent, unofficial two-column estimate. Not affiliated with Berkshire Hathaway
            Inc. Not investment advice. Framing follows ideas in the public letters.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 overflow-y-auto px-6 py-5 text-sm leading-relaxed text-muted">
          <section>
            <h3 className="mb-1 font-medium text-fg">The identity</h3>
            <p>
              Intrinsic value = investments at market + equity value of wholly-owned businesses
              (capitalized after-interest earnings) + insurance underwriting franchise − parent
              bonds only. Float and deferred tax are not deducted.
            </p>
          </section>
          <section>
            <h3 className="mb-1 font-medium text-fg">Why float is not subtracted</h3>
            <p>
              Insurance float is a revolving fund. When underwriting is profitable it is cost-free
              (or better). Treating it as a conventional liability double-counts the capital
              structure that already appears in the investment column.
            </p>
          </section>
          <section>
            <h3 className="mb-1 font-medium text-fg">Primary sources</h3>
            <p>
              The annual letters and Owner’s Manual remain the authoritative statements of how
              Berkshire thinks about value. This desk is a live application of those ideas, not a
              substitute for them.
            </p>
          </section>
          <div className="flex flex-wrap gap-4 pt-1">
            <Link
              to="/methodology"
              className="text-fg underline-offset-2 hover:underline"
              onClick={() => setOpen(false)}
            >
              Letters & Lessons →
            </Link>
            <Link
              to="/data"
              className="text-fg underline-offset-2 hover:underline"
              onClick={() => setOpen(false)}
            >
              Sources →
            </Link>
            <a
              href="https://www.berkshirehathaway.com/letters/letters.html"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-fg underline-offset-2 hover:underline"
            >
              All letters <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
