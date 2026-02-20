import { createClient } from "@/lib/supabase/server";
import { AnnouncementCard } from "@/components/events/announcement-card";
import { Megaphone } from "lucide-react";

type AnnouncementListProps = {
  eventId: string;
  currentUserId: string;
  hostId: string;
};

type AnnouncementRow = {
  id: string;
  content: string;
  created_at: string;
  is_pinned: boolean;
  author_id: string;
  profiles: { uesr_name: string | null }[] | null;
};

export async function AnnouncementList({
  eventId,
  currentUserId,
  hostId,
}: AnnouncementListProps) {
  const supabase = await createClient();

  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, content, created_at, is_pinned, author_id, profiles(uesr_name)")
    .eq("event_id", eventId)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (!announcements || announcements.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <Megaphone className="mx-auto size-8 text-muted-foreground/50" />
        <p className="mt-2 text-sm text-muted-foreground">
          아직 공지사항이 없습니다
        </p>
      </div>
    );
  }

  const isHost = currentUserId === hostId;

  return (
    <div className="space-y-3">
      {(announcements as AnnouncementRow[]).map((a) => {
        const authorName = a.profiles?.[0]?.uesr_name ?? "알 수 없음";
        const canDelete = isHost || a.author_id === currentUserId;
        const canPin = isHost;

        return (
          <AnnouncementCard
            key={a.id}
            id={a.id}
            content={a.content}
            authorName={authorName}
            createdAt={a.created_at}
            isPinned={a.is_pinned}
            canDelete={canDelete}
            canPin={canPin}
          />
        );
      })}
    </div>
  );
}
