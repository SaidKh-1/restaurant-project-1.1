"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

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
import { CMS_STATUS_OPTIONS, MENU_UNIT_OPTIONS } from "@/lib/admin/menu";
import type {
  CookingMethodData,
  MenuCategoryData,
  MenuItemData,
} from "@/lib/admin/types";

export type PriceVariantFormValues = {
  id?: string;
  price: string;
  unit: string;
  nameAr: string;
  nameEn: string;
  isActive: boolean;
  sortOrder: number;
};

export type MenuItemFormValues = {
  menuCategoryId: string;
  nameAr: string;
  descriptionAr: string;
  nameEn: string;
  descriptionEn: string;
  imageAssetId: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  isVisible: boolean;
  sortOrder: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  cookingMethodIds: string[];
  priceVariants: PriceVariantFormValues[];
};

type MenuItemFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  initialValues: MenuItemFormValues;
  categories: MenuCategoryData[];
  cookingMethods: CookingMethodData[];
  canEdit: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: MenuItemFormValues) => void;
};

export function createDefaultItemFormValues(
  categoryId = "",
  sortOrder = 0,
): MenuItemFormValues {
  return {
    menuCategoryId: categoryId,
    nameAr: "",
    descriptionAr: "",
    nameEn: "",
    descriptionEn: "",
    imageAssetId: null,
    isAvailable: true,
    isFeatured: false,
    isVisible: true,
    sortOrder,
    status: "DRAFT",
    cookingMethodIds: [],
    priceVariants: [
      {
        price: "",
        unit: "كجم",
        nameAr: "السعر الأساسي",
        nameEn: "",
        isActive: true,
        sortOrder: 0,
      },
    ],
  };
}

export function mapItemToFormValues(item: MenuItemData): MenuItemFormValues {
  return {
    menuCategoryId: item.menuCategoryId,
    nameAr: item.translations.ar?.name ?? "",
    descriptionAr: item.translations.ar?.description ?? "",
    nameEn: item.translations.en?.name ?? "",
    descriptionEn: item.translations.en?.description ?? "",
    imageAssetId: item.image?.id ?? null,
    isAvailable: item.isAvailable,
    isFeatured: item.isFeatured,
    isVisible: item.isVisible,
    sortOrder: item.sortOrder,
    status: item.status,
    cookingMethodIds: item.cookingMethods.map(
      (method) => method.cookingMethodId,
    ),
    priceVariants: item.priceVariants.map((variant) => ({
      id: variant.id,
      price: String(variant.price),
      unit: variant.unitLabel.ar,
      nameAr: variant.translations.ar?.name ?? "",
      nameEn: variant.translations.en?.name ?? "",
      isActive: variant.isActive,
      sortOrder: variant.sortOrder,
    })),
  };
}

export function buildItemPayload(values: MenuItemFormValues) {
  return {
    menuCategoryId: values.menuCategoryId,
    imageAssetId: values.imageAssetId,
    isAvailable: values.isAvailable,
    isFeatured: values.isFeatured,
    isVisible: values.isVisible,
    sortOrder: values.sortOrder,
    status: values.status,
    cookingMethodIds: values.cookingMethodIds,
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
    priceVariants: values.priceVariants.map((variant, index) => ({
      ...(variant.id ? { id: variant.id } : {}),
      price: Number(variant.price),
      unit: variant.unit,
      isActive: variant.isActive,
      sortOrder: variant.sortOrder ?? index,
      translations: {
        ar: { name: variant.nameAr.trim() },
        ...(variant.nameEn.trim()
          ? { en: { name: variant.nameEn.trim() } }
          : {}),
      },
    })),
  };
}

export function validateItemForm(values: MenuItemFormValues) {
  if (!values.menuCategoryId) {
    return "يجب اختيار القسم.";
  }

  if (!values.nameAr.trim()) {
    return "اسم الصنف بالعربية مطلوب.";
  }

  if (!values.descriptionAr.trim()) {
    return "وصف الصنف بالعربية مطلوب.";
  }

  if (values.priceVariants.length === 0) {
    return "يجب إضافة خيار سعر واحد على الأقل.";
  }

  for (const [index, variant] of values.priceVariants.entries()) {
    if (!variant.nameAr.trim()) {
      return `اسم خيار السعر ${index + 1} بالعربية مطلوب.`;
    }

    if (!variant.price || Number(variant.price) <= 0) {
      return `سعر خيار ${index + 1} غير صالح.`;
    }
  }

  return null;
}

