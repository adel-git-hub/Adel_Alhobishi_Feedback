"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function getPublicBranches() {
  return prisma.branch.findMany({
    select: { id: true, name: true, location: true },
    orderBy: { createdAt: 'desc' }
  });
}

import { PublicAccessType } from "@prisma/client";

export async function getEmployeesByBranch(branchId: string, accessType?: PublicAccessType) {
  const whereClause: any = { branchId, isActive: true, role: { not: "ADMIN" } };
  
  if (accessType) {
    whereClause.department = {
      accessType: accessType
    };
  }

  return prisma.user.findMany({
    where: whereClause,
    select: { id: true, name: true, role: true, department: { select: { name: true } } }
  });
}

export async function getCustomerCriteria() {
  return prisma.criteria.findMany({
    where: { type: "CUSTOMER", isActive: true },
    select: { id: true, name: true, description: true }
  });
}

export async function getEmployeeDetails(employeeId: string) {
  return prisma.user.findFirst({
    where: { id: employeeId, isActive: true },
    select: { id: true, name: true, role: true, branch: { select: { id: true, name: true } } }
  });
}

const evaluationSchema = z.object({
  employeeId: z.string(),
  branchId: z.string(),
  scores: z.record(z.string(), z.number()),
  feedback: z.string().optional(),
  feedbackCategory: z.enum(["SUGGESTION", "THANKS", "COMPLAINT"]),
  customerName: z.string().min(2, "الاسم قصير جداً").max(100),
  customerPhone: z.string().regex(/^7\d{8}$/, "يجب أن يتكون رقم الهاتف من 9 أرقام ويبدأ برقم 7"),
  customerEmail: z.string().email("البريد الإلكتروني غير صالح").optional().or(z.literal(''))
});

export async function submitCustomerEvaluation(rawData: {
  employeeId: string;
  branchId: string;
  scores: Record<string, number>;
  feedback: string;
  feedbackCategory: "SUGGESTION" | "THANKS" | "COMPLAINT";
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
}) {
  const result = evaluationSchema.safeParse(rawData);
  if (!result.success) {
    throw new Error(result.error.issues[0].message);
  }

  const data = result.data;
  const scoreValues: number[] = Object.values(data.scores);
  if (scoreValues.length === 0) throw new Error("لم يتم تقديم أي تقييم");
  
  const overallScore = scoreValues.reduce((a: number, b: number) => a + b, 0) / scoreValues.length;

  try {
    await prisma.evaluation.create({
      data: {
        type: "CUSTOMER",
        overallScore,
        feedback: data.feedback,
        feedbackCategory: data.feedbackCategory,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail || null,
        branchId: data.branchId,
        employeeId: data.employeeId,
        scores: {
          create: Object.entries(data.scores).map(([criteriaId, score]) => ({
            criteriaId,
            score: score as number
          }))
        }
      }
    });
    return { success: true };
  } catch (error) {
    console.error("Evaluation submission error:", error);
    throw new Error("حدث خطأ غير متوقع أثناء حفظ التقييم. الرجاء المحاولة مرة أخرى لاحقاً.");
  }
}
