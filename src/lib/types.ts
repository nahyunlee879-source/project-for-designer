export type IdeaCategory =
  | "Brand"
  | "Portfolio"
  | "Prompt"
  | "Content"
  | "Career"
  | "Study Abroad"
  | "Language"
  | "Money"
  | "Music/IP";

export type PipelineStatus =
  | "Raw"
  | "Worth Keeping"
  | "Needs Research"
  | "Concept Candidate"
  | "Visual Experiment"
  | "Portfolio Candidate"
  | "Brand System"
  | "Published"
  | "Archived";

export type ProjectStatus =
  | "Idea"
  | "Developing"
  | "Experimenting"
  | "Portfolio Build"
  | "Published"
  | "Paused";

export type ExperimentType =
  | "Prompt"
  | "Visual Direction"
  | "Product Idea"
  | "Portfolio Text"
  | "Content Caption";

export type FailureTag =
  | "too cute"
  | "too generic"
  | "too bridal"
  | "too AI-looking"
  | "too flat"
  | "too commercial"
  | "too vulgar"
  | "brand DNA mismatch"
  | "not portfolio-worthy";

export type PortfolioUsable = "Yes" | "No";

export interface ScoreSet {
  tasteFit: number;
  portfolioPotential: number;
  brandDepth: number;
  monetizationPotential: number;
  careerUsefulness: number;
}

export interface PipelineIdea extends ScoreSet {
  id: string;
  title: string;
  rawIdea: string;
  category: IdeaCategory;
  linkedProjectId: string;
  currentStatus: PipelineStatus;
  nextAction: string;
  reasonWhyThisMatters: string;
  tags: string;
  deadline: string;
}

export interface ProjectStandard {
  id: string;
  title: string;
  rule: string;
  type: "Visual Rule" | "Brand Rule" | "Writing Rule" | "Career Rule";
}

export interface ProjectReference {
  id: string;
  title: string;
  whyItMatters: string;
  borrow: string;
  avoidCopying: string;
  tags: string;
}

export interface ResultReview {
  id: string;
  title: string;
  score: number;
  whatChanged: string;
  decision: string;
}

export interface StudioProject extends ScoreSet {
  id: string;
  name: string;
  status: ProjectStatus;
  deadline: string;
  category: IdeaCategory;
  coreIdentity: string;
  target: string;
  problemIntention: string;
  mustInclude: string;
  mustAvoid: string;
  visualCodes: string;
  portfolioUsage: string;
  deliverables: string;
  nextMoves: string[];
  standards: ProjectStandard[];
  references: ProjectReference[];
  resultReviews: ResultReview[];
}

export interface ExperimentRecord {
  id: string;
  experimentTitle: string;
  linkedProjectId: string;
  experimentType: ExperimentType;
  originalDirection: string;
  revisedDirection: string;
  resultRating: number;
  whatWorked: string;
  whatFailed: string;
  failureTags: FailureTag[];
  nextRevision: string;
  usableForPortfolio: PortfolioUsable;
  createdAt: string;
}

export interface PortfolioSections {
  projectOverview: string;
  problemIntention: string;
  target: string;
  brandSystem: string;
  visualDirection: string;
  experiments: string;
  deliverables: string;
  portfolioDescription: string;
  interviewTalkingPoints: string;
  nextExpansion: string;
}

export interface PortfolioCase {
  id: string;
  projectId: string;
  sections: PortfolioSections;
  updatedAt: string;
}

export interface WorkroomData {
  ideas: PipelineIdea[];
  projects: StudioProject[];
  experiments: ExperimentRecord[];
  portfolioCases: PortfolioCase[];
}

export const IDEA_CATEGORIES: IdeaCategory[] = [
  "Brand",
  "Portfolio",
  "Prompt",
  "Content",
  "Career",
  "Study Abroad",
  "Language",
  "Money",
  "Music/IP",
];

export const PIPELINE_STATUSES: PipelineStatus[] = [
  "Raw",
  "Worth Keeping",
  "Needs Research",
  "Concept Candidate",
  "Visual Experiment",
  "Portfolio Candidate",
  "Brand System",
  "Published",
  "Archived",
];

export const PROJECT_STATUSES: ProjectStatus[] = [
  "Idea",
  "Developing",
  "Experimenting",
  "Portfolio Build",
  "Published",
  "Paused",
];

export const EXPERIMENT_TYPES: ExperimentType[] = [
  "Prompt",
  "Visual Direction",
  "Product Idea",
  "Portfolio Text",
  "Content Caption",
];

export const FAILURE_TAGS: FailureTag[] = [
  "too cute",
  "too generic",
  "too bridal",
  "too AI-looking",
  "too flat",
  "too commercial",
  "too vulgar",
  "brand DNA mismatch",
  "not portfolio-worthy",
];

export const PORTFOLIO_USABLE_OPTIONS: PortfolioUsable[] = ["Yes", "No"];

export const REALISM_LOCK =
  "Human first, styling second. Natural skin texture, subtle asymmetry, realistic hands, flyaway hair, imperfect posture, believable facial expression. Avoid doll-like face, plastic skin, stiff posing, AI-glam perfection.";
