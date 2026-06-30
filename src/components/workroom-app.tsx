"use client";

import {
  AlertTriangle,
  Archive,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle2,
  CircleDot,
  Command,
  FileText,
  Folder,
  GraduationCap,
  Plus,
  RefreshCw,
  Save,
  Target,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { type Dispatch, type FormEvent, type ReactNode, type SetStateAction, useMemo, useState } from "react";

import { useWorkroomData } from "@/lib/storage";
import {
  ACTION_PRIORITIES,
  ACTION_STATUSES,
  ADMIN_STATUSES,
  ADMIN_TYPES,
  CAREER_STATUSES,
  CAREER_TYPES,
  ENERGY_LEVELS,
  GOAL_STAGES,
  LIFE_AREAS,
  MONEY_RECORD_TYPES,
  PROJECT_STATUSES,
  PROJECT_TYPES,
  type ActionPriority,
  type ActionStatus,
  type AdminItem,
  type AdminStatus,
  type AdminType,
  type CareerItem,
  type CareerStatus,
  type CareerType,
  type EnergyLevel,
  type GoalStage,
  type LifeArea,
  type LifeGoal,
  type MoneyRecord,
  type MoneyRecordType,
  type OsProject,
  type ProjectStatus,
  type ProjectType,
  type StudyRoute,
  type TodayAction,
  type WeeklyReview,
  type WorkroomData,
} from "@/lib/types";
import {
  calculateActionPriority,
  calculateProjectPriority,
  daysUntil,
  formatMoney,
  getGoalById,
  getGoalRisk,
  getLifeHqSummary,
  getProjectById,
  type HqItem,
} from "@/lib/workflow";

type ViewKey =
  | "hq"
  | "goals"
  | "today"
  | "projects"
  | "study"
  | "money"
  | "career"
  | "admin"
  | "review";

const NAV_ITEMS: Array<{
  key: ViewKey;
  title: string;
  short: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    key: "hq",
    title: "Life HQ",
    short: "HQ",
    description: "The command surface for goals, actions, money, study, portfolio, career, and admin risk.",
    icon: Command,
  },
  {
    key: "goals",
    title: "Goal Map",
    short: "Goals",
    description: "Long-term goals with linked projects, actions, money records, and documents.",
    icon: Target,
  },
  {
    key: "today",
    title: "Today Engine",
    short: "Today",
    description: "Daily actions descending from goals and projects, scored by importance and deadline.",
    icon: CheckCircle2,
  },
  {
    key: "projects",
    title: "Project Rooms",
    short: "Rooms",
    description: "Design, portfolio, freelance, brand, app, and content projects connected to life goals.",
    icon: Folder,
  },
  {
    key: "study",
    title: "Study & Language Route",
    short: "Study",
    description: "Study paths, weak points, review loops, and language routes tied to larger goals.",
    icon: GraduationCap,
  },
  {
    key: "money",
    title: "Money Strategy",
    short: "Money",
    description: "Goal-based money records, future investment, waste, savings, and freelance income.",
    icon: Wallet,
  },
  {
    key: "career",
    title: "Career & Portfolio Tracker",
    short: "Career",
    description: "Applications, platforms, SNS, portfolio moves, and freelance opportunities.",
    icon: Briefcase,
  },
  {
    key: "admin",
    title: "Life Admin Vault",
    short: "Vault",
    description: "Documents, visa, school, account, certificate, subscription, health, and travel admin.",
    icon: Archive,
  },
  {
    key: "review",
    title: "Weekly Life Review",
    short: "Review",
    description: "Weekly progress, neglected areas, money/study summaries, next priorities, and routines.",
    icon: BookOpen,
  },
];

const inputClass =
  "w-full rounded-none border border-silver/60 bg-paper/80 px-3 py-2 text-sm text-ink outline-none transition placeholder:text-graphite/50 focus:border-cherry focus:bg-white";
const textareaClass = `${inputClass} min-h-[108px] resize-y leading-6`;
const labelClass = "text-[10px] font-semibold uppercase tracking-[0.16em] text-graphite";

function todayISO() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function clampScore(value: number) {
  return Math.min(10, Math.max(1, Number.isFinite(value) ? value : 1));
}

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
}

function namesFromIds<T extends { id: string }>(items: T[], ids: string[], getName: (item: T) => string) {
  return ids
    .map((id) => items.find((item) => item.id === id))
    .filter((item): item is T => Boolean(item))
    .map(getName);
}

function emptyGoalForm(): Omit<LifeGoal, "id"> {
  return {
    goalTitle: "",
    area: "Long Term",
    whyItMatters: "",
    targetDate: todayISO(),
    currentStage: "Planning",
    nextMilestone: "",
    progressPercentage: 0,
    importance: 7,
    linkedProjectIds: [],
    linkedTaskIds: [],
    linkedMoneyRecordIds: [],
    linkedDocumentIds: [],
  };
}

function emptyActionForm(data: WorkroomData): Omit<TodayAction, "id"> {
  return {
    actionTitle: "",
    linkedGoalId: data.goals[0]?.id ?? "",
    linkedProjectId: data.projects[0]?.id ?? "",
    area: "Long Term",
    priority: "Medium",
    importance: 7,
    estimatedTime: "30 min",
    energyLevel: "medium",
    dueDate: todayISO(),
    status: "Today",
    whyThisMatters: "",
  };
}

function emptyProjectForm(data: WorkroomData): Omit<OsProject, "id"> {
  return {
    projectTitle: "",
    projectType: "Design",
    area: "Creative",
    purpose: "",
    currentProblem: "",
    nextAction: "",
    portfolioPotential: 7,
    monetizationPotential: 5,
    careerRelevance: 7,
    linkedGoalIds: data.goals[0]?.id ? [data.goals[0].id] : [],
    relatedNotes: "",
    status: "Planning",
    deadline: todayISO(),
  };
}

function emptyStudyForm(data: WorkroomData): Omit<StudyRoute, "id"> {
  return {
    subjectLanguage: "",
    area: "Language",
    currentLevel: "",
    targetLevel: "",
    studyPurpose: "",
    todaysStudyAction: "",
    reviewItems: "",
    weakPoints: "",
    linkedGoalId: data.goals[0]?.id ?? "",
    studyStreak: 0,
    notes: "",
  };
}

function emptyMoneyForm(data: WorkroomData): Omit<MoneyRecord, "id"> {
  return {
    recordType: "expense",
    amount: 0,
    category: "",
    connectedGoalId: data.goals[0]?.id ?? "",
    connectedProjectId: "",
    date: todayISO(),
    memo: "",
    futureInvestment: true,
    wasted: false,
  };
}

function emptyCareerForm(data: WorkroomData): Omit<CareerItem, "id"> {
  return {
    opportunityTitle: "",
    type: "application",
    companyPlatform: "",
    status: "Preparing",
    deadline: todayISO(),
    portfolioConnection: "",
    careerRelevance: 7,
    nextAction: "",
    notes: "",
    linkedGoalId: data.goals[0]?.id ?? "",
    linkedProjectId: data.projects[0]?.id ?? "",
  };
}

