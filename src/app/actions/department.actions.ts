"use server";

import { prisma } from "@/lib/prisma";
import { verifyManager } from "./auth-utils";
import { PublicAccessType } from "@prisma/client";

export async function getDepartments(branchId?: string) {
  const user = await verifyManager();
  
  // RBAC logic: Manager can only view their own branch
  let queryBranchId = branchId;
  if (user.role === "MANAGER") {
    queryBranchId = user.branchId || undefined;
    if (!queryBranchId) {
      return []; // Manager with no branch sees nothing
    }
  }

  const whereClause = queryBranchId ? { branchId: queryBranchId } : {};

  return prisma.department.findMany({
    where: whereClause,
    include: { branch: { select: { name: true } }, _count: { select: { users: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createDepartment(data: { name: string; branchId: string; accessType: PublicAccessType }) {
  const user = await verifyManager();

  // RBAC logic: Manager can only create in their own branch
  if (user.role === "MANAGER" && user.branchId !== data.branchId) {
    throw new Error("Forbidden: You can only manage departments in your own branch");
  }

  return prisma.department.create({
    data: {
      name: data.name,
      branchId: data.branchId,
      accessType: data.accessType,
    },
  });
}

export async function updateDepartment(id: string, data: { name?: string; accessType?: PublicAccessType }) {
  const user = await verifyManager();

  // RBAC check: verify department exists and user can access it
  const existing = await prisma.department.findUnique({ where: { id } });
  if (!existing) throw new Error("Department not found");

  if (user.role === "MANAGER" && user.branchId !== existing.branchId) {
    throw new Error("Forbidden: You can only manage departments in your own branch");
  }

  return prisma.department.update({
    where: { id },
    data,
  });
}

export async function deleteDepartment(id: string) {
  const user = await verifyManager();

  const existing = await prisma.department.findUnique({ where: { id } });
  if (!existing) throw new Error("Department not found");

  if (user.role === "MANAGER" && user.branchId !== existing.branchId) {
    throw new Error("Forbidden: You can only manage departments in your own branch");
  }

  // Unlink users from this department first
  await prisma.user.updateMany({
    where: { departmentId: id },
    data: { departmentId: null }
  });

  return prisma.department.delete({
    where: { id },
  });
}
