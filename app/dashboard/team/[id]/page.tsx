"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Team, UserProfile } from "@/lib/types";
import { getCurrentUser, getTeamById, isAuthenticated } from "@/lib/store";
import { TeamView } from "@/components/team-view";

export default function TeamPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const teamId = params?.id;
  const [team, setTeam] = useState<Team | null>(null);
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
    if (!teamId) {
      router.replace("/dashboard");
      return;
    }
    const found = getTeamById(teamId);
    if (!found) {
      router.replace("/dashboard");
      return;
    }
    setUser(stored);
    setTeam(found);
    setLoading(false);
  }, [router, teamId]);

  if (loading || !team || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <TeamView
      team={team}
      currentUser={user}
      onChat={() => router.push(`/dashboard/team/${team.id}/chat`)}
      onBack={() => router.push("/dashboard")}
    />
  );
}
