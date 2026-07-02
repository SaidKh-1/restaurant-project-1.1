import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getSeoEntryContent } from "@/lib/public/content";
import { getHomeSectionLabels } from "@/lib/public/home-sections";
import type { PublicLocale } from "@/lib/public/locale";
import type { PublicSeoEntry } from "@/lib/public/types";

type HomeFeaturedMenuSectionProps = {
  locale: PublicLocale;
  entries: PublicSeoEntry[];
};

export function HomeFeaturedMenuSection({
  locale,
  entries,
}: HomeFeaturedMenuSectionProps) {
  const labels = getHomeSectionLabels(locale);
  const cards = entries
    .map((entry) => {
      const content = getSeoEntryContent(entry, locale);
      const title = content?.seoTitle?.trim();

      if (!title) {
        return null;
      }

      return {
        id: entry.id,
        title,
        description: content?.seoDescription?.trim() || null,
        imageUrl: entry.ogImage?.publicUrl ?? null,
        href: entry.routePath,
      };
    })
    .filter((card): card is NonNullable<typeof card> => card !== null)
    .slice(0, 4);

  if (cards.length === 0) {
    return null;
  }

  return (
    <section className="bg-[var(--public-secondary)]/35 py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--public-primary)]">
              {labels.featuredMenu}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight">{labels.menu}</h2>
          </div>
          <Button asChild variant="outline">
            <Link href={`/${locale}/menu`} prefetch>
              {labels.viewAll}
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              prefetch
              className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                {card.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={card.imageUrl}
                    alt={card.title}
                    className="size-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="text-muted-foreground flex size-full items-center justify-center text-sm">
                    {card.title}
                  </div>
                )}
              </div>
              <div className="space-y-2 p-4">
                <h3 className="line-clamp-1 text-lg font-semibold">{card.title}</h3>
                {card.description ? (
                  <p className="text-muted-foreground line-clamp-2 text-sm leading-6">
                    {card.description}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
