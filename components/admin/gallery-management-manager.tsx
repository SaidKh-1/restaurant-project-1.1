"use client";

import { useCallback, useEffect, useState } from "react";
import {
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
  buildCategoryPayload,
  createDefaultCategoryFormValues,
  GalleryCategoryFormDialog,
  mapCategoryToFormValues,
  validateCategoryForm,
  type GalleryCategoryFormValues,
} from "@/components/admin/gallery-category-form-dialog";
import {
  buildImagePayload,
  createDefaultImageFormValues,
  GalleryImageFormDialog,
  mapImageToFormValues,
  validateImageForm,
  type GalleryImageFormValues,
} from "@/components/admin/gallery-image-form-dialog";
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
  CardDescription,
  CardHeader,
  CardTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCmsStatusLabel } from "@/lib/admin/gallery";
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
  GalleryCategoryData,
  GalleryImageData,
} from "@/lib/admin/types";
import { cn } from "@/lib/utils";

type DeleteTarget =
  | { type: "category"; item: GalleryCategoryData }
  | { type: "image"; item: GalleryImageData }
  | null;

function imageMatchesFilter(
  image: GalleryImageData,
  filter: string,
): boolean {
  return filter === "all" || image.galleryCategoryId === filter;
}

export function GalleryManagementManager() {
  const canEdit = useAdminCanEdit("gallery.manage");
  const { isInitialLoading, isRefreshing, beginLoad, endLoad } =
    useAdminFetchState();
  const [categories, setCategories] = useState<GalleryCategoryData[]>([]);
  const [images, setImages] = useState<GalleryImageData[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  const [categoryFormMode, setCategoryFormMode] = useState<
    "create" | "edit" | null
  >(null);
  const [categoryFormValues, setCategoryFormValues] =
    useState<GalleryCategoryFormValues>(createDefaultCategoryFormValues());
  const [categoryFormKey, setCategoryFormKey] = useState(0);
  const [selectedCategory, setSelectedCategory] =
    useState<GalleryCategoryData | null>(null);

  const [imageFormMode, setImageFormMode] = useState<"create" | "edit" | null>(
    null,
  );
  const [imageFormValues, setImageFormValues] = useState<GalleryImageFormValues>(
    createDefaultImageFormValues(),
  );
  const [imageFormKey, setImageFormKey] = useState(0);
  const [selectedImage, setSelectedImage] = useState<GalleryImageData | null>(
    null,
  );

  async function loadGalleryData(filter: string, force = false) {
    const categoryQuery =
      filter !== "all" ? `?galleryCategoryId=${filter}` : "";
    const [categories, images] = await Promise.all([
      adminGet<GalleryCategoryData[]>("/api/admin/gallery-categories", {
        force,
        errorMessage: "تعذر تحميل بيانات المعرض.",
      }),
      adminGet<GalleryImageData[]>(`/api/admin/gallery-images${categoryQuery}`, {
        force,
        errorMessage: "تعذر تحميل بيانات المعرض.",
      }),
    ]);

    return { categories, images };
  }

  const refreshData = useCallback(async () => {
    beginLoad();

    try {
      const { categories, images } = await loadGalleryData(categoryFilter, true);
      setCategories(categories);
      setImages(images);
      setLoadError(null);
      endLoad(true);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "تعذر تحميل بيانات المعرض.",
      );
      endLoad(false);
    }
  }, [beginLoad, categoryFilter, endLoad]);

  const fetchImagesForFilter = useCallback(async (filter: string) => {
    try {
      const categoryQuery =
        filter !== "all" ? `?galleryCategoryId=${filter}` : "";
      const nextImages = await adminGet<GalleryImageData[]>(
        `/api/admin/gallery-images${categoryQuery}`,
        { errorMessage: "تعذر تحميل الصور." },
      );
      setImages(nextImages);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "تعذر تحميل الصور.",
      );
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      beginLoad();

      try {
        const { categories, images } = await loadGalleryData("all");

        if (!cancelled) {
          setCategories(categories);
          setImages(images);
          setLoadError(null);
          endLoad(true);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "تعذر تحميل بيانات المعرض.",
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

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value);
    void fetchImagesForFilter(value);
  };

  function openCreateCategory() {
    setCategoryFormValues(createDefaultCategoryFormValues(categories.length));
    setCategoryFormKey((current) => current + 1);
    setCategoryFormMode("create");
    setSelectedCategory(null);
  }

  function openEditCategory(category: GalleryCategoryData) {
    setSelectedCategory(category);
    setCategoryFormValues(mapCategoryToFormValues(category));
    setCategoryFormKey((current) => current + 1);
    setCategoryFormMode("edit");
  }

  function openCreateImage() {
    const defaultCategory =
      categoryFilter !== "all" ? categoryFilter : categories[0]?.id ?? null;
    setImageFormValues(
      createDefaultImageFormValues(defaultCategory, images.length),
    );
    setImageFormKey((current) => current + 1);
    setImageFormMode("create");
    setSelectedImage(null);
  }

  function openEditImage(image: GalleryImageData) {
    setSelectedImage(image);
    setImageFormValues(mapImageToFormValues(image));
    setImageFormKey((current) => current + 1);
    setImageFormMode("edit");
  }

  function applyImageUpsert(image: GalleryImageData) {
    setImages((current) => {
      if (imageMatchesFilter(image, categoryFilter)) {
        return upsertById(current, image);
      }

      return removeById(current, image.id);
    });
  }

  async function handleCategorySubmit(values: GalleryCategoryFormValues) {
    if (!canEdit) {
      return;
    }

    const validationError = validateCategoryForm(values);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const isCreate = categoryFormMode === "create";
      const response = await fetch(
        isCreate
          ? "/api/admin/gallery-categories"
          : `/api/admin/gallery-categories/${selectedCategory?.id}`,
        {
          method: isCreate ? "POST" : "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildCategoryPayload(values)),
        },
      );

      if (!response.ok) {
        const errorPayload = (await response.json()) as ApiErrorResponse;
        throw new Error(errorPayload.error?.message ?? "تعذر حفظ التصنيف.");
      }

      const payload = (await response.json()) as ApiResponse<GalleryCategoryData>;
      toast.success(isCreate ? "تمت إضافة التصنيف." : "تم تحديث التصنيف.");
      invalidateAdminCacheUrls([
        ADMIN_API_CACHE.galleryCategories,
        ADMIN_API_CACHE.galleryImages,
      ]);
      setCategories((current) => upsertById(current, payload.data));
      setCategoryFormMode(null);
      setSelectedCategory(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "تعذر حفظ التصنيف.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleImageSubmit(values: GalleryImageFormValues) {
    if (!canEdit) {
      return;
    }

    const validationError = validateImageForm(values);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const isCreate = imageFormMode === "create";
      const response = await fetch(
        isCreate
          ? "/api/admin/gallery-images"
          : `/api/admin/gallery-images/${selectedImage?.id}`,
        {
          method: isCreate ? "POST" : "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildImagePayload(values)),
        },
      );

      if (!response.ok) {
        const errorPayload = (await response.json()) as ApiErrorResponse;
        throw new Error(errorPayload.error?.message ?? "تعذر حفظ الصورة.");
      }

      const payload = (await response.json()) as ApiResponse<GalleryImageData>;
      toast.success(isCreate ? "تمت إضافة الصورة." : "تم تحديث الصورة.");
      invalidateAdminCacheUrls([
        ADMIN_API_CACHE.galleryCategories,
        ADMIN_API_CACHE.galleryImages,
      ]);
      applyImageUpsert(payload.data);
      setImageFormMode(null);
      setSelectedImage(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "تعذر حفظ الصورة.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!canEdit || !deleteTarget) {
      return;
    }

    setIsSubmitting(true);
    const target = deleteTarget;

    if (target.type === "category") {
      setCategories((current) => removeById(current, target.item.id));
      if (categoryFilter === target.item.id) {
        setCategoryFilter("all");
        void fetchImagesForFilter("all");
      }
    } else {
      setImages((current) => removeById(current, target.item.id));
    }

    setDeleteTarget(null);

    try {
      const url =
        target.type === "category"
          ? `/api/admin/gallery-categories/${target.item.id}`
          : `/api/admin/gallery-images/${target.item.id}`;

      const response = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorPayload = (await response.json()) as ApiErrorResponse;
        throw new Error(errorPayload.error?.message ?? "تعذر الحذف.");
      }

      toast.success(
        target.type === "category" ? "تم حذف التصنيف." : "تم حذف الصورة.",
      );
      invalidateAdminCacheUrls([
        ADMIN_API_CACHE.galleryCategories,
        ADMIN_API_CACHE.galleryImages,
      ]);
    } catch (error) {
      if (target.type === "category") {
        setCategories((current) => upsertById(current, target.item));
      } else {
        setImages((current) => upsertById(current, target.item));
      }
      toast.error(error instanceof Error ? error.message : "تعذر الحذف.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCategoryToggle(category: GalleryCategoryData) {
    if (!canEdit) {
      return;
    }

    const previousCategories = categories;
    const nextValue = !category.isActive;
    setCategories((current) =>
      patchById(current, category.id, { isActive: nextValue }),
    );

    try {
      const response = await fetch(
        `/api/admin/gallery-categories/${category.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: nextValue }),
        },
      );

      if (!response.ok) {
        const errorPayload = (await response.json()) as ApiErrorResponse;
        throw new Error(errorPayload.error?.message ?? "تعذر التحديث.");
      }

      invalidateAdminCacheUrls([
        ADMIN_API_CACHE.galleryCategories,
        ADMIN_API_CACHE.galleryImages,
      ]);
    } catch (error) {
      setCategories(previousCategories);
      toast.error(error instanceof Error ? error.message : "تعذر التحديث.");
    }
  }

  async function handleImageToggle(
    image: GalleryImageData,
    field: "isVisible" | "isFeatured",
  ) {
    if (!canEdit) {
      return;
    }

    const previousImages = images;
    const nextValue = !image[field];
    setImages((current) =>
      patchById(current, image.id, { [field]: nextValue }),
    );

    try {
      const response = await fetch(`/api/admin/gallery-images/${image.id}`, {
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
        ADMIN_API_CACHE.galleryCategories,
        ADMIN_API_CACHE.galleryImages,
      ]);
    } catch (error) {
      setImages(previousImages);
      toast.error(error instanceof Error ? error.message : "تعذر التحديث.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="معرض الصور"
        description="إدارة تصنيفات المعرض وصوره من المكتبة."
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={() => void refreshData()}
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
            لديك صلاحية القراءة فقط. التعديل متاح للمسؤولين الذين يملكون
            صلاحية إدارة المعرض.
          </CardContent>
        </Card>
      ) : null}

      <Tabs defaultValue="images">
        <TabsList className="h-auto w-full flex-wrap">
          <TabsTrigger value="images">الصور</TabsTrigger>
          <TabsTrigger value="categories">التصنيفات</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-muted-foreground text-sm">
              {categories.length} تصنيف
            </p>
            {canEdit ? (
              <Button type="button" onClick={openCreateCategory}>
                <Plus className="size-4" />
                إضافة تصنيف
              </Button>
            ) : null}
          </div>

          {isInitialLoading ? (
            <AdminCardGridSkeleton />
          ) : loadError && categories.length === 0 ? (
            <AdminLoadErrorState
              message={loadError}
              onRetry={() => void refreshData()}
            />
          ) : categories.length === 0 ? (
            <AdminEmptyState
              title="لا توجد تصنيفات بعد"
              description={
                canEdit
                  ? "أضف أول تصنيف لتنظيم صور المعرض."
                  : "لم يتم إنشاء أي تصنيفات بعد."
              }
              action={
                canEdit ? (
                  <Button type="button" onClick={openCreateCategory}>
                    <Plus className="size-4" />
                    إضافة تصنيف
                  </Button>
                ) : null
              }
            />
          ) : (
            <div
              className={cn(
                "grid gap-4 md:grid-cols-2",
                isRefreshing && "opacity-80 transition-opacity",
              )}
            >
              {categories.map((category) => (
                <Card key={category.id}>
                  <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {category.translations.ar?.name ?? category.slug}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {category.translations.ar?.description ?? "—"}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem
                          onClick={() => openEditCategory(category)}
                        >
                          <Pencil className="size-4" />
                          {canEdit ? "تعديل" : "عرض"}
                        </DropdownMenuItem>
                        {canEdit ? (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              disabled={category.imageCount > 0}
                              onClick={() =>
                                setDeleteTarget({
                                  type: "category",
                                  item: category,
                                })
                              }
                            >
                              <Trash2 className="size-4" />
                              {category.imageCount > 0
                                ? "محذوف (يحتوي صور)"
                                : "حذف"}
                            </DropdownMenuItem>
                          </>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={category.isActive ? "default" : "secondary"}>
                        {category.isActive ? "نشط" : "غير نشط"}
                      </Badge>
                      <Badge variant="secondary">
                        {category.imageCount} صورة
                      </Badge>
                      <Badge variant="outline">ترتيب {category.sortOrder}</Badge>
                    </div>
                    {canEdit ? (
                      <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
                        <span className="text-sm">نشط</span>
                        <Switch
                          checked={category.isActive}
                          onCheckedChange={() =>
                            void handleCategoryToggle(category)
                          }
                        />
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Select
              value={categoryFilter}
              onValueChange={handleCategoryFilterChange}
            >
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="تصفية حسب التصنيف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل التصنيفات</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.translations.ar?.name ?? category.slug}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {canEdit ? (
              <Button type="button" onClick={openCreateImage}>
                <Plus className="size-4" />
                إضافة صورة
              </Button>
            ) : null}
          </div>

          {isInitialLoading ? (
            <AdminCardGridSkeleton
              count={6}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:grid-cols-2"
              cardClassName="aspect-[4/3] w-full"
            />
          ) : loadError && images.length === 0 ? (
            <AdminLoadErrorState
              message={loadError}
              onRetry={() => void refreshData()}
            />
          ) : images.length === 0 ? (
            <AdminEmptyState
              title="لا توجد صور في المعرض بعد"
              description={
                canEdit
                  ? "أضف صوراً من المكتبة واربطها بتصنيف."
                  : "لم يتم إضافة أي صور بعد."
              }
              action={
                canEdit ? (
                  <Button type="button" onClick={openCreateImage}>
                    <Plus className="size-4" />
                    إضافة صورة
                  </Button>
                ) : null
              }
            />
          ) : (
            <div
              className={cn(
                "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
                isRefreshing && "opacity-80 transition-opacity",
              )}
            >
              {images.map((image) => {
                const thumbnailUrl = image.mediaAsset?.publicUrl;
                const altText =
                  image.translations.ar?.altText ??
                  image.mediaAsset?.altText.ar ??
                  "صورة المعرض";

                return (
                  <Card key={image.id} className="overflow-hidden">
                    <div className="relative flex aspect-[4/3] items-center justify-center bg-muted">
                      {thumbnailUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={thumbnailUrl}
                          alt={altText}
                          className="size-full object-cover"
                        />
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          بدون معاينة
                        </span>
                      )}
                      {image.isFeatured ? (
                        <Badge className="absolute top-2 right-2 gap-1">
                          <Star className="size-3 fill-current" />
                          مميز
                        </Badge>
                      ) : null}
                    </div>
                    <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                      <div className="min-w-0 space-y-1">
                        <CardTitle className="truncate text-base">
                          {image.translations.ar?.altText ?? "—"}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {image.translations.ar?.caption ?? "—"}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="shrink-0">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem
                            onClick={() => openEditImage(image)}
                          >
                            <Pencil className="size-4" />
                            {canEdit ? "تعديل" : "عرض"}
                          </DropdownMenuItem>
                          {canEdit ? (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                disabled={image.homepageSectionCount > 0}
                                onClick={() =>
                                  setDeleteTarget({ type: "image", item: image })
                                }
                              >
                                <Trash2 className="size-4" />
                                {image.homepageSectionCount > 0
                                  ? "محذوف (مستخدم في الصفحة الرئيسية)"
                                  : "حذف"}
                              </DropdownMenuItem>
                            </>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                          {getCmsStatusLabel(image.status)}
                        </Badge>
                        <Badge
                          variant={image.isVisible ? "default" : "secondary"}
                        >
                          {image.isVisible ? "نشط" : "غير نشط"}
                        </Badge>
                        {image.galleryCategory ? (
                          <Badge variant="secondary">
                            {image.galleryCategory.translations.ar?.name ??
                              image.galleryCategory.slug}
                          </Badge>
                        ) : null}
                        <Badge variant="outline">ترتيب {image.sortOrder}</Badge>
                      </div>
                      {canEdit ? (
                        <div className="grid gap-2">
                          <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
                            <span className="text-sm">نشط / ظاهر</span>
                            <Switch
                              checked={image.isVisible}
                              onCheckedChange={() =>
                                void handleImageToggle(image, "isVisible")
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
                            <span className="text-sm">مميز</span>
                            <Switch
                              checked={image.isFeatured}
                              onCheckedChange={() =>
                                void handleImageToggle(image, "isFeatured")
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
        </TabsContent>
      </Tabs>

      {categoryFormMode ? (
        <GalleryCategoryFormDialog
          key={
            categoryFormMode === "create"
              ? `gallery-cat-create-${categoryFormKey}`
              : `gallery-cat-edit-${selectedCategory?.id ?? categoryFormKey}`
          }
          open
          mode={categoryFormMode}
          initialValues={categoryFormValues}
          canEdit={canEdit}
          isSubmitting={isSubmitting}
          onOpenChange={(open) => {
            if (!open) {
              setCategoryFormMode(null);
              setSelectedCategory(null);
            }
          }}
          onSubmit={(values) => void handleCategorySubmit(values)}
        />
      ) : null}

      {imageFormMode ? (
        <GalleryImageFormDialog
          key={
            imageFormMode === "create"
              ? `gallery-img-create-${imageFormKey}`
              : `gallery-img-edit-${selectedImage?.id ?? imageFormKey}`
          }
          open
          mode={imageFormMode}
          initialValues={imageFormValues}
          categories={categories}
          canEdit={canEdit}
          isSubmitting={isSubmitting}
          onOpenChange={(open) => {
            if (!open) {
              setImageFormMode(null);
              setSelectedImage(null);
            }
          }}
          onSubmit={(values) => void handleImageSubmit(values)}
        />
      ) : null}

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              {deleteTarget?.type === "category"
                ? "هل تريد حذف هذا التصنيف؟ لا يمكن التراجع عن هذا الإجراء."
                : "هل تريد حذف هذه الصورة من المعرض؟ لا يمكن التراجع عن هذا الإجراء."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
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
