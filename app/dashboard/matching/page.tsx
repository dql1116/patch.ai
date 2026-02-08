"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserProfile, Team } from "@/lib/types";
import { getCurrentUser, isAuthenticated } from "@/lib/store";
import { MatchingScreen } from "@/components/matching-screen";

export default function MatchingPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authed = isAuthenticated();
    if (!authed) {
      router.replace("/");
      return;
    }
    const stored = getCurrentUser();
    if (!stored) {
      router.replace("/onboarding");
      return;
    }
    setUser(stored);
    setLoading(false);
  }, [router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <MatchingScreen
      user={user}
      onComplete={(team: Team) => {
        router.replace(`/dashboard/project/${team.id}`);
      }}
      onCancel={() => router.replace("/dashboard")}
    />
  );
}
