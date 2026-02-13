import { geminiClient, GEMINI_MODEL } from "@/lib/gemini";

type Recommendation = {
  projectId: string;
  reason: string;
  matchScore: number;
};

function heuristicRecommendations(projects: any[], user: any): Recommendation[] {
  const recommendations = projects.map((project) => {
    let score = 50;
    let reasons: string[] = [];

    const needsRole = project.rolesNeeded.some(
      (r: { role: string; experience: string }) => r.role === user.role,
    );
    if (needsRole) {
      score += 20;
      reasons.push(`needs a ${user.role}`);
    }

    const exactExpMatch = project.rolesNeeded.some(
      (r: { role: string; experience: string }) =>
        r.role === user.role && r.experience === user.experience,
    );
    if (exactExpMatch) {
      score += 10;
      reasons.push("your experience level is a perfect fit");
    }

    const industryMatch = (user.industries || []).includes(project.industry);
    if (industryMatch) {
      score += 15;
      reasons.push(`aligns with your interest in ${project.industry}`);
    }

    const techTags = ["React", "TypeScript", "Next.js", "Node.js", "Python"];
    const designTags = ["UX Research", "Figma", "Design Systems"];
    const pmTags = ["Agile", "Strategy", "Product"];
    const relevantTags =
      user.role === "swe"
        ? techTags
        : user.role === "designer"
          ? designTags
          : pmTags;
    const tagOverlap = project.tags.filter((t: string) =>
      relevantTags.some((rt) => t.toLowerCase().includes(rt.toLowerCase())),
    ).length;
    score += tagOverlap * 3;

    score = Math.min(98, Math.max(40, score));

    const reason =
      reasons.length > 0
        ? `This project ${reasons.slice(0, 2).join(" and ")}.`
        : `This project could be a great way to expand your skills.`;

    return {
      projectId: project.id,
      reason,
      matchScore: score,
    };
  });

  recommendations.sort((a, b) => b.matchScore - a.matchScore);
  return recommendations;
}

function safeParseRecommendations(text: string, fallback: Recommendation[]) {
  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed?.recommendations)) return fallback;
    const normalized = parsed.recommendations
      .map((rec: any) => ({
        projectId: String(rec.projectId || ""),
        reason: String(rec.reason || ""),
        matchScore: Number(rec.matchScore || 0),
      }))
      .filter((rec: Recommendation) => rec.projectId);
    return normalized.length ? normalized : fallback;
  } catch {
    return fallback;
  }
}

export const runtime = "nodejs";

const CACHE_TTL_MS = 5 * 60 * 1000;
const recommendCache =
  (globalThis as { __recommendCache?: Map<string, { expires: number; data: Recommendation[] }> })
    .__recommendCache || new Map<string, { expires: number; data: Recommendation[] }>();
(globalThis as { __recommendCache?: Map<string, { expires: number; data: Recommendation[] }> })
  .__recommendCache = recommendCache;

function getCacheKey(userId: string, projectIds: string[]) {
  return `${userId}:${projectIds.sort().join(",")}`;
}

export async function POST(req: Request) {
  const { user, projects } = await req.json();

  const fallback = heuristicRecommendations(projects, user);
  const key = getCacheKey(String(user?.id || "anon"), projects.map((p: any) => p.id));
  const cached = recommendCache.get(key);
  if (cached && cached.expires > Date.now()) {
    return Response.json({ recommendations: cached.data, cached: true });
  }

  try {
    const input = `
You are an expert product matchmaker. Given a user profile and a list of projects, rank the projects by fit.
Return ONLY valid JSON with this shape:
{"recommendations":[{"projectId":"...","reason":"...","matchScore":0}]}
Rules:
- matchScore is an integer 40-98
- reason is 1 sentence, concise
- include every project id exactly once

User:
${JSON.stringify(user)}

Projects:
${JSON.stringify(projects)}
`;

    const response = await geminiClient.models.generateContent({
      model: GEMINI_MODEL,
      contents: input,
    });
    const text = response.text || "";
    const recommendations = safeParseRecommendations(text, fallback);
    const usedAI = recommendations !== fallback;
    console.log(
      `[recommend] ${usedAI ? "AI" : "fallback"} recommendations generated`,
    );
    if (usedAI) {
      recommendCache.set(key, { expires: Date.now() + CACHE_TTL_MS, data: recommendations });
    }
    return Response.json({ recommendations });
  } catch (err) {
    console.log("[recommend] fallback recommendations due to AI error");
    console.error("[recommend] AI error:", err);
    return Response.json({ recommendations: fallback });
  }
}
