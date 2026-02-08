"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, setAuthEmail, setAuthenticated } from "@/lib/store";
import { Users } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/onboarding");
    }
  }, [router]);

  const canContinue =
    email.trim().includes("@") && password.trim().length >= 6;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canContinue) return;
    setAuthEmail(email.trim());
    setAuthenticated(true);
    router.replace("/onboarding");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <Users className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            patch.ai
          </h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to continue to onboarding
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold text-card-foreground">
            Welcome back
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This is a demo login screen
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
              disabled={!canContinue}
              className={
                canContinue
                  ? "mt-2 w-full rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
                  : "mt-2 w-full rounded-lg bg-muted px-6 py-2.5 text-sm font-medium text-muted-foreground"
              }
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
