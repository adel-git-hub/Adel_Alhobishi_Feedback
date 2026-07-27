import { getEmployees, getBranches } from "@/app/actions/admin.actions";
import { getDepartments } from "@/app/actions/department.actions";
import EmployeesClient from "./EmployeesClient";

export default async function EmployeesPage() {
  const [employees, branches, departments] = await Promise.all([
    getEmployees(),
    getBranches(),
    getDepartments()
  ]);
  
  return <EmployeesClient initialEmployees={employees as any} branches={branches} departments={departments} />;
}
