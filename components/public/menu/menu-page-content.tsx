import { Badge } from "@/components/ui/badge";
import {
  formatMenuPrice,
  getCategoryAnchorId,
  getCookingMethodNames,
  getMenuPageLabels,
  getMenuTranslation,
  getPriceVariantLabel,
  groupMenuItemsByCategory,
} from "@/lib/public/menu-content";
import { getLocalizedMediaAlt } from "@/lib/public/content";
import type { PublicLocale } from "@/lib/public/locale";
import type { PublicMenuPageData } from "@/lib/public/types";

type MenuPageContentProps = {
  locale: PublicLocale;
  data: PublicMenuPageData;
};

function MenuItemCard({
  locale,
  item,
  currencyCode,
}: {
  locale: PublicLocale;
  item: PublicMenuPageData["items"][number];
  currencyCode: string;
}) {
  const labels = getMenuPageLabels(locale);
  const content = getMenuTranslation(locale, item.translations);
  const title = content?.name?.trim();

  if (!title) {
    return null;
  }

  const description = content?.description?.trim() || null;
  const imageAlt = getLocalizedMediaAlt(locale, item.image, title);
  const cookingMethods = getCookingMethodNames(locale, item.cookingMethods);

  return (
    <article className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="grid gap-0 md:grid-cols-[220px_minmax(0,1fr)]">
        <div className="aspect-[4/3] overflow-hidden bg-muted md:aspect-auto md:min-h-full">
          {item.image?.publicUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={item.image.publicUrl}
              alt={imageAlt}
              className="size-full object-cover"
            />
          ) : (
            <div className="text-muted-foreground flex size-full min-h-40 items-center justify-center px-4 text-center text-sm">
              {title}
            </div>
          )}
        </div>

        <div className="space-y-4 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-semibold">{title}</h3>
                {item.isFeatured ? (
                  <Badge className="bg-[var(--public-primary)] text-white">
                    {labels.featured}
                  </Badge>
                ) : null}
              </div>
              {description ? (
                <p className="text-muted-foreground text-sm leading-7">
                  {description}
                </p>
              ) : null}
            </div>
            {item.isAvailable ? (
              <Badge variant="secondary">{labels.available}</Badge>
            ) : null}
          </div>

          {item.priceVariants.length > 0 ? (
            <ul className="space-y-2">
              {item.priceVariants.map((variant) => (
                <li
                  key={variant.id}
                  className="flex items-center justify-between gap-4 rounded-xl border bg-background px-4 py-3 text-sm"
                >
                  <span className="font-medium">
                    {getPriceVariantLabel(locale, variant)}
                  </span>
                  <span className="shrink-0 font-semibold text-[var(--public-primary)]">
                    {formatMenuPrice(variant.price, currencyCode)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          {cookingMethods.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">{labels.cookingMethods}</p>
              <div className="flex flex-wrap gap-2">
                {cookingMethods.map((method) => (
                  <Badge key={method} variant="outline">
                    {method}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function MenuPageContent({ locale, data }: MenuPageContentProps) {
  const labels = getMenuPageLabels(locale);
  const sections = groupMenuItemsByCategory(data.categories, data.items);

  if (sections.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-dashed bg-muted/30 px-6 py-16 text-center">
          <p className="text-muted-foreground">{labels.emptyMenu}</p>
        </div>
      </section>
    );
  }

  return (
    <div className="pb-16">
      <section className="border-b bg-[var(--public-secondary)]/20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-[var(--public-primary)]">
            {labels.subtitle}
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            {labels.title}
          </h1>
        </div>
      </section>

      {sections.length > 1 ? (
        <section className="sticky top-16 z-20 border-b bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
            {sections.map(({ category }) => {
              const name = getMenuTranslation(
                locale,
                category.translations,
              )?.name;

              if (!name) {
                return null;
              }

              return (
                <a
                  key={category.id}
                  href={`#${getCategoryAnchorId(category.slug)}`}
                  className="shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition hover:border-[var(--public-primary)] hover:text-[var(--public-primary)]"
                >
                  {name}
                </a>
              );
            })}
          </div>
        </section>
      ) : null}

      <div className="mx-auto max-w-7xl space-y-14 px-4 py-12 sm:px-6 lg:px-8">
        {sections.map(({ category, items }) => {
          const categoryContent = getMenuTranslation(
            locale,
            category.translations,
          );
          const categoryName = categoryContent?.name?.trim();

          if (!categoryName) {
            return null;
          }

          return (
            <section
              key={category.id}
              id={getCategoryAnchorId(category.slug)}
              className="scroll-mt-32 space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold tracking-tight">
                  {categoryName}
                </h2>
                {categoryContent?.description ? (
                  <p className="text-muted-foreground max-w-3xl text-sm leading-7">
                    {categoryContent.description}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-5">
                {items.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    locale={locale}
                    item={item}
                    currencyCode={data.currencyCode}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
