import { fetchPublicApi } from "@/lib/public/fetch-public-api";
import type {
  PublicGalleryCategory,
  PublicGalleryImage,
  PublicGalleryPageData,
} from "@/lib/public/types";

export async function loadPublicGalleryPageData(): Promise<PublicGalleryPageData> {
  const [categories, images] = await Promise.all([
    fetchPublicApi<PublicGalleryCategory[]>("/api/public/gallery-categories"),
    fetchPublicApi<PublicGalleryImage[]>("/api/public/gallery-images"),
  ]);

  return {
    categories: categories ?? [],
    images: images ?? [],
  };
}
