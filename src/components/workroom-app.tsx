"use client";

import type {
  Dispatch,
  FormEvent,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  SetStateAction,
  TextareaHTMLAttributes,
} from "react";
import { useMemo, useState } from "react";
import {
  Archive,
  BadgeDollarSign,
  BookOpen,
  Briefcase,
  CalendarDays,
  Check,
  Circle,
  Clipboard,
  Command,
  Gem,
  Languages,
  ListTodo,
  Palette,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useWorkroomData } from "@/lib/storage";
import {
  LANGUAGES,
  LANGUAGE_LEVELS,
  MONEY_TYPES,
  PRIORITIES,
  PROJECT_STATUSES,
  PROJECT_TYPES,
  PROMPT_TYPES,
  REALISM_LOCK,
  TASK_CATEGORIES,
} from "@/lib/types";
import type {
  DesignNote,
  LanguageNote,
  MoneyRecord,
  MoneyType,
  Priority,
  Project,
  PromptNote,
  Task,
  WorkroomData,
  WeeklyReset,
} from "@/lib/types";

type PageKey =
  | "today"
  | "tasks"
  | "projects"
  | "language"
  | "designer"
  | "prompts"
  | "money"
  | "weekly";

type DataSetter = Dispatch<SetStateAction<WorkroomData>>;

const navItems: Array<{
  key: PageKey;
  label: string;
  short: string;
  icon: LucideIcon;
}> = [
  { key: "today", label: "Today Command", short: "Today", icon: Command },
  { key: "tasks", label: "Task Manager", short: "Tasks", icon: ListTodo },
  { key: "projects", label: "Project Archive", short: "Projects", icon: Archive },
  { key: "language", label: "Language Ritual", short: "Language", icon: Languages },
  { key: "designer", label: "Designer Vault", short: "Vault", icon: Gem },
  { key: "prompts", label: "Prompt Archive", short: "Prompts", icon: Sparkles },
  { key: "money", label: "Money Room", short: "Money", icon: Wallet },
  { key: "weekly", label: "Weekly Reset", short: "Reset", icon: RefreshCw },
];

const pageKicker: Record<PageKey, string> = {
  today: "quiet command center",
  tasks: "decisions into motion",
  projects: "creative archive",
  language: "daily memory ritual",
  designer: "brand thinking vault",
  prompts: "repeatable direction",
  money: "calm financial room",
  weekly: "weekly editorial reset",
};

const todayIso = () => new Date().toISOString().slice(0, 10);

const makeId = (prefix: string) => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(value);

const displayToday = () =>
  new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "full",
  }).format(new Date());

const moneySummary = (records: MoneyRecord[]) => {
  const income = records
    .filter((record) => record.type === "income")
    .reduce((sum, record) => sum + record.amount, 0);
  const expense = records
    .filter((record) => record.type === "expense")
    .reduce((sum, record) => sum + record.amount, 0);
  const byCategory = records
    .filter((record) => record.type === "expense")
    .reduce<Record<string, number>>((acc, record) => {
      acc[record.category] = (acc[record.category] ?? 0) + record.amount;
      return acc;
    }, {});

  return { income, expense, balance: income - expense, byCategory };
};

const blankTask = (): Task => ({
  id: "",
  title: "",
  category: "Study",
  priority: "Medium",
  dueDate: todayIso(),
  completed: false,
});

const blankProject = (): Project => ({
  id: "",
  title: "",
  type: "Branding",
  status: "Idea",
  deadline: todayIso(),
  description: "",
  nextAction: "",
});

const blankLanguageNote = (): LanguageNote => ({
  id: "",
  language: "German",
  original: "",
  meaning: "",
  level: "A1",
  tags: "",
  reviewDate: todayIso(),
});

const blankDesignNote = (): DesignNote => ({
  id: "",
  projectName: "",
  brandConcept: "",
  moodKeywords: "",
  colorPalette: "",
  target: "",
  visualDirection: "",
  avoid: "",
});

const blankPrompt = (): PromptNote => ({
  id: "",
  title: "",
  project: "",
  promptText: "",
  type: "Image",
  score: 7,
  memo: "",
  avoidList: "",
});

const blankMoneyRecord = (): MoneyRecord => ({
  id: "",
  type: "expense",
  amount: 0,
  category: "",
  date: todayIso(),
  memo: "",
});

const blankWeeklyReset = (): WeeklyReset => ({
  id: "",
  weekOf: todayIso(),
  movedForward: "",
  delayed: "",
  moneySpent: "",
  studied: "",
  designImproved: "",
  nextPriorities: ["", "", ""],
});

function upsertItem<T extends { id: string }>(items: T[], item: T) {
  return items.some((entry) => entry.id === item.id)
    ? items.map((entry) => (entry.id === item.id ? item : entry))
    : [item, ...items];
}

