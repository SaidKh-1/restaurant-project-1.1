"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { adminNavGroups, canAccessNavItem } from "@/lib/admin/nav";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  permissions: string[];
  isSuperAdmin: boolean;
  onNavigate?: () => void;
  className?: string;
};

export function AdminSidebar({
  permissions,
  isSuperAdmin,
  onNavigate,
  className,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside
      className={cn(
        "bg-sidebar text-sidebar-foreground flex h-full min-h-0 w-full flex-col overflow-hidden border-s border-sidebar-border",
        className,
      )}
    >
      <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-4">
        <Link
          href="/admin"
          prefetch
          className="flex flex-col gap-0.5"
          onClick={onNavigate}
          onMouseEnter={() => router.prefetch("/admin")}
        >
          <span className="text-xs text-muted-foreground">لوحة الإدارة</span>
          <span className="text-base font-semibold">مطعم CMS</span>
        </Link>
      </div>

      <ScrollArea className="min-h-0 flex-1 px-3 py-4">
        <nav className="space-y-6">
          {adminNavGroups.map((group) => {
            const visibleItems = group.items.filter((item) =>
              item.disabled
                ? true
                : canAccessNavItem(permissions, isSuperAdmin, item),
            );

            if (visibleItems.length === 0) {
              return null;
            }

            return (
              <div key={group.label} className="space-y-2">
                <p className="text-muted-foreground px-2 text-xs font-medium">
                  {group.label}
                </p>
                <ul className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.href === "/admin"
                        ? pathname === "/admin"
                        : item.href
                          ? pathname.startsWith(item.href)
                          : false;
                    const isDisabled = item.disabled || !item.href;

                    return (
                      <li key={item.title}>
                        {isDisabled ? (
                          <div className="text-muted-foreground flex items-center justify-between gap-2 rounded-md px-2 py-2 text-sm">
                            <span className="flex items-center gap-2">
                              <Icon className="size-4 shrink-0" />
                              <span>{item.title}</span>
                            </span>
                            {item.badge ? (
                              <Badge variant="secondary" className="text-[10px]">
                                {item.badge}
                              </Badge>
                            ) : null}
                          </div>
                        ) : (
                          <Link
                            href={item.href!}
                            prefetch
                            onClick={onNavigate}
                            onMouseEnter={() => router.prefetch(item.href!)}
                            className={cn(
                              "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                              isActive
                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                : "text-sidebar-foreground hover:bg-sidebar-accent/70",
                            )}
                          >
                            <Icon className="size-4 shrink-0" />
                            <span>{item.title}</span>
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator className="shrink-0" />
      <div className="shrink-0 p-4 text-xs text-muted-foreground">
        واجهة عربية — المحتوى العام يدعم العربية والإنجليزية
      </div>
    </aside>
  );
}
