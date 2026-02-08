import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Project } from "@/lib/types";

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

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("projects")
    .select(
      "id,title,description,industry,created_by,created_by_name,roles_needed,team_size,tags,created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ projects: [] }, { status: 500 });
  }

  return Response.json({ projects: (data || []).map(mapProject) });
}

export async function POST(req: Request) {
  const body = await req.json();
  const {
    title,
    description,
    industry,
    createdBy,
    createdByName,
    rolesNeeded,
    teamSize,
    tags,
  } = body;

  const { data, error } = await supabaseAdmin
    .from("projects")
    .insert({
      title,
      description,
      industry,
      created_by: createdBy,
      created_by_name: createdByName,
      roles_needed: rolesNeeded,
      team_size: teamSize,
      tags,
    })
    .select(
      "id,title,description,industry,created_by,created_by_name,roles_needed,team_size,tags,created_at",
    )
    .single();

  if (error || !data) {
    return Response.json({ error: "Could not create project." }, { status: 500 });
  }

  return Response.json({ project: mapProject(data) });
}
