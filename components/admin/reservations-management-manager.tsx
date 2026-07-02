"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Eye,
  Loader2,
  MessageCircle,
  MoreVertical,
  Phone,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  AdminEmptyState,
  AdminLoadErrorState,
  AdminTableSkeleton,
} from "@/components/admin/admin-content-states";
import { useAdminCanEdit } from "@/components/admin/admin-permissions-provider";
import { ReservationDetailsDialog } from "@/components/admin/reservation-details-dialog";
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
import {
  buildPhoneReservationLink,
  buildWhatsAppReservationLink,
  formatReservationDate,
  getReservationWorkflowStatusLabel,
  getReservationWorkflowStatusVariant,
  RESERVATION_WORKFLOW_FILTER_OPTIONS,
  RESERVATION_WORKFLOW_STATUS_OPTIONS,
} from "@/lib/admin/reservations";
import { adminGet } from "@/lib/admin/fetch-client";
import {
  ADMIN_API_CACHE,
  invalidateAdminCacheUrls,
} from "@/lib/admin/invalidate-cache";
import {
  removeById,
  upsertById,
} from "@/lib/admin/permissions-client";
import { useAdminFetchState } from "@/lib/admin/use-admin-fetch-state";
import type {
  ApiErrorResponse,
  ApiResponse,
  ReservationData,
} from "@/lib/admin/types";
import { cn } from "@/lib/utils";

