import type { Metadata } from "next";

import { MenuManagementManager } from "@/components/admin/menu-management-manager";

export const metadata: Metadata = {
  title: "إدارة المنيو",
};

export default function MenuManagementPage() {
  return <MenuManagementManager />;
}
