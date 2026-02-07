import { generateText, Output } from "ai";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { user, projects } = await req.json();

  const { output } = await generateText({
    model: "openai/gpt-4o-mini",
    output: Output.object({
      schema: z.object({
        recommendations: z.array(
          z.object({
            projectId: z.string(),
            reason: z.string(),
            matchScore: z.number(),
          }),
        ),
      }),
    }),
    prompt: `You are a team matching AI. Given a user profile and a list of projects, recommend the most relevant projects for this user, ranked by relevance.

User Profile:
- Name: ${user.name}
- Role: ${user.role}
- Experience: ${user.experience}
- Industries of interest: ${user.industries.join(", ")}
- Work style: ${user.workEthic}

Available Projects:
${projects.map((p: { id: string; title: string; description: string; industry: string; rolesNeeded: { role: string; experience: string }[]; tags: string[] }) => `- ID: ${p.id}, Title: "${p.title}", Description: "${p.description}", Industry: ${p.industry}, Roles Needed: ${p.rolesNeeded.map((r: { role: string; experience: string }) => `${r.role}(${r.experience})`).join(", ")}, Tags: ${p.tags.join(", ")}`).join("\n")}

Return a ranked list of project recommendations. For each, provide:
- projectId: the project ID
- reason: a brief, friendly 1-sentence explanation of why this project is a good match
- matchScore: a number 1-100 representing how good the match is

Rank by relevance to the user's role, experience level, industry interests, and work style. Include all projects but put the best matches first.`,
  });

  return Response.json(output);
}
