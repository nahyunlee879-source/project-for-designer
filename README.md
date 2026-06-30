# NAYUL WORKROOM

NAYUL WORKROOM은 일반 투두앱이나 노션 클론이 아니라, 한 명의 디자이너가 아이디어를 수집하고 판단한 뒤 브랜드 DNA, 실험, 포트폴리오, 커리어 액션으로 발전시키는 개인 크리에이티브 디렉터 시스템 MVP입니다.

Supabase, 로그인, 외부 AI/API 없이 브라우저의 `localStorage`만 사용합니다.

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

## 핵심 구조

### 1. Command Room

전체 프로젝트 상태를 판단하는 메인 대시보드입니다. 저장된 아이디어, 프로젝트, 실험의 상태와 점수를 기반으로 다음 항목을 추천합니다.

- Today's Next Move
- Portfolio-worthy concepts
- Concepts needing decision
- Recent prompt failures
- High taste-fit ideas
- Career/study connected actions

추천 로직은 `src/lib/workflow.ts`에 TypeScript 함수로 분리되어 있습니다.

### 2. Idea Pipeline

아이디어를 단순 메모가 아니라 상태가 변하는 파이프라인으로 관리합니다.

상태:

- Raw
- Worth Keeping
- Needs Research
- Concept Candidate
- Visual Experiment
- Portfolio Candidate
- Brand System
- Published
- Archived

각 아이디어는 taste fit, portfolio potential, brand depth, monetization potential, career usefulness 점수를 갖고, 이 점수로 priority와 추천 배지가 계산됩니다.

### 3. Project Studio

프로젝트별로 Brand DNA, Standards, References, Prompt Experiments, Result Reviews, Portfolio Case, Next Moves를 한 화면에서 연결해 봅니다.

샘플 프로젝트:

- DOLLSET: flash hotgirl dress brand, cute/princess/coquette 금지
- NACRE ROOM: private bridal mood total brand, generic wedding hall/princess fantasy 금지
- MYUVE: 5th-gen K-pop IP system, over-conceptual abstract labels 금지
- NAYUL WORKROOM: personal creative director system, generic productivity app 금지

### 4. Experiment Lab

프롬프트와 비주얼 방향을 실험하고 실패 원인을 태그로 기록합니다. `Generate next revision direction` 버튼은 외부 AI를 호출하지 않고, 선택된 failure tags와 프로젝트 DNA를 조합해 다음 수정 방향 문장을 생성합니다.

### 5. Portfolio Builder

프로젝트를 선택하면 연결된 DNA, 레퍼런스, 실험, 리뷰, next moves를 바탕으로 포트폴리오 케이스 스터디 섹션을 자동 구성합니다. 사용자는 각 섹션을 직접 수정하고 저장할 수 있습니다.

## 데이터 저장

데이터는 브라우저 `localStorage`에 저장됩니다.

현재 키:

```text
nayul-workroom:deep-workflow:v1
```

사이드바의 `Reset sample archive` 버튼으로 샘플 데이터를 복원할 수 있습니다.