function emptyAdminForm(data: WorkroomData): Omit<AdminItem, "id"> {
  return {
    itemTitle: "",
    adminType: "document",
    status: "Needed",
    deadline: todayISO(),
    linkedGoalId: data.goals[0]?.id ?? "",
    linkedProjectId: "",
    locationLink: "",
    memo: "",
  };
}

function emptyReviewForm(): Omit<WeeklyReview, "id"> {
  return {
    weekOf: todayISO(),
    mostProgressedArea: "Portfolio",
    mostNeglectedArea: "Health",
    moneySummary: "",
    studySummary: "",
    portfolioCareerSummary: "",
    nextWeekTopThree: ["", "", ""],
    riskSignals: "",
    routinesToKeep: "",
    progressUpdate: "",
  };
}

export function WorkroomApp() {
  const { data, setData, isReady, resetData } = useWorkroomData();
  const [activeView, setActiveView] = useState<ViewKey>("hq");
  const activeMeta = NAV_ITEMS.find((item) => item.key === activeView) ?? NAV_ITEMS[0];

  return (
    <div className="min-h-screen bg-ivory text-ink">
      <div className="mx-auto flex max-w-[1720px]">
        <aside className="sticky top-0 hidden h-screen w-[292px] shrink-0 border-r border-silver/40 bg-paper/72 px-5 py-6 backdrop-blur lg:block">
          <div className="border-b border-silver/50 pb-6">
            <p className={labelClass}>Personal life operating system</p>
            <h1 className="mt-4 text-4xl font-semibold leading-none tracking-normal">NAYUL OS</h1>
            <p className="mt-4 text-sm leading-6 text-graphite">
              Long-term goals, projects, milestones, today actions, money, documents, and reviews in one quiet command
              room.
            </p>
          </div>

          <nav className="mt-6 space-y-2">
            {NAV_ITEMS.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeView === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveView(item.key)}
                  className={`group flex w-full items-start gap-3 border px-3 py-3 text-left transition ${
                    isActive
                      ? "border-cherry/45 bg-ivory text-ink shadow-insetline"
                      : "border-transparent text-graphite hover:border-silver/50 hover:bg-mist/70 hover:text-ink"
                  }`}
                >
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center border border-silver/60 bg-paper text-ink">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-[10px] uppercase tracking-[0.18em] text-silver">
                      0{index + 1}
                    </span>
                    <span className="block text-sm font-semibold">{item.title}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={resetData}
            className="mt-6 flex w-full items-center justify-center gap-2 border border-silver/60 bg-paper px-3 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-graphite transition hover:border-cherry/40 hover:text-cherry"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset sample OS
          </button>
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-28 pt-4 sm:px-6 lg:px-10 lg:pb-14">
          <TopBar activeMeta={activeMeta} />

          {!isReady ? (
            <Panel className="mt-5 p-8">
              <p className={labelClass}>Loading OS</p>
              <p className="mt-3 text-lg text-graphite">Opening the private life operating system.</p>
            </Panel>
          ) : (
            <div className="mt-5">
              {activeView === "hq" && <LifeHQ data={data} setActiveView={setActiveView} />}
              {activeView === "goals" && <GoalMap data={data} setData={setData} />}
              {activeView === "today" && <TodayEngine data={data} setData={setData} />}
              {activeView === "projects" && <ProjectRooms data={data} setData={setData} />}
              {activeView === "study" && <StudyLanguageRoute data={data} setData={setData} />}
              {activeView === "money" && <MoneyStrategy data={data} setData={setData} />}
              {activeView === "career" && <CareerPortfolioTracker data={data} setData={setData} />}
              {activeView === "admin" && <LifeAdminVault data={data} setData={setData} />}
              {activeView === "review" && <WeeklyLifeReview data={data} setData={setData} />}
            </div>
          )}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-silver/50 bg-paper/95 px-2 py-2 shadow-editorial backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl gap-1 overflow-x-auto soft-scrollbar">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveView(item.key)}
                className={`flex min-h-[58px] min-w-[72px] flex-col items-center justify-center gap-1 border px-2 text-[10px] font-semibold transition ${
                  isActive
                    ? "border-cherry/45 bg-ivory text-cherry"
                    : "border-transparent text-graphite hover:border-silver/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="max-w-full truncate">{item.short}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function TopBar({ activeMeta }: { activeMeta: (typeof NAV_ITEMS)[number] }) {
  const Icon = activeMeta.icon;

  return (
    <header className="border-b border-silver/50 pb-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center border border-silver/60 bg-paper">
              <Icon className="h-5 w-5 text-cherry" />
            </span>
            <p className={labelClass}>Long-term goal to daily action</p>
          </div>
          <h2 className="mt-4 text-4xl font-semibold leading-none tracking-normal sm:text-5xl">
            {activeMeta.title}
          </h2>
          <p className="mt-4 max-w-4xl text-sm leading-6 text-graphite">{activeMeta.description}</p>
        </div>
      </div>
    </header>
  );
}

function LifeHQ({ data, setActiveView }: { data: WorkroomData; setActiveView: (view: ViewKey) => void }) {
  const summary = useMemo(() => getLifeHqSummary(data), [data]);
  const savingsPercent = Math.round((summary.moneySummary.studyAbroadSaved / summary.moneySummary.studyAbroadTarget) * 100);

  return (
    <div className="space-y-5">
      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Panel className="relative overflow-hidden p-6 sm:p-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cherry via-blue to-silver" />
          <p className={labelClass}>Today&apos;s next action</p>
          <h3 className="mt-5 max-w-4xl break-words text-3xl font-semibold leading-tight tracking-normal sm:text-6xl">
            {summary.todaysNextAction?.title ?? "Choose one life move"}
          </h3>
          <p className="mt-5 max-w-3xl break-words text-base leading-7 text-graphite">
            {summary.todaysNextAction?.detail ??
              "Add a goal, project, or today action to let NAYUL OS calculate the next move."}
          </p>
          <div className="mt-8 grid gap-4 border-t border-silver/50 pt-5 md:grid-cols-[1fr_220px] md:items-end">
            <div>
              <StatusBadge tone="blue">{summary.todaysNextAction?.source ?? "No linked source"}</StatusBadge>
                <p className="mt-3 break-words text-sm leading-6 text-graphite">
                {summary.todaysNextAction?.nextAction ?? "Open Goal Map and define the next milestone."}
              </p>
            </div>
            <PriorityMeter value={summary.todaysNextAction?.score ?? 0} label="OS priority" />
          </div>
          <button
            type="button"
            onClick={() => setActiveView("today")}
            className="mt-6 inline-flex items-center gap-2 border border-cherry/40 bg-cherry px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-ink"
          >
            Open Today Engine
            <CircleDot className="h-4 w-4" />
          </button>
        </Panel>

        <Panel className="p-5">
          <p className={labelClass}>Life OS signals</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Metric label="Goals" value={data.goals.length} />
            <Metric label="Actions" value={data.todayActions.length} />
            <Metric label="Projects" value={data.projects.length} />
            <Metric label="Admin" value={data.adminItems.length} />
          </div>
          <div className="mt-5 border-t border-silver/50 pt-5">
            <p className={labelClass}>Study abroad saving progress</p>
            <p className="mt-3 text-2xl font-semibold">{savingsPercent}%</p>
            <Meter value={savingsPercent} />
            <p className="mt-2 text-sm text-graphite">
              {formatMoney(summary.moneySummary.studyAbroadSaved)} / {formatMoney(summary.moneySummary.studyAbroadTarget)}
            </p>
          </div>
        </Panel>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <HqList title="오늘의 핵심 우선순위 3개" eyebrow="Top three" items={summary.topPriorities} icon={Target} />
        <GoalList title="이번 주 핵심 목표" goals={summary.weeklyGoals} />
        <HqList title="마감 임박 항목" eyebrow="Deadline pressure" items={summary.urgentItems} icon={Calendar} />
        <GoalList title="방치된 목표" goals={summary.neglectedGoals} tone="cherry" />
        <HqList title="공부 상태" eyebrow="Study route" items={summary.studyStatus} icon={GraduationCap} />
        <HqList title="포폴 상태" eyebrow="Portfolio engine" items={summary.portfolioStatus} icon={FileText} />
        <MoneyPanel summary={summary.moneySummary} />
        <HqList title="취업/유학 상태" eyebrow="Career and study" items={summary.careerStudyStatus} icon={Briefcase} />
        <HqList title="위험 신호" eyebrow="Mock risk logic" items={summary.riskSignals} icon={AlertTriangle} />
      </section>

      {summary.latestReview && (
        <Panel className="p-5">
          <p className={labelClass}>Latest weekly review / {summary.latestReview.weekOf}</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <InfoBlock title="Progress update" body={summary.latestReview.progressUpdate} />
            <InfoBlock title="Risk signals" body={summary.latestReview.riskSignals} tone="cherry" />
            <InfoBlock title="Routines to keep" body={summary.latestReview.routinesToKeep} tone="blue" />
          </div>
        </Panel>
      )}
    </div>
  );
}

function GoalMap({
  data,
  setData,
}: {
  data: WorkroomData;
  setData: Dispatch<SetStateAction<WorkroomData>>;
}) {
  const [form, setForm] = useState<Omit<LifeGoal, "id">>(() => emptyGoalForm());

  function updateGoal(id: string, patch: Partial<LifeGoal>) {
    setData((current) => ({
      ...current,
      goals: current.goals.map((goal) => (goal.id === id ? { ...goal, ...patch } : goal)),
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.goalTitle.trim()) {
      return;
    }
    const goal: LifeGoal = {
      ...form,
      id: createId("goal"),
      progressPercentage: clampPercent(form.progressPercentage),
      importance: clampScore(form.importance),
    };
    setData((current) => ({ ...current, goals: [goal, ...current.goals] }));
    setForm(emptyGoalForm());
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
      <Panel className="p-5">
        <p className={labelClass}>Long-term Goal &rarr; Milestone</p>
        <h3 className="mt-3 text-3xl font-semibold">Add goal</h3>
        <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
          <Field label="Goal title">
            <input className={inputClass} value={form.goalTitle} onChange={(event) => setForm({ ...form, goalTitle: event.target.value })} />
          </Field>
          <Field label="Why it matters">
            <textarea className={textareaClass} value={form.whyItMatters} onChange={(event) => setForm({ ...form, whyItMatters: event.target.value })} />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField label="Life area" value={form.area} options={LIFE_AREAS} onChange={(value) => setForm({ ...form, area: value as LifeArea })} />
            <SelectField label="Current stage" value={form.currentStage} options={GOAL_STAGES} onChange={(value) => setForm({ ...form, currentStage: value as GoalStage })} />
            <Field label="Target date">
              <input className={inputClass} type="date" value={form.targetDate} onChange={(event) => setForm({ ...form, targetDate: event.target.value })} />
            </Field>
            <NumberField label="Progress %" value={form.progressPercentage} onChange={(value) => setForm({ ...form, progressPercentage: value })} min={0} max={100} />
          </div>
          <Field label="Next milestone">
            <textarea className={textareaClass} value={form.nextMilestone} onChange={(event) => setForm({ ...form, nextMilestone: event.target.value })} />
          </Field>
          <NumberField label="Importance 1-10" value={form.importance} onChange={(value) => setForm({ ...form, importance: value })} />
          <button className="inline-flex items-center justify-center gap-2 border border-cherry/40 bg-cherry px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-ink">
            <Plus className="h-4 w-4" />
            Add goal
          </button>
        </form>
      </Panel>

      <div className="grid gap-4">
        {data.goals.map((goal) => {
          const risk = getGoalRisk(goal);
          const projectNames = namesFromIds(data.projects, goal.linkedProjectIds, (project) => project.projectTitle);
          const actionNames = namesFromIds(data.todayActions, goal.linkedTaskIds, (action) => action.actionTitle);
          const moneyNames = namesFromIds(data.moneyRecords, goal.linkedMoneyRecordIds, (record) => record.category);
          const docNames = namesFromIds(data.adminItems, goal.linkedDocumentIds, (item) => item.itemTitle);
          return (
            <Panel key={goal.id} className="p-5">
              <div className="grid gap-4 lg:grid-cols-[1fr_180px]">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge tone="blue">{goal.area}</StatusBadge>
                    <StatusBadge tone={risk.level === "high" ? "cherry" : risk.level === "medium" ? "blue" : "silver"}>
                      {risk.label}
                    </StatusBadge>
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold">{goal.goalTitle}</h3>
                  <p className="mt-2 text-sm leading-6 text-graphite">{goal.whyItMatters}</p>
                </div>
                <PriorityMeter value={goal.progressPercentage} label="progress" />
              </div>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <InfoBlock title="Next milestone" body={goal.nextMilestone} />
                <InfoBlock title="Linked projects" body={projectNames.join("\n") || "No linked project yet."} />
                <InfoBlock title="Linked tasks" body={actionNames.join("\n") || "No linked task yet."} />
                <InfoBlock title="Linked money / documents" body={[...moneyNames, ...docNames].join("\n") || "No linked record yet."} />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <SelectField label="Stage" value={goal.currentStage} options={GOAL_STAGES} onChange={(value) => updateGoal(goal.id, { currentStage: value as GoalStage })} />
                <NumberField label="Progress %" value={goal.progressPercentage} onChange={(value) => updateGoal(goal.id, { progressPercentage: clampPercent(value) })} min={0} max={100} />
                <Field label="Target date">
                  <input className={inputClass} type="date" value={goal.targetDate} onChange={(event) => updateGoal(goal.id, { targetDate: event.target.value })} />
                </Field>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}

function TodayEngine({
  data,
  setData,
}: {
  data: WorkroomData;
  setData: Dispatch<SetStateAction<WorkroomData>>;
}) {
  const [form, setForm] = useState<Omit<TodayAction, "id">>(() => emptyActionForm(data));

  function updateAction(id: string, patch: Partial<TodayAction>) {
    setData((current) => ({
      ...current,
      todayActions: current.todayActions.map((action) => (action.id === id ? { ...action, ...patch } : action)),
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.actionTitle.trim()) {
      return;
    }
    setData((current) => ({
      ...current,
      todayActions: [{ ...form, id: createId("action"), importance: clampScore(form.importance) }, ...current.todayActions],
    }));
    setForm(emptyActionForm(data));
  }

  const sortedActions = [...data.todayActions].sort(
    (a, b) => calculateActionPriority(b, data.goals, data.projects) - calculateActionPriority(a, data.goals, data.projects),
  );

  return (
    <div className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
      <Panel className="p-5">
        <p className={labelClass}>Goal &rarr; Project &rarr; Today Action</p>
        <h3 className="mt-3 text-3xl font-semibold">Add today action</h3>
        <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
          <Field label="Action title">
            <input className={inputClass} value={form.actionTitle} onChange={(event) => setForm({ ...form, actionTitle: event.target.value })} />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField label="Linked goal" value={form.linkedGoalId} options={data.goals.map((goal) => goal.id)} labels={Object.fromEntries(data.goals.map((goal) => [goal.id, goal.goalTitle]))} onChange={(value) => setForm({ ...form, linkedGoalId: value })} />
            <SelectField label="Linked project" value={form.linkedProjectId} options={["", ...data.projects.map((project) => project.id)]} labels={Object.fromEntries([["", "No project"], ...data.projects.map((project) => [project.id, project.projectTitle])])} onChange={(value) => setForm({ ...form, linkedProjectId: value })} />
            <SelectField label="Area" value={form.area} options={LIFE_AREAS} onChange={(value) => setForm({ ...form, area: value as LifeArea })} />
            <SelectField label="Priority" value={form.priority} options={ACTION_PRIORITIES} onChange={(value) => setForm({ ...form, priority: value as ActionPriority })} />
            <Field label="Estimated time">
              <input className={inputClass} value={form.estimatedTime} onChange={(event) => setForm({ ...form, estimatedTime: event.target.value })} />
            </Field>
            <SelectField label="Energy" value={form.energyLevel} options={ENERGY_LEVELS} onChange={(value) => setForm({ ...form, energyLevel: value as EnergyLevel })} />
            <Field label="Due date">
              <input className={inputClass} type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} />
            </Field>
            <SelectField label="Status" value={form.status} options={ACTION_STATUSES} onChange={(value) => setForm({ ...form, status: value as ActionStatus })} />
          </div>
          <NumberField label="Importance 1-10" value={form.importance} onChange={(value) => setForm({ ...form, importance: value })} />
          <Field label="Why this matters">
            <textarea className={textareaClass} value={form.whyThisMatters} onChange={(event) => setForm({ ...form, whyThisMatters: event.target.value })} />
          </Field>
          <button className="inline-flex items-center justify-center gap-2 border border-cherry/40 bg-cherry px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-ink">
            <Plus className="h-4 w-4" />
            Add action
          </button>
        </form>
      </Panel>

      <div className="grid gap-4">
        {sortedActions.map((action) => {
          const goal = getGoalById(data.goals, action.linkedGoalId);
          const project = getProjectById(data.projects, action.linkedProjectId);
          const score = calculateActionPriority(action, data.goals, data.projects);
          return (
            <Panel key={action.id} className="p-5">
              <div className="grid gap-4 lg:grid-cols-[1fr_180px]">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge tone="blue">{action.area}</StatusBadge>
                    <StatusBadge>{action.priority}</StatusBadge>
                    <StatusBadge tone="silver">due {action.dueDate}</StatusBadge>
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold">{action.actionTitle}</h3>
                  <p className="mt-2 text-sm leading-6 text-graphite">{action.whyThisMatters}</p>
                </div>
                <PriorityMeter value={score} label="priority" />
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <InfoBlock title="Linked goal" body={goal?.goalTitle ?? "No goal"} />
                <InfoBlock title="Linked project" body={project?.projectTitle ?? "No project"} />
                <InfoBlock title="Energy / time" body={`${action.energyLevel} energy\n${action.estimatedTime}`} />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <SelectField label="Status" value={action.status} options={ACTION_STATUSES} onChange={(value) => updateAction(action.id, { status: value as ActionStatus })} />
                <SelectField label="Priority" value={action.priority} options={ACTION_PRIORITIES} onChange={(value) => updateAction(action.id, { priority: value as ActionPriority })} />
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}

function ProjectRooms({
  data,
  setData,
}: {
  data: WorkroomData;
  setData: Dispatch<SetStateAction<WorkroomData>>;
}) {
  const [form, setForm] = useState<Omit<OsProject, "id">>(() => emptyProjectForm(data));

  function updateProject(id: string, patch: Partial<OsProject>) {
    setData((current) => ({
      ...current,
      projects: current.projects.map((project) => (project.id === id ? { ...project, ...patch } : project)),
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.projectTitle.trim()) {
      return;
    }
    const project: OsProject = {
      ...form,
      id: createId("project"),
      portfolioPotential: clampScore(form.portfolioPotential),
      monetizationPotential: clampScore(form.monetizationPotential),
      careerRelevance: clampScore(form.careerRelevance),
    };
    setData((current) => ({ ...current, projects: [project, ...current.projects] }));
    setForm(emptyProjectForm(data));
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
      <Panel className="p-5">
        <p className={labelClass}>Project / Area &rarr; Milestone</p>
        <h3 className="mt-3 text-3xl font-semibold">Add project room</h3>
        <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
          <Field label="Project title">
            <input className={inputClass} value={form.projectTitle} onChange={(event) => setForm({ ...form, projectTitle: event.target.value })} />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField label="Project type" value={form.projectType} options={PROJECT_TYPES} onChange={(value) => setForm({ ...form, projectType: value as ProjectType })} />
            <SelectField label="Area" value={form.area} options={LIFE_AREAS} onChange={(value) => setForm({ ...form, area: value as LifeArea })} />
            <SelectField label="Status" value={form.status} options={PROJECT_STATUSES} onChange={(value) => setForm({ ...form, status: value as ProjectStatus })} />
            <Field label="Deadline">
              <input className={inputClass} type="date" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} />
            </Field>
          </div>
          <Field label="Purpose">
            <textarea className={textareaClass} value={form.purpose} onChange={(event) => setForm({ ...form, purpose: event.target.value })} />
          </Field>
          <Field label="Current problem">
            <textarea className={textareaClass} value={form.currentProblem} onChange={(event) => setForm({ ...form, currentProblem: event.target.value })} />
          </Field>
          <Field label="Next action">
            <textarea className={textareaClass} value={form.nextAction} onChange={(event) => setForm({ ...form, nextAction: event.target.value })} />
          </Field>
          <div className="grid gap-3 md:grid-cols-3">
            <NumberField label="Portfolio" value={form.portfolioPotential} onChange={(value) => setForm({ ...form, portfolioPotential: value })} />
            <NumberField label="Money" value={form.monetizationPotential} onChange={(value) => setForm({ ...form, monetizationPotential: value })} />
            <NumberField label="Career" value={form.careerRelevance} onChange={(value) => setForm({ ...form, careerRelevance: value })} />
          </div>
          <Field label="Related notes">
            <textarea className={textareaClass} value={form.relatedNotes} onChange={(event) => setForm({ ...form, relatedNotes: event.target.value })} />
          </Field>
          <button className="inline-flex items-center justify-center gap-2 border border-cherry/40 bg-cherry px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-ink">
            <Plus className="h-4 w-4" />
            Add project
          </button>
        </form>
      </Panel>

      <div className="grid gap-4">
        {data.projects
          .slice()
          .sort((a, b) => calculateProjectPriority(b, data.goals) - calculateProjectPriority(a, data.goals))
          .map((project) => {
            const goalNames = namesFromIds(data.goals, project.linkedGoalIds, (goal) => goal.goalTitle);
            return (
              <Panel key={project.id} className="p-5">
                <div className="grid gap-4 lg:grid-cols-[1fr_180px]">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge tone="blue">{project.projectType}</StatusBadge>
                      <StatusBadge>{project.status}</StatusBadge>
                      <StatusBadge tone="silver">due {project.deadline}</StatusBadge>
                    </div>
                    <h3 className="mt-3 text-2xl font-semibold">{project.projectTitle}</h3>
                    <p className="mt-2 text-sm leading-6 text-graphite">{project.purpose}</p>
                  </div>
                  <PriorityMeter value={calculateProjectPriority(project, data.goals)} label="project priority" />
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  <InfoBlock title="Current problem" body={project.currentProblem} tone="cherry" />
                  <InfoBlock title="Next action" body={project.nextAction} tone="blue" />
                  <InfoBlock title="Linked goals" body={goalNames.join("\n") || "No linked goal"} />
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <ScoreMeter label="portfolio" value={project.portfolioPotential} />
                  <ScoreMeter label="monetization" value={project.monetizationPotential} />
                  <ScoreMeter label="career" value={project.careerRelevance} />
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <SelectField label="Status" value={project.status} options={PROJECT_STATUSES} onChange={(value) => updateProject(project.id, { status: value as ProjectStatus })} />
                  <Field label="Next action">
                    <input className={inputClass} value={project.nextAction} onChange={(event) => updateProject(project.id, { nextAction: event.target.value })} />
                  </Field>
                </div>
              </Panel>
            );
          })}
      </div>
    </div>
  );
}

function StudyLanguageRoute({
  data,
  setData,
}: {
  data: WorkroomData;
  setData: Dispatch<SetStateAction<WorkroomData>>;
}) {
  const [form, setForm] = useState<Omit<StudyRoute, "id">>(() => emptyStudyForm(data));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.subjectLanguage.trim()) {
      return;
    }
    setData((current) => ({
      ...current,
      studyRoutes: [{ ...form, id: createId("study") }, ...current.studyRoutes],
    }));
    setForm(emptyStudyForm(data));
  }

  return (
    <ModuleWithForm
      intro="Study / Language -> Daily review route"
      title="Add route"
      form={
        <form onSubmit={handleSubmit} className="grid gap-4">
          <Field label="Subject / language">
            <input className={inputClass} value={form.subjectLanguage} onChange={(event) => setForm({ ...form, subjectLanguage: event.target.value })} />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Current level">
              <input className={inputClass} value={form.currentLevel} onChange={(event) => setForm({ ...form, currentLevel: event.target.value })} />
            </Field>
            <Field label="Target level">
              <input className={inputClass} value={form.targetLevel} onChange={(event) => setForm({ ...form, targetLevel: event.target.value })} />
            </Field>
            <SelectField label="Linked goal" value={form.linkedGoalId} options={data.goals.map((goal) => goal.id)} labels={Object.fromEntries(data.goals.map((goal) => [goal.id, goal.goalTitle]))} onChange={(value) => setForm({ ...form, linkedGoalId: value })} />
            <NumberField label="Study streak" value={form.studyStreak} onChange={(value) => setForm({ ...form, studyStreak: value })} min={0} max={365} />
          </div>
          <Field label="Study purpose">
            <textarea className={textareaClass} value={form.studyPurpose} onChange={(event) => setForm({ ...form, studyPurpose: event.target.value })} />
          </Field>
          <Field label="Today's study action">
            <textarea className={textareaClass} value={form.todaysStudyAction} onChange={(event) => setForm({ ...form, todaysStudyAction: event.target.value })} />
          </Field>
          <Field label="Review items">
            <textarea className={textareaClass} value={form.reviewItems} onChange={(event) => setForm({ ...form, reviewItems: event.target.value })} />
          </Field>
          <Field label="Weak points">
            <textarea className={textareaClass} value={form.weakPoints} onChange={(event) => setForm({ ...form, weakPoints: event.target.value })} />
          </Field>
          <button className="inline-flex items-center justify-center gap-2 border border-cherry/40 bg-cherry px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-ink">
            <Plus className="h-4 w-4" />
            Add route
          </button>
        </form>
      }
    >
      {data.studyRoutes.map((route) => {
        const goal = getGoalById(data.goals, route.linkedGoalId);
        return (
          <Panel key={route.id} className="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <StatusBadge tone="blue">{goal?.goalTitle ?? "No goal"}</StatusBadge>
                <h3 className="mt-3 text-2xl font-semibold">{route.subjectLanguage}</h3>
                <p className="mt-2 text-sm leading-6 text-graphite">{route.studyPurpose}</p>
              </div>
              <PriorityMeter value={Math.min(100, route.studyStreak * 8)} label={`${route.studyStreak} day streak`} />
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <InfoBlock title="Today" body={route.todaysStudyAction} tone="blue" />
              <InfoBlock title="Review items" body={route.reviewItems} />
              <InfoBlock title="Weak points" body={route.weakPoints} tone="cherry" />
            </div>
          </Panel>
        );
      })}
    </ModuleWithForm>
  );
}

function MoneyStrategy({
  data,
  setData,
}: {
  data: WorkroomData;
  setData: Dispatch<SetStateAction<WorkroomData>>;
}) {
  const [form, setForm] = useState<Omit<MoneyRecord, "id">>(() => emptyMoneyForm(data));
  const summary = getLifeHqSummary(data).moneySummary;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.category.trim()) {
      return;
    }
    setData((current) => ({
      ...current,
      moneyRecords: [{ ...form, id: createId("money") }, ...current.moneyRecords],
    }));
    setForm(emptyMoneyForm(data));
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Metric label="Total income" value={formatMoney(summary.totalIncome)} />
        <Metric label="Total expense" value={formatMoney(summary.totalExpense)} />
        <Metric label="Balance" value={formatMoney(summary.balance)} />
        <Metric label="Future spend" value={formatMoney(summary.futureSpending)} />
        <Metric label="Wasted" value={formatMoney(summary.wastedSpending)} />
        <Metric label="Freelance" value={formatMoney(summary.freelanceIncome)} />
      </div>

      <ModuleWithForm
        intro="Money -> Goal / Project connection"
        title="Add money record"
        form={
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField label="Record type" value={form.recordType} options={MONEY_RECORD_TYPES} onChange={(value) => setForm({ ...form, recordType: value as MoneyRecordType })} />
              <NumberField label="Amount" value={form.amount} onChange={(value) => setForm({ ...form, amount: value })} min={0} max={10000000} />
              <Field label="Category">
                <input className={inputClass} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} />
              </Field>
              <Field label="Date">
                <input className={inputClass} type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
              </Field>
              <SelectField label="Connected goal" value={form.connectedGoalId} options={data.goals.map((goal) => goal.id)} labels={Object.fromEntries(data.goals.map((goal) => [goal.id, goal.goalTitle]))} onChange={(value) => setForm({ ...form, connectedGoalId: value })} />
              <SelectField label="Connected project" value={form.connectedProjectId} options={["", ...data.projects.map((project) => project.id)]} labels={Object.fromEntries([["", "No project"], ...data.projects.map((project) => [project.id, project.projectTitle])])} onChange={(value) => setForm({ ...form, connectedProjectId: value })} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <ToggleField label="Future investment" checked={form.futureInvestment} onChange={(value) => setForm({ ...form, futureInvestment: value })} />
              <ToggleField label="Money wasted" checked={form.wasted} onChange={(value) => setForm({ ...form, wasted: value })} />
            </div>
            <Field label="Memo">
              <textarea className={textareaClass} value={form.memo} onChange={(event) => setForm({ ...form, memo: event.target.value })} />
            </Field>
            <button className="inline-flex items-center justify-center gap-2 border border-cherry/40 bg-cherry px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-ink">
              <Plus className="h-4 w-4" />
              Add money record
            </button>
          </form>
        }
      >
        {data.moneyRecords.map((record) => {
          const goal = getGoalById(data.goals, record.connectedGoalId);
          const project = getProjectById(data.projects, record.connectedProjectId);
          return (
            <Panel key={record.id} className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge tone="blue">{record.recordType}</StatusBadge>
                    {record.futureInvestment && <StatusBadge>future investment</StatusBadge>}
                    {record.wasted && <StatusBadge tone="cherry">waste</StatusBadge>}
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold">{record.category}</h3>
                  <p className="mt-2 text-sm leading-6 text-graphite">{record.memo}</p>
                </div>
                <p className="text-2xl font-semibold text-cherry">{formatMoney(record.amount)}</p>
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <InfoBlock title="Connected goal" body={goal?.goalTitle ?? "No goal"} />
                <InfoBlock title="Connected project" body={project?.projectTitle ?? "No project"} />
                <InfoBlock title="Date" body={record.date} />
              </div>
            </Panel>
          );
        })}
      </ModuleWithForm>
    </div>
  );
}

function CareerPortfolioTracker({
  data,
  setData,
}: {
  data: WorkroomData;
  setData: Dispatch<SetStateAction<WorkroomData>>;
}) {
  const [form, setForm] = useState<Omit<CareerItem, "id">>(() => emptyCareerForm(data));

  function updateCareer(id: string, patch: Partial<CareerItem>) {
    setData((current) => ({
      ...current,
      careerItems: current.careerItems.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.opportunityTitle.trim()) {
      return;
    }
    setData((current) => ({
      ...current,
      careerItems: [{ ...form, id: createId("career"), careerRelevance: clampScore(form.careerRelevance) }, ...current.careerItems],
    }));
    setForm(emptyCareerForm(data));
  }

  return (
    <ModuleWithForm
      intro="Career / Portfolio -> Next opportunity"
      title="Add opportunity"
      form={
        <form onSubmit={handleSubmit} className="grid gap-4">
          <Field label="Opportunity title">
            <input className={inputClass} value={form.opportunityTitle} onChange={(event) => setForm({ ...form, opportunityTitle: event.target.value })} />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField label="Type" value={form.type} options={CAREER_TYPES} onChange={(value) => setForm({ ...form, type: value as CareerType })} />
            <Field label="Company / platform">
              <input className={inputClass} value={form.companyPlatform} onChange={(event) => setForm({ ...form, companyPlatform: event.target.value })} />
            </Field>
            <SelectField label="Status" value={form.status} options={CAREER_STATUSES} onChange={(value) => setForm({ ...form, status: value as CareerStatus })} />
            <Field label="Deadline">
              <input className={inputClass} type="date" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} />
            </Field>
            <SelectField label="Linked goal" value={form.linkedGoalId} options={data.goals.map((goal) => goal.id)} labels={Object.fromEntries(data.goals.map((goal) => [goal.id, goal.goalTitle]))} onChange={(value) => setForm({ ...form, linkedGoalId: value })} />
            <SelectField label="Linked project" value={form.linkedProjectId} options={["", ...data.projects.map((project) => project.id)]} labels={Object.fromEntries([["", "No project"], ...data.projects.map((project) => [project.id, project.projectTitle])])} onChange={(value) => setForm({ ...form, linkedProjectId: value })} />
          </div>
          <NumberField label="Career relevance" value={form.careerRelevance} onChange={(value) => setForm({ ...form, careerRelevance: value })} />
          <Field label="Portfolio connection">
            <textarea className={textareaClass} value={form.portfolioConnection} onChange={(event) => setForm({ ...form, portfolioConnection: event.target.value })} />
          </Field>
          <Field label="Next action">
            <textarea className={textareaClass} value={form.nextAction} onChange={(event) => setForm({ ...form, nextAction: event.target.value })} />
          </Field>
          <Field label="Notes">
            <textarea className={textareaClass} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          </Field>
          <button className="inline-flex items-center justify-center gap-2 border border-cherry/40 bg-cherry px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-ink">
            <Plus className="h-4 w-4" />
            Add opportunity
          </button>
        </form>
      }
    >
      {data.careerItems.map((item) => (
        <Panel key={item.id} className="p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_160px]">
            <div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone="blue">{item.type}</StatusBadge>
                <StatusBadge>{item.status}</StatusBadge>
                <StatusBadge tone="silver">due {item.deadline}</StatusBadge>
              </div>
              <h3 className="mt-3 text-2xl font-semibold">{item.opportunityTitle}</h3>
              <p className="mt-2 text-sm leading-6 text-graphite">{item.companyPlatform}</p>
            </div>
            <PriorityMeter value={item.careerRelevance * 10} label="career fit" />
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <InfoBlock title="Portfolio connection" body={item.portfolioConnection} />
            <InfoBlock title="Next action" body={item.nextAction} tone="blue" />
            <InfoBlock title="Notes" body={item.notes} />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <SelectField label="Status" value={item.status} options={CAREER_STATUSES} onChange={(value) => updateCareer(item.id, { status: value as CareerStatus })} />
            <Field label="Next action">
              <input className={inputClass} value={item.nextAction} onChange={(event) => updateCareer(item.id, { nextAction: event.target.value })} />
            </Field>
          </div>
        </Panel>
      ))}
    </ModuleWithForm>
  );
}

function LifeAdminVault({
  data,
  setData,
}: {
  data: WorkroomData;
  setData: Dispatch<SetStateAction<WorkroomData>>;
}) {
  const [form, setForm] = useState<Omit<AdminItem, "id">>(() => emptyAdminForm(data));

  function updateAdmin(id: string, patch: Partial<AdminItem>) {
    setData((current) => ({
      ...current,
      adminItems: current.adminItems.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.itemTitle.trim()) {
      return;
    }
    setData((current) => ({
      ...current,
      adminItems: [{ ...form, id: createId("admin") }, ...current.adminItems],
    }));
    setForm(emptyAdminForm(data));
  }

  return (
    <ModuleWithForm
      intro="Documents / admin -> risk control"
      title="Add vault item"
      form={
        <form onSubmit={handleSubmit} className="grid gap-4">
          <Field label="Item title">
            <input className={inputClass} value={form.itemTitle} onChange={(event) => setForm({ ...form, itemTitle: event.target.value })} />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField label="Admin type" value={form.adminType} options={ADMIN_TYPES} onChange={(value) => setForm({ ...form, adminType: value as AdminType })} />
            <SelectField label="Status" value={form.status} options={ADMIN_STATUSES} onChange={(value) => setForm({ ...form, status: value as AdminStatus })} />
            <Field label="Deadline">
              <input className={inputClass} type="date" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} />
            </Field>
            <SelectField label="Linked goal" value={form.linkedGoalId} options={data.goals.map((goal) => goal.id)} labels={Object.fromEntries(data.goals.map((goal) => [goal.id, goal.goalTitle]))} onChange={(value) => setForm({ ...form, linkedGoalId: value })} />
            <SelectField label="Linked project" value={form.linkedProjectId} options={["", ...data.projects.map((project) => project.id)]} labels={Object.fromEntries([["", "No project"], ...data.projects.map((project) => [project.id, project.projectTitle])])} onChange={(value) => setForm({ ...form, linkedProjectId: value })} />
            <Field label="Location / link">
              <input className={inputClass} value={form.locationLink} onChange={(event) => setForm({ ...form, locationLink: event.target.value })} />
            </Field>
          </div>
          <Field label="Memo">
            <textarea className={textareaClass} value={form.memo} onChange={(event) => setForm({ ...form, memo: event.target.value })} />
          </Field>
          <button className="inline-flex items-center justify-center gap-2 border border-cherry/40 bg-cherry px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-ink">
            <Plus className="h-4 w-4" />
            Add admin item
          </button>
        </form>
      }
    >
      {data.adminItems.map((item) => {
        const goal = getGoalById(data.goals, item.linkedGoalId);
        return (
          <Panel key={item.id} className="p-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_150px]">
              <div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge tone="blue">{item.adminType}</StatusBadge>
                  <StatusBadge>{item.status}</StatusBadge>
                  <StatusBadge tone={daysUntil(item.deadline) <= 7 ? "cherry" : "silver"}>due {item.deadline}</StatusBadge>
                </div>
                <h3 className="mt-3 text-2xl font-semibold">{item.itemTitle}</h3>
                <p className="mt-2 text-sm leading-6 text-graphite">{item.memo}</p>
              </div>
              <PriorityMeter value={Math.min(100, 100 - Math.max(0, daysUntil(item.deadline)))} label="deadline risk" />
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <InfoBlock title="Linked goal" body={goal?.goalTitle ?? "No goal"} />
              <InfoBlock title="Location / link" body={item.locationLink} />
              <InfoBlock title="Memo" body={item.memo} />
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <SelectField label="Status" value={item.status} options={ADMIN_STATUSES} onChange={(value) => updateAdmin(item.id, { status: value as AdminStatus })} />
              <Field label="Deadline">
                <input className={inputClass} type="date" value={item.deadline} onChange={(event) => updateAdmin(item.id, { deadline: event.target.value })} />
              </Field>
            </div>
          </Panel>
        );
      })}
    </ModuleWithForm>
  );
}

function WeeklyLifeReview({
  data,
  setData,
}: {
  data: WorkroomData;
  setData: Dispatch<SetStateAction<WorkroomData>>;
}) {
  const [form, setForm] = useState<Omit<WeeklyReview, "id">>(() => emptyReviewForm());

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setData((current) => ({
      ...current,
      weeklyReviews: [{ ...form, id: createId("review") }, ...current.weeklyReviews],
    }));
    setForm(emptyReviewForm());
  }

  const latest = [...data.weeklyReviews].sort((a, b) => b.weekOf.localeCompare(a.weekOf))[0];

  return (
    <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
      <Panel className="p-5">
        <p className={labelClass}>Weekly Review &rarr; Progress Update</p>
        <h3 className="mt-3 text-3xl font-semibold">Add weekly review</h3>
        <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
          <Field label="Week of">
            <input className={inputClass} type="date" value={form.weekOf} onChange={(event) => setForm({ ...form, weekOf: event.target.value })} />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField label="Most progressed area" value={form.mostProgressedArea} options={LIFE_AREAS} onChange={(value) => setForm({ ...form, mostProgressedArea: value as LifeArea })} />
            <SelectField label="Most neglected area" value={form.mostNeglectedArea} options={LIFE_AREAS} onChange={(value) => setForm({ ...form, mostNeglectedArea: value as LifeArea })} />
          </div>
          <Field label="Money summary">
            <textarea className={textareaClass} value={form.moneySummary} onChange={(event) => setForm({ ...form, moneySummary: event.target.value })} />
          </Field>
          <Field label="Study summary">
            <textarea className={textareaClass} value={form.studySummary} onChange={(event) => setForm({ ...form, studySummary: event.target.value })} />
          </Field>
          <Field label="Portfolio / career summary">
            <textarea className={textareaClass} value={form.portfolioCareerSummary} onChange={(event) => setForm({ ...form, portfolioCareerSummary: event.target.value })} />
          </Field>
          {form.nextWeekTopThree.map((item, index) => (
            <Field key={index} label={`Next week priority ${index + 1}`}>
              <input
                className={inputClass}
                value={item}
                onChange={(event) => {
                  const next = [...form.nextWeekTopThree];
                  next[index] = event.target.value;
                  setForm({ ...form, nextWeekTopThree: next });
                }}
              />
            </Field>
          ))}
          <Field label="Risk signals">
            <textarea className={textareaClass} value={form.riskSignals} onChange={(event) => setForm({ ...form, riskSignals: event.target.value })} />
          </Field>
          <Field label="Routines to keep">
            <textarea className={textareaClass} value={form.routinesToKeep} onChange={(event) => setForm({ ...form, routinesToKeep: event.target.value })} />
          </Field>
          <Field label="Progress update">
            <textarea className={textareaClass} value={form.progressUpdate} onChange={(event) => setForm({ ...form, progressUpdate: event.target.value })} />
          </Field>
          <button className="inline-flex items-center justify-center gap-2 border border-cherry/40 bg-cherry px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-ink">
            <Save className="h-4 w-4" />
            Save review
          </button>
        </form>
      </Panel>

      <div className="grid gap-4">
        {latest && (
          <Panel className="p-5">
            <p className={labelClass}>Current weekly pulse / {latest.weekOf}</p>
            <h3 className="mt-3 text-3xl font-semibold">
              {latest.mostProgressedArea} moved. {latest.mostNeglectedArea} needs care.
            </h3>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <InfoBlock title="Money summary" body={latest.moneySummary} />
              <InfoBlock title="Study summary" body={latest.studySummary} />
              <InfoBlock title="Portfolio / career summary" body={latest.portfolioCareerSummary} />
              <InfoBlock title="Risk signals" body={latest.riskSignals} tone="cherry" />
              <InfoBlock title="Next week core 3" body={latest.nextWeekTopThree.join("\n")} tone="blue" />
              <InfoBlock title="Routines to keep" body={latest.routinesToKeep} />
            </div>
            <InfoBlock title="Progress update" body={latest.progressUpdate} className="mt-4" />
          </Panel>
        )}
        {data.weeklyReviews.map((review) => (
          <Panel key={review.id} className="p-5">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="blue">{review.weekOf}</StatusBadge>
              <StatusBadge>{review.mostProgressedArea}</StatusBadge>
              <StatusBadge tone="cherry">{review.mostNeglectedArea}</StatusBadge>
            </div>
            <p className="mt-3 text-sm leading-6 text-graphite">{review.progressUpdate}</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function ModuleWithForm({
  intro,
  title,
  form,
  children,
}: {
  intro: string;
  title: string;
  form: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
      <Panel className="p-5">
        <p className={labelClass}>{intro}</p>
        <h3 className="mt-3 text-3xl font-semibold">{title}</h3>
        <div className="mt-5">{form}</div>
      </Panel>
      <div className="grid gap-4">{children}</div>
    </div>
  );
}

function HqList({
  title,
  eyebrow,
  items,
  icon: Icon,
}: {
  title: string;
  eyebrow: string;
  items: HqItem[];
  icon: LucideIcon;
}) {
  return (
    <Panel className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className={labelClass}>{eyebrow}</p>
          <h3 className="mt-2 text-2xl font-semibold">{title}</h3>
        </div>
        <span className="grid h-10 w-10 place-items-center border border-silver/60 bg-ivory">
          <Icon className="h-5 w-5 text-cherry" />
        </span>
      </div>
      <div className="mt-5 divide-y divide-silver/40 border-y border-silver/40">
        {items.length ? (
          items.map((item) => (
            <article key={`${title}-${item.id}`} className="grid gap-3 py-4 md:grid-cols-[1fr_96px]">
              <div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge tone="blue">{item.area}</StatusBadge>
                  {item.status && <StatusBadge>{item.status}</StatusBadge>}
                  {item.deadline && <StatusBadge tone={daysUntil(item.deadline) <= 7 ? "cherry" : "silver"}>{item.deadline}</StatusBadge>}
                </div>
                <h4 className="mt-3 text-base font-semibold">{item.title}</h4>
                <p className="mt-2 text-xs leading-5 text-graphite">{item.nextAction}</p>
              </div>
              <PriorityMeter value={item.score} label="signal" compact />
            </article>
          ))
        ) : (
          <p className="py-5 text-sm text-graphite">No connected signal yet.</p>
        )}
      </div>
    </Panel>
  );
}

function GoalList({
  title,
  goals,
  tone = "blue",
}: {
  title: string;
  goals: LifeGoal[];
  tone?: "blue" | "cherry";
}) {
  return (
    <Panel className="p-5">
      <p className={labelClass}>Goal map</p>
      <h3 className="mt-2 text-2xl font-semibold">{title}</h3>
      <div className="mt-5 space-y-4">
        {goals.map((goal) => {
          const risk = getGoalRisk(goal);
          return (
            <article key={`${title}-${goal.id}`} className="border border-silver/45 bg-ivory/70 p-4">
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone={tone}>{goal.area}</StatusBadge>
                <StatusBadge tone={risk.level === "high" ? "cherry" : "silver"}>{risk.label}</StatusBadge>
              </div>
              <h4 className="mt-3 text-base font-semibold">{goal.goalTitle}</h4>
              <p className="mt-2 text-xs leading-5 text-graphite">{goal.nextMilestone}</p>
              <div className="mt-3">
                <Meter value={goal.progressPercentage} />
              </div>
            </article>
          );
        })}
      </div>
    </Panel>
  );
}

function MoneyPanel({ summary }: { summary: ReturnType<typeof getLifeHqSummary>["moneySummary"] }) {
  return (
    <Panel className="p-5">
      <p className={labelClass}>Money state</p>
      <h3 className="mt-2 text-2xl font-semibold">돈 상태</h3>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Metric label="Income" value={formatMoney(summary.totalIncome)} />
        <Metric label="Expense" value={formatMoney(summary.totalExpense)} />
        <Metric label="Balance" value={formatMoney(summary.balance)} />
        <Metric label="Wasted" value={formatMoney(summary.wastedSpending)} />
      </div>
    </Panel>
  );
}

function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className={labelClass}>{label}</span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  labels,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  labels?: Record<string, string>;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <select className={inputClass} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {labels?.[option] ?? option}
          </option>
        ))}
      </select>
    </Field>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <Field label={label}>
      <input
        className={inputClass}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </Field>
  );
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-4 border border-silver/50 bg-paper/80 px-3 py-3">
      <span className={labelClass}>{label}</span>
      <input className="h-4 w-4 accent-cherry" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`min-w-0 max-w-full border border-silver/50 bg-paper/80 shadow-surface ${className}`}>{children}</section>;
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-silver/45 bg-ivory/70 p-3">
      <p className={labelClass}>{label}</p>
      <p className="mt-2 break-words text-2xl font-semibold leading-tight">{value}</p>
    </div>
  );
}

function StatusBadge({
  children,
  tone = "ink",
}: {
  children: ReactNode;
  tone?: "ink" | "blue" | "cherry" | "silver";
}) {
  const toneClass = {
    ink: "border-ink/15 bg-ink/5 text-ink",
    blue: "border-blue/60 bg-powder text-ink",
    cherry: "border-cherry/35 bg-cherry/10 text-cherry",
    silver: "border-silver/60 bg-mist text-graphite",
  }[tone];

  return (
    <span className={`inline-flex items-center border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.13em] ${toneClass}`}>
      {children}
    </span>
  );
}

function Meter({ value }: { value: number }) {
  const normalized = Math.min(100, Math.max(0, Math.round(value)));
  return (
    <div className="h-1.5 bg-fog">
      <div className="h-full bg-cherry" style={{ width: `${normalized}%` }} />
    </div>
  );
}

function ScoreMeter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-[0.13em] text-graphite">
        <span>{label}</span>
        <span>{value}/10</span>
      </div>
      <Meter value={value * 10} />
    </div>
  );
}

function PriorityMeter({
  value,
  label,
  compact = false,
}: {
  value: number;
  label: string;
  compact?: boolean;
}) {
  const normalized = Math.min(100, Math.max(0, Math.round(value)));
  return (
    <div className={compact ? "min-w-[88px]" : "min-w-0"}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-graphite">{label}</p>
        <p className={`${compact ? "text-sm" : "text-2xl"} font-semibold text-cherry`}>{normalized}</p>
      </div>
      <div className="mt-2">
        <Meter value={normalized} />
      </div>
    </div>
  );
}

function InfoBlock({
  title,
  body,
  tone = "ink",
  className = "",
}: {
  title: string;
  body: string;
  tone?: "ink" | "blue" | "cherry";
  className?: string;
}) {
  const toneClass = {
    ink: "border-silver/45 bg-ivory/70",
    blue: "border-blue/60 bg-powder/70",
    cherry: "border-cherry/30 bg-cherry/5",
  }[tone];

  return (
    <article className={`border p-4 ${toneClass} ${className}`}>
      <p className={labelClass}>{title}</p>
      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-graphite">{body}</p>
    </article>
  );
}
