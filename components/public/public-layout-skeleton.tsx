import { Skeleton } from "@/components/ui/skeleton";

export function PublicLayoutSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="sticky top-0 z-50 border-b bg-background px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-10 max-w-7xl items-center justify-between gap-4">
          <Skeleton className="h-10 w-32" />
          <div className="hidden flex-1 justify-center gap-2 lg:flex">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-20" />
            ))}
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl flex-1 space-y-4 px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-10 w-2/3 max-w-md" />
        <Skeleton className="h-4 w-full max-w-2xl" />
        <Skeleton className="h-4 w-5/6 max-w-xl" />
        <Skeleton className="h-56 w-full" />
      </div>

      <div className="border-t px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
