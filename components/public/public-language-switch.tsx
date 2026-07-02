"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  getAlternateLocale,
  swapLocaleInPathname,
  type PublicLocale,
} from "@/lib/public/locale";
import { cn } from "@/lib/utils";

type PublicLanguageSwitchProps = {
  locale: PublicLocale;
  isEnglishEnabled: boolean;
  className?: string;
};

export function PublicLanguageSwitch({
  locale,
  isEnglishEnabled,
  className,
}: PublicLanguageSwitchProps) {
  const pathname = usePathname();

  if (!isEnglishEnabled) {
    return null;
  }

  const alternateLocale = getAlternateLocale(locale);
  const href = swapLocaleInPathname(pathname, alternateLocale);
  const label = locale === "ar" ? "English" : "العربية";

  return (
    <Link
      href={href}
      prefetch
      className={cn(
        "inline-flex h-9 items-center rounded-md border border-white/20 px-3 text-sm font-medium transition-colors hover:bg-white/10",
        className,
      )}
      lang={alternateLocale}
    >
      {label}
    </Link>
  );
}
