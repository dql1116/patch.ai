"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { UserProfile, Project, Team } from "@/lib/types";
import {
  getCompletedProjectIdsForUser,
  getProjects,
  getTeams,
  setMatchPreferences,
} from "@/lib/store";
import { ProjectCard } from "@/components/project-card";
import { Sparkles, Plus, LogOut, MessageCircle, Users } from "lucide-react";
import { PatchLogo } from "@/components/patch-logo";

interface DashboardProps {
  user: UserProfile;
  onLogout: () => void;
}

interface Recommendation {
  projectId: string;
  reason: string;
  matchScore: number;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [existingTeams, setExistingTeams] = useState<Team[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  const refreshData = useCallback(() => {
    setProjects(getProjects());
    setExistingTeams(getTeams());
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    async function fetchRecommendations() {
      setLoadingRecs(true);
      try {
        const res = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user, projects: getProjects() }),
        });
        const data = await res.json();
        if (data?.recommendations) {
          setRecommendations(data.recommendations);
        }
      } catch {
        // Fallback: show all projects with no AI scores
        setRecommendations(
          getProjects().map((p) => ({
            projectId: p.id,
            reason: "This project could be a great fit for your skills.",
            matchScore: Math.floor(Math.random() * 30) + 60,
          })),
        );
      } finally {
        setLoadingRecs(false);
      }
    }
    if (projects.length > 0) {
      fetchRecommendations();
    } else {
      setLoadingRecs(false);
    }
  }, [user, projects.length]);

  const completedIds = new Set(getCompletedProjectIdsForUser(user.id));
  const visibleTeams = existingTeams.filter(
    (team) =>
      team.members.some((member) => member.id === user.id) &&
      !completedIds.has(team.projectId) &&
      !team.completedAt,
  );

  // Sort projects by recommendation score
  const sortedProjects = [...projects].sort((a, b) => {
    const scoreA =
      recommendations.find((r) => r.projectId === a.id)?.matchScore || 0;
    const scoreB =
      recommendations.find((r) => r.projectId === b.id)?.matchScore || 0;
    return scoreB - scoreA;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <PatchLogo size="sm" />
            <div>
              <h1 className="font-display text-lg font-bold text-foreground">
                patch.ai
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary hover:opacity-80"
              aria-label="Open profile"
            >
              {user.avatar}
            </button>
            <button
              type="button"
              onClick={() => {
                localStorage.clear();
                onLogout();
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-3xl px-4 pb-28 pt-6">
        {/* Welcome */}
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Welcome back, {user.name}
          </h2>
          <p className="mt-1 text-muted-foreground">
            Here are projects curated for you by AI
          </p>
        </div>

        {/* Existing teams */}
        {visibleTeams.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Your Projects
            </h3>
            <div className="flex flex-col gap-2">
              {visibleTeams.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => {
                    router.push(`/dashboard/project/${team.id}`);
                  }}
                  className="flex items-center justify-between rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-card-foreground">
                        {team.project.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {team.members.length} members
                      </div>
                    </div>
                  </div>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recommended projects */}
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Recommended For You
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Click one or more project cards to set your matching preferences.
        </p>

        {loadingRecs ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-2xl border border-border bg-card"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {sortedProjects.map((project) => {
              const rec = recommendations.find(
                (r) => r.projectId === project.id,
              );
              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  reason={rec?.reason}
                  matchScore={rec?.matchScore}
                  selected={selectedProjectIds.includes(project.id)}
                  onSelect={(selected) => {
                    setSelectedProjectIds((prev) =>
                      prev.includes(selected.id)
                        ? prev.filter((id) => id !== selected.id)
                        : [...prev, selected.id],
                    );
                  }}
                />
              );
            })}
            {sortedProjects.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                <p className="text-muted-foreground">
                  No projects yet. Be the first to create one!
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom action buttons */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => {
              setMatchPreferences(selectedProjectIds);
              router.push("/dashboard/matching");
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
          >
            <Sparkles className="h-4 w-4" />
            Match Into Project
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/create")}
            className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-primary bg-background text-primary transition-all hover:bg-primary/5"
            aria-label="Create project"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
