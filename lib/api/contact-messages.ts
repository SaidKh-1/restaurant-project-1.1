import { prisma } from "@/lib/db";
import type { MessageStatus, Prisma } from "@/lib/generated/prisma/client";

export type ContactMessageRecord = Prisma.ContactMessageGetPayload<object>;

export function serializeContactMessage(message: ContactMessageRecord) {
  return {
    id: message.id,
    name: message.name,
    phoneOrWhatsapp: message.phoneOrWhatsapp,
    email: message.email,
    subject: message.subject,
    message: message.message,
    status: message.status,
    isRead: message.status === "READ" || message.readAt !== null,
    readAt: message.readAt,
    archivedAt: message.archivedAt,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
}

export async function listContactMessages(
  restaurantId: string,
  filters?: {
    status?: MessageStatus;
  },
) {
  const messages = await prisma.contactMessage.findMany({
    where: {
      restaurantId,
      ...(filters?.status ? { status: filters.status } : {}),
    },
    orderBy: [{ createdAt: "desc" }],
  });

  return messages.map(serializeContactMessage);
}

export async function getContactMessageRecord(
  restaurantId: string,
  messageId: string,
) {
  const message = await prisma.contactMessage.findFirst({
    where: {
      id: messageId,
      restaurantId,
    },
  });

  return message ? serializeContactMessage(message) : null;
}

export async function markContactMessageRead(
  messageId: string,
  read: boolean,
) {
  return prisma.contactMessage.update({
    where: { id: messageId },
    data: read
      ? {
          status: "READ",
          readAt: new Date(),
        }
      : {
          status: "NEW",
          readAt: null,
        },
  });
}

export async function archiveContactMessage(messageId: string) {
  return prisma.contactMessage.update({
    where: { id: messageId },
    data: {
      status: "ARCHIVED",
      archivedAt: new Date(),
    },
  });
}
