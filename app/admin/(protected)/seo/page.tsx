import type { Metadata } from "next";

import { SeoManagementManager } from "@/components/admin/seo-management-manager";

export const metadata: Metadata = {
  title: "إعدادات SEO",
};

export default function SeoManagementPage() {
  return <SeoManagementManager />;
}
