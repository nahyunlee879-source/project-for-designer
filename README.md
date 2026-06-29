# NAYUL WORKROOM

디자이너/학생을 위한 개인 크리에이티브 운영체제 MVP입니다. 공부, 언어공부, 디자인 프로젝트, 프롬프트, 포트폴리오, 취업 준비, 돈 관리, 주간 회고를 localStorage 기반으로 관리합니다.

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

## 빌드 확인

```bash
npm run build
```

## 데이터 저장 방식

별도 로그인, Supabase, 외부 API 없이 브라우저 `localStorage`에 저장됩니다. 저장 키는 `nayul-workroom:v1`입니다. 앱 왼쪽 사이드바의 `샘플 데이터 복원` 버튼으로 초기 샘플 데이터를 다시 불러올 수 있습니다.

## MVP 화면

- Today Command
- Task Manager
- Project Archive
- Language Ritual
- Designer Vault
- Prompt Archive
- Money Room
- Weekly Reset
