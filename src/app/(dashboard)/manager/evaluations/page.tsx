import { getManagerEvaluations } from "@/app/actions/manager.actions";
import EvaluationsClient from "../../admin/evaluations/EvaluationsClient";

export default async function ManagerEvaluationsPage() {
  const rawEvaluations = await getManagerEvaluations();
  
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
