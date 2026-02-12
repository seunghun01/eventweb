# PRD: 모임 이벤트 관리 웹 MVP

## 1. 개요

### 1.1 프로젝트 배경

수영, 헬스, 친구 모임 등 소규모 이벤트를 진행할 때 주최자는 공지, 참여자 관리, 카풀, 정산 등 다양한 관리 업무를 담당합니다. 카카오톡 단체 채팅방으로 이를 관리하면 정보가 흩어지고, 참석 여부 파악이 어려우며, 공지가 묻히는 문제가 발생합니다.

이 프로젝트는 모임 주최자가 이벤트를 체계적으로 관리할 수 있는 웹 기반 MVP를 구축하는 것을 목표로 합니다.

### 1.2 목표

- 모임 주최자가 이벤트를 쉽게 생성하고 참여자를 관리할 수 있는 웹 서비스
- 초대 링크를 통해 회원가입 없이도 간편하게 참여할 수 있는 접근성
- 모바일 환경에서도 원활하게 사용할 수 있는 반응형 UI

### 1.3 대상 사용자

| 사용자 | 설명 |
|--------|------|
| **주최자** | 모임을 만들고 관리하는 사람. 회원가입 필수 |
| **참여자 (회원)** | 로그인하여 이벤트에 참여하는 사람 |
| **참여자 (비회원)** | 초대 링크로 접속하여 이름만 입력하고 참여하는 사람 |

### 1.4 핵심 가치

- **간편함**: 링크 하나로 참여 가능, 복잡한 가입 절차 불필요
- **명확함**: 참석/불참 한눈에 파악, 공지사항 놓치지 않음
- **효율성**: 주최자의 반복 관리 업무 최소화

---

## 2. 기술 스택

| 항목 | 기술 |
|------|------|
| **프레임워크** | Next.js (App Router) |
| **런타임** | React 19 + TypeScript 5 |
| **백엔드/DB** | Supabase (PostgreSQL + Auth + RLS) |
| **스타일링** | TailwindCSS v3 + shadcn/ui (new-york style) |
| **아이콘** | Lucide Icons |
| **인증** | Supabase Auth (이메일/비밀번호 + Google OAuth) |

---

## 3. 기능 요구사항

### 3.1 MVP 범위 (Phase 1~2)

#### FR-01: 사용자 인증 (구현 완료)

- [x] 이메일/비밀번호 회원가입 및 로그인
- [x] Google OAuth 로그인
- [x] 비밀번호 재설정
- [x] 세션 관리 (쿠키 기반)
- [ ] 로그인 시 `redirect_to` 파라미터 지원 (초대 링크 → 로그인 → 원래 페이지)

#### FR-02: 이벤트 관리 (CRUD)

| ID | 기능 | 설명 | 우선순위 |
|----|------|------|----------|
| FR-02-01 | 이벤트 생성 | 제목, 설명, 날짜/시간, 장소, 최대 인원 입력 | P0 |
| FR-02-02 | 이벤트 목록 | "내가 만든" + "참여 중인" 이벤트를 분리하여 표시 | P0 |
| FR-02-03 | 이벤트 상세 | 이벤트 정보, 참여자 목록, 공지사항을 탭으로 구성 | P0 |
| FR-02-04 | 이벤트 수정 | 주최자만 이벤트 정보 수정 가능 | P0 |
| FR-02-05 | 이벤트 삭제 | 주최자만 이벤트 삭제 가능 (참여자 데이터도 함께 삭제) | P1 |
| FR-02-06 | 이벤트 상태 변경 | 활성(active) / 취소(cancelled) / 완료(completed) 전환 | P1 |

#### FR-03: 참여자 관리

