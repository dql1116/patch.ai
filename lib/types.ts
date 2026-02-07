export type Role = "swe" | "pm" | "designer";
export type ExperienceLevel = "junior" | "mid" | "senior";
export type Industry =
  | "fintech"
  | "healthtech"
  | "edtech"
  | "ecommerce"
  | "social"
  | "ai-ml"
  | "gaming"
  | "sustainability";
export type WorkEthic = "async" | "collaborative" | "structured" | "flexible";

export interface UserProfile {
  id: string;
  name: string;
  role: Role;
  experience: ExperienceLevel;
  industries: Industry[];
  workEthic: WorkEthic;
  avatar: string;
  onboarded: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  industry: Industry;
  createdBy: string;
  createdByName: string;
  rolesNeeded: { role: Role; experience: ExperienceLevel }[];
  teamSize: number;
  tags: string[];
  createdAt: string;
}

export interface Team {
  id: string;
  projectId: string;
  project: Project;
  members: UserProfile[];
  matchScore: number;
  matchReason: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  teamId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isBot: boolean;
}
