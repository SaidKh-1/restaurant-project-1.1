import { Skeleton } from "@/components/ui/skeleton";

export function ManagerPageSkeleton() {
  return (
    <div className="pb-16">
      <div className="border-b bg-muted/20">
        <div className="mx-auto max-w-7xl space-y-3 px-4 py-12 sm:px-6 lg:px-8">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-48" />
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
        <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}