| ID | 기능 | 설명 | 우선순위 |
|----|------|------|----------|
| FR-03-01 | 참석 응답 | 참석(attending) / 불참(declined) / 미정(pending) 선택 | P0 |
| FR-03-02 | 응답 변경 | 참여자가 자신의 응답을 변경 가능 | P0 |
| FR-03-03 | 참여자 목록 조회 | 상태별로 그룹화된 참여자 목록 표시 | P0 |
| FR-03-04 | 참여자 메모 | 참여자가 짧은 메모 작성 가능 (예: "30분 늦습니다") | P1 |
| FR-03-05 | 참여자 제거 | 주최자가 참여자를 제거 가능 | P1 |
| FR-03-06 | 최대 인원 제한 | 설정된 최대 인원 초과 시 참석 불가 | P1 |

#### FR-04: 초대 시스템

| ID | 기능 | 설명 | 우선순위 |
|----|------|------|----------|
| FR-04-01 | 초대 코드 생성 | 이벤트 생성 시 8자리 고유 초대 코드 자동 생성 | P0 |
| FR-04-02 | 초대 링크 공유 | 초대 URL 복사 버튼 제공 (`/invite/[code]`) | P0 |
| FR-04-03 | 비회원 간편 참여 | 이름만 입력하여 참석/불참 응답 가능 | P0 |
| FR-04-04 | 회원 초대 참여 | 로그인 상태에서 초대 링크 접속 시 바로 참여 | P0 |
| FR-04-05 | 초대 랜딩 페이지 | 이벤트 정보 + 참여 폼 + 로그인 유도 CTA | P0 |

#### FR-05: 공지사항

| ID | 기능 | 설명 | 우선순위 |
|----|------|------|----------|
| FR-05-01 | 공지 작성 | 주최자가 이벤트 공지사항 작성 | P1 |
| FR-05-02 | 공지 목록 | 최신순 정렬, 고정된 공지 상단 표시 | P1 |
| FR-05-03 | 공지 고정/해제 | 주최자가 중요 공지를 상단에 고정 | P2 |
| FR-05-04 | 공지 삭제 | 작성자 또는 주최자가 공지 삭제 | P1 |

### 3.2 MVP 제외 (향후 확장)

| 기능 | 설명 | 향후 Phase |
|------|------|------------|
| 정산 관리 | 비용 등록, 1/N 정산, 정산 요약 | Phase 4 |
| 카풀 매칭 | 운전자/탑승자 매칭, 경로 공유 | Phase 5 |
| 정기 모임 | 반복 이벤트 생성 (매주/매월) | Phase 4 |
| 알림 | 이메일/푸시 알림 | Phase 4 |
| 투표 | 날짜/장소 투표 | Phase 5 |
| 사진 공유 | 이벤트 사진 앨범 | Phase 6 |

---

## 4. 사용자 플로우

### 4.1 주최자 플로우

```
회원가입/로그인
    ↓
이벤트 생성 (제목, 설명, 날짜, 장소, 최대 인원)
    ↓
초대 코드 자동 생성
    ↓
초대 링크 복사 → 카카오톡 등으로 공유
    ↓
참여자 응답 확인 (이벤트 상세 → 참여자 탭)
    ↓
공지사항 작성 (필요 시)
    ↓
이벤트 완료/취소 처리
```

### 4.2 참여자 (회원) 플로우

```
초대 링크 클릭 (/invite/abc12345)
    ↓
[로그인 상태] → 이벤트 정보 확인 → 참석/불참 응답
    ↓
이벤트 상세 페이지로 이동 (/events/[id])
    ↓
공지사항 확인, 응답 변경 가능
```

### 4.3 참여자 (비회원) 플로우

```
초대 링크 클릭 (/invite/abc12345)
    ↓
이벤트 정보 확인 (제목, 날짜, 장소, 현재 참여자 수)
    ↓
이름 입력 + 참석/불참 선택 + 메모 (선택)
    ↓
"참여가 완료되었습니다!" 확인 화면
    ↓
(선택) 회원가입하면 더 많은 기능 이용 가능 안내
```

---

