"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Team, UserProfile } from "@/lib/types";
import { TeamChat } from "@/components/team-chat";
import { createBrowserClient } from "@/lib/supabase/client";
import { getCurrentProfile } from "@/lib/supabase/profile";

export default function TeamChatPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const teamId = params?.id;
  const [team, setTeam] = useState<Team | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createBrowserClient();
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace("/");
        return;
      }
      const stored = await getCurrentProfile();
      if (!stored) {
        router.replace("/onboarding");
        return;
      }
      if (!teamId) {
        router.replace("/dashboard");
        return;
      }
      const res = await fetch(`/api/teams/${teamId}`);
      const teamData = await res.json();
      const found = teamData?.team as Team | undefined;
      if (!found) {
        router.replace("/dashboard");
        return;
      }
      setUser(stored);
      setTeam(found);
      setLoading(false);
    }
    load();
  }, [router, teamId]);

  if (loading || !team || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <TeamChat
      team={team}
      currentUser={user}
      onBack={() => router.push(`/dashboard/project/${team.id}`)}
    />
  );
}
