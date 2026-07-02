import { PUBLIC_REVIEWS_CACHE_TAG } from "@/lib/api/public-cache";
import { fetchPublicApi } from "@/lib/public/fetch-public-api";
import type { PublicReview } from "@/lib/public/types";

export async function loadPublicReviewsPageData(): Promise<PublicReview[]> {
  const reviews = await fetchPublicApi<PublicReview[]>("/api/public/reviews", {
    tags: [PUBLIC_REVIEWS_CACHE_TAG],
  });

  return reviews ?? [];
}
