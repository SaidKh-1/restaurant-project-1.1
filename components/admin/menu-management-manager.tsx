"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  buildCategoryPayload,
  createDefaultCategoryFormValues,
  mapCategoryToFormValues,
  MenuCategoryFormDialog,
  validateCategoryForm,
  type MenuCategoryFormValues,
} from "@/components/admin/menu-category-form-dialog";
import {
  buildItemPayload,
  createDefaultItemFormValues,
  mapItemToFormValues,
  MenuItemFormDialog,
  validateItemForm,
  type MenuItemFormValues,
} from "@/components/admin/menu-item-form-dialog";
import {
  AdminCardGridSkeleton,
  AdminEmptyState,
  AdminLoadErrorState,
  AdminTableSkeleton,
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
import {
  formatMenuPrice,
  getCmsStatusLabel,
  getUnitLabel,
} from "@/lib/admin/menu";
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
  CookingMethodData,
  MenuCategoryData,
  MenuItemData,
} from "@/lib/admin/types";
import { cn } from "@/lib/utils";

type DeleteTarget =
  | { type: "category"; item: MenuCategoryData }
  | { type: "item"; item: MenuItemData }
  | null;

function itemMatchesFilter(item: MenuItemData, filter: string): boolean {
  return filter === "all" || item.menuCategoryId === filter;
}

