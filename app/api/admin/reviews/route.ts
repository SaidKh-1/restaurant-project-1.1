import { listAdminReviews } from "@/lib/api/reviews";
import {
  AuthorizationError,
  requireStaffOrAbove,
} from "@/lib/authorization";
import { jsonError } from "@/lib/api/http";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const reviewStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "ARCHIVED",
  "DELETED",
]);

export async function GET(request: Request) {
  try {
    const authorization = await requireStaffOrAbove();
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const isFeaturedParam = searchParams.get("isFeatured");

    const statusResult = statusParam
      ? reviewStatusSchema.safeParse(statusParam)
      : null;

    if (statusResult && !statusResult.success) {
      return jsonError("Invalid status filter.", 400);
    }

    let isFeatured: boolean | undefined;

    if (isFeaturedParam !== null) {
      if (isFeaturedParam !== "true" && isFeaturedParam !== "false") {
        return jsonError("isFeatured filter must be true or false.", 400);
      }

      isFeatured = isFeaturedParam === "true";
    }

    return NextResponse.json({
      data: await listAdminReviews(authorization.user.restaurantId, {
        status: statusResult?.success ? statusResult.data : undefined,
        isFeatured,
      }),
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to load reviews.", 500);
  }
}
