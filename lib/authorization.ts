import { headers } from "next/headers";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { auth, ADMIN_ROLE_NAMES, type AdminRoleName } from "./auth";
import { prisma } from "./db";

const AUTHORIZATION_CACHE_SECONDS = 60;

export const PERMISSION_KEYS = [
  "dashboard.read",
  "homepage.manage",
  "hero.manage",
  "menu.manage",
  "cooking_methods.manage",
  "offers.manage",
  "reservations.manage",
  "messages.manage",
  "reviews.manage",
  "gallery.manage",
  "media.manage",
  "manager_profile.manage",
  "theme.manage",
  "seo.manage",
  "settings.manage",
  "users.manage",
  "roles.manage",
  "permissions.manage",
  "audit_logs.read",
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

export type AuthorizationContext = Awaited<
  ReturnType<typeof getAuthorizationForUserId>
>;

export class AuthorizationError extends Error {
  constructor(
    message: string,
    public readonly status: 401 | 403,
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

function isAdminRole(role: string): role is AdminRoleName {
  return ADMIN_ROLE_NAMES.includes(role as AdminRoleName);
}

export function hasRole(
  authorization: AuthorizationContext | null,
  role: AdminRoleName,
) {
  return authorization?.roles.includes(role) ?? false;
}

export function hasAnyRole(
  authorization: AuthorizationContext | null,
  roles: readonly AdminRoleName[],
) {
  return roles.some((role) => hasRole(authorization, role));
}

export function hasPermission(
  authorization: AuthorizationContext | null,
  permission: PermissionKey,
) {
  if (!authorization) {
    return false;
  }

  if (hasRole(authorization, "Super Admin")) {
    return true;
  }

  return authorization.permissions.includes(permission);
}

export function hasAllPermissions(
  authorization: AuthorizationContext | null,
  permissions: readonly PermissionKey[],
) {
  return permissions.every((permission) =>
    hasPermission(authorization, permission),
  );
}

export function hasAnyPermission(
  authorization: AuthorizationContext | null,
  permissions: readonly PermissionKey[],
) {
  return permissions.some((permission) =>
    hasPermission(authorization, permission),
  );
}

export async function loadAuthorizationForUserId(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user?.isActive) {
    return null;
  }

  const roles = user.userRoles
    .map((userRole) => userRole.role.name)
    .filter(isAdminRole);

  if (roles.length === 0) {
    return null;
  }

  const permissions = Array.from(
    new Set(
      user.userRoles.flatMap((userRole) =>
        userRole.role.rolePermissions.map(
          (rolePermission) => rolePermission.permission.key as PermissionKey,
        ),
      ),
    ),
  );

  return {
    user,
    roles,
    permissions,
    isSuperAdmin: roles.includes("Super Admin"),
    isAdmin: roles.includes("Admin"),
    isStaff: roles.includes("Staff"),
  };
}

function getCachedAuthorizationForUserId(userId: string) {
  return unstable_cache(
    () => loadAuthorizationForUserId(userId),
    ["admin-authorization", userId],
    { revalidate: AUTHORIZATION_CACHE_SECONDS },
  )();
}

export async function getAuthorizationForUserId(userId: string) {
  return getCachedAuthorizationForUserId(userId);
}

export const getCurrentAuthorization = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return null;
  }

  const authorization = await getAuthorizationForUserId(session.user.id);

  if (!authorization) {
    return null;
  }

  return {
    ...authorization,
    session,
  };
});

export async function requireCurrentAdmin() {
  const authorization = await getCurrentAuthorization();

  if (!authorization) {
    throw new AuthorizationError("Authentication required.", 401);
  }

  return authorization;
}

export async function requireRole(role: AdminRoleName) {
  const authorization = await requireCurrentAdmin();

  if (!hasRole(authorization, role)) {
    throw new AuthorizationError(`${role} role required.`, 403);
  }

  return authorization;
}

export async function requireAnyRole(roles: readonly AdminRoleName[]) {
  const authorization = await requireCurrentAdmin();

  if (!hasAnyRole(authorization, roles)) {
    throw new AuthorizationError("Required admin role missing.", 403);
  }

  return authorization;
}

export async function requireSuperAdmin() {
  return requireRole("Super Admin");
}

export async function requireAdminOrSuperAdmin() {
  return requireAnyRole(["Super Admin", "Admin"]);
}

export async function requireStaffOrAbove() {
  return requireAnyRole(["Super Admin", "Admin", "Staff"]);
}

export async function requirePermission(permission: PermissionKey) {
  const authorization = await requireCurrentAdmin();

  if (!hasPermission(authorization, permission)) {
    throw new AuthorizationError(`${permission} permission required.`, 403);
  }

  return authorization;
}

export async function requireAllPermissions(
  permissions: readonly PermissionKey[],
) {
  const authorization = await requireCurrentAdmin();

  if (!hasAllPermissions(authorization, permissions)) {
    throw new AuthorizationError("Required permissions missing.", 403);
  }

  return authorization;
}

export async function requireAnyPermission(
  permissions: readonly PermissionKey[],
) {
  const authorization = await requireCurrentAdmin();

  if (!hasAnyPermission(authorization, permissions)) {
    throw new AuthorizationError("Required permission missing.", 403);
  }

  return authorization;
}
