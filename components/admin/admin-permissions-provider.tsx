"use client";

import { createContext, useContext, useMemo } from "react";

import { getClientAdminCanEdit } from "@/lib/admin/permissions-client";
import type { PermissionKey } from "@/lib/authorization";

type AdminPermissionsContextValue = {
  roles: string[];
  permissions: string[];
  isSuperAdmin: boolean;
  canEdit: (permission: PermissionKey) => boolean;
};

const AdminPermissionsContext = createContext<AdminPermissionsContextValue | null>(
  null,
);

type AdminPermissionsProviderProps = {
  roles: string[];
  permissions: string[];
  isSuperAdmin: boolean;
  children: React.ReactNode;
};

export function AdminPermissionsProvider({
  roles,
  permissions,
  isSuperAdmin,
  children,
}: AdminPermissionsProviderProps) {
  const value = useMemo<AdminPermissionsContextValue>(
    () => ({
      roles,
      permissions,
      isSuperAdmin,
      canEdit: (permission) =>
        getClientAdminCanEdit(roles, permissions, permission),
    }),
    [roles, permissions, isSuperAdmin],
  );

  return (
    <AdminPermissionsContext.Provider value={value}>
      {children}
    </AdminPermissionsContext.Provider>
  );
}

export function useAdminCanEdit(permission: PermissionKey) {
  const context = useContext(AdminPermissionsContext);

  if (!context) {
    return false;
  }

  return context.canEdit(permission);
}
