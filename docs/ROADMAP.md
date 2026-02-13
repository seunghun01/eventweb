# 개발 로드맵

> PRD 기반 자동 생성 | 최종 업데이트: 2026-02-13
> 원본 PRD: `docs/PRD.md` (모임 이벤트 관리 웹 MVP)

---

## 전체 진행 상황

| 페이즈 | 상태 | 진행률 | 설명 |
|--------|------|--------|------|
| Phase 0: 사용자 인증 | 완료 | 4/5 완료 | 이메일/Google 로그인, 세션 관리 (redirect_to 미구현) |
| Phase 1: 데이터베이스 및 기반 설정 | 대기 | 0/7 완료 | DB 마이그레이션, RLS, RPC, 타입, 유틸리티 |
| Phase 2: 이벤트 핵심 기능 (CRUD) | 대기 | 0/8 완료 | 이벤트 생성/목록/상세/수정 |
| Phase 3: 참여자 관리 | 대기 | 0/6 완료 | 참석 응답, 참여자 목록, 상태 뱃지 |
| Phase 4: 초대 시스템 | 대기 | 0/7 완료 | 초대 링크, 비회원 참여, 랜딩 페이지 |
| Phase 5: 공지사항 | 대기 | 0/5 완료 | 공지 CRUD, 고정, 탭 통합 |
| Phase 6: UX 완성 및 폴리싱 | 대기 | 0/8 완료 | Toast, 로딩/빈 상태, 반응형, 상태 관리 |

---

## Phase 0: 사용자 인증 (구현 완료)

> **목표**: 이메일/비밀번호 및 Google OAuth 기반 인증 시스템 구축
> **우선순위**: P0 Critical
> **상태**: 대부분 완료 (FR-01)

### 완료된 항목

- [x] **P0-01** 이메일/비밀번호 회원가입 및 로그인
  - 관련 파일: `app/auth/login/page.tsx`, `app/auth/sign-up/page.tsx`
- [x] **P0-02** Google OAuth 로그인
  - 관련 파일: `app/auth/callback/route.ts`
- [x] **P0-03** 비밀번호 재설정
  - 관련 파일: `app/auth/forgot-password/page.tsx`, `app/auth/update-password/page.tsx`
- [x] **P0-04** 세션 관리 (쿠키 기반)
  - 관련 파일: `lib/supabase/server.ts`, `lib/supabase/proxy.ts`

### 미완료 항목 (Phase 4에서 처리)

- [ ] **P0-05** 로그인 시 `redirect_to` 파라미터 지원
  - 상세: 초대 링크 접속 -> 로그인 -> 원래 페이지로 복귀 플로우
  - Phase 4 초대 시스템 구현 시 함께 처리

---

## Phase 1: 데이터베이스 및 기반 설정

> **목표**: 이벤트 관리 시스템의 데이터베이스 스키마, 보안 정책, 타입 시스템 구축
> **우선순위**: P0 Critical
> **예상 복잡도**: 중
> **선행 조건**: Phase 0 완료

### 태스크 목록

- [ ] **P1-01** events 테이블 마이그레이션 생성
  - 상세: PRD 5.2절 events 테이블 스키마에 따라 Supabase 마이그레이션 작성. id(uuid PK), created_at, updated_at(트리거 자동 갱신), title(text NOT NULL), description(nullable text), host_id(FK -> auth.users), event_date(timestamptz NOT NULL), location(nullable text), max_participants(nullable integer), invite_code(UNIQUE text NOT NULL), status(text DEFAULT 'active'). updated_at 자동 갱신 트리거 함수도 함께 생성
  - 관련 파일: Supabase 마이그레이션
  - 의존성: 없음

- [ ] **P1-02** participants 테이블 마이그레이션 생성
  - 상세: PRD 5.2절 participants 테이블 스키마에 따라 마이그레이션 작성. id(uuid PK), created_at, event_id(FK -> events ON DELETE CASCADE), user_id(nullable FK -> auth.users), guest_name(nullable text), rsvp_status(text DEFAULT 'pending'), note(nullable text). UNIQUE(event_id, user_id) 제약조건 + CHECK(user_id IS NOT NULL OR guest_name IS NOT NULL) 제약조건 포함
  - 관련 파일: Supabase 마이그레이션
  - 의존성: P1-01

