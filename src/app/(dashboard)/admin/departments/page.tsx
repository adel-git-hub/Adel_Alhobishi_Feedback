import { getDepartments } from "@/app/actions/department.actions";
import { getBranches } from "@/app/actions/admin.actions";
import DepartmentsClient from "./DepartmentsClient";

export default async function DepartmentsPage() {
  const [departments, branches] = await Promise.all([
    getDepartments(),
    getBranches(),
  ]);

  return <DepartmentsClient initialDepartments={departments} branches={branches} />;
}
