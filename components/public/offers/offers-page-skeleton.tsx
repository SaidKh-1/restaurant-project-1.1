import { Skeleton } from "@/components/ui/skeleton";

export function OffersPageSkeleton() {
  return (
    <div className="pb-16">
      <div className="border-b bg-muted/20">
        <div className="mx-auto max-w-7xl space-y-3 px-4 py-12 sm:px-6 lg:px-8">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-48" />
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-12 sm:grid-cols-2 sm:px-6 xl:grid-cols-3 lg:px-8">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-80 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
