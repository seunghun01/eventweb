"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  joinAsGuest,
  type InviteActionResult,
} from "@/app/invite/[code]/actions";
import { Check, X, PartyPopper } from "lucide-react";
import Link from "next/link";

type GuestJoinFormProps = {
  inviteCode: string;
  eventTitle: string;
};

export function GuestJoinForm({ inviteCode, eventTitle }: GuestJoinFormProps) {
  const [state, formAction, isPending] = useActionState(joinAsGuest, {});

  // 참여 완료 화면
  if (state.success) {
    return (
      <div className="space-y-4 text-center py-6">
        <PartyPopper className="mx-auto size-12 text-green-600" />
        <h3 className="text-lg font-semibold">참여가 완료되었습니다!</h3>
        <p className="text-sm text-muted-foreground">
          &quot;{eventTitle}&quot; 이벤트에 등록되었습니다
        </p>
        <div className="rounded-lg border border-dashed p-4 mt-4">
          <p className="text-sm text-muted-foreground">
            회원가입하면 더 많은 기능을 이용할 수 있어요
          </p>
          <Button asChild className="mt-3" size="sm">
            <Link href="/auth/sign-up">회원가입</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="invite_code" value={inviteCode} />

      {state.error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="guest_name">
          이름 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="guest_name"
          name="guest_name"
          placeholder="이름을 입력해주세요"
          required
          maxLength={50}
        />
      </div>

      <div className="space-y-2">
        <Label>
          참석 여부 <span className="text-destructive">*</span>
        </Label>
        <div className="flex gap-2">
          <label className="flex-1">
            <input
              type="radio"
              name="rsvp_status"
              value="attending"
              className="peer sr-only"
              defaultChecked
            />
            <div className="flex cursor-pointer items-center justify-center gap-1.5 rounded-md border p-2.5 text-sm transition-colors peer-checked:border-green-600 peer-checked:bg-green-50 peer-checked:text-green-700">
              <Check className="size-4" />
              참석
            </div>
          </label>
          <label className="flex-1">
            <input
              type="radio"
              name="rsvp_status"
              value="declined"
              className="peer sr-only"
            />
            <div className="flex cursor-pointer items-center justify-center gap-1.5 rounded-md border p-2.5 text-sm transition-colors peer-checked:border-red-600 peer-checked:bg-red-50 peer-checked:text-red-700">
              <X className="size-4" />
              불참
            </div>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">메모 (선택)</Label>
        <Textarea
          id="note"
          name="note"
          placeholder="전달할 메시지가 있으면 입력해주세요"
          maxLength={200}
          rows={2}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "등록 중..." : "참여하기"}
      </Button>
    </form>
  );
}
