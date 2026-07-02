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
import {
  HERO_BUTTON_TYPE_OPTIONS,
  HERO_DEFAULT_PRIMARY,
  HERO_DEFAULT_SECONDARY,
  HERO_STATUS_OPTIONS,
  inferButtonType,
  resolveButtonLink,
  type HeroButtonType,
} from "@/lib/admin/hero-slides";
import type { HeroSlideData } from "@/lib/admin/types";

export type HeroSlideFormValues = {
  imageAssetId: string | null;
  isVisible: boolean;
  sortOrder: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  titleAr: string;
  subtitleAr: string;
  buttonTextAr: string;
  primaryButtonType: HeroButtonType;
  primaryInternalPath: string;
  titleEn: string;
  subtitleEn: string;
  buttonTextEn: string;
  primaryButtonLinkEn: string;
  hasSecondary: boolean;
  secondaryButtonTextAr: string;
  secondaryButtonType: HeroButtonType;
  secondaryInternalPath: string;
  secondaryButtonTextEn: string;
  secondaryButtonLinkEn: string;
};

type ContactSettings = {
  phone: string | null;
  whatsappNumber: string | null;
};

type HeroSlideFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  initialValues: HeroSlideFormValues;
  contactSettings: ContactSettings;
  canEdit: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: HeroSlideFormValues) => void;
};

export function createDefaultHeroSlideFormValues(
  sortOrder = 0,
): HeroSlideFormValues {
  return {
    imageAssetId: null,
    isVisible: true,
    sortOrder,
    status: "DRAFT",
    titleAr: "",
    subtitleAr: "",
    buttonTextAr: HERO_DEFAULT_PRIMARY.buttonText,
    primaryButtonType: HERO_DEFAULT_PRIMARY.buttonType,
    primaryInternalPath: HERO_DEFAULT_PRIMARY.buttonLink,
    titleEn: "",
    subtitleEn: "",
    buttonTextEn: "",
    primaryButtonLinkEn: "",
    hasSecondary: true,
    secondaryButtonTextAr: HERO_DEFAULT_SECONDARY.buttonText,
    secondaryButtonType: HERO_DEFAULT_SECONDARY.buttonType,
    secondaryInternalPath: "",
    secondaryButtonTextEn: "",
    secondaryButtonLinkEn: "",
  };
}

export function mapHeroSlideToFormValues(slide: HeroSlideData): HeroSlideFormValues {
  const ar = slide.translations.ar;
  const en = slide.translations.en;
  const primaryType = inferButtonType(ar?.buttonLink);
  const secondaryType = inferButtonType(ar?.secondaryButtonLink);

  return {
    imageAssetId: slide.imageAssetId,
    isVisible: slide.isVisible,
    sortOrder: slide.sortOrder,
    status: slide.status,
    titleAr: ar?.title ?? "",
    subtitleAr: ar?.subtitle ?? "",
    buttonTextAr: ar?.buttonText ?? HERO_DEFAULT_PRIMARY.buttonText,
    primaryButtonType: primaryType,
    primaryInternalPath:
      primaryType === "internal" ? ar?.buttonLink ?? "/ar/menu" : "/ar/menu",
    titleEn: en?.title ?? "",
    subtitleEn: en?.subtitle ?? "",
    buttonTextEn: en?.buttonText ?? "",
    primaryButtonLinkEn:
      en?.buttonLink && inferButtonType(en.buttonLink) === "internal"
        ? en.buttonLink
        : "",
    hasSecondary: Boolean(ar?.secondaryButtonText),
    secondaryButtonTextAr:
      ar?.secondaryButtonText ?? HERO_DEFAULT_SECONDARY.buttonText,
    secondaryButtonType: secondaryType,
    secondaryInternalPath:
      secondaryType === "internal" ? ar?.secondaryButtonLink ?? "" : "",
    secondaryButtonTextEn: en?.secondaryButtonText ?? "",
    secondaryButtonLinkEn:
      en?.secondaryButtonLink &&
      inferButtonType(en.secondaryButtonLink) === "internal"
        ? en.secondaryButtonLink
        : "",
  };
}

