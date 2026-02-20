import { LoginForm } from "@/components/login-form";
import { Suspense } from "react";

function LoginContent({
  searchParams,
}: {
  searchParams: Promise<{ redirect_to?: string }>;
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm searchParams={searchParams} />
      </div>
    </div>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ redirect_to?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-sm">
            <div className="h-96 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      }
    >
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}