## 5. 데이터 모델

### 5.1 ERD 요약

```
auth.users (Supabase 기본)
    ├── 1:N → events (host_id)
    ├── 1:N → participants (user_id, nullable)
    └── 1:N → announcements (author_id)

events
    ├── 1:N → participants (event_id)
    └── 1:N → announcements (event_id)
```

### 5.2 테이블 상세

#### events

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() | 이벤트 ID |
| created_at | timestamptz | NOT NULL, DEFAULT now() | 생성일시 |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | 수정일시 (트리거 자동 갱신) |
| title | text | NOT NULL | 이벤트 제목 |
| description | text | nullable | 이벤트 설명 |
| host_id | uuid | NOT NULL, FK → auth.users | 주최자 ID |
| event_date | timestamptz | NOT NULL | 이벤트 날짜/시간 |
| location | text | nullable | 장소 |
| max_participants | integer | nullable | 최대 참여자 수 (null = 제한 없음) |
| invite_code | text | UNIQUE, NOT NULL | 초대 코드 (8자리) |
| status | text | NOT NULL, DEFAULT 'active' | 상태 (active / cancelled / completed) |

#### participants

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() | 참여자 ID |
| created_at | timestamptz | NOT NULL, DEFAULT now() | 생성일시 |
| event_id | uuid | NOT NULL, FK → events | 이벤트 ID |
| user_id | uuid | nullable, FK → auth.users | 회원 ID (비회원은 null) |
| guest_name | text | nullable | 비회원 이름 (user_id가 null일 때 필수) |
| rsvp_status | text | NOT NULL, DEFAULT 'pending' | 참석 상태 (attending / declined / pending) |
| note | text | nullable | 참여자 메모 |

- UNIQUE (event_id, user_id): 회원은 이벤트당 1회만 참여
- CHECK (user_id IS NOT NULL OR guest_name IS NOT NULL): 둘 중 하나 필수

#### announcements

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() | 공지 ID |
| created_at | timestamptz | NOT NULL, DEFAULT now() | 생성일시 |
| event_id | uuid | NOT NULL, FK → events | 이벤트 ID |
| author_id | uuid | NOT NULL, FK → auth.users | 작성자 ID |
| content | text | NOT NULL | 공지 내용 |
| is_pinned | boolean | NOT NULL, DEFAULT false | 상단 고정 여부 |

### 5.3 보안 (RLS 정책)

| 테이블 | 작업 | 정책 |
|--------|------|------|
| events | SELECT | 호스트이거나 참여자인 경우 |
| events | INSERT | 인증된 사용자 (host_id = 본인) |
| events | UPDATE/DELETE | 호스트만 |
| participants | SELECT | 호스트이거나 본인 |
| participants | INSERT | 인증된 사용자 (user_id = 본인) |
| participants | UPDATE | 본인만 |
| participants | DELETE | 본인 또는 호스트 |
| announcements | SELECT | 호스트이거나 참여자 |
| announcements | INSERT | 호스트만 |
| announcements | UPDATE | 작성자만 |
| announcements | DELETE | 작성자 또는 호스트 |

### 5.4 비회원 접근 (RPC 함수)

비회원은 Supabase 인증 토큰이 없으므로 RLS를 통과할 수 없습니다. `SECURITY DEFINER` RPC 함수를 통해 안전하게 접근합니다.

| 함수 | 설명 | 접근 권한 |
|------|------|-----------|
| `get_event_by_invite_code(code)` | 초대 코드로 이벤트 공개 정보 조회 | anon |
| `join_event_as_guest(invite_code, guest_name, rsvp_status, note)` | 비회원 이벤트 참여 등록 | anon |

---

## 6. 페이지 구조

### 6.1 라우트 맵

