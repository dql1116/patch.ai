"use client";

import { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/store";
import type { UserProfile } from "@/lib/types";
import { Onboarding } from "@/components/onboarding";
import { Dashboard } from "@/components/dashboard";

export default function Page() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getCurrentUser();
    if (stored) {
      setUser(stored);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <Onboarding
        onComplete={() => {
          setUser(getCurrentUser());
        }}
      />
    );
  }

  return <Dashboard user={user} onLogout={() => setUser(null)} />;
}
