import { Skeleton } from "@/components/ui/skeleton";

export function ContactPageSkeleton() {
  return (
    <div className="pb-16">
      <div className="border-b bg-muted/20">
        <div className="mx-auto max-w-7xl space-y-3 px-4 py-12 sm:px-6 lg:px-8">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-56" />
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-2 lg:px-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-lg" />
          ))}
          <Skeleton className="h-56 w-full rounded-2xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
