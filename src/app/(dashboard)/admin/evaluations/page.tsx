import { getAllEvaluations } from "@/app/actions/admin.actions";
import EvaluationsClient from "./EvaluationsClient";

export default async function EvaluationsPage() {
  const rawEvaluations = await getAllEvaluations();
  
  const evaluations = rawEvaluations.map(e => ({
    id: e.id,
    employeeName: e.employee?.name || "غير محدد",
    branchName: e.branch?.name || "غير محدد",
    type: e.type,
    score: e.overallScore,
    feedback: e.feedback,
    feedbackCategory: e.feedbackCategory,
    customerName: e.customerName,
    customerPhone: e.customerPhone,
    customerEmail: e.customerEmail,
    evaluatorName: (e as any).evaluator?.name,
    date: e.createdAt,
  }));

  return <EvaluationsClient initialEvaluations={evaluations as any} />;
}