export function WorkroomApp() {
  const { data, setData, isReady, resetData } = useWorkroomData();
  const [activePage, setActivePage] = useState<PageKey>("today");
  const ActiveIcon = navItems.find((item) => item.key === activePage)?.icon ?? Command;

  return (
    <div className="min-h-screen text-ink">
      <aside className="fixed left-0 top-0 z-20 hidden h-screen w-[284px] border-r border-silver/40 bg-ivory/95 px-6 py-7 backdrop-blur lg:flex lg:flex-col">
        <div className="mb-10">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[8px] border border-silver/60 bg-mist">
            <Palette className="h-5 w-5 text-cherry" />
          </div>
          <p className="text-xs uppercase text-ink/50">personal archive</p>
          <h1 className="mt-2 text-2xl font-semibold leading-tight">NAYUL WORKROOM</h1>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === activePage;

            return (
              <button
                key={item.key}
                className={`flex w-full items-center gap-3 rounded-[8px] border px-3 py-3 text-left text-sm transition ${
                  isActive
                    ? "border-cherry/30 bg-white text-cherry shadow-editorial"
                    : "border-transparent text-ink/70 hover:border-silver/50 hover:bg-white/60"
                }`}
                onClick={() => setActivePage(item.key)}
                type="button"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto rounded-[8px] border border-silver/40 bg-white/50 p-4">
          <p className="text-xs uppercase text-ink/50">storage</p>
          <p className="mt-2 text-sm text-ink/70">
            {isReady ? "localStorage synced" : "loading archive"}
          </p>
          <button
            className="mt-4 inline-flex items-center gap-2 rounded-[8px] border border-silver/60 px-3 py-2 text-xs text-ink/70 hover:bg-white"
            onClick={resetData}
            type="button"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            샘플 데이터 복원
          </button>
        </div>
      </aside>

      <main className="px-4 pb-28 pt-5 sm:px-6 lg:ml-[284px] lg:px-10 lg:pb-12 lg:pt-8">
        <div className="mx-auto max-w-[1320px]">
          <header className="mb-8 flex flex-col justify-between gap-5 border-b border-silver/40 pb-6 md:flex-row md:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-[8px] border border-silver/50 bg-white/70 px-3 py-2 text-xs uppercase text-ink/50">
                <ActiveIcon className="h-3.5 w-3.5 text-cherry" />
                {pageKicker[activePage]}
              </div>
              <h2 className="text-4xl font-semibold leading-none sm:text-5xl">
                {navItems.find((item) => item.key === activePage)?.label}
              </h2>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs text-ink/50 sm:flex">
              {["ivory", "pale blue", "silver", "cherry"].map((tone) => (
                <span
                  key={tone}
                  className="rounded-[8px] border border-silver/40 bg-white/50 px-3 py-2"
                >
                  {tone}
                </span>
              ))}
            </div>
          </header>

          {activePage === "today" && (
            <TodayCommand data={data} setActivePage={setActivePage} setData={setData} />
          )}
          {activePage === "tasks" && <TaskManager data={data} setData={setData} />}
          {activePage === "projects" && <ProjectArchive data={data} setData={setData} />}
          {activePage === "language" && <LanguageRitual data={data} setData={setData} />}
          {activePage === "designer" && <DesignerVault data={data} setData={setData} />}
          {activePage === "prompts" && <PromptArchive data={data} setData={setData} />}
          {activePage === "money" && <MoneyRoom data={data} setData={setData} />}
          {activePage === "weekly" && <WeeklyResetRoom data={data} setData={setData} />}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-silver/40 bg-ivory/95 px-2 py-2 backdrop-blur lg:hidden">
        <div className="soft-scrollbar flex gap-2 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === activePage;

            return (
              <button
                key={item.key}
                className={`flex min-w-[86px] flex-col items-center gap-1 rounded-[8px] border px-3 py-2 text-[11px] transition ${
                  isActive
                    ? "border-cherry/40 bg-white text-cherry"
                    : "border-transparent text-ink/60"
                }`}
                onClick={() => setActivePage(item.key)}
                type="button"
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

function TodayCommand({
  data,
  setData,
  setActivePage,
}: {
  data: WorkroomData;
  setData: DataSetter;
  setActivePage: Dispatch<SetStateAction<PageKey>>;
}) {
  const summary = useMemo(() => moneySummary(data.moneyRecords), [data.moneyRecords]);
  const today = todayIso();
  const urgentTasks = data.tasks
    .filter((task) => !task.completed && (task.priority === "High" || task.dueDate <= today))
    .slice(0, 5);
  const activeProjects = data.projects.filter((project) => project.status === "In Progress");
  const dueLanguage = data.languageNotes.filter((note) => note.reviewDate <= today).slice(0, 4);

  const updatePriority = (index: number, value: string) => {
    setData((current) => {
      const priorities = [...current.today.priorities];
      priorities[index] = value;
      return { ...current, today: { priorities } };
    });
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <Panel className="min-h-[420px]">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="text-sm uppercase text-ink/50">{displayToday()}</p>
            <h3 className="mt-2 max-w-2xl text-3xl font-semibold leading-tight">
              오늘은 세 가지 결정만 선명하게.
            </h3>
          </div>
          <div className="flex gap-2">
            {[
              ["tasks", ListTodo],
              ["projects", Archive],
              ["money", BadgeDollarSign],
            ].map(([page, Icon]) => {
              const QuickIcon = Icon as LucideIcon;

              return (
                <IconButton
                  key={page as string}
                  label={`${page} quick add`}
                  onClick={() => setActivePage(page as PageKey)}
                >
                  <QuickIcon className="h-4 w-4" />
                </IconButton>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3">
          {data.today.priorities.map((priority, index) => (
            <label
              key={`${priority}-${index}`}
              className="grid gap-2 rounded-[8px] border border-silver/40 bg-white/70 p-4"
            >
              <span className="text-xs uppercase text-cherry">priority {index + 1}</span>
              <input
                className="w-full bg-transparent text-lg font-medium outline-none placeholder:text-ink/30"
                onChange={(event) => updatePriority(index, event.target.value)}
                placeholder="오늘의 핵심 우선순위"
                value={priority}
              />
            </label>
          ))}
        </div>
      </Panel>

      <div className="grid gap-5">
        <MetricGrid
          metrics={[
            ["총수입", formatCurrency(summary.income)],
            ["총지출", formatCurrency(summary.expense)],
            ["잔액", formatCurrency(summary.balance)],
          ]}
        />

        <Panel>
          <SectionTitle icon={CalendarDays} title="urgent tasks" />
          <div className="mt-4 space-y-3">
            {urgentTasks.length > 0 ? (
              urgentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between gap-3 border-b border-silver/40 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="mt-1 text-xs text-ink/50">
                      {task.category} · {task.dueDate}
                    </p>
                  </div>
                  <Badge tone={task.priority === "High" ? "cherry" : "blue"}>
                    {task.priority}
                  </Badge>
                </div>
              ))
            ) : (
              <EmptyLine text="긴급한 할 일이 없습니다." />
            )}
          </div>
        </Panel>
      </div>

      <Panel>
        <SectionTitle icon={Briefcase} title="in progress projects" />
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {activeProjects.length > 0 ? (
            activeProjects.map((project) => (
              <div key={project.id} className="border-l-2 border-blue pl-4">
                <p className="font-medium">{project.title}</p>
                <p className="mt-1 text-sm text-ink/60">{project.nextAction}</p>
              </div>
            ))
          ) : (
            <EmptyLine text="진행 중인 프로젝트가 없습니다." />
          )}
        </div>
      </Panel>

      <Panel>
        <SectionTitle icon={BookOpen} title="language review" />
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {dueLanguage.length > 0 ? (
            dueLanguage.map((note) => (
              <div key={note.id} className="rounded-[8px] border border-silver/40 bg-mist/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <Badge tone="blue">{note.language}</Badge>
                  <span className="text-xs text-ink/50">{note.level}</span>
                </div>
                <p className="mt-3 font-medium">{note.original}</p>
                <p className="mt-1 text-sm text-ink/60">{note.meaning}</p>
              </div>
            ))
          ) : (
            <EmptyLine text="오늘 복습할 문장이 없습니다." />
          )}
        </div>
      </Panel>
    </div>
  );
}

function TaskManager({ data, setData }: { data: WorkroomData; setData: DataSetter }) {
  const [draft, setDraft] = useState<Task>(blankTask);
  const [editingId, setEditingId] = useState<string | null>(null);

  const saveTask = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.title.trim()) {
      return;
    }

    const item = { ...draft, id: editingId ?? makeId("task") };
    setData((current) => ({ ...current, tasks: upsertItem(current.tasks, item) }));
    setDraft(blankTask());
    setEditingId(null);
  };

  const toggleTask = (taskId: string) => {
    setData((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    }));
  };

  return (
    <TwoColumn>
      <Panel>
        <SectionTitle icon={Plus} title={editingId ? "edit task" : "new task"} />
        <form className="mt-5 grid gap-4" onSubmit={saveTask}>
          <TextField
            label="할 일"
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            placeholder="예: 포트폴리오 케이스 스터디 정리"
            value={draft.title}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="카테고리"
              onChange={(event) =>
                setDraft({ ...draft, category: event.target.value as Task["category"] })
              }
              options={TASK_CATEGORIES}
              value={draft.category}
            />
            <SelectField
              label="우선순위"
              onChange={(event) =>
                setDraft({ ...draft, priority: event.target.value as Priority })
              }
              options={PRIORITIES}
              value={draft.priority}
            />
          </div>
          <TextField
            label="마감일"
            onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })}
            type="date"
            value={draft.dueDate}
          />
          <FormActions
            editing={Boolean(editingId)}
            onCancel={() => {
              setDraft(blankTask());
              setEditingId(null);
            }}
          />
        </form>
      </Panel>

      <Panel>
        <SectionTitle icon={ListTodo} title="task stack" />
        <div className="mt-5 space-y-3">
          {data.tasks.map((task) => (
            <div
              key={task.id}
              className="grid gap-3 rounded-[8px] border border-silver/40 bg-white/70 p-4 sm:grid-cols-[auto_1fr_auto]"
            >
              <button
                aria-label={task.completed ? "완료 취소" : "완료"}
                className="mt-1 text-cherry"
                onClick={() => toggleTask(task.id)}
                type="button"
              >
                {task.completed ? <Check className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
              </button>
              <div>
                <p
                  className={`font-medium ${
                    task.completed ? "text-ink/40 line-through" : "text-ink"
                  }`}
                >
                  {task.title}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge tone="blue">{task.category}</Badge>
                  <Badge tone={task.priority === "High" ? "cherry" : "silver"}>
                    {task.priority}
                  </Badge>
                  <Badge tone="silver">{task.dueDate}</Badge>
                </div>
              </div>
              <RowActions
                onDelete={() =>
                  setData((current) => ({
                    ...current,
                    tasks: current.tasks.filter((item) => item.id !== task.id),
                  }))
                }
                onEdit={() => {
                  setDraft(task);
                  setEditingId(task.id);
                }}
              />
            </div>
          ))}
        </div>
      </Panel>
    </TwoColumn>
  );
}

function ProjectArchive({ data, setData }: { data: WorkroomData; setData: DataSetter }) {
  const [draft, setDraft] = useState<Project>(blankProject);
  const [editingId, setEditingId] = useState<string | null>(null);

  const saveProject = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.title.trim()) {
      return;
    }

    const item = { ...draft, id: editingId ?? makeId("project") };
    setData((current) => ({ ...current, projects: upsertItem(current.projects, item) }));
    setDraft(blankProject());
    setEditingId(null);
  };

  return (
    <TwoColumn>
      <Panel>
        <SectionTitle icon={Plus} title={editingId ? "edit project" : "new project"} />
        <form className="mt-5 grid gap-4" onSubmit={saveProject}>
          <TextField
            label="프로젝트 제목"
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            value={draft.title}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="타입"
              onChange={(event) =>
                setDraft({ ...draft, type: event.target.value as Project["type"] })
              }
              options={PROJECT_TYPES}
              value={draft.type}
            />
            <SelectField
              label="상태"
              onChange={(event) =>
                setDraft({ ...draft, status: event.target.value as Project["status"] })
              }
              options={PROJECT_STATUSES}
              value={draft.status}
            />
          </div>
          <TextField
            label="마감일"
            onChange={(event) => setDraft({ ...draft, deadline: event.target.value })}
            type="date"
            value={draft.deadline}
          />
          <TextAreaField
            label="짧은 설명"
            onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            value={draft.description}
          />
          <TextAreaField
            label="다음 액션"
            onChange={(event) => setDraft({ ...draft, nextAction: event.target.value })}
            value={draft.nextAction}
          />
          <FormActions
            editing={Boolean(editingId)}
            onCancel={() => {
              setDraft(blankProject());
              setEditingId(null);
            }}
          />
        </form>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        {data.projects.map((project) => (
          <Panel key={project.id}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <Badge tone={project.status === "In Progress" ? "cherry" : "blue"}>
                  {project.status}
                </Badge>
                <h3 className="mt-3 text-xl font-semibold">{project.title}</h3>
              </div>
              <RowActions
                onDelete={() =>
                  setData((current) => ({
                    ...current,
                    projects: current.projects.filter((item) => item.id !== project.id),
                  }))
                }
                onEdit={() => {
                  setDraft(project);
                  setEditingId(project.id);
                }}
              />
            </div>
            <p className="text-sm text-ink/60">{project.description}</p>
            <div className="mt-5 grid gap-3 text-sm">
              <MetaRow label="type" value={project.type} />
              <MetaRow label="deadline" value={project.deadline} />
              <MetaRow label="next" value={project.nextAction} />
            </div>
          </Panel>
        ))}
      </div>
    </TwoColumn>
  );
}

