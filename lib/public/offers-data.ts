import { fetchPublicApi } from "@/lib/public/fetch-public-api";
import type { PublicOffer } from "@/lib/public/types";

export async function loadPublicOffersPageData(): Promise<PublicOffer[]> {
  const offers = await fetchPublicApi<PublicOffer[]>("/api/public/offers");
  return offers ?? [];
}