export function MenuItemFormDialog({
  open,
  mode,
  initialValues,
  categories,
  cookingMethods,
  canEdit,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: MenuItemFormDialogProps) {
  const [values, setValues] = useState(initialValues);

  function update(patch: Partial<MenuItemFormValues>) {
    setValues((current) => ({ ...current, ...patch }));
  }

  function updateVariant(
    index: number,
    patch: Partial<PriceVariantFormValues>,
  ) {
    setValues((current) => ({
      ...current,
      priceVariants: current.priceVariants.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, ...patch } : variant,
      ),
    }));
  }

  function addVariant() {
    setValues((current) => ({
      ...current,
      priceVariants: [
        ...current.priceVariants,
        {
          price: "",
          unit: "كجم",
          nameAr: "",
          nameEn: "",
          isActive: true,
          sortOrder: current.priceVariants.length,
        },
      ],
    }));
  }

  function removeVariant(index: number) {
    setValues((current) => ({
      ...current,
      priceVariants: current.priceVariants.filter(
        (_, variantIndex) => variantIndex !== index,
      ),
    }));
  }

  function toggleCookingMethod(methodId: string) {
    setValues((current) => ({
      ...current,
      cookingMethodIds: current.cookingMethodIds.includes(methodId)
        ? current.cookingMethodIds.filter((id) => id !== methodId)
        : [...current.cookingMethodIds, methodId],
    }));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(values);
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "إضافة صنف" : "تعديل الصنف"}
            </DialogTitle>
            <DialogDescription>
              الاسم والوصف بالعربية مطلوبان. خيارات الأسعار وطرق الطهي اختيارية.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>القسم *</Label>
              <Select
                value={values.menuCategoryId || "__none__"}
                onValueChange={(value) =>
                  update({
                    menuCategoryId: value === "__none__" ? "" : value,
                  })
                }
                disabled={!canEdit || isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر القسم" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.translations.ar?.name ?? category.slug}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="item-name-ar">الاسم (عربي) *</Label>
                <Input
                  id="item-name-ar"
                  value={values.nameAr}
                  onChange={(event) => update({ nameAr: event.target.value })}
                  disabled={!canEdit || isSubmitting}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-name-en">Name (English)</Label>
                <Input
                  id="item-name-en"
                  dir="ltr"
                  value={values.nameEn}
                  onChange={(event) => update({ nameEn: event.target.value })}
                  disabled={!canEdit || isSubmitting}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="item-desc-ar">الوصف (عربي) *</Label>
                <Textarea
                  id="item-desc-ar"
                  value={values.descriptionAr}
                  onChange={(event) =>
                    update({ descriptionAr: event.target.value })
                  }
                  disabled={!canEdit || isSubmitting}
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-desc-en">Description (English)</Label>
                <Textarea
                  id="item-desc-en"
                  dir="ltr"
                  value={values.descriptionEn}
                  onChange={(event) =>
                    update({ descriptionEn: event.target.value })
                  }
                  disabled={!canEdit || isSubmitting}
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>صورة الصنف</Label>
              <MediaAssetSelect
                value={values.imageAssetId}
                onChange={(imageAssetId) => update({ imageAssetId })}
                disabled={!canEdit || isSubmitting}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                <Label htmlFor="item-available">متاح</Label>
                <Switch
                  id="item-available"
                  checked={values.isAvailable}
                  onCheckedChange={(isAvailable) => update({ isAvailable })}
                  disabled={!canEdit || isSubmitting}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                <Label htmlFor="item-featured">مميز</Label>
                <Switch
                  id="item-featured"
                  checked={values.isFeatured}
                  onCheckedChange={(isFeatured) => update({ isFeatured })}
                  disabled={!canEdit || isSubmitting}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                <Label htmlFor="item-visible">ظاهر</Label>
                <Switch
                  id="item-visible"
                  checked={values.isVisible}
                  onCheckedChange={(isVisible) => update({ isVisible })}
                  disabled={!canEdit || isSubmitting}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="item-sort">الترتيب</Label>
                <Input
                  id="item-sort"
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
                    update({ status: status as MenuItemFormValues["status"] })
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

            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">خيارات الأسعار *</p>
                {canEdit ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addVariant}
                    disabled={isSubmitting}
                  >
                    <Plus className="size-4" />
                    إضافة خيار
                  </Button>
                ) : null}
              </div>

              {values.priceVariants.map((variant, index) => (
                <div
                  key={variant.id ?? `new-${index}`}
                  className="grid gap-3 rounded-lg border p-3"
                >
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <Label>الاسم (عربي)</Label>
                      <Input
                        value={variant.nameAr}
                        onChange={(event) =>
                          updateVariant(index, { nameAr: event.target.value })
                        }
                        disabled={!canEdit || isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>السعر</Label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        dir="ltr"
                        value={variant.price}
                        onChange={(event) =>
                          updateVariant(index, { price: event.target.value })
                        }
                        disabled={!canEdit || isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الوحدة</Label>
                      <Select
                        value={variant.unit}
                        onValueChange={(unit) => updateVariant(index, { unit })}
                        disabled={!canEdit || isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MENU_UNIT_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Name (English)</Label>
                      <Input
                        dir="ltr"
                        value={variant.nameEn}
                        onChange={(event) =>
                          updateVariant(index, { nameEn: event.target.value })
                        }
                        disabled={!canEdit || isSubmitting}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={variant.isActive}
                        onCheckedChange={(isActive) =>
                          updateVariant(index, { isActive })
                        }
                        disabled={!canEdit || isSubmitting}
                      />
                      <span className="text-sm">نشط</span>
                    </div>
                    {canEdit && values.priceVariants.length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVariant(index)}
                      >
                        <Trash2 className="size-4" />
                        حذف
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 rounded-lg border p-4">
              <p className="font-medium">طرق الطهي</p>
              {cookingMethods.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  لا توجد طرق طهي متاحة بعد.
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {cookingMethods.map((method) => (
                    <label
                      key={method.id}
                      className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="size-4"
                        checked={values.cookingMethodIds.includes(method.id)}
                        onChange={() => toggleCookingMethod(method.id)}
                        disabled={!canEdit || isSubmitting}
                      />
                      <span>
                        {method.translations.ar?.name ?? method.id}
                      </span>
                    </label>
                  ))}
                </div>
              )}
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
                  "إضافة الصنف"
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
