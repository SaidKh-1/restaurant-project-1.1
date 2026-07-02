export function serializeMediaAsset(
  asset:
    | {
        id: string;
        publicUrl: string;
        mimeType: string;
        width: number | null;
        height: number | null;
        translations: {
          locale: "AR" | "EN";
          altText: string | null;
          caption: string | null;
        }[];
      }
    | null
    | undefined,
) {
  if (!asset) {
    return null;
  }

  return {
    id: asset.id,
    publicUrl: asset.publicUrl,
    mimeType: asset.mimeType,
    width: asset.width,
    height: asset.height,
    altText: {
      ar:
        asset.translations.find((translation) => translation.locale === "AR")
          ?.altText ?? null,
      en:
        asset.translations.find((translation) => translation.locale === "EN")
          ?.altText ?? null,
    },
    caption: {
      ar:
        asset.translations.find((translation) => translation.locale === "AR")
          ?.caption ?? null,
      en:
        asset.translations.find((translation) => translation.locale === "EN")
          ?.caption ?? null,
    },
  };
}

export const mediaAssetInclude = {
  translations: true,
} as const;
