import type { Metadata } from "next";

import { HeroSlidesManager } from "@/components/admin/hero-slides-manager";

export const metadata: Metadata = {
  title: "Hero Slider",
};

export default function HeroSlidesPage() {
  return <HeroSlidesManager />;
}
