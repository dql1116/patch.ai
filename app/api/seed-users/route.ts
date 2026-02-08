import { supabaseAdmin } from "@/lib/supabase/admin";
import type { ExperienceLevel, Role, WorkEthic, Industry } from "@/lib/types";

const SEED_USERS: {
  email: string;
  password: string;
  name: string;
  role: Role;
  experience: ExperienceLevel;
  industries: Industry[];
  workEthic: WorkEthic;
}[] = [
  {
    email: "maya@patch.ai",
    password: "PatchDemo123!",
    name: "Maya Kim",
    role: "designer",
    experience: "intermediate",
    industries: ["healthtech", "social"],
    workEthic: "flexible",
  },
  {
    email: "sam@patch.ai",
    password: "PatchDemo123!",
    name: "Sam Rivera",
    role: "pm",
    experience: "advanced",
    industries: ["ecommerce", "fintech"],
    workEthic: "structured",
  },
  {
    email: "lena@patch.ai",
    password: "PatchDemo123!",
    name: "Lena Park",
    role: "swe",
    experience: "beginner",
    industries: ["edtech", "ai-ml"],
    workEthic: "async",
  },
  {
    email: "tyler@patch.ai",
    password: "PatchDemo123!",
    name: "Tyler Wang",
    role: "designer",
    experience: "advanced",
    industries: ["gaming", "social"],
    workEthic: "collaborative",
  },
  {
    email: "dana@patch.ai",
    password: "PatchDemo123!",
    name: "Dana Nguyen",
    role: "pm",
    experience: "intermediate",
    industries: ["sustainability", "healthtech"],
    workEthic: "flexible",
  },
];

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "Not available in production." }, { status: 403 });
  }

  const results: { email: string; status: string; message?: string }[] = [];

  for (const seed of SEED_USERS) {
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: seed.email,
      password: seed.password,
      email_confirm: true,
      user_metadata: { name: seed.name },
    });

    if (error && error.message !== "User already registered") {
      results.push({ email: seed.email, status: "error", message: error.message });
      continue;
    }

    const userId = created?.user?.id;
    if (!userId && error?.message === "User already registered") {
      const { data: existing } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      const found = existing?.users?.find((u) => u.email === seed.email);
      if (!found) {
        results.push({ email: seed.email, status: "error", message: "User exists but could not load id." });
        continue;
      }
      await supabaseAdmin
        .from("users")
        .upsert({
          id: found.id,
          email: seed.email,
          name: seed.name,
          role: seed.role,
          experience: seed.experience,
          industries: seed.industries,
          work_ethic: seed.workEthic,
          onboarded: true,
        });
      results.push({ email: seed.email, status: "ok" });
      continue;
    }

    if (!userId) {
      results.push({ email: seed.email, status: "error", message: "Missing user id." });
      continue;
    }

    await supabaseAdmin
      .from("users")
      .upsert({
        id: userId,
        email: seed.email,
        name: seed.name,
        role: seed.role,
        experience: seed.experience,
        industries: seed.industries,
        work_ethic: seed.workEthic,
        onboarded: true,
      });

    results.push({ email: seed.email, status: "ok" });
  }

  return Response.json({ seeded: results, password: "PatchDemo123!" });
}
