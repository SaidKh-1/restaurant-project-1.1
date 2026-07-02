import { getDefaultRestaurantWithSettings } from "@/lib/api/reviews";
import {
  buildSpamRejectedPublicResponse,
  evaluateSpamGuard,
} from "@/lib/api/spam-guard";
import { prisma } from "@/lib/db";
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

const submitContactMessageSchema = z
  .object({
    name: z.string().trim().min(1).max(160),
    phoneOrWhatsapp: z.string().trim().min(1).max(80).optional(),
    phone: z.string().trim().min(1).max(80).optional(),
    email: z.string().trim().email().max(254).nullable().optional(),
    subject: z.string().trim().min(1).max(200),
    message: z.string().trim().min(1).max(4000),
    spamGuard: spamGuardSchema.optional(),
  })
  .strict()
  .superRefine((value, context) => {
    const phoneOrWhatsapp = value.phoneOrWhatsapp ?? value.phone;

    if (!phoneOrWhatsapp) {
      context.addIssue({
        code: "custom",
        message: "phoneOrWhatsapp is required.",
        path: ["phoneOrWhatsapp"],
      });
    }
  });

type SubmitContactMessageInput = z.infer<typeof submitContactMessageSchema>;

async function createContactMessage(
  restaurantId: string,
  input: SubmitContactMessageInput,
) {
  const phoneOrWhatsapp = input.phoneOrWhatsapp ?? input.phone ?? "";

  const message = await prisma.contactMessage.create({
    data: {
      restaurantId,
      name: input.name,
      phoneOrWhatsapp,
      email: input.email ?? null,
      subject: input.subject,
      message: input.message,
      status: "NEW",
    },
  });

  return {
    id: message.id,
    status: message.status,
    message: "Message submitted successfully.",
  };
}

export async function POST(request: Request) {
  try {
    const restaurant = await getDefaultRestaurantWithSettings();

    if (!restaurant.settings?.messagesEnabled) {
      return jsonError("Contact message submissions are currently disabled.", 403);
    }

    const body = await request.json();
    const parsed = submitContactMessageSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid contact message payload.", 400, {
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

    const result = await createContactMessage(restaurant.id, parsed.data);

    return NextResponse.json(
      {
        data: result,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("restaurant")) {
      return jsonError(error.message, 404);
    }

    return jsonError("Unable to submit contact message.", 500);
  }
}
