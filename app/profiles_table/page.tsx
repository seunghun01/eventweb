import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

async function ProfilesData() {
  const supabase = await createClient();
  // 프로필 데이터 조회
  const { data: profiles } = await supabase.from("profiles").select();

  return <pre>{JSON.stringify(profiles, null, 2)}</pre>;
}

// 프로필 페이지
export default function ProfilesPage() {
  return (
    <Suspense fallback={<div>Loading profilespage...</div>}>
      <ProfilesData />
    </Suspense>
  );
}