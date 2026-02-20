import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, Link2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

async function HomeContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/events");
  }

  return (
    <main className="min-h-screen flex flex-col">
      <nav className="w-full flex justify-center border-b h-16">
        <div className="w-full max-w-5xl flex justify-between items-center px-5">
          <span className="font-semibold">모임 이벤트 관리</span>
          <Suspense>
            <AuthButton />
          </Suspense>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-5 py-16">
        <div className="max-w-2xl text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            모임을 쉽고 빠르게
          </h1>
          <p className="text-lg text-muted-foreground">
            이벤트를 만들고, 초대 링크를 공유하고, 참석 여부를 한눈에
            확인하세요.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link href="/auth/login">시작하기</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/sign-up">회원가입</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-3 mt-16 max-w-3xl w-full">
          <div className="rounded-lg border p-6 text-center space-y-2">
            <CalendarDays className="mx-auto size-8 text-primary" />
            <h3 className="font-semibold">이벤트 생성</h3>
            <p className="text-sm text-muted-foreground">
              날짜, 장소, 인원을 설정하고 바로 이벤트를 만드세요
            </p>
          </div>
          <div className="rounded-lg border p-6 text-center space-y-2">
            <Link2 className="mx-auto size-8 text-primary" />
            <h3 className="font-semibold">초대 링크</h3>
            <p className="text-sm text-muted-foreground">
              링크 하나로 회원/비회원 모두 참여할 수 있어요
            </p>
          </div>
          <div className="rounded-lg border p-6 text-center space-y-2">
            <Users className="mx-auto size-8 text-primary" />
            <h3 className="font-semibold">참여자 관리</h3>
            <p className="text-sm text-muted-foreground">
              참석/불참 현황을 한눈에 확인하고 관리하세요
            </p>
          </div>
        </div>
      </div>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-4">
        <p>모임 이벤트 관리</p>
        <ThemeSwitcher />
      </footer>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
