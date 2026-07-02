"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { PublicNavLink } from "@/lib/public/navigation";
import { cn } from "@/lib/utils";

type PublicNavLinksProps = {
  links: PublicNavLink[];
  className?: string;
  linkClassName?: string;
  onNavigate?: () => void;
};

export function PublicNavLinks({
  links,
  className,
  linkClassName,
  onNavigate,
}: PublicNavLinksProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex items-center gap-1", className)}>
      {links.map((link) => {
        const isActive =
          link.href === pathname ||
          (link.href !== links[0]?.href && pathname.startsWith(`${link.href}/`));

        return (
          <Link
            key={link.href}
            href={link.href}
            prefetch
            onClick={onNavigate}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-black/5",
              isActive && "bg-black/5 text-[var(--public-primary)]",
              linkClassName,
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
