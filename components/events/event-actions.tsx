"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  deleteEvent,
  updateEventStatus,
  type ActionResult,
} from "@/app/events/actions";
import type { EventStatus } from "@/lib/types/event";
import { Trash2, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";

type EventActionsProps = {
  eventId: string;
  currentStatus: EventStatus;
};

const statusActions: {
  from: EventStatus;
  to: EventStatus;
  label: string;
  icon: typeof CheckCircle;
}[] = [
  {
    from: "active",
    to: "completed",
    label: "완료로 변경",
    icon: CheckCircle,
  },
  {
    from: "active",
    to: "cancelled",
    label: "취소로 변경",
    icon: XCircle,
  },
  {
    from: "cancelled",
    to: "active",
    label: "다시 진행",
    icon: RotateCcw,
  },
  {
    from: "completed",
    to: "active",
    label: "다시 진행",
    icon: RotateCcw,
  },
];

export function EventActions({ eventId, currentStatus }: EventActionsProps) {
  const [open, setOpen] = useState(false);

  const deleteAction = deleteEvent.bind(null, eventId);
  const [, deleteFormAction, isDeleting] = useActionState(deleteAction, {});

  const [statusState, statusFormAction, isUpdatingStatus] = useActionState(
    updateEventStatus,
    {},
  );

  const prevStatusRef = useRef(statusState);
  useEffect(() => {
    if (statusState !== prevStatusRef.current) {
      if (statusState.success) toast.success(statusState.success);
      if (statusState.error) toast.error(statusState.error);
      prevStatusRef.current = statusState;
    }
  }, [statusState]);

  const available = statusActions.filter((a) => a.from === currentStatus);

  return (
    <div className="flex flex-wrap gap-2">
      {available.map(({ to, label, icon: Icon }) => (
        <form key={to} action={statusFormAction}>
          <input type="hidden" name="event_id" value={eventId} />
          <input type="hidden" name="status" value={to} />
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={isUpdatingStatus}
          >
            <Icon className="mr-1.5 size-3.5" />
            {label}
          </Button>
        </form>
      ))}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-destructive">
            <Trash2 className="mr-1.5 size-3.5" />
            삭제
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>이벤트를 삭제하시겠습니까?</DialogTitle>
            <DialogDescription>
              이 작업은 되돌릴 수 없습니다. 모든 참여자 데이터와 공지사항도 함께
              삭제됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <form action={deleteFormAction}>
              <Button type="submit" variant="destructive" disabled={isDeleting}>
                {isDeleting ? "삭제 중..." : "삭제"}
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
