# NAYUL OS

NAYUL OS는 단순 생산성 앱, 투두앱, 가계부, 단어장, 포트폴리오 정리 앱이 아닙니다.

한 사람의 공부, 언어, 유학, 취업, 포트폴리오, 디자인 프로젝트, 외주, 돈, 일정, 서류, 콘텐츠, 장기 목표를 하나로 연결해서 관리하는 개인 인생 운영체제 MVP입니다.

핵심 흐름:

```text
Long-term Goal
-> Project / Area
-> Milestone
-> Task
-> Today Action
-> Weekly Review
-> Progress Update
```

Supabase, 로그인, 외부 API, 외부 AI 호출 없이 브라우저 `localStorage`만 사용합니다.

## 기술 스택

- Next.js App Router
- TypeScript
- Tailwind CSS
- localStorage 저장
- 반응형 웹 디자인

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 아래 주소를 엽니다.

```bash
http://localhost:3000
```

## 검증

```bash
npm run typecheck
npm run build
```

## 핵심 모듈

### 1. Life HQ

전체 인생 상황판입니다. goals, today actions, projects, money, study, career, admin 데이터를 요약해서 보여줍니다.

- 오늘의 핵심 우선순위 3개
- 이번 주 핵심 목표
- 마감 임박 항목
- 방치된 목표
- 공부 상태
- 포폴 상태
- 돈 상태
- 취업/유학 상태
- 오늘 해야 할 next action

### 2. Goal Map

장기 목표를 관리합니다.

각 goal은 life area, target date, current stage, next milestone, progress percentage, linked projects, linked tasks, linked money records, linked documents를 갖습니다.

### 3. Today Engine

단순 task list가 아니라 goal과 project에서 내려온 오늘의 행동을 보여줍니다.

priority는 due date, importance, career relevance, goal connection을 기반으로 mock logic으로 계산합니다.

### 4. Project Rooms

디자인, 포트폴리오, 외주, 앱, 브랜드, 콘텐츠 프로젝트를 관리합니다.

샘플 프로젝트:

- DOLLSET
- NACRE ROOM
- MYUVE
- NAYUL OS
- Portfolio Website
- Upwork Profile

### 5. Study & Language Route

공부와 언어 루트를 관리합니다.

샘플:

- German A1 to B2 for study abroad
- English for freelance profile and interview
- Chinese conversation archive

### 6. Money Strategy

목표 기반 돈관리 페이지입니다.

보여주는 요약:

- total income
- total expense
- balance
- money spent on future
- money wasted
- study abroad saving progress
- freelance income

### 7. Career & Portfolio Tracker

취업, 외주, 포트폴리오, SNS, 플랫폼, 지원 관리를 추적합니다.

### 8. Life Admin Vault

서류, 링크, 계정, 비자, 학교, 계약, 자격증, 구독, 건강, 여행 행정 업무를 관리합니다.

### 9. Weekly Life Review

주간 회고와 다음 주 핵심 3개를 기록합니다.

- 이번 주 가장 많이 전진한 영역
- 가장 방치된 영역
- 돈 사용 요약
- 공부 요약
- 포폴/커리어 요약
- 다음 주 핵심 3개
- 위험 신호
- 유지할 루틴

## 데이터 연결 구조

각 데이터는 아래 필드를 통해 서로 연결됩니다.

- `area`
- `linkedGoalId`
- `linkedProjectId`
- `connectedGoalId`
- `connectedProjectId`
- `linkedProjectIds`
- `linkedTaskIds`
- `linkedMoneyRecordIds`
- `linkedDocumentIds`

Life HQ는 이 연결 데이터를 기반으로 전체 상황을 계산합니다.

## Mock Logic

실제 AI API는 사용하지 않습니다.

`src/lib/workflow.ts`에 다음 로직이 들어 있습니다.

- target date가 가까운데 progress가 낮으면 goal risk 표시
- due date, importance, career relevance, goal connection 기반 action priority 계산
- portfolio potential, monetization potential, career relevance, linked goal risk 기반 project priority 계산
- money future investment / waste / savings / freelance summary 계산

## 데이터 저장

데이터는 브라우저 `localStorage`에 저장됩니다.

현재 키:

```text
nayul-os:life-operating-system:v1
```

사이드바의 `Reset sample OS` 버튼으로 샘플 데이터를 복원할 수 있습니다.
