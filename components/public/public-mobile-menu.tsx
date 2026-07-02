"use client";

import Link from "next/link";
import { Phone } from "lucide-react";

import { PublicLanguageSwitch } from "@/components/public/public-language-switch";
import { PublicNavLinks } from "@/components/public/public-nav-links";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { PublicSiteShell } from "@/lib/api/public-site-shell";
import type { PublicNavLink } from "@/lib/public/navigation";

type PublicMobileMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shell: PublicSiteShell;
  navLinks: PublicNavLink[];
};

export function PublicMobileMenu({
  open,
  onOpenChange,
  shell,
  navLinks,
}: PublicMobileMenuProps) {
  const reservationLabel = shell.locale === "ar" ? "احجز الآن" : "Reserve";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={shell.dir === "rtl" ? "right" : "left"} className="w-full max-w-sm">
        <SheetHeader className="text-start">
          <SheetTitle>{shell.restaurantName}</SheetTitle>
          <SheetDescription>
            {shell.locale === "ar" ? "تصفح أقسام الموقع" : "Browse site sections"}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-4">
          <PublicNavLinks
            links={navLinks}
            className="flex-col items-stretch gap-1"
            linkClassName="w-full text-start"
            onNavigate={() => onOpenChange(false)}
          />

          <div className="flex flex-col gap-2 border-t pt-4">
            <PublicLanguageSwitch
              locale={shell.locale}
              isEnglishEnabled={shell.isEnglishEnabled}
              className="w-full justify-center border-border text-foreground hover:bg-accent"
            />

            {shell.reservation.enabled ? (
              <Button
                asChild
                className="w-full bg-[var(--public-button)] text-white hover:bg-[var(--public-button)]/90"
              >
                <Link href={shell.reservation.href} prefetch onClick={() => onOpenChange(false)}>
                  <Phone className="size-4" />
                  {reservationLabel}
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
