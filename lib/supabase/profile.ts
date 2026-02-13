import type { UserProfile } from "@/lib/types";
import { createBrowserClient } from "@/lib/supabase/client";

interface ProfileRow {
  id: string;
  email: string | null;
  name: string;
  role: UserProfile["role"];
  experience: UserProfile["experience"];
  industries: UserProfile["industries"];
  work_ethic: UserProfile["workEthic"];
  onboarded: boolean;
}

function getAvatarLetter(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "P";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const first = parts[0][0]?.toUpperCase() || "";
    const last = parts[parts.length - 1][0]?.toUpperCase() || "";
    return `${first}${last}` || "P";
  }
  return parts[0][0]?.toUpperCase() || "P";
}

function mapProfile(row: ProfileRow, fallbackEmail: string | null): UserProfile {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? fallbackEmail ?? "",
    role: row.role,
    experience: row.experience,
    industries: row.industries || [],
    workEthic: row.work_ethic,
    avatar: getAvatarLetter(row.name),
    onboarded: row.onboarded,
    completedProjectIds: [],
  };
}

export async function getCurrentProfile(): Promise<UserProfile | null> {
  const supabase = createBrowserClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const { data, error } = await supabase
    .from("users")
    .select("id,email,name,role,experience,industries,work_ethic,onboarded")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  return mapProfile(data as ProfileRow, user.email ?? null);
}

export async function upsertProfile(payload: {
  name: string;
  role: UserProfile["role"];
  experience: UserProfile["experience"];
  industries: UserProfile["industries"];
  workEthic: UserProfile["workEthic"];
}): Promise<UserProfile> {
  const supabase = createBrowserClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;
  if (userError || !user) {
    throw new Error("You need to be signed in to finish onboarding.");
  }

  const { data, error } = await supabase
    .from("users")
    .upsert({
      id: user.id,
      email: user.email ?? null,
      name: payload.name,
      role: payload.role,
      experience: payload.experience,
      industries: payload.industries,
      work_ethic: payload.workEthic,
      onboarded: true,
    })
    .select("id,email,name,role,experience,industries,work_ethic,onboarded")
    .single();

  if (error || !data) {
    throw new Error("Could not save your profile.");
  }

  return mapProfile(data as ProfileRow, user.email ?? null);
}

export async function signOut() {
  const supabase = createBrowserClient();
  await supabase.auth.signOut();
}
