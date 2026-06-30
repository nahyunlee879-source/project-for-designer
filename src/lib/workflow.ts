import type {
  ExperimentRecord,
  FailureTag,
  PipelineIdea,
  PipelineStatus,
  PortfolioSections,
  ScoreSet,
  StudioProject,
  WorkroomData,
} from "./types";

type CommandKind = "idea" | "project" | "experiment";

export interface CommandItem {
  id: string;
  kind: CommandKind;
  title: string;
  source: string;
  detail: string;
  nextAction: string;
  score?: number;
  status?: string;
  tags?: string;
  deadline?: string;
  projectId?: string;
}

export interface CommandRecommendations {
  todaysNextMove: CommandItem | null;
  portfolioWorthyConcepts: CommandItem[];
  conceptsNeedingDecision: CommandItem[];
  recentPromptFailures: CommandItem[];
  highTasteFitIdeas: CommandItem[];
  careerStudyActions: CommandItem[];
}

export interface IdeaRecommendation {
  label: string;
  detail: string;
  tone: "cherry" | "blue" | "silver" | "ink";
}

const SCORE_WEIGHTS: Record<keyof ScoreSet, number> = {
  tasteFit: 0.24,
  portfolioPotential: 0.28,
  brandDepth: 0.22,
  monetizationPotential: 0.1,
  careerUsefulness: 0.16,
};

const STATUS_BOOST: Record<PipelineStatus, number> = {
  Raw: 0,
  "Worth Keeping": 4,
  "Needs Research": 2,
  "Concept Candidate": 8,
  "Visual Experiment": 10,
  "Portfolio Candidate": 16,
  "Brand System": 14,
  Published: 0,
  Archived: -35,
};

