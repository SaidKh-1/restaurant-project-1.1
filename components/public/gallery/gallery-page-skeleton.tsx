import { Skeleton } from "@/components/ui/skeleton";

export function GalleryPageSkeleton() {
  return (
    <div className="pb-16">
      <div className="border-b bg-muted/20">
        <div className="mx-auto max-w-7xl space-y-3 px-4 py-12 sm:px-6 lg:px-8">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-56" />
        </div>
      </div>

      <div className="border-b">
        <div className="mx-auto flex max-w-7xl gap-2 px-4 py-3 sm:px-6 lg:px-8">
          <Skeleton className="h-9 w-16 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="aspect-[4/3] w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
