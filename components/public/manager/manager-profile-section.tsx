import { Mail, MessageCircle, Phone } from "lucide-react";

import type {
  PublicManagerProfile,
  PublicSiteShell,
} from "@/lib/api/public-site-shell";
import {
  getManagerSectionLabels,
  getPublicManagerContactLinks,
  resolvePublicManagerProfile,
  shouldRenderManagerProfileSection,
  type PublicManagerContactLinks,
} from "@/lib/public/manager-content";
import type { PublicLocale } from "@/lib/public/locale";
import { cn } from "@/lib/utils";

type ManagerProfileSectionProps = {
  locale: PublicLocale;
  profile: PublicManagerProfile | null;
  contactLinks?: PublicManagerContactLinks;
  className?: string;
  showHiddenPlaceholder?: boolean;
};

export function ManagerProfileSection({
  locale,
  profile,
  contactLinks,
  className,
  showHiddenPlaceholder = false,
}: ManagerProfileSectionProps) {
  const labels = getManagerSectionLabels(locale);
  const content = resolvePublicManagerProfile(locale, profile);

  if (!profile?.isVisible) {
    if (!showHiddenPlaceholder) {
      return null;
    }

    return (
      <section className={cn("rounded-2xl border border-dashed p-6", className)}>
        <p className="text-muted-foreground text-sm">{labels.hiddenPreview}</p>
      </section>
    );
  }

  if (!content) {
    return null;
  }

  return (
    <section className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        {content.imageUrl ? (
          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={content.imageUrl}
              alt={content.imageAlt ?? content.name}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-[4/5] items-center justify-center rounded-2xl border bg-muted/40">
            <span className="text-muted-foreground text-sm">{content.name}</span>
          </div>
        )}

        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-medium text-[var(--public-primary)]">
              {labels.subtitle}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight">
              {content.name}
            </h2>
            {content.title ? (
              <p className="text-lg text-[var(--public-secondary)]">
                {content.title}
              </p>
            ) : null}
          </div>

          {content.bio ? (
            <p className="text-muted-foreground text-base leading-8 whitespace-pre-line">
              {content.bio}
            </p>
          ) : null}

          {contactLinks ? (
            <ManagerProfileContactLinks locale={locale} links={contactLinks} />
          ) : null}
        </div>
      </div>
    </section>
  );
}

type ManagerProfileFromShellProps = {
  shell: PublicSiteShell;
  className?: string;
};

export function ManagerProfileSectionFromShell({
  shell,
  className,
}: ManagerProfileFromShellProps) {
  if (!shouldRenderManagerProfileSection(shell.managerProfile, shell.locale)) {
    return null;
  }

  return (
    <ManagerProfileSection
      locale={shell.locale}
      profile={shell.managerProfile}
      contactLinks={getPublicManagerContactLinks(shell)}
      className={className}
    />
  );
}

function ManagerProfileContactLinks({
  locale,
  links,
}: {
  locale: PublicLocale;
  links: PublicManagerContactLinks;
}) {
  const labels = getManagerSectionLabels(locale);
  const hasContact =
    links.phone ||
    links.email ||
    links.whatsappHref ||
    links.socialLinks.length > 0;

  if (!hasContact) {
    return null;
  }

  return (
    <div className="space-y-4 border-t pt-5">
      <div className="flex flex-wrap gap-3">
        {links.phone ? (
          <a
            href={`tel:${links.phone}`}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors hover:border-[var(--public-primary)] hover:text-[var(--public-primary)]"
          >
            <Phone className="size-4 shrink-0" />
            <span>{labels.phone}</span>
            <span dir="ltr" className="text-muted-foreground">
              {links.phone}
            </span>
          </a>
        ) : null}

        {links.whatsappHref ? (
          <a
            href={links.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors hover:border-[var(--public-primary)] hover:text-[var(--public-primary)]"
          >
            <MessageCircle className="size-4 shrink-0" />
            <span>{labels.whatsapp}</span>
            {links.whatsappNumber ? (
              <span dir="ltr" className="text-muted-foreground">
                {links.whatsappNumber}
              </span>
            ) : null}
          </a>
        ) : null}

        {links.email ? (
          <a
            href={`mailto:${links.email}`}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors hover:border-[var(--public-primary)] hover:text-[var(--public-primary)]"
          >
            <Mail className="size-4 shrink-0" />
            <span>{labels.email}</span>
            <span dir="ltr" className="text-muted-foreground">
              {links.email}
            </span>
          </a>
        ) : null}
      </div>

      {links.socialLinks.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">{labels.social}</p>
          <div className="flex flex-wrap gap-2">
            {links.socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:border-[var(--public-primary)] hover:text-[var(--public-primary)]"
              >
                {link.label ?? link.platform}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { shouldRenderManagerProfileSection };