- [ ] **P1-03** announcements 테이블 마이그레이션 생성
  - 상세: PRD 5.2절 announcements 테이블 스키마에 따라 마이그레이션 작성. id(uuid PK), created_at, event_id(FK -> events ON DELETE CASCADE), author_id(FK -> auth.users), content(text NOT NULL), is_pinned(boolean DEFAULT false)
  - 관련 파일: Supabase 마이그레이션
  - 의존성: P1-01

- [ ] **P1-04** RLS 정책 적용
  - 상세: PRD 5.3절 보안 정책에 따라 3개 테이블에 RLS 정책 설정. events(SELECT: 호스트 또는 참여자, INSERT: 인증 사용자 host_id=본인, UPDATE/DELETE: 호스트만), participants(SELECT: 호스트 또는 본인, INSERT: 인증 사용자 user_id=본인, UPDATE: 본인만, DELETE: 본인 또는 호스트), announcements(SELECT: 호스트 또는 참여자, INSERT: 호스트만, UPDATE: 작성자만, DELETE: 작성자 또는 호스트)
  - 관련 파일: Supabase 마이그레이션
  - 의존성: P1-01, P1-02, P1-03

- [ ] **P1-05** 비회원 접근용 RPC 함수 생성
  - 상세: PRD 5.4절에 따라 SECURITY DEFINER 함수 2개 생성. `get_event_by_invite_code(code text)` - 초대 코드로 이벤트 공개 정보(제목, 날짜, 장소, 현재 참여자 수, 최대 인원) 조회. `join_event_as_guest(invite_code text, guest_name text, rsvp_status text, note text)` - 비회원 이벤트 참여 등록. anon 역할에 실행 권한 부여. 최대 인원 초과 시 에러 반환 로직 포함
  - 관련 파일: Supabase 마이그레이션
  - 의존성: P1-01, P1-02

- [ ] **P1-06** TypeScript 타입 생성 및 정의
  - 상세: Supabase CLI로 자동 생성된 Database 타입을 기반으로 애플리케이션에서 사용할 타입 파일 작성. Event, Participant, Announcement 인터페이스, 이벤트 상태(EventStatus), RSVP 상태(RsvpStatus) 유니온 타입, 폼 입력용 타입(CreateEventInput, UpdateEventInput 등) 정의
  - 관련 파일: `lib/types/database.ts`, `lib/types/event.ts`
  - 의존성: P1-01, P1-02, P1-03

- [ ] **P1-07** 유틸리티 함수 및 프로젝트 기반 설정
  - 상세: (1) `generateInviteCode()` - 8자리 hex 초대 코드 생성 함수. (2) shadcn/ui 추가 컴포넌트 설치: textarea, dialog, separator, avatar, tabs, select, toast. (3) 미들웨어 수정 - `/invite` 경로를 비인증 허용 목록에 추가 (`lib/supabase/proxy.ts`의 리다이렉트 조건에 `/invite` 예외 추가)
  - 관련 파일: `lib/utils/invite-code.ts`, `lib/supabase/proxy.ts`, `components/ui/*`
  - 의존성: 없음 (컴포넌트 설치와 유틸리티는 독립 작업)

### 완료 기준 (Definition of Done)

- [ ] events, participants, announcements 테이블이 Supabase에 생성되어 있음
- [ ] 각 테이블에 RLS 정책이 적용되어 비인가 접근이 차단됨
- [ ] RPC 함수로 비회원이 초대 코드를 통해 이벤트 정보 조회 및 참여 가능
- [ ] TypeScript 타입이 정의되어 IDE 자동완성 지원
- [ ] `/invite/*` 경로에 비인증 사용자가 접근 가능

---

## Phase 2: 이벤트 핵심 기능 (CRUD)

> **목표**: 이벤트 생성, 목록 조회, 상세 보기, 수정 기능 구현 (FR-02-01~04)
> **우선순위**: P0 Critical
> **예상 복잡도**: 상
> **선행 조건**: Phase 1 완료

### 태스크 목록

- [ ] **P2-01** 이벤트 Server Actions 구현 (생성/수정)
  - 상세: `createEvent` - 이벤트 생성 (제목, 설명, 날짜/시간, 장소, 최대 인원 입력, 8자리 초대 코드 자동 생성, host_id = 현재 사용자). `updateEvent` - 이벤트 수정 (주최자 권한 검증 포함). Zod 스키마로 입력 유효성 검사. revalidatePath를 활용한 캐시 무효화
  - 관련 파일: `app/events/actions.ts`
  - 의존성: P1-01, P1-06

