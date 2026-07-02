"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Loader2, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";

import {
  AdminLoadErrorState,
  AdminTableSkeleton,
} from "@/components/admin/admin-content-states";
import { useAdminCanEdit } from "@/components/admin/admin-permissions-provider";
import { MediaAssetSelect } from "@/components/admin/media-asset-select";
import { PageHeader } from "@/components/admin/page-header";
import { ThemePreviewPanel } from "@/components/admin/theme-preview-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { THEME_PRESETS } from "@/lib/admin/theme-presets";
import { adminGet } from "@/lib/admin/fetch-client";
import {
  ADMIN_API_CACHE,
  invalidateAdminCacheUrls,
} from "@/lib/admin/invalidate-cache";
import { useAdminFetchState } from "@/lib/admin/use-admin-fetch-state";
import type {
  ApiErrorResponse,
  ApiResponse,
  ThemeSettingsData,
} from "@/lib/admin/types";
import { cn } from "@/lib/utils";

type ThemeFormState = {
  isActive: boolean;
  colors: ThemeSettingsData["colors"];
  coverImageAssetId: string | null;
  seasonalGreetingAr: string;
  seasonalGreetingEn: string;
  previewPresetKey: string | null;
};

function mapThemeToForm(theme: ThemeSettingsData): ThemeFormState {
  return {
    isActive: theme.isActive,
    colors: { ...theme.colors },
    coverImageAssetId: theme.coverImage?.id ?? null,
    seasonalGreetingAr: theme.seasonalGreeting.ar ?? "",
    seasonalGreetingEn: theme.seasonalGreeting.en ?? "",
    previewPresetKey: theme.activePresetKey,
  };
}

function buildPreviewTheme(
  form: ThemeFormState,
  theme: ThemeSettingsData,
): ThemeSettingsData {
  return {
    ...theme,
    isActive: form.isActive,
    colors: form.colors,
    coverImage:
      form.coverImageAssetId && theme.coverImage?.id === form.coverImageAssetId
        ? theme.coverImage
        : theme.coverImage,
    seasonalGreeting: {
      ar: form.seasonalGreetingAr.trim() || null,
      en: form.seasonalGreetingEn.trim() || null,
    },
  };
}

const COLOR_FIELDS = [
  { key: "primaryColor", label: "اللون الأساسي" },
  { key: "secondaryColor", label: "اللون الثانوي" },
  { key: "buttonColor", label: "لون الأزرار" },
  { key: "headerColor", label: "لون الرأس" },
  { key: "footerColor", label: "لون التذييل" },
  { key: "backgroundColor", label: "لون الخلفية" },
  { key: "textColor", label: "لون النص" },
] as const;