export function buildHeroSlidePayload(
  values: HeroSlideFormValues,
  contactSettings: ContactSettings,
) {
  const primaryButtonLink = resolveButtonLink(values.primaryButtonType, {
    internalPath: values.primaryInternalPath,
    whatsappNumber: contactSettings.whatsappNumber,
    phoneNumber: contactSettings.phone,
  });

  const secondaryButtonLink = values.hasSecondary
    ? resolveButtonLink(values.secondaryButtonType, {
        internalPath: values.secondaryInternalPath,
        whatsappNumber: contactSettings.whatsappNumber,
        phoneNumber: contactSettings.phone,
      })
    : null;

  const payload: Record<string, unknown> = {
    imageAssetId: values.imageAssetId,
    isVisible: values.isVisible,
    sortOrder: values.sortOrder,
    status: values.status,
    translations: {
      ar: {
        title: values.titleAr.trim(),
        subtitle: values.subtitleAr.trim(),
        buttonText: values.buttonTextAr.trim(),
        buttonLink: primaryButtonLink,
        secondaryButtonText: values.hasSecondary
          ? values.secondaryButtonTextAr.trim() || null
          : null,
        secondaryButtonLink: values.hasSecondary ? secondaryButtonLink : null,
      },
    },
  };

  if (values.titleEn.trim()) {
    (payload.translations as Record<string, unknown>).en = {
      title: values.titleEn.trim(),
      subtitle: values.subtitleEn.trim() || null,
      buttonText: values.buttonTextEn.trim() || null,
      buttonLink: values.primaryButtonLinkEn.trim() || null,
      secondaryButtonText: values.hasSecondary
        ? values.secondaryButtonTextEn.trim() || null
        : null,
      secondaryButtonLink: values.hasSecondary
        ? values.secondaryButtonLinkEn.trim() || null
        : null,
    };
  }

  return payload;
}

export function validateHeroSlideForm(values: HeroSlideFormValues) {
  if (!values.imageAssetId) {
    return "يجب اختيار صورة من المكتبة.";
  }

  if (!values.titleAr.trim()) {
    return "العنوان بالعربية مطلوب.";
  }

  if (!values.subtitleAr.trim()) {
    return "العنوان الفرعي بالعربية مطلوب.";
  }

  if (!values.buttonTextAr.trim()) {
    return "نص الزر الأساسي بالعربية مطلوب.";
  }

  if (
    values.primaryButtonType === "internal" &&
    !values.primaryInternalPath.trim()
  ) {
    return "مسار الرابط الداخلي مطلوب.";
  }

  if (values.hasSecondary && !values.secondaryButtonTextAr.trim()) {
    return "نص الزر الثانوي بالعربية مطلوب.";
  }

  if (
    values.hasSecondary &&
    values.secondaryButtonType === "internal" &&
    !values.secondaryInternalPath.trim()
  ) {
    return "مسار الرابط الداخلي للزر الثانوي مطلوب.";
  }

  return null;
}

