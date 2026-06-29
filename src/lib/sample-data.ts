import type { WorkroomData } from "./types";

export const sampleData: WorkroomData = {
  today: {
    priorities: [
      "NAYUL Portfolio 2026 첫 화면: case study entry 문장 정리",
      "독일어 A2 말하기 루틴: 지원 동기 문장 12개 녹음",
      "6월 마지막 주 지출 정리 후 7월 작업 예산 잡기",
    ],
  },
  tasks: [
    {
      id: "task-1",
      title: "포트폴리오 Hero 이미지 후보 6장 비교",
      category: "Design",
      priority: "High",
      dueDate: "2026-06-30",
      completed: false,
    },
    {
      id: "task-2",
      title: "독일어 자기소개 문장 shadowing 20분",
      category: "Language",
      priority: "Medium",
      dueDate: "2026-06-29",
      completed: false,
    },
    {
      id: "task-3",
      title: "UX 포트폴리오 지원 공고 3개 저장",
      category: "Career",
      priority: "Medium",
      dueDate: "2026-07-01",
      completed: false,
    },
    {
      id: "task-4",
      title: "이번 달 카페/자료 구입비 분리 기록",
      category: "Money",
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
      description:
        "개인 작업실의 조용한 집중감을 담은 포트폴리오. 프로젝트별 문제 정의와 시각 결정을 명확하게 보이게 만든다.",
      nextAction: "메인 케이스 스터디 1개를 problem, system, visual proof 순서로 재배치",
    },
    {
      id: "project-2",
      title: "Cherry Archive Beauty Direction",
      type: "Beauty",
      status: "Idea",
      deadline: "2026-07-20",
      description:
        "체리 레드, 실버 패키징, 아이보리 스튜디오 배경을 중심으로 한 뷰티 캠페인 무드 실험.",
      nextAction: "피부 질감이 자연스러운 레퍼런스 10개와 피해야 할 AI-glam 사례 5개 정리",
    },
    {
      id: "project-3",
      title: "K-pop IP Visual System Study",
      type: "K-pop/IP",
      status: "Waiting",
      deadline: "2026-08-03",
      description:
        "앨범 티저, 팬 커뮤니티, 굿즈 톤을 하나의 IP 언어로 묶는 비주얼 시스템 스터디.",
      nextAction: "좋은 IP 시스템과 과한 팬시 스타일의 차이를 한 장으로 정리",
    },
  ],
  languageNotes: [
    {
      id: "lang-1",
      language: "German",
      original: "Ich arbeite heute an meinem Portfolio und sortiere meine Projekte.",
      meaning: "나는 오늘 내 포트폴리오를 작업하고 프로젝트를 정리한다.",
      level: "A2",
      tags: "portfolio, routine, study abroad",
      reviewDate: "2026-06-29",
    },
    {
      id: "lang-2",
      language: "English",
      original: "The direction should feel quiet, precise, and emotionally believable.",
      meaning: "그 방향은 조용하고 정교하며 감정적으로 믿을 수 있게 느껴져야 한다.",
      level: "B1",
      tags: "design critique, portfolio",
      reviewDate: "2026-07-01",
    },
    {
      id: "lang-3",
      language: "Chinese",
      original: "我想把作品集做得更清楚、更有个人风格。",
      meaning: "나는 포트폴리오를 더 명확하고 더 개인적인 스타일로 만들고 싶다.",
      level: "A1",
      tags: "portfolio, intention",
      reviewDate: "2026-07-03",
    },
  ],
  designNotes: [
    {
      id: "design-1",
      projectName: "NAYUL Portfolio 2026",
      brandConcept:
        "나현의 작업을 조용하지만 단단하게 보여주는 프라이빗 디자인 아카이브. 결과물보다 판단 과정이 먼저 보이는 포트폴리오.",
      moodKeywords:
        "ivory paper, pale blue signal, silver line, cherry mark, editorial index, calm command",
      colorPalette: "#f7f1e8, #fbf8f1, #aebfd4, #b9bcc2, #a9232d",
      target: "디자인 학교 지원 담당자, 주니어 디자이너 채용 담당자, 브랜드 스튜디오 리크루터",
      visualDirection:
        "잡지 목차 같은 리듬, 얇은 실버 라인, 중요한 판단은 크게, 보조 정보는 조용하게 배치",
      avoid: "노션 클론, 귀여운 파스텔, 회사용 SaaS 표, 과한 그림자, AI처럼 완벽한 인물 이미지",
    },
    {
      id: "design-2",
      projectName: "Cherry Archive Beauty Direction",
      brandConcept:
        "체리 레드의 생기와 실버의 차가운 정밀함을 섞은 에디토리얼 뷰티 아카이브.",
      moodKeywords: "cherry red, brushed silver, natural skin, quiet studio, tactile paper",
      colorPalette: "#a9232d, #b9bcc2, #f7f1e8, #dfe8f1",
      target: "20대 초중반 뷰티 소비자, 이미지 생성 캠페인 실험용 포트폴리오 관람자",
      visualDirection:
        "피부 결은 자연스럽게 남기고, 손과 자세는 살짝 불완전하게, 제품은 선명한 실버 디테일로 강조",
      avoid: "plastic skin, doll face, neon gradient, stiff pose, over-retouched campaign image",
    },
  ],
  prompts: [
    {
      id: "prompt-1",
      title: "Editorial Beauty Moodboard",
      project: "Cherry Archive Beauty Direction",
      promptText:
        "A quiet editorial beauty campaign moodboard with ivory paper, pale blue shadows, brushed silver details, cherry red accent objects, natural model expression, subtle skin texture, refined studio lighting.",
      type: "Image",
      score: 8,
      memo: "실버 소품과 아이보리 종이 질감은 좋음. 피부 표현은 더 자연스럽게 낮춰야 함.",
      avoidList:
        "plastic skin, doll-like symmetry, neon glow, heavy retouching, stiff hands, AI-glam perfection",
    },
    {
      id: "prompt-2",
      title: "Portfolio Case Study Rewrite",
      project: "NAYUL Portfolio 2026",
      promptText:
        "Rewrite this design project case study in a calm editorial tone. Emphasize the problem, visual decisions, constraints, and what changed after iteration. Keep the voice personal but precise.",
      type: "Portfolio",
      score: 9,
      memo: "문장 톤 정리에 재사용 가능. 너무 기업 보고서처럼 바뀌지 않게 주의.",
      avoidList:
        "generic SaaS language, overconfident claims, buzzwords, vague impact, notion-like phrasing",
    },
  ],
  moneyRecords: [
    {
      id: "money-1",
      type: "income",
      amount: 450000,
      category: "Freelance",
      date: "2026-06-25",
      memo: "로고 시안 및 간단한 브랜드 가이드 정리",
    },
    {
      id: "money-2",
      type: "expense",
      amount: 68000,
      category: "Books",
      date: "2026-06-27",
      memo: "브랜드 시스템/에디토리얼 디자인 자료",
    },
    {
      id: "money-3",
      type: "expense",
      amount: 22000,
      category: "Cafe",
      date: "2026-06-29",
      memo: "포트폴리오 리라이트 작업",
    },
    {
      id: "money-4",
      type: "expense",
      amount: 39000,
      category: "Assets",
      date: "2026-06-28",
      memo: "프레젠테이션 mockup asset",
    },
  ],
  weeklyResets: [
    {
      id: "week-1",
      weekOf: "2026-06-29",
      movedForward:
        "포트폴리오 첫 화면의 톤을 '조용한 개인 작업실'로 정리했고, 케이스 스터디 목차를 다시 나눴다.",
      delayed:
        "독일어 복습 시간이 매일 같은 시간에 고정되지 않았다. 오전보다 밤 루틴이 더 현실적이다.",
      moneySpent:
        "카페 작업비와 디자인 자료 구입비가 많았다. 7월에는 자료비를 별도 예산으로 묶어야 한다.",
      studied:
        "독일어 A2 자기소개, 영어 디자인 critique 표현, 포트폴리오 프로젝트 설명 문장.",
      designImproved:
        "Cherry Archive 프로젝트에서 피부 질감과 실버 패키징 디테일의 방향이 더 구체화됐다.",
      nextPriorities: [
        "NAYUL Portfolio 메인 케이스 스터디 1개 완성",
        "독일어 speaking ritual을 밤 20분으로 고정",
        "7월 디자인/자료/카페 예산을 Money Room에 입력",
      ],
    },
  ],
};
