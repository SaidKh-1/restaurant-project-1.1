"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Eye,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  buildHeroSlidePayload,
  createDefaultHeroSlideFormValues,
  HeroSlideFormDialog,
  mapHeroSlideToFormValues,
  validateHeroSlideForm,
  type HeroSlideFormValues,
} from "@/components/admin/hero-slide-form-dialog";
import {
  AdminCardGridSkeleton,
  AdminEmptyState,
  AdminLoadErrorState,
} from "@/components/admin/admin-content-states";
import { useAdminCanEdit } from "@/components/admin/admin-permissions-provider";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { getStatusLabel } from "@/lib/admin/hero-slides";
import { adminGet } from "@/lib/admin/fetch-client";
import {
  ADMIN_API_CACHE,
  invalidateAdminCacheUrls,
} from "@/lib/admin/invalidate-cache";
import {
  patchById,
  removeById,
  upsertById,
} from "@/lib/admin/permissions-client";
import { useAdminFetchState } from "@/lib/admin/use-admin-fetch-state";
import type {
  ApiErrorResponse,
  ApiResponse,
  HeroSlideData,
  RestaurantSettingsSummaryData,
} from "@/lib/admin/types";
import { cn } from "@/lib/utils";

type DialogMode = "preview" | "delete" | null;
type FormMode = "create" | "edit" | null;

