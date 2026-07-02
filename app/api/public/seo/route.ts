import { listSeoEntries } from "@/lib/api/seo-entries";
import { getDefaultRestaurantWithSettings } from "@/lib/api/reviews";
import { jsonError } from "@/lib/api/http";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const restaurant = await getDefaultRestaurantWithSettings();
    const { searchParams } = new URL(request.url);
    const pageKey = searchParams.get("pageKey") ?? undefined;

    if (pageKey !== undefined && pageKey.trim().length === 0) {
      return jsonError("pageKey must not be empty.", 400);
    }

    const entries = await listSeoEntries(restaurant.id, {
      pageKey,
      indexableOnly: true,
    });

    if (pageKey) {
      if (entries.length === 0) {
        return jsonError("SEO entry was not found.", 404);
      }

      return NextResponse.json({
        data: entries[0],
      });
    }

    return NextResponse.json({
      data: entries,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("restaurant")) {
      return jsonError(error.message, 404);
    }

    return jsonError("Unable to load public SEO entries.", 500);
  }
}
