"use client";

import React from "react"

import type { Team, UserProfile } from "@/lib/types";
import {
  ArrowLeft,
  MessageCircle,
  Trophy,
  Code2,
  Briefcase,
  Palette,
  Sparkles,
  Tag,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ROLE_ICONS: Record<string, React.ReactNode> = {
  swe: <Code2 className="h-4 w-4" />,
  pm: <Briefcase className="h-4 w-4" />,
  designer: <Palette className="h-4 w-4" />,
};

const ROLE_LABELS: Record<string, string> = {
  swe: "Software Engineer",
  pm: "Product Manager",
  designer: "Designer",
};

const EXPERIENCE_LABELS: Record<string, string> = {
  junior: "Beginner",
  mid: "Intermediate",
  senior: "Advanced",
};

const AVATAR_COLORS = [
  "bg-primary text-primary-foreground",
  "bg-accent text-accent-foreground",
  "bg-emerald-500 text-white",
  "bg-rose-500 text-white",
  "bg-blue-500 text-white",
];

interface TeamViewProps {
  team: Team;
  currentUser: UserProfile;
  onChat: () => void;
  onBack: () => void;
}

export function TeamView({ team, currentUser, onChat, onBack }: TeamViewProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-lg font-bold text-foreground">
            Your Team
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-28 pt-6">
        {/* Match score banner */}
        <div className="mb-6 rounded-2xl bg-primary p-6 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/20">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm font-medium opacity-80">Match Score</div>
              <div className="font-display text-3xl font-bold">
                {team.matchScore}%
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed opacity-90">
            {team.matchReason}
          </p>
        </div>

        {/* Project details */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Project
          </div>
          <h2 className="mt-2 font-display text-xl font-bold text-card-foreground">
            {team.project.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {team.project.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {team.project.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
              >
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Team members */}
        <div className="mb-6">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <Users className="h-4 w-4" />
            Project Members ({team.members.length})
          </h3>
          <div className="flex flex-col gap-3">
            {team.members.map((member, idx) => (
              <div
                key={member.id}
                className={cn(
                  "flex items-center gap-4 rounded-xl border p-4 transition-all",
                  member.id === currentUser.id
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-card",
                )}
              >
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold",
                    AVATAR_COLORS[idx % AVATAR_COLORS.length],
                  )}
                >
                  {member.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      {member.name}
                    </span>
                    {member.id === currentUser.id && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        You
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      {ROLE_ICONS[member.role]}
                      {ROLE_LABELS[member.role]}
                    </span>
                    <span className="text-border">|</span>
                    <span>{EXPERIENCE_LABELS[member.experience]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-center px-4 py-3">
          <button
            type="button"
            onClick={onChat}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
          >
            <MessageCircle className="h-4 w-4" />
            Open Team Chat
          </button>
        </div>
      </div>
    </div>
  );
}
