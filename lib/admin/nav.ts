import type { PermissionKey } from "@/lib/authorization";
import {
  ChefHat,
  Fish,
  GalleryHorizontalEnd,
  Home,
  ImageIcon,
  LayoutDashboard,
  Mail,
  Megaphone,
  Palette,
  Search,
  Settings,
  Star,
  UserCircle,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AdminNavItem = {
  title: string;
  href?: string;
  icon: LucideIcon;
  permission?: PermissionKey;
  disabled?: boolean;
  badge?: string;
};

export type AdminNavGroup = {
  label: string;
  items: AdminNavItem[];
};

export const adminNavGroups: AdminNavGroup[] = [
  {
    label: "الرئيسية",
    items: [
      {
        title: "لوحة التحكم",
        href: "/admin",
        icon: LayoutDashboard,
        permission: "dashboard.read",
      },
    ],
  },
  {
    label: "المحتوى",
    items: [
      {
        title: "إدارة الصفحة الرئيسية",
        href: "/admin/homepage",
        icon: Home,
        permission: "homepage.manage",
      },
      {
        title: "Hero Slider",
        href: "/admin/hero",
        icon: ImageIcon,
      },
      {
        title: "العروض",
        href: "/admin/offers",
        icon: Megaphone,
      },
      {
        title: "معرض الصور",
        href: "/admin/gallery",
        icon: GalleryHorizontalEnd,
      },
      {
        title: "مدير المطعم",
        href: "/admin/manager",
        icon: UserCircle,
      },
    ],
  },
  {
    label: "المنيو",
    items: [
      {
        title: "إدارة المنيو",
        href: "/admin/menu",
        icon: Fish,
      },
    ],
  },
  {
    label: "العمليات",
    items: [
      {
        title: "الحجوزات",
        href: "/admin/reservations",
        icon: ChefHat,
      },
      {
        title: "الرسائل",
        href: "/admin/messages",
        icon: Mail,
      },
      {
        title: "التقييمات",
        href: "/admin/reviews",
        icon: Star,
      },
    ],
  },
  {
    label: "الإعدادات",
    items: [
      {
        title: "مكتبة الصور",
        href: "/admin/media",
        icon: ImageIcon,
      },
      {
        title: "إدارة المظهر",
        href: "/admin/theme",
        icon: Palette,
        permission: "theme.manage",
      },
      {
        title: "إعدادات SEO",
        href: "/admin/seo",
        icon: Search,
      },
      {
        title: "إعدادات الموقع",
        href: "/admin/settings",
        icon: Settings,
      },
      {
        title: "المستخدمون والصلاحيات",
        icon: Users,
        disabled: true,
        badge: "قريباً",
        permission: "users.manage",
      },
    ],
  },
];

export function canAccessNavItem(
  permissions: string[],
  isSuperAdmin: boolean,
  item: AdminNavItem,
) {
  if (item.disabled) {
    return false;
  }

  if (!item.permission) {
    return true;
  }

  if (isSuperAdmin) {
    return true;
  }

  return permissions.includes(item.permission);
}