- [ ] **P2-02** 이벤트 레이아웃 구성
  - 상세: `/events` 하위 페이지 공용 레이아웃 생성. 네비게이션 바(로고, 이벤트 목록 링크, 사용자 메뉴), 인증 확인 로직 포함. `app/protected/layout.tsx` 구조를 참고하되 이벤트 관리에 맞게 네비게이션 조정
  - 관련 파일: `app/events/layout.tsx`
  - 의존성: P1-07

- [ ] **P2-03** 이벤트 목록 페이지 구현
  - 상세: "내가 만든 이벤트"와 "참여 중인 이벤트"를 분리 표시 (FR-02-02). Server Component로 Supabase에서 데이터 페칭. 이벤트 카드에 제목, 날짜, 장소, 참여자 수/최대 인원, 상태 뱃지 표시. 이벤트가 없을 때 빈 상태 UI 포함. "새 이벤트 만들기" CTA 버튼
  - 관련 파일: `app/events/page.tsx`, `components/events/event-card.tsx`
  - 의존성: P2-01

- [ ] **P2-04** EventCard 컴포넌트 구현
  - 상세: Server Component. 이벤트 요약 정보를 카드 형태로 표시. 제목, 날짜(포맷팅), 장소, 참여자 현황(N/M명), 상태 뱃지(active/cancelled/completed). 클릭 시 이벤트 상세 페이지(`/events/[id]`)로 이동. shadcn/ui Card 컴포넌트 활용
  - 관련 파일: `components/events/event-card.tsx`
  - 의존성: P1-06

- [ ] **P2-05** EventForm 컴포넌트 구현 (생성/수정 공용)
  - 상세: Client Component. 이벤트 생성과 수정에 공용으로 사용하는 폼. 필드: 제목(필수), 설명(선택), 날짜/시간(필수), 장소(선택), 최대 인원(선택). React Hook Form + Zod 유효성 검사 (PRD에 React Hook Form이 명시되어 있지 않으나 프로젝트 표준으로 사용). 수정 모드에서는 기존 데이터 프리필. 제출 시 Server Action 호출
  - 관련 파일: `components/events/event-form.tsx`
  - 의존성: P1-06, P1-07 (textarea 등 UI 컴포넌트)

- [ ] **P2-06** 이벤트 생성 페이지 구현
  - 상세: `/events/new` 경로. EventForm을 생성 모드로 렌더링. 생성 완료 시 `/events/[id]` 상세 페이지로 리다이렉트. 인증된 사용자만 접근 가능
  - 관련 파일: `app/events/new/page.tsx`
  - 의존성: P2-01, P2-05

- [ ] **P2-07** 이벤트 상세 페이지 구현 (정보 탭)
  - 상세: `/events/[id]` 경로. PRD 6.2절 와이어프레임 참고. EventDetailHeader(제목, 날짜, 장소, 참여자 현황, 초대 링크 복사) + 탭 구성(정보/참여자/공지). Phase 2에서는 정보 탭만 구현, 참여자/공지 탭은 각 Phase에서 추가. 주최자에게만 수정/삭제 버튼 표시. shadcn/ui Tabs 컴포넌트 활용
  - 관련 파일: `app/events/[id]/page.tsx`, `components/events/event-detail-header.tsx`
  - 의존성: P2-01, P1-07 (tabs 컴포넌트)

- [ ] **P2-08** 이벤트 수정 페이지 구현
  - 상세: `/events/[id]/edit` 경로. 기존 이벤트 데이터를 조회하여 EventForm에 프리필. 주최자만 접근 가능 (서버에서 권한 검증). 수정 완료 시 `/events/[id]` 상세 페이지로 리다이렉트
  - 관련 파일: `app/events/[id]/edit/page.tsx`
  - 의존성: P2-01, P2-05

### 완료 기준 (Definition of Done)

- [ ] 인증된 사용자가 이벤트를 생성할 수 있음 (제목, 설명, 날짜, 장소, 최대 인원)
- [ ] 이벤트 생성 시 8자리 초대 코드가 자동 생성됨
- [ ] 이벤트 목록에서 "내가 만든"과 "참여 중인" 이벤트가 분리 표시됨
- [ ] 이벤트 상세 페이지에서 이벤트 정보를 확인할 수 있음
- [ ] 주최자만 이벤트를 수정할 수 있음
- [ ] 비주최자가 수정 페이지에 접근하면 차단됨

