"use client";

import {
  Beaker,
  BookOpen,
  Briefcase,
  ChevronRight,
  CircleDot,
  Command,
  FlaskConical,
  Folder,
  Lightbulb,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";
import {
  type Dispatch,
  type FormEvent,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useWorkroomData } from "@/lib/storage";
import {
  EXPERIMENT_TYPES,
  FAILURE_TAGS,
  IDEA_CATEGORIES,
  PIPELINE_STATUSES,
  PORTFOLIO_USABLE_OPTIONS,
  type ExperimentRecord,
  type FailureTag,
  type IdeaCategory,
  type PipelineIdea,
  type PipelineStatus,
  type PortfolioCase,
  type PortfolioSections,
  type PortfolioUsable,
  type StudioProject,
  type WorkroomData,
} from "@/lib/types";
import {
  buildPortfolioDraft,
  calculateIdeaPriority,
  calculatePriorityScore,
  calculateProjectPriority,
  generateNextRevisionDirection,
  getCommandRecommendations,
  getIdeaRecommendation,
  type CommandItem,
} from "@/lib/workflow";

type ViewKey = "command" | "pipeline" | "studio" | "lab" | "builder";

type ProjectTab =
  | "DNA"
  | "Standards"
  | "References"
  | "Prompt Experiments"
  | "Result Reviews"
  | "Portfolio Case"
  | "Next Moves";

type IdeaForm = Omit<PipelineIdea, "id">;
type ExperimentForm = Omit<ExperimentRecord, "id" | "createdAt">;

const NAV_ITEMS: Array<{
  key: ViewKey;
  title: string;
  short: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    key: "command",
    title: "Command Room",
    short: "Command",
    description: "The daily decision board for what should grow next.",
    icon: Command,
  },
  {
    key: "pipeline",
    title: "Idea Pipeline",
    short: "Pipeline",
    description: "Move raw ideas into research, experiments, portfolio candidates, or archive.",
    icon: Lightbulb,
  },
  {
    key: "studio",
    title: "Project Studio",
    short: "Studio",
    description: "The connected room for DNA, standards, references, prompts, reviews, and next moves.",
    icon: Folder,
  },
  {
    key: "lab",
    title: "Experiment Lab",
    short: "Lab",
    description: "Record prompt and direction failures, then generate the next revision from project DNA.",
    icon: FlaskConical,
  },
  {
    key: "builder",
    title: "Portfolio Builder",
    short: "Builder",
    description: "Assemble project evidence into an editable case study structure.",
    icon: Briefcase,
  },
];

const PROJECT_TABS: ProjectTab[] = [
  "DNA",
  "Standards",
  "References",
  "Prompt Experiments",
  "Result Reviews",
  "Portfolio Case",
  "Next Moves",
];

const SECTION_LABELS: Array<{ key: keyof PortfolioSections; label: string }> = [
  { key: "projectOverview", label: "Project Overview" },
  { key: "problemIntention", label: "Problem / Intention" },
  { key: "target", label: "Target" },
  { key: "brandSystem", label: "Brand System" },
  { key: "visualDirection", label: "Visual Direction" },
  { key: "experiments", label: "Experiments" },
  { key: "deliverables", label: "Deliverables" },
  { key: "portfolioDescription", label: "Portfolio Description" },
  { key: "interviewTalkingPoints", label: "Interview Talking Points" },
  { key: "nextExpansion", label: "Next Expansion" },
];

const inputClass =
  "w-full rounded-none border border-silver/60 bg-paper/80 px-3 py-2 text-sm text-ink outline-none transition placeholder:text-graphite/50 focus:border-cherry focus:bg-white";
const textareaClass = `${inputClass} min-h-[112px] resize-y leading-6`;
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

function getProject(projects: StudioProject[], projectId: string) {
  return projects.find((project) => project.id === projectId);
}

function emptyIdeaForm(projects: StudioProject[]): IdeaForm {
  return {
    title: "",
    rawIdea: "",
    category: "Brand",
    linkedProjectId: projects[0]?.id ?? "",
    tasteFit: 7,
    portfolioPotential: 7,
    brandDepth: 6,
    monetizationPotential: 5,
    careerUsefulness: 6,
    currentStatus: "Raw",
    nextAction: "",
    reasonWhyThisMatters: "",
    tags: "",
    deadline: todayISO(),
  };
}

function emptyExperimentForm(projects: StudioProject[]): ExperimentForm {
  return {
    experimentTitle: "",
    linkedProjectId: projects[0]?.id ?? "",
    experimentType: "Prompt",
    originalDirection: "",
    revisedDirection: "",
    resultRating: 6,
    whatWorked: "",
    whatFailed: "",
    failureTags: [],
    nextRevision: "",
    usableForPortfolio: "Yes",
  };
}

function emptyPortfolioSections(): PortfolioSections {
  return {
    projectOverview: "",
    problemIntention: "",
    target: "",
    brandSystem: "",
    visualDirection: "",
    experiments: "",
    deliverables: "",
    portfolioDescription: "",
    interviewTalkingPoints: "",
    nextExpansion: "",
  };
}

