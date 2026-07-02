"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AdminFormSkeleton,
  AdminLoadErrorState,
} from "@/components/admin/admin-content-states";
import { useAdminCanEdit } from "@/components/admin/admin-permissions-provider";
import { MediaAssetSelect } from "@/components/admin/media-asset-select";
import { PageHeader } from "@/components/admin/page-header";
import { ManagerProfileSection } from "@/components/public/manager/manager-profile-section";
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { adminGet } from "@/lib/admin/fetch-client";
import {
  ADMIN_API_CACHE,
  invalidateAdminCacheUrls,
} from "@/lib/admin/invalidate-cache";
import {
  buildManagerProfileSettingsPayload,
  createDefaultManagerProfileForm,
  mapSettingsToManagerForm,
  validateManagerProfileForm,
  type ManagerProfileFormState,
  type ManagerSocialLinkForm,
} from "@/lib/admin/manager-profile";
import { useAdminFetchState } from "@/lib/admin/use-admin-fetch-state";
import type {
  ApiErrorResponse,
  ApiResponse,
  RestaurantSettingsData,
} from "@/lib/admin/types";
import type {
  PublicManagerProfile,
  PublicSocialLink,
} from "@/lib/api/public-site-shell";

function buildPreviewProfile(
  form: ManagerProfileFormState,
  imageUrl: string | null,
): PublicManagerProfile {
  return {
    isVisible: form.isVisible,
    image: imageUrl
      ? {
          id: "preview",
          publicUrl: imageUrl,
          mimeType: "image/jpeg",
          width: null,
          height: null,
          altText: {
            ar: form.nameAr.trim() || null,
            en: form.nameEn.trim() || null,
          },
        }
      : null,
    translations: {
      ar: form.nameAr.trim()
        ? {
            name: form.nameAr.trim(),
            title: form.titleAr.trim() || null,
            bio: form.bioAr.trim() || null,
          }
        : null,
      en: form.nameEn.trim()
        ? {
            name: form.nameEn.trim(),
            title: form.titleEn.trim() || null,
            bio: form.bioEn.trim() || null,
          }
        : null,
    },
  };
}

function buildPreviewContactLinks(form: ManagerProfileFormState) {
  const whatsappNumber = form.whatsappNumber.trim();
  const whatsappEnabled = form.whatsappEnabled && Boolean(whatsappNumber);
  const digits = whatsappNumber.replace(/\D/g, "");

  return {
    phone: form.phone.trim() || null,
    email: form.email.trim() || null,
    whatsappHref:
      whatsappEnabled && digits ? `https://wa.me/${digits}` : null,
    whatsappNumber: whatsappEnabled ? whatsappNumber : null,
    socialLinks: form.socialMediaLinks
      .filter((link) => link.isActive && link.platform.trim() && link.url.trim())
      .map(
        (link, index): PublicSocialLink => ({
          id: `preview-${index}`,
          platform: link.platform.trim(),
          url: link.url.trim(),
          label: link.label.trim() || null,
          sortOrder: index,
        }),
      ),
  };
}

