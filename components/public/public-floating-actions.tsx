import Link from "next/link";
import { MessageCircle } from "lucide-react";

import type { PublicSiteShell } from "@/lib/api/public-site-shell";

type PublicFloatingActionsProps = {
  shell: PublicSiteShell;
};

export function PublicFloatingActions({ shell }: PublicFloatingActionsProps) {
  if (!shell.whatsapp.enabled || !shell.whatsapp.href) {
    return null;
  }

  const label = shell.locale === "ar" ? "تواصل عبر واتساب" : "Chat on WhatsApp";

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-40 flex justify-end">
      <Link
        href={shell.whatsapp.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] hover:bg-[#20bd5a]"
      >
        <MessageCircle className="size-5" />
        <span className="hidden sm:inline">{label}</span>
      </Link>
    </div>
  );
}
