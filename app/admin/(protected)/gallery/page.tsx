import type { Metadata } from "next";

import { GalleryManagementManager } from "@/components/admin/gallery-management-manager";

export const metadata: Metadata = {
  title: "معرض الصور",
};

export default function GalleryManagementPage() {
  return <GalleryManagementManager />;
}