function LanguageRitual({ data, setData }: { data: WorkroomData; setData: DataSetter }) {
  const [draft, setDraft] = useState<LanguageNote>(blankLanguageNote);
  const [editingId, setEditingId] = useState<string | null>(null);

  const saveNote = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.original.trim()) {
      return;
    }

    const item = { ...draft, id: editingId ?? makeId("language") };
    setData((current) => ({ ...current, languageNotes: upsertItem(current.languageNotes, item) }));
    setDraft(blankLanguageNote());
    setEditingId(null);
  };

  return (
    <TwoColumn>
      <Panel>
        <SectionTitle icon={Plus} title={editingId ? "edit sentence" : "new sentence"} />
        <form className="mt-5 grid gap-4" onSubmit={saveNote}>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="언어"
              onChange={(event) =>
                setDraft({ ...draft, language: event.target.value as LanguageNote["language"] })
              }
              options={LANGUAGES}
              value={draft.language}
            />
            <SelectField
              label="레벨"
              onChange={(event) =>
                setDraft({ ...draft, level: event.target.value as LanguageNote["level"] })
              }
              options={LANGUAGE_LEVELS}
              value={draft.level}
            />
          </div>
          <TextAreaField
            label="원문 문장"
            onChange={(event) => setDraft({ ...draft, original: event.target.value })}
            value={draft.original}
          />
          <TextAreaField
            label="뜻"
            onChange={(event) => setDraft({ ...draft, meaning: event.target.value })}
            value={draft.meaning}
          />
          <TextField
            label="태그"
            onChange={(event) => setDraft({ ...draft, tags: event.target.value })}
            value={draft.tags}
          />
          <TextField
            label="복습일"
            onChange={(event) => setDraft({ ...draft, reviewDate: event.target.value })}
            type="date"
            value={draft.reviewDate}
          />
          <FormActions
            editing={Boolean(editingId)}
            onCancel={() => {
              setDraft(blankLanguageNote());
              setEditingId(null);
            }}
          />
        </form>
      </Panel>

      <Panel>
        <SectionTitle icon={Languages} title="review archive" />
        <div className="mt-5 grid gap-3">
          {data.languageNotes.map((note) => (
            <div key={note.id} className="rounded-[8px] border border-silver/40 bg-white/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <Badge tone="blue">{note.language}</Badge>
                  <Badge tone="silver">{note.level}</Badge>
                  <Badge tone="silver">{note.reviewDate}</Badge>
                </div>
                <RowActions
                  onDelete={() =>
                    setData((current) => ({
                      ...current,
                      languageNotes: current.languageNotes.filter((item) => item.id !== note.id),
                    }))
                  }
                  onEdit={() => {
                    setDraft(note);
                    setEditingId(note.id);
                  }}
                />
              </div>
              <p className="mt-4 font-medium">{note.original}</p>
              <p className="mt-2 text-sm text-ink/60">{note.meaning}</p>
              <p className="mt-3 text-xs uppercase text-ink/40">{note.tags}</p>
            </div>
          ))}
        </div>
      </Panel>
    </TwoColumn>
  );
}

