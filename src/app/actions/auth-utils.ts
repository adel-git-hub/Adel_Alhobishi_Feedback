"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function verifySession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function verifyAdmin() {
  const user = await verifySession();
  if (user.role !== "ADMIN") {
    throw new Error("Forbidden: Admin access required");
  }
  return user;
}

export async function verifyManager() {
  const user = await verifySession();
  if (user.role !== "ADMIN" && user.role !== "MANAGER" && user.role !== "DEPARTMENT_MANAGER") {
    throw new Error("Forbidden: Manager access required");
  }
  return user;
}

export async function verifyEmployee() {
  const user = await verifySession();
  // An employee can view their own, but Admins/Managers could also have Employee privileges if needed, 
  // but let's restrict to authenticated users. They will only see their own ID's evaluations.
  return user;
}
