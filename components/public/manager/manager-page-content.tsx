"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { usePublicSiteShell } from "@/components/public/public-site-context";
import { ManagerProfileSectionFromShell } from "@/components/public/manager/manager-profile-section";
import {
  getManagerPageLabels,
  isManagerProfilePubliclyAvailable,
} from "@/lib/public/manager-content";
import type { PublicLocale } from "@/lib/public/locale";

type ManagerPageContentProps = {
  locale: PublicLocale;
};

export function ManagerPageContent({ locale }: ManagerPageContentProps) {
  const shell = usePublicSiteShell();
  const labels = getManagerPageLabels(locale);
  const isAvailable = isManagerProfilePubliclyAvailable(
    shell.managerProfile,
    locale,
  );

  return (
    <div className="pb-16">
      <section className="border-b bg-[var(--public-secondary)]/20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-[var(--public-primary)]">
            {labels.pageSubtitle}
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            {labels.pageTitle}
          </h1>
        </div>
      </section>

      {isAvailable ? (
        <ManagerProfileSectionFromShell shell={shell} className="py-14" />
      ) : (
        <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="space-y-6 rounded-2xl border border-dashed bg-muted/30 px-6 py-12 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">{labels.unavailableTitle}</h2>
              <p className="text-muted-foreground">{labels.unavailableBody}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                asChild
                className="bg-[var(--public-button)] text-white hover:opacity-90"
              >
                <Link href={`/${locale}`} prefetch>
                  {labels.backHome}
                </Link>
              </Button>
              {shell.featureFlags.messagesEnabled ? (
                <Button asChild variant="outline">
                  <Link href={`/${locale}/contact`} prefetch>
                    {labels.contactUs}
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