function DesignerVault({ data, setData }: { data: WorkroomData; setData: DataSetter }) {
  const [draft, setDraft] = useState<DesignNote>(blankDesignNote);
  const [editingId, setEditingId] = useState<string | null>(null);

  const saveNote = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.projectName.trim()) {
      return;
    }

    const item = { ...draft, id: editingId ?? makeId("design") };
    setData((current) => ({ ...current, designNotes: upsertItem(current.designNotes, item) }));
    setDraft(blankDesignNote());
    setEditingId(null);
  };

  return (
    <TwoColumn>
      <Panel>
        <SectionTitle icon={Plus} title={editingId ? "edit design note" : "new design note"} />
        <form className="mt-5 grid gap-4" onSubmit={saveNote}>
          <TextField
            label="프로젝트명"
            onChange={(event) => setDraft({ ...draft, projectName: event.target.value })}
            value={draft.projectName}
          />
          <TextAreaField
            label="브랜드 콘셉트"
            onChange={(event) => setDraft({ ...draft, brandConcept: event.target.value })}
            value={draft.brandConcept}
          />
          <TextField
            label="무드 키워드"
            onChange={(event) => setDraft({ ...draft, moodKeywords: event.target.value })}
            value={draft.moodKeywords}
          />
          <TextField
            label="컬러 팔레트"
            onChange={(event) => setDraft({ ...draft, colorPalette: event.target.value })}
            value={draft.colorPalette}
          />
          <TextField
            label="타깃"
            onChange={(event) => setDraft({ ...draft, target: event.target.value })}
            value={draft.target}
          />
          <TextAreaField
            label="비주얼 방향"
            onChange={(event) => setDraft({ ...draft, visualDirection: event.target.value })}
            value={draft.visualDirection}
          />
          <TextAreaField
            label="피해야 할 것"
            onChange={(event) => setDraft({ ...draft, avoid: event.target.value })}
            value={draft.avoid}
          />
          <FormActions
            editing={Boolean(editingId)}
            onCancel={() => {
              setDraft(blankDesignNote());
              setEditingId(null);
            }}
          />
        </form>
      </Panel>

      <div className="grid gap-4">
        {data.designNotes.map((note) => (
          <Panel key={note.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase text-cherry">designer vault</p>
                <h3 className="mt-2 text-2xl font-semibold">{note.projectName}</h3>
              </div>
              <RowActions
                onDelete={() =>
                  setData((current) => ({
                    ...current,
                    designNotes: current.designNotes.filter((item) => item.id !== note.id),
                  }))
                }
                onEdit={() => {
                  setDraft(note);
                  setEditingId(note.id);
                }}
              />
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <MetaBlock label="concept" value={note.brandConcept} />
              <MetaBlock label="mood" value={note.moodKeywords} />
              <MetaBlock label="palette" value={note.colorPalette} swatches />
              <MetaBlock label="target" value={note.target} />
              <MetaBlock label="direction" value={note.visualDirection} />
              <MetaBlock label="avoid" value={note.avoid} />
            </div>
          </Panel>
        ))}
      </div>
    </TwoColumn>
  );
}

