import type { Metadata } from "next";

import { ThemeBuilderManager } from "@/components/admin/theme-builder-manager";

export const metadata: Metadata = {
  title: "إدارة المظهر",
};

export default function ThemeBuilderPage() {
  return <ThemeBuilderManager />;
}
