import { prisma } from "@/lib/db";

export type RestaurantSettingsSummaryRecord = NonNullable<
  Awaited<ReturnType<typeof getRestaurantSettingsSummaryRecord>>
>;

export async function getRestaurantSettingsSummaryRecord(restaurantId: string) {
  return prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: {
      id: true,
      translations: {
        where: {
          locale: { in: ["AR", "EN"] },
        },
        select: {
          locale: true,
          name: true,
        },
      },
      contactSettings: {
        select: {
          phone: true,
          whatsappNumber: true,
          email: true,
          reservationPhone: true,
          publicContactEnabled: true,
          whatsappEnabled: true,
        },
      },
    },
  });
}

export function serializeRestaurantSettingsSummary(
  restaurant: RestaurantSettingsSummaryRecord,
) {
  const nameAr =
    restaurant.translations.find((translation) => translation.locale === "AR")
      ?.name ?? null;
  const nameEn =
    restaurant.translations.find((translation) => translation.locale === "EN")
      ?.name ?? null;

  return {
    id: restaurant.id,
    restaurantName: {
      ar: nameAr,
      en: nameEn,
    },
    contactInformation: restaurant.contactSettings
      ? {
          phone: restaurant.contactSettings.phone,
          whatsappNumber: restaurant.contactSettings.whatsappNumber,
          email: restaurant.contactSettings.email,
          reservationPhone: restaurant.contactSettings.reservationPhone,
          publicContactEnabled:
            restaurant.contactSettings.publicContactEnabled,
          whatsappEnabled: restaurant.contactSettings.whatsappEnabled,
        }
      : null,
  };
}
