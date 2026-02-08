import type {
  UserProfile,
  Project,
  Team,
  ChatMessage,
  Role,
  ExperienceLevel,
  Industry,
  WorkEthic,
} from "./types";

const AVATARS = [
  "AJ",
  "MK",
  "SR",
  "LP",
  "TW",
  "DN",
  "KP",
  "RG",
  "JS",
  "HN",
];

const MOCK_USERS: UserProfile[] = [
  {
    id: "user-1",
    name: "Alex Johnson",
    role: "swe",
    experience: "senior",
    industries: ["ai-ml", "fintech"],
    workEthic: "collaborative",
    avatar: "AJ",
    onboarded: true,
  },
  {
    id: "user-2",
    name: "Maya Kim",
    role: "designer",
    experience: "mid",
    industries: ["healthtech", "social"],
    workEthic: "flexible",
    avatar: "MK",
    onboarded: true,
  },
  {
    id: "user-3",
    name: "Sam Rivera",
    role: "pm",
    experience: "senior",
    industries: ["ecommerce", "fintech"],
    workEthic: "structured",
    avatar: "SR",
    onboarded: true,
  },
  {
    id: "user-4",
    name: "Lena Park",
    role: "swe",
    experience: "junior",
    industries: ["edtech", "ai-ml"],
    workEthic: "async",
    avatar: "LP",
    onboarded: true,
  },
  {
    id: "user-5",
    name: "Tyler Wang",
    role: "designer",
    experience: "senior",
    industries: ["gaming", "social"],
    workEthic: "collaborative",
    avatar: "TW",
    onboarded: true,
  },
  {
    id: "user-6",
    name: "Dana Nguyen",
    role: "pm",
    experience: "mid",
    industries: ["sustainability", "healthtech"],
    workEthic: "flexible",
    avatar: "DN",
    onboarded: true,
  },
  {
    id: "user-7",
    name: "Kai Peters",
    role: "swe",
    experience: "mid",
    industries: ["fintech", "ecommerce"],
    workEthic: "structured",
    avatar: "KP",
    onboarded: true,
  },
  {
    id: "user-8",
    name: "Rosa Garcia",
    role: "designer",
    experience: "junior",
    industries: ["edtech", "sustainability"],
    workEthic: "async",
    avatar: "RG",
    onboarded: true,
  },
];

const MOCK_PROJECTS: Project[] = [
  {
    id: "proj-1",
    title: "AI-Powered Personal Finance Dashboard",
    description:
      "Build a smart dashboard that uses machine learning to track spending, predict budgets, and provide personalized savings advice.",
    industry: "fintech",
    createdBy: "user-3",
    createdByName: "Sam Rivera",
    rolesNeeded: [
      { role: "swe", experience: "mid" },
      { role: "designer", experience: "mid" },
    ],
    teamSize: 4,
    tags: ["React", "Python", "ML", "Finance"],
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "proj-2",
    title: "Mental Health Check-in App",
    description:
      "Create a mobile-first app that helps users track their mental well-being through daily check-ins, journaling, and AI-generated insights.",
    industry: "healthtech",
    createdBy: "user-6",
    createdByName: "Dana Nguyen",
    rolesNeeded: [
      { role: "swe", experience: "junior" },
      { role: "designer", experience: "senior" },
    ],
    teamSize: 3,
    tags: ["React Native", "Node.js", "UX Research"],
    createdAt: "2026-01-20T14:00:00Z",
  },
  {
    id: "proj-3",
    title: "Sustainable Marketplace Platform",
    description:
      "An ecommerce platform connecting consumers with eco-friendly brands, featuring carbon footprint tracking for every purchase.",
    industry: "sustainability",
    createdBy: "user-1",
    createdByName: "Alex Johnson",
    rolesNeeded: [
      { role: "swe", experience: "senior" },
      { role: "pm", experience: "mid" },
      { role: "designer", experience: "mid" },
    ],
    teamSize: 5,
    tags: ["Next.js", "Stripe", "Sustainability"],
    createdAt: "2026-01-25T09:00:00Z",
  },
  {
    id: "proj-4",
    title: "Interactive Coding Tutor for Kids",
    description:
      "A gamified education platform that teaches children programming fundamentals through interactive puzzles and AI-guided lessons.",
    industry: "edtech",
    createdBy: "user-4",
    createdByName: "Lena Park",
    rolesNeeded: [
      { role: "designer", experience: "junior" },
      { role: "swe", experience: "mid" },
    ],
    teamSize: 3,
    tags: ["TypeScript", "Gamification", "Education"],
    createdAt: "2026-02-01T11:00:00Z",
  },
  {
    id: "proj-5",
    title: "Social Fitness Challenge App",
    description:
      "A social platform where friends can create and compete in fitness challenges, track progress, and cheer each other on.",
    industry: "social",
    createdBy: "user-5",
    createdByName: "Tyler Wang",
    rolesNeeded: [
      { role: "swe", experience: "mid" },
      { role: "pm", experience: "junior" },
    ],
    teamSize: 4,
    tags: ["React", "Firebase", "Social", "Health"],
    createdAt: "2026-02-03T16:00:00Z",
  },
  {
    id: "proj-6",
    title: "AI Content Moderation Tool",
    description:
      "Build an AI-driven content moderation system that can detect harmful content across text, images, and video in real-time.",
    industry: "ai-ml",
    createdBy: "user-7",
    createdByName: "Kai Peters",
    rolesNeeded: [
      { role: "swe", experience: "senior" },
      { role: "designer", experience: "mid" },
    ],
    teamSize: 3,
    tags: ["Python", "TensorFlow", "NLP", "Computer Vision"],
    createdAt: "2026-02-05T08:00:00Z",
  },
];

