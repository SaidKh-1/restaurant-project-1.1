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
import { CMS_STATUS_OPTIONS, slugifyMenuText } from "@/lib/admin/menu";
import type { MenuCategoryData } from "@/lib/admin/types";

export type MenuCategoryFormValues = {
  slug: string;
  nameAr: string;
  descriptionAr: string;
  nameEn: string;
  descriptionEn: string;
  imageAssetId: string | null;
  isVisible: boolean;
  sortOrder: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

type MenuCategoryFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  initialValues: MenuCategoryFormValues;
  canEdit: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: MenuCategoryFormValues) => void;
};

export function createDefaultCategoryFormValues(
  sortOrder = 0,
): MenuCategoryFormValues {
  return {
    slug: "",
    nameAr: "",
    descriptionAr: "",
    nameEn: "",
    descriptionEn: "",
    imageAssetId: null,
    isVisible: true,
    sortOrder,
    status: "DRAFT",
  };
}

export function mapCategoryToFormValues(
  category: MenuCategoryData,
): MenuCategoryFormValues {
  return {
    slug: category.slug,
    nameAr: category.translations.ar?.name ?? "",
    descriptionAr: category.translations.ar?.description ?? "",
    nameEn: category.translations.en?.name ?? "",
    descriptionEn: category.translations.en?.description ?? "",
    imageAssetId: category.image?.id ?? null,
    isVisible: category.isVisible,
    sortOrder: category.sortOrder,
    status: category.status,
  };
}

export function buildCategoryPayload(values: MenuCategoryFormValues) {
  const slug = values.slug.trim() || slugifyMenuText(values.nameAr);

  return {
    slug,
    imageAssetId: values.imageAssetId,
    isVisible: values.isVisible,
    sortOrder: values.sortOrder,
    status: values.status,
    translations: {
      ar: {
        name: values.nameAr.trim(),
        description: values.descriptionAr.trim() || null,
        slug,
      },
      ...(values.nameEn.trim()
        ? {
            en: {
              name: values.nameEn.trim(),
              description: values.descriptionEn.trim() || null,
              slug,
            },
          }
        : {}),
    },
  };
}

export function validateCategoryForm(values: MenuCategoryFormValues) {
  if (!values.nameAr.trim()) {
    return "اسم القسم بالعربية مطلوب.";
  }

  return null;
}

export function MenuCategoryFormDialog({
  open,
  mode,
  initialValues,
  canEdit,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: MenuCategoryFormDialogProps) {
  const [values, setValues] = useState(initialValues);

  function update(patch: Partial<MenuCategoryFormValues>) {
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
              {mode === "create" ? "إضافة قسم" : "تعديل القسم"}
            </DialogTitle>
            <DialogDescription>
              اسم القسم بالعربية مطلوب. الإنجليزية اختيارية.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name-ar">الاسم (عربي) *</Label>
              <Input
                id="cat-name-ar"
                value={values.nameAr}
                onChange={(event) => {
                  const nameAr = event.target.value;
                  update({
                    nameAr,
                    slug:
                      mode === "create" && !values.slug
                        ? slugifyMenuText(nameAr)
                        : values.slug,
                  });
                }}
                disabled={!canEdit || isSubmitting}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-desc-ar">الوصف (عربي)</Label>
              <Textarea
                id="cat-desc-ar"
                value={values.descriptionAr}
                onChange={(event) =>
                  update({ descriptionAr: event.target.value })
                }
                disabled={!canEdit || isSubmitting}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-slug">Slug</Label>
              <Input
                id="cat-slug"
                dir="ltr"
                value={values.slug}
                onChange={(event) => update({ slug: event.target.value })}
                disabled={!canEdit || isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-name-en">Name (English)</Label>
              <Input
                id="cat-name-en"
                dir="ltr"
                value={values.nameEn}
                onChange={(event) => update({ nameEn: event.target.value })}
                disabled={!canEdit || isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-desc-en">Description (English)</Label>
              <Textarea
                id="cat-desc-en"
                dir="ltr"
                value={values.descriptionEn}
                onChange={(event) =>
                  update({ descriptionEn: event.target.value })
                }
                disabled={!canEdit || isSubmitting}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>صورة القسم</Label>
              <MediaAssetSelect
                value={values.imageAssetId}
                onChange={(imageAssetId) => update({ imageAssetId })}
                disabled={!canEdit || isSubmitting}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cat-sort">الترتيب</Label>
                <Input
                  id="cat-sort"
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
                      status: status as MenuCategoryFormValues["status"],
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
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <Label htmlFor="cat-visible">ظاهر</Label>
              <Switch
                id="cat-visible"
                checked={values.isVisible}
                onCheckedChange={(isVisible) => update({ isVisible })}
                disabled={!canEdit || isSubmitting}
              />
            </div>
          </div>

          {canEdit ? (
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    جار الحفظ...
                  </>
                ) : mode === "create" ? (
                  "إضافة القسم"
                ) : (
                  "حفظ"
                )}
              </Button>
            </DialogFooter>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  );
}