export function WorkroomApp() {
  const { data, setData, isReady, resetData } = useWorkroomData();
  const [activeView, setActiveView] = useState<ViewKey>("command");
  const activeMeta = NAV_ITEMS.find((item) => item.key === activeView) ?? NAV_ITEMS[0];

  return (
    <div className="min-h-screen bg-ivory text-ink">
      <div className="mx-auto flex max-w-[1680px]">
        <aside className="sticky top-0 hidden h-screen w-[292px] shrink-0 border-r border-silver/40 bg-paper/70 px-5 py-6 backdrop-blur lg:block">
          <div className="border-b border-silver/50 pb-6">
            <p className={labelClass}>Private creative director</p>
            <h1 className="mt-4 text-3xl font-semibold leading-none tracking-normal">NAYUL WORKROOM</h1>
            <p className="mt-4 text-sm leading-6 text-graphite">
              Ideas, taste rules, brand DNA, experiments, and portfolio proof in one quiet operating room.
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
            Reset sample archive
          </button>
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-28 pt-4 sm:px-6 lg:px-10 lg:pb-14">
          <TopBar activeMeta={activeMeta} activeView={activeView} setActiveView={setActiveView} />

          {!isReady ? (
            <Panel className="mt-5 p-8">
              <p className={labelClass}>Loading archive</p>
              <p className="mt-3 text-lg text-graphite">Opening the private workroom data.</p>
            </Panel>
          ) : (
            <div className="mt-5">
              {activeView === "command" && <CommandRoom data={data} setActiveView={setActiveView} />}
              {activeView === "pipeline" && <IdeaPipeline data={data} setData={setData} />}
              {activeView === "studio" && <ProjectStudio data={data} />}
              {activeView === "lab" && <ExperimentLab data={data} setData={setData} />}
              {activeView === "builder" && <PortfolioBuilder data={data} setData={setData} />}
            </div>
          )}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-silver/50 bg-paper/95 px-2 py-2 shadow-editorial backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-5 gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveView(item.key)}
                className={`flex min-h-[58px] flex-col items-center justify-center gap-1 border px-1 text-[10px] font-semibold transition ${
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

function TopBar({
  activeMeta,
  activeView,
  setActiveView,
}: {
  activeMeta: (typeof NAV_ITEMS)[number];
  activeView: ViewKey;
  setActiveView: (view: ViewKey) => void;
}) {
  const Icon = activeMeta.icon;

  return (
    <header className="border-b border-silver/50 pb-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center border border-silver/60 bg-paper">
              <Icon className="h-5 w-5 text-cherry" />
            </span>
            <p className={labelClass}>Deep workflow module</p>
          </div>
          <h2 className="mt-4 text-4xl font-semibold leading-none tracking-normal sm:text-5xl">
            {activeMeta.title}
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-graphite">{activeMeta.description}</p>
        </div>

        <div className="hidden flex-wrap gap-2 sm:flex">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveView(item.key)}
              className={`border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                activeView === item.key
                  ? "border-cherry/45 bg-cherry/10 text-cherry"
                  : "border-silver/50 bg-paper/70 text-graphite hover:border-blue hover:text-ink"
              }`}
            >
              {item.short}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

function CommandRoom({ data, setActiveView }: { data: WorkroomData; setActiveView: (view: ViewKey) => void }) {
  const recommendations = useMemo(() => getCommandRecommendations(data), [data]);
  const topProject = [...data.projects].sort((a, b) => calculateProjectPriority(b) - calculateProjectPriority(a))[0];
  const portfolioCases = data.portfolioCases.length;

  return (
    <div className="space-y-5">
      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <Panel className="relative overflow-hidden p-6 sm:p-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cherry via-blue to-silver" />
          <div className="flex min-w-0 flex-col gap-8 2xl:flex-row 2xl:items-end 2xl:justify-between">
            <div className="min-w-0 max-w-3xl">
              <p className={labelClass}>Today's Next Move</p>
              <h3 className="mt-5 break-words text-3xl font-semibold leading-tight tracking-normal sm:text-6xl">
                {recommendations.todaysNextMove?.title ?? "Choose the next creative decision"}
              </h3>
              <p className="mt-5 max-w-2xl break-words text-base leading-7 text-graphite">
                {recommendations.todaysNextMove?.detail ??
                  "No recommendation is available yet. Capture an idea or connect an experiment to a project."}
              </p>
            </div>

            <div className="min-w-0 max-w-full border-t border-silver/50 pt-5 2xl:min-w-[240px] 2xl:border-l 2xl:border-t-0 2xl:pl-6 2xl:pt-0">
              <PriorityMeter value={recommendations.todaysNextMove?.score ?? 0} label="priority signal" />
              <p className="mt-4 text-sm font-semibold text-ink">
                {recommendations.todaysNextMove?.source ?? "Unlinked"}
              </p>
              <p className="mt-2 break-words text-sm leading-6 text-graphite">
                {recommendations.todaysNextMove?.nextAction ?? "Open the pipeline and choose one next action."}
              </p>
              <button
                type="button"
                onClick={() => setActiveView("pipeline")}
                className="mt-5 inline-flex items-center gap-2 border border-cherry/40 bg-cherry px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-ink"
              >
                Open Pipeline
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Panel>

        <Panel className="p-5">
          <p className={labelClass}>Archive temperature</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Metric label="Ideas" value={data.ideas.length} />
            <Metric label="Projects" value={data.projects.length} />
            <Metric label="Experiments" value={data.experiments.length} />
            <Metric label="Cases" value={portfolioCases} />
          </div>
          {topProject && (
            <div className="mt-5 border-t border-silver/50 pt-5">
              <p className={labelClass}>Highest project priority</p>
              <p className="mt-3 text-2xl font-semibold">{topProject.name}</p>
              <p className="mt-2 text-sm leading-6 text-graphite">{topProject.coreIdentity}</p>
            </div>
          )}
        </Panel>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <CommandList
          title="Portfolio-worthy concepts"
          eyebrow="Case potential"
          icon={Sparkles}
          items={recommendations.portfolioWorthyConcepts}
          empty="No portfolio candidates yet."
        />
        <CommandList
          title="Concepts needing decision"
          eyebrow="Decision pressure"
          icon={Target}
          items={recommendations.conceptsNeedingDecision}
          empty="No active decision queue."
        />
        <CommandList
          title="Recent prompt failures"
          eyebrow="Experiment repair"
          icon={Beaker}
          items={recommendations.recentPromptFailures}
          empty="No failed experiments recorded."
        />
        <CommandList
          title="High taste-fit ideas"
          eyebrow="Taste signal"
          icon={CircleDot}
          items={recommendations.highTasteFitIdeas}
          empty="No high taste-fit ideas yet."
        />
        <CommandList
          title="Career/study connected actions"
          eyebrow="Future-facing"
          icon={BookOpen}
          items={recommendations.careerStudyActions}
          empty="No career or study actions yet."
          className="xl:col-span-2"
        />
      </section>
    </div>
  );
}

function CommandList({
  title,
  eyebrow,
  icon: Icon,
  items,
  empty,
  className = "",
}: {
  title: string;
  eyebrow: string;
  icon: LucideIcon;
  items: CommandItem[];
  empty: string;
  className?: string;
}) {
  return (
    <Panel className={`p-5 ${className}`}>
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
            <article key={`${item.kind}-${item.id}-${title}`} className="grid gap-4 py-4 md:grid-cols-[1fr_150px]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge>{item.source}</StatusBadge>
                  {item.status && <StatusBadge tone="blue">{item.status}</StatusBadge>}
                  {item.deadline && <StatusBadge tone="silver">due {item.deadline}</StatusBadge>}
                </div>
                <h4 className="mt-3 text-lg font-semibold">{item.title}</h4>
                <p className="mt-2 text-sm leading-6 text-graphite">{item.nextAction}</p>
              </div>
              <div className="md:text-right">
                {typeof item.score === "number" && <PriorityMeter value={item.score} label="signal" compact />}
                {item.tags && <p className="mt-3 text-xs leading-5 text-graphite">{item.tags}</p>}
              </div>
            </article>
          ))
        ) : (
          <p className="py-5 text-sm text-graphite">{empty}</p>
        )}
      </div>
    </Panel>
  );
}

function IdeaPipeline({
  data,
  setData,
}: {
  data: WorkroomData;
  setData: Dispatch<SetStateAction<WorkroomData>>;
}) {
  const [ideaForm, setIdeaForm] = useState<IdeaForm>(() => emptyIdeaForm(data.projects));

  useEffect(() => {
    if (!getProject(data.projects, ideaForm.linkedProjectId)) {
      setIdeaForm((current) => ({ ...current, linkedProjectId: data.projects[0]?.id ?? "" }));
    }
  }, [data.projects, ideaForm.linkedProjectId]);

  const groupedIdeas = useMemo(
    () =>
      PIPELINE_STATUSES.map((status) => ({
        status,
        ideas: data.ideas
          .filter((idea) => idea.currentStatus === status)
          .sort((a, b) => calculateIdeaPriority(b) - calculateIdeaPriority(a)),
      })),
    [data.ideas],
  );

  function updateIdea(id: string, patch: Partial<PipelineIdea>) {
    setData((current) => ({
      ...current,
      ideas: current.ideas.map((idea) => (idea.id === id ? { ...idea, ...patch } : idea)),
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ideaForm.title.trim() || !ideaForm.rawIdea.trim()) {
      return;
    }

    const newIdea: PipelineIdea = {
      ...ideaForm,
      id: createId("idea"),
      tasteFit: clampScore(ideaForm.tasteFit),
      portfolioPotential: clampScore(ideaForm.portfolioPotential),
      brandDepth: clampScore(ideaForm.brandDepth),
      monetizationPotential: clampScore(ideaForm.monetizationPotential),
      careerUsefulness: clampScore(ideaForm.careerUsefulness),
    };

    setData((current) => ({ ...current, ideas: [newIdea, ...current.ideas] }));
    setIdeaForm(emptyIdeaForm(data.projects));
  }

  return (
    <div className="space-y-5">
      <Panel className="p-5 sm:p-6">
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className={labelClass}>Pipeline logic</p>
            <h3 className="mt-3 text-3xl font-semibold leading-tight">From raw signal to portfolio proof.</h3>
            <p className="mt-4 text-sm leading-6 text-graphite">
              Each idea is scored by taste fit, portfolio potential, brand depth, monetization, and career usefulness.
              The board recommends whether to develop, archive, or move toward a brand system.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Title">
                <input
                  className={inputClass}
                  value={ideaForm.title}
                  onChange={(event) => setIdeaForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="NACRE ROOM veil service rule"
                />
              </Field>
              <Field label="Linked project">
                <select
                  className={inputClass}
                  value={ideaForm.linkedProjectId}
                  onChange={(event) =>
                    setIdeaForm((current) => ({ ...current, linkedProjectId: event.target.value }))
                  }
                >
                  {data.projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Raw idea">
              <textarea
                className={textareaClass}
                value={ideaForm.rawIdea}
                onChange={(event) => setIdeaForm((current) => ({ ...current, rawIdea: event.target.value }))}
                placeholder="Capture the rough thought before it becomes polished."
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Category">
                <select
                  className={inputClass}
                  value={ideaForm.category}
                  onChange={(event) =>
                    setIdeaForm((current) => ({ ...current, category: event.target.value as IdeaCategory }))
                  }
                >
                  {IDEA_CATEGORIES.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </Field>
              <Field label="Status">
                <select
                  className={inputClass}
                  value={ideaForm.currentStatus}
                  onChange={(event) =>
                    setIdeaForm((current) => ({ ...current, currentStatus: event.target.value as PipelineStatus }))
                  }
                >
                  {PIPELINE_STATUSES.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </Field>
              <Field label="Deadline">
                <input
                  className={inputClass}
                  type="date"
                  value={ideaForm.deadline}
                  onChange={(event) => setIdeaForm((current) => ({ ...current, deadline: event.target.value }))}
                />
              </Field>
            </div>

            <div className="grid gap-3 md:grid-cols-5">
              <ScoreInput
                label="Taste"
                value={ideaForm.tasteFit}
                onChange={(value) => setIdeaForm((current) => ({ ...current, tasteFit: value }))}
              />
              <ScoreInput
                label="Portfolio"
                value={ideaForm.portfolioPotential}
                onChange={(value) => setIdeaForm((current) => ({ ...current, portfolioPotential: value }))}
              />
              <ScoreInput
                label="Brand"
                value={ideaForm.brandDepth}
                onChange={(value) => setIdeaForm((current) => ({ ...current, brandDepth: value }))}
              />
              <ScoreInput
                label="Money"
                value={ideaForm.monetizationPotential}
                onChange={(value) => setIdeaForm((current) => ({ ...current, monetizationPotential: value }))}
              />
              <ScoreInput
                label="Career"
                value={ideaForm.careerUsefulness}
                onChange={(value) => setIdeaForm((current) => ({ ...current, careerUsefulness: value }))}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Next action">
                <textarea
                  className={textareaClass}
                  value={ideaForm.nextAction}
                  onChange={(event) => setIdeaForm((current) => ({ ...current, nextAction: event.target.value }))}
                  placeholder="What should happen next?"
                />
              </Field>
              <Field label="Reason why this matters">
                <textarea
                  className={textareaClass}
                  value={ideaForm.reasonWhyThisMatters}
                  onChange={(event) =>
                    setIdeaForm((current) => ({ ...current, reasonWhyThisMatters: event.target.value }))
                  }
                  placeholder="Why is this useful for portfolio, taste, brand, or career?"
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <Field label="Tags">
                <input
                  className={inputClass}
                  value={ideaForm.tags}
                  onChange={(event) => setIdeaForm((current) => ({ ...current, tags: event.target.value }))}
                  placeholder="flash, fashion, material code"
                />
              </Field>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 border border-cherry/40 bg-cherry px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-ink"
              >
                <Plus className="h-4 w-4" />
                Add to pipeline
              </button>
            </div>
          </form>
        </div>
      </Panel>

      <div className="overflow-x-auto pb-3 soft-scrollbar">
        <div className="grid min-w-[1460px] grid-cols-9 gap-3">
          {groupedIdeas.map(({ status, ideas }) => (
            <section key={status} className="border border-silver/45 bg-paper/55 p-3">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold">{status}</h4>
                <span className="text-xs text-graphite">{ideas.length}</span>
              </div>
              <div className="space-y-3">
                {ideas.map((idea) => {
                  const recommendation = getIdeaRecommendation(idea);
                  const project = getProject(data.projects, idea.linkedProjectId);

                  return (
                    <article key={idea.id} className="border border-silver/50 bg-ivory/65 p-3 shadow-insetline">
                      <div className="flex flex-wrap gap-2">
                        <RecommendationBadge recommendation={recommendation} />
                        <StatusBadge tone="blue">{project?.name ?? "Unlinked"}</StatusBadge>
                      </div>
                      <h5 className="mt-3 text-base font-semibold leading-snug">{idea.title}</h5>
                      <p className="mt-2 line-clamp-4 text-xs leading-5 text-graphite">{idea.rawIdea}</p>
                      <div className="mt-3 space-y-2">
                        <ScoreMeter label="taste" value={idea.tasteFit} />
                        <ScoreMeter label="portfolio" value={idea.portfolioPotential} />
                        <ScoreMeter label="brand" value={idea.brandDepth} />
                      </div>
                      <div className="mt-3 border-t border-silver/40 pt-3">
                        <PriorityMeter value={calculateIdeaPriority(idea)} label="priority" compact />
                        <p className="mt-3 text-xs font-semibold text-ink">Next: {idea.nextAction}</p>
                        <p className="mt-2 text-xs leading-5 text-graphite">{idea.reasonWhyThisMatters}</p>
                      </div>
                      <div className="mt-3 grid gap-2">
                        <select
                          className={inputClass}
                          value={idea.currentStatus}
                          onChange={(event) =>
                            updateIdea(idea.id, { currentStatus: event.target.value as PipelineStatus })
                          }
                        >
                          {PIPELINE_STATUSES.map((nextStatus) => (
                            <option key={nextStatus}>{nextStatus}</option>
                          ))}
                        </select>
                        <input
                          className={inputClass}
                          value={idea.nextAction}
                          onChange={(event) => updateIdea(idea.id, { nextAction: event.target.value })}
                          aria-label={`Next action for ${idea.title}`}
                        />
                      </div>
                    </article>
                  );
                })}
                {!ideas.length && <p className="text-xs leading-5 text-graphite">No signals in this stage.</p>}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectStudio({ data }: { data: WorkroomData }) {
  const [selectedProjectId, setSelectedProjectId] = useState(data.projects[0]?.id ?? "");
  const [activeTab, setActiveTab] = useState<ProjectTab>("DNA");

  useEffect(() => {
    if (!getProject(data.projects, selectedProjectId)) {
      setSelectedProjectId(data.projects[0]?.id ?? "");
    }
  }, [data.projects, selectedProjectId]);

  const selectedProject = getProject(data.projects, selectedProjectId) ?? data.projects[0];
  const projectExperiments = data.experiments.filter(
    (experiment) => selectedProject && experiment.linkedProjectId === selectedProject.id,
  );
  const projectCase = data.portfolioCases.find((portfolioCase) => portfolioCase.projectId === selectedProject?.id);

  if (!selectedProject) {
    return (
      <Panel className="p-6">
        <p className="text-sm text-graphite">No projects are available.</p>
      </Panel>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <div className="space-y-3">
        {data.projects.map((project) => {
          const isActive = selectedProject.id === project.id;

          return (
            <button
              key={project.id}
              type="button"
              onClick={() => setSelectedProjectId(project.id)}
              className={`w-full border p-4 text-left transition ${
                isActive
                  ? "border-cherry/45 bg-paper shadow-surface"
                  : "border-silver/45 bg-paper/60 hover:border-blue hover:bg-paper"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={labelClass}>{project.category}</p>
                  <h3 className="mt-2 text-2xl font-semibold">{project.name}</h3>
                </div>
                <PriorityMeter value={calculateProjectPriority(project)} label="priority" compact />
              </div>
              <p className="mt-3 text-sm leading-6 text-graphite">{project.coreIdentity}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <StatusBadge tone="blue">{project.status}</StatusBadge>
                <StatusBadge tone="silver">due {project.deadline}</StatusBadge>
              </div>
            </button>
          );
        })}
      </div>

      <Panel className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 border-b border-silver/50 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className={labelClass}>Project Studio</p>
            <h3 className="mt-3 text-4xl font-semibold leading-none">{selectedProject.name}</h3>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-graphite">{selectedProject.coreIdentity}</p>
          </div>
          <div className="min-w-[220px]">
            <PriorityMeter value={calculatePriorityScore(selectedProject)} label="base score" />
          </div>
        </div>

        <div className="mt-5 overflow-x-auto pb-2 soft-scrollbar">
          <div className="flex min-w-max gap-2">
            {PROJECT_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                  activeTab === tab
                    ? "border-cherry/45 bg-cherry/10 text-cherry"
                    : "border-silver/50 bg-paper/70 text-graphite hover:border-blue hover:text-ink"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          {activeTab === "DNA" && <ProjectDna project={selectedProject} />}
          {activeTab === "Standards" && <ProjectStandards project={selectedProject} />}
          {activeTab === "References" && <ProjectReferences project={selectedProject} />}
          {activeTab === "Prompt Experiments" && (
            <ProjectExperiments project={selectedProject} experiments={projectExperiments} />
          )}
          {activeTab === "Result Reviews" && <ProjectReviews project={selectedProject} />}
          {activeTab === "Portfolio Case" && (
            <ProjectPortfolioCase
              project={selectedProject}
              portfolioCase={projectCase}
              generated={buildPortfolioDraft(selectedProject, data.experiments)}
            />
          )}
          {activeTab === "Next Moves" && <ProjectNextMoves project={selectedProject} ideas={data.ideas} />}
        </div>
      </Panel>
    </div>
  );
}

