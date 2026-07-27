import { notFound } from "next/navigation";
import EvaluateClient from "./EvaluateClient";
import { getCustomerCriteria, getEmployeeDetails } from "@/app/actions/public.actions";

export default async function EvaluatePage({ params }: { params: Promise<{ employeeId: string }> | { employeeId: string } }) {
  const resolvedParams = await params;
  
  const [employee, criteria] = await Promise.all([
    getEmployeeDetails(resolvedParams.employeeId),
    getCustomerCriteria()
  ]);

  if (!employee || !employee.branch) {
    notFound();
  }

  return <EvaluateClient employee={employee as any} criteria={criteria} />;
}
