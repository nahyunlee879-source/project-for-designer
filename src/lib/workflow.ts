import type {
  ActionPriority,
  AdminItem,
  CareerItem,
  LifeArea,
  LifeGoal,
  MoneyRecord,
  OsProject,
  StudyRoute,
  TodayAction,
  WeeklyReview,
  WorkroomData,
} from "./types";

export interface HqItem {
  id: string;
  title: string;
  source: string;
  area: LifeArea;
  detail: string;
  nextAction: string;
  score: number;
  deadline?: string;
  status?: string;
}

export interface MoneySummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  futureSpending: number;
  wastedSpending: number;
  studyAbroadSaved: number;
  studyAbroadTarget: number;
  freelanceIncome: number;
}

export interface LifeHqSummary {
  topPriorities: HqItem[];
  weeklyGoals: LifeGoal[];
  urgentItems: HqItem[];
  neglectedGoals: LifeGoal[];
  studyStatus: HqItem[];
  portfolioStatus: HqItem[];
  moneySummary: MoneySummary;
  careerStudyStatus: HqItem[];
  todaysNextAction: HqItem | null;
  riskSignals: HqItem[];
  latestReview?: WeeklyReview;
}

const PRIORITY_WEIGHT: Record<ActionPriority, number> = {
  Low: 8,
  Medium: 18,
  High: 30,
  Critical: 42,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function daysUntil(date: string) {
  if (!date) {
    return Number.POSITIVE_INFINITY;
  }

  const due = new Date(`${date}T00:00:00`).getTime();
  if (Number.isNaN(due)) {
    return Number.POSITIVE_INFINITY;
  }

  const today = new Date().setHours(0, 0, 0, 0);
  return Math.ceil((due - today) / 86_400_000);
}

export function dateUrgency(date: string) {
  const days = daysUntil(date);
  if (!Number.isFinite(days)) {
    return 0;
  }
  if (days < 0) {
    return 28;
  }
  if (days <= 2) {
    return 25;
  }
  if (days <= 7) {
    return 18;
  }
  if (days <= 21) {
    return 10;
  }
  return 0;
}

export function getGoalById(goals: LifeGoal[], goalId: string) {
  return goals.find((goal) => goal.id === goalId);
}

export function getProjectById(projects: OsProject[], projectId: string) {
  return projects.find((project) => project.id === projectId);
}

export function getGoalRisk(goal: LifeGoal) {
  const days = daysUntil(goal.targetDate);
  const remaining = 100 - goal.progressPercentage;

  if (goal.currentStage === "Completed") {
    return { level: "stable", score: 0, label: "complete" };
  }

  const timePressure =
    days < 0 ? 45 : days <= 14 ? 34 : days <= 45 ? 24 : days <= 90 ? 15 : days <= 180 ? 8 : 0;
  const progressPressure =
    goal.progressPercentage < 20 ? 30 : goal.progressPercentage < 40 ? 20 : goal.progressPercentage < 65 ? 10 : 0;
  const pausedPressure = goal.currentStage === "Paused" || goal.currentStage === "Waiting" ? 16 : 0;
  const score = clamp(timePressure + progressPressure + pausedPressure + goal.importance * 2, 0, 100);

  if (score >= 72 || (days <= 45 && remaining >= 60)) {
    return { level: "high", score, label: "at risk" };
  }
  if (score >= 50) {
    return { level: "medium", score, label: "watch" };
  }
  return { level: "low", score, label: "steady" };
}

export function calculateActionPriority(action: TodayAction, goals: LifeGoal[], projects: OsProject[]) {
  const goal = getGoalById(goals, action.linkedGoalId);
  const project = getProjectById(projects, action.linkedProjectId);
  const goalBoost = goal ? goal.importance * 4 + getGoalRisk(goal).score * 0.18 : 0;
  const projectBoost = project ? project.careerRelevance * 2 + project.portfolioPotential * 1.2 : 0;
  const statusBoost = action.status === "Today" ? 12 : action.status === "In Progress" ? 8 : 0;

  return Math.round(
    clamp(
      PRIORITY_WEIGHT[action.priority] +
        action.importance * 3 +
        dateUrgency(action.dueDate) +
        goalBoost +
        projectBoost +
        statusBoost,
      0,
      100,
    ),
  );
}

export function calculateProjectPriority(project: OsProject, goals: LifeGoal[]) {
  const linkedGoalBoost = project.linkedGoalIds.reduce((total, goalId) => {
    const goal = getGoalById(goals, goalId);
    return total + (goal ? goal.importance * 2 + getGoalRisk(goal).score * 0.1 : 0);
  }, 0);

  return Math.round(
    clamp(
      project.portfolioPotential * 2.4 +
        project.monetizationPotential * 1.4 +
        project.careerRelevance * 2.2 +
        dateUrgency(project.deadline) +
        linkedGoalBoost,
      0,
      100,
    ),
  );
}

export function getMoneySummary(records: MoneyRecord[]): MoneySummary {
  const incomeTypes = new Set<MoneyRecord["recordType"]>(["income", "saving", "freelance"]);
  const totalIncome = records
    .filter((record) => incomeTypes.has(record.recordType))
    .reduce((total, record) => total + record.amount, 0);
  const totalExpense = records
    .filter((record) => !incomeTypes.has(record.recordType))
    .reduce((total, record) => total + record.amount, 0);
  const futureSpending = records
    .filter((record) => record.futureInvestment)
    .reduce((total, record) => total + record.amount, 0);
  const wastedSpending = records
    .filter((record) => record.wasted)
    .reduce((total, record) => total + record.amount, 0);
  const studyAbroadSaved = records
    .filter((record) => record.connectedGoalId === "goal-study-abroad-savings")
    .reduce((total, record) => total + (incomeTypes.has(record.recordType) ? record.amount : -record.amount), 0);
  const freelanceIncome = records
    .filter((record) => record.recordType === "freelance" || record.category.toLowerCase().includes("freelance"))
    .reduce((total, record) => total + record.amount, 0);

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    futureSpending,
    wastedSpending,
    studyAbroadSaved,
    studyAbroadTarget: 1_600_000,
    freelanceIncome,
  };
}

