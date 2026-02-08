"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearAuth, clearUser, getCurrentUser, isAuthenticated } from "@/lib/store";
import { Onboarding } from "@/components/onboarding";
import { Dashboard } from "@/components/dashboard";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const isAuthed = isAuthenticated();
    setAuthed(isAuthed);
    if (!isAuthed) {
      router.replace("/");
      setLoading(false);
      return;
    }
    const stored = getCurrentUser();
    if (stored) {
      router.replace("/dashboard");
      return;
    }
    setLoading(false);
  }, [router]);

  if (loading || authed === null || authed === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <Onboarding
      onComplete={() => {
        router.replace("/dashboard");
      }}
      onExit={() => {
        clearUser();
        clearAuth();
        router.replace("/");
      }}
    />
  );
}
