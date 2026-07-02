"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Eye,
  Loader2,
  MoreVertical,
  RefreshCw,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  AdminEmptyState,
  AdminLoadErrorState,
  AdminTableSkeleton,
} from "@/components/admin/admin-content-states";
import { useAdminCanEdit } from "@/components/admin/admin-permissions-provider";
import { ReviewDetailsDialog } from "@/components/admin/review-details-dialog";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatPublicDisplayName,
  formatReviewDate,
  filterReviewsForAdminTab,
  getReviewStatusLabel,
  getReviewStatusVariant,
  REVIEW_STATUS_FILTER_OPTIONS,
} from "@/lib/admin/reviews";
import { adminGet } from "@/lib/admin/fetch-client";
import {
  ADMIN_API_CACHE,
  invalidateAdminCacheUrls,
} from "@/lib/admin/invalidate-cache";
import {
  patchById,
  removeById,
  upsertById,
} from "@/lib/admin/permissions-client";
import { useAdminFetchState } from "@/lib/admin/use-admin-fetch-state";
import type {
  ApiErrorResponse,
  ApiResponse,
  ReviewData,
} from "@/lib/admin/types";
import { cn } from "@/lib/utils";

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={
            index < rating
              ? "size-3.5 fill-amber-400 text-amber-400"
              : "text-muted-foreground size-3.5"
          }
        />
      ))}
    </div>
  );
}

function applyReviewsStatusFilter(
  items: ReviewData[],
  filter: string,
): ReviewData[] {
  return filterReviewsForAdminTab(items, filter);
}