export function ReservationsManagementManager() {
  const canEdit = useAdminCanEdit("reservations.manage");
  const { isInitialLoading, isRefreshing, beginLoad, endLoad } =
    useAdminFetchState();
  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<ReservationData | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ReservationData | null>(
    null,
  );

  async function fetchReservationsList(filter: string, force = false) {
    const query =
      filter !== "all"
        ? `?workflowStatus=${encodeURIComponent(filter)}`
        : "";
    return adminGet<ReservationData[]>(`/api/admin/reservations${query}`, {
      force,
      errorMessage: "تعذر تحميل الحجوزات.",
    });
  }

  const refreshReservations = useCallback(
    async (filter = statusFilter) => {
      beginLoad();

      try {
        const data = await fetchReservationsList(filter, true);
        setReservations(data);
        setLoadError(null);
        endLoad(true);
      } catch (error) {
        setLoadError(
          error instanceof Error ? error.message : "تعذر تحميل الحجوزات.",
        );
        endLoad(false);
      }
    },
    [beginLoad, endLoad, statusFilter],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      beginLoad();

      try {
        const data = await fetchReservationsList("all");

        if (!cancelled) {
          setReservations(data);
          setLoadError(null);
          endLoad(true);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "تعذر تحميل الحجوزات.",
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

  async function fetchReservationsForFilter(filter: string) {
    beginLoad();

    try {
      const data = await fetchReservationsList(filter, true);
      setReservations(data);
      setLoadError(null);
      endLoad(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "تعذر تحميل الحجوزات.",
      );
      endLoad(false);
    }
  }

  function handleStatusFilterChange(value: string) {
    setStatusFilter(value);
    void fetchReservationsForFilter(value);
  }

  function openDetails(reservation: ReservationData) {
    setSelectedReservation(reservation);
    setDetailsOpen(true);
  }

  async function patchReservation(
    reservation: ReservationData,
    body: { workflowStatus: ReservationData["workflowStatus"] },
    successMessage: string,
  ) {
    if (!canEdit) {
      return;
    }

    setIsSubmitting(true);
    const previousReservations = reservations;
    const previousSelectedReservation = selectedReservation;
    const optimisticReservation = {
      ...reservation,
      workflowStatus: body.workflowStatus,
    };

    setReservations((current) => upsertById(current, optimisticReservation));
    setSelectedReservation(optimisticReservation);

    try {
      const response = await fetch(
        `/api/admin/reservations/${reservation.id}`,
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
        throw new Error(errorPayload.error?.message ?? "تعذر تحديث الحجز.");
      }

      const payload = (await response.json()) as ApiResponse<ReservationData>;
      setReservations((current) => upsertById(current, payload.data));
      setSelectedReservation(payload.data);
      invalidateAdminCacheUrls([
        ADMIN_API_CACHE.reservations,
        ADMIN_API_CACHE.dashboard,
      ]);
      toast.success(successMessage);
    } catch (error) {
      setReservations(previousReservations);
      setSelectedReservation(previousSelectedReservation);
      toast.error(
        error instanceof Error ? error.message : "تعذر تحديث الحجز.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleWorkflowStatusChange(
    reservation: ReservationData,
    workflowStatus: ReservationData["workflowStatus"],
  ) {
    const label = getReservationWorkflowStatusLabel(workflowStatus);
    await patchReservation(
      reservation,
      { workflowStatus },
      `تم تحديث حالة الحجز إلى «${label}».`,
    );
  }

  function requestDelete(reservation: ReservationData) {
    setDeleteTarget(reservation);
  }

  async function handleDelete() {
    if (!canEdit || !deleteTarget) {
      return;
    }

    setIsSubmitting(true);
    const deletedReservation = deleteTarget;
    setReservations((current) => removeById(current, deletedReservation.id));
    setDeleteTarget(null);
    setDetailsOpen(false);
    setSelectedReservation(null);

    try {
      const response = await fetch(
        `/api/admin/reservations/${deletedReservation.id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!response.ok) {
        const errorPayload = (await response.json()) as ApiErrorResponse;
        throw new Error(errorPayload.error?.message ?? "تعذر حذف الحجز.");
      }

      toast.success("تم حذف الحجز.");
      invalidateAdminCacheUrls([
        ADMIN_API_CACHE.reservations,
        ADMIN_API_CACHE.dashboard,
      ]);
    } catch (error) {
      setReservations((current) => upsertById(current, deletedReservation));
      toast.error(
        error instanceof Error ? error.message : "تعذر حذف الحجز.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const visibleReservations = reservations;

  return (
    <div className="space-y-6">
      <PageHeader
        title="الحجوزات"
        description="متابعة طلبات الحجز والتواصل مع العملاء وتأكيد المواعيد."
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={() => void refreshReservations()}
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
            لديك صلاحية القراءة فقط. التعديل والحذف متاحان للمسؤولين الذين
            يملكون صلاحية إدارة الحجوزات.
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="تصفية حسب الحالة" />
          </SelectTrigger>
          <SelectContent>
            {RESERVATION_WORKFLOW_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-muted-foreground text-sm">
          {visibleReservations.length} حجز
        </p>
      </div>

      {isInitialLoading ? (
        <AdminTableSkeleton />
      ) : loadError && reservations.length === 0 ? (
        <AdminLoadErrorState
          message={loadError}
          onRetry={() => void refreshReservations()}
        />
      ) : visibleReservations.length === 0 ? (
        <AdminEmptyState
          title={`لا توجد حجوزات${statusFilter !== "all" ? " بهذه الحالة" : ""} بعد.`}
        />
      ) : (
        <div
          className={cn(
            "space-y-3",
            isRefreshing && "opacity-80 transition-opacity",
          )}
        >
          {visibleReservations.map((reservation) => {
            const whatsappLink = buildWhatsAppReservationLink(
              reservation.phone,
              reservation,
            );
            const callLink = buildPhoneReservationLink(reservation.phone);

            return (
              <Card
                key={reservation.id}
                className={cn(
                  reservation.workflowStatus === "pending" &&
                    "border-primary/40 bg-primary/5",
                )}
              >
                <CardHeader className="gap-3 pb-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-lg">
                          {reservation.name}
                        </CardTitle>
                        <Badge
                          variant={getReservationWorkflowStatusVariant(
                            reservation.workflowStatus,
                          )}
                        >
                          {getReservationWorkflowStatusLabel(
                            reservation.workflowStatus,
                          )}
                        </Badge>
                      </div>
                      <CardDescription className="flex flex-wrap gap-x-4 gap-y-1">
                        <span>
                          {formatReservationDate(reservation.reservationDate)}
                        </span>
                        <span dir="ltr">{reservation.reservationTime}</span>
                        <span>{reservation.guests} ضيوف</span>
                      </CardDescription>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {whatsappLink ? (
                        <Button type="button" size="sm" variant="outline" asChild>
                          <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MessageCircle className="size-4" />
                            واتساب
                          </a>
                        </Button>
                      ) : null}
                      {callLink ? (
                        <Button type="button" size="sm" variant="outline" asChild>
                          <a href={callLink}>
                            <Phone className="size-4" />
                            اتصال
                          </a>
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => openDetails(reservation)}
                      >
                        <Eye className="size-4" />
                        التفاصيل
                      </Button>

                      {canEdit ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button type="button" size="sm" variant="outline">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {RESERVATION_WORKFLOW_STATUS_OPTIONS.map(
                              (option) => (
                                <DropdownMenuItem
                                  key={option.value}
                                  disabled={
                                    reservation.workflowStatus === option.value
                                  }
                                  onClick={() =>
                                    void handleWorkflowStatusChange(
                                      reservation,
                                      option.value,
                                    )
                                  }
                                >
                                  {option.label}
                                </DropdownMenuItem>
                              ),
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => requestDelete(reservation)}
                            >
                              <Trash2 className="size-4" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : null}
                    </div>
                  </div>
                </CardHeader>

                {reservation.notes ? (
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground line-clamp-2 text-sm">
                      {reservation.notes}
                    </p>
                  </CardContent>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}

      <ReservationDetailsDialog
        reservation={selectedReservation}
        open={detailsOpen}
        canEdit={canEdit}
        isSubmitting={isSubmitting}
        onOpenChange={setDetailsOpen}
        onWorkflowStatusChange={handleWorkflowStatusChange}
        onDelete={requestDelete}
      />

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف الحجز</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            هل أنت متأكد من حذف حجز «{deleteTarget?.name}»؟ لا يمكن التراجع عن
            هذا الإجراء.
          </p>
          <DialogFooter>
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
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