export function MenuManagementManager() {
  const canEdit = useAdminCanEdit("menu.manage");
  const { isInitialLoading, isRefreshing, beginLoad, endLoad } =
    useAdminFetchState();
  const [categories, setCategories] = useState<MenuCategoryData[]>([]);
  const [items, setItems] = useState<MenuItemData[]>([]);
  const [cookingMethods, setCookingMethods] = useState<CookingMethodData[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  const [categoryFormMode, setCategoryFormMode] = useState<
    "create" | "edit" | null
  >(null);
  const [categoryFormValues, setCategoryFormValues] =
    useState<MenuCategoryFormValues>(createDefaultCategoryFormValues());
  const [categoryFormKey, setCategoryFormKey] = useState(0);
  const [selectedCategory, setSelectedCategory] =
    useState<MenuCategoryData | null>(null);

  const [itemFormMode, setItemFormMode] = useState<"create" | "edit" | null>(
    null,
  );
  const [itemFormValues, setItemFormValues] = useState<MenuItemFormValues>(
    createDefaultItemFormValues(),
  );
  const [itemFormKey, setItemFormKey] = useState(0);
  const [selectedItem, setSelectedItem] = useState<MenuItemData | null>(null);

  async function loadMenuData(filter: string, force = false) {
    const categoryQuery =
      filter !== "all" ? `?menuCategoryId=${filter}` : "";
    const [categories, items, methods] = await Promise.all([
      adminGet<MenuCategoryData[]>("/api/admin/menu-categories", {
        force,
        errorMessage: "تعذر تحميل بيانات المنيو.",
      }),
      adminGet<MenuItemData[]>(`/api/admin/menu-items${categoryQuery}`, {
        force,
        errorMessage: "تعذر تحميل بيانات المنيو.",
      }),
      adminGet<CookingMethodData[]>("/api/admin/cooking-methods", {
        force,
      }).catch(() => [] as CookingMethodData[]),
    ]);

    return { categories, items, methods };
  }

  const refreshData = useCallback(async () => {
    beginLoad();

    try {
      const { categories, items, methods } = await loadMenuData(
        categoryFilter,
        true,
      );
      setCategories(categories);
      setItems(items);
      setCookingMethods(methods);
      setLoadError(null);
      endLoad(true);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "تعذر تحميل بيانات المنيو.",
      );
      endLoad(false);
    }
  }, [beginLoad, categoryFilter, endLoad]);

  const fetchItemsForFilter = useCallback(async (filter: string) => {
    try {
      const categoryQuery =
        filter !== "all" ? `?menuCategoryId=${filter}` : "";
      const nextItems = await adminGet<MenuItemData[]>(
        `/api/admin/menu-items${categoryQuery}`,
        { errorMessage: "تعذر تحميل الأصناف." },
      );
      setItems(nextItems);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "تعذر تحميل الأصناف.",
      );
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      beginLoad();

      try {
        const { categories, items, methods } = await loadMenuData("all");

        if (!cancelled) {
          setCategories(categories);
          setItems(items);
          setCookingMethods(methods);
          setLoadError(null);
          endLoad(true);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "تعذر تحميل بيانات المنيو.",
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
    void fetchItemsForFilter(value);
  };

  function openCreateCategory() {
    setCategoryFormValues(createDefaultCategoryFormValues(categories.length));
    setCategoryFormKey((current) => current + 1);
    setCategoryFormMode("create");
    setSelectedCategory(null);
  }

  function openEditCategory(category: MenuCategoryData) {
    setSelectedCategory(category);
    setCategoryFormValues(mapCategoryToFormValues(category));
    setCategoryFormKey((current) => current + 1);
    setCategoryFormMode("edit");
  }

  function openCreateItem() {
    const defaultCategory =
      categoryFilter !== "all" ? categoryFilter : categories[0]?.id ?? "";
    setItemFormValues(
      createDefaultItemFormValues(defaultCategory, items.length),
    );
    setItemFormKey((current) => current + 1);
    setItemFormMode("create");
    setSelectedItem(null);
  }

  function openEditItem(item: MenuItemData) {
    setSelectedItem(item);
    setItemFormValues(mapItemToFormValues(item));
    setItemFormKey((current) => current + 1);
    setItemFormMode("edit");
  }

  function applyItemUpsert(item: MenuItemData) {
    setItems((current) => {
      if (itemMatchesFilter(item, categoryFilter)) {
        return upsertById(current, item);
      }

      return removeById(current, item.id);
    });
  }

  async function handleCategorySubmit(values: MenuCategoryFormValues) {
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
          ? "/api/admin/menu-categories"
          : `/api/admin/menu-categories/${selectedCategory?.id}`,
        {
          method: isCreate ? "POST" : "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildCategoryPayload(values)),
        },
      );

      if (!response.ok) {
        const errorPayload = (await response.json()) as ApiErrorResponse;
        throw new Error(errorPayload.error?.message ?? "تعذر حفظ القسم.");
      }

      const payload = (await response.json()) as ApiResponse<MenuCategoryData>;
      toast.success(isCreate ? "تمت إضافة القسم." : "تم تحديث القسم.");
      invalidateAdminCacheUrls([
        ADMIN_API_CACHE.menuCategories,
        ADMIN_API_CACHE.menuItems,
        ADMIN_API_CACHE.cookingMethods,
        ADMIN_API_CACHE.dashboard,
      ]);
      setCategories((current) => upsertById(current, payload.data));
      setCategoryFormMode(null);
      setSelectedCategory(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "تعذر حفظ القسم.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleItemSubmit(values: MenuItemFormValues) {
    if (!canEdit) {
      return;
    }

    const validationError = validateItemForm(values);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const isCreate = itemFormMode === "create";
      const response = await fetch(
        isCreate
          ? "/api/admin/menu-items"
          : `/api/admin/menu-items/${selectedItem?.id}`,
        {
          method: isCreate ? "POST" : "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildItemPayload(values)),
        },
      );

      if (!response.ok) {
        const errorPayload = (await response.json()) as ApiErrorResponse;
        throw new Error(errorPayload.error?.message ?? "تعذر حفظ الصنف.");
      }

      const payload = (await response.json()) as ApiResponse<MenuItemData>;
      toast.success(isCreate ? "تمت إضافة الصنف." : "تم تحديث الصنف.");
      invalidateAdminCacheUrls([
        ADMIN_API_CACHE.menuCategories,
        ADMIN_API_CACHE.menuItems,
        ADMIN_API_CACHE.cookingMethods,
        ADMIN_API_CACHE.dashboard,
      ]);
      applyItemUpsert(payload.data);
      setItemFormMode(null);
      setSelectedItem(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "تعذر حفظ الصنف.",
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
        void fetchItemsForFilter("all");
      }
    } else {
      setItems((current) => removeById(current, target.item.id));
    }

    setDeleteTarget(null);

    try {
      const url =
        target.type === "category"
          ? `/api/admin/menu-categories/${target.item.id}`
          : `/api/admin/menu-items/${target.item.id}`;

      const response = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorPayload = (await response.json()) as ApiErrorResponse;
        throw new Error(errorPayload.error?.message ?? "تعذر الحذف.");
      }

      toast.success(
        target.type === "category" ? "تم حذف القسم." : "تم حذف الصنف.",
      );
      invalidateAdminCacheUrls([
        ADMIN_API_CACHE.menuCategories,
        ADMIN_API_CACHE.menuItems,
        ADMIN_API_CACHE.cookingMethods,
        ADMIN_API_CACHE.dashboard,
      ]);
    } catch (error) {
      if (target.type === "category") {
        setCategories((current) => upsertById(current, target.item));
      } else {
        setItems((current) => upsertById(current, target.item));
      }
      toast.error(error instanceof Error ? error.message : "تعذر الحذف.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleItemToggle(
    item: MenuItemData,
    field: "isAvailable" | "isFeatured" | "isVisible",
  ) {
    if (!canEdit) {
      return;
    }

    const previousItems = items;
    const nextValue = !item[field];
    setItems((current) =>
      patchById(current, item.id, { [field]: nextValue }),
    );

    try {
      const response = await fetch(`/api/admin/menu-items/${item.id}`, {
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
        ADMIN_API_CACHE.menuCategories,
        ADMIN_API_CACHE.menuItems,
        ADMIN_API_CACHE.cookingMethods,
        ADMIN_API_CACHE.dashboard,
      ]);
    } catch (error) {
      setItems(previousItems);
      toast.error(error instanceof Error ? error.message : "تعذر التحديث.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة المنيو"
        description="إدارة الأقسام والأصناف وخيارات الأسعار وطرق الطهي."
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
            صلاحية إدارة المنيو.
          </CardContent>
        </Card>
      ) : null}

      <Tabs defaultValue="categories">
        <TabsList className="h-auto w-full flex-wrap">
          <TabsTrigger value="categories">الأقسام</TabsTrigger>
          <TabsTrigger value="items">الأصناف</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-muted-foreground text-sm">
              {categories.length} قسم
            </p>
            {canEdit ? (
              <Button type="button" onClick={openCreateCategory}>
                <Plus className="size-4" />
                إضافة قسم
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
              title="لا توجد أقسام بعد"
              description={
                canEdit
                  ? "أضف أول قسم لتنظيم أصناف المنيو."
                  : "لم يتم إنشاء أي أقسام بعد."
              }
              action={
                canEdit ? (
                  <Button type="button" onClick={openCreateCategory}>
                    <Plus className="size-4" />
                    إضافة قسم
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
                          تعديل
                        </DropdownMenuItem>
                        {canEdit ? (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              disabled={category.menuItemCount > 0}
                              onClick={() =>
                                setDeleteTarget({ type: "category", item: category })
                              }
                            >
                              <Trash2 className="size-4" />
                              {category.menuItemCount > 0
                                ? "محذوف (يحتوي أصناف)"
                                : "حذف"}
                            </DropdownMenuItem>
                          </>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {getCmsStatusLabel(category.status)}
                    </Badge>
                    <Badge variant={category.isVisible ? "default" : "secondary"}>
                      {category.isVisible ? "ظاهر" : "مخفي"}
                    </Badge>
                    <Badge variant="secondary">
                      {category.menuItemCount} صنف
                    </Badge>
                    <Badge variant="outline">ترتيب {category.sortOrder}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Select value={categoryFilter} onValueChange={handleCategoryFilterChange}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="تصفية حسب القسم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الأقسام</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.translations.ar?.name ?? category.slug}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {canEdit ? (
              <Button
                type="button"
                onClick={openCreateItem}
                disabled={categories.length === 0}
              >
                <Plus className="size-4" />
                إضافة صنف
              </Button>
            ) : null}
          </div>

          {categories.length === 0 ? (
            <AdminEmptyState
              title="أضف قسماً أولاً"
              description="أضف قسماً قبل إنشاء الأصناف."
              action={
                canEdit ? (
                  <Button type="button" onClick={openCreateCategory}>
                    <Plus className="size-4" />
                    إضافة قسم
                  </Button>
                ) : null
              }
            />
          ) : isInitialLoading ? (
            <AdminTableSkeleton rows={4} />
          ) : loadError && items.length === 0 ? (
            <AdminLoadErrorState
              message={loadError}
              onRetry={() => void refreshData()}
            />
          ) : items.length === 0 ? (
            <AdminEmptyState
              title="لا توجد أصناف في هذا القسم"
              description={
                canEdit
                  ? "أضف أصنافاً مع الأسعار وطرق الطهي."
                  : "لم يتم إضافة أي أصناف بعد."
              }
              action={
                canEdit ? (
                  <Button type="button" onClick={openCreateItem}>
                    <Plus className="size-4" />
                    إضافة صنف
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
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="flex flex-col gap-4 pt-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 flex-1 gap-4">
                      {item.image?.publicUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.image.publicUrl}
                          alt=""
                          className="size-20 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="bg-muted flex size-20 shrink-0 items-center justify-center rounded-lg text-xs text-muted-foreground">
                          بدون صورة
                        </div>
                      )}
                      <div className="min-w-0 space-y-2">
                        <div>
                          <p className="font-semibold">
                            {item.translations.ar?.name}
                          </p>
                          <p className="text-muted-foreground line-clamp-2 text-sm">
                            {item.translations.ar?.description}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">
                            {item.menuCategory.translations.ar?.name ??
                              item.menuCategory.slug}
                          </Badge>
                          <Badge variant="outline">
                            {getCmsStatusLabel(item.status)}
                          </Badge>
                          {item.isFeatured ? (
                            <Badge>مميز</Badge>
                          ) : null}
                          {!item.isAvailable ? (
                            <Badge variant="secondary">غير متاح</Badge>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.priceVariants.map((variant) => (
                            <Badge key={variant.id} variant="secondary">
                              {variant.translations.ar?.name}:{" "}
                              {formatMenuPrice(variant.price)}{" "}
                              {getUnitLabel(variant.unit, variant.unitLabel)}
                            </Badge>
                          ))}
                        </div>
                        {item.cookingMethods.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {item.cookingMethods.map((method) => (
                              <Badge key={method.id} variant="outline">
                                {method.translations.ar?.name}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 lg:items-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="size-4" />
                            إجراءات
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => openEditItem(item)}>
                            <Pencil className="size-4" />
                            تعديل
                          </DropdownMenuItem>
                          {canEdit ? (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                disabled={item.homepageSectionCount > 0}
                                onClick={() =>
                                  setDeleteTarget({ type: "item", item })
                                }
                              >
                                <Trash2 className="size-4" />
                                {item.homepageSectionCount > 0
                                  ? "محذوف (مستخدم)"
                                  : "حذف"}
                              </DropdownMenuItem>
                            </>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {canEdit ? (
                        <div className="grid gap-2 text-sm">
                          <label className="flex items-center justify-between gap-3">
                            <span>متاح</span>
                            <Switch
                              checked={item.isAvailable}
                              onCheckedChange={() =>
                                void handleItemToggle(item, "isAvailable")
                              }
                            />
                          </label>
                          <label className="flex items-center justify-between gap-3">
                            <span>مميز</span>
                            <Switch
                              checked={item.isFeatured}
                              onCheckedChange={() =>
                                void handleItemToggle(item, "isFeatured")
                              }
                            />
                          </label>
                          <label className="flex items-center justify-between gap-3">
                            <span>ظاهر</span>
                            <Switch
                              checked={item.isVisible}
                              onCheckedChange={() =>
                                void handleItemToggle(item, "isVisible")
                              }
                            />
                          </label>
                        </div>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <MenuCategoryFormDialog
        key={
          categoryFormMode === "create"
            ? `cat-create-${categoryFormKey}`
            : `cat-edit-${selectedCategory?.id ?? categoryFormKey}`
        }
        open={categoryFormMode !== null}
        mode={categoryFormMode === "create" ? "create" : "edit"}
        initialValues={categoryFormValues}
        canEdit={canEdit}
        isSubmitting={isSubmitting}
        onOpenChange={(open) => {
          if (!open) {
            setCategoryFormMode(null);
            setSelectedCategory(null);
          }
        }}
        onSubmit={handleCategorySubmit}
      />

      <MenuItemFormDialog
        key={
          itemFormMode === "create"
            ? `item-create-${itemFormKey}`
            : `item-edit-${selectedItem?.id ?? itemFormKey}`
        }
        open={itemFormMode !== null}
        mode={itemFormMode === "create" ? "create" : "edit"}
        initialValues={itemFormValues}
        categories={categories}
        cookingMethods={cookingMethods}
        canEdit={canEdit}
        isSubmitting={isSubmitting}
        onOpenChange={(open) => {
          if (!open) {
            setItemFormMode(null);
            setSelectedItem(null);
          }
        }}
        onSubmit={handleItemSubmit}
      />

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
            <DialogTitle>
              {deleteTarget?.type === "category" ? "حذف القسم" : "حذف الصنف"}
            </DialogTitle>
            <DialogDescription>
              {deleteTarget?.type === "category"
                ? `هل أنت متأكد من حذف «${deleteTarget.item.translations.ar?.name}»؟`
                : `هل أنت متأكد من حذف «${deleteTarget?.item.translations.ar?.name}»؟`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
            >
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
