import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/db";

export function getCachedRestaurantName(restaurantId: string) {
  return unstable_cache(
    async () => {
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
        include: {
          translations: true,
        },
      });

      return (
        restaurant?.translations.find((translation) => translation.locale === "AR")
          ?.name ?? null
      );
    },
    [`admin-restaurant-name-${restaurantId}`],
    { revalidate: 60 },
  )();
}
