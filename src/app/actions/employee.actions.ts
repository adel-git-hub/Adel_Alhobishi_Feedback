"use server";

import { prisma } from "@/lib/prisma";
import { verifyEmployee } from "./auth-utils";

export async function getEmployeeStats() {
  const user = await verifyEmployee();
  
  const [totalEvals, avgScoreData] = await Promise.all([
    prisma.evaluation.count({ where: { employeeId: user.id, type: "CUSTOMER" } }),
    prisma.evaluation.aggregate({ 
      where: { employeeId: user.id, type: "CUSTOMER" },
      _avg: { overallScore: true } 
    }),
  ]);

  const avgScore = avgScoreData._avg.overallScore || 0;
  
  return { totalEvals, avgScore };
}

export async function getEmployeeEvaluations() {
  const user = await verifyEmployee();
  
  const evaluations = await prisma.evaluation.findMany({
    where: { employeeId: user.id, type: "CUSTOMER" },
    orderBy: { createdAt: 'desc' }
  });

  // STRICT PRIVACY: Map the data to exclude customerName and customerPhone before sending to client
  return evaluations.map(e => ({
    id: e.id,
    type: e.type,
    score: e.overallScore,
    feedback: e.feedback,
    feedbackCategory: e.feedbackCategory,
    date: e.createdAt,
    // explicitly NOT including customerName or customerPhone
  }));
}
