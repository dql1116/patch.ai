import { generateText, Output } from "ai";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { user, projects, availableUsers } = await req.json();

  const { output } = await generateText({
    model: "openai/gpt-4o-mini",
    output: Output.object({
      schema: z.object({
        projectId: z.string(),
        teamMembers: z.array(z.string()),
        matchScore: z.number(),
        matchReason: z.string(),
        teamDynamic: z.string(),
      }),
    }),
    prompt: `You are an AI team matching system. Given a user who wants to join a team, available projects, and available team members, create the best team match.

User wanting to join:
- ID: ${user.id}
- Name: ${user.name}
- Role: ${user.role}
- Experience: ${user.experience}
- Industries: ${user.industries.join(", ")}
- Work Style: ${user.workEthic}

Available Projects:
${projects.map((p: { id: string; title: string; industry: string; rolesNeeded: { role: string; experience: string }[]; teamSize: number }) => `- ID: ${p.id}, Title: "${p.title}", Industry: ${p.industry}, Roles needed: ${p.rolesNeeded.map((r: { role: string; experience: string }) => `${r.role}(${r.experience})`).join(", ")}, Team size: ${p.teamSize}`).join("\n")}

Available Team Members:
${availableUsers.map((u: { id: string; name: string; role: string; experience: string; industries: string[]; workEthic: string }) => `- ID: ${u.id}, Name: ${u.name}, Role: ${u.role}, Experience: ${u.experience}, Industries: ${u.industries.join(", ")}, Work Style: ${u.workEthic}`).join("\n")}

Select the best project for this user and assemble the best team. Consider:
1. The user's role should fill a needed role on the project
2. Team diversity (different roles complement each other)
3. Industry alignment between user interests and project
4. Work style compatibility
5. Experience level balance

Return:
- projectId: the selected project ID
- teamMembers: array of user IDs (from available members) to form the team WITH the requesting user (include 2-3 other members, do NOT include the requesting user's ID)
- matchScore: 1-100 how good this match is
- matchReason: a 2-sentence explanation of why this is a great match
- teamDynamic: a 1-sentence description of how this team will work together`,
  });

  return Response.json(output);
}
