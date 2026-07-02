"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AdminFormSkeleton,
  AdminLoadErrorState,
} from "@/components/admin/admin-content-states";
import { useAdminCanEdit } from "@/components/admin/admin-permissions-provider";
import { MediaAssetSelect } from "@/components/admin/media-asset-select";
import { PageHeader } from "@/components/admin/page-header";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  DAY_OF_WEEK_OPTIONS,
  type ApiErrorResponse,
  type ApiResponse,
  type DayOfWeek,
  type RestaurantSettingsData,
} from "@/lib/admin/types";
import { adminGet } from "@/lib/admin/fetch-client";
import { invalidateDashboardAndSettingsCache } from "@/lib/admin/invalidate-cache";
import { useAdminFetchState } from "@/lib/admin/use-admin-fetch-state";
import { cn } from "@/lib/utils";

type OpeningHourForm = {
  dayOfWeek: DayOfWeek;
  opensAt: string;
  closesAt: string;
  isClosed: boolean;
  notes: string;
};

type SocialLinkForm = {
  platform: string;
  url: string;
  label: string;
  isActive: boolean;
};

type SettingsFormState = {
  restaurantNameAr: string;
  restaurantNameEn: string;
  isEnglishEnabled: boolean;
  logoAssetId: string | null;
  coverImageAssetId: string | null;
  phone: string;
  whatsappNumber: string;
  email: string;
  reservationPhone: string;
  publicContactEnabled: boolean;
  whatsappEnabled: boolean;
  openingHours: OpeningHourForm[];
  socialMediaLinks: SocialLinkForm[];
  googleMapsLabel: string;
  googleMapsUrl: string;
  latitude: string;
  longitude: string;
  googleMapsActive: boolean;
  managerNameAr: string;
  managerTitleAr: string;
  managerBioAr: string;
  managerNameEn: string;
  managerTitleEn: string;
  managerBioEn: string;
  managerImageAssetId: string | null;
  managerVisible: boolean;
  primaryColor: string;
  secondaryColor: string;
  buttonColor: string;
  headerColor: string;
  footerColor: string;
};

function createDefaultOpeningHours(): OpeningHourForm[] {
  return DAY_OF_WEEK_OPTIONS.map((day) => ({
    dayOfWeek: day.value,
    opensAt: "12:00",
    closesAt: "23:00",
    isClosed: false,
    notes: "",
  }));
}

function mapSettingsToForm(data: RestaurantSettingsData): SettingsFormState {
  const openingHoursByDay = new Map(
    data.openingHours.map((hour) => [hour.dayOfWeek, hour]),
  );

  return {
    restaurantNameAr: data.restaurantName.ar ?? "",
    restaurantNameEn: data.restaurantName.en ?? "",
    isEnglishEnabled: data.isEnglishEnabled,
    logoAssetId: data.logo?.id ?? null,
    coverImageAssetId: data.coverImage?.id ?? null,
    phone: data.contactInformation?.phone ?? "",
    whatsappNumber: data.contactInformation?.whatsappNumber ?? "",
    email: data.contactInformation?.email ?? "",
    reservationPhone: data.contactInformation?.reservationPhone ?? "",
    publicContactEnabled:
      data.contactInformation?.publicContactEnabled ?? true,
    whatsappEnabled: data.contactInformation?.whatsappEnabled ?? true,
    openingHours: DAY_OF_WEEK_OPTIONS.map((day) => {
      const existing = openingHoursByDay.get(day.value);

      return {
        dayOfWeek: day.value,
        opensAt: existing?.opensAt ?? "12:00",
        closesAt: existing?.closesAt ?? "23:00",
        isClosed: existing?.isClosed ?? false,
        notes: existing?.notes ?? "",
      };
    }),
    socialMediaLinks: data.socialMediaLinks.map((link) => ({
      platform: link.platform,
      url: link.url,
      label: link.label ?? "",
      isActive: link.isActive,
    })),
    googleMapsLabel: data.googleMapsLocation?.label ?? "",
    googleMapsUrl: data.googleMapsLocation?.googleMapsUrl ?? "",
    latitude:
      data.googleMapsLocation?.latitude !== null &&
      data.googleMapsLocation?.latitude !== undefined
        ? String(data.googleMapsLocation.latitude)
        : "",
    longitude:
      data.googleMapsLocation?.longitude !== null &&
      data.googleMapsLocation?.longitude !== undefined
        ? String(data.googleMapsLocation.longitude)
        : "",
    googleMapsActive: data.googleMapsLocation?.isActive ?? true,
    managerNameAr: data.managerProfile?.translations.ar?.name ?? "",
    managerTitleAr: data.managerProfile?.translations.ar?.title ?? "",
    managerBioAr: data.managerProfile?.translations.ar?.bio ?? "",
    managerNameEn: data.managerProfile?.translations.en?.name ?? "",
    managerTitleEn: data.managerProfile?.translations.en?.title ?? "",
    managerBioEn: data.managerProfile?.translations.en?.bio ?? "",
    managerImageAssetId: data.managerProfile?.image?.id ?? null,
    managerVisible: data.managerProfile?.isVisible ?? true,
    primaryColor: data.themeColors?.primaryColor ?? "",
    secondaryColor: data.themeColors?.secondaryColor ?? "",
    buttonColor: data.themeColors?.buttonColor ?? "",
    headerColor: data.themeColors?.headerColor ?? "",
    footerColor: data.themeColors?.footerColor ?? "",
  };
}

