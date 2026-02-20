"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Event } from "@/lib/types/event";
import { useActionState } from "react";
import type { ActionResult } from "@/app/events/actions";

type EventFormProps = {
  mode: "create" | "edit";
  event?: Event;
  action: (
    prevState: ActionResult,
    formData: FormData,
  ) => Promise<ActionResult>;
};

function toLocalDatetimeValue(dateString: string) {
  const date = new Date(dateString);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export function EventForm({ mode, event, action }: EventFormProps) {
  const [state, formAction, isPending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">
          제목 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          placeholder="이벤트 제목을 입력하세요"
          defaultValue={event?.title ?? ""}
          required
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">설명</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="이벤트에 대한 설명을 입력하세요 (선택)"
          defaultValue={event?.description ?? ""}
          maxLength={2000}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="event_date">
          날짜 및 시간 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="event_date"
          name="event_date"
          type="datetime-local"
          defaultValue={
            event?.event_date
              ? toLocalDatetimeValue(event.event_date)
              : ""
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">장소</Label>
        <Input
          id="location"
          name="location"
          placeholder="장소를 입력하세요 (선택)"
          defaultValue={event?.location ?? ""}
          maxLength={200}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="max_participants">최대 인원</Label>
        <Input
          id="max_participants"
          name="max_participants"
          type="number"
          min={2}
          placeholder="제한 없음"
          defaultValue={event?.max_participants ?? ""}
        />
        <p className="text-xs text-muted-foreground">
          비워두면 인원 제한 없이 참여할 수 있습니다
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending
          ? mode === "create"
            ? "생성 중..."
            : "수정 중..."
          : mode === "create"
            ? "이벤트 생성"
            : "이벤트 수정"}
      </Button>
    </form>
  );
}