---

## Phase 3: 참여자 관리

> **목표**: 참석/불참 응답 시스템 및 참여자 목록 관리 기능 구현 (FR-03-01~03)
> **우선순위**: P0 Critical
> **예상 복잡도**: 중
> **선행 조건**: Phase 2 완료

### 태스크 목록

- [ ] **P3-01** 참여자 관련 Server Actions 구현
  - 상세: `respondToEvent` - 참석/불참/미정 응답 upsert (이미 응답한 경우 상태 변경, FR-03-01 + FR-03-02). user_id + event_id 기준으로 기존 응답 확인 후 INSERT 또는 UPDATE. revalidatePath로 상세 페이지 캐시 무효화
  - 관련 파일: `app/events/actions.ts`
  - 의존성: P1-02, P1-06

- [ ] **P3-02** RsvpBadge 컴포넌트 구현
  - 상세: Server Component. 참석 상태를 시각적 뱃지로 표시. attending(초록), declined(빨강), pending(회색). shadcn/ui Badge 컴포넌트 + 상태별 variant 스타일링
  - 관련 파일: `components/events/rsvp-badge.tsx`
  - 의존성: P1-06

- [ ] **P3-03** RsvpForm 컴포넌트 구현
  - 상세: Client Component. 참석/불참/미정 3개 버튼으로 구성된 응답 폼. 현재 응답 상태를 시각적으로 표시 (선택된 버튼 하이라이트). 버튼 클릭 시 respondToEvent Server Action 호출. 낙관적 업데이트(Optimistic UI) 적용
  - 관련 파일: `components/events/rsvp-form.tsx`
  - 의존성: P3-01, P3-02

- [ ] **P3-04** ParticipantItem 컴포넌트 구현
  - 상세: Client Component. 개별 참여자 행 표시. 사용자 이름(또는 게스트 이름) + RsvpBadge + 메모(있는 경우). 참여자 아바타 표시 (shadcn/ui Avatar)
  - 관련 파일: `components/events/participant-item.tsx`
  - 의존성: P3-02

- [ ] **P3-05** ParticipantList 컴포넌트 구현
  - 상세: Server Component. 참여자를 상태별로 그룹화하여 표시 (FR-03-03). "참석" / "미정" / "불참" 3개 그룹. 각 그룹 헤더에 인원수 표시. 그룹 내 ParticipantItem 목록 렌더링. 참여자가 없을 때 빈 상태 메시지
  - 관련 파일: `components/events/participant-list.tsx`
  - 의존성: P3-04

- [ ] **P3-06** 이벤트 상세 참여자 탭 통합
  - 상세: 이벤트 상세 페이지의 "참여자" 탭에 ParticipantList + RsvpForm 통합. 현재 사용자의 응답 상태를 조회하여 RsvpForm에 전달. 본인이 주최자인 경우와 참여자인 경우 UI 분기
  - 관련 파일: `app/events/[id]/page.tsx` (참여자 탭 영역)
  - 의존성: P3-03, P3-05, P2-07

### 완료 기준 (Definition of Done)

- [ ] 로그인한 사용자가 이벤트에 참석/불참/미정 응답 가능
- [ ] 이미 응답한 사용자가 응답을 변경할 수 있음
- [ ] 참여자 목록이 상태별(참석/미정/불참)로 그룹화되어 표시됨
- [ ] 이벤트 상세 페이지 "참여자" 탭에서 목록과 응답 폼이 동작함

---

## Phase 4: 초대 시스템

> **목표**: 초대 링크를 통한 회원/비회원 이벤트 참여 플로우 구현 (FR-04-01~05)
> **우선순위**: P0 Critical
> **예상 복잡도**: 상
> **선행 조건**: Phase 3 완료

### 태스크 목록

- [ ] **P4-01** InviteShare 컴포넌트 구현
  - 상세: Client Component. 초대 링크 URL을 클립보드에 복사하는 버튼. `[서비스URL]/invite/[초대코드]` 형식. 복사 완료 시 시각적 피드백(아이콘 변경 또는 토스트). 이벤트 상세 페이지 헤더에 배치 (FR-04-02)
  - 관련 파일: `components/events/invite-share.tsx`
  - 의존성: P2-07