// In-memory store (since no DB integration)
let currentUser: UserProfile | null = null;
let projects: Project[] = [...MOCK_PROJECTS];
let teams: Team[] = [];
let chatMessages: ChatMessage[] = [];

export function getCurrentUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("Patch-user");
  if (stored) {
    currentUser = JSON.parse(stored);
    return currentUser;
  }
  return null;
}

export function saveUser(user: UserProfile): void {
  currentUser = user;
  if (typeof window !== "undefined") {
    localStorage.setItem("Patch-user", JSON.stringify(user));
  }
}

export function createUserProfile(data: {
  name: string;
  role: Role;
  experience: ExperienceLevel;
  industries: Industry[];
  workEthic: WorkEthic;
}): UserProfile {
  const user: UserProfile = {
    id: `user-${Date.now()}`,
    name: data.name,
    role: data.role,
    experience: data.experience,
    industries: data.industries,
    workEthic: data.workEthic,
    avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
    onboarded: true,
  };
  saveUser(user);
  return user;
}

export function getProjects(): Project[] {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("Patch-projects");
    if (stored) {
      projects = JSON.parse(stored);
    }
  }
  return projects;
}

export function addProject(project: Project): void {
  projects = [project, ...getProjects()];
  if (typeof window !== "undefined") {
    localStorage.setItem("Patch-projects", JSON.stringify(projects));
  }
}

export function getTeams(): Team[] {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("Patch-teams");
    if (stored) {
      teams = JSON.parse(stored);
    }
  }
  return teams;
}

export function saveTeam(team: Team): void {
  teams = [team, ...getTeams()];
  if (typeof window !== "undefined") {
    localStorage.setItem("Patch-teams", JSON.stringify(teams));
  }
}

export function getTeamById(id: string): Team | undefined {
  return getTeams().find((t) => t.id === id);
}

export function getChatMessages(teamId: string): ChatMessage[] {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(`Patch-chat-${teamId}`);
    if (stored) {
      return JSON.parse(stored);
    }
  }
  return [];
}

export function addChatMessage(message: ChatMessage): void {
  const messages = getChatMessages(message.teamId);
  messages.push(message);
  if (typeof window !== "undefined") {
    localStorage.setItem(
      `Patch-chat-${message.teamId}`,
      JSON.stringify(messages),
    );
  }
}

export function getMockUsers(): UserProfile[] {
  return MOCK_USERS;
}

export function clearUserData(): void {
  currentUser = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("Patch-user");
  }
}
