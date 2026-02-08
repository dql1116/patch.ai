"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Industry, Role, ExperienceLevel, WorkEthic, Team, UserProfile } from "@/lib/types";
import {
  clearAuth,
  clearUser,
  completeTeamProject,
  getCompletedProjectIdsForUser,
  getCurrentUser,
  getTeams,
  isAuthenticated,
} from "@/lib/store";
import { ArrowLeft, CheckCircle2, LogOut } from "lucide-react";

const ROLE_LABELS: Record<Role, string> = {
  swe: "Software Engineer",
  pm: "Product Manager",
  designer: "Designer",
};

const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  junior: "Beginner",
  mid: "Intermediate",
  senior: "Advanced",
};

const WORK_ETHIC_LABELS: Record<WorkEthic, string> = {
  async: "Async-First",
  collaborative: "Collaborative",
  structured: "Structured",
  flexible: "Flexible",
};

const INDUSTRY_LABELS: Record<Industry, string> = {
  fintech: "Fintech",
  healthtech: "Health Tech",
  edtech: "Education",
  ecommerce: "E-Commerce",
  social: "Social",
  "ai-ml": "AI / ML",
  gaming: "Gaming",
  sustainability: "Sustainability",
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
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
    setTeams(getTeams());
    setLoading(false);
  }, [router]);

  const completedProjectIds = useMemo(() => {
    if (!user) return [];
    return getCompletedProjectIdsForUser(user.id);
  }, [user, teams]);

  const ongoingTeams = useMemo(() => {
    if (!user) return [];
    const completed = new Set(completedProjectIds);
    return teams.filter(
      (team) =>
        team.members.some((member) => member.id === user.id) &&
        !completed.has(team.projectId) &&
        !team.completedAt,
    );
  }, [teams, user, completedProjectIds]);

  const completedTeams = useMemo(() => {
    if (!user) return [];
    return teams.filter(
      (team) =>
        team.members.some((member) => member.id === user.id) &&
        !!team.completedAt,
    );
  }, [teams, user]);

  function handleComplete(teamId: string) {
    if (!user) return;
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;
    if (team.project.createdBy !== user.id) return;
    if (team.completedAt) return;
    completeTeamProject(teamId, user.id);
    setTeams(getTeams());
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-foreground hover:bg-secondary"
            >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {user.avatar}
            </div>
            <button
              type="button"
              onClick={() => {
                clearUser();
                clearAuth();
                router.replace("/");
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-20 pt-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Profile
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Completed projects:{" "}
                <span className="font-semibold text-foreground">
                  {completedProjectIds.length}
                </span>
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">
              {user.avatar}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Name
              </div>
              <div className="mt-1 text-foreground">{user.name}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email
              </div>
              <div className="mt-1 text-foreground">{user.email}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Role
              </div>
              <div className="mt-1 text-foreground">
                {ROLE_LABELS[user.role]}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Experience
              </div>
              <div className="mt-1 text-foreground">
                {EXPERIENCE_LABELS[user.experience]}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Work Style
              </div>
              <div className="mt-1 text-foreground">
                {WORK_ETHIC_LABELS[user.workEthic]}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Industries
              </div>
              <div className="mt-1 text-foreground">
                {user.industries.map((i) => INDUSTRY_LABELS[i]).join(", ")}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Ongoing Projects
          </h2>
          <div className="flex flex-col gap-3">
            {ongoingTeams.map((team) => (
              <div
                key={team.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium text-card-foreground">
                      {team.project.title}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {team.project.description}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleComplete(team.id)}
                    disabled={team.project.createdBy !== user.id}
                    className={
                      team.project.createdBy === user.id
                        ? "flex shrink-0 items-center gap-2 rounded-lg border border-primary px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5"
                        : "flex shrink-0 items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground"
                    }
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Complete
                  </button>
                </div>
                {team.project.createdBy !== user.id && (
                  <div className="mt-2 text-xs font-semibold text-amber-600">
                    Only the project creator can complete this project.
                  </div>
                )}
              </div>
            ))}
            {ongoingTeams.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
                No ongoing projects yet. Join a project to get started.
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Past Projects
          </h2>
          <div className="flex flex-col gap-3">
            {completedTeams.map((team) => (
              <div
                key={team.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium text-card-foreground">
                      {team.project.title}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {team.project.description}
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-emerald-600">
                    Completed
                  </div>
                </div>
              </div>
            ))}
            {completedTeams.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
                No completed projects yet.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