- [ ] **P4-02** 초대 랜딩 페이지 구현
  - 상세: `/invite/[code]` 경로 (FR-04-05). RPC 함수 `get_event_by_invite_code`로 이벤트 정보 조회. 이벤트 제목, 날짜, 장소, 현재 참여자 수/최대 인원 표시. 비회원용 참여 폼(GuestJoinForm) + 로그인 유도 CTA("로그인하면 더 많은 기능을 이용할 수 있습니다") 표시. 이미 참여한 회원은 이벤트 상세 페이지로 리다이렉트. 잘못된/만료된 초대 코드 에러 처리
  - 관련 파일: `app/invite/[code]/page.tsx`
  - 의존성: P1-05, P1-07 (미들웨어)

- [ ] **P4-03** GuestJoinForm 컴포넌트 구현
  - 상세: Client Component (FR-04-03). 비회원 간편 참여 폼. 필드: 이름(필수), 참석 여부(참석/불참 선택, 필수), 메모(선택). 제출 시 `joinAsGuest` Server Action 호출 (RPC 함수 `join_event_as_guest` 사용). 참여 완료 시 확인 화면 표시("참여가 완료되었습니다!"). Zod 유효성 검사
  - 관련 파일: `components/events/guest-join-form.tsx`
  - 의존성: P4-05

- [ ] **P4-04** 비회원 참여 완료 화면 구현
  - 상세: 비회원이 참여를 완료한 후 보여주는 확인 화면. "참여가 완료되었습니다!" 메시지 + 이벤트 요약 정보. "회원가입하면 더 많은 기능을 이용할 수 있어요" 안내 + 회원가입 CTA 버튼
  - 관련 파일: `app/invite/[code]/page.tsx` (상태 분기) 또는 `app/invite/[code]/success/page.tsx`
  - 의존성: P4-03

- [ ] **P4-05** 초대 관련 Server Actions 구현
  - 상세: `joinAsGuest` - RPC 함수 호출하여 비회원 참여 등록 (인증 불필요). `joinAsUser` - 로그인된 사용자의 초대 참여 처리 (participants 테이블에 INSERT). 중복 참여 방지 로직 포함
  - 관련 파일: `app/invite/[code]/actions.ts`
  - 의존성: P1-05, P3-01

- [ ] **P4-06** 회원 초대 참여 플로우 구현
  - 상세: 로그인 상태에서 초대 링크 접속 시 이벤트 정보 확인 후 바로 참여 (FR-04-04). 이미 참여 중인 이벤트이면 이벤트 상세 페이지로 리다이렉트. 참여 완료 후 `/events/[id]` 상세 페이지로 이동
  - 관련 파일: `app/invite/[code]/page.tsx`
  - 의존성: P4-02, P4-05

- [ ] **P4-07** 로그인 redirect_to 파라미터 지원
  - 상세: 비로그인 상태에서 초대 링크 접속 -> 로그인 페이지 이동 시 `redirect_to` 쿼리 파라미터 전달. 로그인 성공 후 `redirect_to`에 지정된 원래 페이지(초대 링크)로 복귀. 미들웨어(`lib/supabase/proxy.ts`)에서 리다이렉트 시 원래 URL을 redirect_to로 전달. 로그인 폼에서 redirect_to 파라미터 읽어 로그인 후 리다이렉트 (FR-01 미완료 항목)
  - 관련 파일: `lib/supabase/proxy.ts`, `components/login-form.tsx`, `app/auth/login/page.tsx`
  - 의존성: P4-02

### 완료 기준 (Definition of Done)

- [ ] 이벤트 상세 페이지에서 초대 링크를 클립보드에 복사할 수 있음
- [ ] 초대 링크(`/invite/[code]`)로 접속하면 이벤트 정보가 표시됨
- [ ] 비회원이 이름만 입력하여 이벤트에 참여할 수 있음
- [ ] 비회원 참여 완료 후 확인 화면과 회원가입 유도 CTA가 표시됨
- [ ] 로그인된 사용자가 초대 링크로 바로 이벤트에 참여할 수 있음
- [ ] 비로그인 사용자가 초대 링크 접속 -> 로그인 -> 원래 초대 페이지로 복귀됨
- [ ] 잘못된 초대 코드 접속 시 적절한 에러 화면이 표시됨

---

## Phase 5: 공지사항

> **목표**: 이벤트 공지사항 작성, 조회, 삭제, 고정 기능 구현 (FR-05-01~04)
> **우선순위**: P1 High
> **예상 복잡도**: 중
> **선행 조건**: Phase 2 완료 (이벤트 상세 페이지 탭 구조 필요)

### 태스크 목록

