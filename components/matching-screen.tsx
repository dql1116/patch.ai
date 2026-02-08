"use client";

import { useState, useEffect } from "react";
import type { Project, UserProfile, Team } from "@/lib/types";
import {
  clearMatchPreference,
  getMatchPreferences,
} from "@/lib/store";
import { Sparkles, X } from "lucide-react";

const MATCHING_MESSAGES = [
  "Analyzing your profile...",
  "Scanning available projects...",
  "Evaluating project compatibility...",
  "Finding complementary skill sets...",
  "Calculating match scores...",
  "Assembling your dream project...",
];

interface MatchingScreenProps {
  user: UserProfile;
  onComplete: (team: Team) => void;
  onCancel: () => void;
}

export function MatchingScreen({
  user,
  onComplete,
  onCancel,
}: MatchingScreenProps) {
  const [messageIndex, setMessageIndex] = useState(0);


  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MATCHING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function performMatch() {
      const teamRes = await fetch("/api/teams");
      const teamData = await teamRes.json();
      const existingTeams = (teamData.teams as Team[] | undefined) ?? [];
      const userTeamProjectIds = new Set(
        existingTeams
          .filter((team) => team.members.some((m) => m.id === user.id))
          .map((team) => team.projectId),
      );
      const projectRes = await fetch("/api/projects");
      const projectData = await projectRes.json();
      const projects = (projectData.projects as Project[] | undefined)?.filter(
        (project) => !userTeamProjectIds.has(project.id),
      ) ?? [];
      const preferredProjectIds = getMatchPreferences();
      const preferredProjects = preferredProjectIds
        .map((id) => projects.find((project) => project.id === id))
        .filter(Boolean) as typeof projects;
      const preferredProject = preferredProjects[0] || null;

      try {
        if (projects.length === 0) {
          clearMatchPreference();
          onCancel();
          return;
        }
        const res = await fetch("/api/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            preferredProjectIds,
            userId: user.id,
          }),
        });

        const data = await res.json();
        const project = data.project || preferredProject || projects[0];
        if (!project) {
          // Fallback: use first project
          const fallbackProject = preferredProject || projects[0];
          const fallbackMembers: UserProfile[] = [];
          const fallbackTeam = await fetch("/api/teams", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectId: fallbackProject.id,
              project: fallbackProject,
              members: [user, ...fallbackMembers],
              matchScore: 78,
              matchReason:
                "Your skills complement this project well. This project aligns with your interests.",
            }),
          }).then((r) => r.json());
          clearMatchPreference();
          if (fallbackTeam?.team) {
            onComplete(fallbackTeam.team as Team);
          }
          return;
        }

        const teamMembers = (data.teamMembers || []) as UserProfile[];

        const created = await fetch("/api/teams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: project.id,
            project,
            members: [user, ...teamMembers],
            matchScore: data.matchScore || 85,
            matchReason:
              data.matchReason ||
              "Great match based on your skills and interests!",
          }),
        }).then((r) => r.json());
        clearMatchPreference();
        if (created?.team) {
          onComplete(created.team as Team);
        }
      } catch (err) {
        // Fallback matching
        const projectRes = await fetch("/api/projects");
        const projectData = await projectRes.json();
        const projects = (projectData.projects as Project[] | undefined)?.filter(
          (project) => !userTeamProjectIds.has(project.id),
        ) ?? [];
        if (projects.length === 0) {
          clearMatchPreference();
          onCancel();
          return;
        }
        const fallbackProject = preferredProject || projects[0];
        const fallbackMembers: UserProfile[] = [];
        const created = await fetch("/api/teams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: fallbackProject.id,
            project: fallbackProject,
            members: [user, ...fallbackMembers],
            matchScore: 82,
            matchReason:
              "Based on your profile, this project is a great fit for your skills and work style.",
          }),
        }).then((r) => r.json());
        clearMatchPreference();
        if (created?.team) {
          onComplete(created.team as Team);
        }
      }
    }

    // Add a minimum delay so the loading animation is visible
    const timer = setTimeout(performMatch, 3000);
    return () => clearTimeout(timer);
  }, [user, onComplete]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <button
        type="button"
        onClick={() => {
          clearMatchPreference();
          onCancel();
        }}
        className="absolute right-4 top-4 rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        aria-label="Cancel matching"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="text-center">
        {/* Animated matching orb */}
        <div className="relative mx-auto mb-8 h-32 w-32">
          <div className="absolute inset-0 rounded-full bg-primary/20" style={{ animation: "pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
          <div className="absolute inset-3 rounded-full bg-primary/30" style={{ animation: "pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite 0.3s" }} />
          <div className="absolute inset-6 rounded-full bg-primary/40" style={{ animation: "pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite 0.6s" }} />
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ animation: "float 3s ease-in-out infinite" }}
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary shadow-lg">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
        </div>

        <h2 className="font-display text-2xl font-bold text-foreground">
          Finding Your Perfect Project
        </h2>

        <p className="mt-3 text-muted-foreground transition-all duration-500">
          {MATCHING_MESSAGES[messageIndex]}
        </p>

        {/* Progress dots */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-primary"
              style={{
                animation: "float 1.5s ease-in-out infinite",
                animationDelay: `${i * 0.2}s`,
                opacity: 0.4 + i * 0.3,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
