"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserProfile, Team } from "@/lib/types";
import { MatchingScreen } from "@/components/matching-screen";
import { createBrowserClient } from "@/lib/supabase/client";
import { getCurrentProfile } from "@/lib/supabase/profile";

export default function MatchingPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createBrowserClient();
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/");
        return;
      }
      const stored = await getCurrentProfile();
      if (!stored) {
        router.replace("/onboarding");
        return;
      }
      setUser(stored);
      setLoading(false);
    }
    load();
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
