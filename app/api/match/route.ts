import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Project, UserProfile } from "@/lib/types";
import { geminiClient, GEMINI_MODEL } from "@/lib/gemini";

export const runtime = "nodejs";

const CACHE_TTL_MS = 10 * 60 * 1000;
const matchCache =
  (globalThis as { __matchCache?: Map<string, { expires: number; data: { matchReason: string; teamDynamic: string } }> })
    .__matchCache || new Map<string, { expires: number; data: { matchReason: string; teamDynamic: string } }>();
(globalThis as { __matchCache?: Map<string, { expires: number; data: { matchReason: string; teamDynamic: string } }> })
  .__matchCache = matchCache;

function getMatchKey(userId: string, projectId: string) {
  return `${userId}:${projectId}`;
}

const MOCK_TEAMMATES: UserProfile[] = [
  {
    id: "mock-1",
    name: "Maya Kim",
    email: "maya@patch.ai",
    role: "designer",
    experience: "intermediate",
    industries: ["healthtech", "social"],
    workEthic: "flexible",
    avatar: "M",
    onboarded: true,
    completedProjectIds: [],
  },
  {
    id: "mock-2",
    name: "Sam Rivera",
    email: "sam@patch.ai",
    role: "pm",
    experience: "advanced",
    industries: ["ecommerce", "fintech"],
    workEthic: "structured",
    avatar: "S",
    onboarded: true,
    completedProjectIds: [],
  },
  {
    id: "mock-3",
    name: "Lena Park",
    email: "lena@patch.ai",
    role: "swe",
    experience: "beginner",
    industries: ["edtech", "ai-ml"],
    workEthic: "async",
    avatar: "L",
    onboarded: true,
    completedProjectIds: [],
  },
  {
    id: "mock-4",
    name: "Tyler Wang",
    email: "tyler@patch.ai",
    role: "designer",
    experience: "advanced",
    industries: ["gaming", "social"],
    workEthic: "collaborative",
    avatar: "T",
    onboarded: true,
    completedProjectIds: [],
  },
];

function mapProject(row: {
  id: string;
  title: string;
  description: string;
  industry: Project["industry"];
  created_by: string | null;
  created_by_name: string | null;
  roles_needed: Project["rolesNeeded"];
  team_size: number;
  tags: string[] | null;
  created_at: string;
}): Project {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    industry: row.industry,
    createdBy: row.created_by ?? "",
    createdByName: row.created_by_name ?? "",
    rolesNeeded: row.roles_needed || [],
    teamSize: row.team_size,
    tags: row.tags ?? [],
    createdAt: row.created_at,
  };
}

