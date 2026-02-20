import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GuestJoinForm } from "@/components/events/guest-join-form";
import { UserJoinButton } from "@/components/events/user-join-button";
import Link from "next/link";
import type { EventByInviteCode } from "@/lib/types/event";

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

async function InviteLanding({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const supabase = await createClient();

  // RPC로 이벤트 정보 조회
  const { data, error } = await supabase.rpc("get_event_by_invite_code", {
    code,
  });

  if (error || !data) {
    notFound();
  }

  const event = data as unknown as EventByInviteCode;

  // 현재 사용자 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 로그인한 사용자가 이미 참여 중이면 이벤트 상세로 리다이렉트
  if (user) {
    const { data: existing } = await supabase
      .from("participants")
      .select("id")
      .eq("event_id", event.id)
      .eq("user_id", user.id)
      .single();

    if (existing) {
      redirect(`/events/${event.id}`);
    }

    // 주최자인 경우도 상세로 리다이렉트
    if (user.id === event.host_id) {
      redirect(`/events/${event.id}`);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{event.title}</CardTitle>
          <CardDescription>이벤트에 초대되었습니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 이벤트 정보 */}
          <div className="space-y-3 rounded-lg bg-muted/50 p-4">
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="size-4 text-muted-foreground" />
              {formatEventDate(event.event_date)}
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="size-4 text-muted-foreground" />
                {event.location}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Users className="size-4 text-muted-foreground" />
              {event.current_participants}
              {event.max_participants
                ? `/${event.max_participants}`
                : ""}
              명 참여 중
            </div>
            {event.description && (
              <>
                <Separator />
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {event.description}
                </p>
              </>
            )}
          </div>

          {user ? (
            // 로그인한 사용자: 바로 참여
            <div className="space-y-3">
              <UserJoinButton
                inviteCode={code}
                eventId={event.id}
              />
              <p className="text-center text-xs text-muted-foreground">
                참여 후 이벤트 상세 페이지로 이동합니다
              </p>
            </div>
          ) : (
            // 비로그인: 게스트 폼 + 로그인 유도
            <div className="space-y-4">
              <GuestJoinForm
                inviteCode={code}
                eventTitle={event.title}
              />
              <Separator />
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  로그인하면 더 많은 기능을 이용할 수 있습니다
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/auth/login?redirect_to=/invite/${code}`}>
                    로그인
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto h-6 w-2/3 animate-pulse rounded bg-muted" />
              <div className="mx-auto h-4 w-1/2 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-24 animate-pulse rounded-lg bg-muted" />
                <div className="h-48 animate-pulse rounded-lg bg-muted" />
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <InviteLanding params={params} />
    </Suspense>
  );
}
