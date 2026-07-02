"use client";

import {
  Archive,
  Check,
  Loader2,
  Star,
  Trash2,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  formatPublicDisplayName,
  formatReviewDate,
  getPublicNameModeLabel,
  getReviewStatusLabel,
  getReviewStatusVariant,
  PUBLIC_NAME_MODE_OPTIONS,
} from "@/lib/admin/reviews";
import type { ReviewData } from "@/lib/admin/types";

type ReviewDetailsDialogProps = {
  review: ReviewData | null;
  open: boolean;
  canEdit: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (review: ReviewData) => void;
  onReject: (review: ReviewData) => void;
  onArchive: (review: ReviewData) => void;
  onDelete: (review: ReviewData) => void;
  onToggleFeatured: (review: ReviewData) => void;
  onPublicNameModeChange: (
    review: ReviewData,
    mode: ReviewData["publicNameMode"],
  ) => void;
};

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} من 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={
            index < rating
              ? "size-4 fill-amber-400 text-amber-400"
              : "text-muted-foreground size-4"
          }
        />
      ))}
    </div>
  );
}

export function ReviewDetailsDialog({
  review,
  open,
  canEdit,
  isSubmitting,
  onOpenChange,
  onApprove,
  onReject,
  onArchive,
  onDelete,
  onToggleFeatured,
  onPublicNameModeChange,
}: ReviewDetailsDialogProps) {
  if (!review) {
    return null;
  }

  const ar = review.translations.ar;
  const publicDisplayName = formatPublicDisplayName(
    review.customerName,
    review.publicNameMode,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تفاصيل التقييم</DialogTitle>
          <DialogDescription>
            بيانات العميل الخاصة (البريد والهاتف) تظهر هنا فقط ولا تُعرض
            للجمهور.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={getReviewStatusVariant(review.status)}>
              {getReviewStatusLabel(review.status)}
            </Badge>
            {review.isFeatured ? (
              <Badge variant="secondary">مميز</Badge>
            ) : null}
            <Badge variant="outline">{review.rating}/5</Badge>
          </div>

          <RatingStars rating={review.rating} />

          <div className="space-y-3 rounded-lg border border-dashed bg-muted/40 p-4">
            <p className="text-sm font-medium">بيانات خاصة (للمسؤول فقط)</p>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">الاسم الكامل</dt>
                <dd className="font-medium">{review.customerName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">البريد الإلكتروني</dt>
                <dd dir="ltr" className="font-medium break-all">
                  {review.email}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">الهاتف</dt>
                <dd dir="ltr" className="font-medium">
                  {review.phone ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">تاريخ الإرسال</dt>
                <dd>{formatReviewDate(review.createdAt)}</dd>
              </div>
            </dl>
          </div>

          <div className="space-y-2 rounded-lg border p-4">
            <p className="text-sm font-medium">العرض العام</p>
            <p className="text-muted-foreground text-sm">
              الاسم المعروض:{" "}
              <span className="text-foreground font-medium">
                {publicDisplayName || "—"}
              </span>
            </p>
            {canEdit ? (
              <div className="space-y-2">
                <Label>وضع عرض الاسم</Label>
                <Select
                  value={review.publicNameMode}
                  onValueChange={(value) =>
                    onPublicNameModeChange(
                      review,
                      value as ReviewData["publicNameMode"],
                    )
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PUBLIC_NAME_MODE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                {getPublicNameModeLabel(review.publicNameMode)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            {ar?.title ? (
              <p className="text-lg font-semibold">{ar.title}</p>
            ) : null}
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {ar?.comment ?? "—"}
            </p>
          </div>

          {review.image?.publicUrl ? (
            <div className="space-y-2">
              <Label>صورة مرفقة</Label>
              <div className="overflow-hidden rounded-lg border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={review.image.publicUrl}
                  alt="صورة التقييم"
                  className="max-h-72 w-full object-contain"
                />
              </div>
            </div>
          ) : null}

          {review.approvedAt ? (
            <p className="text-muted-foreground text-sm">
              تمت الموافقة في {formatReviewDate(review.approvedAt)}
              {review.approvedBy?.name
                ? ` بواسطة ${review.approvedBy.name}`
                : ""}
            </p>
          ) : null}

          {canEdit ? (
            <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
              <Label htmlFor="review-featured">تقييم مميز</Label>
              <Switch
                id="review-featured"
                checked={review.isFeatured}
                onCheckedChange={() => onToggleFeatured(review)}
                disabled={isSubmitting}
              />
            </div>
          ) : null}
        </div>

        {canEdit ? (
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {review.status !== "APPROVED" ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onApprove(review)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Check className="size-4" />
                  )}
                  موافقة
                </Button>
              ) : null}
              {review.status !== "REJECTED" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onReject(review)}
                  disabled={isSubmitting}
                >
                  <X className="size-4" />
                  رفض
                </Button>
              ) : null}
              {review.status !== "ARCHIVED" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onArchive(review)}
                  disabled={isSubmitting}
                >
                  <Archive className="size-4" />
                  أرشفة
                </Button>
              ) : null}
            </div>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => onDelete(review)}
              disabled={isSubmitting || review.homepageSectionCount > 0}
            >
              <Trash2 className="size-4" />
              {review.homepageSectionCount > 0
                ? "محذوف (مستخدم في الصفحة الرئيسية)"
                : "حذف"}
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
