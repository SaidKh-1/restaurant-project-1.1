import {
  listAdminReservations,
  type ReservationWorkflowStatus,
} from "@/lib/api/admin-reservations";
import {
  AuthorizationError,
  requireStaffOrAbove,
} from "@/lib/authorization";
import { jsonError } from "@/lib/api/http";
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

export async function GET(request: Request) {
  try {
    const authorization = await requireStaffOrAbove();
    const { searchParams } = new URL(request.url);
    const workflowStatusParam = searchParams.get("workflowStatus");

    const workflowStatusResult = workflowStatusParam
      ? workflowStatusSchema.safeParse(workflowStatusParam)
      : null;

    if (workflowStatusResult && !workflowStatusResult.success) {
      return jsonError("Invalid workflow status filter.", 400);
    }

    return NextResponse.json({
      data: await listAdminReservations(authorization.user.restaurantId, {
        workflowStatus: workflowStatusResult?.success
          ? (workflowStatusResult.data as ReservationWorkflowStatus)
          : undefined,
      }),
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to load reservations.", 500);
  }
}
