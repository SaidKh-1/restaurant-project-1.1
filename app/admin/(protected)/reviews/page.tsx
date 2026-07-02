import type { Metadata } from "next";

import { ReviewsManagementManager } from "@/components/admin/reviews-management-manager";

export const metadata: Metadata = {
  title: "إدارة التقييمات",
};

export default function ReviewsManagementPage() {
  return <ReviewsManagementManager />;
}