export function HeroSlidesManager() {
  const canEdit = useAdminCanEdit("hero.manage");
  const { isInitialLoading, isRefreshing, beginLoad, endLoad } =
    useAdminFetchState();
  const [slides, setSlides] = useState<HeroSlideData[]>([]);
  const [contactSettings, setContactSettings] = useState({
    phone: null as string | null,
    whatsappNumber: null as string | null,
  });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<HeroSlideData | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [formInstanceKey, setFormInstanceKey] = useState(0);
  const [formValues, setFormValues] = useState<HeroSlideFormValues>(
    createDefaultHeroSlideFormValues(),
  );

  async function loadHeroData(force = false) {
    const [slidesData, settingsData] = await Promise.all([
      adminGet<HeroSlideData[]>("/api/admin/hero-slides", {
        force,
        errorMessage: "تعذر تحميل شرائح Hero.",
      }),
      adminGet<RestaurantSettingsSummaryData>(
        "/api/admin/restaurant-settings/summary",
        {
          force,
        },
      ).catch(() => null),
    ]);

    return { slidesData, settingsData };
  }

  const refreshSlides = useCallback(async () => {
    beginLoad();

    try {
      const { slidesData, settingsData } = await loadHeroData(true);
      setSlides(slidesData);
      setLoadError(null);

      if (settingsData) {
        setContactSettings({
          phone: settingsData.contactInformation?.phone ?? null,
          whatsappNumber:
            settingsData.contactInformation?.whatsappNumber ?? null,
        });
      }

      endLoad(true);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "تعذر تحميل شرائح Hero.",
      );
      endLoad(false);
    }
  }, [beginLoad, endLoad]);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      beginLoad();

      try {
        const { slidesData, settingsData } = await loadHeroData();

        if (!cancelled) {
          setSlides(slidesData);
          setLoadError(null);

          if (settingsData) {
            setContactSettings({
              phone: settingsData.contactInformation?.phone ?? null,
              whatsappNumber:
                settingsData.contactInformation?.whatsappNumber ?? null,
            });
          }

          endLoad(true);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "تعذر تحميل شرائح Hero.",
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

  function openCreateForm() {
    setFormValues(createDefaultHeroSlideFormValues(slides.length));
    setFormInstanceKey((current) => current + 1);
    setFormMode("create");
  }

  function openEditForm(slide: HeroSlideData) {
    setSelectedSlide(slide);
    setFormValues(mapHeroSlideToFormValues(slide));
    setFormInstanceKey((current) => current + 1);
    setFormMode("edit");
  }

  function openPreview(slide: HeroSlideData) {
    setSelectedSlide(slide);
    setDialogMode("preview");
  }

  function openDelete(slide: HeroSlideData) {
    setSelectedSlide(slide);
    setDialogMode("delete");
  }

  function closeDialogs() {
    setDialogMode(null);
    setSelectedSlide(null);
  }

  async function handleFormSubmit(values: HeroSlideFormValues) {
    if (!canEdit) {
      return;
    }

    const validationError = validateHeroSlideForm(values);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildHeroSlidePayload(values, contactSettings);
      const isCreate = formMode === "create";
      const response = await fetch(
        isCreate
          ? "/api/admin/hero-slides"
          : `/api/admin/hero-slides/${selectedSlide?.id}`,
        {
          method: isCreate ? "POST" : "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorPayload = (await response.json()) as ApiErrorResponse;
        throw new Error(errorPayload.error?.message ?? "تعذر حفظ الشريحة.");
      }

      const responsePayload = (await response.json()) as ApiResponse<HeroSlideData>;
      toast.success(isCreate ? "تمت إضافة الشريحة." : "تم تحديث الشريحة.");
      invalidateAdminCacheUrls([ADMIN_API_CACHE.hero]);
      setSlides((current) => upsertById(current, responsePayload.data));
      setFormMode(null);
      setSelectedSlide(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "تعذر حفظ الشريحة.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleVisibility(slide: HeroSlideData) {
    if (!canEdit) {
      return;
    }

    const previousSlides = slides;
    const nextValue = !slide.isVisible;
    setSlides((current) =>
      patchById(current, slide.id, { isVisible: nextValue }),
    );

    try {
      const response = await fetch(`/api/admin/hero-slides/${slide.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: nextValue }),
      });

      if (!response.ok) {
        const errorPayload = (await response.json()) as ApiErrorResponse;
        throw new Error(errorPayload.error?.message ?? "تعذر تحديث الحالة.");
      }

      invalidateAdminCacheUrls([ADMIN_API_CACHE.hero]);
    } catch (error) {
      setSlides(previousSlides);
      toast.error(
        error instanceof Error ? error.message : "تعذر تحديث الحالة.",
      );
    }
  }

  async function handleDelete() {
    if (!canEdit || !selectedSlide) {
      return;
    }

    setIsSubmitting(true);
    const deletedSlide = selectedSlide;
    setSlides((current) => removeById(current, deletedSlide.id));
    closeDialogs();

    try {
      const response = await fetch(
        `/api/admin/hero-slides/${deletedSlide.id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!response.ok) {
        const errorPayload = (await response.json()) as ApiErrorResponse;
        throw new Error(errorPayload.error?.message ?? "تعذر حذف الشريحة.");
      }

      toast.success("تم حذف الشريحة.");
      invalidateAdminCacheUrls([ADMIN_API_CACHE.hero]);
    } catch (error) {
      setSlides((current) => upsertById(current, deletedSlide));
      toast.error(
        error instanceof Error ? error.message : "تعذر حذف الشريحة.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hero Slider"
        description="إدارة شرائح الصفحة الرئيسية — صورة، عنوان، وأزرار بالعربية والإنجليزية."
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => void refreshSlides()}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={cn("size-4", isRefreshing && "animate-spin")}
              />
              تحديث
            </Button>
            {canEdit ? (
              <Button type="button" onClick={openCreateForm}>
                <Plus className="size-4" />
                إضافة شريحة
              </Button>
            ) : null}
          </>
        }
      />

      {!canEdit ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            لديك صلاحية القراءة فقط. الإضافة والتعديل متاح للمسؤولين الذين
            يملكون صلاحية Hero Slider.
          </CardContent>
        </Card>
      ) : null}

      {isInitialLoading ? (
        <AdminCardGridSkeleton
          count={4}
          className="lg:grid-cols-2"
          cardClassName="aspect-[16/7] w-full rounded-xl"
        />
      ) : loadError && slides.length === 0 ? (
        <AdminLoadErrorState
          message={loadError}
          onRetry={() => void refreshSlides()}
        />
      ) : slides.length === 0 ? (
        <AdminEmptyState
          title="لا توجد شرائح Hero بعد"
          description={
            canEdit
              ? "أضف أول شريحة مع صورة من المكتبة وعناوين بالعربية."
              : "لم يتم إنشاء أي شرائح بعد."
          }
          action={
            canEdit ? (
              <Button type="button" onClick={openCreateForm}>
                <Plus className="size-4" />
                إضافة شريحة
              </Button>
            ) : null
          }
        />
      ) : (
        <div
          className={cn(
            "grid gap-4 lg:grid-cols-2",
            isRefreshing && "opacity-80 transition-opacity",
          )}
        >
          {slides.map((slide) => (
            <Card key={slide.id} className="overflow-hidden pt-0">
              <button
                type="button"
                className="relative aspect-[16/7] w-full overflow-hidden bg-muted"
                onClick={() => openPreview(slide)}
              >
                {slide.image?.publicUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={slide.image.publicUrl}
                    alt={slide.translations.ar?.title ?? ""}
                    className="size-full object-cover transition-transform hover:scale-105"
                  />
                ) : (
                  <div className="text-muted-foreground flex size-full items-center justify-center text-sm">
                    بدون صورة
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 space-y-1 p-4 text-start text-white">
                  <p className="text-lg font-semibold">
                    {slide.translations.ar?.title ?? "—"}
                  </p>
                  <p className="line-clamp-2 text-sm text-white/85">
                    {slide.translations.ar?.subtitle ?? ""}
                  </p>
                </div>
              </button>

              <CardContent className="space-y-4 pt-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={slide.isVisible ? "default" : "secondary"}>
                      {slide.isVisible ? "نشط" : "غير نشط"}
                    </Badge>
                    <Badge variant="outline">
                      {getStatusLabel(slide.status)}
                    </Badge>
                    <Badge variant="outline">ترتيب {slide.sortOrder}</Badge>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <MoreVertical className="size-4" />
                        <span className="sr-only">إجراءات</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => openPreview(slide)}>
                        <Eye className="size-4" />
                        معاينة
                      </DropdownMenuItem>
                      {canEdit ? (
                        <>
                          <DropdownMenuItem onClick={() => openEditForm(slide)}>
                            <Pencil className="size-4" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => openDelete(slide)}
                          >
                            <Trash2 className="size-4" />
                            حذف
                          </DropdownMenuItem>
                        </>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex flex-wrap gap-2">
                  {slide.translations.ar?.buttonText ? (
                    <Badge variant="secondary">
                      {slide.translations.ar.buttonText}
                    </Badge>
                  ) : null}
                  {slide.translations.ar?.secondaryButtonText ? (
                    <Badge variant="outline">
                      {slide.translations.ar.secondaryButtonText}
                    </Badge>
                  ) : null}
                </div>

                {canEdit ? (
                  <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
                    <span className="text-sm">إظهار الشريحة</span>
                    <Switch
                      checked={slide.isVisible}
                      onCheckedChange={() => void handleToggleVisibility(slide)}
                    />
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <HeroSlideFormDialog
        key={
          formMode === "create"
            ? `create-${formInstanceKey}`
            : `edit-${selectedSlide?.id ?? formInstanceKey}`
        }
        open={formMode !== null}
        mode={formMode === "create" ? "create" : "edit"}
        initialValues={formValues}
        contactSettings={contactSettings}
        canEdit={canEdit}
        isSubmitting={isSubmitting}
        onOpenChange={(open) => {
          if (!open) {
            setFormMode(null);
            setSelectedSlide(null);
          }
        }}
        onSubmit={handleFormSubmit}
      />

      <Dialog
        open={dialogMode === "preview" && selectedSlide !== null}
        onOpenChange={(open) => {
          if (!open) {
            closeDialogs();
          }
        }}
      >
        <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0">
          {selectedSlide ? (
            <>
              <div className="relative aspect-[16/7] w-full bg-muted">
                {selectedSlide.image?.publicUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={selectedSlide.image.publicUrl}
                    alt={selectedSlide.translations.ar?.title ?? ""}
                    className="size-full object-cover"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 space-y-3 p-6 text-white">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">
                      {selectedSlide.translations.ar?.title}
                    </h2>
                    <p className="max-w-2xl text-sm text-white/90">
                      {selectedSlide.translations.ar?.subtitle}
                    </p>
                    {selectedSlide.translations.en?.title ? (
                      <div className="space-y-1 border-t border-white/20 pt-3 text-sm text-white/80">
                        <p dir="ltr">{selectedSlide.translations.en.title}</p>
                        <p dir="ltr">{selectedSlide.translations.en.subtitle}</p>
                      </div>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedSlide.translations.ar?.buttonText ? (
                      <span className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-900">
                        {selectedSlide.translations.ar.buttonText}
                      </span>
                    ) : null}
                    {selectedSlide.translations.ar?.secondaryButtonText ? (
                      <span className="rounded-md border border-white/70 px-4 py-2 text-sm font-medium text-white">
                        {selectedSlide.translations.ar.secondaryButtonText}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="grid gap-3 p-6 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground mb-1">الحالة</p>
                  <p>
                    {getStatusLabel(selectedSlide.status)} ·{" "}
                    {selectedSlide.isVisible ? "نشط" : "غير نشط"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">الترتيب</p>
                  <p>{selectedSlide.sortOrder}</p>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialogMode === "delete" && selectedSlide !== null}
        onOpenChange={(open) => {
          if (!open) {
            closeDialogs();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف شريحة Hero</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف «{selectedSlide?.translations.ar?.title}»؟
              لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialogs}>
              إلغاء
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isSubmitting}
              onClick={() => void handleDelete()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  جار الحذف...
                </>
              ) : (
                "تأكيد الحذف"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
