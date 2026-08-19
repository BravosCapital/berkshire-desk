import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTrackerStore } from "@/lib/store";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const theme = useTrackerStore((s) => s.theme);
  const toggleTheme = useTrackerStore((s) => s.toggleTheme);

  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-6 text-fg">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link to="/" className="font-display text-xl font-medium tracking-tight">
              Berkshire Desk
            </Link>
            <h1 className="mt-4 font-display text-2xl font-medium tracking-tight">Sign in</h1>
            <p className="mt-1 text-sm text-muted">
              Optional. The desk is public; sign in to keep a session on this device.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>
        </div>
        {authEnabled ? (
          <div className="space-y-2">
            {GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => signIn(p.providerId, { callbackURL: "/" })}
              >
                Continue with {p.label}
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">Sign-in is disabled.</p>
        )}
        <Link to="/" className="block text-sm text-muted hover:text-fg">
          Back to the desk
        </Link>
      </div>
    </main>
  );
}
