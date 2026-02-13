"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PatchLogo } from "@/components/patch-logo";
import { createBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createBrowserClient();

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace("/dashboard");
      }
    }
    checkSession();
  }, [router]);

  const canContinue =
    email.trim().includes("@") && password.trim().length >= 6;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canContinue) return;
    setError(null);
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.replace("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <PatchLogo size="md" className="mx-auto mb-4" />
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            patch.ai
          </h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to continue
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold text-card-foreground">
            Welcome back
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Use email/password or sign in with OAuth
          </p>

          <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 chars)"
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              disabled={!canContinue || loading}
              className={
                canContinue && !loading
                  ? "mt-2 w-full rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
                  : "mt-2 w-full rounded-lg bg-muted px-6 py-2.5 text-sm font-medium text-muted-foreground"
              }
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
            <button
              type="button"
              disabled={!canContinue || loading}
              onClick={async () => {
                setError(null);
                setLoading(true);
                const { error: signUpError } = await supabase.auth.signUp({
                  email: email.trim(),
                  password: password.trim(),
                });
                setLoading(false);
                if (signUpError) {
                  setError(signUpError.message);
                  return;
                }
                router.replace("/onboarding");
              }}
              className={
                canContinue && !loading
                  ? "w-full rounded-lg border border-border bg-background px-6 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-secondary"
                  : "w-full rounded-lg border border-border bg-background px-6 py-2.5 text-sm font-medium text-muted-foreground"
              }
            >
              Create account
            </button>
            <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              or
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={async () => {
                  setError(null);
                  await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                      redirectTo: `${window.location.origin}/auth/callback`,
                    },
                  });
                }}
                className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-secondary"
              >
                Continue with Google
              </button>
              <button
                type="button"
                onClick={async () => {
                  setError(null);
                  await supabase.auth.signInWithOAuth({
                    provider: "github",
                    options: {
                      redirectTo: `${window.location.origin}/auth/callback`,
                    },
                  });
                }}
                className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-secondary"
              >
                Continue with GitHub
              </button>
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
