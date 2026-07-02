import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import bcrypt from "bcrypt";
import { headers } from "next/headers";
import { prisma } from "./db";

export const ADMIN_ROLE_NAMES = ["Super Admin", "Admin", "Staff"] as const;

export type AdminRoleName = (typeof ADMIN_ROLE_NAMES)[number];

const fallbackSecret = "development-only-better-auth-secret-change-before-production";

const DEV_TRUSTED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
] as const;

export const auth = betterAuth({
  secret: process.env.AUTH_SECRET ?? process.env.BETTER_AUTH_SECRET ?? fallbackSecret,
  baseURL:
    process.env.BETTER_AUTH_URL ?? process.env.APP_URL ?? "http://localhost:3000",
  trustedOrigins: [...DEV_TRUSTED_ORIGINS],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    modelName: "user",
  },
  session: {
    modelName: "session",
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  account: {
    modelName: "account",
  },
  verification: {
    modelName: "verification",
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    password: {
      hash: (password) => bcrypt.hash(password, 12),
      verify: ({ hash, password }) => bcrypt.compare(password, hash),
    },
  },
  plugins: [nextCookies()],
});

export async function getCurrentAdminSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      userRoles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user?.isActive) {
    return null;
  }

  const roles = user.userRoles.map((userRole) => userRole.role.name);
  const hasAdminRole = roles.some((role) =>
    ADMIN_ROLE_NAMES.includes(role as AdminRoleName),
  );

  if (!hasAdminRole) {
    return null;
  }

  return {
    session,
    user,
    roles,
  };
}