| 경로 | 페이지 | 인증 필요 | 설명 |
|------|--------|-----------|------|
| `/` | 홈 | X | 서비스 소개 (→ Phase 3에서 `/events` 리다이렉트) |
| `/auth/login` | 로그인 | X | 이메일/Google 로그인 |
| `/auth/sign-up` | 회원가입 | X | 이메일/Google 회원가입 |
| `/events` | 이벤트 목록 | O | 내가 만든 + 참여 중인 이벤트 |
| `/events/new` | 이벤트 생성 | O | 이벤트 생성 폼 |
| `/events/[id]` | 이벤트 상세 | O | 정보/참여자/공지 탭 |
| `/events/[id]/edit` | 이벤트 수정 | O (주최자만) | 이벤트 수정 폼 |
| `/invite/[code]` | 초대 랜딩 | X | 이벤트 정보 + 참여 폼 |

### 6.2 이벤트 상세 페이지 탭 구성

```
┌─────────────────────────────────────────┐
│  [이벤트 제목]            [수정] [삭제]  │
│  2026년 2월 20일 (금) 19:00             │
│  서울 강남구 OO수영장                    │
│  참여: 5/10명                           │
│                                         │
│  [초대 링크 복사]                        │
├─────────┬──────────┬────────────────────┤
│ 정보    │ 참여자   │ 공지               │
├─────────┴──────────┴────────────────────┤
│                                         │
│  (선택된 탭의 콘텐츠)                    │
│                                         │
└─────────────────────────────────────────┘
```

---

## 7. 컴포넌트 구조

### 7.1 신규 컴포넌트

| 컴포넌트 | 파일 경로 | 렌더링 | 설명 |
|----------|-----------|--------|------|
| EventCard | `components/events/event-card.tsx` | Server | 이벤트 카드 (목록에서 사용) |
| EventForm | `components/events/event-form.tsx` | Client | 이벤트 생성/수정 공용 폼 |
| EventDetailHeader | `components/events/event-detail-header.tsx` | Server | 이벤트 상세 상단 정보 |
| EventActions | `components/events/event-actions.tsx` | Client | 수정/삭제/상태변경 버튼 |
| ParticipantList | `components/events/participant-list.tsx` | Server | 참여자 목록 컨테이너 |
| ParticipantItem | `components/events/participant-item.tsx` | Client | 개별 참여자 행 |
| RsvpForm | `components/events/rsvp-form.tsx` | Client | 참석/불참 응답 폼 |
| RsvpBadge | `components/events/rsvp-badge.tsx` | Server | 참석 상태 뱃지 |
| AnnouncementList | `components/events/announcement-list.tsx` | Server | 공지사항 목록 |
| AnnouncementCard | `components/events/announcement-card.tsx` | Server | 개별 공지사항 카드 |
| AnnouncementForm | `components/events/announcement-form.tsx` | Client | 공지사항 작성 폼 |
| InviteShare | `components/events/invite-share.tsx` | Client | 초대 링크 복사 UI |
| GuestJoinForm | `components/events/guest-join-form.tsx` | Client | 비회원 간편 참여 폼 |
| EventEmptyState | `components/events/event-empty-state.tsx` | Server | 빈 상태 안내 UI |

### 7.2 추가 필요 shadcn/ui 컴포넌트

```bash
npx shadcn@latest add textarea dialog separator avatar tabs select toast
```

---

## 8. API 설계

### 8.1 Server Actions