function mapFormToPayload(form: SettingsFormState) {
  const payload: Record<string, unknown> = {
    restaurantName: {
      ar: form.restaurantNameAr.trim(),
      en: form.restaurantNameEn.trim() || null,
    },
    isEnglishEnabled: form.isEnglishEnabled,
    logoAssetId: form.logoAssetId,
    coverImageAssetId: form.coverImageAssetId,
    contactInformation: {
      phone: form.phone.trim() || null,
      whatsappNumber: form.whatsappNumber.trim() || null,
      email: form.email.trim() || null,
      reservationPhone: form.reservationPhone.trim() || null,
      publicContactEnabled: form.publicContactEnabled,
      whatsappEnabled: form.whatsappEnabled,
    },
    openingHours: form.openingHours.map((hour) => ({
      dayOfWeek: hour.dayOfWeek,
      opensAt: hour.isClosed ? null : hour.opensAt || null,
      closesAt: hour.isClosed ? null : hour.closesAt || null,
      isClosed: hour.isClosed,
      notes: hour.notes.trim() || null,
    })),
    socialMediaLinks: form.socialMediaLinks
      .filter((link) => link.platform.trim() && link.url.trim())
      .map((link, index) => ({
        platform: link.platform.trim(),
        url: link.url.trim(),
        label: link.label.trim() || null,
        isActive: link.isActive,
        sortOrder: index,
      })),
    googleMapsLocation:
      form.googleMapsUrl.trim() ||
      form.googleMapsLabel.trim() ||
      form.latitude.trim() ||
      form.longitude.trim()
        ? {
            label: form.googleMapsLabel.trim() || null,
            googleMapsUrl: form.googleMapsUrl.trim() || null,
            latitude: form.latitude.trim() ? Number(form.latitude) : null,
            longitude: form.longitude.trim() ? Number(form.longitude) : null,
            isActive: form.googleMapsActive,
          }
        : null,
    themeColors: {
      primaryColor: form.primaryColor.trim() || null,
      secondaryColor: form.secondaryColor.trim() || null,
      buttonColor: form.buttonColor.trim() || null,
      headerColor: form.headerColor.trim() || null,
      footerColor: form.footerColor.trim() || null,
    },
  };

  if (
    form.managerNameAr.trim() ||
    form.managerNameEn.trim() ||
    form.managerImageAssetId
  ) {
    payload.managerProfile = {
      imageAssetId: form.managerImageAssetId,
      isVisible: form.managerVisible,
      translations: {
        ar: {
          name: form.managerNameAr.trim() || undefined,
          title: form.managerTitleAr.trim() || null,
          bio: form.managerBioAr.trim() || null,
        },
        en: form.managerNameEn.trim()
          ? {
              name: form.managerNameEn.trim(),
              title: form.managerTitleEn.trim() || null,
              bio: form.managerBioEn.trim() || null,
            }
          : undefined,
      },
    };
  }

  return payload;
}

