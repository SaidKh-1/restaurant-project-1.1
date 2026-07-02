"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { adminNavGroups } from "@/lib/admin/nav";

export function AdminRoutePrefetcher() {
  const router = useRouter();

  useEffect(() => {
    const hrefs = adminNavGroups
      .flatMap((group) => group.items)
      .map((item) => item.href)
      .filter((href): href is string => Boolean(href));

    function prefetchRoutes() {
      for (const href of hrefs) {
        void router.prefetch(href);
      }
    }

    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(prefetchRoutes);
      return;
    }

    const timeoutId = window.setTimeout(prefetchRoutes, 150);
    return () => window.clearTimeout(timeoutId);
  }, [router]);

  return null;
}