| Action | 파일 | 설명 | 인증 |
|--------|------|------|------|
| `createEvent` | `app/events/actions.ts` | 이벤트 생성 | 필수 |
| `updateEvent` | `app/events/actions.ts` | 이벤트 수정 | 필수 (주최자) |
| `deleteEvent` | `app/events/actions.ts` | 이벤트 삭제 | 필수 (주최자) |
| `updateEventStatus` | `app/events/actions.ts` | 이벤트 상태 변경 | 필수 (주최자) |
| `respondToEvent` | `app/events/actions.ts` | 참석/불참 응답 (upsert) | 필수 |
| `removeParticipant` | `app/events/actions.ts` | 참여자 제거 | 필수 (주최자) |
| `createAnnouncement` | `app/events/actions.ts` | 공지 작성 | 필수 (주최자) |
| `deleteAnnouncement` | `app/events/actions.ts` | 공지 삭제 | 필수 |
| `toggleAnnouncementPin` | `app/events/actions.ts` | 공지 고정/해제 | 필수 (주최자) |
| `joinAsGuest` | `app/invite/[code]/actions.ts` | 비회원 참여 (RPC) | 불필요 |
| `joinAsUser` | `app/invite/[code]/actions.ts` | 회원 초대 참여 | 필수 |

---

## 9. 비기능 요구사항

### 9.1 성능

- 이벤트 목록 페이지 로딩: 2초 이내
- Server Component 기반 데이터 페칭으로 클라이언트 번들 최소화

### 9.2 보안

- Supabase RLS를 통한 데이터 접근 제어
- 비회원 접근은 SECURITY DEFINER RPC 함수로 제한적 허용
- 초대 코드는 8자리 hex (약 43억 조합)로 추측 불가

### 9.3 접근성

- Radix UI 기반 shadcn/ui 컴포넌트 사용으로 기본 접근성 보장
- 모바일 우선 반응형 디자인

### 9.4 브라우저 지원

- Chrome, Safari, Firefox, Edge 최신 버전
- 모바일 브라우저 (카카오톡 인앱 브라우저 포함)

---

## 10. 구현 로드맵

### Phase 1: 핵심 기능 (이벤트 CRUD + 참여자 관리)

- [ ] DB 마이그레이션 (events, participants, announcements 테이블)
- [ ] RLS 정책 적용
- [ ] 비회원 참여 RPC 함수 생성
- [ ] TypeScript 타입 정의
- [ ] 유틸리티 함수 (generateInviteCode)
- [ ] shadcn/ui 추가 컴포넌트 설치
- [ ] 미들웨어 수정 (/invite 비인증 허용)
- [ ] 이벤트 Server Actions
- [ ] 이벤트 레이아웃
- [ ] 이벤트 목록 페이지
- [ ] 이벤트 생성 페이지 + EventForm
- [ ] 이벤트 상세 페이지 (정보 + 참여자 탭)
- [ ] 이벤트 수정 페이지
- [ ] 참여자 관리 컴포넌트 (목록, 응답, 뱃지)

### Phase 2: 초대 시스템 + 공지

- [ ] 초대 링크 공유 UI (InviteShare)
- [ ] 초대 랜딩 페이지 (/invite/[code])
- [ ] 비회원 간편 참여 폼 (GuestJoinForm)
- [ ] 회원 초대 참여 기능
- [ ] 로그인 폼 redirect_to 지원
- [ ] 공지사항 CRUD 컴포넌트
- [ ] 이벤트 상세 공지 탭

### Phase 3: UX 개선

- [ ] Toast 알림 통합
- [ ] 로딩 상태 및 빈 상태 UI
- [ ] 반응형 디자인 최적화 (모바일 우선)
- [ ] 이벤트 상태 관리 UI
- [ ] 홈페이지 → /events 리다이렉트

### Phase 4+ (향후)

- [ ] 정산 관리
- [ ] 정기 모임 (반복 이벤트)
- [ ] 알림 시스템
- [ ] 카풀 매칭
- [ ] 날짜/장소 투표
- [ ] 사진 공유

---

## 11. 성공 지표

| 지표 | 목표 |
|------|------|
| 이벤트 생성 → 초대 링크 공유까지 소요 시간 | 1분 이내 |
| 비회원 초대 링크 → 참여 완료까지 소요 시간 | 30초 이내 |
| 참여자 참석 현황 파악 시간 | 즉시 (이벤트 상세 페이지) |
| 모바일 사용성 | 모든 주요 기능 모바일에서 동작 |
