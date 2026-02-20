"use client";

import { useActionState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RsvpBadge } from "@/components/events/rsvp-badge";
import { removeParticipant, type ActionResult } from "@/app/events/actions";
import type { RsvpStatus } from "@/lib/types/event";
import { UserMinus } from "lucide-react";
import { toast } from "sonner";

type ParticipantItemProps = {
  id: string;
  name: string;
  rsvpStatus: RsvpStatus;
  note: string | null;
  isGuest: boolean;
  canRemove: boolean;
};

export function ParticipantItem({
  id,
  name,
  rsvpStatus,
  note,
  isGuest,
  canRemove,
}: ParticipantItemProps) {
  const initial = name.charAt(0).toUpperCase();

  const removeAction = removeParticipant.bind(null, id);
  const [state, formAction, isRemoving] = useActionState(removeAction, {});

  const prevStateRef = useRef(state);
  useEffect(() => {
    if (state !== prevStateRef.current) {
      if ((state as ActionResult).success)
        toast.success((state as ActionResult).success);
      if ((state as ActionResult).error)
        toast.error((state as ActionResult).error);
      prevStateRef.current = state;
    }
  }, [state]);

  return (
    <div className="flex items-center gap-3 py-2">
      <Avatar className="size-8">
        <AvatarFallback className="text-xs">{initial}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{name}</span>
          {isGuest && (
            <span className="text-xs text-muted-foreground">(게스트)</span>
          )}
        </div>
        {note && (
          <p className="text-xs text-muted-foreground truncate">{note}</p>
        )}
      </div>
      <RsvpBadge status={rsvpStatus} />
      {canRemove && (
        <form action={formAction}>
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="size-7 text-destructive hover:text-destructive"
            disabled={isRemoving}
            title="참여자 제거"
          >
            <UserMinus className="size-3.5" />
          </Button>
        </form>
      )}
    </div>
  );
}
