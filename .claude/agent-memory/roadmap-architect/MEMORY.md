# Roadmap Architect 메모리

## 프로젝트: practice_supabase (모임 이벤트 관리 웹 MVP)

### 기술 스택
- Next.js (App Router) + React 19 + TypeScript 5
- Supabase (PostgreSQL + Auth + RLS) - 프록시 기반 세션 관리 (middleware.ts 파일 없음, proxy.ts 사용)
- TailwindCSS v3 + shadcn/ui (new-york style)
- 인증: Supabase Auth (이메일/비밀번호 + Google OAuth) - 이미 구현됨

### 현재 DB 상태
- 기존 테이블: profiles, todos (연습용)
- 이벤트 관련 테이블(events, participants, announcements): 미생성

### 설치된 shadcn/ui 컴포넌트
- badge, button, card, checkbox, dropdown-menu, input, label
- 미설치: textarea, dialog, separator, avatar, tabs, select, toast

### 주요 아키텍처 패턴
- 인증 미들웨어: `lib/supabase/proxy.ts`에서 처리 (비인증 사용자 `/auth`, `/login`, `/` 외 접근 차단)
- 비회원 접근: SECURITY DEFINER RPC 함수 사용 (RLS 우회)
- 초대 코드: 8자리 hex, DB UNIQUE 제약조건

### 로드맵 구조 패턴
- Phase 0: 인증 (완료) -> Phase 1: DB 기반 -> Phase 2: 이벤트 CRUD -> Phase 3: 참여자 -> Phase 4: 초대 -> Phase 5: 공지 -> Phase 6: UX 폴리싱
- Phase 2+5 병렬 가능, Phase 4는 Phase 3 의존, Phase 6은 모든 기능 완료 후