export function ManagerProfileManager() {
  const canEdit = useAdminCanEdit("manager_profile.manage");
  const { isInitialLoading, isRefreshing, beginLoad, endLoad } =
    useAdminFetchState();
  const [form, setForm] = useState<ManagerProfileFormState>(
    createDefaultManagerProfileForm,
  );
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    ReturnType<typeof validateManagerProfileForm>
  >({});

  const refreshSettings = useCallback(async (force = false) => {
    beginLoad();

    try {
      const data = await adminGet<RestaurantSettingsData>(
        "/api/admin/restaurant-settings",
        {
          ...(force ? { force: true } : {}),
          errorMessage: "تعذر تحميل بيانات مدير المطعم.",
        },
      );
      setForm(mapSettingsToManagerForm(data));
      setPreviewImageUrl(data.managerProfile?.image?.publicUrl ?? null);
      setUpdatedAt(data.updatedAt);
      setLoadError(null);
      endLoad(true);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "تعذر تحميل بيانات مدير المطعم.",
      );
      endLoad(false);
    }
  }, [beginLoad, endLoad]);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      beginLoad();

      try {
        const data = await adminGet<RestaurantSettingsData>(
          "/api/admin/restaurant-settings",
          { errorMessage: "تعذر تحميل بيانات مدير المطعم." },
        );

        if (!cancelled) {
          setForm(mapSettingsToManagerForm(data));
          setPreviewImageUrl(data.managerProfile?.image?.publicUrl ?? null);
          setUpdatedAt(data.updatedAt);
          setLoadError(null);
          endLoad(true);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "تعذر تحميل بيانات مدير المطعم.",
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

  const lastUpdatedLabel = useMemo(() => {
    if (!updatedAt) {
      return null;
    }

    return new Intl.DateTimeFormat("ar", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(updatedAt));
  }, [updatedAt]);

  const previewProfile = useMemo(
    () => buildPreviewProfile(form, previewImageUrl),
    [form, previewImageUrl],
  );

  const previewContactLinks = useMemo(
    () => buildPreviewContactLinks(form),
    [form],
  );

  function updateForm<K extends keyof ManagerProfileFormState>(
    key: K,
    value: ManagerProfileFormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key as string]: undefined }));
  }

  function addSocialLink() {
    setForm((current) => ({
      ...current,
      socialMediaLinks: [
        ...current.socialMediaLinks,
        { platform: "", url: "", label: "", isActive: true },
      ],
    }));
  }

  function updateSocialLink(index: number, patch: Partial<ManagerSocialLinkForm>) {
    setForm((current) => ({
      ...current,
      socialMediaLinks: current.socialMediaLinks.map((link, linkIndex) =>
        linkIndex === index ? { ...link, ...patch } : link,
      ),
    }));
  }

  function removeSocialLink(index: number) {
    setForm((current) => ({
      ...current,
      socialMediaLinks: current.socialMediaLinks.filter(
        (_, linkIndex) => linkIndex !== index,
      ),
    }));
  }

  async function handleImageAssetChange(assetId: string | null) {
    updateForm("imageAssetId", assetId);

    if (!assetId) {
      setPreviewImageUrl(null);
      return;
    }

    try {
      const assets = await adminGet<
        { id: string; publicUrl: string }[]
      >("/api/admin/media");
      const selected = assets.find((asset) => asset.id === assetId);
      setPreviewImageUrl(selected?.publicUrl ?? previewImageUrl);
    } catch {
      // Keep previous preview URL if media lookup fails.
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canEdit) {
      return;
    }

    const errors = validateManagerProfileForm(form);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error(Object.values(errors)[0]);
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/restaurant-settings", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildManagerProfileSettingsPayload(form)),
      });

      if (!response.ok) {
        const payload = (await response.json()) as ApiErrorResponse;
        throw new Error(payload.error.message);
      }

      const payload = (await response.json()) as ApiResponse<RestaurantSettingsData>;
      setForm(mapSettingsToManagerForm(payload.data));
      setPreviewImageUrl(payload.data.managerProfile?.image?.publicUrl ?? null);
      setUpdatedAt(payload.data.updatedAt);
      invalidateAdminCacheUrls([
        ADMIN_API_CACHE.settings,
        ADMIN_API_CACHE.settingsSummary,
        ADMIN_API_CACHE.dashboard,
      ]);
      toast.success("تم حفظ بيانات مدير المطعم.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "تعذر حفظ بيانات مدير المطعم.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isInitialLoading) {
    return <AdminFormSkeleton sections={4} />;
  }

  if (loadError) {
    return (
      <AdminLoadErrorState
        message={loadError}
        onRetry={() => void refreshSettings(true)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="مدير المطعم"
        description="إدارة ملف مدير المطعم وصورته وبيانات التواصل الظاهرة معه في الموقع."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {!canEdit ? (
              <Badge variant="secondary">عرض فقط</Badge>
            ) : null}
            {lastUpdatedLabel ? (
              <span className="text-muted-foreground text-sm">
                آخر تحديث: {lastUpdatedLabel}
              </span>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void refreshSettings(true)}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              تحديث
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>الملف الشخصي</CardTitle>
              <CardDescription>
                الاسم والمسمى والنبذة بالعربية مطلوبة. الإنجليزية اختيارية.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                <div className="space-y-1">
                  <Label htmlFor="managerVisible">إظهار مدير المطعم</Label>
                  <p className="text-muted-foreground text-sm">
                    عند الإخفاء لن يظهر الملف في أقسام الموقع العامة.
                  </p>
                </div>
                <Switch
                  id="managerVisible"
                  checked={form.isVisible}
                  onCheckedChange={(checked) => updateForm("isVisible", checked)}
                  disabled={!canEdit}
                />
              </div>

              <div className="space-y-2">
                <Label>صورة المدير</Label>
                <MediaAssetSelect
                  value={form.imageAssetId}
                  onChange={(value) => void handleImageAssetChange(value)}
                  disabled={!canEdit}
                />
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="managerNameAr">الاسم (عربي) *</Label>
                  <Input
                    id="managerNameAr"
                    value={form.nameAr}
                    onChange={(event) => updateForm("nameAr", event.target.value)}
                    disabled={!canEdit}
                    aria-invalid={Boolean(fieldErrors.nameAr)}
                  />
                  {fieldErrors.nameAr ? (
                    <p className="text-sm text-red-600">{fieldErrors.nameAr}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="managerNameEn">الاسم (English)</Label>
                  <Input
                    id="managerNameEn"
                    dir="ltr"
                    value={form.nameEn}
                    onChange={(event) => updateForm("nameEn", event.target.value)}
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="managerTitleAr">المسمى (عربي) *</Label>
                  <Input
                    id="managerTitleAr"
                    value={form.titleAr}
                    onChange={(event) =>
                      updateForm("titleAr", event.target.value)
                    }
                    disabled={!canEdit}
                    aria-invalid={Boolean(fieldErrors.titleAr)}
                  />
                  {fieldErrors.titleAr ? (
                    <p className="text-sm text-red-600">{fieldErrors.titleAr}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="managerTitleEn">المسمى (English)</Label>
                  <Input
                    id="managerTitleEn"
                    dir="ltr"
                    value={form.titleEn}
                    onChange={(event) =>
                      updateForm("titleEn", event.target.value)
                    }
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="managerBioAr">نبذة (عربي) *</Label>
                  <Textarea
                    id="managerBioAr"
                    rows={5}
                    value={form.bioAr}
                    onChange={(event) => updateForm("bioAr", event.target.value)}
                    disabled={!canEdit}
                    aria-invalid={Boolean(fieldErrors.bioAr)}
                  />
                  {fieldErrors.bioAr ? (
                    <p className="text-sm text-red-600">{fieldErrors.bioAr}</p>
                  ) : null}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="managerBioEn">نبذة (English)</Label>
                  <Textarea
                    id="managerBioEn"
                    dir="ltr"
                    rows={5}
                    value={form.bioEn}
                    onChange={(event) => updateForm("bioEn", event.target.value)}
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>بيانات التواصل (اختياري)</CardTitle>
              <CardDescription>
                تظهر مع ملف المدير في الموقع العام عند توفرها.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="managerPhone">الهاتف</Label>
                <Input
                  id="managerPhone"
                  dir="ltr"
                  value={form.phone}
                  onChange={(event) => updateForm("phone", event.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="managerWhatsapp">واتساب</Label>
                <Input
                  id="managerWhatsapp"
                  dir="ltr"
                  value={form.whatsappNumber}
                  onChange={(event) =>
                    updateForm("whatsappNumber", event.target.value)
                  }
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="managerEmail">البريد الإلكتروني</Label>
                <Input
                  id="managerEmail"
                  dir="ltr"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateForm("email", event.target.value)}
                  disabled={!canEdit}
                  aria-invalid={Boolean(fieldErrors.email)}
                />
                {fieldErrors.email ? (
                  <p className="text-sm text-red-600">{fieldErrors.email}</p>
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg border p-4 md:col-span-2">
                <Label htmlFor="managerWhatsappEnabled">تفعيل واتساب</Label>
                <Switch
                  id="managerWhatsappEnabled"
                  checked={form.whatsappEnabled}
                  onCheckedChange={(checked) =>
                    updateForm("whatsappEnabled", checked)
                  }
                  disabled={!canEdit}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>روابط التواصل الاجتماعي (اختياري)</CardTitle>
                <CardDescription>
                  روابط الحسابات التي قد تظهر بجانب ملف المدير.
                </CardDescription>
              </div>
              {canEdit ? (
                <Button type="button" variant="outline" onClick={addSocialLink}>
                  <Plus className="size-4" />
                  إضافة رابط
                </Button>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-4">
              {fieldErrors.socialLinks ? (
                <p className="text-sm text-red-600">{fieldErrors.socialLinks}</p>
              ) : null}

              {form.socialMediaLinks.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  لا توجد روابط مضافة بعد.
                </p>
              ) : null}

              {form.socialMediaLinks.map((link, index) => (
                <div
                  key={`${link.platform}-${index}`}
                  className="grid gap-4 rounded-lg border p-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>المنصة</Label>
                      <Input
                        value={link.platform}
                        onChange={(event) =>
                          updateSocialLink(index, {
                            platform: event.target.value,
                          })
                        }
                        disabled={!canEdit}
                        placeholder="Instagram"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الرابط</Label>
                      <Input
                        dir="ltr"
                        value={link.url}
                        onChange={(event) =>
                          updateSocialLink(index, { url: event.target.value })
                        }
                        disabled={!canEdit}
                        placeholder="https://"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>التسمية</Label>
                      <Input
                        value={link.label}
                        onChange={(event) =>
                          updateSocialLink(index, { label: event.target.value })
                        }
                        disabled={!canEdit}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-4 rounded-lg border px-4">
                      <Label>نشط</Label>
                      <Switch
                        checked={link.isActive}
                        onCheckedChange={(checked) =>
                          updateSocialLink(index, { isActive: checked })
                        }
                        disabled={!canEdit}
                      />
                    </div>
                  </div>

                  {canEdit ? (
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSocialLink(index)}
                      >
                        <Trash2 className="size-4" />
                        حذف
                      </Button>
                    </div>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>

          {canEdit ? (
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                حفظ التغييرات
              </Button>
            </div>
          ) : null}
        </form>

        <Card className="h-fit xl:sticky xl:top-6">
          <CardHeader>
            <CardTitle>معاينة الموقع</CardTitle>
            <CardDescription>
              معاينة تقريبية لكيفية ظهور ملف المدير في الصفحات العامة.
            </CardDescription>
          </CardHeader>
          <CardContent className="rounded-xl border bg-[var(--public-secondary)]/10 p-4">
            <ManagerProfileSection
              locale="ar"
              profile={previewProfile}
              contactLinks={previewContactLinks}
              showHiddenPlaceholder
              className="px-0"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
