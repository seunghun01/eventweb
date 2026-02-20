"use server";

import { createClient } from "@/lib/supabase/server";
import { generateInviteCode } from "@/lib/utils/invite-code";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// --- Zod 스키마 ---

const rsvpSchema = z.object({
  event_id: z.string().uuid("유효하지 않은 이벤트입니다"),
  rsvp_status: z.enum(["attending", "declined", "pending"], {
    error: "유효하지 않은 응답 상태입니다",
  }),
  note: z
    .string()
    .max(200, "메모는 200자 이내로 입력해주세요")
    .nullable()
    .optional(),
});

const createEventSchema = z.object({
  title: z
    .string()
    .min(1, "제목을 입력해주세요")
    .max(100, "제목은 100자 이내로 입력해주세요"),
  description: z
    .string()
    .max(2000, "설명은 2000자 이내로 입력해주세요")
    .nullable()
    .optional(),
  event_date: z.string().min(1, "날짜를 선택해주세요"),
  location: z
    .string()
    .max(200, "장소는 200자 이내로 입력해주세요")
    .nullable()
    .optional(),
  max_participants: z.coerce
    .number()
    .int("정수를 입력해주세요")
    .min(2, "최소 2명 이상이어야 합니다")
    .nullable()
    .optional(),
});

const updateEventSchema = createEventSchema.partial();

const announcementSchema = z.object({
  event_id: z.string().uuid("유효하지 않은 이벤트입니다"),
  content: z
    .string()
    .min(1, "내용을 입력해주세요")
    .max(5000, "공지 내용은 5000자 이내로 입력해주세요"),
});

// --- 액션 응답 타입 ---

export type ActionResult = {
  error?: string;
  success?: string;
};

const eventStatusSchema = z.object({
  event_id: z.string().uuid("유효하지 않은 이벤트입니다"),
  status: z.enum(["active", "cancelled", "completed"], {
    error: "유효하지 않은 상태입니다",
  }),
});

// --- Server Actions ---

export async function createEvent(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요합니다" };
  }

  const raw = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    event_date: formData.get("event_date") as string,
    location: (formData.get("location") as string) || null,
    max_participants: formData.get("max_participants")
      ? Number(formData.get("max_participants"))
      : null,
  };

  const parsed = createEventSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return { error: firstError.message };
  }

  const inviteCode = generateInviteCode();

  const { data, error } = await supabase
    .from("events")
    .insert({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      event_date: parsed.data.event_date,
      location: parsed.data.location ?? null,
      max_participants: parsed.data.max_participants ?? null,
      invite_code: inviteCode,
      host_id: user.id,
    })
    .select("id")
    .single();

  if (error) {
    // 초대 코드 중복 시 재시도
    if (error.code === "23505" && error.message.includes("invite_code")) {
      return createEvent(_prevState, formData);
    }
    return { error: "이벤트 생성에 실패했습니다" };
  }

  revalidatePath("/events");
  redirect(`/events/${data.id}`);
}

export async function updateEvent(
  eventId: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요합니다" };
  }

  // 주최자 권한 확인
  const { data: event } = await supabase
    .from("events")
    .select("host_id")
    .eq("id", eventId)
    .single();

  if (!event || event.host_id !== user.id) {
    return { error: "이벤트를 수정할 권한이 없습니다" };
  }

  const raw = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    event_date: formData.get("event_date") as string,
    location: (formData.get("location") as string) || null,
    max_participants: formData.get("max_participants")
      ? Number(formData.get("max_participants"))
      : null,
  };

  const parsed = updateEventSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return { error: firstError.message };
  }

  const { error } = await supabase
    .from("events")
    .update({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      event_date: parsed.data.event_date,
      location: parsed.data.location ?? null,
      max_participants: parsed.data.max_participants ?? null,
    })
    .eq("id", eventId);

  if (error) {
    return { error: "이벤트 수정에 실패했습니다" };
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/events");
  redirect(`/events/${eventId}`);
}

export async function deleteEvent(
  eventId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prevState: ActionResult,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요합니다" };
  }

  const { data: event } = await supabase
    .from("events")
    .select("host_id")
    .eq("id", eventId)
    .single();

  if (!event || event.host_id !== user.id) {
    return { error: "이벤트를 삭제할 권한이 없습니다" };
  }

  // 참여자, 공지 삭제 (CASCADE가 없는 경우 수동 삭제)
  await supabase.from("announcements").delete().eq("event_id", eventId);
  await supabase.from("participants").delete().eq("event_id", eventId);

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId);

  if (error) {
    return { error: "이벤트 삭제에 실패했습니다" };
  }

  revalidatePath("/events");
  redirect("/events");
}

