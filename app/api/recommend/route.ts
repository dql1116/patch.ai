export async function POST(req: Request) {
  const { user, projects } = await req.json();

  const recommendations = projects.map(
    (project: {
      id: string;
      title: string;
      description: string;
      industry: string;
      rolesNeeded: { role: string; experience: string }[];
      tags: string[];
    }) => {
      let score = 50;
      let reasons: string[] = [];

      // Role match: does the project need this user's role?
      const needsRole = project.rolesNeeded.some(
        (r: { role: string; experience: string }) => r.role === user.role,
      );
      if (needsRole) {
        score += 20;
        reasons.push(`needs a ${user.role}`);
      }

      // Experience match
      const exactExpMatch = project.rolesNeeded.some(
        (r: { role: string; experience: string }) =>
          r.role === user.role && r.experience === user.experience,
      );
      if (exactExpMatch) {
        score += 10;
        reasons.push("your experience level is a perfect fit");
      }

      // Industry overlap
      const industryMatch = (user.industries || []).includes(project.industry);
      if (industryMatch) {
        score += 15;
        reasons.push(`aligns with your interest in ${project.industry}`);
      }

      // Tag affinity (simple heuristic)
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

      // Clamp score
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
    },
  );

  // Sort by score descending
  recommendations.sort(
    (a: { matchScore: number }, b: { matchScore: number }) =>
      b.matchScore - a.matchScore,
  );

  return Response.json({ recommendations });
}
