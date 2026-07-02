import type { Metadata } from "next";

import { MediaLibraryManager } from "@/components/admin/media-library-manager";

export const metadata: Metadata = {
  title: "مكتبة الصور",
};

export default function MediaLibraryPage() {
  return <MediaLibraryManager />;
}
