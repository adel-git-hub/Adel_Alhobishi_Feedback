import { getEmployeeEvaluations, getEmployeeStats } from "@/app/actions/employee.actions";
import EmployeeDashboardClient from "./EmployeeDashboardClient";

export default async function EmployeeDashboardPage() {
  const evaluations = await getEmployeeEvaluations();
  const stats = await getEmployeeStats();
  
  return <EmployeeDashboardClient evaluations={evaluations as any} stats={stats} />;
}
