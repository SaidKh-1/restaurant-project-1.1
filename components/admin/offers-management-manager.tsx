"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Eye,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  RefreshCw,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  buildOfferPayload,
  createDefaultOfferFormValues,
  mapOfferToFormValues,
  OfferFormDialog,
  validateOfferForm,
  type OfferFormValues,
} from "@/components/admin/offer-form-dialog";
import {
  OfferPreviewCard,
  offerDataToPreviewContent,
} from "@/components/admin/offer-preview-card";
import {
  AdminEmptyState,
  AdminLoadErrorState,
  AdminOfferCardSkeleton,
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
import {
  formatOfferDateRange,
  getOfferPreviewCtaText,
  getOfferStatusLabel,
} from "@/lib/admin/offers";
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
  OfferData,
} from "@/lib/admin/types";
import { cn } from "@/lib/utils";

type DialogMode = "preview" | "delete" | null;
type FormMode = "create" | "edit" | null;

export function OffersManagementManager() {
  const canEdit = useAdminCanEdit("offers.manage");
  const { isInitialLoading, isRefreshing, beginLoad, endLoad } =
    useAdminFetchState();
  const [offers, setOffers] = useState<OfferData[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<OfferData | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [formInstanceKey, setFormInstanceKey] = useState(0);
  const [formValues, setFormValues] = useState<OfferFormValues>(
    createDefaultOfferFormValues(),
  );

  const refreshOffers = useCallback(async () => {
    beginLoad();

    try {
      const data = await adminGet<OfferData[]>("/api/admin/offers", {
        force: true,
        errorMessage: "تعذر تحميل العروض.",
      });
      setOffers(data);
      setLoadError(null);
      endLoad(true);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "تعذر تحميل العروض.",
      );
      endLoad(false);
    }
  }, [beginLoad, endLoad]);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      beginLoad();

      try {
        const data = await adminGet<OfferData[]>("/api/admin/offers", {
          errorMessage: "تعذر تحميل العروض.",
        });

        if (!cancelled) {
          setOffers(data);
          setLoadError(null);
          endLoad(true);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "تعذر تحميل العروض.",
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
    setFormValues(createDefaultOfferFormValues(offers.length));
    setFormInstanceKey((current) => current + 1);
    setFormMode("create");
    setSelectedOffer(null);
  }

  function openEditForm(offer: OfferData) {
    setSelectedOffer(offer);
    setFormValues(mapOfferToFormValues(offer));
    setFormInstanceKey((current) => current + 1);
    setFormMode("edit");
  }

  function openPreview(offer: OfferData) {
    setSelectedOffer(offer);
    setDialogMode("preview");
  }

  function openDelete(offer: OfferData) {
    setSelectedOffer(offer);
    setDialogMode("delete");
  }

  function closeDialogs() {
    setDialogMode(null);
    setSelectedOffer(null);
  }

  async function handleFormSubmit(values: OfferFormValues) {
    if (!canEdit) {
      return;
    }

    const validationError = validateOfferForm(values);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const isCreate = formMode === "create";
      const response = await fetch(
        isCreate
          ? "/api/admin/offers"
          : `/api/admin/offers/${selectedOffer?.id}`,
        {
          method: isCreate ? "POST" : "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildOfferPayload(values)),
        },
      );

      if (!response.ok) {
        const errorPayload = (await response.json()) as ApiErrorResponse;
        throw new Error(errorPayload.error?.message ?? "تعذر حفظ العرض.");
      }

      const payload = (await response.json()) as ApiResponse<OfferData>;
      toast.success(isCreate ? "تمت إضافة العرض." : "تم تحديث العرض.");
      invalidateAdminCacheUrls([
        ADMIN_API_CACHE.offers,
        ADMIN_API_CACHE.dashboard,
      ]);
      setOffers((current) => upsertById(current, payload.data));
      setFormMode(null);
      setSelectedOffer(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "تعذر حفظ العرض.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!canEdit || !selectedOffer) {
      return;
    }

    setIsSubmitting(true);
    const deletedOffer = selectedOffer;
    setOffers((current) => removeById(current, deletedOffer.id));
    closeDialogs();

    try {
      const response = await fetch(`/api/admin/offers/${deletedOffer.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorPayload = (await response.json()) as ApiErrorResponse;
        throw new Error(errorPayload.error?.message ?? "تعذر حذف العرض.");
      }

      toast.success("تم حذف العرض.");
      invalidateAdminCacheUrls([
        ADMIN_API_CACHE.offers,
        ADMIN_API_CACHE.dashboard,
      ]);
    } catch (error) {
      setOffers((current) => upsertById(current, deletedOffer));
      toast.error(error instanceof Error ? error.message : "تعذر حذف العرض.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggle(
    offer: OfferData,
    field: "isActive" | "isFeatured",
  ) {
    if (!canEdit) {
      return;
    }

    const previousOffers = offers;
    const nextValue = !offer[field];
    setOffers((current) => patchById(current, offer.id, { [field]: nextValue }));

    try {
      const response = await fetch(`/api/admin/offers/${offer.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: nextValue }),
      });

      if (!response.ok) {
        const errorPayload = (await response.json()) as ApiErrorResponse;
        throw new Error(errorPayload.error?.message ?? "تعذر التحديث.");
      }

      invalidateAdminCacheUrls([
        ADMIN_API_CACHE.offers,
        ADMIN_API_CACHE.dashboard,
      ]);
    } catch (error) {
      setOffers(previousOffers);
      toast.error(error instanceof Error ? error.message : "تعذر التحديث.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة العروض"
        description="إنشاء وتعديل العروض والخصومات مع معاينة البطاقة."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => void refreshOffers()}
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
                إضافة عرض
              </Button>
            ) : null}
          </div>
        }
      />

      {!canEdit ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            لديك صلاحية القراءة فقط. التعديل متاح للمسؤولين الذين يملكون
            صلاحية إدارة العروض.
          </CardContent>
        </Card>
      ) : null}

      {isInitialLoading ? (
        <AdminOfferCardSkeleton />
      ) : loadError && offers.length === 0 ? (
        <AdminLoadErrorState
          message={loadError}
          onRetry={() => void refreshOffers()}
        />
      ) : offers.length === 0 ? (
        <AdminEmptyState
          title="لا توجد عروض بعد"
          description={
            canEdit
              ? "أضف أول عرض مع عنوان ووصف بالعربية وصورة من المكتبة."
              : "لم يتم إنشاء أي عروض بعد."
          }
          action={
            canEdit ? (
              <Button type="button" onClick={openCreateForm}>
                <Plus className="size-4" />
                إضافة عرض
              </Button>
            ) : null
          }
        />
      ) : (
        <div
          className={cn(
            "grid gap-4 lg:grid-cols-2 xl:grid-cols-3",
            isRefreshing && "opacity-80 transition-opacity",
          )}
        >
          {offers.map((offer) => {
            const ar = offer.translations.ar;
            const ctaText = getOfferPreviewCtaText(
              ar?.discountText ?? "",
              ar?.discountText ?? "",
            );

            return (
              <Card key={offer.id} className="overflow-hidden pt-0">
                <button
                  type="button"
                  className="relative aspect-[16/9] w-full overflow-hidden bg-muted"
                  onClick={() => openPreview(offer)}
                >
                  {offer.image?.publicUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={offer.image.publicUrl}
                      alt={ar?.title ?? ""}
                      className="size-full object-cover transition-transform hover:scale-105"
                    />
                  ) : (
                    <div className="text-muted-foreground flex size-full items-center justify-center text-sm">
                      بدون صورة
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  {ar?.discountText ? (
                    <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                      {ar.discountText}
                    </Badge>
                  ) : null}
                  {offer.isFeatured ? (
                    <Badge
                      variant="secondary"
                      className="absolute top-3 left-3 gap-1 bg-white/90 text-foreground"
                    >
                      <Star className="size-3 fill-current" />
                      مميز
                    </Badge>
                  ) : null}
                  <div className="absolute inset-x-0 bottom-0 space-y-1 p-4 text-start text-white">
                    <p className="line-clamp-1 text-lg font-semibold">
                      {ar?.title ?? "—"}
                    </p>
                    <p className="line-clamp-2 text-sm text-white/85">
                      {ar?.description ?? ""}
                    </p>
                  </div>
                </button>

                <CardContent className="space-y-4 pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={offer.isActive ? "default" : "secondary"}>
                        {offer.isActive ? "نشط" : "غير نشط"}
                      </Badge>
                      <Badge variant="outline">
                        {getOfferStatusLabel(offer.status)}
                      </Badge>
                      <Badge variant="outline">ترتيب {offer.sortOrder}</Badge>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <MoreVertical className="size-4" />
                          <span className="sr-only">إجراءات</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => openPreview(offer)}>
                          <Eye className="size-4" />
                          معاينة
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditForm(offer)}>
                          <Pencil className="size-4" />
                          {canEdit ? "تعديل" : "عرض"}
                        </DropdownMenuItem>
                        {canEdit ? (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              disabled={offer.homepageSectionCount > 0}
                              onClick={() => openDelete(offer)}
                            >
                              <Trash2 className="size-4" />
                              {offer.homepageSectionCount > 0
                                ? "محذوف (مستخدم في الصفحة الرئيسية)"
                                : "حذف"}
                            </DropdownMenuItem>
                          </>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <p className="text-muted-foreground text-sm">
                    {formatOfferDateRange(offer.startsAt, offer.endsAt)}
                  </p>

                  {ar?.ctaUrl ? (
                    <Badge variant="secondary">{ctaText}</Badge>
                  ) : null}

                  {canEdit ? (
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
                        <span className="text-sm">نشط</span>
                        <Switch
                          checked={offer.isActive}
                          onCheckedChange={() =>
                            void handleToggle(offer, "isActive")
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
                        <span className="text-sm">مميز</span>
                        <Switch
                          checked={offer.isFeatured}
                          onCheckedChange={() =>
                            void handleToggle(offer, "isFeatured")
                          }
                        />
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <OfferFormDialog
        key={
          formMode === "create"
            ? `offer-create-${formInstanceKey}`
            : `offer-edit-${selectedOffer?.id ?? formInstanceKey}`
        }
        open={formMode !== null}
        mode={formMode === "create" ? "create" : "edit"}
        initialValues={formValues}
        imagePreviewUrl={selectedOffer?.image?.publicUrl ?? null}
        canEdit={canEdit}
        isSubmitting={isSubmitting}
        onOpenChange={(open) => {
          if (!open) {
            setFormMode(null);
            setSelectedOffer(null);
          }
        }}
        onSubmit={handleFormSubmit}
      />

      <Dialog
        open={dialogMode === "preview" && selectedOffer !== null}
        onOpenChange={(open) => {
          if (!open) {
            closeDialogs();
          }
        }}
      >
        <DialogContent className="max-w-lg gap-0 overflow-hidden p-0">
          {selectedOffer ? (
            <OfferPreviewCard
              content={offerDataToPreviewContent(selectedOffer)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialogMode === "delete" && selectedOffer !== null}
        onOpenChange={(open) => {
          if (!open) {
            closeDialogs();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            هل تريد حذف العرض «{selectedOffer?.translations.ar?.title}»؟ لا
            يمكن التراجع عن هذا الإجراء.
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={closeDialogs}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleDelete()}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                "حذف"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
