import { getCurrentAuthorization, hasPermission } from "@/lib/authorization";

export async function getAdminCanEditSettings() {
  const authorization = await getCurrentAuthorization();

  if (!authorization) {
    return false;
  }

  return (
    (authorization.isAdmin || authorization.isSuperAdmin) &&
    hasPermission(authorization, "settings.manage")
  );
}

export async function getAdminCanEditMedia() {
  const authorization = await getCurrentAuthorization();

  if (!authorization) {
    return false;
  }

  return (
    (authorization.isAdmin || authorization.isSuperAdmin) &&
    hasPermission(authorization, "media.manage")
  );
}

export async function getAdminCanEditMenu() {
  const authorization = await getCurrentAuthorization();

  if (!authorization) {
    return false;
  }

  return (
    (authorization.isAdmin || authorization.isSuperAdmin) &&
    hasPermission(authorization, "menu.manage")
  );
}

export async function getAdminCanEditGallery() {
  const authorization = await getCurrentAuthorization();

  if (!authorization) {
    return false;
  }

  return (
    (authorization.isAdmin || authorization.isSuperAdmin) &&
    hasPermission(authorization, "gallery.manage")
  );
}

export async function getAdminCanEditOffers() {
  const authorization = await getCurrentAuthorization();

  if (!authorization) {
    return false;
  }

  return (
    (authorization.isAdmin || authorization.isSuperAdmin) &&
    hasPermission(authorization, "offers.manage")
  );
}

export async function getAdminCanEditReviews() {
  const authorization = await getCurrentAuthorization();

  if (!authorization) {
    return false;
  }

  return (
    (authorization.isAdmin || authorization.isSuperAdmin) &&
    hasPermission(authorization, "reviews.manage")
  );
}

export async function getAdminCanEditMessages() {
  const authorization = await getCurrentAuthorization();

  if (!authorization) {
    return false;
  }

  return (
    (authorization.isAdmin || authorization.isSuperAdmin) &&
    hasPermission(authorization, "messages.manage")
  );
}

export async function getAdminCanEditHero() {
  const authorization = await getCurrentAuthorization();

  if (!authorization) {
    return false;
  }

  return (
    (authorization.isAdmin || authorization.isSuperAdmin) &&
    hasPermission(authorization, "hero.manage")
  );
}
