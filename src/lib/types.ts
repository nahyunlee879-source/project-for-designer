export type LifeArea =
  | "Study"
  | "Language"
  | "Career"
  | "Portfolio"
  | "Creative"
  | "Money"
  | "Life Admin"
  | "Content"
  | "Health"
  | "Long Term";

export type GoalStage =
  | "Planning"
  | "Active"
  | "Building"
  | "Waiting"
  | "Review"
  | "Paused"
  | "Completed"
  | "At Risk";

export type ActionPriority = "Low" | "Medium" | "High" | "Critical";

export type EnergyLevel = "low" | "medium" | "high";

export type ActionStatus = "Queued" | "Today" | "In Progress" | "Waiting" | "Done";

export type ProjectStatus =
  | "Idea"
  | "Planning"
  | "Active"
  | "Blocked"
  | "Review"
  | "Portfolio Ready"
  | "Done"
  | "Paused";

export type ProjectType = "Design" | "Portfolio" | "Freelance" | "App" | "Brand" | "Content" | "Admin";

export type MoneyRecordType = "income" | "expense" | "saving" | "investment" | "subscription" | "freelance";

export type CareerType = "job" | "freelance" | "portfolio" | "SNS" | "platform" | "application";

export type CareerStatus =
  | "Researching"
  | "Preparing"
  | "Drafting"
  | "Applied"
  | "Interview"
  | "Waiting"
  | "Accepted"
  | "Rejected"
  | "Paused";

export type AdminType =
  | "document"
  | "visa"
  | "school"
  | "account"
  | "contract"
  | "certificate"
  | "subscription"
  | "health"
  | "travel";

export type AdminStatus = "Needed" | "Collecting" | "Submitted" | "Waiting" | "Done" | "Expired";

export interface LifeGoal {
  id: string;
  goalTitle: string;
  area: LifeArea;
  whyItMatters: string;
  targetDate: string;
  currentStage: GoalStage;
  nextMilestone: string;
  progressPercentage: number;
  importance: number;
  linkedProjectIds: string[];
  linkedTaskIds: string[];
  linkedMoneyRecordIds: string[];
  linkedDocumentIds: string[];
}

export interface TodayAction {
  id: string;
  actionTitle: string;
  linkedGoalId: string;
  linkedProjectId: string;
  area: LifeArea;
  priority: ActionPriority;
  importance: number;
  estimatedTime: string;
  energyLevel: EnergyLevel;
  dueDate: string;
  status: ActionStatus;
  whyThisMatters: string;
}

export interface OsProject {
  id: string;
  projectTitle: string;
  projectType: ProjectType;
  area: LifeArea;
  purpose: string;
  currentProblem: string;
  nextAction: string;
  portfolioPotential: number;
  monetizationPotential: number;
  careerRelevance: number;
  linkedGoalIds: string[];
  relatedNotes: string;
  status: ProjectStatus;
  deadline: string;
}

export interface StudyRoute {
  id: string;
  subjectLanguage: string;
  area: LifeArea;
  currentLevel: string;
  targetLevel: string;
  studyPurpose: string;
  todaysStudyAction: string;
  reviewItems: string;
  weakPoints: string;
  linkedGoalId: string;
  studyStreak: number;
  notes: string;
}

export interface MoneyRecord {
  id: string;
  recordType: MoneyRecordType;
  amount: number;
  category: string;
  connectedGoalId: string;
  connectedProjectId: string;
  date: string;
  memo: string;
  futureInvestment: boolean;
  wasted: boolean;
}

export interface CareerItem {
  id: string;
  opportunityTitle: string;
  type: CareerType;
  companyPlatform: string;
  status: CareerStatus;
  deadline: string;
  portfolioConnection: string;
  careerRelevance: number;
  nextAction: string;
  notes: string;
  linkedGoalId: string;
  linkedProjectId: string;
}

export interface AdminItem {
  id: string;
  itemTitle: string;
  adminType: AdminType;
  status: AdminStatus;
  deadline: string;
  linkedGoalId: string;
  linkedProjectId: string;
  locationLink: string;
  memo: string;
}

export interface WeeklyReview {
  id: string;
  weekOf: string;
  mostProgressedArea: LifeArea;
  mostNeglectedArea: LifeArea;
  moneySummary: string;
  studySummary: string;
  portfolioCareerSummary: string;
  nextWeekTopThree: string[];
  riskSignals: string;
  routinesToKeep: string;
  progressUpdate: string;
}

export interface WorkroomData {
  goals: LifeGoal[];
  todayActions: TodayAction[];
  projects: OsProject[];
  studyRoutes: StudyRoute[];
  moneyRecords: MoneyRecord[];
  careerItems: CareerItem[];
  adminItems: AdminItem[];
  weeklyReviews: WeeklyReview[];
}

export const LIFE_AREAS: LifeArea[] = [
  "Study",
  "Language",
  "Career",
  "Portfolio",
  "Creative",
  "Money",
  "Life Admin",
  "Content",
  "Health",
  "Long Term",
];

export const GOAL_STAGES: GoalStage[] = [
  "Planning",
  "Active",
  "Building",
  "Waiting",
  "Review",
  "Paused",
  "Completed",
  "At Risk",
];

export const ACTION_PRIORITIES: ActionPriority[] = ["Low", "Medium", "High", "Critical"];

export const ENERGY_LEVELS: EnergyLevel[] = ["low", "medium", "high"];

export const ACTION_STATUSES: ActionStatus[] = ["Queued", "Today", "In Progress", "Waiting", "Done"];

export const PROJECT_TYPES: ProjectType[] = [
  "Design",
  "Portfolio",
  "Freelance",
  "App",
  "Brand",
  "Content",
  "Admin",
];

export const PROJECT_STATUSES: ProjectStatus[] = [
  "Idea",
  "Planning",
  "Active",
  "Blocked",
  "Review",
  "Portfolio Ready",
  "Done",
  "Paused",
];

export const MONEY_RECORD_TYPES: MoneyRecordType[] = [
  "income",
  "expense",
  "saving",
  "investment",
  "subscription",
  "freelance",
];

export const CAREER_TYPES: CareerType[] = ["job", "freelance", "portfolio", "SNS", "platform", "application"];

export const CAREER_STATUSES: CareerStatus[] = [
  "Researching",
  "Preparing",
  "Drafting",
  "Applied",
  "Interview",
  "Waiting",
  "Accepted",
  "Rejected",
  "Paused",
];

export const ADMIN_TYPES: AdminType[] = [
  "document",
  "visa",
  "school",
  "account",
  "contract",
  "certificate",
  "subscription",
  "health",
  "travel",
];

export const ADMIN_STATUSES: AdminStatus[] = ["Needed", "Collecting", "Submitted", "Waiting", "Done", "Expired"];