function ButtonTypeFields({
  label,
  buttonType,
  internalPath,
  onButtonTypeChange,
  onInternalPathChange,
  disabled,
  idPrefix,
}: {
  label: string;
  buttonType: HeroButtonType;
  internalPath: string;
  onButtonTypeChange: (value: HeroButtonType) => void;
  onInternalPathChange: (value: string) => void;
  disabled: boolean;
  idPrefix: string;
}) {
  return (
    <div className="grid gap-3 rounded-lg border p-3">
      <div className="space-y-2">
        <Label>{label}</Label>
        <Select
          value={buttonType}
          onValueChange={(value) =>
            onButtonTypeChange(value as HeroButtonType)
          }
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HERO_BUTTON_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {buttonType === "internal" ? (
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-internal`}>المسار الداخلي</Label>
          <Input
            id={`${idPrefix}-internal`}
            dir="ltr"
            value={internalPath}
            onChange={(event) => onInternalPathChange(event.target.value)}
            disabled={disabled}
            placeholder="/ar/menu"
          />
        </div>
      ) : null}

      {buttonType === "whatsapp" ? (
        <p className="text-muted-foreground text-xs">
          سيتم استخدام رقم واتساب المطعم من إعدادات الموقع تلقائياً.
        </p>
      ) : null}

      {buttonType === "call" ? (
        <p className="text-muted-foreground text-xs">
          سيتم استخدام رقم الهاتف من إعدادات الموقع تلقائياً.
        </p>
      ) : null}

      {buttonType === "reservation" ? (
        <p className="text-muted-foreground text-xs">
          رابط placeholder للحجز — سيتم تفعيل صفحة الحجز لاحقاً.
        </p>
      ) : null}
    </div>
  );
}

export function HeroSlideFormDialog({
  open,
  mode,
  initialValues,
  contactSettings,
  canEdit,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: HeroSlideFormDialogProps) {
  const [values, setValues] = useState(initialValues);

  function updateValues(patch: Partial<HeroSlideFormValues>) {
    setValues((current) => ({ ...current, ...patch }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "إضافة شريحة Hero" : "تعديل شريحة Hero"}
            </DialogTitle>
            <DialogDescription>
              العناوين والأزرار بالعربية مطلوبة. الإنجليزية اختيارية.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>صورة الشريحة *</Label>
              <MediaAssetSelect
                value={values.imageAssetId}
                onChange={(value) => updateValues({ imageAssetId: value })}
                disabled={!canEdit || isSubmitting}
                allowClear={false}
                placeholder="اختر صورة من المكتبة"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="sortOrder">ترتيب العرض</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  min={0}
                  value={values.sortOrder}
                  onChange={(event) =>
                    updateValues({
                      sortOrder: Number(event.target.value) || 0,
                    })
                  }
                  disabled={!canEdit || isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label>الحالة</Label>
                <Select
                  value={values.status}
                  onValueChange={(value) =>
                    updateValues({
                      status: value as HeroSlideFormValues["status"],
                    })
                  }
                  disabled={!canEdit || isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HERO_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end justify-between gap-3 rounded-lg border px-3 py-2">
                <Label htmlFor="isVisible">نشط / ظاهر</Label>
                <Switch
                  id="isVisible"
                  checked={values.isVisible}
                  onCheckedChange={(checked) =>
                    updateValues({ isVisible: checked })
                  }
                  disabled={!canEdit || isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-3 rounded-lg border p-4">
              <p className="font-medium">المحتوى العربي *</p>
              <div className="space-y-2">
                <Label htmlFor="titleAr">العنوان</Label>
                <Input
                  id="titleAr"
                  value={values.titleAr}
                  onChange={(event) =>
                    updateValues({ titleAr: event.target.value })
                  }
                  disabled={!canEdit || isSubmitting}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitleAr">العنوان الفرعي</Label>
                <Textarea
                  id="subtitleAr"
                  value={values.subtitleAr}
                  onChange={(event) =>
                    updateValues({ subtitleAr: event.target.value })
                  }
                  disabled={!canEdit || isSubmitting}
                  rows={2}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buttonTextAr">نص الزر الأساسي</Label>
                <Input
                  id="buttonTextAr"
                  value={values.buttonTextAr}
                  onChange={(event) =>
                    updateValues({ buttonTextAr: event.target.value })
                  }
                  disabled={!canEdit || isSubmitting}
                  required
                />
              </div>
              <ButtonTypeFields
                label="نوع الزر الأساسي"
                buttonType={values.primaryButtonType}
                internalPath={values.primaryInternalPath}
                onButtonTypeChange={(primaryButtonType) =>
                  updateValues({ primaryButtonType })
                }
                onInternalPathChange={(primaryInternalPath) =>
                  updateValues({ primaryInternalPath })
                }
                disabled={!canEdit || isSubmitting}
                idPrefix="primary"
              />

              <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
                <Label htmlFor="hasSecondary">زر ثانوي</Label>
                <Switch
                  id="hasSecondary"
                  checked={values.hasSecondary}
                  onCheckedChange={(hasSecondary) =>
                    updateValues({ hasSecondary })
                  }
                  disabled={!canEdit || isSubmitting}
                />
              </div>

              {values.hasSecondary ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryButtonTextAr">نص الزر الثانوي</Label>
                    <Input
                      id="secondaryButtonTextAr"
                      value={values.secondaryButtonTextAr}
                      onChange={(event) =>
                        updateValues({
                          secondaryButtonTextAr: event.target.value,
                        })
                      }
                      disabled={!canEdit || isSubmitting}
                    />
                  </div>
                  <ButtonTypeFields
                    label="نوع الزر الثانوي"
                    buttonType={values.secondaryButtonType}
                    internalPath={values.secondaryInternalPath}
                    onButtonTypeChange={(secondaryButtonType) =>
                      updateValues({ secondaryButtonType })
                    }
                    onInternalPathChange={(secondaryInternalPath) =>
                      updateValues({ secondaryInternalPath })
                    }
                    disabled={!canEdit || isSubmitting}
                    idPrefix="secondary"
                  />
                </>
              ) : null}
            </div>

            <div className="space-y-3 rounded-lg border border-dashed p-4">
              <p className="font-medium">المحتوى الإنجليزي (اختياري)</p>
              <div className="space-y-2">
                <Label htmlFor="titleEn">Title</Label>
                <Input
                  id="titleEn"
                  dir="ltr"
                  value={values.titleEn}
                  onChange={(event) =>
                    updateValues({ titleEn: event.target.value })
                  }
                  disabled={!canEdit || isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitleEn">Subtitle</Label>
                <Textarea
                  id="subtitleEn"
                  dir="ltr"
                  value={values.subtitleEn}
                  onChange={(event) =>
                    updateValues({ subtitleEn: event.target.value })
                  }
                  disabled={!canEdit || isSubmitting}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buttonTextEn">Primary button text</Label>
                <Input
                  id="buttonTextEn"
                  dir="ltr"
                  value={values.buttonTextEn}
                  onChange={(event) =>
                    updateValues({ buttonTextEn: event.target.value })
                  }
                  disabled={!canEdit || isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryButtonLinkEn">Primary internal path</Label>
                <Input
                  id="primaryButtonLinkEn"
                  dir="ltr"
                  value={values.primaryButtonLinkEn}
                  onChange={(event) =>
                    updateValues({ primaryButtonLinkEn: event.target.value })
                  }
                  disabled={!canEdit || isSubmitting}
                  placeholder="/en/menu"
                />
              </div>
              {values.hasSecondary ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryButtonTextEn">
                      Secondary button text
                    </Label>
                    <Input
                      id="secondaryButtonTextEn"
                      dir="ltr"
                      value={values.secondaryButtonTextEn}
                      onChange={(event) =>
                        updateValues({
                          secondaryButtonTextEn: event.target.value,
                        })
                      }
                      disabled={!canEdit || isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryButtonLinkEn">
                      Secondary internal path
                    </Label>
                    <Input
                      id="secondaryButtonLinkEn"
                      dir="ltr"
                      value={values.secondaryButtonLinkEn}
                      onChange={(event) =>
                        updateValues({
                          secondaryButtonLinkEn: event.target.value,
                        })
                      }
                      disabled={!canEdit || isSubmitting}
                    />
                  </div>
                </>
              ) : null}
            </div>

            {!contactSettings.whatsappNumber &&
            values.primaryButtonType === "whatsapp" ? (
              <p className="text-destructive text-xs">
                لم يتم ضبط رقم واتساب في إعدادات الموقع بعد.
              </p>
            ) : null}
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
                  "إضافة الشريحة"
                ) : (
                  "حفظ التغييرات"
                )}
              </Button>
            </DialogFooter>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  );
}
