export default function EventDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="h-8 w-2/3 rounded-lg bg-muted" />
          <div className="h-6 w-16 rounded bg-muted" />
        </div>
        <div className="flex gap-4">
          <div className="h-5 w-40 rounded bg-muted" />
          <div className="h-5 w-24 rounded bg-muted" />
          <div className="h-5 w-20 rounded bg-muted" />
        </div>
      </div>
      <div className="h-px bg-border" />
      <div className="flex gap-2">
        <div className="h-8 w-28 rounded bg-muted" />
        <div className="h-8 w-16 rounded bg-muted" />
      </div>
      <div className="h-px bg-border" />
      <div className="h-9 w-56 rounded-lg bg-muted" />
      <div className="h-48 rounded-xl bg-muted" />
    </div>
  );
}