export async function updateEventStatus(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요합니다" };
  }

  const parsed = eventStatusSchema.safeParse({
    event_id: formData.get("event_id"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { event_id, status } = parsed.data;

  const { data: event } = await supabase
    .from("events")
    .select("host_id")
    .eq("id", event_id)
    .single();

  if (!event || event.host_id !== user.id) {
    return { error: "이벤트 상태를 변경할 권한이 없습니다" };
  }

  const { error } = await supabase
    .from("events")
    .update({ status })
    .eq("id", event_id);

  if (error) {
    return { error: "상태 변경에 실패했습니다" };
  }

  const statusLabel =
    status === "active"
      ? "진행중"
      : status === "cancelled"
        ? "취소됨"
        : "완료";

  revalidatePath(`/events/${event_id}`);
  revalidatePath("/events");
  return { success: `이벤트 상태가 '${statusLabel}'으로 변경되었습니다` };
}

export async function respondToEvent(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요합니다" };
  }

  const parsed = rsvpSchema.safeParse({
    event_id: formData.get("event_id"),
    rsvp_status: formData.get("rsvp_status"),
    note: (formData.get("note") as string) || null,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { event_id, rsvp_status, note } = parsed.data;

  // 최대 인원 제한 확인 (참석 응답 시)
  if (rsvp_status === "attending") {
    const { data: event } = await supabase
      .from("events")
      .select("max_participants, status")
      .eq("id", event_id)
      .single();

    if (event?.status !== "active") {
      return { error: "진행 중이 아닌 이벤트에는 응답할 수 없습니다" };
    }

    if (event?.max_participants) {
      // 이미 참석 중인 본인은 제외하고 카운트
      const { count } = await supabase
        .from("participants")
        .select("*", { count: "exact", head: true })
        .eq("event_id", event_id)
        .eq("rsvp_status", "attending")
        .neq("user_id", user.id);

      if ((count ?? 0) >= event.max_participants) {
        return { error: "최대 참석 인원에 도달하여 참석할 수 없습니다" };
      }
    }
  }

  // 기존 응답 확인
  const { data: existing } = await supabase
    .from("participants")
    .select("id")
    .eq("event_id", event_id)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    // 기존 응답 업데이트
    const { error } = await supabase
      .from("participants")
      .update({ rsvp_status, note: note ?? null })
      .eq("id", existing.id);

    if (error) {
      return { error: "응답 변경에 실패했습니다" };
    }
  } else {
    // 새 응답 생성
    const { error } = await supabase.from("participants").insert({
      event_id,
      user_id: user.id,
      rsvp_status,
      note: note ?? null,
    });

    if (error) {
      return { error: "참여 등록에 실패했습니다" };
    }
  }

  revalidatePath(`/events/${event_id}`);
  const statusLabel =
    rsvp_status === "attending"
      ? "참석"
      : rsvp_status === "declined"
        ? "불참"
        : "미정";
  return { success: `${statusLabel}으로 응답했습니다` };
}

export async function removeParticipant(
  participantId: string,
  _prevState: ActionResult,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요합니다" };
  }

  // 참여자 + 이벤트 주최자 확인
  const { data: participant } = await supabase
    .from("participants")
    .select("id, event_id, events(host_id)")
    .eq("id", participantId)
    .single();

  if (!participant) {
    return { error: "참여자를 찾을 수 없습니다" };
  }

  const hostId = (participant.events as unknown as { host_id: string })
    ?.host_id;
  if (hostId !== user.id) {
    return { error: "참여자를 제거할 권한이 없습니다" };
  }

  const { error } = await supabase
    .from("participants")
    .delete()
    .eq("id", participantId);

  if (error) {
    return { error: "참여자 제거에 실패했습니다" };
  }

  revalidatePath(`/events/${participant.event_id}`);
  return { success: "참여자가 제거되었습니다" };
}

// --- 공지사항 Server Actions ---

export async function createAnnouncement(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요합니다" };
  }

  const parsed = announcementSchema.safeParse({
    event_id: formData.get("event_id"),
    content: formData.get("content"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { event_id, content } = parsed.data;

  // 주최자 권한 확인
  const { data: event } = await supabase
    .from("events")
    .select("host_id")
    .eq("id", event_id)
    .single();

  if (!event || event.host_id !== user.id) {
    return { error: "공지사항 작성 권한이 없습니다" };
  }

  const { error } = await supabase.from("announcements").insert({
    event_id,
    author_id: user.id,
    content,
  });

  if (error) {
    return { error: "공지사항 작성에 실패했습니다" };
  }

  revalidatePath(`/events/${event_id}`);
  return { success: "공지사항이 작성되었습니다" };
}

export async function deleteAnnouncement(
  announcementId: string,
  _prevState: ActionResult,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요합니다" };
  }

  // 공지 조회 + 이벤트 주최자 확인
  const { data: announcement } = await supabase
    .from("announcements")
    .select("id, event_id, author_id, events(host_id)")
    .eq("id", announcementId)
    .single();

  if (!announcement) {
    return { error: "공지사항을 찾을 수 없습니다" };
  }

  const hostId = (announcement.events as unknown as { host_id: string })
    ?.host_id;
  const isAuthor = announcement.author_id === user.id;
  const isHost = hostId === user.id;

  if (!isAuthor && !isHost) {
    return { error: "삭제 권한이 없습니다" };
  }

  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", announcementId);

  if (error) {
    return { error: "공지사항 삭제에 실패했습니다" };
  }

  revalidatePath(`/events/${announcement.event_id}`);
  return { success: "공지사항이 삭제되었습니다" };
}

export async function toggleAnnouncementPin(
  announcementId: string,
  _prevState: ActionResult,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요합니다" };
  }

  // 공지 조회 + 이벤트 주최자 확인
  const { data: announcement } = await supabase
    .from("announcements")
    .select("id, event_id, is_pinned, events(host_id)")
    .eq("id", announcementId)
    .single();

  if (!announcement) {
    return { error: "공지사항을 찾을 수 없습니다" };
  }

  const hostId = (announcement.events as unknown as { host_id: string })
    ?.host_id;
  if (hostId !== user.id) {
    return { error: "고정/해제 권한이 없습니다" };
  }

  const { error } = await supabase
    .from("announcements")
    .update({ is_pinned: !announcement.is_pinned })
    .eq("id", announcementId);

  if (error) {
    return { error: "공지사항 고정 상태 변경에 실패했습니다" };
  }

  revalidatePath(`/events/${announcement.event_id}`);
  return {
    success: announcement.is_pinned
      ? "공지 고정이 해제되었습니다"
      : "공지가 고정되었습니다",
  };
}