function PromptArchive({ data, setData }: { data: WorkroomData; setData: DataSetter }) {
  const [draft, setDraft] = useState<PromptNote>(blankPrompt);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const savePrompt = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.title.trim()) {
      return;
    }

    const item = { ...draft, id: editingId ?? makeId("prompt") };
    setData((current) => ({ ...current, prompts: upsertItem(current.prompts, item) }));
    setDraft(blankPrompt());
    setEditingId(null);
  };

  const copyRealismLock = async () => {
    await navigator.clipboard.writeText(REALISM_LOCK);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <TwoColumn>
      <div className="grid gap-5">
        <Panel>
          <SectionTitle icon={Clipboard} title="common realism lock" />
          <p className="mt-5 border-l-2 border-cherry bg-white/60 p-4 text-sm leading-7 text-ink/75">
            {REALISM_LOCK}
          </p>
          <button
            className="mt-4 inline-flex items-center gap-2 rounded-[8px] border border-silver/50 bg-white/70 px-3 py-2 text-sm text-ink/70 hover:border-cherry/40"
            onClick={copyRealismLock}
            type="button"
          >
            <Clipboard className="h-4 w-4" />
            {copied ? "복사됨" : "복사"}
          </button>
        </Panel>

        <Panel>
          <SectionTitle icon={Plus} title={editingId ? "edit prompt" : "new prompt"} />
          <form className="mt-5 grid gap-4" onSubmit={savePrompt}>
            <TextField
              label="제목"
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              value={draft.title}
            />
            <TextField
              label="프로젝트"
              onChange={(event) => setDraft({ ...draft, project: event.target.value })}
              value={draft.project}
            />
            <SelectField
              label="프롬프트 타입"
              onChange={(event) =>
                setDraft({ ...draft, type: event.target.value as PromptNote["type"] })
              }
              options={PROMPT_TYPES}
              value={draft.type}
            />
            <TextAreaField
              label="프롬프트 텍스트"
              onChange={(event) => setDraft({ ...draft, promptText: event.target.value })}
              rows={5}
              value={draft.promptText}
            />
            <label className="grid gap-2 text-sm">
              <span className="text-xs uppercase text-ink/50">결과 점수 {draft.score}/10</span>
              <input
                className="accent-cherry"
                max={10}
                min={1}
                onChange={(event) => setDraft({ ...draft, score: Number(event.target.value) })}
                type="range"
                value={draft.score}
              />
            </label>
            <TextAreaField
              label="메모"
              onChange={(event) => setDraft({ ...draft, memo: event.target.value })}
              value={draft.memo}
            />
            <TextAreaField
              label="avoid list / negative direction"
              onChange={(event) => setDraft({ ...draft, avoidList: event.target.value })}
              value={draft.avoidList}
            />
            <FormActions
              editing={Boolean(editingId)}
              onCancel={() => {
                setDraft(blankPrompt());
                setEditingId(null);
              }}
            />
          </form>
        </Panel>
      </div>

      <Panel>
        <SectionTitle icon={Sparkles} title="prompt cards" />
        <div className="mt-5 grid gap-4">
          {data.prompts.map((prompt) => (
            <div key={prompt.id} className="rounded-[8px] border border-silver/40 bg-white/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="blue">{prompt.type}</Badge>
                    <Badge tone="cherry">{prompt.score}/10</Badge>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold">{prompt.title}</h3>
                  <p className="mt-1 text-sm text-ink/50">{prompt.project}</p>
                </div>
                <RowActions
                  onDelete={() =>
                    setData((current) => ({
                      ...current,
                      prompts: current.prompts.filter((item) => item.id !== prompt.id),
                    }))
                  }
                  onEdit={() => {
                    setDraft(prompt);
                    setEditingId(prompt.id);
                  }}
                />
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-ink/70">
                {prompt.promptText}
              </p>
              <MetaBlock label="memo" value={prompt.memo} />
              <MetaBlock label="avoid" value={prompt.avoidList} />
            </div>
          ))}
        </div>
      </Panel>
    </TwoColumn>
  );
}

