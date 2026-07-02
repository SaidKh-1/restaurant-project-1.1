import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  buildStorageKey,
  buildThumbnailStorageKey,
  getMediaStorageRoot,
} from "./config";

export function getAbsolutePathForStorageKey(storageKey: string) {
  return path.join(getMediaStorageRoot(), ...storageKey.split("/"));
}

export function getAssetDirectory(restaurantId: string, assetId: string) {
  return path.join(getMediaStorageRoot(), restaurantId, assetId);
}

export async function ensureAssetDirectory(restaurantId: string, assetId: string) {
  await mkdir(getAssetDirectory(restaurantId, assetId), { recursive: true });
}

export async function writeOptimizedImage(
  restaurantId: string,
  assetId: string,
  buffer: Buffer,
) {
  await ensureAssetDirectory(restaurantId, assetId);
  const storageKey = buildStorageKey(restaurantId, assetId);
  await writeFile(getAbsolutePathForStorageKey(storageKey), buffer);
  return storageKey;
}

export async function writeThumbnailImage(
  restaurantId: string,
  assetId: string,
  buffer: Buffer,
) {
  await ensureAssetDirectory(restaurantId, assetId);
  const storageKey = buildThumbnailStorageKey(restaurantId, assetId);
  await writeFile(getAbsolutePathForStorageKey(storageKey), buffer);
  return storageKey;
}

export async function deleteAssetFiles(restaurantId: string, assetId: string) {
  await rm(getAssetDirectory(restaurantId, assetId), {
    recursive: true,
    force: true,
  });
}

export function sanitizeOriginalFilename(filename: string | null | undefined) {
  if (!filename) {
    return null;
  }

  const basename = path.basename(filename.trim());

  if (!basename || basename === "." || basename === "..") {
    return null;
  }

  return basename.slice(0, 255);
}
