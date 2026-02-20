import { createClient } from "@/lib/supabase/server";
import { EventCard } from "@/components/events/event-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

async function EventList() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 내가 만든 이벤트
  const { data: hostedEvents } = await supabase
    .from("events")
    .select("*, participants(count)")
    .eq("host_id", user.id)
    .order("event_date", { ascending: true });

  // 참여 중인 이벤트 (내가 만든 것 제외)
  const { data: participantRows } = await supabase
    .from("participants")
    .select("event_id")
    .eq("user_id", user.id);

  const participatingEventIds = (participantRows ?? [])
    .map((r) => r.event_id)
    .filter((id) => !(hostedEvents ?? []).some((e) => e.id === id));

  let joinedEvents: typeof hostedEvents = [];
  if (participatingEventIds.length > 0) {
    const { data } = await supabase
      .from("events")
      .select("*, participants(count)")
      .in("id", participatingEventIds)
      .order("event_date", { ascending: true });
    joinedEvents = data;
  }

  const getParticipantCount = (
    event: NonNullable<typeof hostedEvents>[number],
  ) => {
    const counts = event.participants as unknown as { count: number }[];
    return counts?.[0]?.count ?? 0;
  };

  return (
    <>
      {/* 내가 만든 이벤트 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">내가 만든 이벤트</h2>
        {hostedEvents && hostedEvents.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {hostedEvents.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                event_date={event.event_date}
                location={event.location}
                status={event.status}
                participant_count={getParticipantCount(event)}
                max_participants={event.max_participants}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              아직 만든 이벤트가 없습니다
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/events/new">첫 이벤트 만들기</Link>
            </Button>
          </div>
        )}
      </section>

      {/* 참여 중인 이벤트 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">참여 중인 이벤트</h2>
        {joinedEvents && joinedEvents.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {joinedEvents.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                event_date={event.event_date}
                location={event.location}
                status={event.status}
                participant_count={getParticipantCount(event)}
                max_participants={event.max_participants}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              참여 중인 이벤트가 없습니다
            </p>
          </div>
        )}
      </section>
    </>
  );
}

export default function EventsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">이벤트</h1>
        <Button asChild>
          <Link href="/events/new">
            <Plus className="mr-1.5 size-4" />새 이벤트
          </Link>
        </Button>
      </div>
      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="h-32 animate-pulse rounded-xl bg-muted" />
            <div className="h-32 animate-pulse rounded-xl bg-muted" />
          </div>
        }
      >
        <EventList />
      </Suspense>
    </div>
  );
}
