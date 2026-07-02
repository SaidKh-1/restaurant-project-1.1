import { prisma } from "@/lib/db";

import {
  getRestaurantSettingsSummaryRecord,
  serializeRestaurantSettingsSummary,
} from "./restaurant-settings-summary";

export async function getDashboardSummary(restaurantId: string) {
  const [
    summaryRecord,
    newMessages,
    pendingReviews,
    offers,
    menuItems,
  ] = await Promise.all([
    getRestaurantSettingsSummaryRecord(restaurantId),
    prisma.contactMessage.count({
      where: { restaurantId, status: "NEW" },
    }),
    prisma.review.count({
      where: { restaurantId, status: "PENDING" },
    }),
    prisma.offer.count({
      where: { restaurantId },
    }),
    prisma.menuItem.count({
      where: { restaurantId },
    }),
  ]);

  if (!summaryRecord) {
    return null;
  }

  const summary = serializeRestaurantSettingsSummary(summaryRecord);

  return {
    restaurantName: summary.restaurantName,
    stats: {
      newMessages,
      pendingReviews,
      offers,
      menuItems,
    },
  };
}
