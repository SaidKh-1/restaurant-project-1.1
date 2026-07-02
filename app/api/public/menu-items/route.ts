import { listPublicMenuItems } from "@/lib/api/public-menu";
import { getDefaultRestaurantWithSettings } from "@/lib/api/reviews";
import { jsonError } from "@/lib/api/http";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const restaurant = await getDefaultRestaurantWithSettings();
    const { searchParams } = new URL(request.url);
    const menuCategoryId = searchParams.get("menuCategoryId") ?? undefined;

    if (menuCategoryId !== undefined && menuCategoryId.trim().length === 0) {
      return jsonError("menuCategoryId must not be empty.", 400);
    }

    return NextResponse.json({
      data: await listPublicMenuItems(restaurant.id, {
        menuCategoryId,
      }),
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("restaurant")) {
      return jsonError(error.message, 404);
    }

    return jsonError("Unable to load public menu items.", 500);
  }
}
