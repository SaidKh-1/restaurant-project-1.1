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
import { SEO_ENTITY_TYPE_OPTIONS } from "@/lib/admin/seo";
import type { SeoEntityType, SeoEntryData } from "@/lib/admin/types";

export type SeoEntryFormValues = {
  pageKey: string;
  entityType: SeoEntityType;
  routePath: string;
  seoTitleAr: string;
  seoDescriptionAr: string;
  keywordsAr: string;
  seoTitleEn: string;
  seoDescriptionEn: string;
  keywordsEn: string;
  canonicalUrl: string;
  noIndex: boolean;
  ogImageAssetId: string | null;
};

type SeoEntryFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  initialValues: SeoEntryFormValues;
  ogImagePreviewUrl: string | null;
  canEdit: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SeoEntryFormValues) => void;
};

export function createDefaultSeoFormValues(): SeoEntryFormValues {
  return {
    pageKey: "",
    entityType: "PAGE",
    routePath: "",
    seoTitleAr: "",
    seoDescriptionAr: "",
    keywordsAr: "",
    seoTitleEn: "",
    seoDescriptionEn: "",
    keywordsEn: "",
    canonicalUrl: "",
    noIndex: false,
    ogImageAssetId: null,
  };
}

export function mapSeoEntryToFormValues(entry: SeoEntryData): SeoEntryFormValues {
  const ar = entry.translations.ar;
  const en = entry.translations.en;

  return {
    pageKey: entry.pageKey,
    entityType: entry.entityType,
    routePath: entry.routePath,
    seoTitleAr: ar?.seoTitle ?? "",
    seoDescriptionAr: ar?.seoDescription ?? "",
    keywordsAr: ar?.keywords ?? "",
    seoTitleEn: en?.seoTitle ?? "",
    seoDescriptionEn: en?.seoDescription ?? "",
    keywordsEn: en?.keywords ?? "",
    canonicalUrl: entry.canonicalUrl ?? "",
    noIndex: entry.noIndex,
    ogImageAssetId: entry.ogImageAssetId,
  };
}

function buildArabicTranslation(values: SeoEntryFormValues) {
  return {
    seoTitle: values.seoTitleAr.trim(),
    seoDescription: values.seoDescriptionAr.trim() || null,
    keywords: values.keywordsAr.trim() || null,
  };
}

function buildEnglishTranslation(values: SeoEntryFormValues) {
  return {
    seoTitle: values.seoTitleEn.trim(),
    seoDescription: values.seoDescriptionEn.trim() || null,
    keywords: values.keywordsEn.trim() || null,
  };
}

function hasEnglishContent(values: SeoEntryFormValues) {
  return Boolean(
    values.seoTitleEn.trim() ||
      values.seoDescriptionEn.trim() ||
      values.keywordsEn.trim(),
  );
}

export function buildSeoCreatePayload(values: SeoEntryFormValues) {
  return {
    pageKey: values.pageKey.trim(),
    entityType: values.entityType,
    ...(values.routePath.trim() ? { routePath: values.routePath.trim() } : {}),
    canonicalUrl: values.canonicalUrl.trim() || null,
    noIndex: values.noIndex,
    ogImageAssetId: values.ogImageAssetId,
    translations: {
      ar: buildArabicTranslation(values),
      ...(hasEnglishContent(values)
        ? { en: buildEnglishTranslation(values) }
        : {}),
    },
  };
}

export function buildSeoUpdatePayload(
  values: SeoEntryFormValues,
  entry: SeoEntryData,
) {
  const hadEnglish = Boolean(entry.translations.en);
  const hasEnglish = hasEnglishContent(values);

  return {
    pageKey: values.pageKey.trim(),
    entityType: values.entityType,
    ...(values.routePath.trim() ? { routePath: values.routePath.trim() } : {}),
    canonicalUrl: values.canonicalUrl.trim() || null,
    noIndex: values.noIndex,
    ogImageAssetId: values.ogImageAssetId,
    translations: {
      ar: buildArabicTranslation(values),
      ...(hadEnglish && !hasEnglish
        ? { en: null }
        : hasEnglish
          ? { en: buildEnglishTranslation(values) }
          : {}),
    },
  };
}

export function validateSeoForm(
  values: SeoEntryFormValues,
  mode: "create" | "edit",
) {
  if (mode === "create" && !values.pageKey.trim()) {
    return "مفتاح الصفحة مطلوب.";
  }

  if (!values.seoTitleAr.trim()) {
    return "عنوان SEO بالعربية مطلوب.";
  }

  if (!values.seoDescriptionAr.trim()) {
    return "وصف SEO بالعربية مطلوب.";
  }

  if (values.routePath.trim() && !values.routePath.trim().startsWith("/")) {
    return "مسار الصفحة يجب أن يبدأ بـ /.";
  }

  if (values.canonicalUrl.trim() && !values.canonicalUrl.trim().startsWith("/")) {
    return "الرابط الأساسي يجب أن يبدأ بـ /.";
  }

  return null;
}

