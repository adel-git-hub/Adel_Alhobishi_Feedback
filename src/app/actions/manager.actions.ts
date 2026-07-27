"use server";

import { prisma } from "@/lib/prisma";
import { verifyManager } from "./auth-utils";
import { revalidatePath } from "next/cache";

export async function getManagerStats() {
  const user = await verifyManager();
  
  const evalWhere = user.role === "DEPARTMENT_MANAGER"
    ? { employee: { departmentId: user.departmentId! } }
    : user.role === "MANAGER"
      ? { branchId: user.branchId! }
      : {};

  const userWhere = user.role === "DEPARTMENT_MANAGER"
    ? { branchId: user.branchId!, departmentId: user.departmentId! }
    : user.role === "MANAGER"
      ? { branchId: user.branchId! }
      : {};
  
  const [totalEvals, avgScoreData, activeEmployees, recentEvaluations, criteriaScores] = await Promise.all([
    prisma.evaluation.count({ where: evalWhere }),
    prisma.evaluation.aggregate({ 
      where: evalWhere,
      _avg: { overallScore: true } 
    }),
    prisma.user.count({ where: { ...userWhere, isActive: true, role: { not: "ADMIN" } } }),
    prisma.evaluation.findMany({
      where: evalWhere,
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { employee: true, branch: true }
    }),
    prisma.evaluationScore.groupBy({
      by: ['criteriaId'],
      _avg: { score: true },
      where: { evaluation: evalWhere }
    })
  ]);

  const avgScore = avgScoreData._avg.overallScore || 0;
  
  // Map criteria scores to performance
  const criteriaData = await prisma.criteria.findMany();
  const criteriaPerformance = criteriaScores.map(cs => ({
    name: criteriaData.find(c => c.id === cs.criteriaId)?.name || "Unknown",
    avg: cs._avg.score || 0
  }));

  return { 
    totalEvaluations: totalEvals, 
    avgScore, 
    activeEmployees,
    recentEvaluations: recentEvaluations.map(ev => ({
      ...ev,
      score: ev.overallScore
    })),
    criteriaPerformance
  };
}

export async function getBranchEmployees() {
  const user = await verifyManager();
  if (!user.branchId && user.role !== "ADMIN") throw new Error("No branch assigned");
  
  const whereClause: any = {};
  if (user.role === "DEPARTMENT_MANAGER") {
    whereClause.branchId = user.branchId;
    whereClause.departmentId = user.departmentId;
    whereClause.role = "EMPLOYEE";
  } else if (user.role === "MANAGER") {
    whereClause.branchId = user.branchId;
  }

  return prisma.user.findMany({
    where: whereClause,
    select: { id: true, name: true, role: true, branchId: true }
  });
}

export async function getInternalCriteria() {
  await verifyManager();
  return prisma.criteria.findMany({
    where: { type: "INTERNAL_360", isActive: true }
  });
}

export async function submit360Review(data: { employeeId: string; scores: Record<string, number>; feedback: string }) {
  const user = await verifyManager();
  
  const employee = await prisma.user.findUnique({ where: { id: data.employeeId } });
  if (!employee || !employee.branchId) throw new Error("Invalid employee");

  if (user.role === "DEPARTMENT_MANAGER" && employee.departmentId !== user.departmentId) {
    throw new Error("Cannot evaluate employee from another department");
  } else if (user.role === "MANAGER" && employee.branchId !== user.branchId) {
    throw new Error("Cannot evaluate employee from another branch");
  }

  const scoreValues = Object.values(data.scores);
  const overallScore = scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length;

  await prisma.evaluation.create({
    data: {
      type: "INTERNAL_360",
      overallScore,
      feedback: data.feedback,
      branchId: employee.branchId,
      employeeId: data.employeeId,
      evaluatorId: user.id,
      scores: {
        create: Object.entries(data.scores).map(([criteriaId, score]) => ({
          criteriaId,
          score
        }))
      }
    }
  });

  revalidatePath("/manager/360-review");
  return { success: true };
}

export async function getManagerAlerts() {
  const user = await verifyManager();
  
  const evalWhere = user.role === "DEPARTMENT_MANAGER"
    ? { employee: { departmentId: user.departmentId! }, overallScore: { lte: 2 } }
    : user.role === "MANAGER"
      ? { branchId: user.branchId!, overallScore: { lte: 2 } }
      : { overallScore: { lte: 2 } };

  const alerts = await prisma.evaluation.findMany({
    where: evalWhere,
    include: {
      employee: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return alerts.map(a => ({
    ...a,
    score: a.overallScore,
    severity: "CRITICAL",
    status: "NEW" // Since status is not in schema, default to NEW
  }));
}

export async function getManagerEvaluations() {
  const user = await verifyManager();
  
  const evalWhere = user.role === "DEPARTMENT_MANAGER"
    ? { employee: { departmentId: user.departmentId! } }
    : user.role === "MANAGER"
      ? { branchId: user.branchId! }
      : {};

  return prisma.evaluation.findMany({
    where: evalWhere,
    include: {
      employee: { select: { name: true } },
      branch: { select: { name: true } },
      evaluator: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function resolveAlert(id: string) {
  await verifyManager();
  await prisma.evaluation.delete({ where: { id } });
  revalidatePath("/manager/alerts");
  revalidatePath("/manager");
  return { success: true };
}
