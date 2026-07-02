import { revalidatePath, revalidateTag } from "next/cache";

export const PUBLIC_REVIEWS_CACHE_TAG = "public-reviews";

export function revalidatePublicReviewsCache() {
  revalidateTag(PUBLIC_REVIEWS_CACHE_TAG, { expire: 0 });
  revalidatePath("/ar", "page");
  revalidatePath("/en", "page");
}

export function revalidatePublicSiteShellCache() {
  revalidateTag("public-site-shell", { expire: 0 });
  revalidatePath("/ar", "page");
  revalidatePath("/en", "page");
}
