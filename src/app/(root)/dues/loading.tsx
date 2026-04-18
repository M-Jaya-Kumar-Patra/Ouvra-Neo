export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-zinc-800 rounded-md" />
        <div className="h-4 w-64 bg-zinc-800 rounded-md" />
        <div className="space-y-3 mt-10">
          <div className="h-24 w-full bg-zinc-900 rounded-2xl border border-zinc-800" />
          <div className="h-24 w-full bg-zinc-900 rounded-2xl border border-zinc-800" />
        </div>
      </div>
    </div>
  );
}