- [ ] **P5-01** 공지사항 Server Actions 구현
  - 상세: `createAnnouncement` - 공지 작성 (주최자만, event_id + author_id + content). `deleteAnnouncement` - 공지 삭제 (작성자 또는 주최자). `toggleAnnouncementPin` - 공지 고정/해제 (주최자만, is_pinned 토글). 각 Action에서 권한 검증 포함
  - 관련 파일: `app/events/actions.ts`
  - 의존성: P1-03, P1-06

- [ ] **P5-02** AnnouncementForm 컴포넌트 구현
  - 상세: Client Component. 공지사항 작성 폼. textarea로 내용 입력 + 작성 버튼. 주최자에게만 표시. 작성 완료 시 목록 갱신 (revalidatePath)
  - 관련 파일: `components/events/announcement-form.tsx`
  - 의존성: P5-01, P1-07 (textarea 컴포넌트)

- [ ] **P5-03** AnnouncementCard 컴포넌트 구현
  - 상세: Server Component. 개별 공지사항 카드. 작성자명, 작성 시간(상대시간 포맷), 내용, 고정 아이콘(고정된 경우). 삭제 버튼(작성자 또는 주최자에게만 표시). 고정/해제 버튼(주최자에게만 표시, P2 우선순위이므로 기본 구현)
  - 관련 파일: `components/events/announcement-card.tsx`
  - 의존성: P1-06

- [ ] **P5-04** AnnouncementList 컴포넌트 구현
  - 상세: Server Component. 공지사항 목록 (FR-05-02). 고정된 공지를 상단에 표시, 나머지는 최신순 정렬. 공지가 없을 때 빈 상태 메시지. AnnouncementCard 목록 렌더링
  - 관련 파일: `components/events/announcement-list.tsx`
  - 의존성: P5-03

- [ ] **P5-05** 이벤트 상세 공지 탭 통합
  - 상세: 이벤트 상세 페이지의 "공지" 탭에 AnnouncementList + AnnouncementForm(주최자용) 통합. 주최자에게는 작성 폼 표시, 모든 참여자에게 목록 표시
  - 관련 파일: `app/events/[id]/page.tsx` (공지 탭 영역)
  - 의존성: P5-02, P5-04, P2-07

### 완료 기준 (Definition of Done)

- [ ] 주최자가 이벤트에 공지사항을 작성할 수 있음
- [ ] 공지사항이 최신순으로 정렬되어 표시됨
- [ ] 고정된 공지가 목록 상단에 표시됨
- [ ] 작성자 또는 주최자가 공지를 삭제할 수 있음
- [ ] 주최자가 공지를 고정/해제할 수 있음
- [ ] 이벤트 상세 페이지 "공지" 탭에서 모든 기능이 동작함

---

## Phase 6: UX 완성 및 폴리싱

> **목표**: 사용자 경험 개선, 에지 케이스 처리, 반응형 디자인 완성 (FR-02-05~06, FR-03-04~06, Phase 3 UX 개선)
> **우선순위**: P1 High
> **예상 복잡도**: 중
> **선행 조건**: Phase 4, Phase 5 완료

### 태스크 목록

- [ ] **P6-01** Toast 알림 시스템 통합
  - 상세: shadcn/ui Toast를 활용한 전역 알림 시스템. 이벤트 생성/수정/삭제 성공, 참석 응답 변경, 공지 작성/삭제, 초대 링크 복사, 에러 발생 등 모든 사용자 액션에 대한 피드백. RootLayout에 Toaster 컴포넌트 추가
  - 관련 파일: `app/layout.tsx`, 각 Server Action 및 Client Component
  - 의존성: P1-07 (toast 컴포넌트)

- [ ] **P6-02** 로딩 상태 및 빈 상태 UI 구현
  - 상세: (1) Next.js loading.tsx 파일을 활용한 페이지 로딩 스켈레톤 UI (이벤트 목록, 상세 페이지). (2) EventEmptyState 컴포넌트 - 이벤트가 없을 때, 참여자가 없을 때, 공지가 없을 때 각각의 빈 상태 안내 UI. 적절한 아이콘 + 안내 메시지 + CTA 버튼
  - 관련 파일: `app/events/loading.tsx`, `app/events/[id]/loading.tsx`, `components/events/event-empty-state.tsx`
  - 의존성: P2-03, P3-05, P5-04

