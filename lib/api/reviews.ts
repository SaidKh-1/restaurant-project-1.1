import { prisma } from "@/lib/db";
import { serializeMediaAsset, mediaAssetInclude } from "./media";
import type {
  Prisma,
  PublicReviewNameMode,
  ReviewStatus,
} from "@/lib/generated/prisma/client";

export const reviewAdminInclude = {
  imageAsset: {
    include: mediaAssetInclude,
  },
  approvedBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  _count: {
    select: {
      homepageSections: true,
    },
  },
};

export const reviewPublicInclude = {
  imageAsset: {
    include: mediaAssetInclude,
  },
};

export type ReviewAdminRecord = Prisma.ReviewGetPayload<{
  include: typeof reviewAdminInclude;
}>;

export type ReviewPublicRecord = Prisma.ReviewGetPayload<{
  include: typeof reviewPublicInclude;
}>;

export function formatPublicDisplayName(
  customerName: string,
  mode: PublicReviewNameMode,
) {
  const trimmedName = customerName.trim();

  if (!trimmedName) {
    return "";
  }

  const parts = trimmedName.split(/\s+/).filter(Boolean);

  if (mode === "FULL" || parts.length === 1) {
    return trimmedName;
  }

  if (mode === "FIRST_NAME") {
    return parts[0];
  }

  const firstName = parts[0];
  const secondInitial = parts[1]?.charAt(0);

  return secondInitial ? `${firstName} ${secondInitial}.` : firstName;
}

function buildReviewTranslations(title: string | null, comment: string) {
  return {
    ar: {
      title,
      comment,
    },
    en: null,
  };
}

export function serializePublicReview(
  review: ReviewPublicRecord,
  publicNameMode: PublicReviewNameMode,
) {
  return {
    id: review.id,
    rating: review.rating,
    displayedName: formatPublicDisplayName(review.customerName, publicNameMode),
    publicNameMode,
    defaultLocale: "ar" as const,
    translations: buildReviewTranslations(review.title, review.comment),
    image: serializeMediaAsset(review.imageAsset),
    isFeatured: review.isFeatured,
    createdAt: review.createdAt,
  };
}

export function serializeAdminReview(review: ReviewAdminRecord) {
  return {
    id: review.id,
    customerName: review.customerName,
    email: review.email,
    phone: review.phone,
    rating: review.rating,
    status: review.status,
    isFeatured: review.isFeatured,
    publicNameMode: review.publicNameMode,
    defaultLocale: "ar" as const,
    translations: buildReviewTranslations(review.title, review.comment),
    imageAssetId: review.imageAssetId,
    image: serializeMediaAsset(review.imageAsset),
    approvedBy: review.approvedBy,
    approvedAt: review.approvedAt,
    homepageSectionCount: review._count.homepageSections,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

export async function getDefaultRestaurantWithSettings() {
  const slug =
    process.env.DEFAULT_RESTAURANT_SLUG ?? "default-seafood-restaurant";

  const restaurant = await prisma.restaurant.findFirst({
    where: {
      slug,
      status: "ACTIVE",
    },
    include: {
      settings: true,
    },
  });

  if (!restaurant) {
    throw new Error("Default restaurant was not found.");
  }

  return restaurant;
}

export function buildAdminReviewsWhereClause(
  restaurantId: string,
  filters?: {
    status?: ReviewStatus;
    isFeatured?: boolean;
  },
): Prisma.ReviewWhereInput {
  return {
    restaurantId,
    ...(filters?.status
      ? { status: filters.status }
      : { status: { not: "DELETED" } }),
    ...(filters?.isFeatured !== undefined
      ? { isFeatured: filters.isFeatured }
      : {}),
  };
}

export async function listAdminReviews(
  restaurantId: string,
  filters?: {
    status?: ReviewStatus;
    isFeatured?: boolean;
  },
) {
  const reviews = await prisma.review.findMany({
    where: buildAdminReviewsWhereClause(restaurantId, filters),
    include: reviewAdminInclude,
    orderBy: [{ createdAt: "desc" }],
  });

  return reviews.map(serializeAdminReview);
}

export async function getAdminReviewRecord(
  restaurantId: string,
  reviewId: string,
) {
  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      restaurantId,
    },
    include: reviewAdminInclude,
  });

  return review ? serializeAdminReview(review) : null;
}

export async function listPublicReviews(restaurantId: string) {
  const restaurant = await prisma.restaurant.findFirst({
    where: { id: restaurantId },
    include: { settings: true },
  });

  if (!restaurant?.settings?.reviewsEnabled) {
    return [];
  }

  const defaultNameMode =
    restaurant.settings.publicReviewNameMode ?? "SHORTENED";

  const reviews = await prisma.review.findMany({
    where: {
      restaurantId,
      status: "APPROVED",
    },
    include: reviewPublicInclude,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });

  return reviews.map((review) =>
    serializePublicReview(
      review,
      review.publicNameMode ?? defaultNameMode,
    ),
  );
}

export async function assertReviewCanBeDeleted(
  restaurantId: string,
  reviewId: string,
) {
  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      restaurantId,
    },
    select: {
      _count: {
        select: {
          homepageSections: true,
        },
      },
    },
  });

  if (!review) {
    return "not_found" as const;
  }

  if (review._count.homepageSections > 0) {
    throw new Error(
      "Cannot delete a review that is still assigned to homepage sections.",
    );
  }

  return "ok" as const;
}

export function extractReviewContent(input: {
  translations: {
    ar: {
      title?: string | null;
      comment: string;
    };
    en?: {
      title?: string | null;
      comment?: string | null;
    } | null;
  };
}) {
  return {
    title: input.translations.ar.title ?? null,
    comment: input.translations.ar.comment,
  };
}

export function extractPartialReviewContent(input?: {
  ar?: {
    title?: string | null;
    comment?: string;
  };
  en?: {
    title?: string | null;
    comment?: string | null;
  } | null;
}) {
  if (!input?.ar) {
    return {};
  }

  return {
    ...(input.ar.title !== undefined ? { title: input.ar.title } : {}),
    ...(input.ar.comment !== undefined ? { comment: input.ar.comment } : {}),
  };
}