export async function POST(req: Request) {
  const { userId, preferredProjectIds = [] } = await req.json();

  const { data: userRow } = await supabaseAdmin
    .from("users")
    .select("id,email,name,role,experience,industries,work_ethic,onboarded")
    .eq("id", userId)
    .single();

  if (!userRow) {
    return Response.json({ error: "User not found." }, { status: 404 });
  }

  const user: UserProfile = {
    id: userRow.id,
    name: userRow.name,
    email: userRow.email ?? "",
    role: userRow.role,
    experience: userRow.experience,
    industries: userRow.industries ?? [],
    workEthic: userRow.work_ethic,
    avatar: userRow.name?.slice(0, 1)?.toUpperCase() || "P",
    onboarded: userRow.onboarded,
    completedProjectIds: [],
  };

  const { data: projectRows, error: projectError } = await supabaseAdmin
    .from("projects")
    .select(
      "id,title,description,industry,created_by,created_by_name,roles_needed,team_size,tags,created_at",
    )
    .order("created_at", { ascending: false });

  if (projectError || !projectRows || projectRows.length === 0) {
    return Response.json({ error: "No projects available." }, { status: 404 });
  }

  const projects = projectRows.map(mapProject);

  const { data: profileRows } = await supabaseAdmin
    .from("users")
    .select("id,email,name,role,experience,industries,work_ethic,onboarded")
    .eq("onboarded", true);

  const availableUsers = (profileRows || []).filter(
    (row) => row.id !== user.id,
  ) as typeof profileRows;

  // Score each project for the user
  const scoredProjects = projects.map((project) => {
    let score = 50;

    const needsRole = project.rolesNeeded.some((r) => r.role === user.role);
    if (needsRole) score += 25;

    const exactExpMatch = project.rolesNeeded.some(
      (r) => r.role === user.role && r.experience === user.experience,
    );
    if (exactExpMatch) score += 10;

    const industryMatch = (user.industries || []).includes(project.industry);
    if (industryMatch) score += 15;

    if (preferredProjectIds.includes(project.id)) {
      score += 40;
    }

    return { project, score: Math.min(98, score) };
  });

  scoredProjects.sort((a, b) => b.score - a.score);
  const bestMatch = scoredProjects[0];
  const chosenProject = bestMatch.project;

  // Select team members: prioritize diversity of roles and matching industry
  const scored = availableUsers.map((u) => {
    let memberScore = 0;

    if (u.role !== user.role) memberScore += 10;

    const neededRole = chosenProject.rolesNeeded.some(
      (r) => r.role === u.role,
    );
    if (neededRole) memberScore += 15;

    if ((u.industries || []).includes(chosenProject.industry)) {
      memberScore += 10;
    }

    if (u.work_ethic === user.workEthic) memberScore += 5;

    return { user: u, score: memberScore };
  });

  scored.sort((a, b) => b.score - a.score);

  const teamSize = Math.min(chosenProject.teamSize - 1, 3);
  const desiredCount = Math.max(2, teamSize);
  const chosenMembers = scored.slice(0, desiredCount).map((s) => s.user);

  const isSeedProject = !chosenProject.createdBy;
  const neededFallback = Math.max(0, desiredCount - chosenMembers.length);
  const mockFallback = isSeedProject
    ? MOCK_TEAMMATES.filter(
        (mock) => !chosenMembers.some((member) => member.id === mock.id),
      ).slice(0, neededFallback)
    : [];

  // Build reason
  const reasons: string[] = [];
  if (chosenProject.rolesNeeded.some((r) => r.role === user.role)) {
    reasons.push(`your ${user.role} skills are exactly what this project needs`);
  }
  if ((user.industries || []).includes(chosenProject.industry)) {
    reasons.push(`the ${chosenProject.industry} focus matches your interests`);
  }
  if (preferredProjectIds.includes(chosenProject.id)) {
    reasons.push("you explicitly preferred this project");
  }
  if (reasons.length === 0) {
    reasons.push("this project offers great growth opportunities for you");
  }

  const fallbackReason = `${reasons[0].charAt(0).toUpperCase() + reasons[0].slice(1)}. ${reasons.length > 1 ? reasons[1].charAt(0).toUpperCase() + reasons[1].slice(1) + "." : "The team composition will provide excellent collaboration dynamics."}`;

  const teamDynamic =
    "This team brings together diverse skill sets and complementary working styles for productive collaboration.";

  let matchReason = fallbackReason;
  const cacheKey = getMatchKey(user.id, chosenProject.id);
  const cached = matchCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    matchReason = cached.data.matchReason;
  } else {
  try {
    const teamSummary = chosenMembers.map((m) => ({
      id: m.id,
      name: m.name,
      role: m.role,
      experience: m.experience,
      industries: m.industries,
      workEthic: m.work_ethic,
    }));

    const input = `
Write a concise, upbeat 1-2 sentence match reason for this user and project.
Return ONLY JSON: {"matchReason":"...","teamDynamic":"..."}.

User:
${JSON.stringify(user)}

Project:
${JSON.stringify(chosenProject)}

TeamMembers:
${JSON.stringify(teamSummary)}
`;
    const response = await geminiClient.models.generateContent({
      model: GEMINI_MODEL,
      contents: input,
    });
    const text = response.text || "";
    const parsed = JSON.parse(text);
    if (parsed?.matchReason) {
      matchReason = String(parsed.matchReason);
      matchCache.set(cacheKey, {
        expires: Date.now() + CACHE_TTL_MS,
        data: {
          matchReason,
          teamDynamic: String(parsed.teamDynamic || teamDynamic),
        },
      });
      console.log("[match] AI matchReason generated");
    } else {
      console.log("[match] AI response missing matchReason, using fallback");
    }
  } catch (err) {
    console.log("[match] fallback matchReason due to AI error");
    console.error("[match] AI error:", err);
    matchReason = fallbackReason;
  }
  }

  return Response.json({
    project: chosenProject,
    teamMembers: [
      ...chosenMembers.map((member) => ({
        id: member.id,
        name: member.name,
        email: member.email ?? "",
        role: member.role,
        experience: member.experience,
        industries: member.industries ?? [],
        workEthic: member.work_ethic,
        avatar: member.name?.slice(0, 1)?.toUpperCase() || "P",
        onboarded: member.onboarded,
        completedProjectIds: [],
      })),
      ...mockFallback,
    ],
    matchScore: bestMatch.score,
    matchReason,
    teamDynamic,
  });
}
