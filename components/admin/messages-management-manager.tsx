"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Eye,
  Loader2,
  Mail,
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
import { MessageDetailsDialog } from "@/components/admin/message-details-dialog";
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
import {
  buildEmailReplyLink,
  buildPhoneCallLink,
  buildWhatsAppReplyLink,
  CONTACT_PREFERENCE_LABELS,
  formatMessageDate,
  getContactPreferences,
  getMessageStatusLabel,
  getMessageStatusVariant,
  MESSAGE_STATUS_FILTER_OPTIONS,
} from "@/lib/admin/messages";
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
  ContactMessageData,
} from "@/lib/admin/types";
import { cn } from "@/lib/utils";

function applyMessagesStatusFilter(
  items: ContactMessageData[],
  filter: string,
): ContactMessageData[] {
  if (filter === "all") {
    return items;
  }

  return items.filter((item) => item.status === filter);
}

export function MessagesManagementManager() {
  const canEdit = useAdminCanEdit("messages.manage");
  const { isInitialLoading, isRefreshing, beginLoad, endLoad } =
    useAdminFetchState();
  const [messages, setMessages] = useState<ContactMessageData[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMessage, setSelectedMessage] =
    useState<ContactMessageData | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessageData | null>(
    null,
  );

  async function fetchMessagesList(filter: string, force = false) {
    const query =
      filter !== "all" ? `?status=${encodeURIComponent(filter)}` : "";
    return adminGet<ContactMessageData[]>(`/api/admin/messages${query}`, {
      force,
      errorMessage: "تعذر تحميل الرسائل.",
    });
  }

  const refreshMessages = useCallback(
    async (filter = statusFilter) => {
      beginLoad();

      try {
        const data = await fetchMessagesList(filter, true);
        setMessages(data);
        setLoadError(null);
        endLoad(true);
      } catch (error) {
        setLoadError(
          error instanceof Error ? error.message : "تعذر تحميل الرسائل.",
        );
        endLoad(false);
      }
    },
    [statusFilter, beginLoad, endLoad],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      beginLoad();

      try {
        const data = await fetchMessagesList("all");

        if (!cancelled) {
          setMessages(data);
          setLoadError(null);
          endLoad(true);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "تعذر تحميل الرسائل.",
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

  async function fetchMessagesForFilter(filter: string) {
    beginLoad();

    try {
      const data = await fetchMessagesList(filter);
      setMessages(data);
      setLoadError(null);
      endLoad(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "تعذر تحميل الرسائل.",
      );
      endLoad(false);
    }
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    void fetchMessagesForFilter(value);
  };

  function openDetails(message: ContactMessageData) {
    setSelectedMessage(message);
    setDetailsOpen(true);
  }

  async function patchMessage(
    message: ContactMessageData,
    body: Record<string, unknown>,
    successMessage: string,
  ) {
    if (!canEdit) {
      return;
    }

    const previousMessages = messages;
    const previousSelectedMessage = selectedMessage;
    const optimisticPatch = body as Partial<ContactMessageData>;

    setMessages((current) =>
      applyMessagesStatusFilter(
        patchById(current, message.id, optimisticPatch),
        statusFilter,
      ),
    );
    setSelectedMessage((current) =>
      current?.id === message.id
        ? { ...current, ...optimisticPatch }
        : current,
    );

    try {
      const response = await fetch(`/api/admin/messages/${message.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorPayload = (await response.json()) as ApiErrorResponse;
        throw new Error(errorPayload.error?.message ?? "تعذر تحديث الرسالة.");
      }

      const payload =
        (await response.json()) as ApiResponse<ContactMessageData>;
      toast.success(successMessage);
      invalidateAdminCacheUrls([
        ADMIN_API_CACHE.messages,
        ADMIN_API_CACHE.dashboard,
      ]);
      setMessages((current) =>
        applyMessagesStatusFilter(
          upsertById(current, payload.data),
          statusFilter,
        ),
      );
      setSelectedMessage((current) =>
        current?.id === payload.data.id ? payload.data : current,
      );
    } catch (error) {
      setMessages(previousMessages);
      setSelectedMessage(previousSelectedMessage);
      toast.error(
        error instanceof Error ? error.message : "تعذر تحديث الرسالة.",
      );
    }
  }

  async function handleMarkRead(message: ContactMessageData) {
    await patchMessage(message, { isRead: true }, "تم تعليم الرسالة كمقروءة.");
  }

  async function handleMarkUnread(message: ContactMessageData) {
    await patchMessage(
      message,
      { isRead: false },
      "تم تعليم الرسالة كغير مقروءة.",
    );
  }

  async function handleArchive(message: ContactMessageData) {
    await patchMessage(message, { status: "ARCHIVED" }, "تمت أرشفة الرسالة.");
  }

  function requestDelete(message: ContactMessageData) {
    setDeleteTarget(message);
  }

  async function handleDelete() {
    if (!canEdit || !deleteTarget) {
      return;
    }

    setIsSubmitting(true);
    const deletedMessage = deleteTarget;
    setMessages((current) => removeById(current, deletedMessage.id));
    setDeleteTarget(null);
    setDetailsOpen(false);
    setSelectedMessage(null);

    try {
      const response = await fetch(
        `/api/admin/messages/${deletedMessage.id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!response.ok) {
        const errorPayload = (await response.json()) as ApiErrorResponse;
        throw new Error(errorPayload.error?.message ?? "تعذر حذف الرسالة.");
      }

      toast.success("تم حذف الرسالة.");
      invalidateAdminCacheUrls([
        ADMIN_API_CACHE.messages,
        ADMIN_API_CACHE.dashboard,
      ]);
    } catch (error) {
      setMessages((current) => upsertById(current, deletedMessage));
      toast.error(
        error instanceof Error ? error.message : "تعذر حذف الرسالة.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="رسائل التواصل"
        description="قراءة رسائل العملاء والرد عليهم عبر واتساب أو الهاتف أو البريد."
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={() => void refreshMessages()}
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
            صلاحية إدارة الرسائل.
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="تصفية حسب الحالة" />
          </SelectTrigger>
          <SelectContent>
            {MESSAGE_STATUS_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-muted-foreground text-sm">
          {messages.length} رسالة
        </p>
      </div>

      {isInitialLoading ? (
        <AdminTableSkeleton />
      ) : loadError && messages.length === 0 ? (
        <AdminLoadErrorState
          message={loadError}
          onRetry={() => void refreshMessages()}
        />
      ) : messages.length === 0 ? (
        <AdminEmptyState
          title={`لا توجد رسائل${statusFilter !== "all" ? " بهذه الحالة" : ""} بعد.`}
        />
      ) : (
        <div
          className={cn(
            "space-y-3",
            isRefreshing && "opacity-80 transition-opacity",
          )}
        >
          {messages.map((message) => {
            const preferences = getContactPreferences(message);
            const whatsappLink = buildWhatsAppReplyLink(
              message.phoneOrWhatsapp,
              message,
            );
            const callLink = buildPhoneCallLink(message.phoneOrWhatsapp);
            const emailLink = buildEmailReplyLink(message);

            return (
              <Card
                key={message.id}
                className={cn(
                  message.status === "NEW" && "border-primary/40 bg-primary/5",
                )}
              >
                <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle
                        className={cn(
                          "text-base",
                          message.status === "NEW" && "font-bold",
                        )}
                      >
                        {message.subject}
                      </CardTitle>
                      <Badge variant={getMessageStatusVariant(message.status)}>
                        {getMessageStatusLabel(message.status)}
                      </Badge>
                    </div>
                    <CardDescription className="flex flex-wrap items-center gap-2">
                      <span>{message.name}</span>
                      <span>·</span>
                      <span>{formatMessageDate(message.createdAt)}</span>
                      {preferences.map((preference) => (
                        <Badge key={preference} variant="outline">
                          {CONTACT_PREFERENCE_LABELS[preference]}
                        </Badge>
                      ))}
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
                      <DropdownMenuItem onClick={() => openDetails(message)}>
                        <Eye className="size-4" />
                        عرض التفاصيل
                      </DropdownMenuItem>
                      {canEdit ? (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => requestDelete(message)}
                          >
                            <Trash2 className="size-4" />
                            حذف
                          </DropdownMenuItem>
                        </>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  <p className="text-muted-foreground line-clamp-3 text-sm">
                    {message.message}
                  </p>

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
                    {emailLink ? (
                      <Button type="button" size="sm" variant="outline" asChild>
                        <a href={emailLink}>
                          <Mail className="size-4" />
                          بريد
                        </a>
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      size="sm"
                      variant="link"
                      className="h-8 px-2"
                      onClick={() => openDetails(message)}
                    >
                      عرض التفاصيل
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <MessageDetailsDialog
        message={selectedMessage}
        open={detailsOpen}
        canEdit={canEdit}
        isSubmitting={isSubmitting}
        onOpenChange={(open) => {
          setDetailsOpen(open);
          if (!open) {
            setSelectedMessage(null);
          }
        }}
        onMarkRead={(message) => void handleMarkRead(message)}
        onMarkUnread={(message) => void handleMarkUnread(message)}
        onArchive={(message) => void handleArchive(message)}
        onDelete={(message) => requestDelete(message)}
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
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل تريد حذف رسالة «{deleteTarget?.subject}»؟ لا يمكن التراجع عن
              هذا الإجراء.
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
