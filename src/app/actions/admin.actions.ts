"use server";

import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "./auth-utils";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

// --- Stats ---
export async function getAdminStats() {
  await verifyAdmin();
  const [totalEvals, avgScoreData, satisfactionData] = await Promise.all([
    prisma.evaluation.count(),
    prisma.evaluation.aggregate({ _avg: { overallScore: true } }),
    prisma.evaluation.count({ where: { overallScore: { gte: 4 } } }),
  ]);

  const avgScore = avgScoreData._avg.overallScore || 0;
  const satisfactionPct = totalEvals > 0 ? Math.round((satisfactionData / totalEvals) * 100) : 0;

  return { totalEvals, avgScore, satisfactionPct };
}

export async function getBranchPerformance() {
  await verifyAdmin();
  const branches = await prisma.branch.findMany({
    include: {
      evaluations: { select: { overallScore: true } }
    }
  });

  return branches.map(b => {
    const reviews = b.evaluations.length;
    const score = reviews > 0 
      ? b.evaluations.reduce((acc, curr) => acc + curr.overallScore, 0) / reviews 
      : 0;
    
    return {
      branch: b.name,
      reviews,
      score: Number(score.toFixed(1)),
      pct: reviews > 0 ? Math.round((score / 5) * 100) : 0
    };
  });
}

// --- Branches ---
export async function getBranches() {
  await verifyAdmin();
  return prisma.branch.findMany({
    include: { _count: { select: { users: true } } },
    orderBy: { createdAt: 'desc' }
  });
}

export async function saveBranch(data: { id?: string; name: string; location: string }) {
  await verifyAdmin();
  if (data.id) {
    await prisma.branch.update({
      where: { id: data.id },
      data: { name: data.name, location: data.location }
    });
  } else {
    await prisma.branch.create({
      data: { name: data.name, location: data.location }
    });
  }
  revalidatePath("/admin/branches");
  return { success: true };
}

export async function deleteBranch(id: string) {
  await verifyAdmin();
  await prisma.evaluation.deleteMany({ where: { branchId: id } });
  await prisma.department.deleteMany({ where: { branchId: id } });
  await prisma.user.deleteMany({ where: { branchId: id } });
  await prisma.branch.delete({ where: { id } });
  revalidatePath("/admin/branches");
  return { success: true };
}

// --- Employees ---
export async function getEmployees() {
  await verifyAdmin();
  return prisma.user.findMany({
    include: { branch: { select: { name: true } }, department: { select: { name: true } } },
    orderBy: { createdAt: 'desc' }
  });
}

export async function saveEmployee(data: { id?: string; name: string; email: string; role: Role; branchId: string; departmentId?: string; password?: string }) {
  await verifyAdmin();
  
  try {
    let updateData: any = { 
      name: data.name, 
      email: data.email, 
      role: data.role, 
      branchId: data.branchId,
      departmentId: data.departmentId || null
    };
    
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    if (data.id) {
      await prisma.user.update({
        where: { id: data.id },
        data: updateData
      });
    } else {
      const plainPassword = data.password || (data.role === "EMPLOYEE" ? "421293!@#" : "admin123");
      updateData.passwordHash = await bcrypt.hash(plainPassword, 10);
      await prisma.user.create({
        data: updateData
      });
    }
    revalidatePath("/admin/employees");
    return { success: true };
  } catch (error) {
    console.error("Error saving employee details:", error);
    throw error;
  }
}

export async function deleteEmployee(id: string) {
  await verifyAdmin();
  // Delete evaluations associated with this user first to avoid foreign key constraints
  await prisma.evaluation.deleteMany({
    where: {
      OR: [
        { employeeId: id },
        { evaluatorId: id }
      ]
    }
  });
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/employees");
  return { success: true };
}

// --- Criteria ---
export async function getCriteria() {
  await verifyAdmin();
  return prisma.criteria.findMany({ orderBy: { type: 'asc' } });
}

export async function saveCriterion(data: { id?: string; name: string; description: string; type: any; isActive?: boolean }) {
  await verifyAdmin();
  if (data.id) {
    await prisma.criteria.update({
      where: { id: data.id },
      data
    });
  } else {
    await prisma.criteria.create({ data });
  }
  revalidatePath("/admin/criteria");
  return { success: true };
}

export async function toggleCriterionActive(id: string, isActive: boolean) {
  await verifyAdmin();
  await prisma.criteria.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/criteria");
  return { success: true };
}

export async function deleteCriterion(id: string) {
  await verifyAdmin();
  await prisma.criteria.delete({ where: { id } });
  revalidatePath("/admin/criteria");
  return { success: true };
}

// --- Evaluations ---
export async function getAllEvaluations() {
  await verifyAdmin();
  return prisma.evaluation.findMany({
    include: {
      employee: { select: { name: true } },
      branch: { select: { name: true } },
      evaluator: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function deleteEvaluation(id: string) {
  await verifyAdmin();
  await prisma.evaluation.delete({ where: { id } });
  revalidatePath("/admin/evaluations");
  revalidatePath("/manager/evaluations");
  return { success: true };
}
