import type { Metadata } from "next";

import { ManagerProfileManager } from "@/components/admin/manager-profile-manager";

export const metadata: Metadata = {
  title: "مدير المطعم",
};

export default function ManagerProfilePage() {
  return <ManagerProfileManager />;
}
