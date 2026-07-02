"use client";

import { createContext, useContext } from "react";

import type { PublicSiteShell } from "@/lib/api/public-site-shell";

const PublicSiteContext = createContext<PublicSiteShell | null>(null);

type PublicSiteProviderProps = {
  shell: PublicSiteShell;
  children: React.ReactNode;
};

export function PublicSiteProvider({ shell, children }: PublicSiteProviderProps) {
  return (
    <PublicSiteContext.Provider value={shell}>{children}</PublicSiteContext.Provider>
  );
}

export function usePublicSiteShell() {
  const context = useContext(PublicSiteContext);

  if (!context) {
    throw new Error("usePublicSiteShell must be used within PublicSiteProvider.");
  }

  return context;
}
