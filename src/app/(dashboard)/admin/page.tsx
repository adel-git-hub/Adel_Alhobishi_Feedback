import { getAdminStats, getBranchPerformance } from "@/app/actions/admin.actions";
import AdminDashboardClient from "./AdminDashboardClient";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const [stats, branchPerformance, branchesCount, employeesCount, criteriaCount] = await Promise.all([
    getAdminStats(),
    getBranchPerformance(),
    prisma.branch.count(),
    prisma.user.count(),
    prisma.criteria.count(),
  ]);

  return (
    <AdminDashboardClient 
      stats={stats} 
      branchPerformance={branchPerformance} 
      counts={{
        branches: branchesCount,
        employees: employeesCount,
        criteria: criteriaCount
      }}
    />
  );
}
