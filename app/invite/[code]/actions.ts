"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// --- Zod 스키마 ---

const guestJoinSchema = z.object({
  invite_code: z.string().min(1, "초대 코드가 필요합니다"),
  guest_name: z
    .string()
    .min(1, "이름을 입력해주세요")
    .max(50, "이름은 50자 이내로 입력해주세요"),
  rsvp_status: z.enum(["attending", "declined"], {
    error: "참석 여부를 선택해주세요",
  }),
  note: z
    .string()
    .max(200, "메모는 200자 이내로 입력해주세요")
    .nullable()
    .optional(),
});

// --- 응답 타입 ---

export type InviteActionResult = {
  error?: string;
  success?: boolean;
};

// --- Server Actions ---

export async function joinAsGuest(
  _prevState: InviteActionResult,
  formData: FormData,
): Promise<InviteActionResult> {
  const supabase = await createClient();

  const parsed = guestJoinSchema.safeParse({
    invite_code: formData.get("invite_code"),
    guest_name: formData.get("guest_name"),
    rsvp_status: formData.get("rsvp_status"),
    note: (formData.get("note") as string) || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { invite_code, guest_name, rsvp_status, note } = parsed.data;

  const { error } = await supabase.rpc("join_event_as_guest", {
    p_invite_code: invite_code,
    p_guest_name: guest_name,
    p_rsvp_status: rsvp_status,
    p_note: note ?? undefined,
  });

  if (error) {
    if (error.message.includes("max")) {
      return { error: "최대 인원에 도달하여 참여할 수 없습니다" };
    }
    if (error.message.includes("not found")) {
      return { error: "유효하지 않은 초대 코드입니다" };
    }
    return { error: "참여 등록에 실패했습니다" };
  }

  revalidatePath(`/invite/${invite_code}`);
  return { success: true };
}

export async function joinAsUser(
  inviteCode: string,
  eventId: string,
): Promise<InviteActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요합니다" };
  }

  // 중복 참여 확인
  const { data: existing } = await supabase
    .from("participants")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    return { error: "이미 참여 중인 이벤트입니다" };
  }

  const { error } = await supabase.from("participants").insert({
    event_id: eventId,
    user_id: user.id,
    rsvp_status: "attending",
  });

  if (error) {
    return { error: "참여 등록에 실패했습니다" };
  }

  revalidatePath(`/invite/${inviteCode}`);
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/events");
  return { success: true };
}
