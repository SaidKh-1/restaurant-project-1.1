"use client";

import { useCallback, useEffect, useState } from "react";
import { MoreVertical, Pencil, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import {
  AdminEmptyState,
  AdminLoadErrorState,
  AdminTableSkeleton,
} from "@/components/admin/admin-content-states";
import { useAdminCanEdit } from "@/components/admin/admin-permissions-provider";
import { PageHeader } from "@/components/admin/page-header";
import {
  buildSeoCreatePayload,
  buildSeoUpdatePayload,
  createDefaultSeoFormValues,
  mapSeoEntryToFormValues,
  SeoEntryFormDialog,
  validateSeoForm,
  type SeoEntryFormValues,
} from "@/components/admin/seo-entry-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminGet } from "@/lib/admin/fetch-client";
import {
  ADMIN_API_CACHE,
  invalidateAdminCacheUrls,
} from "@/lib/admin/invalidate-cache";
import { upsertById } from "@/lib/admin/permissions-client";
import {
  formatSeoDate,
  getSeoDisplayDescription,
  getSeoDisplayTitle,
  getSeoEntityTypeLabel,
  getSeoIndexLabel,
  getSeoIndexVariant,
} from "@/lib/admin/seo";
import { useAdminFetchState } from "@/lib/admin/use-admin-fetch-state";
import type {
  ApiErrorResponse,
  ApiResponse,
  SeoEntryData,
} from "@/lib/admin/types";
import { cn } from "@/lib/utils";

type FormMode = "create" | "edit" | null;

export function SeoManagementManager() {
  const canEdit = useAdminCanEdit("seo.manage");
  const { isInitialLoading, isRefreshing, beginLoad, endLoad } =
    useAdminFetchState();
  const [entries, setEntries] = useState<SeoEntryData[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<SeoEntryData | null>(null);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [formInstanceKey, setFormInstanceKey] = useState(0);
  const [formValues, setFormValues] = useState<SeoEntryFormValues>(
    createDefaultSeoFormValues(),
  );

  const refreshEntries = useCallback(async () => {
    beginLoad();

    try {
      const data = await adminGet<SeoEntryData[]>("/api/admin/seo", {
        force: true,
        errorMessage: "تعذر تحميل إدخالات SEO.",
      });
      setEntries(data);
      setLoadError(null);
      endLoad(true);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "تعذر تحميل إدخالات SEO.",
      );
      endLoad(false);
    }
  }, [beginLoad, endLoad]);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      beginLoad();

      try {
        const data = await adminGet<SeoEntryData[]>("/api/admin/seo", {
          errorMessage: "تعذر تحميل إدخالات SEO.",
        });

        if (!cancelled) {
          setEntries(data);
          setLoadError(null);
          endLoad(true);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "تعذر تحميل إدخالات SEO.",
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
    setFormValues(createDefaultSeoFormValues());
    setFormInstanceKey((current) => current + 1);
    setFormMode("create");
    setSelectedEntry(null);
  }

  function openEditForm(entry: SeoEntryData) {
    setSelectedEntry(entry);
    setFormValues(mapSeoEntryToFormValues(entry));
    setFormInstanceKey((current) => current + 1);
    setFormMode("edit");
  }

  function closeForm() {
    setFormMode(null);
    setSelectedEntry(null);
  }

  async function handleFormSubmit(values: SeoEntryFormValues) {
    if (!canEdit) {
      return;
    }

    const validationError = validateSeoForm(values, formMode ?? "create");

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const isCreate = formMode === "create";
      const response = await fetch(
        isCreate
          ? "/api/admin/seo"
          : `/api/admin/seo/${selectedEntry?.id}`,
        {
          method: isCreate ? "POST" : "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            isCreate
              ? buildSeoCreatePayload(values)
              : buildSeoUpdatePayload(values, selectedEntry!),
          ),
        },
      );

      if (!response.ok) {
        const errorPayload = (await response.json()) as ApiErrorResponse;
        throw new Error(
          errorPayload.error?.message ?? "تعذر حفظ إدخال SEO.",
        );
      }

      const payload = (await response.json()) as ApiResponse<SeoEntryData>;
      setEntries((current) => upsertById(current, payload.data));
      invalidateAdminCacheUrls([ADMIN_API_CACHE.seo]);
      toast.success(isCreate ? "تم إنشاء إدخال SEO." : "تم تحديث إدخال SEO.");
      closeForm();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "تعذر حفظ إدخال SEO.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const ogImagePreviewUrl =
    formMode === "edit" && selectedEntry?.ogImage?.publicUrl
      ? selectedEntry.ogImage.publicUrl
      : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="إعدادات SEO"
        description="إدارة عناوين SEO والأوصاف والكلمات المفتاحية وصور Open Graph لصفحات الموقع."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => void refreshEntries()}
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
                إضافة إدخال
              </Button>
            ) : null}
          </div>
        }
      />

      {!canEdit ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            لديك صلاحية القراءة فقط. التعديل متاح للمسؤولين الذين يملكون
            صلاحية إدارة SEO.
          </CardContent>
        </Card>
      ) : null}

      <p className="text-muted-foreground text-sm">
        {entries.length} إدخال SEO
      </p>

      {isInitialLoading ? (
        <AdminTableSkeleton />
      ) : loadError && entries.length === 0 ? (
        <AdminLoadErrorState
          message={loadError}
          onRetry={() => void refreshEntries()}
        />
      ) : entries.length === 0 ? (
        <AdminEmptyState
          title="لا توجد إدخالات SEO بعد"
          description={
            canEdit
              ? "أضف أول إدخال SEO بعنوان ووصف بالعربية."
              : "لم يتم إنشاء أي إدخالات SEO بعد."
          }
          action={
            canEdit ? (
              <Button type="button" onClick={openCreateForm}>
                <Plus className="size-4" />
                إضافة إدخال
              </Button>
            ) : null
          }
        />
      ) : (
        <div
          className={cn(
            "space-y-3",
            isRefreshing && "opacity-80 transition-opacity",
          )}
        >
          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base">
                      {getSeoDisplayTitle(entry)}
                    </CardTitle>
                    <Badge variant="outline">
                      {getSeoEntityTypeLabel(entry.entityType)}
                    </Badge>
                    <Badge variant={getSeoIndexVariant(entry.noIndex)}>
                      {getSeoIndexLabel(entry.noIndex)}
                    </Badge>
                    {entry.ogImage ? (
                      <Badge variant="secondary">OG</Badge>
                    ) : null}
                  </div>
                  <CardDescription className="space-y-1">
                    <span className="block line-clamp-2">
                      {getSeoDisplayDescription(entry)}
                    </span>
                    <span className="flex flex-wrap items-center gap-2 text-xs">
                      <span dir="ltr" className="font-mono">
                        {entry.routePath}
                      </span>
                      <span>·</span>
                      <span>{formatSeoDate(entry.updatedAt)}</span>
                    </span>
                  </CardDescription>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <MoreVertical className="size-4" />
                      <span className="sr-only">إجراءات</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => openEditForm(entry)}>
                      <Pencil className="size-4" />
                      {canEdit ? "تعديل" : "عرض"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>

              {entry.translations.ar?.keywords ||
              entry.canonicalUrl ||
              entry.translations.en?.seoTitle ? (
                <CardContent className="flex flex-wrap gap-2 pt-0">
                  {entry.translations.ar?.keywords ? (
                    <Badge variant="secondary">
                      {entry.translations.ar.keywords}
                    </Badge>
                  ) : null}
                  {entry.canonicalUrl ? (
                    <Badge variant="outline" dir="ltr" className="font-mono">
                      {entry.canonicalUrl}
                    </Badge>
                  ) : null}
                  {entry.translations.en?.seoTitle ? (
                    <Badge variant="outline" dir="ltr">
                      EN: {entry.translations.en.seoTitle}
                    </Badge>
                  ) : null}
                </CardContent>
              ) : null}
            </Card>
          ))}
        </div>
      )}

      <SeoEntryFormDialog
        key={formInstanceKey}
        open={formMode !== null}
        mode={formMode === "create" ? "create" : "edit"}
        initialValues={formValues}
        ogImagePreviewUrl={ogImagePreviewUrl}
        canEdit={canEdit}
        isSubmitting={isSubmitting}
        onOpenChange={(open) => {
          if (!open) {
            closeForm();
          }
        }}
        onSubmit={(values) => void handleFormSubmit(values)}
      />
    </div>
  );
}