function ProjectDna({ project }: { project: StudioProject }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <InfoBlock title="Core identity" body={project.coreIdentity} />
      <InfoBlock title="Problem / intention" body={project.problemIntention} />
      <InfoBlock title="Target" body={project.target} />
      <InfoBlock title="Portfolio usage" body={project.portfolioUsage} />
      <InfoBlock title="Must include" body={project.mustInclude} tone="blue" />
      <InfoBlock title="Must avoid" body={project.mustAvoid} tone="cherry" />
      <InfoBlock title="Visual codes" body={project.visualCodes} className="lg:col-span-2" />
      <InfoBlock title="Deliverables" body={project.deliverables} className="lg:col-span-2" />
    </div>
  );
}

function ProjectStandards({ project }: { project: StudioProject }) {
  return (
    <div className="grid gap-3">
      {project.standards.map((standard) => (
        <InfoBlock key={standard.id} title={`${standard.title} / ${standard.type}`} body={standard.rule} />
      ))}
    </div>
  );
}

function ProjectReferences({ project }: { project: StudioProject }) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {project.references.map((reference) => (
        <InfoBlock
          key={reference.id}
          title={reference.title}
          body={`Why: ${reference.whyItMatters}\nBorrow: ${reference.borrow}\nAvoid copying: ${reference.avoidCopying}`}
        />
      ))}
    </div>
  );
}

