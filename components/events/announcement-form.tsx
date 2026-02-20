"use client";

import { useActionState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createAnnouncement, type ActionResult } from "@/app/events/actions";
import { Send } from "lucide-react";
import { toast } from "sonner";

type AnnouncementFormProps = {
  eventId: string;
};

export function AnnouncementForm({ eventId }: AnnouncementFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult, formData: FormData) => {
      const result = await createAnnouncement(_prev, formData);
      if (!result.error) {
        formRef.current?.reset();
      }
      return result;
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

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="event_id" value={eventId} />
      <Textarea
        name="content"
        placeholder="공지사항을 작성해주세요..."
        rows={3}
        required
        disabled={isPending}
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isPending}>
          <Send className="mr-1.5 size-3.5" />
          {isPending ? "작성 중..." : "공지 작성"}
        </Button>
      </div>
    </form>
  );
}
