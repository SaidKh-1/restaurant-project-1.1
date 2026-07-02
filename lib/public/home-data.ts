import { PUBLIC_REVIEWS_CACHE_TAG } from "@/lib/api/public-cache";
import { fetchPublicApi } from "@/lib/public/fetch-public-api";
import { normalizeHomePageData } from "@/lib/public/content";
import type {
  PublicHomePageData,
  PublicOffer,
  PublicReview,
  PublicSeoEntry,
} from "@/lib/public/types";

export async function loadPublicHomePageData(): Promise<PublicHomePageData> {
  const [offers, reviews, seoEntries] = await Promise.all([
    fetchPublicApi<PublicOffer[]>("/api/public/offers"),
    fetchPublicApi<PublicReview[]>("/api/public/reviews", {
      tags: [PUBLIC_REVIEWS_CACHE_TAG],
    }),
    fetchPublicApi<PublicSeoEntry[]>("/api/public/seo"),
  ]);

  return normalizeHomePageData({
    offers: offers ?? [],
    reviews: reviews ?? [],
    seoEntries: seoEntries ?? [],
  });
}
