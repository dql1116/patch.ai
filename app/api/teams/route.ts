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

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("teams")
    .select(
      "id,project_id,project,members,match_score,match_reason,created_at,completed_at,completed_by",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ teams: [] }, { status: 500 });
  }

  return Response.json({ teams: (data || []).map(mapTeam) });
}

export async function POST(req: Request) {
  const body = await req.json();
  const {
    projectId,
    project,
    members,
    matchScore,
    matchReason,
  } = body;

  const { data, error } = await supabaseAdmin
    .from("teams")
    .insert({
      project_id: projectId,
      project,
      members,
      match_score: matchScore,
      match_reason: matchReason,
    })
    .select(
      "id,project_id,project,members,match_score,match_reason,created_at,completed_at,completed_by",
    )
    .single();

  if (error || !data) {
    return Response.json({ error: "Could not create team." }, { status: 500 });
  }

  return Response.json({ team: mapTeam(data) });
}
