import type { Metadata } from "next";

import { ReservationsManagementManager } from "@/components/admin/reservations-management-manager";

export const metadata: Metadata = {
  title: "إدارة الحجوزات",
};

export default function ReservationsManagementPage() {
  return <ReservationsManagementManager />;
}
