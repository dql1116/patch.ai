"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserProfile } from "@/lib/types";
import { getCurrentUser, isAuthenticated } from "@/lib/store";
import { CreateProject } from "@/components/create-project";

export default function CreateProjectPage() {
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
    <CreateProject
      user={user}
      onCreated={() => router.replace("/dashboard")}
      onCancel={() => router.replace("/dashboard")}
    />
  );
}
