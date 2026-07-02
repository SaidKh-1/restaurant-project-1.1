import {
  archiveContactMessage,
  getContactMessageRecord,
  markContactMessageRead,
} from "@/lib/api/contact-messages";
import {
  AuthorizationError,
  hasPermission,
  requireAdminOrSuperAdmin,
  requireStaffOrAbove,
} from "@/lib/authorization";
import { prisma } from "@/lib/db";
import { jsonError, isRecordNotFoundError } from "@/lib/api/http";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const messageStatusSchema = z.enum(["NEW", "READ", "ARCHIVED", "DELETED"]);

const updateContactMessageSchema = z
  .object({
    status: messageStatusSchema.optional(),
    isRead: z.boolean().optional(),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.status && value.isRead !== undefined) {
      context.addIssue({
        code: "custom",
        message: "Use either status or isRead, not both.",
        path: ["isRead"],
      });
    }
  });

type UpdateContactMessageInput = z.infer<typeof updateContactMessageSchema>;

type RouteContext = {
  params: Promise<{ messageId: string }>;
};

async function updateContactMessage(
  restaurantId: string,
  messageId: string,
  input: UpdateContactMessageInput,
) {
  const existingMessage = await prisma.contactMessage.findFirst({
    where: {
      id: messageId,
      restaurantId,
    },
  });

  if (!existingMessage) {
    return null;
  }

  if (input.isRead !== undefined) {
    await markContactMessageRead(messageId, input.isRead);
  } else if (input.status === "READ") {
    await markContactMessageRead(messageId, true);
  } else if (input.status === "NEW") {
    await markContactMessageRead(messageId, false);
  } else if (input.status === "ARCHIVED") {
    await archiveContactMessage(messageId);
  } else if (input.status === "DELETED") {
    await prisma.contactMessage.update({
      where: { id: messageId },
      data: {
        status: "DELETED",
      },
    });
  }

  return getContactMessageRecord(restaurantId, messageId);
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const authorization = await requireStaffOrAbove();
    const { messageId } = await context.params;
    const message = await getContactMessageRecord(
      authorization.user.restaurantId,
      messageId,
    );

    if (!message) {
      return jsonError("Contact message was not found.", 404);
    }

    return NextResponse.json({
      data: message,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to load contact message.", 500);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "messages.manage")) {
      return jsonError("messages.manage permission required.", 403);
    }

    const { messageId } = await context.params;
    const body = await request.json();
    const parsed = updateContactMessageSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid contact message payload.", 400, {
        issues: parsed.error.issues,
      });
    }

    const message = await updateContactMessage(
      authorization.user.restaurantId,
      messageId,
      parsed.data,
    );

    if (!message) {
      return jsonError("Contact message was not found.", 404);
    }

    return NextResponse.json({
      data: message,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    if (isRecordNotFoundError(error)) {
      return jsonError("Contact message was not found.", 404);
    }

    return jsonError("Unable to update contact message.", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "messages.manage")) {
      return jsonError("messages.manage permission required.", 403);
    }

    const { messageId } = await context.params;
    const existingMessage = await prisma.contactMessage.findFirst({
      where: {
        id: messageId,
        restaurantId: authorization.user.restaurantId,
      },
    });

    if (!existingMessage) {
      return jsonError("Contact message was not found.", 404);
    }

    await prisma.contactMessage.delete({
      where: { id: messageId },
    });

    return NextResponse.json({
      data: {
        id: messageId,
        deleted: true,
      },
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to delete contact message.", 500);
  }
}
