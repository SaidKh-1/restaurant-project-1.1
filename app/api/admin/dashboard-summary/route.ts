import { getDashboardSummary } from "@/lib/api/dashboard-summary";
import { jsonError } from "@/lib/api/http";
import {
  AuthorizationError,
  requireStaffOrAbove,
} from "@/lib/authorization";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const authorization = await requireStaffOrAbove();
    const data = await getDashboardSummary(authorization.user.restaurantId);

    if (!data) {
      return jsonError("Restaurant settings were not found.", 404);
    }

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to load dashboard summary.", 500);
  }
}
