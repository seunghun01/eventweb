import { EventForm } from "@/components/events/event-form";
import { createEvent } from "@/app/events/actions";

export default function NewEventPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">새 이벤트 만들기</h1>
      <EventForm mode="create" action={createEvent} />
    </div>
  );
}
