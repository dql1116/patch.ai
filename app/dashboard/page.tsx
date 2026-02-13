"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { UserProfile } from "@/lib/types";
import { Dashboard } from "@/components/dashboard";
import { createBrowserClient } from "@/lib/supabase/client";
import { getCurrentProfile, signOut } from "@/lib/supabase/profile";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState<boolean | null>(null);

  const refreshUser = useCallback(() => {
    async function run() {
      const supabase = createBrowserClient();
      const { data } = await supabase.auth.getSession();
      const isAuthed = !!data.session;
      setAuthed(isAuthed);
      if (!isAuthed) {
        router.replace("/");
        setLoading(false);
        return;
      }
      const stored = await getCurrentProfile();
      if (stored) {
        setUser(stored);
      } else {
        router.replace("/onboarding");
      }
      setLoading(false);
    }
    run();
  }, [router]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        refreshUser();
      }
    }
    window.addEventListener("focus", refreshUser);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", refreshUser);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [refreshUser]);

  if (loading || authed === null || authed === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Dashboard
      user={user}
      onLogout={async () => {
        await signOut();
        setUser(null);
        router.replace("/");
      }}
    />
  );
}
