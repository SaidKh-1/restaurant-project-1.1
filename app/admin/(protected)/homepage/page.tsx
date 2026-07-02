import type { Metadata } from "next";

import { HomepageSectionsManager } from "@/components/admin/homepage-sections-manager";

export const metadata: Metadata = {
  title: "إدارة الصفحة الرئيسية",
};

export default function HomepageManagementPage() {
  return <HomepageSectionsManager />;
}
