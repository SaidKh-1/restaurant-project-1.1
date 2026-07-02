import { HomeAboutSection } from "@/components/public/home/home-about-section";
import { HomeContactCtaSection } from "@/components/public/home/home-contact-cta-section";
import { HomeFeaturedGallerySection } from "@/components/public/home/home-featured-gallery-section";
import { HomeFeaturedMenuSection } from "@/components/public/home/home-featured-menu-section";
import { HomeHeroSlider } from "@/components/public/home/home-hero-slider";
import { HomeOffersSection } from "@/components/public/home/home-offers-section";
import { HomeTestimonialsSection } from "@/components/public/home/home-testimonials-section";
import type { PublicSiteShell } from "@/lib/api/public-site-shell";
import {
  buildHeroSlides,
  filterSeoEntriesByEntityType,
  findSeoEntry,
} from "@/lib/public/content";
import type { PublicLocale } from "@/lib/public/locale";
import type { PublicHomePageData } from "@/lib/public/types";

type HomePageSectionsProps = {
  locale: PublicLocale;
  shell: PublicSiteShell;
  data: PublicHomePageData;
};

export function HomePageSections({ locale, shell, data }: HomePageSectionsProps) {
  const heroSlides = buildHeroSlides(data.seoEntries, locale);
  const aboutEntry = findSeoEntry(
    data.seoEntries,
    (entry) => entry.entityType === "ABOUT" || entry.pageKey === "about",
  );
  const featuredMenuEntries = filterSeoEntriesByEntityType(
    data.seoEntries,
    "MENU_ITEM",
  );
  const featuredGalleryEntries = filterSeoEntriesByEntityType(
    data.seoEntries,
    "GALLERY",
  );

  return (
    <>
      <HomeHeroSlider slides={heroSlides} dir={shell.dir} />
      {aboutEntry ? <HomeAboutSection locale={locale} entry={aboutEntry} /> : null}
      <HomeFeaturedMenuSection locale={locale} entries={featuredMenuEntries} />
      <HomeFeaturedGallerySection locale={locale} entries={featuredGalleryEntries} />
      <HomeOffersSection locale={locale} offers={data.offers} />
      <HomeTestimonialsSection locale={locale} reviews={data.reviews} />
      <HomeContactCtaSection shell={shell} />
    </>
  );
}
