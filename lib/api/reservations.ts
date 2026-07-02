import { prisma } from "@/lib/db";

export type CreatePublicReservationInput = {
  name: string;
  phone: string;
  reservationDate: string;
  reservationTime: string;
  guests: number;
  notes?: string | null;
};

function isValidReservationDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  const today = new Date();
  const todayUtc = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );

  return parsed.getTime() >= todayUtc.getTime();
}

function isValidReservationTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function validatePublicReservationInput(input: CreatePublicReservationInput) {
  if (!input.name.trim()) {
    throw new Error("Name is required.");
  }

  if (!input.phone.trim()) {
    throw new Error("Phone or WhatsApp is required.");
  }

  if (!isValidReservationDate(input.reservationDate)) {
    throw new Error("Reservation date must be today or a future date.");
  }

  if (!isValidReservationTime(input.reservationTime)) {
    throw new Error("Reservation time must be valid.");
  }

  if (!Number.isInteger(input.guests) || input.guests < 1 || input.guests > 50) {
    throw new Error("Guests count must be between 1 and 50.");
  }
}

export async function createPublicReservation(
  restaurantId: string,
  input: CreatePublicReservationInput,
) {
  validatePublicReservationInput(input);

  const reservation = await prisma.reservation.create({
    data: {
      restaurantId,
      name: input.name.trim(),
      phone: input.phone.trim(),
      reservationDate: new Date(`${input.reservationDate}T00:00:00.000Z`),
      reservationTime: input.reservationTime.trim(),
      guests: input.guests,
      notes: input.notes?.trim() || null,
      status: "PENDING",
    },
  });

  return {
    id: reservation.id,
    status: reservation.status,
    message: "Reservation submitted successfully.",
  };
}