export function SeoEntryFormDialog({
  open,
  mode,
  initialValues,
  ogImagePreviewUrl,
  canEdit,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: SeoEntryFormDialogProps) {
  const [values, setValues] = useState(initialValues);

  function update(patch: Partial<SeoEntryFormValues>) {
    setValues((current) => ({ ...current, ...patch }));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "إضافة إدخال SEO"
              : canEdit
                ? "تعديل إدخال SEO"
                : "عرض إدخال SEO"}
          </DialogTitle>
          <DialogDescription>
            أدخل بيانات SEO بالعربية أولاً. الحقول الإنجليزية اختيارية.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="seo-page-key">مفتاح الصفحة</Label>
              <Input
                id="seo-page-key"
                value={values.pageKey}
                onChange={(event) => update({ pageKey: event.target.value })}
                placeholder="مثال: home أو menu"
                disabled={!canEdit || isSubmitting}
                dir="ltr"
                className="text-start"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo-entity-type">نوع الكيان</Label>
              <Select
                value={values.entityType}
                onValueChange={(nextValue) =>
                  update({ entityType: nextValue as SeoEntityType })
                }
                disabled={!canEdit || isSubmitting}
              >
                <SelectTrigger id="seo-entity-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEO_ENTITY_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-route-path">مسار الصفحة (اختياري)</Label>
            <Input
              id="seo-route-path"
              value={values.routePath}
              onChange={(event) => update({ routePath: event.target.value })}
              placeholder="/ar/menu"
              disabled={!canEdit || isSubmitting}
              dir="ltr"
              className="text-start"
            />
            <p className="text-muted-foreground text-xs">
              إذا تُرك فارغاً عند الإنشاء، يُشتق تلقائياً من مفتاح الصفحة.
            </p>
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-sm font-semibold">العربية (مطلوب)</h3>
            <div className="space-y-2">
              <Label htmlFor="seo-title-ar">عنوان SEO</Label>
              <Input
                id="seo-title-ar"
                value={values.seoTitleAr}
                onChange={(event) => update({ seoTitleAr: event.target.value })}
                disabled={!canEdit || isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seo-description-ar">وصف SEO</Label>
              <Textarea
                id="seo-description-ar"
                value={values.seoDescriptionAr}
                onChange={(event) =>
                  update({ seoDescriptionAr: event.target.value })
                }
                rows={3}
                disabled={!canEdit || isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seo-keywords-ar">الكلمات المفتاحية</Label>
              <Input
                id="seo-keywords-ar"
                value={values.keywordsAr}
                onChange={(event) => update({ keywordsAr: event.target.value })}
                placeholder="أسماك طازجة، مأكولات بحرية"
                disabled={!canEdit || isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-4 rounded-lg border border-dashed p-4">
            <h3 className="text-sm font-semibold">English (optional)</h3>
            <div className="space-y-2">
              <Label htmlFor="seo-title-en">SEO Title</Label>
              <Input
                id="seo-title-en"
                value={values.seoTitleEn}
                onChange={(event) => update({ seoTitleEn: event.target.value })}
                disabled={!canEdit || isSubmitting}
                dir="ltr"
                className="text-start"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seo-description-en">SEO Description</Label>
              <Textarea
                id="seo-description-en"
                value={values.seoDescriptionEn}
                onChange={(event) =>
                  update({ seoDescriptionEn: event.target.value })
                }
                rows={3}
                disabled={!canEdit || isSubmitting}
                dir="ltr"
                className="text-start"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seo-keywords-en">Keywords</Label>
              <Input
                id="seo-keywords-en"
                value={values.keywordsEn}
                onChange={(event) => update({ keywordsEn: event.target.value })}
                disabled={!canEdit || isSubmitting}
                dir="ltr"
                className="text-start"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="seo-canonical-url">الرابط الأساسي (Canonical)</Label>
              <Input
                id="seo-canonical-url"
                value={values.canonicalUrl}
                onChange={(event) => update({ canonicalUrl: event.target.value })}
                placeholder="/ar/menu"
                disabled={!canEdit || isSubmitting}
                dir="ltr"
                className="text-start"
              />
            </div>

            <div className="space-y-2">
              <Label>صورة Open Graph</Label>
              <MediaAssetSelect
                value={values.ogImageAssetId}
                onChange={(nextValue) => update({ ogImageAssetId: nextValue })}
                disabled={!canEdit || isSubmitting}
              />
            </div>
          </div>

          {ogImagePreviewUrl ? (
            <div className="overflow-hidden rounded-lg border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ogImagePreviewUrl}
                alt=""
                className="aspect-[1200/630] w-full object-cover"
              />
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-3">
            <div className="space-y-1">
              <Label htmlFor="seo-no-index">منع الفهرسة (noIndex)</Label>
              <p className="text-muted-foreground text-xs">
                عند التفعيل، لن تُفهرس هذه الصفحة في محركات البحث.
              </p>
            </div>
            <Switch
              id="seo-no-index"
              checked={values.noIndex}
              onCheckedChange={(checked) => update({ noIndex: checked })}
              disabled={!canEdit || isSubmitting}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {canEdit ? "إلغاء" : "إغلاق"}
          </Button>
          {canEdit ? (
            <Button
              type="button"
              onClick={() => onSubmit(values)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : mode === "create" ? (
                "إنشاء"
              ) : (
                "حفظ التغييرات"
              )}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
