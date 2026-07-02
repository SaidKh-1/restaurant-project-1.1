import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getSeoEntryContent } from "@/lib/public/content";
import { getHomeSectionLabels } from "@/lib/public/home-sections";
import type { PublicLocale } from "@/lib/public/locale";
import type { PublicSeoEntry } from "@/lib/public/types";

type HomeAboutSectionProps = {
  locale: PublicLocale;
  entry: PublicSeoEntry;
};

export function HomeAboutSection({ locale, entry }: HomeAboutSectionProps) {
  const labels = getHomeSectionLabels(locale);
  const content = getSeoEntryContent(entry, locale);
  const title = content?.seoTitle?.trim();
  const description = content?.seoDescription?.trim();

  if (!title || !description) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        {entry.ogImage?.publicUrl ? (
          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={entry.ogImage.publicUrl}
              alt={title}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        ) : null}

        <div className="space-y-4">
          <p className="text-sm font-medium text-[var(--public-primary)]">
            {labels.about}
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
          <p className="text-muted-foreground text-base leading-8">{description}</p>
          <Button
            asChild
            variant="outline"
            className="border-[var(--public-primary)] text-[var(--public-primary)]"
          >
            <Link href={entry.routePath} prefetch>
              {labels.explore}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
