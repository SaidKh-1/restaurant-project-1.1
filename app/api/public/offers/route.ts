import { listActivePublicOffers } from "@/lib/api/offers";
import { getDefaultRestaurantWithSettings } from "@/lib/api/reviews";
import { jsonError } from "@/lib/api/http";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const restaurant = await getDefaultRestaurantWithSettings();

    return NextResponse.json({
      data: await listActivePublicOffers(restaurant.id),
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("restaurant")) {
      return jsonError(error.message, 404);
    }

    return jsonError("Unable to load public offers.", 500);
  }
}
