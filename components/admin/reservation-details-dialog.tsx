"use client";

import { Loader2, MessageCircle, Phone, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
  formatReservationDateTime,
  getReservationWorkflowStatusLabel,
  getReservationWorkflowStatusVariant,
  RESERVATION_WORKFLOW_STATUS_OPTIONS,
} from "@/lib/admin/reservations";
import type { ReservationData } from "@/lib/admin/types";

type ReservationDetailsDialogProps = {
  reservation: ReservationData | null;
  open: boolean;
  canEdit: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onWorkflowStatusChange: (
    reservation: ReservationData,
    workflowStatus: ReservationData["workflowStatus"],
  ) => void;
  onDelete: (reservation: ReservationData) => void;
};

export function ReservationDetailsDialog({
  reservation,
  open,
  canEdit,
  isSubmitting,
  onOpenChange,
  onWorkflowStatusChange,
  onDelete,
}: ReservationDetailsDialogProps) {
  if (!reservation) {
    return null;
  }

  const whatsappLink = buildWhatsAppReservationLink(
    reservation.phone,
    reservation,
  );
  const callLink = buildPhoneReservationLink(reservation.phone);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تفاصيل الحجز</DialogTitle>
          <DialogDescription>
            بيانات العميل (الهاتف/واتساب) خاصة بالمسؤول فقط.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={getReservationWorkflowStatusVariant(
                reservation.workflowStatus,
              )}
            >
              {getReservationWorkflowStatusLabel(reservation.workflowStatus)}
            </Badge>
            <Badge variant="outline">{reservation.guests} ضيوف</Badge>
          </div>

          <div className="space-y-3 rounded-lg border border-dashed bg-muted/40 p-4">
            <p className="text-sm font-medium">بيانات العميل (خاصة)</p>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">الاسم</dt>
                <dd className="font-medium">{reservation.name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">الهاتف / واتساب</dt>
                <dd dir="ltr" className="font-medium break-all">
                  {reservation.phone}
                </dd>
              </div>
              {reservation.email ? (
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">البريد الإلكتروني</dt>
                  <dd dir="ltr" className="font-medium break-all">
                    {reservation.email}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>

          <div className="flex flex-wrap gap-2">
            {whatsappLink ? (
              <Button type="button" size="sm" asChild>
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
          </div>

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">التاريخ</dt>
              <dd className="font-medium">
                {formatReservationDate(reservation.reservationDate)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">الوقت</dt>
              <dd dir="ltr" className="font-medium">
                {reservation.reservationTime}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">عدد الضيوف</dt>
              <dd className="font-medium">{reservation.guests}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">تاريخ الطلب</dt>
              <dd>{formatReservationDateTime(reservation.createdAt)}</dd>
            </div>
          </dl>

          {reservation.notes ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">ملاحظات</p>
              <p className="text-muted-foreground rounded-lg border bg-muted/30 p-3 text-sm leading-7 whitespace-pre-line">
                {reservation.notes}
              </p>
            </div>
          ) : null}

          {canEdit ? (
            <div className="space-y-2">
              <Label htmlFor="reservation-workflow-status">تحديث الحالة</Label>
              <Select
                value={reservation.workflowStatus}
                onValueChange={(value) =>
                  onWorkflowStatusChange(
                    reservation,
                    value as ReservationData["workflowStatus"],
                  )
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="reservation-workflow-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESERVATION_WORKFLOW_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {reservation.handledBy ? (
            <p className="text-muted-foreground text-xs">
              آخر معالجة: {reservation.handledBy.name}
              {reservation.handledAt
                ? ` · ${formatReservationDateTime(reservation.handledAt)}`
                : ""}
            </p>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          {canEdit ? (
            <Button
              type="button"
              variant="destructive"
              onClick={() => onDelete(reservation)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              حذف
            </Button>
          ) : (
            <span />
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
