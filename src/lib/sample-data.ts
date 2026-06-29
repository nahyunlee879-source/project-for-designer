import type { WorkroomData } from "./types";

export const sampleData: WorkroomData = {
  today: {
    priorities: [
      "포트폴리오 메인 케이스 스터디 구조 정리",
      "독일어 A2 문장 20개 복습",
      "이번 주 지출 기록 업데이트",
    ],
  },
  tasks: [
    {
      id: "task-1",
      title: "브랜딩 프로젝트 썸네일 3안 만들기",
      category: "Design",
      priority: "High",
      dueDate: "2026-06-30",
      completed: false,
    },
    {
      id: "task-2",
      title: "독일어 동사 변화 복습",
      category: "Language",
      priority: "Medium",
      dueDate: "2026-06-29",
      completed: false,
    },
    {
      id: "task-3",
      title: "장학금 지원 일정 확인",
      category: "Study",
      priority: "Low",
      dueDate: "2026-07-02",
      completed: true,
    },
  ],
  projects: [
    {
      id: "project-1",
      title: "NAYUL Portfolio 2026",
      type: "Portfolio",
      status: "In Progress",
      deadline: "2026-07-12",
      description: "에디토리얼한 개인 포트폴리오 아카이브 구조 설계.",
      nextAction: "대표 프로젝트 4개를 문제-해결-비주얼 순서로 재정렬",
    },
    {
      id: "project-2",
      title: "Cherry Archive Beauty Direction",
      type: "Beauty",
      status: "Idea",
      deadline: "2026-07-20",
      description: "체리 레드와 실버 디테일을 활용한 뷰티 브랜드 무드보드.",
      nextAction: "레퍼런스 12장 수집 후 컬러 팔레트 정리",
    },
  ],
  languageNotes: [
    {
      id: "lang-1",
      language: "German",
      original: "Ich arbeite heute an meinem Portfolio.",
      meaning: "나는 오늘 내 포트폴리오 작업을 한다.",
      level: "A2",
      tags: "work, portfolio, routine",
      reviewDate: "2026-06-29",
    },
    {
      id: "lang-2",
      language: "English",
      original: "The concept feels quiet, precise, and personal.",
      meaning: "그 콘셉트는 조용하고 정교하며 개인적으로 느껴진다.",
      level: "B1",
      tags: "design critique",
      reviewDate: "2026-07-01",
    },
  ],
  designNotes: [
    {
      id: "design-1",
      projectName: "NAYUL Portfolio 2026",
      brandConcept: "개인 작업실처럼 조용하지만 결정이 빠른 디자인 아카이브.",
      moodKeywords: "ivory, pale blue, silver, editorial, calm command",
      colorPalette: "#f7f1e8, #aebfd4, #b9bcc2, #a9232d",
      target: "디자인 학교 지원 담당자와 주니어 디자이너 채용 담당자",
      visualDirection: "넓은 여백, 얇은 라인, 잡지 목차 같은 정보 배치",
      avoid: "노션 클론, 귀여운 스티커 UI, 과한 그라디언트",
    },
  ],
  prompts: [
    {
      id: "prompt-1",
      title: "Editorial Beauty Moodboard",
      project: "Cherry Archive Beauty Direction",
      promptText:
        "A quiet editorial beauty campaign moodboard with ivory paper, pale blue shadows, silver details, cherry red accent objects, natural model expression, refined studio lighting.",
      type: "Image",
      score: 8,
      memo: "실버 소품은 좋았지만 피부 표현이 조금 과하게 완벽함.",
      avoidList:
        "plastic skin, doll-like symmetry, neon glow, heavy retouching, stiff hands",
    },
  ],
  moneyRecords: [
    {
      id: "money-1",
      type: "income",
      amount: 450000,
      category: "Freelance",
      date: "2026-06-25",
      memo: "로고 시안 작업",
    },
    {
      id: "money-2",
      type: "expense",
      amount: 68000,
      category: "Books",
      date: "2026-06-27",
      memo: "디자인 리서치 도서",
    },
    {
      id: "money-3",
      type: "expense",
      amount: 22000,
      category: "Cafe",
      date: "2026-06-29",
      memo: "포트폴리오 작업",
    },
  ],
  weeklyResets: [
    {
      id: "week-1",
      weekOf: "2026-06-29",
      movedForward: "포트폴리오의 첫 화면 톤을 정리했다.",
      delayed: "언어 복습 시간이 불규칙했다.",
      moneySpent: "카페와 자료 구입 비용이 예상보다 많았다.",
      studied: "독일어 A2 문장 구조와 영어 디자인 설명 표현.",
      designImproved: "뷰티 브랜드 무드보드의 컬러 대비가 더 명확해졌다.",
      nextPriorities: [
        "케이스 스터디 1개 완성",
        "독일어 복습 루틴 고정",
        "지출 카테고리 정리",
      ],
    },
  ],
};
