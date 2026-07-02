import { AdminShell } from "@/components/admin/admin-shell";
import { getCachedRestaurantName } from "@/lib/admin/layout-data";
import { requireStaffOrAbove } from "@/lib/authorization";
import { redirect } from "next/navigation";

export default async function AdminProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let authorization;

  try {
    authorization = await requireStaffOrAbove();
  } catch {
    redirect("/admin/login");
  }

  const restaurantName = await getCachedRestaurantName(
    authorization.user.restaurantId,
  );

  return (
    <AdminShell
      user={{
        name: authorization.user.name,
        email: authorization.user.email,
        image: authorization.user.image,
      }}
      roles={authorization.roles}
      permissions={authorization.permissions}
      isSuperAdmin={authorization.isSuperAdmin}
      restaurantName={restaurantName}
    >
      {children}
    </AdminShell>
  );
}