const FAILURE_GUIDES: Record<FailureTag, string> = {
  "too cute": "Remove decorative sweetness and replace it with sharper posture, restraint, and clearer attitude.",
  "too generic": "Anchor the direction in one ownable material, behavior, or audience-specific rule.",
  "too bridal": "Reduce wedding-hall signals and move toward private ritual, material texture, and service detail.",
  "too AI-looking": "Add realistic human imperfection, uneven texture, believable hands, and less polished posing.",
  "too flat": "Create contrast through depth, hierarchy, cropping, movement, or a stronger product moment.",
  "too commercial": "Pull back from campaign cliches and use a more editorial, personal, and specific point of view.",
  "too vulgar": "Keep confidence but control exposure, styling, and language so the brand still feels intentional.",
  "brand DNA mismatch": "Return to the project DNA before adding style, and remove any visual that breaks the core identity.",
  "not portfolio-worthy": "Clarify the design decision, the before/after change, and what the reviewer should learn from it.",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function scoreValue(value: number) {
  return clamp(Number.isFinite(value) ? value : 1, 1, 10);
}

function dateUrgency(deadline?: string) {
  if (!deadline) {
    return 0;
  }

  const due = new Date(`${deadline}T00:00:00`).getTime();
  if (Number.isNaN(due)) {
    return 0;
  }

  const now = new Date().setHours(0, 0, 0, 0);
  const days = Math.ceil((due - now) / 86_400_000);
  if (days < 0) {
    return 10;
  }
  if (days <= 3) {
    return 8;
  }
  if (days <= 7) {
    return 5;
  }
  return 0;
}

export function calculatePriorityScore(scores: ScoreSet) {
  const weightedScore = Object.entries(SCORE_WEIGHTS).reduce((total, [key, weight]) => {
    const scoreKey = key as keyof ScoreSet;
    return total + scoreValue(scores[scoreKey]) * weight;
  }, 0);

  return Math.round(clamp(weightedScore * 10, 0, 100));
}

export function calculateIdeaPriority(idea: PipelineIdea) {
  return Math.round(
    clamp(calculatePriorityScore(idea) + STATUS_BOOST[idea.currentStatus] + dateUrgency(idea.deadline), 0, 100),
  );
}

export function calculateProjectPriority(project: StudioProject) {
  return Math.round(clamp(calculatePriorityScore(project) + dateUrgency(project.deadline), 0, 100));
}

export function getIdeaRecommendation(idea: PipelineIdea): IdeaRecommendation {
  const priority = calculateIdeaPriority(idea);

  if (idea.currentStatus === "Archived" || priority < 45) {
    return {
      label: "archive",
      detail: "Low current return. Keep only if it protects a useful taste rule.",
      tone: "silver",
    };
  }

  if (idea.currentStatus === "Portfolio Candidate" || (idea.portfolioPotential >= 8 && priority >= 78)) {
    return {
      label: "portfolio candidate",
      detail: "Strong enough to become a case section or interview example.",
      tone: "cherry",
    };
  }

  if (idea.brandDepth >= 8 && idea.currentStatus !== "Published") {
    return {
      label: "brand system",
      detail: "Turn this into repeatable DNA, rules, references, and prompt tests.",
      tone: "ink",
    };
  }

  if (idea.currentStatus === "Needs Research") {
    return {
      label: "research next",
      detail: "Decode references before investing in visuals.",
      tone: "blue",
    };
  }

  return {
    label: "develop next",
    detail: "Worth another experiment because the score and direction are aligned.",
    tone: "blue",
  };
}

function projectName(projects: StudioProject[], projectId?: string) {
  return projects.find((project) => project.id === projectId)?.name ?? "Unlinked";
}

function ideaToCommandItem(idea: PipelineIdea, projects: StudioProject[]): CommandItem {
  return {
    id: idea.id,
    kind: "idea",
    title: idea.title,
    source: projectName(projects, idea.linkedProjectId),
    detail: idea.reasonWhyThisMatters,
    nextAction: idea.nextAction,
    score: calculateIdeaPriority(idea),
    status: idea.currentStatus,
    tags: idea.tags,
    deadline: idea.deadline,
    projectId: idea.linkedProjectId,
  };
}

function projectToCommandItem(project: StudioProject): CommandItem {
  return {
    id: project.id,
    kind: "project",
    title: project.name,
    source: project.category,
    detail: project.coreIdentity,
    nextAction: project.nextMoves[0] ?? "Choose the next decision this project needs.",
    score: calculateProjectPriority(project),
    status: project.status,
    deadline: project.deadline,
    projectId: project.id,
  };
}

function experimentToCommandItem(experiment: ExperimentRecord, projects: StudioProject[]): CommandItem {
  const failureText = experiment.failureTags.length
    ? experiment.failureTags.join(", ")
    : "needs result review";

  return {
    id: experiment.id,
    kind: "experiment",
    title: experiment.experimentTitle,
    source: projectName(projects, experiment.linkedProjectId),
    detail: `Rating ${experiment.resultRating}/10. Failure signals: ${failureText}.`,
    nextAction: experiment.nextRevision,
    score: experiment.resultRating,
    status: experiment.experimentType,
    tags: failureText,
    projectId: experiment.linkedProjectId,
  };
}

function sortCommandItems(items: CommandItem[]) {
  return [...items].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

export function getCommandRecommendations(data: WorkroomData): CommandRecommendations {
  const activeIdeas = data.ideas.filter((idea) => !["Archived", "Published"].includes(idea.currentStatus));
  const ideaItems = activeIdeas.map((idea) => ideaToCommandItem(idea, data.projects));
  const projectItems = data.projects.map(projectToCommandItem);
  const experimentFailures = data.experiments
    .filter((experiment) => experiment.resultRating <= 7 || experiment.failureTags.length > 0)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((experiment) => experimentToCommandItem(experiment, data.projects));

  const portfolioWorthyConcepts = sortCommandItems([
    ...activeIdeas
      .filter(
        (idea) =>
          idea.currentStatus === "Portfolio Candidate" ||
          idea.portfolioPotential >= 8 ||
          getIdeaRecommendation(idea).label === "portfolio candidate",
      )
      .map((idea) => ideaToCommandItem(idea, data.projects)),
    ...data.projects.filter((project) => project.portfolioPotential >= 8).map(projectToCommandItem),
  ]).slice(0, 5);

  const conceptsNeedingDecision = sortCommandItems([
    ...activeIdeas
      .filter((idea) =>
        ["Worth Keeping", "Needs Research", "Concept Candidate", "Visual Experiment", "Brand System"].includes(
          idea.currentStatus,
        ),
      )
      .map((idea) => ideaToCommandItem(idea, data.projects)),
    ...data.projects
      .filter((project) => ["Idea", "Developing", "Experimenting", "Portfolio Build"].includes(project.status))
      .map(projectToCommandItem),
  ]).slice(0, 5);

  const highTasteFitIdeas = sortCommandItems(
    activeIdeas.filter((idea) => idea.tasteFit >= 8).map((idea) => ideaToCommandItem(idea, data.projects)),
  ).slice(0, 5);

  const careerStudyActions = sortCommandItems([
    ...activeIdeas
      .filter(
        (idea) =>
          ["Career", "Study Abroad", "Language"].includes(idea.category) || idea.careerUsefulness >= 8,
      )
      .map((idea) => ideaToCommandItem(idea, data.projects)),
    ...data.projects.filter((project) => project.careerUsefulness >= 8).map(projectToCommandItem),
  ]).slice(0, 5);

  const todaysNextMove =
    sortCommandItems([
      ...ideaItems.map((item) => ({ ...item, score: (item.score ?? 0) + dateUrgency(item.deadline) })),
      ...projectItems.map((item) => ({ ...item, score: (item.score ?? 0) + dateUrgency(item.deadline) })),
    ])[0] ?? null;

  return {
    todaysNextMove,
    portfolioWorthyConcepts,
    conceptsNeedingDecision,
    recentPromptFailures: experimentFailures.slice(0, 5),
    highTasteFitIdeas,
    careerStudyActions,
  };
}

export function generateNextRevisionDirection(
  experiment: Pick<
    ExperimentRecord,
    "experimentType" | "originalDirection" | "revisedDirection" | "whatFailed" | "failureTags"
  >,
  project?: StudioProject,
) {
  const projectAnchor = project
    ? `${project.name} should protect this DNA: ${project.coreIdentity} Include ${project.mustInclude} Avoid ${project.mustAvoid}`
    : "Protect the linked project DNA before adding style.";
  const failureDirections = experiment.failureTags.length
    ? experiment.failureTags.map((tag) => FAILURE_GUIDES[tag]).join(" ")
    : "Name the exact visual decision that improved the direction and remove anything that does not support it.";
  const revisedAnchor = experiment.revisedDirection || experiment.originalDirection;

  return `${projectAnchor} For the next ${experiment.experimentType.toLowerCase()} revision, start from "${revisedAnchor}". ${failureDirections} End with one concrete output that can be judged in a portfolio review.`;
}

export function buildPortfolioDraft(project: StudioProject, experiments: ExperimentRecord[]): PortfolioSections {
  const linkedExperiments = experiments.filter((experiment) => experiment.linkedProjectId === project.id);
  const usableExperiments = linkedExperiments.filter((experiment) => experiment.usableForPortfolio === "Yes");
  const experimentSummary = linkedExperiments.length
    ? linkedExperiments
        .map(
          (experiment) =>
            `${experiment.experimentTitle}: ${experiment.resultRating}/10. Worked: ${experiment.whatWorked} Failed: ${experiment.whatFailed} Next: ${experiment.nextRevision}`,
        )
        .join("\n")
    : "No experiments are connected yet. Add one in Experiment Lab to make this case less speculative.";
  const referenceSummary = project.references.length
    ? project.references.map((reference) => `${reference.title}: borrow ${reference.borrow}; avoid ${reference.avoidCopying}`).join("\n")
    : "Reference rules are not defined yet.";
  const reviewSummary = project.resultReviews.length
    ? project.resultReviews.map((review) => `${review.title}: ${review.decision}`).join("\n")
    : "No result reviews yet.";

  return {
    projectOverview: `${project.name} is ${project.coreIdentity}`,
    problemIntention: project.problemIntention,
    target: project.target,
    brandSystem: `Core identity: ${project.coreIdentity}\nMust include: ${project.mustInclude}\nMust avoid: ${project.mustAvoid}`,
    visualDirection: `${project.visualCodes}\nReference logic:\n${referenceSummary}`,
    experiments: experimentSummary,
    deliverables: project.deliverables,
    portfolioDescription: `${project.portfolioUsage} Usable experiments: ${usableExperiments.length}/${linkedExperiments.length}.`,
    interviewTalkingPoints: `Explain why this project matters: ${project.problemIntention}\nShow how the DNA controlled decisions: ${project.mustInclude}\nDiscuss result reviews:\n${reviewSummary}`,
    nextExpansion: project.nextMoves.join("\n"),
  };
}
