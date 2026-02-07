"use client";

import React from "react"

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Role, ExperienceLevel, Industry, WorkEthic } from "@/lib/types";
import { createUserProfile } from "@/lib/store";
import {
  Code2,
  Briefcase,
  Palette,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Users,
} from "lucide-react";

const ROLES: { value: Role; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    value: "swe",
    label: "Software Engineer",
    icon: <Code2 className="h-6 w-6" />,
    desc: "Build and ship code",
  },
  {
    value: "pm",
    label: "Product Manager",
    icon: <Briefcase className="h-6 w-6" />,
    desc: "Lead product strategy",
  },
  {
    value: "designer",
    label: "Designer",
    icon: <Palette className="h-6 w-6" />,
    desc: "Craft user experiences",
  },
];

const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string; desc: string }[] = [
  { value: "junior", label: "Junior", desc: "0-2 years of experience" },
  { value: "mid", label: "Mid-Level", desc: "3-5 years of experience" },
  { value: "senior", label: "Senior", desc: "6+ years of experience" },
];

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

const WORK_ETHICS: { value: WorkEthic; label: string; desc: string }[] = [
  { value: "async", label: "Async-First", desc: "Work on your own schedule" },
  {
    value: "collaborative",
    label: "Collaborative",
    desc: "Frequent syncs and pairing",
  },
  {
    value: "structured",
    label: "Structured",
    desc: "Clear deadlines and sprints",
  },
  {
    value: "flexible",
    label: "Flexible",
    desc: "Mix of async and sync work",
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [experience, setExperience] = useState<ExperienceLevel | null>(null);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [workEthic, setWorkEthic] = useState<WorkEthic | null>(null);

  const totalSteps = 5;

  function toggleIndustry(ind: Industry) {
    setIndustries((prev) =>
      prev.includes(ind) ? prev.filter((i) => i !== ind) : [...prev, ind],
    );
  }

  function canProceed() {
    switch (step) {
      case 0:
        return name.trim().length >= 2;
      case 1:
        return role !== null;
      case 2:
        return experience !== null;
      case 3:
        return industries.length > 0;
      case 4:
        return workEthic !== null;
      default:
        return false;
    }
  }

  function handleSubmit() {
    if (!role || !experience || !workEthic) return;
    createUserProfile({
      name: name.trim(),
      role,
      experience,
      industries,
      workEthic,
    });
    onComplete();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <Users className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            TeamForge
          </h1>
          <p className="mt-2 text-muted-foreground">
            Let{"'"}s set up your profile to find the perfect team
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8 flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                i <= step ? "bg-primary" : "bg-border",
              )}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          {step === 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-card-foreground">
                What{"'"}s your name?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                This is how your team will know you
              </p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="mt-4 w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-card-foreground">
                What{"'"}s your target career?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Select the role that best describes you
              </p>
              <div className="mt-4 flex flex-col gap-3">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={cn(
                      "flex items-center gap-4 rounded-xl border-2 px-4 py-4 text-left transition-all",
                      role === r.value
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border bg-card text-card-foreground hover:border-primary/40",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        role === r.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground",
                      )}
                    >
                      {r.icon}
                    </div>
                    <div>
                      <div className="font-medium">{r.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {r.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-card-foreground">
                Experience level?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                We{"'"}ll match you with similar experience levels
              </p>
              <div className="mt-4 flex flex-col gap-3">
                {EXPERIENCE_LEVELS.map((e) => (
                  <button
                    key={e.value}
                    type="button"
                    onClick={() => setExperience(e.value)}
                    className={cn(
                      "rounded-xl border-2 px-4 py-4 text-left transition-all",
                      experience === e.value
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border bg-card text-card-foreground hover:border-primary/40",
                    )}
                  >
                    <div className="font-medium">{e.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {e.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-card-foreground">
                Areas of interest
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick one or more industries you{"'"}re passionate about
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {INDUSTRIES.map((ind) => (
                  <button
                    key={ind.value}
                    type="button"
                    onClick={() => toggleIndustry(ind.value)}
                    className={cn(
                      "rounded-full border-2 px-4 py-2 text-sm font-medium transition-all",
                      industries.includes(ind.value)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-card-foreground hover:border-primary/40",
                    )}
                  >
                    {ind.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-card-foreground">
                Work style preference
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                How do you like to work with your team?
              </p>
              <div className="mt-4 flex flex-col gap-3">
                {WORK_ETHICS.map((w) => (
                  <button
                    key={w.value}
                    type="button"
                    onClick={() => setWorkEthic(w.value)}
                    className={cn(
                      "rounded-xl border-2 px-4 py-4 text-left transition-all",
                      workEthic === w.value
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border bg-card text-card-foreground hover:border-primary/40",
                    )}
                  >
                    <div className="font-medium">{w.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {w.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className={cn(
              "flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              step === 0
                ? "text-muted-foreground opacity-50"
                : "text-foreground hover:bg-secondary",
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          {step < totalSteps - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className={cn(
                "flex items-center gap-1 rounded-lg px-6 py-2.5 text-sm font-medium transition-all",
                canProceed()
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : "bg-muted text-muted-foreground",
              )}
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canProceed()}
              className={cn(
                "flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all",
                canProceed()
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <Sparkles className="h-4 w-4" />
              Find My Team
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
