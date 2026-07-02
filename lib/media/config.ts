import path from "node:path";

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;

export const DEFAULT_MEDIA_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export const MEDIA_OPTIMIZED_MAX_WIDTH = 1920;
export const MEDIA_THUMBNAIL_WIDTH = 400;
export const MEDIA_OPTIMIZED_QUALITY = 85;
export const MEDIA_THUMBNAIL_QUALITY = 80;

export const MEDIA_PUBLIC_BASE_PATH = "/media";

export function getMediaMaxFileSizeBytes() {
  const configured = process.env.MEDIA_MAX_FILE_SIZE_BYTES;

  if (!configured) {
    return DEFAULT_MEDIA_MAX_FILE_SIZE_BYTES;
  }

  const parsed = Number.parseInt(configured, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_MEDIA_MAX_FILE_SIZE_BYTES;
  }

  return parsed;
}

export function getMediaStorageRoot() {
  return (
    process.env.MEDIA_STORAGE_DIR ??
    path.join(process.cwd(), "public", "media")
  );
}

export function getOptimizedFileName() {
  return "optimized.webp";
}

export function getThumbnailFileName() {
  return "thumb.webp";
}

export function buildStorageKey(restaurantId: string, assetId: string) {
  return `${restaurantId}/${assetId}/${getOptimizedFileName()}`;
}

export function buildThumbnailStorageKey(restaurantId: string, assetId: string) {
  return `${restaurantId}/${assetId}/${getThumbnailFileName()}`;
}

export function buildPublicUrl(storageKey: string) {
  return `${MEDIA_PUBLIC_BASE_PATH}/${storageKey}`;
}

export function buildThumbnailPublicUrl(restaurantId: string, assetId: string) {
  return buildPublicUrl(buildThumbnailStorageKey(restaurantId, assetId));
}
