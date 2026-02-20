import { createClient } from "@/lib/supabase/server";
import { EventDetailHeader } from "@/components/events/event-detail-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ParticipantList } from "@/components/events/participant-list";
import { RsvpForm } from "@/components/events/rsvp-form";
import { InviteShare } from "@/components/events/invite-share";
import { AnnouncementList } from "@/components/events/announcement-list";
import { AnnouncementForm } from "@/components/events/announcement-form";
import { EventActions } from "@/components/events/event-actions";
import type { RsvpStatus, EventStatus } from "@/lib/types/event";

async function EventDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (!event) {
    notFound();
  }

  // 참여자 수 조회
  const { count: participantCount } = await supabase
    .from("participants")
    .select("*", { count: "exact", head: true })
    .eq("event_id", id)
    .eq("rsvp_status", "attending");

  const isHost = user?.id === event.host_id;

  // 현재 사용자의 참석 상태 조회
  let currentRsvpStatus: RsvpStatus | null = null;
  let currentNote: string | null = null;
  if (user) {
    const { data: myParticipation } = await supabase
      .from("participants")
      .select("rsvp_status, note")
      .eq("event_id", id)
      .eq("user_id", user.id)
      .single();
    currentRsvpStatus =
      (myParticipation?.rsvp_status as RsvpStatus) ?? null;
    currentNote = myParticipation?.note ?? null;
  }

  // 최대 인원 마감 여부
  const isFull =
    event.max_participants !== null &&
    (participantCount ?? 0) >= event.max_participants;

  return (
    <div className="space-y-6">
      <EventDetailHeader
        event={event}
        participantCount={participantCount ?? 0}
      />

      <Separator />
      <div className="flex flex-wrap gap-2">
        <InviteShare inviteCode={event.invite_code} />
        {isHost && (
          <>
            <Button asChild variant="outline" size="sm">
              <Link href={`/events/${id}/edit`}>
                <Pencil className="mr-1.5 size-3.5" />
                수정
              </Link>
            </Button>
            <EventActions
              eventId={id}
              currentStatus={event.status as EventStatus}
            />
          </>
        )}
      </div>

      <Separator />

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">정보</TabsTrigger>
          <TabsTrigger value="participants">참여자</TabsTrigger>
          <TabsTrigger value="announcements">공지</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4 space-y-4">
          <div className="rounded-lg border p-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                초대 코드
              </p>
              <p className="font-mono text-lg">{event.invite_code}</p>
            </div>
            {event.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  상세 설명
                </p>
                <p className="whitespace-pre-wrap text-sm">
                  {event.description}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                최대 인원
              </p>
              <p className="text-sm">
                {event.max_participants
                  ? `${event.max_participants}명`
                  : "제한 없음"}
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="participants" className="mt-4 space-y-6">
          {user && (
            <div className="rounded-lg border p-4">
              <RsvpForm
                eventId={id}
                currentStatus={currentRsvpStatus}
                currentNote={currentNote}
                isFull={isFull}
                eventStatus={event.status}
              />
            </div>
          )}
          <ParticipantList eventId={id} isHost={isHost} />
        </TabsContent>

        <TabsContent value="announcements" className="mt-4 space-y-4">
          {isHost && (
            <div className="rounded-lg border p-4">
              <AnnouncementForm eventId={id} />
            </div>
          )}
          {user && (
            <AnnouncementList
              eventId={id}
              currentUserId={user.id}
              hostId={event.host_id}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="h-10 w-2/3 animate-pulse rounded-lg bg-muted" />
          <div className="h-6 w-1/3 animate-pulse rounded-lg bg-muted" />
          <div className="h-48 animate-pulse rounded-xl bg-muted" />
        </div>
      }
    >
      <EventDetail params={params} />
    </Suspense>
  );
}