export function ThemeBuilderManager() {
  const canEdit = useAdminCanEdit("theme.manage");
  const { isInitialLoading, isRefreshing, beginLoad, endLoad } =
    useAdminFetchState();
  const [theme, setTheme] = useState<ThemeSettingsData | null>(null);
  const [form, setForm] = useState<ThemeFormState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refreshTheme = useCallback(async () => {
    beginLoad();

    try {
      const data = await adminGet<ThemeSettingsData>("/api/admin/theme", {
        force: true,
        errorMessage: "تعذر تحميل إعدادات المظهر.",
      });
      setTheme(data);
      setForm(mapThemeToForm(data));
      setLoadError(null);
      endLoad(true);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "تعذر تحميل إعدادات المظهر.",
      );
      endLoad(false);
    }
  }, [beginLoad, endLoad]);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      beginLoad();

      try {
        const data = await adminGet<ThemeSettingsData>("/api/admin/theme", {
          errorMessage: "تعذر تحميل إعدادات المظهر.",
        });

        if (!cancelled) {
          setTheme(data);
          setForm(mapThemeToForm(data));
          setLoadError(null);
          endLoad(true);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "تعذر تحميل إعدادات المظهر.",
          );
          endLoad(false);
        }
      }
    }

    void loadInitialData();

    return () => {
      cancelled = true;
    };
  }, [beginLoad, endLoad]);

  const previewTheme = useMemo(() => {
    if (!theme || !form) {
      return null;
    }

    return buildPreviewTheme(form, theme);
  }, [form, theme]);

  function updateColor(
    key: keyof ThemeSettingsData["colors"],
    value: string,
  ) {
    setForm((current) =>
      current
        ? {
            ...current,
            colors: {
              ...current.colors,
              [key]: value,
            },
            previewPresetKey: null,
          }
        : current,
    );
  }

  function previewPreset(presetKey: string) {
    const preset = THEME_PRESETS.find((item) => item.key === presetKey);

    if (!preset || !form) {
      return;
    }

    setForm({
      ...form,
      previewPresetKey: presetKey,
      colors: { ...preset.colors },
      seasonalGreetingAr:
        preset.seasonalGreeting?.ar ?? form.seasonalGreetingAr,
      seasonalGreetingEn:
        preset.seasonalGreeting?.en ?? form.seasonalGreetingEn,
    });
  }

  async function saveTheme(body: Record<string, unknown>, successMessage: string) {
    if (!canEdit) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/theme", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorPayload = (await response.json()) as ApiErrorResponse;
        throw new Error(
          errorPayload.error?.message ?? "تعذر حفظ إعدادات المظهر.",
        );
      }

      const payload = (await response.json()) as ApiResponse<ThemeSettingsData>;
      setTheme(payload.data);
      setForm(mapThemeToForm(payload.data));
      invalidateAdminCacheUrls([
        ADMIN_API_CACHE.theme,
        ADMIN_API_CACHE.settings,
        ADMIN_API_CACHE.settingsSummary,
      ]);
      toast.success(successMessage);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "تعذر حفظ إعدادات المظهر.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveCustom() {
    if (!form) {
      return;
    }

    await saveTheme(
      {
        isActive: form.isActive,
        colors: form.colors,
        coverImageAssetId: form.coverImageAssetId,
        seasonalGreeting: {
          ar: form.seasonalGreetingAr.trim() || null,
          en: form.seasonalGreetingEn.trim() || null,
        },
      },
      "تم حفظ المظهر المخصص.",
    );
  }

  async function handleActivatePreset(presetKey: string) {
    await saveTheme(
      {
        presetKey,
        isActive: true,
        coverImageAssetId: form?.coverImageAssetId ?? null,
      },
      "تم تفعيل المظهر بنجاح.",
    );
  }

  if (!form || !theme || !previewTheme) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="إدارة المظهر"
          description="اختر مظهراً جاهزاً أو خصص ألوان الموقع ومعاينتها قبل التفعيل."
        />
        {isInitialLoading ? (
          <AdminTableSkeleton />
        ) : (
          <AdminLoadErrorState
            message={loadError ?? "تعذر تحميل إعدادات المظهر."}
            onRetry={() => void refreshTheme()}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة المظهر"
        description="اختر مظهراً جاهزاً أو خصص ألوان الموقع ومعاينتها قبل التفعيل."
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={() => void refreshTheme()}
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
            لديك صلاحية القراءة فقط. تعديل المظهر وتفعيله متاحان للمسؤولين
            الذين يملكون صلاحية إدارة المظهر.
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>المظهر النشط</CardTitle>
              <CardDescription>
                {theme.activePresetKey && theme.activePresetKey !== "custom"
                  ? `المظهر الحالي: ${THEME_PRESETS.find((preset) => preset.key === theme.activePresetKey)?.label ?? theme.activePresetKey}`
                  : "مظهر مخصص حالياً"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              <Badge variant={theme.isActive ? "default" : "secondary"}>
                {theme.isActive ? "مفعّل" : "غير مفعّل"}
              </Badge>
              {canEdit ? (
                <div className="flex items-center gap-2">
                  <Label htmlFor="theme-active">تفعيل المظهر</Label>
                  <Switch
                    id="theme-active"
                    checked={form.isActive}
                    disabled={isSubmitting}
                    onCheckedChange={(checked) =>
                      setForm((current) =>
                        current ? { ...current, isActive: checked } : current,
                      )
                    }
                  />
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>السمات الجاهزة</CardTitle>
              <CardDescription>
                اختر سمة للمعاينة، ثم فعّلها لتطبيقها على الموقع.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {THEME_PRESETS.map((preset) => {
                const isActive = theme.activePresetKey === preset.key;
                const isPreviewing = form.previewPresetKey === preset.key;

                return (
                  <div
                    key={preset.key}
                    className={cn(
                      "rounded-xl border p-4 transition-colors",
                      isPreviewing && "border-primary bg-primary/5",
                    )}
                  >
                    <div className="mb-3 flex gap-1">
                      {Object.values(preset.colors)
                        .slice(0, 5)
                        .map((color, index) => (
                          <span
                            key={`${preset.key}-${index}`}
                            className="size-6 rounded-full border"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{preset.label}</p>
                        {isActive ? (
                          <Badge variant="secondary">نشط</Badge>
                        ) : null}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {preset.description}
                      </p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => previewPreset(preset.key)}
                      >
                        معاينة
                      </Button>
                      {canEdit ? (
                        <Button
                          type="button"
                          size="sm"
                          disabled={isSubmitting}
                          onClick={() => void handleActivatePreset(preset.key)}
                        >
                          {isActive ? (
                            <Check className="size-4" />
                          ) : null}
                          تفعيل
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>تخصيص الألوان</CardTitle>
              <CardDescription>
                عدّل الألوان يدوياً. يتم حفظ الخلفية والنص ضمن الألوان
                الثانوية والأساسية في قاعدة البيانات الحالية.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {COLOR_FIELDS.map((field) => (
                <ColorField
                  key={field.key}
                  id={field.key}
                  label={field.label}
                  value={form.colors[field.key] ?? "#000000"}
                  disabled={!canEdit || isSubmitting}
                  onChange={(value) => updateColor(field.key, value)}
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>صورة الغلاف / Hero</CardTitle>
              <CardDescription>
                اختياري. تُستخدم عند توفرها في بيانات المظهر الحالية.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MediaAssetSelect
                value={form.coverImageAssetId}
                disabled={!canEdit || isSubmitting}
                onChange={(value) =>
                  setForm((current) =>
                    current
                      ? { ...current, coverImageAssetId: value }
                      : current,
                  )
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>التحية الموسمية</CardTitle>
              <CardDescription>
                نص اختياري يظهر في المعاينة ويُحفظ في الوصف المختصر للمطعم.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="seasonal-greeting-ar">العربية</Label>
                <Input
                  id="seasonal-greeting-ar"
                  value={form.seasonalGreetingAr}
                  disabled={!canEdit || isSubmitting}
                  onChange={(event) =>
                    setForm((current) =>
                      current
                        ? {
                            ...current,
                            seasonalGreetingAr: event.target.value,
                          }
                        : current,
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seasonal-greeting-en">English</Label>
                <Input
                  id="seasonal-greeting-en"
                  dir="ltr"
                  value={form.seasonalGreetingEn}
                  disabled={!canEdit || isSubmitting}
                  onChange={(event) =>
                    setForm((current) =>
                      current
                        ? {
                            ...current,
                            seasonalGreetingEn: event.target.value,
                          }
                        : current,
                    )
                  }
                />
              </div>
            </CardContent>
          </Card>

          {canEdit ? (
            <div className="flex justify-end">
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={() => void handleSaveCustom()}
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                حفظ المظهر المخصص
              </Button>
            </div>
          ) : null}
        </div>

        <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <Card>
            <CardHeader>
              <CardTitle>معاينة المظهر</CardTitle>
              <CardDescription>
                معاينة فورية قبل التفعيل على الموقع العام.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThemePreviewPanel theme={previewTheme} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ColorField({
  id,
  label,
  value,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="color"
          value={normalizeHexColor(value)}
          disabled={disabled}
          className="h-10 w-14 shrink-0 cursor-pointer p-1"
          onChange={(event) => onChange(event.target.value)}
        />
        <Input
          dir="ltr"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  );
}

function normalizeHexColor(value: string) {
  if (/^#[0-9a-fA-F]{6}$/.test(value)) {
    return value;
  }

  return "#000000";
}
