import { Skeleton } from "@/components/ui/skeleton";

export function HomePageSkeleton() {
  return (
    <div className="space-y-0">
      <Skeleton className="aspect-[16/9] max-h-[78vh] w-full rounded-none sm:aspect-[21/9]" />

      <div className="mx-auto max-w-7xl space-y-4 px-4 py-14 sm:px-6 lg:px-8">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-2/3 max-w-md" />
        <Skeleton className="h-24 w-full max-w-2xl" />
      </div>

      <div className="bg-muted/40 py-14">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 xl:grid-cols-4 lg:px-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="aspect-[4/3] w-full rounded-2xl" />
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-56 w-full rounded-2xl" />
        ))}
      </div>

      <div className="bg-muted/40 py-14">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 xl:grid-cols-3 lg:px-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-72 w-full rounded-2xl" />
          ))}
        </div>
      </div>

      <Skeleton className="h-44 w-full rounded-none" />
    </div>
  );
}
