"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Onboarding } from "@/components/onboarding";
import { getCurrentProfile, signOut } from "@/lib/supabase/profile";
import { createBrowserClient } from "@/lib/supabase/client";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const supabase = createBrowserClient();
      const { data } = await supabase.auth.getSession();
      const isAuthed = !!data.session;
      setAuthed(isAuthed);
      if (!isAuthed) {
        router.replace("/");
        setLoading(false);
        return;
      }
      const profile = await getCurrentProfile();
      if (profile) {
        router.replace("/dashboard");
        return;
      }
      setLoading(false);
    }
    checkAuth();
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
      onExit={async () => {
        await signOut();
        router.replace("/");
      }}
    />
  );
}
