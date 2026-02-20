"use client";

import { useActionState, useOptimistic, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { respondToEvent, type ActionResult } from "@/app/events/actions";
import type { RsvpStatus } from "@/lib/types/event";
import { Check, X, HelpCircle } from "lucide-react";
import { toast } from "sonner";

type RsvpFormProps = {
  eventId: string;
  currentStatus: RsvpStatus | null;
  currentNote?: string | null;
  isFull?: boolean;
  eventStatus?: string;
};

const options: { value: RsvpStatus; label: string; icon: typeof Check }[] = [
  { value: "attending", label: "참석", icon: Check },
  { value: "declined", label: "불참", icon: X },
  { value: "pending", label: "미정", icon: HelpCircle },
];

export function RsvpForm({
  eventId,
  currentStatus,
  currentNote = null,
  isFull = false,
  eventStatus = "active",
}: RsvpFormProps) {
  const [note, setNote] = useState(currentNote ?? "");
  const [optimisticStatus, setOptimisticStatus] =
    useOptimistic<RsvpStatus | null>(currentStatus);

  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult, formData: FormData) => {
      const newStatus = formData.get("rsvp_status") as RsvpStatus;
      setOptimisticStatus(newStatus);
      return respondToEvent(_prev, formData);
    },
    {},
  );

  const prevStateRef = useRef(state);
  useEffect(() => {
    if (state !== prevStateRef.current) {
      if (state.success) toast.success(state.success);
      if (state.error) toast.error(state.error);
      prevStateRef.current = state;
    }
  }, [state]);

  const isInactive = eventStatus !== "active";

  if (isInactive) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {eventStatus === "cancelled"
            ? "취소된 이벤트입니다"
            : "완료된 이벤트입니다"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">참석 여부를 선택해주세요</p>
      {isFull && currentStatus !== "attending" && (
        <p className="text-sm text-amber-600">참석 인원이 마감되었습니다</p>
      )}
      <div className="flex gap-2">
        {options.map(({ value, label, icon: Icon }) => {
          const isSelected = optimisticStatus === value;
          const isAttendDisabled =
            value === "attending" && isFull && currentStatus !== "attending";
          return (
            <form key={value} action={formAction}>
              <input type="hidden" name="event_id" value={eventId} />
              <input type="hidden" name="rsvp_status" value={value} />
              <input type="hidden" name="note" value={note} />
              <Button
                type="submit"
                size="sm"
                variant={isSelected ? "default" : "outline"}
                disabled={isPending || isAttendDisabled}
                className={
                  isSelected && value === "attending"
                    ? "bg-green-600 hover:bg-green-700"
                    : isSelected && value === "declined"
                      ? "bg-red-600 hover:bg-red-700"
                      : ""
                }
              >
                <Icon className="mr-1.5 size-3.5" />
                {label}
              </Button>
            </form>
          );
        })}
      </div>
      <Input
        placeholder="메모 (선택, 예: 30분 늦습니다)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={200}
        className="text-sm"
      />
    </div>
  );
}