export function RestaurantSettingsForm() {
  const canEdit = useAdminCanEdit("settings.manage");
  const { isInitialLoading, isRefreshing, beginLoad, endLoad } =
    useAdminFetchState();
  const [form, setForm] = useState<SettingsFormState>(() => ({
    restaurantNameAr: "",
    restaurantNameEn: "",
    isEnglishEnabled: false,
    logoAssetId: null,
    coverImageAssetId: null,
    phone: "",
    whatsappNumber: "",
    email: "",
    reservationPhone: "",
    publicContactEnabled: true,
    whatsappEnabled: true,
    openingHours: createDefaultOpeningHours(),
    socialMediaLinks: [],
    googleMapsLabel: "",
    googleMapsUrl: "",
    latitude: "",
    longitude: "",
    googleMapsActive: true,
    managerNameAr: "",
    managerTitleAr: "",
    managerBioAr: "",
    managerNameEn: "",
    managerTitleEn: "",
    managerBioEn: "",
    managerImageAssetId: null,
    managerVisible: true,
    primaryColor: "",
    secondaryColor: "",
    buttonColor: "",
    headerColor: "",
    footerColor: "",
  }));
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refreshSettings = useCallback(async (force = false) => {
    beginLoad();

    try {
      const data = await adminGet<RestaurantSettingsData>(
        "/api/admin/restaurant-settings",
        {
          ...(force ? { force: true } : {}),
          errorMessage: "تعذر تحميل إعدادات الموقع.",
        },
      );
      setForm(mapSettingsToForm(data));
      setUpdatedAt(data.updatedAt);
      setLoadError(null);
      endLoad(true);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "تعذر تحميل إعدادات الموقع.",
      );
      endLoad(false);
    }
  }, [beginLoad, endLoad]);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialSettings() {
      try {
        const data = await adminGet<RestaurantSettingsData>(
          "/api/admin/restaurant-settings",
          { errorMessage: "تعذر تحميل إعدادات الموقع." },
        );

        if (!cancelled) {
          setForm(mapSettingsToForm(data));
          setUpdatedAt(data.updatedAt);
          setLoadError(null);
          endLoad(true);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "تعذر تحميل إعدادات الموقع.",
          );
          endLoad(false);
        }
      }
    }

    void loadInitialSettings();

    return () => {
      cancelled = true;
    };
  }, [endLoad]);

  const lastUpdatedLabel = useMemo(() => {
    if (!updatedAt) {
      return null;
    }

    return new Intl.DateTimeFormat("ar", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(updatedAt));
  }, [updatedAt]);

  function updateForm<K extends keyof SettingsFormState>(
    key: K,
    value: SettingsFormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateOpeningHour(
    dayOfWeek: DayOfWeek,
    patch: Partial<OpeningHourForm>,
  ) {
    setForm((current) => ({
      ...current,
      openingHours: current.openingHours.map((hour) =>
        hour.dayOfWeek === dayOfWeek ? { ...hour, ...patch } : hour,
      ),
    }));
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

  function updateSocialLink(index: number, patch: Partial<SocialLinkForm>) {
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canEdit) {
      return;
    }

    if (!form.restaurantNameAr.trim()) {
      toast.error("اسم المطعم بالعربية مطلوب.");
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
        body: JSON.stringify(mapFormToPayload(form)),
      });

      if (!response.ok) {
        const errorPayload = (await response.json()) as ApiErrorResponse;
        throw new Error(
          errorPayload.error?.message ?? "تعذر حفظ إعدادات الموقع.",
        );
      }

      const payload =
        (await response.json()) as ApiResponse<RestaurantSettingsData>;

      invalidateDashboardAndSettingsCache();
      setForm(mapSettingsToForm(payload.data));
      setUpdatedAt(payload.data.updatedAt);
      toast.success("تم حفظ إعدادات الموقع بنجاح.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "تعذر حفظ إعدادات الموقع.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PageHeader
        title="إعدادات الموقع"
        description="إدارة بيانات المطعم، التواصل، ساعات العمل، الموقع، ومدير المطعم."
        actions={
          <>
            {lastUpdatedLabel ? (
              <Badge variant="outline">آخر تحديث: {lastUpdatedLabel}</Badge>
            ) : null}
            {canEdit ? (
              <Button type="submit" disabled={isSaving || isInitialLoading}>
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    جار الحفظ...
                  </>
                ) : (
                  "حفظ التغييرات"
                )}
              </Button>
            ) : (
              <Badge variant="secondary">عرض فقط</Badge>
            )}
          </>
        }
      />

      {!canEdit ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            لديك صلاحية القراءة فقط. التعديل متاح للمسؤولين الذين يملكون
            صلاحية إعدادات الموقع.
          </CardContent>
        </Card>
      ) : null}

      {isInitialLoading ? (
        <AdminFormSkeleton sections={3} />
      ) : loadError && updatedAt === null ? (
        <AdminLoadErrorState
          message={loadError}
          onRetry={() => void refreshSettings(true)}
        />
      ) : (
        <div
          className={cn(
            "space-y-6",
            isRefreshing && "opacity-80 transition-opacity",
          )}
        >
          <Tabs defaultValue="general" className="gap-6">
        <TabsList className="h-auto w-full flex-wrap justify-start">
          <TabsTrigger value="general">عام</TabsTrigger>
          <TabsTrigger value="contact">التواصل</TabsTrigger>
          <TabsTrigger value="hours">ساعات العمل</TabsTrigger>
          <TabsTrigger value="social">التواصل الاجتماعي</TabsTrigger>
          <TabsTrigger value="location">الموقع</TabsTrigger>
          <TabsTrigger value="manager">مدير المطعم</TabsTrigger>
          <TabsTrigger value="theme">الألوان</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>المعلومات العامة</CardTitle>
              <CardDescription>
                اسم المطعم واللغات والصور الأساسية للموقع.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="restaurantNameAr">اسم المطعم (عربي) *</Label>
                  <Input
                    id="restaurantNameAr"
                    value={form.restaurantNameAr}
                    onChange={(event) =>
                      updateForm("restaurantNameAr", event.target.value)
                    }
                    disabled={!canEdit}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="restaurantNameEn">اسم المطعم (English)</Label>
                  <Input
                    id="restaurantNameEn"
                    dir="ltr"
                    value={form.restaurantNameEn}
                    onChange={(event) =>
                      updateForm("restaurantNameEn", event.target.value)
                    }
                    disabled={!canEdit}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                <div className="space-y-1">
                  <Label htmlFor="isEnglishEnabled">تفعيل الموقع الإنجليزي</Label>
                  <p className="text-muted-foreground text-sm">
                    عند التفعيل يصبح `/en` متاحاً للزوار.
                  </p>
                </div>
                <Switch
                  id="isEnglishEnabled"
                  checked={form.isEnglishEnabled}
                  onCheckedChange={(checked) =>
                    updateForm("isEnglishEnabled", checked)
                  }
                  disabled={!canEdit}
                />
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>الشعار</Label>
                  <MediaAssetSelect
                    value={form.logoAssetId}
                    onChange={(value) => updateForm("logoAssetId", value)}
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label>صورة الغلاف</Label>
                  <MediaAssetSelect
                    value={form.coverImageAssetId}
                    onChange={(value) =>
                      updateForm("coverImageAssetId", value)
                    }
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>معلومات التواصل</CardTitle>
              <CardDescription>
                أرقام الهاتف والبريد الإلكتروني وإعدادات واتساب.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">الهاتف</Label>
                  <Input
                    id="phone"
                    dir="ltr"
                    value={form.phone}
                    onChange={(event) => updateForm("phone", event.target.value)}
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reservationPhone">هاتف الحجز</Label>
                  <Input
                    id="reservationPhone"
                    dir="ltr"
                    value={form.reservationPhone}
                    onChange={(event) =>
                      updateForm("reservationPhone", event.target.value)
                    }
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber">واتساب</Label>
                  <Input
                    id="whatsappNumber"
                    dir="ltr"
                    value={form.whatsappNumber}
                    onChange={(event) =>
                      updateForm("whatsappNumber", event.target.value)
                    }
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    dir="ltr"
                    value={form.email}
                    onChange={(event) => updateForm("email", event.target.value)}
                    disabled={!canEdit}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                  <Label htmlFor="publicContactEnabled">إظهار التواصل للجمهور</Label>
                  <Switch
                    id="publicContactEnabled"
                    checked={form.publicContactEnabled}
                    onCheckedChange={(checked) =>
                      updateForm("publicContactEnabled", checked)
                    }
                    disabled={!canEdit}
                  />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                  <Label htmlFor="whatsappEnabled">تفعيل واتساب</Label>
                  <Switch
                    id="whatsappEnabled"
                    checked={form.whatsappEnabled}
                    onCheckedChange={(checked) =>
                      updateForm("whatsappEnabled", checked)
                    }
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle>ساعات العمل</CardTitle>
              <CardDescription>
                حدّد أوقات الفتح والإغلاق لكل يوم من أيام الأسبوع.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.openingHours.map((hour) => {
                const dayLabel =
                  DAY_OF_WEEK_OPTIONS.find(
                    (option) => option.value === hour.dayOfWeek,
                  )?.label ?? hour.dayOfWeek;

                return (
                  <div
                    key={hour.dayOfWeek}
                    className="grid gap-4 rounded-lg border p-4 md:grid-cols-[120px_1fr]"
                  >
                    <div className="flex items-start justify-between gap-3 md:flex-col md:justify-start">
                      <p className="font-medium">{dayLabel}</p>
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor={`closed-${hour.dayOfWeek}`}
                          className="text-xs"
                        >
                          مغلق
                        </Label>
                        <Switch
                          id={`closed-${hour.dayOfWeek}`}
                          checked={hour.isClosed}
                          onCheckedChange={(checked) =>
                            updateOpeningHour(hour.dayOfWeek, {
                              isClosed: checked,
                            })
                          }
                          disabled={!canEdit}
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label>يفتح</Label>
                        <Input
                          type="time"
                          dir="ltr"
                          value={hour.opensAt}
                          onChange={(event) =>
                            updateOpeningHour(hour.dayOfWeek, {
                              opensAt: event.target.value,
                            })
                          }
                          disabled={!canEdit || hour.isClosed}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>يغلق</Label>
                        <Input
                          type="time"
                          dir="ltr"
                          value={hour.closesAt}
                          onChange={(event) =>
                            updateOpeningHour(hour.dayOfWeek, {
                              closesAt: event.target.value,
                            })
                          }
                          disabled={!canEdit || hour.isClosed}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-1">
                        <Label>ملاحظات</Label>
                        <Input
                          value={hour.notes}
                          onChange={(event) =>
                            updateOpeningHour(hour.dayOfWeek, {
                              notes: event.target.value,
                            })
                          }
                          disabled={!canEdit}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>روابط التواصل الاجتماعي</CardTitle>
                <CardDescription>
                  أضف روابط المنصات التي تريد عرضها في الموقع.
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
        </TabsContent>

        <TabsContent value="location">
          <Card>
            <CardHeader>
              <CardTitle>الموقع على الخريطة</CardTitle>
              <CardDescription>
                رابط Google Maps والإحداثيات لعرض موقع المطعم.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="googleMapsLabel">تسمية الموقع</Label>
                <Input
                  id="googleMapsLabel"
                  value={form.googleMapsLabel}
                  onChange={(event) =>
                    updateForm("googleMapsLabel", event.target.value)
                  }
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="googleMapsUrl">رابط Google Maps</Label>
                <Input
                  id="googleMapsUrl"
                  dir="ltr"
                  value={form.googleMapsUrl}
                  onChange={(event) =>
                    updateForm("googleMapsUrl", event.target.value)
                  }
                  disabled={!canEdit}
                  placeholder="https://maps.google.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="latitude">خط العرض</Label>
                <Input
                  id="latitude"
                  dir="ltr"
                  value={form.latitude}
                  onChange={(event) =>
                    updateForm("latitude", event.target.value)
                  }
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">خط الطول</Label>
                <Input
                  id="longitude"
                  dir="ltr"
                  value={form.longitude}
                  onChange={(event) =>
                    updateForm("longitude", event.target.value)
                  }
                  disabled={!canEdit}
                />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg border p-4 md:col-span-2">
                <Label htmlFor="googleMapsActive">إظهار الموقع للجمهور</Label>
                <Switch
                  id="googleMapsActive"
                  checked={form.googleMapsActive}
                  onCheckedChange={(checked) =>
                    updateForm("googleMapsActive", checked)
                  }
                  disabled={!canEdit}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manager">
          <Card>
            <CardHeader>
              <CardTitle>مدير المطعم</CardTitle>
              <CardDescription>
                بيانات مدير المطعم وصورته للعرض في الموقع.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                <Label htmlFor="managerVisible">إظهار مدير المطعم</Label>
                <Switch
                  id="managerVisible"
                  checked={form.managerVisible}
                  onCheckedChange={(checked) =>
                    updateForm("managerVisible", checked)
                  }
                  disabled={!canEdit}
                />
              </div>

              <div className="space-y-2">
                <Label>صورة المدير</Label>
                <MediaAssetSelect
                  value={form.managerImageAssetId}
                  onChange={(value) => updateForm("managerImageAssetId", value)}
                  disabled={!canEdit}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="managerNameAr">الاسم (عربي)</Label>
                  <Input
                    id="managerNameAr"
                    value={form.managerNameAr}
                    onChange={(event) =>
                      updateForm("managerNameAr", event.target.value)
                    }
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="managerNameEn">الاسم (English)</Label>
                  <Input
                    id="managerNameEn"
                    dir="ltr"
                    value={form.managerNameEn}
                    onChange={(event) =>
                      updateForm("managerNameEn", event.target.value)
                    }
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="managerTitleAr">المسمى (عربي)</Label>
                  <Input
                    id="managerTitleAr"
                    value={form.managerTitleAr}
                    onChange={(event) =>
                      updateForm("managerTitleAr", event.target.value)
                    }
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="managerTitleEn">المسمى (English)</Label>
                  <Input
                    id="managerTitleEn"
                    dir="ltr"
                    value={form.managerTitleEn}
                    onChange={(event) =>
                      updateForm("managerTitleEn", event.target.value)
                    }
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="managerBioAr">نبذة (عربي)</Label>
                  <Textarea
                    id="managerBioAr"
                    value={form.managerBioAr}
                    onChange={(event) =>
                      updateForm("managerBioAr", event.target.value)
                    }
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="managerBioEn">نبذة (English)</Label>
                  <Textarea
                    id="managerBioEn"
                    dir="ltr"
                    value={form.managerBioEn}
                    onChange={(event) =>
                      updateForm("managerBioEn", event.target.value)
                    }
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>ألوان المظهر</CardTitle>
              <CardDescription>
                ألوان أساسية للموقع العام. يمكن ضبطها لاحقاً من إدارة المظهر.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {(
                [
                  ["primaryColor", "اللون الأساسي"],
                  ["secondaryColor", "اللون الثانوي"],
                  ["buttonColor", "لون الأزرار"],
                  ["headerColor", "لون الهيدر"],
                  ["footerColor", "لون الفوتر"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>{label}</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id={key}
                      dir="ltr"
                      value={form[key]}
                      onChange={(event) => updateForm(key, event.target.value)}
                      disabled={!canEdit}
                      placeholder="#0f172a"
                    />
                    <input
                      type="color"
                      value={form[key] || "#0f172a"}
                      onChange={(event) => updateForm(key, event.target.value)}
                      disabled={!canEdit}
                      className="size-10 shrink-0 cursor-pointer rounded-md border bg-transparent p-1"
                      aria-label={label}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
          </Tabs>
        </div>
      )}
    </form>
  );
}
