"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatOfferDateRange,
  getOfferPreviewCtaText,
  getOfferStatusLabel,
} from "@/lib/admin/offers";
import type { OfferData } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

export type OfferPreviewContent = {
  titleAr: string;
  descriptionAr: string;
  titleEn: string;
  descriptionEn: string;
  discountLabel: string;
  discountLabelEn: string;
  ctaText: string;
  ctaTextEn: string;
  ctaUrl: string;
  imageUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  startsAt: string | null;
  endsAt: string | null;
};

type OfferPreviewCardProps = {
  content: OfferPreviewContent;
  className?: string;
  compact?: boolean;
};

export function offerDataToPreviewContent(offer: OfferData): OfferPreviewContent {
  const ar = offer.translations.ar;
  const en = offer.translations.en;
  const storedLabel = ar?.discountText ?? "";

  return {
    titleAr: ar?.title ?? "",
    descriptionAr: ar?.description ?? "",
    titleEn: en?.title ?? "",
    descriptionEn: en?.description ?? "",
    discountLabel: storedLabel,
    discountLabelEn: en?.discountText ?? "",
    ctaText: storedLabel,
    ctaTextEn: en?.discountText ?? "",
    ctaUrl: ar?.ctaUrl ?? "",
    imageUrl: offer.image?.publicUrl ?? null,
    isActive: offer.isActive,
    isFeatured: offer.isFeatured,
    status: offer.status,
    startsAt: offer.startsAt,
    endsAt: offer.endsAt,
  };
}

export function OfferPreviewCard({
  content,
  className,
  compact = false,
}: OfferPreviewCardProps) {
  const ctaLabel = getOfferPreviewCtaText(
    content.ctaText,
    content.discountLabel,
  );
  const hasEnglish =
    content.titleEn.trim().length > 0 ||
    content.descriptionEn.trim().length > 0;

  return (
    <Card className={cn("overflow-hidden pt-0", className)}>
      <div className="relative aspect-[16/9] bg-muted">
        {content.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={content.imageUrl}
            alt={content.titleAr || "معاينة العرض"}
            className="size-full object-cover"
          />
        ) : (
          <div className="text-muted-foreground flex size-full items-center justify-center text-sm">
            بدون صورة
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        {content.discountLabel.trim() ? (
          <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
            {content.discountLabel}
          </Badge>
        ) : null}
        {content.isFeatured ? (
          <Badge
            variant="secondary"
            className="absolute top-3 left-3 bg-white/90 text-foreground"
          >
            مميز
          </Badge>
        ) : null}
      </div>

      <CardHeader className={cn("space-y-2", compact && "pb-2")}>
        <div className="flex flex-wrap gap-2">
          <Badge variant={content.isActive ? "default" : "secondary"}>
            {content.isActive ? "نشط" : "غير نشط"}
          </Badge>
          <Badge variant="outline">{getOfferStatusLabel(content.status)}</Badge>
        </div>
        <CardTitle className={cn(compact ? "text-lg" : "text-xl")}>
          {content.titleAr.trim() || "عنوان العرض"}
        </CardTitle>
        {!compact ? (
          <CardDescription className="line-clamp-3 whitespace-pre-wrap">
            {content.descriptionAr.trim() || "وصف العرض بالعربية."}
          </CardDescription>
        ) : null}
      </CardHeader>

      {!compact ? (
        <CardContent className="space-y-3 pt-0">
          <p className="text-muted-foreground text-sm">
            {formatOfferDateRange(content.startsAt, content.endsAt)}
          </p>
          {hasEnglish ? (
            <div className="space-y-1 rounded-lg border bg-muted/40 p-3 text-sm">
              <p className="font-medium" dir="ltr">
                {content.titleEn.trim() || "English title"}
              </p>
              <p className="text-muted-foreground" dir="ltr">
                {content.descriptionEn.trim() || "English description"}
              </p>
            </div>
          ) : null}
        </CardContent>
      ) : null}

      <CardFooter className="flex flex-wrap gap-2 border-t pt-4">
        {content.ctaUrl.trim() ? (
          <Button type="button" size="sm" className="pointer-events-none">
            {ctaLabel}
          </Button>
        ) : (
          <span className="text-muted-foreground text-sm">بدون رابط CTA</span>
        )}
      </CardFooter>
    </Card>
  );
}