function actionToHqItem(action: TodayAction, data: WorkroomData): HqItem {
  const goal = getGoalById(data.goals, action.linkedGoalId);
  const project = getProjectById(data.projects, action.linkedProjectId);

  return {
    id: action.id,
    title: action.actionTitle,
    source: project?.projectTitle ?? goal?.goalTitle ?? "Unlinked",
    area: action.area,
    detail: action.whyThisMatters,
    nextAction: action.status === "Done" ? "Already done. Capture the progress update." : action.whyThisMatters,
    score: calculateActionPriority(action, data.goals, data.projects),
    deadline: action.dueDate,
    status: action.status,
  };
}

function projectToHqItem(project: OsProject, data: WorkroomData): HqItem {
  return {
    id: project.id,
    title: project.projectTitle,
    source: project.projectType,
    area: project.area,
    detail: project.currentProblem,
    nextAction: project.nextAction,
    score: calculateProjectPriority(project, data.goals),
    deadline: project.deadline,
    status: project.status,
  };
}

function adminToHqItem(item: AdminItem, data: WorkroomData): HqItem {
  const goal = getGoalById(data.goals, item.linkedGoalId);

  return {
    id: item.id,
    title: item.itemTitle,
    source: goal?.goalTitle ?? item.adminType,
    area: "Life Admin",
    detail: item.memo,
    nextAction: `Open ${item.locationLink} and move status from ${item.status}.`,
    score: clamp(dateUrgency(item.deadline) + (goal?.importance ?? 5) * 6, 0, 100),
    deadline: item.deadline,
    status: item.status,
  };
}

