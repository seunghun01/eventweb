import type { Tables, TablesInsert, TablesUpdate } from "./database";

// --- 테이블 Row 타입 ---
export type Event = Tables<"events">;
export type Participant = Tables<"participants">;
export type Announcement = Tables<"announcements">;

// --- 상태 유니온 타입 ---
export type EventStatus = "active" | "cancelled" | "completed";
export type RsvpStatus = "attending" | "declined" | "pending";

// --- Insert/Update 타입 ---
export type EventInsert = TablesInsert<"events">;
export type EventUpdate = TablesUpdate<"events">;
export type ParticipantInsert = TablesInsert<"participants">;
export type ParticipantUpdate = TablesUpdate<"participants">;
export type AnnouncementInsert = TablesInsert<"announcements">;

// --- 폼 입력용 타입 ---
export type CreateEventInput = {
  title: string;
  description?: string | null;
  event_date: string;
  location?: string | null;
  max_participants?: number | null;
};

export type UpdateEventInput = Partial<CreateEventInput>;

export type CreateAnnouncementInput = {
  content: string;
  event_id: string;
};

export type GuestJoinInput = {
  guest_name: string;
  rsvp_status: RsvpStatus;
  note?: string | null;
};

// --- RPC 함수 응답 타입 ---
export type EventByInviteCode = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  max_participants: number | null;
  status: EventStatus;
  host_id: string;
  current_participants: number;
};

export type GuestJoinResult = {
  participant_id: string;
  event_id: string;
  guest_name: string;
  rsvp_status: RsvpStatus;
};
