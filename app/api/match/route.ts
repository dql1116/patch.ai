export async function POST(req: Request) {
  const { user, projects, availableUsers } = await req.json();

  // Score each project for the user
  const scoredProjects = projects.map(
    (project: {
      id: string;
      title: string;
      industry: string;
      rolesNeeded: { role: string; experience: string }[];
      teamSize: number;
      tags: string[];
    }) => {
      let score = 50;

      const needsRole = project.rolesNeeded.some(
        (r: { role: string }) => r.role === user.role,
      );
      if (needsRole) score += 25;

      const exactExpMatch = project.rolesNeeded.some(
        (r: { role: string; experience: string }) =>
          r.role === user.role && r.experience === user.experience,
      );
      if (exactExpMatch) score += 10;

      const industryMatch = (user.industries || []).includes(project.industry);
      if (industryMatch) score += 15;

      return { project, score: Math.min(98, score) };
    },
  );

  // Pick the best project
  scoredProjects.sort(
    (a: { score: number }, b: { score: number }) => b.score - a.score,
  );
  const bestMatch = scoredProjects[0];
  const chosenProject = bestMatch.project;

  // Select team members: prioritize diversity of roles and matching industry
  const otherUsers = availableUsers.filter(
    (u: { id: string }) => u.id !== user.id,
  );

  const scored = otherUsers.map(
    (u: {
      id: string;
      role: string;
      experience: string;
      industries: string[];
      workEthic: string;
    }) => {
      let memberScore = 0;

      // Different role from requesting user is better (diversity)
      if (u.role !== user.role) memberScore += 10;

      // Role needed by the project
      const neededRole = chosenProject.rolesNeeded.some(
        (r: { role: string }) => r.role === u.role,
      );
      if (neededRole) memberScore += 15;

      // Industry overlap with project
      if ((u.industries || []).includes(chosenProject.industry))
        memberScore += 10;

      // Work ethic compatibility
      if (u.workEthic === user.workEthic) memberScore += 5;

      return { user: u, score: memberScore };
    },
  );

  scored.sort(
    (a: { score: number }, b: { score: number }) => b.score - a.score,
  );

  const teamSize = Math.min(chosenProject.teamSize - 1, 3);
  const chosenMembers = scored
    .slice(0, Math.max(2, teamSize))
    .map((s: { user: { id: string } }) => s.user.id);

  // Build reason
  const reasons: string[] = [];
  if (
    chosenProject.rolesNeeded.some(
      (r: { role: string }) => r.role === user.role,
    )
  ) {
    reasons.push(
      `your ${user.role} skills are exactly what this project needs`,
    );
  }
  if ((user.industries || []).includes(chosenProject.industry)) {
    reasons.push(
      `the ${chosenProject.industry} focus matches your interests`,
    );
  }
  if (reasons.length === 0) {
    reasons.push("this project offers great growth opportunities for you");
  }

  const matchReason = `${reasons[0].charAt(0).toUpperCase() + reasons[0].slice(1)}. ${reasons.length > 1 ? reasons[1].charAt(0).toUpperCase() + reasons[1].slice(1) + "." : "The team composition will provide excellent collaboration dynamics."}`;

  const teamDynamic =
    "This team brings together diverse skill sets and complementary working styles for productive collaboration.";

  return Response.json({
    projectId: chosenProject.id,
    teamMembers: chosenMembers,
    matchScore: bestMatch.score,
    matchReason,
    teamDynamic,
  });
}
