import {
  getAdminReservationRecord,
  updateAdminReservationWorkflowStatus,
} from "@/lib/api/admin-reservations";
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

const workflowStatusSchema = z.enum([
  "pending",
  "confirmed",
  "cancelled",
  "completed",
  "archived",
]);

const updateReservationSchema = z
  .object({
    workflowStatus: workflowStatusSchema,
  })
  .strict();

type RouteContext = {
  params: Promise<{ reservationId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const authorization = await requireStaffOrAbove();
    const { reservationId } = await context.params;
    const reservation = await getAdminReservationRecord(
      authorization.user.restaurantId,
      reservationId,
    );

    if (!reservation) {
      return jsonError("Reservation was not found.", 404);
    }

    return NextResponse.json({
      data: reservation,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to load reservation.", 500);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "reservations.manage")) {
      return jsonError("reservations.manage permission required.", 403);
    }

    const { reservationId } = await context.params;
    const body = await request.json();
    const parsed = updateReservationSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid reservation payload.", 400, {
        issues: parsed.error.issues,
      });
    }

    const reservation = await updateAdminReservationWorkflowStatus(
      authorization.user.restaurantId,
      reservationId,
      parsed.data.workflowStatus,
      authorization.user.id,
    );

    if (!reservation) {
      return jsonError("Reservation was not found.", 404);
    }

    return NextResponse.json({
      data: reservation,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    if (isRecordNotFoundError(error)) {
      return jsonError("Reservation was not found.", 404);
    }

    return jsonError("Unable to update reservation.", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const authorization = await requireAdminOrSuperAdmin();

    if (!hasPermission(authorization, "reservations.manage")) {
      return jsonError("reservations.manage permission required.", 403);
    }

    const { reservationId } = await context.params;
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        id: reservationId,
        restaurantId: authorization.user.restaurantId,
      },
    });

    if (!existingReservation) {
      return jsonError("Reservation was not found.", 404);
    }

    await prisma.reservation.delete({
      where: { id: reservationId },
    });

    return NextResponse.json({
      data: {
        id: reservationId,
        deleted: true,
      },
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to delete reservation.", 500);
  }
}
