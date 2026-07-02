"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  OfferPreviewCard,
  type OfferPreviewContent,
} from "@/components/admin/offer-preview-card";
import { MediaAssetSelect } from "@/components/admin/media-asset-select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  fromDatetimeLocalValue,
  OFFER_STATUS_OPTIONS,
  toDatetimeLocalValue,
} from "@/lib/admin/offers";
import { adminGet } from "@/lib/admin/fetch-client";
import type { OfferData } from "@/lib/admin/types";

export type OfferFormValues = {
  imageAssetId: string | null;
  titleAr: string;
  descriptionAr: string;
  discountLabel: string;
  ctaText: string;
  ctaUrl: string;
  titleEn: string;
  descriptionEn: string;
  discountLabelEn: string;
  ctaTextEn: string;
  ctaUrlEn: string;
  startsAtLocal: string;
  endsAtLocal: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  status: "DRAFT" | "PUBLISHED";
};

type OfferFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  initialValues: OfferFormValues;
  imagePreviewUrl: string | null;
  canEdit: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: OfferFormValues) => void;
};

export function createDefaultOfferFormValues(sortOrder = 0): OfferFormValues {
  return {
    imageAssetId: null,
    titleAr: "",
    descriptionAr: "",
    discountLabel: "",
    ctaText: "",
    ctaUrl: "",
    titleEn: "",
    descriptionEn: "",
    discountLabelEn: "",
    ctaTextEn: "",
    ctaUrlEn: "",
    startsAtLocal: "",
    endsAtLocal: "",
    isActive: true,
    isFeatured: false,
    sortOrder,
    status: "DRAFT",
  };
}

export function mapOfferToFormValues(offer: OfferData): OfferFormValues {
  const ar = offer.translations.ar;
  const en = offer.translations.en;
  const storedText = ar?.discountText ?? "";

  return {
    imageAssetId: offer.imageAssetId,
    titleAr: ar?.title ?? "",
    descriptionAr: ar?.description ?? "",
    discountLabel: storedText,
    ctaText: storedText,
    ctaUrl: ar?.ctaUrl ?? "",
    titleEn: en?.title ?? "",
    descriptionEn: en?.description ?? "",
    discountLabelEn: en?.discountText ?? "",
    ctaTextEn: en?.discountText ?? "",
    ctaUrlEn: en?.ctaUrl ?? "",
    startsAtLocal: toDatetimeLocalValue(offer.startsAt),
    endsAtLocal: toDatetimeLocalValue(offer.endsAt),
    isActive: offer.isActive,
    isFeatured: offer.isFeatured,
    sortOrder: offer.sortOrder,
    status: offer.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
  };
}

function resolveStoredText(ctaText: string, discountLabel: string) {
  return ctaText.trim() || discountLabel.trim() || null;
}

export function buildOfferPayload(values: OfferFormValues) {
  const startsAt = fromDatetimeLocalValue(values.startsAtLocal);
  const endsAt = fromDatetimeLocalValue(values.endsAtLocal);

  return {
    imageAssetId: values.imageAssetId,
    startsAt,
    endsAt,
    isActive: values.isActive,
    isFeatured: values.isFeatured,
    sortOrder: values.sortOrder,
    status: values.status,
    translations: {
      ar: {
        title: values.titleAr.trim(),
        description: values.descriptionAr.trim() || null,
        discountText: resolveStoredText(values.ctaText, values.discountLabel),
        ctaUrl: values.ctaUrl.trim() || null,
      },
      ...(values.titleEn.trim()
        ? {
            en: {
              title: values.titleEn.trim(),
              description: values.descriptionEn.trim() || null,
              discountText: resolveStoredText(
                values.ctaTextEn,
                values.discountLabelEn,
              ),
              ctaUrl: values.ctaUrlEn.trim() || values.ctaUrl.trim() || null,
            },
          }
        : {}),
    },
  };
}

