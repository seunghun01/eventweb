"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { joinAsUser } from "@/app/invite/[code]/actions";

type UserJoinButtonProps = {
  inviteCode: string;
  eventId: string;
};

export function UserJoinButton({ inviteCode, eventId }: UserJoinButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleJoin = async () => {
    setIsPending(true);
    setError(null);

    const result = await joinAsUser(inviteCode, eventId);

    if (result.error) {
      setError(result.error);
      setIsPending(false);
      return;
    }

    router.push(`/events/${eventId}`);
  };

  return (
    <div className="space-y-2">
      <Button
        className="w-full"
        onClick={handleJoin}
        disabled={isPending}
      >
        {isPending ? "참여 중..." : "이벤트 참여하기"}
      </Button>
      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}
    </div>
  );
}
