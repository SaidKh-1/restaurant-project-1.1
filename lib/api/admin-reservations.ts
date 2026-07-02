import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/db";

export type ReservationWorkflowStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "archived";

export type AdminReservationRecord = Prisma.ReservationGetPayload<{
  include: {
    handledBy: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
  };
}>;

export function resolveReservationWorkflowStatus(input: {
  status: AdminReservationRecord["status"];
  handledAt: Date | null;
}): ReservationWorkflowStatus {
  if (input.status === "PENDING") {
    return "pending";
  }

  if (input.status === "CANCELLED") {
    return "cancelled";
  }

  if (input.status === "REJECTED") {
    return "archived";
  }

  if (input.status === "ACCEPTED") {
    return input.handledAt ? "completed" : "confirmed";
  }

  return "pending";
}

export function serializeAdminReservation(reservation: AdminReservationRecord) {
  return {
    id: reservation.id,
    name: reservation.name,
    phone: reservation.phone,
    email: reservation.email,
    reservationDate: reservation.reservationDate.toISOString(),
    reservationTime: reservation.reservationTime,
    guests: reservation.guests,
    notes: reservation.notes,
    status: reservation.status,
    workflowStatus: resolveReservationWorkflowStatus(reservation),
    handledBy: reservation.handledBy,
    handledAt: reservation.handledAt?.toISOString() ?? null,
    createdAt: reservation.createdAt.toISOString(),
    updatedAt: reservation.updatedAt.toISOString(),
  };
}

const reservationInclude = {
  handledBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const;

export function buildAdminReservationsWhereClause(
  restaurantId: string,
  workflowStatus?: ReservationWorkflowStatus,
): Prisma.ReservationWhereInput {
  const base: Prisma.ReservationWhereInput = { restaurantId };

  if (!workflowStatus) {
    return base;
  }

  switch (workflowStatus) {
    case "pending":
      return { ...base, status: "PENDING" };
    case "confirmed":
      return { ...base, status: "ACCEPTED", handledAt: null };
    case "completed":
      return { ...base, status: "ACCEPTED", handledAt: { not: null } };
    case "cancelled":
      return { ...base, status: "CANCELLED" };
    case "archived":
      return { ...base, status: "REJECTED" };
    default:
      return base;
  }
}

export async function listAdminReservations(
  restaurantId: string,
  filters?: {
    workflowStatus?: ReservationWorkflowStatus;
  },
) {
  const reservations = await prisma.reservation.findMany({
    where: buildAdminReservationsWhereClause(
      restaurantId,
      filters?.workflowStatus,
    ),
    include: reservationInclude,
    orderBy: [
      { reservationDate: "desc" },
      { reservationTime: "desc" },
      { createdAt: "desc" },
    ],
  });

  return reservations.map(serializeAdminReservation);
}

export async function getAdminReservationRecord(
  restaurantId: string,
  reservationId: string,
) {
  const reservation = await prisma.reservation.findFirst({
    where: {
      id: reservationId,
      restaurantId,
    },
    include: reservationInclude,
  });

  return reservation ? serializeAdminReservation(reservation) : null;
}

export function workflowStatusToUpdateData(
  workflowStatus: ReservationWorkflowStatus,
  handledById: string,
) {
  switch (workflowStatus) {
    case "pending":
      return {
        status: "PENDING" as const,
        handledAt: null,
        handledById: null,
      };
    case "confirmed":
      return {
        status: "ACCEPTED" as const,
        handledAt: null,
        handledById: null,
      };
    case "completed":
      return {
        status: "ACCEPTED" as const,
        handledAt: new Date(),
        handledById,
      };
    case "cancelled":
      return {
        status: "CANCELLED" as const,
        handledAt: new Date(),
        handledById,
      };
    case "archived":
      return {
        status: "REJECTED" as const,
        handledAt: new Date(),
        handledById,
      };
  }
}

export async function updateAdminReservationWorkflowStatus(
  restaurantId: string,
  reservationId: string,
  workflowStatus: ReservationWorkflowStatus,
  handledById: string,
) {
  const existingReservation = await prisma.reservation.findFirst({
    where: {
      id: reservationId,
      restaurantId,
    },
  });

  if (!existingReservation) {
    return null;
  }

  await prisma.reservation.update({
    where: { id: reservationId },
    data: workflowStatusToUpdateData(workflowStatus, handledById),
  });

  return getAdminReservationRecord(restaurantId, reservationId);
}
