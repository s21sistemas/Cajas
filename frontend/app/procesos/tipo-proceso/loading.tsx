import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="h-24 rounded-lg bg-card border border-border">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
      </div>

      {/* Search Skeleton */}
      <div className="flex justify-between">
        <Skeleton className="h-10 w-64 rounded-md" />
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="space-y-4">
          <div className="h-10 bg-muted rounded-md" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-muted/50 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
