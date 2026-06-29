export type TaskCategory =
  | "Study"
  | "Language"
  | "Design"
  | "Money"
  | "Life Admin"
  | "Career";

export type Priority = "Low" | "Medium" | "High";

export type ProjectType =
  | "Branding"
  | "Portfolio"
  | "K-pop/IP"
  | "Beauty"
  | "Fashion"
  | "Career"
  | "Study Abroad";

export type ProjectStatus = "Idea" | "In Progress" | "Waiting" | "Done";

export type Language = "German" | "English" | "Chinese" | "Korean";

export type LanguageLevel = "A1" | "A2" | "B1" | "B2" | "C1";

export type PromptType = "Image" | "Brand" | "Product" | "Portfolio" | "Music";

export type MoneyType = "income" | "expense";

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  priority: Priority;
  dueDate: string;
  completed: boolean;
}

export interface Project {
  id: string;
  title: string;
  type: ProjectType;
  status: ProjectStatus;
  deadline: string;
  description: string;
  nextAction: string;
}

export interface LanguageNote {
  id: string;
  language: Language;
  original: string;
  meaning: string;
  level: LanguageLevel;
  tags: string;
  reviewDate: string;
}

export interface DesignNote {
  id: string;
  projectName: string;
  brandConcept: string;
  moodKeywords: string;
  colorPalette: string;
  target: string;
  visualDirection: string;
  avoid: string;
}

export interface PromptNote {
  id: string;
  title: string;
  project: string;
  promptText: string;
  type: PromptType;
  score: number;
  memo: string;
  avoidList: string;
}

export interface MoneyRecord {
  id: string;
  type: MoneyType;
  amount: number;
  category: string;
  date: string;
  memo: string;
}

export interface WeeklyReset {
  id: string;
  weekOf: string;
  movedForward: string;
  delayed: string;
  moneySpent: string;
  studied: string;
  designImproved: string;
  nextPriorities: string[];
}

export interface WorkroomData {
  today: {
    priorities: string[];
  };
  tasks: Task[];
  projects: Project[];
  languageNotes: LanguageNote[];
  designNotes: DesignNote[];
  prompts: PromptNote[];
  moneyRecords: MoneyRecord[];
  weeklyResets: WeeklyReset[];
}

export const TASK_CATEGORIES: TaskCategory[] = [
  "Study",
  "Language",
  "Design",
  "Money",
  "Life Admin",
  "Career",
];

export const PRIORITIES: Priority[] = ["Low", "Medium", "High"];

export const PROJECT_TYPES: ProjectType[] = [
  "Branding",
  "Portfolio",
  "K-pop/IP",
  "Beauty",
  "Fashion",
  "Career",
  "Study Abroad",
];

export const PROJECT_STATUSES: ProjectStatus[] = [
  "Idea",
  "In Progress",
  "Waiting",
  "Done",
];

export const LANGUAGES: Language[] = ["German", "English", "Chinese", "Korean"];

export const LANGUAGE_LEVELS: LanguageLevel[] = ["A1", "A2", "B1", "B2", "C1"];

export const PROMPT_TYPES: PromptType[] = [
  "Image",
  "Brand",
  "Product",
  "Portfolio",
  "Music",
];

export const MONEY_TYPES: MoneyType[] = ["income", "expense"];

export const REALISM_LOCK =
  "Human first, styling second. Natural skin texture, subtle asymmetry, realistic hands, flyaway hair, imperfect posture, believable facial expression. Avoid doll-like face, plastic skin, stiff posing, AI-glam perfection.";
