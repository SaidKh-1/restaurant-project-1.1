"use client";

import { AdminHeader } from "@/components/admin/admin-header";
import { AdminPermissionsProvider } from "@/components/admin/admin-permissions-provider";
import { AdminRoutePrefetcher } from "@/components/admin/admin-route-prefetcher";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import type { AdminShellProps } from "@/lib/admin/types";

type AdminShellPropsWithRestaurant = AdminShellProps & {
  restaurantName?: string | null;
  children: React.ReactNode;
};

export function AdminShell({
  children,
  restaurantName,
  ...session
}: AdminShellPropsWithRestaurant) {
  return (
    <AdminPermissionsProvider
      roles={session.roles}
      permissions={session.permissions}
      isSuperAdmin={session.isSuperAdmin}
    >
      <div className="min-h-screen">
        <AdminRoutePrefetcher />
        <div className="fixed inset-y-0 start-0 z-30 hidden h-svh w-64 overflow-hidden lg:block">
          <AdminSidebar
            permissions={session.permissions}
            isSuperAdmin={session.isSuperAdmin}
          />
        </div>

        <div className="flex min-h-screen flex-col lg:ps-64">
          <AdminHeader {...session} restaurantName={restaurantName} />
          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </AdminPermissionsProvider>
  );
}
