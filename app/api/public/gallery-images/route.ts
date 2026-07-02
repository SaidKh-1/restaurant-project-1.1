import { listPublicGalleryImages } from "@/lib/api/public-gallery";
import { getDefaultRestaurantWithSettings } from "@/lib/api/reviews";
import { jsonError } from "@/lib/api/http";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const restaurant = await getDefaultRestaurantWithSettings();
    const { searchParams } = new URL(request.url);
    const galleryCategoryId = searchParams.get("galleryCategoryId") ?? undefined;

    if (
      galleryCategoryId !== undefined &&
      galleryCategoryId.trim().length === 0
    ) {
      return jsonError("galleryCategoryId must not be empty.", 400);
    }

    return NextResponse.json({
      data: await listPublicGalleryImages(restaurant.id, {
        galleryCategoryId,
      }),
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("restaurant")) {
      return jsonError(error.message, 404);
    }

    return jsonError("Unable to load public gallery images.", 500);
  }
}
