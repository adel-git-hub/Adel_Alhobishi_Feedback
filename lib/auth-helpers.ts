import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

// Middleware for server-side route protection
export async function requireAuth(request?: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireRole(role: "ADMIN" | "MANAGER") {
  const session = await requireAuth();
  if (session.user.role !== role && session.user.role !== "ADMIN") {
    redirect("/login");
  }
  return session;
}
