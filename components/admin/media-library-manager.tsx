"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Eye,
  ImagePlus,
  Loader2,
  MoreVertical,
  Pencil,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import {
  AdminEmptyState,
  AdminLoadErrorState,
  AdminMediaCardSkeleton,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  formatFileSize,
  formatMediaDate,
  getActiveUsageLabels,
  getUsageTypeLabel,
  MEDIA_USAGE_TYPE_OPTIONS,
  type MediaUsageTypeValue,
} from "@/lib/admin/media";
import { adminGet } from "@/lib/admin/fetch-client";
import { ADMIN_API_CACHE, invalidateAdminCacheUrls } from "@/lib/admin/invalidate-cache";
import {
  removeById,
  upsertById,
} from "@/lib/admin/permissions-client";
import { useAdminFetchState } from "@/lib/admin/use-admin-fetch-state";
import type {
  ApiErrorResponse,
  ApiResponse,
  MediaLibraryAsset,
} from "@/lib/admin/types";
import { cn } from "@/lib/utils";

type DialogMode = "preview" | "rename" | "delete" | null;

export function MediaLibraryManager() {
  const canEdit = useAdminCanEdit("media.manage");
  const { isInitialLoading, isRefreshing, beginLoad, endLoad, resetLoaded } =
    useAdminFetchState();
  const [assets, setAssets] = useState<MediaLibraryAsset[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [usageFilter, setUsageFilter] = useState<string>("all");
  const [selectedAsset, setSelectedAsset] = useState<MediaLibraryAsset | null>(
    null,
  );
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadUsageType, setUploadUsageType] =
    useState<MediaUsageTypeValue>("OTHER");
  const [uploadAltTextAr, setUploadAltTextAr] = useState("");
  const [uploadAltTextEn, setUploadAltTextEn] = useState("");

  const [renameFilename, setRenameFilename] = useState("");
  const [renameAltTextAr, setRenameAltTextAr] = useState("");
  const [renameAltTextEn, setRenameAltTextEn] = useState("");
  const [renameCaptionAr, setRenameCaptionAr] = useState("");

  const uploadInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replaceTargetIdRef = useRef<string | null>(null);

  async function fetchMediaList(filter: string, force = false) {
    const query = filter !== "all" ? `?usageType=${filter}` : "";
    return adminGet<MediaLibraryAsset[]>(`/api/admin/media${query}`, {
      force,
      errorMessage: "تعذر تحميل مكتبة الصور.",
    });
  }

  const refreshAssets = useCallback(async () => {
    beginLoad();

    try {
      const data = await fetchMediaList(usageFilter, true);
      setAssets(data);
      setLoadError(null);
      endLoad(true);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "تعذر تحميل مكتبة الصور.",
      );
      endLoad(false);
    }
  }, [beginLoad, endLoad, usageFilter]);

  useEffect(() => {
    let cancelled = false;

    resetLoaded();

    async function loadInitialAssets() {
      beginLoad();

      try {
        const data = await fetchMediaList(usageFilter);

        if (!cancelled) {
          setAssets(data);
          setLoadError(null);
          endLoad(true);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "تعذر تحميل مكتبة الصور.",
          );
          endLoad(false);
        }
      }
    }

    void loadInitialAssets();

    return () => {
      cancelled = true;
    };
  }, [usageFilter, beginLoad, endLoad, resetLoaded]);

  function openPreview(asset: MediaLibraryAsset) {
    setSelectedAsset(asset);
    setDialogMode("preview");
  }

  function openRename(asset: MediaLibraryAsset) {
    setSelectedAsset(asset);
    setRenameFilename(asset.originalFilename ?? "");
    setRenameAltTextAr(asset.translations.ar?.altText ?? "");
    setRenameAltTextEn(asset.translations.en?.altText ?? "");
    setRenameCaptionAr(asset.translations.ar?.caption ?? "");
    setDialogMode("rename");
  }

  function openDelete(asset: MediaLibraryAsset) {
    setSelectedAsset(asset);
    setDialogMode("delete");
  }

  function closeDialog() {
    setDialogMode(null);
    setSelectedAsset(null);
  }

  function mergeUploadedAsset(newAsset: MediaLibraryAsset) {
    setAssets((current) => {
      if (usageFilter !== "all" && newAsset.usageType !== usageFilter) {
        return current;
      }

      return [newAsset, ...removeById(current, newAsset.id)];
    });
  }

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canEdit || !uploadFile) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append(
        "metadata",
        JSON.stringify({
          usageType: uploadUsageType,
          originalFilename: uploadFile.name,
          translations: {
            ar: uploadAltTextAr.trim()
              ? { altText: uploadAltTextAr.trim() }
              : undefined,
            en: uploadAltTextEn.trim()
              ? { altText: uploadAltTextEn.trim() }
              : undefined,
          },
        }),
      );

      const response = await fetch("/api/admin/media", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorPayload = (await response.json()) as ApiErrorResponse;
        throw new Error(errorPayload.error?.message ?? "تعذر رفع الصورة.");
      }

      const payload = (await response.json()) as ApiResponse<MediaLibraryAsset>;
      toast.success("تم رفع الصورة بنجاح.");
      invalidateAdminCacheUrls([ADMIN_API_CACHE.media]);
      mergeUploadedAsset(payload.data);
      setUploadFile(null);
      setUploadAltTextAr("");
      setUploadAltTextEn("");
      setUploadUsageType("OTHER");
      if (uploadInputRef.current) {
        uploadInputRef.current.value = "";
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "تعذر رفع الصورة.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRenameSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canEdit || !selectedAsset) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/media/${selectedAsset.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalFilename: renameFilename.trim() || null,
          translations: {
            ar: {
              altText: renameAltTextAr.trim() || null,
              caption: renameCaptionAr.trim() || null,
            },
            en: renameAltTextEn.trim()
              ? { altText: renameAltTextEn.trim() }
              : null,
          },
        }),
      });

      if (!response.ok) {
        const errorPayload = (await response.json()) as ApiErrorResponse;
        throw new Error(errorPayload.error?.message ?? "تعذر تحديث الصورة.");
      }

      const payload = (await response.json()) as ApiResponse<MediaLibraryAsset>;
      toast.success("تم تحديث بيانات الصورة.");
      invalidateAdminCacheUrls([ADMIN_API_CACHE.media]);
      setAssets((current) => upsertById(current, payload.data));
      closeDialog();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "تعذر تحديث الصورة.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReplace(file: File, assetId: string) {
    if (!canEdit) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/admin/media/${assetId}/file`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorPayload = (await response.json()) as ApiErrorResponse;
        throw new Error(errorPayload.error?.message ?? "تعذر استبدال الصورة.");
      }

      const payload = (await response.json()) as ApiResponse<MediaLibraryAsset>;
      toast.success("تم استبدال الصورة بنجاح.");
      invalidateAdminCacheUrls([ADMIN_API_CACHE.media]);
      setAssets((current) => upsertById(current, payload.data));

      if (selectedAsset?.id === assetId) {
        setSelectedAsset(payload.data);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "تعذر استبدال الصورة.",
      );
    } finally {
      setIsSubmitting(false);
      replaceTargetIdRef.current = null;
      if (replaceInputRef.current) {
        replaceInputRef.current.value = "";
      }
    }
  }

  async function handleDelete() {
    if (!canEdit || !selectedAsset) {
      return;
    }

    if (selectedAsset.isInUse) {
      toast.error("لا يمكن حذف صورة مستخدمة حالياً.");
      return;
    }

    setIsSubmitting(true);
    const deletedAsset = selectedAsset;
    setAssets((current) => removeById(current, deletedAsset.id));
    closeDialog();

    try {
      const response = await fetch(`/api/admin/media/${deletedAsset.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorPayload = (await response.json()) as ApiErrorResponse;
        throw new Error(errorPayload.error?.message ?? "تعذر حذف الصورة.");
      }

      toast.success("تم حذف الصورة.");
      invalidateAdminCacheUrls([ADMIN_API_CACHE.media]);
    } catch (error) {
      setAssets((current) => upsertById(current, deletedAsset));
      toast.error(
        error instanceof Error ? error.message : "تعذر حذف الصورة.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function triggerReplace(assetId: string) {
    replaceTargetIdRef.current = assetId;
    replaceInputRef.current?.click();
  }

  const filteredCount = assets.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="مكتبة الصور"
        description="رفع وإدارة صور المطعم — الشعار، المنيو، العروض، والمعرض."
        actions={
          <>
            <Select value={usageFilter} onValueChange={setUsageFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="تصفية حسب النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الأنواع</SelectItem>
                {MEDIA_USAGE_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              onClick={() => void refreshAssets()}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={cn("size-4", isRefreshing && "animate-spin")}
              />
              تحديث
            </Button>
          </>
        }
      />

      {!canEdit ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            لديك صلاحية القراءة فقط. الرفع والتعديل والحذف متاح للمسؤولين
            الذين يملكون صلاحية إدارة الصور.
          </CardContent>
        </Card>
      ) : null}

      {canEdit ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="size-5" />
              رفع صورة جديدة
            </CardTitle>
            <CardDescription>
              الصيغ المدعومة: JPEG, PNG, WebP. يتم تحسين الصورة تلقائياً.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleUpload}
              className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
            >
              <div className="space-y-2 md:col-span-2 xl:col-span-4">
                <Label htmlFor="upload-file">ملف الصورة *</Label>
                <Input
                  ref={uploadInputRef}
                  id="upload-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => {
                    setUploadFile(event.target.files?.[0] ?? null);
                  }}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>نوع الاستخدام</Label>
                <Select
                  value={uploadUsageType}
                  onValueChange={(value) =>
                    setUploadUsageType(value as MediaUsageTypeValue)
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEDIA_USAGE_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="upload-alt-ar">النص البديل (عربي)</Label>
                <Input
                  id="upload-alt-ar"
                  value={uploadAltTextAr}
                  onChange={(event) => setUploadAltTextAr(event.target.value)}
                  disabled={isSubmitting}
                  placeholder="وصف الصورة للـ SEO"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="upload-alt-en">Alt text (English)</Label>
                <Input
                  id="upload-alt-en"
                  dir="ltr"
                  value={uploadAltTextEn}
                  onChange={(event) => setUploadAltTextEn(event.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex items-end md:col-span-2 xl:col-span-4">
                <Button type="submit" disabled={isSubmitting || !uploadFile}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      جار الرفع...
                    </>
                  ) : (
                    <>
                      <ImagePlus className="size-4" />
                      رفع الصورة
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <input
        ref={replaceInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          const assetId = replaceTargetIdRef.current;

          if (file && assetId) {
            void handleReplace(file, assetId);
          }
        }}
      />

      {isInitialLoading ? (
        <AdminMediaCardSkeleton count={8} />
      ) : loadError && assets.length === 0 ? (
        <AdminLoadErrorState
          message={loadError}
          onRetry={() => void refreshAssets()}
        />
      ) : filteredCount === 0 ? (
        <AdminEmptyState
          title="لا توجد صور بعد"
          description={
            canEdit
              ? "ارفع أول صورة لاستخدامها في الشعار، المنيو، العروض، أو المعرض."
              : "لم يتم رفع أي صور إلى المكتبة بعد."
          }
        />
      ) : (
        <div
          className={cn(
            "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
            isRefreshing && "opacity-80 transition-opacity",
          )}
        >
          {assets.map((asset) => {
            const usageLabels = getActiveUsageLabels(asset.usage);

            return (
              <Card key={asset.id} className="overflow-hidden pt-0">
                <button
                  type="button"
                  className="bg-muted relative aspect-square w-full overflow-hidden"
                  onClick={() => openPreview(asset)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset.thumbnailUrl || asset.publicUrl}
                    alt={asset.translations.ar?.altText ?? asset.originalFilename ?? ""}
                    className="size-full object-cover transition-transform hover:scale-105"
                  />
                  <div className="absolute top-2 start-2 flex flex-wrap gap-1">
                    <Badge variant={asset.isInUse ? "default" : "secondary"}>
                      {asset.isInUse ? "مستخدمة" : "غير مستخدمة"}
                    </Badge>
                  </div>
                </button>

                <CardContent className="space-y-3 pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-sm font-medium">
                        {asset.originalFilename ?? asset.id}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {getUsageTypeLabel(asset.usageType)}
                        {asset.width && asset.height
                          ? ` · ${asset.width}×${asset.height}`
                          : ""}
                        {` · ${formatFileSize(asset.fileSize)}`}
                      </p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <MoreVertical className="size-4" />
                          <span className="sr-only">إجراءات</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => openPreview(asset)}>
                          <Eye className="size-4" />
                          معاينة
                        </DropdownMenuItem>
                        {canEdit ? (
                          <>
                            <DropdownMenuItem onClick={() => openRename(asset)}>
                              <Pencil className="size-4" />
                              إعادة تسمية
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => triggerReplace(asset.id)}
                              disabled={isSubmitting}
                            >
                              <RefreshCw className="size-4" />
                              استبدال الصورة
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              disabled={asset.isInUse}
                              onClick={() => openDelete(asset)}
                            >
                              <Trash2 className="size-4" />
                              {asset.isInUse ? "محذوفة (مستخدمة)" : "حذف"}
                            </DropdownMenuItem>
                          </>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {usageLabels.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {usageLabels.map((label) => (
                        <Badge key={label} variant="outline" className="text-[10px]">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-xs">
                      غير مرتبطة بأي محتوى حالياً
                    </p>
                  )}

                  <p className="text-muted-foreground text-xs">
                    {formatMediaDate(asset.createdAt)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={dialogMode === "preview" && selectedAsset !== null}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          {selectedAsset ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  {selectedAsset.originalFilename ?? selectedAsset.id}
                </DialogTitle>
                <DialogDescription>
                  {getUsageTypeLabel(selectedAsset.usageType)} ·{" "}
                  {selectedAsset.width}×{selectedAsset.height} ·{" "}
                  {formatFileSize(selectedAsset.fileSize)}
                </DialogDescription>
              </DialogHeader>

              <div className="bg-muted max-h-[60vh] overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedAsset.publicUrl}
                  alt={
                    selectedAsset.translations.ar?.altText ??
                    selectedAsset.originalFilename ??
                    ""
                  }
                  className="mx-auto max-h-[60vh] w-full object-contain"
                />
              </div>

              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground mb-1">النص البديل (عربي)</p>
                  <p>{selectedAsset.translations.ar?.altText ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Alt text (English)</p>
                  <p dir="ltr">{selectedAsset.translations.en?.altText ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">حالة الاستخدام</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedAsset.isInUse ? (
                      getActiveUsageLabels(selectedAsset.usage).map((label) => (
                        <Badge key={label} variant="outline">
                          {label}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="secondary">غير مستخدمة</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">تاريخ الرفع</p>
                  <p>{formatMediaDate(selectedAsset.createdAt)}</p>
                </div>
              </div>

              {canEdit ? (
                <DialogFooter className="gap-2 sm:justify-start">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogMode("rename");
                    }}
                  >
                    <Pencil className="size-4" />
                    إعادة تسمية
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => triggerReplace(selectedAsset.id)}
                    disabled={isSubmitting}
                  >
                    <RefreshCw className="size-4" />
                    استبدال
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={selectedAsset.isInUse || isSubmitting}
                    onClick={() => setDialogMode("delete")}
                  >
                    <Trash2 className="size-4" />
                    حذف
                  </Button>
                </DialogFooter>
              ) : null}
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialogMode === "rename" && selectedAsset !== null}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
          }
        }}
      >
        <DialogContent>
          <form onSubmit={handleRenameSubmit}>
            <DialogHeader>
              <DialogTitle>إعادة تسمية الصورة</DialogTitle>
              <DialogDescription>
                تحديث اسم الملف والنص البديل للصورة.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rename-filename">اسم الملف</Label>
                <Input
                  id="rename-filename"
                  value={renameFilename}
                  onChange={(event) => setRenameFilename(event.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rename-alt-ar">النص البديل (عربي)</Label>
                <Input
                  id="rename-alt-ar"
                  value={renameAltTextAr}
                  onChange={(event) => setRenameAltTextAr(event.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rename-caption-ar">التعليق (عربي)</Label>
                <Textarea
                  id="rename-caption-ar"
                  value={renameCaptionAr}
                  onChange={(event) => setRenameCaptionAr(event.target.value)}
                  disabled={isSubmitting}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rename-alt-en">Alt text (English)</Label>
                <Input
                  id="rename-alt-en"
                  dir="ltr"
                  value={renameAltTextEn}
                  onChange={(event) => setRenameAltTextEn(event.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                disabled={isSubmitting}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    جار الحفظ...
                  </>
                ) : (
                  "حفظ"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialogMode === "delete" && selectedAsset !== null}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف الصورة</DialogTitle>
            <DialogDescription>
              {selectedAsset?.isInUse
                ? "لا يمكن حذف هذه الصورة لأنها مستخدمة في المحتوى."
                : "هل أنت متأكد من حذف هذه الصورة؟ لا يمكن التراجع عن هذا الإجراء."}
            </DialogDescription>
          </DialogHeader>

          {selectedAsset?.isInUse ? (
            <div className="flex flex-wrap gap-1">
              {getActiveUsageLabels(selectedAsset.usage).map((label) => (
                <Badge key={label} variant="outline">
                  {label}
                </Badge>
              ))}
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>
              إلغاء
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={selectedAsset?.isInUse || isSubmitting}
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
