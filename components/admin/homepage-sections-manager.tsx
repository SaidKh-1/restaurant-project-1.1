"use client";

import { useCallback, useEffect, useState } from "react";
import {
  GripVertical,
  Loader2,
  Pencil,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import {
  AdminEmptyState,
  AdminLoadErrorState,
  AdminTableSkeleton,
} from "@/components/admin/admin-content-states";
import { useAdminCanEdit } from "@/components/admin/admin-permissions-provider";
import {
  buildHomepageSectionPayload,
  HomepageSectionFormDialog,
} from "@/components/admin/homepage-section-form-dialog";
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
import { Switch } from "@/components/ui/switch";
import { adminGet } from "@/lib/admin/fetch-client";
import {
  buildHomepageSectionReorderPayload,
  getHomepageSectionLabel,
  reorderHomepageSectionList,
} from "@/lib/admin/homepage-sections";
import {
  ADMIN_API_CACHE,
  invalidateAdminCacheUrls,
} from "@/lib/admin/invalidate-cache";
import { upsertById } from "@/lib/admin/permissions-client";
import { useAdminFetchState } from "@/lib/admin/use-admin-fetch-state";
import type {
  ApiErrorResponse,
  ApiResponse,
  HomepageSectionData,
} from "@/lib/admin/types";
import { cn } from "@/lib/utils";

export function HomepageSectionsManager() {
  const canEdit = useAdminCanEdit("homepage.manage");
  const { isInitialLoading, isRefreshing, beginLoad, endLoad } =
    useAdminFetchState();
  const [sections, setSections] = useState<HomepageSectionData[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSection, setSelectedSection] =
    useState<HomepageSectionData | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formInstanceKey, setFormInstanceKey] = useState(0);
  const [draggingSectionId, setDraggingSectionId] = useState<string | null>(
    null,
  );
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(
    null,
  );

  const refreshSections = useCallback(async () => {
    beginLoad();

    try {
      const data = await adminGet<HomepageSectionData[]>(
        "/api/admin/homepage-sections",
        {
          force: true,
          errorMessage: "تعذر تحميل أقسام الصفحة الرئيسية.",
        },
      );
      setSections(data);
      setLoadError(null);
      endLoad(true);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "تعذر تحميل أقسام الصفحة الرئيسية.",
      );
      endLoad(false);
    }
  }, [beginLoad, endLoad]);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      beginLoad();

      try {
        const data = await adminGet<HomepageSectionData[]>(
          "/api/admin/homepage-sections",
          {
            errorMessage: "تعذر تحميل أقسام الصفحة الرئيسية.",
          },
        );

        if (!cancelled) {
          setSections(data);
          setLoadError(null);
          endLoad(true);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "تعذر تحميل أقسام الصفحة الرئيسية.",
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

  async function patchSection(
    section: HomepageSectionData,
    body: Record<string, unknown>,
    successMessage: string,
  ) {
    if (!canEdit) {
      return;
    }

    setIsSubmitting(true);
    const previousSections = sections;
    const previousSelectedSection = selectedSection;

    try {
      const response = await fetch(
        `/api/admin/homepage-sections/${section.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) {
        const errorPayload = (await response.json()) as ApiErrorResponse;
        throw new Error(
          errorPayload.error?.message ?? "تعذر تحديث قسم الصفحة الرئيسية.",
        );
      }

      const payload = (await response.json()) as ApiResponse<HomepageSectionData>;
      setSections((current) => upsertById(current, payload.data));
      setSelectedSection(payload.data);
      invalidateAdminCacheUrls([ADMIN_API_CACHE.homepage]);
      toast.success(successMessage);
    } catch (error) {
      setSections(previousSections);
      setSelectedSection(previousSelectedSection);
      toast.error(
        error instanceof Error
          ? error.message
          : "تعذر تحديث قسم الصفحة الرئيسية.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVisibilityToggle(
    section: HomepageSectionData,
    isVisible: boolean,
  ) {
    await patchSection(
      section,
      { isVisible },
      isVisible ? "تم إظهار القسم." : "تم إخفاء القسم.",
    );
  }

  async function handleFormSubmit(values: Parameters<typeof buildHomepageSectionPayload>[0]) {
    if (!selectedSection) {
      return;
    }

    await patchSection(
      selectedSection,
      buildHomepageSectionPayload(values),
      "تم حفظ إعدادات القسم.",
    );
    setFormOpen(false);
  }

  async function persistSectionOrder(nextSections: HomepageSectionData[]) {
    if (!canEdit) {
      return;
    }

    const previousSections = sections;
    setSections(nextSections);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/homepage-sections", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sections: buildHomepageSectionReorderPayload(nextSections),
        }),
      });

      if (!response.ok) {
        const errorPayload = (await response.json()) as ApiErrorResponse;
        throw new Error(
          errorPayload.error?.message ?? "تعذر إعادة ترتيب الأقسام.",
        );
      }

      const payload = (await response.json()) as ApiResponse<HomepageSectionData[]>;
      setSections(payload.data);
      invalidateAdminCacheUrls([ADMIN_API_CACHE.homepage]);
      toast.success("تم تحديث ترتيب الأقسام.");
    } catch (error) {
      setSections(previousSections);
      toast.error(
        error instanceof Error ? error.message : "تعذر إعادة ترتيب الأقسام.",
      );
    } finally {
      setIsSubmitting(false);
      setDraggingSectionId(null);
      setDragOverSectionId(null);
    }
  }

  function handleDragStart(sectionId: string) {
    if (!canEdit || isSubmitting) {
      return;
    }

    setDraggingSectionId(sectionId);
  }

  function handleDragOver(event: React.DragEvent, sectionId: string) {
    if (!canEdit || isSubmitting || !draggingSectionId) {
      return;
    }

    event.preventDefault();
    setDragOverSectionId(sectionId);
  }

  function handleDrop(targetSectionId: string) {
    if (!canEdit || !draggingSectionId || draggingSectionId === targetSectionId) {
      setDraggingSectionId(null);
      setDragOverSectionId(null);
      return;
    }

    const fromIndex = sections.findIndex(
      (section) => section.id === draggingSectionId,
    );
    const toIndex = sections.findIndex(
      (section) => section.id === targetSectionId,
    );

    if (fromIndex === -1 || toIndex === -1) {
      setDraggingSectionId(null);
      setDragOverSectionId(null);
      return;
    }

    const nextSections = reorderHomepageSectionList(
      sections,
      fromIndex,
      toIndex,
    );
    void persistSectionOrder(nextSections);
  }

  function openEditForm(section: HomepageSectionData) {
    setSelectedSection(section);
    setFormInstanceKey((current) => current + 1);
    setFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة الصفحة الرئيسية"
        description="تحكم في أقسام الصفحة الرئيسية وترتيبها وعناوينها وإظهارها للزوار."
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={() => void refreshSections()}
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
            لديك صلاحية القراءة فقط. التعديل وإعادة الترتيب متاحان للمسؤولين
            الذين يملكون صلاحية إدارة الصفحة الرئيسية.
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            اسحب الأقسام لإعادة ترتيبها. يمكنك أيضاً إظهار أو إخفاء كل قسم
            وتعديل العناوين بالعربية والإنجليزية.
          </CardContent>
        </Card>
      )}

      {isInitialLoading ? (
        <AdminTableSkeleton />
      ) : loadError && sections.length === 0 ? (
        <AdminLoadErrorState
          message={loadError}
          onRetry={() => void refreshSections()}
        />
      ) : sections.length === 0 ? (
        <AdminEmptyState title="لا توجد أقسام للصفحة الرئيسية بعد." />
      ) : (
        <div
          className={cn(
            "space-y-3",
            isRefreshing && "opacity-80 transition-opacity",
          )}
        >
          {sections.map((section) => {
            const title =
              section.translations.ar?.title ??
              getHomepageSectionLabel(section.sectionKey);
            const subtitle = section.translations.ar?.subtitle;

            return (
              <Card
                key={section.id}
                draggable={canEdit && !isSubmitting}
                onDragStart={() => handleDragStart(section.id)}
                onDragEnd={() => {
                  setDraggingSectionId(null);
                  setDragOverSectionId(null);
                }}
                onDragOver={(event) => handleDragOver(event, section.id)}
                onDrop={() => handleDrop(section.id)}
                className={cn(
                  "transition-colors",
                  draggingSectionId === section.id && "opacity-60",
                  dragOverSectionId === section.id &&
                    draggingSectionId !== section.id &&
                    "border-primary/50 bg-primary/5",
                )}
              >
                <CardHeader className="gap-3 pb-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      {canEdit ? (
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground mt-1 cursor-grab active:cursor-grabbing"
                          aria-label="سحب لإعادة الترتيب"
                          disabled={isSubmitting}
                        >
                          <GripVertical className="size-5" />
                        </button>
                      ) : null}

                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle className="text-lg">{title}</CardTitle>
                          <Badge variant="outline">
                            {getHomepageSectionLabel(section.sectionKey)}
                          </Badge>
                          <Badge variant="secondary">
                            ترتيب {section.sortOrder + 1}
                          </Badge>
                          {!section.isVisible ? (
                            <Badge variant="destructive">مخفي</Badge>
                          ) : null}
                        </div>
                        {subtitle ? (
                          <CardDescription>{subtitle}</CardDescription>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">
                          إظهار
                        </span>
                        <Switch
                          checked={section.isVisible}
                          disabled={!canEdit || isSubmitting}
                          onCheckedChange={(checked) =>
                            void handleVisibilityToggle(section, checked)
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => openEditForm(section)}
                      >
                        <Pencil className="size-4" />
                        تعديل
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {section.translations.en?.title ? (
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground text-sm" dir="ltr">
                      EN: {section.translations.en.title}
                      {section.translations.en.subtitle
                        ? ` — ${section.translations.en.subtitle}`
                        : ""}
                    </p>
                  </CardContent>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}

      {isSubmitting ? (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Loader2 className="size-4 animate-spin" />
          جارٍ الحفظ...
        </div>
      ) : null}

      <HomepageSectionFormDialog
        section={selectedSection}
        open={formOpen}
        formInstanceKey={formInstanceKey}
        canEdit={canEdit}
        isSubmitting={isSubmitting}
        onOpenChange={setFormOpen}
        onSubmit={(values) => void handleFormSubmit(values)}
      />
    </div>
  );
}
