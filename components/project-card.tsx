"use client";

import React from "react"

import { cn } from "@/lib/utils";
import type { Project } from "@/lib/types";
import { Code2, Briefcase, Palette, Users, Tag, TrendingUp } from "lucide-react";

const ROLE_ICONS: Record<string, React.ReactNode> = {
  swe: <Code2 className="h-3.5 w-3.5" />,
  pm: <Briefcase className="h-3.5 w-3.5" />,
  designer: <Palette className="h-3.5 w-3.5" />,
};

const ROLE_LABELS: Record<string, string> = {
  swe: "SWE",
  pm: "PM",
  designer: "Designer",
};

const EXPERIENCE_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const INDUSTRY_COLORS: Record<string, string> = {
  fintech: "bg-emerald-100 text-emerald-700",
  healthtech: "bg-rose-100 text-rose-700",
  edtech: "bg-blue-100 text-blue-700",
  ecommerce: "bg-amber-100 text-amber-700",
  social: "bg-pink-100 text-pink-700",
  "ai-ml": "bg-indigo-100 text-indigo-700",
  gaming: "bg-orange-100 text-orange-700",
  sustainability: "bg-teal-100 text-teal-700",
};

const INDUSTRY_LABELS: Record<string, string> = {
  fintech: "Fintech",
  healthtech: "Health Tech",
  edtech: "Education",
  ecommerce: "E-Commerce",
  social: "Social",
  "ai-ml": "AI / ML",
  gaming: "Gaming",
  sustainability: "Sustainability",
};

interface ProjectCardProps {
  project: Project;
  reason?: string;
  matchScore?: number;
  onSelect?: (project: Project) => void;
  selected?: boolean;
}

export function ProjectCard({
  project,
  reason,
  matchScore,
  onSelect,
  selected,
}: ProjectCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(project)}
      aria-pressed={!!selected}
      className={cn(
        "group w-full rounded-2xl border-2 bg-card p-5 text-left transition-all hover:shadow-md",
        selected ? "border-primary shadow-md" : "border-border hover:border-primary/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                INDUSTRY_COLORS[project.industry] || "bg-secondary text-secondary-foreground",
              )}
            >
              {INDUSTRY_LABELS[project.industry] || project.industry}
            </span>
            {matchScore && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                <TrendingUp className="h-3 w-3" />
                {matchScore}% match
              </span>
            )}
          </div>
          <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-card-foreground">
            {project.title}
          </h3>
        </div>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
        {project.description}
      </p>

      {reason && (
        <div className="mt-3 rounded-lg bg-primary/5 px-3 py-2">
          <p className="text-xs leading-relaxed text-primary">
            <Sparkle /> {reason}
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
          >
            <Tag className="h-2.5 w-2.5" />
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span>Project team of {project.teamSize}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {project.rolesNeeded.map((r, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 text-xs text-foreground"
            >
              {ROLE_ICONS[r.role]}
              {EXPERIENCE_LABELS[r.experience]} {ROLE_LABELS[r.role]}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        Posted by {project.createdByName}
      </div>
    </button>
  );
}

function Sparkle() {
  return (
    <svg
      className="mr-1 inline h-3 w-3"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2L14.09 8.26L20.18 9.27L15.82 13.14L16.94 19.18L12 16.77L7.06 19.18L8.18 13.14L3.82 9.27L9.91 8.26L12 2Z" />
    </svg>
  );
}
