import { listContactMessages } from "@/lib/api/contact-messages";
import {
  AuthorizationError,
  requireStaffOrAbove,
} from "@/lib/authorization";
import { jsonError } from "@/lib/api/http";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const messageStatusSchema = z.enum(["NEW", "READ", "ARCHIVED", "DELETED"]);

export async function GET(request: Request) {
  try {
    const authorization = await requireStaffOrAbove();
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");

    const statusResult = statusParam
      ? messageStatusSchema.safeParse(statusParam)
      : null;

    if (statusResult && !statusResult.success) {
      return jsonError("Invalid status filter.", 400);
    }

    return NextResponse.json({
      data: await listContactMessages(authorization.user.restaurantId, {
        status: statusResult?.success ? statusResult.data : undefined,
      }),
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to load contact messages.", 500);
  }
}
