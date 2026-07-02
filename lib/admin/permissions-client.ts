import type { PermissionKey } from "@/lib/authorization";

export function getClientAdminCanEdit(
  roles: string[],
  permissions: string[],
  permission: PermissionKey,
): boolean {
  if (roles.includes("Super Admin")) {
    return true;
  }

  if (!roles.includes("Admin")) {
    return false;
  }

  return permissions.includes(permission);
}

export function upsertById<T extends { id: string }>(items: T[], item: T): T[] {
  const index = items.findIndex((entry) => entry.id === item.id);

  if (index === -1) {
    return [...items, item];
  }

  return items.map((entry, entryIndex) =>
    entryIndex === index ? item : entry,
  );
}

export function removeById<T extends { id: string }>(
  items: T[],
  id: string,
): T[] {
  return items.filter((entry) => entry.id !== id);
}

export function patchById<T extends { id: string }>(
  items: T[],
  id: string,
  patch: Partial<T>,
): T[] {
  return items.map((entry) =>
    entry.id === id ? { ...entry, ...patch } : entry,
  );
}
