import { Badge } from "@/components/ui/badge";
import type { RsvpStatus } from "@/lib/types/event";

const rsvpConfig: Record<
  RsvpStatus,
  { label: string; className: string }
> = {
  attending: {
    label: "참석",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  declined: {
    label: "불참",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  pending: {
    label: "미정",
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
};

type RsvpBadgeProps = {
  status: RsvpStatus;
};

export function RsvpBadge({ status }: RsvpBadgeProps) {
  const config = rsvpConfig[status];

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