function ProjectExperiments({
  project,
  experiments,
}: {
  project: StudioProject;
  experiments: ExperimentRecord[];
}) {
  return (
    <div className="grid gap-3">
      {experiments.map((experiment) => (
        <InfoBlock
          key={experiment.id}
          title={`${experiment.experimentTitle} / ${experiment.resultRating}/10`}
          body={`Revised: ${experiment.revisedDirection}\nWorked: ${experiment.whatWorked}\nFailed: ${experiment.whatFailed}\nNext: ${experiment.nextRevision}`}
          tone={experiment.resultRating >= 8 ? "blue" : "cherry"}
        />
      ))}
      {!experiments.length && (
        <InfoBlock title="No linked experiments yet" body={`Create an Experiment Lab record for ${project.name}.`} />
      )}
    </div>
  );
}

function ProjectReviews({ project }: { project: StudioProject }) {
  return (
    <div className="grid gap-3">
      {project.resultReviews.map((review) => (
        <InfoBlock
          key={review.id}
          title={`${review.title} / ${review.score}/10`}
          body={`Change: ${review.whatChanged}\nDecision: ${review.decision}`}
        />
      ))}
    </div>
  );
}

function ProjectPortfolioCase({
  project,
  portfolioCase,
  generated,
}: {
  project: StudioProject;
  portfolioCase?: PortfolioCase;
  generated: PortfolioSections;
}) {
  const sections = portfolioCase?.sections ?? generated;

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tone={portfolioCase ? "blue" : "silver"}>
          {portfolioCase ? `Saved ${portfolioCase.updatedAt}` : "Generated preview"}
        </StatusBadge>
        <StatusBadge>{project.name}</StatusBadge>
      </div>
      {SECTION_LABELS.map((section) => (
        <InfoBlock key={section.key} title={section.label} body={sections[section.key]} />
      ))}
    </div>
  );
}

