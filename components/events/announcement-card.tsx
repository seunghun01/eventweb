"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  deleteAnnouncement,
  toggleAnnouncementPin,
  type ActionResult,
} from "@/app/events/actions";
import { Pin, PinOff, Trash2 } from "lucide-react";
import { toast } from "sonner";

type AnnouncementCardProps = {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
  isPinned: boolean;
  canDelete: boolean;
  canPin: boolean;
};

function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return date.toLocaleDateString("ko-KR");
}

export function AnnouncementCard({
  id,
  content,
  authorName,
  createdAt,
  isPinned,
  canDelete,
  canPin,
}: AnnouncementCardProps) {
  const deleteAction = deleteAnnouncement.bind(null, id);
  const pinAction = toggleAnnouncementPin.bind(null, id);

  const [deleteState, deleteFormAction, isDeleting] = useActionState(
    deleteAction,
    {},
  );
  const [pinState, pinFormAction, isPinning] = useActionState(pinAction, {});

  const prevDeleteRef = useRef(deleteState);
  const prevPinRef = useRef(pinState);

  useEffect(() => {
    if (deleteState !== prevDeleteRef.current) {
      if ((deleteState as ActionResult).success)
        toast.success((deleteState as ActionResult).success);
      if ((deleteState as ActionResult).error)
        toast.error((deleteState as ActionResult).error);
      prevDeleteRef.current = deleteState;
    }
  }, [deleteState]);

  useEffect(() => {
    if (pinState !== prevPinRef.current) {
      if ((pinState as ActionResult).success)
        toast.success((pinState as ActionResult).success);
      if ((pinState as ActionResult).error)
        toast.error((pinState as ActionResult).error);
      prevPinRef.current = pinState;
    }
  }, [pinState]);

  return (
    <div
      className={`rounded-lg border p-4 space-y-2 ${isPinned ? "border-primary/30 bg-primary/5" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {isPinned && <Pin className="size-3.5 text-primary shrink-0" />}
          <span className="text-sm font-medium truncate">{authorName}</span>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatRelativeTime(createdAt)}
          </span>
        </div>
        {(canPin || canDelete) && (
          <div className="flex items-center gap-1 shrink-0">
            {canPin && (
              <form action={pinFormAction}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  disabled={isPinning}
                  title={isPinned ? "고정 해제" : "고정"}
                >
                  {isPinned ? (
                    <PinOff className="size-3.5" />
                  ) : (
                    <Pin className="size-3.5" />
                  )}
                </Button>
              </form>
            )}
            {canDelete && (
              <form action={deleteFormAction}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="size-7 text-destructive hover:text-destructive"
                  disabled={isDeleting}
                  title="삭제"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </form>
            )}
          </div>
        )}
      </div>
      <p className="text-sm whitespace-pre-wrap">{content}</p>
    </div>
  );
}
