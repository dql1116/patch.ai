import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Team } from "@/lib/types";

function mapTeam(row: {
  id: string;
  project_id: string;
  project: Team["project"];
  members: Team["members"];
  match_score: number;
  match_reason: string;
  created_at: string;
  completed_at: string | null;
  completed_by: string | null;
}): Team {
  return {
    id: row.id,
    projectId: row.project_id,
    project: row.project,
    members: row.members,
    matchScore: row.match_score,
    matchReason: row.match_reason,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
    completedBy: row.completed_by ?? undefined,
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const resolvedParams = await params;
  const { data, error } = await supabaseAdmin
    .from("teams")
    .select(
      "id,project_id,project,members,match_score,match_reason,created_at,completed_at,completed_by",
    )
    .eq("id", resolvedParams.id)
    .single();

  if (error || !data) {
    return Response.json({ error: "Team not found." }, { status: 404 });
  }

  return Response.json({ team: mapTeam(data) });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const resolvedParams = await params;
  const body = await req.json();
  const { completedBy } = body;

  const { data, error } = await supabaseAdmin
    .from("teams")
    .update({
      completed_at: new Date().toISOString(),
      completed_by: completedBy ?? null,
    })
    .eq("id", resolvedParams.id)
    .select(
      "id,project_id,project,members,match_score,match_reason,created_at,completed_at,completed_by",
    )
    .single();

  if (error || !data) {
    return Response.json({ error: "Could not complete team." }, { status: 500 });
  }

  await supabaseAdmin
    .from("projects")
    .delete()
    .eq("id", data.project_id);

  return Response.json({ team: mapTeam(data) });
}
