import Link from "next/link";
import { MapPin, Phone } from "lucide-react";

import type { PublicSiteShell } from "@/lib/api/public-site-shell";
import type { PublicNavLink } from "@/lib/public/navigation";

type PublicFooterProps = {
  shell: PublicSiteShell;
  footerLinks: PublicNavLink[];
};

export function PublicFooter({ shell, footerLinks }: PublicFooterProps) {
  const currentYear = new Date().getFullYear();
  const rightsLabel =
    shell.locale === "ar"
      ? `© ${currentYear} ${shell.restaurantName}. جميع الحقوق محفوظة.`
      : `© ${currentYear} ${shell.restaurantName}. All rights reserved.`;
  const quickLinksLabel = shell.locale === "ar" ? "روابط سريعة" : "Quick links";
  const contactLabel = shell.locale === "ar" ? "تواصل معنا" : "Contact";

  return (
    <footer
      className="mt-auto border-t border-black/10 bg-[var(--public-footer)] text-foreground"
      style={{ backgroundColor: "var(--public-footer)" }}
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">{shell.restaurantName}</h2>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">{quickLinksLabel}</h3>
          <ul className="space-y-2">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  prefetch
                  className="text-muted-foreground hover:text-[var(--public-primary)] text-sm transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">{contactLabel}</h3>
          <div className="space-y-2 text-sm">
            {shell.contact.phone ? (
              <a
                href={`tel:${shell.contact.phone}`}
                className="text-muted-foreground hover:text-[var(--public-primary)] flex items-center gap-2 transition-colors"
              >
                <Phone className="size-4 shrink-0" />
                <span dir="ltr">{shell.contact.phone}</span>
              </a>
            ) : null}
            {shell.googleMapsUrl ? (
              <a
                href={shell.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-[var(--public-primary)] flex items-center gap-2 transition-colors"
              >
                <MapPin className="size-4 shrink-0" />
                {shell.locale === "ar" ? "الموقع على الخريطة" : "View on map"}
              </a>
            ) : null}
          </div>

          {shell.socialLinks.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-2">
              {shell.socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-black/5"
                >
                  {link.label ?? link.platform}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-t border-black/10 px-4 py-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
        {rightsLabel}
      </div>
    </footer>
  );
}
