import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PublicSiteShell } from "@/lib/api/public-site-shell";
import { getHomeSectionLabels } from "@/lib/public/home-sections";

type HomeContactCtaSectionProps = {
  shell: PublicSiteShell;
};

export function HomeContactCtaSection({ shell }: HomeContactCtaSectionProps) {
  const labels = getHomeSectionLabels(shell.locale);
  const showContact =
    shell.featureFlags.messagesEnabled || shell.contact.publicContactEnabled;
  const showReservation = shell.reservation.enabled;
  const showWhatsapp = shell.whatsapp.enabled && shell.whatsapp.href;

  if (!showContact && !showReservation && !showWhatsapp) {
    return null;
  }

  return (
    <section className="bg-[var(--public-primary)] py-14 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="space-y-2">
          <p className="text-sm font-medium text-white/80">{labels.contactCta}</p>
          <h2 className="text-3xl font-semibold tracking-tight">
            {shell.restaurantName}
          </h2>
          {shell.contact.phone ? (
            <p className="text-white/85" dir="ltr">
              {shell.contact.phone}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          {showReservation ? (
            <Button
              asChild
              size="lg"
              className="bg-white text-[var(--public-primary)] hover:bg-white/90"
            >
              <Link href={shell.reservation.href} prefetch>
                <Phone className="size-4" />
                {labels.reserve}
              </Link>
            </Button>
          ) : null}

          {showWhatsapp ? (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href={shell.whatsapp.href!} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-4" />
                {labels.whatsapp}
              </Link>
            </Button>
          ) : null}

          {showContact && shell.featureFlags.messagesEnabled ? (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href={`/${shell.locale}/contact`} prefetch>
                {labels.contact}
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
