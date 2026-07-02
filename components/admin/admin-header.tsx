"use client";

import Link from "next/link";
import { useState } from "react";
import { LogOut, Menu, UserRound } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import type { AdminShellProps } from "@/lib/admin/types";

type AdminHeaderProps = AdminShellProps & {
  restaurantName?: string | null;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function AdminHeader({
  user,
  permissions,
  isSuperAdmin,
  restaurantName,
}: AdminHeaderProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <header className="bg-background sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="size-4" />
              <span className="sr-only">فتح القائمة</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[min(100vw-2rem,20rem)] p-0">
            <AdminSidebar
              permissions={permissions}
              isSuperAdmin={isSuperAdmin}
              onNavigate={() => setMobileNavOpen(false)}
              className="border-0"
            />
          </SheetContent>
        </Sheet>

        <div className="min-w-0">
          <p className="text-muted-foreground hidden text-xs sm:block">
            {restaurantName ?? "إدارة المطعم"}
          </p>
          <p className="truncate text-sm font-medium sm:text-base">
            لوحة التحكم
          </p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-auto gap-2 px-2 py-1.5">
            <Avatar className="size-8">
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <span className="hidden max-w-40 truncate text-sm sm:inline">
              {user.name}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1">
              <span className="font-medium">{user.name}</span>
              <span className="text-muted-foreground text-xs">{user.email}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <UserRound className="size-4" />
            الملف الشخصي
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/admin/logout">
              <LogOut className="size-4" />
              تسجيل الخروج
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
