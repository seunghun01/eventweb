import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

async function TodosData() {
  const supabase = await createClient();
  // 프로필 데이터 조회
  const { data: todos } = await supabase.from("todos").select();

  return <pre>{JSON.stringify(todos, null, 2)}</pre>;
}

// 프로필 페이지
export default function TodosPage() {
  return (
    <Suspense fallback={<div>Loading todospage...</div>}>
      <TodosData />
    </Suspense>
  );
}