import { auth } from "@/lib/auth";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set("content-type", "application/json");
  headers.set("origin", request.nextUrl.origin);

  const signOutRequest = new Request(new URL("/api/auth/sign-out", request.url), {
    method: "POST",
    headers,
    body: "{}",
  });

  return auth.handler(signOutRequest);
}
