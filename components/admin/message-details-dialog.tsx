"use client";

import {
  Archive,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Trash2,
} from "lucide-react";

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
import {
  buildEmailReplyLink,
  buildPhoneCallLink,
  buildWhatsAppReplyLink,
  CONTACT_PREFERENCE_LABELS,
  formatMessageDate,
  getContactPreferences,
  getMessageStatusLabel,
  getMessageStatusVariant,
} from "@/lib/admin/messages";
import type { ContactMessageData } from "@/lib/admin/types";

type MessageDetailsDialogProps = {
  message: ContactMessageData | null;
  open: boolean;
  canEdit: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkRead: (message: ContactMessageData) => void;
  onMarkUnread: (message: ContactMessageData) => void;
  onArchive: (message: ContactMessageData) => void;
  onDelete: (message: ContactMessageData) => void;
};

export function MessageDetailsDialog({
  message,
  open,
  canEdit,
  isSubmitting,
  onOpenChange,
  onMarkRead,
  onMarkUnread,
  onArchive,
  onDelete,
}: MessageDetailsDialogProps) {
  if (!message) {
    return null;
  }

  const preferences = getContactPreferences(message);
  const whatsappLink = buildWhatsAppReplyLink(message.phoneOrWhatsapp, message);
  const callLink = buildPhoneCallLink(message.phoneOrWhatsapp);
  const emailLink = buildEmailReplyLink(message);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{message.subject}</DialogTitle>
          <DialogDescription>
            من: {message.name} · {formatMessageDate(message.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={getMessageStatusVariant(message.status)}>
              {getMessageStatusLabel(message.status)}
            </Badge>
            {preferences.map((preference) => (
              <Badge key={preference} variant="outline">
                {CONTACT_PREFERENCE_LABELS[preference]}
              </Badge>
            ))}
          </div>

          <div className="space-y-3 rounded-lg border border-dashed bg-muted/40 p-4">
            <p className="text-sm font-medium">بيانات التواصل (خاصة بالمسؤول)</p>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">الاسم</dt>
                <dd className="font-medium">{message.name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">الهاتف / واتساب</dt>
                <dd dir="ltr" className="font-medium break-all">
                  {message.phoneOrWhatsapp}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">البريد الإلكتروني</dt>
                <dd dir="ltr" className="font-medium break-all">
                  {message.email ?? "—"}
                </dd>
              </div>
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
                  رد عبر واتساب
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
            {emailLink ? (
              <Button type="button" size="sm" variant="outline" asChild>
                <a href={emailLink}>
                  <Mail className="size-4" />
                  رد بالبريد
                </a>
              </Button>
            ) : null}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">نص الرسالة</p>
            <p className="whitespace-pre-wrap rounded-lg border bg-background p-4 text-sm leading-relaxed">
              {message.message}
            </p>
          </div>

          {message.readAt ? (
            <p className="text-muted-foreground text-sm">
              تمت القراءة في {formatMessageDate(message.readAt)}
            </p>
          ) : null}
          {message.archivedAt ? (
            <p className="text-muted-foreground text-sm">
              تمت الأرشفة في {formatMessageDate(message.archivedAt)}
            </p>
          ) : null}
        </div>

        {canEdit ? (
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {!message.isRead ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onMarkRead(message)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  تعليم كمقروء
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onMarkUnread(message)}
                  disabled={isSubmitting}
                >
                  تعليم كغير مقروء
                </Button>
              )}
              {message.status !== "ARCHIVED" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onArchive(message)}
                  disabled={isSubmitting}
                >
                  <Archive className="size-4" />
                  أرشفة
                </Button>
              ) : null}
            </div>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => onDelete(message)}
              disabled={isSubmitting}
            >
              <Trash2 className="size-4" />
              حذف
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
