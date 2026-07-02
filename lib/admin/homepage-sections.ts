import type { HomepageSectionKey } from "@/lib/api/homepage-sections";

export const HOMEPAGE_SECTION_DEFINITIONS: Array<{
  key: HomepageSectionKey;
  label: string;
  description: string;
  managedElsewhereHref?: string;
  managedElsewhereLabel?: string;
}> = [
  {
    key: "hero",
    label: "الرئيسية (Hero)",
    description: "قسم البانر الرئيسي في أعلى الصفحة.",
    managedElsewhereHref: "/admin/hero",
    managedElsewhereLabel: "إدارة شرائح Hero",
  },
  {
    key: "about",
    label: "عن المطعم",
    description: "قسم التعريف بالمطعم وقصته.",
  },
  {
    key: "featuredMenu",
    label: "أطباق مميزة",
    description: "عرض أطباق مختارة من المنيو.",
    managedElsewhereHref: "/admin/menu",
    managedElsewhereLabel: "إدارة المنيو",
  },
  {
    key: "featuredGallery",
    label: "معرض الصور",
    description: "عرض صور مميزة من المعرض.",
    managedElsewhereHref: "/admin/gallery",
    managedElsewhereLabel: "إدارة المعرض",
  },
  {
    key: "offers",
    label: "العروض",
    description: "عرض العروض النشطة على الصفحة الرئيسية.",
    managedElsewhereHref: "/admin/offers",
    managedElsewhereLabel: "إدارة العروض",
  },
  {
    key: "reviews",
    label: "التقييمات",
    description: "عرض تقييمات العملاء المعتمدة.",
    managedElsewhereHref: "/admin/reviews",
    managedElsewhereLabel: "إدارة التقييمات",
  },
  {
    key: "contactCta",
    label: "دعوة للتواصل",
    description: "قسم الحجز والتواصل في نهاية الصفحة.",
    managedElsewhereHref: "/admin/settings",
    managedElsewhereLabel: "إعدادات التواصل",
  },
  {
    key: "manager",
    label: "مدير المطعم",
    description: "قسم التعريف بمدير المطعم.",
    managedElsewhereHref: "/admin/manager",
    managedElsewhereLabel: "إدارة ملف المدير",
  },
];

export function getHomepageSectionDefinition(sectionKey: string) {
  return HOMEPAGE_SECTION_DEFINITIONS.find(
    (definition) => definition.key === sectionKey,
  );
}

export function getHomepageSectionLabel(sectionKey: string) {
  return getHomepageSectionDefinition(sectionKey)?.label ?? sectionKey;
}

export function reorderHomepageSectionList<
  T extends { id: string; sortOrder: number },
>(sections: T[], fromIndex: number, toIndex: number) {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= sections.length ||
    toIndex >= sections.length
  ) {
    return sections;
  }

  const nextSections = [...sections];
  const [movedSection] = nextSections.splice(fromIndex, 1);
  nextSections.splice(toIndex, 0, movedSection);

  return nextSections.map((section, index) => ({
    ...section,
    sortOrder: index,
  }));
}

export function buildHomepageSectionReorderPayload<
  T extends { id: string; sortOrder: number },
>(sections: T[]) {
  return sections.map((section, index) => ({
    id: section.id,
    sortOrder: index,
  }));
}