- [ ] **P6-03** 이벤트 삭제 기능 구현
  - 상세: `deleteEvent` Server Action (주최자만, FR-02-05). 삭제 확인 다이얼로그 (shadcn/ui Dialog). CASCADE로 참여자 데이터도 함께 삭제. 삭제 완료 후 `/events` 목록으로 리다이렉트
  - 관련 파일: `app/events/actions.ts`, `components/events/event-actions.tsx`
  - 의존성: P2-07, P1-07 (dialog 컴포넌트)

- [ ] **P6-04** 이벤트 상태 변경 기능 구현
  - 상세: `updateEventStatus` Server Action (주최자만, FR-02-06). active -> cancelled / completed 상태 전환. EventActions 컴포넌트에 상태 변경 드롭다운 또는 버튼 추가. 취소된/완료된 이벤트에서는 참석 응답 변경 비활성화
  - 관련 파일: `app/events/actions.ts`, `components/events/event-actions.tsx`
  - 의존성: P2-07, P3-03

- [ ] **P6-05** 참여자 메모 기능 구현
  - 상세: RsvpForm에 메모 입력 필드 추가 (FR-03-04). 참석 응답 시 선택적으로 짧은 메모 작성 가능 (예: "30분 늦습니다"). ParticipantItem에 메모 표시
  - 관련 파일: `components/events/rsvp-form.tsx`, `components/events/participant-item.tsx`
  - 의존성: P3-03, P3-04

- [ ] **P6-06** 참여자 제거 기능 구현
  - 상세: `removeParticipant` Server Action (주최자만, FR-03-05). ParticipantItem에 주최자용 제거 버튼 추가. 제거 확인 다이얼로그. 삭제 후 참여자 목록 갱신
  - 관련 파일: `app/events/actions.ts`, `components/events/participant-item.tsx`
  - 의존성: P3-04, P3-05

- [ ] **P6-07** 최대 인원 제한 로직 구현
  - 상세: 참석 응답 시 현재 참석 인원이 max_participants에 도달했는지 확인 (FR-03-06). 최대 인원 초과 시 참석 응답 차단 + 에러 메시지. 이벤트 카드와 상세 페이지에서 "마감" 상태 시각적 표시. RPC 함수에도 동일한 제한 로직 적용 (비회원 참여 시)
  - 관련 파일: `app/events/actions.ts`, `components/events/rsvp-form.tsx`, `components/events/event-card.tsx`
  - 의존성: P3-03, P2-04

- [ ] **P6-08** 반응형 디자인 최적화 및 최종 마무리
  - 상세: (1) 모바일 우선 반응형 디자인 점검 및 최적화 (카카오톡 인앱 브라우저 포함). (2) 홈페이지(`/`) -> `/events` 리다이렉트 설정 (로그인된 사용자). (3) 전체 페이지 접근성 점검 (키보드 네비게이션, 스크린리더). (4) metadata 업데이트 (사이트 제목, 설명)
  - 관련 파일: `app/page.tsx`, `app/layout.tsx`, 전체 컴포넌트
  - 의존성: 모든 Phase 완료

### 완료 기준 (Definition of Done)

- [ ] 모든 사용자 액션에 Toast 피드백이 제공됨
- [ ] 로딩 중 스켈레톤 UI가 표시되고, 데이터 없을 때 빈 상태 UI가 표시됨
- [ ] 주최자가 이벤트를 삭제할 수 있고 확인 다이얼로그가 표시됨
- [ ] 주최자가 이벤트 상태를 active/cancelled/completed로 변경 가능
- [ ] 참여자가 메모를 작성하고 수정할 수 있음
- [ ] 주최자가 참여자를 제거할 수 있음
- [ ] 최대 인원 초과 시 참석 응답이 차단됨
- [ ] 모바일 환경(카카오톡 인앱 브라우저 포함)에서 모든 기능이 정상 동작함
- [ ] 로그인된 사용자가 홈페이지 접속 시 /events로 리다이렉트됨

---

## 기술 결정 사항