function careerToHqItem(item: CareerItem, data: WorkroomData): HqItem {
  const project = getProjectById(data.projects, item.linkedProjectId);

  return {
    id: item.id,
    title: item.opportunityTitle,
    source: item.companyPlatform,
    area: "Career",
    detail: item.portfolioConnection,
    nextAction: item.nextAction,
    score: clamp(item.careerRelevance * 7 + dateUrgency(item.deadline) + (project?.portfolioPotential ?? 0) * 1.5, 0, 100),
    deadline: item.deadline,
    status: item.status,
  };
}

function studyToHqItem(route: StudyRoute, data: WorkroomData): HqItem {
  const goal = getGoalById(data.goals, route.linkedGoalId);

  return {
    id: route.id,
    title: route.subjectLanguage,
    source: `${route.currentLevel} -> ${route.targetLevel}`,
    area: route.area,
    detail: route.weakPoints,
    nextAction: route.todaysStudyAction,
    score: clamp((goal?.importance ?? 6) * 7 + route.studyStreak * 1.5 + (goal ? getGoalRisk(goal).score * 0.2 : 0), 0, 100),
    status: `${route.studyStreak} day streak`,
  };
}

function sortItems(items: HqItem[]) {
  return [...items].sort((a, b) => b.score - a.score);
}

export function getLifeHqSummary(data: WorkroomData): LifeHqSummary {
  const actionItems = data.todayActions
    .filter((action) => action.status !== "Done")
    .map((action) => actionToHqItem(action, data));
  const projectItems = data.projects.map((project) => projectToHqItem(project, data));
  const adminItems = data.adminItems
    .filter((item) => item.status !== "Done")
    .map((item) => adminToHqItem(item, data));
  const careerItems = data.careerItems.map((item) => careerToHqItem(item, data));
  const studyItems = data.studyRoutes.map((route) => studyToHqItem(route, data));
  const allDecisionItems = [...actionItems, ...projectItems, ...adminItems, ...careerItems, ...studyItems];

  const neglectedGoals = [...data.goals]
    .filter((goal) => goal.currentStage !== "Completed")
    .sort((a, b) => {
      const aLinks = a.linkedTaskIds.length + a.linkedProjectIds.length + a.linkedDocumentIds.length;
      const bLinks = b.linkedTaskIds.length + b.linkedProjectIds.length + b.linkedDocumentIds.length;
      return a.progressPercentage - b.progressPercentage || aLinks - bLinks;
    })
    .slice(0, 4);

  const riskSignals = data.goals
    .map((goal) => {
      const risk = getGoalRisk(goal);
      return {
        id: goal.id,
        title: goal.goalTitle,
        source: goal.currentStage,
        area: goal.area,
        detail: `${goal.progressPercentage}% progress, target ${goal.targetDate}. Risk level: ${risk.label}.`,
        nextAction: goal.nextMilestone,
        score: risk.score,
        deadline: goal.targetDate,
        status: risk.label,
      };
    })
    .filter((item) => item.score >= 45);

  return {
    topPriorities: sortItems(actionItems).slice(0, 3),
    weeklyGoals: [...data.goals]
      .filter((goal) => goal.currentStage !== "Completed")
      .sort((a, b) => b.importance - a.importance || getGoalRisk(b).score - getGoalRisk(a).score)
      .slice(0, 3),
    urgentItems: sortItems([...actionItems, ...adminItems, ...careerItems].filter((item) => dateUrgency(item.deadline ?? "") >= 10)).slice(0, 5),
    neglectedGoals,
    studyStatus: sortItems(studyItems).slice(0, 3),
    portfolioStatus: sortItems(projectItems.filter((item) => item.area === "Portfolio" || item.area === "Creative")).slice(0, 4),
    moneySummary: getMoneySummary(data.moneyRecords),
    careerStudyStatus: sortItems([...careerItems, ...studyItems]).slice(0, 5),
    todaysNextAction: sortItems(allDecisionItems)[0] ?? null,
    riskSignals: sortItems(riskSignals).slice(0, 5),
    latestReview: [...data.weeklyReviews].sort((a, b) => b.weekOf.localeCompare(a.weekOf))[0],
  };
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(value);
}
