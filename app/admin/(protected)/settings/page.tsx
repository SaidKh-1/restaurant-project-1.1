import type { Metadata } from "next";

import { RestaurantSettingsForm } from "@/components/admin/restaurant-settings-form";

export const metadata: Metadata = {
  title: "إعدادات الموقع",
};

export default function RestaurantSettingsPage() {
  return <RestaurantSettingsForm />;
}
