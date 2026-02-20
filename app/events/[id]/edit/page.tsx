import { createClient } from "@/lib/supabase/server";
import { EventForm } from "@/components/events/event-form";
import { updateEvent } from "@/app/events/actions";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

async function EditEventContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (!event) {
    notFound();
  }

  // 주최자만 수정 가능
  if (event.host_id !== user.id) {
    redirect(`/events/${id}`);
  }

  const boundAction = updateEvent.bind(null, id);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">이벤트 수정</h1>
      <EventForm mode="edit" event={event} action={boundAction} />
    </div>
  );
}

export default function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg space-y-6">
          <h1 className="text-2xl font-bold">이벤트 수정</h1>
          <div className="space-y-4">
            <div className="h-10 animate-pulse rounded-md bg-muted" />
            <div className="h-24 animate-pulse rounded-md bg-muted" />
            <div className="h-10 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
      }
    >
      <EditEventContent params={params} />
    </Suspense>
  );
}