function ProjectNextMoves({ project, ideas }: { project: StudioProject; ideas: PipelineIdea[] }) {
  const linkedIdeas = ideas.filter((idea) => idea.linkedProjectId === project.id);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <InfoBlock title="Project next moves" body={project.nextMoves.join("\n")} />
      <InfoBlock
        title="Linked idea actions"
        body={
          linkedIdeas.length
            ? linkedIdeas.map((idea) => `${idea.title}: ${idea.nextAction}`).join("\n")
            : "No linked idea actions yet."
        }
      />
    </div>
  );
}

function ExperimentLab({
  data,
  setData,
}: {
  data: WorkroomData;
  setData: Dispatch<SetStateAction<WorkroomData>>;
}) {
  const [experimentForm, setExperimentForm] = useState<ExperimentForm>(() => emptyExperimentForm(data.projects));

  useEffect(() => {
    if (!getProject(data.projects, experimentForm.linkedProjectId)) {
      setExperimentForm((current) => ({ ...current, linkedProjectId: data.projects[0]?.id ?? "" }));
    }
  }, [data.projects, experimentForm.linkedProjectId]);

  const selectedProject = getProject(data.projects, experimentForm.linkedProjectId);

  function toggleFailureTag(tag: FailureTag) {
    setExperimentForm((current) => ({
      ...current,
      failureTags: current.failureTags.includes(tag)
        ? current.failureTags.filter((currentTag) => currentTag !== tag)
        : [...current.failureTags, tag],
    }));
  }

  function handleGenerate() {
    setExperimentForm((current) => ({
      ...current,
      nextRevision: generateNextRevisionDirection(current, getProject(data.projects, current.linkedProjectId)),
    }));
  }

  function regenerateExisting(experiment: ExperimentRecord) {
    const project = getProject(data.projects, experiment.linkedProjectId);
    const nextRevision = generateNextRevisionDirection(experiment, project);

    setData((current) => ({
      ...current,
      experiments: current.experiments.map((item) =>
        item.id === experiment.id ? { ...item, nextRevision } : item,
      ),
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!experimentForm.experimentTitle.trim() || !experimentForm.originalDirection.trim()) {
      return;
    }

    const nextExperiment: ExperimentRecord = {
      ...experimentForm,
      id: createId("exp"),
      resultRating: clampScore(experimentForm.resultRating),
      createdAt: todayISO(),
      nextRevision:
        experimentForm.nextRevision ||
        generateNextRevisionDirection(experimentForm, getProject(data.projects, experimentForm.linkedProjectId)),
    };

    setData((current) => ({ ...current, experiments: [nextExperiment, ...current.experiments] }));
    setExperimentForm(emptyExperimentForm(data.projects));
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <Panel className="p-5 sm:p-6">
        <p className={labelClass}>Failure turns into direction</p>
        <h3 className="mt-3 text-3xl font-semibold">Experiment record</h3>
        <p className="mt-3 text-sm leading-6 text-graphite">
          The generator uses selected failure tags plus the linked project DNA. It does not call an AI API.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <Field label="Experiment title">
            <input
              className={inputClass}
              value={experimentForm.experimentTitle}
              onChange={(event) =>
                setExperimentForm((current) => ({ ...current, experimentTitle: event.target.value }))
              }
              placeholder="DOLLSET chrome flash repair"
            />
          </Field>

          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Linked project">
              <select
                className={inputClass}
                value={experimentForm.linkedProjectId}
                onChange={(event) =>
                  setExperimentForm((current) => ({ ...current, linkedProjectId: event.target.value }))
                }
              >
                {data.projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Type">
              <select
                className={inputClass}
                value={experimentForm.experimentType}
                onChange={(event) =>
                  setExperimentForm((current) => ({
                    ...current,
                    experimentType: event.target.value as ExperimentRecord["experimentType"],
                  }))
                }
              >
                {EXPERIMENT_TYPES.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </Field>
            <ScoreInput
              label="Result rating"
              value={experimentForm.resultRating}
              onChange={(value) => setExperimentForm((current) => ({ ...current, resultRating: value }))}
            />
          </div>

          <Field label="Original direction">
            <textarea
              className={textareaClass}
              value={experimentForm.originalDirection}
              onChange={(event) =>
                setExperimentForm((current) => ({ ...current, originalDirection: event.target.value }))
              }
            />
          </Field>
          <Field label="Revised direction">
            <textarea
              className={textareaClass}
              value={experimentForm.revisedDirection}
              onChange={(event) =>
                setExperimentForm((current) => ({ ...current, revisedDirection: event.target.value }))
              }
            />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="What worked">
              <textarea
                className={textareaClass}
                value={experimentForm.whatWorked}
                onChange={(event) =>
                  setExperimentForm((current) => ({ ...current, whatWorked: event.target.value }))
                }
              />
            </Field>
            <Field label="What failed">
              <textarea
                className={textareaClass}
                value={experimentForm.whatFailed}
                onChange={(event) =>
                  setExperimentForm((current) => ({ ...current, whatFailed: event.target.value }))
                }
              />
            </Field>
          </div>

          <Field label="Failure tags">
            <div className="flex flex-wrap gap-2">
              {FAILURE_TAGS.map((tag) => {
                const isActive = experimentForm.failureTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleFailureTag(tag)}
                    className={`border px-3 py-2 text-xs font-semibold transition ${
                      isActive
                        ? "border-cherry/45 bg-cherry/10 text-cherry"
                        : "border-silver/50 bg-paper text-graphite hover:border-blue hover:text-ink"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="grid gap-4 md:grid-cols-[1fr_180px] md:items-start">
            <Field label="Next revision">
              <textarea
                className={textareaClass}
                value={experimentForm.nextRevision}
                onChange={(event) =>
                  setExperimentForm((current) => ({ ...current, nextRevision: event.target.value }))
                }
              />
            </Field>
            <div className="grid gap-3">
              <Field label="Portfolio usable">
                <select
                  className={inputClass}
                  value={experimentForm.usableForPortfolio}
                  onChange={(event) =>
                    setExperimentForm((current) => ({
                      ...current,
                      usableForPortfolio: event.target.value as PortfolioUsable,
                    }))
                  }
                >
                  {PORTFOLIO_USABLE_OPTIONS.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </Field>
              <button
                type="button"
                onClick={handleGenerate}
                className="inline-flex items-center justify-center gap-2 border border-blue/70 bg-powder px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink transition hover:border-cherry/50"
              >
                <Sparkles className="h-4 w-4" />
                Generate next revision
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 border border-cherry/40 bg-cherry px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-ink"
              >
                <Save className="h-4 w-4" />
                Save experiment
              </button>
            </div>
          </div>

          {selectedProject && (
            <InfoBlock
              title={`${selectedProject.name} DNA lock`}
              body={`Include: ${selectedProject.mustInclude}\nAvoid: ${selectedProject.mustAvoid}`}
              tone="blue"
            />
          )}
        </form>
      </Panel>

      <div className="space-y-3">
        {data.experiments
          .slice()
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .map((experiment) => {
            const project = getProject(data.projects, experiment.linkedProjectId);

            return (
              <Panel key={experiment.id} className="p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge tone="blue">{project?.name ?? "Unlinked"}</StatusBadge>
                      <StatusBadge>{experiment.experimentType}</StatusBadge>
                      <StatusBadge tone={experiment.usableForPortfolio === "Yes" ? "blue" : "silver"}>
                        Portfolio {experiment.usableForPortfolio}
                      </StatusBadge>
                    </div>
                    <h3 className="mt-3 text-2xl font-semibold">{experiment.experimentTitle}</h3>
                    <p className="mt-2 text-sm leading-6 text-graphite">{experiment.nextRevision}</p>
                  </div>
                  <PriorityMeter value={experiment.resultRating * 10} label={`${experiment.resultRating}/10`} compact />
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <InfoBlock title="Worked" body={experiment.whatWorked} />
                  <InfoBlock title="Failed" body={experiment.whatFailed} tone="cherry" />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {experiment.failureTags.map((tag) => (
                    <StatusBadge key={tag} tone="cherry">
                      {tag}
                    </StatusBadge>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => regenerateExisting(experiment)}
                  className="mt-4 inline-flex items-center gap-2 border border-silver/60 bg-paper px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-graphite transition hover:border-cherry/40 hover:text-cherry"
                >
                  <RefreshCw className="h-4 w-4" />
                  Regenerate direction
                </button>
              </Panel>
            );
          })}
      </div>
    </div>
  );
}

function PortfolioBuilder({
  data,
  setData,
}: {
  data: WorkroomData;
  setData: Dispatch<SetStateAction<WorkroomData>>;
}) {
  const [selectedProjectId, setSelectedProjectId] = useState(data.projects[0]?.id ?? "");
  const selectedProject = getProject(data.projects, selectedProjectId) ?? data.projects[0];
  const savedCase = data.portfolioCases.find((portfolioCase) => portfolioCase.projectId === selectedProject?.id);
  const [draft, setDraft] = useState<PortfolioSections>(() =>
    selectedProject ? savedCase?.sections ?? buildPortfolioDraft(selectedProject, data.experiments) : emptyPortfolioSections(),
  );

  useEffect(() => {
    if (!getProject(data.projects, selectedProjectId)) {
      setSelectedProjectId(data.projects[0]?.id ?? "");
    }
  }, [data.projects, selectedProjectId]);

  useEffect(() => {
    if (!selectedProject) {
      setDraft(emptyPortfolioSections());
      return;
    }

    const nextSavedCase = data.portfolioCases.find((portfolioCase) => portfolioCase.projectId === selectedProject.id);
    setDraft(nextSavedCase?.sections ?? buildPortfolioDraft(selectedProject, data.experiments));
  }, [selectedProject, data.portfolioCases, data.experiments]);

  if (!selectedProject) {
    return (
      <Panel className="p-6">
        <p className="text-sm text-graphite">No project is available for portfolio building.</p>
      </Panel>
    );
  }

  function updateSection(key: keyof PortfolioSections, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function generateDraft() {
    setDraft(buildPortfolioDraft(selectedProject, data.experiments));
  }

  function saveCase() {
    const nextCase: PortfolioCase = {
      id: savedCase?.id ?? createId("case"),
      projectId: selectedProject.id,
      sections: draft,
      updatedAt: todayISO(),
    };

    setData((current) => ({
      ...current,
      portfolioCases: savedCase
        ? current.portfolioCases.map((portfolioCase) =>
            portfolioCase.id === savedCase.id ? nextCase : portfolioCase,
          )
        : [nextCase, ...current.portfolioCases],
    }));
  }

  const linkedExperiments = data.experiments.filter((experiment) => experiment.linkedProjectId === selectedProject.id);
  const usableCount = linkedExperiments.filter((experiment) => experiment.usableForPortfolio === "Yes").length;

  return (
    <div className="grid gap-5 xl:grid-cols-[340px_1fr]">
      <Panel className="p-5">
        <p className={labelClass}>Case study assembly</p>
        <h3 className="mt-3 text-3xl font-semibold">Portfolio Builder</h3>
        <p className="mt-3 text-sm leading-6 text-graphite">
          Select a project. The draft is assembled from DNA, references, experiments, result reviews, and next moves,
          then kept editable in localStorage.
        </p>

        <Field label="Project" className="mt-5">
          <select
            className={inputClass}
            value={selectedProject.id}
            onChange={(event) => setSelectedProjectId(event.target.value)}
          >
            {data.projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Metric label="Experiments" value={linkedExperiments.length} />
          <Metric label="Portfolio usable" value={usableCount} />
          <Metric label="Standards" value={selectedProject.standards.length} />
          <Metric label="References" value={selectedProject.references.length} />
        </div>

        <div className="mt-5 grid gap-3">
          <button
            type="button"
            onClick={generateDraft}
            className="inline-flex items-center justify-center gap-2 border border-blue/70 bg-powder px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink transition hover:border-cherry/50"
          >
            <Sparkles className="h-4 w-4" />
            Generate from linked data
          </button>
          <button
            type="button"
            onClick={saveCase}
            className="inline-flex items-center justify-center gap-2 border border-cherry/40 bg-cherry px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-ink"
          >
            <Save className="h-4 w-4" />
            Save case
          </button>
        </div>

        {savedCase && (
          <p className="mt-4 border-t border-silver/40 pt-4 text-xs leading-5 text-graphite">
            Saved case updated on {savedCase.updatedAt}.
          </p>
        )}
      </Panel>

      <Panel className="p-5 sm:p-6">
        <div className="flex flex-col gap-3 border-b border-silver/50 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className={labelClass}>Selected project</p>
            <h3 className="mt-3 text-4xl font-semibold leading-none">{selectedProject.name}</h3>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-graphite">{selectedProject.portfolioUsage}</p>
          </div>
          <PriorityMeter value={calculateProjectPriority(selectedProject)} label="portfolio pressure" compact />
        </div>

        <div className="mt-5 grid gap-4">
          {SECTION_LABELS.map((section) => (
            <Field key={section.key} label={section.label}>
              <textarea
                className={`${textareaClass} min-h-[138px]`}
                value={draft[section.key]}
                onChange={(event) => updateSection(section.key, event.target.value)}
              />
            </Field>
          ))}
        </div>
      </Panel>
    </div>
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

function ScoreInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <Field label={label}>
      <input
        className={inputClass}
        type="number"
        min={1}
        max={10}
        value={value}
        onChange={(event) => onChange(clampScore(Number(event.target.value)))}
      />
    </Field>
  );
}

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`min-w-0 max-w-full border border-silver/50 bg-paper/80 shadow-surface ${className}`}>{children}</section>;
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-silver/45 bg-ivory/70 p-3">
      <p className={labelClass}>{label}</p>
      <p className="mt-2 text-3xl font-semibold leading-none">{value}</p>
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

function RecommendationBadge({ recommendation }: { recommendation: ReturnType<typeof getIdeaRecommendation> }) {
  return <StatusBadge tone={recommendation.tone}>{recommendation.label}</StatusBadge>;
}

function ScoreMeter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-[0.13em] text-graphite">
        <span>{label}</span>
        <span>{value}/10</span>
      </div>
      <div className="h-1.5 bg-fog">
        <div className="h-full bg-cherry" style={{ width: `${clampScore(value) * 10}%` }} />
      </div>
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
    <div className={compact ? "min-w-[112px]" : "min-w-0"}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-graphite">{label}</p>
        <p className={`${compact ? "text-sm" : "text-2xl"} font-semibold text-cherry`}>{normalized}</p>
      </div>
      <div className="mt-2 h-1.5 bg-fog">
        <div className="h-full bg-cherry" style={{ width: `${normalized}%` }} />
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
