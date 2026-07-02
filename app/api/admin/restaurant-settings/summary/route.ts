import {
  getRestaurantSettingsSummaryRecord,
  serializeRestaurantSettingsSummary,
} from "@/lib/api/restaurant-settings-summary";
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
    const restaurant = await getRestaurantSettingsSummaryRecord(
      authorization.user.restaurantId,
    );

    if (!restaurant) {
      return jsonError("Restaurant settings were not found.", 404);
    }

    return NextResponse.json({
      data: serializeRestaurantSettingsSummary(restaurant),
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return jsonError(error.message, error.status);
    }

    return jsonError("Unable to load restaurant settings summary.", 500);
  }
}
