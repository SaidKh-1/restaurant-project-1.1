import sharp from "sharp";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  type AllowedImageMimeType,
  getMediaMaxFileSizeBytes,
  MEDIA_OPTIMIZED_MAX_WIDTH,
  MEDIA_OPTIMIZED_QUALITY,
  MEDIA_THUMBNAIL_QUALITY,
  MEDIA_THUMBNAIL_WIDTH,
} from "./config";

export class MediaValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaValidationError";
  }
}

export type ProcessedImage = {
  optimizedBuffer: Buffer;
  thumbnailBuffer: Buffer;
  mimeType: AllowedImageMimeType;
  fileSize: number;
  width: number;
  height: number;
};

function isAllowedMimeType(mimeType: string): mimeType is AllowedImageMimeType {
  return ALLOWED_IMAGE_MIME_TYPES.includes(mimeType as AllowedImageMimeType);
}

export async function processUploadedImage(
  fileBuffer: Buffer,
  declaredMimeType: string | null,
) {
  const maxFileSize = getMediaMaxFileSizeBytes();

  if (fileBuffer.length === 0) {
    throw new MediaValidationError("Uploaded file is empty.");
  }

  if (fileBuffer.length > maxFileSize) {
    throw new MediaValidationError(
      `Image exceeds the maximum allowed size of ${maxFileSize} bytes.`,
    );
  }

  let metadata;

  try {
    metadata = await sharp(fileBuffer, { failOn: "error" }).metadata();
  } catch {
    throw new MediaValidationError("Uploaded file is not a valid image.");
  }

  if (!metadata.width || !metadata.height) {
    throw new MediaValidationError("Uploaded image dimensions are invalid.");
  }

  const detectedFormat = metadata.format;

  if (
    detectedFormat !== "jpeg" &&
    detectedFormat !== "png" &&
    detectedFormat !== "webp"
  ) {
    throw new MediaValidationError(
      "Only JPEG, PNG, and WebP image formats are allowed.",
    );
  }

  if (declaredMimeType && !isAllowedMimeType(declaredMimeType)) {
    throw new MediaValidationError(
      "Only JPEG, PNG, and WebP image formats are allowed.",
    );
  }

  const optimizedBuffer = await sharp(fileBuffer, { failOn: "error" })
    .rotate()
    .resize({
      width: MEDIA_OPTIMIZED_MAX_WIDTH,
      withoutEnlargement: true,
      fit: "inside",
    })
    .webp({
      quality: MEDIA_OPTIMIZED_QUALITY,
    })
    .toBuffer();

  const thumbnailBuffer = await sharp(fileBuffer, { failOn: "error" })
    .rotate()
    .resize({
      width: MEDIA_THUMBNAIL_WIDTH,
      withoutEnlargement: true,
      fit: "inside",
    })
    .webp({
      quality: MEDIA_THUMBNAIL_QUALITY,
    })
    .toBuffer();

  const optimizedMetadata = await sharp(optimizedBuffer).metadata();

  if (!optimizedMetadata.width || !optimizedMetadata.height) {
    throw new MediaValidationError("Unable to optimize uploaded image.");
  }

  if (optimizedBuffer.length > maxFileSize) {
    throw new MediaValidationError(
      `Optimized image exceeds the maximum allowed size of ${maxFileSize} bytes.`,
    );
  }

  return {
    optimizedBuffer,
    thumbnailBuffer,
    mimeType: "image/webp" as const,
    fileSize: optimizedBuffer.length,
    width: optimizedMetadata.width,
    height: optimizedMetadata.height,
  } satisfies ProcessedImage;
}
