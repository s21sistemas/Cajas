export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="h-24 rounded-lg bg-card border border-border animate-pulse" />
        <div className="h-24 rounded-lg bg-card border border-border animate-pulse" />
        <div className="h-24 rounded-lg bg-card border border-border animate-pulse" />
      </div>

      {/* Search and Actions Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="h-10 w-full max-w-md bg-card border border-border rounded-md animate-pulse" />
        <div className="h-10 w-40 bg-card border border-border rounded-md animate-pulse" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="space-y-4">
          <div className="h-10 bg-muted rounded-md animate-pulse" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-muted/50 rounded-md animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
