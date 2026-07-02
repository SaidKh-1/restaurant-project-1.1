import { createPublicReservation } from "@/lib/api/reservations";
import { getDefaultRestaurantWithSettings } from "@/lib/api/reviews";
import {
  buildSpamRejectedPublicResponse,
  evaluateSpamGuard,
} from "@/lib/api/spam-guard";
import { jsonError } from "@/lib/api/http";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const spamGuardSchema = z
  .object({
    honeypot: z.string().max(500).optional(),
    formLoadedAt: z.string().datetime().optional(),
    captchaToken: z.string().max(500).optional(),
  })
  .strict();

const submitReservationSchema = z
  .object({
    name: z.string().trim().min(1).max(160),
    phone: z.string().trim().min(1).max(80).optional(),
    phoneOrWhatsapp: z.string().trim().min(1).max(80).optional(),
    reservationDate: z.string().trim().min(1).max(20),
    reservationTime: z.string().trim().min(1).max(20),
    guests: z.number().int().min(1).max(50),
    notes: z.string().trim().max(2000).nullable().optional(),
    spamGuard: spamGuardSchema.optional(),
  })
  .strict()
  .superRefine((value, context) => {
    const phone = value.phone ?? value.phoneOrWhatsapp;

    if (!phone) {
      context.addIssue({
        code: "custom",
        message: "phoneOrWhatsapp is required.",
        path: ["phoneOrWhatsapp"],
      });
    }
  });

export async function POST(request: Request) {
  try {
    const restaurant = await getDefaultRestaurantWithSettings();

    if (!restaurant.settings?.reservationsEnabled) {
      return jsonError("Reservation submissions are currently disabled.", 403);
    }

    const body = await request.json();
    const parsed = submitReservationSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid reservation payload.", 400, {
        issues: parsed.error.issues,
      });
    }

    const spamCheck = evaluateSpamGuard(parsed.data.spamGuard);

    if (!spamCheck.allowed) {
      return NextResponse.json(
        {
          data: buildSpamRejectedPublicResponse(),
        },
        { status: 201 },
      );
    }

    const phone = parsed.data.phone ?? parsed.data.phoneOrWhatsapp ?? "";

    const result = await createPublicReservation(restaurant.id, {
      name: parsed.data.name,
      phone,
      reservationDate: parsed.data.reservationDate,
      reservationTime: parsed.data.reservationTime,
      guests: parsed.data.guests,
      notes: parsed.data.notes,
    });

    return NextResponse.json(
      {
        data: result,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes("required") ||
        error.message.includes("must be")
      ) {
        return jsonError(error.message, 400);
      }

      if (error.message.includes("restaurant")) {
        return jsonError(error.message, 404);
      }
    }

    return jsonError("Unable to submit reservation.", 500);
  }
}
