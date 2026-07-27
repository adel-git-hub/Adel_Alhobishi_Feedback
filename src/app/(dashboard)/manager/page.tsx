import { getManagerStats, getManagerAlerts } from "@/app/actions/manager.actions";
import ManagerDashboardClient from "./ManagerDashboardClient";

export default async function ManagerPage() {
  const stats = await getManagerStats();
  const alerts = await getManagerAlerts();

  const formattedStats = {
    evaluations: stats.totalEvaluations,
    avgScore: stats.avgScore,
    activeEmployees: stats.activeEmployees,
    criticalAlerts: alerts.filter(a => a.severity === "CRITICAL").length
  };

  const performance = stats.criteriaPerformance.map(p => ({
    label: p.name,
    value: Math.round((p.avg / 5) * 100)
  }));

  const recentEvaluations = stats.recentEvaluations.map(ev => ({
    employee: ev.employee.name,
    branch: ev.branch.name,
    score: ev.score,
    time: new Date(ev.createdAt).toLocaleDateString("ar-SA")
  }));

  return (
    <ManagerDashboardClient 
      stats={formattedStats}
      recentEvaluations={recentEvaluations}
      performance={performance}
    />
  );
}
