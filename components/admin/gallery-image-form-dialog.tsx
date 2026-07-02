"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

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
import { CMS_STATUS_OPTIONS } from "@/lib/admin/gallery";
import type { GalleryCategoryData, GalleryImageData } from "@/lib/admin/types";

export type GalleryImageFormValues = {
  mediaAssetId: string | null;
  galleryCategoryId: string | null;
  altAr: string;
  captionAr: string;
  altEn: string;
  captionEn: string;
  isFeatured: boolean;
  isVisible: boolean;
  sortOrder: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

type GalleryImageFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  initialValues: GalleryImageFormValues;
  categories: GalleryCategoryData[];
  canEdit: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: GalleryImageFormValues) => void;
};

export function createDefaultImageFormValues(
  galleryCategoryId: string | null = null,
  sortOrder = 0,
): GalleryImageFormValues {
  return {
    mediaAssetId: null,
    galleryCategoryId,
    altAr: "",
    captionAr: "",
    altEn: "",
    captionEn: "",
    isFeatured: false,
    isVisible: true,
    sortOrder,
    status: "DRAFT",
  };
}

export function mapImageToFormValues(
  image: GalleryImageData,
): GalleryImageFormValues {
  return {
    mediaAssetId: image.mediaAssetId,
    galleryCategoryId: image.galleryCategoryId,
    altAr: image.translations.ar?.altText ?? "",
    captionAr: image.translations.ar?.caption ?? "",
    altEn: image.translations.en?.altText ?? "",
    captionEn: image.translations.en?.caption ?? "",
    isFeatured: image.isFeatured,
    isVisible: image.isVisible,
    sortOrder: image.sortOrder,
    status: image.status,
  };
}

export function buildImagePayload(values: GalleryImageFormValues) {
  return {
    mediaAssetId: values.mediaAssetId,
    galleryCategoryId: values.galleryCategoryId,
    isFeatured: values.isFeatured,
    isVisible: values.isVisible,
    sortOrder: values.sortOrder,
    status: values.status,
    translations: {
      ar: {
        altText: values.altAr.trim(),
        caption: values.captionAr.trim() || null,
      },
      ...(values.altEn.trim()
        ? {
            en: {
              altText: values.altEn.trim(),
              caption: values.captionEn.trim() || null,
            },
          }
        : {}),
    },
  };
}

export function validateImageForm(values: GalleryImageFormValues) {
  if (!values.mediaAssetId) {
    return "يجب اختيار صورة من المكتبة.";
  }

  if (!values.altAr.trim()) {
    return "النص البديل بالعربية مطلوب.";
  }

  if (!values.captionAr.trim()) {
    return "التعليق بالعربية مطلوب.";
  }

  return null;
}

export function GalleryImageFormDialog({
  open,
  mode,
  initialValues,
  categories,
  canEdit,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: GalleryImageFormDialogProps) {
  const [values, setValues] = useState(initialValues);

  function update(patch: Partial<GalleryImageFormValues>) {
    setValues((current) => ({ ...current, ...patch }));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(values);
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "إضافة صورة" : "تعديل الصورة"}
            </DialogTitle>
            <DialogDescription>
              اختر صورة من المكتبة. النص البديل والتعليق بالعربية مطلوبان.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>الصورة من المكتبة *</Label>
              <MediaAssetSelect
                value={values.mediaAssetId}
                onChange={(mediaAssetId) => update({ mediaAssetId })}
                disabled={!canEdit || isSubmitting}
                allowClear={false}
                placeholder="اختر صورة"
              />
            </div>
            <div className="space-y-2">
              <Label>التصنيف</Label>
              <Select
                value={values.galleryCategoryId ?? "__none__"}
                onValueChange={(nextValue) =>
                  update({
                    galleryCategoryId:
                      nextValue === "__none__" ? null : nextValue,
                  })
                }
                disabled={!canEdit || isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="بدون تصنيف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">بدون تصنيف</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.translations.ar?.name ?? category.slug}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gallery-img-alt-ar">النص البديل (عربي) *</Label>
              <Input
                id="gallery-img-alt-ar"
                value={values.altAr}
                onChange={(event) => update({ altAr: event.target.value })}
                disabled={!canEdit || isSubmitting}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gallery-img-caption-ar">التعليق (عربي) *</Label>
              <Textarea
                id="gallery-img-caption-ar"
                value={values.captionAr}
                onChange={(event) => update({ captionAr: event.target.value })}
                disabled={!canEdit || isSubmitting}
                rows={2}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gallery-img-alt-en">Alt text (English)</Label>
              <Input
                id="gallery-img-alt-en"
                dir="ltr"
                value={values.altEn}
                onChange={(event) => update({ altEn: event.target.value })}
                disabled={!canEdit || isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gallery-img-caption-en">Caption (English)</Label>
              <Textarea
                id="gallery-img-caption-en"
                dir="ltr"
                value={values.captionEn}
                onChange={(event) => update({ captionEn: event.target.value })}
                disabled={!canEdit || isSubmitting}
                rows={2}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gallery-img-sort">الترتيب</Label>
                <Input
                  id="gallery-img-sort"
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
                      status: status as GalleryImageFormValues["status"],
                    })
                  }
                  disabled={!canEdit || isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CMS_STATUS_OPTIONS.map((option) => (
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
                <Label htmlFor="gallery-img-visible">نشط / ظاهر</Label>
                <Switch
                  id="gallery-img-visible"
                  checked={values.isVisible}
                  onCheckedChange={(isVisible) => update({ isVisible })}
                  disabled={!canEdit || isSubmitting}
                />
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <Label htmlFor="gallery-img-featured">مميز</Label>
                <Switch
                  id="gallery-img-featured"
                  checked={values.isFeatured}
                  onCheckedChange={(isFeatured) => update({ isFeatured })}
                  disabled={!canEdit || isSubmitting}
                />
              </div>
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
