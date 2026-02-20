import { createClient } from "@/lib/supabase/server";
import { ParticipantItem } from "@/components/events/participant-item";
import type { RsvpStatus } from "@/lib/types/event";
import { Users } from "lucide-react";

type ParticipantListProps = {
  eventId: string;
  isHost?: boolean;
};

type ParticipantRow = {
  id: string;
  user_id: string | null;
  guest_name: string | null;
  rsvp_status: string;
  note: string | null;
  profiles: { uesr_name: string | null }[] | null;
};

const groupOrder: { status: RsvpStatus; label: string }[] = [
  { status: "attending", label: "참석" },
  { status: "pending", label: "미정" },
  { status: "declined", label: "불참" },
];

export async function ParticipantList({
  eventId,
  isHost = false,
}: ParticipantListProps) {
  const supabase = await createClient();

  const { data: participants } = await supabase
    .from("participants")
    .select("id, user_id, guest_name, rsvp_status, note, profiles(uesr_name)")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (!participants || participants.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <Users className="mx-auto size-8 text-muted-foreground/50" />
        <p className="mt-2 text-sm text-muted-foreground">
          아직 참여자가 없습니다
        </p>
      </div>
    );
  }

  // 상태별 그룹화
  const grouped = groupOrder.map(({ status, label }) => {
    const items = (participants as ParticipantRow[]).filter(
      (p) => p.rsvp_status === status,
    );
    return { status, label, items };
  });

  return (
    <div className="space-y-6">
      {grouped.map(
        ({ status, label, items }) =>
          items.length > 0 && (
            <div key={status}>
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                {label} ({items.length}명)
              </h3>
              <div className="divide-y rounded-lg border">
                {items.map((p) => {
                  const name =
                    p.guest_name ??
                    p.profiles?.[0]?.uesr_name ??
                    "알 수 없음";
                  return (
                    <div key={p.id} className="px-3">
                      <ParticipantItem
                        id={p.id}
                        name={name}
                        rsvpStatus={p.rsvp_status as RsvpStatus}
                        note={p.note}
                        isGuest={p.user_id === null}
                        canRemove={isHost}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ),
      )}
    </div>
  );
}
