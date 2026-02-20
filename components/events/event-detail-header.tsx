import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users } from "lucide-react";
import type { Event, EventStatus } from "@/lib/types/event";

type EventDetailHeaderProps = {
  event: Event;
  participantCount: number;
};

const statusConfig: Record<
  EventStatus,
  { label: string; variant: "default" | "secondary" | "destructive" }
> = {
  active: { label: "진행중", variant: "default" },
  completed: { label: "완료", variant: "secondary" },
  cancelled: { label: "취소됨", variant: "destructive" },
};

function formatEventDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function EventDetailHeader({
  event,
  participantCount,
}: EventDetailHeaderProps) {
  const config = statusConfig[(event.status as EventStatus) ?? "active"];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-bold">{event.title}</h1>
        <Badge variant={config.variant} className="shrink-0">
          {config.label}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="size-4" />
          {formatEventDate(event.event_date)}
        </span>
        {event.location && (
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4" />
            {event.location}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Users className="size-4" />
          {participantCount}
          {event.max_participants ? `/${event.max_participants}` : ""}명 참여
        </span>
      </div>

      {event.description && (
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {event.description}
        </p>
      )}
    </div>
  );
}
