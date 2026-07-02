import { fetchPublicApi } from "@/lib/public/fetch-public-api";
import { getDefaultRestaurantWithSettings } from "@/lib/api/reviews";
import type {
  PublicMenuCategory,
  PublicMenuItem,
  PublicMenuPageData,
} from "@/lib/public/types";

export async function loadPublicMenuPageData(): Promise<PublicMenuPageData> {
  const restaurant = await getDefaultRestaurantWithSettings();

  const [categories, items] = await Promise.all([
    fetchPublicApi<PublicMenuCategory[]>("/api/public/menu-categories"),
    fetchPublicApi<PublicMenuItem[]>("/api/public/menu-items"),
  ]);

  return {
    categories: categories ?? [],
    items: items ?? [],
    currencyCode: restaurant.currencyCode ?? "QAR",
  };
}
