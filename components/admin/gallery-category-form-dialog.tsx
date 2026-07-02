"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { slugifyGalleryText } from "@/lib/admin/gallery";
import type { GalleryCategoryData } from "@/lib/admin/types";

export type GalleryCategoryFormValues = {
  slug: string;
  nameAr: string;
  descriptionAr: string;
  nameEn: string;
  descriptionEn: string;
  isActive: boolean;
  sortOrder: number;
};

type GalleryCategoryFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  initialValues: GalleryCategoryFormValues;
  canEdit: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: GalleryCategoryFormValues) => void;
};

export function createDefaultCategoryFormValues(
  sortOrder = 0,
): GalleryCategoryFormValues {
  return {
    slug: "",
    nameAr: "",
    descriptionAr: "",
    nameEn: "",
    descriptionEn: "",
    isActive: true,
    sortOrder,
  };
}

export function mapCategoryToFormValues(
  category: GalleryCategoryData,
): GalleryCategoryFormValues {
  return {
    slug: category.slug,
    nameAr: category.translations.ar?.name ?? "",
    descriptionAr: category.translations.ar?.description ?? "",
    nameEn: category.translations.en?.name ?? "",
    descriptionEn: category.translations.en?.description ?? "",
    isActive: category.isActive,
    sortOrder: category.sortOrder,
  };
}

export function buildCategoryPayload(values: GalleryCategoryFormValues) {
  const slug = values.slug.trim() || slugifyGalleryText(values.nameAr);

  return {
    slug,
    isActive: values.isActive,
    sortOrder: values.sortOrder,
    translations: {
      ar: {
        name: values.nameAr.trim(),
        description: values.descriptionAr.trim() || null,
      },
      ...(values.nameEn.trim()
        ? {
            en: {
              name: values.nameEn.trim(),
              description: values.descriptionEn.trim() || null,
            },
          }
        : {}),
    },
  };
}

export function validateCategoryForm(values: GalleryCategoryFormValues) {
  if (!values.nameAr.trim()) {
    return "اسم التصنيف بالعربية مطلوب.";
  }

  return null;
}

export function GalleryCategoryFormDialog({
  open,
  mode,
  initialValues,
  canEdit,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: GalleryCategoryFormDialogProps) {
  const [values, setValues] = useState(initialValues);

  function update(patch: Partial<GalleryCategoryFormValues>) {
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
              {mode === "create" ? "إضافة تصنيف" : "تعديل التصنيف"}
            </DialogTitle>
            <DialogDescription>
              اسم التصنيف بالعربية مطلوب. الإنجليزية اختيارية.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="gallery-cat-name-ar">الاسم (عربي) *</Label>
              <Input
                id="gallery-cat-name-ar"
                value={values.nameAr}
                onChange={(event) => {
                  const nameAr = event.target.value;
                  update({
                    nameAr,
                    slug:
                      mode === "create" && !values.slug
                        ? slugifyGalleryText(nameAr)
                        : values.slug,
                  });
                }}
                disabled={!canEdit || isSubmitting}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gallery-cat-desc-ar">الوصف (عربي)</Label>
              <Textarea
                id="gallery-cat-desc-ar"
                value={values.descriptionAr}
                onChange={(event) =>
                  update({ descriptionAr: event.target.value })
                }
                disabled={!canEdit || isSubmitting}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gallery-cat-slug">Slug</Label>
              <Input
                id="gallery-cat-slug"
                dir="ltr"
                value={values.slug}
                onChange={(event) => update({ slug: event.target.value })}
                disabled={!canEdit || isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gallery-cat-name-en">Name (English)</Label>
              <Input
                id="gallery-cat-name-en"
                dir="ltr"
                value={values.nameEn}
                onChange={(event) => update({ nameEn: event.target.value })}
                disabled={!canEdit || isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gallery-cat-desc-en">Description (English)</Label>
              <Textarea
                id="gallery-cat-desc-en"
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
                <Label htmlFor="gallery-cat-sort">الترتيب</Label>
                <Input
                  id="gallery-cat-sort"
                  type="number"
                  min={0}
                  value={values.sortOrder}
                  onChange={(event) =>
                    update({ sortOrder: Number(event.target.value) || 0 })
                  }
                  disabled={!canEdit || isSubmitting}
                />
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <Label htmlFor="gallery-cat-active">نشط</Label>
                <Switch
                  id="gallery-cat-active"
                  checked={values.isActive}
                  onCheckedChange={(isActive) => update({ isActive })}
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
