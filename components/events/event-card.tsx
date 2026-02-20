import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users } from "lucide-react";
import Link from "next/link";
import type { EventStatus } from "@/lib/types/event";

type EventCardProps = {
  id: string;
  title: string;
  event_date: string;
  location: string | null;
  status: string;
  participant_count: number;
  max_participants: number | null;
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

export function EventCard({
  id,
  title,
  event_date,
  location,
  status,
  participant_count,
  max_participants,
}: EventCardProps) {
  const config = statusConfig[(status as EventStatus) ?? "active"];

  return (
    <Link href={`/events/${id}`} className="block">
      <Card className="transition-colors hover:border-foreground/20">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg leading-tight">{title}</CardTitle>
            <Badge variant={config.variant} className="shrink-0">
              {config.label}
            </Badge>
          </div>
          <CardDescription className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            {formatEventDate(event_date)}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4 text-sm text-muted-foreground">
          {location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              {location}
            </span>
          )}
          <span
            className={`flex items-center gap-1.5 ${max_participants && participant_count >= max_participants ? "text-amber-600 font-medium" : ""}`}
          >
            <Users className="size-3.5" />
            {participant_count}
            {max_participants ? `/${max_participants}` : ""}명
            {max_participants && participant_count >= max_participants && " (마감)"}
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