function MoneyRoom({ data, setData }: { data: WorkroomData; setData: DataSetter }) {
  const [draft, setDraft] = useState<MoneyRecord>(blankMoneyRecord);
  const [editingId, setEditingId] = useState<string | null>(null);
  const summary = useMemo(() => moneySummary(data.moneyRecords), [data.moneyRecords]);

  const saveRecord = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.category.trim() || draft.amount <= 0) {
      return;
    }

    const item = { ...draft, id: editingId ?? makeId("money") };
    setData((current) => ({ ...current, moneyRecords: upsertItem(current.moneyRecords, item) }));
    setDraft(blankMoneyRecord());
    setEditingId(null);
  };

  return (
    <div className="grid gap-5">
      <MetricGrid
        metrics={[
          ["총수입", formatCurrency(summary.income)],
          ["총지출", formatCurrency(summary.expense)],
          ["잔액", formatCurrency(summary.balance)],
        ]}
      />

      <TwoColumn>
        <Panel>
          <SectionTitle icon={Plus} title={editingId ? "edit money record" : "new money record"} />
          <form className="mt-5 grid gap-4" onSubmit={saveRecord}>
            <SelectField
              label="유형"
              onChange={(event) => setDraft({ ...draft, type: event.target.value as MoneyType })}
              options={MONEY_TYPES}
              value={draft.type}
            />
            <TextField
              label="금액"
              min={0}
              onChange={(event) => setDraft({ ...draft, amount: Number(event.target.value) })}
              type="number"
              value={draft.amount}
            />
            <TextField
              label="카테고리"
              onChange={(event) => setDraft({ ...draft, category: event.target.value })}
              value={draft.category}
            />
            <TextField
              label="날짜"
              onChange={(event) => setDraft({ ...draft, date: event.target.value })}
              type="date"
              value={draft.date}
            />
            <TextAreaField
              label="메모"
              onChange={(event) => setDraft({ ...draft, memo: event.target.value })}
              value={draft.memo}
            />
            <FormActions
              editing={Boolean(editingId)}
              onCancel={() => {
                setDraft(blankMoneyRecord());
                setEditingId(null);
              }}
            />
          </form>
        </Panel>

        <div className="grid gap-5">
          <Panel>
            <SectionTitle icon={BadgeDollarSign} title="expense by category" />
            <div className="mt-5 space-y-3">
              {Object.entries(summary.byCategory).length > 0 ? (
                Object.entries(summary.byCategory).map(([category, amount]) => (
                  <div key={category}>
                    <div className="flex justify-between gap-4 text-sm">
                      <span>{category}</span>
                      <span className="font-medium">{formatCurrency(amount)}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-silver/25">
                      <div
                        className="h-2 rounded-full bg-cherry"
                        style={{
                          width: `${Math.max(8, (amount / Math.max(summary.expense, 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <EmptyLine text="지출 카테고리가 없습니다." />
              )}
            </div>
          </Panel>

          <Panel>
            <SectionTitle icon={Wallet} title="money log" />
            <div className="mt-5 space-y-3">
              {data.moneyRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex flex-col justify-between gap-3 rounded-[8px] border border-silver/40 bg-white/70 p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <Badge tone={record.type === "income" ? "blue" : "cherry"}>
                      {record.type}
                    </Badge>
                    <p className="mt-2 font-semibold">{formatCurrency(record.amount)}</p>
                    <p className="text-sm text-ink/50">
                      {record.category} · {record.date} · {record.memo}
                    </p>
                  </div>
                  <RowActions
                    onDelete={() =>
                      setData((current) => ({
                        ...current,
                        moneyRecords: current.moneyRecords.filter((item) => item.id !== record.id),
                      }))
                    }
                    onEdit={() => {
                      setDraft(record);
                      setEditingId(record.id);
                    }}
                  />
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </TwoColumn>
    </div>
  );
}

function WeeklyResetRoom({ data, setData }: { data: WorkroomData; setData: DataSetter }) {
  const [draft, setDraft] = useState<WeeklyReset>(blankWeeklyReset);
  const [editingId, setEditingId] = useState<string | null>(null);

  const saveReset = (event: FormEvent) => {
    event.preventDefault();
    const item = { ...draft, id: editingId ?? makeId("week") };
    setData((current) => ({ ...current, weeklyResets: upsertItem(current.weeklyResets, item) }));
    setDraft(blankWeeklyReset());
    setEditingId(null);
  };

  const updatePriority = (index: number, value: string) => {
    const nextPriorities = [...draft.nextPriorities];
    nextPriorities[index] = value;
    setDraft({ ...draft, nextPriorities });
  };

  return (
    <TwoColumn>
      <Panel>
        <SectionTitle icon={RefreshCw} title={editingId ? "edit reset" : "weekly reset form"} />
        <form className="mt-5 grid gap-4" onSubmit={saveReset}>
          <TextField
            label="주 시작일"
            onChange={(event) => setDraft({ ...draft, weekOf: event.target.value })}
            type="date"
            value={draft.weekOf}
          />
          <TextAreaField
            label="이번 주에 앞으로 나아간 것"
            onChange={(event) => setDraft({ ...draft, movedForward: event.target.value })}
            value={draft.movedForward}
          />
          <TextAreaField
            label="이번 주에 밀린 것"
            onChange={(event) => setDraft({ ...draft, delayed: event.target.value })}
            value={draft.delayed}
          />
          <TextAreaField
            label="이번 주에 돈 쓴 것"
            onChange={(event) => setDraft({ ...draft, moneySpent: event.target.value })}
            value={draft.moneySpent}
          />
          <TextAreaField
            label="이번 주에 공부한 것"
            onChange={(event) => setDraft({ ...draft, studied: event.target.value })}
            value={draft.studied}
          />
          <TextAreaField
            label="이번 주에 개선된 디자인 프로젝트"
            onChange={(event) => setDraft({ ...draft, designImproved: event.target.value })}
            value={draft.designImproved}
          />
          <div className="grid gap-3">
            {draft.nextPriorities.map((priority, index) => (
              <TextField
                key={index}
                label={`다음 주 핵심 우선순위 ${index + 1}`}
                onChange={(event) => updatePriority(index, event.target.value)}
                value={priority}
              />
            ))}
          </div>
          <FormActions
            editing={Boolean(editingId)}
            onCancel={() => {
              setDraft(blankWeeklyReset());
              setEditingId(null);
            }}
          />
        </form>
      </Panel>

      <Panel>
        <SectionTitle icon={Archive} title="reset archive" />
        <div className="mt-5 grid gap-4">
          {data.weeklyResets.map((reset) => (
            <div key={reset.id} className="rounded-[8px] border border-silver/40 bg-white/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge tone="blue">{reset.weekOf}</Badge>
                  <h3 className="mt-3 text-xl font-semibold">Weekly Reset</h3>
                </div>
                <RowActions
                  onDelete={() =>
                    setData((current) => ({
                      ...current,
                      weeklyResets: current.weeklyResets.filter((item) => item.id !== reset.id),
                    }))
                  }
                  onEdit={() => {
                    setDraft(reset);
                    setEditingId(reset.id);
                  }}
                />
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <MetaBlock label="forward" value={reset.movedForward} />
                <MetaBlock label="delayed" value={reset.delayed} />
                <MetaBlock label="money" value={reset.moneySpent} />
                <MetaBlock label="studied" value={reset.studied} />
                <MetaBlock label="design" value={reset.designImproved} />
                <MetaBlock label="next" value={reset.nextPriorities.filter(Boolean).join(" · ")} />
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </TwoColumn>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-[8px] border border-silver/40 bg-mist/90 p-5 shadow-editorial md:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

function TwoColumn({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 xl:grid-cols-[420px_1fr]">{children}</div>;
}

function SectionTitle({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-silver/40 bg-white/70">
        <Icon className="h-4 w-4 text-cherry" />
      </span>
      <h3 className="text-sm font-semibold uppercase text-ink/70">{title}</h3>
    </div>
  );
}

function MetricGrid({ metrics }: { metrics: Array<[string, string]> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {metrics.map(([label, value]) => (
        <div key={label} className="rounded-[8px] border border-silver/40 bg-white/70 p-4">
          <p className="text-xs uppercase text-ink/50">{label}</p>
          <p className="mt-2 break-words text-xl font-semibold">{value}</p>
        </div>
      ))}
    </div>
  );
}

function Badge({
  children,
  tone = "silver",
}: {
  children: React.ReactNode;
  tone?: "silver" | "blue" | "cherry";
}) {
  const toneClass = {
    silver: "border-silver/50 bg-white/70 text-ink/60",
    blue: "border-blue/60 bg-blue/20 text-ink",
    cherry: "border-cherry/40 bg-cherry/10 text-cherry",
  }[tone];

  return (
    <span className={`inline-flex rounded-[8px] border px-2.5 py-1 text-xs ${toneClass}`}>
      {children}
    </span>
  );
}

function IconButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-silver/50 bg-white/70 text-ink/70 transition hover:border-cherry/40 hover:text-cherry"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function RowActions({ onDelete, onEdit }: { onDelete: () => void; onEdit: () => void }) {
  return (
    <div className="flex shrink-0 gap-2">
      <IconButton label="수정" onClick={onEdit}>
        <Pencil className="h-4 w-4" />
      </IconButton>
      <IconButton label="삭제" onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
      </IconButton>
    </div>
  );
}

function FormActions({ editing, onCancel }: { editing: boolean; onCancel: () => void }) {
  return (
    <div className="flex flex-wrap gap-2 pt-2">
      <button
        className="inline-flex items-center gap-2 rounded-[8px] border border-cherry/40 bg-cherry px-4 py-2 text-sm font-medium text-white hover:bg-cherry/90"
        type="submit"
      >
        <Save className="h-4 w-4" />
        {editing ? "업데이트" : "저장"}
      </button>
      {editing && (
        <button
          className="inline-flex items-center gap-2 rounded-[8px] border border-silver/50 bg-white/70 px-4 py-2 text-sm text-ink/70 hover:bg-white"
          onClick={onCancel}
          type="button"
        >
          <X className="h-4 w-4" />
          취소
        </button>
      )}
    </div>
  );
}

function TextField({
  label,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={`grid gap-2 text-sm ${className}`}>
      <span className="text-xs uppercase text-ink/50">{label}</span>
      <input
        {...props}
        className="min-h-11 w-full rounded-[8px] border border-silver/40 bg-white/75 px-3 py-2 text-ink outline-none transition placeholder:text-ink/30 focus:border-cherry/40"
      />
    </label>
  );
}

function TextAreaField({
  label,
  rows = 3,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="text-xs uppercase text-ink/50">{label}</span>
      <textarea
        {...props}
        className="min-h-24 w-full resize-y rounded-[8px] border border-silver/40 bg-white/75 px-3 py-2 leading-6 text-ink outline-none transition placeholder:text-ink/30 focus:border-cherry/40"
        rows={rows}
      />
    </label>
  );
}

function SelectField({
  label,
  options,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: readonly string[] }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="text-xs uppercase text-ink/50">{label}</span>
      <select
        {...props}
        className="min-h-11 w-full rounded-[8px] border border-silver/40 bg-white/75 px-3 py-2 text-ink outline-none transition focus:border-cherry/40"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[88px_1fr] gap-3 border-t border-silver/40 pt-3">
      <span className="text-xs uppercase text-ink/40">{label}</span>
      <span className="min-w-0 break-words text-ink/70">{value}</span>
    </div>
  );
}

function MetaBlock({
  label,
  value,
  swatches = false,
}: {
  label: string;
  value: string;
  swatches?: boolean;
}) {
  const colors = value
    .split(",")
    .map((color) => color.trim())
    .filter((color) => color.startsWith("#"));

  return (
    <div className="border-t border-silver/40 pt-3">
      <p className="text-xs uppercase text-ink/40">{label}</p>
      {swatches && colors.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {colors.map((color) => (
            <span
              key={color}
              className="h-7 w-7 rounded-[8px] border border-silver/40"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      )}
      <p className="mt-2 min-w-0 whitespace-pre-wrap break-words text-sm leading-6 text-ink/70">
        {value}
      </p>
    </div>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <p className="text-sm text-ink/50">{text}</p>;
}
