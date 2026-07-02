"use client";

import { Menu, Phone } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { PublicLanguageSwitch } from "@/components/public/public-language-switch";
import { PublicMobileMenu } from "@/components/public/public-mobile-menu";
import { PublicNavLinks } from "@/components/public/public-nav-links";
import { Button } from "@/components/ui/button";
import type { PublicSiteShell } from "@/lib/api/public-site-shell";
import type { PublicNavLink } from "@/lib/public/navigation";

type PublicHeaderProps = {
  shell: PublicSiteShell;
  navLinks: PublicNavLink[];
};

export function PublicHeader({ shell, navLinks }: PublicHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const reservationLabel = shell.locale === "ar" ? "احجز الآن" : "Reserve";

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b border-black/10 bg-[var(--public-header)] text-foreground shadow-sm"
        style={{ backgroundColor: "var(--public-header)" }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            href={`/${shell.locale}`}
            prefetch
            className="flex min-w-0 items-center gap-3"
          >
            {shell.logo?.publicUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={shell.logo.publicUrl}
                alt={shell.restaurantName}
                className="h-10 w-auto max-w-[140px] object-contain"
              />
            ) : (
              <span className="truncate text-lg font-semibold">
                {shell.restaurantName}
              </span>
            )}
          </Link>

          <div className="hidden flex-1 lg:flex lg:justify-center">
            <PublicNavLinks links={navLinks} />
          </div>

          <div className="ms-auto flex items-center gap-2">
            <PublicLanguageSwitch
              locale={shell.locale}
              isEnglishEnabled={shell.isEnglishEnabled}
              className="hidden border-border text-foreground hover:bg-accent sm:inline-flex"
            />

            {shell.reservation.enabled ? (
              <Button
                asChild
                size="sm"
                className="hidden bg-[var(--public-button)] text-white hover:bg-[var(--public-button)]/90 sm:inline-flex"
              >
                <Link href={shell.reservation.href} prefetch>
                  <Phone className="size-4" />
                  {reservationLabel}
                </Link>
              </Button>
            ) : null}

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label={shell.locale === "ar" ? "فتح القائمة" : "Open menu"}
            >
              <Menu className="size-5" />
            </Button>
          </div>
        </div>
      </header>

      <PublicMobileMenu
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        shell={shell}
        navLinks={navLinks}
      />
    </>
  );
}
