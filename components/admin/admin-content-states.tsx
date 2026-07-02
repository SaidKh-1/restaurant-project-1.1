import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AdminCardGridSkeletonProps = {
  count?: number;
  className?: string;
  cardClassName?: string;
};

export function AdminCardGridSkeleton({
  count = 4,
  className,
  cardClassName = "h-32 w-full",
}: AdminCardGridSkeletonProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className={cardClassName} />
      ))}
    </div>
  );
}

type AdminMediaCardSkeletonProps = {
  count?: number;
};

export function AdminMediaCardSkeleton({ count = 6 }: AdminMediaCardSkeletonProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="overflow-hidden pt-0">
          <Skeleton className="aspect-square w-full" />
          <CardContent className="space-y-2 pt-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

type AdminOfferCardSkeletonProps = {
  count?: number;
};

export function AdminOfferCardSkeleton({ count = 6 }: AdminOfferCardSkeletonProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="overflow-hidden pt-0">
          <Skeleton className="aspect-[16/9] w-full" />
          <CardContent className="space-y-2 pt-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

type AdminTableSkeletonProps = {
  rows?: number;
};

export function AdminTableSkeleton({ rows = 5 }: AdminTableSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-24 w-full" />
      ))}
    </div>
  );
}

type AdminFormSkeletonProps = {
  sections?: number;
};

export function AdminFormSkeleton({ sections = 3 }: AdminFormSkeletonProps) {
  return (
    <div className="space-y-6">
      {Array.from({ length: sections }).map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64 max-w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

type AdminEmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function AdminEmptyState({
  title,
  description,
  action,
  className,
}: AdminEmptyStateProps) {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <p className="font-medium">{title}</p>
        {description ? (
          <p className="text-muted-foreground max-w-md text-sm">{description}</p>
        ) : null}
        {action}
      </CardContent>
    </Card>
  );
}

type AdminLoadErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export function AdminLoadErrorState({
  message,
  onRetry,
}: AdminLoadErrorStateProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>تعذر التحميل</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      {onRetry ? (
        <CardContent>
          <button
            type="button"
            className="text-primary text-sm underline-offset-4 hover:underline"
            onClick={onRetry}
          >
            إعادة المحاولة
          </button>
        </CardContent>
      ) : null}
    </Card>
  );
}
