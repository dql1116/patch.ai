"use client";

import React from "react"

import { useState } from "react";
import type {
  UserProfile,
  Project,
  Role,
  ExperienceLevel,
  Industry,
} from "@/lib/types";
import { addProject, saveTeam } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Plus,
  X,
  Code2,
  Briefcase,
  Palette,
  Rocket,
} from "lucide-react";

const INDUSTRIES: { value: Industry; label: string }[] = [
  { value: "fintech", label: "Fintech" },
  { value: "healthtech", label: "Health Tech" },
  { value: "edtech", label: "Education" },
  { value: "ecommerce", label: "E-Commerce" },
  { value: "social", label: "Social" },
  { value: "ai-ml", label: "AI / ML" },
  { value: "gaming", label: "Gaming" },
  { value: "sustainability", label: "Sustainability" },
];

const ROLES: { value: Role; label: string; icon: React.ReactNode }[] = [
  { value: "swe", label: "SWE", icon: <Code2 className="h-4 w-4" /> },
  { value: "pm", label: "PM", icon: <Briefcase className="h-4 w-4" /> },
  {
    value: "designer",
    label: "Designer",
    icon: <Palette className="h-4 w-4" />,
  },
];

const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid" },
  { value: "senior", label: "Senior" },
];

interface RoleNeeded {
  role: Role;
  experience: ExperienceLevel;
}

interface CreateProjectProps {
  user: UserProfile;
  onCreated: () => void;
  onCancel: () => void;
}

export function CreateProject({ user, onCreated, onCancel }: CreateProjectProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState<Industry | null>(null);
  const [teamSize, setTeamSize] = useState(4);
  const [rolesNeeded, setRolesNeeded] = useState<RoleNeeded[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Role adding state
  const [addingRole, setAddingRole] = useState(false);
  const [newRole, setNewRole] = useState<Role>("swe");
  const [newExp, setNewExp] = useState<ExperienceLevel>("mid");

  function addRole() {
    setRolesNeeded((prev) => [
      ...prev,
      { role: newRole, experience: newExp },
    ]);
    setAddingRole(false);
  }

  function removeRole(index: number) {
    setRolesNeeded((prev) => prev.filter((_, i) => i !== index));
  }

  function addTag() {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags((prev) => [...prev, tag]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function canSubmit() {
    return (
      title.trim().length >= 3 &&
      description.trim().length >= 10 &&
      industry !== null &&
      rolesNeeded.length > 0
    );
  }

  function handleSubmit() {
    if (!canSubmit() || !industry) return;

    const project: Project = {
      id: `proj-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      industry,
      createdBy: user.id,
      createdByName: user.name,
      rolesNeeded,
      teamSize,
      tags,
      createdAt: new Date().toISOString(),
    };

    addProject(project);
    const now = Date.now();
    saveTeam({
      id: `team-${now}`,
      projectId: project.id,
      project,
      members: [user],
      matchScore: 100,
      matchReason: "Project created by you.",
      createdAt: new Date().toISOString(),
    });
    onCreated();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label="Cancel"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-lg font-bold text-foreground">
            Create Project
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-28 pt-6">
        {/* Title */}
        <div className="mb-5">
          <label
            htmlFor="project-title"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Project Title
          </label>
          <input
            id="project-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., AI-Powered Recipe App"
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Description */}
        <div className="mb-5">
          <label
            htmlFor="project-desc"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Description
          </label>
          <textarea
            id="project-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your project idea, goals, and what makes it exciting..."
            rows={4}
            className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Industry */}
        <div className="mb-5">
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Industry
          </label>
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind.value}
                type="button"
                onClick={() => setIndustry(ind.value)}
                className={cn(
                  "rounded-full border-2 px-3.5 py-1.5 text-sm font-medium transition-all",
                  industry === ind.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-card-foreground hover:border-primary/40",
                )}
              >
                {ind.label}
              </button>
            ))}
          </div>
        </div>

        {/* Team Size */}
        <div className="mb-5">
          <label
            htmlFor="team-size"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Team Size: {teamSize}
          </label>
          <input
            id="team-size"
            type="range"
            min={2}
            max={8}
            value={teamSize}
            onChange={(e) => setTeamSize(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>2</span>
            <span>8</span>
          </div>
        </div>

        {/* Roles Needed */}
        <div className="mb-5">
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Roles Needed
          </label>
          <div className="flex flex-col gap-2">
            {rolesNeeded.map((r, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
              >
                <div className="flex items-center gap-2 text-sm text-card-foreground">
                  {ROLES.find((rl) => rl.value === r.role)?.icon}
                  <span className="font-medium">
                    {ROLES.find((rl) => rl.value === r.role)?.label}
                  </span>
                  <span className="text-muted-foreground">
                    ({EXPERIENCE_LEVELS.find((e) => e.value === r.experience)?.label})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeRole(idx)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Remove role"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}

            {addingRole ? (
              <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3">
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as Role)}
                  className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <select
                  value={newExp}
                  onChange={(e) =>
                    setNewExp(e.target.value as ExperienceLevel)
                  }
                  className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground"
                >
                  {EXPERIENCE_LEVELS.map((e) => (
                    <option key={e.value} value={e.value}>
                      {e.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addRole}
                  className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setAddingRole(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAddingRole(true)}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <Plus className="h-4 w-4" />
                Add Role
              </button>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="mb-5">
          <label
            htmlFor="tag-input"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Tags (technologies, topics)
          </label>
          <div className="flex items-center gap-2">
            <input
              id="tag-input"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="e.g., React, TypeScript"
              className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="button"
              onClick={addTag}
              disabled={!tagInput.trim()}
              className={cn(
                "rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                tagInput.trim()
                  ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  : "bg-muted text-muted-foreground",
              )}
            >
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-destructive transition-colors"
                    aria-label={`Remove tag ${tag}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Submit button */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-center px-4 py-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit()}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all",
              canSubmit()
                ? "bg-primary text-primary-foreground hover:opacity-90"
                : "bg-muted text-muted-foreground",
            )}
          >
            <Rocket className="h-4 w-4" />
            Publish Project
          </button>
        </div>
      </div>
    </div>
  );
}