export function validateOfferForm(values: OfferFormValues) {
  if (!values.titleAr.trim()) {
    return "عنوان العرض بالعربية مطلوب.";
  }

  if (!values.descriptionAr.trim()) {
    return "وصف العرض بالعربية مطلوب.";
  }

  if (values.ctaUrl.trim()) {
    const url = values.ctaUrl.trim();
    const isValid =
      url.startsWith("/") ||
      url.startsWith("http://") ||
      url.startsWith("https://");

    if (!isValid) {
      return "رابط CTA يجب أن يبدأ بـ / أو http:// أو https://";
    }
  }

  if (values.ctaUrlEn.trim()) {
    const url = values.ctaUrlEn.trim();
    const isValid =
      url.startsWith("/") ||
      url.startsWith("http://") ||
      url.startsWith("https://");

    if (!isValid) {
      return "English CTA URL must start with /, http://, or https://";
    }
  }

  const startsAt = fromDatetimeLocalValue(values.startsAtLocal);
  const endsAt = fromDatetimeLocalValue(values.endsAtLocal);

  if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) {
    return "تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية.";
  }

  return null;
}

export function OfferFormDialog({
  open,
  mode,
  initialValues,
  imagePreviewUrl,
  canEdit,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: OfferFormDialogProps) {
  const [values, setValues] = useState(initialValues);
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string | null>(
    imagePreviewUrl,
  );

  useEffect(() => {
    let cancelled = false;

    async function resolveImageUrl() {
      if (!values.imageAssetId) {
        setResolvedImageUrl(null);
        return;
      }

      if (
        imagePreviewUrl &&
        values.imageAssetId === initialValues.imageAssetId
      ) {
        setResolvedImageUrl(imagePreviewUrl);
        return;
      }

      try {
        const data = await adminGet<{ id: string; publicUrl: string }[]>(
          "/api/admin/media",
        );
        const asset = data.find((item) => item.id === values.imageAssetId);

        if (!cancelled) {
          setResolvedImageUrl(asset?.publicUrl ?? null);
        }
      } catch {
        if (!cancelled) {
          setResolvedImageUrl(null);
        }
      }
    }

    void resolveImageUrl();

    return () => {
      cancelled = true;
    };
  }, [values.imageAssetId, imagePreviewUrl, initialValues.imageAssetId]);

  function update(patch: Partial<OfferFormValues>) {
    setValues((current) => ({ ...current, ...patch }));
  }

  const previewContent = useMemo<OfferPreviewContent>(
    () => ({
      titleAr: values.titleAr,
      descriptionAr: values.descriptionAr,
      titleEn: values.titleEn,
      descriptionEn: values.descriptionEn,
      discountLabel: values.discountLabel,
      discountLabelEn: values.discountLabelEn,
      ctaText: values.ctaText,
      ctaTextEn: values.ctaTextEn,
      ctaUrl: values.ctaUrl,
      imageUrl: resolvedImageUrl,
      isActive: values.isActive,
      isFeatured: values.isFeatured,
      status: values.status,
      startsAt: fromDatetimeLocalValue(values.startsAtLocal),
      endsAt: fromDatetimeLocalValue(values.endsAtLocal),
    }),
    [values, resolvedImageUrl],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(values);
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "إضافة عرض" : "تعديل العرض"}
            </DialogTitle>
            <DialogDescription>
              العنوان والوصف بالعربية مطلوبان. الإنجليزية اختيارية.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="offer-title-ar">العنوان (عربي) *</Label>
                <Input
                  id="offer-title-ar"
                  value={values.titleAr}
                  onChange={(event) => update({ titleAr: event.target.value })}
                  disabled={!canEdit || isSubmitting}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="offer-desc-ar">الوصف (عربي) *</Label>
                <Textarea
                  id="offer-desc-ar"
                  value={values.descriptionAr}
                  onChange={(event) =>
                    update({ descriptionAr: event.target.value })
                  }
                  disabled={!canEdit || isSubmitting}
                  rows={3}
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="offer-discount-ar">تسمية الخصم</Label>
                  <Input
                    id="offer-discount-ar"
                    value={values.discountLabel}
                    onChange={(event) =>
                      update({ discountLabel: event.target.value })
                    }
                    disabled={!canEdit || isSubmitting}
                    placeholder="مثال: خصم 20%"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="offer-cta-text-ar">نص زر الدعوة</Label>
                  <Input
                    id="offer-cta-text-ar"
                    value={values.ctaText}
                    onChange={(event) => update({ ctaText: event.target.value })}
                    disabled={!canEdit || isSubmitting}
                    placeholder="مثال: اطلب الآن"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="offer-cta-url-ar">رابط CTA</Label>
                <Input
                  id="offer-cta-url-ar"
                  dir="ltr"
                  value={values.ctaUrl}
                  onChange={(event) => update({ ctaUrl: event.target.value })}
                  disabled={!canEdit || isSubmitting}
                  placeholder="/ar/reservations"
                />
              </div>

              <div className="space-y-2">
                <Label>صورة العرض</Label>
                <MediaAssetSelect
                  value={values.imageAssetId}
                  onChange={(imageAssetId) => update({ imageAssetId })}
                  disabled={!canEdit || isSubmitting}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="offer-starts">تاريخ البداية</Label>
                  <Input
                    id="offer-starts"
                    type="datetime-local"
                    dir="ltr"
                    value={values.startsAtLocal}
                    onChange={(event) =>
                      update({ startsAtLocal: event.target.value })
                    }
                    disabled={!canEdit || isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="offer-ends">تاريخ الانتهاء</Label>
                  <Input
                    id="offer-ends"
                    type="datetime-local"
                    dir="ltr"
                    value={values.endsAtLocal}
                    onChange={(event) =>
                      update({ endsAtLocal: event.target.value })
                    }
                    disabled={!canEdit || isSubmitting}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="offer-sort">الترتيب</Label>
                  <Input
                    id="offer-sort"
                    type="number"
                    min={0}
                    value={values.sortOrder}
                    onChange={(event) =>
                      update({ sortOrder: Number(event.target.value) || 0 })
                    }
                    disabled={!canEdit || isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الحالة</Label>
                  <Select
                    value={values.status}
                    onValueChange={(status) =>
                      update({
                        status: status as OfferFormValues["status"],
                      })
                    }
                    disabled={!canEdit || isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OFFER_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
                  <Label htmlFor="offer-active">نشط</Label>
                  <Switch
                    id="offer-active"
                    checked={values.isActive}
                    onCheckedChange={(isActive) => update({ isActive })}
                    disabled={!canEdit || isSubmitting}
                  />
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
                  <Label htmlFor="offer-featured">مميز</Label>
                  <Switch
                    id="offer-featured"
                    checked={values.isFeatured}
                    onCheckedChange={(isFeatured) => update({ isFeatured })}
                    disabled={!canEdit || isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-lg border p-4">
                <p className="text-sm font-medium">English (optional)</p>
                <div className="space-y-2">
                  <Label htmlFor="offer-title-en">Title</Label>
                  <Input
                    id="offer-title-en"
                    dir="ltr"
                    value={values.titleEn}
                    onChange={(event) => update({ titleEn: event.target.value })}
                    disabled={!canEdit || isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="offer-desc-en">Description</Label>
                  <Textarea
                    id="offer-desc-en"
                    dir="ltr"
                    value={values.descriptionEn}
                    onChange={(event) =>
                      update({ descriptionEn: event.target.value })
                    }
                    disabled={!canEdit || isSubmitting}
                    rows={2}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="offer-discount-en">Discount label</Label>
                    <Input
                      id="offer-discount-en"
                      dir="ltr"
                      value={values.discountLabelEn}
                      onChange={(event) =>
                        update({ discountLabelEn: event.target.value })
                      }
                      disabled={!canEdit || isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="offer-cta-text-en">CTA text</Label>
                    <Input
                      id="offer-cta-text-en"
                      dir="ltr"
                      value={values.ctaTextEn}
                      onChange={(event) =>
                        update({ ctaTextEn: event.target.value })
                      }
                      disabled={!canEdit || isSubmitting}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="offer-cta-url-en">CTA URL</Label>
                  <Input
                    id="offer-cta-url-en"
                    dir="ltr"
                    value={values.ctaUrlEn}
                    onChange={(event) =>
                      update({ ctaUrlEn: event.target.value })
                    }
                    disabled={!canEdit || isSubmitting}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>معاينة البطاقة</Label>
              <OfferPreviewCard content={previewContent} />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            {canEdit ? (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : mode === "create" ? (
                  "إضافة"
                ) : (
                  "حفظ"
                )}
              </Button>
            ) : null}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
