import type { Metadata } from "next";

import { OffersManagementManager } from "@/components/admin/offers-management-manager";

export const metadata: Metadata = {
  title: "إدارة العروض",
};

export default function OffersManagementPage() {
  return <OffersManagementManager />;
}