export function ReviewsManagementManager() {
  const canEdit = useAdminCanEdit("reviews.manage");
  const { isInitialLoading, isRefreshing, beginLoad, endLoad } =
    useAdminFetchState();
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewData | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ReviewData | null>(null);

  async function fetchReviewsList(filter: string, force = false) {
    const query =
      filter !== "all" ? `?status=${encodeURIComponent(filter)}` : "";
    return adminGet<ReviewData[]>(`/api/admin/reviews${query}`, {
      force,
      errorMessage: "تعذر تحميل التقييمات.",
    });
  }

  const refreshReviews = useCallback(
    async (filter = statusFilter) => {
      beginLoad();

      try {
        const data = await fetchReviewsList(filter, true);
        setReviews(filterReviewsForAdminTab(data, filter));
        setLoadError(null);
        endLoad(true);
      } catch (error) {
        setLoadError(
          error instanceof Error ? error.message : "تعذر تحميل التقييمات.",
        );
        endLoad(false);
      }
    },
    [statusFilter, beginLoad, endLoad],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadReviewsForFilter() {
      beginLoad();

      try {
        const data = await fetchReviewsList(statusFilter, true);

        if (!cancelled) {
          setReviews(filterReviewsForAdminTab(data, statusFilter));
          setLoadError(null);
          endLoad(true);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "تعذر تحميل التقييمات.",
          );
          endLoad(false);
        }
      }
    }

    void loadReviewsForFilter();

    return () => {
      cancelled = true;
    };
  }, [statusFilter, beginLoad, endLoad]);

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  function openDetails(review: ReviewData) {
    setSelectedReview(review);
    setDetailsOpen(true);
  }

  async function patchReview(
    review: ReviewData,
    body: Record<string, unknown>,
    successMessage: string,
  ) {
    if (!canEdit) {
      return;
    }

    const previousReviews = reviews;
    const previousSelectedReview = selectedReview;
    const optimisticPatch = body as Partial<ReviewData>;

    setReviews((current) =>
      applyReviewsStatusFilter(
        patchById(current, review.id, optimisticPatch),
        statusFilter,
      ),
    );
    setSelectedReview((current) =>
      current?.id === review.id
        ? { ...current, ...optimisticPatch }
        : current,
    );

    try {
      const response = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorPayload = (await response.json()) as ApiErrorResponse;
        throw new Error(errorPayload.error?.message ?? "تعذر تحديث التقييم.");
      }

      const payload = (await response.json()) as ApiResponse<ReviewData>;
      toast.success(successMessage);
      invalidateAdminCacheUrls([
        ADMIN_API_CACHE.reviews,
        ADMIN_API_CACHE.dashboard,
      ]);
      setReviews((current) =>
        applyReviewsStatusFilter(
          upsertById(current, payload.data),
          statusFilter,
        ),
      );
      setSelectedReview((current) =>
        current?.id === payload.data.id ? payload.data : current,
      );
    } catch (error) {
      setReviews(previousReviews);
      setSelectedReview(previousSelectedReview);
      toast.error(
        error instanceof Error ? error.message : "تعذر تحديث التقييم.",
      );
    }
  }

  async function handleApprove(review: ReviewData) {
    await patchReview(review, { status: "APPROVED" }, "تمت الموافقة على التقييم.");
  }

  async function handleReject(review: ReviewData) {
    await patchReview(review, { status: "REJECTED" }, "تم رفض التقييم.");
  }

  async function handleArchive(review: ReviewData) {
    await patchReview(review, { status: "ARCHIVED" }, "تم أرشفة التقييم.");
  }

  async function handleToggleFeatured(review: ReviewData) {
    await patchReview(
      review,
      { isFeatured: !review.isFeatured },
      review.isFeatured ? "تم إلغاء تمييز التقييم." : "تم تمييز التقييم.",
    );
  }

  async function handlePublicNameModeChange(
    review: ReviewData,
    mode: ReviewData["publicNameMode"],
  ) {
    await patchReview(
      review,
      { publicNameMode: mode },
      "تم تحديث وضع عرض الاسم.",
    );
  }

  function requestDelete(review: ReviewData) {
    setDeleteTarget(review);
  }

  async function handleDelete() {
    if (!canEdit || !deleteTarget) {
      return;
    }

    setIsSubmitting(true);
    const deletedReview = deleteTarget;
    setReviews((current) => removeById(current, deletedReview.id));
    setDeleteTarget(null);
    setDetailsOpen(false);
    setSelectedReview(null);

    try {
      const response = await fetch(`/api/admin/reviews/${deletedReview.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorPayload = (await response.json()) as ApiErrorResponse;
        throw new Error(errorPayload.error?.message ?? "تعذر حذف التقييم.");
      }

      toast.success("تم حذف التقييم.");
      invalidateAdminCacheUrls([
        ADMIN_API_CACHE.reviews,
        ADMIN_API_CACHE.dashboard,
      ]);
    } catch (error) {
      setReviews((current) => upsertById(current, deletedReview));
      toast.error(
        error instanceof Error ? error.message : "تعذر حذف التقييم.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة التقييمات"
        description="مراجعة تقييمات العملاء والموافقة عليها أو رفضها."
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={() => void refreshReviews()}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cn("size-4", isRefreshing && "animate-spin")}
            />
            تحديث
          </Button>
        }
      />

      {!canEdit ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            لديك صلاحية القراءة فقط. التعديل متاح للمسؤولين الذين يملكون
            صلاحية إدارة التقييمات.
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="تصفية حسب الحالة" />
          </SelectTrigger>
          <SelectContent>
            {REVIEW_STATUS_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-muted-foreground text-sm">
          {reviews.length} تقييم
        </p>
      </div>

      {isInitialLoading ? (
        <AdminTableSkeleton />
      ) : loadError && reviews.length === 0 ? (
        <AdminLoadErrorState
          message={loadError}
          onRetry={() => void refreshReviews()}
        />
      ) : reviews.length === 0 ? (
        <AdminEmptyState
          title={`لا توجد تقييمات${statusFilter !== "all" ? " بهذه الحالة" : ""} بعد.`}
        />
      ) : (
        <div
          className={cn(
            "space-y-3",
            isRefreshing && "opacity-80 transition-opacity",
          )}
        >
          {reviews.map((review) => {
            const ar = review.translations.ar;
            const publicName = formatPublicDisplayName(
              review.customerName,
              review.publicNameMode,
            );

            return (
              <Card key={review.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base">
                        {review.customerName}
                      </CardTitle>
                      <Badge variant={getReviewStatusVariant(review.status)}>
                        {getReviewStatusLabel(review.status)}
                      </Badge>
                      {review.isFeatured ? (
                        <Badge variant="secondary">مميز</Badge>
                      ) : null}
                    </div>
                    <CardDescription className="flex flex-wrap items-center gap-3">
                      <RatingStars rating={review.rating} />
                      <span>يعرض كـ: {publicName}</span>
                      <span>{formatReviewDate(review.createdAt)}</span>
                    </CardDescription>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {review.image?.publicUrl ? (
                      <div className="hidden overflow-hidden rounded-md border sm:block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={review.image.publicUrl}
                          alt=""
                          className="size-14 object-cover"
                        />
                      </div>
                    ) : null}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="size-4" />
                          <span className="sr-only">إجراءات</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => openDetails(review)}>
                          <Eye className="size-4" />
                          عرض التفاصيل
                        </DropdownMenuItem>
                        {canEdit ? (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              disabled={review.homepageSectionCount > 0}
                              onClick={() => requestDelete(review)}
                            >
                              <Trash2 className="size-4" />
                              {review.homepageSectionCount > 0
                                ? "محذوف (مستخدم في الصفحة الرئيسية)"
                                : "حذف"}
                            </DropdownMenuItem>
                          </>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  {ar?.title ? (
                    <p className="font-medium">{ar.title}</p>
                  ) : null}
                  <p className="text-muted-foreground line-clamp-3 text-sm">
                    {ar?.comment ?? "—"}
                  </p>
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0"
                    onClick={() => openDetails(review)}
                  >
                    عرض التفاصيل
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ReviewDetailsDialog
        review={selectedReview}
        open={detailsOpen}
        canEdit={canEdit}
        isSubmitting={isSubmitting}
        onOpenChange={(open) => {
          setDetailsOpen(open);
          if (!open) {
            setSelectedReview(null);
          }
        }}
        onApprove={(review) => void handleApprove(review)}
        onReject={(review) => void handleReject(review)}
        onArchive={(review) => void handleArchive(review)}
        onDelete={(review) => requestDelete(review)}
        onToggleFeatured={(review) => void handleToggleFeatured(review)}
        onPublicNameModeChange={(review, mode) =>
          void handlePublicNameModeChange(review, mode)
        }
      />

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل تريد حذف تقييم «{deleteTarget?.customerName}»؟ لا يمكن
              التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleDelete()}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                "حذف"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