| 항목 | 결정 | 근거 |
|------|------|------|
| 데이터 페칭 방식 | Server Component + Supabase 서버 클라이언트 | 클라이언트 번들 최소화, PRD 9.1절 성능 요구사항 |
| 폼 처리 | Server Actions + Zod 유효성 검사 | Next.js App Router 표준 패턴, 프로그레시브 인핸스먼트 |
| 비회원 접근 | SECURITY DEFINER RPC 함수 | RLS 우회 없이 안전한 비인증 데이터 접근 |
| 초대 코드 | 8자리 hex (crypto.randomBytes) | 약 43억 조합으로 추측 불가, PRD 9.2절 보안 요구사항 |
| 상태 관리 | Server Component 재검증 (revalidatePath) | 별도 클라이언트 상태 라이브러리 불필요 |
| 스타일링 | TailwindCSS + shadcn/ui (new-york style) | 프로젝트 기존 설정 유지, 일관된 디자인 시스템 |
| 인증 미들웨어 | proxy.ts 기반 세션 관리 | Supabase SSR 공식 패턴 (미들웨어 파일 없이 proxy 사용) |

---

## 리스크 및 고려사항

| 리스크 | 영향도 | 대응 방안 |
|--------|--------|-----------|
| 비회원 참여 데이터의 무결성 | 중 | RPC 함수에서 입력 유효성 검사 + 중복 이름 허용하되 참여 ID로 구분 |
| 카카오톡 인앱 브라우저 호환성 | 상 | Phase 6에서 별도 테스트 + 필요시 UA 기반 대응 |
| 대규모 참여자 목록 성능 | 하 | MVP 범위에서는 페이지네이션 불필요, 향후 필요시 추가 |
| 초대 코드 충돌 | 극히 낮음 | DB UNIQUE 제약조건으로 방지 + 생성 실패 시 재시도 로직 |
| RLS 정책 복잡도 | 중 | Phase 1에서 철저히 테스트, Supabase 대시보드에서 정책별 검증 |
| 비회원 -> 회원 전환 시 데이터 연결 | 중 | MVP에서는 미지원. 비회원 참여와 회원 참여는 별도 레코드. 향후 계정 연결 기능으로 해결 |

---

## 모호한 요구사항 및 가정

| 항목 | PRD 원문 | 가정 |
|------|----------|------|
| 비회원 응답 변경 | PRD에 명시 없음 | 비회원은 응답 후 변경 불가 (세션/쿠키로 식별 불가). 재참여 시 새 레코드 생성됨 |
| 이벤트 상세 접근 권한 | "호스트이거나 참여자인 경우" SELECT 가능 | 초대 코드를 알고 있지만 아직 참여하지 않은 회원도 초대 랜딩 페이지에서 정보 확인 가능 (RPC 함수 사용) |
| 공지 작성 권한 | PRD 표에는 "주최자만"이나, RLS에서는 INSERT 시 "호스트만" | 공지 작성은 주최자만 가능하도록 구현 |
| updated_at 트리거 | PRD에 "트리거 자동 갱신" 언급 | events 테이블에 BEFORE UPDATE 트리거로 updated_at = now() 자동 설정 |
| 이벤트 목록 정렬 | PRD에 정렬 기준 미명시 | 이벤트 날짜(event_date) 기준 오름차순 (가장 가까운 이벤트 먼저) |

---

## Phase별 의존성 다이어그램

```
Phase 0 (완료)
    |
Phase 1 ─────────────────────────────────┐
    |                                     |
Phase 2                                   |
    |                                     |
    ├── Phase 3                           |
    |       |                             |
    |       └── Phase 4 ←────────────────┘
    |
    └── Phase 5
            |
            └─────────┐
                      |
                Phase 6 (Phase 3, 4, 5 모두 완료 후)
```

- Phase 2, 5는 Phase 1 완료 후 병렬 시작 가능
- Phase 3은 Phase 2에 의존
- Phase 4는 Phase 3, Phase 1에 의존
- Phase 6은 Phase 3, 4, 5 모두 완료 후 시작

---

## 향후 확장 (MVP 제외)

PRD 3.2절에 명시된 향후 기능들로, 현재 로드맵에서는 다루지 않습니다.

| 기능 | 예상 Phase | 비고 |
|------|------------|------|
| 정산 관리 (비용 등록, 1/N 정산) | Phase 7 | 별도 settlement 테이블 필요 |
| 정기 모임 (반복 이벤트) | Phase 7 | recurrence 패턴 설계 필요 |
| 알림 시스템 (이메일/푸시) | Phase 7 | Supabase Edge Functions 또는 외부 서비스 연동 |
| 카풀 매칭 | Phase 8 | 위치 기반 매칭 로직 필요 |
| 날짜/장소 투표 | Phase 8 | polls 테이블 + 투표 UI |
| 사진 공유 | Phase 9 | Supabase Storage 활용 |
